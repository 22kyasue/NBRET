import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { startPracticeApp } from './app.mjs';
import { runAssessment } from '../assessment/core.mjs';
import { inspectAssessmentDirectory } from '../investigation/assessment-import.mjs';
import { outputDirectory } from '../investigation/output-path.mjs';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

function plan(app, id) {
  const created = Date.now();
  const actor = name => ({ id:name, principal:app.identities[name].principal, tenant:app.identities[name].tenant,
    role:app.identities[name].role, sessionEpoch:id, headersEnv:{ authorization:`PRACTICE_${name.toUpperCase()}_HEADER` } });
  const check = (id, actor, path, claim, expect) => ({ id,actor,purpose:'control',effect:'read',method:'GET',url:app.url+path,
    claim,preconditions:'Fresh owned practice instance; synthetic identity, predefined functional check.',controls:[],expect });
  const orders = (owner, tenant, ids) => ({status:200,json:[
    {path:'/orders',type:'array',minLength:3,maxLength:3},
    ...ids.flatMap((id,index)=>[
      {path:`/orders/${index}/id`,equals:id},
      {path:`/orders/${index}/tenant`,equals:tenant},
      {path:`/orders/${index}/owner`,equals:owner},
    ]),
  ]});
  const cases = [
    check('alice-profile','alice','/api/me','Alice can read her own declared profile',{status:200,json:[{path:'/profile/id',equals:'alice'},{path:'/profile/tenant',equals:app.identities.alice.tenant}]}),
    check('bob-profile','bob','/api/me','Bob can read his own declared profile',{status:200,json:[{path:'/profile/id',equals:'bob'},{path:'/profile/tenant',equals:app.identities.bob.tenant}]}),
    check('alice-work-orders','alice','/api/work-orders','Alice can read her organization’s three expected work orders',orders('alice','north',['WO-N101','WO-N102','WO-N103'])),
    check('bob-work-orders','bob','/api/work-orders','Bob can read his organization’s three expected work orders',orders('bob','south',['WO-S201','WO-S202','WO-S203'])),
    check('anonymous-profile','anonymous','/api/me','An unsigned visitor receives no profile',{status:401,json:[{path:'/profile',exists:false}]}),
    check('anonymous-work-orders','anonymous','/api/work-orders','An unsigned visitor receives no work-order list',{status:401,json:[{path:'/orders',exists:false}]}),
  ];
  return {schemaVersion:1,kind:'nbret-engagement',id,client:'Owned synthetic practice workspace',
    environment:{id:'local-practice',revision:'fresh-workspace-v1'},policyRevision:'predefined-functional-rehearsal-v1',origins:[app.url],
    actors:[actor('alice'),actor('bob'),{id:'anonymous',principal:'anonymous',tenant:'none',role:'unauthenticated',sessionEpoch:id}],
    authorization:{status:'approved',reference:'owned-ephemeral-loopback-functional-rehearsal',approvedBy:'local-practice-owner',
      startsAt:new Date(created-1000).toISOString(),expiresAt:new Date(created+60000).toISOString(),caseIds:cases.map(c=>c.id),allowWrites:false},
    budgets:{timeoutMs:2000,maxMs:20000,delayMs:5,maxBytes:128*1024,maxTotalBytes:1024*1024},cases,
    exclusions:['Six predefined GET functional checks only; no autonomous exploration or vulnerability discovery.',
      'This is guided/familiar practice, not a blind evaluation or expert-baseline comparison.',
      'No planted weakness, independent finding review, repair or retest is claimed.',
      'No production system, third party, scanner, model call or additional paid service is used.']};
}

export function renderRehearsal(receipt, results) {
  const rows=results.tests.map(t=>`<tr><td>${escape(t.id)}</td><td>${escape(t.actor)}</td><td>${escape(t.claim)}</td><td><span class="pill ${t.outcome}">${escape(t.outcome)}</span></td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>Synapse · Guided rehearsal</title><style>
:root{color-scheme:light dark;--bg:light-dark(#f5f5f0,#171c19);--surface:light-dark(#fff,#202923);--fg:light-dark(#26322b,#e3eae4);--muted:light-dark(#637066,#acbaaf);--line:light-dark(#d9dfd8,#3b493f);--accent:light-dark(#315e42,#a5cdb1)}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,sans-serif}main{max-width:1000px;padding:38px 28px 70px;margin:auto}h1{font:400 clamp(32px,5vw,52px)/1.12 Georgia,serif;letter-spacing:-.025em;margin:18px 0}h2{font-size:20px;font-weight:500;margin:34px 0 12px}.eyebrow,.muted{color:var(--muted)}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.1em}.notice{border-left:3px solid var(--accent);padding:14px 18px;background:var(--surface)}.stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;border-block:1px solid var(--line);margin:26px 0}.stats>div{padding:18px 0;color:var(--muted);font-size:13px}.stats strong{display:block;font-size:30px;color:var(--fg);font-weight:400}table{width:100%;border-collapse:collapse;font-size:14px}th{text-align:left;color:var(--muted);font-weight:500}td,th{padding:13px 12px 13px 0;border-bottom:1px solid var(--line);vertical-align:top}.pill{font-size:12px;border-radius:20px;background:var(--surface);padding:5px 9px;white-space:nowrap}.passed{color:var(--accent)}a{color:inherit;text-underline-offset:4px}code{font-size:12px;overflow-wrap:anywhere}li{margin-bottom:8px}.links{display:flex;gap:20px;flex-wrap:wrap}.footer{margin-top:30px;font-size:12px;color:var(--muted)}@media(max-width:640px){main{padding:24px 18px 50px}table,tbody,tr,td{display:block}thead{display:none}tr{padding:14px 0;border-bottom:1px solid var(--line)}td{padding:3px 0;border:0}td:first-child{font-family:monospace;color:var(--muted)}.stats strong{font-size:26px}.links{gap:12px}}</style></head><body><main>
<div class="eyebrow">Synapse · Local guided rehearsal</div><h1>Real requests.<br>Inspectable results.</h1><p>This run planned ${receipt.plannedCases} functional checks against a fresh business application owned by this project; the server received ${receipt.reachedCases} requests. The actual responses were retained and re-evaluated from the saved artifacts offline.</p>
<div class="notice"><strong>${escape(receipt.status==='checks-passed'?'The six planned checks passed.':'This rehearsal needs attention.')}</strong> This demonstrates the local execution → evidence → artifact-inspection path. It does not demonstrate autonomous discovery, a blind assessment or that an application is secure.</div>
<div class="stats"><div><strong>${receipt.counts.passed}</strong>Passed checks</div><div><strong>${receipt.counts.failed+receipt.counts.incomplete}</strong>Failed or incomplete</div><div><strong>${receipt.appClosed?'Closed':'Not confirmed'}</strong>Owned test instance</div></div>
<h2>What actually ran</h2><table><thead><tr><th>Case</th><th>Identity</th><th>Expected behavior</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table>
<h2>How to read this</h2><ol><li><strong>Identity:</strong> each observation is bound to its synthetic principal, tenant, session and environment.</li><li><strong>Evidence:</strong> the actual HTTP response is in the saved local evidence file, not an agent’s description.</li><li><strong>Re-evaluation:</strong> the offline inspector recalculates the assertions and checks the saved results against the retained artifact bytes.</li><li><strong>Limits:</strong> hashes and matching labels establish consistency, not trusted origin or independent security judgment. No reviewer or repair result has been fabricated.</li></ol>
<h2>Open the actual artifacts</h2><div class="links"><a href="receipt.json">Execution receipt</a><a href="assessment/evidence.json">Recorded evidence</a><a href="assessment/results.json">Case results</a><a href="inspection/inspection.json">Offline inspection</a><a href="assessment/engagement.json">Scope and planned checks</a></div>
<h2>What you can do next</h2><p>Use the practice workspace to switch between fictional organizations and follow the legitimate draft → submitted → approved workflow. These checks cover the listed GET behavior only; they do not assess the other workflows or prove security.</p>
<ul>${receipt.limitations.map(v=>`<li>${escape(v)}</li>`).join('')}</ul><div class="footer">Run <code>${escape(receipt.id)}</code> · ${escape(receipt.completedAt)} · ${receipt.elapsedMs} ms · no paid APIs or external target requests</div></main></body></html>`;
}

export async function runPracticeRehearsal({outDir}={}) {
  if(typeof outDir!=='string'||!outDir)throw new Error('A new output directory is required');
  const root=await outputDirectory(outDir);await mkdir(root,{recursive:false});
  const id=`practice-${randomUUID()}`,started=performance.now();let app,result,inspection,requestLog,closed=false;
  const runDir=join(root,'assessment'),inspectionDir=join(root,'inspection');
  try{
    app=await startPracticeApp({port:0});
    if(!app.identities?.alice||!app.identities?.bob||typeof app.isListening!=='function'||!Array.isArray(app.requestLog))throw new Error('Practice app does not provide required observation/cleanup contract');
    const engagement=plan(app,id);
    result=await runAssessment(engagement,runDir,{env:{PRACTICE_ALICE_HEADER:`Bearer ${app.tokens.alice}`,PRACTICE_BOB_HEADER:`Bearer ${app.tokens.bob}`}});
    inspection=await inspectAssessmentDirectory(runDir);
    requestLog=structuredClone(app.requestLog);
  }finally{
    if(app){await app.close();closed=!app.isListening();if(!closed)throw new Error('Owned practice server did not close');}
  }
  const completedAt=new Date().toISOString();
  const receipt={schemaVersion:1,kind:'nbret-guided-rehearsal',id,mode:'guided',status:result.results.counts.passed===6&&!result.results.counts.failed&&!result.results.counts.incomplete?'checks-passed':'needs-attention',
    completedAt,elapsedMs:Math.round(performance.now()-started),fixtureUrl:app.url,appClosed:closed,
    counts:result.results.counts,plannedCases:result.results.tests.length,reachedCases:requestLog.length,requestLog,
    offlineInspection:{status:inspection.status,evidenceDigest:inspection.evidenceDigest,sourceFiles:inspection.sourceFiles},
    limitations:['Predefined guided functional rehearsal; no autonomous investigator or hidden answer key.',
      'No vulnerabilities were deliberately planted or discovered by this rehearsal.',
      'No independent finding review, repair retest, detection-rate or expert-baseline claim.',
      'The practice workspace is synthetic and not a faithful client replica. Production testing remains separate.']};
  await mkdir(inspectionDir,{recursive:false});
  await writeFile(join(inspectionDir,'inspection.json'),JSON.stringify(inspection,null,2)+'\n',{flag:'wx'});
  await writeFile(join(root,'receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  const htmlPath=join(root,'REPORT.html');await writeFile(htmlPath,renderRehearsal(receipt,result.results),{flag:'wx'});
  const evidenceBytes=await readFile(join(runDir,'evidence.json'));
  if(createHash('sha256').update(evidenceBytes).digest('hex')!==inspection.sourceFiles['evidence.json'].sha256)throw new Error('Evidence changed during report packaging');
  return{outDir:resolve(root),runDir,inspectionDir,receipt,htmlPath};
}
