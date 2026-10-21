import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
const qp=path.join(home,'queue.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
const [op,repo,file,startArg,endArg]=process.argv.slice(2);
if(op==='init'){
 try{await fs.access(qp);throw Error('Queue exists; do not reset history');}catch(e){if(e.code!=='ENOENT')throw e;}
 const q=[];
 for(const pin of pins){if(!pin.commit)continue;
 async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){
  if(['.git','node_modules','vendor','dist'].includes(e.name))continue;
  const p=path.join(dir,e.name);
  if(e.isDirectory())await walk(p);
  else if(/\.(py|go|cs|csproj|java|gradle|cc|h|c|lua|toml|mod|sum)$/.test(e.name)||/^(LICENSE|COPYING|go.work)$/.test(e.name)){
   const b=await fs.readFile(p);q.push({repo:pin.name,path:path.relative(pin.root,p).replaceAll('\\','/'),commit:pin.commit,sha256:hash(b),lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});
  }
 }} await walk(pin.root);}
 await fs.writeFile(qp,JSON.stringify(q,null,2));console.log({inventoried:q.length,read:0});
}else{
 const q=JSON.parse(await fs.readFile(qp));
 if(op==='status'){console.log(pins.map(p=>({repo:p.name,...Object.fromEntries(['unread','partial','complete'].map(s=>[s,q.filter(e=>e.repo===p.name&&e.status===s).length]))})));process.exit();}
 const e=q.find(e=>e.repo===repo&&e.path===file);if(!e)throw Error('Unknown pinned file');
 const b=await fs.readFile(path.join(pins.find(p=>p.name===repo).root,file));if(hash(b)!==e.sha256)throw Error('Snapshot changed');
 const a=b.toString('utf8').split('\n'),start=Number(startArg||1),end=Math.min(Number(endArg||start+159),a.length);
 if(start<1||end<start)throw Error('Invalid range');
 if(op==='read'){
  const out=a.slice(start-1,end).map((s,i)=>`${start+i}: ${s}`).join('\n');if(out.length>24500)throw Error('Use smaller bounded range');
  console.log(JSON.stringify({...e,start,end}));console.log(out);
 }else if(op==='mark'){
  const ranges=[];for(const r of [...e.readRanges,[start,end]].sort((x,y)=>x[0]-y[0])){const last=ranges.at(-1);if(last&&r[0]<=last[1]+1)last[1]=Math.max(last[1],r[1]);else ranges.push(r);}
  e.readRanges=ranges;e.status=ranges.length===1&&ranges[0][0]===1&&ranges[0][1]===e.lines?'complete':'partial';e.recordedAt=new Date().toISOString();await fs.writeFile(qp,JSON.stringify(q,null,2));console.log({repo,file,status:e.status,ranges});
 }else throw Error('init | read repo path start end | mark repo path start end | status');
}
