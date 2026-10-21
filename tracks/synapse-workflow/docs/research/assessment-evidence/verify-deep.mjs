import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const dir=path.resolve('docs/research/assessment-evidence');
const read=p=>JSON.parse(fs.readFileSync(path.join(dir,p),'utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const provenance=read('deep-provenance.json'),roots=Object.fromEntries(provenance.repositories.map(r=>[r.project,r.root]));
const checks=[];
for(const repo of provenance.repositories){
 assert.equal(execFileSync('git',['-C',repo.root,'rev-parse','HEAD'],{windowsHide:true,encoding:'utf8'}).trim(),repo.commit);
 for(const f of repo.licenseFiles)assert.equal(hash(path.join(repo.root,f.path)),f.sha256);
}
checks.push('pinned checkout commits and cataloged license-file hashes');
const q=read('deep-reading-queue.json');
for(const f of q.files){
 assert.equal(hash(path.join(roots[f.project],f.path)),f.sha256,`${f.project}/${f.path}`);
 if(f.status==='complete'||f.status==='complete-inherited'){
  const ranges=[...f.ranges,...(f.inherited?.ranges||[])];
  for(let n=1;n<=f.lines;n++)assert(ranges.some(([a,b])=>a<=n&&n<=b),`missing emitted range ${f.path}:${n}`);
 }
 for(const r of f.runtimeEvidence||[])assert(fs.existsSync(path.join(dir,r.receipt)),r.receipt);
}
checks.push('all inventoried source hashes, complete-read range unions and runtime receipt links');
for(const [receipt,script,project] of [
 ['deep-agent-receipt.json','deep-agent-lab.py','pentestgpt'],['deep-garak-receipt.json','deep-garak-lab.py','garak'],
 ['deep-atomic-receipt.json','deep-atomic-lab.ps1','invokeatomic'],['deep-agentdojo-receipt.json','deep-agentdojo-lab.py','agentdojo'],
 ['deep-agentdojo-banking-receipt.json','deep-agentdojo-banking-lab.py','agentdojo'],['deep-monitor-receipt-r2.json','deep-monitor-lab.py','unified']]){
 const r=read(receipt);assert.equal(hash(path.join(dir,script)),r.scriptSha256.toLowerCase(),script);
 for(const [p,expected] of Object.entries(r.sources)){
  const full=path.isAbsolute(p)?p:path.join(roots[project],p);
  assert.equal(hash(full),expected.toLowerCase(),p);
 }
}
checks.push('six retained successful fixture/source hash sets');
for(const file of ['deep-openfga-receipt-1792267494021.json','deep-openfga-receipt-1792267693085.json','deep-openfga-receipt-1792268648173.json','deep-openfga-receipt-1792268820277.json']){
 const r=read(file);assert.equal(r.code,0);
 if(r.fixtureSha256)assert.equal(hash(r.fixturePath||path.join(dir,'deep-openfga-lab_test.go')),r.fixtureSha256);
 for(const [p,v] of Object.entries(r.sourceSha256))assert.equal(hash(path.join(roots.openfga,p)),v,p);
 for(const [file,key] of [['stdout.jsonl','stdoutSha256'],['stderr.txt','stderrSha256']])assert.equal(hash(path.join(r.out,file)),r[key]);
 assert(r.tests.some(t=>t.Action==='pass'));
}
checks.push('successful Go source/overlay-fixture/log hashes and zero exit statuses');
assert.equal(read('deep-upstream-tests.json').exitCode,0);
assert.equal(read('deep-agent-receipt.json').independentTargetEffect,false);
assert.equal(read('deep-agentdojo-banking-receipt.json').wrongRecipientIndependentOraclePass,false);
assert.equal(read('deep-monitor-receipt-r2.json').windowsOwnerCheck.terminatedWithinTwoSeconds,false);
checks.push('positive/negative evidence boundaries remain represented');
const result={at:new Date().toISOString(),command:'node docs/research/assessment-evidence/verify-deep.mjs',node:process.version,exitCode:0,checks,
 limitations:['Provenance consistency only; does not rerun experiments or prove prose/security conclusions','Failed historical scripts may differ from current corrected fixture; failure logs are retained, not counted as passes','Dependency module downloads and full SDK/locked environments are not independently audited','No universal coverage or customer-environment claim']};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result,null,2));
