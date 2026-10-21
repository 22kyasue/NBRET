import fs from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const home=new URL('./',import.meta.url),pins=JSON.parse(await fs.readFile(new URL('snapshots.json',home))),pin=pins.find(p=>p.name==='bullmq');
const source=await fs.readFile(`${pin.root}/src/classes/async-fifo-queue.ts`,'utf8'),transformed=stripTypeScriptTypes(source,{mode:'transform'});
const {AsyncFifoQueue}=await import(`data:text/javascript;base64,${Buffer.from(transformed).toString('base64')}`);
const results=[],diagnostics=[],check=(name,actual,expected)=>{results.push({name,actual,expected});assert.deepEqual(actual,expected,name);};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function bounded(p){let timer;try{return await Promise.race([p.then(value=>({state:'resolved',value})),new Promise(resolve=>{timer=setTimeout(()=>resolve({state:'watchdog'}),30);})]);}finally{clearTimeout(timer);}}
const originalConsoleError=console.error;console.error=(...args)=>diagnostics.push(args.map(a=>a instanceof Error?a.message:String(a)));
try{
 const q=new AsyncFifoQueue(),a=deferred(),b=deferred();q.add(a.promise);q.add(b.promise);check('two pending',q.numTotal(),2);b.resolve('second');await tick();check('resolution order first result',await q.fetch(),'second');check('first still pending',q.numPending(),1);a.resolve('first');await tick();check('resolution order second result',await q.fetch(),'first');check('success empty',q.numTotal(),0);
 const failing=new AsyncFifoQueue(),p=deferred();failing.add(p.promise);const oldFetch=failing.fetch();p.reject(new Error('synthetic failure'));await tick();check('rejected counts empty',[failing.numPending(),failing.numQueued()],[0,0]);check('existing waiter bounded nonresolution',await bounded(oldFetch),{state:'watchdog'});check('fresh fetch returns empty',await failing.fetch(),undefined);failing.add(Promise.resolve('recovery'));check('old waiter recovered',await oldFetch,'recovery');check('recovered counts empty',failing.numTotal(),0);
 const ignoring=new AsyncFifoQueue(true),ignored=deferred();ignoring.add(ignored.promise);const waitIgnoring=ignoring.fetch();ignored.reject(new Error('ignored synthetic failure'));check('ignore errors resolves waiter',await waitIgnoring,undefined);check('ignore errors counts empty',ignoring.numTotal(),0);
 const all=new AsyncFifoQueue(true),early=deferred(),late=deferred();all.add(early.promise);all.add(late.promise);const earlyFetched=all.fetch();const waited=all.waitAll().then(()=>false,()=>true);early.reject(new Error('waitAll synthetic failure'));check('waitAll rejects',await waited,true);await earlyFetched;await tick();check('other work pending after waitAll',all.numPending(),1);late.resolve('late');await tick();await all.fetch();check('waitAll fixture cleaned',all.numTotal(),0);
}finally{console.error=originalConsoleError;}
const sha=b=>createHash('sha256').update(b).digest('hex'),receipt={at:new Date().toISOString(),runtime:process.version,command:'node docs/research/bots-swarms/fifo-lab.mjs',pin,sourceSha256:sha(source),transformedSha256:sha(transformed),scriptSha256:sha(await fs.readFile(new URL('fifo-lab.mjs',home))),substitutions:'None; built-in TypeScript transform only',results,diagnostics,cleanup:'Controlled promises settled and fetched; watchdog timers cleared; no broker, socket, child process or service',limits:'Actual helper class; bounded 30ms nonresolution; not a full worker/broker reachability or production failure claim'};
const out=new URL(`fifo-receipt-${Date.now()}.json`,home);await fs.writeFile(out,JSON.stringify(receipt,null,2),{flag:'wx'});console.log({checks:results.length,passed:true,receipt:out.pathname});
