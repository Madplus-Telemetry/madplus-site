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

const lights = Array.from({ length: 14 }, (_, i) => `<i style="--i:${i}"></i>`).join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#00fbcd">
<meta name="description" content="Download Mad+, the telemetry companion app for Madcar Racing.">
<meta property="og:image" content="${SITE}assets/madplus.png">${PREVIEW ? '\n<meta name="robots" content="noindex">' : ''}
<title>Mad+ for Android</title>
<style>
  :root {
    --bg: #070808; --line: #1e2224; --ink: #eceeee; --mute: #8d9496;
    --mint: #00fbcd; --mint-hi: #c4fff4; --warn: #f5a524; --off: #14181a;
    --display: Bahnschrift, "DIN Alternate", "Avenir Next Condensed", "Roboto Condensed", "sans-serif-condensed", "Arial Narrow", system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  html { background: var(--bg); }
  body { margin: 0; color: var(--ink); font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  main { max-width: 600px; margin: 0 auto; padding: 28px 22px 64px; }
  a { color: inherit; }
  :focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; border-radius: 4px; }

  .brand { display: flex; align-items: center; gap: 14px; }
  .mark { position: relative; display: block; width: 64px; height: 38px; overflow: hidden; flex: none; }
  .mark img { position: absolute; width: 139px; left: -38px; top: -50px; max-width: none; }
  .name { margin: 0; font: 700 28px/1 var(--display); letter-spacing: 0.01em; }

  .head { margin-bottom: 64px; }
  .lights { display: flex; gap: 5px; margin-bottom: 14px; }
  .lights i { --c: var(--mint); --glow: rgba(0, 251, 205, 0.55); flex: 1; height: 10px; border-radius: 2px; background: var(--off); }
  .lights i:nth-child(n+11) { --c: var(--mint-hi); --glow: rgba(196, 255, 244, 0.5); }
  .lights.go i { animation: rev 420ms cubic-bezier(0.2, 0.7, 0.2, 1) both; animation-delay: calc(var(--i) * 60ms + 300ms); }
  .lights.go.fast i { animation-delay: calc(var(--i) * 22ms); }
  @keyframes rev {
    from { background: var(--off); box-shadow: 0 0 0 rgba(0, 251, 205, 0); }
    to   { background: var(--c); box-shadow: 0 0 14px var(--glow); }
  }

  a.dl { display: flex; align-items: center; justify-content: center; height: 66px; border-radius: 10px; background: var(--mint); color: #031210; font: 700 23px/1 var(--display); letter-spacing: 0.01em; text-decoration: none; transition: background-color 120ms, transform 120ms; }
  a.dl:hover { background: #3dffdc; }
  a.dl:active { transform: scale(0.992); }
  .facts { display: flex; flex-wrap: wrap; gap: 4px 22px; margin: 16px 0 0; color: var(--mute); font-size: 14px; font-variant-numeric: tabular-nums; }
  .file { margin: 4px 0 0; color: var(--mute); font-size: 13px; word-break: break-all; }
  .note { margin: 20px 0 0; color: var(--mute); font-size: 14px; }

  .details { margin-top: 64px; }
  h2 { margin: 0 0 6px; font: 600 15px/1.4 system-ui, sans-serif; color: var(--mute); }
  section + section { margin-top: 48px; }

  ul.scans { margin: 0; padding: 0; list-style: none; }
  .scan { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 0; border-top: 1px solid var(--line); text-decoration: none; }
  ul.scans li:last-child .scan { border-bottom: 1px solid var(--line); }
  .logo { display: block; height: 38px; width: auto; }
  .verdict { display: flex; flex-direction: column; align-items: flex-end; text-align: right; color: var(--mute); font-size: 13px; font-variant-numeric: tabular-nums; }
  .verdict b { font: 700 22px/1.1 var(--display); letter-spacing: 0.01em; color: var(--ink); }
  .verdict.ok b { color: var(--mint); }
  .verdict.warn b { color: var(--warn); }
  .scan:hover .verdict b { text-decoration: underline; text-underline-offset: 4px; }

  ol.steps { margin: 12px 0 0; padding: 0; list-style: none; counter-reset: step; }
  ol.steps li { display: grid; grid-template-columns: 34px 1fr; padding: 0 0 14px; counter-increment: step; }
  ol.steps li::before { content: counter(step); font: 700 22px/1.3 var(--display); color: var(--mute); }

  .hash { display: flex; align-items: flex-start; gap: 14px; margin-top: 12px; }
  .hash code { flex: 1; min-width: 0; color: var(--mute); font: 12px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; }
  .copy { flex: none; padding: 6px 14px; border: 1px solid var(--line); border-radius: 8px; background: none; color: var(--mint); font: 600 14px/1.4 system-ui, sans-serif; cursor: pointer; }
  .copy:hover { border-color: var(--mint); }

  footer { margin-top: 64px; padding-top: 20px; border-top: 1px solid var(--line); color: var(--mute); font-size: 13px; }
  footer p { margin: 0 0 8px; }

  @media (min-width: 880px) {
    main { max-width: 1040px; padding: 56px 40px 80px; }
    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 96px; align-items: start; }
    .hero { position: sticky; top: 56px; }
    .head { margin-bottom: 120px; }
    .details { margin-top: 0; padding-top: 6px; }
    footer { grid-column: 1 / -1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .lights i { background: var(--c); box-shadow: none; }
    .lights.go i { animation: none; }
    a.dl { transition: none; }
  }
</style>
</head>
<body>
<main>
  <div class="layout">
    <div class="hero">
      <div class="head brand"><span class="mark"><img src="${A}madplus.png" alt=""></span><h1 class="name">Mad+</h1></div>
      <div class="lights go" aria-hidden="true">${lights}</div>
      <a class="dl" href="${esc(apk)}">Download for Android</a>
      <p class="facts"><span>Version ${esc(r.version)}</span><span>${mb} MB</span><span>${esc(date)}</span></p>
      <p class="file">${esc(r.file)}</p>
      <p class="note">Mad+ is not on Google Play, so the APK installs directly.</p>
    </div>

    <div class="details">
      <section>
        <h2>Checked before release</h2>
        <ul class="scans">
          ${scanRow('VirusTotal', r.scans.virustotal)}
          ${scanRow('MetaDefender', r.scans.metadefender)}
        </ul>
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
        <div class="hash"><code id="sha">${esc(r.sha256)}</code><button class="copy" type="button" aria-live="polite">Copy</button></div>
      </section>
    </div>

    <footer>
      <p>Mad+ is independent and not endorsed by Madcar's developers.</p>
      <p>This page and its scan pipeline are open source: <a href="https://github.com/${REPO}">${REPO}</a></p>
    </footer>
  </div>
</main>
<script>
(function () {
  var lights = document.querySelector('.lights');
  var dl = document.querySelector('a.dl');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (lights && dl && !reduce) {
    dl.addEventListener('click', function () {
      lights.classList.remove('go', 'fast');
      void lights.offsetWidth;
      lights.classList.add('go', 'fast');
    });
  }
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
