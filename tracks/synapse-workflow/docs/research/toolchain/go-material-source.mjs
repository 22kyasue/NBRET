import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const base=path.resolve('docs/research/toolchain');
const cache=path.resolve('.tools/toolchain/go/modules');
const queuePath=path.join(base,'go-material-queue.json');
const specs=[
 ['xxhash','github.com/cespare/xxhash/v2','v2.3.0'],
 ['jsonschema','github.com/santhosh-tekuri/jsonschema/v6','v6.0.3'],
 ['text','golang.org/x/text','v0.43.0'],
 ['s3manager','github.com/aws/aws-sdk-go-v2/feature/s3/manager','v1.22.22'],
 ['s3','github.com/aws/aws-sdk-go-v2/service/s3','v1.102.2'],
 ['smithy','github.com/aws/smithy-go','v1.26.0'],
 ['checksum','github.com/aws/aws-sdk-go-v2/service/internal/checksum','v1.9.18'],
 ['sdkcore','github.com/aws/aws-sdk-go-v2','v1.41.9'],
 ['eventstream','github.com/aws/aws-sdk-go-v2/aws/protocol/eventstream','v1.7.11'],
 ['s3shared','github.com/aws/aws-sdk-go-v2/service/internal/s3shared','v1.19.25'],
 ['v4a','github.com/aws/aws-sdk-go-v2/internal/v4a','v1.4.26'],
];
const hash=b=>createHash('sha256').update(b).digest('hex');
const [op,key,file,startArg,endArg]=process.argv.slice(2);
if(op==='extend') {
 const queue=JSON.parse(await fs.readFile(queuePath,'utf8'));
 const spec=specs.find(s=>s[0]===key);
 if(!spec) throw Error('Unknown exact dependency');
 if(queue.modules.some(m=>m.name===key)) throw Error('Already inventoried; preserve history');
 const [name,module,version]=spec;
 const root=path.join(cache,`${module}@${version}`);
 const info=JSON.parse(await fs.readFile(path.join(cache,'cache/download',module,'@v',`${version}.info`),'utf8'));
 const sum=await fs.readFile(path.join(cache,'cache/download',module,'@v',`${version}.ziphash`),'utf8');
 const entries=[];
 async function walk(dir) {
  for(const item of await fs.readdir(dir,{withFileTypes:true})) {
   const target=path.join(dir,item.name);
   if(item.isDirectory()) {await walk(target);continue;}
   if(!item.isFile())continue;
   const bytes=await fs.readFile(target);const binary=bytes.includes(0);
   entries.push({path:path.relative(root,target).replaceAll('\\','/'),bytes:bytes.length,sha256:hash(bytes),lines:binary?null:bytes.toString('utf8').split('\n').length,status:binary?'binary_unreviewed':'unread',readRanges:[]});
  }
 }
 await walk(root);
 queue.modules.push({name,module,version,root,origin:info,moduleContentSum:sum.trim(),entries});
 await fs.writeFile(queuePath,JSON.stringify(queue,null,2));
 console.log({name,version,files:entries.length,basis:'Appended exact cached material dependency without resetting existing ranges; inventory is not reading'});
} else if(op==='inventory') {
 try { await fs.access(queuePath); throw Error('Queue exists; preserve reading history'); }
 catch(e) { if(e.code!=='ENOENT') throw e; }
 const modules=[];
 for(const [name,module,version] of specs) {
  const root=path.join(cache,`${module}@${version}`);
  const info=JSON.parse(await fs.readFile(path.join(cache,'cache/download',module,'@v',`${version}.info`),'utf8'));
  const sum=await fs.readFile(path.join(cache,'cache/download',module,'@v',`${version}.ziphash`),'utf8');
  const entries=[];
  async function walk(dir) {
   for(const item of await fs.readdir(dir,{withFileTypes:true})) {
    const target=path.join(dir,item.name);
    if(item.isDirectory()) { await walk(target); continue; }
    if(!item.isFile()) continue;
    const bytes=await fs.readFile(target);
    const binary=bytes.includes(0);
    entries.push({path:path.relative(root,target).replaceAll('\\','/'),bytes:bytes.length,sha256:hash(bytes),
     lines:binary?null:bytes.toString('utf8').split('\n').length,status:binary?'binary_unreviewed':'unread',readRanges:[]});
   }
  }
  await walk(root);
  modules.push({name,module,version,root,origin:info,moduleContentSum:sum.trim(),entries});
 }
 await fs.writeFile(queuePath,JSON.stringify({at:new Date().toISOString(),basis:'Already-present exact dependency bytes; inventory is not reading; Go module content sum is not raw ZIP SHA256 or a signature',modules},null,2));
 console.log(modules.map(m=>({name:m.name,version:m.version,files:m.entries.length})));
} else if(op==='verify') {
 const queue=JSON.parse(await fs.readFile(queuePath,'utf8'));
 const errors=[];
 const summary=[];
 for(const module of queue.modules) {
  let linesRead=0,complete=0,partial=0;
  for(const entry of module.entries) {
   const bytes=await fs.readFile(path.join(module.root,entry.path));
   if(hash(bytes)!==entry.sha256||bytes.length!==entry.bytes)errors.push(`${module.name}/${entry.path}: bytes changed`);
   if(entry.lines!==null&&bytes.toString('utf8').split('\n').length!==entry.lines)errors.push(`${module.name}/${entry.path}: line count changed`);
   let previous=0;
   for(const [start,end] of entry.readRanges) {
    if(start<1||end<start||end>entry.lines||start<=previous)errors.push(`${module.name}/${entry.path}: invalid range`);
    previous=end; linesRead+=end-start+1;
   }
   const expected=entry.lines===null?'binary_unreviewed':entry.readRanges.length===1&&entry.readRanges[0][0]===1&&entry.readRanges[0][1]===entry.lines?'complete':entry.readRanges.length?'partial':'unread';
   if(entry.status!==expected)errors.push(`${module.name}/${entry.path}: status mismatch`);
   complete+=entry.status==='complete'; partial+=entry.status==='partial';
  }
  summary.push({name:module.name,version:module.version,files:module.entries.length,complete,partial,linesRead});
 }
 const receipt={at:new Date().toISOString(),basis:'Checks pinned inventory bytes/ranges, not semantic correctness or binary equivalence',summary,errors};
 await fs.writeFile(path.join(base,'go-material-verification.json'),JSON.stringify(receipt,null,2));
 console.log(receipt);
 if(errors.length)process.exitCode=1;
} else {
 const queue=JSON.parse(await fs.readFile(queuePath,'utf8'));
 const module=queue.modules.find(m=>m.name===key);
 if(!module) throw Error('Unknown dependency');
 const entry=module.entries.find(e=>e.path===file);
 if(!entry||entry.lines===null) throw Error('Unknown or binary file');
 const bytes=await fs.readFile(path.join(module.root,file));
 if(hash(bytes)!==entry.sha256) throw Error('Pinned bytes changed');
 const lines=bytes.toString('utf8').split('\n');
 const start=Number(startArg),end=Number(endArg);
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<1||end<start||end>lines.length) throw Error('Invalid range');
 if(op==='read') {
  const output=lines.slice(start-1,end).map((line,i)=>`${start+i}: ${line}`).join('\n');
  if(output.length>24500) throw Error('Reduce range: exceeds bounded output');
  console.log(JSON.stringify({dependency:key,module:module.module,version:module.version,...entry,start,end}));
  console.log(output);
 } else if(op==='mark') {
  const ranges=[...entry.readRanges,[start,end]].sort((a,b)=>a[0]-b[0]);
  const merged=[];
  for(const range of ranges) {
   const last=merged.at(-1);
   if(last&&range[0]<=last[1]+1)last[1]=Math.max(last[1],range[1]);else merged.push([...range]);
  }
  entry.readRanges=merged;
  entry.status=merged.length===1&&merged[0][0]===1&&merged[0][1]===entry.lines?'complete':'partial';
  entry.recordedAt=new Date().toISOString();
  await fs.writeFile(queuePath,JSON.stringify(queue,null,2));
  console.log({dependency:key,file,status:entry.status,ranges:merged});
 } else throw Error('Use inventory/read/mark');
}
