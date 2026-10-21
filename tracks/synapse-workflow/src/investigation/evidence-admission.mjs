import {types} from 'node:util';

const MAX_BYTES=1024*1024;
const fail=message=>{throw new Error(`Evidence review: ${message}`);};
function inert(v,depth=0,budget={n:0}){
  if(++budget.n>30000||depth>24)fail('input budget exceeded');
  if(v===null||typeof v==='boolean'||typeof v==='string'&&v.length<=8192||typeof v==='number'&&Number.isFinite(v))return;
  if(!v||typeof v!=='object'||types.isProxy(v))fail('inert JSON required');
  const array=Array.isArray(v);
  if(array?Object.getPrototypeOf(v)!==Array.prototype:![Object.prototype,null].includes(Object.getPrototypeOf(v)))fail('plain JSON required');
  const keys=Reflect.ownKeys(v);
  if(array&&keys.length!==v.length+1)fail('dense arrays required');
  for(const key of keys){
    if(array&&key==='length')continue;
    const d=Object.getOwnPropertyDescriptor(v,key);
    if(typeof key!=='string'||!d.enumerable||!Object.hasOwn(d,'value')||['__proto__','constructor','prototype'].includes(key)||array&&(!/^(0|[1-9][0-9]*)$/.test(key)||Number(key)>=v.length))fail('inert JSON properties required');
    inert(d.value,depth+1,budget);
  }
}
function exact(v,fields){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==fields.length||fields.some(k=>!Object.hasOwn(v,k)))fail('unexpected or missing fields: '+fields.join(','));}
function text(v){if(typeof v!=='string'||!v.trim()||v.length>2000)fail('nonempty bounded text required');}
function list(v,max=200){if(!Array.isArray(v)||v.length>max)fail('bounded array required');}
function texts(v){list(v,30);v.forEach(text);}
const CONTEXT=['environment','instance','build','principal','tenant','role','object'];
function context(v){exact(v,CONTEXT);for(const k of CONTEXT)if(k!=='tenant'||v[k]!==null)text(v[k]);if(!['live','captured-local','synthetic','source'].includes(v.environment))fail('unknown environment');}

// Reject duplicate object keys before JSON.parse can silently discard them.
export function parseEvidenceAdmissionJson(raw){
  if(typeof raw!=='string'||Buffer.byteLength(raw)>MAX_BYTES)fail('JSON byte budget exceeded');
  const stack=[];
  for(let i=0;i<raw.length;i++){
    const c=raw[i];
    if(c==='"'){
      let end=i+1;for(;end<raw.length;end++){if(raw[end]==='\\'){end++;continue;}if(raw[end]==='"')break;}
      const top=stack.at(-1);
      if(top?.kind==='object'&&top.key){let key;try{key=JSON.parse(raw.slice(i,end+1));}catch{fail('invalid JSON');}if(top.keys.has(key))fail('duplicate JSON key');top.keys.add(key);top.key=false;}
      i=end;
    }else if(c==='{')stack.push({kind:'object',key:true,keys:new Set()});
    else if(c==='[')stack.push({kind:'array'});
    else if(c==='}'||c===']')stack.pop();
    else if(c===','&&stack.at(-1)?.kind==='object')stack.at(-1).key=true;
    if(stack.length>24)fail('JSON depth budget exceeded');
  }
  let value;try{value=JSON.parse(raw);}catch{fail('invalid JSON');}inert(value);return value;
}

/** Structural review of declared metadata only. No I/O, oracle execution or promotion. */
export function reviewEvidenceAdmission(record){
  inert(record);if(Buffer.byteLength(JSON.stringify(record))>MAX_BYTES)fail('JSON byte budget exceeded');
  exact(record,['schemaVersion','claim','evidence','requirements','effect','oneStepAway']);
  if(record.schemaVersion!==1)fail('unsupported schema');
  exact(record.claim,['id','statement','context']);text(record.claim.id);text(record.claim.statement);context(record.claim.context);
  list(record.evidence);list(record.requirements);
  const gaps=[];const gap=(code,subject,detail)=>gaps.push({code,subject,detail});
  const catalog=new Map(),requirements=new Map();
  function unknown(c,subject){for(const k of CONTEXT)if(c[k]==='unknown')gap('unknown-context',subject,k);}
  unknown(record.claim.context,'claim');
  for(const e of record.evidence){
    exact(e,['id','context','provenance','completeness','freshness']);text(e.id);context(e.context);
    if(catalog.has(e.id))fail('duplicate evidence ID');catalog.set(e.id,e);
    exact(e.provenance,['producer','collectedAt','artifact','sha256','representation','limitations']);
    for(const k of ['producer','collectedAt','artifact','sha256','representation'])text(e.provenance[k]);texts(e.provenance.limitations);
    if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(e.provenance.collectedAt)||!Number.isFinite(Date.parse(e.provenance.collectedAt))||new Date(e.provenance.collectedAt).toISOString()!==e.provenance.collectedAt)fail('canonical UTC time required');
    if(!/^[a-f0-9]{64}$/.test(e.provenance.sha256))fail('SHA-256 metadata required');
    if(!['complete','partial','missing'].includes(e.completeness)||!['current','stale','unknown'].includes(e.freshness))fail('invalid evidence state');
    unknown(e.context,e.id);
    if(e.completeness!=='complete')gap('incomplete-evidence',e.id,e.completeness);
    if(e.freshness!=='current')gap('stale-or-unknown-evidence',e.id,e.freshness);
  }
  for(const r of record.requirements){
    exact(r,['id','kind','statement','expected','references']);text(r.id);text(r.statement);context(r.expected);list(r.references,30);
    if(!['identity','control','attempt','effect','prerequisite'].includes(r.kind))fail('unknown requirement kind');
    if(requirements.has(r.id))fail('duplicate requirement ID');requirements.set(r.id,r);unknown(r.expected,r.id);
    const seen=new Set();let support=false;
    for(const ref of r.references){
      exact(ref,['evidenceId','relation']);text(ref.evidenceId);
      if(!['supports','contradicts','missing'].includes(ref.relation))fail('invalid reference relation');
      if(seen.has(ref.evidenceId))fail('duplicate evidence reference within requirement');seen.add(ref.evidenceId);
      const e=catalog.get(ref.evidenceId);
      if(!e){gap('dangling-reference',r.id,ref.evidenceId);continue;}
      if(ref.relation==='contradicts')gap('contradictory-evidence',r.id,e.id);
      if(ref.relation==='missing')gap('declared-missing-evidence',r.id,e.id);
      const mismatches=CONTEXT.filter(k=>e.context[k]!==r.expected[k]);
      if(mismatches.length)gap(mismatches.includes('environment')?'environment-mismatch':'context-mismatch',r.id,e.id+': '+mismatches.join(','));
      if(ref.relation==='supports'&&!mismatches.length&&e.completeness==='complete'&&e.freshness==='current'&&!CONTEXT.some(k=>e.context[k]==='unknown'))support=true;
    }
    if(!support)gap('missing-support',r.id,'No complete current context-matched supporting reference');
    // Claim context may differ in actor for legitimate controls, but cannot promote environments.
    if(r.expected.environment!==record.claim.context.environment)gap('claim-environment-mismatch',r.id,'Requirement environment differs from claim');
    for(const key of ['instance','build'])if(r.expected[key]!==record.claim.context[key])gap('claim-context-mismatch',r.id,key+' differs from claim');
    if(['identity','attempt','effect'].includes(r.kind))for(const key of ['principal','tenant','role','object'])if(r.expected[key]!==record.claim.context[key])gap('claim-context-mismatch',r.id,key+' differs from claim');
  }
  for(const kind of ['identity','control','attempt','effect'])if(!record.requirements.some(r=>r.kind===kind))gap('missing-required-kind',kind,'No declared '+kind+' requirement');
  exact(record.effect,['execution','oracle','limitations']);text(record.effect.oracle);texts(record.effect.limitations);
  if(!['performed','unperformed','unknown'].includes(record.effect.execution))fail('invalid effect execution');
  if(record.effect.execution!=='performed')gap('effect-not-performed','effect',record.effect.execution);
  if(record.effect.oracle==='unknown')gap('missing-oracle-description','effect','Oracle is undeclared');
  let oneStepAway=null;
  if(record.oneStepAway!==null){
    const o=record.oneStepAway;exact(o,['declaration','prerequisiteIds','unexecutedStep','reason']);
    if(o.declaration!=='enumerated-prerequisites-only')fail('one-step review must be declared and bounded');
    texts(o.prerequisiteIds);text(o.unexecutedStep);text(o.reason);
    if(new Set(o.prerequisiteIds).size!==o.prerequisiteIds.length)fail('duplicate prerequisite reference');
    if(!o.prerequisiteIds.length)gap('missing-prerequisites','oneStepAway','No enumerated prerequisites');
    for(const id of o.prerequisiteIds)if(requirements.get(id)?.kind!=='prerequisite')gap('invalid-prerequisite-reference','oneStepAway',id);
    for(const r of record.requirements.filter(r=>r.kind==='prerequisite'))if(!o.prerequisiteIds.includes(r.id))gap('unlisted-prerequisite','oneStepAway',r.id);
    if(record.effect.execution!=='unperformed')gap('one-step-execution-conflict','oneStepAway','Final effect must remain declared unperformed');
    oneStepAway={status:'declared-review-only',prerequisiteIds:[...o.prerequisiteIds],exhaustivenessEstablished:false,consequenceEstablished:false};
  }
  return{schemaVersion:1,kind:'evidence-record-structural-review',claimId:record.claim.id,status:gaps.length?'record-gaps':'structural-record-ready',gaps,oneStepAway,consequenceEvaluated:false,limitations:['Declared metadata and reference checks only; no semantic oracle is executed.','No finding, permission, independent verification or demonstrated compromise is established.','Digests and provenance are declarations; artifacts and collector origin are not authenticated.','Prerequisite enumeration may be incomplete; record readiness does not establish truth.']};
}
