import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const exe='C:/Users/kotar/.codex/research/assessment-evidence-venv/Scripts/python.exe';
const args=['-m','pip','install','mcp>=1.23.0','sniffio>=1.0.0'];
const r=spawnSync(exe,args,{windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:4000000});
const freeze=spawnSync(exe,['-m','pip','freeze'],{windowsHide:true,encoding:'utf8'});
fs.writeFileSync('docs/research/assessment-evidence/claude-source-dependencies.json',JSON.stringify({at:new Date().toISOString(),command:[exe,...args],exitCode:r.status,stdout:r.stdout,stderr:r.stderr,freeze:freeze.stdout,scope:'existing isolated research venv; Python dependencies for source imports only; no SDK wheel, CLI, server or provider'},null,2)+'\n');
console.log(JSON.stringify({exitCode:r.status,stdout:r.stdout,stderr:r.stderr}));
