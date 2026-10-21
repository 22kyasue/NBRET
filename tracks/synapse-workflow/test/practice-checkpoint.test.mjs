import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { startPracticeApp } from '../src/practice/app.mjs';
import { createPracticeTarget } from '../src/practice/session-target.mjs';

test('private snapshots survive close, copy data, and restore with fresh credentials', async t => {
  const first = await startPracticeApp(); t.after(() => first.close());
  const orders = first.snapshotOrders(); orders[0].state = 'submitted';
  assert.equal(first.snapshotOrders()[0].state, 'draft');
  await first.close();
  assert.equal(first.snapshotOrders().length, 6);
  const next = await startPracticeApp({ initialOrders: orders }); t.after(() => next.close());
  orders[0].state = 'approved';
  assert.equal(next.snapshotOrders()[0].state, 'submitted');
  assert.notEqual(first.tokens.alice, next.tokens.alice);
  const old = await fetch(next.url + '/api/me', { headers: { authorization: 'Bearer ' + first.tokens.alice } });
  assert.equal(old.status, 401);
  const fresh = await fetch(next.url + '/api/me', { headers: { authorization: 'Bearer ' + next.tokens.alice } });
  assert.equal((await fresh.json()).profile.id, 'alice');
  assert.ok(!JSON.stringify(next.snapshotOrders()).includes(next.tokens.alice));
});

test('checkpoint continues workflow but grants no discovery or prior profile verification', async t => {
  const first = await createPracticeTarget(); t.after(() => first.close());
  await first.execute({ kind: 'orders', actor: 'alice' });
  await first.execute({ kind: 'transition', actor: 'alice', objectId: 'WO-N101', transition: 'submit' });
  await first.close();
  const checkpoint = first.exportCheckpoint();
  assert.deepEqual(Object.keys(checkpoint), ['schemaVersion', 'kind', 'sourceHash', 'orders']);
  assert.equal(checkpoint.orders[0].state, 'submitted');
  const next = await createPracticeTarget({ checkpoint }); t.after(() => next.close());
  checkpoint.orders[0].state = 'draft';
  assert.equal(next.exportCheckpoint().orders[0].state, 'submitted');
  await assert.rejects(next.execute({ kind: 'order', actor: 'alice', objectId: 'WO-N101' }), { code: 'NBRET_PRACTICE_OBJECT_NOT_OBSERVED' });
  assert.deepEqual(next.requestLog, []);
  const listed = await next.execute({ kind: 'orders', actor: 'alice' });
  assert.equal(listed.setupReceipts[0].request.path, '/api/me');
  assert.equal(listed.response.value.orders[0].state, 'submitted');
  const approved = await next.execute({ kind: 'transition', actor: 'carol', objectId: 'WO-N101', transition: 'approve' });
  assert.equal(approved.response.value.order.state, 'approved');
  assert.equal(approved.setupReceipts.length, 3);
  const usage = next.usage(); assert.equal(usage.requestCount, next.requestLog.length);
  usage.requestCount = 999; assert.notEqual(next.usage().requestCount, 999);
  assert.ok(next.usage().executionMs > 0);
});

test('invalid inert configuration and checkpoint corruption never start a listener or invoke getters', async t => {
  const target = await createPracticeTarget(); const valid = target.exportCheckpoint(); await target.close();
  let listens = 0, getters = 0;
  t.mock.method(http.Server.prototype, 'listen', () => { listens++; throw new Error('Unexpected listen'); });
  const copy = () => structuredClone(valid);
  const variants = [];
  for (const change of [c => c.sourceHash = '0'.repeat(64), c => c.kind = 'other', c => c.schemaVersion = 2,
    c => c.extra = true, c => c.orders[0].state = 'broken', c => c.orders[0].tenant = 'south',
    c => c.orders[0].budget++, c => c.orders[1].id = c.orders[0].id, c => c.orders.pop(),
    c => c.orders[0].extra = 'value', c => delete c.orders[0].owner,
    c => Object.defineProperty(c.orders[0], 'state', { enumerable: true, get() { getters++; return 'draft'; } }),
    c => Object.defineProperty(c.orders, '0', { enumerable: true, get() { getters++; return valid.orders[0]; } })]) {
    const c = copy(); change(c); variants.push({ checkpoint: c });
  }
  variants.push({}, { url: 'http://outside.invalid' }, { checkpoint: valid, extra: true }, undefined,
    Object.defineProperty({}, 'checkpoint', { enumerable: true, get() { getters++; return valid; } }));
  for (const config of variants) await assert.rejects(createPracticeTarget(config), { code: 'NBRET_PRACTICE_CONFIGURATION_REJECTED' });
  await assert.rejects(createPracticeTarget({ checkpoint: valid }, {}));
  await assert.rejects(startPracticeApp({ url: 'http://outside.invalid' }));
  await assert.rejects(startPracticeApp(Object.defineProperty({}, 'initialOrders', { enumerable: true, get() { getters++; return valid.orders; } })));
  assert.equal(getters, 0); assert.equal(listens, 0);
});
