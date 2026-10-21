import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),base=path.resolve('docs/research/toolchain');
const receiptPath=path.join(base,'traversal-lab-receipt.json');
try {await fs.access(receiptPath);throw Error('Receipt exists; preserve it before any new run.');}catch(e){if(e.code!=='ENOENT')throw e;}
const cwd=path.resolve('.tools/toolchain/BloodHound'),go=path.resolve('.tools/security-research-go/sdk/go/bin/go.exe');
const overrides={GOTOOLCHAIN:'local',GOWORK:'off',GOFLAGS:'-mod=readonly',GOPROXY:'off',GOSUMDB:'off',GOMAXPROCS:'2',GOPATH:path.resolve('.tools/toolchain/go/path'),GOCACHE:path.resolve('.tools/toolchain/go/cache'),GOMODCACHE:path.resolve('.tools/toolchain/go/modules')};
const env={...process.env,...overrides};
const names=['TestAcyclicSegmentVisitor','TestUniquePathSegmentVisitor','TestFilteredSkipLimit','TestNewNodeCollector','TestNodeCollectorAdd','TestNodeCollectorCollect','TestNewPathCollector','TestNodeCollectorPopulatePropertiesError','TestPathCollectorAdd'];
const args=['test','-p=2','-count=1','-timeout=30s','-json','github.com/specterops/dawgs/traversal','-run','^('+names.join('|')+')$'];
const hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
const startedAt=new Date().toISOString();let result;
try{result={code:0,...await exec(go,args,{cwd,env,windowsHide:true,timeout:120000,maxBuffer:4*1024*1024})};}catch(e){result={code:e.code,killed:e.killed,error:e.message,stdout:e.stdout||'',stderr:e.stderr||''};}
const events=result.stdout.split(/\r?\n/).filter(x=>x.startsWith('{')).map(x=>JSON.parse(x));
const passed=events.filter(x=>x.Action==='pass'&&x.Test).map(x=>x.Test);
const receipt={startedAt,finishedAt:new Date().toISOString(),go:(await exec(go,['version'],{windowsHide:true,env})).stdout.trim(),cwd,args,environmentOverrides:overrides,moduleSha256:await hash(path.join(cwd,'go.mod')),sumSha256:await hash(path.join(cwd,'go.sum')),sourcePin:'d0640cfb421e2b9f4fc249de733c3d6e52f1a57f',sourceModule:'github.com/specterops/dawgs@v0.9.2',expectedTests:names,passed,oraclePassed:result.code===0&&names.every(x=>passed.includes(x))&&!events.some(x=>x.Action==='fail'),...result,cleanup:'Bounded subprocess exited; no service/listener/database created; isolated caches retained.',limitations:['In-memory selected upstream fixtures only','Does not validate BFS workers, DB drivers or real-world graph completeness','GOPROXY/GOSUMDB disabled for acquisition, not an OS-level network sandbox']};
await fs.writeFile(receiptPath,JSON.stringify(receipt,null,2),{flag:'wx'});
console.log(JSON.stringify({code:receipt.code,oraclePassed:receipt.oraclePassed,passed,stderr:receipt.stderr.slice(-2000)},null,2));
