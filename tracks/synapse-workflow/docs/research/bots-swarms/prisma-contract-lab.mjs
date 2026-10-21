import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const home=path.resolve('docs/research/bots-swarms');
const root=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))).find(x=>x.name==='rate-limiter-flexible').root;
const q=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
const files=['lib/RateLimiterPrisma.js','lib/RateLimiterStoreAbstract.js','lib/RateLimiterInsuredAbstract.js','lib/RateLimiterAbstract.js','lib/RateLimiterRes.js'];
const hashes={};for(const file of files){hashes[file]=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');assert.equal(hashes[file],q.find(x=>x.repo==='rate-limiter-flexible'&&x.path===file).sha256);}
const require=createRequire(path.join(root,'index.js')),Prisma=require('./lib/RateLimiterPrisma');
const checks=[],calls=[];let row;
const model={findFirst:async query=>{calls.push({op:'findFirst',query});return row?{...row}:null;},update:async query=>{calls.push({op:'update',query});row={...row,...query.data};return {...row};},create:async query=>{calls.push({op:'create',query});row={...query.data};return {...row};}};
const client={$transaction:async fn=>fn({RateLimiterFlexible:model})};
const limiter=new Prisma({storeClient:client,points:10,duration:60,clearExpiredByTimeout:false});
function check(name,ok){checks.push({name,pass:!!ok});assert.ok(ok,name);}
try {
 row={key:'rlflx:synthetic',points:3,expire:new Date(Date.now()+60000)};
 check('finite live record increments',(await limiter._upsert(row.key,1,60000)).points===4);
 row={key:'rlflx:synthetic',points:3,expire:new Date(Date.now()-1000)};
 check('expired record resets',(await limiter._upsert(row.key,1,60000)).points===1);
 row={key:'rlflx:synthetic',points:11,expire:null};
 check('null expiry replaced on subsequent finite upsert',(await limiter._upsert(row.key,1,60000)).points===1);
 row=undefined;
 const a=await limiter._upsert('rlflx:synthetic',1,0),b=await limiter._upsert('rlflx:synthetic',1,0);
 check('duration zero consecutive upserts each return one',a.points===1&&b.points===1&&b.expire===null);
 check('false option still schedules timer',limiter.clearExpiredByTimeout===true&&!!limiter._clearExpiredTimeoutId);
}finally{clearTimeout(limiter._clearExpiredTimeoutId);}
check('cleanup timer destroyed',limiter._clearExpiredTimeoutId._destroyed===true);
const target=path.join(home,`prisma-contract-receipt-${Date.now()}.json`);
await fs.writeFile(target,JSON.stringify({at:new Date().toISOString(),node:process.version,scope:'unchanged adapter; inert sequential store; no ORM/database or concurrency validation',hashes,checks,calls,allSyntheticPromisesSettled:true,timerCleared:true},null,2),{flag:'wx'});
console.log({receipt:target,checks:checks.length});
