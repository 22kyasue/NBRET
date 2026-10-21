import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain'),pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json'))),pin=pins.find(x=>x.name==='prowler');
const files=['prowler/providers/aws/services/iam/lib/policy.py','prowler/providers/aws/lib/service/service.py','prowler/providers/common/provider.py'];
if(files.some(p=>q.some(x=>x.repo==='prowler'&&x.path===p)))throw Error('Already inventoried.');
for(const file of files){const url='https://raw.githubusercontent.com/prowler-cloud/prowler/'+pin.commit+'/'+file,r=await fetch(url);if(!r.ok)throw Error(file+' '+r.status);const b=Buffer.from(await r.arrayBuffer()),sha256=createHash('sha256').update(b).digest('hex'),target=path.join(pin.root,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,b,{flag:'wx'});pin.artifacts.push({file,url,sha256,retrievedAt:new Date().toISOString()});q.push({repo:'prowler',path:file,commit:pin.commit,sha256,lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});}
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(pins,null,2));await fs.writeFile(path.join(home,'queue.json'),JSON.stringify(q,null,2));console.log(q.filter(x=>x.repo==='prowler'&&files.includes(x.path)).map(x=>[x.path,x.lines]));
