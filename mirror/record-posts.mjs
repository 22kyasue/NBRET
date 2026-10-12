// Record the POST calls a SPA makes on in-app navigation so serve.mjs can replay them offline.
//
//   node scripts/mirror/record-posts.mjs --start https://www.gucciosteria.com/en/florence/ \
//     --pages references/<mirror>/pages.json --out references/<mirror> --hosts backend.gucciosteria.com
//
// Loads --start in a real Chrome, then pushes every route in --pages through the app's own
// router (window.$nuxt.$router — Nuxt 2) so the client fetches each page's data exactly as a
// visitor clicking through would. Every POST to --hosts is keyed by sha1(path + body) and its
// response body saved to <out>/files/__posts/<key>.json; <out>/posts.json is the index.
// Merges into an existing posts.json, so it can be re-run for new routes.

import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const START = arg('--start'); const PAGES = arg('--pages'); const OUT = arg('--out');
const HOSTS = (arg('--hosts', '') || '').split(',').filter(Boolean);
const SETTLE = Number(arg('--settle', 2500));
// --fresh: reload --start before every push, so each route is fetched the way a visitor
// arriving from the landing would fetch it (nothing pre-cached in the store by earlier pushes).
const FRESH = process.argv.includes('--fresh');
// --scroll: wheel through each page after it settles, so listings that fetch items as their
// cards enter the viewport (a shop grid) make those requests too.
const SCROLL = process.argv.includes('--scroll');
if (!START || !PAGES || !OUT || !HOSTS.length) { console.error('usage: --start <url> --pages <pages.json> --out <mirror> --hosts <host,host>'); process.exit(2); }

const indexPath = join(OUT, 'posts.json');
const index = existsSync(indexPath) ? JSON.parse(await readFile(indexPath, 'utf8')) : {};
await mkdir(join(OUT, 'files', '__posts'), { recursive: true });
const origin = new URL(START).origin;
const routes = [...new Set(JSON.parse(await readFile(PAGES, 'utf8')).map(p => new URL(p.finalUrl || p.url).pathname.replace(/\/?$/, '/')))];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'ja-JP' });
let current = null; let pending = [];
page.on('response', (r) => {
  const q = r.request();
  if (q.method() !== 'POST') return;
  const u = new URL(r.url());
  if (!HOSTS.includes(u.host)) return;
  const body = q.postData() || '';
  const key = createHash('sha1').update(u.pathname + '\n' + body).digest('hex');
  pending.push((async () => {
    try {
      const buf = await r.body();
      const file = join('files', '__posts', key + '.json');
      await writeFile(join(OUT, file), buf);
      const e = index[key] ||= { url: r.url(), path: u.pathname, post: body, file: file.replace(/\\/g, '/'), routes: [] };
      e.size = buf.length; e.type = (r.headers()['content-type'] || '').split(';')[0].trim(); e.status = r.status();
      if (current && !e.routes.includes(current)) e.routes.push(current);
    } catch (e) { console.log('  body failed', r.url(), e.message); }
  })());
});

current = new URL(START).pathname;
await page.goto(START, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('goto:', e.message.split('\n')[0]));
await page.waitForTimeout(1500);
await page.evaluate(() => document.getElementById('onetrust-consent-sdk')?.remove());
let n = 0;
for (const route of routes) {
  if (route === current) continue;
  if (FRESH && n) {
    await page.goto(START, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(800);
    await page.evaluate(() => document.getElementById('onetrust-consent-sdk')?.remove());
  }
  current = route; n++;
  const before = Object.keys(index).length + pending.length;
  const ok = await page.evaluate((r) => { const nx = window.$nuxt; if (!nx) return 'no $nuxt'; const p = nx.$router.push(r); if (p && p.catch) p.catch(() => {}); return 'pushed'; }, route).catch(e => e.message);
  await page.waitForTimeout(SETTLE);
  if (SCROLL) {
    await page.mouse.move(720, 500);
    for (let k = 0; k < 40; k++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(120); }
    await page.waitForTimeout(1500);
    for (let k = 0; k < 40; k++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(30); }
  }
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await Promise.allSettled(pending); pending = [];
  const at = await page.evaluate(() => location.pathname).catch(() => '?');
  console.log(`[${n}/${routes.length}] ${route} ${ok} -> ${at} (+${Object.keys(index).length - before} posts)`);
  if (at !== route) { // the router refused (external / error page) — reload from the start so the next push has a healthy app
    await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.evaluate(() => document.getElementById('onetrust-consent-sdk')?.remove());
  }
  await writeFile(indexPath, JSON.stringify(index, null, 1));
}
await browser.close();
await writeFile(indexPath, JSON.stringify(index, null, 1));
console.log(`done: ${Object.keys(index).length} recorded POST responses in ${indexPath}`);
