// /copy stage 6 — the load-time opening and a scrub catch-up, sampled every 20 ms on the reference and the
// rebuild, aligned on each page's own `load` event (motion.mjs samples at 100 ms and only watches h1 opacity).
//   node <skill>/scripts/opening.mjs --ref <url> --new <url> [--sel ".hero__layer"] [--sel2 ".hero__word"] [--scroll 300] [--ms 3000]
// Prints: first frame the watched element moves, the frame it settles, the second element's start/end, a table
// at fixed offsets, and the transform curve of the watched element for 450 ms after a scrollTo(--scroll).
// Written for greenpark-santo (2026-09-12): a 40 ms late start showed up here that motion.mjs could not see.
import { arg, need } from './_lib.mjs';
const { chromium } = need('playwright'); // resolve from the cwd (homepage/), like every other copy script: a bare import resolves from the skill folder's real path and fails

const REF = arg('--ref'), NEW = arg('--new'); const SEL = arg('--sel', '.lcl-hero__layer'), SEL2 = arg('--sel2', '.lcl-hero__en');
const SCROLL = Number(arg('--scroll', 300)), MS = Number(arg('--ms', 3000));
if (!REF || !NEW) { console.error('usage: opening.mjs --ref <url> --new <url> [--sel] [--sel2] [--scroll] [--ms]'); process.exit(2); }
const b = await chromium.launch({ args: ['--use-angle=d3d11'] });
const run = async (url) => {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  const rows = await p.evaluate(([SEL, SEL2, SCROLL, MS]) => new Promise((res) => {
    const out = []; let loadAt = document.readyState === 'complete' ? performance.now() : null;
    window.addEventListener('load', () => { loadAt = performance.now(); });
    const A = document.querySelector(SEL), B = document.querySelector(SEL2);
    const tf = (el) => { if (!el) return null; const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/); return m ? m[1].split(',').map(Number) : null; };
    const n = Math.round(MS / 20), extra = 22;
    const sample = () => {
      const a = tf(A), e = tf(B);
      out.push({ t: loadAt ? Math.round(performance.now() - loadAt) : -1, s: a ? +a[0].toFixed(3) : 1, op: A ? +getComputedStyle(A).opacity : 1, en: B ? +getComputedStyle(B).opacity : 1, eny: e ? +e[5].toFixed(1) : null, y: window.scrollY, ly: a ? +a[5].toFixed(2) : 0 });
      if (out.length === n) window.scrollTo(0, SCROLL);
      if (out.length < n + extra) setTimeout(sample, 20); else res(out);
    };
    sample();
  }), [SEL, SEL2, SCROLL, MS]);
  await p.close(); return rows.filter((r) => r.t >= 0);
};
const A = await run(REF), B = await run(NEW);
const at = (rows, t) => rows.reduce((best, r) => (Math.abs(r.t - t) < Math.abs(best.t - t) ? r : best), rows[0]);
const first = (rows, f) => rows.find(f)?.t;
console.log(`${SEL}: first move        ref ${first(A, (r) => r.s !== 1 || r.op < 1)}  new ${first(B, (r) => r.s !== 1 || r.op < 1)}`);
console.log(`${SEL}: settled (scale=1) ref ${first(A, (r) => r.t > 300 && Math.abs(r.s - 1) < 0.006 && r.op >= 0.99)}  new ${first(B, (r) => r.t > 300 && Math.abs(r.s - 1) < 0.006 && r.op >= 0.99)}`);
console.log(`${SEL2}: first > 0        ref ${first(A, (r) => r.en > 0)}  new ${first(B, (r) => r.en > 0)}`);
console.log(`${SEL2}: reaches 1        ref ${first(A, (r) => r.en >= 0.995)}  new ${first(B, (r) => r.en >= 0.995)}`);
console.log('   ms | ref t scale op en y | new t scale op en y');
for (const t of [400, 600, 800, 1000, 1200, 1500, 1800, 2200, 2400, 2600, 2800]) { const a = at(A, t), c = at(B, t); console.log(String(t).padStart(5), '|', a.t, a.s, a.op, a.en, a.eny, '|', c.t, c.s, c.op, c.en, c.eny); }
console.log(`-- ${SEL} translateY after scrollTo(${SCROLL}) (ref | new), ms after the scroll`);
const sA = A.findIndex((r) => r.y === SCROLL), sB = B.findIndex((r) => r.y === SCROLL);
for (let i = 0; i < 22; i++) { const a = A[sA + i], c = B[sB + i]; if (!a || !c) break; console.log(String(a.t - A[sA].t).padStart(4), a.ly, '|', String(c.t - B[sB].t).padStart(4), c.ly); }
await b.close();
