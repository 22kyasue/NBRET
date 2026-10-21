import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createWorkbench,readWorkbench} from '../src/practice/workbench.mjs';

test('stopping preserves unresolved owner work that was derived after the last completed action',async t=>{
  const root=await mkdtemp(join(tmpdir(),'synapse-stop-ledger-'));
  const session=await createWorkbench({outDir:join(root,'session')});
  t.after(async()=>{await session.close();await rm(root,{recursive:true,force:true});});
  await session.step({expectedRevision:session.state().revision});
  const page=session.state().observations[0];
  await session.step({expectedRevision:session.state().revision,proposal:{question:'Review an undiscovered object branch',reason:'Explicitly exercise the capability gate without target traffic.',evidenceIds:[page.id],action:{kind:'order',actor:'alice',objectId:'WO-N101'}}});
  const before=session.state(),pending=before.ownerRequests.map(r=>r.id);
  assert.ok(pending.length>before.requests.length,'the selector has derived owner work not yet persisted');
  const stopped=await session.stop('Owner stops after the blocked branch');
  for(const id of pending)assert.ok(stopped.ownerRequests.some(r=>r.id===id),'stop must retain every pending owner request');
  const replay=await readWorkbench(session.outDir);
  for(const id of pending)assert.ok(replay.requests.some(r=>r.id===id),'owner work survives reopening the saved journal');
  assert.equal(replay.targetClosed,true);assert.equal(replay.targetRequestCount,1);
});
