import { collectPageInventory } from './page-inventory.mjs';
// /copy stage 4 — extract everything a 1:1 rebuild needs from one page, per viewport.
//   node <skill>/scripts/extract.mjs --url <page> --out .scratch/copy-<slug>/extract
//        [--viewports 1440x900,390x844] [--dismiss "<sel>|<sel>"] [--hover "<sel>,<sel>"] [--wait 2500]
// Writes, per viewport <w>:
//   dom-<w>.json    every element: rect (page coords), class/id, own text, attributes, computed styles that
//                   differ from the parent, ::before/::after, img natural size; plus fonts, animations (WAAPI),
//                   css custom props, libs, ScrollTriggers, videos, canvases, console errors
//   body-<w>.html   the hydrated body markup (state classes included — clean them in the build)
//   used-<w>.css    rules the page actually used (CDP coverage) with @media restored, @keyframes/@font-face whole
//   network-<w>.json / scripts-<w>.txt   every response (url, type, status, mime, bytes) and the JS to read
//   top-<w>.png / full-<w>.png
// And across viewports: used-all.css (union), assets.txt (image/video/font/poster/srcset/background URLs),
// summary.json. Run from translation/homepage/.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { arg, viewports, launch, context, collectErrors, open, scrollThrough, renderUsedCss, PATH_FN } from './_lib.mjs';

const URL_ = arg('--url'); if (!URL_) { console.error('--url required'); process.exit(2); }
const OUT = arg('--out', '.scratch/copy-extract');
const VPS = viewports(arg('--viewports', '1440x900,390x844'));
const DISMISS = arg('--dismiss', '');
const WAIT = Number(arg('--wait', 2500));
const HOVERS = arg('--hover', 'header a,nav a,[class*=menu] a,[class*=card],[class*=item],[class*=btn],button').split(',').map(s => s.trim()).filter(Boolean);
await mkdir(OUT, { recursive: true });

const browser = await launch();
const sheetUnion = new Map(); // key -> { text, label, ranges:Set('s:e') }
const assetUrls = new Set();
const summary = { url: URL_, date: new Date().toISOString(), viewports: {} };

for (const [vw, vh] of VPS) {
  const tag = String(vw);
  const ctx = await context(browser, [vw, vh]);
  // record which canvases get which context, before any page script runs
  await ctx.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) { (this.__ctxTypes ||= new Set()).add(type); return orig.call(this, type, ...rest); };
    window.__copyIO = []; const IO = window.IntersectionObserver;
    if (IO) window.IntersectionObserver = class extends IO { constructor(cb, opts) { super(cb, opts); window.__copyIO.push({ rootMargin: opts?.rootMargin || '0px', threshold: opts?.threshold ?? 0 }); } };
  });
  const page = await ctx.newPage();
  const errors = collectErrors(page);
  const network = [];
  page.on('response', async r => {
    const req = r.request(); const h = r.headers();
    const rec = { url: r.url(), type: req.resourceType(), status: r.status(), mime: (h['content-type'] || '').split(';')[0], bytes: Number(h['content-length'] || 0) || undefined };
    network.push(rec);
    if (['image', 'media', 'font'].includes(rec.type) || /^(image|video|audio|font)\//.test(rec.mime)) assetUrls.add(rec.url);
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const sheets = new Map();
  cdp.on('CSS.styleSheetAdded', ({ header }) => sheets.set(header.styleSheetId, header));
  await cdp.send('CSS.startRuleUsageTracking');

  await open(page, URL_, { wait: WAIT, dismiss: DISMISS });
  await page.screenshot({ path: join(OUT, `top-${tag}.png`) });
  await page.keyboard.press('Escape').catch(() => {});
  const total = await scrollThrough(page, vh);
  // hover pass so :hover rules and hover-triggered media register (desktop only)
  if (vw >= 800) for (const sel of HOVERS) {
    const els = await page.$$(sel).catch(() => []);
    for (const el of els.slice(0, 3)) { try { await el.scrollIntoViewIfNeeded({ timeout: 800 }); await el.hover({ timeout: 800 }); await page.waitForTimeout(250); } catch {} }
  }
  await page.mouse.move(5, 5).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);

  // ---- used CSS (this viewport + union)
  const { ruleUsage } = await cdp.send('CSS.stopRuleUsageTracking');
  const usedBySheet = new Map();
  for (const r of ruleUsage) { if (!r.used) continue; if (!usedBySheet.has(r.styleSheetId)) usedBySheet.set(r.styleSheetId, []); usedBySheet.get(r.styleSheetId).push(r); }
  let usedCss = ''; let usedCount = 0;
  for (const [id, ranges] of usedBySheet) {
    const h = sheets.get(id) || {};
    let text = ''; try { ({ text } = await cdp.send('CSS.getStyleSheetText', { styleSheetId: id })); } catch { continue; }
    // inline <style> sheets all report the document URL as sourceURL — key by content hash too
    const hash = createHash('sha1').update(text).digest('hex').slice(0, 8);
    const label = `${h.sourceURL || h.origin || 'inline'}${h.isInline || !h.sourceURL ? ' (inline)' : ''} #${hash}`;
    const rs = ranges.map(r => [r.startOffset, r.endOffset]);
    const r = renderUsedCss(text, label, rs); usedCss += r.css; usedCount += r.count;
    const key = label;
    if (!sheetUnion.has(key)) sheetUnion.set(key, { text, label, ranges: new Set() });
    for (const [s, e] of rs) sheetUnion.get(key).ranges.add(`${s}:${e}`);
  }
  await writeFile(join(OUT, `used-${tag}.css`), usedCss);

  // ---- DOM + styles + motion inventory
  const data = await collectPageInventory(page);
  const { bodyHtml, headHtml, assets, ...rest } = data;
  for (const u of assets) if (!/^data:|^blob:/.test(u)) assetUrls.add(u);
  await writeFile(join(OUT, `dom-${tag}.json`), JSON.stringify({ ...rest, consoleErrors: errors }, null, 1));
  await writeFile(join(OUT, `body-${tag}.html`), bodyHtml);
  await writeFile(join(OUT, `head-${tag}.html`), headHtml);
  await writeFile(join(OUT, `network-${tag}.json`), JSON.stringify(network, null, 1));
  await writeFile(join(OUT, `scripts-${tag}.txt`), [...new Set(network.filter(n => n.type === 'script').map(n => n.url))].join('\n') + '\n');
  // Libraries compiled into an app bundle (Vite / webpack) never reach window.* — the window checks above
  // then report gsap/lenis false (ikemotoshigetaka.com 2026-09-22: GSAP + ScrollTrigger + Lenis + Barba all
  // bundled). Grep the page's own scripts for each library's signature and report them as libs.bundled.
  const SIG = { gsap: /GreenSock|_gsap\b|gsap\.registerPlugin|registerPlugin\(/, scrollTrigger: /ScrollTrigger|pin-spacer/, lenis: /lenis-smooth|lenis-stopped|syncTouchLerp/, barba: /data-barba|barba\.init|preventRunning/, swiper: /swiper-wrapper|swiper-slide/, splide: /splide__track/, lottie: /bodymovin|lottie/i, three: /WebGLRenderer/, locomotive: /data-scroll-container/ };
  const bundled = {};
  for (const u of new Set(network.filter(n => n.type === 'script' && /^https?:/.test(n.url)).map(n => n.url))) {
    try { const body = await (await page.request.get(u, { timeout: 15000 })).text(); for (const [k, re] of Object.entries(SIG)) if (!bundled[k] && re.test(body)) bundled[k] = u.split('/').pop().split('?')[0]; } catch {}
  }
  data.libs.bundled = bundled;
  await page.screenshot({ path: join(OUT, `full-${tag}.png`), fullPage: true }).catch(e => console.log('full screenshot failed:', e.message.slice(0, 120)));
  summary.viewports[tag] = { scrollHeight: data.scrollHeight, elements: data.els.length, usedRules: usedCount, fonts: data.fonts.length, animations: data.anims.length, scrollTriggers: data.scrollTriggers.length, videos: data.videos.length, canvases: data.canvases.length, consoleErrors: errors.length, requests: network.length };
  summary.libs = data.libs; summary.title = data.title;
  console.log(`${tag}: ${data.els.length} elements, scrollHeight ${data.scrollHeight}, ${usedCount} used rules, ${data.fonts.length} fonts, ${data.anims.length} WAAPI animations, ${data.scrollTriggers.length} ScrollTriggers, ${data.videos.length} videos, ${data.canvases.length} canvases, ${errors.length} console errors`);
  await ctx.close();
}
await browser.close();

// union of used CSS across viewports
let all = '';
for (const { text, label, ranges } of sheetUnion.values()) {
  const rs = [...ranges].map(s => s.split(':').map(Number));
  all += renderUsedCss(text, label + ' union', rs).css;
}
await writeFile(join(OUT, 'used-all.css'), all);
await writeFile(join(OUT, 'assets.txt'), [...assetUrls].sort().join('\n') + '\n');
await writeFile(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(`assets ${assetUrls.size} urls -> assets.txt; libs ${JSON.stringify(Object.fromEntries(Object.entries(summary.libs).filter(([, v]) => v && !(Array.isArray(v) && !v.length))))}`);
