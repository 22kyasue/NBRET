import { createServer } from 'node:http';
import { mkdir, open, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
import { runTiers } from '../src/tiers.mjs';
import { requestBounded } from '../src/http.mjs';

const parent = resolve(`runs/tiers-demo-${Date.now()}`);
await mkdir(parent, { recursive: true });
const fixture = createServer(async (req, res) => {
  if (req.url === '/sum' && req.method === 'POST') {
    let text = ''; for await (const chunk of req) text += chunk;
    try { const { a, b } = JSON.parse(text); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ result: Number(a) + Number(b) })); }
    catch { res.writeHead(400); res.end('{}'); } return;
  }
  if (req.url === '/app.js') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(`document.querySelector('#calculate').onclick = async () => {
      const response = await fetch('/sum', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: Number(document.querySelector('#a').value), b: Number(document.querySelector('#b').value) }) });
      document.querySelector('#result').textContent = String((await response.json()).result);
    };`); return;
  }
  res.setHeader('Content-Type', 'text/html');
  res.end('<!doctype html><title>NBRET tier fixture</title><main><h1>Tier fixture</h1><a href="/">Home</a><a href="/about">About</a><a href="https://example.com/">External (skip)</a><a href="/delete">Delete (skip)</a><button type="button" onclick="document.querySelector(\'output\').textContent=\'Details open\'">Details</button><output>Closed</output><input id="a" value="20" aria-label="A"><input id="b" value="5" aria-label="B"><button id="calculate">Calculate</button><output id="result">Ready</output></main><script src="/app.js"></script>');
});
await new Promise(r => fixture.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${fixture.address().port}/`, origin = new URL(url).origin;
const reservation = createServer(); await new Promise(r => reservation.listen(0, '127.0.0.1', r));
const port = reservation.address().port; await new Promise(r => reservation.close(r));
const endpoint = `http://127.0.0.1:${port}`, apiKey = randomBytes(24).toString('hex');
const home = join(parent, 'zap-home'); await mkdir(home);
const log = await open(join(parent, 'zap.log'), 'w');
const java = process.env.NBRET_JAVA || 'C:/Users/kotar/AppData/Local/Programs/BurpSuite/jre/bin/java.exe';
const receipt = JSON.parse(await readFile(resolve('.tools/zap-receipt.json'), 'utf8'));
const version = receipt.tag?.replace(/^v/, '');
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid ZAP setup receipt');
const install = resolve(receipt.installDir || `.tools/ZAP_${version}`);
const child = spawn(java, ['-Xmx512m', '-jar', join(install, `zap-${version}.jar`), '-daemon', '-silent', '-notel',
  '-dir', home, '-installdir', install, '-host', '127.0.0.1', '-port', String(port), '-config', `api.key=${apiKey}`],
  { windowsHide: true, stdio: ['ignore', log.fd, log.fd] });
let launchError; child.on('error', e => { launchError = e; });
try {
  const started = Date.now(); let ready = false;
  while (Date.now() - started < 90000) {
    if (launchError || child.exitCode !== null) throw new Error('Owned ZAP daemon could not start');
    try { const response = await requestBounded(endpoint + '/JSON/core/view/version/', { headers: { 'X-ZAP-API-Key': apiKey }, timeoutMs: 1000 }); ready = response.status === 200; }
    catch {}
    if (ready) break;
    await new Promise(r => setTimeout(r, 500));
  }
  assert.ok(ready, 'owned ZAP daemon ready');
  const result = await runTiers({ url, outDir: join(parent, 'evidence'),
    capture: { browser: 'isolated', copy: true, includeScriptSources: true, actions: [
      { type: 'click', selector: '#calculate' }, { type: 'wait', ms: 300 },
      { type: 'fill', selector: '#a', value: '7' }, { type: 'fill', selector: '#b', value: '3' },
      { type: 'click', selector: '#calculate' }, { type: 'wait', ms: 300 },
    ] },
    explore: { maxPages: 3, maxDepth: 2, interactions: [{ type: 'click', name: 'Details' }] },
    probe: { allowWrites: true, cases: [
      { url: origin + '/sum', method: 'POST', body: { a: 20, b: 5 }, expectStatus: 200 },
      { url: origin + '/sum', method: 'POST', body: { a: 7, b: 3 }, expectStatus: 200 },
    ] },
    scan: { endpoint, apiKey, active: true, maxMs: 180000, urls: [url] },
  });
  assert.equal(result.tiers.capture.capture, 'captured');
  assert.equal(result.tiers.capture.rea, 'captured');
  assert.equal(result.tiers.capture.copy, 'extracted');
  assert.equal(result.probePlan.status, 'draft');
  assert.ok(result.probePlan.proposals >= 5, 'observed API input variations generate an offline probe plan');
  assert.equal(result.tiers.explore.status, 'completed');
  assert.equal(result.tiers.explore.pages.length, 2);
  assert.ok(result.tiers.explore.states.length >= 4, 'captures open disclosure states');
  assert.equal(result.tiers.explore.cleanup.closed, true);
  assert.deepEqual(result.tiers.probe.cases.map(c => c.response.body.result), [25, 10]);
  assert.equal(result.tiers.scan.status, 'completed');
  assert.equal(result.tiers.scan.contextRemoved, true);
  assert.ok(result.tiers.scan.scans.every(s => s.progress === 100));
  assert.equal(result.analysis.status, 'analyzed');
  assert.equal(result.status, 'completed');
  await writeFile(join(parent, 'VERIFIED.json'), JSON.stringify({ verified: true, output: parent,
    capture: result.tiers.capture.counts, explore: { pages: result.tiers.explore.pages.length, states: result.tiers.explore.states.length },
    probeOutputs: [25, 10], probeProposals: result.probePlan.proposals, zapVersion: result.tiers.scan.version, activeScans: result.tiers.scan.scans.length,
    alerts: result.tiers.scan.alerts.length }, null, 2));
  console.log(JSON.stringify({ verified: true, output: parent }));
} finally {
  try { await requestBounded(endpoint + '/JSON/core/action/shutdown/', { headers: { 'X-ZAP-API-Key': apiKey }, timeoutMs: 2000 }); } catch {}
  if (child.exitCode === null) {
    await Promise.race([once(child, 'exit'), new Promise(r => setTimeout(r, 5000))]);
    if (child.exitCode === null) child.kill();
  }
  await log.close();
  fixture.closeAllConnections();
  await new Promise(r => fixture.close(r));
}
