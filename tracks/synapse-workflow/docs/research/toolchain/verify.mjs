import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const home=path.resolve('docs/research/toolchain');
const pins=JSON.parse(await fs.readFile(path.join(home,'snapshots.json'))),q=JSON.parse(await fs.readFile(path.join(home,'queue.json')));
const errors=[];
let readLines=0;
for(const e of q){
 const pin=pins.find(p=>p.name===e.repo);if(!pin){errors.push('Missing pin '+e.repo);continue;}
 const b=await fs.readFile(path.join(pin.root,e.path));
 const sha=createHash('sha256').update(b).digest('hex');
 if(sha!==e.sha256||e.commit!==pin.commit||e.lines!==b.toString('utf8').split('\n').length)errors.push('Changed source '+e.repo+'/'+e.path);
 let last=0;for(const [a,z]of e.readRanges){if(a<1||z<a||z>e.lines||a<=last)errors.push('Invalid reading interval '+e.path);last=z;readLines+=z-a+1;}
 const expected=e.readRanges.length===0?'unread':e.readRanges.length===1&&e.readRanges[0][0]===1&&e.readRanges[0][1]===e.lines?'complete':'partial';
 if(e.status!==expected)errors.push('Incorrect credit '+e.path);
}
for(const name of (await fs.readdir(home)).filter(n=>n.endsWith('.md'))){
 const content=await fs.readFile(path.join(home,name),'utf8');
 for(const m of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  const target=m[1];if(/^(https?:|#)/.test(target))continue;
  try{await fs.access(path.resolve(home,target.split('#')[0]));}catch{errors.push('Broken link '+name+' -> '+target);}
 }
}
const summary=pins.map(p=>({repo:p.name,commit:p.commit,...Object.fromEntries(['unread','partial','complete'].map(s=>[s,q.filter(e=>e.repo===p.name&&e.status===s).length]))}));
const supplemental=JSON.parse(await fs.readFile(path.join(home,'supplemental-material-queue.json')));
let supplementalReadLines=0,supplementalComplete=0,supplementalPartial=0;
for(const e of supplemental.material.filter(e=>e.readRanges?.length)){
 const pin=pins.find(p=>p.name===e.repo);
 const b=await fs.readFile(path.join(pin.root,e.path));
 if(createHash('sha256').update(b).digest('hex')!==e.sha256||e.commit!==pin.commit||e.lines!==b.toString('utf8').split('\n').length)errors.push('Changed supplemental source '+e.repo+'/'+e.path);
 let last=0;for(const [a,z]of e.readRanges){if(a<1||z<a||z>e.lines||a<=last)errors.push('Invalid supplemental interval '+e.path);last=z;supplementalReadLines+=z-a+1;}
 const expected=e.readRanges.length===1&&e.readRanges[0][0]===1&&e.readRanges[0][1]===e.lines?'complete':'partial';
 if(e.status!==expected)errors.push('Incorrect supplemental credit '+e.path);
 if(expected==='complete')supplementalComplete++;else supplementalPartial++;
}
for(const name of await fs.readdir(home)){
 try{
  if(name.endsWith('.mjs'))await exec(process.execPath,['--check',path.join(home,name)],{windowsHide:true});
  if(name.endsWith('.py'))await exec(path.resolve('.tools/toolchain/venv/Scripts/python.exe'),['-c','import pathlib,sys; compile(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"),sys.argv[1],"exec")',path.join(home,name)],{windowsHide:true});
 }catch(e){errors.push('Script syntax '+name+': '+e.message);}
}
const dependencies=JSON.parse(await fs.readFile(path.join(home,'proxy-dependency-queue.json')));
let dependencyReadLines=0,dependencyComplete=0,dependencyPartial=0;
for(const e of dependencies.entries){
 const b=await fs.readFile(path.join(dependencies.root,e.path));
 if(createHash('sha256').update(b).digest('hex')!==e.sha256)errors.push('Changed installed dependency '+e.path);
 if(e.lines!==null&&e.lines!==b.toString('utf8').split('\n').length)errors.push('Changed dependency lines '+e.path);
 let last=0;for(const [a,z]of e.readRanges){if(a<1||z<a||z>e.lines||a<=last)errors.push('Invalid dependency interval '+e.path);last=z;dependencyReadLines+=z-a+1;}
 const expected=e.readRanges.length===0?'unread':e.readRanges.length===1&&e.readRanges[0][0]===1&&e.readRanges[0][1]===e.lines?'complete':'partial';
 if(e.status!==expected)errors.push('Incorrect dependency credit '+e.path);
 if(expected==='complete')dependencyComplete++;if(expected==='partial')dependencyPartial++;
}
const receipt={checkedAt:new Date().toISOString(),checks:['Original queue and range-credited supplemental bytes match SHA-256/commit/line counts','Read ranges bounded and statuses derived correctly','Local Markdown links resolve','Owned JavaScript/Python scripts parse without executing their actions'],files:q.length,recordedReadLines:readLines,summary,supplemental:{inventoried:supplemental.material.length,complete:supplementalComplete,partial:supplementalPartial,recordedReadLines:supplementalReadLines},dependencies:{inventoried:dependencies.entries.length,complete:dependencyComplete,partial:dependencyPartial,recordedReadLines:dependencyReadLines},errors,limitations:['Verifies ledger/artifact consistency, not whether annotations are semantically correct or tools are safe','Uncredited supplemental material is not rehashed by this verification; inventory receipt and unread work remain separate','Raw catalog licenses not in source queue are described separately; download is not reading']};
await fs.writeFile(path.join(home,'verification.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));if(errors.length)process.exitCode=1;
