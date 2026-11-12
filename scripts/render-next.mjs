// Next version of the download page. Builds from release.json.
//   node scripts/render-next.mjs --preview   -> preview/index.html (not linked, noindex)
//   node scripts/render-next.mjs             -> index.html (the live page)
import fs from 'node:fs';

const REPO = 'Madplus-Telemetry/madplus-site';
const SITE = 'https://madplus-telemetry.github.io/madplus-site/';
const PREVIEW = process.argv.includes('--preview');
const A = PREVIEW ? '../assets/' : 'assets/';

const r = JSON.parse(fs.readFileSync('release.json', 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mb = (r.size / 1024 / 1024).toFixed(1);
const date = new Date(r.date + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const apk = `https://github.com/${REPO}/releases/download/${encodeURIComponent(r.tag)}/${encodeURIComponent(r.file)}`;

function verdict(s) {
  if (typeof s.total !== 'number' || s.pending) return { main: 'Result pending', sub: '', cls: '' };
  if (s.flagged === 0) return { main: 'No detections', sub: `${s.total} engines`, cls: 'ok' };
  return { main: `${s.flagged} ${s.flagged === 1 ? 'detection' : 'detections'}`, sub: `of ${s.total} engines`, cls: 'warn' };
}

function scanRow(label, s) {
  if (!s) return '';
  const v = verdict(s);
  return `<li><a class="scan" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(label)} report: ${esc(v.main)} ${esc(v.sub)}">` +
    `<img class="logo" src="${A}${label.toLowerCase()}.png" alt="${esc(label)}">` +
    `<span class="verdict ${v.cls}"><b>${esc(v.main)}</b>${v.sub ? `<span>${esc(v.sub)}</span>` : ''}</span></a></li>`;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#000000">
<meta name="description" content="Download Mad+, the telemetry companion app for Madcar Racing.">
<meta property="og:image" content="${SITE}assets/madplus.png">${PREVIEW ? '\n<meta name="robots" content="noindex">' : ''}
<title>Mad+ for Android</title>
<style>
  :root {
    --glass: rgba(255, 255, 255, 0.045); --edge: rgba(255, 255, 255, 0.1);
    --mute: rgba(255, 255, 255, 0.6); --faint: rgba(255, 255, 255, 0.4);
    --mint: #00fbcd; --warn: #f5a524;
  }
  * { box-sizing: border-box; }
  html { background: #000; color-scheme: dark; }
  body { margin: 0; color: #fff; font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  a { color: inherit; }
  :focus-visible { outline: 2px solid #fff; outline-offset: 3px; border-radius: 6px; }

  .bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(70% 42% at 50% 0%, rgba(0, 251, 205, 0.08), transparent 70%); }
  .bg::after { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px); background-size: 64px 64px; -webkit-mask-image: radial-gradient(60% 46% at 50% 14%, #000, transparent 78%); mask-image: radial-gradient(60% 46% at 50% 14%, #000, transparent 78%); }

  main { position: relative; z-index: 1; max-width: 520px; margin: 0 auto; padding: 72px 22px 56px; }
  .hero { display: flex; flex-direction: column; align-items: center; text-align: center; }

  .logo-wrap { position: relative; width: 144px; height: 86px; margin-bottom: 30px; }
  .bloom { position: absolute; left: 50%; top: 50%; width: 440px; height: 440px; margin: -220px 0 0 -220px; background: radial-gradient(circle, rgba(0, 251, 205, 0.2), transparent 62%); pointer-events: none; }
  .mark { position: relative; display: block; width: 144px; height: 86px; overflow: hidden; }
  .mark img { position: absolute; width: 312px; left: -86px; top: -113px; max-width: none; }
  .name { margin: 0 0 34px; font-size: clamp(40px, 12vw, 56px); line-height: 1; font-weight: 700; letter-spacing: -0.035em; }

  a.dl { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; min-width: min(100%, 290px); height: 56px; padding: 0 32px; border-radius: 999px; background: #fff; color: #000; font-size: 17px; font-weight: 600; text-decoration: none; transition: transform 120ms; }
  a.dl::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 35%, rgba(0, 0, 0, 0.09) 50%, transparent 65%); transform: translateX(-100%); transition: transform 700ms; }
  a.dl:hover::after { transform: translateX(100%); }
  a.dl:active { transform: scale(0.985); }
  .facts { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 18px; margin: 22px 0 0; color: var(--mute); font-size: 14px; font-variant-numeric: tabular-nums; }
  .file { margin: 6px 0 0; color: var(--faint); font-size: 13px; word-break: break-all; }
  .note { margin: 18px 0 0; max-width: 34ch; color: var(--mute); font-size: 14px; }

  section { margin-top: 72px; }
  h2 { margin: 0 0 14px; color: var(--mute); font-size: 14px; font-weight: 600; }
  .panel { background: var(--glass); border: 1px solid var(--edge); border-radius: 18px; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }

  ul.scans { margin: 0; padding: 0; list-style: none; }
  ul.scans li + li { border-top: 1px solid var(--edge); }
  .scan { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; text-decoration: none; transition: background-color 150ms; }
  ul.scans li:first-child .scan { border-radius: 17px 17px 0 0; }
  ul.scans li:last-child .scan { border-radius: 0 0 17px 17px; }
  ul.scans li:only-child .scan { border-radius: 17px; }
  .scan:hover { background: rgba(255, 255, 255, 0.035); }
  .logo { display: block; height: 34px; width: auto; }
  .verdict { display: flex; flex-direction: column; align-items: flex-end; color: var(--mute); font-size: 13px; font-variant-numeric: tabular-nums; }
  .verdict b { color: #fff; font-size: 16px; font-weight: 600; }
  .verdict.warn b { color: var(--warn); }
  a.dl svg { width: 22px; height: 22px; margin-right: 10px; fill: currentColor; flex: none; }

  ol.steps { margin: 0; padding: 0; list-style: none; counter-reset: step; }
  ol.steps li { display: grid; grid-template-columns: 30px 1fr; padding: 0 0 14px; counter-increment: step; }
  ol.steps li::before { content: counter(step); color: var(--faint); font-size: 14px; line-height: 1.9; font-variant-numeric: tabular-nums; }

  .hash { display: flex; align-items: center; gap: 14px; padding: 14px 16px 14px 20px; }
  .hash code { flex: 1; min-width: 0; color: var(--mute); font: 12px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; }
  .copy { flex: none; padding: 7px 16px; border: 1px solid var(--edge); border-radius: 999px; background: none; color: #fff; font: 600 14px/1.4 system-ui, sans-serif; cursor: pointer; transition: background-color 150ms; }
  .copy:hover { background: rgba(255, 255, 255, 0.08); }

  footer { margin-top: 72px; color: var(--faint); font-size: 13px; text-align: center; }
  footer p { margin: 0 0 8px; }

  /* One page-load sequence: logo emerges, then name, button and facts follow. */
  .mark { animation: emerge 900ms cubic-bezier(0.2, 0.7, 0.2, 1) 100ms both; }
  .bloom { animation: bloom 1500ms ease-out both, breathe 7s ease-in-out 1500ms infinite; }
  .name { animation: rise 700ms cubic-bezier(0.2, 0.7, 0.2, 1) 350ms both; }
  a.dl { animation: rise 700ms cubic-bezier(0.2, 0.7, 0.2, 1) 500ms both; }
  .after { animation: rise 700ms cubic-bezier(0.2, 0.7, 0.2, 1) 650ms both; }
  .later { animation: fade 900ms ease-out 900ms both; }
  @keyframes emerge { from { opacity: 0; transform: scale(0.92); filter: blur(10px); } to { opacity: 1; transform: none; filter: blur(0); } }
  @keyframes bloom { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
  @keyframes breathe { 50% { opacity: 0.6; } }
  @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }

  @media (prefers-reduced-motion: reduce) {
    .mark, .bloom, .name, a.dl, .after, .later { animation: none; }
    a.dl::after, a.dl, .scan, .copy { transition: none; }
  }
</style>
</head>
<body>
<div class="bg" aria-hidden="true"></div>
<main>
  <header class="hero">
    <div class="logo-wrap"><div class="bloom" aria-hidden="true"></div><span class="mark"><img src="${A}madplus.png" alt=""></span></div>
    <h1 class="name">Mad+</h1>
    <a class="dl" href="${esc(apk)}">Download for Android</a>
    <p class="facts after"><span>Version ${esc(r.version)}</span><span>${mb} MB</span><span>${esc(date)}</span></p>
    <p class="file after">${esc(r.file)}</p>
    <p class="note after">Mad+ is not on Google Play, so the APK installs directly.</p>
  </header>

  <div class="later">
    <section>
      <h2>Checked before release</h2>
      <div class="panel">
        <ul class="scans">
          ${scanRow('VirusTotal', r.scans.virustotal)}
          ${scanRow('MetaDefender', r.scans.metadefender)}
        </ul>
      </div>
    </section>

    <section>
      <h2>Install</h2>
      <ol class="steps">
        <li><span>Download the APK.</span></li>
        <li><span>Open it and allow installs from your browser when Android asks.</span></li>
        <li><span>Allow the VPN permission. Mad+ uses it to read Madcar's telemetry on your phone and never changes game traffic.</span></li>
      </ol>
    </section>

    <section>
      <h2>SHA-256</h2>
      <div class="panel hash"><code id="sha">${esc(r.sha256)}</code><button class="copy" type="button" aria-live="polite">Copy</button></div>
    </section>

    <footer>
      <p>Mad+ is independent and not endorsed by Madcar's developers.</p>
      <p>This page and its scan pipeline are open source: <a href="https://github.com/${REPO}">${REPO}</a></p>
    </footer>
  </div>
</main>
<script>
(function () {
  var btn = document.querySelector('.copy');
  var sha = document.getElementById('sha');
  if (btn && sha) {
    btn.addEventListener('click', function () {
      var done = function (t) { btn.textContent = t; setTimeout(function () { btn.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sha.textContent).then(function () { done('Copied'); }, function () { done('Select and copy'); });
      } else { done('Select and copy'); }
    });
  }
})();
</script>
</body>
</html>
`;

if (PREVIEW) {
  fs.mkdirSync('preview', { recursive: true });
  fs.writeFileSync('preview/index.html', html);
  console.log('preview/index.html written for', r.tag);
} else {
  fs.writeFileSync('index.html', html);
  console.log('index.html written for', r.tag);
}
