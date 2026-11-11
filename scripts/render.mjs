// Builds index.html from release.json. Obtainium reads the APK link from this static HTML.
import fs from 'node:fs';

const REPO = 'Madplus-Telemetry/madplus-site';
const r = JSON.parse(fs.readFileSync('release.json', 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mb = (r.size / 1024 / 1024).toFixed(1);
const apk = `https://github.com/${REPO}/releases/download/${encodeURIComponent(r.tag)}/${encodeURIComponent(r.file)}`;

function scanner(label, s) {
  if (!s) return '';
  let result = 'result pending';
  if (!s.pending && typeof s.total === 'number') result = `${s.flagged} / ${s.total} engines flagged it`;
  const logo = label.toLowerCase();
  return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(label)}"><img class="logo" src="assets/${logo}.png" alt="${esc(label)}"></a> <span>${esc(result)}</span></li>`;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mad+ download</title>
<style>
  body { margin: 0; background: #111; color: #e6e6e6; font: 16px/1.5 system-ui, sans-serif; }
  main { max-width: 520px; margin: 0 auto; padding: 48px 20px; }
  h1 { margin: 0 0 4px; font-size: 28px; }
  p { color: #a8a8a8; margin: 8px 0; }
  a.dl { display: block; margin: 28px 0 8px; padding: 14px; text-align: center; background: #2ecc71; color: #08120c; font-weight: 600; text-decoration: none; border-radius: 8px; }
  .meta { font-size: 14px; }
  h2 { font-size: 15px; margin: 28px 0 6px; color: #e6e6e6; }
  ul { list-style: none; padding: 0; margin: 0; }
  li { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-top: 1px solid #242424; }
  li a { color: #2ecc71; display: inline-block; vertical-align: middle; }
  img.logo { display: block; height: 22px; width: auto; padding: 5px 8px; background: #fff; border-radius: 6px; }
  li span { color: #a8a8a8; float: right; font-size: 14px; }
  code { font-size: 12px; word-break: break-all; color: #a8a8a8; }
</style>
</head>
<body>
<main>
  <h1>Mad+</h1>
  <p>Telemetry companion app for Madcar Racing. Not on Google Play: install the APK below.</p>
  <a class="dl" href="${esc(apk)}">Download ${esc(r.file)}</a>
  <p class="meta">Version ${esc(r.version)} &middot; ${mb} MB &middot; ${esc(r.date)}</p>
  <h2>Scanned by</h2>
  <ul>
    ${scanner('VirusTotal', r.scans.virustotal)}
    ${scanner('MetaDefender', r.scans.metadefender)}
  </ul>
  <h2>SHA-256</h2>
  <code>${esc(r.sha256)}</code>
  <h2>Updates</h2>
  <p>Add this page's address to Obtainium to get updates automatically.</p>
  <p class="meta">This page and its scan pipeline are open source: <a href="https://github.com/${REPO}" style="color:#2ecc71">${REPO}</a></p>
</main>
</body>
</html>
`;

fs.writeFileSync('index.html', html);
console.log('index.html written for', r.tag);
