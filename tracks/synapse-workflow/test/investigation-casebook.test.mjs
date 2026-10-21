import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCasebook,applyCaseEvent,summarizeCasebook} from '../src/investigation/casebook.mjs';
const who={principal:'member',tenant:'one',role:'member'};
const obs=(id,objectId,status=200)=>({id,action:{kind:'order',actor:'member',objectId},outcome:'complete',identity:{...who},response:{status,value:{state:'draft'}}});
function fixture(){
  const ctx={observations:[obs('basis','a',403),obs('control','b'),obs('related','c')],decisions:[],environment:{id:'session-one',sourceHash:'original'}};
  let state=initialCasebook(),n=0;
  const send=(type,payload,context=ctx)=>state=applyCaseEvent(state,{id:`event-${++n}`,type,payload},context);
  const candidate={id:'case',title:'Declared question',question:'Was the policy enforced?',authorId:'author',basisEvidenceIds:['basis'],identity:who,environment:{sourceHash:'original'},expected:'Declared expected policy',observed:'Declared response',demonstratedConsequence:'No independent effect established',potentialConsequences:'Possible effect only',uncertainties:'Coverage limited',suggestedRepair:'Owner investigation first',manualVerification:'Repeat selected controls',impactType:'other'};
  send('candidate.created',candidate);
  const gate=()=>send('evidence.filtered',{caseId:'case',positiveControlIds:['control']});
  const review=(extra={})=>send('review.recorded',{caseId:'case',reviewerId:'other-label',verdict:'supported',evidenceIds:['basis','control'],objections:['No effect oracle'],notes:'Declared review',...extra});
  return {ctx,send,gate,review,get state(){return state;}};
}
test('pure history retains interpretations; declared review and reproduction never verify effects',()=>{
  const f=fixture(),before=structuredClone(f.state);f.gate();f.review();
  assert.equal(before.cases[0].gates.length,0);
  f.send('owner.verified',{caseId:'case',result:'reproduced',evidenceIds:['basis'],notes:'Owner declaration'});
  const s=summarizeCasebook(f.state);assert.deepEqual(s.verifiedFindings,[]);assert.equal(s.issuesNeedingOwnerAction[0].substatus,'owner-declared-reproduced');
  f.send('owner.verified',{caseId:'case',result:'not-reproduced',evidenceIds:['basis'],notes:'Could not reproduce; not proof of repair'});
  const next=summarizeCasebook(f.state);assert.equal(next.issuesNeedingOwnerAction.length,0);assert.equal(next.unconfirmedLeads[0].ownerVerifications.length,2);
});
test('gate retains missing, incomplete, wrong identity, wrong source and denied controls',()=>{
  for(const mutate of [c=>c.observations.shift(),c=>c.observations[0].outcome='incomplete',c=>c.observations[0].identity.tenant='other',c=>c.environment.sourceHash='changed',c=>c.observations[1].response.status=403,c=>c.observations[0].action.extraMeaning='unmatched',c=>delete c.observations[0].response.value,c=>c.observations[1].action.actor='wrong-session']){
    const f=fixture();mutate(f.ctx);f.gate();assert.equal(f.state.cases[0].gates[0].passed,false);assert.ok(f.state.cases[0].gates[0].reasons.length);assert.equal(summarizeCasebook(f.state).unconfirmedLeads.length,1);assert.throws(()=>f.review());
  }
});
test('review requires distinct label and exact immutable complete evidence; objections retained',()=>{
  const f=fixture();f.gate();assert.throws(()=>f.review({reviewerId:'author'}));assert.throws(()=>f.review({evidenceIds:['basis']}));
  f.ctx.observations[0].response.value.state='changed';assert.throws(()=>f.review());f.ctx.observations[0].response.value.state='draft';f.review();assert.deepEqual(f.state.cases[0].reviews[0].objections,['No effect oracle']);
  f.gate();assert.equal(summarizeCasebook(f.state).unconfirmedLeads[0].substatus,'awaiting-declared-review');
});
test('unrelated owner evidence cannot assert reproduction; rejected reviews remain unconfirmed',()=>{
  const f=fixture();f.gate();f.review();
  assert.throws(()=>f.send('owner.verified',{caseId:'case',result:'reproduced',evidenceIds:['related'],notes:'Unrelated action'}),/semantics/);
  f.review({verdict:'rejected'});assert.equal(summarizeCasebook(f.state).unconfirmedLeads[0].substatus,'review-rejected');
  assert.equal(f.state.cases[0].reviews.length,2);
});
test('owner verification cannot carry across a new gate or superseding review',()=>{
  for(const result of ['reproduced','not-reproduced','inconclusive'])for(const newGate of [true,false]){
    const f=fixture();f.gate();f.review();
    f.send('owner.verified',{caseId:'case',result,evidenceIds:['basis'],notes:'Owner verified the old review only'});
    if(newGate)f.gate();f.review();
    let s=summarizeCasebook(f.state);assert.equal(s.issuesNeedingOwnerAction[0].substatus,'awaiting-owner-verification');
    assert.equal(s.issuesNeedingOwnerAction[0].ownerVerifications.length,1);
    f.send('owner.verified',{caseId:'case',result:'not-reproduced',evidenceIds:['basis'],notes:'Fresh verification of current review'});
    s=summarizeCasebook(f.state);assert.equal(s.unconfirmedLeads[0].substatus,'owner-not-reproduced');
    assert.deepEqual(s.verifiedFindings,[]);
  }
});
test('retests bind original related legitimate controls and record mismatches without inferring fixes',()=>{
  const f=fixture();f.gate();f.review();
  f.send('retest.planned',{caseId:'case',originalEvidenceIds:['basis'],relatedEvidenceIds:['related'],legitimateControlIds:['control']});
  const changed={observations:[obs('new-a','a'),obs('new-b','b'),obs('new-c','c')],decisions:[],environment:{id:'new-session',sourceHash:'changed'}};
  const record=c=>f.send('retest.recorded',{caseId:'case',evidenceIds:c.observations.map(o=>o.id),notes:'Actual retained responses'},c);
  record(changed);assert.equal(f.state.cases[0].retests.at(-1).status,'matched-observations-only');assert.deepEqual(summarizeCasebook(f.state).verifiedFindings,[]);
  changed.observations[0].identity.tenant='other';record(changed);assert.match(f.state.cases[0].retests.at(-1).reasons.join(' '),/unmatched/);
  changed.observations[0].identity={...who};changed.observations[0].outcome='incomplete';record(changed);assert.match(f.state.cases[0].retests.at(-1).reasons.join(' '),/incomplete/);
  changed.environment.sourceHash='original';record(changed);assert.match(f.state.cases[0].retests.at(-1).reasons.join(' '),/unchanged/);
});
test('one retest observation cannot stand in for repeated original/control evidence',()=>{
  const f=fixture();f.ctx.observations[2].action={...f.ctx.observations[0].action};f.gate();
  f.send('retest.planned',{caseId:'case',originalEvidenceIds:['basis'],relatedEvidenceIds:['related'],legitimateControlIds:['control']});
  const context={observations:[obs('only-a','a'),obs('only-b','b')],decisions:[],environment:{id:'changed-session',sourceHash:'changed'}};
  f.send('retest.recorded',{caseId:'case',evidenceIds:['only-a','only-b'],notes:'Related repeated action absent'},context);
  assert.equal(f.state.cases[0].retests.at(-1).status,'incomplete-or-mismatched');assert.match(f.state.cases[0].retests.at(-1).reasons.join(' '),/distinct observation order/);
});
test('retained changed-build observations use their own environment and cannot mix sessions',()=>{
  const f=fixture();f.gate();f.send('retest.planned',{caseId:'case',originalEvidenceIds:['basis'],relatedEvidenceIds:['related'],legitimateControlIds:['control']});
  const imported=['a','b','c'].map(x=>({...obs('import-'+x,x),environment:{id:'new-session',sourceHash:'new-source'},source:'retained-workbench-import'}));
  f.ctx.observations.push(...imported);
  const record=()=>f.send('retest.recorded',{caseId:'case',evidenceIds:imported.map(o=>o.id),notes:'Retained evidence; no inference or target call'});
  record();assert.equal(f.state.cases[0].retests.at(-1).status,'matched-observations-only');assert.equal(f.state.cases[0].retests.at(-1).environment.sourceHash,'new-source');
  imported[1].environment.id='different-session';record();assert.match(f.state.cases[0].retests.at(-1).reasons.join(' '),/Mixed/);
  for(const o of imported)o.environment={};record();assert.match(f.state.cases[0].retests.at(-1).reasons.join(' '),/malformed environment/);
});
test('duplicate IDs, ambiguous observations, accessors, invalid fields and budgets rejected',()=>{
  const f=fixture();assert.throws(()=>applyCaseEvent(f.state,f.state.events[0],f.ctx),/Duplicate/);
  f.ctx.observations.push(f.ctx.observations[0]);assert.throws(()=>f.gate(),/Ambiguous/);
  let invoked=false;const hostile={get id(){invoked=true;return 'x';}};assert.throws(()=>applyCaseEvent(initialCasebook(),hostile,{}));assert.equal(invoked,false);
  assert.throws(()=>applyCaseEvent(initialCasebook(),{id:'x',type:'x',payload:{extra:true}}, {observations:[],decisions:[],environment:{id:'a',sourceHash:'s'}}));
  assert.throws(()=>applyCaseEvent({...initialCasebook(),events:Array(400).fill({})},{id:'x',type:'x',payload:{}},{}),/budget/);
});
