import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
const home=resolve('docs/research/security-landscape/deep-review');
const roots=Object.fromEntries(JSON.parse(await readFile(join(home,'snapshots.json'),'utf8')).map(x=>[x.name,x.root]));
const q=JSON.parse(await readFile(join(home,'file-queue.json'),'utf8'));
const result={at:new Date().toISOString(),jsonParsed:0,localMarkdownLinks:0,brokenLinks:[],reviewedFileHashesChecked:0,hashMismatches:[],invalidReadingRanges:[],note:'Artifact integrity checks only; no source understanding, complete coverage or security assurance inferred.'};
for(const f of await readdir(home)){
 const p=join(home,f);
 if(f.endsWith('.json')){JSON.parse(await readFile(p,'utf8'));result.jsonParsed++;}
 if(f.endsWith('.md')){
  const s=await readFile(p,'utf8');
  for(const m of s.matchAll(/\]\(([^)]+)\)/g)){
   let t=m[1];if(/^(?:https?:|#|mailto:)/.test(t))continue;
   t=t.replace(/^<|>$/g,'').split('#')[0];if(!t)continue;
   result.localMarkdownLinks++;try{await readFile(resolve(dirname(p),decodeURIComponent(t)));}catch{result.brokenLinks.push({file:f,target:t});}
  }
 }
}
for(const e of q.filter(x=>x.readRanges?.length)){
 let b;try{b=await readFile(join(roots[e.repo],e.path));}catch(err){result.hashMismatches.push({repo:e.repo,path:e.path,error:err.message});continue;}
 result.reviewedFileHashesChecked++;
 if(createHash('sha256').update(b).digest('hex')!==e.sha256)result.hashMismatches.push({repo:e.repo,path:e.path});
 const ranges=e.readRanges,complete=ranges.length===1&&ranges[0][0]===1&&ranges[0][1]===e.lines;
 if((e.status==='complete')!==complete||ranges.some(([a,z])=>a<1||z<a||z>e.lines))result.invalidReadingRanges.push({repo:e.repo,path:e.path});
}
await writeFile(join(home,'verification-latest.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
if(result.brokenLinks.length||result.hashMismatches.length||result.invalidReadingRanges.length)process.exitCode=1;
