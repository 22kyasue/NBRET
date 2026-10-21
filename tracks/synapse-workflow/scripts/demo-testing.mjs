import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { runScenario } from '../src/scenario.mjs';
import { runAnalysis } from '../src/analyze.mjs';
import { runChecks } from '../src/checks.mjs';
let broken = false;
const server = createServer((req, res) => {
  if (req.url === '/items.json') {
    res.setHeader('content-type', 'application/json'); res.setHeader('content-encoding', 'gzip');
    res.end(gzipSync(JSON.stringify(broken ? { items: 'broken' } : { items: [{ id: 1, title: 'One' }] }))); return;
  }
  if (req.url === '/app.js') {
    res.setHeader('content-type', 'text/javascript');
    res.end(`async function loadItems() {
      const data=await (await fetch('/items.json')).json();
      document.querySelector('#result').textContent=String(data.items.length)+' item ready';
    }
    document.querySelector('#load').addEventListener('click',loadItems);
    document.querySelector('#search').addEventListener('input',event=>{
      document.querySelector('#query-result').textContent='Query: '+event.target.value;
    });`); return;
  }
  res.setHeader('content-type', 'text/html');
  res.end('<!doctype html><title>NBRET testing fixture</title><button id="load">Load items</button><output id="result">Ready</output><input id="search" aria-label="Search query" type="search"><output id="query-result">No query</output><script src="/app.js"></script>');
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`, parent = resolve(`runs/testing-demo-${Date.now()}`);
await mkdir(parent, { recursive: false });
try {
  const scenario = await runScenario({ url: origin, outDir: join(parent, 'scenario'), includeScriptSources: true,
    settleMs: 500, readyTimeoutMs: 5000, drainMs: 1000, steps: [
      { type: 'click', name: 'Load items', expect: { textIncludes: '1 item ready' } },
      { type: 'fill', name: 'Search query', value: 'fixture', expect: { textIncludes: 'Query: fixture', fieldValueEquals: 'fixture' } },
    ] });
  assert.equal(scenario.status, 'passed');
  assert.equal(scenario.counts.passed, 3);
  assert.equal(scenario.executionCoverage.status, 'captured');
  const analysis = await runAnalysis({ runDir: join(parent, 'scenario'), outDir: join(parent, 'analysis') });
  assert.ok(analysis.structureSummary.functions >= 2);
  assert.ok(analysis.structureSummary.execution.executedFunctions > 0);
  const cases = [{ name: 'items contract', url: origin + '/items.json', expect: { status: 200, json: [{ path: '/items', type: 'array', minLength: 1 }] } }];
  const baseline = await runChecks({ origins: [origin], cases, outDir: join(parent, 'baseline'), delayMs: 0 });
  assert.equal(baseline.status, 'passed');
  broken = true;
  const regression = await runChecks({ origins: [origin], cases, outDir: join(parent, 'regression'), delayMs: 0,
    baselineFile: join(parent, 'baseline/check-results.json') });
  assert.equal(regression.status, 'failed');
  assert.ok(regression.regression.changes.some(c => c.kind === 'schema'));
  await writeFile(join(parent, 'VERIFIED.json'), JSON.stringify({ scenario: 'passed', assertions: 3,
    executionCoverage: scenario.executionCoverage, analysis: 'analyzed', baseline: 'passed', deliberateRegression: 'detected' }, null, 2));
  console.log(JSON.stringify({ verified: true, outDir: parent }));
} finally { server.closeAllConnections(); await new Promise(r => server.close(r)); }
