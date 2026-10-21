import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain'),root=path.resolve('.tools/toolchain/h11-installed-0.16.0'),site=path.resolve('.tools/toolchain/venv/Lib/site-packages');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
if(pins.some(p=>p.name==='h11'))throw Error('Already pinned; preserve history');
const identity='installed-wheel:h11==0.16.0';
await fs.mkdir(root,{recursive:true});
const records=(await fs.readFile(path.join(site,'h11-0.16.0.dist-info/RECORD'),'utf8')).trim().split('\n');
const verified=[];
for(const row of records){const [rel,expected]=row.split(',');if(!rel.startsWith('h11/')||!rel.endsWith('.py'))continue;
const b=await fs.readFile(path.join(site,rel));const actual=createHash('sha256').update(b).digest('base64url');if(expected!=='sha256='+actual)throw Error('Installed RECORD mismatch '+rel);
const target=path.join(root,rel);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,b);verified.push(rel);q.push({repo:'h11',path:rel,commit:identity,sha256:createHash('sha256').update(b).digest('hex'),lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});}
for(const rel of ['h11-0.16.0.dist-info/RECORD','h11-0.16.0.dist-info/METADATA','h11-0.16.0.dist-info/licenses/LICENSE.txt']){try{const b=await fs.readFile(path.join(site,rel));const target=path.join(root,rel);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,b);}catch(e){if(e.code!=='ENOENT')throw e;}}
pins.push({name:'h11',url:'https://github.com/python-hyper/h11',root,commit:identity,artifactIdentity:identity,retrievedAt:new Date().toISOString(),basis:'Copied installed package actually used by proxy lab; Python source bytes verified against installed distribution RECORD. commit field is artifact identity, NOT a VCS commit; RECORD is not an independent signature.',recordVerified:verified});
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(pins,null,2));await fs.writeFile(path.join(home,'queue.json'),JSON.stringify(q,null,2));console.log({identity,verified:verified.length});
