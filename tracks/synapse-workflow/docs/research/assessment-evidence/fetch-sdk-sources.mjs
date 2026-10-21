import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import crypto from 'node:crypto';
const catalog=JSON.parse(fs.readFileSync('docs/research/assessment-evidence/sdk-distributions.json'));
const root='C:/Users/kotar/.codex/research/assessment-evidence-sdk-sources';
fs.mkdirSync(root,{recursive:true});
const receipts=[];
for(const item of catalog){
 const file=item.files.find(f=>f.packagetype==='sdist');
 const bytes=await new Promise((resolve,reject)=>https.get(file.url,r=>{const b=[];r.on('data',d=>b.push(d));r.on('end',()=>r.statusCode===200?resolve(Buffer.concat(b)):reject(Error(`HTTP ${r.statusCode}`)));}).on('error',reject));
 const hash=crypto.createHash('sha256').update(bytes).digest('hex');
 if(hash!==file.digests.sha256||bytes.length!==file.size)throw Error('Distribution mismatch');
 const target=path.join(root,file.filename);fs.writeFileSync(target,bytes,{flag:'wx'});
 receipts.push({name:item.name,version:item.version,url:file.url,path:target,sha256:hash,bytes:bytes.length,at:new Date().toISOString(),scope:'source distribution only, no install/build/setup/CLI invocation'});
}
fs.writeFileSync('docs/research/assessment-evidence/sdk-source-download-receipt.json',JSON.stringify(receipts,null,2)+'\n');
console.log(JSON.stringify(receipts,null,2));
