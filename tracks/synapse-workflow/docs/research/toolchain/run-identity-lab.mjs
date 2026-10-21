import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),home=path.resolve('docs/research/toolchain'),root=path.resolve('.tools/toolchain/BloodHound');
const go=path.resolve('.tools/security-research-go/sdk/go/bin/go.exe');
const vars={GOTOOLCHAIN:'local',GOWORK:'off',GOFLAGS:'-mod=readonly',GOMAXPROCS:'2',GOPATH:path.resolve('.tools/toolchain/go/path'),GOCACHE:path.resolve('.tools/toolchain/go/cache'),GOMODCACHE:path.resolve('.tools/toolchain/go/modules')};
for(const name of ['GOPATH','GOCACHE','GOMODCACHE'])await fs.mkdir(vars[name],{recursive:true});
const env={...process.env,...vars};
const args=['test','-p=2','-count=1','-timeout=30s','-json','./cmd/api/src/services/graphify','-run','^(TestNormalizeEinNodeProperties|TestMaybeSubmitNodeUpdate|TestMaybeSubmitRelationshipUpdate)$'];
const startedAt=new Date().toISOString();
let result;
try{result={code:0,...await exec(go,args,{cwd:root,env,windowsHide:true,timeout:240000,maxBuffer:4*1024*1024})};}catch(e){result={code:e.code,killed:e.killed,error:e.message,stdout:e.stdout||'',stderr:e.stderr||''};}
await fs.writeFile(path.resolve('.tools/toolchain/identity-output.txt'),result.stdout+'\nSTDERR\n'+result.stderr);
const h=async f=>createHash('sha256').update(await fs.readFile(path.join(root,f))).digest('hex');
const receipt={startedAt,finishedAt:new Date().toISOString(),go:(await exec(go,['version'],{env,windowsHide:true})).stdout.trim(),executable:go,cwd:root,args,environmentOverrides:vars,commit:JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))).find(p=>p.name==='BloodHound').commit,goModSha256:await h('go.mod'),goSumSha256:await h('go.sum'),...result,limitations:['Selected mocked unit tests only; no real directory/graph/database/HTTP endpoint assessed','No integration build tags enabled; dependency acquisition may use public package hosts','No domain credentials supplied or collector started'],cleanup:'Test subprocess exited or was terminated by timeout; SDK and isolated caches retained; no service started by this runner'};
await fs.writeFile(path.join(home,'identity-lab-receipt.json'),JSON.stringify(receipt,null,2));
console.log(JSON.stringify({code:result.code,killed:result.killed,stdout:result.stdout.slice(-3000),stderr:result.stderr.slice(-2000)},null,2));
