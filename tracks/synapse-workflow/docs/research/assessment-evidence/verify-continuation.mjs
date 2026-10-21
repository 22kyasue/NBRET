import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const own=path.resolve('docs/research/assessment-evidence');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(path.join(own,p)));
const dependencies=read('dependency-reading-queue.json');
const sdk=read('sdk-reading-queue.json');
for(const dependency of Object.values(sdk))for(const file of dependency.files){
 assert.equal(hash(path.join(dependency.root,file.path)),file.sha256);
 if(file.status==='complete')for(let n=1;n<=file.lines;n++)assert(file.ranges.some(([a,b])=>a<=n&&n<=b),`${file.path}:${n}`);
}
for(const dependency of Object.values(dependencies)){
 for(const file of dependency.files){
  assert.equal(hash(path.join(dependency.root,file.path)),file.sha256);
  if(file.status==='complete')for(let n=1;n<=file.lines;n++)assert(file.ranges.some(([a,b])=>a<=n&&n<=b),`${file.path}:${n}`);
 }
}
const openfga='C:/Users/kotar/.codex/research/openfga-20261017';
for(const name of ['deep-openfga-receipt-1792271857692.json','deep-openfga-receipt-1792272163633.json','deep-openfga-receipt-1792272456589.json','deep-openfga-receipt-1792272946118.json']){
 const r=read(name);assert.equal(r.code,0);assert.equal(hash(r.fixturePath),r.fixtureSha256);
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(path.join(openfga,p)),h);
 assert.equal(hash(path.join(r.out,'stdout.jsonl')),r.stdoutSha256);assert.equal(hash(path.join(r.out,'stderr.txt')),r.stderrSha256);
}
const graph=read('graph-contracts-receipt-1792272075689.json');assert.equal(graph.exitCode,0);
for(const [p,h]of Object.entries(graph.sourceSha256))assert.equal(hash(path.join(dependencies.language.root,p)),h);
for(const [p,h]of Object.entries(graph.conditionSourceSha256))assert.equal(hash(path.join(openfga,'internal/condition/types',p)),h);
assert.equal(hash(path.join(graph.out,'stdout.jsonl')),graph.stdoutSha256);assert.equal(hash(path.join(graph.out,'stderr.txt')),graph.stderrSha256);
const pg='C:/Users/kotar/.codex/research/pentestgpt-20261017/pentestgpt_agent';
for(const name of fs.readdirSync(own).filter(n=>/^agent-recovery-receipt-\d+\.json$/.test(n))){
 const r=read(name);assert.equal(r.exitCode,0);
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(path.join(pg,p)),h);
 assert.equal(hash(path.join(r.out,'stdout.txt')),r.stdoutSha256);assert.equal(hash(path.join(r.out,'stderr.txt')),r.stderrSha256);
 const runners=fs.readdirSync(own).filter(n=>/^run-agent-.*\.mjs$/.test(n));
 assert(runners.some(n=>hash(path.join(own,n))===r.runnerSha256),`missing original runner ${name}`);
}
const wrapper='C:/Users/kotar/.codex/research/unified-agent-acff8ee';
for(const name of ['wrapper-offline-receipt-1792273993340.json','wrapper-offline-receipt-1792274029180.json','wrapper-offline-receipt-1792274216122.json']){
 const r=read(name);assert.equal(r.exitCode,name.includes('3993340')?1:0);
 if(r.exitCode===1)assert(r.stdout.includes('1 failed, 54 passed'));
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(path.join(wrapper,p)),h);
 assert.equal(hash(path.join(r.out,'stdout.txt')),r.stdoutSha256);assert.equal(hash(path.join(r.out,'stderr.txt')),r.stderrSha256);
 assert(fs.readdirSync(own).filter(n=>/^run-(wrapper|claude)-.*\.mjs$/.test(n)).some(n=>hash(path.join(own,n))===r.runnerSha256));
 if(r.fixtureSha256)assert.equal(hash(path.join(own,'test_wrapper_preparation_contract.py')),r.fixtureSha256);
}
const router=read('sdk-router-receipt-1792273867807.json');assert.equal(router.exitCode,0);
for(const [p,h]of Object.entries(router.sourceSha256))assert.equal(hash(path.join(sdk.codex.root,p)),h);
assert.equal(hash(path.join(own,'test_sdk_router_contract.py')),router.fixtureSha256);
assert.equal(hash(path.join(own,'run-sdk-router-lab.mjs')),router.runnerSha256);
const ce=read('claude-evidence-receipt-1792274255291.json');assert.equal(ce.exitCode,0);
for(const [p,h]of Object.entries(ce.sourceSha256))assert.equal(hash(path.join(sdk.claude.root,p)),h);
assert.equal(hash(path.join(wrapper,'unified_agent/backends/claude_code.py')),ce.wrapperSha256);
assert.equal(hash(path.join(own,'test_claude_evidence_contract.py')),ce.fixtureSha256);
assert.equal(hash(path.join(own,'run-claude-evidence-lab.mjs')),ce.runnerSha256);
for(const name of fs.readdirSync(own).filter(n=>/^monitor-web-receipt-\d+\.json$/.test(n))){
 const r=read(name);assert.equal(r.exitCode,name==='monitor-web-receipt-1792273621508.json'?1:0);
 if(r.exitCode===1){assert(r.stdout.includes('1 failed, 9 passed'));assert(r.stdout.includes('assert 438 == 384'));}
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(path.join(wrapper,p)),h);
 assert.equal(hash(path.join(r.out,'stdout.txt')),r.stdoutSha256);assert.equal(hash(path.join(r.out,'stderr.txt')),r.stderrSha256);
 assert(fs.readdirSync(own).filter(n=>/^run-monitor-.*\.mjs$/.test(n)).some(n=>hash(path.join(own,n))===r.runnerSha256));
 if(r.fixtureSha256)assert.equal(hash(path.join(own,'test_monitor_evidence_contract.py')),r.fixtureSha256);
}
const result={at:new Date().toISOString(),exitCode:0,checks:['exact dependency file hashes and complete range unions','four distinct ordinary component fixture receipts and source/log hashes','selected upstream graph/conversion source/log hashes','PentestGPT scripted test receipt source/log and preserved runner hashes'],limitations:['provenance consistency, not experiment rerun or proof of security conclusions','mistaken redundant cache run excluded from new evidence','remaining source/runtime queue is not complete']};
for(const name of fs.readdirSync(own).filter(n=>/^claude-(cleanup|mirror|query)-receipt-\d+\.json$/.test(n))){
 const r=read(name);assert.equal(r.exitCode,name.startsWith('claude-query')?1:0);
 if(name.includes('4326833'))assert((r.stdout+r.stderr).includes('already registered'));
 if(name.includes('4345579'))assert(r.stdout.includes('4 failed, 22 passed, 7 deselected'));
 if(typeof r.sourceSha256==='string')assert.equal(hash(path.join(sdk.claude.root,'src/claude_agent_sdk/client.py')),r.sourceSha256);
 else for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(path.join(sdk.claude.root,p)),h);
 assert.equal(hash(r.command.find(p=>p.endsWith('.py'))),r.fixtureSha256);
 assert(fs.readdirSync(own).filter(n=>/^run-claude-.*\.mjs$/.test(n)).some(n=>hash(path.join(own,n))===r.runnerSha256));
}
const mcp=read('mcp-installed-provenance.json');
const mcpTypes=read('mcp-types-installed-provenance.json');
for(const [p,r] of Object.entries(mcpTypes.files))assert.equal(hash(path.join(mcpTypes.base,p)),r.sha256);
for(const prefix of ['claude-contract-suite','s3-reference-evidence'])for(const name of fs.readdirSync(own).filter(n=>n.startsWith(prefix+'-receipt-')&&n.endsWith('.json'))){
 const r=read(name);assert.equal(r.exitCode,0);
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(path.join(sdk.claude.root,p)),h);
 assert.equal(hash(r.command.find(p=>p.endsWith('.py'))),r.fixtureSha256);
 assert(fs.readdirSync(own).filter(n=>/^run-.*\.mjs$/.test(n)).some(n=>hash(path.join(own,n))===r.runnerSha256));
}
for(const name of fs.readdirSync(own).filter(n=>/^session-import-failure-receipt-\d+\.json$/.test(n))){
 const r=read(name);assert.equal(r.exitCode,name.includes('4765310')?1:0);
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(path.join(sdk.claude.root,p)),h);
 assert.equal(hash(r.command.find(p=>p.endsWith('.py'))),r.fixtureSha256);
 assert(fs.readdirSync(own).filter(n=>/^run-session-import-.*\.mjs$/.test(n)).some(n=>hash(path.join(own,n))===r.runnerSha256));
}
for(const [p,r]of Object.entries(mcp.files))assert.equal(hash(path.join(mcp.root,p)),r.sha256);
for(const name of ['preview-grounding-receipt-1792275187905.json','garak-encoding-oracle-receipt-1792275333580.json']){
 const r=read(name);assert.equal(r.exitCode,0);
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(p),h);
 assert.equal(hash(r.command.find(p=>p.endsWith('.py'))),r.fixtureSha256);
 assert(r.stdout.includes('2 passed'));assert.equal(r.stderr,'');
 assert(fs.readdirSync(own).filter(n=>/^run-.*\.mjs$/.test(n)).some(n=>hash(path.join(own,n))===r.runnerSha256));
}
const authoring=read('atomic-authoring-contract-receipt-1792275640934.json');
assert.equal(authoring.status,0);assert.equal(JSON.parse(authoring.stdout).checks,4);
for(const [p,h]of Object.entries(authoring.sourceSha256))assert.equal(hash(p),h);
result.checks.push('preview normalization, encoding oracle and Atomic authoring synthetic receipt hashes');
for(const [name,expected] of [['garak-digest-contract-receipt-1792275853945.json',1],['garak-digest-contract-v2-receipt-1792275872140.json',0],['garak-artifact-boundary-receipt-1792275942824.json',0]]){
 const r=read(name);assert.equal(r.exitCode,expected);
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(p),h);
 assert.equal(hash(r.command.find(p=>p.endsWith('.py'))),r.fixtureSha256);
 assert(fs.readdirSync(own).filter(n=>/^run-.*\.mjs$/.test(n)).some(n=>hash(path.join(own,n))===r.runnerSha256));
 if(expected)assert(r.stdout.includes('3 failed'));
}
result.checks.push('garak digest component and synthetic artifact-boundary receipts, including retained fixture failure');
const configRetry=read('garak-config-retry-receipt-1792276012101.json');
assert.equal(configRetry.exitCode,0);assert(configRetry.stdout.includes('2 passed'));
for(const [p,h]of Object.entries(configRetry.sourceSha256))assert.equal(hash(p),h);
assert.equal(hash(configRetry.command.find(p=>p.endsWith('.py'))),configRetry.fixtureSha256);
assert.equal(hash(path.join(own,'run-garak-config-retry-generated.mjs')),configRetry.runnerSha256);
for(const [name,expected] of [['agentdojo-disclosure-oracle-receipt-1792276227157.json',1],['agentdojo-disclosure-oracle-v2-receipt-1792276238068.json',0]]){
 const r=read(name);assert.equal(r.exitCode,expected);
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(p),h);
 assert.equal(hash(r.command.find(p=>p.endsWith('.py'))),r.fixtureSha256);
 assert(fs.readdirSync(own).filter(n=>/^run-.*\.mjs$/.test(n)).some(n=>hash(path.join(own,n))===r.runnerSha256));
 assert(r.stdout.includes(expected?'3 failed':'3 passed'));
}
result.checks.push('garak retry-state and AgentDojo disclosure predicate receipts with failed fixtures preserved');
const deleted=read('agentdojo-deleted-files-oracle-receipt-1792276318679.json');
assert.equal(deleted.exitCode,0);assert(deleted.stdout.includes('3 passed'));
for(const [p,h]of Object.entries(deleted.sourceSha256))assert.equal(hash(p),h);
assert.equal(hash(deleted.command.find(p=>p.endsWith('.py'))),deleted.fixtureSha256);
assert.equal(hash(path.join(own,'run-agentdojo-deleted-files-oracle-generated.mjs')),deleted.runnerSha256);
const runtimeSuite=read('agentdojo-runtime-suite-receipt-1792276442613.json');
assert.equal(runtimeSuite.exitCode,0);assert(runtimeSuite.stdout.includes('15 passed'));
for(const [p,h]of Object.entries(runtimeSuite.sourceSha256))assert.equal(hash(p),h);
assert.equal(hash(runtimeSuite.command.find(p=>p.endsWith('.py'))),runtimeSuite.fixtureSha256);
assert.equal(hash(path.join(own,'run-agentdojo-runtime-suite-generated.mjs')),runtimeSuite.runnerSha256);
result.checks.push('AgentDojo selected unchanged runtime/parser suite and deletion-oracle receipt provenance');
for(const name of fs.readdirSync(own).filter(n=>/^openfga-(iterator|fastpath)-suite-receipt-\d+\.json$/.test(n))){
 const r=read(name);assert.equal(r.code,0);
 for(const [p,h]of Object.entries(r.sourceSha256))assert.equal(hash(path.join(openfga,p)),h);
 assert.equal(hash(path.join(r.out,'stdout.jsonl')),r.stdoutSha256);
 assert.equal(hash(path.join(r.out,'stderr.txt')),r.stderrSha256);
 assert(fs.readdirSync(own).filter(n=>/^run-openfga-.*\.mjs$/.test(n)).some(n=>hash(path.join(own,n))===r.runnerSha256));
 assert(r.tests.every(t=>t.Action!=='fail'));
}
result.checks.push('OpenFGA selected unchanged iterator/fast-path suite source, runner and log provenance');
const contextReceipt=read('mcp-context-contract-receipt-1792277240420.json');
assert.equal(contextReceipt.exitCode,0);assert(contextReceipt.stdout.includes('3 passed'));
for(const [p,h] of Object.entries(contextReceipt.sourceSha256))assert.equal(hash(path.join(sdk.mcp.root,p)),h);
assert.equal(hash(path.join(own,'test_mcp_context_contract.py')),contextReceipt.fixtureSha256);
assert.equal(hash(path.join(own,'run-mcp-context-contract.mjs')),contextReceipt.runnerSha256);
result.checks.push('benign MCP context and normal stream lifecycle fixture/source/runner receipt');
result.checks.push('SDK source fixtures and preserved runners, including expected query failures; installed MCP metadata hashes');
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(result,null,2));
