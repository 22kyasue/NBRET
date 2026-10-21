import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readerModel} from '../src/practice/reader-model.mjs';

const hash='a'.repeat(64),evidenceId='observation-one';
function fixture(){
  const observation={id:evidenceId,outcome:'complete',action:{kind:'order',actor:'alice',objectId:'WO-S201'},identity:{principal:'alice',tenant:'north',role:'member'},environment:{id:'run',sourceHash:'source'},request:{actor:'alice',method:'GET',path:'/api/work-orders/WO-S201'},response:{status:404,representation:'json',bodyBytes:17,bodySha256:'b'.repeat(64),value:{error:'not_found'}},setupReceipts:[]};
  const record={id:'case-one',title:'Could the supplied account read a foreign record?',substatus:'owner-inconclusive',interpretation:'Declared interpretation; independent effect not established',impactType:'exposure',observed:'Error-only denial; no foreign contents observed',expected:'Foreign contents unavailable',demonstratedConsequence:'No unauthorized disclosure demonstrated',potentialConsequences:'Exposure if an untested boundary fails',uncertainties:'Other cases untested',suggestedRepair:'No repair established',manualVerification:'Review the actual response and own-record control',identity:observation.identity,environment:{sourceHash:'source'},basisEvidenceIds:[evidenceId],gates:[{eventId:'gate',passed:true,reasons:[],evidenceIds:[evidenceId],receipts:[{id:evidenceId,action:observation.action,identity:observation.identity,environment:observation.environment,observation}]}],reviews:[{eventId:'review',gateEventId:'gate',reviewerId:'declared-reviewer',verdict:'supported',evidenceIds:[evidenceId],objections:['Independence unauthenticated'],notes:'Selected case only'}],ownerVerifications:[{eventId:'owner',gateEventId:'gate',reviewEventId:'review',result:'inconclusive',evidenceIds:[evidenceId],notes:'Not independently reproduced',environment:observation.environment}],retestPlans:[],retests:[]};
  const document={caseId:record.id,capability:'The selected foreign read was denied',whyPossible:'The selected request reached the organization boundary',severity:{level:'unknown',rationale:'No harm established'},extent:{demonstrated:{description:'One selected denial',evidenceIds:[evidenceId]},wider:{description:'No wider reach established',evidenceIds:[],assumptions:['Other conditions untested']}},accessEffort:{level:'unknown',rationale:'Supplied account'},repair:{immediate:'No repair established',broaderRule:'Preserve organization ownership',legitimateFlowEffects:'Own records remain readable',acceptanceChecks:['Compare original, related and legitimate controls'],effort:{level:'unknown',rationale:'No estimate supplied'}},sequence:[{id:'one',explanation:'Inspect the recorded denial',evidenceIds:[evidenceId],screenshots:[{artifactId:'png-'+hash,sha256:hash,caption:'Existing retained image reference'}],expected:'No foreign contents',current:'Error-only response',proposedRepaired:'Proposed rule only, not a repair result'}],nextInvestigation:{extendDemonstratedPath:'First establish any unauthorized effect',resolveFixUncertainty:'No fix established to retest'}};
  record.consequence={document,stale:false};
  return {id:'run',revision:4,target:{origin:'http://127.0.0.1:50000',sourceHash:'source',actors:[{id:'anonymous',tenant:null,role:'anonymous'},{id:'alice',tenant:'north',role:'member'},{id:'bob',tenant:'south',role:'member'}]},scope:{tracks:'accounts',enabledActors:['alice'],executionBoundary:'owned-synthetic-app-only'},intake:{requestedUrl:'https://requested.invalid/',context:['Synthetic exercise'],businessRules:['Organization ownership']},limitations:['Selected cases only'],stopReason:'Clean stopped example',observations:[observation],caseSummary:{verifiedFindings:[],issuesNeedingOwnerAction:[],unconfirmedLeads:[record]},ownerRequests:[{id:'request',question:'Clarify untested policy',reason:'Missing context',evidenceIds:[evidenceId],status:'pending',resolutions:[]}],screenshotArtifacts:[{artifactId:'png-'+hash,sha256:hash,mediaType:'image/png',bytes:68,evidenceId,caption:'Existing image'}]};
}

test('reader model is detached, read-only, explicit metadata and preserves a denied question without promotion',t=>{
  t.mock.method(http,'request',()=>{throw new Error('Projection must not contact any target');});
  t.mock.method(http.Server.prototype,'listen',()=>{throw new Error('Projection must not create listeners');});
  const s=fixture(),before=structuredClone(s),model=readerModel(s);
  assert.deepEqual(s,before);assert.deepEqual(Object.keys(model),['schemaVersion','id','revision','subject','scope','observations','issues','ownerRequests']);
  assert.equal(model.subject.company,'Not supplied');assert.equal(model.subject.application,'Not supplied');assert.equal(model.subject.date,'Not supplied');
  assert.equal(model.subject.website,s.target.origin);assert.equal(model.subject.requestedWebsite,s.intake.requestedUrl);assert.notEqual(model.subject.website,model.subject.requestedWebsite);
  assert.deepEqual(model.scope.accounts,[{id:'alice',tenant:'north',role:'member'}]);assert.equal(model.issues[0].title,s.caseSummary.unconfirmedLeads[0].title);assert.equal(model.issues[0].category,'unconfirmedLeads');assert.equal(model.issues[0].status,'owner-inconclusive');
  assert.match(model.issues[0].demonstratedConsequence,/No unauthorized/);assert.equal(model.issues[0].consequence.retest.actual,null);assert.match(model.issues[0].consequence.extent.widerSupport,/unsupported/);
  model.observations[0].response.value.error='changed';model.issues[0].history.gates[0].receipts[0].observation.response.value.error='changed-again';model.issues[0].consequence.sequence[0].current='invented';model.ownerRequests[0].question='changed';assert.deepEqual(s,before);
});

test('plain-language briefing preserves technical evidence and categories while excluding extra fields',()=>{
  const s=fixture(),c=s.caseSummary.unconfirmedLeads[0];
  c.readerBriefing={title:'A plain-language question',risk:'Conditional harm only',evidence:'The request was denied',fix:'No repair established',credentials:'PRIVATE_BRIEFING_CANARY'};
  c.readerBriefingJa={title:'確認した事実',risk:'未実証の被害',evidence:'アクセス拒否',fix:'修正未実施',token:'PRIVATE_JA_CANARY'};
  const before=structuredClone(s),m=readerModel(s),issue=m.issues[0];
  assert.deepEqual(issue.readerBriefing,{title:c.readerBriefing.title,risk:c.readerBriefing.risk,evidence:c.readerBriefing.evidence,fix:c.readerBriefing.fix});
  assert.equal(issue.title,c.title);assert.equal(issue.observed,c.observed);assert.equal(issue.category,'unconfirmedLeads');
  assert.deepEqual(issue.readerBriefingJa,{title:'確認した事実',risk:'未実証の被害',evidence:'アクセス拒否',fix:'修正未実施'});assert.ok(!JSON.stringify(m).includes('PRIVATE_JA_CANARY'));
  assert.ok(!JSON.stringify(m).includes('PRIVATE_BRIEFING_CANARY'));issue.readerBriefing.title='Changed';assert.deepEqual(s,before);
});

test('allowlisted runtime, observation, identity and history fields exclude private envelopes and precomputed hrefs',()=>{
  const s=fixture(),privateText='PRIVATE_RUNTIME_CANARY';
  s.nonce=privateText;s.credentials={password:privateText};s.outDir=privateText;s.workspaceUrl=privateText;s.authorization={credentials:privateText};
  s.target.credentials=privateText;s.target.actors[1].password=privateText;
  s.observations[0].credentials=privateText;s.observations[0].request.headers={authorization:privateText};s.observations[0].response.headers={'set-cookie':privateText};s.observations[0].identity.token=privateText;
  const c=s.caseSummary.unconfirmedLeads[0];c.outDir=privateText;c.reviews[0].nonce=privateText;c.gates[0].receipts[0].credentials=privateText;c.ownerVerifications[0].environment.outDir=privateText;
  s.ownerRequests[0].credentials=privateText;s.consequenceOverview={entries:[{href:'https://evil.invalid/'+privateText}]};c.consequence.href='javascript:'+privateText;
  const model=readerModel(s);assert.ok(!JSON.stringify(model).includes(privateText));assert.deepEqual(model.observations[0].response.value,{error:'not_found'});
  assert.equal(model.issues[0].consequence.screenshots[0].href,'/artifacts/png-'+hash);
});

test('screenshots require registered content addressing, matching digest and step evidence; exported links are relative',()=>{
  const s=fixture();assert.equal(readerModel(s,{exported:true}).issues[0].consequence.screenshots[0].href,'screenshots/png-'+hash+'.png');
  for(const change of [v=>v.screenshotArtifacts=[],v=>v.screenshotArtifacts[0].sha256='b'.repeat(64),v=>v.screenshotArtifacts[0].evidenceId='different',v=>v.screenshotArtifacts[0].artifactId='unregistered',v=>v.screenshotArtifacts[0].mediaType='text/html']){
    const v=fixture();change(v);assert.equal(readerModel(v).issues[0].consequence.screenshots[0].href,null);
  }
  s.screenshotArtifacts[0].href='https://evil.invalid/';assert.ok(!JSON.stringify(readerModel(s)).includes('evil.invalid'));
});

test('recorded transport completeness and timing survive recursively without extra transport fields',()=>{
  const s=fixture(),o=s.observations[0];
  const setup=structuredClone(o);setup.id='setup-observation';setup.transport={complete:false,elapsedMs:12.5,headers:{authorization:'PRIVATE_TRANSPORT_CANARY'}};
  o.setupReceipts=[setup];o.transport={complete:true,elapsedMs:0,nonce:'PRIVATE_TRANSPORT_CANARY'};
  const model=readerModel(s);
  assert.deepEqual(model.observations[0].transport,{complete:true,elapsedMs:0});
  assert.deepEqual(model.observations[0].setupReceipts[0].transport,{complete:false,elapsedMs:12.5});
  assert.deepEqual(model.issues[0].history.gates[0].receipts[0].observation.transport,{complete:true,elapsedMs:0});
  assert.ok(!JSON.stringify(model).includes('PRIVATE_TRANSPORT_CANARY'));
  model.observations[0].setupReceipts[0].transport.complete=true;
  assert.equal(s.observations[0].setupReceipts[0].transport.complete,false);
});

test('missing and stale consequence documents remain explicit; histories, owner contradiction and categories survive',()=>{
  const s=fixture(),c=s.caseSummary.unconfirmedLeads[0];c.consequence.stale=true;
  const model=readerModel(s);assert.equal(model.issues[0].consequence.documentation,'stale');assert.equal(model.issues[0].consequence.priority.tier,'needs-documentation');assert.equal(model.issues[0].history.ownerVerifications[0].result,'inconclusive');
  delete c.consequence;assert.equal(readerModel(s).issues[0].consequence,null);
  const second=structuredClone(c);second.id='case-two';second.substatus='awaiting-owner-verification';s.caseSummary.issuesNeedingOwnerAction.push(second);
  assert.deepEqual(readerModel(s).issues.map(i=>i.category),['issuesNeedingOwnerAction','unconfirmedLeads']);assert.equal(readerModel(s).issues.filter(i=>i.category==='verifiedFindings').length,0);
});

test('only explicit metadata is used; unsafe URLs and malformed inert data fail without executing getters',()=>{
  const s=fixture();s.subject={company:'Supplied company',application:'Supplied application',date:'2026-10-18',website:'https://wrong.invalid/'};
  const model=readerModel(s);assert.equal(model.subject.company,'Supplied company');assert.equal(model.subject.date,'2026-10-18');assert.equal(model.subject.website,s.target.origin);
  s.target.origin='https://user:SECRET@example.invalid/';s.intake.requestedUrl='https://example.invalid/?token=SECRET';const rejected=readerModel(s);assert.equal(rejected.subject.website,'Not supplied');assert.equal(rejected.subject.requestedWebsite,'Not supplied');assert.ok(!JSON.stringify(rejected).includes('SECRET'));
  let reads=0;const getter={get caseSummary(){reads++;return {};}};assert.throws(()=>readerModel(getter),/inert snapshot/);assert.equal(reads,0);
  const nested=fixture();Object.defineProperty(nested.observations[0].response,'value',{enumerable:true,get(){reads++;return {};}});assert.throws(()=>readerModel(nested),/inert snapshot/);assert.equal(reads,0);
  assert.throws(()=>readerModel(fixture(),{get exported(){reads++;return false;}}),/inert snapshot/);assert.equal(reads,0);
  const sparse=fixture();sparse.observations=Array(1);assert.throws(()=>readerModel(sparse),/inert snapshot/);
  const duplicate=fixture();duplicate.caseSummary.issuesNeedingOwnerAction.push(duplicate.caseSummary.unconfirmedLeads[0]);assert.throws(()=>readerModel(duplicate),/inert snapshot/);
  assert.throws(()=>readerModel(fixture(),{exported:'yes'}),/inert snapshot/);
});
