import { readFile, writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, join, relative } from 'node:path';
const home=resolve('docs/research/security-landscape/deep-review');
const roots={NBRET:resolve('.'),ZAP:'C:/Users/kotar/.codex/research/zaproxy-2.17.0',Nuclei:'C:/Users/kotar/.codex/research/nuclei',ZAPNetwork:'C:/Users/kotar/.codex/research/zap-extensions-network-0.25.0',ZAPRules:'C:/Users/kotar/.codex/research/zap-extensions-ascanrules-78',Fastdialer:resolve('.tools/security-research-go/module-cache/pkg/mod/github.com/projectdiscovery/fastdialer@v0.5.25'),NetworkPolicy:resolve('.tools/security-research-go/module-cache/pkg/mod/github.com/projectdiscovery/networkpolicy@v0.1.54')};
const digest=b=>createHash('sha256').update(b).digest('hex');
const git=(r,args)=>execFileSync('git',args,{cwd:r,windowsHide:true,encoding:'utf8'}).trim();
const [op,repo,file,from,count]=process.argv.slice(2);
const qpath=join(home,'file-queue.json');
if(op==='init'){
 await mkdir(home,{recursive:true});
 let exists=false;try{await stat(qpath);exists=true;}catch{}
 if(exists)throw new Error('Queue already exists; preserve reading history');
 const snapshots=[],queue=[];
 for(const [name,root]of Object.entries(roots)){
  const commit=git(root,['rev-parse','HEAD']);
  snapshots.push({name,root,commit,date:git(root,['log','-1','--format=%cI']),dirty:git(root,['status','--short']),
   basis:name==='ZAP'?'Installed release v2.17.0 source tag; resolved commit recorded':'Saved snapshot; no assumption that upstream HEAD is identical'});
  async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){
   const p=join(dir,e.name);if(e.isDirectory()){if(!['node_modules','.git','.tools','runs'].includes(e.name))await walk(p);}
   else if(/\.(?:mjs|java|go|py|gradle|xml)$/.test(e.name)){
    const path=relative(root,p).replaceAll('\\','/');
    const selected=name==='NBRET'?/^(src|test|scripts)\//.test(path):name==='ZAP'?/^zap\/src\/(main|test)\/java\//.test(path):/^pkg\/(templates|operators|protocols|core|output|input)\//.test(path);
    if(!selected)continue;const b=await readFile(p);
    queue.push({repo:name,path,commit,sha256:digest(b),lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[],
      scope:name==='ZAP'?'Core source/test inventory; not every file necessarily required for chosen workflow':'Owned implementation/dependency inventory; inventory is not reading'});
   }
  }}
  await walk(root);
 }
 await writeFile(join(home,'snapshots.json'),JSON.stringify(snapshots,null,2));
 await writeFile(qpath,JSON.stringify(queue,null,2));console.log('Initialized pinned unread inventory; no reading credit assigned.');
}else if(op==='extend'){
 if(!['ZAPNetwork','ZAPRules'].includes(repo))throw new Error('Explicit addon repository required');
 const root=roots[repo],commit=git(root,['rev-parse','HEAD']);
 const q=JSON.parse(await readFile(qpath,'utf8'));
 if(q.some(e=>e.repo===repo))throw new Error('Addon already inventoried; preserve queue');
 const selected=repo==='ZAPNetwork'?['network','reports']:['ascanrules'];
 async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){
  const p=join(dir,e.name);if(e.isDirectory())await walk(p);
  else if(e.name.endsWith('.java')){const b=await readFile(p);q.push({repo,path:relative(root,p).replaceAll('\\','/'),commit,sha256:digest(b),lines:b.toString('utf8').split('\n').length,status:'unread',readRanges:[],scope:'Addon source/test inventory; not reading or runtime assurance'});}
 }}
 for(const addon of selected)await walk(join(root,'addOns',addon,'src'));
 const sp=join(home,'snapshots.json'),snapshots=JSON.parse(await readFile(sp,'utf8'));
 snapshots.push({name:repo,root,commit,date:git(root,['log','-1','--format=%cI']),dirty:git(root,['status','--short']),basis:'Official source tag matching installed addon filename; not reproducible-build verification'});
 await writeFile(sp,JSON.stringify(snapshots,null,2));await writeFile(qpath,JSON.stringify(q,null,2));console.log('Extended unread addon inventory without altering previous reading credit.');
}else if(op==='show'){
 if(!roots[repo]||!file||file.includes('..'))throw new Error('Known repository and contained file required');
 const b=await readFile(join(roots[repo],file)),a=b.toString('utf8').split('\n'),start=Number(from||1),end=Math.min(a.length,start+Number(count||180)-1);
 const text=a.slice(start-1,end).map((x,i)=>`${i+start}: ${x}`).join('\n');
 if(text.length>23000)throw new Error('Output exceeds bounded read size; select fewer lines');
 console.log(JSON.stringify({repo,file,sha256:digest(b),totalLines:a.length,start,end}));console.log(text);
}else if(op==='mark'){
 const q=JSON.parse(await readFile(qpath,'utf8')),e=q.find(x=>x.repo===repo&&x.path===file);if(!e)throw new Error('File absent from pinned queue');
 if(digest(await readFile(join(roots[repo],file)))!==e.sha256)throw new Error('Source changed; do not credit reading to old snapshot');
 const start=Number(from),end=Number(count);if(start<1||end<start||end>e.lines)throw new Error('Invalid inspected range');
 const merged=[];for(const r of [...e.readRanges,[start,end]].sort((a,b)=>a[0]-b[0])){const last=merged.at(-1);if(last&&r[0]<=last[1]+1)last[1]=Math.max(last[1],r[1]);else merged.push([...r]);}
 e.readRanges=merged;e.status=merged.length===1&&merged[0][0]===1&&merged[0][1]===e.lines?'complete':'partial';e.lastRecordedAt=new Date().toISOString();
 await writeFile(qpath,JSON.stringify(q,null,2));console.log(`${repo} ${file}: ${e.status} ${JSON.stringify(merged)}`);
}else if(op==='status'){
 const q=JSON.parse(await readFile(qpath,'utf8'));console.log(JSON.stringify(Object.fromEntries(Object.keys(roots).map(r=>[r,Object.fromEntries(['unread','partial','complete'].map(s=>[s,q.filter(x=>x.repo===r&&x.status===s).length]))])),null,2));
}else throw new Error('Use init | show REPO FILE START COUNT | mark REPO FILE START END | status');
