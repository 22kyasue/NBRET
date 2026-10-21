import { createHash } from 'node:crypto';

// Disclosed deterministic rules for the owned practice workbench. This module
// proposes inert typed data, performs no I/O and grants no execution permission.
// Actor availability is supplied context; tenants, roles, objects and states
// must come from complete identity-matched responses. No discovery score or
// independent effect verification is implied. See first-investigation-review.
const ACTORS = ['alice', 'bob', 'carol', 'dana'];
const STATES = ['draft', 'submitted', 'approved'];
const MAX_FRONTIER = 80;
const token = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(value);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const key = a => JSON.stringify([a.kind, a.actor, a.objectId ?? null, a.transition ?? null]);
const stable = value => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 24);
const actionId = (a, context = '') => `next-${stable([key(a), context])}`;

function plain(value, depth = 0, budget = { nodes: 0 }) {
  if (++budget.nodes > 200000 || depth > 32) throw new Error('Selector JSON structure budget exceeded');
  if (value === null || ['string', 'boolean'].includes(typeof value)) return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (!value || typeof value !== 'object' || (Array.isArray(value) ? Object.getPrototypeOf(value) !== Array.prototype : ![Object.prototype, null].includes(Object.getPrototypeOf(value)))) throw new Error('Selector requires plain JSON');
  for (const k of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && k === 'length') continue;
    const d = Object.getOwnPropertyDescriptor(value, k);
    if (typeof k !== 'string' || !d.enumerable || !Object.hasOwn(d, 'value') || Array.isArray(value) && (!/^(0|[1-9][0-9]*)$/.test(k) || Number(k) >= value.length)) throw new Error('Selector requires JSON data properties');
    plain(d.value, depth + 1, budget);
  }
  if (Array.isArray(value) && Object.keys(value).length !== value.length) throw new Error('Selector requires dense JSON arrays');
}
function validateAction(a) {
  if (!object(a) || !['page', 'profile', 'orders', 'order', 'transition'].includes(a.kind) || !['anonymous', ...ACTORS].includes(a.actor)) throw new Error('Unsupported selector action');
  const objectAction = ['order', 'transition'].includes(a.kind);
  if (objectAction ? !token(a.objectId) : a.objectId !== undefined) throw new Error('Invalid selector object ID');
  if (a.kind === 'transition' ? !['submit', 'approve'].includes(a.transition) : a.transition !== undefined) throw new Error('Invalid selector transition');
  if (Object.keys(a).some(k => !['kind', 'actor', 'objectId', 'transition'].includes(k))) throw new Error('Unknown selector action field');
}

export function chooseNext(input = {}) {
  plain(input);
  if (!object(input)) throw new Error('Selector input must be an object');
  if (Buffer.byteLength(JSON.stringify(input)) > 8 * 1024 * 1024) throw new Error('Selector input byte budget exceeded');
  const { observations = [], decisions = [], requests = [], stopped = false, priority = 'coverage', enabledActors = ['anonymous', ...ACTORS], permitTransitions = true } = input;
  if (!Array.isArray(enabledActors) || new Set(enabledActors).size !== enabledActors.length || enabledActors.some(a => !['anonymous', ...ACTORS].includes(a)) || typeof permitTransitions !== 'boolean') throw new Error('Invalid narrowed selector scope');
  const actors = ACTORS.filter(a => enabledActors.includes(a));
  if (!['coverage', 'workflow'].includes(priority)) throw new Error('Unsupported selector priority');
  if (!Array.isArray(observations) || observations.length > 1000 || !Array.isArray(decisions) || decisions.length > 1000 || !Array.isArray(requests) || requests.length > 200) throw new Error('Selector history budget exceeded');
  const ids = new Set();
  for (const o of observations) {
    if (!object(o) || typeof o.id !== 'string' || !o.id || ids.has(o.id) || !['complete', 'incomplete'].includes(o.outcome)) throw new Error('Invalid selector observation');
    ids.add(o.id); validateAction(o.action);
  }
  for (const d of decisions) {
    if (!object(d) || typeof d.id !== 'string' || !['executed', 'blocked', 'rejected'].includes(d.status)) throw new Error('Invalid selector decision');
    validateAction(d.action);
  }
  if (stopped) return { proposal: null, stopReason: 'Stopped by the operator; no action or permission is resumed.', ownerRequests: [] };

  const ownerRequests = [], pending = new Set(requests.map(r => r?.id)), requested = new Set();
  function ask(topic, question, reason, evidenceIds = []) {
    const id = `owner-${stable(topic)}`;
    if (requested.has(id) || pending.has(id)) return;
    requested.add(id); ownerRequests.push({ id, question, reason, evidenceIds: [...new Set(evidenceIds)] });
  }
  const complete = o => o?.outcome === 'complete' && object(o.response) && o.response.status === 200 && object(o.response.value);
  const profiles = new Map(), lists = new Map(), objects = new Map();
  const sameIdentity = (o, p) => o?.identity?.principal === p.id && o.identity.tenant === p.tenant && o.identity.role === p.role;
  for (const actor of actors) {
    const history = observations.filter(o => o.action.kind === 'profile' && o.action.actor === actor);
    const o = history.at(-1), p = o?.response?.value?.profile;
    if (complete(o) && object(p) && p.id === actor && (p.principal === undefined || p.principal === actor) && token(p.tenant) && ['member', 'approver'].includes(p.role) && sameIdentity(o, p)) profiles.set(actor, { ...p, evidenceId: o.id });
    else if (o) ask(['profile', actor], `Clarify ${actor}'s usable session and role.`, 'The attempted profile did not establish a complete matched identity; it will not be retried automatically.', [o.id]);
  }
  for (const [actor, p] of profiles) {
    const o = observations.filter(o => o.action.kind === 'orders' && o.action.actor === actor).at(-1);
    if (!o) continue;
    if (!complete(o) || !sameIdentity(o, p) || !Array.isArray(o.response.value.orders)) {
      ask(['list', actor], `Clarify ${actor}'s list coverage.`, 'Denied, missing or incomplete list evidence is not an empty clean list.', [o.id]); continue;
    }
    const records = o.response.value.orders;
    if (records.length > 80) ask(['list-budget', actor], 'Scope the remaining list records.', 'Only the first 80 returned records are considered; remaining records are explicitly untested.', [o.id]);
    const seen = new Set(), accepted = [];
    for (const record of records.slice(0, 80)) {
      if (!object(record) || !token(record.id) || seen.has(record.id) || record.tenant !== p.tenant || !token(record.owner) || !STATES.includes(record.state)) {
        if (object(record) && seen.has(record.id) && objects.has(record.id)) objects.get(record.id).conflict = true;
        ask(['unsupported-record', actor], `Review unsupported or contradictory records for ${actor}.`, 'Object identity, tenant, owner and supported workflow state must be explicit before expansion.', [o.id]); continue;
      }
      seen.add(record.id); accepted.push(record);
      const prior = objects.get(record.id);
      if (prior && (prior.tenant !== record.tenant || prior.owner !== record.owner)) {
        prior.conflict = true;
        ask(['conflict', record.id], 'Resolve contradictory object provenance.', 'The same object ID has incompatible tenant or owner evidence; no further work is proposed for it.', [...prior.evidenceIds, o.id]);
      } else if (prior) prior.evidenceIds.push(o.id);
      else objects.set(record.id, { ...record, evidenceIds: [o.id] });
    }
    lists.set(actor, { observation: o, records: accepted });
  }
  const known = [...objects.values()].filter(o => !o.conflict).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const observationsFor = a => observations.filter(o => key(o.action) === key(a));
  function lastTransition(objectId) {
    for (let i = observations.length - 1; i >= 0; i--) if (observations[i].action.kind === 'transition' && observations[i].action.objectId === objectId) return { observation: observations[i], index: i };
    return null;
  }
  function readState(record, before = observations.length) {
    for (let i = before - 1; i >= 0; i--) {
      const o = observations[i], p = profiles.get(o.action.actor);
      if (!p || p.tenant !== record.tenant || !complete(o) || !sameIdentity(o, p)) continue;
      const value = o.action.kind === 'order' && o.action.objectId === record.id ? o.response.value.order
        : o.action.kind === 'orders' && Array.isArray(o.response.value.orders) ? o.response.value.orders.find(v => v?.id === record.id) : null;
      if (object(value) && value.id === record.id && value.tenant === record.tenant && value.owner === record.owner && STATES.includes(value.state)) return { observation: o, index: i, value };
    }
    return null;
  }
  // Reconstruct observed pre-state for transition deduplication, including
  // externally authored actions. Failed/incomplete attempts are never retried.
  const transitionAttempts = new Set(), opaqueAttempts = new Set();
  observations.forEach((o, i) => {
    if (o.action.kind !== 'transition') return;
    const record = objects.get(o.action.objectId), state = record && readState(record, i);
    if (state) transitionAttempts.add(actionId(o.action, state.value.state));
    else opaqueAttempts.add(key(o.action));
  });
  function handled(a, context = '') {
    const relevant = decisions.filter(d => key(d.action) === key(a)), seen = observationsFor(a);
    if (relevant.some(d => d.status !== 'executed')) return true;
    if (relevant.some(d => d.id === actionId(a, context))) return true;
    if (relevant.filter(d => d.status === 'executed').length > seen.length) return true;
    if (a.kind === 'transition') return opaqueAttempts.has(key(a)) || transitionAttempts.has(actionId(a, context));
    if (a.kind === 'order') {
      const transition = lastTransition(a.objectId);
      return seen.some(o => !transition || observations.indexOf(o) > transition.index);
    }
    return seen.length > 0 || relevant.length > 0;
  }
  const frontier = [], frontierIds = new Set(); let overflow = false;
  function propose(action, context, category, question, reason, evidenceIds) {
    if (!enabledActors.includes(action.actor) || action.kind === 'transition' && !permitTransitions) return;
    if (handled(action, context)) return;
    const id = actionId(action, context);
    if (frontierIds.has(id)) return;
    if (frontier.length >= MAX_FRONTIER) { overflow = true; return; }
    frontierIds.add(id); frontier.push({ id, action, question, reason, evidenceIds: [...new Set(evidenceIds)], category });
  }
  for (const action of [{ kind: 'page', actor: 'anonymous' }, { kind: 'orders', actor: 'anonymous' }]) {
    propose(action, '', 'bootstrap', 'What does the unsigned visitor receive?', 'Observe the supplied application surface before role-specific expansion.', []);
  }
  for (const actor of actors) {
    const p = profiles.get(actor);
    propose({ kind: 'profile', actor }, '', 'bootstrap', `Which identity does the app recognize for ${actor}?`, 'A provided account label is not sufficient identity evidence.', []);
    if (p) propose({ kind: 'orders', actor }, '', 'bootstrap', `Which records are visible to ${actor}?`, 'Discover IDs and states from this matched principal rather than inventing object identifiers.', [p.evidenceId]);
  }
  for (const record of known) {
    const transition = lastTransition(record.id), epoch = transition?.observation.id || '';
    const refreshActor = profiles.get(record.owner)?.tenant === record.tenant ? record.owner
      : [...profiles].find(([, p]) => p.tenant === record.tenant)?.[0];
    for (const [actor, p] of profiles) if (p.tenant === record.tenant && lists.has(actor)) {
      const action = { kind: 'order', actor, objectId: record.id }, refresh = transition && actor === refreshActor;
      // One matched owner refresh establishes the next workflow state. Other
      // same-tenant roles still receive initial detail coverage, not redundant
      // post-transition reads that multiply the target budget.
      if (transition && !refresh && (observationsFor(action).length || decisions.some(d => key(d.action) === key(action)))) continue;
      propose(action, refresh ? epoch : '', refresh ? 'refresh' : 'coverage', `What is the current exact state of ${record.id} for ${actor}?`, refresh ? 'A transition attempt invalidates earlier state evidence, including after denial or incomplete collection.' : 'Positive detail control for an object discovered in an identity-matched list.', [...record.evidenceIds, p.evidenceId, ...(refresh ? [transition.observation.id] : [])]);
    }
  }
  // Select one positively controlled foreign object for each provided role.
  for (const [actor, p] of profiles) {
    const foreign = known.find(record => record.tenant !== p.tenant && observations.some(o => {
      const ownerProfile = profiles.get(o.action.actor);
      return o.action.kind === 'order' && o.action.objectId === record.id && ownerProfile?.tenant === record.tenant && complete(o) && sameIdentity(o, ownerProfile) && o.response.value.order?.id === record.id && o.response.value.order.tenant === record.tenant && o.response.value.order.owner === record.owner;
    }));
    if (foreign && lists.has(actor)) propose({ kind: 'order', actor, objectId: foreign.id }, '', 'cross', `Does ${actor} receive another organization's known object?`, 'This selected read has a successful same-organization detail control; refusal status alone will not establish absence of content.', [p.evidenceId, ...foreign.evidenceIds, ...observations.filter(o => o.action.kind === 'order' && o.action.objectId === foreign.id && complete(o)).map(o => o.id)]);
  }
  for (const record of permitTransitions ? known : []) {
    const transition = lastTransition(record.id), current = readState(record);
    if (transition?.observation.outcome === 'incomplete') {
      ask(['uncertain-effect', record.id], `Resolve the incomplete action on ${record.id}.`, 'A fresh read can collect state, but further transitions require operator review of the uncertain effect.', [transition.observation.id]); continue;
    }
    if (transition) {
      const o = transition.observation, p = profiles.get(o.action.actor), before = readState(record, transition.index);
      const expectedStatus = o.action.transition === 'approve' && p?.role === 'member' ? 403
        : o.action.transition === 'approve' && before?.value.state === 'draft' ? 409 : 200;
      if (!p || !sameIdentity(o, p) || o.response?.status !== expectedStatus) {
        ask(['unexpected-effect', record.id], `Review the unexpected action result on ${record.id}.`, 'Observed identity or result differs from this declared workflow; collect fresh state but do not advance mutations automatically.', [o.id]); continue;
      }
    }
    if (!current || transition && current.index <= transition.index) continue;
    const owner = profiles.get(record.owner), approver = [...profiles.values()].find(p => p.tenant === record.tenant && p.role === 'approver');
    if (!owner || owner.role !== 'member' || owner.tenant !== record.tenant || !approver) {
      const profilesPending = actors.some(actor => !handled({ kind: 'profile', actor }));
      if (current.value.state !== 'approved' && (!profilesPending || !actors.includes(record.owner))) ask(['workflow-context', record.id], `Supply the legitimate workflow context for ${record.id}.`, 'A matched member owner and same-organization approver are required; unsupported actors/roles are not executable placeholders.', [current.observation.id]);
      continue;
    }
    const ownerRead = observations.map((observation, index) => ({ observation, index })).findLast(({ observation: o }) => o.action.kind === 'order' && o.action.actor === owner.id && o.action.objectId === record.id);
    if (!ownerRead) continue; // The frontier contains a useful positive control, not an owner dependency.
    const o = ownerRead.observation, value = o.response?.value?.order;
    if (!complete(o) || !sameIdentity(o, owner) || !object(value) || value.id !== record.id || value.tenant !== record.tenant || value.owner !== owner.id || !STATES.includes(value.state)) {
      ask(['detail-control', record.id], `Resolve the unavailable owner detail control for ${record.id}.`, 'A list entry or refusal is not a successful exact-object control; mutations remain unproposed.', [o.id]); continue;
    }
    if (transition && ownerRead.index <= transition.index) continue;
    const state = value.state, evidenceIds = [owner.evidenceId, approver.evidenceId, o.id];
    if (state === 'draft') {
      const control = { kind: 'transition', actor: approver.id, objectId: record.id, transition: 'approve' };
      propose(control, state, 'control', `Does the approver honor the draft-state boundary for ${record.id}?`, 'A selected expected-denial control precedes the legitimate submission path; fresh state must follow the attempt.', evidenceIds);
      if (handled(control, state)) propose({ kind: 'transition', actor: owner.id, objectId: record.id, transition: 'submit' }, state, 'workflow', `Can the observed member owner submit ${record.id}?`, 'Ordinary positive functionality control from the currently observed draft state.', evidenceIds);
    } else if (state === 'submitted') {
      const control = { kind: 'transition', actor: owner.id, objectId: record.id, transition: 'approve' };
      propose(control, state, 'control', `Does the member honor the approval-role boundary for ${record.id}?`, 'A selected expected-denial role control is distinct from the approver functionality control.', evidenceIds);
      if (handled(control, state)) propose({ kind: 'transition', actor: approver.id, objectId: record.id, transition: 'approve' }, state, 'workflow', `Can the same-organization approver approve ${record.id}?`, 'Use a fresh post-action state read, not a transition response alone, before advancing the workflow.', evidenceIds);
    }
  }
  for (const o of observations) if (o.outcome === 'incomplete') ask(['incomplete', key(o.action)], 'Resolve incomplete evidence without retrying it silently.', 'The attempted action is retained as unavailable; other permitted branches may continue.', [o.id]);
  for (const o of observations) {
    if (o.action.kind !== 'order' || o.outcome !== 'complete') continue;
    const record = objects.get(o.action.objectId), p = profiles.get(o.action.actor);
    if (!record || !p) continue;
    if (p.tenant !== record.tenant) {
      const denied = [403, 404].includes(o.response?.status) && object(o.response?.value) && !Object.hasOwn(o.response.value, 'order') && !Object.hasOwn(o.response.value, 'orders');
      if (!denied) ask(['foreign-result', key(o.action)], 'Adjudicate the unexpected foreign-read result.', 'A selected cross-organization response differs from the declared denial predicate; this is a review candidate, not a confirmed finding.', [o.id, ...record.evidenceIds]);
    } else if (o.action.actor !== record.owner && (!complete(o) || !sameIdentity(o, p) || o.response.value.order?.id !== record.id)) {
      ask(['role-detail', key(o.action)], 'Review missing positive detail coverage for this role.', 'An attempted same-organization detail read did not provide a matched object; it is not passed coverage.', [o.id]);
    }
  }
  for (const d of decisions) if (d.status !== 'executed') ask(['decision', key(d.action)], 'Review an excluded branch if broader coverage is wanted.', `This action remains ${d.status}; the selector does not reverse that decision.`, d.evidenceIds || []);
  for (const d of decisions) if (d.status === 'executed' && decisions.filter(x => x.status === 'executed' && key(x.action) === key(d.action)).length > observationsFor(d.action).length) {
    ask(['missing-observation', key(d.action)], 'Reconcile an acknowledged action without complete observation history.', 'The selector will not resubmit an executed action merely because its observation is absent.', d.evidenceIds || []);
  }
  if (overflow) ask('frontier-limit', 'Scope the remaining frontier.', 'At most 80 distinct eligible proposals are considered per selection; omitted work is not passed or complete.');
  const rank = priority === 'workflow'
    ? { bootstrap: 0, refresh: 1, control: 2, workflow: 3, coverage: 4, cross: 5 }
    : { bootstrap: 0, refresh: 1, coverage: 2, cross: 3, control: 4, workflow: 5 };
  frontier.sort((a, b) => rank[a.category] - rank[b.category]);
  const next = frontier[0];
  if (next) {
    const { category, ...proposal } = next;
    return { proposal, stopReason: null, ownerRequests };
  }
  ask('unsupported-coverage', 'Plan any broader investigation separately.', 'Selected discovered-object reads and supported sequential workflows are exhausted or excluded. Sessions, concurrency, browser behavior, additional interfaces and exhaustive cross-role combinations remain untested.');
  return { proposal: null, stopReason: 'No eligible distinct action remains in the bounded observed frontier. This is not a clean security verdict; blocked, incomplete and unsupported coverage remains explicit.', ownerRequests };
}
