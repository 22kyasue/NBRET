// Serve a mirror made by mirror.mjs, offline.
//
//   node scripts/mirror/serve.mjs --dir references/<slug>-mirror-<date> --origin https://example.com --port 8787 [--start /]
//   -> http://localhost:8787/
// Add --passthrough-maps for pages whose interactive Google Maps embed must stay live.
// Add --passthrough-fonts when localized copy needs Google Font glyph subsets that were not
// requested during the capture.
// Add --inject <html> for a local, non-destructive copy/branding layer and --default-en
// when the captured site's /en page should also be served at the local root.
//
// Files on disk are untouched. Text bodies (html/css/js/json) are rewritten on the way out:
// the origin becomes http://localhost:<port>, and every other captured host becomes
// /__ext/<host>/... so cross-origin assets (Cloudinary etc.) resolve to the local copy.
// Tracker hosts get an empty 204. Range requests are honoured, so video seeks.

import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
// Required flags; no site defaults (a bare or --help run crawled patek.com, the first capture's values, 2026-09-23).
if (process.argv.includes('--help') || process.argv.includes('-h') || ["--dir","--origin"].some(f => !process.argv.includes(f))) {
  console.log("usage: node scripts/mirror/serve.mjs --dir references/<slug>-mirror-<date> --origin <https://site> [--port 8787] [--start /] [--block <regex>] [--text-replace <json>] [--keep-routes ...] [--posts ...] [--inject <html>] [--passthrough-maps] [--passthrough-fonts] [--default-en]");
  process.exit(process.argv.includes('--help') || process.argv.includes('-h') ? 0 : 1);
}
const DIR = arg('--dir');
const PORT = Number(arg('--port', 8787));
const ORIGIN = arg('--origin');
const BLOCK = /cookiebot\.com|googletagmanager\.com|google-analytics\.com|googlesyndication\.com|doubleclick\.net|facebook\.com\/tr|connect\.facebook\.net|r\.stripe\.com|m\.stripe\.com|js-agent\.newrelic|nr-data\.net|p\.typekit\.net\/p\.gif|static-tracking\.klaviyo\.com|analytics\.twitter\.com|static\.ads-twitter\.com|t\.co\/|clarity\.ms|crazyegg\.com|googleadservices\.com|google\.com\/pagead|bing\.com|monorail-edge\.shopifysvc\.com|otlp-http-production\.shopifysvc\.com|shop\.app\/pay|\/api\/collect|tr\.nfcube\.com/;
// --block <regex>: site-specific additions to the 204 list (SaaS APIs that cannot work offline —
// the Swym wishlist relay on vermillion, 2026-09-04).
const EXTRA_BLOCK = arg('--block') ? new RegExp(arg('--block')) : null;
const DARK = process.argv.includes('--dark');
const BRAND = process.argv.includes('--brand');
const INJECT_FILE = arg('--inject');
const DEFAULT_EN = process.argv.includes('--default-en');
// Interactive Google Maps embeds generate signed, viewport-specific tile URLs that cannot be
// captured reliably. Keep those embeds live when fidelity matters more than a fully offline copy.
const PASSTHROUGH_MAPS = process.argv.includes('--passthrough-maps');
const PASSTHROUGH_FONTS = process.argv.includes('--passthrough-fonts');
// --media <dir>: extra local files served at /__media/<name>, for an --inject layer that
// swaps a client's own photography into the captured slots. Read-only and additive — the
// captured files/ are never modified, so the mirror stays a faithful 1:1 copy.
const MEDIA = arg('--media');
// --keep <url,url>: exact URL strings left unrewritten (a CMS client that validates its endpoint
// against ^https?://host/api.php$ and throws on the /__ext/ form — gucciosteria, 2026-09-02).
const KEEP = (arg('--keep', '') || '').split(',').filter(Boolean);
// --keep-routes <host>=<prefix|prefix>[,<host>=...]: a headless-CMS host whose URLs are BOTH
// assets (rewritten to the local copy — the listed path prefixes) and route links the SPA
// turns into internal routes only when it still sees the real host (everything else). Without
// it the hydrated nav links point at /__ext/<host>/... and 404 (gucciosteria, 2026-09-02).
const KEEP_ROUTES = (arg('--keep-routes', '') || '').split(',').filter(Boolean)
  .map(e => { const [host, p] = e.split('='); return { host, assetPrefixes: (p || '').split('|').filter(Boolean) }; });
// --text-replace <json>: { "from": "to" } literal swaps applied to every text body on the way
// out — a theme colour baked into CSS-in-JS bundles, for instance. Files on disk stay untouched.
const TEXT_REPLACE = arg('--text-replace') ? Object.entries(JSON.parse(await readFile(arg('--text-replace'), 'utf8'))).filter(([k]) => k !== '_comment') : [];
const MAP_HOST = /^(?:www\.google\.com|maps\.googleapis\.com|maps\.gstatic\.com|places\.googleapis\.com)$/;
// Japanese webfont services matter more here than Google's: FONTPLUS and TypeSquare
// serve dynamic per-page glyph subsets that cannot be captured (the request URL encodes
// the exact character set AND the referring origin, so a replay from localhost 404s).
// Typography only — passthrough was tested against the-tawaraya.jp's missing scroll
// motion on 2026-09-05 and made no difference to it. Do not reach for this flag to fix
// behaviour.
const FONT_HOST = /^(?:fonts\.googleapis\.com|fonts\.gstatic\.com|webfont\.fontplus\.jp|typesquare\.com|(?:.*\.)?typesquare\.com)$/;
// Dark theme payload lives in dark.html (filterless DOM darkener + grain + video pacing);
// brand.html carries the Gindendo rebrand layer (text map, logo, icon removal).
const DARK_CSS = (DARK ? '\n' + await readFile(new URL('./dark.html', import.meta.url), 'utf8') : '')
  + (BRAND ? '\n' + await readFile(new URL('./brand.html', import.meta.url), 'utf8') : '')
  // --inject accepts a comma-separated list so a capture can carry more than one layer
  // (media swap, copy/i18n, load-in) as separate reviewable files.
  + (INJECT_FILE ? (await Promise.all(INJECT_FILE.split(',').filter(Boolean).map(f => readFile(f.trim(), 'utf8')))).map(s => '\n' + s).join('') : '');
// x-component = Next.js RSC flight payloads; their :HL[...] hints carry asset URLs (phantom, 2026-09-21).
const TEXT = /html|css|javascript|json|xml|svg|x-component/;
// --posts <posts.json> (record-posts.mjs): replay a SPA's data POSTs offline. Each recorded
// endpoint (https://host/path) is rewritten in every text body to http://localhost:<port>/path
// — a CMS client that validates ^https?://host/api.php$ accepts that — and a POST to it is
// answered from the recording keyed by sha1(path + body). Unrecorded bodies get 404.
const POSTS = arg('--posts') ? JSON.parse(await readFile(arg('--posts'), 'utf8')) : {};
const POST_ENDPOINTS = [...new Set(Object.values(POSTS).map(e => e.url))];
if (POST_ENDPOINTS.length) console.log(`posts: ${Object.keys(POSTS).length} recorded responses for ${POST_ENDPOINTS.join(', ')}`);

const manifest = JSON.parse(await readFile(join(DIR, 'manifest.json'), 'utf8'));

// --overrides <json>: { "url-substring": "replacement file path" } — swap assets at serve time
// without touching the captured files (e.g. the Gindendo design study). Matched before the
// manifest, so every size/transform variant of an asset id gets the replacement.
// '.html' lets an override replace a whole route with a page of our own (a study layer's own
// reservation screen in place of the reference's) — the body still goes through rewrite().
const EXT_TYPE = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.html': 'text/html', '.svg': 'image/svg+xml' };
const overrides = arg('--overrides') ? Object.entries(JSON.parse(await readFile(arg('--overrides'), 'utf8'))).filter(([k]) => k !== '_comment') : [];
if (overrides.length) console.log(`overrides: ${overrides.length} asset swaps from ${arg('--overrides')}`);
function overrideFor(target) {
  for (const [k, v] of overrides) if (target.includes(k)) {
    const ext = v.slice(v.lastIndexOf('.')).toLowerCase();
    return { url: target, entry: { file: v, abs: true, type: EXT_TYPE[ext] || 'application/octet-stream' } };
  }
  return null;
}

// Cloudinary fallback index: public id -> captured variant urls. A browser at a viewport the
// crawler never used asks for uncaptured transform widths; serve the largest captured variant
// of the same asset instead of a 404.
const cloudIdx = new Map();
const cloudId = (u) => { const m = u.match(/^https?:\/\/[^/]+\/(?:image|video)\/upload\/(?:[^/]*\/)*?((?:dfsmedia|v\d+)\/.+?)(?:\.[a-z0-9]+)?(?:\?.*)?$/i); return m ? m[1] : null; };
for (const [u, e] of Object.entries(manifest)) {
  if (!e.file) continue;
  const id = cloudId(u);
  if (id) { if (!cloudIdx.has(id)) cloudIdx.set(id, []); cloudIdx.get(id).push(u); }
}
function cloudFallback(target) {
  const id = cloudId(target);
  const variants = id && cloudIdx.get(id);
  if (!variants) return null;
  let best = null;
  for (const v of variants) if (!best || (manifest[v].size || 0) > (manifest[best].size || 0)) best = v;
  return best;
}
// Same-path fallback: a URL whose path was captured but with a different query string — a
// Typekit dynamic-subset glyph chunk (`.../m?chunks=263`) requested by text the crawler never
// rendered, for instance. Serve the largest captured variant of the same path instead of a
// 404 so the font loader does not throw; the glyphs simply fall through to the next face.
const pathIdx = new Map();
for (const [u, e] of Object.entries(manifest)) {
  if (!e.file || !u.includes('?')) continue;
  const k = u.split('?')[0];
  if (!pathIdx.has(k) || (e.size || 0) > (manifest[pathIdx.get(k)].size || 0)) pathIdx.set(k, u);
}
const pathFallback = (target) => target.includes('?') ? pathIdx.get(target.split('?')[0]) || null : null;
const hosts = [...new Set(Object.keys(manifest).map(u => new URL(u).host))].filter(h => h !== new URL(ORIGIN).host);
const LOCAL = `http://localhost:${PORT}`;
console.log(`serving ${Object.keys(manifest).length} urls from ${DIR}\n${LOCAL}${new URL(arg('--start', '/'), LOCAL).pathname}\nexternal hosts: ${hosts.join(', ')}`);

function rewrite(text) {
  for (let i = 0; i < KEEP.length; i++) text = text.split(KEEP[i]).join(`\u0000KEEP${i}\u0000`);
  let out = rewriteInner(text);
  for (const [from, to] of TEXT_REPLACE) out = out.split(from).join(to);
  out = restoreRoutes(out);
  out = KEEP.reduce((t, k, i) => t.split(`\u0000KEEP${i}\u0000`).join(k), out);
  for (const ep of POST_ENDPOINTS) {
    const { host, pathname } = new URL(ep);
    out = out.split(`${LOCAL}/__ext/${host}${pathname}`).join(`${LOCAL}${pathname}`).split(ep).join(`${LOCAL}${pathname}`);
  }
  return out;
}
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
function restoreRoutes(text) {
  for (const { host, assetPrefixes } of KEEP_ROUTES) {
    // the three spellings rewriteInner produces: plain, JSON-escaped (\/), Nuxt-payload (/)
    const forms = [
      [`${LOCAL}/__ext/${host}`, `https://${host}`, '/'],
      [`${LOCAL.replace(/\//g, '\\/')}\\/__ext\\/${host}`, `https:\\/\\/${host}`, '\\/'],
      [`${LOCAL.replace(/\//g, '\\u002F')}\\u002F__ext\\u002F${host}`, `https:\\u002F\\u002F${host}`, '\\u002F'],
    ];
    for (const [from, to, sep] of forms) {
      // the path may itself contain the escaped separator (\/ or /), so backslashes stay in
      const re = new RegExp(reEsc(from) + `((?:${reEsc(sep)}[^"'\\s<>)]*)?)`, 'g');
      text = text.replace(re, (m, path) => {
        const plain = path.split(sep).join('/');
        return assetPrefixes.some(p => plain.startsWith(p)) ? m : to + path;
      });
    }
  }
  return text;
}
function rewriteInner(text) {
  const escapedOrigin = ORIGIN.replace(/\//g, '\\/');
  const escapedLocal = LOCAL.replace(/\//g, '\\/');
  // JSON-escaped form used inside Nuxt/Next payloads: https:\u002F\u002Fhost\u002Fpath
  const uOrigin = ORIGIN.replace(/\//g, '\\u002F');
  const uLocal = LOCAL.replace(/\//g, '\\u002F');
  let s = text
    .split(ORIGIN).join(LOCAL)
    .split(escapedOrigin).join(escapedLocal)
    .split(uOrigin).join(uLocal)
    .split(ORIGIN.replace(/^https?:/, '')).join(LOCAL.replace(/^http:/, ''));
  for (const h of hosts) {
    if (PASSTHROUGH_MAPS && MAP_HOST.test(h)) continue;
    if (PASSTHROUGH_FONTS && FONT_HOST.test(h)) continue;
    s = s.split(`https://${h}`).join(`${LOCAL}/__ext/${h}`)
         .split(`https:\\u002F\\u002F${h}`).join(`${uLocal}\\u002F__ext\\u002F${h}`)
         .split(`https:\\/\\/${h}`).join(`${LOCAL.replace(/\//g, '\\/')}\\/__ext\\/${h}`)
         .split(`//${h}/`).join(`${LOCAL}/__ext/${h}/`);
  }
  return s;
}

function resolve(reqUrl, referer) {
  const u = new URL(reqUrl, LOCAL);
  // Nuxt Image serves through its own optimizer: /_ipx/<modifiers>/<source-url>, and the
  // crawler stored that whole composite URL as a single manifest key with the source still
  // at its own origin. Rewriting turns the inner source into the local /__ext/<host> form,
  // so the composite matches nothing and every image 404s (phive, 2026-09-04). Put the
  // inner source back to its original origin before looking the composite up.
  if (u.pathname.startsWith('/_ipx/')) {
    const composite = `${ORIGIN}${u.pathname.replace(/https?:\/\/[^/]+\/__ext\/([^/]+)/g, 'https://$1')}${u.search}`;
    // Overrides first: an optimizer URL carries the real asset id, so an asset swap has to be
    // matched here or it would be shadowed by the manifest hit below and silently never apply.
    const iovr = overrideFor(composite);
    if (iovr) return iovr;
    for (const c of [composite, composite.split('?')[0]]) if (manifest[c]) return { url: c, entry: manifest[c] };
    const ifb = pathFallback(composite);
    if (ifb) return { url: ifb, entry: manifest[ifb] };
  }
  let target;
  const ext = u.pathname.match(/^\/__ext\/([^/]+)(\/.*)?$/);
  if (ext) target = `https://${ext[1]}${ext[2] || '/'}${u.search}`;
  else if (BRAND && (u.pathname === '/' || u.pathname === '/en')) target = `${ORIGIN}/ja${u.search}`;
  else if (DEFAULT_EN && u.pathname === '/') target = `${ORIGIN}/en${u.search}`;
  else if (DEFAULT_EN && (u.pathname === '/ja' || u.pathname === '/ja/')) target = `${ORIGIN}/${u.search}`;
  else target = `${ORIGIN}${u.pathname}${u.search}`;
  const ovr = overrideFor(target);
  if (ovr) return ovr;
  const candidates = [target, target.split('?')[0], target.split('?')[0].replace(/\/$/, ''), target.split('?')[0] + '/'];
  for (const c of candidates) if (manifest[c]) return { url: c, entry: manifest[c] };
  const fb = cloudFallback(target) || pathFallback(target);
  if (fb) return { url: fb, entry: manifest[fb] };
  // A captured third-party iframe document (a reservation widget) asks for root-relative
  // assets — `/css/x.css` — which land on the local origin instead of under /__ext/<host>/.
  // Re-resolve them against the host of the referring /__ext/ page.
  const refHost = !ext && referer?.startsWith(`${LOCAL}/__ext/`) ? referer.slice(LOCAL.length + 7).split('/')[0] : null;
  if (refHost) {
    const alt = `https://${refHost}${u.pathname}${u.search}`;
    for (const c of [alt, alt.split('?')[0]]) if (manifest[c]) return { url: c, entry: manifest[c] };
    const afb = pathFallback(alt);
    if (afb) return { url: afb, entry: manifest[afb] };
  }
  return { url: target, entry: null };
}

createServer(async (req, res) => { try {
  const path = new URL(req.url, LOCAL).pathname;
  if (MEDIA && path.startsWith('/__media/')) {
    const name = path.slice('/__media/'.length).replace(/\.\.|[/\\]/g, '');
    const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.otf': 'font/otf', '.woff2': 'font/woff2', '.woff': 'font/woff' };
    try {
      const body = await readFile(join(MEDIA, name));
      res.writeHead(200, { 'content-type': TYPES[extname(name).toLowerCase()] || 'application/octet-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-store' });
      return res.end(body);
    } catch { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end(`not in --media dir: ${name}`); }
  }
  if (req.method === 'POST' && POST_ENDPOINTS.some(ep => new URL(ep).pathname === path)) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks).toString('utf8');
    const key = createHash('sha1').update(path + '\n' + body).digest('hex');
    const hit = POSTS[key];
    if (!hit) { console.log('POST miss', path, body.slice(0, 120)); res.writeHead(404, { 'content-type': 'application/json' }); return res.end('{"error":"not in mirror recording"}'); }
    res.writeHead(hit.status || 200, { 'content-type': hit.type || 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'no-store' });
    return res.end(rewrite(await readFile(join(DIR, hit.file), 'utf8')));
  }
  const { url, entry } = resolve(req.url, req.headers.referer);
  if (BLOCK.test(url) || (EXTRA_BLOCK && EXTRA_BLOCK.test(url))) { res.writeHead(204); return res.end(); }
  if (!entry) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end(`not in mirror: ${url}`); }
  if (entry.redirect) {
    res.writeHead(302, { location: rewrite(entry.redirect) }); return res.end();
  }
  const file = entry.abs ? entry.file : join(DIR, entry.file);
  const type = entry.type || 'application/octet-stream';
  const headers = { 'content-type': type, 'access-control-allow-origin': '*', 'cache-control': 'no-store' };

  if (TEXT.test(type)) {
    let body = rewrite(await readFile(file, 'utf8'));
    if (BRAND && /html/.test(type)) {
      // The captured document declares Patek icons. Remove them before sending any
      // bytes so Chrome never has a chance to cache or briefly display that brand.
      const japanese = new URL(req.url, LOCAL).searchParams.get('lang') === 'ja';
      body = body
        .replace(/<link\b[^>]*\brel=["'][^"']*icon[^"']*["'][^>]*>/gi, '')
        .replace(/<meta\b[^>]*\bname=["'](?:theme-color|application-name)["'][^>]*>/gi, '')
        .replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${japanese ? '銀伝堂 | 東京の手仕事による銀器' : 'GINDENDO 銀伝堂 | Handcrafted Silver, Tokyo'}</title>`)
        .replace(/<html\b([^>]*?)\blang=["'][^"']*["']/i, `<html$1lang="${japanese ? 'ja' : 'en'}"`);
    }
    if ((DARK || BRAND || INJECT_FILE) && /html/.test(type) && body.includes('</head>')) body = body.replace('</head>', () => DARK_CSS + '</head>');
    res.writeHead(200, { ...headers, 'content-type': type.startsWith('text/') || /json|javascript/.test(type) ? `${type}; charset=utf-8` : type });
    return res.end(body);
  }

  const { size } = await stat(file);
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    // stale cached lengths (e.g. a replaced override file) must not crash the stream
    if (!Number.isFinite(start) || start >= size) { res.writeHead(416, { 'content-range': `bytes */${size}` }); return res.end(); }
    const end = range[2] && range[1] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1, 'accept-ranges': 'bytes' });
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, 'content-length': size, 'accept-ranges': 'bytes' });
  createReadStream(file).pipe(res);
} catch (e) {
  console.error('request error', req.url, e.message);
  try { res.writeHead(500, { 'content-type': 'text/plain' }); res.end('mirror error: ' + e.message); } catch {}
} }).listen(PORT);
