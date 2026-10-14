import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exportInvestigation, writeInvestigation, proxyOptions } from '../src/investigation.mjs';

test('exports scoped observations, redacted bodies, and endpoint coverage without replay', async () => {
  const request = { method: 'POST', url: 'https://example.test/search?q=shoes', headers: { Cookie: '[REDACTED]', Authorization: '[REDACTED]', Host: 'example.test', 'Content-Length': '99', 'Content-Type': 'application/json' }, postData: { text: '{"q":"shoes","token":"[REDACTED]"}' } };
  const r = { inScope: true, requestId: '1', actionId: 2, request, response: { status: 200, fromDiskCache: true } };
  const { collection, inventory } = await exportInvestigation({ requests: [r, { ...r, requestId: '2', response: { status: 500 }, body: { unavailable: true } }, { ...r, inScope: false }] });
  assert.equal(collection.item.length, 2);
  assert.deepEqual(collection.item[0].request.header, [{ key: 'Content-Type', value: 'application/json' }]);
  assert.equal(collection.item[0].request.body.raw, request.postData.text);
  assert.equal(inventory.endpoints.length, 1);
  assert.deepEqual(inventory.endpoints[0].statuses, [200, 500]);
  assert.equal(inventory.endpoints[0].observations, 2);
  assert.equal(inventory.endpoints[0].cacheHits, 1);
  assert.equal(inventory.endpoints[0].unavailableBodies, 1);
});

test('proxy configuration requires explicit TLS opt-in and rejects credential-bearing URLs', () => {
  assert.deepEqual(proxyOptions(), {});
  assert.deepEqual(proxyOptions('http://127.0.0.1:8080'), { proxy: { server: 'http://127.0.0.1:8080' }, ignoreHTTPSErrors: false });
  assert.equal(proxyOptions('http://localhost:8080', true).ignoreHTTPSErrors, true);
  assert.equal(proxyOptions('socks5://localhost:1080').proxy.server, 'socks5://localhost:1080');
  for (const url of ['http://user:pass@localhost:8080', 'http://localhost:8080/path', 'file:///tmp/proxy', 'http://localhost:8080/?token=x']) assert.throws(() => proxyOptions(url));
  assert.throws(() => proxyOptions(undefined, true));
});

test('offline export writes importable artifacts and refuses to overwrite', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nbret-investigation-'));
  try {
    await mkdir(join(root, 'network'));
    await writeFile(join(root, 'network', 'evidence.json'), JSON.stringify({ requests: [] }));
    const result = await writeInvestigation(root);
    assert.equal(result.requests, 0);
    assert.equal(JSON.parse(await readFile(join(result.out, 'postman.collection.json'), 'utf8')).item.length, 0);
    await assert.rejects(writeInvestigation(root), /EEXIST/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
