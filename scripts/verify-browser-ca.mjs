import { parseArgs } from 'node:util';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { X509Certificate } from 'node:crypto';
import { createServer } from 'node:https';
import assert from 'node:assert/strict';
import { runCapture } from '../src/run.mjs';

const {values}=parseArgs({options:{ca:{type:'string'},'temporary-user-trust':{type:'boolean'}}});
if(process.platform!=='win32'||!values.ca||!values['temporary-user-trust'])throw new Error('Explicit Windows temporary-user-trust authorization and --ca FILE required');
const exec=promisify(execFile),certPath=resolve(values.ca),ca=new X509Certificate(await readFile(certPath));
assert.ok(ca.ca);assert.equal(ca.verify(ca.publicKey),true);
const thumbprint=ca.fingerprint.replaceAll(':','');
if(!/^[A-F0-9]{40}$/.test(thumbprint))throw new Error('Invalid CA thumbprint');
const query=async()=>{const r=await exec('powershell.exe',['-NoProfile','-NonInteractive','-Command',`[bool](Test-Path -LiteralPath 'Cert:/CurrentUser/Root/${thumbprint}')`],{windowsHide:true});return r.stdout.trim()==='True';};
const existed=await query(),root=resolve(`runs/browser-ca-${Date.now()}`);await mkdir(root);
await exec('C:/Program Files/Git/usr/bin/openssl.exe',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',join(root,'key.pem'),'-out',join(root,'cert.pem'),'-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost','-days','1'],{windowsHide:true});
const server=createServer({key:await readFile(join(root,'key.pem')),cert:await readFile(join(root,'cert.pem'))},(req,res)=>{
  if(req.url==='/result'){res.setHeader('Content-Type','application/json');res.end('{"result":25}');return;}
  res.setHeader('Content-Type','text/html');res.end('<button onclick="fetch(\'/result\').then(r=>r.json()).then(x=>document.querySelector(\'output\').textContent=x.result)">Read</button><output></output>');
});
let added=false,receipt={root,caFingerprint:ca.fingerprint256,existed,scope:'Windows Current User Root only; shared account trust temporarily changes. No Local Machine store.'};
try{
  if(!existed){added=true;await exec('certutil.exe',['-user','-addstore','Root',certPath],{windowsHide:true});assert.equal(await query(),true);}
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const summary=await runCapture({url:`https://localhost:${server.address().port}/`,outDir:join(root,'capture'),proxy:'http://127.0.0.1:8080',rea:false,copy:false,retainProfile:false,actions:[{type:'click',selector:'button'}],expectations:[{selector:'output',text:'25'}],scenarioId:'browser-ca-trusted'});
  assert.equal(summary.connection.ignoreHTTPSErrors,false);assert.equal(summary.errors.length,0,JSON.stringify(summary.errors));
  receipt={...receipt,verified:true,normalBrowserTls:true,result:25};
}finally{
  server.closeAllConnections();if(server.listening)await new Promise(r=>server.close(r));
  try{if(added && await query()){await exec('certutil.exe',['-user','-delstore','Root',thumbprint],{windowsHide:true});assert.equal(await query(),false);}receipt.trustRestored=true;}
  finally{await writeFile(join(root,'receipt.json'),JSON.stringify(receipt,null,2));}
}
console.log(JSON.stringify(receipt,null,2));
