import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain'),pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json'))),pin=pins.find(x=>x.name==='prowler'),file='prowler/lib/outputs/common.py';
if(q.some(x=>x.repo==='prowler'&&x.path===file))throw Error('Already inventoried.');
const url='https://raw.githubusercontent.com/prowler-cloud/prowler/'+pin.commit+'/'+file,r=await fetch(url);if(!r.ok)throw Error(r.status);
const b=Buffer.from(await r.arrayBuffer()),sha256=createHash('sha256').update(b).digest('hex');await fs.writeFile(path.join(pin.root,file),b,{flag:'wx'});
pin.artifacts.push({file,url,sha256,retrievedAt:new Date().toISOString()});q.push({repo:'prowler',path:file,commit:pin.commit,sha256,lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(pins,null,2));await fs.writeFile(path.join(home,'queue.json'),JSON.stringify(q,null,2));console.log(q.at(-1));
