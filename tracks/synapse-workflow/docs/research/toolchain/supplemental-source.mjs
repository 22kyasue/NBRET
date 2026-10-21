import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain');
const qp=path.join(home,'supplemental-material-queue.json');
const q=JSON.parse(await fs.readFile(qp));
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
const [op,repo,file,s,t]=process.argv.slice(2);
if(!['read','mark'].includes(op))throw Error('read|mark REPO FILE START END');
const entry=q.material.find(e=>e.repo===repo&&e.path===file);
if(!entry)throw Error('Unknown supplemental material');
const pin=pins.find(p=>p.name===repo);
const root=path.resolve(pin.root), target=path.resolve(root,file);
if(!target.startsWith(root+path.sep))throw Error('Outside pinned root');
const bytes=await fs.readFile(target);
if(createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error('Snapshot changed');
if(bytes.includes(0))throw Error('Binary material requires a separate review procedure');
const lines=new TextDecoder('utf-8',{fatal:true}).decode(bytes).split('\n');
const start=Number(s),end=Number(t);
if(!Number.isInteger(start)||!Number.isInteger(end)||start<1||end<start||end>lines.length)throw Error('Invalid range');
if(op==='read'){
 const out=lines.slice(start-1,end).map((v,i)=>`${start+i}: ${v}`).join('\n');
 if(out.length>24500)throw Error('Use smaller bounded range');
 console.log(JSON.stringify({...entry,lines:lines.length,start,end}));console.log(out);
}else{
 const ranges=[];
 for(const r of [...(entry.readRanges??[]),[start,end]].sort((a,b)=>a[0]-b[0])){
  const prev=ranges.at(-1);if(prev&&r[0]<=prev[1]+1)prev[1]=Math.max(prev[1],r[1]);else ranges.push(r);
 }
 entry.lines=lines.length;entry.readRanges=ranges;
 entry.status=ranges.length===1&&ranges[0][0]===1&&ranges[0][1]===lines.length?'complete':'partial';
 entry.recordedAt=new Date().toISOString();
 await fs.writeFile(qp,JSON.stringify(q,null,2));console.log({repo,file,status:entry.status,ranges});
}
