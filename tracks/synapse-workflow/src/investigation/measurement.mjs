import { createHash } from 'node:crypto';

// Pure descriptive audit of supplied records. No scorer execution, permissions,
// trusted provenance, effect confirmation or external admission is supplied here.
const STAGES = ['preparation', 'exploration', 'hypothesis', 'investigation', 'verification', 'filtering', 'review', 'reporting', 'stopping', 'infrastructure', 'teaching', 'retest'];
const copy = value => JSON.parse(JSON.stringify(value));
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
const hash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
function plain(value, depth = 0, budget = { nodes: 0, chars: 0 }, seen = new Set()) {
  if (++budget.nodes > 200000 || depth > 32) throw new Error('Measurement structure budget exceeded');
  if (typeof value === 'string') { budget.chars += value.length; if (budget.chars > 8 * 1024 * 1024) throw new Error('Measurement size budget exceeded'); return; }
  if (value === null || typeof value === 'boolean' || typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return;
  if (!value || typeof value !== 'object' || seen.has(value) || !(Array.isArray(value) ? Object.getPrototypeOf(value) === Array.prototype : [Object.prototype, null].includes(Object.getPrototypeOf(value)))) throw new Error('Measurement requires plain finite JSON');
  seen.add(value);
  const keys = Reflect.ownKeys(value);
  for (const key of keys) {
    if (Array.isArray(value) && key === 'length') continue;
    const d = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(key) || !d.enumerable || !Object.hasOwn(d, 'value') || Array.isArray(value) && (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) throw new Error('Measurement requires JSON data properties');
    budget.chars += key.length; if (budget.chars > 8 * 1024 * 1024) throw new Error('Measurement size budget exceeded');
    plain(d.value, depth + 1, budget, seen);
  }
  if (Array.isArray(value) && Object.keys(value).length !== value.length) throw new Error('Measurement requires dense arrays');
  seen.delete(value);
}
function checked(value) { plain(value); if (JSON.stringify(value).length > 8 * 1024 * 1024) throw new Error('Measurement size budget exceeded'); }
function exact(v, required, optional = []) { if (!v || typeof v !== 'object' || Array.isArray(v) || required.some(k => !Object.hasOwn(v, k)) || Object.keys(v).some(k => !required.includes(k) && !optional.includes(k))) throw new Error('Missing or unknown measurement fields'); }
function text(v, name, max = 2000) { if (typeof v !== 'string' || !v.trim() || v.length > max) throw new Error(`Invalid ${name}`); }
function integer(v, min, max, name) { if (!Number.isSafeInteger(v) || v < min || v > max) throw new Error(`Invalid ${name}`); }
function derivedNumber(value) {
  if (!Number.isFinite(value)) throw new Error('Comparison arithmetic exceeds finite numeric range');
  return value === 0 ? 0 : value;
}
function list(v, max, name) { if (!Array.isArray(v) || v.length > max) throw new Error(`Invalid ${name}`); }
const object = v => v && typeof v === 'object' && !Array.isArray(v);
const short = v => typeof v === 'string' && v.trim() && v.length <= 256;
function uniqueIds(records, name, optional = false) {
  const seen = new Set();
  for (const record of records) { if (!object(record)) throw new Error(`Invalid ${name}`); if (optional && record.id === undefined) continue; text(record.id, `${name} id`, 200); if (seen.has(record.id)) throw new Error(`Duplicate ${name} id`); seen.add(record.id); }
}
function effortSummary(records) {
  list(records, 1000, 'effort'); uniqueIds(records, 'effort');
  const byStage = {}; let total = 0, review = null;
  for (const record of records) {
    exact(record, ['id', 'person', 'stage', 'minutes']); text(record.person, 'effort person', 200);
    if (!STAGES.includes(record.stage) || !Number.isFinite(record.minutes) || record.minutes < 0 || record.minutes > 1000000) throw new Error('Invalid effort record');
    byStage[record.stage] = (byStage[record.stage] || 0) + record.minutes; total += record.minutes;
    if (record.stage === 'review') review = (review || 0) + record.minutes;
  }
  return { totalPersonMinutes: records.length ? total : null, reviewerPersonMinutes: review, byStage, coverage: 'reported-records-only', accounting: 'Declared person-minutes; unreported labor and monetary cost unknown.' };
}
function structuredFact(o) {
  const a = o.action, identity = o.identity, r = o.response;
  if (!object(a) || !['page', 'profile', 'orders', 'order', 'transition'].includes(a.kind) || !short(a.actor) || !object(identity) || !short(identity.principal) || !(identity.tenant === null || short(identity.tenant)) || !short(identity.role) || !object(r) || !Number.isInteger(r.status) || r.status < 100 || r.status > 599) return null;
  if (a.actor !== identity.principal) return null;
  const action = { kind: a.kind, actor: a.actor };
  if (['order', 'transition'].includes(a.kind)) { if (!short(a.objectId)) return null; action.objectId = a.objectId; }
  if (a.kind === 'transition') { if (!['submit', 'approve'].includes(a.transition)) return null; action.transition = a.transition; }
  const result = { status: r.status }, value = r.value;
  const record = v => {
    if (!object(v) || !short(v.id) || !short(v.tenant) || !short(v.owner) || !short(v.state)) return null;
    const fact = { id: v.id, tenant: v.tenant, owner: v.owner, state: v.state };
    if (Number.isFinite(v.budget)) fact.budget = v.budget;
    return fact;
  };
  if (a.kind === 'page') result.surface = 'page';
  else if (!object(value)) return null;
  else {
    result.contentShape = { profile: Object.hasOwn(value, 'profile'), orders: Object.hasOwn(value, 'orders'), order: Object.hasOwn(value, 'order') };
    if (value.profile !== undefined) {
      const p = value.profile;
      if (!object(p) || !short(p.id) || !short(p.tenant) || !short(p.role) || p.id !== identity.principal || p.tenant !== identity.tenant || p.role !== identity.role) return null;
      result.profile = { id: p.id, tenant: p.tenant, role: p.role };
    }
    if (value.orders !== undefined) {
      if (!Array.isArray(value.orders) || value.orders.length > 100) return null;
      const orders = value.orders.map(record); if (orders.some(v => !v) || new Set(orders.map(v => v.id)).size !== orders.length) return null;
      result.orders = orders.sort((x, y) => x.id < y.id ? -1 : x.id > y.id ? 1 : 0);
    }
    if (value.order !== undefined) { result.order = record(value.order); if (!result.order) return null; }
    if (r.status === 200 && !result.profile && !result.orders && !result.order) return null;
  }
  return { action, identity: { principal: identity.principal, tenant: identity.tenant, role: identity.role }, result };
}

export function progressSummary(input) {
  checked(input); exact(input, ['observations', 'decisions'], ['cases', 'requests', 'effort', 'policy', 'frontierAvailable']);
  const { observations, decisions, cases = [], requests = [], effort = [], policy = {} } = input;
  list(observations, 1000, 'observations'); list(decisions, 2000, 'decisions'); list(cases, 1000, 'cases'); list(requests, 1000, 'requests');
  uniqueIds(observations, 'observation', true); uniqueIds(decisions, 'decision', true); uniqueIds(cases, 'case', true); uniqueIds(requests, 'request', true);
  exact(policy, [], ['windowSize', 'windows', 'minUseful', 'frontierAvailable']);
  const windowSize = policy.windowSize ?? 6, windows = policy.windows ?? 2, minUseful = policy.minUseful ?? 1;
  integer(windowSize, 1, 100, 'windowSize'); integer(windows, 1, 10, 'windows'); integer(minUseful, 1, windowSize, 'minUseful');
  if (input.frontierAvailable !== undefined && typeof input.frontierAvailable !== 'boolean' || policy.frontierAvailable !== undefined && typeof policy.frontierAvailable !== 'boolean') throw new Error('Invalid frontier availability');
  if (input.frontierAvailable !== undefined && policy.frontierAvailable !== undefined && input.frontierAvailable !== policy.frontierAvailable) throw new Error('Conflicting frontier availability');
  const frontierAvailable = input.frontierAvailable ?? policy.frontierAvailable ?? false;
  const seen = new Set(), ledger = [], linkedDecisions = new Set(), byId = new Map(observations.filter(o => o.id).map(o => [o.id, o]));
  function add(o, d = null) {
    let classification = 'unknown', factHash = null;
    if (o?.outcome === 'incomplete' || o?.transport?.complete === false || o?.errorCode) classification = 'incomplete';
    else if (o?.outcome === 'complete' && o.transport?.complete === true) {
      const fact = structuredFact(o);
      if (fact) { factHash = hash(fact); classification = seen.has(factHash) ? 'duplicate' : 'useful'; seen.add(factHash); }
    }
    ledger.push({ index: ledger.length, observationId: o?.id || null, decisionId: d?.id || null, classification, factHash, newFacts: classification === 'useful' ? 1 : 0 });
  }
  // Observation order is authoritative for knowledge chronology. Referencing the
  // same observation from several decisions never creates fresh useful facts.
  for (const o of observations) { const d = decisions.find(d => d.observationId === o.id && o.id); add(o, d); if (d) linkedDecisions.add(d); }
  for (const d of decisions) if (!linkedDecisions.has(d)) add(byId.get(d.observationId) || null, d);
  const counts = { observations: observations.length, decisions: decisions.length, useful: 0, duplicates: 0, incomplete: 0, unknown: 0, pendingRequests: requests.filter(r => !r.resolution && r.status !== 'resolved').length };
  for (const item of ledger) counts[item.classification === 'duplicate' ? 'duplicates' : item.classification]++;
  const length = windowSize * windows, recent = ledger.slice(-length), rollingWindows = [];
  for (let i = 0; i < windows; i++) rollingWindows.push(recent.slice(i * windowSize, (i + 1) * windowSize).filter(v => v.classification === 'useful').length);
  const enough = recent.length === length, diminishing = enough && rollingWindows.every(n => n < minUseful), shouldPause = !frontierAvailable && diminishing;
  const reason = frontierAvailable ? 'Useful permitted rules-frontier branches remain; investigate them before a diminishing-return pause.' : !enough ? 'Insufficient bounded history for the configured diminishing-return signal.' : shouldPause ? 'Configured consecutive windows produced too few new structured facts; recommend owner pause and review pending work.' : 'Recent observations still add structured facts under this descriptive policy.';
  const failures = Object.fromEntries(STAGES.map(stage => [stage, 0]));
  for (const item of cases) if (item.failureStage !== undefined) { if (!STAGES.includes(item.failureStage)) throw new Error('Unknown failure stage'); failures[item.failureStage]++; }
  return { schemaVersion: 1, kind: 'nbret-progress-summary', counts, ledger, rolling: { windowSize, windows, minUseful, observed: recent.length, useful: recent.filter(v => v.classification === 'useful').length, windowsUseful: rollingWindows },
    shouldPause, recommendation: { pause: shouldPause, reason, permissionChange: false }, effort: effortSummary(effort), failures,
    limitations: ['Novelty is based on selected supplied structured facts, not verified truth, coverage or security effectiveness.', 'Text paraphrases, observation IDs, timestamps, hashes of raw prose and reported confidence do not earn progress.', 'Thresholds are configurable engineering heuristics, not research-validated stopping optima.', 'Unknown/incomplete evidence and unsupported branches remain explicit; no vulnerability is required for completion.'] };
}

function contract(v) {
  exact(v, ['scope', 'access', 'budget', 'assistance', 'familiarity', 'eligibilityVersion', 'targetVersion', 'scorerVersion']);
  for (const key of Object.keys(v)) text(v[key], `contract ${key}`, 256);
  if (!['blind', 'guided', 'familiar'].includes(v.familiarity)) throw new Error('Invalid familiarity');
}
function run(v) {
  exact(v, ['id', 'kind', 'operatorId', 'version', 'contract', 'counts', 'metric']);
  for (const key of ['id', 'operatorId', 'version']) text(v[key], key, 200);
  if (!['manual', 'candidate'].includes(v.kind)) throw new Error('Invalid run kind'); contract(v.contract);
  exact(v.counts, ['eligible', 'demonstrated', 'notDemonstrated', 'inconclusive', 'unsupported', 'unscored']);
  for (const key of Object.keys(v.counts)) integer(v.counts[key], 0, 1000000, `count ${key}`);
  if (Object.entries(v.counts).filter(([k]) => k !== 'eligible').reduce((n, [, value]) => n + value, 0) !== v.counts.eligible) throw new Error('Run population accounting mismatch');
  if (v.metric !== null) { exact(v.metric, ['name', 'unit', 'value']); text(v.metric.name, 'metric name', 200); text(v.metric.unit, 'metric unit', 100); if (!Number.isFinite(v.metric.value)) throw new Error('Invalid metric value'); }
}

export function compareRuns(input) {
  checked(input); exact(input, ['baseline', 'candidate', 'protocol']); const { baseline, candidate, protocol: p } = input;
  run(candidate); if (baseline !== null) run(baseline);
  exact(p, ['id', 'frozen', 'contract', 'baselineVersion', 'candidateVersion', 'metric', 'admission', 'baselineOwner']);
  text(p.id, 'protocol id', 200); if (typeof p.frozen !== 'boolean') throw new Error('Invalid freeze declaration'); contract(p.contract);
  for (const key of ['baselineVersion', 'candidateVersion']) text(p[key], key, 200);
  exact(p.metric, ['name', 'unit', 'direction', 'minImprovement']); text(p.metric.name, 'metric name', 200); text(p.metric.unit, 'unit', 100);
  if (!['higher', 'lower'].includes(p.metric.direction) || !Number.isFinite(p.metric.minImprovement) || p.metric.minImprovement < 0) throw new Error('Invalid metric policy');
  exact(p.admission, ['status', 'reference']); if (!['pending', 'externally-asserted'].includes(p.admission.status)) throw new Error('Invalid admission status');
  if (p.admission.reference !== null) text(p.admission.reference, 'admission reference');
  exact(p.baselineOwner, ['id', 'qualification', 'reference']); if (!['expert', 'unverified'].includes(p.baselineOwner.qualification)) throw new Error('Invalid baseline qualification');
  for (const key of ['id', 'reference']) if (p.baselineOwner[key] !== null) text(p.baselineOwner[key], `baseline ${key}`);
  const reasons = [], mismatches = [];
  if (!baseline) reasons.push('No manual baseline supplied.');
  if (!p.frozen) reasons.push('Protocol was not declared frozen before results.');
  if (p.admission.status !== 'externally-asserted' || !p.admission.reference) reasons.push('Scorer/evaluation external admission remains pending.');
  if (!baseline?.metric || !candidate.metric) reasons.push('Comparable numeric metric not supplied for both arms.');
  if (!candidate.counts.eligible || baseline && !baseline.counts.eligible) reasons.push('No eligible evaluation population supplied.');
  if (baseline && (baseline.kind !== 'manual' || candidate.kind !== 'candidate' || p.baselineOwner.id !== baseline.operatorId || p.baselineOwner.qualification !== 'expert' || !p.baselineOwner.reference)) mismatches.push('A named declared expert manual baseline owner is required.');
  if (baseline && baseline.counts.eligible !== candidate.counts.eligible) mismatches.push('Eligible populations differ.');
  for (const [arm, value, version] of [['baseline', baseline, p.baselineVersion], ['candidate', candidate, p.candidateVersion]]) if (value) {
    if (hash(value.contract) !== hash(p.contract)) mismatches.push(`${arm} scope/access/budget/assistance/familiarity/population or target/scorer version differs.`);
    if (value.version !== version) mismatches.push(`${arm} implementation version differs from frozen protocol.`);
    if (value.metric && (value.metric.name !== p.metric.name || value.metric.unit !== p.metric.unit)) mismatches.push(`${arm} metric definition differs.`);
  }
  const comparable = reasons.length === 0 && mismatches.length === 0;
  const delta = comparable ? derivedNumber(candidate.metric.value - baseline.metric.value) : null;
  const improvement = comparable ? derivedNumber(p.metric.direction === 'higher' ? delta : -delta) : null;
  return { schemaVersion: 1, kind: 'nbret-run-comparison', status: mismatches.length ? 'not-comparable' : !comparable ? 'descriptive' : improvement > 0 && improvement >= p.metric.minImprovement ? 'pass' : 'fail', comparable,
    delta, improvement, baselineCounts: baseline ? copy(baseline.counts) : null, candidateCounts: copy(candidate.counts), reasons: [...reasons, ...mismatches, ...(comparable && improvement <= 0 ? ['No improvement over the supplied manual baseline.'] : []), ...(comparable && improvement > 0 && improvement < p.metric.minImprovement ? ['Improvement below the frozen minimum.'] : [])],
    superiorityEstablished: false, admission: p.admission.status === 'externally-asserted' ? 'externally-asserted-unverified' : 'pending',
    limitations: ['Pass/fail is conditional arithmetic on externally asserted admission and supplied measurements, not authenticated effectiveness.', 'Blind/held-out integrity, scorer validity, expert competence and independence are not established by metadata.', 'Unsuccessful, unsupported, inconclusive and unscored cases remain in the population; no pricing or customer-demand claim.'] };
}

export function sampleRejected(input) {
  checked(input); exact(input, ['rejections', 'seed', 'count']); list(input.rejections, 10000, 'rejections'); uniqueIds(input.rejections, 'rejection');
  text(input.seed, 'sample seed', 256); integer(input.count, 0, 10000, 'sample count');
  const sample = input.rejections.map(record => ({ record, rank: hash([input.seed, record.id]) })).sort((a, b) => a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : a.record.id < b.record.id ? -1 : 1).slice(0, input.count).map(v => copy(v.record));
  return { schemaVersion: 1, kind: 'nbret-rejection-sample', seed: input.seed, denominator: input.rejections.length, sampled: sample.length, sample, method: 'SHA-256 seeded ID ranking without replacement; freeze population and seed before audit.',
    limitations: ['This is a reproducible sample, not a false-negative-rate estimate.', 'Unlabeled and inconclusive rejected candidates require independent adjudication; discovery recall remains unknown.'] };
}

export function validateIteration(input) {
  checked(input); exact(input, ['id', 'failureStage', 'previousVersion', 'candidateVersion', 'change', 'predictedBenefit', 'protocolId', 'regressionLimits', 'rollbackCriterion', 'heldOutPlan']);
  if (!STAGES.includes(input.failureStage)) throw new Error('Unknown failure stage');
  for (const key of ['id', 'previousVersion', 'candidateVersion', 'change', 'predictedBenefit', 'protocolId', 'rollbackCriterion', 'heldOutPlan']) text(input[key], key);
  list(input.regressionLimits, 20, 'regression limits'); if (!input.regressionLimits.length) throw new Error('Regression limits required'); for (const limit of input.regressionLimits) text(limit, 'regression limit');
  if (input.previousVersion === input.candidateVersion) throw new Error('Iteration needs distinct versions');
  return { ...copy(input), execution: 'inert-proposal-only', admission: 'not-established' };
}
