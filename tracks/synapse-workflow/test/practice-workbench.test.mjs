import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import http from 'node:http';
import { runInNewContext } from 'node:vm';
import { createWorkbench, readWorkbench, projectWorkbench, renderWorkbenchReport } from '../src/practice/workbench.mjs';
import { startWorkbenchServer } from '../src/practice/workbench-server.mjs';
import { readJournal } from '../src/investigation/journal.mjs';

async function fixture(t, server = false) {
  const root = await mkdtemp(join(tmpdir(), 'nbret-workbench-review-'));
  const instance = server ? await startWorkbenchServer({ outDir: join(root, 'session') }) : await createWorkbench({ outDir: join(root, 'session') });
  t.after(async () => { await instance.close(); await rm(root, { recursive: true, force: true }); });
  return server ? instance : { session: instance };
}
const proposal = (action, evidenceIds = [], extra = {}) => ({ question: 'What does this selected observation establish?', reason: 'Independent integration test of a declared local step', evidenceIds, action, ...extra });
const customStep = (session, action, evidenceIds = []) => session.step({ expectedRevision: session.state().revision, proposal: proposal(action, evidenceIds) });
const review = (decision, extra = {}) => ({ decisionId: decision.id, reviewerId: 'independent-test-reviewer', verdict: 'needs-action', rationale: 'This supports the listed observation only. Objection: same-app evidence is not independent effect verification.', evidenceIds: [decision.observationId], ...extra });
const stateOf = async server => (await fetch(server.url + '/api/state')).json();
async function command(server, path, payload, extra = {}) {
  const state = await stateOf(server);
  const r = await fetch(server.url + path, { method: 'POST', headers: { origin: server.url, 'x-workbench-nonce': state.nonce, 'content-type': 'application/json', ...extra }, body: typeof payload === 'string' ? payload : JSON.stringify(payload) });
  return { status: r.status, value: await r.json(), response: r };
}

test('stale revisions, unknown proposals and unsupported evidence fail before target requests', async t => {
  const { session } = await fixture(t), initial = session.state();
  await assert.rejects(session.step({ expectedRevision: initial.revision + 1 }), /Stale revision/);
  assert.equal(session.state().revision, initial.revision, 'stale commands do not mutate the journal');
  await assert.rejects(session.step({ expectedRevision: initial.revision, proposal: proposal({ kind: 'profile', actor: 'alice' }, [], { arbitrary: 'rejected-private-canary' }) }), /Unexpected/);
  await assert.rejects(customStep(session, { kind: 'profile', actor: 'alice' }, ['missing-observation']), /missing or incomplete/);
  let getterRan = false;
  const accessor = { expectedRevision: initial.revision, get proposal() { getterRan = true; return {}; } };
  await assert.rejects(session.step(accessor), /Inert JSON/); assert.equal(getterRan, false);
  assert.equal(session.state().revision, initial.revision + 2); assert.equal(session.state().targetRequestCount, 0);
  assert.equal(session.state().rejectedProposals.length, 2); assert.equal(session.state().decisions.length, 0); assert.equal(session.state().observations.length, 0);
  const rejectedJournal = await readJournal(join(session.outDir, 'journal'));
  assert.equal(rejectedJournal.events.filter(e => e.type === 'proposal.rejected').length, 2);
  assert.doesNotMatch(JSON.stringify(rejectedJournal), /rejected-private-canary/);
  assert.deepEqual((await readWorkbench(session.outDir)).rejectedProposals, session.state().rejectedProposals);
  const complete = await customStep(session, { kind: 'profile', actor: 'alice' });
  const profileId = complete.observations.at(-1).id;
  await assert.rejects(customStep(session, { kind: 'profile', actor: 'bob' }, [profileId, profileId]), /unique evidence/);
  const blocked = await customStep(session, { kind: 'order', actor: 'alice', objectId: 'WO-N101' }, [profileId]);
  assert.equal(blocked.observations.at(-1).outcome, 'incomplete');
  assert.equal(blocked.observations.at(-1).errorCode, 'NBRET_PRACTICE_OBJECT_NOT_OBSERVED');
  assert.equal(blocked.observations.at(-1).actionReached, false);
  assert.equal(blocked.targetRequestCount, complete.targetRequestCount);
  const before = blocked.revision;
  await assert.rejects(customStep(session, { kind: 'profile', actor: 'bob' }, [blocked.observations.at(-1).id]), /missing or incomplete/);
  await assert.rejects(session.review({ expectedRevision: session.state().revision, review: review(blocked.decisions.at(-1)) }), /Executed decision/);
  assert.equal(session.state().revision, before + 1);
  assert.equal(session.state().decisions.length, blocked.decisions.length); assert.equal(session.state().observations.length, blocked.observations.length);
  assert.equal(session.state().targetRequestCount, blocked.targetRequestCount);
});

test('concurrent step refuses duplicate execution and journal replay preserves source/support/observation links', async t => {
  const { session } = await fixture(t);
  const list = await customStep(session, { kind: 'orders', actor: 'alice' }), evidenceId = list.observations.at(-1).id;
  const input = { expectedRevision: list.revision, proposal: proposal({ kind: 'transition', actor: 'alice', objectId: 'WO-N101', transition: 'submit' }, [evidenceId]) };
  const outcomes = await Promise.allSettled([session.step(input), session.step(input)]);
  assert.equal(outcomes.filter(r => r.status === 'fulfilled').length, 1); assert.equal(outcomes.filter(r => r.status === 'rejected').length, 1);
  assert.match(outcomes.find(r => r.status === 'rejected').reason.message, /already running/);
  const current = session.state(), decision = current.decisions.at(-1), observation = current.observations.at(-1);
  assert.equal(decision.source, 'session'); assert.deepEqual(decision.evidenceIds, [evidenceId]); assert.equal(decision.observationId, observation.id);
  assert.equal(observation.response.value.order.state, 'submitted');
  assert.equal(current.targetRequestCount, list.targetRequestCount + 1);
  const snapshot = await readJournal(join(session.outDir, 'journal'));
  const started = snapshot.events.filter(e => e.type === 'action.started' && e.proposal.id === decision.id);
  const finished = snapshot.events.filter(e => e.type === 'action.finished' && e.decision.id === decision.id);
  assert.equal(started.length, 1); assert.equal(finished.length, 1);
  assert.equal(started[0].proposal.source, 'session'); assert.deepEqual(started[0].proposal.evidenceIds, [evidenceId]);
  const replayed = projectWorkbench(snapshot), reopened = await readWorkbench(session.outDir);
  assert.deepEqual(reopened, replayed); assert.deepEqual(reopened.decisions, current.decisions); assert.deepEqual(reopened.observations, current.observations);
  const fresh = await customStep(session, { kind: 'order', actor: 'alice', objectId: 'WO-N101' }, [observation.id]);
  assert.equal(fresh.observations.at(-1).response.value.order.state, 'submitted');
});

test('review binds an executed decision and its observation, preserves objections and remains usable after stop', async t => {
  const { session } = await fixture(t);
  let state = await customStep(session, { kind: 'profile', actor: 'alice' });
  const first = state.decisions.at(-1);
  state = await customStep(session, { kind: 'profile', actor: 'bob' });
  const second = state.decisions.at(-1), before = state.revision;
  for (const bad of [review(first, { reviewerId: 'session' }), review(first, { reviewerId: 'rules' }), review(first, { evidenceIds: [] }), review(first, { evidenceIds: [second.observationId] }), review(first, { evidenceIds: [first.observationId, first.observationId] }), review(first, { decisionId: 'unknown' }), review(first, { objections: [''] })]) {
    await assert.rejects(session.review({ expectedRevision: session.state().revision, review: bad }));
  }
  assert.equal(session.state().revision, before);
  const targetUrl = session.state().workspaceUrl, stopped = await session.stop('Independent reviewer stop check');
  assert.equal(stopped.stopped, true); assert.equal(stopped.targetClosed, true); assert.equal(stopped.unresolvedAttempts.length, 0);
  await assert.rejects(fetch(targetUrl + '/api/me'));
  const requestCount = stopped.targetRequestCount;
  await assert.rejects(session.step({ expectedRevision: stopped.revision }), /stopped/);
  await assert.rejects(session.steer({ expectedRevision: stopped.revision, mode: 'resume' }), /stopped/);
  const rationale = review(first).rationale;
  const objections = ['Same-app identity is not external attestation', 'No production coverage is established'];
  const reviewed = await session.review({ expectedRevision: stopped.revision, review: review(first, { objections, observedConsequence: 'Synthetic Alice profile returned', potentialDamage: 'No damage demonstrated' }) });
  assert.equal(reviewed.reviews[0].rationale, rationale); assert.equal(reviewed.reviews[0].decisionId, first.id);
  assert.deepEqual(reviewed.reviews[0].evidenceIds, [first.observationId]); assert.equal(reviewed.targetRequestCount, requestCount);
  assert.equal(reviewed.stopped, true); assert.match(renderWorkbenchReport(reviewed), /Objection: same-app evidence/);
  const reopened = await readWorkbench(session.outDir); assert.equal(reopened.reviews[0].rationale, rationale); assert.deepEqual(reopened.reviews[0].objections, objections);
  const stoppedJournal = await readJournal(join(session.outDir, 'journal'));
  const receipt = stoppedJournal.events.find(e => e.type === 'stopped'); assert.equal(receipt.targetRequestLog.length, requestCount);
  assert.ok(receipt.targetRequestLog.every(r => Object.keys(r).sort().join(',') === 'actorId,method,path'));
  assert.deepEqual(reopened.targetRequestLog, receipt.targetRequestLog); assert.equal(reopened.targetRequestCount, requestCount);
  const exported = await session.exportReport(); assert.match(await readFile(exported.htmlPath, 'utf8'), /No damage demonstrated/);
});

test('HTTP route containment, origin/nonce and bounded JSON controls do not execute rejected requests', async t => {
  const server = await fixture(t, true), initial = await stateOf(server);
  for (const path of ['/api/state?extra=1', '/api/../journal/manifest.json', '/journal', '/workbench.js?x=1', '/api/step/']) {
    const response = await fetch(server.url + path); assert.equal(response.status, 404);
  }
  const root = await fetch(server.url + '/'); assert.match(await root.text(), /Investigation workbench/);
  const script = await fetch(server.url + '/workbench.js'); assert.match(script.headers.get('content-type'), /javascript/);
  assert.equal(root.headers.has('access-control-allow-origin'), false); assert.match(root.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal((await command(server, '/api/step', { expectedRevision: initial.revision }, { origin: 'http://outside.invalid' })).status, 403);
  assert.equal((await command(server, '/api/step', { expectedRevision: initial.revision }, { 'x-workbench-nonce': 'wrong' })).status, 403);
  assert.equal((await command(server, '/api/step', { expectedRevision: initial.revision }, { 'sec-fetch-site': 'cross-site' })).status, 403);
  assert.equal((await command(server, '/api/step', '{}', { 'content-type': 'text/plain' })).status, 415);
  const wrongHostStatus = await new Promise((resolve, reject) => {
    const req = http.request(server.url + '/api/state', { headers: { host: 'unexpected.invalid' } }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.on('error', reject); req.end();
  });
  assert.equal(wrongHostStatus, 421);
  assert.equal((await command(server, '/api/step', '{not json')).status, 400);
  assert.equal((await command(server, '/api/step', '[]')).status, 400);
  assert.equal((await command(server, '/api/step', JSON.stringify({ padding: 'x'.repeat(17000) }))).status, 413);
  assert.equal((await command(server, '/api/step?x=1', { expectedRevision: initial.revision })).status, 404);
  const badProposal = await command(server, '/api/step', { expectedRevision: initial.revision, proposal: proposal({ kind: 'profile', actor: 'alice' }, [], { path: '/arbitrary' }) });
  assert.equal(badProposal.status, 409);
  assert.equal((await command(server, '/api/step', { expectedRevision: 9999 })).status, 409);
  assert.equal((await command(server, '/api/steer', { expectedRevision: -1, mode: 'pause' })).status, 409);
  const after = await stateOf(server); assert.equal(after.revision, initial.revision + 1); assert.equal(after.targetRequestCount, 0);
  assert.equal(after.rejectedProposals.length, 1); assert.equal(after.decisions.length, 0); assert.equal(after.observations.length, 0);
});

test('HTTP step, pause/resume, continuation and terminal stop preserve inspectable state', async t => {
  const server = await fixture(t, true); let state = await stateOf(server);
  const first = await command(server, '/api/step', { expectedRevision: state.revision }); assert.equal(first.status, 200); state = first.value;
  assert.equal(state.decisions[0].source, 'rules'); assert.equal(state.observations[0].outcome, 'complete');
  const paused = await command(server, '/api/steer', { expectedRevision: state.revision, mode: 'pause' }); assert.equal(paused.status, 200); assert.equal(paused.value.paused, true);
  const pausedRequests = paused.value.targetRequestCount;
  assert.equal((await command(server, '/api/step', { expectedRevision: paused.value.revision })).status, 409);
  assert.equal((await command(server, '/api/continue', { expectedRevision: paused.value.revision })).status, 409);
  assert.equal((await stateOf(server)).targetRequestCount, pausedRequests);
  const resumed = await command(server, '/api/steer', { expectedRevision: paused.value.revision, mode: 'resume', priority: 'workflow' }); assert.equal(resumed.status, 200);
  const continuing = await command(server, '/api/continue', { expectedRevision: resumed.value.revision }); assert.equal(continuing.status, 202);
  const latest = await stateOf(server), stopped = await command(server, '/api/stop', { expectedRevision: latest.revision, reason: 'Review stop during continuation' });
  assert.equal(stopped.status, 200); assert.equal(stopped.value.stopped, true); assert.equal(stopped.value.targetClosed, true); assert.equal(stopped.value.busy, false);
  const stoppedState = await stateOf(server); assert.equal(stoppedState.automatic, false); assert.equal(stoppedState.unresolvedAttempts.length, 0);
  const requests = stoppedState.targetRequestCount;
  assert.equal((await command(server, '/api/step', { expectedRevision: stoppedState.revision })).status, 409);
  assert.equal((await command(server, '/api/continue', { expectedRevision: stoppedState.revision })).status, 409);
  assert.equal((await stateOf(server)).targetRequestCount, requests);
  const decision = stoppedState.decisions.find(d => d.status === 'executed');
  const reviewed = await command(server, '/api/review', { expectedRevision: stoppedState.revision, review: review(decision) }); assert.equal(reviewed.status, 200);
  assert.equal(reviewed.value.reviews.length, 1); assert.equal(reviewed.value.stopped, true);
});

test('invalid combined steering leaves no accepted partial priority change', async t => {
  const { session } = await fixture(t), before = session.state();
  await assert.rejects(session.steer({ expectedRevision: before.revision, priority: 'workflow', mode: 'unknown' }));
  const after = session.state(); assert.equal(after.revision, before.revision); assert.equal(after.priority, before.priority);
});

test('UI keeps Stop usable while a manual command is pending and does not duplicate the step', async t => {
  const server = await fixture(t, true), initial = await stateOf(server);
  const elements = new Map(), make = () => ({ textContent: '', value: '', disabled: false, options: [], dataset: {},
    append() {}, replaceChildren() {}, querySelectorAll() { return []; }, querySelector() { return make(); } });
  const get = id => { if (!elements.has(id)) elements.set(id, make()); return elements.get(id); };
  let current = initial, release;
  const waiting = new Promise(resolve => { release = resolve; }), calls = [];
  const script = await readFile(new URL('../src/practice/workbench-ui.js', import.meta.url), 'utf8');
  runInNewContext(script, { document: { getElementById: get, createElement: make }, setInterval() {}, fetch: async path => {
    calls.push(path);
    if (path === '/api/step') await waiting;
    if (path === '/api/stop') current = { ...current, stopped: true, stopRequested: true };
    return { ok: true, json: async () => current };
  } });
  await new Promise(resolve => setImmediate(resolve));
  const step = get('step').onclick();
  try {
    assert.equal(Boolean(get('step').disabled), true);
    assert.equal(Boolean(get('stop').disabled), false, 'Stop must be available while awaiting a manual step');
    await get('step').onclick();
    await get('stop').onclick();
    assert.equal(calls.filter(path => path === '/api/step').length, 1);
    assert.equal(calls.filter(path => path === '/api/stop').length, 1, 'Stop handler bypasses the ordinary working-command guard');
  } finally { release(); await step; }
});

test('fresh-session creation rotates nonce, preserves the old journal and admits only one concurrent replacement', async t => {
  const server = await fixture(t, true), oldSession = server.session, initial = await stateOf(server);
  assert.equal((await command(server, '/api/new', { expectedRevision: initial.revision })).status, 409, 'active target cannot be silently replaced');
  const first = await command(server, '/api/step', { expectedRevision: initial.revision }); assert.equal(first.status, 200);
  const stop = await command(server, '/api/stop', { expectedRevision: first.value.revision, reason: 'Restart practice from a fresh target' });
  assert.equal(stop.value.targetClosed, true);
  const original = await readJournal(join(oldSession.outDir, 'journal')), originalBytes = JSON.stringify(original);
  const priorDirectories = await readdir(dirname(oldSession.outDir));
  const payload = JSON.stringify({ expectedRevision: stop.value.revision });
  const options = { method: 'POST', headers: { origin: server.url, 'content-type': 'application/json', 'x-workbench-nonce': stop.value.nonce }, body: payload };
  const replacements = await Promise.all([fetch(server.url + '/api/new', options), fetch(server.url + '/api/new', options)]);
  assert.equal(replacements.filter(r => r.status === 200).length, 1); assert.equal(replacements.filter(r => r.status !== 200).length, 1);
  const fresh = await stateOf(server), newSession = server.session;
  assert.notEqual(newSession, oldSession); assert.notEqual(fresh.id, stop.value.id); assert.notEqual(fresh.nonce, stop.value.nonce);
  assert.notEqual(fresh.workspaceUrl, stop.value.workspaceUrl); assert.notEqual(newSession.outDir, oldSession.outDir);
  assert.equal(dirname(newSession.outDir), dirname(oldSession.outDir)); assert.equal(fresh.revision, 0); assert.equal(fresh.stopped, false);
  assert.equal(fresh.targetRequestCount, 0); assert.equal(fresh.decisions.length, 0); assert.equal(fresh.observations.length, 0);
  const afterDirectories = await readdir(dirname(oldSession.outDir));
  assert.equal(afterDirectories.length, priorDirectories.length + 1, 'exactly one fresh journal/target directory');
  assert.equal(JSON.stringify(await readJournal(join(oldSession.outDir, 'journal'))), originalBytes);
  const oldNonce = await command(server, '/api/step', { expectedRevision: fresh.revision }, { 'x-workbench-nonce': stop.value.nonce }); assert.equal(oldNonce.status, 403);
  assert.equal((await stateOf(server)).targetRequestCount, 0);
  const next = await command(server, '/api/step', { expectedRevision: fresh.revision }); assert.equal(next.status, 200); assert.equal(next.value.targetRequestCount, 1);
  assert.equal(oldSession.state().stopped, true); await assert.rejects(fetch(stop.value.workspaceUrl + '/api/me'));
  await server.close(); await assert.rejects(fetch(fresh.workspaceUrl + '/api/me')); await assert.rejects(fetch(server.url + '/api/state'));
  assert.equal(newSession.state().targetClosed, true); assert.equal(JSON.stringify(await readJournal(join(oldSession.outDir, 'journal'))), originalBytes);
});

test('exports at the same revision have distinct paths and contain full normalized evidence without rejected input', async t => {
  const { session } = await fixture(t);
  const state = await customStep(session, { kind: 'profile', actor: 'alice' });
  const observation = state.observations.at(-1);
  await assert.rejects(session.step({ expectedRevision: state.revision, proposal: proposal({ kind: 'profile', actor: 'bob' }, [], { private: 'omit-this-rejected-value' }) }));
  const before = session.state(), first = await session.exportReport(), second = await session.exportReport();
  assert.notEqual(first.htmlPath, second.htmlPath); assert.notEqual(first.jsonPath, second.jsonPath); assert.equal(session.state().revision, before.revision);
  const parsed = JSON.parse(await readFile(first.jsonPath, 'utf8')), html = await readFile(first.htmlPath, 'utf8');
  assert.deepEqual(parsed.observations.at(-1), observation);
  for (const text of [observation.id, observation.response.bodySha256, observation.request.path, 'principal', 'bodyBytes', 'representation', 'elapsedMs']) assert.ok(html.includes(text), `report contains normalized ${text}`);
  assert.ok(html.includes('Alice Morgan')); assert.doesNotMatch(html, /omit-this-rejected-value/); assert.doesNotMatch(JSON.stringify(parsed), /omit-this-rejected-value/);
  assert.equal(parsed.rejectedProposals.length, 1); assert.match(html, /Rejected session proposals/);
});

test('old-nonce command whose body crosses a reset cannot act on the fresh target', async t => {
  const server = await fixture(t, true), initial = await stateOf(server);
  const stop = await command(server, '/api/stop', { expectedRevision: initial.revision });
  let req;
  const pending = new Promise((resolve, reject) => {
    req = http.request(server.url + '/api/step', { method: 'POST', headers: { origin: server.url, 'x-workbench-nonce': stop.value.nonce, 'content-type': 'application/json' } }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
    req.on('error', reject); req.write('{"expectedRevision":');
  });
  try {
    // Let the local HTTP server admit headers and wait for the remaining body.
    await new Promise(resolve => setTimeout(resolve, 30));
    const fresh = await command(server, '/api/new', { expectedRevision: stop.value.revision }); assert.equal(fresh.status, 200);
    req.end('0}');
    assert.ok([403, 409].includes(await pending), 'generation/nonce must be rechecked after awaiting body');
    assert.equal((await stateOf(server)).targetRequestCount, 0);
    assert.equal((await stateOf(server)).decisions.length, 0);
  } finally { req.destroy(); await pending.catch(() => {}); }
});

test('server close during fresh-target creation waits for replacement and closes both target generations', async t => {
  const server = await fixture(t, true), initial = await stateOf(server), oldSession = server.session;
  const stop = await command(server, '/api/stop', { expectedRevision: initial.revision });
  const oldJournal = JSON.stringify(await readJournal(join(oldSession.outDir, 'journal')));
  const parent = dirname(oldSession.outDir), before = await readdir(parent);
  const request = fetch(server.url + '/api/new', { method: 'POST', headers: { origin: server.url, 'x-workbench-nonce': stop.value.nonce, 'content-type': 'application/json' }, body: JSON.stringify({ expectedRevision: stop.value.revision }) }).then(async r => ({ status: r.status, value: await r.json() }));
  let created = false;
  for (let i = 0; i < 200; i++) {
    if ((await readdir(parent)).length > before.length) { created = true; break; }
    await new Promise(resolve => setImmediate(resolve));
  }
  assert.equal(created, true, 'fresh session creation began');
  await server.close();
  await request.catch(() => {}); // HTTP response may be interrupted by server shutdown.
  const current = server.session.state(); assert.notEqual(server.session, oldSession); assert.equal(current.stopped, true); assert.equal(current.targetClosed, true);
  await assert.rejects(fetch(current.workspaceUrl + '/api/me')); await assert.rejects(fetch(stop.value.workspaceUrl + '/api/me'));
  await assert.rejects(fetch(server.url + '/api/state'));
  assert.equal(JSON.stringify(await readJournal(join(oldSession.outDir, 'journal'))), oldJournal);
});

test('an old continuation wait cannot resume against a new target generation', async t => {
  const server = await fixture(t, true), originalTimer = globalThis.setTimeout, continuationWaits = [];
  t.mock.method(globalThis, 'setTimeout', (callback, delay, ...args) => {
    if (delay === 40) { continuationWaits.push(() => callback(...args)); return {}; }
    return originalTimer(callback, delay, ...args);
  });
  const waitFor = async predicate => {
    for (let i = 0; i < 400; i++) { if (await predicate()) return; await new Promise(resolve => originalTimer(resolve, 5)); }
    assert.fail('Expected continuation checkpoint');
  };
  try {
    let state = await stateOf(server);
    assert.equal((await command(server, '/api/continue', { expectedRevision: state.revision })).status, 202);
    await waitFor(async () => continuationWaits.length === 1 && !(await stateOf(server)).busy);
    state = await stateOf(server);
    const stopped = await command(server, '/api/stop', { expectedRevision: state.revision }); assert.equal(stopped.status, 200);
    const reset = await command(server, '/api/new', { expectedRevision: stopped.value.revision }); assert.equal(reset.status, 200);
    assert.equal((await command(server, '/api/continue', { expectedRevision: reset.value.revision })).status, 202);
    await waitFor(async () => continuationWaits.length === 2 && !(await stateOf(server)).busy);
    const fresh = await stateOf(server), count = fresh.targetRequestCount;
    continuationWaits.shift()(); // Resolve only the previous generation's held wait.
    for (let i = 0; i < 40; i++) {
      const current = await stateOf(server);
      if (current.targetRequestCount !== count || !current.automatic || continuationWaits.length === 2) break;
      await new Promise(resolve => originalTimer(resolve, 5));
    }
    const current = await stateOf(server);
    assert.equal(current.targetRequestCount, count, 'old continuation must not run a step against the fresh instance');
    assert.equal(current.automatic, true, 'the old loop finalizer cannot clear the new continuation');
  } finally {
    const closing = server.close(); let finished = false; closing.finally(() => { finished = true; }).catch(() => {});
    for (let i = 0; i < 500 && !finished; i++) { while (continuationWaits.length) continuationWaits.shift()(); await new Promise(resolve => originalTimer(resolve, 5)); }
    await closing;
  }
});
