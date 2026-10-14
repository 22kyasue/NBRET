import { createServer } from 'node:https';
import http from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { X509Certificate } from 'node:crypto';
import assert from 'node:assert/strict';
import { localProxyGet } from '../src/proxy-client.mjs';

const root = resolve(`runs/proxy-ca-${Date.now()}`); await mkdir(root);
const proxy = 'http://127.0.0.1:8080';
const certBytes = await new Promise((resolve, reject) => {
  const request=http.get({hostname:'127.0.0.1',port:8080,path:'http://burp/cert',timeout:10000},response=>{
    const chunks=[];let size=0;response.on('data',c=>{size+=c.length;if(size>1048576)request.destroy(new Error('CA size limit'));else chunks.push(c);});
    response.on('end',()=>response.statusCode===200?resolve(Buffer.concat(chunks)):reject(new Error('CA download failed')));
  });request.on('error',reject);request.on('timeout',()=>request.destroy(new Error('CA download timed out')));
});
const ca = new X509Certificate(certBytes); assert.ok(ca.ca,'Proxy certificate must be a CA');
await writeFile(join(root,'proxy-ca.pem'),ca.toString());
await promisify(execFile)('C:/Program Files/Git/usr/bin/openssl.exe',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',join(root,'key.pem'),'-out',join(root,'cert.pem'),'-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1','-days','1'],{windowsHide:true});
const server=createServer({key:await readFile(join(root,'key.pem')),cert:await readFile(join(root,'cert.pem'))},(request,response)=>{response.setHeader('Content-Type','application/json');response.end('{"result":25}');});
try {
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const url=`https://localhost:${server.address().port}/ca-result`;
  let defaultRejected=false;try{await localProxyGet({proxy,url});}catch{defaultRejected=true;}
  const verified=await localProxyGet({proxy,url,ca:ca.toString()});
  assert.equal(verified.authorized,true);assert.equal(verified.status,200);assert.deepEqual(JSON.parse(verified.body),{result:25});
  const receipt={root,url,proxy,defaultRejected,scopedCaVerified:true,caFingerprint:ca.fingerprint256,peerFingerprint:verified.peerFingerprint,result:25,scope:'Strict Node diagnostic TLS client only. Chromium trust is not modified or verified by this check. No system/user trust-store changes or UAC.'};
  await writeFile(join(root,'receipt.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));
} finally {server.closeAllConnections();await new Promise(r=>server.close(r));}
