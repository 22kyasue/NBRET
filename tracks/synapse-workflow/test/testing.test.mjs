import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { requestBounded } from '../src/http.mjs';
import { inspectSource } from '../src/structure.mjs';
import { evaluateExpect, validateExpect, atPointer } from '../src/assertions.mjs';
import { runChecks } from '../src/checks.mjs';
import { runAnalysis } from '../src/analyze.mjs';
import { diagnose } from '../src/diagnose.mjs';
import { safeStateUrl } from '../src/capture.mjs';
import { readHarnessView, waitHarnessReady } from '../src/harness.mjs';
import { validateInteractions, evaluateUiExpect } from '../src/interactions.mjs';
import { runProbe } from '../src/probe.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

test('compressed responses decode with wire/decoded budgets and typed failures', async () => {
  const text = JSON.stringify({ items: Array.from({ length: 1000 }, (_, i) => ({ id: i })) });
  const server = createServer((req, res) => {
    if (req.url === '/broken') { res.setHeader('content-encoding', 'gzip'); res.end('invalid'); return; }
    if (req.url === '/truncated') { res.setHeader('content-length', '1000'); res.write('short'); setTimeout(() => res.destroy(), 10); return; }
    const br = req.url === '/br'; res.setHeader('content-encoding', br ? 'br' : 'gzip');
    res.end(br ? brotliCompressSync(text) : gzipSync(text));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ['/gzip', '/br']) {
      const result = await requestBounded(origin + path, { maxBytes: 20000 });
      assert.equal(JSON.parse(result.body).items.length, 1000);
      assert.ok(result.wireBytes < result.bytes);
    }
    await assert.rejects(requestBounded(origin + '/gzip', { maxBytes: 5000 }), e => e.code === 'DECODED_BYTE_LIMIT');
    await assert.rejects(requestBounded(origin + '/broken'), e => e.code === 'DECODE_FAILED');
    await assert.rejects(requestBounded(origin + '/truncated'), e => e.code === 'RESPONSE_ABORTED');
  } finally { server.closeAllConnections(); await new Promise(r => server.close(r)); }
});

test('expectations distinguish failures, missing evidence and redacted values', () => {
  const entry = { elapsedMs: 25, response: { status: 200, headers: { 'content-type': 'application/json' },
    body: { items: [{ id: 1 }], 'a/b': { '~value': true }, token: '[REDACTED]' } } };
  const checks = evaluateExpect(entry, { status: [200, 201], headers: { 'Content-Type': { includes: 'json' } },
    json: [{ path: '/items', type: 'array', minLength: 1 }, { path: '/a~1b/~0value', equals: true }], maxDurationMs: 100 });
  assert.ok(checks.every(c => c.outcome === 'passed'));
  assert.equal(evaluateExpect(entry, { json: [{ path: '/items/0/id', equals: 2 }] })[0].outcome, 'failed');
  assert.equal(evaluateExpect(entry, { json: [{ path: '/token', type: 'string' }] })[0].outcome, 'unavailable');
  assert.equal(evaluateExpect(entry, {})[0].outcome, 'unavailable');
  assert.equal(evaluateExpect({ errorCode: 'DEADLINE_EXCEEDED' }, { status: 200 })[0].reason, 'DEADLINE_EXCEEDED');
  assert.deepEqual(atPointer({}, '/toString'), { found: false, value: undefined });
  assert.throws(() => validateExpect({ json: [{ path: '/items', magicalCheck: true }] }));
});

test('structure parser maps imports, functions, calls, branches, event/storage/DOM effects without execution', () => {
  const result = inspectSource(`import { x } from './dep.js';
    globalThis.NBRET_SHOULD_NEVER_RUN = true;
    function render(value) { document.querySelector('#result').textContent = value; }
    async function load(flag) { if (flag) { const data = await fetch('/api/items?token=private'); render(data); }
      localStorage.setItem('result', 'x'); }
    document.addEventListener('click', () => load(true));`, { id: 's', url: 'https://fixture.test/app.js' });
  assert.equal(globalThis.NBRET_SHOULD_NEVER_RUN, undefined);
  assert.equal(result.status, 'parsed');
  assert.equal(result.functions.length, 3);
  assert.ok(result.imports.some(i => i.target === 'https://fixture.test/dep.js'));
  assert.ok(result.calls.some(c => c.callee === 'render' && c.targetFunctionId));
  assert.ok(result.endpoints.some(e => e.target.includes('/api/items?token=')));
  assert.ok(!JSON.stringify(result).includes('private'));
  assert.equal(result.branches.length, 1);
  assert.ok(result.events.some(e => e.event === 'click'));
  assert.ok(result.effects.some(e => e.kind === 'storage'));
  assert.ok(result.effects.some(e => e.kind === 'dom-write'));
  assert.ok(result.workflows.some(w => w.event === 'click' && w.resolved && w.endpoints.length === 1));
});

test('checks produce pass/fail assertions, regression changes, offline evaluation and CI output', async () => {
  let revision = 1, hits = 0;
  const server = createServer(async (req, res) => {
    hits++; let text = ''; for await (const chunk of req) text += chunk;
    res.setHeader('content-type', 'application/json');
    if (text) { const { a, b } = JSON.parse(text); res.end(JSON.stringify({ result: a + b })); return; }
    res.end(JSON.stringify(revision === 1 ? { items: [{ id: 1 }], timestamp: 'a' } : { items: 'broken', timestamp: 'b' }));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const parent = resolve(`runs/check-test-${Date.now()}`); await mkdir(parent, { recursive: true });
  const cases = [{ name: 'items <contract>', url: origin, expect: { status: 200,
    headers: { 'content-type': { includes: 'json' } }, json: [{ path: '/items', type: 'array', minLength: 1 }] } }];
  try {
    const baseline = await runChecks({ origins: [origin], cases, outDir: join(parent, 'baseline'), delayMs: 0, ignoreJsonPaths: ['/timestamp'] });
    assert.equal(baseline.status, 'passed');
    revision = 2;
    const broken = await runChecks({ origins: [origin], cases, outDir: join(parent, 'broken'), delayMs: 0,
      ignoreJsonPaths: ['/timestamp'], baselineFile: join(parent, 'baseline/check-results.json') });
    assert.equal(broken.status, 'failed');
    assert.ok(broken.regression.changes.some(c => c.kind === 'schema'));
    const before = hits;
    const offline = await runChecks({ origins: [origin], cases, outDir: join(parent, 'offline'), probeFile: join(parent, 'baseline/probe/probe.json') });
    assert.equal(offline.status, 'passed'); assert.equal(hits, before);
    assert.ok((await readFile(join(parent, 'baseline/junit.xml'), 'utf8')).includes('&lt;contract&gt;'));
    const postCases = [
      { name: 'sum25', url: origin, method: 'POST', body: { a: 20, b: 5 }, expect: { json: [{ path: '/result', equals: 25 }] } },
      { name: 'sum10', url: origin, method: 'POST', body: { a: 7, b: 3 }, expect: { json: [{ path: '/result', equals: 10 }] } },
    ];
    const post = await runChecks({ origins: [origin], cases: postCases, outDir: join(parent, 'post'), allowWrites: true, delayMs: 0 });
    assert.equal(post.counts.passed, 2);
    const postOffline = await runChecks({ origins: [origin], cases: postCases, outDir: join(parent, 'post-offline'), probeFile: join(parent, 'post/probe/probe.json') });
    assert.equal(postOffline.counts.passed, 2, 'offline matching includes each request body');
  } finally { server.closeAllConnections(); await new Promise(r => server.close(r)); }
});

test('analyzer links datasets, auth observations, static workflows and runtime initiators with honest coverage', async () => {
  const parent = resolve(`runs/analyze-test-${Date.now()}`), network = join(parent, 'capture/network');
  await mkdir(join(network, 'assets'), { recursive: true });
  const source = `async function load(){const r=await fetch('/api/items');document.querySelector('#r').textContent=await r.text()};document.addEventListener('click',()=>load())`;
  await writeFile(join(network, 'assets/app.js'), source);
  await writeFile(join(network, 'assets/items.json'), '{"a":{"title":"A"},"b":{"title":"B"}}');
  await writeFile(join(network, 'evidence.json'), JSON.stringify({ origins: ['https://fixture.test'],
    requests: [{ requestId: '1', inScope: true, request: { url: 'https://fixture.test/component-index.json', method: 'GET' },
      response: { status: 200, mimeType: 'application/json' }, finished: {}, body: { file: 'assets/items.json' },
      initiator: { frames: [{ url: 'https://fixture.test/app.js', lineNumber: 0, columnNumber: 35 }] } },
      { requestId: '2', inScope: true, request: { url: 'https://fixture.test/api/account', method: 'GET' }, response: { status: 401 } }],
    scripts: [{ scriptId: '1', url: 'https://fixture.test/app.js', file: 'assets/app.js' }], snapshots: [], dropped: {} }));
  await writeFile(join(parent, 'capture/summary.json'), JSON.stringify({ targetOrigin: 'https://fixture.test', page: { title: 'Fixture' } }));
  const result = await runAnalysis({ runDir: parent, outDir: join(parent, 'analysis') });
  assert.equal(result.datasets[0].entries, 2);
  assert.equal(result.profile.authObservations[0].statuses[0], 401);
  assert.equal(result.profile.serverFramework, 'unknown from these observations');
  assert.equal(result.coverage.status, 'partial');
  const structure = JSON.parse(await readFile(join(parent, 'analysis/structure.json'), 'utf8'));
  assert.equal(structure.runtimeLinks.length, 1);
  assert.ok(structure.runtimeLinks[0].functionId);
  assert.ok(structure.workflows.some(w => w.resolved && w.endpoints.length));
  assert.ok((await readFile(join(parent, 'analysis/LOGIC.md'), 'utf8')).includes('Statically reachable functions'));
});

test('diagnosis separates site failures, scanner findings, hypotheses and collector gaps', () => {
  const result = diagnose({ network: { requests: [
    { inScope: true, request: { url: 'https://fixture.test/api/items' }, response: { status: 503 } },
    { inScope: true, resourceType: 'Script', request: { url: 'https://fixture.test/app.js' }, response: { status: 404 } },
  ], snapshots: [{ accessibility: { renderedImagesMissingAlt: 2 } }] },
  analysis: { coverage: { gaps: [{ code: 'probe-failures', count: 1, evidence: 'probe/probe.json' }] } },
  scan: { alerts: [{ pluginId: '10055', name: 'CSP: script-src unsafe-inline', risk: 'Medium', confidence: 'High', url: 'https://fixture.test/' }] } });
  assert.equal(result.summary.observedFailures, 2);
  assert.equal(result.summary.scannerFindings, 1);
  assert.equal(result.summary.collectionGaps, 1);
  assert.ok(result.issues.every(i => i.suggestedFix && i.verification && i.evidence.length));
  assert.ok(result.issues.find(i => i.category === 'collection-gap').whyItMatters.includes('not evidence of a website defect'));
  assert.equal(safeStateUrl('https://fixture.test/#catalog'), 'https://fixture.test/#catalog');
  assert.ok(!safeStateUrl('https://fixture.test/#access_token=private').includes('private'));
});

test('browser inventory caps data, rejects unsafe scenarios and marks loading shells unsettled', async () => {
  const harness = { async call({ element_offset = 0 }) {
    return { url: 'https://fixture.test/#catalog', text: 'Content', ready: 'complete',
      elements: Array.from({ length: 60 }, (_, i) => ({ name: String(i + element_offset) })),
      next_element_offset: element_offset + 60, next_offset: null };
  } };
  const view = await readHarnessView(harness, 'owned', { maxElements: 75, maxTextChars: 4 });
  assert.equal(view.elements.length, 75); assert.equal(view.text.length, 4);
  assert.equal(view.elements_truncated, true); assert.equal(view.truncated, true);
  const loading = await waitHarnessReady({ call: async () => ({ ready: 'complete', text: 'ページを読み込み中…', elements: [] }) }, 'owned', 0);
  assert.equal(loading.settled, false);
  assert.throws(() => validateInteractions([{ type: 'click', name: '保存する' }]));
  assert.throws(() => validateInteractions([{ type: 'click', name: 'Search', expect: { unknown: 'x' } }]));
  assert.ok(evaluateUiExpect({ url: 'https://fixture.test/#catalog', text: 'Results', elements: [{ name: 'Search' }] },
    { urlIncludes: '#catalog', textIncludes: 'Results', elementName: 'Search' }).every(c => c.outcome === 'passed'));
  assert.equal(evaluateUiExpect({elements:[{name:'Search query',tag:'input',type:'search',value:'fixture'}]},
    {fieldValueEquals:'fixture'},{controlName:'Search query'})[0].outcome,'passed');
});

test('total probe output budget omits bodies explicitly instead of growing without bound', async () => {
  const server=createServer((req,res)=>{res.setHeader('content-type','application/json');res.end(JSON.stringify({data:'x'.repeat(6000)}))});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`,outDir=resolve(`runs/probe-budget-${Date.now()}`);
  try {
    const result=await runProbe({origins:[origin],cases:[{url:origin+'/a'},{url:origin+'/b'},{url:origin+'/c'}],
      outDir,maxBytes:10000,maxTotalBytes:8192,delayMs:0});
    assert.equal(result.status,'incomplete');assert.ok(result.coverage.omittedBodies>0);
    assert.ok((await readFile(join(outDir,'probe.json'))).length<=8192);
    const omitted=result.cases.find(c=>c.response?.omitted==='total-output-byte-limit');
    assert.equal(evaluateExpect(omitted,{json:[{path:'/data',type:'string'}]})[0].outcome,'unavailable');
  } finally {server.closeAllConnections();await new Promise(r=>server.close(r));}
});
