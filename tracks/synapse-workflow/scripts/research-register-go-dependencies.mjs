import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {createHash} from 'node:crypto';
const home=resolve('docs/research/security-landscape/deep-review'),base=resolve('.tools/security-research-go/module-cache/pkg/mod/github.com/projectdiscovery');
const q=JSON.parse(await readFile(join(home,'file-queue.json'),'utf8')),s=JSON.parse(await readFile(join(home,'snapshots.json'),'utf8'));
const sum=await readFile('C:/Users/kotar/.codex/research/nuclei/go.sum','utf8');
for(const [name,module,version] of [['Fastdialer','fastdialer','v0.5.25'],['NetworkPolicy','networkpolicy','v0.1.54']]){
 const root=join(base,`${module}@${version}`),modulePath=`github.com/projectdiscovery/${module}`;
 if(s.some(e=>e.name===name)){console.log(`${name} already registered; preserved`);continue;}
 const sums=sum.split(/\r?\n/).filter(x=>x.startsWith(`${modulePath} ${version} `)||x.startsWith(`${modulePath} ${version}/go.mod `));
 const files=[];async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())await walk(p);else if(/\.go$|^go\.(mod|sum)$|^LICENSE/i.test(e.name)){const b=await readFile(p),path=relative(root,p).replaceAll('\\','/');files.push(path);q.push({repo:name,path,commit:null,version,sha256:createHash('sha256').update(b).digest('hex'),lines:b.toString().split('\n').length,status:'unread',readRanges:[],scope:'Cached module dependency inventory only; not read or runtime evidence'});}}}await walk(root);
 s.push({name,root,commit:null,module:modulePath,version,goSum:sums,accessedAt:new Date().toISOString(),basis:'Existing official Go module cache resolved by pinned parent. Module version/checksum, not invented Git commit; inventory not reading.',files:files.length});console.log(JSON.stringify({name,version,files:files.length,sums}));
}
await writeFile(join(home,'file-queue.json'),JSON.stringify(q,null,2));await writeFile(join(home,'snapshots.json'),JSON.stringify(s,null,2));
