import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/bots-swarms');
const pin=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))).find(x=>x.name==='bullmq');
const file='src/classes/queue.ts',bytes=await fs.readFile(path.join(pin.root,file));
const sha256=createHash('sha256').update(bytes).digest('hex');
const q=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
assert.equal(sha256,q.find(x=>x.repo==='bullmq'&&x.path===file).sha256);
const source=bytes.toString(),begin=source.indexOf('  async clean('),end=source.indexOf('\n  /**',begin);
assert.ok(begin>0&&end>begin);
const method=source.slice(begin,end),code=stripTypeScriptTypes(`class Fixture {${method}}; Fixture`,{mode:'strip'});
const Fixture=vm.runInNewContext(code,{SpanKind:{INTERNAL:'internal'},TelemetryAttributes:{QueueGrace:'grace',JobType:'type',QueueCleanLimit:'limit',QueueCleanCount:'count'}});
function fixture(){const f=new Fixture(),calls=[],events=[];f.name='synthetic';f.trace=async(_kind,_op,_dest,fn)=>fn();f.emit=(...args)=>events.push(args);f.backend={cleanJobsByState:async(state,timestamp,limit)=>{calls.push({state,timestamp,limit});return Array.from({length:limit},(_,i)=>`synthetic-${calls.length}-${i}`);}};return {f,calls,events};}
const checks=[];function check(name,ok){checks.push({name,pass:!!ok});assert.ok(ok,name);}
const a=fixture(),overflow=await a.f.clean(0,15000,'waiting');
check('nonmultiple total sends two unchanged10000 batches',a.calls.length===2&&a.calls.every(x=>x.limit===10000));
check('nonmultiple total returns20000 fabricated IDs',overflow.length===20000);
const b=fixture(),exact=await b.f.clean(0,10000,'completed');
check('exact batch total makes one call',b.calls.length===1&&exact.length===10000);
check('waiting normalized and each batch emitted',a.calls.every(x=>x.state==='wait')&&a.events.length===2&&a.events.every(x=>x[0]==='cleaned'&&x[2]==='wait'));
const target=path.join(home,`queue-clean-contract-receipt-${Date.now()}.json`);
await fs.writeFile(target,JSON.stringify({at:new Date().toISOString(),node:process.version,file,sha256,methodHash:createHash('sha256').update(method).digest('hex'),adaptation:'Only Queue.clean extracted; built-in TypeScript stripping; inert backend, trace and events',scope:'fabricated return IDs only; no actual deletion or datastore',checks,calls:a.calls,exactCalls:b.calls,allSyntheticPromisesSettled:true,noTimersOrServicesStarted:true},null,2),{flag:'wx'});
console.log({receipt:target,checks:checks.length});
