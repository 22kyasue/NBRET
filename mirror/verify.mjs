// Load a mirrored page from serve.mjs and report what broke: failed requests, console errors, video state.
//   node scripts/mirror/verify.mjs --url http://localhost:8787/ja --shot out.png
import { chromium } from 'playwright';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const URL_ = arg('--url', 'http://localhost:8787/ja');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const failed = [], errors = [], external = [];
page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
page.on('requestfailed', r => failed.push(`FAIL ${r.url()} ${r.failure()?.errorText}`));
page.on('request', r => { if (!r.url().startsWith('http://localhost')) external.push(r.url()); });
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto(URL_, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('goto', e.message));
for (let y = 0; y < 9000; y += 700) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(200); }
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1500);
const state = await page.evaluate(() => ({
  title: document.title, height: document.body.scrollHeight,
  imgs: [...document.images].length, broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.src).map(i => i.src).slice(0, 10),
  videos: [...document.querySelectorAll('video')].map(v => ({ src: v.currentSrc.slice(0, 120), ready: v.readyState, w: v.videoWidth, h: v.videoHeight, playing: !v.paused, t: v.currentTime })),
}));
console.log(JSON.stringify(state, null, 1));
console.log('failed requests:', failed.length, failed.slice(0, 15).join('\n'));
console.log('external requests (should be none):', [...new Set(external.map(u => new URL(u).host))]);
console.log('console errors:', errors.length, errors.slice(0, 8).join('\n'));
if (arg('--shot')) await page.screenshot({ path: arg('--shot'), fullPage: false });
await browser.close();
