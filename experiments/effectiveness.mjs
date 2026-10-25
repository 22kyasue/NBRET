// Controlled adversarial evaluation. No production endpoints or product-code edits.
import http from 'node:http';
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { startCapture } from '../src/capture.mjs';

const root = resolve('runs', `evaluation-${Date.now()}`);
await mkdir(root, { recursive: true });
let implementation = 'arithmetic';
const body = async req => { const chunks = []; for await (const c of req) chunks.push(c); return Buffer.concat(chunks).toString(); };
const listen = server => new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const cross = http.createServer((_q, r) => { r.setHeader('Access-Control-Allow-Origin', '*'); r.setHeader('Content-Type', 'application/json'); r.end('{"result":25}'); });
await listen(cross);
const crossUrl = `http://127.0.0.1:${cross.address().port}/api`;
const app = `
window.calculate = async (a=20,b=5) => (await (await fetch('/calc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({a,b})})).json()).result;
window.localOnly = (a,b) => a+b;
window.fromStorage = () => Number(localStorage.getItem('answer'));
window.cached = async () => (await (await fetch('/cached')).json()).result;
window.crossApi = async () => (await (await fetch(${JSON.stringify(crossUrl)})).json()).result;
window.plain = async () => Number(await (await fetch('/plain')).text());
window.packed = async () => {
 const reply = await (await fetch('/packed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({packet:btoa(JSON.stringify({a:20,b:5}))})})).json();
 return Number(atob(reply.packet));
};
window.queueDelayed = () => setTimeout(async () => {window.delayedResult=await calculate();},250);
window.batch = async n => {for(let i=0;i<n;i++) await calculate(i,5);};
`;
const server = http.createServer(async (q, r) => {
  if (q.url === '/app.js') { r.setHeader('Content-Type', 'text/javascript'); r.end(app); return; }
  if (q.url === '/calc') {
    const { a, b } = JSON.parse(await body(q));
    const value = implementation === 'arithmetic' ? a + b : ({ '20,5': 25, '7,3': 10 }[`${a},${b}`] ?? -999);
    r.setHeader('Content-Type', 'application/json'); r.end(JSON.stringify({ result: value })); return;
  }
  if (q.url === '/cached') { r.setHeader('Cache-Control', 'public, max-age=3600'); r.setHeader('Content-Type', 'application/json'); r.end('{"result":25}'); return; }
  if (q.url === '/plain') { r.setHeader('Content-Type', 'text/plain'); r.end('answer=25'); return; }
  if (q.url === '/packed') { r.setHeader('Content-Type', 'application/json'); r.end('{"packet":"MjU="}'); return; }
  r.setHeader('Content-Type', 'text/html'); r.end('<!doctype html><title>Evaluation</title><output>25</output><script src="/app.js"></script>');
});
await listen(server);
const origin = `http://127.0.0.1:${server.address().port}`;
const channel = process.env.NBRET_BROWSER_CHANNEL || (existsSync(chromium.executablePath()) ? undefined : 'chrome');
let ctx;
const results = { cases: [], measurements: {}, limitations: ['Synthetic local fixtures, no AI reconstruction/token benchmark.', 'Timing samples are local and not general performance claims.'] };
try {
  ctx = await chromium.launchPersistentContext(join(root, 'profile'), { headless: true, channel, args: ['--remote-debugging-port=0'] });
  const page = ctx.pages()[0];
  const cap = await startCapture(page, { outDir: join(root, 'network'), origins: [origin], includeScriptSources: true });
  await page.goto(origin);
  const step = async (name, fn) => { const actionId = cap.markAction(name); const output = await fn(); await page.waitForTimeout(100); results.cases.push({ name, actionId, output }); };
  await step('server-sum', () => page.evaluate(() => calculate(20,5)));
  await step('changed-input', () => page.evaluate(() => calculate(7,3)));
  implementation = 'lookup-table';
  await step('different-server-implementation-same-observation', () => page.evaluate(() => calculate(20,5)));
  implementation = 'arithmetic';
  await step('client-only', () => page.evaluate(() => localOnly(20,5)));
  await page.evaluate(() => localStorage.setItem('answer','25'));
  await step('storage-only', () => page.evaluate(() => fromStorage()));
  await step('http-cache-first', () => page.evaluate(() => cached()));
  await step('http-cache-repeat', () => page.evaluate(() => cached()));
  await step('cross-origin-api', () => page.evaluate(() => crossApi()));
  await step('plain-text-body', () => page.evaluate(async () => (await (await fetch('/plain')).text())));
  await step('application-encoded-payload', () => page.evaluate(() => packed()));
  const originatingAction = cap.markAction('A-schedules-request');
  await page.evaluate(() => queueDelayed());
  const unrelatedAction = cap.markAction('B-unrelated-action');
  await page.waitForFunction(() => window.delayedResult === 25);
  await page.waitForTimeout(150);
  await cap.snapshot('end');
  const evidence = await cap.finish();
  const readBody = async r => r.body?.file ? JSON.parse(await readFile(join(root,'network',r.body.file),'utf8')) : null;
  for (const c of results.cases) {
    const reqs = evidence.requests.filter(r => r.actionId === c.actionId);
    c.requests = await Promise.all(reqs.map(async r => ({ url:r.request.url, request:r.request.postData?.text ?? null, response:await readBody(r), omitted:r.body?.omitted ?? null,
      initiator: r.initiator.frames.map(f=>({url:f.url,line:f.lineNumber})), cache: !!(r.servedFromCache || r.response?.fromDiskCache) })));
  }
  const delayed = evidence.requests.find(r => r.actionId === unrelatedAction && r.request.url.endsWith('/calc'));
  results.delayed = { originatingAction, unrelatedAction, capturedActionId: delayed?.actionId, correctlyPairedBody: await readBody(delayed) };
  assert.equal(results.delayed.capturedActionId, unrelatedAction);
  assert.equal(results.cases[0].requests[0].response.result,25);
  assert.equal(results.cases[1].requests[0].response.result,10);
  assert.equal(results.cases.find(c=>c.name==='cross-origin-api').requests[0].omitted,'out-of-scope');
  assert.equal(results.cases.find(c=>c.name==='plain-text-body').requests[0].omitted,'non-structured-payload');
  assert.equal(results.cases.find(c=>c.name==='client-only').requests.length,0);
  assert.equal(results.cases.find(c=>c.name==='storage-only').requests.length,0);
  assert.ok(results.cases.find(c=>c.name==='http-cache-repeat').requests[0].cache);
  const cleanPair = c => c.requests.map(r=>({url:r.url,request:r.request,response:r.response}));
  assert.deepEqual(cleanPair(results.cases[0]),cleanPair(results.cases[2]));
  results.sameObservationDifferentImplementation = true;

  // Warm-up and five alternating baseline/recorder samples. No broad performance claim.
  await page.evaluate(() => batch(5));
  const timings = [];
  for (let i=0;i<5;i++) {
    for (const enabled of (i%2 ? [true,false] : [false,true])) {
      const rec = enabled ? await startCapture(page,{outDir:join(root,`perf-${i}`),origins:[origin]}) : null;
      const start = performance.now(); await page.evaluate(() => batch(20));
      const operationMs = performance.now()-start;
      const finishStart = performance.now(); if(rec) await rec.finish();
      timings.push({enabled,operationMs,persistMs:performance.now()-finishStart});
    }
  }
  results.measurements.timingSamples = timings;

  // Fair REA capability check: continuously issue local requests while REA observes.
  const port = (await readFile(join(root,'profile','DevToolsActivePort'),'utf8')).split(/\r?\n/)[0];
  const cdp = await ctx.newCDPSession(page); const {targetInfo}=await cdp.send('Target.getTargetInfo'); await cdp.detach();
  let stop = false, sent = 0;
  const pumping = (async()=>{while(!stop){await page.evaluate(()=>calculate(20,5));sent++;await page.waitForTimeout(100);}})();
  let rea;
  try {
    const {stdout}=await promisify(execFile)(process.execPath,['node_modules/rea-agents/scripts/rea.mjs','inspect-web-page',`http://127.0.0.1:${port}`,targetInfo.targetId,'--observation-ms','2000','--include-json-body-shapes','--include-script-sources','--format','json'],{timeout:30000,maxBuffer:16*1024*1024,windowsHide:true});
    rea=JSON.parse(stdout);
  } finally { stop=true; await pumping; }
  await writeFile(join(root,'rea-during-traffic.json'),JSON.stringify(rea,null,2));
  assert.equal(rea.operation,'inspect_web_page');
  const network=rea.normalized_result.network;
  assert.ok(network.requests.some(r=>r.url.endsWith('/calc') && r.method==='POST' && r.body_shapes?.request && r.body_shapes?.response));
  results.rea = { requestsSentDuringProcess:sent, network, scripts:rea.normalized_result.scripts.total, completeness:rea.normalized_result.completeness };
  await writeFile(join(root,'results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({root,cases:results.cases.map(c=>({name:c.name,output:c.output,requests:c.requests.length,omitted:c.requests.map(r=>r.omitted)})),delayed:results.delayed,sameObservationDifferentImplementation:results.sameObservationDifferentImplementation,reaNetworkKeys:Object.keys(network),timings},null,2));
} finally { await ctx?.close(); await Promise.all([new Promise(r=>server.close(r)),new Promise(r=>cross.close(r))]); }
