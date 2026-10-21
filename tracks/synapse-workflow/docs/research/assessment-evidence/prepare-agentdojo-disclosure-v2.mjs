import fs from 'node:fs';
const p='docs/research/assessment-evidence/';
let s=fs.readFileSync(p+'test_agentdojo_disclosure_oracle.py','utf8')
 .replace('compile(ast.Module(body=[future, node], type_ignores=[]),','compile(ast.fix_missing_locations(ast.Module(body=[future, node], type_ignores=[])),');
fs.writeFileSync(p+'test_agentdojo_disclosure_oracle_v2.py',s,{flag:'wx'});
let r=fs.readFileSync(p+'run-agentdojo-disclosure-oracle-generated.mjs','utf8')
 .replaceAll('agentdojo-disclosure-oracle','agentdojo-disclosure-oracle-v2')
 .replace('test_agentdojo_disclosure_oracle.py','test_agentdojo_disclosure_oracle_v2.py');
fs.writeFileSync(p+'run-agentdojo-disclosure-oracle-v2.mjs',r,{flag:'wx'});
console.log(fs.readdirSync(p).filter(n=>n.startsWith('agentdojo-disclosure-oracle-receipt-')));
