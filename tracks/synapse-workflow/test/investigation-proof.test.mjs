import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {evaluateProof} from '../src/investigation/proof.mjs';
import {collectProofFixture,fixturePlan} from '../src/practice/proof-baseline.mjs';

test('actual loopback controls distinguish denial, disclosure and denial containing data',async()=>{
  for(const mode of ['isolated','disclosed','denial-with-data']){
    const f=await collectProofFixture(mode),before=structuredClone(f);
    const r=evaluateProof(fixturePlan(),{observations:f.observations,environment:{sourceHash:f.sourceHash}});
    assert.equal(r.status,mode==='isolated'?'not-demonstrated':'demonstrated-in-collected-evidence');
    assert.equal(f.closed,true);assert.equal(f.requestLog.length,4);assert.deepEqual(f,before);
    for(const o of f.observations){const b=Buffer.from(f.bodies[o.id]);assert.equal(o.response.bodySha256,createHash('sha256').update(b).digest('hex'));assert.equal(o.response.bodyBytes,b.length);}
    assert.match(r.limitations.join(' '),/not authenticated independence/);
  }
});

test('effect predicate rejects plausible wrong success and names missing requirements',async t=>{
  const f=await collectProofFixture('disclosed'),ctx={observations:f.observations,environment:{sourceHash:f.sourceHash}};
  const mutations=[
    ['success status without contents',c=>c.observations[3].response.value={ok:true},'not-demonstrated'],
    ['quoted expected text',c=>c.observations[3].response.value={echo:JSON.stringify(c.observations[2].response.value)},'not-demonstrated'],
    ['wrong object',c=>c.observations[3].action.objectId='WO-S202','inconclusive'],
    ['wrong principal',c=>c.observations[3].identity.principal='bob','inconclusive'],
    ['wrong tenant',c=>c.observations[3].identity.tenant='south','inconclusive'],
    ['wrong role',c=>c.observations[3].identity.role='approver','inconclusive'],
    ['wrong request path',c=>c.observations[3].request.path='/api/work-orders/WO-S202','inconclusive'],
    ['stale source',c=>c.observations[3].environment.sourceHash='old','inconclusive'],
    ['mixed instance',c=>c.observations[3].environment.id='other','inconclusive'],
    ['incomplete transport',c=>c.observations[3].transport.complete=false,'inconclusive'],
    ['failed owner control',c=>c.observations[2].response.status=403,'inconclusive'],
    ['partial object',c=>delete c.observations[3].response.value.order.description,'not-demonstrated'],
    ['absent receipt',c=>c.observations.pop(),'inconclusive'],
  ];
  for(const[name,mutate,status]of mutations)await t.test(name,()=>{const c=structuredClone(ctx);mutate(c);for(const o of c.observations){o.response.bodyText=JSON.stringify(o.response.value);const bytes=Buffer.from(o.response.bodyText);o.response.bodyBytes=bytes.length;o.response.bodySha256=createHash('sha256').update(bytes).digest('hex');}const r=evaluateProof(fixturePlan(),c);assert.equal(r.status,status);if(status==='inconclusive')assert.ok(r.missingRequirements.length);});
  const tampered=structuredClone(ctx);tampered.observations[3].response.value={ok:true};assert.equal(evaluateProof(fixturePlan(),tampered).status,'inconclusive');
  const denial=await collectProofFixture('isolated'),forged={observations:denial.observations,environment:{sourceHash:denial.sourceHash}};forged.observations[3].response.value=structuredClone(forged.observations[2].response.value);assert.equal(evaluateProof(fixturePlan(),forged).status,'inconclusive');
  const getter={};Object.defineProperty(getter,'caseId',{enumerable:true,get(){throw Error('Getter executed');}});assert.throws(()=>evaluateProof(getter,ctx),/inert JSON/);
  assert.throws(()=>evaluateProof({...fixturePlan(),arbitraryExecutor:'outside'},ctx),/Invalid proof fields/);
});
