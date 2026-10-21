import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir, lstat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import http from 'node:http';
import { startWorkbenchServer } from '../src/practice/workbench-server.mjs';
import { createWorkbench, readWorkbench } from '../src/practice/workbench.mjs';
import { readJournal } from '../src/investigation/journal.mjs';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const CANARY = '<script>CONSEQUENCE_RENDER_CANARY</script>';
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'nbret-consequence-acceptance-')), sessions = [];
  t.after(async () => { for (const s of sessions.reverse()) await s.close(); assert.equal(dirname(root), resolve(tmpdir())); await rm(root, { recursive: true, force: true }); });
  const server = await startWorkbenchServer({ outDir: join(root, 'session') }); sessions.push(server);
  const sourcePath = join(root, 'PRIVATE_SCREENSHOT_SOURCE.png'); await writeFile(sourcePath, PNG);
  return { root, server, session: server.session, sourcePath, sessions };
}
const call = (session, method, body) => session[method]({ expectedRevision: session.state().revision, ...body });
const step = (session, action, evidenceIds = []) => call(session, 'step', { proposal: { question: 'What does this owned observation establish?', reason: 'Consequence integration acceptance', action, evidenceIds } });
const event = (session, type, payload) => call(session, 'recordCase', { event: { id: randomUUID(), type, payload } });
async function evidence(session) {
  await step(session, { kind: 'profile', actor: 'alice' }); const basis = session.state().observations.at(-1);
  await step(session, { kind: 'orders', actor: 'alice' }); const control = session.state().observations.at(-1);
  await event(session, 'candidate.created', { id: 'own-profile-case', title: 'Own synthetic profile <local>', question: 'What is actually supported?', authorId: 'declared-author', basisEvidenceIds: [basis.id], identity: basis.identity, environment: { sourceHash: session.state().target.sourceHash }, expected: 'Own profile permitted', observed: 'Own profile returned', demonstratedConsequence: 'Own data only; no unauthorized effect established', potentialConsequences: 'Wider consequences untested', uncertainties: 'Only selected ordinary behavior observed', suggestedRepair: 'No repair established', manualVerification: 'Review the matched identity and legitimate control', impactType: 'exposure' });
  return { basis, control };
}
function document(e, screenshots = []) {
  return { caseId: 'own-profile-case', capability: 'Own profile observation ' + CANARY, whyPossible: 'Ordinary authenticated own-profile route', severity: { level: 'critical', rationale: 'Declared hypothetical severity; no harm established' },
    extent: { demonstrated: { description: 'One synthetic profile response', evidenceIds: [e.basis.id] }, wider: { description: 'No wider extent demonstrated', evidenceIds: [], assumptions: ['Other populations remain untested'] } },
    accessEffort: { level: 'low', rationale: 'Already supplied synthetic account' },
    repair: { immediate: 'No actual repair', broaderRule: 'Owner must establish intended policy', legitimateFlowEffects: 'Preserve legitimate own reads', acceptanceChecks: ['Original and related behavior with legitimate controls'], effort: { level: 'unknown', rationale: 'No implementation estimate validated' } },
    sequence: [{ id: 'profile-step', explanation: 'Own-profile observation', evidenceIds: [e.basis.id], screenshots, expected: 'Own profile', current: 'Own profile observed', proposedRepaired: 'Proposed only; no changed build or retest' }],
    nextInvestigation: { extendDemonstratedPath: 'Request approved context for untested extent', resolveFixUncertainty: 'Obtain changed-build matched evidence with legitimate controls' } };
}
const pointer = artifact => ({ artifactId: artifact.artifactId, sha256: artifact.sha256, caption: artifact.caption });
function variantPng(index) {
  const data = Buffer.from(`Fixture\0synthetic-${index}`), type = Buffer.from('tEXt'), chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length); type.copy(chunk, 4); data.copy(chunk, 8);
  let crc = 0xffffffff;
  for (const byte of Buffer.concat([type, data])) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
  chunk.writeUInt32BE((crc ^ 0xffffffff) >>> 0, chunk.length - 4);
  return Buffer.concat([PNG.subarray(0, PNG.length - 12), chunk, PNG.subarray(PNG.length - 12)]);
}

test('real consequence documentation projects declared extent and escaped reports without effect promotion', async t => {
  const { server, session: s } = await fixture(t), e = await evidence(s), before = s.state();
  await event(s, 'consequence.documented', document(e));
  const state = s.state(), entry = state.consequenceOverview.entries[0];
  assert.equal(entry.documentation, 'declared-current'); assert.equal(entry.extent.widerSupport, 'unsupported; assumptions only');
  assert.equal(entry.priority.tier, 'unconfirmed-triage'); assert.equal(entry.repair.effort.level, 'unknown');
  assert.match(entry.nextInvestigation.authority, /no execution permission/);
  assert.deepEqual(state.caseSummary.verifiedFindings, []); assert.equal(state.caseSummary.issuesNeedingOwnerAction.length, 0);
  assert.equal(state.targetRequestCount, before.targetRequestCount); assert.deepEqual(state.scope, before.scope);
  for (const route of ['/report', '/executive']) {
    const response = await fetch(server.url + route), html = await response.text(); assert.equal(response.status, 200);
    assert.ok(!html.includes(CANARY)); assert.ok(html.includes('&lt;script&gt;CONSEQUENCE_RENDER_CANARY&lt;/script&gt;'));
    assert.match(html, /Proposed repaired outcome — not a retest/); assert.match(html, /independent effect not established/);
    assert.match(html, /Other populations remain untested/);
  }
  const replay = await readWorkbench(s.outDir); assert.deepEqual(replay.consequenceOverview, state.consequenceOverview);
  assert.equal(replay.casebook.cases[0].consequenceHistory.length, 1);
});

test('registered bytes use exact evidence/digest binding and fixed HTTP route; exports use local relative image links', async t => {
  const { server, session: s, sourcePath } = await fixture(t), e = await evidence(s);
  await call(s, 'attachScreenshot', { sourcePath, evidenceId: e.basis.id, caption: 'Own synthetic profile ' + CANARY });
  const artifact = s.state().screenshotArtifacts[0], valid = pointer(artifact);
  const unresolved = { artifactId: 'unregistered_pointer', sha256: 'a'.repeat(64), caption: 'Unregistered pointer remains unavailable' };
  const wrongHash = { ...valid, sha256: 'b'.repeat(64), caption: 'Mismatched digest' };
  const doc = document(e, [valid, unresolved, wrongHash]);
  doc.sequence.push({ ...structuredClone(doc.sequence[0]), id: 'different-evidence', evidenceIds: [e.control.id], screenshots: [valid] });
  await event(s, 'consequence.documented', doc);
  const screenshots = s.state().consequenceOverview.entries[0].screenshots;
  assert.equal(screenshots[0].href, '/artifacts/' + artifact.artifactId);
  assert.deepEqual(screenshots.slice(1).map(p => p.href), [null, null, null]);
  const response = await fetch(server.url + screenshots[0].href);
  assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'image/png');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), PNG);
  for (const path of ['/artifacts/' + artifact.artifactId + '?v=1', '/artifacts/' + artifact.artifactId + '.png', '/artifacts/../screenshots/' + artifact.artifactId + '.png', '/artifacts/png-' + '0'.repeat(64)]) {
    const rejected = await fetch(server.url + path); assert.notEqual(rejected.status, 200); assert.notEqual(rejected.headers.get('content-type'), 'image/png');
  }
  const live = await (await fetch(server.url + '/executive')).text();
  assert.ok(live.includes(`href="/artifacts/${artifact.artifactId}"`)); assert.ok(!live.includes('href="/artifacts/unregistered_pointer"'));
  const exported = await s.exportReport();
  for (const path of [exported.htmlPath, exported.executivePath]) {
    const html = await readFile(path, 'utf8'); assert.ok(html.includes(`href="screenshots/${artifact.artifactId}.png"`));
    assert.ok(!html.includes('href="/artifacts/')); assert.ok(!html.includes(CANARY));
  }
  const journal = await readJournal(join(s.outDir, 'journal'));
  assert.doesNotMatch(JSON.stringify(journal), /PRIVATE_SCREENSHOT_SOURCE|sourcePath/);
  assert.equal(journal.events.filter(ev => ev.type === 'screenshot.retained').length, 1);
  await writeFile(join(s.outDir, 'screenshots', artifact.artifactId + '.png'), 'tampered bytes');
  const tampered = await fetch(server.url + '/artifacts/' + artifact.artifactId);
  assert.notEqual(tampered.status, 200); assert.notEqual(tampered.headers.get('content-type'), 'image/png');
  assert.doesNotMatch(await tampered.text(), /PRIVATE_SCREENSHOT_SOURCE|sourcePath/);
  assert.equal(s.state().faulted, false);
});

test('registered artifact count stops at twenty before new bytes or journal events are written', async t => {
  const { session: s, sourcePath } = await fixture(t), e = await evidence(s), beforeRequests = s.state().targetRequestCount;
  for (let i = 0; i < 20; i++) {
    await writeFile(sourcePath, variantPng(i));
    await call(s, 'attachScreenshot', { sourcePath, evidenceId: e.basis.id, caption: `Synthetic sample ${i}` });
  }
  assert.equal(s.state().screenshotArtifacts.length, 20);
  const before = s.state(), files = await readdir(join(s.outDir, 'screenshots'));
  await writeFile(sourcePath, variantPng(20));
  await assert.rejects(call(s, 'attachScreenshot', { sourcePath, evidenceId: e.basis.id, caption: 'Over budget' }), /count budget/);
  assert.deepEqual(await readdir(join(s.outDir, 'screenshots')), files);
  assert.equal(s.state().revision, before.revision); assert.equal(s.state().targetRequestCount, beforeRequests); assert.equal(s.state().faulted, false);
});

test('stale or unsupported screenshot admission causes no file writes and no target traffic', async t => {
  const { session: s, sourcePath } = await fixture(t);
  await step(s, { kind: 'profile', actor: 'alice' }); const complete = s.state().observations.at(-1);
  await step(s, { kind: 'order', actor: 'alice', objectId: 'WO-N101' }, [complete.id]); const incomplete = s.state().observations.at(-1);
  assert.equal(incomplete.outcome, 'incomplete');
  const before = s.state();
  await assert.rejects(s.attachScreenshot({ expectedRevision: before.revision - 1, sourcePath, evidenceId: complete.id, caption: 'Stale' }), /Stale revision/);
  for (const evidenceId of ['missing-observation', incomplete.id]) await assert.rejects(call(s, 'attachScreenshot', { sourcePath, evidenceId, caption: 'Unsupported attachment' }), /complete observation/);
  await assert.rejects(lstat(join(s.outDir, 'screenshots')), { code: 'ENOENT' });
  assert.equal(s.state().revision, before.revision); assert.equal(s.state().targetRequestCount, before.targetRequestCount);
  assert.deepEqual(s.state().screenshotArtifacts, []); assert.equal(s.state().faulted, false);
});

test('stop and record-only resume retain image linkage without restarting or contacting target; tamper fails closed', async t => {
  const { server, session: s, sourcePath, sessions } = await fixture(t), e = await evidence(s);
  await call(s, 'attachScreenshot', { sourcePath, evidenceId: e.basis.id, caption: 'Retained synthetic sample' });
  const artifact = s.state().screenshotArtifacts[0]; await event(s, 'consequence.documented', document(e, [pointer(artifact)]));
  await s.stop('Clean image continuity check'); const before = s.state(); await server.close();
  const originalRequest = http.request; let requests = 0;
  t.mock.method(http, 'request', function (...args) { requests++; return originalRequest.apply(this, args); });
  const originalListen = http.Server.prototype.listen; let listeners = 0;
  t.mock.method(http.Server.prototype, 'listen', function (...args) { listeners++; return originalListen.apply(this, args); });
  const resumed = await createWorkbench({ resumeFrom: s.outDir }); sessions.push(resumed);
  assert.equal(resumed.state().recordContinuation, true); assert.equal(resumed.state().targetClosed, true);
  assert.equal(requests, 0); assert.equal(listeners, 0); assert.equal(resumed.state().targetRequestCount, before.targetRequestCount);
  assert.deepEqual(resumed.state().screenshotArtifacts, before.screenshotArtifacts);
  assert.deepEqual(await resumed.screenshot(artifact.artifactId), PNG);
  assert.equal(resumed.state().consequenceOverview.entries[0].screenshots[0].href, '/artifacts/' + artifact.artifactId);
  const files = await readdir(join(s.outDir, 'screenshots')); assert.deepEqual(files, [artifact.artifactId + '.png']);
  await writeFile(join(s.outDir, 'screenshots', files[0]), Buffer.from('tampered bytes'));
  await assert.rejects(resumed.screenshot(artifact.artifactId), { code: 'NBRET_SCREENSHOT' });
  assert.equal(requests, 0); assert.equal(listeners, 0); assert.equal(resumed.state().faulted, false);
});
