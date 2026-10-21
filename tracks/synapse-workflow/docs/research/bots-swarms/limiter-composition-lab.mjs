import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const home=path.resolve('docs/research/bots-swarms');
const queue=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
const root=pins.find(x=>x.name==='rate-limiter-flexible').root;
const hashes={};
const files=['RLWrapperBlackAndWhite','RateLimiterUnion','RLWrapperTimeouts','RateLimiterCompatibleAbstract','RateLimiterInsuredAbstract','RateLimiterAbstract','RateLimiterRes'];
for(const name of [...files.map(n=>`lib/${n}.js`),'lib/helper/isRateLimiterCompatible.js']){
 const digest=createHash('sha256').update(await fs.readFile(path.join(root,name))).digest('hex');
 assert.equal(digest,queue.find(x=>x.repo==='rate-limiter-flexible'&&x.path===name).sha256);
 hashes[name]=digest;
}
const require=createRequire(path.join(root,'index.js'));
const Wrapper=require('./lib/RLWrapperBlackAndWhite');
const Union=require('./lib/RateLimiterUnion');
const Timeout=require('./lib/RLWrapperTimeouts');
const Compatible=require('./lib/RateLimiterCompatibleAbstract');
const Res=require('./lib/RateLimiterRes');
const checks=[];
function check(name,condition){checks.push({name,pass:!!condition});assert.ok(condition,name);}
function fixture(prefix){const l=new Compatible();Object.defineProperties(l,{keyPrefix:{value:prefix},blockDuration:{value:0,writable:true},execEvenly:{value:false,writable:true}});l.consume=async()=>new Res(4,0,1,false);return l;}
let calls=0;
const inner=fixture('inner');inner.consume=async()=>{calls++;return new Res(4,0,1,false);};
const allowed=new Wrapper({limiter:inner,whiteList:['synthetic'],blackList:['synthetic']});
const allow=await allowed.consume('synthetic');
check('allow wins overlapping deny without inner consumption',allow.remainingPoints===Number.MAX_SAFE_INTEGER&&calls===0);
const denied=new Wrapper({limiter:inner,blackList:['synthetic']});
let rejection;try{await denied.consume('synthetic');}catch(e){rejection=e;}
check('deny consume rejects',rejection instanceof Res&&rejection.remainingPoints===0&&calls===0);
check('deny get resolves synthetic result',(await denied.get('synthetic')).remainingPoints===0);
let siblingEffects=0;
const one=fixture('one'),two=fixture('two');
one.consume=async()=>{throw new Res(0,100,2,false);};
two.consume=async()=>{siblingEffects++;return new Res(2,0,1,false);};
try{await new Union(one,two).consume('synthetic');}catch(e){rejection=e;}
check('union rejection retains successful sibling consumption',siblingEffects===1&&rejection.one instanceof Res);
const duplicate=await new Union(fixture('same'),fixture('same')).consume('synthetic');
check('duplicate prefixes collapse reported entries',Object.keys(duplicate).length===1);
let release,effects=0;
const delayed=fixture('delayed');delayed.consume=()=>new Promise(resolve=>{release=()=>{effects++;resolve(new Res(2,0,1,false));};});
let timedOut=false;
try{await new Timeout({limiter:delayed,timeoutMs:5}).consume('synthetic');}catch(e){timedOut=e.message==='Operation timed out';}
check('timeout returns before primary effect',timedOut&&effects===0);
release();await new Promise(resolve=>setImmediate(resolve));
check('primary effect still occurs after timeout',effects===1);
const insurance=fixture('insurance');let fallback=0;insurance.consume=async()=>{fallback++;return new Res(2,0,1,false);};
await new Timeout({limiter:delayed,insuranceLimiter:insurance,timeoutMs:5}).consume('synthetic');
check('insurance settles caller while primary pending',fallback===1&&effects===1);
release();await new Promise(resolve=>setImmediate(resolve));
check('primary also settles after insurance result',effects===2);
const at=Date.now();const receipt={at,node:process.version,scope:'unchanged pinned modules with synthetic compatible limiters; no stores or network',hashes,checks,allSyntheticPromisesSettled:true};
const target=path.join(home,`limiter-composition-receipt-${at}.json`);
await fs.writeFile(target,JSON.stringify(receipt,null,2),{flag:'wx'});
console.log({receipt:target,checks:checks.length});
