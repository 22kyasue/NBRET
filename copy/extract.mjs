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
  const data = await page.evaluate((pathSrc) => {
    const pathOf = eval(pathSrc);
    const PROPS = ['display', 'position', 'top', 'left', 'right', 'bottom', 'z-index', 'width', 'height', 'max-width', 'min-height', 'padding', 'margin', 'gap', 'grid-template-columns', 'grid-template-rows', 'flex', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content',
      'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'text-decoration-line', 'white-space', 'writing-mode', 'font-feature-settings',
      'color', 'background-color', 'background-image', 'background-size', 'background-position', 'background-attachment', 'opacity', 'transform', 'transform-origin', 'overflow', 'border', 'border-radius', 'box-shadow', 'mix-blend-mode', 'filter', 'backdrop-filter',
      'transition', 'animation', 'will-change', 'object-fit', 'object-position', 'aspect-ratio', 'clip-path', 'mask-image', 'visibility', 'pointer-events', 'cursor', 'inset'];
    const INH = ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform', 'text-align', 'color', 'white-space', 'cursor', 'visibility', 'pointer-events', 'font-feature-settings'];
    const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META', 'PATH', 'G', 'DEFS', 'USE', 'CIRCLE', 'RECT', 'LINE', 'POLYGON', 'POLYLINE', 'CLIPPATH', 'MASK', 'FILTER', 'FEGAUSSIANBLUR', 'FEOFFSET', 'FECOLORMATRIX', 'FEBLEND', 'FEMERGE', 'FEMERGENODE', 'TITLE', 'DESC', 'ELLIPSE', 'LINEARGRADIENT', 'RADIALGRADIENT', 'STOP', 'SYMBOL', 'PATTERN', 'TSPAN']);
    const bg = new Set(); const out = [];
    const walk = (el, depth) => {
      if (SKIP.has(el.tagName)) return;
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' | ');
      const rec = { d: depth, t: el.tagName.toLowerCase(), id: el.id || undefined, c: typeof el.className === 'string' && el.className ? el.className : undefined,
        r: [Math.round(r.x + scrollX), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)], tx: own ? own.slice(0, 160) : undefined };
      for (const a of ['src', 'srcset', 'href', 'alt', 'poster', 'data-src', 'data-srcset', 'data-bg', 'sizes', 'width', 'height', 'loading', 'aria-label', 'type', 'placeholder', 'autoplay', 'muted', 'loop', 'playsinline', 'preload', 'role']) { const v = el.getAttribute(a); if (v != null) (rec.a ||= {})[a] = v.slice(0, 400); }
      for (const a of el.attributes) if (a.name.startsWith('data-') && !(rec.a && a.name in rec.a) && a.value.length < 80) (rec.a ||= {})[a.name] = a.value;
      const st = {}; const pcs = el.parentElement ? getComputedStyle(el.parentElement) : null;
      for (const p of PROPS) { const v = cs.getPropertyValue(p); if (!v || v === 'none' || v === 'normal' || v === 'auto' || v === '0px' || v === 'static' || v === 'visible' || v === 'rgba(0, 0, 0, 0)' || (v === '1' && p === 'opacity')) continue; if (pcs && INH.includes(p) && pcs.getPropertyValue(p) === v) continue; st[p] = v.length > 240 ? v.slice(0, 240) + '…' : v; }
      if (cs.backgroundImage && cs.backgroundImage !== 'none') for (const m of cs.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) bg.add(m[1]);
      if (el.tagName === 'IMG') { st.naturalW = el.naturalWidth; st.naturalH = el.naturalHeight; st.currentSrc = el.currentSrc; if (el.currentSrc) bg.add(el.currentSrc); }
      for (const ps of ['::before', '::after']) { const p2 = getComputedStyle(el, ps); if (p2.content && p2.content !== 'none' && p2.content !== 'normal') { (rec.pseudo ||= {})[ps] = { content: p2.content, display: p2.display, position: p2.position, w: p2.width, h: p2.height, bg: p2.backgroundColor, bgi: p2.backgroundImage.slice(0, 160), color: p2.color, border: p2.border, transform: p2.transform, top: p2.top, left: p2.left, right: p2.right, bottom: p2.bottom, font: p2.font, opacity: p2.opacity, transition: p2.transition, animation: p2.animation }; for (const m of p2.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) bg.add(m[1]); } }
      rec.s = st; out.push(rec);
      for (const ch of el.children) walk(ch, depth + 1);
    };
    walk(document.body, 0);
    const abs = u => { try { return new URL(u, location.href).href; } catch { return u; } };
    for (const el of document.querySelectorAll('img[srcset], source[srcset], picture source')) for (const c of (el.getAttribute('srcset') || '').split(',')) { const u = c.trim().split(/\s+/)[0]; if (u) bg.add(abs(u)); }
    for (const el of document.querySelectorAll('video, video source, audio source')) for (const a of ['src', 'poster', 'data-src']) { const v = el.getAttribute(a); if (v) bg.add(abs(v)); }
    for (const el of document.querySelectorAll('[data-src],[data-bg],[data-background],[data-lazy]')) for (const a of ['data-src', 'data-bg', 'data-background', 'data-lazy']) { const v = el.getAttribute(a); if (v && !/^data:/.test(v)) bg.add(abs(v)); }
    const fonts = [...document.fonts].map(f => ({ family: f.family, weight: f.weight, style: f.style, status: f.status }));
    const anims = document.getAnimations().map(a => { const t = a.effect?.getTiming?.() || {}; return { type: a.constructor.name, name: a.animationName || a.transitionProperty || a.id || '', target: a.effect?.target ? pathOf(a.effect.target) : null, duration: t.duration, delay: t.delay, iterations: t.iterations, easing: t.easing, direction: t.direction, fill: t.fill, playState: a.playState, currentTime: a.currentTime }; });
    const vars = {}; for (const sh of document.styleSheets) { try { for (const rule of sh.cssRules) { if ([':root', 'html', 'body'].includes(rule.selectorText)) for (const p of rule.style) if (p.startsWith('--')) vars[p] = rule.style.getPropertyValue(p).trim(); } } catch {} }
    const g = window.gsap; const STp = window.ScrollTrigger || (g && g.core?.globals?.().ScrollTrigger);
    const libs = {
      gsap: g ? g.version : false, scrollTrigger: STp ? (STp.version || true) : false, pinSpacers: document.querySelectorAll('.pin-spacer').length,
      lenis: !!(window.lenis || window.Lenis || document.documentElement.classList.contains('lenis')), locomotive: !!document.querySelector('[data-scroll-container]'), smoothScrollbar: !!window.Scrollbar,
      swiper: document.querySelectorAll('.swiper, .swiper-container').length, splide: document.querySelectorAll('.splide').length, slick: document.querySelectorAll('.slick-slider').length,
      lottie: !!(window.lottie || window.bodymovin || document.querySelector('lottie-player, [data-lottie], dotlottie-player')), three: !!window.THREE, pixi: !!window.PIXI, barba: !!window.barba, aos: !!window.AOS, wow: !!window.WOW,
      jquery: window.jQuery ? window.jQuery.fn.jquery : false, vue: !!(window.__NUXT__ || window.__VUE__ || document.querySelector('[data-v-app], [data-server-rendered]') || [...document.body.attributes].some(a => a.name.startsWith('data-v-'))), nuxt: !!window.__NUXT__, next: !!window.__NEXT_DATA__, react: !!document.querySelector('[data-reactroot], #__next, #root'),
      shopify: !!window.Shopify, wordpress: !!document.querySelector('link[href*="/wp-content/"], script[src*="/wp-content/"], body[class*="wp-"]'), wix: !!document.querySelector('meta[content*="Wix.com"]'), webflow: !!document.querySelector('html[data-wf-site]'), studio: !!document.querySelector('meta[name="generator"][content*="STUDIO"]'),
      scopedVueAttrs: [...new Set([...document.querySelectorAll('*')].flatMap(e => [...e.attributes].map(a => a.name).filter(n => /^data-v-/.test(n))))].slice(0, 40),
      intersectionObservers: window.__copyIO || [],
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior, bodyOverflow: getComputedStyle(document.body).overflow, htmlOverflow: getComputedStyle(document.documentElement).overflow,
    };
    let scrollTriggers = [];
    try { if (STp?.getAll) scrollTriggers = STp.getAll().map(t => ({ trigger: t.trigger ? pathOf(t.trigger) : null, start: t.start, end: t.end, pin: t.pin ? pathOf(t.pin) : false, scrub: t.vars?.scrub ?? false, markers: !!t.vars?.markers, toggleActions: t.vars?.toggleActions, once: !!t.vars?.once, tweenDuration: t.animation?.duration?.(), targets: (t.animation?.targets?.() || []).slice(0, 6).map(x => x?.nodeType === 1 ? pathOf(x) : String(x)) })); } catch {}
    const videos = [...document.querySelectorAll('video')].map(v => ({ path: pathOf(v), src: v.currentSrc || v.src || [...v.querySelectorAll('source')].map(s => s.src).join(' | '), poster: v.poster, autoplay: v.autoplay, loop: v.loop, muted: v.muted, playsinline: v.playsInline, paused: v.paused, readyState: v.readyState, duration: v.duration, w: v.videoWidth, h: v.videoHeight, rect: [Math.round(v.getBoundingClientRect().x), Math.round(v.getBoundingClientRect().y + scrollY), Math.round(v.getBoundingClientRect().width), Math.round(v.getBoundingClientRect().height)] }));
    const canvases = [...document.querySelectorAll('canvas')].map(c => ({ path: pathOf(c), ctx: [...(c.__ctxTypes || [])], w: c.width, h: c.height, rect: [Math.round(c.getBoundingClientRect().x), Math.round(c.getBoundingClientRect().y + scrollY), Math.round(c.getBoundingClientRect().width), Math.round(c.getBoundingClientRect().height)], position: getComputedStyle(c).position, zIndex: getComputedStyle(c).zIndex }));
    const iframes = [...document.querySelectorAll('iframe')].map(f => ({ path: pathOf(f), src: f.src }));
    const svgInline = document.querySelectorAll('svg').length;
    const root = getComputedStyle(document.documentElement);
    return { title: document.title, lang: document.documentElement.lang, scrollHeight: document.documentElement.scrollHeight, bodyBg: getComputedStyle(document.body).backgroundColor, htmlFont: root.fontSize, bodyFont: getComputedStyle(document.body).font, bodyClass: document.body.className, htmlClass: document.documentElement.className,
      els: out, fonts, anims, vars, libs, scrollTriggers, videos, canvases, iframes, svgInline, assets: [...bg], headHtml: document.head.outerHTML, bodyHtml: document.body.outerHTML };
  }, PATH_FN);
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
