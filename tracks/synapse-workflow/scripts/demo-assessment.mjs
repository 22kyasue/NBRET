import http from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { engagementTemplate } from '../src/assessment/template.mjs';
import { runAssessment, reviewFindings, compareRetest, saveNew, renderReport } from '../src/assessment/core.mjs';

let mode = 'deceptive';
const env = { NBRET_ALICE_AUTH: `Bearer ${randomUUID()}`, NBRET_BOB_AUTH: `Bearer ${randomUUID()}` };
const server = http.createServer((req, res) => {
  if (req.url !== '/api/orders/2') { res.statusCode = 404; res.end('{}'); return; }
  const owner = req.headers.authorization === env.NBRET_BOB_AUTH;
  res.statusCode = owner ? 200 : 403;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(owner || mode === 'deceptive' ? { order: { owner: 'bob', address: 'synthetic-only' } } : { error: 'denied' }));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const out = resolve('runs', `assessment-demo-${Date.now()}-${randomUUID().slice(0, 8)}`);
await mkdir(out, { recursive: true });
try {
  const before = engagementTemplate(`http://127.0.0.1:${server.address().port}`);
  before.client = 'Fictional order service'; before.budgets.delayMs = 0;
  before.authorization = { ...before.authorization, status: 'approved', reference: 'owned synthetic loopback fixture only', approvedBy: 'demo-fixture-owner',
    startsAt: new Date(Date.now() - 1000).toISOString(), expiresAt: new Date(Date.now() + 60000).toISOString() };
  const first = await runAssessment(before, join(out, 'initial'), { env });
  const reviews = [{ findingId: 'F-foreign-order', decision: 'confirmed', reviewer: 'synthetic known-answer reviewer',
    rationale: 'Foreign synthetic order is retained despite 403; owner control passes. This is a scripted demonstration review.', severity: 'high',
    impact: 'A fictional customer receives another tenant\'s synthetic order.', remediation: 'Enforce ownership before serializing the order.', owner: 'fixture-engineer' }];
  const reviewed = reviewFindings(first.results, reviews);
  await saveNew(join(out, 'reviewed'), { 'engagement.json': before, 'evidence.json': first.bundle, 'results.json': reviewed,
    'reviews.json': reviews, 'REPORT.md': renderReport(before, reviewed) });
  mode = 'fixed';
  const after = structuredClone(before); after.environment.revision = 'build-after-owner-check';
  after.actors.forEach(a => { a.sessionEpoch = 'fresh-retest-session'; });
  const second = await runAssessment(after, join(out, 'repaired'), { env });
  const retest = compareRetest(before, reviewed, after, second.results);
  if (first.results.candidates.length !== 1 || second.results.counts.passed !== 2 || retest.findings[0]?.status !== 'repair-verified-for-tested-cases') throw new Error('Demo did not produce expected lifecycle');
  await writeFile(join(out, 'retest.json'), JSON.stringify(retest, null, 2));
  console.log(JSON.stringify({ out, initial: first.results.status, repaired: second.results.status, retest: retest.findings }, null, 2));
} finally { await new Promise(r => server.close(r)); }
