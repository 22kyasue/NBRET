import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root='../../../.tools/bots-swarms/rate-limiter-flexible/lib/';
const RedisLimiter=require(root+'RateLimiterRedis.js');
const Compatible=require(root+'RateLimiterCompatibleAbstract.js');
const Res=require(root+'RateLimiterRes.js');
const checks=[];
function check(name,actual,expected){assert.deepEqual(actual,expected,name);checks.push({name,actual,expected,pass:true});}
async function rejection(p){try{await p;throw Error('Expected rejection');}catch(e){return e;}}
class Insurance extends Compatible{
  constructor(){super();this.used=0;this.blockDuration=0;this.execEvenly=false;}
  set blockDuration(v){this.bd=v;} get blockDuration(){return this.bd;}
  set execEvenly(v){this.ee=v;} get execEvenly(){return this.ee;}
  consume(){this.used++;return this.used<=2?Promise.resolve(new Res(2-this.used,1000,this.used)):Promise.reject(new Res(0,1000,this.used));}
}
function client(result=[1,1000],extra={}){return {calls:[],definitions:[],defineCommand(n,d){this.definitions.push({n,d});},async rlflxIncr(args){this.calls.push(args);if(result instanceof Error)throw result;return result;},...extra};}
const closed=client([1,1000],{status:'closed'});
let limiter=new RedisLimiter({storeClient:closed,points:2,duration:1,rejectIfRedisNotReady:true});
check('recognized closed client rejects',(await rejection(limiter.consume('synthetic'))).message,'Redis connection is not ready');
check('closed client command count',closed.calls.length,0);
const unchecked=client([1,1000],{status:'closed'});
await new RedisLimiter({storeClient:unchecked,points:2,duration:1}).consume('synthetic');
check('default option calls supplied closed client',unchecked.calls.length,1);
const unknown=client();await new RedisLimiter({storeClient:unknown,points:2,duration:1,rejectIfRedisNotReady:true}).consume('synthetic');
check('unknown readiness shape reaches supplied client',unknown.calls.length,1);
const boolean=client([1,1000],{isReady:false});
check('boolean false readiness rejects',(await rejection(new RedisLimiter({storeClient:boolean,points:2,duration:1,rejectIfRedisNotReady:true}).consume('synthetic'))).message,'Redis connection is not ready');
const insurance=new Insurance();
const over=new RedisLimiter({storeClient:client([3,1000]),points:2,duration:1,insuranceLimiter:insurance});
check('over budget is quota result',(await rejection(over.consume('synthetic'))) instanceof Res,true);
check('quota rejection does not consume fallback',insurance.used,0);
const failing=client(new Error('synthetic storage failure'));
const fallback=new RedisLimiter({storeClient:failing,points:1,duration:1,insuranceLimiter:insurance});
check('storage Error consumes fallback',(await fallback.consume('synthetic')).remainingPoints,1);
check('fallback count',insurance.used,1);
const fleet=[new Insurance(),new Insurance()];
const results=[];
for(const i of fleet){const l=new RedisLimiter({storeClient:client(new Error('synthetic outage')),points:1,duration:1,insuranceLimiter:i});for(let n=0;n<2;n++)results.push(await l.consume('same-synthetic-principal'));}
check('two independent synthetic fallback budgets allow four',results.length,4);
const recorded=client([1,1000]);
const named=new RedisLimiter({storeClient:recorded,points:2,duration:1,keyPrefix:'synthetic-tenant'});
check('synthetic success remaining quota',(await named.consume('user')).remainingPoints,1);
check('prefix reaches command',recorded.calls[0][0],'synthetic-tenant:user');
check('registered script includes increment and expiry', ['set','incrby','pttl'].every(x=>recorded.definitions[0].d.lua.includes("redis.call('"+x+"'")),true);
await rejection(named.consume('user',1.5));
check('decimal rejected before command',recorded.calls.length,1);
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const source='.tools/bots-swarms/rate-limiter-flexible/lib/RateLimiterRedis.js';
const receipt={at:new Date().toISOString(),node:process.version,scope:'Actual pinned JavaScript adapter with synthetic client results and inert compatible fallback; no Redis/Lua/runtime atomicity assertion',source,sourceSha256:hash(source),scriptSha256:hash(new URL(import.meta.url)),checks,cleanup:'No sockets, timers, child processes or external services created'};
const path=`docs/research/bots-swarms/redis-adapter-receipt-${Date.now()}.json`;
fs.writeFileSync(path,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log({path,passed:checks.length});
