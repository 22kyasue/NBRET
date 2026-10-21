import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const home=path.resolve('docs/research/toolchain');
try{await fs.access(path.join(home,'snapshots.json'));throw Error('Snapshots already exist; preserve original pins/history');}catch(e){if(e.code!=='ENOENT')throw e;}
const root=path.resolve('.tools/toolchain');
await fs.mkdir(root,{recursive:true});
const repos=[['mitmproxy','https://github.com/mitmproxy/mitmproxy.git'],['nmap','https://github.com/nmap/nmap.git'],['SharpHound','https://github.com/SpecterOps/SharpHound.git'],['BloodHound','https://github.com/SpecterOps/BloodHound.git'],['burp-examples','https://github.com/PortSwigger/burp-extensions-montoya-api-examples.git']];
const run=async(cwd,args)=>(await exec('git',args,{cwd,windowsHide:true,maxBuffer:8*1024*1024})).stdout.trim();
const results=await Promise.allSettled(repos.map(async([name,url])=>{
 const dir=path.join(root,name);try{await fs.access(path.join(dir,'.git'));}catch{await run(root,['clone','--depth','1',url,dir]);}
 return {name,url,root:dir,commit:await run(dir,['rev-parse','HEAD']),commitDate:await run(dir,['log','-1','--format=%cI']),dirty:await run(dir,['status','--short']),retrievedAt:new Date().toISOString(),basis:'Shallow upstream default-branch snapshot; not a release or a claim of latest installed software'};
}));
await fs.writeFile(path.join(home,'snapshots.json'),JSON.stringify(results.map((r,i)=>r.status==='fulfilled'?r.value:{name:repos[i][0],error:String(r.reason)}),null,2));
console.log(results.map((r,i)=>({name:repos[i][0],status:r.status,...(r.status==='fulfilled'?{commit:r.value.commit}:{error:String(r.reason)})})));
