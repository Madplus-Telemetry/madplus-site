// Scans an APK with VirusTotal and MetaDefender and writes release.json.
// Usage: node scripts/scan.mjs <apk path> <tag>
// Env:   VT_API_KEY, MD_API_KEY (a scanner without a key is skipped)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [, , apkPath, tag] = process.argv;
if (!apkPath || !tag) {
  console.error('usage: node scripts/scan.mjs <apk> <tag>');
  process.exit(1);
}

const VT_KEY = process.env.VT_API_KEY;
const MD_KEY = process.env.MD_API_KEY;
const buf = fs.readFileSync(apkPath);
const name = path.basename(apkPath);
const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function json(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`); }
}

async function virustotal() {
  const url = `https://www.virustotal.com/gui/file/${sha256}`;
  if (!VT_KEY) return null;
  const headers = { 'x-apikey': VT_KEY };
  // upload_url works for any file size (the plain endpoint stops at 32 MB)
  const u = await json(await fetch('https://www.virustotal.com/api/v3/files/upload_url', { headers }));
  if (!u.data) throw new Error('no upload_url: ' + JSON.stringify(u));
  const form = new FormData();
  form.append('file', new Blob([buf]), name);
  const up = await json(await fetch(u.data, { method: 'POST', headers, body: form }));
  const id = up.data && up.data.id;
  if (!id) throw new Error('upload failed: ' + JSON.stringify(up));
  for (let i = 0; i < 30; i++) {
    await sleep(20000);
    const a = await json(await fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, { headers }));
    const at = a.data && a.data.attributes;
    if (at && at.status === 'completed') {
      const s = at.stats;
      return {
        url,
        flagged: s.malicious + s.suspicious,
        total: s.malicious + s.suspicious + s.harmless + s.undetected
      };
    }
  }
  return { url, pending: true };
}

async function metadefender() {
  const url = `https://metadefender.com/results/hash/${sha256}`;
  if (!MD_KEY) return null;
  const headers = { apikey: MD_KEY };
  const up = await json(await fetch('https://api.metadefender.com/v4/file', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/octet-stream', filename: name },
    body: buf
  }));
  if (!up.data_id) throw new Error('upload failed: ' + JSON.stringify(up));
  for (let i = 0; i < 30; i++) {
    await sleep(10000);
    const r = await json(await fetch(`https://api.metadefender.com/v4/file/${up.data_id}`, { headers }));
    const sr = r.scan_results;
    if (sr && sr.progress_percentage === 100) {
      return { url, flagged: sr.total_detected_avs, total: sr.total_avs };
    }
  }
  return { url, pending: true };
}

async function safe(label, fn) {
  try { return await fn(); } catch (e) { console.error(`${label} failed:`, e.message); return null; }
}

const [vt, md] = await Promise.all([safe('VirusTotal', virustotal), safe('MetaDefender', metadefender)]);

const release = {
  tag,
  version: tag.replace(/^v/i, ''),
  file: name,
  size: buf.length,
  sha256,
  date: new Date().toISOString().slice(0, 10),
  scans: { virustotal: vt, metadefender: md }
};
fs.writeFileSync('release.json', JSON.stringify(release, null, 2) + '\n');
console.log(JSON.stringify(release, null, 2));

if (!vt && !md) {
  console.error('No scanner produced a result, refusing to publish an unscanned APK.');
  process.exit(1);
}
