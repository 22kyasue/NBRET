import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const run=promisify(execFile),home=path.resolve('docs/research/bots-swarms');
const sp=path.join(home,'snapshots.json'),qp=path.join(home,'queue.json'),pins=JSON.parse(await fs.readFile(sp)),q=JSON.parse(await fs.readFile(qp));
if(pins.some(p=>p.name==='memberlist'))throw Error('Already inventoried; preserve history');
const root=path.resolve('.tools/bots-swarms/memberlist');
try{await fs.access(path.join(root,'.git'));}catch{await run('git',['clone','--depth','1','https://github.com/hashicorp/memberlist.git',root],{windowsHide:true});}
const git=async args=>(await run('git',args,{cwd:root,windowsHide:true})).stdout.trim();const commit=await git(['rev-parse','HEAD']);
pins.push({name:'memberlist',upstream:'hashicorp/memberlist',root,commit,date:await git(['log','-1','--format=%cI']),dirty:await git(['status','--short']),retrievedAt:new Date().toISOString(),basis:'Default branch shallow snapshot; legitimate gossip membership/failure detection study; no execution'});
let added=0;async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.name==='.git')continue;const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(e.name.endsWith('.go')){const b=await fs.readFile(p);q.push({repo:'memberlist',path:path.relative(root,p).replaceAll('\\','/'),commit,sha256:createHash('sha256').update(b).digest('hex'),lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});added++;}}}await walk(root);
await fs.writeFile(sp,JSON.stringify(pins,null,2));await fs.writeFile(qp,JSON.stringify(q,null,2));console.log({commit,added,read:0});
