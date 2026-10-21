import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const run=promisify(execFile), home=path.resolve('docs/research/bots-swarms');
const repos=[['scrapy','scrapy/scrapy'],['bullmq','taskforcesh/bullmq'],['rate-limiter-flexible','animir/node-rate-limiter-flexible'],['coraza','corazawaf/coraza']];
await fs.mkdir(home,{recursive:true});
const snapshots=[];const queue=[];
for(const [name,upstream] of repos){
 const root=path.resolve('.tools/bots-swarms',name);
 try{await fs.access(path.join(root,'.git'));}catch{await fs.mkdir(path.dirname(root),{recursive:true});await run('git',['clone','--depth','1',`https://github.com/${upstream}.git`,root],{windowsHide:true});}
 const git=async args=>(await run('git',args,{cwd:root,windowsHide:true})).stdout.trim();
 const commit=await git(['rev-parse','HEAD']);snapshots.push({name,upstream,root,commit,date:await git(['log','-1','--format=%cI']),dirty:await git(['status','--short']),retrievedAt:new Date().toISOString(),basis:'Upstream shallow snapshot; no release or runtime verification implied'});
 async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(['.git','node_modules','vendor','dist'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(/\.(py|ts|js|lua|go)$/.test(e.name)){const b=await fs.readFile(p);queue.push({repo:name,path:path.relative(root,p).replaceAll('\\','/'),commit,sha256:createHash('sha256').update(b).digest('hex'),lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});}}}
 await walk(root);
}
for(const [name,value] of [['snapshots.json',snapshots],['queue.json',queue]])await fs.writeFile(path.join(home,name),JSON.stringify(value,null,2),{flag:'wx'});
console.log(snapshots);console.log({inventoried:queue.length,read:0});
