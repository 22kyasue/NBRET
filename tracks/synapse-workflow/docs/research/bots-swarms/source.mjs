import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/bots-swarms');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
const qp=path.join(home,'queue.json'),q=JSON.parse(await fs.readFile(qp));
const [op,repo,file,first,last]=process.argv.slice(2);
if(op==='status'){console.log(pins.map(p=>({repo:p.name,...Object.fromEntries(['unread','partial','complete'].map(s=>[s,q.filter(e=>e.repo===p.name&&e.status===s).length]))})));process.exit();}
const e=q.find(e=>e.repo===repo&&e.path===file);if(!e)throw Error('Unknown file');
const b=await fs.readFile(path.join(pins.find(p=>p.name===repo).root,file));
if(createHash('sha256').update(b).digest('hex')!==e.sha256)throw Error('Source changed');
const lines=b.toString('utf8').split('\n'),start=Number(first||1),end=Math.min(Number(last||start+149),lines.length);
if(start<1||end<start)throw Error('Invalid range');
if(op==='read'){const out=lines.slice(start-1,end).map((s,i)=>`${start+i}: ${s}`).join('\n');if(out.length>24000)throw Error('Use bounded range');console.log({repo,file,start,end,total:lines.length});console.log(out);}
else if(op==='mark'){const merged=[];for(const r of [...e.readRanges,[start,end]].sort((a,b)=>a[0]-b[0])){const prev=merged.at(-1);if(prev&&r[0]<=prev[1]+1)prev[1]=Math.max(prev[1],r[1]);else merged.push(r);}e.readRanges=merged;e.status=merged.length===1&&merged[0][0]===1&&merged[0][1]===lines.length?'complete':'partial';e.recordedAt=new Date().toISOString();await fs.writeFile(qp,JSON.stringify(q,null,2));console.log(e);}
else throw Error('read | mark | status');
