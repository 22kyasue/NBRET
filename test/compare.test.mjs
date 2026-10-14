import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compareRuns, loadRun, originAliases } from '../src/compare.mjs';

const run = () => ({ summary: { capture: 'captured', identity: { scenarioId: 'sum' }, options: { visual: true } }, evidence: { actions: [{ label: 'navigate' }] },
  examples: [{ key: '1 POST @page/sum', input: { bodyHash: 'input' }, output: { status: 200, responseHash: '25' } }],
  states: [{ actionId: 1, viewport: { width: 1440 }, nodes: [{ tag: 'OUTPUT', id: 'result', text: '25', style: { color: 'black' }, rect: { x: 0, y: 0, width: 100, height: 20 } }] }] });

test('different missing-body reasons remain evidence gaps instead of behavioral regressions', () => {
  const a = run(), b = run();
  a.examples[0].output = { status: 200, responseHash: null, bodyOmitted: 'pending-limit' };
  b.examples[0].output = { status: 200, responseHash: null, bodyOmitted: 'non-structured-payload' };
  let result = compareRuns(a, b);
  assert.equal(result.changes.length, 0); assert.equal(result.evidenceChanges.length, 1);
  b.examples[0].output.responseHash = '25';
  result = compareRuns(a, b); assert.equal(result.changes.length, 0); assert.equal(result.evidenceChanges.length, 1);
  b.examples[0].output.status = 503;
  assert.ok(compareRuns(a, b).changes.some(c => c.kind === 'response-changed'));
});

test('comparison finds behavioral, text and geometry differences without reporting subpixel jitter', () => {
  const a = run(), b = run();
  b.examples[0].output.responseHash = '10';
  b.states[0].nodes[0].text = '10';
  b.states[0].nodes[0].rect.x = 0.5;
  assert.deepEqual(compareRuns(a, b).changes.map(c => c.kind), ['response-changed', 'visible-text-changed']);
  b.states[0].nodes[0].rect.x = 2;
  assert.ok(compareRuns(a, b).changes.some(c => c.kind === 'geometry-changed'));
  b.examples.push({ ...b.examples[0], key: '1 GET @page/new' });
  assert.ok(compareRuns(a, b).changes.some(c => c.kind === 'request-added'));
  b.summary.identity.scenarioId = 'other';
  assert.ok(compareRuns(a, b).warnings.some(w => w.startsWith('Scenario')));
  assert.throws(() => compareRuns(a, b, { tolerance: -1 }));
});

test('stream comparison detects changed order and missing connections independently of HTTP bodies', () => {
  const a = run(), b = run();
  a.streams = [{ key: 'ws @page/socket', messages: [{ payloadHash: 'A' }, { payloadHash: 'B' }] }];
  b.streams = [{ key: 'ws @page/socket', messages: [{ payloadHash: 'B' }, { payloadHash: 'A' }] }];
  assert.equal(compareRuns(a, b).changes.filter(c => c.kind === 'stream-message-changed').length, 2);
  b.streams = [];
  assert.ok(compareRuns(a, b).changes.some(c => c.kind === 'stream-connection-changed'));
});

test('offline loader normalizes page origins and JSON key order, and rejects artifact escapes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-compare-'));
  try {
    const runs = [];
    for (const [i, body] of ['{"a":1,"b":2}', '{"b":2,"a":1}'].entries()) {
      const dir = join(root, String(i));
      await mkdir(join(dir, 'network'), { recursive: true });
      const origin = `http://localhost:${8000 + i}`;
      await writeFile(join(dir, 'summary.json'), JSON.stringify({ targetOrigin: origin, capture: 'captured', identity: { scenarioId: 'sum' } }));
      await writeFile(join(dir, 'network', 'body.json'), body);
      await writeFile(join(dir, 'network/evidence.json'), JSON.stringify({ requests: [{ inScope: true, actionId: 1, request: { method: 'GET', url: origin + '/sum' }, response: { status: 200 }, body: { file: 'body.json' } }] }));
      runs.push(await loadRun(dir));
    }
    assert.deepEqual(compareRuns(...runs).changes, []);
    for (const [i, origin] of ['https://api-a.test', 'https://api-b.test'].entries()) await writeFile(join(root, String(i), 'network/evidence.json'), JSON.stringify({ requests: [{ inScope: true, actionId: 1, request: { method: 'GET', url: origin + '/sum' }, response: { status: 200 }, body: { file: 'body.json' } }] }));
    const [a, b] = await Promise.all([loadRun(join(root, '0'), { aliases: { 'https://api-a.test': '@api' } }), loadRun(join(root, '1'), { aliases: { 'https://api-b.test': '@api' } })]);
    assert.deepEqual(compareRuns(a, b).changes, []);
    assert.throws(() => originAliases({ 'https://user:pass@api.test': '@api' }));
    assert.throws(() => originAliases({ 'https://api.test': '@page' }));
    await writeFile(join(root, '0/network/evidence.json'), JSON.stringify({ requests: [{ inScope: true, request: { method: 'GET', url: 'http://localhost/sum' }, body: { file: '../../outside.json' } }] }));
    await assert.rejects(loadRun(join(root, '0')), /escapes capture/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
