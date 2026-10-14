import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { prepareLocalReplay, replayLocal } from '../src/replay.mjs';
import { startFixture } from './fixture.mjs';

const record = () => ({ inScope: true, requestId: '1', actionId: 2, request: { method: 'POST', url: 'https://original.test/sum', headers: { Cookie: 'secret', Authorization: 'secret', 'Content-Type': 'application/json' }, postData: { text: '{"a":20,"b":5}' } } });

test('local replay rejects external destinations, implicit writes and incomplete/redacted inputs', () => {
  for (const target of ['https://example.test', 'http://localhost:3000', 'http://127.0.0.1.evil.test', 'http://user:pass@127.0.0.1', 'http://127.0.0.1/path']) assert.throws(() => prepareLocalReplay(record(), target, { allowWrites: true }));
  assert.throws(() => prepareLocalReplay(record(), 'http://127.0.0.1'));
  const r = record(); r.request.postData = { omitted: 'size-limit' };
  assert.throws(() => prepareLocalReplay(r, 'http://127.0.0.1', { allowWrites: true }));
  r.request.postData = { text: '{"token":"[REDACTED]"}' };
  assert.throws(() => prepareLocalReplay(r, 'http://127.0.0.1', { allowWrites: true }));
  const p = prepareLocalReplay(record(), 'http://127.0.0.1:3000', { allowWrites: true });
  assert.deepEqual(p.headers, { 'Content-Type': 'application/json' });
  const slash = record(); slash.request.url = 'https://original.test//outside.test/sum';
  assert.equal(new URL(prepareLocalReplay(slash, 'http://127.0.0.1:3000', { allowWrites: true }).url).hostname, '127.0.0.1');
});

test('local replay verifies a changed input/output and refuses redirect following', async () => {
  const fixture = await startFixture();
  const redirect = createServer((req, res) => { res.writeHead(302, { Location: 'https://example.test/' }); res.end(); });
  await new Promise(resolve => redirect.listen(0, '127.0.0.1', resolve));
  try {
    const first = await replayLocal(record(), fixture.url, { allowWrites: true });
    assert.deepEqual(JSON.parse(first.response.text), { result: 25 });
    const changed = record(); changed.request.postData.text = '{"a":7,"b":3}';
    const second = await replayLocal(changed, fixture.url, { allowWrites: true });
    assert.deepEqual(JSON.parse(second.response.text), { result: 10 });
    const get = record(); get.request = { method: 'GET', url: 'https://original.test/' };
    const result = await replayLocal(get, `http://127.0.0.1:${redirect.address().port}/`);
    assert.equal(result.status, 302);
  } finally {
    redirect.closeAllConnections();
    await Promise.all([fixture.close(), new Promise(resolve => redirect.close(resolve))]);
  }
});
