import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { runGuidedInvestigation } from '../src/practice/investigate.mjs';

test('guided investigation preserves real actor attribution, state reads and bounded evidence with explicit limits',async t=>{
  const parent=await mkdtemp(join(tmpdir(),'nbret-guided-'));
  t.after(()=>rm(parent,{recursive:true,force:true}));
  const result=await runGuidedInvestigation({outDir:join(parent,'run')});
  assert.equal(result.report.executionError,null);assert.equal(result.report.appClosed,true);
  assert.equal(result.report.failed,0);assert.equal(result.report.passed,21);assert.equal(result.report.receivedRequests,22);
  const load=async name=>JSON.parse(await readFile(join(result.outDir,name),'utf8'));
  const evidence=await load('evidence.json'),digests=await load('digests.json');
  assert.equal(evidence.length,22);
  for(let index=0;index<evidence.length;index++){
    const observation=evidence[index],received=result.report.requestLog[index];
    assert.equal(observation.identity.principal,received.actorId||'anonymous');
    assert.equal(observation.request.path,received.path);assert.equal(observation.request.method,received.method);
    assert.equal(new URL(observation.environment.origin).hostname,'127.0.0.1');
    assert.match(observation.response.bodySha256,/^[a-f0-9]{64}$/);
  }
  assert.equal(evidence.find(e=>e.id==='approver-session').identity.principal,'anonymous');
  assert.equal(evidence.find(e=>e.id==='approver-profile').identity.principal,'carol');
  assert.equal(evidence.find(e=>e.id==='foreign-submit-state').response.value.order.state,'draft');
  assert.equal(evidence.find(e=>e.id==='valid-final-state').response.value.order.state,'approved');
  assert.equal(evidence.find(e=>e.id==='repeat-submit-state').response.value.order.state,'approved');
  for(const h of result.report.hypotheses){assert.equal(h.disposition,'not-reproduced-in-selected-cases');for(const id of h.checks)assert.ok(evidence.find(e=>e.id===id));}
  for(const[name,digest]of Object.entries(digests))assert.equal(createHash('sha256').update(await readFile(join(result.outDir,name))).digest('hex'),digest);
  const text=JSON.stringify(evidence);assert.ok(!text.includes('Bearer '));assert.ok(!text.includes('practice_session='));
  assert.match(result.report.limits.join(' '),/not raw HTTP/);
  await assert.rejects(runGuidedInvestigation({outDir:result.outDir}),/exist/i);
});
