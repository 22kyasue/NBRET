import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { runChecks } from '../src/checks.mjs';
import { runProbe } from '../src/probe.mjs';

// This runner only constructs literal loopback URLs. No user-supplied targets.
const started = performance.now();
const out = resolve(`runs/security-lab-${Date.now()}`);
await mkdir(out, { recursive: false });
let mode = 'vulnerable', hits = 0, redirectHits = 0;
const sink = createServer((_req, res) => { redirectHits++; res.end('unexpected'); });
const app = createServer((req, res) => {
  hits++;
  if (req.url === '/redirect') { res.writeHead(302, { location: `http://127.0.0.1:${sink.address().port}/sink` }); res.end(); return; }
  if (req.url === '/text') { res.end('unstructured'); return; }
  res.setHeader('content-type', 'application/json');
  const owner = req.url === '/invoices/a' ? 'A' : 'B';
  const allowed = req.headers['x-fixture-tenant'] === owner;
  if (!allowed && mode !== 'vulnerable') res.statusCode = 403;
  res.end(JSON.stringify(allowed || mode !== 'fixed'
    ? { invoice: { id: owner.toLowerCase(), owner, amount: 42, marker: `SYNTHETIC-${owner}` } }
    : { error: 'forbidden' }));
});
const listen = server => new Promise(r => server.listen(0, '127.0.0.1', r));
const close = server => new Promise((r, j) => { server.closeAllConnections(); server.close(e => e ? j(e) : r()); });
const records = [];
try {
  await listen(sink); await listen(app);
  const origin = `http://127.0.0.1:${app.address().port}`;
  const base = { origins: [origin], delayMs: 0, timeoutMs: 1000, maxMs: 10000 };
  const headers = { 'x-fixture-tenant': 'A' };
  for (mode of ['vulnerable', 'fixed', 'deceptive']) {
    for (let repetition = 1; repetition <= 3; repetition++) {
      const dir = join(out, `${mode}-${repetition}`);
      const result = await runChecks({ ...base, outDir: dir, cases: [
        { name: 'own-tenant-positive', url: origin + '/invoices/a', headers,
          expect: { status: 200, json: [{ path: '/invoice/owner', equals: 'A' }] } },
        { name: 'foreign-tenant-security', url: origin + '/invoices/b', headers,
          expect: { status: 403, json: [{ path: '/invoice', exists: false }] } },
      ] });
      assert.equal(result.tests[0].outcome, 'passed');
      assert.equal(result.tests[1].outcome, mode === 'fixed' ? 'passed' : 'failed');
      const before = hits;
      const weak = await runChecks({ ...base, outDir: join(out, `${mode}-${repetition}-weak`),
        probeFile: join(dir, 'probe/probe.json'), cases: [
          { name: 'status-only-denial', url: origin + '/invoices/b', headers, expect: { status: 403 } },
          { name: 'availability-only', url: origin + '/invoices/b', headers, expect: { status: 200 } },
        ] });
      assert.equal(hits, before, 'offline reassessment must not send requests');
      records.push({ mode, repetition, result: result.status, own: result.tests[0].outcome,
        security: result.tests[1].outcome, weakDenial: weak.tests[0].outcome,
        availability: weak.tests[1].outcome, offlineRequests: hits - before,
        elapsedMs: result.tests.map(t => t.elapsedMs), evidence: dir });
    }
  }
  mode = 'fixed';
  const identityCases = [{ name: 'tenant-B-cannot-read-A', url: origin + '/invoices/a',
    headers: { 'x-fixture-tenant': 'B' }, expect: { status: 403, json: [{ path: '/invoice', exists: false }] } }];
  const freshIdentity = await runChecks({ ...base, outDir: join(out, 'identity-fresh'), cases: identityCases });
  const beforeIdentityOffline = hits;
  const offlineIdentity = await runChecks({ ...base, outDir: join(out, 'identity-offline'), cases: identityCases,
    probeFile: join(out, 'fixed-1/probe/probe.json') });
  assert.equal(freshIdentity.status, 'passed');
  assert.equal(offlineIdentity.status, 'failed');
  assert.equal(hits, beforeIdentityOffline);
  const identityMismatch = { fresh: freshIdentity.status, offline: offlineIdentity.status,
    savedIdentity: 'A', requestedIdentity: 'B', sameUrl: true, offlineRequests: hits - beforeIdentityOffline,
    interpretation: 'Offline matcher ignored fixture identity headers; not a live application vulnerability.' };
  const redirect = await runProbe({ ...base, outDir: join(out, 'redirect'), cases: [{ url: origin + '/redirect', expectStatus: 302 }] });
  assert.equal(redirect.cases[0].redirect.followed, false); assert.equal(redirectHits, 0);
  const missing = await runChecks({ ...base, outDir: join(out, 'missing'), cases: [
    { url: origin + '/text', expect: { json: [{ path: '/invoice', exists: false }] } },
  ] });
  assert.equal(missing.status, 'incomplete');
  const beforeRejected = hits;
  await assert.rejects(runProbe({ ...base, outDir: join(out, 'rejected-write'), cases: [{ url: origin, method: 'POST', body: {} }] }), /allowWrites/);
  await assert.rejects(runProbe({ ...base, outDir: join(out, 'rejected-scope'), cases: [{ url: `http://127.0.0.1:${sink.address().port}/` }] }), /scope/);
  assert.equal(hits, beforeRejected); assert.equal(redirectHits, 0);
  const sources = {};
  for (const path of ['scripts/research-security-lab.mjs', 'docs/research/security-landscape/lab-plan.md', 'docs/research/security-landscape/lab-followup-plan.md',
    'src/scope.mjs', 'src/http.mjs', 'src/probe.mjs', 'src/assertions.mjs', 'src/checks.mjs']) {
    sources[path] = createHash('sha256').update(await readFile(path)).digest('hex');
  }
  await close(app); await close(sink);
  const receipt = { kind: 'synthetic-authorization-assertion-evaluation', finishedAt: new Date().toISOString(),
    environment: { node: process.version, platform: process.platform, arch: process.arch },
    records, identityMismatch, sourceSha256: sources, requests: hits, redirectRequests: redirectHits,
    strongFalseNegatives: records.filter(r => r.mode !== 'fixed' && r.security === 'passed').length,
    strongFalsePositives: records.filter(r => r.mode === 'fixed' && r.security !== 'passed').length,
    weakDenialFalseNegatives: records.filter(r => r.mode !== 'fixed' && r.weakDenial === 'passed').length,
    missingEvidence: missing.status, rejectedCasesSent: hits - beforeRejected,
    cleanup: { appListening: app.listening, sinkListening: sink.listening },
    modelCalls: 0, modelCostUsd: 0, elapsedMs: performance.now() - started,
    limitations: ['Hand-authored cases with known fixture truth; not autonomous discovery.',
      'No TLS, real identity provider, concurrency, production deployment or external-tool validation.',
      'No customer-performance or cross-tool ranking claim.'] };
  await writeFile(join(out, 'receipt.json'), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ out, receipt }, null, 2));
} finally {
  if (app.listening) await close(app);
  if (sink.listening) await close(sink);
}
