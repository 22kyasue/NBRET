import http from 'node:http';
import fs from 'node:fs/promises';
import {createHmac,createHash,randomBytes,timingSafeEqual} from 'node:crypto';
import assert from 'node:assert/strict';

// Deliberately custom fixture; not OAuth/JWT or RFC9421 wire syntax.
const now=1000000,issuerKey=randomBytes(32),checks=[];
const workers=new Map([
  ['worker-a',{key:randomBytes(32),sub:'same-subject',tenant:'tenant-a',active:true}],
  ['worker-b',{key:randomBytes(32),sub:'other-subject',tenant:'tenant-b',active:true}],
]);
const used=new Set();let effects=0,listenerClosed=false;
const digest=x=>createHash('sha256').update(x).digest('hex');
const mac=(key,x)=>createHmac('sha256',key).update(x).digest('hex');
const equal=(a,b)=>typeof a==='string'&&/^[a-f0-9]{64}$/.test(a)&&timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'));
const base={kind:'workload',sub:'same-subject',tenant:'tenant-a',worker:'worker-a',aud:'local-protected',scope:['read'],exp:now+60};
function issue(patch={}) {
  const payload=Buffer.from(JSON.stringify({...base,...patch})).toString('base64url');
  return payload+'.'+mac(issuerKey,payload);
}
function decode(token) {
  const [payload,tag,...extra]=token.split('.');
  if(extra.length||!payload||!equal(tag,mac(issuerKey,payload)))throw Error('token');
  const claims=JSON.parse(Buffer.from(payload,'base64url'));
  if(!Number.isFinite(claims.exp)||claims.exp<=now)throw Error('expiry');
  return claims;
}
const canonical=({method,path,token,worker,nonce,stamp})=>JSON.stringify([method,path,digest(token),worker,nonce,stamp]);
function request({token=issue(),worker='worker-a',nonce,stamp=String(now),method='GET',path='/protected',label='shared-egress',badMac=false}={}) {
  const r={method,path,token,worker,nonce,stamp};
  const key=workers.get(worker)?.key??randomBytes(32);
  const tag=badMac?'0'.repeat(64):mac(key,canonical(r));
  return {method,path,headers:{authorization:'Bearer '+token,'x-worker':worker,'x-nonce':nonce,'x-stamp':stamp,'x-proof':tag,'x-address-label':label}};
}
const server=http.createServer((req,res)=>{
  const finish=(status,reason)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify({reason,effects}));};
  if(req.method!=='GET'||req.url!=='/protected'||req.headers['transfer-encoding']||Number(req.headers['content-length']??0)!==0){req.resume();return finish(404,'route');}
  const token=req.headers.authorization?.replace(/^Bearer /,'');
  const worker=req.headers['x-worker'],nonce=req.headers['x-nonce'],stamp=req.headers['x-stamp'];
  if(!token||!worker||!nonce||nonce.length>100||!stamp)return finish(401,'shape');
  let claims;try{claims=decode(token);}catch{return finish(401,'token');}
  const entry=workers.get(worker);if(!entry)return finish(401,'worker');
  if(!equal(req.headers['x-proof'],mac(entry.key,canonical({method:req.method,path:req.url,token,worker,nonce,stamp}))))return finish(401,'proof');
  if(!Number.isFinite(Number(stamp))||Math.abs(Number(stamp)-now)>5)return finish(401,'freshness');
  if(claims.kind!=='workload'||claims.worker!==worker||claims.sub!==entry.sub||claims.tenant!==entry.tenant||claims.aud!=='local-protected'||!Array.isArray(claims.scope)||!claims.scope.includes('read'))return finish(403,'assignment');
  if(!entry.active)return finish(403,'revoked');
  const replayKey=JSON.stringify([worker,nonce]);
  if(used.has(replayKey))return finish(409,'replay');
  used.add(replayKey); // Synchronous, single-process check/insert only.
  effects++;
  finish(200,'effect');
});
async function check(name,r,status,delta=0){
  const before=effects;
  const response=r.body===undefined
    ?await fetch(url+r.path,{method:r.method,headers:r.headers,redirect:'error'})
    :await new Promise((resolve,reject)=>{
      const call=http.request(url+r.path,{method:r.method,headers:{...r.headers,'content-length':Buffer.byteLength(r.body)}},res=>{
        let bytes='';res.setEncoding('utf8');res.on('data',chunk=>{bytes+=chunk;});
        res.on('end',()=>resolve({status:res.statusCode,json:async()=>JSON.parse(bytes)}));
      });call.on('error',reject);call.end(r.body);
    });
  const body=await response.json();
  assert.equal(response.status,status,name+' status');
  assert.equal(effects-before,delta,name+' effect');
  assert.equal(body.effects,effects,name+' response effect');
  checks.push({name,status:response.status,effectDelta:delta,reason:body.reason});
}
let url;
try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  url='http://127.0.0.1:'+server.address().port;
  const initial=request({nonce:'one'});
  await check('valid assignment',initial,200,1);
  await check('identical replay',initial,409);
  await check('bad proof does not consume nonce',request({nonce:'retry-proof',badMac:true}),401);
  await check('valid proof can reuse rejected nonce',request({nonce:'retry-proof'}),200,1);
  const original=issue(),[,tag]=original.split('.');
  const tampered=Buffer.from(JSON.stringify({...base,tenant:'tenant-b'})).toString('base64url')+'.'+tag;
  await check('modified issuer payload',request({token:tampered,nonce:'tampered'}),401);
  await check('unknown worker',request({worker:'absent',nonce:'absent'}),401);
  await check('cross-worker proof',request({worker:'worker-b',nonce:'cross-worker'}),403);
  await check('cross-tenant claim',request({token:issue({tenant:'tenant-b'}),nonce:'tenant'}),403);
  await check('user and workload same subject remain distinct',request({token:issue({kind:'user'}),nonce:'kind'}),403);
  await check('wrong audience',request({token:issue({aud:'elsewhere'}),nonce:'aud'}),403);
  await check('missing action scope',request({token:issue({scope:[]}),nonce:'scope'}),403);
  await check('expired token',request({token:issue({exp:now-1}),nonce:'expiry'}),401);
  await check('stale proof time',request({stamp:String(now-6),nonce:'stale'}),401);
  await check('wrong route',request({path:'/elsewhere',nonce:'route'}),404);
  await check('wrong method',request({method:'POST',nonce:'method'}),404);
  await check('unsigned request body rejected',{...request({nonce:'body'}),body:'x'},404);
  const reusable=issue();workers.get('worker-a').active=false;
  assert.equal(decode(reusable).worker,'worker-a');
  checks.push({name:'authentic unexpired token survives authority revocation in signature-only validator',pass:true});
  await check('current authority rejects valid credentials',request({token:reusable,nonce:'revoked'}),403);
  workers.get('worker-a').active=true;
  await check('restored authority',request({token:reusable,nonce:'restored'}),200,1);
  const labelReplay=request({token:initial.headers.authorization.slice(7),nonce:'one',label:'different-egress'});
  await check('changed address label does not reset nonce identity',labelReplay,409);
  assert.equal(effects,3);
  checks.push({name:'all denials preserve effects; total accepted effects',effects,pass:true});
}finally{
  server.closeAllConnections();
  await new Promise((resolve,reject)=>server.close(e=>e&&e.code!=='ERR_SERVER_NOT_RUNNING'?reject(e):resolve()));
  listenerClosed=!server.listening;
}
assert.equal(listenerClosed,true);
checks.push({name:'listener closed',pass:true});
const receipt={at:new Date().toISOString(),node:process.version,command:'node docs/research/bots-swarms/identity-lab.mjs',protocol:'custom fixture, not OAuth/JWT/RFC9421',scriptSha256:digest(await fs.readFile(new URL(import.meta.url))),checks,effects,listenerClosed,limits:'Single process, in-memory authority and nonce set, fixed clock, no credential persistence, no distributed validator/cache proof.'};
const receiptPath='docs/research/bots-swarms/identity-receipt-'+Date.now()+'.json';
await fs.writeFile(receiptPath,JSON.stringify(receipt,null,2),{flag:'wx'});
console.log({receiptPath,checks:checks.length,effects,listenerClosed});
