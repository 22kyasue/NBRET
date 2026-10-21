import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { compileAccessMatrix } from '../src/assessment/matrix.mjs';
import { engagementTemplate } from '../src/assessment/template.mjs';
import { validateEngagement, runAssessment, evaluateBundle, reviewFindings, compareRetest, digest } from '../src/assessment/core.mjs';

const credentials = { NBRET_ALICE_AUTH: 'Bearer fixture-alice-secret', NBRET_BOB_AUTH: 'Bearer fixture-bob-secret' };
const approve = e => { e.authorization = { ...e.authorization, status: 'approved', reference: 'owned-loopback-fixture', approvedBy: 'fixture-owner',
  startsAt: new Date(Date.now() - 60000).toISOString(), expiresAt: new Date(Date.now() + 60000).toISOString() }; return e; };
const review = { findingId: 'F-foreign-order', decision: 'confirmed', reviewer: 'test-reviewer', rationale: 'Known fixture ownership and retained foreign response',
  severity: 'high', impact: 'Synthetic foreign order disclosure', remediation: 'Enforce owner authorization before serialization', owner: 'fixture-engineer' };

async function fixture(t, handler) {
  let hits = 0;
  const server = http.createServer((req, res) => { hits++; handler(req, res); });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const directory = await mkdtemp(join(tmpdir(), 'nbret-assessment-'));
  t.after(async () => { await new Promise(r => server.close(r)); await rm(directory, { recursive: true, force: true }); });
  return { origin: `http://127.0.0.1:${server.address().port}`, directory, hits: () => hits };
}

function respond(mode, req, res) {
  const owner = req.headers.authorization === credentials.NBRET_BOB_AUTH;
  res.setHeader('content-type', 'application/json');
  res.statusCode = owner || mode === 'vulnerable' ? 200 : 403;
  res.end(JSON.stringify(owner || mode !== 'fixed' ? { order: { owner: 'bob', address: 'synthetic-address' } } : { error: 'denied' }));
}

test('engagement preflight rejects expired grants, unapproved cases, effects and missing credentials before requests', async t => {
  const f = await fixture(t, (req, res) => respond('fixed', req, res));
  const e = approve(engagementTemplate(f.origin));
  assert.throws(() => validateEngagement({ ...e, authorization: { ...e.authorization, expiresAt: new Date(0).toISOString() } }, { live: true }), /window/);
  assert.throws(() => validateEngagement({ ...e, authorization: { ...e.authorization, caseIds: [] } }, { live: true }), /every case/);
  const writes = structuredClone(e); writes.cases[0].effect = 'write';
  assert.throws(() => validateEngagement(writes, { live: true }), /write authorization/);
  const outside = structuredClone(e); outside.cases[0].url = 'http://outside.invalid/api/orders/2';
  assert.throws(() => validateEngagement(outside), /outside/);
  const weak = structuredClone(e); weak.cases[1].expect = { status: 403 };
  assert.throws(() => validateEngagement(weak), /semantic/);
  await assert.rejects(runAssessment(e, join(f.directory, 'missing'), { env: {} }), /credential/);
  assert.equal(f.hits(), 0);
});

test('deceptive 403 disclosure fails semantic oracle; review and fresh repaired retest preserve legitimate access', async t => {
  let mode = 'deceptive';
  const f = await fixture(t, (req, res) => respond(mode, req, res));
  const before = approve(engagementTemplate(f.origin)); before.budgets.delayMs = 0;
  const first = await runAssessment(before, join(f.directory, 'before'), { env: credentials });
  assert.equal(first.results.tests[0].outcome, 'passed');
  assert.equal(first.results.tests[1].outcome, 'failed');
  assert.equal(first.results.candidates[0].status, 'reproduced-candidate');
  const adjudicated = reviewFindings(first.results, [review]);
  mode = 'fixed';
  const after = structuredClone(before); after.environment.revision = 'build-repaired';
  after.actors.forEach(a => { a.sessionEpoch = 'fresh-retest-session'; });
  const second = await runAssessment(after, join(f.directory, 'after'), { env: credentials });
  assert.equal(second.results.status, 'tested-cases-passed');
  assert.equal(compareRetest(before, adjudicated, after, second.results).findings[0].status, 'repair-verified-for-tested-cases');
  assert.equal(after.environment.revision, 'build-repaired', 'Retest comparison must not mutate its input');
  const cli = (...args) => spawnSync(process.execPath, ['src/assessment/cli.mjs', ...args], { encoding: 'utf8', windowsHide: true });
  const reviewsPath = join(f.directory, 'reviews.json');
  await writeFile(reviewsPath, JSON.stringify([review]));
  const reviewedDir = join(f.directory, 'reviewed');
  assert.equal(cli('review', '--run', join(f.directory, 'before'), '--reviews', reviewsPath, '--out', reviewedDir).status, 0);
  assert.equal(cli('evaluate', '--engagement', join(f.directory, 'after', 'engagement.json'), '--evidence', join(f.directory, 'after', 'evidence.json'), '--out', join(f.directory, 'offline')).status, 0);
  assert.equal(cli('retest', '--previous', reviewedDir, '--current', join(f.directory, 'after'), '--out', join(f.directory, 'retest')).status, 0);
  const corrupted = structuredClone(second.results); corrupted.tests[1].outcome = 'failed';
  await writeFile(join(f.directory, 'after', 'results.json'), JSON.stringify(corrupted));
  const rejected = cli('retest', '--previous', reviewedDir, '--current', join(f.directory, 'after'), '--out', join(f.directory, 'bad-retest'));
  assert.equal(rejected.status, 2); assert.match(rejected.stderr, /retained evidence/);
  const changed = structuredClone(after); changed.cases[1].expect = { status: 403, json: [{ path: '/error', exists: true }] };
  const changedResult = { ...second.results, engagementDigest: digest(changed) };
  assert.equal(compareRetest(before, adjudicated, changed, changedResult).findings[0].status, 'inconclusive');
});

test('offline reuse rejects wrong actor/session, stale config, duplicates and tampered bytes; makes no requests', async t => {
  const f = await fixture(t, (req, res) => respond('fixed', req, res));
  const e = approve(engagementTemplate(f.origin)); e.budgets.delayMs = 0;
  const { bundle } = await runAssessment(e, join(f.directory, 'live'), { env: credentials });
  const hits = f.hits();
  assert.equal(evaluateBundle(e, bundle).counts.passed, 2);
  const duplicate = structuredClone(bundle); duplicate.observations.push(duplicate.observations[1]);
  assert.equal(evaluateBundle(e, duplicate).tests[1].outcome, 'incomplete');
  const wrong = structuredClone(bundle); wrong.observations[1].binding.actor.principal = 'bob';
  assert.equal(evaluateBundle(e, wrong).tests[1].outcome, 'incomplete');
  const missing = structuredClone(bundle); missing.observations[1].bindingDigest = 'another-session';
  assert.equal(evaluateBundle(e, missing).tests[1].outcome, 'incomplete');
  const tamper = structuredClone(bundle); tamper.observations[1].entry.response.status = 200;
  assert.equal(evaluateBundle(e, tamper).tests[1].outcome, 'incomplete');
  assert.throws(() => evaluateBundle(e, { ...bundle, terminal: 'running' }), /checkpoint/);
  const stale = structuredClone(e); stale.environment.revision = 'new-build';
  assert.throws(() => evaluateBundle(stale, bundle), /different engagement/);
  assert.equal(f.hits(), hits);
});

test('broken positive control prevents confirmation and all-denied repair cannot close finding', async t => {
  let mode = 'vulnerable';
  const f = await fixture(t, (req, res) => {
    if (mode === 'all-denied') { res.statusCode = 403; res.end('{"error":"denied"}'); }
    else respond(mode, req, res);
  });
  const e = approve(engagementTemplate(f.origin)); e.budgets.delayMs = 0;
  const first = await runAssessment(e, join(f.directory, 'before'), { env: credentials });
  const confirmed = reviewFindings(first.results, [review]);
  mode = 'all-denied';
  const after = structuredClone(e); after.environment.revision = 'broken-repair';
  const current = await runAssessment(after, join(f.directory, 'after'), { env: credentials });
  assert.equal(compareRetest(e, confirmed, after, current.results).findings[0].status, 'inconclusive');
  const falseControl = structuredClone(first.results); falseControl.candidates[0].controlsPassed = false;
  assert.throws(() => reviewFindings(falseControl, [review]), /positive controls/);
});

test('redirects are not followed, non-JSON is incomplete and secrets reflected in body are removed', async t => {
  let mode = 'redirect';
  const f = await fixture(t, (req, res) => {
    if (mode === 'redirect') { res.statusCode = 302; res.setHeader('location', '/outside'); res.end('redirect'); }
    else res.end(JSON.stringify({ echoed: req.headers.authorization, password: 'do-not-store', order: { owner: 'bob' } }));
  });
  const e = approve(engagementTemplate(f.origin)); e.budgets.delayMs = 0;
  const first = await runAssessment(e, join(f.directory, 'redirect'), { env: credentials });
  assert.equal(f.hits(), 2);
  assert.equal(first.results.counts.incomplete, 2);
  assert.equal(first.results.candidates.length, 0);
  mode = 'echo';
  await runAssessment(e, join(f.directory, 'echo'), { env: credentials });
  const saved = await readFile(join(f.directory, 'echo', 'evidence.json'), 'utf8');
  assert.ok(!saved.includes(credentials.NBRET_ALICE_AUTH));
  assert.ok(!saved.includes(credentials.NBRET_BOB_AUTH));
  assert.ok(!saved.includes('do-not-store'));
});

test('cancellation before execution produces unavailable evidence rather than passes', async t => {
  const f = await fixture(t, (req, res) => respond('fixed', req, res));
  const e = approve(engagementTemplate(f.origin));
  const controller = new AbortController(); controller.abort();
  const { results, bundle } = await runAssessment(e, join(f.directory, 'cancelled'), { env: credentials, signal: controller.signal });
  assert.equal(f.hits(), 0); assert.equal(results.counts.incomplete, 2); assert.equal(bundle.terminal, 'incomplete');
});

test('matrix expands actor-resource rules into explicit cases and resets authorization', () => {
  const e = approve(engagementTemplate());
  const matrix = { schemaVersion: 1, resources: [{ id: 'bob-order', url: 'http://127.0.0.1:3000/api/orders/2', allowedActors: ['bob'],
    preconditions: 'Synthetic Bob order exists', identity: { path: '/order/owner', equals: 'bob' }, privateObjectPath: '/order' }] };
  const generated = compileAccessMatrix(e, matrix);
  assert.equal(generated.authorization.status, 'draft');
  assert.equal(e.authorization.status, 'approved');
  assert.equal(generated.cases.length, 2);
  assert.deepEqual(generated.cases.find(c => c.actor === 'alice').controls, ['bob-order-bob']);
  assert.throws(() => compileAccessMatrix(e, { ...matrix, resources: [matrix.resources[0], matrix.resources[0]] }), /Unique/);
});

test('evidence-budget exhaustion stops subsequent requests and preserves an incomplete checkpoint', async t => {
  const f = await fixture(t, (req, res) => { res.end(JSON.stringify({ large: 'x'.repeat(8000) })); });
  const e = approve(engagementTemplate(f.origin)); e.budgets.maxTotalBytes = 4096; e.budgets.delayMs = 0;
  const directory = join(f.directory, 'bounded');
  const { results, bundle } = await runAssessment(e, directory, { env: credentials });
  assert.equal(f.hits(), 1);
  assert.equal(results.counts.incomplete, 2);
  assert.ok(bundle.observations.every(o => o.entry.errorCode === 'TOTAL_EVIDENCE_BYTE_LIMIT'));
  const checkpoint = JSON.parse(await readFile(join(directory, 'checkpoint.json'), 'utf8'));
  assert.equal(checkpoint.observations.length, 2);
  assert.throws(() => evaluateBundle(e, checkpoint), /checkpoint/);
});

test('CLI init/plan are offline, refuse overwrites and draft execution, and reject unknown flags', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'nbret-assessment-cli-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const cli = (...args) => spawnSync(process.execPath, ['src/assessment/cli.mjs', ...args], { encoding: 'utf8', windowsHide: true });
  const draft = join(directory, 'draft');
  assert.equal(cli('init', '--out', draft).status, 0);
  assert.equal(cli('init', '--out', draft).status, 2);
  const engagement = join(draft, 'engagement.json');
  assert.equal(cli('plan', '--engagement', engagement, '--out', join(directory, 'plan')).status, 0);
  const denied = cli('run', '--engagement', engagement, '--out', join(directory, 'denied'));
  assert.equal(denied.status, 2); assert.match(denied.stderr, /approved authorization/);
  assert.equal(cli('plan', '--engagement', engagement, '--out', join(directory, 'bad'), '--activate', 'yes').status, 2);
});
