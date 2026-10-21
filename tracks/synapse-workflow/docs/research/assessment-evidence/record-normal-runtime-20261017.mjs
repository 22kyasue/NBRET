import fs from 'node:fs';
const own='docs/research/assessment-evidence/';
const sdkPath=own+'sdk-reading-queue.json';
const sdk=JSON.parse(fs.readFileSync(sdkPath));
for(const file of sdk.mcp.files){
 if(['shared/_context_streams.py','shared/_stream_protocols.py','shared/dispatcher.py'].includes(file.path)){
  file.runtimeEvidence=[...(file.runtimeEvidence||[]),{receipt:'mcp-context-contract-receipt-1792277240420.json',scope:'Three normal string-context, stream-close and request-ID helper checks only; no dispatcher integration or isolation proof.'}];
  file.runtime='selected normal component behavior executed; remaining behavior source-only';
 }
}
fs.writeFileSync(sdkPath,JSON.stringify(sdk,null,2)+'\n');
const qPath=own+'deep-reading-queue.json';
const q=JSON.parse(fs.readFileSync(qPath));
for(const file of q.files){
 if(file.project==='openfga'&&(file.path.startsWith('internal/iterator/')||['internal/graph/weight_two_resolver.go','internal/graph/weight_two_resolver_test.go','internal/graph/object_providers.go','internal/graph/object_providers_test.go'].includes(file.path))){
  const receipt=file.path.startsWith('internal/iterator/')?'openfga-iterator-suite-receipt-1792276577003.json':'openfga-fastpath-suite-receipt-1792276901091.json';
  file.runtimeEvidence=[...(file.runtimeEvidence||[]),{receipt,scope:'Selected unchanged upstream tests only; passing package selection is not universal branch or customer-environment coverage.'}];
  file.runtime='selected unchanged upstream tests executed; scope in receipt';
 }
}
fs.writeFileSync(qPath,JSON.stringify(q,null,2)+'\n');
