// Mirror a site for local, offline study.
//
//   node scripts/mirror/mirror.mjs --start https://example.com/ \
//     --out references/<slug>-mirror-<YYYY-MM-DD> [--prefix /] [--max-pages 80] [--viewport 1440x900]
//     [--seeds seeds.txt --skip-done] [--block <regex>]
//
// Drives a real Chrome through every page reachable under --prefix, scrolls each one so
// lazy media fires, records every network response body to <out>/files/<host>/<path>,
// harvests srcset candidates + every Cloudinary video URL referenced anywhere (HTML, Next
// data JSON, JS), then downloads whatever the browser did not fully fetch (206 media,
// unpicked srcset sizes, videos) with plain HTTP. Serve the result with serve.mjs.
//
// Output:
//   files/            raw bodies, exactly as served (no rewriting — serve.mjs rewrites live)
//   manifest.json     url -> { file, status, type, size, via }
//   pages.json        crawled pages, in order
//   videos.json       every video URL found, with the page(s) that reference it
//   videos/           originals (untransformed Cloudinary URL) — the high-quality set

import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
// Required flags; no site defaults (a bare or --help run crawled patek.com, the first capture's values, 2026-09-23).
if (process.argv.includes('--help') || process.argv.includes('-h') || ["--start","--out"].some(f => !process.argv.includes(f))) {
  console.log("usage: node scripts/mirror/mirror.mjs --start <url> --out references/<slug>-mirror-<date> [--prefix /] [--max-pages 80] [--concurrency 8] [--viewport 1440x900] [--seeds file --skip-done] [--block <regex>]\n(see the header of this file and scrape-context/README.md for every flag)");
  process.exit(process.argv.includes('--help') || process.argv.includes('-h') ? 0 : 1);
}
const START = arg('--start');
const OUT = arg('--out');
const PREFIX = arg('--prefix', '/');
const MAX_PAGES = Number(arg('--max-pages', 80));
const CONCURRENCY = Number(arg('--concurrency', 8));
const VIDEO_Q = arg('--video-quality', 'q_auto:best');
// --viewport WxH: a second pass at a phone width picks up the lazy chunks and srcset sizes a
// desktop crawl never requests (resumable — only new URLs are saved).
const [VW, VH] = arg('--viewport', '1440x900').split('x').map(Number);
const ORIGIN = new URL(START).origin;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const SKIP_HOSTS = /cookiebot\.com|googletagmanager\.com|google-analytics\.com|googlesyndication\.com|doubleclick\.net|facebook\.net|google\.com\/ccm/;

const manifest = existsSync(join(OUT, 'manifest.json'))
  ? JSON.parse(await readFile(join(OUT, 'manifest.json'), 'utf8')) : {};
const pending = new Map();       // url -> reason
const videos = new Map();        // url -> Set(pages)
const pages = [];
const queue = [START];
const seen = new Set([START]);
// --seeds <file>: extra start routes, one per line (sitemap URLs the link crawl cannot reach — hyperice 2026-09-07)
// --skip-done: do not re-crawl routes already in pages.json (seed-only top-up on a finished mirror)
const SEEDS = arg('--seeds', '');
const SKIP_DONE = process.argv.includes('--skip-done');
const priorPages = existsSync(join(OUT, 'pages.json')) ? JSON.parse(await readFile(join(OUT, 'pages.json'), 'utf8')) : [];
const donePages = new Set(priorPages.map(p => p.url.replace(/\/$/, '')));
if (SEEDS) for (const line of (await readFile(SEEDS, 'utf8')).split(/\r?\n/)) {
  const r = line.trim().replace(/\/$/, '');
  if (r && !seen.has(r)) { seen.add(r); queue.push(r); }
}

const WIN_BAD = /[<>:"|?*]/g;
function fileFor(url) {
  const u = new URL(url);
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/') || !extname(p)) p = p.replace(/\/$/, '') + '/__index';
  if (u.search) {
    const h = createHash('sha1').update(u.search).digest('hex').slice(0, 8);
    const ext = extname(p);
    p = ext ? p.slice(0, -ext.length) + '__q' + h + ext : p + '__q' + h;
  }
  const parts = p.split('/').map(s => s.replace(WIN_BAD, '_'));
  return join('files', u.host.replace(WIN_BAD, '_'), ...parts);
}

async function save(url, buf, meta) {
  const file = fileFor(url);
  await mkdir(dirname(join(OUT, file)), { recursive: true });
  await writeFile(join(OUT, file), buf);
  manifest[url] = { file, size: buf.length, ...meta };
}

function cleanUrl(href, base) {
  try {
    const u = new URL(href, base);
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = '';
    return u.href;
  } catch { return null; }
}

function parseSrcset(s) {
  return s.split(',').map(c => c.trim().split(/\s+/)[0]).filter(Boolean);
}

// ---------- crawl ----------
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({
  viewport: { width: VW, height: VH }, isMobile: VW < 800, hasTouch: VW < 800, locale: 'ja-JP', userAgent: UA, bypassCSP: true,
});
const page = await ctx.newPage();
let inflight = [];

page.on('response', (r) => {
  const url = r.url();
  if (url.startsWith('data:') || url.startsWith('blob:')) return;
  const status = r.status();
  const type = (r.headers()['content-type'] || '').split(';')[0].trim();
  if (status === 304) { pending.set(url, '304'); return; }   // cached-in-browser: no location header, so it used to be saved as a redirect to itself and serve.mjs looped (hyperice 2026-09-07)
  if (status >= 300 && status < 400) {
    manifest[url] = { redirect: cleanUrl(r.headers()['location'] || '', url), status, via: 'browser' };
    return;
  }
  if (status !== 200) { if (status === 206) pending.set(url, '206'); return; }
  if (manifest[url]?.file) return;
  inflight.push((async () => {
    try {
      const body = await Promise.race([r.body(), new Promise((_, rej) => setTimeout(() => rej(new Error('body timeout')), 20000))]);  // streaming/long-poll responses never resolve (vermillion 2026-09-04)
      await save(url, body, { status, type, via: 'browser' });
    } catch { pending.set(url, 'body-failed'); }
  })());
});

async function crawl(url) {
  console.log(`[${pages.length + 1}/${MAX_PAGES}] ${url}`);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  } catch (e) {
    console.log('  goto:', e.message.split('\n')[0]);
    if (page.url() === 'about:blank') return;
  }
  if (new URL(page.url()).origin !== ORIGIN) return;
  try { await page.click('#CybotCookiebotDialogBodyButtonDecline', { timeout: 2000 }); } catch {}

  // open the hamburger menu and hover every item so megamenu media loads (same menu on every
  // page, so only on the first)
  let menuLinks = [];
  if (pages.length === 0) {
    try { await page.click('header button', { timeout: 2000 }); await page.waitForTimeout(800); } catch {}
    const navs = await page.$$('header a, header button, nav a, nav button');
    for (const el of navs.slice(0, 60)) {
      try { await el.hover({ timeout: 500 }); await page.waitForTimeout(150); } catch {}
    }
    menuLinks = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.href));
    await page.keyboard.press('Escape');
    await page.mouse.move(5, 5);
  }

  // scroll the page so IntersectionObserver-gated media loads
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0, n = 0; y <= height + 900 && n < 120; y += 800, n++) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  try { await page.waitForLoadState('networkidle', { timeout: 8_000 }); } catch {}
  await page.waitForTimeout(800);

  const found = await page.evaluate(() => {
    // DOM links + every language-prefixed path (/ja, /en/…) inside Next's page data, on this site's own host
    // (the nav tree lives there even when the menu is closed; the pattern was patek.com-only until 2026-09-23)
    const links = [...document.querySelectorAll('a[href]')].map(a => a.href);
    const nextData = document.getElementById('__NEXT_DATA__')?.textContent || '';
    const host = location.host.replace(/\./g, '\\.');
    for (const m of nextData.matchAll(new RegExp('"((?:https?:\\/\\/' + host + ')?\\/[a-z]{2}(?:\\/[^"?#\\\\]*)?)"', 'g'))) links.push(m[1]);
    const assets = [];
    for (const el of document.querySelectorAll('img[src], script[src], link[rel~=stylesheet][href], link[rel~=preload][href], link[rel~=icon][href], link[rel~=modulepreload][href], video[src], source[src], video[poster]')) {
      for (const k of ['src', 'href', 'poster']) if (el[k]) assets.push(el[k]);
    }
    const srcsets = [...document.querySelectorAll('[srcset]')].map(e => e.getAttribute('srcset'));
    const vids = [...document.querySelectorAll('video')].map(v => ({
      src: v.currentSrc || v.src, sources: [...v.querySelectorAll('source')].map(s => s.src),
      w: v.videoWidth, h: v.videoHeight, poster: v.poster,
    }));
    return { links, assets, srcsets, vids, html: document.documentElement.outerHTML.length };
  });
  await Promise.allSettled(inflight); inflight = [];
  pages.push({ url, finalUrl: page.url(), videos: found.vids.length });

  for (const s of found.srcsets) for (const c of parseSrcset(s)) noteAsset(c, url);
  for (const a of found.assets) noteAsset(a, url);
  for (const v of found.vids) for (const s of [v.src, ...v.sources]) if (s) noteVideo(s, url);
  for (const l of [...found.links, ...menuLinks]) {
    const u = cleanUrl(l, url);
    if (!u) continue;
    const p = new URL(u);
    if (p.origin !== ORIGIN || !p.pathname.startsWith(PREFIX)) continue;
    if (/\.(pdf|zip|jpg|png|mp4)$/i.test(p.pathname)) { noteAsset(u, url); continue; }
    const route = p.origin + p.pathname.replace(/\/$/, '');   // one crawl per route; query variants share the SSR page
    if (!seen.has(route) && seen.size < MAX_PAGES * 4) { seen.add(route); queue.push(route); }
  }
}

function noteAsset(href, from) {
  const u = cleanUrl(href, from);
  if (!u || manifest[u]?.file || SKIP_HOSTS.test(u)) return;
  if (/\/video\/upload\//.test(u)) noteVideo(u, from);
  pending.set(u, pending.get(u) || 'harvested');
}
function noteVideo(href, from) {
  const u = cleanUrl(href, from);
  if (!u) return;
  if (!videos.has(u)) videos.set(u, new Set());
  videos.get(u).add(from);
}

while (queue.length && pages.length < MAX_PAGES) {
  const url = queue.shift();
  if (SKIP_DONE && donePages.has(url.replace(/\/$/, ''))) continue;
  try { await crawl(url); } catch (e) { console.log('  crawl failed:', e.message.split('\n')[0]); }
  await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
}
await browser.close();

// ---------- harvest video URLs from every captured text body ----------
const VIDEO_RE = /https?:\\?\/\\?\/[a-z0-9.-]+\\?\/video\\?\/upload\\?\/[^\s"'<>\\)]+/gi;
for (const [url, m] of Object.entries(manifest)) {
  if (!m.file || !/html|javascript|json|css/.test(m.type || '')) continue;
  const text = await readFile(join(OUT, m.file), 'utf8').catch(() => '');
  for (const hit of text.match(VIDEO_RE) || []) noteVideo(hit.replace(/\\\//g, '/').replace(/\\u002F/g, '/'), url);
}
for (const v of videos.keys()) if (!manifest[v]?.file) pending.set(v, pending.get(v) || 'video');

// ---------- download pass ----------
async function fetchTo(url, destFile) {
  const res = await fetch(url, { headers: { 'user-agent': UA, referer: ORIGIN + '/', accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await mkdir(dirname(destFile), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destFile));
  const { size } = await import('node:fs').then(fs => fs.statSync(destFile));
  return { status: 200, type: (res.headers.get('content-type') || '').split(';')[0].trim(), size };
}

async function runPool(items, worker) {
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) { const it = items[i++]; try { await worker(it); } catch (e) { console.log('  fail', it, e.message); } }
  }));
}

const toGet = [...pending.keys()].filter(u => !manifest[u]?.file && !SKIP_HOSTS.test(u));
console.log(`\ndownload pass: ${toGet.length} urls`);
await runPool(toGet, async (url) => {
  const file = fileFor(url);
  const meta = await fetchTo(url, join(OUT, file));
  manifest[url] = { file, via: 'fetch', reason: pending.get(url), ...meta };
});

// ---------- originals: highest quality of every video ----------
const videoList = [];
console.log(`\nvideos: ${videos.size} distinct urls`);
await mkdir(join(OUT, 'videos'), { recursive: true });
await runPool([...videos.entries()], async ([url, from]) => {
  const u = new URL(url);
  // strip Cloudinary transformations: /video/upload/<transforms>/<public_id>
  const m = u.pathname.match(/^\/video\/upload\/(?:[^/]*\/)*?((?:dfsmedia|v\d+)\/.+)$/);
  const publicId = m ? m[1].replace(/\.[a-z0-9]+$/i, '') : null;
  // Cloudinary serves AV1 by default (tiny, not editable). VIDEO_Q picks the H.264 archive quality:
  // q_auto:best ~3 MB / 5 s banner (default) · q_100 ~90 MB (near-lossless) · vc_h264 ~2 MB
  const originalUrl = publicId ? `${u.origin}/video/upload/${VIDEO_Q}/${publicId}.mp4` : url;
  const maxQualityUrl = publicId ? `${u.origin}/video/upload/q_100/${publicId}.mp4` : url;
  const name = (publicId || u.pathname).split('/').slice(-2).join('__').replace(WIN_BAD, '_') + '.mp4';
  const dest = join(OUT, 'videos', name);
  let meta = null;
  if (!existsSync(dest)) {
    try { meta = await fetchTo(originalUrl, dest); }
    catch (e) { console.log('  original failed, using served:', e.message); meta = await fetchTo(url, dest); }
  }
  videoList.push({ url, archived: originalUrl, quality: VIDEO_Q, maxQualityUrl, file: 'videos/' + name, size: meta?.size, pages: [...from] });
  console.log('  video', name, meta?.size);
});

await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
await writeFile(join(OUT, 'pages.json'), JSON.stringify([...priorPages.filter(p => !pages.some(q => q.url === p.url)), ...pages], null, 1));
await writeFile(join(OUT, 'videos.json'), JSON.stringify(videoList, null, 1));
const total = Object.values(manifest).reduce((n, m) => n + (m.size || 0), 0);
console.log(`\ndone: ${pages.length} pages, ${Object.keys(manifest).length} urls, ${(total / 1e6).toFixed(1)} MB, ${videoList.length} videos`);
