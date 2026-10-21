import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, applyEvent, replay, summarize } from '../src/investigation/records.mjs';

const manifest = () => ({ schemaVersion: 1, kind: 'nbret-investigation', id: 'I-1', target: 'http://127.0.0.1:3000/', mode: 'practice', createdAt: '2026-10-18T00:00:00.000Z', limitations: ['Fixture metadata only'] });
const event = (id, type, payload, actor = { id: 'author', role: 'investigator' }) => ({ id, type, payload, at: '2026-10-18T01:00:00.000Z', actor });
const lead = (id = 'L1') => event(`lead-${id}`, 'lead.recorded', { id, title: 'A recorded observation', question: 'What does the artifact establish?', environment: 'fixture-v1', identity: 'tenant-A:user-A', observed: 'Supplied local observation', possibleConsequences: ['Possible consequence, unproven'], limitations: ['No target execution'] });
const evidence = (id = 'E1', extra = {}) => event(`evidence-${id}`, 'evidence.recorded', { id, leadId: 'L1', artifactDigest: 'a'.repeat(64), producerId: 'corroborator', environment: 'fixture-v1', identity: 'tenant-A:user-A', completeness: 'complete', source: 'operator-supplied', description: 'Supplied artifact reference', ...extra });
const review = (id = 'R1', extra = {}) => event(id, 'review.recorded', { leadId: 'L1', decision: 'supported', rationale: 'Supplied evidence supports this limited claim', evidenceIds: ['E1'], objections: ['Origin is declared'], ...extra }, { id: 'reviewer', role: 'reviewer' });
const verification = (id, result) => event(id, 'verification.recorded', { leadId: 'L1', result, instructions: 'Operator-supplied instructions', expected: 'Declared expected observation', observed: 'Declared actual observation', limitations: ['Human action not authenticated'] }, { id: 'owner', role: 'operator' });
const prepared = () => replay(manifest(), [lead(), evidence()]);

test('offline replay is deterministic, immutable and preserves declared provenance without claiming effect truth', () => {
  const m = manifest(), events = [lead(), evidence(), review(), verification('V1', 'reproduced')];
  const input = JSON.stringify({ m, events });
  const state = replay(m, events);
  assert.deepEqual(state, events.reduce(applyEvent, initialState(m)));
  assert.equal(JSON.stringify({ m, events }), input);
  const report = summarize(state);
  assert.equal(report.reviewSupported[0].id, 'L1');
  assert.deepEqual(report.categories.reviewSupported, ['L1']);
  assert.equal(report.reviewSupported[0].reviews[0].objections[0], 'Origin is declared');
  assert.equal(report.reviewSupported[0].verifications[0].result, 'reproduced');
  assert.match(report.limitations.join(' '), /not independently verified effects/);
  assert.match(report.limitations.join(' '), /operator-supplied declarations/);
  report.reviewSupported[0].reviews[0].rationale = 'mutated';
  assert.notEqual(state.leads[0].reviews[0].rationale, 'mutated');
  events[0].payload.title = 'changed'; m.limitations.push('changed');
  assert.notEqual(state.leads[0].title, 'changed');
  assert.equal(state.manifest.limitations.length, 1);
});

test('strict manifest rejects execution-shaped fields and credential-bearing or non-http targets', () => {
  for (const target of ['file:///tmp/x', 'http://user:pass@localhost/', 'https://localhost/?key=secret', 'https://localhost/#secret', 'https://localhost/?', ' https://localhost/']) {
    assert.throws(() => initialState({ ...manifest(), target }));
  }
  assert.throws(() => initialState({ ...manifest(), execute: true }), /unknown/);
  assert.throws(() => initialState({ ...manifest(), mode: 'autonomous' }), /mode/);
  assert.throws(() => initialState({ ...manifest(), createdAt: '2026-02-30T00:00:00.000Z' }), /timestamp/);
  assert.throws(() => initialState({ ...manifest(), limitations: [''] }), /limitations/);
  assert.equal(initialState({ ...manifest(), mode: 'blind' }).manifest.mode, 'blind');
});

test('supported review rejects self-review, wrong role, absent or incomplete corroboration and invalid references', () => {
  const s = prepared();
  const cases = [
    { ...review(), actor: { id: 'author', role: 'reviewer' } },
    { ...review(), actor: { id: 'reviewer', role: 'investigator' } },
    review('R1', { evidenceIds: [] }),
    review('R1', { evidenceIds: ['missing'] }),
    review('R1', { evidenceIds: ['E1', 'E1'] }),
    review('R1', { rationale: '' }),
  ];
  for (const r of cases) assert.throws(() => applyEvent(s, r));
  for (const extra of [{ completeness: 'incomplete' }, { producerId: 'author' }]) {
    const weak = replay(manifest(), [lead(), evidence('E1', extra)]);
    assert.throws(() => applyEvent(weak, review()), /complete matched evidence/);
    assert.equal(summarize(weak).unconfirmed.length, 1);
  }
  assert.throws(() => applyEvent(s, evidence('E2', { identity: 'tenant-B:user-B' })), /mismatch/);
  assert.throws(() => applyEvent(s, evidence('E2', { environment: 'fixture-v2' })), /mismatch/);
  const foreign = replay(manifest(), [lead(), lead('L2'), evidence('E2', { leadId: 'L2' })]);
  assert.throws(() => applyEvent(foreign, review('R', { evidenceIds: ['E2'] })), /foreign/);
});

test('later review and negative human records supersede positive presentation while all history survives', () => {
  let s = applyEvent(prepared(), review());
  s = applyEvent(s, verification('V1', 'reproduced'));
  assert.equal(summarize(s).reviewSupported.length, 1);
  s = applyEvent(s, verification('V2', 'not-reproduced'));
  assert.equal(summarize(s).reviewSupported.length, 0);
  assert.equal(summarize(s).needsAction.length, 1);
  s = applyEvent(s, review('R2'));
  assert.equal(summarize(s).needsAction.length, 1, 'review cannot erase negative operator verification');
  s = applyEvent(s, verification('V3', 'inconclusive'));
  assert.equal(summarize(s).needsAction.length, 1);
  s = applyEvent(s, verification('V4', 'reproduced'));
  assert.equal(summarize(s).reviewSupported.length, 1);
  s = applyEvent(s, review('R3', { decision: 'rejected', evidenceIds: [], objections: ['A later objection'] }));
  assert.equal(summarize(s).rejected.length, 1);
  assert.equal(summarize(s).reviewSupported.length, 0);
  assert.equal(s.leads[0].reviews.length, 3);
  assert.equal(s.leads[0].verifications.length, 4);
  s = applyEvent(s, review('R4', { decision: 'needs-action', evidenceIds: [] }));
  assert.equal(summarize(s).needsAction.length, 1);
  assert.equal(s.leads[0].reviews[2].objections[0], 'A later objection');
});

test('requests preserve resolution provenance and terminal stop survives replay without advancing work', () => {
  const operator = { id: 'owner', role: 'operator' };
  let s = prepared();
  s = applyEvent(s, event('Q1', 'request.recorded', { id: 'Q1', leadId: 'L1', question: 'Clarify intended policy', reason: 'Evidence does not establish intent' }));
  assert.equal(summarize(s).pendingRequests.length, 1);
  s = applyEvent(s, event('P1', 'progress.recorded', { note: 'Offline review', minutes: 3.5 }));
  const stop = event('S1', 'run.stopped', { reason: 'Declared time budget reached' }, operator);
  assert.throws(() => applyEvent(s, { ...stop, actor: { id: 'author', role: 'investigator' } }), /role/);
  s = applyEvent(s, stop);
  for (const e of [lead('L2'), evidence('E2'), event('Q2', 'request.recorded', { id: 'Q2', question: 'new', reason: 'new' }), { ...stop, id: 'S2' }]) assert.throws(() => applyEvent(s, e), /stopped/);
  assert.throws(() => applyEvent(s, event('resolve-bad', 'request.resolved', { id: 'Q1', resolution: 'Answered' })), /role/);
  s = applyEvent(s, event('resolve', 'request.resolved', { id: 'Q1', resolution: 'Supplied intended policy' }, operator));
  s = applyEvent(s, review());
  s = applyEvent(s, verification('V1', 'inconclusive'));
  s = applyEvent(s, event('P2', 'progress.recorded', { note: 'Passive review', minutes: 1 }));
  assert.throws(() => applyEvent(s, event('resolve2', 'request.resolved', { id: 'Q1', resolution: 'Again' }, operator)), /already resolved/);
  const restored = replay(manifest(), s.events);
  assert.deepEqual(restored, s);
  assert.equal(summarize(restored).status, 'stopped');
  assert.equal(summarize(restored).minutes, 4.5);
  assert.equal(summarize(restored).pendingRequests.length, 0);
  assert.equal(restored.requests[0].resolution.actor.id, 'owner');
});

test('schema and plain-JSON boundaries reject invalid input without changing prior state', () => {
  const state = prepared(), original = JSON.stringify(state);
  const malformed = [
    { ...lead('L2'), execute: 'command' },
    event('unknown', 'run.resume', {}),
    evidence('E2', { artifactDigest: 'wrong' }),
    evidence('E2', { leadId: 'missing' }),
    { ...lead('L2'), at: 'tomorrow' },
    { ...lead('L2'), actor: { id: 'actor', role: 'operator', authenticated: true } },
    event('negative', 'progress.recorded', { note: 'time', minutes: -1 }),
    event('negative-zero', 'progress.recorded', { note: 'time', minutes: -0 }),
    event('infinite', 'progress.recorded', { note: 'time', minutes: Infinity }),
    event('blank', 'progress.recorded', { note: ' ', minutes: 1 }),
    event('large', 'progress.recorded', { note: 'x'.repeat(70000), minutes: 1 }),
  ];
  for (const input of malformed) assert.throws(() => applyEvent(state, input));
  assert.throws(() => applyEvent(state, lead()), /Duplicate event/);
  assert.throws(() => applyEvent(state, { ...lead(), id: 'different' }), /Duplicate record/);
  const accessor = lead('L2');
  Object.defineProperty(accessor.payload, 'observed', { enumerable: true, get() { throw new Error('getter must not execute'); } });
  assert.throws(() => applyEvent(state, accessor), /data properties/);
  const polluted = JSON.parse(JSON.stringify(lead('L2')).replace('"payload":{', '"payload":{"__proto__":{},'));
  assert.throws(() => applyEvent(state, polluted), /Unsafe JSON key/);
  assert.throws(() => applyEvent(state, { ...lead('L2'), payload: new Date() }), /Plain JSON/);
  assert.equal(JSON.stringify(state), original);
  assert.throws(() => replay(manifest(), {}), /events/);
});

test('private replay reduction matches immutable appends across all event histories without input aliases', () => {
  const operator = { id: 'owner', role: 'operator' };
  const m = manifest();
  const events = [lead(), evidence(), review(), verification('V1', 'reproduced'),
    verification('V2', 'not-reproduced'), review('R2', { decision: 'needs-action', evidenceIds: [] }),
    event('Q1', 'request.recorded', { id: 'Q1', leadId: 'L1', question: 'Policy?', reason: 'Unknown intent' }),
    event('Q2', 'request.resolved', { id: 'Q1', resolution: 'Declared policy supplied' }, operator),
    event('P1', 'progress.recorded', { note: 'Offline work', minutes: 2 }),
    event('S1', 'run.stopped', { reason: 'Finished' }, operator),
    review('R3', { decision: 'rejected', evidenceIds: [], objections: ['Retained objection'] }),
    verification('V3', 'inconclusive')];
  const original = JSON.stringify({ m, events });
  let immutable = initialState(m);
  for (let i = 0; i < events.length; i++) {
    const prior = JSON.stringify(immutable);
    const next = applyEvent(immutable, events[i]);
    assert.equal(JSON.stringify(immutable), prior, 'applyEvent leaves caller state unchanged');
    immutable = next;
    const rebuilt = replay(m, events.slice(0, i + 1));
    assert.deepEqual(rebuilt, immutable, `state at prefix ${i + 1}`);
    assert.deepEqual(summarize(rebuilt), summarize(immutable));
  }
  assert.equal(JSON.stringify({ m, events }), original);
  const rebuilt = replay(m, events);
  rebuilt.manifest.limitations.push('output mutation');
  rebuilt.events[0].payload.limitations.push('output mutation');
  rebuilt.leads[0].reviews[0].objections.push('output mutation');
  rebuilt.evidence[0].description = 'output mutation';
  rebuilt.requests[0].resolution.resolution = 'output mutation';
  assert.equal(JSON.stringify({ m, events }), original, 'retained records do not alias input objects');
  assert.notEqual(rebuilt.leads[0].limitations.at(-1), 'output mutation', 'event payload and projected lead are separate copies');
});

test('failed replay keeps inputs intact and rejects the same invalid event as immutable append', () => {
  const m = manifest(), prefix = [lead(), evidence(), review()];
  const invalid = [
    { ...lead(), id: 'duplicate-lead-record' },
    evidence('E2', { identity: 'another-identity' }),
    review('R2', { evidenceIds: ['missing'] }),
    { ...review('R2'), actor: { id: 'author', role: 'reviewer' } },
    event('bad-request', 'request.resolved', { id: 'missing', resolution: 'none' }, { id: 'owner', role: 'operator' }),
    { ...prefix[0] },
    event('unknown', 'run.resume', {}),
  ];
  for (const bad of invalid) {
    const events = [...prefix, bad], original = JSON.stringify({ m, events });
    const current = prefix.reduce(applyEvent, initialState(m)), before = JSON.stringify(current);
    let expected;
    assert.throws(() => applyEvent(current, bad), error => { expected = error.message; return true; });
    assert.throws(() => replay(m, events), error => error.message === expected);
    assert.equal(JSON.stringify(current), before);
    assert.equal(JSON.stringify({ m, events }), original);
  }
});

test('replay rejects missing history slots, accessor elements and array extras without invoking getters', () => {
  assert.throws(() => replay(manifest(), [, lead()]), /Dense plain event array/);
  const events = [lead()]; events.extra = 'not an event';
  assert.throws(() => replay(manifest(), events), /Dense plain event array/);
  const accessor = [lead()]; let invoked = false;
  Object.defineProperty(accessor, '0', { enumerable: true, get() { invoked = true; return lead(); } });
  assert.throws(() => replay(manifest(), accessor), /Dense plain event array/);
  assert.equal(invoked, false);
  const symbol = [lead()]; symbol[Symbol('hidden')] = true;
  assert.throws(() => replay(manifest(), symbol), /Dense plain event array/);
});

test('current rejection survives conflicting owner checks and a later supported review still respects negative verification', () => {
  let state = replay(manifest(), [lead(), evidence(), review(), verification('V1', 'not-reproduced'),
    review('R2', { decision: 'rejected', evidenceIds: [] })]);
  assert.deepEqual(summarize(state).categories.rejected, ['L1']);
  assert.equal(summarize(state).needsAction.length, 0);
  state = applyEvent(state, verification('V2', 'reproduced'));
  assert.equal(summarize(state).rejected.length, 1, 'owner reproduction does not override a rejection');
  state = applyEvent(state, verification('V3', 'inconclusive'));
  state = applyEvent(state, review('R3'));
  assert.equal(summarize(state).needsAction.length, 1);
  assert.equal(summarize(state).reviewSupported.length, 0);
  assert.equal(state.leads[0].reviews.length, 3);
  assert.equal(state.leads[0].verifications.length, 3);
});

test('duplicate record identities cannot relabel an existing artifact or its lead author', () => {
  const state = prepared(), original = JSON.stringify(state);
  assert.throws(() => applyEvent(state, { ...evidence('E1', { producerId: 'another-producer' }), id: 'new-event' }), /Duplicate record id/);
  assert.throws(() => applyEvent(state, { ...lead(), id: 'new-lead-event', actor: { id: 'new-author', role: 'investigator' } }), /Duplicate record id/);
  assert.throws(() => applyEvent(state, review('R', { evidenceIds: ['E1', 'E1'] })), /Unique evidence/);
  assert.equal(JSON.stringify(state), original);
});

test('aggregate history and structure budgets bound replay independently of event count', () => {
  const payload = { id: 'L0', title: 'Large inert metadata', question: 'Bounded?', environment: 'fixture', identity: 'actor', observed: 'x'.repeat(4000),
    possibleConsequences: Array(6).fill('x'.repeat(4000)), limitations: Array(6).fill('x'.repeat(4000)) };
  const events = Array.from({ length: 330 }, (_, i) => event(`event-${i}`, 'lead.recorded', { ...payload, id: `L${i}` }));
  assert.throws(() => replay(manifest(), events), /History size limit/);
  assert.equal(events[0].payload.limitations.length, 6);
  assert.equal(events.at(-1).payload.id, 'L329');
  assert.throws(() => replay(manifest(), Array(10001).fill(lead())), /Bounded events/);
  const tooManyNodes = event('many', 'progress.recorded', { note: Array.from({ length: 100 }, () => Array(100).fill(null)), minutes: 1 });
  assert.throws(() => applyEvent(initialState(manifest()), tooManyNodes), /structure limit/);
  let size = JSON.stringify(manifest()).length, boundary = 0;
  while (size + JSON.stringify(events[boundary]).length <= 16 * 1024 * 1024) size += JSON.stringify(events[boundary++]).length;
  const prefix = replay(manifest(), events.slice(0, boundary));
  assert.throws(() => applyEvent(prefix, events[boundary]), /History size limit/);
  assert.throws(() => replay(manifest(), events.slice(0, boundary + 1)), /History size limit/);
  assert.equal(prefix.events.length, boundary, 'failed immutable append leaves the prior history intact');
});
