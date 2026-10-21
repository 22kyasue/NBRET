import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain'),root=path.resolve('.tools/toolchain/go/modules/github.com/specterops/dawgs@v0.9.2');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
if(pins.some(p=>p.name==='dawgs'))throw Error('Already pinned; preserve history');
const infoPath=path.resolve('.tools/toolchain/go/modules/cache/download/github.com/specterops/dawgs/@v/v0.9.2.info');
const info=JSON.parse(await fs.readFile(infoPath));
const commit=info.Origin.Hash;
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(/\.(go|mod|sum)$/.test(e.name)||e.name==='LICENSE'){const b=await fs.readFile(p);q.push({repo:'dawgs',path:path.relative(root,p).replaceAll('\\','/'),commit,sha256:createHash('sha256').update(b).digest('hex'),lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});}}}
await walk(root);
pins.push({name:'dawgs',url:info.Origin.URL,root,commit,ref:'v0.9.2',moduleOrigin:info,moduleZipSum:(await fs.readFile(infoPath.replace('.info','.ziphash'),'utf8')).trim(),retrievedAt:new Date().toISOString(),basis:'Actual dependency obtained by isolated Go test with go.sum; origin VCS/hash from Go module info; module h1 is a content sum, not raw ZIP SHA256 or a signature'});
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(pins,null,2));await fs.writeFile(path.join(home,'queue.json'),JSON.stringify(q,null,2));console.log({commit,files:q.filter(e=>e.repo==='dawgs').length});
