import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain'),root=path.resolve('.tools/toolchain/wireshark');
const hash=b=>createHash('sha256').update(b).digest('hex');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
if(pins.some(p=>p.name==='wireshark'))throw Error('Already pinned; preserve history');
const url='https://api.github.com/repos/wireshark/wireshark/commits/v4.6.9';
const response=await fetch(url,{headers:{'User-Agent':'NBRET-public-source-research'}});
if(!response.ok)throw Error('Pin resolution failed '+response.status);
const pinBody=Buffer.from(await response.arrayBuffer()),data=JSON.parse(pinBody);
await fs.mkdir(root,{recursive:true});await fs.writeFile(path.join(root,'pin-receipt.json'),pinBody);
const q=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
const files=['tshark.c','capture_opts.c','capture/capture_session.c','epan/epan.c','wiretap/wtap.c','wiretap/file_access.c','wiretap/pcapng.c','epan/dfilter/dfilter.c','test/suite_clopts.py','test/suite_dissection.py','COPYING'];
const artifacts=[];
for(const file of files){const raw='https://raw.githubusercontent.com/wireshark/wireshark/'+data.sha+'/'+file;const r=await fetch(raw);if(!r.ok){artifacts.push({file,url:raw,status:r.status});continue;}
const b=Buffer.from(await r.arrayBuffer()),target=path.join(root,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,b);const sha256=hash(b);artifacts.push({file,url:raw,sha256});q.push({repo:'wireshark',path:file,commit:data.sha,sha256,lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[]});}
pins.push({name:'wireshark',url:'https://gitlab.com/wireshark/wireshark',mirror:'https://github.com/wireshark/wireshark',root,commit:data.sha,ref:'v4.6.9',commitDate:data.commit.committer.date,retrievedAt:new Date().toISOString(),basis:'Selected raw files from release tag resolved through project GitHub mirror; not whole repository; no download signature verification',pinReceipt:{url,sha256:hash(pinBody)},artifacts});
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(pins,null,2));await fs.writeFile(path.join(home,'queue.json'),JSON.stringify(q,null,2));console.log({pin:data.sha,artifacts:artifacts.length,files:q.filter(e=>e.repo==='wireshark').map(e=>[e.path,e.lines])});
