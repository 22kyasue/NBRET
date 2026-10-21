import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {createWorkbench,readWorkbench} from '../src/practice/workbench.mjs';
import {readJournal,createJournal,appendEvent} from '../src/investigation/journal.mjs';

// Acceptance of the owned ordinary app and retained declarations only. These
// tests do not seed vulnerabilities, admit a scorer or demonstrate a repair.
async function fixture(t,options={}){
  const root=await mkdtemp(join(tmpdir(),'nbret-workflow-acceptance-')),sessions=[];
  t.after(async()=>{for(const s of sessions.reverse())await s.close();await rm(root,{recursive:true,force:true});});
  const start=async(options={})=>{const s=await createWorkbench({outDir:join(root,randomUUID()),...options});sessions.push(s);return s;};
  const resume=async(s,execution=false)=>{const next=await createWorkbench({resumeFrom:s.outDir,resumeExecution:execution});sessions.push(next);return next;};
  return{root,start,resume,session:await start(options)};
}
const call=(s,method,body)=>s[method]({expectedRevision:s.state().revision,...body});
const step=(s,action,evidenceIds=[])=>call(s,'step',{proposal:{question:'What does this owned observation establish?',reason:'Selected ordinary functionality acceptance check',action,evidenceIds}});
const ce=(s,type,payload)=>call(s,'recordCase',{event:{id:randomUUID(),type,payload}});
async function evidence(s){
  await step(s,{kind:'profile',actor:'alice'});const basis=s.state().observations.at(-1);
  await step(s,{kind:'orders',actor:'alice'});const control=s.state().observations.at(-1);
  const record=control.response.value.orders.find(o=>o.owner==='alice'&&o.state==='draft');assert.ok(record);
  await step(s,{kind:'order',actor:'alice',objectId:record.id},[control.id]);
  return{basis,control,related:s.state().observations.at(-1),record};
}
function candidate(s,e,id='ordinary-profile'){
  return{id,title:'Ordinary profile policy question <local>',question:'Does the observed profile match the supplied identity?',authorId:'declared-author',basisEvidenceIds:[e.basis.id],identity:e.basis.identity,environment:{sourceHash:s.state().target.sourceHash},expected:'An authenticated own profile',observed:'The retained own profile response',demonstratedConsequence:'Own synthetic profile returned; no unauthorized effect demonstrated',potentialConsequences:'Any wider consequence is untested',uncertainties:'Only selected owned checks observed',suggestedRepair:'No repair asserted; owner can investigate unanswered policy questions',manualVerification:'Recheck the cited identity and ordinary controls',impactType:'other'};
}
const gate=(s,e,caseId='ordinary-profile')=>ce(s,'evidence.filtered',{caseId,positiveControlIds:[e.control.id]});
const reviewCase=(s,e,verdict='supported',caseId='ordinary-profile')=>ce(s,'review.recorded',{caseId,reviewerId:'different-declared-label',verdict,evidenceIds:[e.basis.id,e.control.id],objections:['Same-app records do not establish independent effect truth'],notes:'Review of this declared question only'});

test('proof records persist, do not execute, and become stale after a new gate or review',async t=>{
  const {session:s}=await fixture(t,{scope:{permitTransitions:false}});
  while(s.state().proposal&&!s.state().stopped)await s.step({expectedRevision:s.state().revision});
  const state=s.state(),attempt=state.observations.find(o=>o.action.kind==='order'&&o.action.actor==='alice'&&o.response.status===404);
  const control=state.observations.find(o=>o.action.kind==='order'&&o.action.actor==='bob'&&o.action.objectId===attempt.action.objectId&&o.response.status===200);
  const profiles=['alice','bob'].map(actor=>state.observations.find(o=>o.action.kind==='profile'&&o.action.actor===actor));
  const e={basis:attempt,control},caseId='proof-case';await ce(s,'candidate.created',candidate(s,e,caseId));await gate(s,e,caseId);
  const plan={caseId,claim:'Selected foreign object read',kind:'cross-tenant-object-read',attemptId:attempt.id,controlId:control.id,actorProfileId:profiles[0].id,ownerProfileId:profiles[1].id};
  const count=s.state().targetRequestCount;await call(s,'recordProof',{plan});
  assert.equal(s.state().proofProgress[0].status,'not-demonstrated');assert.equal(s.state().targetRequestCount,count);assert.deepEqual(s.state().caseSummary.verifiedFindings,[]);
  await reviewCase(s,e,'supported',caseId);assert.equal(s.state().proofProgress[0].status,'stale');
  await call(s,'recordProof',{plan});assert.equal(s.state().proofProgress[0].status,'not-demonstrated');
  await gate(s,e,caseId);assert.equal(s.state().proofProgress[0].status,'stale');
  assert.equal(s.state().proofProgress[0].history.length,2);assert.deepEqual((await readWorkbench(s.outDir)).proofProgress,s.state().proofProgress);
  await assert.rejects(call(s,'recordProof',{plan:{...plan,caseId:'unknown'}}),/existing case/);assert.equal(s.state().targetRequestCount,count);
});

test('actual evidence drives retained gate/review/owner histories and honest nonrepair retest sections',async t=>{
  const {session:s,start}=await fixture(t);
  // A real typed request blocked before discovery supplies actual incomplete evidence.
  await step(s,{kind:'profile',actor:'alice'});const first=s.state().observations.at(-1);
  await step(s,{kind:'order',actor:'alice',objectId:'WO-N101'},[first.id]);
  const incomplete=s.state().observations.at(-1);assert.equal(incomplete.outcome,'incomplete');assert.equal(incomplete.actionReached,false);
  const e=await evidence(s);await ce(s,'candidate.created',candidate(s,e));
  await ce(s,'evidence.filtered',{caseId:'ordinary-profile',positiveControlIds:['not-collected']});
  assert.equal(s.state().caseSummary.unconfirmedLeads[0].substatus,'evidence-rejected');
  await gate(s,e);await reviewCase(s,e,'rejected');assert.equal(s.state().caseSummary.unconfirmedLeads[0].substatus,'review-rejected');
  await reviewCase(s,e);await ce(s,'owner.verified',{caseId:'ordinary-profile',result:'reproduced',evidenceIds:[e.basis.id],notes:'Owner declared the selected own-profile observation reproduced'});
  assert.equal(s.state().caseSummary.issuesNeedingOwnerAction[0].substatus,'owner-declared-reproduced');
  await ce(s,'owner.verified',{caseId:'ordinary-profile',result:'not-reproduced',evidenceIds:[e.basis.id],notes:'Later owner declaration could not reproduce; absence is not repair proof'});
  let state=s.state();assert.equal(state.caseSummary.issuesNeedingOwnerAction.length,0);assert.equal(state.caseSummary.unconfirmedLeads[0].substatus,'owner-not-reproduced');
  assert.deepEqual(Object.keys(state.caseSummary).sort(),['issuesNeedingOwnerAction','unconfirmedLeads','verifiedFindings']);assert.deepEqual(state.caseSummary.verifiedFindings,[]);
  assert.equal(state.casebook.cases[0].gates.length,2);assert.equal(state.casebook.cases[0].reviews.length,2);assert.equal(state.casebook.cases[0].ownerVerifications.length,2);
  await ce(s,'retest.planned',{caseId:'ordinary-profile',originalEvidenceIds:[e.basis.id],relatedEvidenceIds:[e.related.id],legitimateControlIds:[e.control.id]});
  await ce(s,'retest.recorded',{caseId:'ordinary-profile',evidenceIds:[e.basis.id,e.control.id,e.related.id],notes:'Same build and reused evidence; deliberately not a repair demonstration'});
  assert.match(s.state().casebook.cases[0].retests.at(-1).reasons.join(' '),/Build unchanged/);
  await ce(s,'retest.recorded',{caseId:'ordinary-profile',evidenceIds:[incomplete.id],notes:'Incomplete attempted collection is retained, not treated as absence'});
  assert.match(s.state().casebook.cases[0].retests.at(-1).reasons.join(' '),/incomplete/);
  const other=await start(),retained=await evidence(other);await other.stop('Clean retained same-source comparison');
  const before=s.state().targetRequestCount;await call(s,'attachEvidence',{directory:other.outDir});
  const imported=s.state().observations.find(o=>o.id===retained.basis.id);assert.ok(imported.sourceImport);assert.match(imported.sourceImport.authority,/unverified/);
  await assert.rejects(step(s,{kind:'profile',actor:'alice'},[retained.basis.id]),/imported|Historical/);assert.equal(s.state().targetRequestCount,before);
  await ce(s,'retest.recorded',{caseId:'ordinary-profile',evidenceIds:[retained.basis.id,retained.control.id,retained.related.id],notes:'Retained separate-session evidence on unchanged app source'});
  state=s.state();assert.equal(state.casebook.cases[0].retests.at(-1).status,'incomplete-or-mismatched');assert.match(state.casebook.cases[0].retests.at(-1).reasons.join(' '),/Build unchanged/);
  assert.deepEqual((await readWorkbench(s.outDir)).casebook,state.casebook);assert.deepEqual(state.caseSummary.verifiedFindings,[]);
});

test('immutable scope and owner resolutions narrow actual traffic without granting new permissions',async t=>{
  const original=http.request,captured=[];
  t.mock.method(http,'request',function(url,options,callback){captured.push({url:new URL(url).href,method:options.method});return original.call(this,url,options,callback);});
  const {session:s,start}=await fixture(t,{scope:{tracks:'anonymous',permitTransitions:false},intake:{url:'https://uncontacted.invalid/',context:[],businessRules:[]}});
  assert.match(s.state().intake.executionAuthority,/none/);assert.equal(s.state().targetRequestCount,0);
  await s.step({expectedRevision:s.state().revision});await s.step({expectedRevision:s.state().revision});
  const scope=structuredClone(s.state().scope),before=s.state().targetRequestCount;assert.equal(before,2);
  const detached=s.state();detached.scope.enabledActors.push('alice');detached.scope.permitTransitions=true;assert.deepEqual(s.state().scope,scope,'returned data cannot mutate operating scope');
  await call(s,'request',{operation:'record',question:'Please add account access',reason:'Explicit unsupported request, no permission granted'});
  const request=s.state().ownerRequests.find(r=>r.question==='Please add account access');
  await call(s,'request',{operation:'resolve',requestId:request.id,resolverId:'declared-owner',resolution:'Discussed; this record cannot widen immutable scope'});
  assert.equal(s.state().requests.find(r=>r.id===request.id).status,'resolved');assert.deepEqual(s.state().scope,scope);
  await assert.rejects(call(s,'request',{operation:'resolve',requestId:request.id,resolverId:'declared-owner',resolution:'Duplicate'}),/Pending/);
  await assert.rejects(step(s,{kind:'profile',actor:'alice'}),/scope/);assert.equal(s.state().targetRequestCount,before);
  const accounts=await start({scope:{tracks:'accounts',permitTransitions:false}});await accounts.step({expectedRevision:0});
  assert.equal(accounts.state().observations[0].identity.principal,'alice');const n=accounts.state().targetRequestCount;
  await assert.rejects(step(accounts,{kind:'page',actor:'anonymous'}),/scope/);
  await assert.rejects(step(accounts,{kind:'transition',actor:'alice',objectId:'WO-N101',transition:'submit'},[accounts.state().observations[0].id]),/scope/);
  assert.equal(accounts.state().targetRequestCount,n);
  const receipts=[...(await s.stop('Scope review')).targetRequestLog,...(await accounts.stop('Scope review')).targetRequestLog];
  assert.equal(captured.length,receipts.length);assert.ok(captured.every(r=>new URL(r.url).hostname==='127.0.0.1'));
  assert.deepEqual(receipts.map(r=>r.path),['/','/api/work-orders','/api/me']);
});

function comparison(){
  const contract={scope:'selected ordinary fixture population',access:'same provided accounts',budget:'equal declared budget',assistance:'same declared assistance',familiarity:'guided',eligibilityVersion:'population-v1',targetVersion:'fixture-source',scorerVersion:'declared-scorer-v1'};
  const counts={eligible:4,demonstrated:1,notDemonstrated:1,inconclusive:1,unsupported:1,unscored:0};
  const arm=(id,kind,version)=>({id,kind,version,operatorId:kind==='manual'?'declared-manual-owner':'declared-candidate-owner',contract:{...contract},counts:{...counts},metric:{name:'declared-person-minutes',unit:'minutes',value:10}});
  return{baseline:arm('baseline','manual','manual-v1'),candidate:arm('candidate','candidate','candidate-v1'),protocol:{id:'protocol-no-improvement',frozen:true,contract:{...contract},baselineVersion:'manual-v1',candidateVersion:'candidate-v1',metric:{name:'declared-person-minutes',unit:'minutes',direction:'lower',minImprovement:1},admission:{status:'externally-asserted',reference:'fixture metadata only; not authenticated'},baselineOwner:{id:'declared-manual-owner',qualification:'expert',reference:'fixture assertion only; expertise not authenticated'}}};
}
test('declared effort, valid no-improvement arithmetic, teaching, seeded audit and exports retain actual records',async t=>{
  const {session:s}=await fixture(t);assert.equal(s.state().progress.effort.totalPersonMinutes,null);
  const e=await evidence(s);await ce(s,'candidate.created',candidate(s,e));
  await ce(s,'evidence.filtered',{caseId:'ordinary-profile',positiveControlIds:['uncollected']});
  await assert.rejects(step(s,{kind:'profile',actor:'not-an-actor'}));
  await call(s,'recordEffort',{effort:{id:'effort-review',person:'declared-operator',stage:'review',minutes:7}});
  assert.equal(s.state().progress.effort.totalPersonMinutes,7);assert.equal(s.state().progress.effort.reviewerPersonMinutes,7);assert.match(s.state().progress.effort.accounting,/unreported.*unknown/);
  await call(s,'evaluate',{comparison:comparison()});const result=s.state().evaluations[0].result;
  assert.equal(result.status,'fail');assert.equal(result.delta,0);assert.equal(result.comparable,true);assert.equal(result.superiorityEstablished,false);assert.equal(result.admission,'externally-asserted-unverified');assert.equal(result.candidateCounts.inconclusive,1);
  assert.equal(Object.is(result.improvement,-0),false,'no-improvement arithmetic must be persistable canonical JSON');
  await call(s,'iteration',{iteration:{id:'iteration-1',failureStage:'review',previousVersion:'old',candidateVersion:'proposed',change:'Improve completeness checks',predictedBenefit:'Fewer unsupported claims',protocolId:'protocol-no-improvement',regressionLimits:['Preserve positive controls'],rollbackCriterion:'Reject increased unsupported claims',heldOutPlan:'Pending protected evaluation; not executed'}});
  await assert.rejects(call(s,'recordNote',{note:{kind:'teaching',question:'Why?',answer:'Unsupported answer',evidenceIds:['absent']}}),/complete/);
  await call(s,'recordNote',{note:{kind:'teaching',question:'What was observed?',answer:'An own synthetic profile; no unauthorized consequence established',evidenceIds:[e.basis.id]}});
  await call(s,'recordNote',{note:{kind:'escalation',caseId:'ordinary-profile',reason:'Owner clarification of declared policy',priority:'normal'}});
  await call(s,'rejectionAudit',{seed:'frozen-local-seed',count:10});await call(s,'rejectionAudit',{seed:'frozen-local-seed',count:10});
  const samples=s.state().auditSamples;assert.equal(samples[0].denominator,2);assert.equal(samples[0].sampled,2);assert.deepEqual(samples[0],samples[1]);
  await s.stop('Export an inspectable completed local record');const state=s.state(),paths=await s.exportReport(),saved=JSON.parse(await readFile(paths.jsonPath,'utf8')),html=await readFile(paths.htmlPath,'utf8');
  for(const key of ['casebook','caseSummary','effort','evaluations','iterations','auditSamples','teachBacks','escalations'])assert.deepEqual(saved[key],state[key],key);
  assert.match(html,/Ordinary profile policy question/);assert.match(html,/declared-operator/);assert.match(html,/An own synthetic profile/);assert.doesNotMatch(html,/<local>/);
  const executive=await readFile(paths.executivePath,'utf8');assert.match(executive,/Ordinary profile policy question/);assert.match(executive,/No independently admitted effect evidence/);assert.doesNotMatch(executive,/<local>/);
  assert.deepEqual(saved.caseSummary.verifiedFindings,[]);assert.match(saved.teachBacks[0].grading,/not automatically graded/);assert.equal(saved.iterations[0].execution,'inert-proposal-only');
});

test('clean stopped record continuation permits annotations and export with no target execution',async t=>{
  const {session:s,resume}=await fixture(t);const e=await evidence(s),stopped=await s.stop('Record-only continuation');
  const resumed=await resume(s);assert.equal(resumed.state().recordContinuation,true);assert.equal(resumed.state().stopped,true);
  const original=http.request;let network=0;t.mock.method(http,'request',function(...args){network++;return original.apply(this,args);});
  await assert.rejects(resumed.step({expectedRevision:resumed.state().revision}),/stopped/);
  await call(resumed,'recordNote',{note:{kind:'teaching',question:'What remains unknown?',answer:'These saved observations have limited coverage',evidenceIds:[e.basis.id]}});
  await resumed.exportReport();assert.equal(network,0);assert.equal(resumed.state().targetRequestCount,stopped.targetRequestCount);assert.equal(resumed.state().teachBacks.length,1);
});

test('explicit owned resume preserves changed state, rotates credentials and discovery epoch, and spends original action budget',async t=>{
  const captured=[],original=http.request;t.mock.method(http,'request',function(url,options,callback){if(options.headers.authorization)captured.push(options.headers.authorization);return original.call(this,url,options,callback);});
  const {session:s,resume}=await fixture(t,{scope:{maxActions:8}}),e=await evidence(s);
  await step(s,{kind:'transition',actor:'alice',objectId:e.record.id,transition:'submit'},[e.related.id]);
  const stopped=await s.stop('Explicit owned resume checkpoint');assert.equal(stopped.decisions.length,4);
  const checkpoint=await readFile(join(s.outDir,stopped.checkpoint.file),'utf8');for(const secret of captured)assert.ok(!checkpoint.includes(secret.slice(7)));
  const resumed=await resume(s,true),initial=resumed.state();assert.notEqual(initial.currentEpoch,stopped.currentEpoch);assert.equal(initial.scope.maxActions,8);assert.equal(initial.recordContinuation,false);assert.equal(initial.usage.requestCount,stopped.usage.requestCount);
  assert.equal(initial.proposal.action.kind,'page','fresh selector bootstrap must not reuse historical discovery');
  const count=initial.targetRequestCount;await assert.rejects(step(resumed,{kind:'order',actor:'alice',objectId:e.record.id},[e.related.id]),/Historical/);assert.equal(resumed.state().targetRequestCount,count);
  await step(resumed,{kind:'profile',actor:'alice'});const freshProfile=resumed.state().observations.at(-1);assert.equal(freshProfile.environment.id,initial.currentEpoch);
  assert.ok(captured[0]!==captured.at(-1),'ephemeral bearer credential must rotate');
  const beforeUnknown=resumed.state().targetRequestCount;await step(resumed,{kind:'order',actor:'alice',objectId:e.record.id},[freshProfile.id]);
  assert.equal(resumed.state().observations.at(-1).errorCode,'NBRET_PRACTICE_OBJECT_NOT_OBSERVED');assert.equal(resumed.state().targetRequestCount,beforeUnknown);
  await step(resumed,{kind:'orders',actor:'alice'},[freshProfile.id]);const freshList=resumed.state().observations.at(-1);assert.equal(freshList.response.value.orders.find(o=>o.id===e.record.id).state,'submitted');
  await step(resumed,{kind:'order',actor:'alice',objectId:e.record.id},[freshList.id]);assert.equal(resumed.state().observations.at(-1).response.value.order.state,'submitted');
  const ceiling=resumed.state();assert.equal(ceiling.decisions.length,8);assert.ok(ceiling.usage.requestCount>stopped.usage.requestCount);
  await resumed.step({expectedRevision:ceiling.revision});assert.equal(resumed.state().stopped,true);assert.equal(resumed.state().targetRequestCount,ceiling.targetRequestCount);
  assert.equal(resumed.state().decisions.length,8);assert.deepEqual(resumed.state().targetRequestLog.slice(0,stopped.targetRequestCount),stopped.targetRequestLog);
  for(const secret of captured)assert.ok(!JSON.stringify(await readWorkbench(s.outDir)).includes(secret.slice(7)));
});

test('checkpoint byte/source tamper and expired original lifetime reject before target creation',async t=>{
  const {session:s,root}=await fixture(t);await evidence(s);const stopped=await s.stop('Tamper fixtures owned by this test');
  const file=join(s.outDir,stopped.checkpoint.file),bytes=await readFile(file);await writeFile(file,Buffer.concat([bytes,Buffer.from(' ')]));
  let requests=0;const original=http.request;t.mock.method(http,'request',function(...args){requests++;return original.apply(this,args);});
  await assert.rejects(createWorkbench({resumeFrom:s.outDir,resumeExecution:true}),/Checkpoint bytes changed/);await writeFile(file,bytes);
  // Validly hash-bound fixture journals distinguish a wrong source from a raw
  // byte inconsistency. This is not resistance to a malicious same-account writer.
  const snapshot=await readJournal(join(s.outDir,'journal'));
  async function clonedStopped(name,manifestChange={},checkpointChange=null,usage=null){
    const directory=join(root,name);await mkdir(directory);let journal=await createJournal(join(directory,'journal'),{...snapshot.manifest,...manifestChange});
    for(const event of snapshot.events){let value=event;if(event.type==='stopped'&&checkpointChange){const changed={...JSON.parse(bytes),...checkpointChange},content=JSON.stringify(changed);await writeFile(join(directory,event.checkpoint.file),content);value={...event,checkpoint:{file:event.checkpoint.file,sha256:createHash('sha256').update(content).digest('hex')}};}if(event.type==='stopped'&&usage)value={...value,usage};journal=await appendEvent(join(directory,'journal'),value,{expectedRevision:journal.revision,expectedHead:journal.head});}
    return directory;
  }
  const wrongSource=await clonedStopped('wrong-source',{}, {sourceHash:'0'.repeat(64)});
  await assert.rejects(createWorkbench({resumeFrom:wrongSource,resumeExecution:true}),error=>error.code==='NBRET_PRACTICE_CONFIGURATION_REJECTED');
  const expired=await clonedStopped('expired',{createdAt:'2000-01-01T00:00:00.000Z'});
  await assert.rejects(createWorkbench({resumeFrom:expired,resumeExecution:true}),/unexpired/);
  for(const [name,usage] of [['requests-exhausted',{requestCount:57,executionMs:0}],['time-exhausted',{requestCount:0,executionMs:82001}]]){
    const exhausted=await clonedStopped(name,{}, {},usage);
    await assert.rejects(createWorkbench({resumeFrom:exhausted,resumeExecution:true}),/Insufficient original execution budget/);
  }
  assert.equal(requests,0);
});
