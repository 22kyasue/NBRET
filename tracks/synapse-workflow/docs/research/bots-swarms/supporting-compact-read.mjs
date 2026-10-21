import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
// Display-only whitespace compaction; preserves every selected JSON source line's
// non-indentation text in order, including duplicate keys and partial objects.
// Reading credit is recorded separately, after inspecting the bounded output.
const home=path.resolve('docs/research/bots-swarms');
const [repo,file,a,b]=process.argv.slice(2);
if(!file.endsWith('.json'))throw Error('JSON source only');
const q=JSON.parse(await fs.readFile(path.join(home,'supporting-queue.json')));
const entry=q.entries.find(x=>x.repo===repo&&x.path===file);
if(!entry)throw Error('Unknown supporting file');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
const raw=await fs.readFile(path.join(pins.find(x=>x.name===repo).root,file));
if(createHash('sha256').update(raw).digest('hex')!==entry.sha256)throw Error('Source changed');
const lines=raw.toString('utf8').split('\n');
const start=Number(a),end=Math.min(Number(b),lines.length);
if(!Number.isInteger(start)||!Number.isInteger(end)||start<1||end<start)throw Error('Invalid range');
const out=[];let group=[],from=start;
for(let i=start;i<=end;i++){
  group.push(lines[i-1].trim());
  if(/^\s*}[,\s]*$/.test(lines[i-1])||i===end){
    out.push(`${from}-${i}: ${group.join(' ')}`);group=[];from=i+1;
  }
}
const displayed=out.join('\n');
if(displayed.length>24000)throw Error('Reduce range');
console.log({repo,file,start,end,total:lines.length,display:'All selected lines in order; indentation compacted; no parse/reserialize or reading credit'});
console.log(displayed);
