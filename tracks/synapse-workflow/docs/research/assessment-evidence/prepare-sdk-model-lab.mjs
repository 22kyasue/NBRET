import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const exe='C:/Users/kotar/.codex/research/assessment-evidence-venv/Scripts/python.exe';
const args=['-m','pip','install','pydantic>=2.12'];
const r=spawnSync(exe,args,{windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:4000000});
const freeze=spawnSync(exe,['-m','pip','freeze'],{windowsHide:true,encoding:'utf8'});
fs.writeFileSync('docs/research/assessment-evidence/sdk-model-dependencies.json',JSON.stringify({at:new Date().toISOString(),command:[exe,...args],exitCode:r.status,stdout:r.stdout,stderr:r.stderr,freeze:freeze.stdout,scope:'existing isolated research venv; model dependency only, no SDK/CLI installation or invocation'},null,2)+'\n');
console.log(JSON.stringify({exitCode:r.status,stdout:r.stdout,stderr:r.stderr}));
