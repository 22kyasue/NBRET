#!/usr/bin/env node
// snapshot.mjs — export a running serve.mjs layer as a static tree under a path prefix.
//
//   node scripts/mirror/snapshot.mjs --from http://localhost:8800 --out public/TCS-demo --prefix /TCS-demo \
//        --routes /en/florence/,/en/florence/menu/ --posts references/<mirror>/posts.json --feedback-site TCS-demo
//
// What it does: drives every route in a real browser (desktop + phone, scrolled to the end, class
// list hovered, burger opened) and records each same-origin request the page makes, follows
// internal links under the first route's section, then fetches every URL through serve.mjs (so
// the inject, overrides, text-replace and POST replay all apply) and writes the bodies under
// --out. Text bodies are rewritten for the prefix: the serve origin becomes the prefix (plain,
// JSON-escaped and Nuxt-payload spellings), root-absolute asset paths get the prefix, the Nuxt
// router base and webpack publicPath are set to it, and query-string variants (Typekit glyph
// chunks) get unique file names. Every HTML document gets the private posture (noindex), the
// feedback layer (meta on + loader), and <meta name="tcs-base"> for the layer's own full loads.
// Recorded CMS POST responses are replayed through serve.mjs and saved as __posts/<sha1>.json for
// the Pages Function at functions/<prefix>/api.php.js to answer.
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const FROM = arg('--from', 'http://localhost:8800').replace(/\/$/, '');
const OUT = arg('--out'); const PREFIX = arg('--prefix', '').replace(/\/$/, '');
const ROUTES = (arg('--routes', '/') || '').split(',').filter(Boolean);
const POSTS_FILE = arg('--posts'); const FB_SITE = arg('--feedback-site'); const FB_VER = arg('--feedback-version', '9');
const MAX_ROUTES = +arg('--max-routes', 80);
// --meta name=value (repeatable): the content of every SSR <meta name|property="name"> in each HTML.
// The layer scrubs the head at runtime, but a link unfurl (LINE, Slack, iMessage) reads the raw
// document — the export carried the source site's description and og:title (link audit, 2026-09-03).
const METAS = process.argv.flatMap((a, i) => a === '--meta' ? [process.argv[i + 1]] : []).map((s) => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1)]; });
// --strip /en/florence: the address bar drops the app's own route prefix (Kensei, 2026-09-03: no
// "/florence" in the link). The router keeps running its real routes — the data calls are keyed to
// them — so every HTML is also written at the pretty path, and a script at the top of head hands
// the router the internal URL before it boots (and on back/forward), then shows the pretty one and
// re-labels the rendered hrefs after each route change. The layer's PATH() asks the router, not
// the address bar.
const STRIP = (arg('--strip', '') || '').replace(/\/$/, '');
const prettyPath = (rel) => { const r0 = rel.startsWith('/') ? rel : '/' + rel; if (!STRIP || !r0.startsWith(STRIP + '/')) return null; return r0.slice(STRIP.length); }; // '/en/florence/menu/index.html' -> '/menu/index.html'
const PRETTY_SCRIPT = (P, S) => `<script>(function(){var B=${JSON.stringify(P)},S=${JSON.stringify(S)},L=location,H=history;
function internal(p){if(p.indexOf(B+S)===0)return p;if(p===B||p===B+'/')return B+S+'/';return B+S+p.slice(B.length);}
function pretty(p){if(p.indexOf(B+S)!==0)return p;var r=p.slice((B+S).length);return B+(r||'/');}
function toInternal(){if(L.pathname.indexOf(B+S)!==0&&(L.pathname===B||L.pathname.indexOf(B+'/')===0))H.replaceState(H.state,'',internal(L.pathname)+L.search+L.hash);}
toInternal();
window.addEventListener('popstate',toInternal,true);
function fix(a){var h=a.getAttribute('href');if(!h)return;if(h.indexOf(S+'/')===0||h===S)h=B+h;if(h.indexOf(B+S)!==0)return;var p=pretty(h);if(p!==a.getAttribute('href'))a.setAttribute('href',p);}
function show(){if(L.pathname.indexOf(B+S)===0)H.replaceState(H.state,'',pretty(L.pathname)+L.search+L.hash);
var as=document.querySelectorAll('a[href^="'+B+S+'"],a[href^="'+S+'/"],a[href="'+S+'"]');for(var i=0;i<as.length;i++)fix(as[i]);}
function arm(){var n=window.$nuxt;if(!n||!n.$router)return setTimeout(arm,60);n.$router.afterEach(function(){setTimeout(show,0);setTimeout(show,300);setTimeout(show,1200);});show();setTimeout(show,800);setTimeout(show,2500);
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var r=ms[i],t=r.target;if(r.type==='attributes'){if(t&&t.tagName==='A')fix(t);continue;}for(var k=0;k<r.addedNodes.length;k++){var n=r.addedNodes[k];if(n.nodeType!==1)continue;if(n.tagName==='A')fix(n);var as=n.querySelectorAll?n.querySelectorAll('a[href]'):[];for(var j=0;j<as.length;j++)fix(as[j]);}}}).observe(document.body,{attributes:true,attributeFilter:['href'],childList:true,subtree:true});}
arm();})();</script>`;
if (!OUT) { console.error('need --out'); process.exit(1); }
const section = ROUTES[0].replace(/\/$/, ''); // e.g. /en/florence — links under it are followed
const SKIP_LINK = /\/(shop\/[^/]+|cart|checkout|search|contact-giardino|giardino\/experiences(\/.*)?|giardino\/menu\/(?!breakfast\/?$)[^/]+)\/?$/;
// cross-origin assets served from /__ext/<host>/: only the hosts the page needs offline
const KEEP_EXT = new Set((arg('--keep-ext', 'use.typekit.net,p.typekit.net,backend.gucciosteria.com') || '').split(',').filter(Boolean));

// ---- 1. crawl: what does each route actually load? ----
const urls = new Map(); // url (no hash) -> content-type
const routes = [...ROUTES]; const seen = new Set(routes);
const b = await chromium.launch();
async function visit(route, width) {
  const ctx = await b.newContext({ viewport: { width, height: width < 600 ? 844 : 900 } });
  const p = await ctx.newPage();
  p.on('response', (r) => {
    const u = r.url(); const req = r.request();
    if (!u.startsWith(FROM + '/') || req.method() !== 'GET' || r.status() !== 200) return;
    const ext = /^\/__ext\/([^/]+)/.exec(new URL(u).pathname); if (ext && !KEEP_EXT.has(ext[1])) return;
    if (!urls.has(u)) urls.set(u, r.headers()['content-type'] || '');
  });
  await p.goto(FROM + route, { waitUntil: 'load' }); await p.waitForTimeout(2500);
  for (let i = 0; i < 24; i++) { await p.mouse.wheel(0, 600); await p.waitForTimeout(140); }
  await p.waitForTimeout(800);
  for (let i = 0; i < 24; i++) { await p.mouse.wheel(0, -600); await p.waitForTimeout(40); }
  if (width >= 600) {
    for (const sel of ['.navigator__list--left > .navigator-item:nth-child(1) .navigator-item__link', '.discover-menu__list__item', '.product-list__item', '.location__item']) {
      const els = await p.$$(sel); for (const el of els.slice(0, 6)) { try { await el.hover({ timeout: 800 }); await p.waitForTimeout(250); } catch {} }
    }
  } else {
    const burger = await p.$('[class*="burger"]'); if (burger) { try { await burger.click({ timeout: 1000 }); await p.waitForTimeout(1200); } catch {} }
  }
  // internal links under the section, one level of discovery
  const links = await p.evaluate((from) => [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => h.startsWith(from)), FROM);
  for (const h of links) {
    const path = new URL(h).pathname.replace(/\/?$/, '/');
    if (!path.startsWith(section + '/') || SKIP_LINK.test(path) || seen.has(path) || routes.length >= MAX_ROUTES) continue;
    seen.add(path); routes.push(path);
  }
  await ctx.close();
}
for (let i = 0; i < routes.length; i++) {
  const r = routes[i]; process.stdout.write(`crawl ${i + 1}/${routes.length} ${r}\n`);
  await visit(r, 1440); await visit(r, 390);
}
await b.close();
for (const r of routes) if (!urls.has(FROM + r)) urls.set(FROM + r, 'text/html');

// ---- 2. names: pathname, query variants get __q<hash> before the extension ----
const isText = (ct) => /^(text\/|application\/(javascript|x-javascript|json|xml|manifest\+json)|image\/svg)/.test(ct);
const nameFor = (u, ct) => {
  const x = new URL(u); let path = decodeURIComponent(x.pathname);
  if (/^text\/html/.test(ct)) return path.endsWith('/') ? path + 'index.html' : (extname(path) ? path : path + '/index.html');
  const guess = /javascript/.test(ct) ? '.js' : /css/.test(ct) ? '.css' : /woff2/.test(ct) ? '.woff2' : /woff/.test(ct) ? '.woff' : /json/.test(ct) ? '.json' : /image\/png/.test(ct) ? '.png' : /image\/jpeg/.test(ct) ? '.jpg' : /image\/webp/.test(ct) ? '.webp' : /image\/svg/.test(ct) ? '.svg' : '';
  // an override served under a foreign extension (the PNG wordmark at logo.svg): static hosting
  // types by extension, so the file takes the extension its bytes deserve
  { const ext = extname(path).toLowerCase(); if (guess && ext && !(x.search && x.search !== '?') && ext !== guess && !(ext === '.jpeg' && guess === '.jpg') && ext !== '.ico') path = path.slice(0, -ext.length) + '__c' + guess; }
  if (x.search && x.search !== '?') { const ext = extname(path); const h = createHash('sha1').update(x.search).digest('hex').slice(0, 8); path = ext ? path.slice(0, -ext.length) + '__q' + h + ext : path + '__q' + h; } // no guessed extension here: the Typekit function rebuilds this name from the live request
  else if (!extname(path)) path = path.replace(/\/$/, '') + '__f' + guess; // a file that would otherwise collide with a directory of the same name
  return path;
};
const escapes = (s) => [s, s.replace(/\//g, '\\/'), s.replace(/\//g, '\\u002F')];
const renames = []; // [fromUrl, toPath] for every URL whose file name differs from its path
for (const [u, ct] of urls) { const x = new URL(u); if (/^text\/html/.test(ct)) continue; const name = nameFor(u, ct); if (name !== decodeURIComponent(x.pathname)) { renames.push([u, PREFIX + name]); renames.push([decodeURIComponent(x.pathname), PREFIX + name]); } }
// (the second form is the root-relative spelling a bundle uses — "/assets/svg/logo.svg" — matched
// whole, never inside a longer or already-prefixed path)
renames.sort((a, b) => b[0].length - a[0].length);

// ---- 3. text rewriting for the prefix ----
const P = PREFIX;
function rewriteText(t, kind) {
  // a renamed URL must match whole: /foo must not eat /foo/bar.png or /foo.css (nor their escaped forms)
  const whole = (s) => new RegExp('(?<![A-Za-z0-9_\\-./])' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z0-9_\\-./]|\\\\[u/])', 'g');
  for (const [from, to] of renames) { const fe = escapes(from), te = escapes(to); for (let i = 0; i < 3; i++) t = t.replace(whole(fe[i]), te[i].replace(/\$/g, '$$$$')); }
  { const fe = escapes(FROM), te = escapes(P); for (let i = 0; i < 3; i++) t = t.split(fe[i]).join(te[i]); }
  if (!P) return t;
  // root-absolute asset paths inside CSS / JS / inline scripts
  t = t.replace(/url\((['"]?)\/(?![\/])/g, `url($1${P}/`);
  // (the layer's own /tcs-media and /tcs-reservation.html carry BASE themselves; "/api.php" is a
  // literal inside the CMS client's endpoint.replace() and must stay)
  t = t.replace(/(["'])\/(_nuxt|assets|favicon|__ext|wp-content|manifest\.json)(?=[\/"'.?])/g, `$1${P}/$2`);
  t = t.split('base:decodeURI("/")').join(`base:decodeURI("${P}/")`);
  if (kind === 'html') {
    t = t.replace(/((?:href|src|data-src|poster|action)=["'])\/(?![\/])/g, `$1${P}/`);
    t = t.replace(/((?:srcset|data-srcset)=["'])([^"']*)/g, (m, a, v) => a + v.replace(/(^|,\s*)\/(?!\/)/g, `$1${P}/`));
    t = t.split(`${P}${P}/`).join(`${P}/`); // a rule that ran twice on one path
    const head = `<meta name="robots" content="noindex, nofollow">\n<meta name="tcs-base" content="${P}">`
      + (FB_SITE ? `\n<meta name="tobira-feedback" content="on">` : ''); // the site key derives from each page's path (docs/preview-feedback.md), one store per route
    // the metas go at the TOP of the head: the inject script runs synchronously while the document
    // parses and reads <meta name="tcs-base"> at that moment, so anything after it is invisible.
    // The body script goes before the LAST </body> (the inject's own comment mentions the tag).
    const at = (s, tag, ins) => { const i = s.lastIndexOf(tag); return i < 0 ? s : s.slice(0, i) + ins + s.slice(i); };
    t = t.replace(/<head[^>]*>/i, (m) => m + '\n' + (STRIP ? PRETTY_SCRIPT(P, STRIP) + '\n' : '') + head);
    if (FB_SITE) t = at(t, '</body>', `<!-- Tobira preview feedback layer — activates only with ?feedback=1 (docs/preview-feedback.md) -->\n<script src="/preview-feedback.js?v=${FB_VER}" defer></script>\n`);
    for (const [name, val] of METAS) t = t.replace(new RegExp(`(<meta\\b[^>]*\\b(?:name|property)="${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*\\bcontent=")[^"]*(")`, 'g'), (m, a, b) => a + val + b);
  }
  return t;
}

// ---- 4. fetch and write ----
await rm(OUT, { recursive: true, force: true });
let bytes = 0, n = 0;
async function save(rel, body) { const f = join(OUT, rel); await mkdir(dirname(f), { recursive: true }); await writeFile(f, body); bytes += body.length; n++; }
for (const [u, ct0] of urls) {
  const res = await fetch(u); if (!res.ok) { console.log('skip', res.status, u); continue; }
  const ct = res.headers.get('content-type') || ct0;
  const rel = nameFor(u, ct);
  if (isText(ct)) {
    const kind = /html/.test(ct) ? 'html' : /javascript/.test(ct) ? 'js' : /css/.test(ct) ? 'css' : 'text';
    const body = rewriteText(await res.text(), kind); await save(rel, body);
    const pp = kind === 'html' ? prettyPath(rel) : null; if (pp && pp !== rel) await save(pp, body); // the same document at the pretty path
  }
  else await save(rel, Buffer.from(await res.arrayBuffer()));
}
// ---- 5. recorded CMS POSTs, replayed through serve.mjs so their bodies are rewritten too ----
let posts = 0;
if (POSTS_FILE) {
  const rec = JSON.parse(await readFile(POSTS_FILE, 'utf8'));
  const routeSet = new Set(routes.map((r) => r.replace(/\/?$/, '/')));
  for (const [key, e] of Object.entries(rec)) {
    if (!(e.routes || []).some((r) => routeSet.has(r.replace(/\/?$/, '/')))) continue;
    const res = await fetch(FROM + e.path, { method: 'POST', body: e.post, headers: { 'content-type': 'application/json' } });
    if (!res.ok) { console.log('post miss', key); continue; }
    await save(`__posts/${key}.json`, rewriteText(await res.text(), 'json')); posts++;
  }
}
console.log(`routes ${routes.length}, files ${n}, posts ${posts}, ${(bytes / 1e6).toFixed(1)} MB -> ${OUT}`);
console.log('routes:', routes.join(' '));
