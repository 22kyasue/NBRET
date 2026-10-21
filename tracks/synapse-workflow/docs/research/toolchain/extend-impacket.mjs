import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),home=path.resolve('docs/research/toolchain'),root=path.resolve('.tools/toolchain/impacket');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json'))),catalog=JSON.parse(await fs.readFile(path.join(home,'catalog.json'))),row=catalog.find(x=>x.project==='fortra/impacket');
if(pins.some(x=>x.name==='impacket'))throw Error('Already pinned; preserve history.');
if(!row?.catalogPin?.commit)throw Error('Catalog pin unavailable.');
await exec('git',['clone','--depth','1','--branch',row.catalogPin.ref,'https://github.com/fortra/impacket.git',root],{windowsHide:true,maxBuffer:1024*1024});
const commit=(await exec('git',['-C',root,'rev-parse','HEAD'],{windowsHide:true})).stdout.trim();
if(commit!==row.catalogPin.commit)throw Error('Tag changed from retained catalog pin; stop before inventory.');
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.name==='.git')continue;const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(/\.(py|toml|cfg|ini)$/.test(e.name)||/^(LICENSE|requirements.*\.txt)$/.test(e.name)){const b=await fs.readFile(p);q.push({repo:'impacket',path:path.relative(root,p).replaceAll('\\','/'),commit,sha256:createHash('sha256').update(b).digest('hex'),lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});}}}
await walk(root);pins.push({name:'impacket',url:'https://github.com/fortra/impacket',root,commit,ref:row.catalogPin.ref,retrievedAt:new Date().toISOString(),basis:'Release tag matches earlier retained catalog resolution; source only, no install or protocol execution'});
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(pins,null,2));await fs.writeFile(path.join(home,'queue.json'),JSON.stringify(q,null,2));
console.log({commit,ref:row.catalogPin.ref,files:q.filter(x=>x.repo==='impacket').length});
