import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { observedShape, observeContracts, mergeContracts } from '../src/contracts.mjs';

test('shape observations preserve alternatives and uncertainty without sample values', () => {
  const shape = observedShape({ items: [1, 'value', 2], token: '[REDACTED]', nullable: null });
  assert.deepEqual(shape.fields.items.items, [{ type: 'number' }, { type: 'string' }]);
  assert.equal(shape.fields.token.type, 'unknown');
  assert.equal(shape.fields.nullable.type, 'null');
  assert.ok(!JSON.stringify(shape).includes('value'));
});

test('multi-run observations expose missing fields without asserting a required schema', () => {
  const report = shape => ({ identity: null, endpoints: [{ key: 'POST @page/sum', observations: 1, statuses: [200], queryKeys: [], requestShapes: [{ shape: observedShape(shape), observations: 1 }], responseShapes: [], requestBodiesUnknown: 0, responseBodiesUnknown: 1 }] });
  const merged = mergeContracts([report({ a: 1, b: 2 }), report({ a: 3 })]).endpoints[0];
  assert.equal(merged.requestFieldPresence.objectSamples, 2);
  assert.equal(merged.requestFieldPresence.fields.find(f => f.name === 'b').missingInSomeObservedSamples, true);
  assert.equal(merged.requestFieldPresence.fields.find(f => f.name === 'a').missingInSomeObservedSamples, false);
  assert.ok(!JSON.stringify(merged).includes('required'));
});

test('field presence covers nested paths and separates error responses by status', () => {
  const response = (status, value) => ({ shape: observedShape(value), observations: 1, status });
  const report = { identity: null, endpoints: [{ key: 'GET @page/items', observations: 3, statuses: [200, 401], queryKeys: [], requestShapes: [], requestBodiesUnknown: 0, responseBodiesUnknown: 0,
    responseShapes: [response(200, { items: [{ id: 1, name: 'a' }, { id: 2 }], user: { id: 1 } }), response(200, { items: [], user: { id: 2, plan: 'pro' } }), response(401, { error: 'Sign in' })] }] };
  const merged = mergeContracts([report]).endpoints[0], field = (presence, name) => presence.fields.find(f => f.name === name);
  const ok = merged.responseFieldPresenceByStatus[200];
  assert.equal(ok.objectSamples, 2);
  assert.equal(field(ok, 'items').missingInSomeObservedSamples, false);
  assert.equal(field(ok, 'user.id').missingInSomeObservedSamples, false);
  assert.equal(field(ok, 'user.plan').missingInSomeObservedSamples, true);
  assert.equal(field(ok, 'items[].id').missingInSomeObservedSamples, false);
  assert.equal(field(ok, 'items[].name').missingInSomeObservedSamples, true);
  assert.equal(field(ok, 'error'), undefined);
  assert.equal(field(merged.responseFieldPresenceByStatus[401], 'error').missingInSomeObservedSamples, false);
  assert.equal(field(merged.responseFieldPresence, 'items').missingInSomeObservedSamples, true);
});

test('contracts group observed request and response shapes and expose missing bodies', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-contracts-'));
  try {
    await mkdir(join(root, 'network'));
    await writeFile(join(root, 'summary.json'), '{"capture":"captured","targetOrigin":"https://example.test"}');
    const r = { inScope: true, request: { method: 'POST', url: 'https://example.test/sum', postData: { text: '{"a":20,"b":5}' } }, response: { status: 200 }, body: { file: 'result.json' } };
    await writeFile(join(root, 'network/result.json'), '{"result":25}');
    await writeFile(join(root, 'network/evidence.json'), JSON.stringify({ requests: [r, { ...r, body: { omitted: 'size-limit' } }] }));
    const contracts = await observeContracts(root), endpoint = contracts.endpoints[0];
    assert.equal(endpoint.key, 'POST @page/sum');
    assert.equal(endpoint.requestShapes[0].observations, 2);
    assert.equal(endpoint.responseBodiesUnknown, 1);
    assert.equal(endpoint.responseShapes[0].shape.fields.result.type, 'number');
  } finally { await rm(root, { recursive: true, force: true }); }
});
