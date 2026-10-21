import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const python=path.resolve('.tools/toolchain/venv/Scripts/python.exe'),fixture=path.resolve('docs/research/toolchain/har-roundtrip-lab.py'),receipt=path.resolve('docs/research/toolchain/har-roundtrip-process.json');
try{await fs.access(receipt);throw Error('Preserve existing receipt before rerun');}catch(e){if(e.code!=='ENOENT')throw e;}
const startedAt=new Date().toISOString(),args=[fixture];let result;
try{result={code:0,...await promisify(execFile)(python,args,{windowsHide:true,timeout:20000,maxBuffer:1024*1024})};}catch(e){result={code:e.code,error:e.message,killed:e.killed,stdout:e.stdout||'',stderr:e.stderr||''};}
const hash=b=>createHash('sha256').update(b).digest('hex');
await fs.writeFile(receipt,JSON.stringify({startedAt,finishedAt:new Date().toISOString(),python,args,fixtureSha256:hash(await fs.readFile(fixture)),stdoutSha256:hash(result.stdout),stderrSha256:hash(result.stderr),...result},null,2),{flag:'wx'});
console.log(JSON.stringify(result));
