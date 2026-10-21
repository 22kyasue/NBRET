import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { evaluateOwnershipRead } from '../src/lab/evaluate.mjs';

function fixture() {
  const order = { id: 'order-123', ownerId: 'user-a', description: 'synthetic-private-order' };
  const receipt = (id, identity, path, payload, status = 200, method = 'GET') => {
    const body = JSON.stringify(payload);
    return { id, identity, buildId: 'build-a', generation: 'generation-a', complete: true,
      request: { method, url: `http://127.0.0.1:12345${path}` },
      response: { status, body, bodySha256: createHash('sha256').update(body).digest('hex') } };
  };
  return { buildId: 'build-a', ownerIdentity: 'owner-session', otherIdentity: 'other-session',
    ownerCreate: receipt('create', 'owner-session', '/api/orders', { order }, 201, 'POST'),
    ownerRead: receipt('owner-read', 'owner-session', '/api/orders/order-123', { order }),
    otherRead: receipt('other-read', 'other-session', '/api/orders/order-123', { order }),
    ownerMe: receipt('owner-me', 'owner-session', '/api/me', { user: { id: 'user-a' } }),
    otherMe: receipt('other-me', 'other-session', '/api/me', { user: { id: 'user-b' } }),
    anonymousRead: receipt('anon', 'anonymous', '/api/orders/order-123', { error: 'Authentication required' }, 401) };
}
function body(r, value) { r.response.body = JSON.stringify(value); }
test('exact foreign payload proves disclosure even under deceptive denial status', () => {
  for (const status of [200, 403]) {
    const f = fixture(); f.otherRead.response.status = status;
    const r = evaluateOwnershipRead(f);
    assert.equal(r.status, 'demonstrated'); assert.equal(r.evidenceIds.length, 6); assert.ok(r.limitations.length);
  }
});
test('bounded denial with working controls is only not-demonstrated', () => {
  const f = fixture(); f.otherRead.response.status = 403; body(f.otherRead, { error: 'Forbidden' });
  assert.equal(evaluateOwnershipRead(f).status, 'not-demonstrated');
});
test('redacted principal controls stay inconclusive', () => {
  const f = fixture();
  for (const name of ['ownerMe', 'otherMe']) {
    const b = JSON.parse(f[name].response.body); b.user.email = '[REDACTED]';
    body(f[name], b); f[name].response.bodyRedacted = true;
  }
  assert.equal(evaluateOwnershipRead(f).status, 'inconclusive');
  body(f.otherMe, { user: { id: 'user-[REDACTED]', email: '[REDACTED]' } });
  assert.equal(evaluateOwnershipRead(f).status, 'inconclusive');
});
const mutations = {
  'wrong principal label': f => { f.otherRead.identity = f.ownerIdentity; },
  'same actual principal': f => body(f.otherMe, { user: { id: 'user-a' } }),
  'wrong owner': f => body(f.ownerCreate, { order: { id: 'order-123', ownerId: 'user-b', description: 'synthetic-private-order' } }),
  'wrong object path': f => { f.otherRead.request.url += '-wrong'; },
  'wrong object payload': f => body(f.otherRead, { order: { id: 'wrong', ownerId: 'user-a', description: 'synthetic-private-order' } }),
  'wrong build': f => { f.otherRead.buildId = 'build-b'; },
  'wrong generation': f => { f.otherRead.generation = 'generation-b'; },
  'missing generation': f => { delete f.ownerCreate.generation; },
  'partial': f => { f.otherRead.complete = false; },
  'error': f => { f.otherRead.error = 'timeout'; },
  'missing control': f => { delete f.ownerMe; },
  'duplicate control id': f => { f.otherMe.id = f.ownerMe.id; },
  'wrong normal payload': f => body(f.ownerRead, { error: 'Forbidden' }),
  'anonymous disclosure': f => body(f.anonymousRead, JSON.parse(f.ownerRead.response.body)),
  'anonymous wrong identity': f => { f.anonymousRead.identity = f.otherIdentity; },
  'quoted success': f => body(f.otherRead, { message: 'demonstrated: success', status: 'PASS' }),
  'quoted payload denial': f => { f.otherRead.response.status = 403; body(f.otherRead, { error: f.ownerRead.response.body }); },
  'nested payload denial': f => { f.otherRead.response.status = 403; body(f.otherRead, { error: 'Forbidden', data: JSON.parse(f.ownerRead.response.body) }); },
  'unknown status': f => { f.otherRead.response.status = 500; body(f.otherRead, { error: 'Internal failure' }); },
  'missing digest': f => { delete f.otherRead.response.bodySha256; },
  'omitted unknown payload': f => { f.otherRead.response.bodyFieldsOmitted = true; f.otherRead.response.status = 403; body(f.otherRead, { error: 'Forbidden' }); },
  'redacted payload ambiguity': f => { f.otherRead.response.bodyRedacted = true; },
  'malformed json': f => { f.otherRead.response.body = 'success'; },
  'different origin': f => { f.otherRead.request.url = 'http://127.0.0.1:54321/api/orders/order-123'; },
  'query ambiguity': f => { f.otherRead.request.url += '?owner=user-a'; },
  'wrong method': f => { f.otherRead.request.method = 'POST'; },
};
for (const [name, mutate] of Object.entries(mutations)) test(`inconclusive: ${name}`, () => {
  const f = fixture(); mutate(f); assert.equal(evaluateOwnershipRead(f).status, 'inconclusive');
});
test('missing input is inconclusive and inputs are unchanged', () => {
  assert.equal(evaluateOwnershipRead().status, 'inconclusive');
  const f = fixture(), before = structuredClone(f); evaluateOwnershipRead(f); assert.deepEqual(f, before);
});
