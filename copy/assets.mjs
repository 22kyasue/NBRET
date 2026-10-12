// /copy stage 4b — download every asset URL into the rebuild's assets/ with clean names.
//   node <skill>/scripts/assets.mjs --list <extract>/assets.txt --out <rebuild>/assets [--referer <origin>]
//        [--mirror <mirror dir>] [--exclude "<regex>"]
// Writes assets/map.json (original URL -> local file). Re-runnable: existing files are kept.
// Order of sources per URL: the mirror payload (files/<host>/<path> from mirror.mjs) if --mirror is
// given, then a plain fetch with a browser UA + referer. CDNs that 403 a plain fetch (Instagram, some
// Shopify apps) are only reachable through the mirror payload — crawl first, then run this.
import { mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { arg, UA } from './_lib.mjs';

const LIST = arg('--list'); const OUT = arg('--out');
if (!LIST || !OUT) { console.error('--list and --out required'); process.exit(2); }
const REFERER = arg('--referer', '');
const MIRROR = arg('--mirror', '');
const EXCLUDE = arg('--exclude', '') ? new RegExp(arg('--exclude')) : null;
await mkdir(OUT, { recursive: true });

const urls = (await readFile(LIST, 'utf8')).split('\n').map(s => s.trim()).filter(u => u && !/^data:|^blob:/.test(u)).filter(u => !EXCLUDE || !EXCLUDE.test(u));
const mapPath = join(OUT, 'map.json');
const map = existsSync(mapPath) ? JSON.parse(await readFile(mapPath, 'utf8')) : {};
const used = new Set(Object.values(map));

// mirror.mjs manifest: { "<url>": { file: "files/<host>/<path>", ... } } (shape varies by version — accept both)
let manifest = {};
if (MIRROR) { try { const m = JSON.parse(await readFile(join(MIRROR, 'manifest.json'), 'utf8')); manifest = m.entries || m.files || m; } catch { console.log('no manifest.json in', MIRROR); } }
const fromMirror = u => {
  const e = manifest[u]; const f = typeof e === 'string' ? e : e?.file || e?.path;
  if (f && existsSync(join(MIRROR, f))) return join(MIRROR, f);
  try { const { host, pathname } = new URL(u); const guess = join(MIRROR, 'files', host, decodeURIComponent(pathname)); if (existsSync(guess)) return guess; } catch {}
  return null;
};

function nameFor(u) {
  const url = new URL(u.startsWith('//') ? 'https:' + u : u);
  let base = basename(url.pathname) || 'index';
  let ext = extname(base).toLowerCase(); let stem = ext ? base.slice(0, -ext.length) : base;
  if (!ext) ext = '.bin';
  const w = url.searchParams.get('width') || url.searchParams.get('w'); if (w) stem += '-w' + w;
  stem = stem.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_{2,}/g, '_').slice(0, 80);
  let name = stem + ext; let n = 2;
  while (used.has(name)) name = `${stem}-${n++}${ext}`;
  return name;
}

let done = 0, copied = 0, failed = 0;
for (const u of urls) {
  if (map[u] && existsSync(join(OUT, map[u]))) { done++; continue; }
  const full = u.startsWith('//') ? 'https:' + u : u;
  const local = MIRROR ? fromMirror(full) : null;
  const name = nameFor(full);
  try {
    if (local) { await copyFile(local, join(OUT, name)); copied++; }
    else {
      const res = await fetch(full, { headers: { 'user-agent': UA, ...(REFERER ? { referer: REFERER } : {}) } });
      if (!res.ok) { failed++; console.log('HTTP', res.status, u.slice(0, 120)); continue; }
      await writeFile(join(OUT, name), Buffer.from(await res.arrayBuffer()));
    }
    used.add(name); map[u] = name; done++;
    console.log(name, Math.round((await stat(join(OUT, name))).size / 1024) + 'k', local ? '(mirror)' : '');
  } catch (e) { failed++; console.log('FAIL', u.slice(0, 120), e.message.slice(0, 80)); }
}
await writeFile(mapPath, JSON.stringify(map, null, 1));
console.log(`assets: ${done} ok (${copied} from mirror), ${failed} failed, map.json ${Object.keys(map).length} entries -> ${OUT}`);
