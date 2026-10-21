import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const here=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const root=path.resolve(here,'../../..');
const receipts=path.join(root,'runs/cybersecurity-firms-20261017');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const rel=p=>path.relative(root,p).replaceAll('\\','/');
const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
const catalogs=[];
for(const f of fs.readdirSync(receipts).filter(n=>/^capture-\d+\.json$/.test(n)).sort()){
 const items=JSON.parse(fs.readFileSync(path.join(receipts,f),'utf8'));
 for(const entry of items){
  const v=entry.status==='fulfilled'?entry.value:entry;
  if(entry.status==='rejected'){catalogs.push({receipt:f,status:'retrieval-failed',detail:String(entry.reason)});continue;}
  const result=v.result;
  const text=(result?.content||[]).map(c=>c.text||'').join('\n');
  const first=text.split('\n')[0];
  const status=(first.match(/\[(\d{3}) /)||[])[1]||null;
  const u=v.url||(first.match(/— (https?:\/\/\S+) \[/)||[])[1]||(v.key?.startsWith('http')?v.key:null);
  catalogs.push({url:u,accessed:'2026-10-17',captureKind:'provider extracted-text result, not raw HTML',httpStatus:status,title:first,textSha256:sha(Buffer.from(text)),characters:text.length,receipt:rel(path.join(receipts,f)),reading:'consult continuation.md and canonical claim artifact; retrieval is not reading'});
 }
}
const links=[];
for(const f of walk(here).filter(f=>f.endsWith('.md'))){
 const text=fs.readFileSync(f,'utf8');
 for(const m of text.matchAll(/\[[^\]]*\]\((https?:\/\/[^)]+)\)/g)) links.push({url:m[1],artifact:rel(f)});
}
const sources=Array.from(new Set([...catalogs.map(c=>c.url),...links.map(c=>c.url)].filter(Boolean))).map(url=>({
 url,captures:catalogs.filter(c=>c.url===url),citedBy:Array.from(new Set(links.filter(l=>l.url===url).map(l=>l.artifact))),
 acquisition:catalogs.some(c=>c.url===url)?'captured text or recorded retrieval failure':'linked primary discovery; no archived full-page reading implied'
}));
fs.writeFileSync(path.join(here,'sources.json'),JSON.stringify({generated:new Date().toISOString(),sources},null,2)+'\n');
const reads=JSON.parse(fs.readFileSync(path.join(here,'reading-ranges.json'),'utf8'));
const sourceFiles=walk(path.join(receipts,'source')).map(f=>{
 const b=fs.readFileSync(f);const p=rel(f);const r=reads.files[p]||{state:'downloaded-unread',ranges:[]};
 const lines=b.toString('utf8').split('\n').length;
 if(r.state==='complete-file')r.ranges=[[1,lines]];for(const [a,z] of r.ranges)if(a<1||z<a||z>lines)throw Error('Invalid reading range '+p+' '+a+'-'+z+' of '+lines);
 return {path:p,sha256:sha(b),bytes:b.length,lines,...r,runtime:'not executed'};
});
fs.writeFileSync(path.join(here,'source-reads.json'),JSON.stringify({generated:new Date().toISOString(),files:sourceFiles},null,2)+'\n');
const missing=[];
for(const f of walk(here).filter(f=>f.endsWith('.md'))){
 const text=fs.readFileSync(f,'utf8');
 for(const m of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  let target=m[1];if(/^(https?:|#)/.test(target))continue;
  target=target.split('#')[0];if(!target)continue;
  if(!fs.existsSync(path.resolve(path.dirname(f),target)))missing.push({artifact:rel(f),target});
 }
}
const report={generated:new Date().toISOString(),sourceFiles:sourceFiles.length,cataloguedSources:sources.length,missingLinks:missing,meaning:'Local provenance/link checks only; no product correctness or research completeness claim'};
fs.writeFileSync(path.join(here,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
if(missing.length)process.exitCode=1;
