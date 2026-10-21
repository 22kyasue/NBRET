import http from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { startPracticeApp } from './app.mjs';
import { outputDirectory } from '../investigation/output-path.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hypotheses=[
  {id:'H1',question:'Can a member read the other organization’s known work order?',consequence:'Disclosure of another organization’s operational details. This is a possible consequence, not an observed disclosure.',checks:['alice-foreign-read','bob-foreign-read'],next:'Check role and workflow boundaries after read isolation.'},
  {id:'H2',question:'Can a member approve an already submitted order?',consequence:'Loss of independent approval and unauthorized work authorization. No payment execution or monetary loss is modeled.',checks:['member-approval','member-approval-state'],next:'Check whether the approver is constrained by workflow state.'},
  {id:'H3',question:'Can an approver skip submission and approve a draft?',consequence:'Work could be authorized without the required submission/review stage. No real business damage is measured.',checks:['draft-approval','draft-approval-state'],next:'Exercise the legitimate submission/approval path as a positive control.'},
  {id:'H4',question:'Can one organization change another organization’s draft?',consequence:'Unauthorized alteration of another team’s work queue and approval context.',checks:['foreign-submit','foreign-submit-state'],next:'Check state after denial rather than relying on the status alone.'},
  {id:'H5',question:'Can an approved order be submitted again through the normal action?',consequence:'Unexpected state rollback could invalidate approval context or cause duplicate downstream work; downstream execution is absent here.',checks:['repeat-submit','repeat-submit-state'],next:'Stop at the declared coverage boundary; consolidate untested branches.'},
];

/** A bounded, source-assisted guided investigation, not an autonomous discovery engine.
 * The only target is a fresh app created here; no URL, payload or command is accepted. */
export async function runGuidedInvestigation({outDir}={}) {
  if(typeof outDir!=='string'||!outDir)throw new Error('New output directory required');
  const root=await outputDirectory(outDir);await mkdir(root,{recursive:false});
  const started=Date.now(),id=`guided-${randomUUID()}`,evidence=[],checks=[],decisions=[];
  const sourceHash=hash(await readFile(new URL('./app.mjs',import.meta.url)));
  const manifest={schemaVersion:1,id,mode:'guided-source-assisted',startedAt:new Date(started).toISOString(),sourceHash,runnerHash:hash(await readFile(new URL('./investigate.mjs',import.meta.url))),
    authorization:'Fresh owned ephemeral loopback app only; synthetic reads and bounded submit/approve actions.',
    limits:{requests:40,elapsedAdmissionMs:15000,responseBytes:65536,requestInactivityTimeoutMs:1500},hypotheses,
    assistance:'Skye read app source and selected hypotheses. The runner records this fixed guided plan, not autonomous reasoning.',
    exclusions:['No public target, scanner, provider, exploit payload, load test or intentionally vulnerable variant.','No blind evaluation, manual baseline, financial-loss estimate, repair or retest claim.']};
  await writeFile(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  let app,closed=false;const cookies={},secrets=[];
  async function request(caseId,actor,path,{method='GET',body,csrf}={}) {
    if(evidence.length>=40||Date.now()-started>15000)throw new Error('Investigation budget reached');
    if(!/^\/(?:$|api\/(?:me|csrf|session|work-orders(?:\/WO-[NS][0-9]{3}(?:\/(?:submit|approve))?)?))$/.test(path))throw new Error('Route outside fixed practice surface');
    const headers={};
    if(actor==='alice'||actor==='bob')headers.authorization=`Bearer ${app.tokens[actor]}`;
    if(actor==='carol'&&cookies.carol)headers.cookie=cookies.carol;
    if(method==='POST'){headers.origin=app.url;headers['content-type']='application/json';if(csrf)headers['x-csrf-token']=csrf;}
    const payload=body===undefined?undefined:JSON.stringify(body);if(payload)headers['content-length']=Buffer.byteLength(payload);
    const before=Date.now();
    const response=await new Promise((ok,fail)=>{
      const req=http.request(app.url+path,{method,headers},res=>{
        const chunks=[];let size=0;
        res.on('data',chunk=>{size+=chunk.length;if(size>65536)req.destroy(new Error('Response budget reached'));else chunks.push(chunk);});
        res.on('error',fail);res.on('end',()=>ok({status:res.statusCode,body:Buffer.concat(chunks).toString('utf8'),setCookie:res.headers['set-cookie']||[],contentType:res.headers['content-type']}));
      });
      req.setTimeout(1500,()=>req.destroy(new Error('Request timeout')));req.on('error',fail);req.end(payload);
    });
    let value;try{value=JSON.parse(response.body);}catch{value={htmlPage:response.contentType?.startsWith('text/html')===true};}
    const actualActor=app.requestLog.at(-1)?.actorId||'anonymous';
    const obs={id:caseId,at:new Date(before).toISOString(),elapsedMs:Date.now()-before,
      identity:{sessionLabel:actor,principal:actualActor,tenant:actualActor==='alice'||actualActor==='carol'?'north':actualActor==='bob'?'south':'none',role:actualActor==='carol'?'approver':actualActor==='anonymous'?'unauthenticated':'member'},
      environment:{origin:app.url,sourceHash,sessionEpoch:id},request:{method,path,...(body?{body}: {})},
      response:{status:response.status,contentType:response.contentType,bodyBytes:Buffer.byteLength(response.body),bodySha256:hash(response.body),
        representation:caseId==='csrf'?'secret-redacted JSON':caseId==='workspace-page'?'HTML reachability projection':'parsed JSON; raw headers omitted',
        value:caseId==='csrf'?{csrf:'[omitted synthetic secret]'}:value},completeness:'complete-for-selected-predicate'};
    evidence.push(obs);
    if(actor==='carol')for(const cookie of response.setCookie){const pair=cookie.split(';')[0];secrets.push(pair.split('=')[1]);cookies.carol=cookies.carol?cookies.carol+'; '+pair:pair;}
    if(caseId==='csrf')secrets.push(value.csrf);
    return {obs,value};
  }
  function check(name,response,predicate,expected){
    const passed=Boolean(predicate(response));checks.push({id:name,evidenceId:response.obs.id,passed,expected});return passed;
  }
  const state=(r,id,state)=>r.obs.response.status===200&&r.value.order?.id===id&&r.value.order.state===state;
  const denied=r=>!Object.hasOwn(r.value,'order')&&!Object.hasOwn(r.value,'orders');
  try {
    app=await startPracticeApp({port:0});secrets.push(...Object.values(app.tokens));
    const page=await request('workspace-page','anonymous','/');check('workspace-page',page,r=>r.obs.response.status===200&&r.value.htmlPage,'Self-contained normal workspace is reachable');
    const unsigned=await request('unsigned-list','anonymous','/api/work-orders');check('unsigned-list',unsigned,r=>r.obs.response.status===401&&denied(r),'No unsigned work-order list');
    const lists={};
    for(const actor of ['alice','bob']){
      const profile=await request(`${actor}-profile`,actor,'/api/me');
      if(!check(`${actor}-profile`,profile,r=>r.obs.response.status===200&&r.value.profile?.id===actor&&r.value.profile.role==='member'&&r.value.profile.tenant===(actor==='alice'?'north':'south'),'Server-recognized member principal and tenant match'))throw new Error('Identity positive control failed');
      lists[actor]=await request(`${actor}-list`,actor,'/api/work-orders');
      if(!check(`${actor}-list`,lists[actor],r=>r.obs.response.status===200&&r.value.orders?.length===3&&r.value.orders.every(o=>o.tenant===(actor==='alice'?'north':'south')&&o.owner===actor),'Three own-organization records'))throw new Error('List positive control failed');
    }
    decisions.push({stage:'exploration',reason:'Observed two distinct member profiles and tenant-scoped lists, with draft/submitted/approved records. Known IDs come from these permitted lists; source access is declared.',evidenceIds:['alice-profile','alice-list','bob-profile','bob-list']});
    for(const [actor,foreign]of[['alice','WO-S201'],['bob','WO-N101']]){
      const r=await request(`${actor}-foreign-read`,actor,`/api/work-orders/${foreign}`);
      check(`${actor}-foreign-read`,r,x=>x.obs.response.status===404&&denied(x),'Foreign detail denied and no order content');
    }
    decisions.push({stage:'H1→H2',reason:'Both selected foreign reads returned no order object; next branch concerns a distinct approval-role boundary.'});
    const memberApprove=await request('member-approval','alice','/api/work-orders/WO-N102/approve',{method:'POST',body:{}});
    check('member-approval',memberApprove,r=>r.obs.response.status===403&&denied(r),'Member cannot approve submitted work');
    check('member-approval-state',await request('member-approval-state','alice','/api/work-orders/WO-N102'),r=>state(r,'WO-N102','submitted'),'Exact order remains submitted after denial');
    const csrf=await request('csrf','carol','/api/csrf');
    const login=await request('approver-session','carol','/api/session',{method:'POST',body:{user:'carol'},csrf:csrf.value.csrf});
    if(!check('approver-session',login,r=>r.obs.response.status===200&&r.value.profile?.id==='carol'&&r.value.profile.tenant==='north'&&r.value.profile.role==='approver','Demo session selected Carol'))throw new Error('Approver session setup failed');
    const carol=await request('approver-profile','carol','/api/me');
    if(!check('approver-profile',carol,r=>r.obs.response.status===200&&r.value.profile?.id==='carol'&&r.value.profile.role==='approver'&&r.value.profile.tenant==='north','Authenticated approver identity verified separately'))throw new Error('Approver identity positive control failed');
    const draft=await request('draft-approval','carol','/api/work-orders/WO-N101/approve',{method:'POST',body:{},csrf:csrf.value.csrf});
    check('draft-approval',draft,r=>r.obs.response.status===409&&denied(r),'Approver cannot approve a draft');
    check('draft-approval-state',await request('draft-approval-state','alice','/api/work-orders/WO-N101'),r=>state(r,'WO-N101','draft'),'Exact draft remains unchanged');
    decisions.push({stage:'H3→positive control',reason:'Selected member and draft-state actions denied; exercise valid transitions to distinguish working controls from universally broken actions.'});
    check('valid-submit',await request('valid-submit','alice','/api/work-orders/WO-N101/submit',{method:'POST',body:{}}),r=>state(r,'WO-N101','submitted'),'Member can submit own draft');
    check('valid-approve',await request('valid-approve','carol','/api/work-orders/WO-N101/approve',{method:'POST',body:{},csrf:csrf.value.csrf}),r=>state(r,'WO-N101','approved'),'Same-organization approver can approve submitted order');
    check('valid-final-state',await request('valid-final-state','alice','/api/work-orders/WO-N101'),r=>state(r,'WO-N101','approved'),'Fresh read confirms exact approved object');
    check('foreign-submit',await request('foreign-submit','alice','/api/work-orders/WO-S201/submit',{method:'POST',body:{}}),r=>r.obs.response.status===404&&denied(r),'Foreign mutation denied without returning an order');
    check('foreign-submit-state',await request('foreign-submit-state','bob','/api/work-orders/WO-S201'),r=>state(r,'WO-S201','draft'),'Foreign owner reads unchanged exact draft');
    check('repeat-submit',await request('repeat-submit','alice','/api/work-orders/WO-N101/submit',{method:'POST',body:{}}),r=>r.obs.response.status===409&&denied(r),'Approved order cannot be submitted again');
    check('repeat-submit-state',await request('repeat-submit-state','alice','/api/work-orders/WO-N101'),r=>state(r,'WO-N101','approved'),'Approved state survives repeated submission attempt');
  }catch(error){manifest.executionError=error.message;}finally{if(app){await app.close();closed=!app.isListening();}}
  const requestLog=app?structuredClone(app.requestLog):[];
  const findings=hypotheses.map(h=>{
    const passed=h.checks.every(id=>checks.find(c=>c.id===id)?.passed);
    return {...h,disposition:passed?'not-reproduced-in-selected-cases':'needs-review',
      observedDamage:passed?'No unauthorized damage demonstrated in these selected cases.':'Undetermined: failed or missing checks require review before a damage conclusion.',
      observedEffects:h.checks.map(id=>{const e=evidence.find(e=>e.id===id);return e?`${id}: HTTP ${e.response.status}${e.response.value.order?`; ${e.response.value.order.id} state=${e.response.value.order.state}`:''}`:`${id}: not observed`;})};
  });
  const limits=['Source-assisted guided investigation; Skye selected a fixed plan before execution. No autonomous hypothesis generator or hill-climbing engine ran.',
    'Evidence retains parsed JSON with byte counts/digests, not raw HTTP messages. HTML is a reachability projection; synthetic CSRF and all credential headers are omitted. Actor attribution uses this same app’s request log, not an independent identity authority.',
    'The reviewer shares this host/account and can see source. Separate review is not enforced isolation or blind evaluation.',
    'Not tested: concurrency, browser injection, session expiry/revocation, all role pairs, malformed/alternate encodings, storage durability, infrastructure, integrations or availability.',
    'Only exact returned objects and selected states were checked. No independent database/telemetry exists; extra undisclosed effects cannot be ruled out.',
    'Elapsed time is checked before each request and request timeout measures inactivity; neither is a hard process deadline.',
    'Fictional user selection is intentional demo functionality, not production authentication. No client applicability or financial damage is established.'];
  const report={schemaVersion:1,id,mode:manifest.mode,completedAt:new Date().toISOString(),elapsedMs:Date.now()-started,
    executionError:manifest.executionError||null,appClosed:closed,receivedRequests:requestLog.length,observations:evidence.length,
    passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,hypotheses:findings,decisions,requestLog,
    stopReason:manifest.executionError?'Interrupted: '+manifest.executionError+'; unvisited branches remain incomplete.':'Completed the five selected hypothesis branches and positive controls; remaining coverage requires a separately planned increment, not a diminishing-returns claim.',limits,
    review:'Pending separate Bryn artifact/source critique; no independent verification claim.',
    nextActions:['Read the separate reviewer objections before accepting conclusions.','Kotaro can replay this guided run, inspect evidence and try the ordinary workspace flow.','Next build: session-operated exploration ledger and permission-gated evidence adapter; then broader role/state coverage.']};
  const data=JSON.stringify({manifest,report,evidence});
  if(secrets.some(secret=>secret&&data.includes(secret)))throw new Error('Synthetic credential found in output');
  for(const[name,value]of[['evidence.json',evidence],['results.json',report]])await writeFile(join(root,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  const digest={};for(const name of ['manifest.json','evidence.json','results.json'])digest[name]=hash(await readFile(join(root,name)));
  await writeFile(join(root,'digests.json'),JSON.stringify(digest,null,2)+'\n',{flag:'wx'});
  const rows=findings.map(h=>`<article><small>${h.id} · ${escape(h.disposition)}</small><h2>${escape(h.question)}</h2><p><b>Possible damage:</b> ${escape(h.consequence)}</p><p><b>Observed:</b> ${escape(h.observedDamage)}</p><ul>${h.observedEffects.map(v=>`<li><code>${escape(v)}</code></li>`).join('')}</ul></article>`).join('');
  await writeFile(join(root,'REPORT.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synapse · First guided investigation</title><style>:root{color-scheme:light dark}body{font:16px/1.6 system-ui;margin:0;background:light-dark(#f6f6f0,#17201a);color:light-dark(#25352a,#e1e9e1)}main{max-width:850px;margin:auto;padding:30px 22px}h1{font:40px/1.2 Georgia}h2{font-size:20px}article{border-top:1px solid #849184;padding:20px 0}small{font-family:monospace}a{color:inherit}li{margin:10px 0}code{overflow-wrap:anywhere}</style><main><small>SYNAPSE · GUIDED / SOURCE-ASSISTED</small><h1>First investigation run</h1><p>${report.receivedRequests} actual requests · ${report.passed} checks passed · ${report.failed} checks failed · fixture ${closed?'closed':'closure unconfirmed'}.</p><p><b>This is a guided run with five selected hypotheses. It does not establish autonomous discovery or application security.</b></p><p><a href="evidence.json">Recorded observations</a> · <a href="results.json">Checks and decision ledger</a> · <a href="manifest.json">Scope and initial hypotheses</a> · <a href="review.md">Separate reviewer critique</a></p>${rows}<h2>Coverage and uncertainty</h2><ul>${limits.map(v=>`<li>${escape(v)}</li>`).join('')}</ul><h2>Why this run stopped</h2><p>${escape(report.stopReason)}</p><h2>Next actions</h2><ul>${report.nextActions.map(v=>`<li>${escape(v)}</li>`).join('')}</ul><small>${escape(id)} · ${escape(report.completedAt)}</small></main></html>`,{flag:'wx'});
  return{outDir:root,report};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{await mkdir('runs',{recursive:true});const result=await runGuidedInvestigation({outDir:join('runs',`guided-investigation-${randomUUID()}`)});console.log(JSON.stringify({outDir:result.outDir,requests:result.report.receivedRequests,passed:result.report.passed,failed:result.report.failed,closed:result.report.appClosed,executionError:result.report.executionError},null,2));if(result.report.executionError||result.report.failed||!result.report.appClosed)process.exitCode=1;}catch(error){console.error(error.message);process.exitCode=1;}
}
