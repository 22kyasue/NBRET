import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCasebook,applyCaseEvent,summarizeCasebook} from '../src/investigation/casebook.mjs';
import {validateConsequence,projectConsequence} from '../src/investigation/consequence.mjs';
const identity={principal:'alice',tenant:'north',role:'member'};
function fixture(){
  const context={observations:['basis','control'].map(id=>({id,action:{kind:'profile',actor:'alice'},outcome:'complete',identity:{...identity},environment:{id:'session',sourceHash:'original'},response:{status:200,value:{profile:{id:'alice'}}}})),decisions:[],environment:{id:'session',sourceHash:'original'}};
  let state=initialCasebook(),n=0;
  const send=(type,payload)=>state=applyCaseEvent(state,{id:`event-${++n}`,type,payload},context);
  send('candidate.created',{id:'case',title:'Ordinary observation',question:'What does this profile establish?',authorId:'author',basisEvidenceIds:['basis'],identity,environment:{sourceHash:'original'},expected:'Own profile',observed:'Own profile returned',demonstratedConsequence:'Own data only; independent effect unknown',potentialConsequences:'Untested',uncertainties:'Coverage limited',suggestedRepair:'No repair asserted',manualVerification:'Review selected observations',impactType:'other'});
  const gate=()=>send('evidence.filtered',{caseId:'case',positiveControlIds:['control']});
  const review=()=>send('review.recorded',{caseId:'case',reviewerId:'declared-other',verdict:'supported',evidenceIds:['basis','control'],objections:['No independent effect evidence'],notes:'Review of original evidence only'});
  return{context,send,gate,review,get state(){return state;}};
}
function document(){return{
  caseId:'case',capability:'Read the own synthetic profile',whyPossible:'The supplied account receives its own profile',
  severity:{level:'unknown',rationale:'Actual harm is not established'},
  extent:{demonstrated:{description:'Own profile response only',evidenceIds:['basis']},wider:{description:'No wider reach demonstrated',evidenceIds:[],assumptions:['Other roles and objects remain untested']}},
  accessEffort:{level:'low',rationale:'Uses the already supplied synthetic account'},
  repair:{immediate:'No repair established',broaderRule:'Owner should confirm intended policy',legitimateFlowEffects:'Preserve legitimate own reads',acceptanceChecks:['Retain allowed own-profile behavior','Independently check related policy cases'],effort:{level:'unknown',rationale:'No implementation estimate validated'}},
  sequence:[{id:'profile-step',explanation:'Read the own profile',evidenceIds:['basis'],screenshots:[{artifactId:'capture_opaque-1',sha256:'a'.repeat(64),caption:'Declared pointer only; no image has been loaded'}],expected:'Own profile allowed',current:'Own profile observed',proposedRepaired:'Proposed behavior only; no repaired build observed'}],
  nextInvestigation:{extendDemonstratedPath:'Check other approved role contexts if authorized',resolveFixUncertainty:'Obtain actual changed-build and legitimate control evidence'}
};}
const latest=s=>[...summarizeCasebook(s).unconfirmedLeads,...summarizeCasebook(s).issuesNeedingOwnerAction][0];

test('legacy candidates and summaries gain no consequence fields before first event',()=>{
  const f=fixture(),before=structuredClone(f.state);assert.equal(Object.hasOwn(f.state.cases[0],'consequenceHistory'),false);assert.equal(Object.hasOwn(latest(f.state),'consequence'),false);assert.equal(projectConsequence(f.state.cases[0]),null);assert.deepEqual(f.state,before);
});
test('document history retains declared unsupported extent, unverified screenshots and proposed repair without promotion',()=>{
  const f=fixture(),input=document(),before=structuredClone(f.state);input.severity.level='critical';f.send('consequence.documented',input);
  const c=latest(f.state);assert.equal(c.consequence.stale,false);assert.equal(c.consequence.gateEventId,null);assert.equal(c.consequence.reviewEventId,null);assert.equal(c.consequence.widerSupport,'unsupported');assert.match(c.consequence.screenshotsAuthority,/Unverified/);assert.match(c.consequence.repairStatus,/Proposed/);assert.match(c.consequence.interpretation,/unverified/);
  assert.deepEqual(summarizeCasebook(f.state).verifiedFindings,[]);assert.equal(summarizeCasebook(f.state).issuesNeedingOwnerAction.length,0);assert.equal(before.cases[0].consequenceHistory,undefined);
  input.capability='Changed after event';assert.notEqual(f.state.cases[0].consequenceHistory[0].document.capability,input.capability);
  c.consequence.document.capability='Changed projection';assert.notEqual(latest(f.state).consequence.document.capability,c.consequence.document.capability);
});
test('gate/review context binding becomes stale after re-filter or a superseding review',()=>{
  const f=fixture();f.send('consequence.documented',document());f.gate();assert.equal(latest(f.state).consequence.stale,true);
  f.review();f.send('consequence.documented',document());assert.equal(latest(f.state).consequence.stale,false);assert.equal(latest(f.state).consequence.reviewEventId,f.state.cases[0].reviews.at(-1).eventId);
  f.review();assert.equal(latest(f.state).consequence.stale,true);f.send('consequence.documented',document());assert.equal(latest(f.state).consequence.stale,false);
  f.gate();assert.equal(latest(f.state).consequence.stale,true);assert.equal(f.state.cases[0].consequenceHistory.length,3);assert.deepEqual(summarizeCasebook(f.state).verifiedFindings,[]);
});
test('critical declared severity cannot defeat owner contradiction or a rejected review',()=>{
  for(const result of ['not-reproduced','inconclusive']){
    const f=fixture();f.gate();f.review();const p=document();p.severity.level='critical';f.send('consequence.documented',p);
    f.send('owner.verified',{caseId:'case',result,evidenceIds:['basis'],notes:'Owner declaration contradicts or does not resolve the interpretation'});
    assert.equal(summarizeCasebook(f.state).issuesNeedingOwnerAction.length,0);assert.equal(latest(f.state).substatus,`owner-${result}`);assert.deepEqual(summarizeCasebook(f.state).verifiedFindings,[]);
  }
  const f=fixture();f.gate();f.send('review.recorded',{caseId:'case',reviewerId:'declared-other',verdict:'rejected',evidenceIds:['basis','control'],objections:['Unsupported consequence'],notes:'Rejected interpretation'});const p=document();p.severity.level='critical';f.send('consequence.documented',p);
  assert.equal(summarizeCasebook(f.state).issuesNeedingOwnerAction.length,0);assert.equal(latest(f.state).substatus,'review-rejected');
});
test('all demonstrated, wider and sequence refs require existing complete identity/source-bound observations',()=>{
  for(const path of ['demonstrated','wider','sequence'])for(const mutate of [o=>o.id='different',o=>o.outcome='incomplete',o=>o.environment.sourceHash='other',o=>o.identity.principal='bob',o=>delete o.identity,o=>delete o.response.value]){
    const f=fixture(),p=document();if(path==='demonstrated')p.extent.demonstrated.evidenceIds=['control'];if(path==='wider')p.extent.wider.evidenceIds=['control'];if(path==='sequence')p.sequence[0].evidenceIds=['control'];
    mutate(f.context.observations[1]);const before=structuredClone(f.state);assert.throws(()=>f.send('consequence.documented',p));assert.deepEqual(f.state,before);
  }
  const f=fixture(),p=document();p.extent.wider.evidenceIds=['control'];f.send('consequence.documented',p);assert.equal(latest(f.state).consequence.widerSupport,'cited-observations-only');
});
test('strict nested fields, estimates, required descriptions and nonempty support/assumptions reject malformed documents',()=>{
  for(const mutate of [p=>p.extra='unknown',p=>p.severity.score=10,p=>p.extent.wider.certified=true,p=>p.repair.effort.hours=1,p=>p.sequence[0].screenshots[0].url='https://invalid/',p=>p.severity.level='certain',p=>p.accessEffort.level='critical',p=>p.repair.effort.level='critical',p=>p.whyPossible='',p=>p.extent.demonstrated.evidenceIds=[],p=>p.sequence[0].evidenceIds=[],p=>p.extent.wider.assumptions=[],p=>p.repair.acceptanceChecks=[],p=>p.nextInvestigation.resolveFixUncertainty=null,p=>p.sequence.push(structuredClone(p.sequence[0])),p=>p.extent.demonstrated.evidenceIds.push('basis')]){
    const p=document();mutate(p);assert.throws(()=>validateConsequence(p));
  }
});
test('screenshot pointers never accept paths, URLs, HTML or malformed hashes',()=>{
  for(const artifactId of ['https://invalid/x','C:\\secret','../image','folder/image','<img>','file.png','x:y','a'.repeat(81)]){const p=document();p.sequence[0].screenshots[0].artifactId=artifactId;assert.throws(()=>validateConsequence(p));}
  for(const sha256 of ['a'.repeat(63),'a'.repeat(65),'z'.repeat(64),'A'.repeat(64)]){const p=document();p.sequence[0].screenshots[0].sha256=sha256;assert.throws(()=>validateConsequence(p));}
  const p=document();p.sequence[0].screenshots=[];assert.deepEqual(validateConsequence(p).sequence[0].screenshots,[]);
});
test('inert JSON checks reject accessors, prototypes, hidden/symbol/array properties and oversized structures without invoking code',()=>{
  let invoked=false;const p=document();Object.defineProperty(p.severity,'rationale',{get(){invoked=true;return 'getter';},enumerable:true});assert.throws(()=>validateConsequence(p));assert.equal(invoked,false);
  for(const mutate of [p=>Object.defineProperty(p,'hidden',{value:1}),p=>p[Symbol('x')]=1,p=>p.sequence.extra=1,p=>delete p.sequence[0],p=>Object.setPrototypeOf(p.severity,{inherited:true}),p=>p.capability='x'.repeat(2001),p=>p.sequence=Array(21).fill(p.sequence[0]),p=>p.sequence[0].screenshots=Array(11).fill(p.sequence[0].screenshots[0])]){const p=document();mutate(p);assert.throws(()=>validateConsequence(p));}
  const bomb=document();bomb.sequence=Array.from({length:20},(_,i)=>({...structuredClone(bomb.sequence[0]),id:String(i),explanation:'x'.repeat(2000),expected:'x'.repeat(2000),current:'x'.repeat(2000),proposedRepaired:'x'.repeat(2000)}));assert.throws(()=>validateConsequence(bomb),/byte budget/);
});
test('validation/projection are detached and document versions obey bounded append-only history',()=>{
  const p=document(),saved=structuredClone(p),validated=validateConsequence(p);validated.extent.wider.assumptions.push('New assertion');assert.deepEqual(p,saved);
  const f=fixture();for(let i=0;i<20;i++){const p=document();p.capability=`Declared version ${i}`;f.send('consequence.documented',p);}const before=structuredClone(f.state);assert.throws(()=>f.send('consequence.documented',document()),/history budget/);assert.deepEqual(f.state,before);assert.equal(latest(f.state).consequence.document.capability,'Declared version 19');assert.equal(f.state.cases[0].consequenceHistory[0].document.capability,'Declared version 0');
});
