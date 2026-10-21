// Path/size inventory only: no semantic read credit, no source mutation.
import fs from 'node:fs/promises';
import path from 'node:path';
const base=path.resolve('docs/research/toolchain'),pins=JSON.parse(await fs.readFile(path.join(base,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(base,'queue.json'))),material=[];
for(const pin of pins){
 const seen=new Map(q.filter(x=>x.repo===pin.name).map(x=>[x.path,x]));
 async function walk(dir){
  for(const e of await fs.readdir(dir,{withFileTypes:true})){
   if(e.name==='.git')continue;
   const p=path.join(dir,e.name),relative=path.relative(pin.root,p).replaceAll('\\','/');
   if(e.isDirectory())await walk(p);
   else if(e.isFile()){
    const st=await fs.stat(p),row=seen.get(relative);
    material.push({repo:pin.name,path:relative,bytes:st.size,commit:pin.commit,queueStatus:row?.status??'not_in_read_queue',basis:'Local path inventory, not semantic reading or proof of upstream tree completeness'});
   }else material.push({repo:pin.name,path:relative,commit:pin.commit,queueStatus:'nonregular_boundary',basis:'Not traversed'});
  }
 }
 await walk(pin.root);
}
const summary=pins.map(p=>({repo:p.name,localPaths:material.filter(x=>x.repo===p.name).length,notInReadQueue:material.filter(x=>x.repo===p.name&&x.queueStatus==='not_in_read_queue').length}));
const report={at:new Date().toISOString(),scope:'Existing pinned local roots; no repository addition or network retrieval. Missing upstream artifacts are not inventoried as accessible local files.',limitations:['Metadata paths and sizes only, no reading credit','Includes local metadata/generated/cache artifacts that require later relevance/provenance classification','Selected raw snapshots do not cover their complete upstream trees','Original code-only queue omits documentation/configuration and some implementation languages; reconcile before exhaustion'],summary,material};
await fs.writeFile(path.join(base,'local-material-inventory.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({at:report.at,summary,paths:material.length,queued:q.length}));
