import { EventEmitter } from 'node:events';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { startCapture } from '../src/capture.mjs';
const out=resolve(`runs/capture-finalization-research-${Date.now()}`);await mkdir(out);
class FakeCDP extends EventEmitter {
 calls=[];detaches=0;
 async send(method){this.calls.push(method);return {};}
 async detach(){this.detaches++;throw new Error('SYNTHETIC_DETACH_FAILURE');}
}
const cdp=new FakeCDP(),page={context:()=>({newCDPSession:async()=>cdp})};
const started=performance.now();
const recorder=await startCapture(page,{outDir:out,origins:['https://fixture.invalid']});
let firstError;try{await recorder.finish();}catch(e){firstError=e.message;}
assert.equal(firstError,'SYNTHETIC_DETACH_FAILURE');
const second=await recorder.finish();
let fileExists=true;try{await access(join(out,'evidence.json'));}catch{fileExists=false;}
assert.equal(fileExists,false);assert.equal(cdp.detaches,1);assert.equal(second.finishedAt,undefined);
const receipt={at:new Date().toISOString(),scope:'Synthetic CDP stub; production startCapture lifecycle only; no browser or network',out,firstError,secondResolved:true,fileExists,detachAttempts:cdp.detaches,finishedAtPresent:!!second.finishedAt,calls:cdp.calls,elapsedMs:performance.now()-started,sourceSha256:createHash('sha256').update(await readFile('src/capture.mjs')).digest('hex')};
await writeFile(join(out,'receipt.json'),JSON.stringify(receipt,null,2));await writeFile('docs/research/security-landscape/deep-review/capture-finalization-lab-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
