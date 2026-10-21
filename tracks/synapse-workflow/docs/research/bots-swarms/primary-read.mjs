import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const [id,a,b]=process.argv.slice(2),sources=JSON.parse(await fs.readFile('docs/research/bots-swarms/sources.json'));
const s=sources.find(e=>e.id===id);if(!s?.localFile)throw Error('No saved source');
const bytes=await fs.readFile(s.localFile);if(createHash('sha256').update(bytes).digest('hex')!==s.sha256)throw Error('Changed archive');
const lines=bytes.toString('utf8').split('\n'),start=Number(a),end=Math.min(Number(b),lines.length);
const out=lines.slice(start-1,end).map((line,i)=>`${start+i}: ${line}`).join('\n');if(out.length>24000)throw Error('Reduce range');
console.log({id,start,end,total:lines.length});console.log(out);
