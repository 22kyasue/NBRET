import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json'))),pin=pins.find(x=>x.name==='wireshark');
const files=['wiretap/libpcap.c','epan/packet.c','epan/dfilter/dfvm.c'];
if(files.some(file=>q.some(x=>x.repo==='wireshark'&&x.path===file)))throw Error('Already inventoried; preserve source/read history.');
for(const file of files){
 const url='https://raw.githubusercontent.com/wireshark/wireshark/'+pin.commit+'/'+file,r=await fetch(url);
 if(!r.ok)throw Error(file+' '+r.status);
 const b=Buffer.from(await r.arrayBuffer()),sha256=createHash('sha256').update(b).digest('hex'),target=path.join(pin.root,file);
 await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,b,{flag:'wx'});
 pin.artifacts.push({file,url,sha256,retrievedAt:new Date().toISOString()});
 q.push({repo:'wireshark',path:file,commit:pin.commit,sha256,lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});
}
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(pins,null,2));await fs.writeFile(path.join(home,'queue.json'),JSON.stringify(q,null,2));
console.log(q.filter(x=>x.repo==='wireshark'&&files.includes(x.path)).map(x=>[x.path,x.lines]));
