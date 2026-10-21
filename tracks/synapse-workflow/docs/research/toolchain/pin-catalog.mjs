import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const file=path.resolve('docs/research/toolchain/catalog.json');
const rows=JSON.parse(await fs.readFile(file));
if(rows.some(r=>r.catalogPin))throw Error('Catalog already pinned; preserve original resolution history');
const archive=path.resolve('.tools/toolchain/catalog');
for(const row of rows){
 const ref=row.latestRelease.tag||row.repository.defaultBranch;
 const url='https://api.github.com/repos/'+row.project+'/commits/'+encodeURIComponent(ref);
 const response=await fetch(url,{headers:{'User-Agent':'NBRET-public-source-research','Accept':'application/vnd.github+json'}});
 const bytes=Buffer.from(await response.arrayBuffer());
 const filename=row.project.replace('/','--')+'--pin.json';
 await fs.writeFile(path.join(archive,filename),bytes);
 const json=JSON.parse(bytes);
 row.catalogPin={url,status:response.status,ref,commit:json.sha,retrievedAt:new Date().toISOString(),sha256:createHash('sha256').update(bytes).digest('hex'),archive:path.join(archive,filename),basis:row.latestRelease.tag?'Latest non-prerelease release endpoint tag resolved to commit':'No GitHub latest-release object; default branch snapshot, not a release claim'};
 if(json.sha){
  for(const name of ['LICENSE','COPYING']){
   const licenseUrl='https://raw.githubusercontent.com/'+row.project+'/'+json.sha+'/'+name;
   const lr=await fetch(licenseUrl);if(!lr.ok)continue;
   const b=Buffer.from(await lr.arrayBuffer()),lf=row.project.replace('/','--')+'--'+name+'.txt';await fs.writeFile(path.join(archive,lf),b);
   row.licenseArtifact={url:licenseUrl,sha256:createHash('sha256').update(b).digest('hex'),archive:path.join(archive,lf),status:'downloaded, unread unless separately annotated'};break;
  }
 }
}
await fs.writeFile(file,JSON.stringify(rows,null,2));
console.log(rows.map(r=>({project:r.project,pin:r.catalogPin.commit,license:r.licenseArtifact?.archive})));
