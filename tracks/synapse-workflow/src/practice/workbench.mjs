import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID,createHash } from 'node:crypto';
import { createJournal,appendEvent,readJournal } from '../investigation/journal.mjs';
import { outputDirectory } from '../investigation/output-path.mjs';
import { createPracticeTarget } from './session-target.mjs';
import { chooseNext } from './next-step.mjs';
import { normaliseScope,createIntake } from '../investigation/intake.mjs';
import { initialCasebook,applyCaseEvent,summarizeCasebook } from '../investigation/casebook.mjs';
import {consequenceOverview} from '../investigation/consequence-overview.mjs';
import {retainScreenshot,readScreenshot} from '../investigation/screenshot-artifact.mjs';
import { progressSummary,compareRuns,sampleRejected,validateIteration } from '../investigation/measurement.mjs';
import { readLocalJsonRecord } from '../investigation/local-input.mjs';
import {renderCaseSections,renderExecutiveReport} from './workflow-report.mjs';
export {renderExecutiveReport} from './workflow-report.mjs';
import {renderAssessmentReport} from './reader-report.mjs';
import {evaluateProof} from '../investigation/proof.mjs';
export {renderAssessmentReport} from './reader-report.mjs';

export const PURPOSE='Investigate one authorized business app, explain observations and possible business consequences, preserve evidence and objections, and return useful next actions for owner verification.';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function json(value,depth=0,count={n:0}) {
  if(++count.n>5000||depth>24)throw new Error('Input exceeds structure budget');
  if(value===null||typeof value==='boolean'||typeof value==='string'&&value.length<=12000||typeof value==='number'&&Number.isFinite(value))return value;
  if(!value||typeof value!=='object'||!(Array.isArray(value)?Object.getPrototypeOf(value)===Array.prototype:[Object.prototype,null].includes(Object.getPrototypeOf(value))))throw new Error('Plain JSON required');
  if(Object.getOwnPropertySymbols(value).length)throw new Error('Plain JSON required');
  const keys=Object.keys(value),names=Object.getOwnPropertyNames(value).filter(k=>!(Array.isArray(value)&&k==='length'));
  if(names.length!==keys.length||Array.isArray(value)&&(keys.length!==value.length||keys.some((k,i)=>k!==String(i))))throw new Error('Dense plain JSON required');
  const result=Array.isArray(value)?[]:{};
  for(const key of keys){const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!Object.hasOwn(d,'value')||['__proto__','constructor','prototype'].includes(key))throw new Error('Inert JSON fields required');result[key]=json(d.value,depth+1,count);}
  return result;
}
function exact(value,keys) {
  if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).some(k=>!keys.includes(k)))throw new Error('Unexpected or invalid command fields');
}
function text(value,max=2000){if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error('Bounded nonempty text required');return value;}
function action(value) {
  exact(value,['kind','actor','objectId','transition']);
  if(!['page','profile','orders','order','transition'].includes(value.kind)||!['anonymous','alice','bob','carol','dana'].includes(value.actor))throw new Error('Unsupported capability or actor');
  if(value.kind==='page'&&value.actor!=='anonymous')throw new Error('Page observation uses anonymous actor');
  if(['order','transition'].includes(value.kind)){if(!/^WO-[NS][0-9]{3}$/.test(value.objectId||''))throw new Error('Observed work-order ID required');}
  else if(Object.hasOwn(value,'objectId'))throw new Error('Object field outside capability');
  if(value.kind==='transition'){if(!['submit','approve'].includes(value.transition))throw new Error('Unsupported transition');}
  else if(Object.hasOwn(value,'transition'))throw new Error('Transition field outside capability');
  return value;
}

export function projectWorkbench(snapshot) {
  const state={id:snapshot.manifest.id,purpose:snapshot.manifest.purpose,target:snapshot.manifest.target,revision:snapshot.revision,head:snapshot.head,
    currentEpoch:snapshot.manifest.id,priority:'coverage',paused:false,stopped:false,stopReason:null,observations:[],decisions:[],rejectedProposals:[],requests:[],reviews:[],steering:[],unresolvedAttempts:[],
    limitations:snapshot.manifest.limitations,authorization:snapshot.manifest.authorization||null,scope:snapshot.manifest.scope||normaliseScope(),intake:snapshot.manifest.intake||null,effort:[],evaluations:[],iterations:[],auditSamples:[],teachBacks:[],escalations:[],requestResolutions:[],screenshotArtifacts:[],proofRecords:[]};
  let casebook=initialCasebook();
  const attempts=new Map(),decisions=new Map();
  for(const event of snapshot.events){
    if(event.type==='action.started'){attempts.set(event.proposal.id,event.proposal);decisions.set(event.proposal.id,{...event.proposal,status:'blocked',unresolved:true});}
    if(event.type==='action.finished'){attempts.delete(event.decision.id);decisions.set(event.decision.id,event.decision);if(event.observation)state.observations.push(event.observation);}
    if(event.type==='request.recorded'&&!state.requests.some(r=>r.id===event.request.id))state.requests.push(event.request);
    if(event.type==='request.resolved')state.requestResolutions.push(event.resolution);
    if(event.type==='effort.recorded')state.effort.push(event.effort);
    if(event.type==='evaluation.recorded')state.evaluations.push(event.evaluation);
    if(event.type==='iteration.recorded')state.iterations.push(event.iteration);
    if(event.type==='audit.sampled')state.auditSamples.push(event.sample);
    if(event.type==='teaching.recorded')state.teachBacks.push(event.note);
    if(event.type==='escalation.recorded')state.escalations.push(event.note);
    if(event.type==='evidence.imported')state.observations.push(...event.observations);
    if(event.type==='screenshot.retained')state.screenshotArtifacts.push(event.artifact);
    if(event.type==='proof.evaluated')state.proofRecords.push({...event.proof,eventId:event.id});
    if(event.type==='case.event')casebook=applyCaseEvent(casebook,event.caseEvent,{observations:state.observations,decisions:[...decisions.values()],environment:{id:state.id,sourceHash:state.target.sourceHash}});
    if(event.type==='review.recorded')state.reviews.push(event.review);
    if(event.type==='proposal.rejected')state.rejectedProposals.push({at:event.at,reason:event.reason,source:'session'});
    if(event.type==='priority.changed'){state.priority=event.priority;state.steering.push({at:event.at,priority:event.priority});}
    if(event.type==='paused')state.paused=true;
    if(event.type==='resumed')state.paused=false;
    if(event.type==='stopped'){state.stopped=true;state.stopReason=event.reason;state.targetClosed=event.targetClosed;state.targetRequestLog=event.targetRequestLog;state.targetRequestCount=event.targetRequestLog?.length;state.usage=event.usage||{requestCount:state.targetRequestCount||0,executionMs:0};state.checkpoint=event.checkpoint||null;}
    if(event.type==='target.resumed'){state.currentEpoch=event.epoch;state.target=event.target;state.stopped=false;state.paused=false;state.stopReason=null;state.targetClosed=false;state.checkpoint=null;}
  }
  state.decisions=[...decisions.values()];state.unresolvedAttempts=[...attempts.values()];
  state.casebook=casebook;state.caseSummary=summarizeCasebook(casebook);
  state.proofProgress=state.casebook.cases.map(c=>{
    const record=state.proofRecords.filter(p=>p.plan.caseId===c.id).at(-1),gate=c.gates.at(-1),review=c.reviews.filter(r=>r.gateEventId===gate?.eventId).at(-1);
    const stale=Boolean(record&&(record.gateEventId!==(gate?.eventId??null)||record.reviewEventId!==(review?.eventId??null)||record.sourceHash!==state.target.sourceHash||record.epoch!==state.currentEpoch));
    const result=record&&!stale?evaluateProof(record.plan,{observations:state.observations,environment:{sourceHash:state.target.sourceHash}}):null;
    return{caseId:c.id,status:stale?'stale':result?.status||'effect-not-evaluated',result,history:state.proofRecords.filter(p=>p.plan.caseId===c.id),nextAction:stale?'Re-evaluate against the current case gate, review and build.':!result?'Define the exact effect and collect matched controls before claiming it.':result.status==='inconclusive'?'Collect the named missing requirements through permitted capabilities; record any genuine boundary.':result.status==='not-demonstrated'?'This selected effect was not demonstrated. Continue other authorized hypotheses; do not infer a clean application.':'Effect established in these collected receipts only. Review scope, extent and repair; no wider compromise or independent verification is inferred.'};
  });
  state.consequenceOverview=consequenceOverview(state);
  state.requests=state.requests.map(r=>({...r,status:state.requestResolutions.some(v=>v.requestId===r.id)?'resolved':'pending',resolutions:state.requestResolutions.filter(v=>v.requestId===r.id)}));
  state.coverage={completeObservations:state.observations.filter(o=>o.outcome==='complete').length,incompleteObservations:state.observations.filter(o=>o.outcome==='incomplete').length,
    actorsObserved:[...new Set(state.observations.filter(o=>o.outcome==='complete').map(o=>o.identity?.principal).filter(Boolean))],
    objectsObserved:[...new Set(state.observations.flatMap(o=>o.response?.value?.orders||[o.response?.value?.order]).filter(Boolean).map(o=>o.id))],
    selectedActions:state.decisions.length,reviewedDecisions:[...new Set(state.reviews.map(r=>r.decisionId))].length};
  return state;
}

export async function readWorkbench(directory) {
  const snapshot=await readJournal(join(resolve(directory),'journal'));
  if(snapshot.manifest.kind!=='synapse-session-workbench')throw new Error('Not a session workbench journal');
  return projectWorkbench(snapshot);
}

export async function createWorkbench({outDir,scope,intake,resumeFrom,resumeExecution=false}={}) {
  if(typeof resumeExecution!=='boolean'||resumeExecution&&!resumeFrom)throw new Error('Explicit saved owned-target continuation required');
  const requestedBoundary=resumeFrom?null:normaliseScope(scope??intake?.scope??{}),requestedIntake=resumeFrom?null:intake?createIntake(intake):null;
  let root,target,saved,prior,carriedUsage={requestCount:0,executionMs:0},carriedLog=[];
  if(resumeFrom){
    if(outDir||scope||intake)throw new Error('Record continuation cannot replace scope or intake');
    root=resolve(resumeFrom);saved=await readJournal(join(root,'journal'));
    prior=projectWorkbench(saved);
    if(saved.manifest.kind!=='synapse-session-workbench'||!prior.stopped||prior.targetClosed!==true||prior.unresolvedAttempts.length)throw new Error('Only a clean-stopped journal can continue as records; inspect unresolved targets before recovery');
    if(resumeExecution){
      const created=Date.parse(saved.manifest.createdAt);
      if(!Number.isFinite(created)||Date.now()-created>30*60000||prior.decisions.length>=saved.manifest.maxActions||!prior.checkpoint||!/^checkpoint-[a-f0-9-]+\.json$/.test(prior.checkpoint.file))throw new Error('Owned target checkpoint, remaining original budget and unexpired scope required');
      const record=await readLocalJsonRecord(join(root,prior.checkpoint.file),65536);if(record.sha256!==prior.checkpoint.sha256)throw new Error('Checkpoint bytes changed');
      carriedUsage=prior.usage||{requestCount:prior.targetRequestCount||0,executionMs:0};carriedLog=prior.targetRequestLog||[];
      if(carriedUsage.requestCount>56||carriedUsage.executionMs>82000)throw new Error('Insufficient original execution budget for safe resumed admission');
      target=await createPracticeTarget({checkpoint:record.value});
    }else target={describe:()=>prior.target,get requestLog(){return structuredClone(prior.targetRequestLog||[]);},usage:()=>prior.usage||{requestCount:prior.targetRequestCount||0,executionMs:0},isListening:()=>false,close:async()=>{},execute:async()=>{throw new Error('Record continuation has no target executor');}};
  }else{
    if(typeof outDir!=='string'||!outDir)throw new Error('A new output directory is required');
    root=await outputDirectory(outDir);await mkdir(root,{recursive:false});target=await createPracticeTarget();
  }
  const boundary=saved?saved.manifest.scope||normaliseScope():requestedBoundary,planningIntake=saved?saved.manifest.intake:requestedIntake,journal=join(root,'journal');
  let snapshot,active=null,closing=null,stopRequested=false,faulted=false;
  try{
    snapshot=saved||await createJournal(journal,{schemaVersion:1,kind:'synapse-session-workbench',workflowVersion:1,id:`session-${randomUUID()}`,createdAt:new Date().toISOString(),purpose:PURPOSE,scope:boundary,intake:planningIntake,
      target:target.describe(),mode:'owned-guided-session',authority:'Only fixed local synthetic capabilities; role/state changes in this owned app are authorized for practice.',
      authorization:{kind:'owned-practice-only',reference:'Kotaro local build and practice instruction',targetOrigin:target.describe().origin,accounts:boundary.enabledActors,effects:boundary.permitTransitions?'synthetic reads and fixed submit/approve transitions':'synthetic reads only',evidence:{responseBytes:65536,retention:'local journal and private reports'},budgets:{maxActions:boundary.maxActions,maxRequests:60,cumulativeRequestExecutionMs:90000,sessionAdmissionMs:1800000},stopConditions:['owner stop','resource admission boundary','no eligible local frontier','configured diminishing useful progress pauses pickup']},
      limitations:['The built-in next-step selector uses deterministic observation-driven rules. It is not a model or learned investigator.',
        'A session-authored proposal is an operator declaration. Reviewer labels do not authenticate independent actors.',
        'Evidence is bounded and normalized; source hashes and same-app identity logs establish consistency, not trusted origin.',
        'No production scope, blind evaluation, expert superiority or absence-of-vulnerabilities claim. Retest records require real matched changed-build evidence.',
        'Journal hashes do not prevent this unrestricted local account rewriting history. A crashed in-memory target cannot be resumed under old evidence.'],maxActions:boundary.maxActions});
  }catch(error){await target.close();throw error;}
  const requestLog=()=>[...carriedLog,...target.requestLog];
  const usage=()=>{const now=target.usage?.()||{requestCount:target.requestLog.length,executionMs:0};return{requestCount:carriedUsage.requestCount+now.requestCount,executionMs:carriedUsage.executionMs+now.executionMs};};
  async function checkpoint(){
    if(!target.exportCheckpoint)return null;
    const value=target.exportCheckpoint(),bytes=JSON.stringify(value,null,2)+'\n',file=`checkpoint-${randomUUID()}.json`;
    await writeFile(join(root,file),bytes,{flag:'wx'});return{file,sha256:createHash('sha256').update(bytes).digest('hex')};
  }
  async function append(data) {
    try{snapshot=await appendEvent(journal,{id:randomUUID(),at:new Date().toISOString(),...data},{expectedRevision:snapshot.revision,expectedHead:snapshot.head});}
    catch(error){faulted=true;stopRequested=true;await target.close();throw error;}
  }
  function frontier(result,ignoreRuntimeStop=false){
    const observations=result.observations.filter(o=>!o.sourceImport&&(o.environment?.id||result.id)===result.currentEpoch);
    const decisions=result.decisions.filter(d=>(d.epoch||result.id)===result.currentEpoch).map(d=>({...d,id:d.selectorId||d.id}));
    const next=chooseNext({...result,observations,decisions,enabledActors:boundary.enabledActors,permitTransitions:boundary.permitTransitions,stopped:result.stopped||!ignoreRuntimeStop&&(stopRequested||faulted)});
    if(next.proposal&&result.currentEpoch!==result.id)next.proposal={...next.proposal,selectorId:next.proposal.id,id:`${result.currentEpoch}:${next.proposal.id}`};
    return{next,observations,decisions};
  }
  function state(){
    const result=projectWorkbench(snapshot);
    const {next,observations,decisions}=frontier(result);
    const progress=progressSummary({observations,decisions,requests:result.requests,effort:result.effort,policy:{...boundary.progress,frontierAvailable:Boolean(next.proposal)}});
    return structuredClone({...result,apiKind:'synapse-local-workbench',recordContinuation:Boolean(saved&&!resumeExecution),progress,teaching:teachingBrief({...result,proposal:next.proposal}),proposal:result.paused?null:next.proposal,frontierStopReason:next.stopReason,ownerRequests:[...result.requests.filter(r=>r.status!=='resolved'),...next.ownerRequests.filter(r=>!result.requests.some(p=>p.id===r.id))],busy:Boolean(active),stopRequested,faulted,outDir:root,
      targetRequestCount:requestLog().length,usage:usage(),workspaceUrl:target.describe().origin});
  }
  function expected(command,allowed) {
    const value=json(command);exact(value,['expectedRevision',...allowed]);
    if(value.expectedRevision!==snapshot.revision)throw new Error('Stale revision; refresh state');
    return value;
  }
  async function exclusive(fn,{allowStopped=false}={}) {
    if(active)throw new Error('An action is already running');
    if(faulted||!allowStopped&&(stopRequested||projectWorkbench(snapshot).stopped))throw new Error('Session stopped; new target requires a fresh session');
    active=Promise.resolve().then(fn);try{return await active;}finally{active=null;}
  }
  async function collectRequests() {
    // Preserve pending owner work even after runtime stopRequested is set.
    // Stop prevents execution, not collection of the unfinished-work ledger.
    const current=projectWorkbench(snapshot),{next}=frontier(current,true);
    for(const request of next.ownerRequests)if(!current.requests.some(r=>r.id===request.id))await append({type:'request.recorded',request});
  }
  async function step(command) {
    return exclusive(async()=>{
      const input=expected(command,['proposal']);let current=state();if(current.paused)throw new Error('Session paused');
      const spent=usage();
      if(current.decisions.length>=snapshot.manifest.maxActions||resumeExecution&&(spent.requestCount>56||spent.executionMs>82000||Date.now()-Date.parse(snapshot.manifest.createdAt)>30*60000)){
        await collectRequests();await target.close();await append({type:'stopped',reason:'Original action, request, time or lifetime budget reached; unvisited branches remain untested.',targetClosed:!target.isListening(),targetRequestLog:requestLog(),usage:usage(),checkpoint:await checkpoint()});stopRequested=true;return state();
      }
      let proposal;
      try{
      if(input.proposal){
        exact(input.proposal,['question','reason','evidenceIds','action']);
        if(!Array.isArray(input.proposal.evidenceIds)||input.proposal.evidenceIds.length>20||new Set(input.proposal.evidenceIds).size!==input.proposal.evidenceIds.length)throw new Error('Bounded unique evidence references required');
        proposal={id:`session-${randomUUID()}`,source:'session',question:text(input.proposal.question),reason:text(input.proposal.reason),evidenceIds:input.proposal.evidenceIds.map(id=>text(id,200)),action:action(input.proposal.action)};
      }else{if(!current.proposal){await collectRequests();return state();}proposal={...json(current.proposal),source:'rules'};action(proposal.action);}
      if(proposal.evidenceIds.some(id=>!current.observations.some(o=>o.id===id&&o.outcome==='complete')))throw new Error('Supporting observation is missing or incomplete');
      if(['order','transition'].includes(proposal.action.kind)&&!proposal.evidenceIds.length)throw new Error('Object actions require observed support');
      if(!boundary.enabledActors.includes(proposal.action.actor)||proposal.action.kind==='transition'&&!boundary.permitTransitions)throw new Error('Action outside the immutable narrowed local scope');
      if(proposal.evidenceIds.some(id=>{const o=current.observations.find(o=>o.id===id);return o?.sourceImport||(o?.environment?.id||current.id)!==current.currentEpoch;}))throw new Error('Historical or imported evidence cannot authorize current target execution');
      proposal.epoch=current.currentEpoch;
      }catch(error){if(input.proposal)await append({type:'proposal.rejected',reason:String(error.message).slice(0,250)});throw error;}
      await collectRequests();await append({type:'action.started',proposal});
      let observation,decision;
      try{
        const result=await target.execute(proposal.action);
        observation={id:`observation-${randomUUID()}`,action:proposal.action,outcome:'complete',environment:{id:current.currentEpoch,sourceHash:current.target.sourceHash},...json(result)};
        decision={...proposal,status:'executed',observationId:observation.id};
      }catch(error){
        observation={id:`observation-${randomUUID()}`,action:proposal.action,outcome:'incomplete',environment:{id:current.currentEpoch,sourceHash:current.target.sourceHash},errorCode:/^NBRET_PRACTICE_[A-Z_]+$/.test(error.code||'')?error.code:'EXECUTION_UNAVAILABLE',
          actionReached:error.actionReached===true,setupReceipts:json(error.setupReceipts||[])};
        decision={...proposal,status:'blocked',observationId:observation.id};
      }
      await append({type:'action.finished',decision,observation});
      if(observation.outcome==='incomplete')await append({type:'request.recorded',request:{id:`request-${proposal.id}`,question:proposal.question,reason:`Action unavailable (${observation.errorCode}); no automatic retry.`,evidenceIds:[observation.id]}});
      if(['NBRET_PRACTICE_REQUEST_LIMIT','NBRET_PRACTICE_GLOBAL_DEADLINE','NBRET_PRACTICE_SESSION_EXPIRED','NBRET_PRACTICE_CLOSED'].includes(observation.errorCode)){
        await target.close();await append({type:'stopped',reason:`Target execution boundary reached (${observation.errorCode}); unfinished branches remain untested.`,targetClosed:!target.isListening(),targetRequestLog:requestLog(),usage:usage(),checkpoint:await checkpoint()});stopRequested=true;
      }
      const after=state();
      if(!after.stopped&&!stopRequested&&after.progress.shouldPause){
        await append({type:'paused'});
        if(!after.requests.some(r=>r.id==='owner-diminishing-progress'))await append({type:'request.recorded',request:{id:'owner-diminishing-progress',question:'Review diminishing useful progress before continuing.',reason:after.progress.recommendation.reason,evidenceIds:after.observations.slice(-boundary.progress.windowSize).map(o=>o.id)}});
      }
      return state();
    });
  }
  async function steer(command) {
    return exclusive(async()=>{
      const input=expected(command,['priority','mode']);
      if(input.priority!==undefined&&!['coverage','workflow'].includes(input.priority))throw new Error('Unknown priority');
      if(input.mode!==undefined&&!['pause','resume'].includes(input.mode))throw new Error('Unknown steering mode');
      if(input.priority!==undefined){if(!['coverage','workflow'].includes(input.priority))throw new Error('Unknown priority');await append({type:'priority.changed',priority:input.priority});}
      if(input.mode!==undefined){if(!['pause','resume'].includes(input.mode))throw new Error('Unknown steering mode');await append({type:input.mode==='pause'?'paused':'resumed'});}
      return state();
    });
  }
  async function review(command) {
    return exclusive(async()=>{
      const input=expected(command,['review']);exact(input.review,['decisionId','reviewerId','verdict','rationale','objections','evidenceIds','observedConsequence','potentialDamage','suggestedFix','manualVerification']);
      const r=input.review,current=state(),decision=current.decisions.find(d=>d.id===r.decisionId);
      if(!decision||decision.status!=='executed')throw new Error('Executed decision required for review');
      text(r.reviewerId,100);if(['rules','session'].includes(r.reviewerId))throw new Error('Reviewer label must differ from proposal source');
      if(!['supported','needs-action','rejected'].includes(r.verdict))throw new Error('Unknown review verdict');
      text(r.rationale);if(!Array.isArray(r.evidenceIds)||r.evidenceIds.length>20||new Set(r.evidenceIds).size!==r.evidenceIds.length||!r.evidenceIds.includes(decision.observationId)||r.evidenceIds.some(id=>!current.observations.some(o=>o.id===id&&o.outcome==='complete')))throw new Error('Review must cite unique complete evidence including its decision observation');
      if(r.objections!==undefined){if(!Array.isArray(r.objections)||r.objections.length>12)throw new Error('Bounded objections required');for(const objection of r.objections)text(objection);}
      for(const field of ['observedConsequence','potentialDamage','suggestedFix','manualVerification'])if(r[field]!==undefined)text(r[field]);
      await append({type:'review.recorded',review:{...r,id:`review-${randomUUID()}`,authority:'operator-declared review, not verified effect'}});return state();
    },{allowStopped:true});
  }
  function caseContext(current){return{observations:current.observations,decisions:current.decisions,environment:{id:current.id,sourceHash:current.target.sourceHash}};}
  async function recordCase(command) {
    return exclusive(async()=>{
      const input=expected(command,['event']),event=json(input.event);exact(event,['id','type','payload']);
      if(!event.id)event.id=`case-event-${randomUUID()}`;
      applyCaseEvent(state().casebook,event,caseContext(state()));
      await append({type:'case.event',caseEvent:event});return state();
    },{allowStopped:true});
  }
  async function recordProof(command){
    return exclusive(async()=>{
      const input=expected(command,['plan']),plan=json(input.plan),current=state(),c=current.casebook.cases.find(c=>c.id===plan.caseId);
      if(!c)throw new Error('Proof requires an existing case');
      if(current.proofRecords.length>=100)throw new Error('Proof history budget exceeded');
      if(!c.basisEvidenceIds.includes(plan.attemptId))throw new Error('Proof attempt must be basis evidence of this case');
      for(const id of [plan.attemptId,plan.controlId,plan.actorProfileId,plan.ownerProfileId]){
        const o=current.observations.find(o=>o.id===id);
        if(o&&(o.sourceImport||o.environment?.id!==current.currentEpoch))throw new Error('Historical or imported evidence cannot establish the current proof epoch');
      }
      const gate=c.gates.at(-1),review=c.reviews.filter(r=>r.gateEventId===gate?.eventId).at(-1);
      const result=evaluateProof(plan,{observations:current.observations,environment:{sourceHash:current.target.sourceHash}});
      await append({type:'proof.evaluated',proof:{plan,result,gateEventId:gate?.eventId??null,reviewEventId:review?.eventId??null,sourceHash:current.target.sourceHash,epoch:current.currentEpoch,authority:'fixed collected-evidence predicate; not independent origin authentication or execution permission'}});
      return state();
    },{allowStopped:true});
  }
  async function request(command) {
    return exclusive(async()=>{
      const input=expected(command,['operation','requestId','question','reason','resolution','resolverId']);
      if(input.operation==='record'){
        if(Object.keys(input).some(k=>!['expectedRevision','operation','question','reason'].includes(k)))throw new Error('Unexpected request fields');
        await append({type:'request.recorded',request:{id:`owner-request-${randomUUID()}`,question:text(input.question),reason:text(input.reason),evidenceIds:[]}});
      }else if(input.operation==='resolve'){
        if(Object.keys(input).some(k=>!['expectedRevision','operation','requestId','resolution','resolverId'].includes(k)))throw new Error('Unexpected resolution fields');
        text(input.requestId,200);text(input.resolution);text(input.resolverId,100);
        const current=state(),record=current.ownerRequests.find(r=>r.id===input.requestId);if(!record||record.status==='resolved')throw new Error('Pending recorded owner request required');await collectRequests();
        await append({type:'request.resolved',resolution:{requestId:record.id,resolution:input.resolution,resolverId:input.resolverId,authority:'inert operator resolution; no permission change'}});
      }else throw new Error('Unknown owner request operation');
      return state();
    },{allowStopped:true});
  }
  async function recordEffort(command) {
    return exclusive(async()=>{
      const input=expected(command,['effort']),effort=json(input.effort);exact(effort,['id','person','stage','minutes']);if(!effort.id)effort.id=`effort-${randomUUID()}`;
      const current=state();if(current.effort.some(e=>e.id===effort.id))throw new Error('Duplicate effort ID');
      progressSummary({observations:[],decisions:[],effort:[...current.effort,effort]});await append({type:'effort.recorded',effort});return state();
    },{allowStopped:true});
  }
  async function evaluate(command) {
    return exclusive(async()=>{
      const input=expected(command,['comparison']),comparison=json(input.comparison),result=compareRuns(comparison);
      await append({type:'evaluation.recorded',evaluation:{comparison,result}});return state();
    },{allowStopped:true});
  }
  async function iteration(command) {
    return exclusive(async()=>{
      const input=expected(command,['iteration']),record=validateIteration(input.iteration);
      if(state().iterations.some(i=>i.id===record.id))throw new Error('Duplicate iteration ID');await append({type:'iteration.recorded',iteration:record});return state();
    },{allowStopped:true});
  }
  async function rejectionAudit(command) {
    return exclusive(async()=>{
      const input=expected(command,['seed','count']),current=state();
      const rejections=[...current.rejectedProposals.map((r,index)=>({id:r.id||`proposal-${index}`,source:'proposal-schema',reason:r.reason})),...current.casebook.cases.flatMap(c=>c.gates.filter(g=>!g.passed).map(g=>({id:g.eventId,source:'candidate-evidence-filter',caseId:c.id,reasons:g.reasons})))];
      const sample=sampleRejected({rejections,seed:input.seed,count:input.count});await append({type:'audit.sampled',sample});return state();
    },{allowStopped:true});
  }
  async function attachEvidence(command) {
    return exclusive(async()=>{
      const input=expected(command,['directory']);text(input.directory,4096);const source=await readWorkbench(input.directory);
      if(!source.stopped||source.targetClosed!==true||source.unresolvedAttempts.length||source.id===state().id)throw new Error('A different clean-stopped workbench record is required');
      const current=state(),existing=new Set(current.observations.map(o=>o.id));
      const observations=source.observations.filter(o=>!o.sourceImport).map(o=>({...o,environment:o.environment||{id:source.id,sourceHash:source.target.sourceHash},sourceImport:{id:source.id,head:source.head,authority:'retained projection; origin and effect independence unverified'}}));
      if(!observations.length||observations.length>100||observations.some(o=>existing.has(o.id)))throw new Error('Import requires new unique bounded observations');
      await append({type:'evidence.imported',observations});return state();
    },{allowStopped:true});
  }
  async function recordNote(command){
    return exclusive(async()=>{
      const input=expected(command,['note']),note=json(input.note),current=state();
      if(note.kind==='teaching'){
        exact(note,['kind','question','answer','evidenceIds']);text(note.question);text(note.answer);
        if(!Array.isArray(note.evidenceIds)||!note.evidenceIds.length||new Set(note.evidenceIds).size!==note.evidenceIds.length||note.evidenceIds.some(id=>!current.observations.some(o=>o.id===id&&o.outcome==='complete')))throw new Error('Teach-back must cite existing complete observations');
        await append({type:'teaching.recorded',note:{...note,grading:'not automatically graded; explanation and understanding remain subject to review'}});
      }else if(note.kind==='escalation'){
        exact(note,['kind','caseId','reason','priority']);if(!current.casebook.cases.some(c=>c.id===note.caseId)||!['urgent','normal'].includes(note.priority))throw new Error('Known case and escalation priority required');text(note.reason);
        await append({type:'escalation.recorded',note:{...note,authority:'declared attention request, not a verified finding'}});
      }else throw new Error('Unknown note kind');
      return state();
    },{allowStopped:true});
  }
  async function attachScreenshot(command){
    return exclusive(async()=>{
      const input=expected(command,['sourcePath','evidenceId','caption']),current=state();
      if(current.screenshotArtifacts.length>=20)throw new Error('Screenshot count budget exceeded');
      if(!current.observations.some(o=>o.id===input.evidenceId&&o.outcome==='complete'))throw new Error('Screenshot requires an existing complete observation');
      const artifact=await retainScreenshot({sourcePath:input.sourcePath,outDir:join(root,'screenshots'),evidenceId:input.evidenceId,caption:input.caption});
      await append({type:'screenshot.retained',artifact});return state();
    },{allowStopped:true});
  }
  async function screenshot(artifactId){
    const record=state().screenshotArtifacts.find(a=>a.artifactId===artifactId);
    if(!record)throw new Error('Registered screenshot required');
    return readScreenshot({outDir:join(root,'screenshots'),record});
  }
  async function stop(reason='Owner stopped the session') {
    if(closing)return closing;text(reason);stopRequested=true;
    closing=(async()=>{await target.close();if(active)await active.catch(()=>{});if(!faulted&&!projectWorkbench(snapshot).stopped){await collectRequests();await append({type:'stopped',reason,targetClosed:!target.isListening(),targetRequestLog:requestLog(),usage:usage(),checkpoint:await checkpoint()});}return state();})();return closing;
  }
  async function exportReport() {
    if(active)throw new Error('Wait for the current action before exporting');
    const current=state(),name=`report-${snapshot.revision}-${randomUUID()}`;
    await writeFile(join(root,`${name}.json`),JSON.stringify(current,null,2)+'\n',{flag:'wx'});
    await writeFile(join(root,`${name}.html`),renderWorkbenchReport(current,{exported:true}),{flag:'wx'});
    const executivePath=join(root,`${name}-executive.html`);await writeFile(executivePath,renderExecutiveReport(current,{exported:true}),{flag:'wx'});
    const readerPath=join(root,`${name}-assessment.html`);await writeFile(readerPath,renderAssessmentReport(current,{exported:true}),{flag:'wx'});
    return{jsonPath:join(root,`${name}.json`),htmlPath:join(root,`${name}.html`),executivePath,readerPath};
  }
  if(saved&&resumeExecution)await append({type:'target.resumed',epoch:`epoch-${randomUUID()}`,target:target.describe(),authority:'Explicit owned-target startup continuation; original scope and remaining budgets retained'});
  return{state,step,steer,review,recordCase,recordProof,request,recordEffort,evaluate,iteration,rejectionAudit,attachEvidence,attachScreenshot,screenshot,recordNote,stop,exportReport,outDir:root,close:()=>stop('Workbench server closed')};
}

export function teachingBrief(state){
  const recent=state.observations.slice(-3).map(o=>({id:o.id,principal:o.identity?.principal??'unavailable',action:o.action,outcome:o.outcome,status:o.response?.status??null}));
  return{question:state.proposal?.question||'What do the saved observations establish, and what remains unknown?',why:state.proposal?.reason||'Use recorded evidence and declared policy; no finding is required to finish.',recentEvidence:recent,
    interpretation:'HTTP status and a completed request are observations, not automatically business effect or security.',
    exercise:'Explain which observation supports the conclusion, which policy assumption it relies on, and one consequence that has not been demonstrated.',
    limits:['No hidden answer key or assumed vulnerability is supplied.','The coding-agent session provides explanations and checks understanding; this structured brief is not an automated teacher or grader.']};
}

export function renderWorkbenchReport(state,options={}){
    const workflow={scope:state.scope,intake:state.intake,usage:state.usage,progress:state.progress,proofProgress:state.proofProgress,effort:state.effort,evaluations:state.evaluations,iterations:state.iterations,auditSamples:state.auditSamples,teachBacks:state.teachBacks,escalations:state.escalations,requestResolutions:state.requestResolutions,currentEpoch:state.currentEpoch};
  const addition=renderCaseSections(state,true,options)+`<h2>Progress, effort, comparisons and learning records</h2><pre>${escape(JSON.stringify(workflow,null,2))}</pre>`;
  return renderLegacyReport(state).replace('<h2>Rejected session proposals</h2>',addition+'<h2>Rejected session proposals</h2>');
}

function renderLegacyReport(state) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synapse · Investigation ledger</title><style>:root{color-scheme:light dark}body{background:light-dark(#f5f5ef,#17201b);color:light-dark(#26332b,#e6ece7);font:16px/1.6 system-ui;margin:0}main{max-width:920px;margin:auto;padding:32px 22px}h1{font:42px Georgia}article{border-top:1px solid #879789;padding:18px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}small{font-family:monospace}</style><main><small>SYNAPSE · SESSION INVESTIGATION RECORD</small><h1>Evidence, decisions and open work.</h1><p>${escape(state.purpose)}</p><p>${state.coverage.completeObservations} complete observations · ${state.coverage.incompleteObservations} incomplete · ${state.reviews.length} declared reviews · ${state.stopped?'stopped':'active snapshot'}.</p><p>This records investigation steps and reviewer declarations. It does not certify findings, independent effects or application security.</p>${state.decisions.map(d=>`<article><small>${escape(d.source)} · ${escape(d.status)}</small><h2>${escape(d.question)}</h2><p>${escape(d.reason)}</p><pre>${escape(JSON.stringify({action:d.action,evidenceIds:d.evidenceIds,observationId:d.observationId,observation:state.observations.find(o=>o.id===d.observationId)},null,2))}</pre></article>`).join('')}<h2>Rejected session proposals</h2><pre>${escape(JSON.stringify(state.rejectedProposals,null,2))}</pre><h2>Reviewer history</h2>${state.reviews.map(r=>`<article><b>${escape(r.reviewerId)} · ${escape(r.verdict)}</b><p>${escape(r.rationale)}</p><pre>${escape(JSON.stringify(r,null,2))}</pre></article>`).join('')||'<p>No review recorded. No supported findings inferred.</p>'}<h2>Owner actions and unknowns</h2><pre>${escape(JSON.stringify(state.ownerRequests,null,2))}</pre><h2>Limits</h2><ul>${state.limitations.map(l=>`<li>${escape(l)}</li>`).join('')}</ul><p>${escape(state.stopReason||state.frontierStopReason||'Work remains; no terminal result yet.')}</p><small>Revision ${state.revision} · head ${escape(state.head)}</small></main></html>`;
}
