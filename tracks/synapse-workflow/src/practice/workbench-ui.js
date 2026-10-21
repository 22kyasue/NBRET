const $=id=>document.getElementById(id);
let state,lastRevision=-1,working=0,stopping=false;
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function loadWorkflow(kind,body){$('workflowKind').value=kind;$('workflowPayload').value=JSON.stringify(body,null,2);$('workflowEditor').open=true;}
async function refresh(){const response=await fetch('/api/state');if(!response.ok)throw new Error('Unable to read session');state=await response.json();render();}
async function command(path,data={}){
  const isStop=path==='/api/stop';if(working&&!isStop||isStop&&stopping)return;working++;if(isStop)stopping=true;renderControls();$('message').textContent='';
  try{const response=await fetch(path,{method:'POST',headers:{'content-type':'application/json','x-workbench-nonce':state.nonce},body:JSON.stringify({expectedRevision:state.revision,...data})});const value=await response.json();if(!response.ok)throw new Error(value.error||'Command failed');if(path==='/api/export')$('message').textContent='Saved '+value.htmlPath;await refresh();}
  catch(error){$('message').textContent=error.message;try{await refresh();}catch{}}
  finally{working--;if(isStop)stopping=false;renderControls();}
}
function renderControls(){if(!state)return;const frozen=working||state.busy||state.automatic||state.stopped||state.stopRequested;
  $('step').disabled=frozen||state.paused||!state.proposal;$('continue').disabled=frozen||state.paused||!state.proposal;
  $('stop').disabled=stopping||state.stopped;$('pause').disabled=Boolean(working)||state.stopped;$('pause').textContent=state.paused?'Resume':'Pause';
  $('priority').disabled=working||state.stopped||state.busy||state.automatic;$('export').disabled=working||state.busy||state.automatic;
  $('new').disabled=Boolean(working)||!state.stopped;
  $('status').textContent=state.faulted?'Record fault':state.stopped?'Stopped':state.automatic?'Continuing rules':state.paused?'Paused':state.busy?'Running step':'Ready';
  $('proposalForm').querySelector('button').disabled=frozen||state.paused;$('reviewForm').querySelector('button').disabled=working||state.busy||state.automatic||!state.decisions.some(d=>d.status==='executed');
  const workflow=$('workflowForm');if(workflow){workflow.querySelector('button.primary').disabled=Boolean(working)||state.busy||state.automatic||state.faulted;}
}
function render(){
  $('complete').textContent=state.coverage.completeObservations;$('incomplete').textContent=state.coverage.incompleteObservations;$('requests').textContent=state.targetRequestCount;$('reviews').textContent=state.reviews.length;
  $('question').textContent=state.proposal?.question||state.stopReason||state.frontierStopReason||(state.paused?'Session paused':'No next step available');
  $('reason').textContent=state.proposal?.reason||'Remaining omissions are recorded below. No vulnerability is required for completion.';
  $('action').textContent=state.proposal?JSON.stringify(state.proposal.action,null,2):'No target action proposed';
  $('basis').textContent=state.proposal?'Evidence: '+(state.proposal.evidenceIds.join(', ')||'Declared local scope / initial observation'):'The target is '+(state.stopped?'closed.':'unchanged.');
  $('priority').value=state.priority;$('revision').textContent='Revision '+state.revision;
  $('coverage').textContent='Observed principals: '+(state.coverage.actorsObserved.join(', ')||'none')+'. Objects seen: '+state.coverage.objectsObserved.length+'. Decisions: '+state.coverage.selectedActions+'.';
  $('rejections').textContent=JSON.stringify(state.rejectedProposals,null,2);
  $('location').textContent='Records: '+state.outDir;$('owner').replaceChildren(...(state.ownerRequests.length?state.ownerRequests.map(r=>{const e=node('div'),button=node('button','Prepare resolution note');button.onclick=()=>loadWorkflow('request',{operation:'resolve',requestId:r.id,resolverId:'Kotaro',resolution:''});e.append(node('b',r.question),node('p',r.reason),button);return e;}):[node('p','No pending owner request. Untested surfaces remain outside this local frontier.')]));
  if(state.caseSummary){
    $('workflowScope').textContent='Tracks: '+state.scope.tracks+' · '+(state.scope.permitTransitions?'fixed synthetic transitions permitted':'read-only')+' · '+(state.recordContinuation?'saved-record continuation, no target executor':'owned target phase')+'.';
    $('caseCounts').textContent=state.caseSummary.verifiedFindings.length+' independently verified · '+state.caseSummary.issuesNeedingOwnerAction.length+' need owner action · '+state.caseSummary.unconfirmedLeads.length+' unconfirmed / rejected. Review labels alone cannot establish independent effect.';
    $('caseSummary').replaceChildren(...[...state.caseSummary.issuesNeedingOwnerAction,...state.caseSummary.unconfirmedLeads].map(c=>{const box=node('details');box.append(node('summary',c.title+' · '+c.substatus),node('p','Observed: '+c.observed),node('p','Declared consequence: '+c.demonstratedConsequence),node('p','Possible consequences: '+c.potentialConsequences),node('p','Uncertainty: '+c.uncertainties),node('p','Suggested repair: '+c.suggestedRepair),node('p','Owner verification: '+c.manualVerification),node('pre',JSON.stringify(c,null,2)));return box;}));
    $('progressData').textContent=JSON.stringify({progress:state.progress,effort:state.effort,evaluations:state.evaluations,iterations:state.iterations,auditSamples:state.auditSamples},null,2);
    $('teachingData').textContent=JSON.stringify({brief:state.teaching,teachBacks:state.teachBacks},null,2);
    const latest=new Map();for(const note of state.escalations)latest.set(note.caseId,note);$('escalations').replaceChildren(...[...latest.values()].filter(n=>n.priority==='urgent').map(n=>node('p','Urgent declared attention request: '+n.reason,'notice')));
  }
  if(state.loopError)$('message').textContent=state.loopError;
  if(lastRevision!==state.revision){
    const open=new Set([...$('decisions').querySelectorAll('details[open]')].map(e=>e.dataset.id));
    $('decisions').replaceChildren(...(state.decisions.length?state.decisions.slice().reverse().map(d=>{
      const e=node('article',undefined,'entry'),observation=state.observations.find(o=>o.id===d.observationId);
      e.append(node('small',d.source+' · '+d.status+(observation?' · HTTP '+(observation.response?.status||'unavailable'):'')),node('h3',d.question),node('p',d.reason));
      const detail=node('details');detail.dataset.id=d.id;detail.open=open.has(d.id);detail.append(node('summary','Inspect action, evidence and declared basis'),node('pre',JSON.stringify({decision:d,observation},null,2)));e.append(detail);return e;
    }):[node('p','No actions yet. Start with the proposed observation.','empty')]));
    const selected=$('reviewDecision').value;$('reviewDecision').replaceChildren(...state.decisions.filter(d=>d.status==='executed').map(d=>{const option=node('option',d.question);option.value=d.id;return option;}));if([...$('reviewDecision').options].some(o=>o.value===selected))$('reviewDecision').value=selected;
    $('reviewHistory').replaceChildren(...(state.reviews.length?state.reviews.slice().reverse().map(r=>{const e=node('article',undefined,'entry');e.append(node('small',r.reviewerId+' · '+r.verdict+' · operator declaration'),node('p',r.rationale),node('pre',JSON.stringify(r,null,2)));return e;}):[node('p','No separate review recorded. Observations have not been promoted to findings.','empty')]));
    lastRevision=state.revision;
  }renderControls();
}
$('new').onclick=()=>command('/api/new');
$('step').onclick=()=>command('/api/step');$('continue').onclick=()=>command('/api/continue');
$('pause').onclick=()=>command('/api/steer',{mode:state.paused?'resume':'pause'});$('stop').onclick=()=>command('/api/stop',{reason:'Owner stopped the workbench target'});
$('priority').onchange=()=>command('/api/steer',{priority:$('priority').value});$('export').onclick=()=>command('/api/export');
$('proposalForm').onsubmit=event=>{event.preventDefault();try{command('/api/step',{proposal:{question:$('customQuestion').value,reason:$('customReason').value,evidenceIds:$('customEvidence').value.split(',').map(v=>v.trim()).filter(Boolean),action:JSON.parse($('customAction').value)}});}catch{$('message').textContent='Enter valid typed action JSON.';}};
$('reviewForm').onsubmit=event=>{event.preventDefault();const decision=state.decisions.find(d=>d.id===$('reviewDecision').value);if(!decision)return;const review={decisionId:decision.id,reviewerId:$('reviewer').value,verdict:$('verdict').value,rationale:$('rationale').value,evidenceIds:[decision.observationId],objections:$('objections').value.split('\n').map(v=>v.trim()).filter(Boolean)};for(const[field,id]of[['observedConsequence','observed'],['potentialDamage','potential'],['suggestedFix','fix'],['manualVerification','manual']])if($(id).value.trim())review[field]=$(id).value;command('/api/review',{review});};
$('workflowForm').onsubmit=event=>{event.preventDefault();try{command('/api/'+$('workflowKind').value,JSON.parse($('workflowPayload').value));}catch{$('message').textContent='Enter valid workflow command JSON.';}};
$('candidateTemplate').onclick=()=>{const observation=state.observations.filter(o=>o.outcome==='complete'&&!o.sourceImport).at(-1);if(!observation){$('message').textContent='Collect a complete observation first.';return;}loadWorkflow('case',{event:{type:'candidate.created',payload:{id:'case-'+Date.now(),title:'Review observed behavior (unconfirmed)',question:'Does the observed behavior match the declared business rule?',authorId:'session',basisEvidenceIds:[observation.id],identity:observation.identity,environment:{sourceHash:observation.environment?.sourceHash||state.target.sourceHash},expected:'State the intended business rule and its authority.',observed:'HTTP '+observation.response.status+' in '+observation.request.path,demonstratedConsequence:'No unauthorized business damage is established by this template.',potentialConsequences:'Describe conditional consequences separately from demonstrated effects.',uncertainties:'Guided same-app observations; independent effect not established.',suggestedRepair:'No repair is justified until a weakness is established.',manualVerification:'Write the independent check and expected observable result.',impactType:'other'}}});};
refresh().catch(error=>{$('message').textContent=error.message;});setInterval(()=>{if(!working)refresh().catch(()=>{$('status').textContent='Disconnected';});},1000);
