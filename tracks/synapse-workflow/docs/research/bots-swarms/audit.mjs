import fs from 'node:fs/promises';
import path from 'node:path';
const home=path.resolve('docs/research/bots-swarms'),sp=path.join(home,'sources.json');
const sources=JSON.parse(await fs.readFile(sp));
for(const r of sources)if(r.localFile){const body=await fs.readFile(r.localFile,'utf8');r.contentState=/triggerInterstitialChallenge|apology_objects\/interstitial/.test(body)?'challenge page; requested document not archived':'saved bytes; semantic review status separate';}
await fs.writeFile(sp,JSON.stringify(sources,null,2));
const broken=[];let links=0;
for(const name of await fs.readdir(home)){if(!name.endsWith('.md'))continue;const s=await fs.readFile(path.join(home,name),'utf8');for(const m of s.matchAll(/\]\(([^)]+)\)/g)){const target=m[1];if(/^(https?:|#)/.test(target))continue;links++;try{await fs.access(path.resolve(home,target.split('#')[0]));}catch{broken.push({file:name,target});}}}
const queue=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
const receipt={at:new Date().toISOString(),links,broken,fileStates:Object.fromEntries(['unread','partial','complete'].map(s=>[s,queue.filter(e=>e.status===s).length])),sourceStates:sources.map(({id,contentState})=>({id,contentState}))};
await fs.writeFile(path.join(home,`audit-receipt-${Date.now()}.json`),JSON.stringify(receipt,null,2),{flag:'wx'});
console.log(receipt);if(broken.length)process.exitCode=1;
