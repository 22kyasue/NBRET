// Local provenance only. Does not fetch, mutate source checkouts, or run labs.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const dir=path.resolve('docs/research/assessment-evidence');
const roots={pentestgpt:'C:/Users/kotar/.codex/research/pentestgpt-20261017',unified:'C:/Users/kotar/.codex/research/unified-agent-acff8ee',garak:'C:/Users/kotar/.codex/research/garak',invokeatomic:'C:/Users/kotar/.codex/research/invoke-atomic-20261017',agentdojo:'C:/Users/kotar/.codex/research/agentdojo-20261017',openfga:'C:/Users/kotar/.codex/research/openfga-20261017'};
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const git=(root,args)=>execFileSync('git',['-C',root,...args],{windowsHide:true,encoding:'utf8',maxBuffer:16*1024*1024}).trim();
const provenance={at:new Date().toISOString(),repositories:Object.entries(roots).map(([project,root])=>{const files=git(root,['ls-files',...(project==='agentdojo'?['--','LICENSE','pyproject.toml']:[])]).split('\n');return {project,root,commit:git(root,['rev-parse','HEAD']),origin:git(root,['remote','get-url','origin']),licenseFiles:files.filter(p=>/(^|\/)(LICENSE|COPYING)(\.|$)/i.test(p)).map(p=>({path:p,sha256:hash(path.join(root,p))})),licenseBoundary:project==='unified'?'No tracked LICENSE found; unresolved reuse terms':'Root and component license claims require corresponding source attribution; this list is byte provenance, not a license clearance'};})};
const py='C:/Users/kotar/.codex/research/assessment-evidence-receipts/python-posixmodule-v3.14.7.c';
provenance.partialDependency={url:'https://raw.githubusercontent.com/python/cpython/v3.14.7/Modules/posixmodule.c',localPath:py,sha256:hash(py),readRanges:[[9702,9750]],status:'partial function read; not a repository audit'};
fs.writeFileSync(path.join(dir,'deep-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
const q=JSON.parse(fs.readFileSync(path.join(dir,'deep-reading-queue.json')));
for(const f of q.files){
 if(f.lines===0){f.status='complete-empty';f.emptyBoundary='Tracked file has zero source lines; no substantive code read implied';}
 const evidence=[];
 if(f.project==='pentestgpt'&&/\/(memory|plan|execution|audit)\.py$/.test(f.path))evidence.push({receipt:'deep-agent-receipt.json',kind:'actual selected functions; synthetic state/events; not a whole-module branch test'});
 if(f.project==='pentestgpt'&&/(test_memory|memory)\.py$/.test(f.path))evidence.push({receipt:'deep-upstream-tests.json',kind:'eight upstream tests, local imports; no provider'});
 if(f.project==='unified'&&/backends\/codex.py$/.test(f.path))evidence.push({receipt:'deep-agent-receipt.json',kind:'AST-extracted option/normalization helpers only; no SDK'});
 if(f.project==='unified'&&/monitor(ing|_web).py$/.test(f.path))evidence.push({receipt:'deep-monitor-receipt-r2.json',kind:f.path.includes('monitor_web')?'AST-selected helpers only; no web service':'Actual in-memory SQLite recorder; synthetic events'});
 if(f.project==='garak'&&(/detectors\/promptinject.py$/.test(f.path)||/evaluators\/base.py$/.test(f.path)))evidence.push({receipt:'deep-garak-receipt.json',kind:'AST-extracted selected production methods; synthetic attempts/logs'});
 if(f.project==='invokeatomic'&&/Invoke-AtomicTest.ps1$/.test(f.path))evidence.push({receipt:'deep-atomic-receipt.json',kind:'Actual orchestration function; parser/target/dispatcher mocked; no payload'});
 if(f.project==='agentdojo'&&/(functions_runtime|benchmark|task_suite\/task_suite|counter\/user_tasks).py$/.test(f.path))evidence.push({receipt:'deep-agentdojo-receipt.json',kind:f.path.includes('functions_runtime')?'Actual runtime module, synthetic callables':'AST-extracted selected functions; no full pipeline/model'});
 if(f.project==='agentdojo'&&/(v1_2_2\/banking\/user_tasks|v1\/tools\/banking_client).py$/.test(f.path))evidence.push({receipt:'deep-agentdojo-banking-receipt.json',kind:'AST-selected current task methods and actual banking definitions; annotation stub; synthetic states'});
 if(f.project==='openfga'&&/(cached_resolver|resolve_check_request|resolve_check_response).go$/.test(f.path))evidence.push({receipt:'deep-openfga-receipt-1792267494021.json',kind:'Actual resolver/request/response with synthetic map cache/delegate'});
 if(f.project==='openfga'&&f.path.startsWith('internal/check/'))evidence.push({receipt:'deep-openfga-receipt-1792267693085.json',kind:'Package compiled; only TTU-collision upstream regression executed. Per-file branch execution not instrumented; do not infer all strategies ran.'});
 if(f.project==='openfga'&&(/^(internal\/check\/|pkg\/storage\/memory\/memory.go$|internal\/modelgraph\/model.go$|internal\/iterator\/filter.go$)/.test(f.path)))evidence.push({receipt:'deep-openfga-receipt-1792268648173.json',kind:'Synthetic actual grant/revoke, internal descriptor deletion and filter policy tests. Per-file branch execution not instrumented; not a full API/application test.'});
 if(f.project==='openfga'&&/^internal\/condition\/(condition|errors).go$/.test(f.path))evidence.push({receipt:'deep-openfga-receipt-1792268820277.json',kind:'Actual selected Compile/Evaluate calls; invalid/valid synthetic expressions; panic caught inside test; no server impact claim.'});
 f.runtimeEvidence=evidence;
 f.runtime=evidence.length?'See scoped runtimeEvidence; source-reading status is independent':'Not executed in this track (compilation/import alone is not branch validation)';
}
q.updated=new Date().toISOString();
fs.writeFileSync(path.join(dir,'deep-reading-queue.json'),JSON.stringify(q,null,2)+'\n');
console.log(JSON.stringify({provenance:'deep-provenance.json',queue:'deep-reading-queue.json',projects:Object.keys(roots)}));
