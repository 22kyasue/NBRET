import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const projects=['mitmproxy/mitmproxy','nmap/nmap','SpecterOps/SharpHound','SpecterOps/BloodHound','PortSwigger/burp-extensions-montoya-api-examples','fortra/impacket','prowler-cloud/prowler','rapid7/metasploit-framework','AFLplusplus/AFLplusplus','aquasecurity/trivy','MobSF/Mobile-Security-Framework-MobSF','frida/frida','DefectDojo/django-DefectDojo'];
const home=path.resolve('docs/research/toolchain'),archive=path.resolve('.tools/toolchain/catalog');
try{await fs.access(path.join(home,'catalog.json'));throw Error('Catalog already exists; use a new dated catalog/archive instead of overwriting provenance');}catch(e){if(e.code!=='ENOENT')throw e;}
await fs.mkdir(archive,{recursive:true});
const rows=[];
for(const project of projects){
 const row={project,retrievedAt:new Date().toISOString(),evidence:'GitHub maintainer metadata; not source implementation review or complete license analysis'};
 for(const [kind,suffix]of [['repository',''],['latestRelease','/releases/latest']]){
  const url='https://api.github.com/repos/'+project+suffix;
  try{const response=await fetch(url,{headers:{'User-Agent':'NBRET-public-source-research','Accept':'application/vnd.github+json'}});const bytes=Buffer.from(await response.arrayBuffer());const filename=project.replace('/','--')+'--'+kind+'.json';await fs.writeFile(path.join(archive,filename),bytes);
   const receipt={url,status:response.status,sha256:createHash('sha256').update(bytes).digest('hex'),archive:path.join(archive,filename)};
   if(response.ok){const data=JSON.parse(bytes);row[kind]=kind==='repository'?{...receipt,htmlUrl:data.html_url,defaultBranch:data.default_branch,license:data.license,archived:data.archived,pushedAt:data.pushed_at}:{...receipt,tag:data.tag_name,publishedAt:data.published_at,htmlUrl:data.html_url,prerelease:data.prerelease,draft:data.draft};}
   else row[kind]=receipt;
  }catch(e){row[kind]={url,error:String(e)};}
 }
 rows.push(row);
}
await fs.writeFile(path.join(home,'catalog.json'),JSON.stringify(rows,null,2));
console.log(rows.map(r=>({project:r.project,license:r.repository.license?.spdx_id,release:r.latestRelease.tag,status:r.latestRelease.status})));
