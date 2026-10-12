// /copy stage 6 — geometry parity: reference vs rebuild, both widths.
//   node <skill>/scripts/geo.mjs --ref <url> --new <url> [--viewports 1440x900,390x844] [--sels "a,b,c"]
//        [--ys 0,900,1800] [--out .scratch/copy-<slug>/geo] [--tol 2] [--wait 2500] [--cookie name=value]
//        [--dismiss "<sel>"] [--no-shots]
// Landmarks: --sels, else auto — every header/nav/main/section/article/footer/h1/h2/h3/video/canvas plus
// elements with an id (first 140), addressed by a CSS path computed on the reference and queried on both.
// Prints docH + a per-landmark table (rect delta > tol flagged <<<, font mismatch noted), writes geo.json,
// and screenshots at fixed scroll offsets (--ys, default 8 evenly spaced) for both sides, plus ref|new
// pair images if sharp is available. Exit 1 when docH differs by more than --tol or a landmark is missing.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { arg, flag, viewports, launch, context, collectErrors, open, scrollThrough, PATH_FN, optional, pad } from './_lib.mjs';

const REF = arg('--ref'); const NEW = arg('--new');
if (!REF || !NEW) { console.error('--ref and --new required'); process.exit(2); }
const VPS = viewports(arg('--viewports', '1440x900,390x844'));
const SELS = arg('--sels', '') ? arg('--sels').split(',').map(s => s.trim()).filter(Boolean) : null;
const OUT = arg('--out', '.scratch/copy-geo'); const TOL = Number(arg('--tol', 2)); const WAIT = Number(arg('--wait', 2500));
const COOKIE = arg('--cookie', ''); const DISMISS = arg('--dismiss', ''); const SHOTS = !flag('--no-shots');
const YS = arg('--ys', '') ? arg('--ys').split(',').map(Number) : null;
// --ua iphone | android | "<string>": sites that pick their viewport meta by user agent render a different
// layout for real phones (greenpark-santo, femyou); run once desktop-UA (the default) and once --ua iphone
const UA_PRESET = { iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36' };
const UAX = arg('--ua', ''); const UA_EXTRA = UAX ? { userAgent: UA_PRESET[UAX] || UAX } : {};
await mkdir(OUT, { recursive: true });
const sharp = optional('sharp');
const browser = await launch();
let failed = false; const report = {};

async function measure(url, [vw, vh], sels, name) {
  const ctx = await context(browser, [vw, vh], UA_EXTRA);
  if (COOKIE) { const [n, v] = COOKIE.split('='); await ctx.addCookies([{ name: n, value: v, domain: new URL(url).hostname, path: '/' }]); }
  const page = await ctx.newPage(); const errors = collectErrors(page);
  await open(page, url, { wait: WAIT, dismiss: DISMISS });
  await scrollThrough(page, vh, { dwell: 60 });
  const r = await page.evaluate(([sels, pathSrc]) => {
    const pathOf = eval(pathSrc);
    let list = sels;
    if (!list) {
      const picked = [...document.querySelectorAll('header, nav, main, section, article, footer, h1, h2, h3, video, canvas, [id]')].filter(e => !/^(script|style|link|meta|svg|path)$/i.test(e.tagName));
      list = [...new Set(picked.slice(0, 140).map(pathOf))];
    }
    const o = {};
    for (const s of list) { let el = null; try { el = document.querySelector(s); } catch {} if (!el) { o[s] = null; continue; } const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); o[s] = { r: [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)], fs: cs.fontSize, ff: cs.fontFamily.split(',')[0].replace(/"/g, ''), lh: cs.lineHeight, ls: cs.letterSpacing, pos: cs.position }; }
    return { sels: list, o, docH: document.documentElement.scrollHeight };
  }, [sels, PATH_FN]);
  const shots = [];
  if (SHOTS) {
    const ys = YS || Array.from({ length: 8 }, (_, i) => Math.round(i * Math.max(0, r.docH - vh) / 7));
    for (const y of ys) { await page.evaluate(yy => window.scrollTo(0, yy), y); await page.waitForTimeout(1500); const f = join(OUT, `${vw}-${String(y).padStart(5, '0')}-${name}.png`); await page.screenshot({ path: f }); shots.push([y, f]); }
  }
  await ctx.close();
  return { ...r, errors, shots };
}

for (const vp of VPS) {
  const [vw] = vp;
  const a = await measure(REF, vp, SELS, 'ref');
  const b = await measure(NEW, vp, a.sels, 'new');
  const dh = b.docH - a.docH;
  console.log(`\n===== ${vw}  docH ref ${a.docH}  new ${b.docH}  (${dh >= 0 ? '+' : ''}${dh})   console errors ref ${a.errors.length} / new ${b.errors.length}`);
  if (Math.abs(dh) > TOL) failed = true;
  const rows = [];
  for (const s of a.sels) {
    const x = a.o[s], y = b.o[s]; if (!x && !y) continue;
    const d = x && y ? x.r.map((v, k) => y.r[k] - v) : null;
    const missing = !x || !y; if (missing && x) failed = true;
    const off = d && d.some(v => Math.abs(v) > TOL);
    const font = x && y && (x.fs !== y.fs || x.ff !== y.ff) ? `font ${x.fs}/${x.ff} vs ${y.fs}/${y.ff}` : '';
    rows.push({ sel: s, ref: x?.r || null, new: y?.r || null, delta: d, off, missing, font });
    console.log(pad(s.slice(0, 64), 66), pad(x ? JSON.stringify(x.r) : '-', 24), pad(y ? JSON.stringify(y.r) : '-', 24), missing ? 'MISSING' : off ? '<<< ' + JSON.stringify(d) : '', font);
  }
  report[vw] = { docH: { ref: a.docH, new: b.docH }, rows, errors: { ref: a.errors, new: b.errors } };
  if (sharp && SHOTS) {
    await mkdir(join(OUT, 'pairs'), { recursive: true });
    for (let i = 0; i < a.shots.length; i++) {
      const scale = vw > 800 ? 0.5 : 0.75; const [y, rf] = a.shots[i]; const nf = b.shots[i]?.[1]; if (!nf) continue;
      const rb = await sharp(rf).resize({ width: Math.round(vw * scale) }).toBuffer(); const nb = await sharp(nf).resize({ width: Math.round(vw * scale) }).toBuffer();
      // the two shots differ in height when the pages do (the last scroll stop clips differently);
      // the canvas takes the taller, or sharp refuses the composite and the report is lost (2026-09-22)
      const m = await sharp(rb).metadata(); const mn = await sharp(nb).metadata();
      await sharp({ create: { width: m.width * 2 + 8, height: Math.max(m.height, mn.height), channels: 3, background: '#ff00ff' } }).composite([{ input: rb, left: 0, top: 0 }, { input: nb, left: m.width + 8, top: 0 }]).png().toFile(join(OUT, 'pairs', `${vw}-${String(y).padStart(5, '0')}.png`));
    }
  }
}
await browser.close();
await writeFile(join(OUT, 'geo.json'), JSON.stringify({ ref: REF, new: NEW, date: new Date().toISOString(), tol: TOL, report }, null, 1));
console.log(`\ngeo.json -> ${OUT}${sharp && SHOTS ? '  (pairs/ = ref|new side by side)' : ''}  ${failed ? 'FAIL' : 'PASS'} (tol ${TOL}px)`);
process.exit(failed ? 1 : 0);
