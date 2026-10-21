/** Offline declared-record lifecycle. No execution, authenticated identity or effect oracle. */
const MAX_EVENTS = 10000;
// Bounds the serialized input retained by the pure lifecycle, independently of
// the journal's byte limit. UTF-16 code units, not an OS memory guarantee.
const MAX_HISTORY_CHARS = 16 * 1024 * 1024;
const LIMITATIONS = [
  'Target and authorization text are inert metadata, never an execution grant.',
  'Identities, evidence origin, review and human verification are operator-supplied declarations.',
  'Review-supported leads are not independently verified effects; hashes do not authenticate origin.',
  'Shared-account sessions do not enforce reviewer isolation or hidden-answer confidentiality.',
];

function plain(value, depth = 0, seen = new Set(), budget = { nodes: 0, chars: 0 }) {
  if (++budget.nodes > 10000) throw new Error('JSON structure limit exceeded');
  if (depth > 16) throw new Error('JSON nesting limit exceeded');
  if (typeof value === 'string') {
    budget.chars += value.length;
    if (budget.chars > 65536) throw new Error('JSON size limit exceeded');
    return;
  }
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)) return;
  if (typeof value !== 'object' || seen.has(value)) throw new Error('Bounded plain JSON required');
  const proto = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && proto !== Object.prototype && proto !== null) throw new Error('Plain JSON object required');
  seen.add(value);
  const keys = Reflect.ownKeys(value);
  if (keys.length > 10001) throw new Error('JSON collection limit exceeded');
  for (const key of keys) {
    if (Array.isArray(value) && key === 'length') continue;
    if (typeof key !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Unsafe JSON key');
    if (Array.isArray(value) && (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) throw new Error('Invalid JSON array');
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor.enumerable || !('value' in descriptor)) throw new Error('Plain JSON data properties required');
    budget.chars += key.length;
    if (budget.chars > 65536) throw new Error('JSON size limit exceeded');
    plain(descriptor.value, depth + 1, seen, budget);
  }
  if (Array.isArray(value) && Object.keys(value).length !== value.length) throw new Error('Sparse JSON array');
  seen.delete(value);
}
function bounded(value, max = 65536) {
  plain(value);
  const length = JSON.stringify(value).length;
  if (length > max) throw new Error('JSON size limit exceeded');
  return length;
}
function object(value, required, optional = []) {
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('Object required');
  if (required.some(k => !Object.hasOwn(value, k)) || Object.keys(value).some(k => !required.includes(k) && !optional.includes(k))) throw new Error('Missing or unknown fields');
}
function text(value, name, max = 4000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error(`Invalid ${name}`);
}
function id(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)) throw new Error('Invalid id');
}
function strings(value, name) {
  if (!Array.isArray(value) || value.length > 100) throw new Error(`Invalid ${name}`);
  value.forEach(v => text(v, name));
}
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error('Invalid ISO timestamp');
}
const copy = value => JSON.parse(JSON.stringify(value));
const choose = (value, values, name) => { if (!values.includes(value)) throw new Error(`Invalid ${name}`); };

export function initialState(manifest) {
  bounded(manifest);
  object(manifest, ['schemaVersion', 'kind', 'id', 'target', 'mode', 'createdAt', 'limitations']);
  if (manifest.schemaVersion !== 1 || manifest.kind !== 'nbret-investigation') throw new Error('Invalid manifest schema');
  id(manifest.id); text(manifest.target, 'target', 2048);
  const url = new URL(manifest.target);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || /[?#]/.test(manifest.target) || manifest.target !== manifest.target.trim() || /[\r\n\t]/.test(manifest.target)) throw new Error('Inert HTTP(S) target without credentials, query or fragment required');
  choose(manifest.mode, ['practice', 'blind', 'guided'], 'mode'); timestamp(manifest.createdAt); strings(manifest.limitations, 'limitations');
  return { manifest: copy(manifest), events: [], leads: [], evidence: [], requests: [], progress: [], stopped: null };
}

// Only replay may mutate its fresh, unexposed local state. Both paths use the
// same validation and copy every retained event/payload to avoid input aliases.
function reduceEvent(state, event, immutable, history) {
  const eventChars = bounded(event);
  object(event, ['id', 'at', 'actor', 'type', 'payload']);
  id(event.id); timestamp(event.at);
  object(event.actor, ['id', 'role']); id(event.actor.id);
  choose(event.actor.role, ['operator', 'investigator', 'reviewer'], 'actor role');
  if (!Array.isArray(state.events) || state.events.length >= MAX_EVENTS) throw new Error('Event limit exceeded');
  if (history ? history.ids.has(event.id) : state.events.some(e => e.id === event.id)) throw new Error('Duplicate event id');
  const historyChars = history ? history.chars : JSON.stringify(state.manifest).length + state.events.reduce((total, e) => total + JSON.stringify(e).length, 0);
  if (historyChars + eventChars > MAX_HISTORY_CHARS) throw new Error('History size limit exceeded');
  const s = immutable ? copy(state) : state, p = event.payload;
  const requireRole = roles => { if (!roles.includes(event.actor.role)) throw new Error('Actor role not permitted'); };
  const lead = leadId => { id(leadId); const found = s.leads.find(l => l.id === leadId); if (!found) throw new Error('Unknown lead reference'); return found; };
  const newId = records => { id(p.id); if (records.some(r => r.id === p.id)) throw new Error('Duplicate record id'); };
  const record = () => ({ ...copy(p), eventId: event.id, at: event.at, actor: copy(event.actor) });
  if (s.stopped && ['lead.recorded', 'evidence.recorded', 'request.recorded', 'run.stopped'].includes(event.type)) throw new Error('Investigation stopped; no active advancement or restart supported');
  switch (event.type) {
    case 'lead.recorded': {
      requireRole(['operator', 'investigator']);
      object(p, ['id', 'title', 'question', 'environment', 'identity', 'observed', 'possibleConsequences', 'limitations']); newId(s.leads);
      for (const key of ['title', 'question', 'observed']) text(p[key], key);
      for (const key of ['environment', 'identity']) text(p[key], key, 256);
      strings(p.possibleConsequences, 'possibleConsequences'); strings(p.limitations, 'limitations');
      s.leads.push({ ...record(), authorId: event.actor.id, reviews: [], verifications: [] }); break;
    }
    case 'evidence.recorded': {
      object(p, ['id', 'leadId', 'artifactDigest', 'producerId', 'environment', 'identity', 'completeness', 'source', 'description']); newId(s.evidence);
      const l = lead(p.leadId); id(p.producerId);
      if (typeof p.artifactDigest !== 'string' || !/^[a-f0-9]{64}$/.test(p.artifactDigest)) throw new Error('SHA-256 artifact digest required');
      for (const key of ['environment', 'identity']) text(p[key], key, 256);
      if (p.environment !== l.environment || p.identity !== l.identity) throw new Error('Evidence identity/environment mismatch');
      choose(p.completeness, ['complete', 'incomplete'], 'completeness');
      if (p.source !== 'operator-supplied') throw new Error('Declared evidence source required');
      text(p.description, 'description'); s.evidence.push(record()); break;
    }
    case 'review.recorded': {
      requireRole(['reviewer']);
      object(p, ['leadId', 'decision', 'rationale', 'evidenceIds', 'objections']); const l = lead(p.leadId);
      if (l.authorId === event.actor.id) throw new Error('Self-review is not permitted');
      choose(p.decision, ['supported', 'rejected', 'needs-action'], 'review decision'); text(p.rationale, 'rationale'); strings(p.objections, 'objections');
      if (!Array.isArray(p.evidenceIds) || p.evidenceIds.length > 100 || new Set(p.evidenceIds).size !== p.evidenceIds.length) throw new Error('Unique evidence references required');
      const cited = p.evidenceIds.map(value => { id(value); const e = s.evidence.find(e => e.id === value); if (!e || e.leadId !== l.id) throw new Error('Unknown or foreign evidence reference'); return e; });
      if (p.decision === 'supported' && (!cited.length || cited.some(e => e.completeness !== 'complete' || e.identity !== l.identity || e.environment !== l.environment) || !cited.some(e => e.producerId !== l.authorId))) throw new Error('Supported review requires complete matched evidence and a distinct declared producer');
      l.reviews.push(record()); break;
    }
    case 'verification.recorded': {
      requireRole(['operator']);
      object(p, ['leadId', 'result', 'instructions', 'expected', 'observed', 'limitations']); const l = lead(p.leadId);
      choose(p.result, ['reproduced', 'not-reproduced', 'inconclusive'], 'verification result');
      for (const key of ['instructions', 'expected', 'observed']) text(p[key], key);
      strings(p.limitations, 'limitations'); l.verifications.push(record()); break;
    }
    case 'request.recorded':
      object(p, ['id', 'question', 'reason'], ['leadId']); newId(s.requests);
      if (Object.hasOwn(p, 'leadId')) lead(p.leadId);
      text(p.question, 'question'); text(p.reason, 'reason');
      s.requests.push({ ...record(), resolution: null }); break;
    case 'request.resolved': {
      requireRole(['operator']); object(p, ['id', 'resolution']); id(p.id); text(p.resolution, 'resolution');
      const request = s.requests.find(r => r.id === p.id);
      if (!request || request.resolution) throw new Error('Unknown or already resolved request');
      request.resolution = record(); break;
    }
    case 'progress.recorded':
      object(p, ['note', 'minutes']); text(p.note, 'note');
      if (!Number.isFinite(p.minutes) || p.minutes < 0 || p.minutes > 100000) throw new Error('Invalid progress minutes');
      s.progress.push(record()); break;
    case 'run.stopped':
      requireRole(['operator']); object(p, ['reason']); text(p.reason, 'stop reason'); s.stopped = record(); break;
    default: throw new Error('Unknown event type');
  }
  s.events.push(copy(event));
  if (history) { history.ids.add(event.id); history.chars += eventChars; }
  return s;
}

export function applyEvent(state, event) {
  return reduceEvent(state, event, true);
}

export function replay(manifest, events) {
  if (!Array.isArray(events) || events.length > MAX_EVENTS) throw new Error('Bounded events required');
  const keys = Reflect.ownKeys(events);
  if (keys.length !== events.length + 1 || keys.some(k => k !== 'length' && (typeof k !== 'string' || !/^(0|[1-9][0-9]*)$/.test(k) || Number(k) >= events.length))) throw new Error('Dense plain event array required');
  // Inspect descriptors before reading elements: neither holes nor accessors
  // may disappear or execute as a side effect of reconstructing history.
  for (let i = 0; i < events.length; i++) {
    const descriptor = Object.getOwnPropertyDescriptor(events, String(i));
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) throw new Error('Dense plain event array required');
  }
  const state = initialState(manifest), history = { ids: new Set(), chars: JSON.stringify(manifest).length };
  for (let i = 0; i < events.length; i++) reduceEvent(state, events[i], false, history);
  return state;
}

export function summarize(state) {
  const categories = { reviewSupported: [], needsAction: [], unconfirmed: [], rejected: [] };
  const records = { reviewSupported: [], needsAction: [], unconfirmed: [], rejected: [] };
  for (const l of state.leads) {
    const review = l.reviews.at(-1), verification = l.verifications.at(-1);
    const category = review?.decision === 'rejected' ? 'rejected'
      : verification && verification.result !== 'reproduced' ? 'needsAction'
        : review?.decision === 'needs-action' ? 'needsAction'
          : review?.decision === 'supported' ? 'reviewSupported' : 'unconfirmed';
    categories[category].push(l.id);
    records[category].push(l);
  }
  const pendingRequests = copy(state.requests.filter(r => !r.resolution));
  return { status: state.stopped ? 'stopped' : 'open',
    counts: { ...Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v.length])), pendingRequests: pendingRequests.length },
    ...copy(records),
    categories, pendingRequests, progress: copy(state.progress), stopped: copy(state.stopped), limitations: [...new Set([...state.manifest.limitations, ...LIMITATIONS])],
    minutes: state.progress.reduce((total, p) => total + p.minutes, 0) };
}
