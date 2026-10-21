import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home='docs/research/bots-swarms',target='.tools/bots-swarms/cpython-cookiejar.py';
const manifest=path.join(home,'cookie-policy-source.json');
const [op,a,b]=process.argv.slice(2);
if(op==='init'){
  const source='C:/Python314/Lib/http/cookiejar.py',bytes=await fs.readFile(source);
  await fs.writeFile(target,bytes,{flag:'wx'});
  const entry={source,localFile:target,version:'CPython3.14.7 tags/v3.14.7:823f032; observed isolated interpreter',sha256:createHash('sha256').update(bytes).digest('hex'),lines:bytes.toString('utf8').split('\n').length,readRanges:[],status:'unread',at:new Date().toISOString()};
  await fs.writeFile(manifest,JSON.stringify(entry,null,2),{flag:'wx'});console.log(entry);
}else{
  const entry=JSON.parse(await fs.readFile(manifest)),bytes=await fs.readFile(entry.localFile);
  if(createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error('Changed dependency');
  const lines=bytes.toString('utf8').split('\n'),start=Number(a),end=Math.min(Number(b),lines.length);
  if(start<1||end<start)throw Error('Range');
  if(op==='read'){
    const output=lines.slice(start-1,end).map((s,i)=>`${start+i}: ${s}`).join('\n');
    if(output.length>24000)throw Error('Reduce range');console.log({start,end,total:lines.length});console.log(output);
  }else if(op==='mark'){
    const ranges=[];for(const r of [...entry.readRanges,[start,end]].sort((a,b)=>a[0]-b[0])){
      const prev=ranges.at(-1);if(prev&&r[0]<=prev[1]+1)prev[1]=Math.max(prev[1],r[1]);else ranges.push(r);
    }
    entry.readRanges=ranges;entry.status=ranges.length===1&&ranges[0][0]===1&&ranges[0][1]===lines.length?'complete':'partial';entry.reviewedAt=new Date().toISOString();
    await fs.writeFile(manifest,JSON.stringify(entry,null,2));console.log(entry);
  }else throw Error('init | read | mark');
}
