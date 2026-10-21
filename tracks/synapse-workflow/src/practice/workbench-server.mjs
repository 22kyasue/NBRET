import { createServer } from 'node:http';
import { mkdir,readFile } from 'node:fs/promises';
import { resolve,join,dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomBytes,randomUUID } from 'node:crypto';
import { createWorkbench,renderWorkbenchReport,renderExecutiveReport } from './workbench.mjs';
import {readLocalJson} from '../investigation/local-input.mjs';
import {renderAssessmentReport,READER_SCRIPT_HASH} from './reader-report.mjs';

export async function startWorkbenchServer({outDir,port=0,scope,intake,resumeFrom,resumeExecution=false}={}) {
  if(!Number.isInteger(port)||port<0||port>65535)throw new Error('Integer loopback port required');
  let session=await createWorkbench({outDir,scope,intake,resumeFrom,resumeExecution}),nonce=randomBytes(24).toString('hex');
  const freshScope=()=>{const s=session.state().scope;return{tracks:s.tracks,permitTransitions:s.permitTransitions,maxActions:s.maxActions,progress:s.progress};};
  let server,url,automatic=false,loop=null,loopError=null,closing,resetPromise=null,loopGeneration=0;
  const current=()=>({...session.state(),nonce,automatic,loopError});
  async function pauseAutomatic(){automatic=false;if(loop)await loop;}
  const startAutomatic=()=>{
    if(automatic)return;automatic=true;loopError=null;
    const ownedSession=session,generation=++loopGeneration;
    loop=(async()=>{
      try{while(automatic&&generation===loopGeneration&&session===ownedSession){const state=ownedSession.state();if(state.stopped||state.paused||state.stopRequested||!state.proposal)break;if(state.progress.shouldPause){await ownedSession.steer({expectedRevision:state.revision,mode:'pause'});break;}await ownedSession.step({expectedRevision:state.revision});await new Promise(ok=>setTimeout(ok,40));}}
      catch{if(generation===loopGeneration&&session===ownedSession)loopError='Automatic continuation paused. Inspect the latest record before another action.';}
      finally{if(generation===loopGeneration){automatic=false;loop=null;}}
    })();
  };
  try{
    server=createServer({maxHeaderSize:8192},async(req,res)=>{
      const send=(status,body,type='application/json; charset=utf-8')=>{
        res.writeHead(status,{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'same-origin',
          'content-security-policy':`default-src 'none'; script-src 'self'${req.url==='/assessment'?' '+READER_SCRIPT_HASH:''}; style-src ${['/report','/executive','/assessment'].includes(req.url)?"'unsafe-inline'":"'self'"}; font-src ${req.url==='/assessment'?'data:':"'none'"}; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`,'x-frame-options':'DENY'});
        res.end(Buffer.isBuffer(body)||typeof body==='string'?body:JSON.stringify(body));
      };
      try{
        if(req.headers.host!==new URL(url).host)return send(421,{error:'Unexpected host'});
        if(req.method==='GET'){
          if(req.url==='/api/state')return send(200,current());
          if(req.url==='/assessment')return send(200,renderAssessmentReport(session.state()),'text/html; charset=utf-8');
          if(req.url==='/report')return send(200,renderWorkbenchReport(session.state()),'text/html; charset=utf-8');
          if(req.url==='/executive')return send(200,renderExecutiveReport(session.state()),'text/html; charset=utf-8');
          if(/^\/artifacts\/png-[a-f0-9]{64}$/.test(req.url))return send(200,await session.screenshot(req.url.slice('/artifacts/'.length)),'image/png');
          const file=new Map([['/','workbench.html'],['/workbench.js','workbench-ui.js'],['/workbench.css','workbench.css']]).get(req.url);
          if(!file)return send(404,{error:'Not found'});
          return send(200,await readFile(new URL(file,import.meta.url),'utf8'),req.url.endsWith('.js')?'text/javascript; charset=utf-8':req.url.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');
        }
        if(req.method!=='POST')return send(405,{error:'Method not allowed'});
        if(req.headers.origin!==url||req.headers['x-workbench-nonce']!==nonce||req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin')return send(403,{error:'Same-origin session authorization required'});
        const admittedSession=session,admittedNonce=nonce;
        if(req.headers['content-type']?.split(';')[0]!=='application/json'||req.headers['content-encoding'])return send(415,{error:'Plain JSON required'});
        if(Number(req.headers['content-length']||0)>16384)return send(413,{error:'Command exceeds budget'});
        let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16384)return send(413,{error:'Command exceeds budget'});chunks.push(chunk);}
        let command;try{const bytes=Buffer.concat(chunks),text=bytes.toString('utf8');if(!Buffer.from(text,'utf8').equals(bytes))throw new Error('Invalid UTF8');command=JSON.parse(text);}catch{return send(400,{error:'Invalid JSON'});}
        if(session!==admittedSession||nonce!==admittedNonce)return send(403,{error:'Session changed while command was received; refresh state'});
        if(closing||resetPromise&&req.url!=='/api/stop')return send(409,{error:'Session lifecycle operation in progress'});
        if(!command||typeof command!=='object'||Array.isArray(command))return send(400,{error:'Command object required'});
        if(req.url==='/api/stop'){
          if(Object.keys(command).some(k=>!['reason','expectedRevision'].includes(k)))return send(400,{error:'Unexpected stop fields'});
          automatic=false;if(resetPromise)await resetPromise.catch(()=>{});await session.stop(command.reason||'Owner stopped the session');return send(200,current());
        }
        if(req.url==='/api/new'){
          const before=session.state();
          if(resetPromise||closing||Object.keys(command).some(k=>k!=='expectedRevision')||command.expectedRevision!==before.revision||!before.stopped||before.busy||automatic)return send(409,{error:'Stop the current target before starting a fresh session'});
          const nextScope=freshScope();resetPromise=(async()=>{const next=await createWorkbench({outDir:join(dirname(session.outDir),`workbench-${randomUUID()}`),scope:nextScope});session=next;nonce=randomBytes(24).toString('hex');loopError=null;})();
          try{await resetPromise;}finally{resetPromise=null;}return send(200,current());
        }
        if(req.url==='/api/steer'){
          if(command.mode==='pause'&&Object.keys(command).every(k=>['mode','expectedRevision'].includes(k))&&Number.isSafeInteger(command.expectedRevision)&&command.expectedRevision>=0&&command.expectedRevision<=session.state().revision){
            await pauseAutomatic();if(session!==admittedSession)return send(409,{error:'Session changed; refresh state'});await session.steer({mode:'pause',expectedRevision:session.state().revision});
          }else{if(automatic)return send(409,{error:'Pause continuation before changing priority'});await session.steer(command);}
          return send(200,current());
        }
        if(req.url==='/api/continue'){
          if(Object.keys(command).some(k=>k!=='expectedRevision')||command.expectedRevision!==session.state().revision)return send(409,{error:'Stale or invalid continuation command'});
          const state=session.state();if(state.stopped||state.paused||state.stopRequested||state.busy||automatic)return send(409,{error:'Session is not ready for continuation'});
          startAutomatic();return send(202,current());
        }
        if(req.url==='/api/step'){
          if(automatic)return send(409,{error:'Pause continuation before submitting a step'});
          await session.step(command);return send(200,current());
        }
        if(req.url==='/api/review'){
          if(automatic)return send(409,{error:'Pause continuation before recording a review'});
          await session.review(command);return send(200,current());
        }
        const records=new Map([['/api/case','recordCase'],['/api/proof','recordProof'],['/api/request','request'],['/api/effort','recordEffort'],['/api/evaluate','evaluate'],['/api/iteration','iteration'],['/api/rejection-audit','rejectionAudit'],['/api/attach-evidence','attachEvidence'],['/api/screenshot','attachScreenshot'],['/api/note','recordNote']]);
        if(records.has(req.url)){
          if(automatic)return send(409,{error:'Pause continuation before recording workflow data'});
          await session[records.get(req.url)](command);return send(200,current());
        }
        if(req.url==='/api/export'){
          if(Object.keys(command).some(k=>k!=='expectedRevision')||command.expectedRevision!==session.state().revision)return send(409,{error:'Stale or invalid export command'});
          return send(200,await session.exportReport());
        }
        return send(404,{error:'Unknown command'});
      }catch(error){return send(409,{error:error.code==='NBRET_JOURNAL'?'Journal unavailable. Stop and inspect the retained records.':String(error.message).slice(0,250)});}
    });
    server.requestTimeout=15000;server.headersTimeout=5000;server.keepAliveTimeout=1000;
    await new Promise((ok,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',ok);});url=`http://127.0.0.1:${server.address().port}`;
    return {url,get session(){return session;},state:current,close(){return closing??=(async()=>{automatic=false;if(resetPromise)await resetPromise.catch(()=>{});await session.close();if(loop)await loop;await new Promise((ok,fail)=>{server.close(e=>e?fail(e):ok());server.closeIdleConnections();});})();}};
  }catch(error){await session.close();if(server?.listening)await new Promise(ok=>server.close(ok));throw error;}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const args=process.argv.slice(2),options={};
    for(let i=0;i<args.length;i++){const key=args[i];if(key==='--resume-target'){if(options[key])throw new Error('Duplicate option');options[key]=true;}else{if(!['--resume','--config','--port'].includes(key)||!args[i+1]||options[key])throw new Error('Usage: workbench [--config LOCAL.json] [--resume DIRECTORY [--resume-target]] [--port NUMBER]');options[key]=args[++i];}}
    const config=options['--config']?await readLocalJson(options['--config']):{};
    if(!config||typeof config!=='object'||Array.isArray(config)||Object.keys(config).some(k=>!['scope','intake'].includes(k)))throw new Error('Config supports only local scope and inert intake');
    if(options['--resume-target']&&!options['--resume'])throw new Error('--resume-target requires a saved owned session');
    await mkdir('runs',{recursive:true});const app=await startWorkbenchServer({...config,...(options['--resume']?{resumeFrom:options['--resume'],resumeExecution:Boolean(options['--resume-target'])}:{outDir:join('runs',`workbench-${randomUUID()}`)}),port:options['--port']===undefined?0:Number(options['--port'])});
    console.log(`Synapse session workbench: ${app.url}\nRecords: ${app.session.outDir}\nNo model API or external target. Ctrl+C closes the owned app and server.`);
    const stop=async()=>{await app.close();};process.once('SIGINT',stop);process.once('SIGTERM',stop);
  }catch(error){console.error(error.message);process.exitCode=1;}
}
