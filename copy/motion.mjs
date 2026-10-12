// /copy stage 6 — motion parity: reference vs rebuild, sampled per animation frame.
//   node <skill>/scripts/motion.mjs --ref <url> --new <url> [--viewport 1440x900] [--to 1200] [--ms 1800]
//        [--watch "sel,sel"] [--load-ms 4000] [--out .scratch/copy-<slug>/motion] [--cookie name=value] [--dismiss "<sel>"]
// Three probes per side, all numeric (no vision):
//   load    — from navigation: per-frame scrollY lock, body/html classes, WAAPI animation count, opacity of
//             the first h1 / [class*=loader|loading|intro], video paused state — the loader / intro timeline
//   scroll  — jump to --to and sample every frame for --ms: measured scrollY (lerp / Lenis curve), transforms
//             + opacity of the watched elements, scroll-driven ScrollTrigger progress if gsap is present
//   inventory — WAAPI animations (name, duration, easing, iterations), ScrollTriggers (start/end/pin/scrub),
//             IntersectionObserver configs, videos, canvases, elements with transition/animation rules
// --watch defaults to the first 6 elements in the first two viewports that carry a non-identity transform
// or an opacity < 1 on the reference (the ones that move), addressed by CSS path on both sides.
// Prints side-by-side picks at 0/100/200/300/500/700/1000/1400 ms and writes motion-{ref,new}.json.
// For a full numeric motion map (GSAP triggers, LoAF, CLS) run BetterPlaywright motion-probe.mjs on both.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { arg, viewports, launch, context, collectErrors, PATH_FN, pad } from './_lib.mjs';

const REF = arg('--ref'); const NEW = arg('--new');
if (!REF || !NEW) { console.error('--ref and --new required'); process.exit(2); }
const [VP] = viewports(arg('--viewport', '1440x900'));
const TO = Number(arg('--to', 1200)); const MS = Number(arg('--ms', 1800)); const LOAD_MS = Number(arg('--load-ms', 4000));
const OUT = arg('--out', '.scratch/copy-motion'); const COOKIE = arg('--cookie', ''); const DISMISS = arg('--dismiss', '');
let WATCH = arg('--watch', '') ? arg('--watch').split(',').map(s => s.trim()).filter(Boolean) : null;
await mkdir(OUT, { recursive: true });
const browser = await launch();
const PICKS = [0, 100, 200, 300, 500, 700, 1000, 1400];
const nearest = (samples, ms) => samples.reduce((a, b) => Math.abs(b.t - ms) < Math.abs(a.t - ms) ? b : a, samples[0]);

async function probe(url, name) {
  const ctx = await context(browser, VP);
  if (COOKIE) { const [n, v] = COOKIE.split('='); await ctx.addCookies([{ name: n, value: v, domain: new URL(url).hostname, path: '/' }]); }
  // load timeline: start sampling before any page script (init script must precede newPage)
  await ctx.addInitScript(() => {
    window.__copyIO = []; const IO = window.IntersectionObserver;
    if (IO) window.IntersectionObserver = class extends IO { constructor(cb, opts) { super(cb, opts); window.__copyIO.push({ rootMargin: opts?.rootMargin || '0px', threshold: opts?.threshold ?? 0 }); } };
    window.__copyLoad = []; const t0 = performance.now();
    const tick = () => { const h1 = document.querySelector('h1'); const ld = document.querySelector('[class*="loader"],[class*="loading"],[class*="intro"],[id*="loader"],[id*="loading"]'); const v = document.querySelector('video');
      window.__copyLoad.push({ t: Math.round(performance.now() - t0), y: scrollY, anims: document.getAnimations ? document.getAnimations().length : -1, h1: h1 ? +getComputedStyle(h1).opacity : null, loader: ld ? { o: +getComputedStyle(ld).opacity, d: getComputedStyle(ld).display, v: getComputedStyle(ld).visibility } : null, video: v ? (v.paused ? 'paused' : 'playing') : null, ov: document.body ? getComputedStyle(document.body).overflow : null, cls: document.documentElement.className + ' / ' + (document.body?.className || '') });
      if (performance.now() - t0 < 12000) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const page = await ctx.newPage(); const errors = collectErrors(page);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForTimeout(LOAD_MS);
  for (const sel of DISMISS.split('|').map(s => s.trim()).filter(Boolean)) await page.click(sel, { timeout: 1500 }).then(() => page.waitForTimeout(500)).catch(() => {});
  const load = await page.evaluate(() => window.__copyLoad);

  const inventory = await page.evaluate((pathSrc) => {
    const pathOf = eval(pathSrc);
    const g = window.gsap; const ST = window.ScrollTrigger || (g && g.core?.globals?.().ScrollTrigger);
    const anims = document.getAnimations().map(a => { const t = a.effect?.getTiming?.() || {}; return { type: a.constructor.name, name: a.animationName || a.transitionProperty || '', target: a.effect?.target ? pathOf(a.effect.target) : null, duration: t.duration, delay: t.delay, iterations: t.iterations, easing: t.easing, playState: a.playState }; });
    let triggers = []; try { if (ST?.getAll) triggers = ST.getAll().map(t => ({ trigger: t.trigger ? pathOf(t.trigger) : null, start: t.start, end: t.end, pin: !!t.pin, scrub: t.vars?.scrub ?? false, progress: t.progress })); } catch {}
    const moving = []; const io = window.__copyIO || [];
    for (const el of document.querySelectorAll('body *')) { if (moving.length >= 6) break; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.top + scrollY > innerHeight * 2) continue; if (/^(script|style|svg|path)$/i.test(el.tagName)) continue; if ((cs.transform !== 'none' && cs.transform !== 'matrix(1, 0, 0, 1, 0, 0)') || +cs.opacity < 1 || (cs.transition !== 'all 0s ease 0s' && cs.transition !== 'none' && /transform|opacity/.test(cs.transition))) moving.push(pathOf(el)); }
    const rules = [...document.querySelectorAll('body *')].filter(el => { const cs = getComputedStyle(el); return cs.animationName !== 'none' || cs.transitionDuration !== '0s'; }).slice(0, 80).map(el => { const cs = getComputedStyle(el); return { path: pathOf(el), animation: cs.animation, transition: cs.transition }; });
    return { libs: { gsap: g ? g.version : false, scrollTrigger: !!ST, lenis: !!(window.lenis || document.documentElement.classList.contains('lenis')), pinSpacers: document.querySelectorAll('.pin-spacer').length, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }, anims, triggers, io, moving, rules, docH: document.documentElement.scrollHeight, videos: [...document.querySelectorAll('video')].map(v => ({ path: pathOf(v), paused: v.paused, t: +v.currentTime.toFixed(2), loop: v.loop, muted: v.muted })), canvases: document.querySelectorAll('canvas').length };
  }, PATH_FN);
  if (!WATCH) WATCH = inventory.moving;

  const scroll = await page.evaluate(([to, ms, watch, pathSrc]) => new Promise(res => {
    const els = watch.map(s => { try { return document.querySelector(s); } catch { return null; } });
    const g = window.gsap; const ST = window.ScrollTrigger || (g && g.core?.globals?.().ScrollTrigger);
    const out = []; const t0 = performance.now();
    window.scrollTo(0, to);
    const tick = () => { const t = performance.now() - t0;
      out.push({ t: Math.round(t), y: Math.round(scrollY), el: els.map(e => { if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { top: Math.round(r.top), tf: cs.transform === 'none' ? 'none' : cs.transform.replace(/matrix(3d)?\(/, '').replace(')', '').split(',').map(n => +(+n).toFixed(2)).join(','), o: +(+cs.opacity).toFixed(3) }; }), st: ST?.getAll ? ST.getAll().slice(0, 8).map(x => +x.progress.toFixed(3)) : undefined });
      if (t < ms) requestAnimationFrame(tick); else res(out); };
    requestAnimationFrame(tick);
  }), [TO, MS, WATCH, PATH_FN]);
  await ctx.close();
  const data = { url, viewport: VP, to: TO, watch: WATCH, load, inventory, scroll, errors };
  await writeFile(join(OUT, `motion-${name}.json`), JSON.stringify(data, null, 1));
  return data;
}

const a = await probe(REF, 'ref'); const b = await probe(NEW, 'new');
await browser.close();

const fmtEl = e => e ? `${e.top}|${e.o}${e.tf !== 'none' ? '|' + e.tf.split(',').slice(-2).join(',') : ''}` : '-';
console.log(`\nlibs  ref ${JSON.stringify(a.inventory.libs)}\n      new ${JSON.stringify(b.inventory.libs)}`);
console.log(`WAAPI animations ref ${a.inventory.anims.length} / new ${b.inventory.anims.length};  ScrollTriggers ref ${a.inventory.triggers.length} / new ${b.inventory.triggers.length};  IO configs ref ${a.inventory.io.length} / new ${b.inventory.io.length};  transition/animation rules ref ${a.inventory.rules.length} / new ${b.inventory.rules.length};  videos ref ${a.inventory.videos.length} / new ${b.inventory.videos.length};  canvases ref ${a.inventory.canvases} / new ${b.inventory.canvases};  console errors ref ${a.errors.length} / new ${b.errors.length}`);
console.log(`\nLOAD (ms: scrollY / anims / h1 opacity / loader / video / body overflow)`);
for (const ms of [0, 300, 700, 1200, 2000, 3000, LOAD_MS - 100]) { const x = nearest(a.load, ms), y = nearest(b.load, ms); const f = s => s ? `${s.y}/${s.anims}/${s.h1 ?? '-'}/${s.loader ? s.loader.o + ':' + s.loader.d : '-'}/${s.video ?? '-'}/${s.ov}` : '-'; console.log(pad(ms, 6), pad('ref ' + f(x), 44), 'new ' + f(y)); }
console.log(`\nSCROLL to ${TO} (ms: scrollY | watched: viewportTop|opacity|translate)  watching ${WATCH.length}: ${WATCH.map(s => s.slice(-40)).join(' ; ')}`);
for (const ms of PICKS) { const x = nearest(a.scroll, ms), y = nearest(b.scroll, ms); console.log(pad(ms, 6), pad('ref ' + x.y + ' ' + x.el.map(fmtEl).join(' '), 70), 'new ' + y.y + ' ' + y.el.map(fmtEl).join(' ')); }
const settle = s => { const last = s.at(-1)?.y; const i = s.findIndex(p => Math.abs(p.y - last) <= 1); return s[i]?.t; };
console.log(`\nscroll settle: ref ${settle(a.scroll)} ms (${a.scroll.length} frames), new ${settle(b.scroll)} ms (${b.scroll.length} frames)   -> motion-ref.json / motion-new.json in ${OUT}`);
