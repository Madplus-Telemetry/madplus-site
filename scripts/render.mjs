// Builds index.html from release.json. Obtainium reads the APK link from this static HTML.
import fs from 'node:fs';

const REPO = 'Madplus-Telemetry/madplus-site';
const r = JSON.parse(fs.readFileSync('release.json', 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mb = (r.size / 1024 / 1024).toFixed(1);
const apk = `https://github.com/${REPO}/releases/download/${encodeURIComponent(r.tag)}/${encodeURIComponent(r.file)}`;

function scanner(label, s) {
  if (!s) return '';
  let text = 'Result pending';
  let cls = 'res';
  if (!s.pending && typeof s.total === 'number') {
    text = `${s.flagged} / ${s.total} detections`;
    cls = s.flagged === 0 ? 'res ok' : 'res warn';
  }
  const logo = label.toLowerCase();
  return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(label)}"><img class="logo" src="assets/${logo}.png" alt="${esc(label)}"></a><span class="${cls}">${esc(text)}</span></li>`;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0b0b0c">
<meta name="description" content="Download Mad+, the telemetry companion app for Madcar Racing.">
<title>Mad+ for Android</title>
<style>
  :root { --bg: #0b0b0c; --fg: #ededee; --mute: #8b8b92; --line: #1d1d20; --accent: #00fbcd; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  main { max-width: 560px; margin: 0 auto; padding: 28px 22px 56px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .mark { position: relative; display: block; width: 56px; height: 33px; overflow: hidden; }
  .mark img { position: absolute; width: 121px; left: -33px; top: -44px; max-width: none; }
  .name { font-size: 19px; font-weight: 600; letter-spacing: -0.01em; }
  a.dl { display: block; margin-top: 56px; padding: 16px; text-align: center; background: var(--accent); color: #04120e; font-size: 17px; font-weight: 600; text-decoration: none; border-radius: 12px; }
  .meta { margin: 12px 0 0; color: var(--mute); font-size: 13px; line-height: 1.7; word-break: break-all; }
  h2 { margin: 48px 0 12px; color: var(--mute); font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  ul.scans { margin: 0; padding: 0; list-style: none; }
  ul.scans li { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-top: 1px solid var(--line); }
  ul.scans li:last-child { border-bottom: 1px solid var(--line); }
  ul.scans a { display: block; }
  img.logo { display: block; height: 22px; width: auto; padding: 5px 8px; background: #fff; border-radius: 6px; }
  .res { color: var(--mute); font-size: 14px; font-variant-numeric: tabular-nums; }
  .res.ok { color: var(--accent); }
  .res.warn { color: #f5a524; }
  ol.steps { margin: 0; padding-left: 20px; }
  ol.steps li { margin: 0 0 8px; }
  .note { margin: 12px 0 0; color: var(--mute); font-size: 14px; }
  code { color: var(--mute); font: 12px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace; word-break: break-all; }
  footer { margin-top: 56px; padding-top: 20px; border-top: 1px solid var(--line); color: var(--mute); font-size: 13px; }
  footer p { margin: 0 0 8px; }
  footer a { color: var(--fg); }
</style>
</head>
<body>
<main>
  <div class="brand"><span class="mark"><img src="assets/madplus.png" alt=""></span><span class="name">Mad+</span></div>

  <p class="lead">Live telemetry, HUD overlay and lap timing for Madcar Racing, on your phone.</p>

  <a class="dl" href="${esc(apk)}">Download for Android</a>
  <p class="meta">Version ${esc(r.version)} &middot; ${mb} MB &middot; ${esc(r.date)}<br>${esc(r.file)}</p>
  <p class="note">Mad+ is not on Google Play, so you install the APK directly.</p>

  <h2>Scanned before release</h2>
  <ul class="scans">
    ${scanner('VirusTotal', r.scans.virustotal)}
    ${scanner('MetaDefender', r.scans.metadefender)}
  </ul>

  <h2>Install</h2>
  <ol class="steps">
    <li>Download the APK above.</li>
    <li>Open it and allow installs from your browser when Android asks.</li>
    <li>Allow the VPN permission. Mad+ uses it to read Madcar's telemetry on your phone and never changes game traffic.</li>
  </ol>

  <h2>SHA-256</h2>
  <code>${esc(r.sha256)}</code>

  <footer>
    <p>Mad+ is independent and not endorsed by Madcar's developers.</p>
    <p>This page and its scan pipeline are open source: <a href="https://github.com/${REPO}">${REPO}</a></p>
  </footer>
</main>
</body>
</html>
`;

fs.writeFileSync('index.html', html);
console.log('index.html written for', r.tag);
