import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const home=path.resolve('docs/research/bots-swarms');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
const queue=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
const root=pins.find(x=>x.name==='rate-limiter-flexible').root;
const hashes={};
for(const file of ['RateLimiterEtcd','RateLimiterEtcdNonAtomic','RateLimiterSQLite','RateLimiterStoreAbstract','RateLimiterInsuredAbstract','RateLimiterAbstract','RateLimiterRes'].map(x=>`lib/${x}.js`)){
 const digest=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
 assert.equal(digest,queue.find(x=>x.repo==='rate-limiter-flexible'&&x.path===file).sha256);hashes[file]=digest;
}
const require=createRequire(path.join(root,'index.js'));
const NonAtomic=require('./lib/RateLimiterEtcdNonAtomic');
const Atomic=require('./lib/RateLimiterEtcd');
const SQLite=require('./lib/RateLimiterSQLite');
const Res=require('./lib/RateLimiterRes');
const checks=[];function check(name,condition){checks.push({name,pass:!!condition});assert.ok(condition,name);}
let stored=JSON.stringify({points:1,expire:1});
const client={get:()=>({string:async()=>stored}),put:()=>({value:async value=>{stored=value;}})};
const limiter=new NonAtomic({storeClient:client,points:1,duration:1});
const stale=await limiter.get('synthetic');
check('expired JSON record still returned',stale instanceof Res&&stale.consumedPoints===1);
check('expired JSON reports zero retry time',stale.msBeforeNext===0);
let rejected;try{await limiter.consume('synthetic');}catch(e){rejected=e;}
check('consume accumulates expired count and rejects',rejected instanceof Res&&rejected.consumedPoints===2);
check('new write contains accumulated count',JSON.parse(stored).points===2);
const vanished={get:()=>({string:async()=>null}),put:()=>({value:()=>({})}),if:()=>({then:()=>({commit:async()=>({succeeded:false})})})};
let atomicError;try{await new Atomic({storeClient:vanished,points:1,duration:1}).consume('synthetic');}catch(e){atomicError=e;}
check('vanished CAS read rejects TypeError',atomicError instanceof TypeError);
let queryDone,released=0,settled=false;
const conn={serialize:fn=>fn(),run:(_sql,cb)=>cb(null),get:(_sql,_params,cb)=>{queryDone=cb;}};
const knex={raw:()=>{},client:{config:{client:'sqlite3'},acquireConnection:async()=>conn,releaseConnection:()=>{released++;}}};
const sql=new SQLite({storeClient:knex,storeType:'knex',tableName:'synthetic',tableCreated:true,points:5,duration:1,clearExpiredByTimeout:false});
const pending=sql._upsert('synthetic',1,1000).then(result=>{settled=true;return result;});
await new Promise(resolve=>setImmediate(resolve));
check('query callback pending after connection release',typeof queryDone==='function'&&released===1&&!settled);
queryDone(null,{points:1,expire:Date.now()+1000});
const result=await pending;
check('query subsequently settles normally',settled&&result.points===1);
const at=Date.now(),receipt={at,node:process.version,scope:'unchanged adapter source with inert clients, no database/network',hashes,checks,allSyntheticPromisesSettled:true};
const target=path.join(home,`adapter-boundary-receipt-${at}.json`);
await fs.writeFile(target,JSON.stringify(receipt,null,2),{flag:'wx'});console.log({receipt:target,checks:checks.length});
