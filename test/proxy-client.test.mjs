import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer as httpsServer } from 'node:https';
import { createServer as httpServer } from 'node:http';
import { connect } from 'node:net';
import { mkdtemp,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { localProxyGet } from '../src/proxy-client.mjs';

test('scoped CA diagnostics verify chain and hostname while rejecting missing trust',async()=>{
  const root=await mkdtemp(join(tmpdir(),'nbret-ca-')),sockets=new Set();
  let secure,proxy;
  try{
    await promisify(execFile)('C:/Program Files/Git/usr/bin/openssl.exe',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',join(root,'key.pem'),'-out',join(root,'cert.pem'),'-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1','-days','1'],{windowsHide:true});
    const cert=await readFile(join(root,'cert.pem'));
    secure=httpsServer({key:await readFile(join(root,'key.pem')),cert},(_,r)=>r.end('{"result":25}'));
    await new Promise(r=>secure.listen(0,'127.0.0.1',r));
    proxy=httpServer();
    proxy.on('connect',(req,client)=>{const upstream=connect(secure.address().port,'127.0.0.1',()=>{client.write('HTTP/1.1 200 OK\r\n\r\n');client.pipe(upstream);upstream.pipe(client);});
      for(const socket of [client,upstream]){sockets.add(socket);socket.on('error',()=>{});socket.on('close',()=>sockets.delete(socket));}
      client.on('close',()=>upstream.destroy());upstream.on('close',()=>client.destroy());});
    await new Promise(r=>proxy.listen(0,'127.0.0.1',r));
    const endpoint=`http://127.0.0.1:${proxy.address().port}`,url=`https://127.0.0.1:${secure.address().port}/`;
    await assert.rejects(localProxyGet({proxy:endpoint,url}));
    const result=await localProxyGet({proxy:endpoint,url,ca:cert});assert.equal(result.authorized,true);assert.deepEqual(JSON.parse(result.body),{result:25});
    await assert.rejects(localProxyGet({proxy:endpoint,url:url.replace('127.0.0.1','localhost'),ca:cert}),e=>e.code==='ERR_TLS_CERT_ALTNAME_INVALID');
  }finally{for(const socket of sockets)socket.destroy();for(const server of [secure,proxy])if(server?.listening){server.closeAllConnections?.();await new Promise(r=>server.close(r));}await rm(root,{recursive:true,force:true});}
});
