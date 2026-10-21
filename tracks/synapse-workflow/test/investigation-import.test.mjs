import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, lstat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { engagementTemplate } from '../src/assessment/template.mjs';
import { caseBinding, digest, evaluateBundle } from '../src/assessment/core.mjs';
import { inspectAssessment, inspectAssessmentDirectory } from '../src/investigation/assessment-import.mjs';
import { createJournal, readJournal } from '../src/investigation/journal.mjs';

function fixture(candidate=false){
  const engagement=engagementTemplate('http://127.0.0.1:39999');
  const evidence={schemaVersion:1,kind:'nbret-assessment-evidence',runId:'synthetic-records',engagementDigest:digest(engagement),
    startedAt:'2026-10-18T00:00:00.000Z',finishedAt:'2026-10-18T00:00:02.000Z',terminal:'completed',
    observations:engagement.cases.map((c,i)=>{
      const binding=caseBinding(engagement,c);
      const body=i===0?{order:{owner:'bob',privateText:'PRIVATE_BODY_CANARY'}}:candidate?{order:{owner:'bob'}}:{};
      const entry={elapsedMs:5,response:{status:i===0?200:403,headers:{},bytes:100,wireBytes:100,body}};
      return{id:`observation-${i}`,binding,bindingDigest:digest(binding),startedAt:'2026-10-18T00:00:00.100Z',
        finishedAt:'2026-10-18T00:00:01.000Z',entry,entryDigest:digest(entry)};
    })};
  return{engagement,evidence,results:evaluateBundle(engagement,evidence)};
}
const refresh=f=>{f.evidence.engagementDigest=digest(f.engagement);f.results=evaluateBundle(f.engagement,f.evidence);return f;};
async function save(root,f){for(const[name,key]of Object.entries({'engagement.json':'engagement','evidence.json':'evidence','results.json':'results'}))await writeFile(join(root,name),JSON.stringify(f[key],null,2));}

test('historical inspection re-evaluates identity-bound cases without exporting raw bodies or promoting findings',()=>{
  const f=fixture(true),before=JSON.stringify(f),result=inspectAssessment(f);
  assert.equal(JSON.stringify(f),before);
  assert.deepEqual(result.counts,{passed:1,failed:1,incomplete:0});
  assert.equal(result.candidates[0].status,'reproduced-candidate');
  assert.equal(result.candidates[0].reviewRequired,true);
  assert.match(result.limitations.join(' '),/not trusted origin/);
  assert.ok(!JSON.stringify(result).includes('PRIVATE_BODY_CANARY'));
  assert.equal(inspectAssessment(fixture()).candidates.length,0);
});

test('wrong identity, altered bytes, duplicate identities/bindings and orphan observations reject even after result recomputation',()=>{
  const mutations=[
    f=>{f.evidence.observations[0].binding.actor.principal='other';},
    f=>{f.evidence.observations[0].entry.response.body.order.owner='changed';},
    f=>{f.evidence.observations[1].id=f.evidence.observations[0].id;},
    f=>{f.evidence.observations[1]=structuredClone(f.evidence.observations[0]);f.evidence.observations[1].id='another-id';},
    f=>{f.evidence.observations[0].binding.caseId='orphan';f.evidence.observations[0].bindingDigest=digest(f.evidence.observations[0].binding);},
    f=>{f.evidence.observations.pop();},
    f=>{f.evidence.observations[0].entry.response.truncated=true;f.evidence.observations[0].entryDigest=digest(f.evidence.observations[0].entry);},
  ];
  for(const mutate of mutations){const f=fixture();mutate(f);refresh(f);assert.throws(()=>inspectAssessment(f),/Assessment import/);}
});

test('errors, missing observations, redaction and failed controls never become a clean or confirmed outcome',()=>{
  const missing=fixture(true);missing.evidence.terminal='incomplete';missing.evidence.observations.shift();refresh(missing);
  const incomplete=inspectAssessment(missing);
  assert.equal(incomplete.status,'incomplete');assert.deepEqual(incomplete.missingCaseIds,['owner-access']);
  assert.equal(incomplete.candidates[0].status,'inconclusive');assert.equal(incomplete.candidates[0].controlsPassed,false);
  const error=fixture();error.evidence.terminal='incomplete';error.evidence.observations[0].entry={errorCode:'TRANSPORT_FAILED'};
  error.evidence.observations[0].entryDigest=digest(error.evidence.observations[0].entry);refresh(error);
  assert.equal(inspectAssessment(error).counts.incomplete,1);
  const ambiguous=fixture();ambiguous.evidence.terminal='incomplete';ambiguous.evidence.observations[0].entry.errorCode='TRANSPORT_FAILED';
  ambiguous.evidence.observations[0].entryDigest=digest(ambiguous.evidence.observations[0].entry);refresh(ambiguous);
  assert.throws(()=>inspectAssessment(ambiguous),/ambiguous error/);
  const redacted=fixture();redacted.evidence.observations[0].entry.response.body.order.owner='[REDACTED]';
  redacted.evidence.observations[0].entryDigest=digest(redacted.evidence.observations[0].entry);refresh(redacted);
  assert.equal(inspectAssessment(redacted).counts.incomplete,1);
});

test('unreviewed result contract rejects fabricated verdicts, review labels, running checkpoints and missing measurements',()=>{
  const changed=fixture();changed.results.tests[0].outcome='failed';assert.throws(()=>inspectAssessment(changed),/results differ/);
  const reviewed=fixture(true);reviewed.results.candidates[0].status='confirmed';assert.throws(()=>inspectAssessment(reviewed),/reviewed results/);
  const early=fixture();early.results.evaluatedAt='2026-10-17T00:00:00.000Z';assert.throws(()=>inspectAssessment(early),/timestamp/);
  const running=fixture();running.evidence.terminal='running';assert.throws(()=>inspectAssessment(running),/terminal/);
  const timing=fixture();timing.engagement.cases[1].expect.maxDurationMs=100;
  for(const o of timing.evidence.observations){o.binding=caseBinding(timing.engagement,timing.engagement.cases.find(c=>c.id===o.binding.caseId));o.bindingDigest=digest(o.binding);}
  delete timing.evidence.observations[1].entry.elapsedMs;timing.evidence.observations[1].entryDigest=digest(timing.evidence.observations[1].entry);refresh(timing);
  assert.equal(timing.results.candidates.length,1,'existing evaluator can treat missing timing as failure');
  assert.throws(()=>inspectAssessment(timing),/elapsed time/);
});

test('direct-object API rejects accessors, cycles, nonindex arrays and excessive nesting',()=>{
  const outer={evidence:{},results:{}};let outerRan=false;
  Object.defineProperty(outer,'engagement',{enumerable:true,get(){outerRan=true;return{};}});
  assert.throws(()=>inspectAssessment(outer),/data properties/);assert.equal(outerRan,false);
  const getter=fixture();let ran=false;Object.defineProperty(getter.results,'counts',{enumerable:true,get(){ran=true;return{};}});
  assert.throws(()=>inspectAssessment(getter),/data properties/);assert.equal(ran,false);
  const extra=fixture();extra.results.tests.extra='not JSON';assert.throws(()=>inspectAssessment(extra),/dense|unsafe/);
  const cyclic=fixture();cyclic.results.self=cyclic.results;assert.throws(()=>inspectAssessment(cyclic),/budget/);
});

test('directory inspection records original byte hashes and rejects duplicate keys, invalid UTF8, links and oversize files',async()=>{
  const root=await mkdtemp(join(tmpdir(),'nbret-import-'));
  try{
    const f=fixture();await save(root,f);
    const result=await inspectAssessmentDirectory(root);assert.equal(result.sourceFiles['evidence.json'].sha256.length,64);
    const filename=join(root,'evidence.json'),original=await readFile(filename);
    await writeFile(filename,original.toString().replace('"runId": "synthetic-records"','"runId": "synthetic-records", "runId": "synthetic-records"'));
    await assert.rejects(inspectAssessmentDirectory(root),/duplicate JSON key/);
    await writeFile(filename,Buffer.concat([original,Buffer.from([255])]));await assert.rejects(inspectAssessmentDirectory(root),/UTF-8/);
    await writeFile(filename,' '.repeat(8*1024*1024+1));await assert.rejects(inspectAssessmentDirectory(root),/bounded/);
    await writeFile(filename,original);
    const alias=join(root,'alias');await symlink(root,alias,'junction');await assert.rejects(inspectAssessmentDirectory(alias),/regular directory/);
    // Windows file-symlink creation requires a privilege not held here. A junction
    // at the expected artifact path still exercises no-follow/non-regular rejection.
    await rm(filename);await symlink(root,filename,'junction');
    await assert.rejects(inspectAssessmentDirectory(root),/regular file/);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('CLI inspection stays offline, produces bounded summary and refuses journal/source nested destinations',async()=>{
  const root=await mkdtemp(join(tmpdir(),'nbret-import-cli-'));
  try{
    const source=join(root,'source');await mkdir(source);await save(source,fixture());
    const cli=resolve('src/investigation/cli.mjs');const run=out=>spawnSync(process.execPath,[cli,'inspect-assessment','--source',source,'--out',out],{windowsHide:true,encoding:'utf8',timeout:10000});
    const out=join(root,'inspection');const result=run(out);assert.equal(result.status,0,result.stderr);
    assert.equal(JSON.parse(result.stdout).offlineOnly,true);assert.equal(JSON.parse(await readFile(join(out,'inspection.json'),'utf8')).counts.passed,2);
    assert.equal(run(out).status,2);assert.equal(run(join(source,'inspection')).status,2);
    await assert.rejects(lstat(join(source,'inspection')),{code:'ENOENT'});
    const journal=join(root,'journal');await createJournal(journal,{id:'generic-journal'});
    assert.equal(run(join(journal,'inspection')).status,2);
    assert.equal((await readJournal(journal)).revision,0);
  }finally{await rm(root,{recursive:true,force:true});}
});
