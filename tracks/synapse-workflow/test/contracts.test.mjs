import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { buildContractPlan } from '../src/contracts.mjs';

test('offline planner derives observed contracts and bounded variations, suppressing redacted replay and path escapes', async () => {
  const parent = resolve(`runs/contract-plan-${Date.now()}`), network = join(parent, 'network');
  await mkdir(join(network, 'assets'), { recursive: true });
  await writeFile(join(network, 'assets', 'sum.json'), JSON.stringify({ result: 25, token: 'private' }));
  await writeFile(join(parent, 'outside.json'), JSON.stringify({ shouldNotAppear: 'OUTSIDE_FILE_CONTENT' }));
  const request = (id, overrides = {}) => ({ requestId: String(id), inScope: true, actionId: id,
    request: { url: 'http://fixture.test/sum', method: 'POST', headers: {}, postData: { text: '{"a":20,"b":5}' } },
    response: { status: 200 }, body: { file: 'assets/sum.json' }, ...overrides });
  await writeFile(join(network, 'evidence.json'), JSON.stringify({ requests: [
    request(1), request(2, { request: { url: 'http://fixture.test/sum?token=private', method: 'POST', headers: {}, postData: { text: '{"a":20,"b":5}' } } }),
    request(3, { inScope: false }), request(4, { body: { file: '../outside.json' } }),
    request(5, { request: { url: 'http://fixture.test/sum', method: 'POST', headers: { Authorization: 'private' }, postData: { text: '{"a":20,"b":5}' } } }),
  ] }));
  const result = await buildContractPlan({ networkDir: network });
  assert.equal(result.status, 'draft');
  assert.equal(result.contracts.length, 1);
  assert.equal(result.contracts[0].observations, 4);
  assert.equal(result.coverage.outOfScopeRequests, 1);
  assert.equal(result.coverage.unavailableBodies, 1);
  assert.equal(result.proposals.length, 4);
  assert.ok(result.proposals.every(p => p.source.requestId === '1' && p.requiresReview && p.requiresWriteAuthorization));
  assert.equal(result.contracts[0].samples.find(s => s.requestId === '2').missingCredentials, true);
  assert.equal(result.contracts[0].samples.find(s => s.requestId === '5').missingCredentials, true);
  assert.ok(!JSON.stringify(result).includes('private'));
  assert.ok(!JSON.stringify(result).includes('OUTSIDE_FILE_CONTENT'));
  const bounded = await buildContractPlan({ networkDir: network, maxSamples: 1 });
  assert.equal(bounded.coverage.omittedSamples, 3);
  assert.equal(bounded.contracts[0].samples.length, 1);
  const byteBounded = await buildContractPlan({ networkDir: network, maxTotalBytes: 4096 });
  assert.ok(Buffer.byteLength(JSON.stringify(byteBounded, null, 2)) <= 4096);
  assert.equal(byteBounded.coverage.byteLimited, true);
});
