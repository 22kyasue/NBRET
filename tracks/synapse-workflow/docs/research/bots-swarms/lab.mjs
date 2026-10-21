import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const Limiter=require('../../../.tools/bots-swarms/rate-limiter-flexible/lib/RateLimiterMemory.js');
const results=[];
const check=(name,actual,expected)=>{results.push({name,actual,expected});assert.deepEqual(actual,expected,name);};
async function evaluate(policy,fixtures){const limiter=new Limiter({points:2,duration:60});let allowed=0,denied=0;for(const f of fixtures){try{await limiter.consume(f[policy]);allowed++;}catch{denied++;}}return {allowed,denied};}
const shared=Array.from({length:4},(_,i)=>({principal:`synthetic-${i}`,address:'shared-egress'}));
const changing=Array.from({length:4},(_,i)=>({principal:'synthetic-A',address:`fixture-egress-${i}`}));
check('shared address / address policy',await evaluate('address',shared),{allowed:2,denied:2});
check('shared address / principal policy',await evaluate('principal',shared),{allowed:4,denied:0});
check('changing labels / address policy',await evaluate('address',changing),{allowed:4,denied:0});
check('changing labels / principal policy',await evaluate('principal',changing),{allowed:2,denied:2});
let separate=0;for(let i=0;i<2;i++){const l=new Limiter({points:2,duration:60});for(let j=0;j<2;j++){await l.consume('A');separate++;}}
check('independent limiter scope',separate,4);
const principals=new Map([['synthetic-token-A',{id:'A',tenant:'A'}],['synthetic-token-B',{id:'B',tenant:'B'}]]);
const revoked=new Set(),limiter=new Limiter({points:2,duration:60});
const server=createServer(async(req,res)=>{const p=principals.get(req.headers.authorization);if(!p||revoked.has(p.id)){res.writeHead(401).end();return;}const tenant=req.url.slice(1);if(tenant!==p.tenant){res.writeHead(403).end();return;}try{await limiter.consume(p.id);}catch{res.writeHead(429).end();return;}res.setHeader('Content-Type','application/json');res.end(JSON.stringify({tenant:p.tenant,owner:p.id}));});
let cleanup=false;
try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const request=async(tenant,token)=>{const r=await fetch(`${base}/${tenant}`,{headers:token?{authorization:token}:{},redirect:'error'});return {status:r.status,body:await r.text()};};
 check('missing identity',(await request('A')).status,401);
 check('cross tenant denied',(await request('B','synthetic-token-A')).status,403);
 check('first permitted request',await request('A','synthetic-token-A'),{status:200,body:'{"tenant":"A","owner":"A"}'});
 check('second permitted request',(await request('A','synthetic-token-A')).status,200);
 check('quota exhausted',(await request('A','synthetic-token-A')).status,429);
 revoked.add('B');check('revocation',(await request('B','synthetic-token-B')).status,401);
}finally{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));cleanup=!server.listening;}
// Deterministic scheduler model: logical clock, no real child processes.
let now=0,serial=0,effects=0;const committed=new Set();
const job={attempts:0,max:2,lease:null,cancelled:false};
function acquire(){if(job.cancelled||job.attempts>=job.max||(job.lease&&job.lease.until>now))return null;job.attempts++;job.lease={token:++serial,until:now+10};return job.lease.token;}
function heartbeat(token){if(job.cancelled||job.lease?.token!==token||job.lease.until<=now)return false;job.lease.until=now+10;return true;}
function commit(token,key){if(job.cancelled||job.lease?.token!==token||job.lease.until<=now)return false;if(!committed.has(key)){committed.add(key);effects++;}return true;}
const first=acquire();now=5;check('heartbeat current lease',heartbeat(first),true);now=11;check('heartbeat extends ownership',acquire(),null);now=16;const second=acquire();check('expired lease reassigned',second,2);check('stale lease commit',commit(first,'op1'),false);check('current commit',commit(second,'op1'),true);check('duplicate commit',commit(second,'op1'),true);check('idempotent side effects',effects,1);job.cancelled=true;check('cancel blocks commit',commit(second,'op2'),false);check('cancel blocks heartbeat',heartbeat(second),false);check('cancel blocks acquisition',acquire(),null);job.cancelled=false;now=30;check('attempt budget',acquire(),null);
check('server cleanup',cleanup,true);
const home=new URL('./',import.meta.url),snapshots=JSON.parse(await fs.readFile(new URL('snapshots.json',home)));
const hash=b=>createHash('sha256').update(b).digest('hex');
const dependencies=['lib/RateLimiterMemory.js','lib/RateLimiterAbstract.js','lib/RateLimiterRes.js','lib/component/MemoryStorage/MemoryStorage.js','lib/component/MemoryStorage/Record.js'];
const pin=snapshots.find(p=>p.name==='rate-limiter-flexible');const hashes=[];
for(const file of dependencies)hashes.push({file,sha256:hash(await fs.readFile(`${pin.root}/${file}`))});
const receipt={at:new Date().toISOString(),runtime:process.version,platform:process.platform,command:'node docs/research/bots-swarms/lab.mjs',scriptSha256:hash(await fs.readFile(new URL('lab.mjs',home))),pin,hashes,results,cleanup,limits:'Synthetic fixtures; scheduler is a toy model; no population accuracy, browser isolation, distributed datastore or BullMQ runtime claim.'};
const output=new URL(`lab-receipt-${Date.now()}.json`,home);await fs.writeFile(output,JSON.stringify(receipt,null,2),{flag:'wx'});console.log({checks:results.length,passed:true,cleanup,receipt:output.pathname});
