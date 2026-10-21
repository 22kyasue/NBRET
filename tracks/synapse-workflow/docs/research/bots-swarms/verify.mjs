import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const home=path.resolve('docs/research/bots-swarms'),pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json'))),sha=b=>createHash('sha256').update(b).digest('hex');
const selected=q.filter(e=>e.status!=='unread'),mismatches=[];
for(const e of selected){const p=pins.find(p=>p.name===e.repo);if(sha(await fs.readFile(path.join(p.root,e.path)))!==e.sha256)mismatches.push({repo:e.repo,file:e.path});}
const scripts=[];
const files=await fs.readdir(home),pythonScripts=[],jsonFiles=[];
for(const file of files){
 const p=path.join(home,file);
 if(file.endsWith('.json')){JSON.parse(await fs.readFile(p,'utf8'));jsonFiles.push(file);}
 if(file.endsWith('.mjs')){execFileSync(process.execPath,['--check',p],{windowsHide:true,stdio:'pipe'});scripts.push({file,sha256:sha(await fs.readFile(p))});}
 if(file.endsWith('.py')){execFileSync('C:/Python314/python.exe',['-I','-S','-c','import pathlib,sys; p=pathlib.Path(sys.argv[1]); compile(p.read_text(encoding="utf-8"),str(p),"exec")',p],{windowsHide:true,stdio:'pipe'});pythonScripts.push({file,sha256:sha(await fs.readFile(p))});}
}
const supplementary=[];
let supportingSelected=0;
if(files.includes('supporting-queue.json')){
 const supporting=JSON.parse(await fs.readFile(path.join(home,'supporting-queue.json'))).entries.filter(e=>e.status!=='unread');
 supportingSelected=supporting.length;
 for(const e of supporting){const pin=pins.find(p=>p.name===e.repo);if(sha(await fs.readFile(path.join(pin.root,e.path)))!==e.sha256)mismatches.push({supportingRepo:e.repo,file:e.path});}
}
if(files.includes('cookie-policy-source.json')){
 const e=JSON.parse(await fs.readFile(path.join(home,'cookie-policy-source.json')));
 for(const file of [e.localFile,e.source]){const actual=sha(await fs.readFile(file));supplementary.push({file,sha256:actual});if(actual!==e.sha256)mismatches.push({dependency:file});}
}
if(files.includes('incident-sources.json')){
 for(const e of JSON.parse(await fs.readFile(path.join(home,'incident-sources.json')))){const actual=sha(await fs.readFile(e.localFile));supplementary.push({file:e.localFile,status:e.status,sha256:actual,note:'Failed403 fetch integrity only; not article content'});if(actual!==e.sha256)mismatches.push({incidentFetch:e.id});}
}
const receipt={at:new Date().toISOString(),runtime:process.version,command:'node docs/research/bots-swarms/verify.mjs',selectedFiles:selected.length,supportingSelected,mismatches,scripts,pythonScripts,jsonFilesChecked:jsonFiles.length,supplementary,limits:'Integrity and syntax checks only; no reading credit or runtime correctness inferred. Python compilation does not execute the lab or write bytecode.'};
await fs.writeFile(path.join(home,`integrity-receipt-${Date.now()}.json`),JSON.stringify(receipt,null,2),{flag:'wx'});console.log({selectedFiles:selected.length,mismatches,scriptsChecked:scripts.length,pythonScriptsChecked:pythonScripts.length,jsonFilesChecked:jsonFiles.length,supplementaryFiles:supplementary.length});if(mismatches.length)process.exitCode=1;
