import {validateConsequence,projectConsequence} from './consequence.mjs';

// Pure interpretation ledger. Research: assessment-evidence/framework.md:34-49,
// executable-claims.md:9, and reporting.takumi-not-vulnerable-means-not-reproduced.
// Labels and consistent receipts do not establish independent effect truth.
// Caller persists/replays {id,type,payload} events in order from initialCasebook.
// This is not an arbitrary saved-state authenticator. Context is admitted by the
// workbench; legacy observations without environment use its supplied binding.
// Positive-control selection and all narrative fields remain declarations.
// No response predicate, reviewer independence or repair effect is invented.
const impacts = ['exposure','unauthorized-action','disruption','reach','availability','resource','other'];
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
function clone(v, depth=0, count={n:0}) {
  if (++count.n>100000 || depth>30) throw new Error('Casebook structure budget exceeded');
  if(v===null || typeof v==='boolean' || typeof v==='number'&&Number.isFinite(v))return v;
  if(typeof v==='string'){if(v.length>12000)throw new Error('Text budget exceeded');return v;}
  if(!v || typeof v!=='object' || !(Array.isArray(v)?Object.getPrototypeOf(v)===Array.prototype:[Object.prototype,null].includes(Object.getPrototypeOf(v))))throw new Error('Plain JSON required');
  const out=Array.isArray(v)?[]:{};
  for(const k of Reflect.ownKeys(v)){
    if(Array.isArray(v)&&k==='length')continue;
    const d=Object.getOwnPropertyDescriptor(v,k);
    if(typeof k!=='string'||!d.enumerable||!Object.hasOwn(d,'value')||['__proto__','constructor','prototype'].includes(k)||Array.isArray(v)&&(!/^(0|[1-9][0-9]*)$/.test(k)||Number(k)>=v.length))throw new Error('Inert JSON required');
    out[k]=clone(d.value,depth+1,count);
  }
  if(Array.isArray(v)&&Object.keys(v).length!==v.length)throw new Error('Dense arrays required');
  return out;
}
function exact(o,keys){if(!o||Array.isArray(o)||typeof o!=='object'||Object.keys(o).length!==keys.length||keys.some(k=>!Object.hasOwn(o,k)))throw new Error('Exact fields required: '+keys.join(','));}
function text(v){if(typeof v!=='string'||!v.trim()||v.length>2000)throw new Error('Nonempty bounded text required');}
function refs(v,empty=false){if(!Array.isArray(v)||v.length>30||!empty&&!v.length||new Set(v).size!==v.length)throw new Error('Unique bounded evidence references required');v.forEach(text);}
function identity(v){exact(v,['principal','tenant','role']);for(const x of Object.values(v))if(x!==null)text(x);}
const identityKey=v=>JSON.stringify([v?.principal,v?.tenant,v?.role]);
const actionKey=v=>JSON.stringify([v?.kind,v?.actor,v?.objectId??null,v?.transition??null]);
function action(v){
  if(!v||typeof v!=='object'||!['page','profile','orders','order','transition'].includes(v.kind))throw new Error('Unsupported action');
  const keys=['kind','actor',...(['order','transition'].includes(v.kind)?['objectId']:[]),...(v.kind==='transition'?['transition']:[])];
  exact(v,keys);text(v.actor);if(keys.includes('objectId'))text(v.objectId);
  if(v.kind==='transition'&&!['submit','approve'].includes(v.transition))throw new Error('Unsupported transition');
}
function observation(context,id){return context.observations.find(o=>o.id===id);}
function receipt(o,context){return {id:o.id,action:o.action,identity:o.identity,environment:o.environment||context.environment,observation:o};}
function check(context,ids,sourceHash,expectedIdentity=null){
  const reasons=[];
  for(const id of ids){const o=observation(context,id);
    if(!o){reasons.push(`${id}: missing observation`);continue;}
    if(o.outcome!=='complete'||!o.response||!Number.isInteger(o.response.status)||o.response.status<100||o.response.status>599||!Object.hasOwn(o.response,'value')){reasons.push(`${id}: incomplete observation`);continue;}
    if(!o.identity||!['principal','tenant','role'].every(k=>Object.hasOwn(o.identity,k))){reasons.push(`${id}: identity missing`);continue;}
    try{action(o.action);}catch{reasons.push(`${id}: unsupported action semantics`);}
    try{identity(o.identity);}catch{reasons.push(`${id}: malformed identity`);}
    if(o.identity.principal!==o.action?.actor)reasons.push(`${id}: requested actor and observed principal mismatch`);
    if(expectedIdentity&&identityKey(o.identity)!==identityKey(expectedIdentity))reasons.push(`${id}: identity mismatch`);
    const environment=o.environment||context.environment;
    try{exact(environment,['id','sourceHash']);text(environment.id);text(environment.sourceHash);}catch{reasons.push(`${id}: malformed environment`);}
    if(environment.sourceHash!==sourceHash)reasons.push(`${id}: source mismatch`);
  }
  return reasons;
}
export function initialCasebook(){return {schemaVersion:1,events:[],cases:[]};}
export function applyCaseEvent(state,event,context){
  const s=clone(state),e=clone(event),ctx=clone(context);
  if(Buffer.byteLength(JSON.stringify([s,e,ctx]))>8*1024*1024)throw new Error('Casebook byte budget exceeded');
  exact(s,['schemaVersion','events','cases']);if(s.schemaVersion!==1||!Array.isArray(s.events)||!Array.isArray(s.cases)||s.events.length>=400||s.cases.length>50)throw new Error('Casebook history budget exceeded');
  exact(e,['id','type','payload']);text(e.id);text(e.type);
  if(s.events.some(x=>x.id===e.id))throw new Error('Duplicate event ID');
  if(!Array.isArray(ctx.observations)||ctx.observations.length>1000||!Array.isArray(ctx.decisions)||ctx.decisions.length>1000)throw new Error('Context budget exceeded');
  exact(ctx.environment,['id','sourceHash']);text(ctx.environment.id);text(ctx.environment.sourceHash);
  if(new Set(ctx.observations.map(o=>o.id)).size!==ctx.observations.length)throw new Error('Ambiguous observation IDs');
  const p=e.payload;
  if(e.type==='candidate.created'){
    const fields=['id','title','question','authorId','basisEvidenceIds','identity','environment','expected','observed','demonstratedConsequence','potentialConsequences','uncertainties','suggestedRepair','manualVerification','impactType'];
    exact(p,fields);for(const k of fields.filter(k=>!['basisEvidenceIds','identity','environment'].includes(k)))text(p[k]);
    refs(p.basisEvidenceIds);identity(p.identity);exact(p.environment,['sourceHash']);text(p.environment.sourceHash);
    if(!impacts.includes(p.impactType)||s.cases.length>=50||s.cases.some(c=>c.id===p.id))throw new Error('Invalid or duplicate candidate');
    s.cases.push({...p,gates:[],reviews:[],ownerVerifications:[],retestPlans:[],retests:[]});
  }else{
    const c=s.cases.find(c=>c.id===p?.caseId);if(!c)throw new Error('Unknown case');
    if(e.type==='consequence.documented'){
      const document=validateConsequence(p);
      const ids=[...new Set([...document.extent.demonstrated.evidenceIds,...document.extent.wider.evidenceIds,...document.sequence.flatMap(step=>step.evidenceIds)])];
      if(check(ctx,ids,c.environment.sourceHash).length)throw new Error('Consequence requires existing complete identity/source-bound evidence');
      const gate=c.gates.filter(g=>g.passed).at(-1),review=c.reviews.filter(r=>r.gateEventId===gate?.eventId).at(-1);
      if((c.consequenceHistory?.length||0)>=20)throw new Error('Consequence history budget exceeded');
      (c.consequenceHistory??=[]).push({eventId:e.id,gateEventId:gate?.eventId??null,reviewEventId:review?.eventId??null,environment:{sourceHash:c.environment.sourceHash},document});
    }else if(e.type==='evidence.filtered'){
      exact(p,['caseId','positiveControlIds']);refs(p.positiveControlIds);
      const reasons=check(ctx,c.basisEvidenceIds,c.environment.sourceHash,c.identity).concat(check(ctx,p.positiveControlIds,c.environment.sourceHash));
      if(p.positiveControlIds.some(id=>c.basisEvidenceIds.includes(id)))reasons.push('Positive controls must be distinct from basis evidence');
      for(const id of p.positiveControlIds){const o=observation(ctx,id);if(o?.response?.status<200||o?.response?.status>=300)reasons.push(`${id}: positive control did not succeed`);}
      c.gates.push({eventId:e.id,passed:!reasons.length,reasons,evidenceIds:[...c.basisEvidenceIds,...p.positiveControlIds],receipts:reasons.length?[]:[...c.basisEvidenceIds,...p.positiveControlIds].map(id=>receipt(observation(ctx,id),ctx))});
    }else if(e.type==='review.recorded'){
      exact(p,['caseId','reviewerId','verdict','evidenceIds','objections','notes']);text(p.reviewerId);text(p.notes);refs(p.evidenceIds);refs(p.objections,true);
      const gate=c.gates.at(-1);
      if(!gate?.passed||p.reviewerId===c.authorId||!['supported','needs-action','rejected'].includes(p.verdict)||!same([...p.evidenceIds].sort(),[...gate.evidenceIds].sort())||check(ctx,p.evidenceIds,c.environment.sourceHash).length||gate.receipts.some(r=>!same(r.observation,observation(ctx,r.id))))throw new Error('Review requires a passed gate, different declared label and exact complete evidence');
      c.reviews.push({...p,eventId:e.id,gateEventId:gate.eventId,authority:'declared label; independence unauthenticated'});
    }else if(e.type==='owner.verified'){
      exact(p,['caseId','result','evidenceIds','notes']);text(p.notes);refs(p.evidenceIds);
      const gate=c.gates.at(-1),review=c.reviews.filter(r=>r.gateEventId===gate?.eventId).at(-1);
      if(!gate?.passed||!review||!['reproduced','not-reproduced','inconclusive'].includes(p.result)||check(ctx,p.evidenceIds,ctx.environment.sourceHash).length||!p.evidenceIds.some(id=>identityKey(observation(ctx,id)?.identity)===identityKey(c.identity)))throw new Error('Owner verification requires current review and complete identity-matched evidence');
      if(p.result==='reproduced'&&gate.receipts.filter(r=>c.basisEvidenceIds.includes(r.id)).some(r=>!p.evidenceIds.some(id=>{const o=observation(ctx,id);return identityKey(o.identity)===identityKey(r.identity)&&actionKey(o.action)===actionKey(r.action);})))throw new Error('Reproduction evidence must cover original identity/action semantics');
      c.ownerVerifications.push({...p,eventId:e.id,gateEventId:gate.eventId,reviewEventId:review.eventId,environment:ctx.environment,authority:'owner declaration; not independent effect proof'});
    }else if(e.type==='retest.planned'){
      exact(p,['caseId','originalEvidenceIds','relatedEvidenceIds','legitimateControlIds']);for(const k of ['originalEvidenceIds','relatedEvidenceIds','legitimateControlIds'])refs(p[k]);
      const gate=c.gates.at(-1),ids=[...p.originalEvidenceIds,...p.relatedEvidenceIds,...p.legitimateControlIds];
      if(!gate?.passed||!same([...p.originalEvidenceIds].sort(),[...c.basisEvidenceIds].sort())||new Set(ids).size!==ids.length||check(ctx,ids,c.environment.sourceHash).length)throw new Error('Retest plan needs original, related and distinct legitimate controls on original source');
      if(gate.receipts.some(r=>!same(r.observation,observation(ctx,r.id))))throw new Error('Original gate evidence changed');
      if(p.legitimateControlIds.some(id=>{const status=observation(ctx,id).response.status;return status<200||status>=300;}))throw new Error('Legitimate retest controls must succeed on original build');
      c.retestPlans.push({...p,eventId:e.id,sourceHash:c.environment.sourceHash,receipts:ctx.observations.filter(o=>ids.includes(o.id)).map(o=>receipt(o,ctx))});
    }else if(e.type==='retest.recorded'){
      exact(p,['caseId','evidenceIds','notes']);refs(p.evidenceIds);text(p.notes);const plan=c.retestPlans.at(-1);if(!plan)throw new Error('Retest plan required');
      const fresh=ctx.observations.filter(o=>p.evidenceIds.includes(o.id));
      const environment=fresh[0]?.environment||ctx.environment;
      const reasons=check(ctx,p.evidenceIds,environment.sourceHash);
      if(environment.sourceHash===plan.sourceHash)reasons.push('Build unchanged');
      if(fresh.some(o=>!same(o.environment||ctx.environment,environment)))reasons.push('Mixed retest environments');
      let cursor=0;
      for(const old of plan.receipts){
        const index=fresh.findIndex((o,i)=>i>=cursor&&o.outcome==='complete'&&identityKey(o.identity)===identityKey(old.identity)&&actionKey(o.action)===actionKey(old.action));
        if(index<0)reasons.push(`${old.id}: identity/action semantics unmatched in distinct observation order`);
        else cursor=index+1;
      }
      if(p.evidenceIds.some(id=>plan.receipts.some(r=>r.id===id)))reasons.push('Original evidence reused as retest');
      c.retests.push({...p,eventId:e.id,planEventId:plan.eventId,environment,status:reasons.length?'incomplete-or-mismatched':'matched-observations-only',reasons,repairConclusion:'Not inferred; changed responses or non-reproduction do not establish a fix'});
    }else throw new Error('Unknown case event');
  }
  s.events.push(e);if(Buffer.byteLength(JSON.stringify(s))>8*1024*1024)throw new Error('Casebook output budget exceeded');return s;
}
export function summarizeCasebook(state){
  const s=clone(state),summary={verifiedFindings:[],issuesNeedingOwnerAction:[],unconfirmedLeads:[]};
  for(const c of s.cases){const gate=c.gates.at(-1),review=c.reviews.filter(r=>r.gateEventId===gate?.eventId).at(-1),owner=c.ownerVerifications.filter(v=>v.gateEventId===gate?.eventId&&v.reviewEventId===review?.eventId).at(-1);
    let substatus=!gate?'awaiting-evidence-filter':!gate.passed?'evidence-rejected':!review?'awaiting-declared-review':review.verdict==='rejected'?'review-rejected':owner?.result==='not-reproduced'?'owner-not-reproduced':owner?.result==='inconclusive'?'owner-inconclusive':owner?.result==='reproduced'?'owner-declared-reproduced':'awaiting-owner-verification';
    const actionable=gate?.passed&&review&&review.verdict!=='rejected'&&(!owner||owner.result==='reproduced');
    summary[actionable?'issuesNeedingOwnerAction':'unconfirmedLeads'].push({...c,...(c.consequenceHistory?{consequence:projectConsequence(c)}:{}),substatus,interpretation:'Declared interpretation; independent effect not established'});
  }
  return summary;
}
