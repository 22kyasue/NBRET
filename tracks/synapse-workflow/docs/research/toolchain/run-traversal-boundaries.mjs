import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),base=path.resolve('docs/research/toolchain'),out=path.join(base,'traversal-boundaries-receipt-v2.json');
try{await fs.access(out);throw Error('Preserve existing receipt before any rerun.');}catch(e){if(e.code!=='ENOENT')throw e;}
const cwd=path.resolve('.tools/toolchain/BloodHound'),go=path.resolve('.tools/security-research-go/sdk/go/bin/go.exe'),fixture=path.join(base,'traversal_boundaries_test.go');
const overrides={GOTOOLCHAIN:'local',GOWORK:'off',GOFLAGS:'-mod=readonly',GOPROXY:'off',GOSUMDB:'off',GOMAXPROCS:'2',GOPATH:path.resolve('.tools/toolchain/go/path'),GOCACHE:path.resolve('.tools/toolchain/go/cache'),GOMODCACHE:path.resolve('.tools/toolchain/go/modules')},env={...process.env,...overrides};
const args=['test','-p=2','-count=1','-timeout=15s','-json',fixture,'-run','^TestSyntheticTraversalBoundaries$'];
const hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
const startedAt=new Date().toISOString();let result;
try{result={code:0,...await exec(go,args,{cwd,env,windowsHide:true,timeout:60000,maxBuffer:4*1024*1024})};}catch(e){result={code:e.code,killed:e.killed,error:e.message,stdout:e.stdout||'',stderr:e.stderr||''};}
const events=result.stdout.split(/\r?\n/).filter(x=>x.startsWith('{')).map(x=>JSON.parse(x)),passed=events.filter(x=>x.Action==='pass'&&x.Test).map(x=>x.Test);
const expected=['finite_chain','sentinel_error','cancelled_partial','memory_limit'];
const receipt={startedAt,finishedAt:new Date().toISOString(),go:(await exec(go,['version'],{env,windowsHide:true})).stdout.trim(),cwd,args,environmentOverrides:overrides,fixtureSha256:await hash(fixture),goModSha256:await hash(path.join(cwd,'go.mod')),goSumSha256:await hash(path.join(cwd,'go.sum')),sourcePin:'d0640cfb421e2b9f4fc249de733c3d6e52f1a57f',passed,oraclePassed:result.code===0&&expected.every(x=>passed.includes('TestSyntheticTraversalBoundaries/'+x))&&!events.some(x=>x.Action==='fail'),...result,cleanup:'Mock-only subprocess exited; no listener, DB, directory or global configuration created.',limitations:['Synthetic engine seams, not real graph query/driver execution','Cancellation may be separately handled by callers','No process-wide memory or all error-path guarantee']};
await fs.writeFile(out,JSON.stringify(receipt,null,2),{flag:'wx'});
console.log(JSON.stringify({code:receipt.code,oraclePassed:receipt.oraclePassed,passed,stderr:receipt.stderr.slice(-2000)},null,2));
