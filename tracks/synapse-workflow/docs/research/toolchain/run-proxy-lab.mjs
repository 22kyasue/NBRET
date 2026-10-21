import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),home=path.resolve('docs/research/toolchain');
const py=path.resolve('.tools/toolchain/venv/Scripts/python.exe');
const script=path.join(home,'proxy-offline-lab.py');
const args=[script];
const startedAt=new Date().toISOString();
let result;
try{const r=await exec(py,args,{windowsHide:true,timeout:120000,maxBuffer:4*1024*1024,env:{...process.env,PYTEST_DISABLE_PLUGIN_AUTOLOAD:'1'}});result={code:0,...r};}
catch(e){result={code:e.code,killed:e.killed,stdout:e.stdout||'',stderr:e.stderr||'',error:e.message};}
await fs.writeFile(path.resolve('.tools/toolchain/proxy-offline-output.txt'),result.stdout+'\nSTDERR\n'+result.stderr);
const versions=(await exec(py,['-m','pip','freeze','--all'],{windowsHide:true})).stdout;
await fs.writeFile(path.join(home,'proxy-lab-packages.txt'),versions);
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json')));
const receipt={startedAt,finishedAt:new Date().toISOString(),source:pins.find(p=>p.name==='mitmproxy'),python:(await exec(py,['--version'],{windowsHide:true})).stdout.trim(),executable:py,args,environment:{PYTEST_DISABLE_PLUGIN_AUTOLOAD:'1'},scriptSha256:createHash('sha256').update(await fs.readFile(script)).digest('hex'),...result,limitations:['Sans-I/O commands and fabricated connection replies; no real upstream sockets or TLS handshake','Python socket connect/connect_ex/create_connection/getaddrinfo guarded; native socket paths are not globally sandboxed','Upstream test/conftest.py briefly binds and closes ::1 ephemeral port to check IPv6 support; no listening service','No CA, driver, proxy, VPN, route or DNS configuration changed','No finding about real targets or absence of vulnerabilities'],cleanup:'Subprocess exited; source and venv retained in ignored .tools/toolchain; no running proxy was started'};
await fs.writeFile(path.join(home,'proxy-lab-receipt.json'),JSON.stringify(receipt,null,2));
console.log(JSON.stringify({code:result.code,summary:result.stdout.slice(-2500),stderr:result.stderr.slice(-1000)},null,2));
