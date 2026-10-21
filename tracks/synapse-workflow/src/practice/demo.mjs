import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID, randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { startPracticeApp } from './app.mjs';
import { runPracticeRehearsal } from './rehearsal.mjs';
import { outputDirectory } from '../investigation/output-path.mjs';

const routes=new Map([
  ['/','REPORT.html'],['/receipt.json','receipt.json'],
  ['/assessment/evidence.json','assessment/evidence.json'],
  ['/assessment/results.json','assessment/results.json'],
  ['/assessment/engagement.json','assessment/engagement.json'],
  ['/inspection/inspection.json','inspection/inspection.json'],
]);

export async function startPracticeDemo({outRoot='runs',port=0}={}) {
  if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Port must be an integer from 0 to 65535');
  const root=await outputDirectory(outRoot);await mkdir(root,{recursive:true});
  let latest,workspace,server,url,busy=false,closing=false;
  const nonce=randomBytes(24).toString('hex');
  const run=async()=>{latest=await runPracticeRehearsal({outDir:join(root,`practice-${randomUUID()}`)});};
  try {
    await run();workspace=await startPracticeApp({port:0});
    server=createServer({maxHeaderSize:8192},async(req,res)=>{
      const send=(status,body,type='text/plain; charset=utf-8')=>{
        res.writeHead(status,{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff',
          'referrer-policy':'same-origin','x-frame-options':'DENY',
          'content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"});res.end(body);
      };
      try {
        if(req.headers.host!==new URL(url).host)return send(421,'Unexpected host');
        if(req.method==='POST' && req.url===`/run/${nonce}`){
          if(req.headers.origin!==url || (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site']!=='same-origin'))return send(403,'Same-origin request required');
          if(req.headers['transfer-encoding'] || Number(req.headers['content-length']||0)!==0)return send(413,'No request body allowed');
          if(busy || closing)return send(409,'A rehearsal is already running or shutting down');
          busy=true;
          try{await run();}finally{busy=false;}
          res.writeHead(303,{location:'/', 'cache-control':'no-store'});return res.end();
        }
        if(req.method!=='GET')return send(405,'Method not allowed');
        const file=routes.get(req.url);if(!file)return send(404,'Not found');
        let body=await readFile(join(latest.outDir,file),'utf8');
        if(req.url==='/')body=body.replace('<h2>What actually ran</h2>',`<nav class="notice"><form method="post" action="/run/${nonce}"><button style="font:inherit;padding:10px 16px;cursor:pointer;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--fg);text-align:left" type="submit">Run another fresh rehearsal</button></form><p><a href="${workspace.url}" target="_blank" rel="noopener">Open the practice business app ↗</a></p><small>The workspace is a separate, persistent demo instance. Each rehearsal uses a fresh instance and closes it afterward.</small></nav><h2>What actually ran</h2>`);
        send(200,body,req.url==='/'?'text/html; charset=utf-8':'application/json; charset=utf-8');
      }catch{send(500,'Rehearsal failed. Inspect local terminal output and retained artifacts before retrying.');}
    });
    server.requestTimeout=30000;server.headersTimeout=5000;
    await new Promise((ok,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',ok);});
    url=`http://127.0.0.1:${server.address().port}`;
    let closePromise;
    return {url,workspaceUrl:workspace.url,get latest(){return latest;},close(){
      return closePromise ??= (async()=>{
        closing=true;
        try{await new Promise((ok,fail)=>{server.close(error=>error?fail(error):ok());server.closeIdleConnections();});}
        finally{await workspace.close();}
      })();
    }};
  }catch(error){if(workspace)await workspace.close();if(server?.listening)await new Promise(ok=>server.close(ok));throw error;}
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const demo=await startPracticeDemo();
    console.log(`Synapse guided rehearsal: ${demo.url}\nPractice workspace: ${demo.workspaceUrl}\nCtrl+C stops both local servers. No external sign-in required.`);
    let stopping=false;const stop=async()=>{if(stopping)return;stopping=true;await demo.close();};
    process.once('SIGINT',stop);process.once('SIGTERM',stop);
  }catch(error){console.error(error.message);process.exitCode=1;}
}
