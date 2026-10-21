// Record the exact data dependency fully read before adding its omitted extension.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const base='docs/research/bots-swarms/';
const q=JSON.parse(fs.readFileSync(base+'supporting-queue.json','utf8'));
const pin=JSON.parse(fs.readFileSync(base+'snapshots.json','utf8')).find(x=>x.name==='coraza');
const file='internal/operators/testdata/op/netranges.dat';
if(q.entries.some(e=>e.repo===pin.name&&e.path===file))throw Error('Already inventoried');
const bytes=fs.readFileSync(pin.root+'/'+file),lines=bytes.toString().split('\n').length;
q.entries.push({repo:pin.name,path:file,commit:pin.commit,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,lines,priority:2,status:'complete',readRanges:[[1,lines]],recordedAt:new Date().toISOString(),note:'Exact IP matcher test data omitted by extension inventory; full file read before append.'});
fs.writeFileSync(base+'supporting-queue.json',JSON.stringify(q,null,2));
console.log({lines,entries:q.entries.length});
