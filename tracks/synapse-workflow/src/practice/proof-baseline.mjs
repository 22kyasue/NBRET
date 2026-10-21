import http from 'node:http';
import {randomBytes,createHash,randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {evaluateProof} from '../investigation/proof.mjs';
import {outputDirectory} from '../investigation/output-path.mjs';
import {createWorkbench} from './workbench.mjs';
import {renderAssessmentReport} from './reader-report.mjs';

// Explicit known-answer evaluator fixture. This is not a blind discovery target.
// The positive modes deliberately return synthetic foreign contents so the
// evidence predicate can be falsified; they are never enabled in the practice app.
export async function collectProofFixture(mode){
  if(!['isolated','disclosed','denial-with-data'].includes(mode))throw Error('Unknown fixture mode');
  const actors={alice:{id:'alice',tenant:'north',role:'member'},bob:{id:'bob',tenant:'south',role:'member'}};
  const tokens={alice:randomBytes(24).toString('hex'),bob:randomBytes(24).toString('hex')};
  const object={id:'WO-S201',tenant:'south',owner:'bob',state:'draft',title:'Synthetic supplier request',description:'Controlled data '+randomBytes(24).toString('hex'),budget:480};
  const observations=[],bodies={},requestLog=[];let origin;
  const sourceHash=createHash('sha256').update('proof-fixture-v1:'+mode).digest('hex');
  const server=http.createServer((req,res)=>{
    const actor=Object.keys(tokens).find(id=>req.headers.authorization===`Bearer ${tokens[id]}`);
    res.setHeader('content-type','application/json');res.setHeader('cache-control','no-store');
    if(req.headers.host!==new URL(origin).host||req.method!=='GET'||!actor){res.writeHead(403);res.end('{"error":"fixture_boundary"}');return;}
    requestLog.push({actor,method:req.method,path:req.url});
    if(req.url==='/api/me'){res.end(JSON.stringify({profile:actors[actor]}));return;}
    if(req.url!=='/api/work-orders/WO-S201'){res.writeHead(404);res.end('{"error":"not_found"}');return;}
    if(actor==='bob'){res.end(JSON.stringify({order:object}));return;}
    if(mode==='isolated'){res.writeHead(403);res.end('{"error":"not_allowed"}');return;}
    res.writeHead(mode==='denial-with-data'?403:200);res.end(JSON.stringify({order:object}));
  });
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});origin=`http://127.0.0.1:${server.address().port}`;
  try{
    for(const [id,actor,kind,path]of[['actor-profile','alice','profile','/api/me'],['owner-profile','bob','profile','/api/me'],['owner-control','bob','order','/api/work-orders/WO-S201'],['attempt','alice','order','/api/work-orders/WO-S201']]){
      const start=performance.now();
      const receipt=await new Promise((ok,fail)=>{const req=http.request(origin+path,{method:'GET',agent:false,headers:{authorization:`Bearer ${tokens[actor]}`}},res=>{const chunks=[];let size=0;res.on('data',b=>{size+=b.length;if(size>4096)req.destroy(Error('Fixture response budget'));else chunks.push(b);});res.on('error',fail);res.on('end',()=>res.complete?ok({status:res.statusCode,bytes:Buffer.concat(chunks)}):fail(Error('Incomplete fixture receipt')));});req.setTimeout(2000,()=>req.destroy(Error('Fixture deadline')));req.on('error',fail);req.end();});
      bodies[id]=receipt.bytes.toString('utf8');observations.push({id,action:{kind,actor,...(kind==='order'?{objectId:object.id}:{})},identity:{principal:actor,tenant:actors[actor].tenant,role:actors[actor].role},environment:{id:'fixture-'+mode,sourceHash},outcome:'complete',request:{actor,method:'GET',path},response:{status:receipt.status,value:JSON.parse(bodies[id]),bodyText:bodies[id],representation:'json',bodyBytes:receipt.bytes.length,bodySha256:createHash('sha256').update(receipt.bytes).digest('hex')},transport:{complete:true,elapsedMs:performance.now()-start}});
    }
  }finally{await new Promise(ok=>{server.close(ok);server.closeAllConnections();});}
  return{mode,origin,sourceHash,observations,bodies,requestLog,closed:!server.listening};
}
export function fixturePlan(caseId='fixture-case'){
  return{caseId,claim:'Did the controlled different-tenant account receive the exact owner-controlled object?',kind:'cross-tenant-object-read',attemptId:'attempt',controlId:'owner-control',actorProfileId:'actor-profile',ownerProfileId:'owner-profile'};
}
export async function runProofBaseline({outDir}={}){
  const root=await outputDirectory(outDir);await mkdir(root,{recursive:false});const started=performance.now(),trials=[];
  for(const mode of ['isolated','disclosed','denial-with-data']){
    const fixture=await collectProofFixture(mode),result=evaluateProof(fixturePlan(),{observations:fixture.observations,environment:{sourceHash:fixture.sourceHash}});
    const expected=mode==='isolated'?'not-demonstrated':'demonstrated-in-collected-evidence';
    trials.push({mode,expected,passed:result.status===expected,result,requestCount:fixture.requestLog.length,closed:fixture.closed});
    await writeFile(join(root,mode+'.json'),JSON.stringify(fixture,null,2)+'\n',{flag:'wx'});
  }
  // Run the actual observation-driven investigation against the unchanged,
  // ordinary owned app. A no-finding outcome is preserved as a clean control.
  const session=await createWorkbench({outDir:join(root,'ordinary-session'),scope:{permitTransitions:false}});
  let state;
  try{
    while(session.state().proposal&&!session.state().paused&&!session.state().stopped){await session.step({expectedRevision:session.state().revision});}
    state=session.state();
    const attempt=state.observations.find(o=>o.action.kind==='order'&&o.action.actor==='alice'&&o.response.status===404);
    if(!attempt)throw Error('Ordinary cross-tenant check did not execute');
    const control=state.observations.find(o=>o.action.kind==='order'&&o.action.actor==='bob'&&o.action.objectId===attempt.action.objectId&&o.response.status===200);
    const actorProfile=state.observations.find(o=>o.action.kind==='profile'&&o.action.actor==='alice'),ownerProfile=state.observations.find(o=>o.action.kind==='profile'&&o.action.actor==='bob');
    if(!control||!actorProfile||!ownerProfile)throw Error('Ordinary controls unavailable');
    const caseId='ordinary-cross-tenant';
    const command=async(method,body)=>session[method]({expectedRevision:session.state().revision,...body});
    await command('recordCase',{event:{id:randomUUID(),type:'candidate.created',payload:{id:caseId,title:'Can one test tenant read another test tenant’s known record?',question:'Does the selected cross-tenant request return the controlled object?',authorId:'baseline-session',basisEvidenceIds:[attempt.id],identity:attempt.identity,environment:{sourceHash:state.target.sourceHash},expected:'The controlled foreign record remains unavailable.',observed:'The selected request returned an error-only denial.',demonstratedConsequence:'No unauthorized read demonstrated in this ordinary-app trial.',potentialConsequences:'No additional damage demonstrated.',uncertainties:'Other application classes and live deployments are not evaluated by this fixture.',suggestedRepair:'No repair established for this selected denial.',manualVerification:'Inspect the matched owner control, profiles and actual attempt response.',impactType:'exposure'}}});
    await command('recordCase',{event:{id:randomUUID(),type:'evidence.filtered',payload:{caseId,positiveControlIds:[control.id]}}});
    await command('recordProof',{plan:{caseId,claim:'Selected controlled cross-tenant read',kind:'cross-tenant-object-read',attemptId:attempt.id,controlId:control.id,actorProfileId:actorProfile.id,ownerProfileId:ownerProfile.id}});
    await session.stop('Bounded read-only ordinary-app frontier exhausted; no positive effect required.');state=session.state();
    await session.exportReport();
  }finally{await session.close();}
  const receipt={schemaVersion:1,kind:'synapse-proof-baseline',version:'proof-baseline-v1',completedAt:new Date().toISOString(),elapsedMs:Math.round(performance.now()-started),trials,ordinary:{observations:state.observations.length,requests:state.targetRequestCount,proofProgress:state.proofProgress,targetClosed:state.targetClosed},passed:trials.every(t=>t.passed&&t.closed)&&state.proofProgress[0]?.status==='not-demonstrated'&&state.targetClosed,manualBaseline:{status:'not-measured',improvementClaim:false},limits:['Known-answer evaluator fixture, not blind discovery or a manual expert comparison.','Positive fixture behavior is deliberately constructed and is not a TOBIRA finding.','Separate reasoning sessions share unrestricted local access; independent custody is not enforced.','No live target or paid model requests; no automatic across-investigation self-modification.']};
  await writeFile(join(root,'receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  await writeFile(join(root,'assessment.html'),renderAssessmentReport({...state,subject:{company:'Owned synthetic POC',application:'Proof-driven investigation baseline',date:receipt.completedAt},limitations:[...state.limitations,...receipt.limits]}, {exported:true}),{flag:'wx'});
  return{outDir:root,receipt,report:join(root,'assessment.html')};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--out')throw Error('Usage: node src/practice/proof-baseline.mjs --out NEW_DIRECTORY');const result=await runProofBaseline({outDir:args[1]});console.log(JSON.stringify(result,null,2));if(!result.receipt.passed)process.exitCode=1;}catch(error){console.error(error.message);process.exitCode=1;}
}
