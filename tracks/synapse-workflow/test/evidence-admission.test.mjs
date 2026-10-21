import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {reviewEvidenceAdmission as review,parseEvidenceAdmissionJson as parse} from '../src/investigation/evidence-admission.mjs';
import {reviewLocalFile} from '../scripts/review-evidence-admission.mjs';

function fixture(){
  const context={environment:'synthetic',instance:'synthetic-instance',build:'fixture-v1',principal:'actor',tenant:'north',role:'member',object:'synthetic-object'};
  return {schemaVersion:1,claim:{id:'synthetic-only',statement:'Synthetic declared record; not an observed finding',context},
    evidence:['identity','control','attempt','effect','prerequisite'].map(id=>({id,context:{...context,...(id==='control'?{principal:'owner',tenant:'south'}:{})},provenance:{producer:'synthetic fixture author',collectedAt:'2026-10-19T00:00:00.000Z',artifact:'synthetic placeholder only',sha256:'0'.repeat(64),representation:'synthetic metadata',limitations:['No target observation']},completeness:'complete',freshness:'current'})),
    requirements:['identity','control','attempt','effect','prerequisite'].map(kind=>({id:kind,kind,statement:'Declared synthetic '+kind,expected:{...context,...(kind==='control'?{principal:'owner',tenant:'south'}:{})},references:[{evidenceId:kind,relation:'supports'}]})),
    effect:{execution:'performed',oracle:'Synthetic declared comparison only; not executed by reviewer',limitations:['No semantic validation']},oneStepAway:null};
}
const codes=r=>review(r).gaps.map(g=>g.code);
test('deterministic review permits explicit owner control identity and never evaluates consequence',()=>{
  const r=fixture(),before=structuredClone(r),a=review(r);assert.equal(a.status,'structural-record-ready');assert.equal(a.consequenceEvaluated,false);assert.deepEqual(r,before);assert.deepEqual(review(r),a);
});
test('missing controls and empty uncollected references yield named gaps',()=>{
  const r=fixture();r.requirements=r.requirements.filter(x=>x.kind!=='control');r.requirements[0].references=[];assert.ok(codes(r).includes('missing-required-kind'));assert.ok(codes(r).includes('missing-support'));
});
test('wrong principal, object, tenant, role, build and instance cannot support requirement',()=>{
  for(const key of ['principal','tenant','role','object','build','instance']){const r=fixture();r.evidence[0].context[key]='wrong';assert.ok(codes(r).includes('context-mismatch'),key);assert.ok(codes(r).includes('missing-support'),key);}
  const r=fixture();r.requirements[0].expected.build='other';r.evidence[0].context.build='other';assert.ok(codes(r).includes('claim-context-mismatch'));
  const other=fixture();other.requirements[0].expected.principal='other';other.evidence[0].context.principal='other';assert.ok(codes(other).includes('claim-context-mismatch'));
});
test('dangling and duplicate references, IDs, unknown fields rejected or surfaced',()=>{
  const r=fixture();r.requirements[0].references[0].evidenceId='absent';assert.ok(codes(r).includes('dangling-reference'));
  for(const mutate of [x=>x.evidence.push(structuredClone(x.evidence[0])),x=>x.requirements.push(structuredClone(x.requirements[0])),x=>x.requirements[0].references.push({...x.requirements[0].references[0]}),x=>x.unexpected=true]){const v=fixture();mutate(v);assert.throws(()=>review(v));}
});
test('contradiction cannot disappear behind support and missing is explicit',()=>{
  const r=fixture();r.requirements[0].references.push({evidenceId:'attempt',relation:'contradicts'});assert.ok(codes(r).includes('contradictory-evidence'));r.requirements[0].references[1].relation='missing';assert.ok(codes(r).includes('declared-missing-evidence'));
});
test('stale incomplete and unknown provenance context produce gaps',()=>{
  const r=fixture();r.evidence[0].freshness='stale';r.evidence[0].completeness='partial';r.evidence[0].context.build='unknown';const c=codes(r);for(const k of ['stale-or-unknown-evidence','incomplete-evidence','unknown-context','missing-support'])assert.ok(c.includes(k));
});
test('synthetic and captured-local evidence cannot promote live claim',()=>{
  for(const environment of ['synthetic','captured-local']){const r=fixture();r.claim.context.environment='live';for(const e of r.evidence)e.context.environment=environment;for(const q of r.requirements)q.expected.environment='live';assert.ok(codes(r).includes('environment-mismatch'));}
  const r=fixture();r.claim.context.environment='live';assert.ok(codes(r).includes('claim-environment-mismatch'));
});
test('one step review covers all enumerated prerequisites without proving withheld effect',()=>{
  const r=fixture();r.effect.execution='unperformed';r.oneStepAway={declaration:'enumerated-prerequisites-only',prerequisiteIds:['prerequisite'],unexecutedStep:'Unperformed synthetic action',reason:'Withheld; no authority created'};
  const result=review(r);assert.equal(result.oneStepAway.status,'declared-review-only');assert.equal(result.oneStepAway.exhaustivenessEstablished,false);assert.equal(result.oneStepAway.consequenceEstablished,false);assert.ok(codes(r).includes('effect-not-performed'));
  r.oneStepAway.prerequisiteIds=[];assert.ok(codes(r).includes('unlisted-prerequisite'));r.oneStepAway.prerequisiteIds=['identity'];assert.ok(codes(r).includes('invalid-prerequisite-reference'));
  r.oneStepAway.prerequisiteIds=['prerequisite','prerequisite'];assert.throws(()=>review(r));
});
test('withheld effect missing oracle and prerequisite mismatch stay gaps',()=>{
  const r=fixture();r.effect.execution='unknown';r.effect.oracle='unknown';r.evidence.at(-1).context.object='other';assert.ok(codes(r).includes('effect-not-performed'));assert.ok(codes(r).includes('missing-oracle-description'));assert.ok(codes(r).includes('context-mismatch'));
});
test('hostile getters proxies functions prototypes sparse arrays and duplicate JSON keys rejected without invoking accessors',()=>{
  let invoked=false;const getter={};Object.defineProperty(getter,'x',{enumerable:true,get(){invoked=true;throw Error('called');}});assert.throws(()=>review(getter));assert.equal(invoked,false);
  assert.throws(()=>review(new Proxy({}, {ownKeys(){invoked=true;return [];}})));assert.equal(invoked,false);
  for(const value of [()=>{},new Date(),{x:undefined},[,,],JSON.parse('{"__proto__":{}}')])assert.throws(()=>review(value));
  assert.throws(()=>parse('{"x":1,"x":2}'));assert.throws(()=>parse('{"x":1,"\\u0078":2}'));assert.throws(()=>parse('[] garbage'));assert.throws(()=>parse(' '.repeat(1024*1024+1)));
  const r=fixture();assert.deepEqual(parse(JSON.stringify(r)),r);
});
test('local file tool writes JSON exclusively, preserves input and refuses overwrites/URLs',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'evidence-review-'));
  try{const input=join(dir,'input.json'),output=join(dir,'output.json');const raw=JSON.stringify(fixture());await writeFile(input,raw);const run=await reviewLocalFile(input,output);assert.deepEqual(JSON.parse(await readFile(output,'utf8')),run.result);assert.equal(await readFile(input,'utf8'),raw);await assert.rejects(reviewLocalFile(input,output),/EEXIST/);await assert.rejects(reviewLocalFile(input,input));await assert.rejects(reviewLocalFile('https://example.invalid/record'));await assert.rejects(reviewLocalFile('\\\\server\\share\\file'));}finally{await rm(dir,{recursive:true,force:true});}
});
