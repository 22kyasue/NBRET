import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),home=path.resolve('docs/research/toolchain'),root=path.resolve('.tools/toolchain/SharpHoundCommon-4.9.1');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
if(pins.some(p=>p.name==='SharpHoundCommon'))throw Error('Already pinned; preserve history');
const url='https://github.com/SpecterOps/SharpHoundCommon.git',ref='v4.9.1';
await exec('git',['clone','--depth','1','--branch',ref,url,root],{windowsHide:true});
const commit=(await exec('git',['-C',root,'rev-parse','HEAD'],{windowsHide:true})).stdout.trim();
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.name==='.git')continue;const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(/\.(cs|csproj|props|targets)$/.test(e.name)||e.name==='LICENSE'){const b=await fs.readFile(p);q.push({repo:'SharpHoundCommon',path:path.relative(root,p).replaceAll('\\','/'),commit,sha256:createHash('sha256').update(b).digest('hex'),lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});}}}
await walk(root);
pins.push({name:'SharpHoundCommon',url,root,commit,ref,retrievedAt:new Date().toISOString(),basis:'Explicit Stable dependency candidate 4.9.1; NOT proof of collector default Dev wildcard-resolved package source/binary equivalence'});
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(pins,null,2));await fs.writeFile(path.join(home,'queue.json'),JSON.stringify(q,null,2));console.log({commit,files:q.filter(e=>e.repo==='SharpHoundCommon').length});
