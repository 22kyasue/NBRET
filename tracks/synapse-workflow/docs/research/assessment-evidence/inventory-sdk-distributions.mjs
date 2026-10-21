import fs from 'node:fs';
import https from 'node:https';
const get=url=>new Promise((resolve,reject)=>https.get(url,{headers:{'User-Agent':'NBRET-public-source-research'}},r=>{let s='';r.on('data',d=>s+=d);r.on('end',()=>r.statusCode===200?resolve(JSON.parse(s)):reject(Error(`${r.statusCode} ${url}`)));}).on('error',reject));
const out=[];
for(const [name,version]of [['openai-codex','0.1.0b3'],['claude-agent-sdk','0.2.90']]){
 const url=`https://pypi.org/pypi/${name}/${version}/json`,r=await get(url);
 out.push({name,version,url,at:new Date().toISOString(),meaning:'declared lower bound in pinned wrapper, not previously installed runtime dependency',license:r.info.license,license_expression:r.info.license_expression,project_urls:r.info.project_urls,requires_dist:r.info.requires_dist,files:r.urls.map(x=>({filename:x.filename,url:x.url,size:x.size,digests:x.digests,packagetype:x.packagetype}))});
}
fs.writeFileSync('docs/research/assessment-evidence/sdk-distributions.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
