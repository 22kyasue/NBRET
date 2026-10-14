import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { localResponses } from '../src/responses.mjs';
import { runCapture } from '../src/run.mjs';
import { startFixture } from './fixture.mjs';

test('response substitution rejects remote targets and ambiguous or unbounded recipes', () => {
  const recipe = { path: '/sum', method: 'POST', json: { result: 0 } };
  assert.throws(() => localResponses('https://example.test', [recipe]));
  for (const item of [{ ...recipe, path: '//evil.test/' }, { ...recipe, delayMs: 5001 }, { ...recipe, status: 204 }, { ...recipe, json: undefined }]) assert.throws(() => localResponses('http://127.0.0.1', [item]));
  assert.throws(() => localResponses('http://127.0.0.1', [recipe, recipe]));
});

for (const captureTargets of [false, true]) test(`local delayed failure is recorded as an experiment and leaves the actual server behavior intact${captureTargets ? ' (with target capture holding responses)' : ''}`, { timeout: 30000 }, async () => {
  const fixture = await startFixture();
  await mkdir('runs', { recursive: true });
  const outDir = resolve(`runs/response-experiment-${Date.now()}`);
  try {
    const summary = await runCapture({ url: fixture.url, outDir, rea: false, copy: false, scenarioId: 'sum-error', captureTargets,
      responses: [{ path: '/sum', method: 'POST', status: 503, delayMs: 50, json: { error: 'temporarily unavailable', token: 'secret-fixture-token' } }],
      actions: [{ type: 'click', selector: '#calculate' }, { type: 'wait', ms: 100 }] });
    assert.equal(summary.capture, 'captured');
    assert.equal(summary.responseOverrides[0].hits, 1);
    assert.equal(summary.identity.state, 'fresh-profile-with-local-response-overrides');
    const evidence = JSON.parse(await readFile(join(outDir, 'network/evidence.json'), 'utf8'));
    const r = evidence.requests.find(r => r.request.url.endsWith('/sum'));
    assert.equal(r.response.status, 503);
    assert.deepEqual(JSON.parse(await readFile(join(outDir, 'network', r.body.file), 'utf8')), { error: 'temporarily unavailable', token: '[REDACTED]' });
    assert.ok(!JSON.stringify(summary).includes('secret-fixture-token'));
    const response = await fetch(new URL('/sum', fixture.url), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"a":20,"b":5}' });
    assert.deepEqual(await response.json(), { result: 25 });
  } finally { await fixture.close(); }
});
