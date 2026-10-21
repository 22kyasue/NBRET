import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const home=path.resolve('docs/research/bots-swarms');
const root=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))).find(x=>x.name==='rate-limiter-flexible').root;
const q=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
const file='lib/RateLimiterMongo.js',sha256=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
assert.equal(sha256,q.find(x=>x.repo==='rate-limiter-flexible'&&x.path===file).sha256);
const require=createRequire(path.join(root,'index.js')),Mongo=require('./lib/RateLimiterMongo');
const calls=[];
const collection={findOneAndUpdate:async(where,data,options)=>{
 calls.push({where,data,options});
 if(calls.length<3)throw Object.assign(new Error('synthetic duplicate'),{code:11000});
 return {value:{points:1,expire:new Date(Date.now()+1000)}};
}};
const client={collection:()=>collection};
const limiter=new Mongo({storeClient:client,disableIndexesCreation:true,points:2,duration:1});
const result=await limiter.consume('synthetic-key',1,{attrs:{tenant:'synthetic-a'}});
const checks=[];function check(name,ok){checks.push({name,pass:!!ok});assert.ok(ok,name);}
check('three updates after two synthetic duplicate errors',calls.length===3);
check('initial and replacement retain tenant',calls[0].where.tenant==='synthetic-a'&&calls[1].where.tenant==='synthetic-a');
check('recursive retry omits tenant',!Object.hasOwn(calls[2].where,'tenant'));
check('operation returns fixed synthetic response',result.consumedPoints===1&&result.remainingPoints===1);
const at=Date.now(),target=path.join(home,`mongo-retry-receipt-${at}.json`);
await fs.writeFile(target,JSON.stringify({at,node:process.version,file,sha256,scope:'unchanged adapter; inert collection; no Mongo runtime',checks,calls,allSyntheticPromisesSettled:true},null,2),{flag:'wx'});
console.log({receipt:target,checks:checks.length});
