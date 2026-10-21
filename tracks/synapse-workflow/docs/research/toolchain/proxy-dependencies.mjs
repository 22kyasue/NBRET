import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain');
const root=path.resolve('.tools/toolchain/venv/Lib/site-packages');
const qp=path.join(home,'proxy-dependency-queue.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
const [op,dependency,file,s,t]=process.argv.slice(2);
if(op==='inventory'){
 try{await fs.access(qp);throw Error('Existing dependency history must not be reset');}catch(e){if(e.code!=='ENOENT')throw e;}
 const entries=[],distributions=[];
 for(const [name,version,source]of [['kaitaistruct','0.11','kaitaistruct.py'],['h2','4.4.1','h2'],['hpack','4.2.0','hpack'],['hyperframe','6.1.0','hyperframe'],['aioquic','1.2.0','aioquic'],['pylsqpack','0.3.24','pylsqpack'],['cryptography','50.0.2','cryptography'],['pyopenssl','26.4.0','OpenSSL']]){
  const info=`${name}-${version}.dist-info`;
  const metadata=await fs.readFile(path.join(root,info,'METADATA'),'utf8');
  if(!metadata.split(/\r?\n/).includes(`Version: ${version}`))throw Error('Version mismatch '+name);
  distributions.push({name,version,source,metadataSha256:hash(Buffer.from(metadata)),provenance:'Existing installed wheel; no VCS equivalence or source-distribution completeness claim'});
  async function walk(relative){
   const full=path.join(root,relative),stat=await fs.lstat(full);
   if(stat.isSymbolicLink())throw Error('Unexpected symlink '+relative);
   if(stat.isDirectory()){for(const n of await fs.readdir(full))if(n!=='__pycache__')await walk(path.join(relative,n));return;}
   const b=await fs.readFile(full),textual=!b.includes(0);
   entries.push({dependency:name,version,path:relative.replaceAll('\\','/'),bytes:b.length,sha256:hash(b),lines:textual?b.toString('utf8').split('\n').length:null,kind:textual?'text_unread':'binary_boundary',status:'unread',readRanges:[]});
  }
  await walk(source);await walk(info);
 }
 const q={at:new Date().toISOString(),root,distributions,entries,limitations:['Only named direct proxy dependencies and their installed package/metadata files, excluding local bytecode caches','Inventory/hash is not semantic review','Native binaries need source/build provenance; no imports or execution','Further exact transitive dependencies remain caller-driven work']};
 await fs.writeFile(qp,JSON.stringify(q,null,2),{flag:'wx'});console.log({files:entries.length,distributions:distributions.length});
}else{
 const q=JSON.parse(await fs.readFile(qp)),e=q.entries.find(x=>x.dependency===dependency&&x.path===file);
 if(!e||e.kind!=='text_unread')throw Error('Unknown text dependency');
 const b=await fs.readFile(path.join(root,e.path));if(hash(b)!==e.sha256)throw Error('Bytes changed');
 const lines=new TextDecoder('utf8',{fatal:true}).decode(b).split('\n'),start=Number(s),end=Math.min(Number(t),lines.length);
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<1||end<start||end>lines.length)throw Error('Invalid range');
 if(op==='read'){
  const out=lines.slice(start-1,end).map((v,i)=>`${start+i}: ${v}`).join('\n');if(out.length>24500)throw Error('Use smaller range');
  console.log(JSON.stringify({...e,start,end}));console.log(out);
 }else if(op==='mark'){
  const ranges=[];for(const r of [...e.readRanges,[start,end]].sort((a,b)=>a[0]-b[0])){const last=ranges.at(-1);if(last&&r[0]<=last[1]+1)last[1]=Math.max(last[1],r[1]);else ranges.push(r);}
  e.readRanges=ranges;e.status=ranges.length===1&&ranges[0][0]===1&&ranges[0][1]===e.lines?'complete':'partial';e.recordedAt=new Date().toISOString();
  await fs.writeFile(qp,JSON.stringify(q,null,2));console.log({dependency,file,status:e.status,ranges});
 }else throw Error('inventory | read|mark DEPENDENCY PATH START END');
}
