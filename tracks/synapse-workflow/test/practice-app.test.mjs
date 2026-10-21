import test from 'node:test';
import assert from 'node:assert/strict';
import { startPracticeApp } from '../src/practice/app.mjs';

async function app(t) { const a = await startPracticeApp({ port: 0 }); t.after(() => a.close()); return a; }
const auth = (a, who) => ({ authorization: `Bearer ${a.tokens[who]}` });
async function request(a, path, options = {}) { const response = await fetch(a.url + path, options); return { response, body: await response.json() }; }
async function login(a, user) {
  const csrf = await request(a, '/api/csrf'), csrfCookie = csrf.response.headers.get('set-cookie').split(';')[0];
  const result = await request(a, '/api/session', { method: 'POST', headers: { origin: a.url, 'content-type': 'application/json', cookie: csrfCookie, 'x-csrf-token': csrf.body.csrf }, body: JSON.stringify({ user }) });
  assert.equal(result.response.status, 200);
  assert.match(result.response.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  return { profile: result.body.profile, headers: { origin: a.url, 'content-type': 'application/json', cookie: csrfCookie + '; ' + result.response.headers.get('set-cookie').split(';')[0], 'x-csrf-token': csrf.body.csrf } };
}

test('anonymous data is unavailable; authenticated identities and lists are scoped to each fictional organization', async t => {
  const a = await app(t);
  for (const path of ['/api/me', '/api/work-orders']) {
    const r = await request(a, path); assert.equal(r.response.status, 401); assert.deepEqual(r.body, { error: 'Authentication required' });
  }
  for (const who of ['alice', 'bob']) {
    const me = await request(a, '/api/me', { headers: auth(a, who) });
    assert.equal(me.body.profile.id, who); assert.equal(me.body.profile.tenant, a.identities[who].tenant); assert.equal(me.body.profile.role, 'member');
    const list = await request(a, '/api/work-orders', { headers: auth(a, who) });
    assert.equal(list.response.status, 200); assert.equal(list.body.orders.length, 3);
    assert.ok(list.body.orders.every(o => o.tenant === a.identities[who].tenant));
    const detail = await request(a, '/api/work-orders/' + list.body.orders[0].id, { headers: auth(a, who) });
    assert.equal(detail.body.order.id, list.body.orders[0].id);
    const other = await request(a, '/api/work-orders/' + (who === 'alice' ? 'WO-S201' : 'WO-N101'), { headers: auth(a, who) });
    assert.equal(other.response.status, 404); assert.deepEqual(other.body, { error: 'Work order not found' });
  }
  assert.equal((await request(a, '/api/me', { headers: { authorization: 'Bearer unknown' } })).response.status, 401);
  assert.equal(a.isListening(), true); await a.close(); assert.equal(a.isListening(), false); await a.close();
  assert.ok(a.requestLog.every(r => Object.keys(r).join(',') === 'method,path,actorId'));
  assert.ok(!JSON.stringify(a.requestLog).includes(a.tokens.alice));
});

test('ordinary member submission and same-organization approver approval preserve workflow rules', async t => {
  const a = await app(t), alice = await login(a, 'alice');
  assert.equal(alice.profile.id, 'alice');
  const post = (path, headers) => request(a, path, { method: 'POST', headers, body: '{}' });
  const before = await post('/api/work-orders/WO-N101/approve', alice.headers); assert.equal(before.response.status, 403);
  const submitted = await post('/api/work-orders/WO-N101/submit', alice.headers); assert.equal(submitted.body.order.state, 'submitted');
  assert.equal((await post('/api/work-orders/WO-N101/submit', alice.headers)).response.status, 409);
  const dana = await login(a, 'dana'); assert.equal((await post('/api/work-orders/WO-N101/approve', dana.headers)).response.status, 404);
  const carol = await login(a, 'carol'); assert.equal(carol.profile.role, 'approver');
  assert.equal((await post('/api/work-orders/WO-N101/approve', carol.headers)).body.order.state, 'approved');
  assert.equal((await post('/api/work-orders/WO-N101/approve', carol.headers)).response.status, 409);
  const loggedOut = await post('/api/logout', alice.headers); assert.equal(loggedOut.response.status, 200);
  assert.equal((await request(a, '/api/me', { headers: alice.headers })).response.status, 401);
  assert.equal((await request(a, '/api/me', { headers: auth(a, 'alice') })).response.status, 200, 'browser logout does not revoke the separate integration token');
});

test('origin, cookie CSRF, input and routing boundaries reject writes without changing ordinary state', async t => {
  const a = await app(t), alice = await login(a, 'alice');
  const write = headers => request(a, '/api/work-orders/WO-N101/submit', { method: 'POST', headers, body: '{}' });
  assert.equal((await write({ ...alice.headers, origin: 'http://outside.invalid' })).response.status, 403);
  const noCsrf = { ...alice.headers }; delete noCsrf['x-csrf-token']; assert.equal((await write(noCsrf)).response.status, 403);
  assert.equal((await write({ ...alice.headers, 'content-type': 'text/plain' })).response.status, 415);
  assert.equal((await write({ ...alice.headers, 'sec-fetch-site': 'cross-site' })).response.status, 403);
  assert.equal((await request(a, '/api/work-orders/WO-N101', { headers: auth(a, 'alice') })).body.order.state, 'draft');
  assert.equal((await request(a, '/api/session', { method: 'POST', headers: alice.headers, body: '{bad' })).response.status, 400);
  assert.equal((await request(a, '/api/session', { method: 'POST', headers: alice.headers, body: JSON.stringify({ user: 'constructor' }) })).response.status, 400);
  assert.equal((await request(a, '/api/session', { method: 'POST', headers: alice.headers, body: JSON.stringify({ user: ['alice'] }) })).response.status, 400);
  assert.equal((await request(a, '/api/session', { method: 'POST', headers: { origin: a.url, authorization: 'Bearer unknown', 'content-type': 'application/json' }, body: JSON.stringify({ user: 'alice' }) })).response.status, 403);
  assert.equal((await request(a, '/api/session', { method: 'POST', headers: alice.headers, body: JSON.stringify({ user: 'alice', extra: 'x'.repeat(3000) }) })).response.status, 413);
  assert.equal((await request(a, '/api/me?secret=value')).response.status, 400);
  const options = await request(a, '/api/me', { method: 'OPTIONS' }); assert.equal(options.response.status, 405); assert.equal(options.response.headers.has('access-control-allow-origin'), false);
  const changed = await write({ ...auth(a, 'alice'), origin: a.url, 'content-type': 'application/json' }); assert.equal(changed.body.order.state, 'submitted');
});

test('self-contained UI includes guided labeling and secret-free assets; restart resets state and tokens', async t => {
  const a = await app(t), response = await fetch(a.url), html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /Synapse Practice Workspace/); assert.match(html, /not a blind evaluation/);
  assert.match(html, /prefers-color-scheme/); assert.match(html, /max-width:800px/); assert.match(html, /aria-live/);
  for (const token of Object.values(a.tokens)) assert.ok(!html.includes(token));
  assert.match(response.headers.get('content-security-policy'), /default-src 'none'/);
  assert.doesNotMatch(html, /<script[^>]+src=/); assert.doesNotMatch(html, /https:\/\//);
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]; assert.equal(scripts.length, 1); assert.doesNotThrow(() => new Function(scripts[0][1]), 'browser script parses');
  const b = await app(t); assert.notEqual(a.tokens.alice, b.tokens.alice);
  assert.equal((await request(b, '/api/work-orders/WO-N101', { headers: auth(b, 'alice') })).body.order.state, 'draft');
});
