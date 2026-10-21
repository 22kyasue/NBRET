import fs from 'node:fs';
const p='docs/research/assessment-evidence/';
let s=fs.readFileSync(p+'test_garak_digest_contract.py','utf8')
 .replace('import sqlite3','import sqlite3\nimport re')
 .replace('wanted = {',"wanted = {'_resolve_plugin_info', ")
 .replace("'IO': IO}","'IO': IO, 're': re}");
fs.writeFileSync(p+'test_garak_digest_contract_v2.py',s,{flag:'wx'});
let r=fs.readFileSync(p+'run-garak-digest-contract-generated.mjs','utf8')
 .replaceAll('garak-digest-contract','garak-digest-contract-v2')
 .replace('test_garak_digest_contract.py','test_garak_digest_contract_v2.py');
fs.writeFileSync(p+'run-garak-digest-contract-v2.mjs',r,{flag:'wx'});
console.log(fs.readdirSync(p).filter(n=>n.startsWith('garak-digest-contract-receipt-')));
