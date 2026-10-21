import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { runScan } from '../src/zap.mjs';
const out=resolve(`runs/scanner-adapter-research-${Date.now()}`);
await mkdir(out,{recursive:false});
const origin='http://fixture.invalid';
const results=[];
for(const mode of ['alert-attribution','lost-scan-response','lost-context-response','shared-passive-queue']){
 const calls=[],serverState={contextCreated:false,scanStarted:false,stopRequested:false,removeRequested:false};
 const transport=async url=>{
  const u=new URL(url),parts=u.pathname.split('/'),component=parts[2],operation=parts.at(-2);
  calls.push({component,operation,params:Object.fromEntries(u.searchParams)});
  let body={Result:'OK'};
  if(operation==='version')body={version:'simulated-2.17.0'};
  if(operation==='newContext'){
   serverState.contextCreated=true;
   if(mode==='lost-context-response')throw new Error('simulated lost response after context side effect');
   body={contextId:'17'};
  }
  if(operation==='urls')body={urls:[origin+'/allowed']};
  if(component==='ascan'&&operation==='scan'){
   serverState.scanStarted=true;
   if(mode==='lost-scan-response')throw new Error('simulated lost response after scan side effect');
   body={scan:'23'};
  }
  if(operation==='status')body={status:'100'};
  if(operation==='stop')serverState.stopRequested=true;
  if(operation==='removeContext')serverState.removeRequested=true;
  if(operation==='recordsToScan')body={recordsToScan:mode==='shared-passive-queue'?'1':'0'};
  if(operation==='alerts')body={alerts:[
   {pluginId:'1',alert:'synthetic selected',url:origin+'/allowed',risk:'Low',confidence:'High',id:'901',messageId:'800',evidence:'SYNTHETIC-EVIDENCE',param:'q',method:'GET'},
   {pluginId:'1',alert:'synthetic prior unrelated',url:origin+'/outside',risk:'Low',confidence:'High',id:'902',messageId:'801',evidence:'SYNTHETIC-OTHER'},
   {pluginId:'2',alert:'synthetic foreign',url:'http://other.invalid/path'}
  ]};
  return {status:200,body:JSON.stringify(body)};
 };
 const started=performance.now();
 const result=await runScan({origins:[origin],urls:[origin+'/allowed'],outDir:join(out,mode),
  active:mode==='lost-scan-response',maxMs:1000,pollMs:10,transport});
 if(mode==='alert-attribution'){
  assert.equal(result.alerts.length,2);assert.ok(result.alerts.some(a=>a.url.endsWith('/outside')));
  assert.ok(!Object.hasOwn(result.alerts[0],'evidence'));assert.ok(!Object.hasOwn(result.alerts[0],'messageId'));
 }
 if(mode==='lost-scan-response'){
  assert.equal(serverState.scanStarted,true);assert.equal(serverState.stopRequested,false);assert.equal(serverState.removeRequested,true);
 }
 if(mode==='lost-context-response'){
  assert.equal(serverState.contextCreated,true);assert.equal(serverState.removeRequested,false);
 }
 if(mode==='shared-passive-queue')assert.equal(result.status,'timed-out');
 assert.ok(!calls.some(c=>/stopAll|shutdown/.test(c.operation)));
 results.push({mode,label:'simulated API; adapter runtime validated, daemon not executed',elapsedMs:performance.now()-started,serverState,calls,result});
}
const sourceSha256={};
for(const p of ['src/zap.mjs','src/managed-zap.mjs','scripts/research-scanner-adapter-lab.mjs','docs/research/security-landscape/deep-review/scanner-adapter-lab-plan.md'])sourceSha256[p]=createHash('sha256').update(await readFile(p)).digest('hex');
const receipt={at:new Date().toISOString(),node:process.version,scope:'In-memory API simulation only; zero network calls or scanner execution',sourceSha256,results};
await writeFile(join(out,'receipt.json'),JSON.stringify(receipt,null,2));
console.log(JSON.stringify({out,results:results.map(r=>({mode:r.mode,status:r.result.status,alerts:r.result.alerts.length,serverState:r.serverState,elapsedMs:r.elapsedMs}))},null,2));
