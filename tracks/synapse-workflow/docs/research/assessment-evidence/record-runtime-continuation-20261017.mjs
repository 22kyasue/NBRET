import fs from 'node:fs';
const own='docs/research/assessment-evidence/';
const file=own+'deep-reading-queue.json';
const queue=JSON.parse(fs.readFileSync(file));
const selected=[
 ['invokeatomic','Public/New-Atomic.ps1','atomic-authoring-contract-receipt-1792275640934.json','Actual authoring declarations only; no executor/config/module initialization.'],
 ['invokeatomic','Public/Invoke-KickoffAtomicRunner.ps1','atomic-authoring-contract-receipt-1792275640934.json','Extracted date predicate only; no rotation/deletion/runner execution.'],
 ['garak','garak/analyze/report_digest.py','garak-digest-contract-v2-receipt-1792275872140.json','Actual selected complete function ASTs, synthetic metadata and SQLite memory; not full module/render.'],
 ['garak','garak/analyze/report_digest.py','garak-artifact-boundary-receipt-1792275942824.json','Actual build_html function AST with inert synthetic template; no browser/JS.'],
 ['garak','garak/command.py','garak-artifact-boundary-receipt-1792275942824.json','Actual start_run function AST with synthetic config and owned report; no native run.'],
 ['garak','garak/_config.py','garak-config-retry-receipt-1792276012101.json','Actual loader/helper ASTs and owned JSON; migration stub/no module import.'],
 ['agentdojo','src/agentdojo/default_suites/v1_2/banking/injection_tasks.py','agentdojo-disclosure-oracle-v2-receipt-1792276238068.json','Actual selected complete helper/security method ASTs and synthetic namespaces; no agent/transfer.'],
 ['agentdojo','src/agentdojo/default_suites/v1_2_1/workspace/injection_tasks.py','agentdojo-deleted-files-oracle-receipt-1792276318679.json','Actual Task11 security method AST with synthetic dictionaries; no file/mail deletion.'],
];
for(const [project,path,receipt,scope] of selected){
 if(!fs.existsSync(own+receipt))throw Error('Missing receipt '+receipt);
 const f=queue.files.find(f=>f.project===project&&f.path===path);if(!f)throw Error('Missing queue entry');
 f.runtimeEvidence??=[];
 if(!f.runtimeEvidence.some(r=>r.receipt===receipt))f.runtimeEvidence.push({receipt,scope});
}
queue.updated=new Date().toISOString();
fs.writeFileSync(file,JSON.stringify(queue,null,2)+'\n');
console.log(JSON.stringify({recorded:selected.length,meaning:'Scoped runtime evidence, no full-file behavior or coverage credit'}));
