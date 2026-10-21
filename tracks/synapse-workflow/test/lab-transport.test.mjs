import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { createLabTransport, getLabResponseBody, readEphemeralResponse } from '../src/lab/transport.mjs';

async function fixture(t, handler) {
  let hits = 0;
  const sockets = new Set();
  const server = http.createServer((req, res) => { hits++; handler(req, res); });
  server.on('connection', s => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => {
    for (const s of sockets) s.destroy();
    await new Promise(resolve => server.close(resolve));
  });
  return { origin: `http://127.0.0.1:${server.address().port}`, hits: () => hits, sockets };
}
function transport(t, options) {
  const tr = createLabTransport(options);
  t.after(() => tr.stop());
  return tr;
}
const sha = text => createHash('sha256').update(text).digest('hex');

test('exact numeric loopback config and pre-send rejection prevent URL/header scope escapes', async t => {
  const f = await fixture(t, (_req, res) => res.end('{}'));
  for (const origins of [[], ['http://localhost:5000'], ['http://127.1:5000'],
    ['http://2130706433:5000'], ['http://0x7f000001:5000'], ['http://127.0.0.1:0'],
    ['http://127.0.0.1:65536'], ['https://127.0.0.1:5000'], [`${f.origin}/`],
    [`${f.origin}?x=1`], [`${f.origin}/path`], [f.origin, f.origin], [f.origin, 'https://example.test']]) {
    assert.throws(() => createLabTransport({ origins }), /origins/);
  }
  for (const option of ['maxRequests', 'timeoutMs', 'maxResponseBytes', 'deadlineMs']) {
    assert.throws(() => createLabTransport({ origins: [f.origin], [option]: 0 }));
  }
  const tr = transport(t, { origins: [f.origin] });
  for (const url of [f.origin.replace('127.0.0.1', 'localhost'), f.origin.replace('127.0.0.1', '127.1'),
    f.origin.replace('127.0.0.1', '2130706433'), f.origin.replace('http://', 'http://user:password@'),
    `${f.origin}.example.test/`, 'http://127.0.0.1:1/', `${f.origin}/#fragment`, `${f.origin}\\evil`,
    'https://example.test/', 'file:///tmp/test']) {
    assert.equal((await tr.request({ url })).complete, false, url);
  }
  for (const headers of [{ Host: 'elsewhere.test' }, { 'Proxy-Authorization': 'secret' },
    { connection: 'upgrade' }, { 'content-length': '10' }, { accept: 'x\r\ny: z' },
    { accept: 'one', Accept: 'two' }]) {
    assert.equal((await tr.request({ url: f.origin, headers })).error.code, 'INVALID_HEADERS');
  }
  assert.equal((await tr.request({ url: f.origin, method: 'CONNECT' })).error.code, 'INVALID_METHOD');
  assert.equal((await tr.request({ url: f.origin, body: 'GET body' })).error.code, 'INVALID_BODY');
  assert.equal((await tr.request({ url: f.origin, proxy: f.origin })).error.code, 'INVALID_REQUEST');
  assert.equal(f.hits(), 0);
  assert.equal(tr.stats().sent, 0);
  assert.equal(tr.stats().denied, tr.stats().attempted);
});

test('malicious redirect never reaches even another admitted origin; environment proxies ignored', async t => {
  const destination = await fixture(t, (_req, res) => res.end('{}'));
  const source = await fixture(t, (_req, res) => {
    res.writeHead(302, { location: `${destination.origin}/steal?token=never-export-me` }); res.end('redirect');
  });
  const previous = process.env.HTTP_PROXY;
  process.env.HTTP_PROXY = destination.origin;
  t.after(() => { if (previous === undefined) delete process.env.HTTP_PROXY; else process.env.HTTP_PROXY = previous; });
  const tr = transport(t, { origins: [source.origin, destination.origin] });
  const receipt = await tr.request({ url: source.origin });
  assert.equal(receipt.complete, true);
  assert.equal(receipt.response.status, 302);
  assert.equal(source.hits(), 1);
  assert.equal(destination.hits(), 0);
  assert.ok(!JSON.stringify(receipt).includes('never-export-me'));
  assert.equal(tr.stats().sent, 1);
});

test('serialized receipts redact credentials, mailbox links and raw headers but preserve effect fields/digest', async t => {
  const password = 'Synthetic-password-12345';
  const token = 'synthetic-session-token-9876';
  const verify = 'verification-code-98765';
  const raw = JSON.stringify({ token, password, user: { id: 'user-A', email: 'alice@run.test' },
    order: { id: 'order-1', ownerId: 'user-A', description: 'synthetic order' },
    messages: [{ id: 'mail-1', to: 'alice@run.test', text: `http://127.0.0.1:8080/verify?token=${verify}` }],
    unexpected: 'unknown-field-is-omitted' });
  const f = await fixture(t, (req, res) => {
    assert.equal(req.headers.authorization, `Bearer ${token}`);
    res.writeHead(200, { 'content-type': 'application/json', 'set-cookie': `token=${token}`,
      'x-secret': password, 'x-lab-build-id': 'build-1', 'x-lab-generation': 'generation-1' }); res.end(raw);
  });
  const tr = transport(t, { origins: [f.origin] });
  const receipt = await tr.request({ url: `${f.origin}/login?password=${password}`, method: 'POST',
    headers: { authorization: `Bearer ${token}`, cookie: `session=${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'alice@run.test', password }), identity: 'account-a' });
  assert.equal(receipt.complete, true);
  assert.equal(receipt.identitySource, 'operator-declared');
  const serialized = JSON.stringify(receipt);
  for (const secret of [password, token, verify, 'unknown-field-is-omitted']) assert.ok(!serialized.includes(secret), secret);
  assert.equal(receipt.response.bodySha256, sha(raw));
  assert.equal(receipt.response.bodyFieldsOmitted, true);
  assert.equal(receipt.response.bodyRedacted, true);
  assert.equal(receipt.response.headers['x-lab-build-id'], 'build-1');
  assert.deepEqual(JSON.parse(receipt.response.body).order, { id: 'order-1', ownerId: 'user-A', description: 'synthetic order' });
  assert.equal(getLabResponseBody(receipt), raw);
  assert.equal(readEphemeralResponse(receipt).headers['set-cookie'][0], `token=${token}`);
  assert.equal(readEphemeralResponse({ ...receipt }), undefined);
  assert.equal(readEphemeralResponse(JSON.parse(serialized)), undefined);
  await tr.stop();
  assert.equal(readEphemeralResponse(receipt), undefined);
});

test('unknown nested response fields cannot be silently interpreted as absence of protected content', async t => {
  const f = await fixture(t, (_req, res) => {
    res.writeHead(403, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden', data: { order: { id: 'foreign-order' } } }));
  });
  const tr = transport(t, { origins: [f.origin] });
  const receipt = await tr.request({ url: f.origin });
  assert.equal(receipt.complete, true); // Complete wire collection is separate from evidence projection.
  assert.deepEqual(JSON.parse(receipt.response.body), { error: 'Forbidden' });
  assert.equal(receipt.response.bodyFieldsOmitted, true);
  assert.equal(receipt.response.bodyRedacted, false);
});

test('ordinary me/order/error JSON retains exact expected fields without omission', async t => {
  const payload = { order: { id: 'order-1', ownerId: 'alice', description: 'synthetic order' } };
  const f = await fixture(t, (_req, res) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(payload)); });
  const tr = transport(t, { origins: [f.origin] });
  const receipt = await tr.request({ url: f.origin });
  assert.deepEqual(JSON.parse(receipt.response.body), payload);
  assert.equal(receipt.response.bodyFieldsOmitted, false);
  assert.equal(receipt.response.bodyRedacted, false);
});

test('mail recipient query is masked in URL evidence without tainting later corroborated identity', async t => {
  const email = 'second-user@run.test';
  const f = await fixture(t, (req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(req.url.startsWith('/messages') ? '{"messages":[]}' : JSON.stringify({ user: { id: 'user-b', email } }));
  });
  const tr = transport(t, { origins: [f.origin] });
  const mail = await tr.request({ url: `${f.origin}/messages?recipient=${email}` });
  assert.ok(!mail.request.url.includes(email));
  const me = await tr.request({ url: `${f.origin}/api/me`, identity: 'account-b' });
  assert.equal(me.response.bodyFieldsOmitted, false);
  assert.equal(me.response.bodyRedacted, false);
  assert.equal(JSON.parse(me.response.body).user.email, email);
});

test('aggregate request budget is reserved across concurrent starts and no retry repeats a failed write', async t => {
  const f = await fixture(t, (_req, res) => res.destroy());
  const tr = transport(t, { origins: [f.origin], maxRequests: 2 });
  const receipts = await Promise.all([0, 1, 2, 3].map(() => tr.request({ url: f.origin, method: 'POST', body: '{}' })));
  assert.equal(receipts.filter(r => r.error.code === 'REQUEST_BUDGET').length, 2);
  assert.equal(f.hits(), 2);
  assert.equal(tr.stats().sent, 2);
  assert.equal(tr.stats().errors, 2);
  assert.equal(tr.stats().active, 0);
});

test('aggregate body budget includes prior responses and stops outstanding work on overflow', async t => {
  const f = await fixture(t, (_req, res) => res.end('123456'));
  const tr = transport(t, { origins: [f.origin], maxResponseBytes: 10 });
  assert.equal((await tr.request({ url: f.origin })).complete, true);
  const over = await tr.request({ url: f.origin });
  assert.equal(over.complete, false);
  assert.equal(over.error.code, 'RESPONSE_BUDGET');
  assert.equal(tr.stats().responseBytes, 12);
  const stopped = await tr.stop();
  assert.equal(stopped.active, 0);
  assert.equal(stopped.stopped, true);
  assert.equal((await tr.request({ url: f.origin })).error.code, 'STOPPED');
  assert.equal(f.hits(), 2);
});

test('stop aborts concurrent streams, awaits client socket close, and prevents new sends', async t => {
  let reached = 0, ready;
  const both = new Promise(resolve => { ready = resolve; });
  const f = await fixture(t, (_req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' }); res.write('{');
    if (++reached === 2) ready();
  });
  const tr = transport(t, { origins: [f.origin] });
  const pending = [tr.request({ url: f.origin }), tr.request({ url: f.origin })];
  await both;
  const stopped = await Promise.all([tr.stop(), tr.stop()]);
  for (const s of stopped) { assert.equal(s.active, 0); assert.equal(s.stopped, true); }
  for (const receipt of await Promise.all(pending)) {
    assert.equal(receipt.complete, false);
    assert.equal(receipt.error.code, 'STOPPED');
    assert.equal(getLabResponseBody(receipt), undefined);
  }
  assert.equal((await tr.request({ url: f.origin })).error.code, 'STOPPED');
  assert.equal(f.hits(), 2);
});

test('deadline aborts a stalled header response and individual timeout does not retry', async t => {
  const f = await fixture(t, () => {});
  const tr = transport(t, { origins: [f.origin], timeoutMs: 1000, deadlineMs: 35 });
  const result = await tr.request({ url: f.origin });
  assert.equal(result.complete, false);
  assert.ok(['DEADLINE_EXCEEDED', 'REQUEST_TIMEOUT'].includes(result.error.code));
  await tr.stop();
  assert.equal(tr.stats().active, 0);
  assert.equal(f.hits(), 1);
  const other = transport(t, { origins: [f.origin], timeoutMs: 25, deadlineMs: 1000 });
  assert.equal((await other.request({ url: f.origin })).error.code, 'REQUEST_TIMEOUT');
  assert.equal(other.stats().sent, 1);
  assert.equal(other.stats().active, 0);
});

test('truncated bodies and compressed bodies cannot become complete evidence', async t => {
  const f = await fixture(t, (req, res) => {
    if (req.url === '/compressed') { res.writeHead(200, { 'content-encoding': 'gzip' }); res.end('not decoded'); }
    else { res.writeHead(200, { 'content-length': '100' }); res.end('{"order":'); }
  });
  const tr = transport(t, { origins: [f.origin] });
  for (const path of ['/compressed', '/truncated']) {
    const r = await tr.request({ url: f.origin + path });
    assert.equal(r.complete, false);
    assert.equal(r.response.body, null);
    assert.equal(getLabResponseBody(r), undefined);
    assert.ok(r.error);
  }
  assert.equal(tr.stats().active, 0);
});
