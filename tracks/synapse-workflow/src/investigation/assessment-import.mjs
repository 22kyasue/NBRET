import { open, lstat, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { validateEngagement, caseBinding, digest, evaluateBundle } from '../assessment/core.mjs';

// Only historical, unreviewed assessment artifacts are supported. No executor is called.
const LIMITS = { 'engagement.json': 1024 * 1024, 'evidence.json': 8 * 1024 * 1024, 'results.json': 8 * 1024 * 1024 };
const fail = message => { const e = new Error(`Assessment import: ${message}`); e.code = 'NBRET_IMPORT'; throw e; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const keys = (v, required, optional = []) => {
  if (!v || typeof v !== 'object' || Array.isArray(v) || required.some(k => !Object.hasOwn(v,k)) || Object.keys(v).some(k => !required.includes(k) && !optional.includes(k))) fail('unsupported or missing fields');
};
const iso = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
function inert(value, depth = 0, budget = { n: 0 }) {
  if (++budget.n > 200000 || depth > 48) fail('JSON structure budget exceeded');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value) && !Object.is(value,-0)) return;
  if (!value || typeof value !== 'object' || (Array.isArray(value) ? Object.getPrototypeOf(value)!==Array.prototype : ![Object.prototype,null].includes(Object.getPrototypeOf(value)))) fail('plain JSON data required');
  const names=Reflect.ownKeys(value);
  if(Array.isArray(value) && Object.keys(value).length!==value.length) fail('dense JSON arrays required');
  for(const name of names){
    if(Array.isArray(value)&&name==='length')continue;
    if(typeof name!=='string'||['__proto__','constructor','prototype'].includes(name)||Array.isArray(value)&&(!/^(0|[1-9][0-9]*)$/.test(name)||Number(name)>=value.length))fail('unsafe JSON field');
    const d=Object.getOwnPropertyDescriptor(value,name);
    if(!d.enumerable||!Object.hasOwn(d,'value'))fail('plain JSON data properties required');
    inert(d.value,depth+1,budget);
  }
}

// JSON.parse intentionally accepts duplicate keys; artifact interpretation must not.
function parse(bytes) {
  const raw=bytes.toString('utf8');
  if(!Buffer.from(raw,'utf8').equals(bytes))fail('invalid UTF-8');
  let value;try{value=JSON.parse(raw);}catch{fail('invalid JSON');}
  const stack=[];
  for(let i=0;i<raw.length;i++){
    const c=raw[i];
    if(c==='"'){
      let end=i+1;for(;end<raw.length;end++){if(raw[end]==='\\'){end++;continue;}if(raw[end]==='"')break;}
      const top=stack.at(-1);
      if(top?.kind==='object'&&top.key){const key=JSON.parse(raw.slice(i,end+1));if(top.keys.has(key))fail('duplicate JSON key');top.keys.add(key);top.key=false;}
      i=end;
    }else if(c==='{'){stack.push({kind:'object',key:true,keys:new Set()});}
    else if(c==='['){stack.push({kind:'array'});}
    else if(c==='}'||c===']'){stack.pop();}
    else if(c===','&&stack.at(-1)?.kind==='object'){stack.at(-1).key=true;}
    if(stack.length>48)fail('JSON nesting budget exceeded');
  }
  inert(value);return value;
}

export function inspectAssessment(artifacts) {
  // Validate property descriptors before destructuring, including the outer envelope.
  inert(artifacts);
  keys(artifacts,['engagement','evidence','results']);
  const {engagement:e,evidence:b,results:r}=artifacts;
  for(const [value,limit]of [[e,LIMITS['engagement.json']],[b,LIMITS['evidence.json']],[r,LIMITS['results.json']]]){if(Buffer.byteLength(JSON.stringify(value))>limit)fail('artifact byte budget exceeded');}
  validateEngagement(e);
  keys(b,['schemaVersion','kind','runId','engagementDigest','startedAt','finishedAt','observations','terminal']);
  if(typeof b.runId!=='string'||!b.runId.trim()||b.runId.length>200||!iso(b.startedAt)||!iso(b.finishedAt)||b.finishedAt<b.startedAt)fail('invalid run identity or timestamps');
  if(!['completed','incomplete'].includes(b.terminal)||!Array.isArray(b.observations)||b.observations.length>e.cases.length)fail('unsupported terminal state or observation population');
  const expected=new Map(e.cases.map(c=>{const binding=caseBinding(e,c);return[digest(binding),binding];}));
  const ids=new Set(),bindings=new Set();
  for(const o of b.observations){
    keys(o,['id','binding','bindingDigest','startedAt','finishedAt','entry','entryDigest']);
    if(typeof o.id!=='string'||!o.id.trim()||o.id.length>200||ids.has(o.id)||bindings.has(o.bindingDigest))fail('duplicate or invalid observation identity');
    if(!iso(o.startedAt)||!iso(o.finishedAt)||o.startedAt< b.startedAt||o.finishedAt<o.startedAt||o.finishedAt>b.finishedAt)fail('invalid observation time bounds');
    if(!expected.has(o.bindingDigest)||!isDeepStrictEqual(expected.get(o.bindingDigest),o.binding)||digest(o.binding)!==o.bindingDigest||digest(o.entry)!==o.entryDigest)fail('unknown, changed or mismatched observation binding/bytes');
    ids.add(o.id);bindings.add(o.bindingDigest);
    keys(o.entry,[],['elapsedMs','response','errorCode','redirect']);
    if(!Object.hasOwn(o.entry,'errorCode')&&!Object.hasOwn(o.entry,'response'))fail('response or explicit error required');
    if(o.entry.elapsedMs!==undefined&&(!Number.isFinite(o.entry.elapsedMs)||o.entry.elapsedMs<0))fail('invalid elapsed time');
    if(o.entry.errorCode!==undefined){
      if(typeof o.entry.errorCode!=='string'||!/^[A-Z_]{1,100}$/.test(o.entry.errorCode)||o.entry.response!==undefined)fail('ambiguous error/response evidence');
      if(b.terminal==='completed')fail('completed run contains an error');
    }
    if(o.entry.response!==undefined){
      if(!Number.isFinite(o.entry.elapsedMs)||o.entry.elapsedMs<0)fail('response requires measured elapsed time');
      const response=o.entry.response;keys(response,['status','headers','bytes','wireBytes'],['body','omitted']);
      if(!Number.isSafeInteger(response.status)||response.status<100||response.status>599||!Number.isSafeInteger(response.bytes)||response.bytes<0||!Number.isSafeInteger(response.wireBytes)||response.wireBytes<0)fail('invalid response metadata');
      if(!response.headers||typeof response.headers!=='object'||Array.isArray(response.headers)||Object.keys(response.headers).length)fail('unsupported retained response headers');
      if((Object.hasOwn(response,'body')?1:0)+(Object.hasOwn(response,'omitted')?1:0)!==1||response.omitted!==undefined&&response.omitted!=='non-structured-payload')fail('ambiguous structured response completeness');
    }
    if(o.entry.redirect!==undefined){keys(o.entry.redirect,['followed']);if(o.entry.redirect.followed!==false)fail('unsupported redirect evidence');}
  }
  if(b.terminal==='completed'&&bindings.size!==expected.size)fail('completed run missing observations');
  const checked=evaluateBundle(e,b);
  keys(r,['schemaVersion','kind','engagementId','engagementDigest','evidenceDigest','evaluatedAt','counts','executionStatus','status','tests','candidates','exclusions','limitations']);
  if(!iso(r.evaluatedAt)||r.evaluatedAt<b.finishedAt)fail('invalid result timestamp');
  for(const field of ['schemaVersion','kind','engagementId','engagementDigest','evidenceDigest','counts','executionStatus','status','tests','candidates','exclusions','limitations']){
    if(!isDeepStrictEqual(r[field],checked[field]))fail('saved results differ from re-evaluated artifacts; reviewed results are unsupported');
  }
  return {schemaVersion:1,kind:'nbret-assessment-inspection',inspectorVersion:1,engagementId:e.id,
    environment:structuredClone(e.environment),policyRevision:e.policyRevision,
    engagementDigest:digest(e),evidenceDigest:digest(b),resultsDigest:digest(r),
    status:checked.status,executionStatus:checked.executionStatus,counts:checked.counts,
    cases:checked.tests.map(t=>({id:t.id,actor:t.actor,bindingDigest:t.bindingDigest,observationId:t.observationId,outcome:t.outcome})),
    candidates:checked.candidates.map(c=>({id:c.id,caseId:c.caseId,status:c.status,controlsPassed:c.controlsPassed,observationId:c.observationId,reviewRequired:true})),
    missingCaseIds:e.cases.filter(c=>!bindings.has(digest(caseBinding(e,c)))).map(c=>c.id),
    limitations:['Historical artifact inspection only; no requests, models, browsers or scanners invoked.',
      'Matching hashes establish consistency, not trusted origin, real session identity or independently observed effect.',
      'Only unreviewed results matching the current assessment evaluator are accepted; no review metadata is promoted.',
      'Explicit cases only; no discovery, complete coverage, current authorization or repair-success claim.',
      'Sources may contain confidential data; this summary omits response bodies and request details but is not a general sanitizer.']};
}

export async function inspectAssessmentDirectory(directory) {
  const info=await lstat(directory);if(!info.isDirectory()||info.isSymbolicLink())fail('source must be a regular directory');
  const root=await realpath(directory),values={},sourceFiles={};
  for(const[name,limit]of Object.entries(LIMITS)){
    const filename=join(root,name),before=await lstat(filename);
    if(!before.isFile()||before.isSymbolicLink()||before.size>limit)fail('source artifact is not a bounded regular file');
    const handle=await open(filename,'r');let bytes;
    try{
      const opened=await handle.stat();if(opened.ino!==before.ino||opened.dev!==before.dev||!opened.isFile())fail('source changed before read');
      const buffer=Buffer.alloc(limit+1);let size=0;
      while(size<buffer.length){const part=await handle.read(buffer,size,buffer.length-size,null);if(!part.bytesRead)break;size+=part.bytesRead;}
      const after=await handle.stat();
      if(size>limit||size!==before.size||after.size!==before.size||after.mtimeMs!==before.mtimeMs||after.ctimeMs!==before.ctimeMs)fail('source changed or exceeded read budget');
      bytes=buffer.subarray(0,size);
    }finally{await handle.close();}
    const still=await lstat(filename);if(still.isSymbolicLink()||still.ino!==before.ino||still.dev!==before.dev||still.size!==before.size||still.mtimeMs!==before.mtimeMs||still.ctimeMs!==before.ctimeMs)fail('source changed during read');
    values[{'engagement.json':'engagement','evidence.json':'evidence','results.json':'results'}[name]]=parse(bytes);
    sourceFiles[name]={sha256:sha(bytes),bytes:bytes.length};
  }
  return{...inspectAssessment(values),sourceFiles};
}
