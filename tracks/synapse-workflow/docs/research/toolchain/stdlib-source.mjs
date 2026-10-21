import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base=path.resolve('docs/research/toolchain');
const root=path.resolve('.tools/security-research-go/sdk/go');
const ledger=path.join(base,'stdlib-queue.json');
const sha=b=>createHash('sha256').update(b).digest('hex');
const [op,file,a,b]=process.argv.slice(2);
if(op==='inventory'){
 try{await fs.access(ledger);throw Error('Preserve existing queue');}catch(e){if(e.code!=='ENOENT')throw e;}
 const entries=[];
 for(const name of ['VERSION','LICENSE','src/net/http/client.go','src/net/http/request.go','src/net/http/transfer.go','src/net/http/transport.go','src/net/http/httputil/dump.go']){
  const bytes=await fs.readFile(path.join(root,name));
  entries.push({path:name,sha256:sha(bytes),bytes:bytes.length,lines:bytes.toString('utf8').split('\n').length,readRanges:[],status:'unread'});
 }
 await fs.writeFile(ledger,JSON.stringify({at:new Date().toISOString(),root,basis:'Selected already-present Go SDK material HTTP dependency files; no execution. Existing adjacent SDK archive receipt supplies provenance, not binary/source equivalence.',receipt:'.tools/security-research-go/receipt.json',entries},null,2));
 console.log({files:entries.length});
}else if(op==='extend'){
 const queue=JSON.parse(await fs.readFile(ledger,'utf8'));
 if(!file||file.includes('..')||path.isAbsolute(file)||!file.startsWith('src/'))throw Error('Require bounded SDK source-relative path');
 if(queue.entries.some(e=>e.path===file))throw Error('Preserve existing entry');
 const bytes=await fs.readFile(path.join(root,file));if(bytes.includes(0))throw Error('Text source only');
 queue.entries.push({path:file,sha256:sha(bytes),bytes:bytes.length,lines:bytes.toString('utf8').split('\n').length,readRanges:[],status:'unread',inventoriedAt:new Date().toISOString()});
 await fs.writeFile(ledger,JSON.stringify(queue,null,2));console.log({appended:file,basis:'Existing material dependency/test; inventory is not reading'});
}else{
 const queue=JSON.parse(await fs.readFile(ledger,'utf8'));
 if(op==='verify'){
  const errors=[];
  for(const e of queue.entries){const bytes=await fs.readFile(path.join(root,e.path));if(sha(bytes)!==e.sha256||bytes.length!==e.bytes||bytes.toString('utf8').split('\n').length!==e.lines)errors.push(e.path);let prev=0;for(const [s,t] of e.readRanges){if(s<1||t<s||t>e.lines||s<=prev)errors.push(e.path+':range');prev=t;}const status=e.readRanges.length===1&&e.readRanges[0][0]===1&&e.readRanges[0][1]===e.lines?'complete':e.readRanges.length?'partial':'unread';if(status!==e.status)errors.push(e.path+':status');}
  const receipt={at:new Date().toISOString(),basis:'Byte and range consistency, not semantic/runtime verification',errors,summary:queue.entries.map(e=>({path:e.path,status:e.status,ranges:e.readRanges}))};await fs.writeFile(path.join(base,'stdlib-verification.json'),JSON.stringify(receipt,null,2));console.log(receipt);if(errors.length)process.exitCode=1;
 }else{
  const e=queue.entries.find(e=>e.path===file);if(!e)throw Error('Unknown selected file');const bytes=await fs.readFile(path.join(root,file));if(sha(bytes)!==e.sha256)throw Error('Changed bytes');const lines=bytes.toString('utf8').split('\n'),s=Number(a),t=Number(b);if(!Number.isInteger(s)||!Number.isInteger(t)||s<1||t<s||t>e.lines)throw Error('Invalid range');
  if(op==='read'){const out=lines.slice(s-1,t).map((l,i)=>`${s+i}: ${l}`).join('\n');if(out.length>24500)throw Error('Reduce bounded range');console.log(JSON.stringify({...e,start:s,end:t}));console.log(out);}
  else if(op==='mark'){const merged=[];for(const r of [...e.readRanges,[s,t]].sort((x,y)=>x[0]-y[0])){const last=merged.at(-1);if(last&&r[0]<=last[1]+1)last[1]=Math.max(last[1],r[1]);else merged.push([...r]);}e.readRanges=merged;e.status=merged.length===1&&merged[0][0]===1&&merged[0][1]===e.lines?'complete':'partial';e.recordedAt=new Date().toISOString();await fs.writeFile(ledger,JSON.stringify(queue,null,2));console.log({file,status:e.status,ranges:merged});}else throw Error('Use inventory/read/mark/verify');
 }
}
