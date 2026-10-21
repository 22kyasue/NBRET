import test from 'node:test';
import assert from 'node:assert/strict';
import { progressSummary, compareRuns, sampleRejected, validateIteration } from '../src/investigation/measurement.mjs';

const order = (state = 'draft') => ({ id: 'WO-N101', tenant: 'north', owner: 'alice', state, budget: 480, description: 'Synthetic description' });
const observation = (id, extra = {}) => ({ id, action: { kind: 'order', actor: 'alice', objectId: 'WO-N101' }, outcome: 'complete',
  identity: { principal: 'alice', tenant: 'north', role: 'member' }, response: { status: 200, value: { order: order() }, bodySha256: 'changing-raw-body-hash' }, transport: { complete: true, elapsedMs: 1 }, ...extra });
const progress = (observations, extra = {}) => progressSummary({ observations, decisions: [], ...extra });
const contract = () => ({ scope: 'owned-scope-v1', access: 'outside-two-roles', budget: 'same-budget', assistance: 'same-assistance', familiarity: 'guided', eligibilityVersion: 'population-v1', targetVersion: 'app-v1', scorerVersion: 'scorer-v1' });
const counts = () => ({ eligible: 10, demonstrated: 5, notDemonstrated: 2, inconclusive: 1, unsupported: 1, unscored: 1 });
const run = (kind, value = 5) => ({ id: kind === 'manual' ? 'baseline-run' : 'candidate-run', kind, operatorId: kind === 'manual' ? 'expert-owner' : 'session-owner', version: kind === 'manual' ? 'manual-v1' : 'workflow-v2', contract: contract(), counts: counts(), metric: { name: 'supplied-adjudicated-value', unit: 'case-value', value } });
const protocol = () => ({ id: 'protocol-v1', frozen: true, contract: contract(), baselineVersion: 'manual-v1', candidateVersion: 'workflow-v2', metric: { name: 'supplied-adjudicated-value', unit: 'case-value', direction: 'higher', minImprovement: 1 }, admission: { status: 'externally-asserted', reference: 'external-receipt-reference' }, baselineOwner: { id: 'expert-owner', qualification: 'expert', reference: 'qualification-reference' } });
const comparison = (baseline = run('manual'), candidate = run('candidate', 7), p = protocol()) => compareRuns({ baseline, candidate, protocol: p });

test('semantic novelty ignores prose, metadata IDs, timing, raw-body digests and key order', () => {
  const a = observation('O1');
  const b = observation('O2', { at: 'new time', confidence: 1, response: { bodySha256: 'new-raw-hash', value: { order: { description: 'A completely different paraphrase', ...order(), title: 'A new title' } }, status: 200 }, transport: { complete: true, elapsedMs: 999 } });
  const result = progress([a, b]);
  assert.equal(result.counts.useful, 1); assert.equal(result.counts.duplicates, 1); assert.equal(result.ledger[0].factHash, result.ledger[1].factHash);
  const changed = observation('O3', { response: { status: 200, value: { order: order('submitted') } } });
  const state = progress([a, b, changed]); assert.equal(state.counts.useful, 2); assert.notEqual(state.ledger[0].factHash, state.ledger[2].factHash);
  const wrong = observation('O4', { identity: { principal: 'bob', tenant: 'south', role: 'member' } }); assert.equal(progress([wrong]).counts.unknown, 1);
  const denied = observation('O5', { response: { status: 404, value: { error: 'Not found' } } });
  const paraphrased = observation('O6', { response: { status: 404, value: { error: 'No such item, differently worded' } } });
  assert.equal(progress([denied, paraphrased]).counts.useful, 1);
});

test('list ordering does not earn progress, while observed identity and resource population do', () => {
  const a = observation('O1', { action: { kind: 'orders', actor: 'alice' }, response: { status: 200, value: { orders: [order(), { ...order(), id: 'WO-N102' }] } } });
  const b = structuredClone(a); b.id = 'O2'; b.response.value.orders.reverse();
  assert.equal(progress([a, b]).counts.duplicates, 1);
  const c = structuredClone(a); c.id = 'O3'; c.response.value.orders.push({ ...order(), id: 'WO-N103' });
  assert.equal(progress([a, b, c]).counts.useful, 2);
  const bob = observation('O4', { action: { kind: 'orders', actor: 'bob' }, identity: { principal: 'bob', tenant: 'south', role: 'member' }, response: { status: 200, value: { orders: [] } } });
  assert.equal(progress([a, bob]).counts.useful, 2);
  const duplicate = structuredClone(a); duplicate.response.value.orders.push(order()); assert.equal(progress([duplicate]).counts.unknown, 1, 'ambiguous resource identities do not earn progress');
});

test('diminishing-return windows recommend owner pause only after untried frontier is excluded', () => {
  const observations = Array.from({ length: 13 }, (_, i) => observation(`O${i}`));
  const state = progress(observations);
  assert.equal(state.shouldPause, true); assert.equal(state.recommendation.permissionChange, false); assert.equal(state.rolling.useful, 0);
  assert.match(state.recommendation.reason, /recommend owner pause/);
  assert.equal(progress(observations, { frontierAvailable: true }).shouldPause, false);
  assert.match(progress(observations, { policy: { frontierAvailable: true } }).recommendation.reason, /branches remain/);
  assert.equal(progress(observations.slice(0, 3)).shouldPause, false);
  assert.equal(progress(observations, { policy: { windowSize: 2, windows: 2, minUseful: 1 } }).shouldPause, true);
  const only = observation('shared');
  const repeatedDecisions = Array.from({ length: 13 }, (_, i) => ({ id: `D${i}`, source: 'session', question: `Paraphrase ${i}`, observationId: 'shared' }));
  const repeated = progress([only], { decisions: repeatedDecisions });
  assert.equal(repeated.counts.useful, 1); assert.equal(repeated.counts.duplicates, 12); assert.equal(repeated.shouldPause, true);
});

test('incomplete, unobserved and unsupported records are explicit and cannot become clean passes', () => {
  const incomplete = observation('partial', { outcome: 'incomplete' });
  const error = observation('error', { errorCode: 'RESPONSE_ABORTED' });
  const truncated = observation('truncated', { transport: { complete: false } });
  const unknown = observation('unknown', { response: { status: 200, value: { text: 'A confident assertion with no structured facts' } } });
  const missing = observation('missing', { transport: {} });
  const state = progress([incomplete, error, truncated, unknown, missing], { decisions: [{ id: 'D1', status: 'blocked', observationId: 'not-retained' }], cases: [{ id: 'C1', failureStage: 'verification' }, { id: 'C2', failureStage: 'stopping' }], requests: [{ id: 'Q1' }, { id: 'Q2', resolution: 'answered' }] });
  assert.equal(state.counts.useful, 0); assert.equal(state.counts.incomplete, 3); assert.equal(state.counts.unknown, 3);
  assert.equal(state.failures.verification, 1); assert.equal(state.failures.stopping, 1); assert.equal(state.counts.pendingRequests, 1);
  assert.match(state.limitations.join(' '), /not verified truth/);
});

test('effort accounting separates reviewer person-minutes and leaves unreported labor/cost unknown', () => {
  const absent = progress([]); assert.equal(absent.effort.totalPersonMinutes, null); assert.equal(absent.effort.reviewerPersonMinutes, null);
  const effort = [{ id: 'E1', person: 'investigator', stage: 'exploration', minutes: 20 }, { id: 'E2', person: 'reviewer', stage: 'review', minutes: 7 }, { id: 'E3', person: 'editor', stage: 'reporting', minutes: 4 }];
  const state = progress([], { effort }); assert.equal(state.effort.totalPersonMinutes, 31); assert.equal(state.effort.reviewerPersonMinutes, 7); assert.equal(state.effort.byStage.reporting, 4); assert.match(state.effort.accounting, /cost unknown/);
  assert.throws(() => progress([], { effort: [effort[0], effort[0]] }), /Duplicate effort/);
  assert.throws(() => progress([], { effort: [{ ...effort[0], minutes: -1 }] }), /effort record/);
});

test('a valid declared matched manual comparison yields conditional arithmetic, never self-certified superiority', () => {
  const result = comparison(); assert.equal(result.status, 'pass'); assert.equal(result.comparable, true); assert.equal(result.improvement, 2);
  assert.equal(result.superiorityEstablished, false); assert.equal(result.admission, 'externally-asserted-unverified');
  assert.deepEqual(result.candidateCounts, counts()); assert.match(result.limitations.join(' '), /Blind\/held-out integrity/);
  for (const value of [5, 4]) { const fail = comparison(run('manual'), run('candidate', value)); assert.equal(fail.status, 'fail'); assert.match(fail.reasons.join(' '), /No improvement/); }
  const tooSmall = comparison(run('manual'), run('candidate', 5.5)); assert.equal(tooSmall.status, 'fail'); assert.match(tooSmall.reasons.join(' '), /below the frozen minimum/);
  const p = protocol(); p.metric.direction = 'lower'; assert.equal(comparison(run('manual', 10), run('candidate', 8), p).status, 'pass');
});

test('missing baseline/admission/metrics remain descriptive, and mismatched contracts prohibit comparisons', () => {
  assert.equal(comparison(null).status, 'descriptive');
  const p = protocol(); p.admission = { status: 'pending', reference: null }; assert.equal(comparison(undefined, undefined, p).status, 'descriptive');
  const unscored = run('candidate'); unscored.metric = null; assert.equal(comparison(run('manual'), unscored).status, 'descriptive');
  for (const field of ['scope', 'access', 'budget', 'assistance', 'familiarity', 'eligibilityVersion', 'targetVersion', 'scorerVersion']) {
    const candidate = run('candidate', 7); candidate.contract[field] = field === 'familiarity' ? 'blind' : 'other';
    const result = comparison(run('manual'), candidate); assert.equal(result.status, 'not-comparable', field); assert.equal(result.improvement, null); assert.equal(result.superiorityEstablished, false);
  }
  const owner = protocol(); owner.baselineOwner = { id: null, qualification: 'unverified', reference: null }; assert.equal(comparison(undefined, undefined, owner).status, 'not-comparable');
  const modelBaseline = run('candidate'); assert.equal(comparison(modelBaseline).status, 'not-comparable');
  const empty = run('candidate'); for (const field of Object.keys(empty.counts)) empty.counts[field] = 0; assert.notEqual(comparison(run('manual'), empty).status, 'pass');
  const invalid = run('candidate'); invalid.counts.unscored = 0; assert.throws(() => comparison(run('manual'), invalid), /population accounting/);
  const frozen = protocol(); frozen.frozen = false; assert.equal(comparison(undefined, undefined, frozen).status, 'descriptive');
});

test('equal comparisons in either direction return ordinary zero and lossless journal-safe JSON', () => {
  function assertFiniteJson(value) {
    if (typeof value === 'number') { assert.ok(Number.isFinite(value)); assert.equal(Object.is(value, -0), false); }
    else if (value && typeof value === 'object') for (const item of Object.values(value)) assertFiniteJson(item);
  }
  for (const direction of ['higher', 'lower']) for (const value of [0, 5, -5, Number.MAX_VALUE]) {
    const p = protocol(); p.metric.direction = direction;
    const result = comparison(run('manual', value), run('candidate', value), p);
    assert.equal(result.status, 'fail'); assert.equal(result.delta, 0); assert.equal(result.improvement, 0);
    assert.equal(Object.is(result.delta, -0), false); assert.equal(Object.is(result.improvement, -0), false);
    assert.match(result.reasons.join(' '), /No improvement/);
    assertFiniteJson(result);
    assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
  }
});

test('finite metric extremes that overflow comparison arithmetic reject without mutating input', () => {
  for (const direction of ['higher', 'lower']) for (const sign of [-1, 1]) {
    const p = protocol(); p.metric.direction = direction;
    const input = { baseline: run('manual', sign * Number.MAX_VALUE), candidate: run('candidate', -sign * Number.MAX_VALUE), protocol: p };
    const before = structuredClone(input);
    assert.throws(() => compareRuns(input), { message: 'Comparison arithmetic exceeds finite numeric range' });
    assert.deepEqual(input, before);
  }
});

test('rejection sampling is deterministic without replacement with preserved denominator and no inferred FNR', () => {
  const rejections = Array.from({ length: 30 }, (_, i) => ({ id: `R${i}`, reason: 'insufficient evidence', label: null }));
  const a = sampleRejected({ rejections, seed: 'frozen-seed', count: 7 });
  const b = sampleRejected({ rejections: [...rejections].reverse(), seed: 'frozen-seed', count: 7 });
  assert.deepEqual(a, b); assert.equal(a.denominator, 30); assert.equal(a.sampled, 7); assert.equal(new Set(a.sample.map(r => r.id)).size, 7);
  assert.equal(Object.hasOwn(a, 'falseNegativeRate'), false); assert.match(a.limitations.join(' '), /not a false-negative-rate estimate/);
  assert.notDeepEqual(a.sample, sampleRejected({ rejections, seed: 'another-seed', count: 7 }).sample);
  assert.equal(sampleRejected({ rejections, seed: 'all', count: 40 }).sampled, 30);
  assert.equal(sampleRejected({ rejections: [], seed: 'empty', count: 1 }).denominator, 0);
  a.sample[0].reason = 'changed'; assert.ok(!rejections.some(r => r.reason === 'changed'));
  assert.throws(() => sampleRejected({ rejections: [rejections[0], rejections[0]], seed: 'dup', count: 1 }), /Duplicate rejection/);
});

test('iteration records require a failure class, distinct versions and predeclared regression/rollback/held-out plans', () => {
  const record = { id: 'iteration-v1', failureStage: 'review', previousVersion: 'v1', candidateVersion: 'v2', change: 'Clarify evidence requirements', predictedBenefit: 'Fewer unsupported review promotions', protocolId: 'protocol-v1', regressionLimits: ['Do not increase misses'], rollbackCriterion: 'Reject on added unsupported claims', heldOutPlan: 'Separate unseen families after protected preparation' };
  assert.equal(validateIteration(record).execution, 'inert-proposal-only');
  assert.throws(() => validateIteration({ ...record, previousVersion: 'v2' }), /distinct versions/);
  assert.throws(() => validateIteration({ ...record, regressionLimits: [] }), /Regression limits/);
  assert.throws(() => validateIteration({ ...record, failureStage: 'guessed' }), /failure stage/);
  assert.throws(() => validateIteration({ ...record, command: 'executable scorer' }), /unknown/);
});

test('schemas reject getters, sparse/cyclic/non-finite structures and invalid policy without input mutation', () => {
  const original = { observations: [observation('O1')], decisions: [], effort: [] }, saved = JSON.stringify(original);
  const result = progressSummary(original); result.ledger[0].classification = 'tampered'; assert.equal(JSON.stringify(original), saved);
  let getter = false; const bad = { get observations() { getter = true; return []; }, decisions: [] };
  assert.throws(() => progressSummary(bad), /data properties/); assert.equal(getter, false);
  assert.throws(() => progress([, observation('O1')]), /dense/);
  const cycle = []; cycle.push(cycle); assert.throws(() => progress(cycle), /plain finite/);
  assert.throws(() => progress([], { policy: { windowSize: 0 } }), /windowSize/);
  assert.throws(() => progress([], { policy: { minUseful: 20 } }), /minUseful/);
  assert.throws(() => progress([], { frontierAvailable: true, policy: { frontierAvailable: false } }), /Conflicting/);
  assert.throws(() => progress([], { policy: { run: 'arbitrary code' } }), /unknown/);
  assert.throws(() => progress([observation('O1'), observation('O1')]), /Duplicate observation/);
  const c = run('candidate'); c.metric.value = Infinity; assert.throws(() => comparison(run('manual'), c), /plain finite/);
  const args = { baseline: run('manual'), candidate: run('candidate'), protocol: protocol() }, before = JSON.stringify(args); compareRuns(args); assert.equal(JSON.stringify(args), before);
});
