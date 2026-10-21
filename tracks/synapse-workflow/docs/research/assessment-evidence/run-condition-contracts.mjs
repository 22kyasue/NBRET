import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-openfga-lab.mjs',import.meta.url),'utf8');
code=code.replace('deep-openfga-condition-lab_test.go','deep-openfga-condition-contracts-lab_test.go')
.replace('actual condition compiler/evaluator; synthetic invalid/valid expressions; locally caught panic; no server/model persistence','ordinary three-element condition cost/cancellation/reuse and protobuf uint conversion; no server/model persistence')
.replace('researcher-authored invalid/valid condition fixture; production component unchanged','researcher-authored cost/cancellation and protobuf conversion fixtures; production unchanged')
.replace("'run-openfga-lab.mjs'","'run-condition-contracts-generated.mjs'");
fs.writeFileSync(new URL('./run-condition-contracts-generated.mjs',import.meta.url),code);
process.argv[2]='condition';
await import('./run-condition-contracts-generated.mjs');
