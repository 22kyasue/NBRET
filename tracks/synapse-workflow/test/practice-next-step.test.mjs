import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseNext } from '../src/practice/next-step.mjs';

const profiles = {
  alice: { id: 'alice', tenant: 'red', role: 'member' },
  bob: { id: 'bob', tenant: 'blue', role: 'member' },
  carol: { id: 'carol', tenant: 'red', role: 'approver' },
  dana: { id: 'dana', tenant: 'blue', role: 'approver' },
};
const records = () => [
  { id: 'observed-red-7', tenant: 'red', owner: 'alice', state: 'draft' },
  { id: 'observed-blue-9', tenant: 'blue', owner: 'bob', state: 'submitted' },
];
const blank = () => ({ observations: [], decisions: [], requests: [], stopped: false });
test('supplied scope narrows anonymous/accounts bootstrap and read-only frontier', () => {
  assert.equal(chooseNext({enabledActors:['alice'],permitTransitions:false}).proposal.action.actor,'alice');
  assert.equal(chooseNext({enabledActors:['anonymous']}).proposal.action.actor,'anonymous');
  assert.equal(chooseNext({enabledActors:[]}).proposal,null);
  const s=initialized();
  for(let i=0;i<80;i++){
    const next=chooseNext({...s,enabledActors:['alice','carol'],permitTransitions:false});
    if(!next.proposal){assert.ok(i>0);break;}
    assert.ok(['alice','carol'].includes(next.proposal.action.actor));assert.notEqual(next.proposal.action.kind,'transition');
    s.decisions.push({...next.proposal,status:'blocked'});
    if(i===79)assert.fail('Narrowed frontier did not exhaust');
  }
  assert.throws(()=>chooseNext({enabledActors:['unknown']}));
  assert.throws(()=>chooseNext({permitTransitions:'false'}));
});
function observation(action, value, { status = 200, outcome = 'complete', id, identity } = {}) {
  const p = profiles[action.actor];
  return { id, action: { ...action }, outcome, response: { status, value: structuredClone(value) },
    identity: identity || { principal: p?.id || 'anonymous', tenant: p?.tenant || 'none', role: p?.role || 'unauthenticated' } };
}
function append(s, action, value, options = {}) {
  s.observations.push(observation(action, value, { id: `obs-${s.observations.length}`, ...options }));
  return s;
}
function initialized(items = records()) {
  const s = blank();
  append(s, { kind: 'page', actor: 'anonymous' }, { htmlPage: true });
  append(s, { kind: 'orders', actor: 'anonymous' }, { error: 'signed out' }, { status: 401 });
  for (const [actor, p] of Object.entries(profiles)) {
    append(s, { kind: 'profile', actor }, { profile: p });
    append(s, { kind: 'orders', actor }, { orders: items.filter(o => o.tenant === p.tenant) });
  }
  return s;
}
function answer(s, proposal, items) {
  const a = proposal.action, p = profiles[a.actor];
  let value, status = 200;
  if (a.kind === 'page') value = { htmlPage: true };
  else if (a.actor === 'anonymous') { value = { error: 'signed out' }; status = 401; }
  else if (a.kind === 'profile') value = { profile: p };
  else if (a.kind === 'orders') value = { orders: items.filter(o => o.tenant === p.tenant) };
  else {
    const row = items.find(o => o.id === a.objectId && o.tenant === p.tenant);
    if (!row) { status = 404; value = { error: 'not found' }; }
    else if (a.kind === 'order') value = { order: row };
    else if (a.transition === 'approve' && p.role !== 'approver') { status = 403; value = { error: 'role' }; }
    else if (row.state !== (a.transition === 'submit' ? 'draft' : 'submitted')) { status = 409; value = { error: 'state' }; }
    else {
      assert.ok(a.transition !== 'submit' || row.owner === p.id && p.role === 'member');
      row.state = a.transition === 'submit' ? 'submitted' : 'approved'; value = { order: row };
    }
  }
  s.decisions.push({ id: proposal.id, action: { ...a }, evidenceIds: [...proposal.evidenceIds], status: 'executed' });
  append(s, a, value, { status });
}

test('bootstrap is deterministic and requires observed identity before account list expansion', () => {
  const s = blank();
  const first = chooseNext(s);
  assert.deepEqual(first.proposal.action, { kind: 'page', actor: 'anonymous' });
  assert.deepEqual(chooseNext(s), first);
  append(s, first.proposal.action, { htmlPage: true });
  const second = chooseNext(s); assert.deepEqual(second.proposal.action, { kind: 'orders', actor: 'anonymous' });
  append(s, second.proposal.action, { error: 'no session' }, { status: 401 });
  const third = chooseNext(s); assert.deepEqual(third.proposal.action, { kind: 'profile', actor: 'alice' });
  append(s, third.proposal.action, { profile: profiles.alice });
  assert.deepEqual(chooseNext(s).proposal.action, { kind: 'orders', actor: 'alice' });
});

test('changed observed records and state change the frontier rather than replaying fixed object IDs', () => {
  const s = initialized([{ id: 'new-visible-record', tenant: 'red', owner: 'alice', state: 'draft' }]);
  assert.equal(chooseNext(s).proposal.action.objectId, 'new-visible-record');
  assert.equal(chooseNext(s).proposal.action.kind, 'order');
  append(s, { kind: 'order', actor: 'alice', objectId: 'new-visible-record' }, { order: { id: 'new-visible-record', tenant: 'red', owner: 'alice', state: 'draft' } });
  const workflow = chooseNext({ ...s, priority: 'workflow' });
  assert.deepEqual(workflow.proposal.action, { kind: 'transition', actor: 'carol', objectId: 'new-visible-record', transition: 'approve' });
  const changed = initialized([{ id: 'different-visible-record', tenant: 'red', owner: 'alice', state: 'submitted' }]);
  append(changed, { kind: 'order', actor: 'alice', objectId: 'different-visible-record' }, { order: { id: 'different-visible-record', tenant: 'red', owner: 'alice', state: 'submitted' } });
  const next = chooseNext({ ...changed, priority: 'workflow' });
  assert.deepEqual(next.proposal.action, { kind: 'transition', actor: 'alice', objectId: 'different-visible-record', transition: 'approve' });
  assert.notEqual(next.proposal.id, workflow.proposal.id);
  const approved = initialized([{ id: 'already-approved', tenant: 'red', owner: 'alice', state: 'approved' }]);
  assert.equal(chooseNext({ ...approved, priority: 'workflow' }).proposal.action.kind, 'order');
});

test('incomplete or denied identity/list evidence creates owner requests and is never retried automatically', () => {
  const s = initialized();
  const alice = s.observations.find(o => o.action.kind === 'profile' && o.action.actor === 'alice');
  alice.outcome = 'incomplete';
  const before = JSON.stringify(s), result = chooseNext(s);
  assert.ok(result.ownerRequests.some(r => r.evidenceIds.includes(alice.id)));
  assert.notEqual(result.proposal.action.actor, 'alice');
  assert.equal(JSON.stringify(s), before);
  const denied = initialized();
  const list = denied.observations.find(o => o.action.kind === 'orders' && o.action.actor === 'bob');
  list.response = { status: 403, value: { error: 'denied' } };
  // Dana still discovers the blue object; Bob must not be granted own/cross reads
  // from a denied list despite his valid profile.
  const blue = chooseNext(denied);
  assert.ok(blue.ownerRequests.some(r => r.evidenceIds.includes(list.id)));
  assert.notDeepEqual(blue.proposal.action, { kind: 'orders', actor: 'bob' });
  const mismatch = initialized();
  mismatch.observations.find(o => o.action.kind === 'profile' && o.action.actor === 'carol').identity.principal = 'alice';
  assert.notEqual(chooseNext({ ...mismatch, priority: 'workflow' }).proposal.action.actor, 'carol');
});

test('foreign reads require a successful known-object detail control', () => {
  const s = initialized(records().map(r => ({ ...r, state: 'approved' })));
  const objects = records();
  for (let i = 0; i < 10; i++) {
    const next = chooseNext(s).proposal;
    if (next.action.kind === 'order' && profiles[next.action.actor].tenant !== objects.find(o => o.id === next.action.objectId).tenant) {
      assert.ok(s.observations.some(o => o.action.kind === 'order' && o.action.objectId === next.action.objectId && o.response.status === 200));
      return;
    }
    answer(s, next, objects);
  }
  assert.fail('expected a selected foreign read after positive detail controls');
});

test('full pure trajectory includes all four roles, fresh state after transitions and finite clean exhaustion', () => {
  const s = blank(), items = records(), proposals = [];
  for (let step = 0; step < 80; step++) {
    const next = chooseNext(s);
    if (!next.proposal) {
      assert.match(next.stopReason, /not a clean security verdict/);
      assert.ok(next.ownerRequests.some(r => /untested/.test(r.reason)));
      assert.ok(items.every(o => o.state === 'approved'));
      assert.deepEqual(new Set(proposals.filter(p => p.action.kind === 'profile').map(p => p.action.actor)), new Set(['alice', 'bob', 'carol', 'dana']));
      assert.equal(new Set(proposals.map(p => p.id)).size, proposals.length);
      return;
    }
    const p = next.proposal;
    if (p.action.kind === 'transition') {
      const lastMutation = s.observations.findLastIndex(o => o.action.kind === 'transition' && o.action.objectId === p.action.objectId);
      if (lastMutation >= 0) assert.ok(s.observations.slice(lastMutation + 1).some(o => o.action.kind === 'order' && o.action.objectId === p.action.objectId && o.response.status === 200));
    }
    proposals.push(p); answer(s, p, items);
  }
  assert.fail('selector failed to exhaust a finite ordinary workflow within 80 steps');
});

test('blocked decisions and incomplete transitions do not silently retry or advance mutations', () => {
  const s = initialized([records()[0]]);
  append(s, { kind: 'order', actor: 'alice', objectId: records()[0].id }, { order: records()[0] });
  let p = chooseNext({ ...s, priority: 'workflow' }).proposal;
  s.decisions.push({ id: p.id, action: p.action, evidenceIds: p.evidenceIds, status: 'blocked' });
  const after = chooseNext({ ...s, priority: 'workflow' });
  assert.notEqual(after.proposal.id, p.id);
  assert.ok(after.ownerRequests.some(r => /blocked/.test(r.reason)));
  const uncertain = initialized([records()[0]]);
  append(uncertain, { kind: 'order', actor: 'alice', objectId: records()[0].id }, { order: records()[0] });
  p = chooseNext({ ...uncertain, priority: 'workflow' }).proposal;
  uncertain.decisions.push({ id: p.id, action: p.action, evidenceIds: p.evidenceIds, status: 'executed' });
  append(uncertain, p.action, {}, { outcome: 'incomplete', status: 0 });
  let next = chooseNext({ ...uncertain, priority: 'workflow' });
  assert.equal(next.proposal.action.kind, 'order');
  answer(uncertain, next.proposal, [records()[0]]);
  next = chooseNext({ ...uncertain, priority: 'workflow' });
  assert.notEqual(next.proposal?.action.kind, 'transition');
  assert.ok(next.ownerRequests.some(r => /uncertain effect/.test(r.reason)));
});

test('unsupported states, duplicate object provenance and unsupported workflow context are retained as owner requests', () => {
  const unsupported = initialized([{ ...records()[0], state: 'unmodeled' }]);
  const unknown = chooseNext(unsupported);
  assert.equal(unknown.proposal, null); assert.ok(unknown.ownerRequests.length);
  const duplicated = initialized([records()[0], { ...records()[0] }]);
  assert.equal(chooseNext(duplicated).proposal, null);
  const missingOwner = initialized([{ ...records()[0], owner: 'not-provided' }]);
  assert.ok(chooseNext(missingOwner).ownerRequests.some(r => /workflow/.test(r.question)));
});

test('operator stop, owner-request dedupe and bounded frontier preserve uncertainty', () => {
  const s = initialized();
  assert.equal(chooseNext({ ...s, stopped: { reason: 'operator stop' } }).proposal, null);
  const large = initialized(Array.from({ length: 81 }, (_, i) => ({ id: `record-${String(i).padStart(3, '0')}`, tenant: 'red', owner: 'alice', state: 'approved' })));
  const result = chooseNext(large);
  assert.ok(result.ownerRequests.some(r => /80/.test(r.reason)));
  const repeated = chooseNext({ ...large, requests: result.ownerRequests });
  assert.equal(repeated.ownerRequests.length, 0);
  assert.equal(repeated.proposal.id, result.proposal.id);
});

test('malformed histories/actions and accessor values fail before supplying proposals', () => {
  assert.throws(() => chooseNext({ observations: [{ id: 'bad', outcome: 'complete', action: { kind: 'shell', actor: 'alice' } }] }), /action/);
  assert.throws(() => chooseNext({ priority: 'expand-permission' }), /priority/);
  assert.throws(() => chooseNext({ observations: Array(1001).fill(null) }), /budget/);
  const s = blank(); Object.defineProperty(s, 'observations', { enumerable: true, get() { throw new Error('getter executed'); } });
  assert.throws(() => chooseNext(s), /data properties/);
});

test('pending supplied profiles are useful work rather than premature owner dependencies', () => {
  const s = initialized([records()[0]]);
  s.observations = s.observations.filter(o => !['carol', 'dana'].includes(o.action.actor));
  const next = chooseNext(s);
  assert.deepEqual(next.proposal.action, { kind: 'profile', actor: 'carol' });
  assert.equal(next.ownerRequests.length, 0);
});

test('ordinary six-record frontier exhausts within 52 actions and refreshes only the member owner', () => {
  const s = blank(), items = ['red', 'blue'].flatMap((tenant, i) => ['draft', 'submitted', 'approved'].map((state, j) => ({
    id: `case-${tenant}-${j}`, tenant, state, owner: i ? 'bob' : 'alice',
  })));
  for (let step = 0; step <= 52; step++) {
    const next = chooseNext(s);
    if (!next.proposal) {
      assert.ok(step <= 52); assert.ok(items.every(o => o.state === 'approved')); return;
    }
    assert.ok(step < 52, 'the disclosed ordinary frontier must fit the action ceiling');
    const p = next.proposal, a = p.action;
    const previous = s.observations.findLast(o => o.action.kind === 'transition' && o.action.objectId === a.objectId);
    if (a.kind === 'order' && previous && p.reason.startsWith('A transition')) {
      assert.equal(a.actor, items.find(o => o.id === a.objectId).owner);
    }
    assert.ok(!next.ownerRequests.some(r => /workflow context/.test(r.question)), 'ordinary pending bootstrap must not create owner work');
    answer(s, p, items);
  }
  assert.fail('ordinary frontier did not terminate');
});

test('a denied exact-owner detail control never becomes permission to mutate from a list', () => {
  const s = initialized([records()[0]]);
  append(s, { kind: 'order', actor: 'alice', objectId: records()[0].id }, { error: 'denied' }, { status: 403 });
  const next = chooseNext({ ...s, priority: 'workflow' });
  assert.notEqual(next.proposal?.action.kind, 'transition');
  assert.ok(next.ownerRequests.some(r => /detail control/.test(r.question)));
});

test('unexpected foreign content is referred for review rather than counted as clean coverage', () => {
  const s = initialized(records().map(r => ({ ...r, state: 'approved' })));
  append(s, { kind: 'order', actor: 'alice', objectId: records()[0].id }, { order: records()[0] });
  append(s, { kind: 'order', actor: 'bob', objectId: records()[0].id }, { order: records()[0] });
  assert.ok(chooseNext(s).ownerRequests.some(r => /foreign-read/.test(r.question)));
  const unavailable = blank();
  unavailable.decisions.push({ id: 'external-executed', action: { kind: 'page', actor: 'anonymous' }, evidenceIds: [], status: 'executed' });
  const next = chooseNext(unavailable);
  assert.notEqual(next.proposal.action.kind, 'page');
  assert.ok(next.ownerRequests.some(r => /acknowledged/.test(r.question)));
});
