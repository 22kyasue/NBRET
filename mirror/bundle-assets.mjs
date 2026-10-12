#!/usr/bin/env node
// Bundle every binary asset a mirror captured into a sorted, deduped, documented folder.
//   node scripts/mirror/bundle-assets.mjs --dir references/<ref>-mirror-<date> [--out <dir>]
// Reads manifest.json (the browser-observed requests), classifies by host, hashes for dedupe,
// measures images with sharp, attributes each asset to the pages that reference it, and writes
// assets.json / assets.csv / contact-sheet.html next to the files.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };

const dir = path.resolve(arg('dir', ''));
if (!dir || !fs.existsSync(path.join(dir, 'manifest.json'))) {
  console.error('need --dir <mirror folder containing manifest.json>');
  process.exit(1);
}
const out = path.resolve(arg('out', path.join(dir, 'assets-bundle')));
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));

// Hosts whose "images" are telemetry pixels or map tiles, never design assets.
const NOISE_HOSTS = new Set([
  'www.google.com', 'www.google.co.jp', 'maps.googleapis.com', 'maps.gstatic.com',
  'places.googleapis.com', 'c.clarity.ms', 'www.clarity.ms', 'scripts.clarity.ms',
  'www.google-analytics.com', 'googleads.g.doubleclick.net', 'connect.facebook.net',
  'www.facebook.com', 'www.googletagmanager.com', 'graph.instagram.com',
]);

// Which client surfaces this mirror covers. Anything else that survives is vendor chrome.
const CLIENT_SHOP = (host) => host === 'www.bstproshop.com' || host.endsWith('shopserve.jp') || host.endsWith('estore.jp');

function groupFor(host, url, kind) {
  if (kind === 'font') return 'fonts';
  if (kind === 'video') return 'video';
  if (NOISE_HOSTS.has(host)) return 'excluded';
  if (host === 'b-st.biz') return 'client-site';
  if (CLIENT_SHOP(host)) return 'client-shop';
  if (/(^|\.)cdninstagram\.com$/.test(host)) return url.includes('/rsrc.php/') ? 'vendor' : 'instagram';
  return 'vendor';
}

function kindFor(type, url) {
  const t = (type || '').split(';')[0].toLowerCase();
  if (t.startsWith('font/') || /font-woff|font-ttf|x-font/.test(t)) return 'font';
  if (/[.](woff2?|ttf|otf|eot)([?]|$)/i.test(url)) return 'font';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('image/')) return 'image';
  return null;
}

const MIME_EXT = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp',
  'image/svg+xml': '.svg', 'image/bmp': '.bmp', 'font/woff2': '.woff2', 'font/woff': '.woff',
  'application/font-woff': '.woff',
};

function extFor(type, url) {
  const m = url.split('?')[0].match(/[.]([a-z0-9]{2,5})$/i);
  if (m) return '.' + m[1].toLowerCase();
  return MIME_EXT[(type || '').split(';')[0]] || '.bin';
}

// --- page attribution: which mirrored documents mention this asset ----------
const textFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (/[.](html?|php|css|js|json)$/i.test(e.name) || e.name === '__index') {
      if (fs.statSync(p).size < 4_000_000) textFiles.push(p);
    }
  }
})(path.join(dir, 'files'));

const haystack = textFiles.map((p) => {
  const rel = path.relative(path.join(dir, 'files'), p).split(path.sep);
  rel.shift(); // drop the host segment
  let name = rel.join('/') || 'index';
  if (name.endsWith('__index')) name = name.slice(0, -7) + 'index';
  return { name, body: fs.readFileSync(p, 'utf8') };
});

function usedBy(url) {
  const needle = new URL(url).pathname.split('/').pop().split('?')[0];
  if (!needle || needle.length < 5) return [];
  return haystack.filter((f) => f.body.includes(needle)).map((f) => f.name);
}

// --- collect ---------------------------------------------------------------
const rows = [];
for (const [url, meta] of Object.entries(manifest)) {
  const kind = kindFor(meta.type, url);
  if (!kind) continue;
  const host = new URL(url).host;
  rows.push({
    url, host, kind,
    group: groupFor(host, url, kind),
    src: path.join(dir, String(meta.file).split(/[\\/]/).join(path.sep)),
    bytes: meta.size || 0,
    type: (meta.type || '').split(';')[0],
    status: meta.status,
  });
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const seen = new Map(); // sha1 -> bundle-relative path of the first copy
const records = [];
let copied = 0, dupes = 0, missing = 0;

for (const r of rows.sort((a, b) => b.bytes - a.bytes)) {
  const rec = { url: r.url, host: r.host, kind: r.kind, group: r.group, type: r.type, bytes: r.bytes, status: r.status };

  if (!fs.existsSync(r.src)) { rec.note = 'payload missing'; missing++; records.push(rec); continue; }
  const buf = fs.readFileSync(r.src);
  const sha = crypto.createHash('sha1').update(buf).digest('hex');
  rec.sha1 = sha.slice(0, 12);
  rec.bytes = buf.length;

  if (r.group === 'excluded') { rec.note = 'tracking pixel / map tile — not copied'; records.push(rec); continue; }

  const prior = seen.get(sha);
  if (prior) { rec.file = prior; rec.note = 'duplicate — same bytes as an earlier URL'; dupes++; records.push(rec); continue; }

  const u = new URL(r.url);
  const ext = extFor(r.type, r.url);
  const stem = (path.basename(u.pathname).replace(/[.][a-z0-9]{2,5}$/i, '') || 'asset').replace(/[^\w.@-]/g, '_');
  const sub = r.group === 'client-site' ? path.posix.dirname(u.pathname).replace(/^\/+/, '') : r.host;
  let dest = path.join(out, r.group, sub, stem + ext);
  for (let n = 2; fs.existsSync(dest); n++) dest = path.join(out, r.group, sub, `${stem}-${n}${ext}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);

  const rel = path.relative(out, dest).split(path.sep).join('/');
  seen.set(sha, rel);
  rec.file = rel;
  copied++;

  if (r.kind === 'image' && ext !== '.svg') {
    try {
      const md = await sharp(buf).metadata();
      rec.width = md.width;
      rec.height = md.height;
      rec.format = md.format;
      if (md.hasAlpha) rec.alpha = true;
    } catch { rec.note = 'sharp could not read this image'; }
  }
  rec.pages = usedBy(r.url);
  records.push(rec);
}

// --- reports ---------------------------------------------------------------
const origin = arg('origin', (Object.keys(manifest)[0] || '').replace(/^(https?:\/\/[^/]+).*/, '$1'));
const excluded = records.filter((r) => r.group === 'excluded').length;

fs.writeFileSync(path.join(out, 'assets.json'), JSON.stringify({
  mirror: path.basename(dir),
  origin,
  generated: new Date().toISOString(),
  counts: { captured: rows.length, copied, duplicates: dupes, excluded, missing },
  assets: records,
}, null, 1));

const csvCell = (v) => '"' + String(v).replace(/"/g, '""') + '"';
const csv = ['file,group,kind,host,bytes,width,height,url,pages'].concat(
  records.map((r) => [r.file || '', r.group, r.kind, r.host, r.bytes, r.width || '', r.height || '',
    r.url, (r.pages || []).join(' ')].map(csvCell).join(',')),
);
fs.writeFileSync(path.join(out, 'assets.csv'), csv.join('\n'));

const shown = records.filter((r) => r.file && r.kind === 'image' && !r.note);
const groups = [...new Set(shown.map((r) => r.group))];
const card = (r) => `<figure><img loading="lazy" src="${r.file}"><figcaption><b>${r.file.split('/').pop()}</b><br>${r.width || '?'}&times;${r.height || '?'} &middot; ${(r.bytes / 1024).toFixed(0)} KB<br>${(r.pages || []).slice(0, 3).join(', ') || '&mdash;'}</figcaption></figure>`;
const section = (g) => `<h2>${g} (${shown.filter((r) => r.group === g).length})</h2>\n<div class="g">${shown.filter((r) => r.group === g).map(card).join('')}</div>`;

fs.writeFileSync(path.join(out, 'contact-sheet.html'), `<!doctype html><meta charset="utf-8">
<title>${path.basename(dir)} — asset bundle</title>
<style>
body{background:#111;color:#ddd;font:13px/1.5 ui-sans-serif,system-ui;margin:0;padding:32px}
h1{font-size:18px;margin:0 0 4px}
h2{font-size:14px;margin:34px 0 12px;color:#8ab4f8;border-bottom:1px solid #333;padding-bottom:6px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}
figure{margin:0;background:#1b1b1b;border-radius:6px;padding:8px;overflow:hidden}
img{width:100%;height:130px;object-fit:contain;background:repeating-conic-gradient(#2a2a2a 0 25%,#222 0 50%) 50%/16px 16px}
figcaption{font-size:11px;color:#999;margin-top:6px;word-break:break-all}
b{color:#eee;font-weight:500}
</style>
<h1>${path.basename(dir)} &mdash; ${shown.length} unique images</h1>
<p style="color:#888">${origin} &middot; generated ${new Date().toISOString().slice(0, 10)}</p>
${groups.map(section).join('\n')}
`);

const byGroup = {};
for (const r of records) {
  const g = (byGroup[r.group] ||= { n: 0, bytes: 0 });
  if (r.file && !r.note) { g.n++; g.bytes += r.bytes; }
}
console.log(`bundle -> ${out}`);
console.log(`captured ${rows.length}  copied ${copied}  duplicates ${dupes}  excluded ${excluded}  missing ${missing}`);
for (const [g, v] of Object.entries(byGroup).sort((a, b) => b[1].bytes - a[1].bytes)) {
  console.log(`  ${g.padEnd(14)} ${String(v.n).padStart(4)} files  ${(v.bytes / 1048576).toFixed(2)} MB`);
}
