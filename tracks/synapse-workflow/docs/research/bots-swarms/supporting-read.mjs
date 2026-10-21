import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/bots-swarms');
const target=path.join(home,'supporting-queue.json');
const q=JSON.parse(await fs.readFile(target));
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
const [op,repo,file,a,b]=process.argv.slice(2);
const entry=q.entries.find(x=>x.repo===repo&&x.path===file);if(!entry)throw Error('Unknown supporting file');
const raw=await fs.readFile(path.join(pins.find(x=>x.name===repo).root,file));
if(createHash('sha256').update(raw).digest('hex')!==entry.sha256)throw Error('Source changed');
const lines=raw.toString('utf8').split('\n'),start=Number(a||1),end=Math.min(Number(b||start+149),lines.length);
if(start<1||end<start)throw Error('Invalid range');
if(op==='read'){
 const text=lines.slice(start-1,end).map((s,i)=>`${start+i}: ${s}`).join('\n');
 if(text.length>24000)throw Error('Reduce range');
 console.log({repo,file,start,end,total:lines.length});console.log(text);
}else if(op==='mark'){
 const merged=[];
 for(const r of [...entry.readRanges,[start,end]].sort((x,y)=>x[0]-y[0])){const last=merged.at(-1);if(last&&r[0]<=last[1]+1)last[1]=Math.max(last[1],r[1]);else merged.push(r);}
 entry.readRanges=merged;entry.status=merged.length===1&&merged[0][0]===1&&merged[0][1]===lines.length?'complete':'partial';entry.recordedAt=new Date().toISOString();
 await fs.writeFile(target,JSON.stringify(q,null,2));console.log({repo,file,status:entry.status,ranges:merged});
}else throw Error('read | mark');
