import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

// Explicit setup command; capture and verification never install dependencies implicitly.
const root=resolve('runs/tooling');await mkdir(root,{recursive:true});
const response=await fetch('https://api.github.com/repos/zaproxy/zaproxy/releases/tags/v2.17.0',{headers:{'User-Agent':'NBRET-local-tooling'}});
if(!response.ok)throw new Error('Official ZAP release lookup failed');
const release=await response.json(),asset=release.assets.find(x=>x.name==='ZAP_2.17.0_Crossplatform.zip');
if(!asset?.digest?.startsWith('sha256:'))throw new Error('Published ZAP SHA256 digest is required');
const file=join(root,asset.name);
try{await access(file);}catch{const download=await fetch(asset.browser_download_url);if(!download.ok)throw new Error('ZAP download failed');await writeFile(file,Buffer.from(await download.arrayBuffer()),{flag:'wx'});}
const sha256=createHash('sha256').update(await readFile(file)).digest('hex');
if(asset.digest!==`sha256:${sha256}`)throw new Error('ZAP package integrity mismatch');
await writeFile(join(root,'zap-download.json'),JSON.stringify({version:release.tag_name,url:asset.browser_download_url,sha256,publishedDigest:asset.digest},null,2));
const python=process.env.NBRET_PYTHON || 'C:/Users/kotar/AppData/Local/Programs/Python/Python312/python.exe';
const venv=join(root,'mitm-venv'),exec=promisify(execFile);
try{await access(join(venv,'Scripts/python.exe'));}catch{await exec(python,['-m','venv',venv],{windowsHide:true});}
await exec(join(venv,'Scripts/python.exe'),['-m','pip','install','mitmproxy==12.2.3'],{windowsHide:true,timeout:240000});
const freeze=await exec(join(venv,'Scripts/python.exe'),['-m','pip','freeze'],{windowsHide:true});
await writeFile(join(root,'mitm-requirements.txt'),freeze.stdout);
console.log(JSON.stringify({root,zap:release.tag_name,sha256,mitmproxy:'12.2.3',scope:'Portable/venv local setup; no PATH or trust-store changes.'},null,2));
