import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const home=path.resolve('docs/research/bots-swarms');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
const main=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
const entries=[];
for(const pin of pins){
 const known=new Set(main.filter(x=>x.repo===pin.name).map(x=>x.path));
 async function walk(dir,relative=''){
  for(const item of await fs.readdir(dir,{withFileTypes:true})){
   if(['.git','node_modules','.venv','__pycache__'].includes(item.name))continue;
   const rel=relative?`${relative}/${item.name}`:item.name;
   const full=path.join(dir,item.name);
   if(item.isDirectory()){await walk(full,rel);continue;}
   if(!item.isFile()||known.has(rel))continue;
   if(!/\.(?:md|rst|txt|json|toml|yaml|yml|ini|cfg|lock|mod|sum)$/.test(rel)&&!/(?:requirements[^/]*|Dockerfile|Makefile|LICENSE|NOTICE)$/.test(rel))continue;
   const raw=await fs.readFile(full);
   const dependency=/package(?:-lock)?\.json$|pnpm-lock|yarn.lock|go\.(?:mod|sum)$|pyproject|requirements|setup\.(?:cfg|py)$/.test(rel);
   const config=/\.github\/|config|Dockerfile|Makefile|\.ya?ml$/.test(rel);
   entries.push({repo:pin.name,path:rel,commit:pin.commit,sha256:createHash('sha256').update(raw).digest('hex'),bytes:raw.length,lines:raw.toString('utf8').split('\n').length,priority:dependency?1:config?2:3,status:'unread',readRanges:[]});
  }
 }
 await walk(pin.root);
}
entries.sort((a,b)=>a.priority-b.priority||a.repo.localeCompare(b.repo)||a.path.localeCompare(b.path));
const target=path.join(home,'supporting-queue.json');
await fs.writeFile(target,JSON.stringify({at:new Date().toISOString(),scope:'Supporting config/docs/dependency declarations outside immutable 1511-file main inventory. Inventory only; no semantic credit.',entries},null,2),{flag:'wx'});
console.log({target,files:entries.length,dependencyPriority:entries.filter(x=>x.priority===1).length});
