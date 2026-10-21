import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { EventEmitter } from 'node:events';
import { createHash } from 'node:crypto';
import { createPracticeTarget } from '../src/practice/session-target.mjs';

const action = (kind, actor = 'anonymous', rest = {}) => ({ kind, actor, ...rest });
async function fixture(t) { const target = await createPracticeTarget(); t.after(() => target.close()); return target; }
const errorCode = code => error => error.code === `NBRET_PRACTICE_${code}` && error.complete === false && !Object.hasOwn(error, 'response');

test('typed gate rejects arbitrary inputs, unknown actors and unobserved objects without a request', async t => {
  await assert.rejects(createPracticeTarget({ url: 'http://outside.invalid' }), errorCode('CONFIGURATION_REJECTED'));
  const target = await fixture(t);
  let getterRan = false;
  const getter = { kind: 'profile', get actor() { getterRan = true; return 'alice'; } };
  const bad = [null, [], new Date(), { ...action('page'), url: 'http://outside.invalid' }, action('profile', 'unknown'),
    action('page', 'alice'), action('order', 'alice'), action('orders', 'alice', { objectId: 'WO-N101' }),
    action('order', 'alice', { objectId: '../file' }), action('transition', 'alice', { objectId: 'WO-N101', transition: 'delete' }), getter];
  for (const value of bad) await assert.rejects(target.execute(value), errorCode('ACTION_REJECTED'));
  assert.equal(getterRan, false);
  await assert.rejects(target.execute(action('order', 'alice', { objectId: 'WO-N101' })), errorCode('OBJECT_NOT_OBSERVED'));
  await assert.rejects(target.execute(action('transition', 'alice', { objectId: 'WO-N101', transition: 'submit' })), errorCode('OBJECT_NOT_OBSERVED'));
  assert.deepEqual(target.requestLog, []);
});

test('all five observed identities and approver setup receipts are bound to server actors without credential output', async t => {
  const target = await fixture(t), captured = [], original = http.request;
  t.mock.method(http, 'request', function (url, options, callback) { captured.push(options.headers); return original.call(this, url, options, callback); });
  const observations = [];
  for (const actor of ['anonymous', 'alice', 'bob', 'carol', 'dana']) {
    const result = await target.execute(action('profile', actor)); observations.push(result);
    assert.equal(result.request.actor, actor); assert.equal(result.identity.principal, actor); assert.equal(result.transport.complete, true);
    if (actor === 'anonymous') assert.deepEqual(result.response.value, { error: 'Authentication required' });
    else { assert.equal(result.response.value.profile.id, actor); assert.equal(result.response.value.profile.tenant, result.identity.tenant); assert.equal(result.response.value.profile.role, result.identity.role); }
    if (['carol', 'dana'].includes(actor)) {
      assert.equal(result.setupReceipts.length, 2);
      assert.deepEqual(result.setupReceipts.map(r => r.request), [{ method: 'GET', path: '/api/csrf', actor: 'anonymous' }, { method: 'POST', path: '/api/session', actor: 'anonymous' }]);
      assert.equal(result.setupReceipts[0].response.representation, 'json-redacted');
      assert.deepEqual(result.setupReceipts[0].response.value, { csrfAvailable: true });
      assert.equal(Object.hasOwn(result.setupReceipts[0].response, 'bodyText'), false);
    } else assert.equal(result.setupReceipts.length, 0);
    assert.equal(result.response.bodySha256, createHash('sha256').update(JSON.stringify(result.response.value)).digest('hex'));
    assert.deepEqual(JSON.parse(result.response.bodyText), result.response.value);
  }
  assert.equal(target.requestLog.length, 9);
  assert.deepEqual(target.requestLog.map(r => r.actorId), [null, 'alice', 'bob', null, null, 'carol', null, null, 'dana']);
  const output = JSON.stringify({ description: target.describe(), observations, requestLog: target.requestLog });
  for (const header of captured) {
    if (header.authorization) assert.ok(!output.includes(header.authorization.slice(7)));
    for (const pair of (header.cookie || '').split(';')) { const value = pair.split('=')[1]?.trim(); if (value) assert.ok(!output.includes(value)); }
    if (header['x-csrf-token']) assert.ok(!output.includes(header['x-csrf-token']));
  }
  const copy = target.requestLog; copy[0].actorId = 'spoofed'; assert.equal(target.requestLog[0].actorId, null);
  assert.match(target.describe().sourceHash, /^[a-f0-9]{64}$/); assert.match(target.describe().origin, /^http:\/\/127\.0\.0\.1:\d+$/);
});

test('observed objects support cross-identity checks and ordinary state changes with fresh reads', async t => {
  const target = await fixture(t);
  const list = await target.execute(action('orders', 'alice'));
  assert.equal(list.setupReceipts[0].request.path, '/api/me'); assert.equal(list.setupReceipts[0].request.actor, 'alice');
  assert.equal(list.response.value.orders.length, 3);
  const id = list.response.value.orders.find(o => o.state === 'draft').id;
  const foreign = await target.execute(action('order', 'bob', { objectId: id }));
  assert.equal(foreign.response.status, 404); assert.deepEqual(foreign.response.value, { error: 'Work order not found' });
  const before = await target.execute(action('order', 'alice', { objectId: id })); assert.equal(before.response.value.order.state, 'draft');
  const denied = await target.execute(action('transition', 'carol', { objectId: id, transition: 'approve' })); assert.equal(denied.response.status, 409);
  assert.equal(denied.setupReceipts.at(-1).identity.principal, 'carol');
  const submitted = await target.execute(action('transition', 'alice', { objectId: id, transition: 'submit' })); assert.equal(submitted.response.value.order.state, 'submitted');
  const approved = await target.execute(action('transition', 'carol', { objectId: id, transition: 'approve' })); assert.equal(approved.response.value.order.state, 'approved');
  const fresh = await target.execute(action('order', 'alice', { objectId: id })); assert.equal(fresh.response.value.order.state, 'approved');
  assert.equal(before.response.value.order.state, 'draft', 'old observation is an independent parsed value');
  const other = await fixture(t); await assert.rejects(other.execute(action('order', 'alice', { objectId: id })), errorCode('OBJECT_NOT_OBSERVED'));
  await target.close(); assert.equal(target.isListening(), false); await target.close();
  const count = target.requestLog.length; await assert.rejects(target.execute(action('profile')), errorCode('CLOSED')); assert.equal(target.requestLog.length, count);
});

test('serialized actions and request admission cannot overspend the 60-request budget', async t => {
  const target = await fixture(t);
  const input = action('orders', 'alice'), pending = target.execute(input); input.actor = 'bob';
  assert.equal((await pending).identity.principal, 'alice');
  const transitions = await Promise.all([1, 2].map(() => target.execute(action('transition', 'alice', { objectId: 'WO-N101', transition: 'submit' }))));
  assert.deepEqual(transitions.map(r => r.response.status), [200, 409]);
  while (target.requestLog.length < 58) await target.execute(action('profile'));
  const before = target.requestLog.length;
  await assert.rejects(target.execute(action('orders', 'dana')), errorCode('REQUEST_LIMIT'));
  assert.equal(target.requestLog.length, before, 'reserve setup+main before any bootstrap request');
  await Promise.all([target.execute(action('profile')), target.execute(action('profile'))]);
  await assert.rejects(target.execute(action('profile')), errorCode('REQUEST_LIMIT'));
  assert.equal(target.requestLog.length, 60);
});

function fakeRequest(t, respond) {
  const state = { destroyed: false, respond };
  t.mock.method(http, 'request', (url, options, callback) => {
    const req = new EventEmitter();
    req.destroy = () => { state.destroyed = true; req.emit('error', new Error('secret must not escape')); };
    req.end = () => queueMicrotask(() => state.respond(callback, req));
    return req;
  });
  return state;
}

test('partial and over-limit response failures are sanitized and never produce complete observations', async t => {
  const target = await fixture(t);
  const fake = fakeRequest(t, callback => {
    const res = new EventEmitter(); Object.assign(res, { statusCode: 200, headers: { 'content-type': 'application/json' }, complete: false, destroy() {} });
    callback(res); res.emit('data', Buffer.from('{"secret":"never-retain"')); res.emit('aborted');
  });
  await assert.rejects(target.execute(action('profile')), error => errorCode('RESPONSE_ABORTED')(error) && !JSON.stringify(error).includes('never-retain'));
  assert.equal(fake.destroyed, true); assert.equal(target.requestLog.length, 0);
  fake.respond = callback => {
    const res = new EventEmitter(); Object.assign(res, { statusCode: 200, headers: { 'content-type': 'application/json' }, complete: true, destroy() {} });
    callback(res); res.emit('data', Buffer.alloc(65537));
  };
  await assert.rejects(target.execute(action('page')), errorCode('RESPONSE_LIMIT'));
});

test('hard request timer destroys a stalled operation and close interrupts an active request', async t => {
  const target = await fixture(t); const fake = fakeRequest(t, () => {});
  const started = performance.now(); await assert.rejects(target.execute(action('profile')), errorCode('REQUEST_DEADLINE'));
  assert.ok(performance.now() - started < 4500); assert.equal(fake.destroyed, true);
  const pending = target.execute(action('profile'));
  await new Promise(resolve => setImmediate(resolve));
  await target.close(); await assert.rejects(pending, errorCode('CLOSED')); assert.equal(target.isListening(), false);
});

test('idle reading is allowed within session lifetime; expired session rejects without traffic', async t => {
  const target = await fixture(t), now = performance.now(); let simulatedNow = now + 100000;
  t.mock.method(performance, 'now', () => simulatedNow);
  assert.equal((await target.execute(action('profile'))).response.status, 401, '100s idle is not cumulative execution');
  simulatedNow = now + 31 * 60000;
  const before = target.requestLog.length;
  await assert.rejects(target.execute(action('profile')), errorCode('SESSION_EXPIRED'));
  assert.equal(target.requestLog.length, before);
});

test('page observation projects inert text, without script/style/nonce or bearer material', async t => {
  const target = await fixture(t), page = await target.execute(action('page'));
  assert.equal(page.response.representation, 'html-summary'); assert.equal(page.response.status, 200);
  assert.equal(Object.hasOwn(page.response, 'bodyText'), false);
  assert.equal(page.response.value.title, 'Synapse Practice Workspace');
  assert.ok(page.response.value.headings.includes('Keep good work moving.'));
  assert.doesNotMatch(JSON.stringify(page), /nonce=|<script|<style|Bearer /);
  assert.ok(page.response.bodyBytes <= 65536); assert.equal(page.setupReceipts.length, 0);
});

test('cumulative execution exhaustion rejects future admission even when earlier requests failed', async t => {
  const target = await fixture(t); let simulatedNow = performance.now(), calls = 0;
  t.mock.method(performance, 'now', () => simulatedNow);
  fakeRequest(t, (_callback, req) => { calls++; simulatedNow += 45001; req.emit('error', new Error('synthetic transport failure')); });
  await assert.rejects(target.execute(action('profile')), errorCode('CONNECTION_ERROR'));
  await assert.rejects(target.execute(action('profile')), errorCode('CONNECTION_ERROR'));
  await assert.rejects(target.execute(action('profile')), errorCode('GLOBAL_DEADLINE'));
  assert.equal(calls, 2, 'failed execution consumes the global budget; a third request is not sent');
  assert.deepEqual(target.requestLog, []);
});
