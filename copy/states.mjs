// /copy stage 6 — interaction states on reference vs rebuild from ONE step list, one browser call.
//   node <skill>/scripts/states.mjs --ref <url> --new <url> --steps "<step>;<step>;…" [--viewport 1440x900]
//        [--out .scratch/copy-<slug>/states] [--cookie name=value] [--dismiss "<sel>"] [--wait 2500]
// Steps (semicolon-separated):
//   hover:<sel>   click:<sel>   key:<Key>   scroll:<y>   wait:<ms>   move:<x>,<y>   type:<sel>=<text>
//   shot:<name>   — screenshot both sides as <name>-{ref,new}.png
//   eval:<name>=<js expression>  — record a value on both sides (e.g. eval:theme=document.body.dataset.theme)
//   css:<name>=<sel>|<prop>      — record a computed style on both sides
// Example: --steps "hover:header nav li:nth-child(1) > a;wait:700;shot:dropdown;move:700,600;click:.menu-btn;wait:900;shot:menu;key:Escape;scroll:2000;wait:1500;shot:mid"
// Prints a table of recorded values (mismatches flagged) and pair images if sharp is available.
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { arg, viewports, launch, context, collectErrors, open, optional, pad } from './_lib.mjs';

const REF = arg('--ref'); const NEW = arg('--new'); const STEPS = arg('--steps', '');
if (!REF || !NEW || !STEPS) { console.error('--ref, --new and --steps required'); process.exit(2); }
const [VP] = viewports(arg('--viewport', '1440x900'));
const OUT = arg('--out', '.scratch/copy-states'); const COOKIE = arg('--cookie', ''); const DISMISS = arg('--dismiss', ''); const WAIT = Number(arg('--wait', 2500));
await mkdir(OUT, { recursive: true });
const sharp = optional('sharp');
const browser = await launch();
const steps = STEPS.split(';').map(s => s.trim()).filter(Boolean).map(s => { const i = s.indexOf(':'); return [s.slice(0, i), s.slice(i + 1)]; });

async function run(url, name) {
  const ctx = await context(browser, VP);
  if (COOKIE) { const [n, v] = COOKIE.split('='); await ctx.addCookies([{ name: n, value: v, domain: new URL(url).hostname, path: '/' }]); }
  const page = await ctx.newPage(); const errors = collectErrors(page);
  await open(page, url, { wait: WAIT, dismiss: DISMISS });
  const values = {}; const shots = [];
  for (const [op, v] of steps) {
    try {
      if (op === 'hover') await page.hover(v, { timeout: 3000 });
      else if (op === 'click') await page.click(v, { timeout: 3000 });
      else if (op === 'key') await page.keyboard.press(v);
      else if (op === 'scroll') { await page.evaluate(y => window.scrollTo(0, y), Number(v)); }
      else if (op === 'wait') await page.waitForTimeout(Number(v));
      else if (op === 'move') { const [x, y] = v.split(',').map(Number); await page.mouse.move(x, y); }
      else if (op === 'type') { const i = v.indexOf('='); await page.fill(v.slice(0, i), v.slice(i + 1), { timeout: 3000 }); }
      else if (op === 'shot') { const f = join(OUT, `${v}-${name}.png`); await page.screenshot({ path: f }); shots.push([v, f]); }
      else if (op === 'eval') { const i = v.indexOf('='); values[v.slice(0, i)] = String(await page.evaluate(v.slice(i + 1))); }
      else if (op === 'css') { const i = v.indexOf('='); const [sel, prop] = v.slice(i + 1).split('|'); values[v.slice(0, i)] = await page.evaluate(([s, p]) => { const el = document.querySelector(s); return el ? getComputedStyle(el).getPropertyValue(p) : 'MISSING'; }, [sel, prop]); }
      else console.log('unknown step', op);
    } catch (e) { values[`${op}:${v}`] = 'STEP FAILED ' + e.message.split('\n')[0].slice(0, 80); }
  }
  values.__docH = String(await page.evaluate(() => document.documentElement.scrollHeight));
  values.__errors = String(errors.length);
  await ctx.close();
  return { values, shots, errors };
}

const a = await run(REF, 'ref'); const b = await run(NEW, 'new');
await browser.close();
let mismatch = 0;
for (const k of new Set([...Object.keys(a.values), ...Object.keys(b.values)])) { const x = a.values[k], y = b.values[k]; const bad = x !== y; if (bad) mismatch++; console.log(pad(k, 28), pad(String(x).slice(0, 50), 52), pad(String(y).slice(0, 50), 52), bad ? '<<<' : ''); }
if (sharp) {
  await mkdir(join(OUT, 'pairs'), { recursive: true });
  for (const [label, rf] of a.shots) { const nf = b.shots.find(s => s[0] === label)?.[1]; if (!nf) continue; const scale = VP[0] > 800 ? 0.5 : 0.75; const rb = await sharp(rf).resize({ width: Math.round(VP[0] * scale) }).toBuffer(); const nb = await sharp(nf).resize({ width: Math.round(VP[0] * scale) }).toBuffer(); const m = await sharp(rb).metadata(); await sharp({ create: { width: m.width * 2 + 8, height: m.height, channels: 3, background: '#ff00ff' } }).composite([{ input: rb, left: 0, top: 0 }, { input: nb, left: m.width + 8, top: 0 }]).png().toFile(join(OUT, 'pairs', `${label}.png`)); }
}
if (a.errors.length || b.errors.length) console.log('\nconsole/page errors  ref:', a.errors.slice(0, 5), ' new:', b.errors.slice(0, 5));
console.log(`\n${a.shots.length} shots each${sharp ? ' + pairs/' : ''} in ${OUT}; ${mismatch} value mismatches`);
process.exit(mismatch ? 1 : 0);
