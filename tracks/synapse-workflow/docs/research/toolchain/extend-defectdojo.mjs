import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/toolchain'),root=path.resolve('.tools/toolchain/defectdojo'),hash=b=>createHash('sha256').update(b).digest('hex');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json'))),row=JSON.parse(await fs.readFile(path.join(home,'catalog.json'))).find(x=>x.project==='DefectDojo/django-DefectDojo');
if(pins.some(x=>x.name==='defectdojo'))throw Error('Already inventoried.');
const commit=row.catalogPin.commit,url='https://api.github.com/repos/'+row.project+'/git/trees/'+commit+'?recursive=1',r=await fetch(url,{headers:{'User-Agent':'NBRET-public-source-research'}});
if(!r.ok)throw Error('Tree '+r.status);const b=Buffer.from(await r.arrayBuffer()),tree=JSON.parse(b);
if(tree.truncated)throw Error('Tree truncated; do not claim full file-name inventory.');
await fs.mkdir(root,{recursive:true});await fs.writeFile(path.join(root,'tree-receipt.json'),b,{flag:'wx'});
const files=tree.tree.filter(x=>x.type==='blob'&&(/^(LICENSE.md|dojo\/importers\/.*\.py|dojo\/tools\/nmap\/.*\.py|unittests\/tools\/test_nmap_parser.py)$/.test(x.path))).map(x=>x.path),artifacts=[];
for(const file of files){const raw='https://raw.githubusercontent.com/'+row.project+'/'+commit+'/'+file,rr=await fetch(raw);if(!rr.ok)throw Error(file+' '+rr.status);const bb=Buffer.from(await rr.arrayBuffer()),sha256=hash(bb),target=path.join(root,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bb,{flag:'wx'});artifacts.push({file,url:raw,sha256});q.push({repo:'defectdojo',path:file,commit,sha256,lines:bb.toString('utf8').split('\n').length,status:'unread',readRanges:[]});}
pins.push({name:'defectdojo',url:'https://github.com/'+row.project,root,commit,ref:row.catalogPin.ref,retrievedAt:new Date().toISOString(),basis:'Selected raw importer and Nmap parser files; full recursive tree receipt is file-name metadata only, not downloaded/read source',treeReceipt:{url,sha256:hash(b)},artifacts});
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(pins,null,2));await fs.writeFile(path.join(home,'queue.json'),JSON.stringify(q,null,2));console.log(q.filter(x=>x.repo==='defectdojo').map(x=>[x.path,x.lines]));
