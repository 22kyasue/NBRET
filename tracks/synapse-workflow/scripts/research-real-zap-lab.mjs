import { createServer } from 'node:http';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { startOwnedZap } from '../src/managed-zap.mjs';
import { runScan } from '../src/zap.mjs';
import { requestBounded } from '../src/http.mjs';
const mode = process.argv[2] || 'normal';
if (!['normal', 'stop'].includes(mode)) throw new Error('Invalid research mode');
const out = resolve(`runs/real-zap-research-${mode}-${Date.now()}`);
await mkdir(out);
const traffic = [], apiCalls = [], receipt = { mode, at: new Date().toISOString(), node: process.version,
 scope: 'Owned loopback daemon and synthetic HTTP fixture only; no external target testing', out, traffic, apiCalls };
let daemon, resolveRewritten;
const rewrittenSeen = new Promise(r => { resolveRewritten = r; });
const server = createServer((req, res) => {
 const item = { at: new Date().toISOString(), method: req.method, path: req.url }; traffic.push(item);
 const respond = () => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(req.url === '/allowed/' ? '<html><title>Directory</title><body>Parent Directory — synthetic listing only</body></html>' : '<html><title>Synthetic seed</title><body>fixture</body></html>');
  item.responseEndedAt = new Date().toISOString();
 };
 if (req.url === '/allowed/') { resolveRewritten(); if (mode === 'stop') { setTimeout(respond, 2500); return; } }
 respond();
});
const started = performance.now();
try {
 await new Promise((r, j) => { server.once('error', j); server.listen(0, '127.0.0.1', r); });
 const origin = `http://127.0.0.1:${server.address().port}`;
 receipt.origin = origin;
 daemon = await startOwnedZap({ startupMs: 60000 });
 receipt.daemon = { version: daemon.version, endpoint: daemon.endpoint, owned: true };
 const api = async (component, type, operation, params = {}) => {
  const u = new URL(`/JSON/${component}/${type}/${operation}/`, daemon.endpoint);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  const response = await requestBounded(u.href, { headers: { 'X-ZAP-API-Key': daemon.apiKey }, timeoutMs: 10000, maxBytes: 4 * 1024 * 1024 });
  const data = JSON.parse(response.body); apiCalls.push({ component, type, operation, params, httpStatus: response.status, data });
  if (response.status !== 200 || data.code || data.error) throw new Error(`API failed: ${component}/${operation}`);
  return data;
 };
 await api('ascan', 'action', 'disableAllScanners');
 await api('ascan', 'action', 'enableScanners', { ids: '0' });
 receipt.configuredScanners = await api('ascan', 'view', 'scanners');
 receipt.scan = await runScan({ origins: [origin], urls: [origin + '/allowed'], outDir: join(out, 'scan'),
  endpoint: daemon.endpoint, apiKey: daemon.apiKey, active: true, scopeMode: 'urls', maxMs: 30000, pollMs: 100,
  transport: async (url, options) => {
   const response = await requestBounded(url, options), u = new URL(url), parts = u.pathname.split('/');
   const data = JSON.parse(response.body);
   apiCalls.push({ component: parts[2], type: parts[3], operation: parts.at(-2), params: Object.fromEntries(u.searchParams), httpStatus: response.status, data });
   if (mode === 'stop' && parts[2] === 'ascan' && parts.at(-2) === 'scan' && data.scan !== undefined) {
    let timer;
    try { await Promise.race([rewrittenSeen, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Rewritten request not seen')), 5000); })]); }
    finally { clearTimeout(timer); }
    receipt.stop = { at: new Date().toISOString(), scanId: data.scan, response: await api('ascan', 'action', 'stop', { scanId: data.scan }) };
   }
   return response;
  } });
 receipt.adapterReturnedAt = new Date().toISOString();
 receipt.fixtureResponsePendingAtAdapterReturn = traffic.some(t => t.path === '/allowed/' && !t.responseEndedAt);
 receipt.states = await api('ascan', 'view', 'scans');
 receipt.progress = [];
 for (const scan of receipt.scan.scans) receipt.progress.push(await api('ascan', 'view', 'scanProgress', { scanId: scan.id }));
 receipt.richAlerts = await api('alert', 'view', 'alerts', { baseurl: origin + '/', start: 0, count: 100 });
 if (mode === 'stop') {
  await new Promise(r => setTimeout(r, 3000));
  receipt.laterStates = await api('ascan', 'view', 'scans');
  receipt.laterRichAlerts = await api('alert', 'view', 'alerts', { baseurl: origin + '/', start: 0, count: 100 });
 }
 receipt.observed = { rewrittenPathRequested: traffic.some(r => r.path === '/allowed/'),
  activeSummaryPresent: receipt.scan.alerts.some(a => a.pluginId === '0'), adapterStatus: receipt.scan.status };
} catch (e) { receipt.error = { name: e.name, message: e.message }; }
finally {
 if (daemon) { await daemon.stop(); receipt.ownedDaemonStopCalled = true;
  try { await requestBounded(daemon.endpoint + '/JSON/core/view/version/', { timeoutMs: 500 }); receipt.apiClosedAfterStop = false; }
  catch { receipt.apiClosedAfterStop = true; }
 }
 await new Promise(r => server.close(r)); receipt.fixtureClosed = !server.listening;
 receipt.elapsedMs = performance.now() - started; receipt.sourceSha256 = {};
 for (const p of ['src/zap.mjs', 'src/managed-zap.mjs', 'src/http.mjs', 'scripts/research-real-zap-lab.mjs', 'docs/research/security-landscape/deep-review/real-zap-lab-plan.md'])
  receipt.sourceSha256[p] = createHash('sha256').update(await readFile(p)).digest('hex');
 await writeFile(join(out, 'receipt.json'), JSON.stringify(receipt, null, 2));
 await writeFile(`docs/research/security-landscape/deep-review/real-zap-${mode === 'normal' ? 'lab' : 'stop'}-receipt.json`, JSON.stringify(receipt, null, 2));
 console.log(JSON.stringify({ out, observed: receipt.observed, error: receipt.error, elapsedMs: receipt.elapsedMs, apiClosedAfterStop: receipt.apiClosedAfterStop, fixtureClosed: receipt.fixtureClosed }));
}
