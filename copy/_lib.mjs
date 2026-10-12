// Shared helpers for the /copy skill scripts. Run every script from a folder that has
// playwright in node_modules (translation/homepage/ or scrape-context/): modules are resolved
// from process.cwd(), not from the skill folder.
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

export const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
export const flag = k => process.argv.includes(k);
export const viewports = s => s.split(',').map(v => v.trim().split('x').map(Number)).filter(v => v.length === 2 && v.every(Number.isFinite));

const req = createRequire(pathToFileURL(join(process.cwd(), '__copy_skill__.js')).href);
export function need(mod) {
  try { return req(mod); }
  catch { throw new Error(`cannot resolve "${mod}" from ${process.cwd()} — run from translation/homepage/ (npm install there) or scrape-context/`); }
}
export function optional(mod) { try { return req(mod); } catch { return null; } }

export const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

// Real GPU (d3d11) so WebGL / heavy tweens run at the reference's own frame rate — SwiftShader
// stretches every animation and makes timing comparisons meaningless (izanami v3 lesson).
export async function launch() {
  const { chromium } = need('playwright');
  const channel = process.env.NBRET_BROWSER_CHANNEL || (existsSync(chromium.executablePath()) ? undefined : 'chrome');
  const args = process.platform === 'win32' ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] : [];
  return chromium.launch({ headless: true, channel, args });
}

export async function context(browser, [vw, vh], extra = {}) {
  return browser.newContext({ viewport: { width: vw, height: vh }, isMobile: vw < 800, hasTouch: vw < 800, locale: 'ja-JP', deviceScaleFactor: 1, userAgent: UA, ...extra });
}

export function collectErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)); });
  return errors;
}

export async function open(page, url, { wait = 2500, dismiss = '' } = {}) {
  // DOM first, then give `load` 20 s: a slow sub-resource (am-stram-gram.jp, 2026-09-22) must not stop the run
  // network-level failures (net::ERR_TIMED_OUT, ERR_CONNECTION_RESET…) get two retries: a busy origin refused the
  // first navigation of /reference's subject probe once and answered the second (minanogawa.jp, 2026-09-23)
  for (let attempt = 0; ; attempt++) {
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 }); break; }
    catch (e) { if (attempt >= 2 || !/net::ERR_/.test(String(e))) throw e; await page.waitForTimeout(3000 * (attempt + 1)); }
  }
  await page.waitForLoadState('load', { timeout: 20_000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(wait);
  for (const sel of dismiss.split('|').map(s => s.trim()).filter(Boolean)) {
    await page.click(sel, { timeout: 1500 }).then(() => page.waitForTimeout(500)).catch(() => {});
  }
}

// Slow pass to the bottom and back so lazy media, IntersectionObserver reveals and scroll-linked
// rules all fire before we measure anything.
export async function scrollThrough(page, vh, { step = Math.round(vh / 3), dwell = 120, back = true } = {}) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total + vh; y += step) { await page.evaluate(yy => window.scrollTo(0, yy), y); await page.waitForTimeout(dwell); }
  await page.waitForTimeout(1200);
  if (back) { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1000); }
  return total;
}

// Brace-balanced index of every @-block in a stylesheet: [{header, start, end}]
export function atRuleIndex(text) {
  const blocks = []; const stack = []; let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") { const q = ch; i++; while (i < text.length && text[i] !== q) { if (text[i] === '\\') i++; i++; } i++; continue; }
    if (ch === '/' && text[i + 1] === '*') { const e = text.indexOf('*/', i + 2); i = e < 0 ? text.length : e + 2; continue; }
    if (ch === '@') {
      const b = text.indexOf('{', i); const s = text.indexOf(';', i);
      if (b > -1 && (s < 0 || b < s)) { stack.push({ header: text.slice(i, b).trim(), start: i, bodyStart: b }); i = b + 1; continue; }
      i = s > -1 ? s + 1 : text.length; continue;
    }
    if (ch === '{') { stack.push(null); i++; continue; }
    if (ch === '}') { const top = stack.pop(); if (top) blocks.push({ header: top.header, start: top.start, end: i + 1 }); i++; continue; }
    i++;
  }
  return blocks;
}

// Runs in the page: a short unique-ish CSS path for an element (id, else nth-of-type chain).
export const PATH_FN = `(el) => {
  const parts = [];
  while (el && el.nodeType === 1 && el !== document.documentElement) {
    if (el.id && !/^[0-9]|[^\\w-]/.test(el.id)) { parts.unshift('#' + CSS.escape(el.id)); break; }
    let s = el.tagName.toLowerCase();
    const p = el.parentElement;
    if (p) { const same = [...p.children].filter(c => c.tagName === el.tagName); if (same.length > 1) s += ':nth-of-type(' + (same.indexOf(el) + 1) + ')'; }
    parts.unshift(s); el = p;
  }
  return parts.join(' > ');
}`;

export const pad = (s, n) => String(s).padEnd(n);

// Render the used ranges of one stylesheet as CSS, restoring the enclosing @media/@supports/@layer
// headers and appending @font-face/@keyframes whole (coverage never marks them used). Chrome also
// reports a range for each @media rule itself ("(max-width:768px){" — no closing brace); such
// unbalanced ranges are skipped, otherwise the parser gives up a few rules in.
export function renderUsedCss(text, label, ranges) {
  const blocks = atRuleIndex(text);
  const balanced = t => { let n = 0; for (const ch of t) { if (ch === '{') n++; else if (ch === '}') n--; } return n === 0 && t.includes('{'); };
  const rs = ranges.filter(([s, e]) => { const t = text.slice(s, e); return balanced(t) && !/^@(font-face|keyframes|-webkit-keyframes)/.test(t.trim()); }).sort((a, b) => a[0] - b[0]);
  const NL = String.fromCharCode(10);
  let out = NL + '/* ===== ' + label + ' (' + rs.length + ' rules) ===== */' + NL; let lastCtx = '';
  for (const [s, e] of rs) {
    const enclosing = blocks.filter(b => b.start < s && b.end > e && !/^@font-face|^@keyframes|^@-webkit-keyframes/.test(b.header)).map(b => b.header).join(' ');
    if (enclosing !== lastCtx) { out += (lastCtx ? '}' + NL : '') + (enclosing ? enclosing + ' {' + NL : ''); lastCtx = enclosing; }
    out += text.slice(s, e).trim() + NL;
  }
  if (lastCtx) out += '}' + NL;
  for (const b of blocks.filter(b => /^@font-face|^@keyframes|^@-webkit-keyframes/.test(b.header))) out += text.slice(b.start, b.end) + NL;
  return { css: out, count: rs.length };
}
