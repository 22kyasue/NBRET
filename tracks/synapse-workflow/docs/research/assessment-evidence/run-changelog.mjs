import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-openfga-lab.mjs',import.meta.url),'utf8');
code=code.replace('deep-openfga-condition-lab_test.go','deep-openfga-changelog-lab_test.go')
.replace('internal/condition/research_evidence_test.go','pkg/storage/sqlite/research_evidence_changelog_test.go')
.replace("condition?'./internal/condition'","condition?'./pkg/storage/sqlite'")
.replace("'internal/condition/condition.go','internal/condition/errors.go'","'pkg/storage/sqlite/sqlite.go','pkg/storage/sqlite/tuple_iterator.go','pkg/storage/sqlcommon/sqlcommon.go'")
.replace('actual condition compiler/evaluator; synthetic invalid/valid expressions; locally caught panic; no server/model persistence','actual SQLite adapter ReadChanges with inert synthetic database/sql driver; no SQLite engine, network or server')
.replace('researcher-authored invalid/valid condition fixture; production component unchanged','researcher-authored synthetic driver with query/terminal-error controls; production adapter unchanged')
.replace("'run-openfga-lab.mjs'","'run-changelog-generated.mjs'");
fs.writeFileSync(new URL('./run-changelog-generated.mjs',import.meta.url),code);
process.argv[2]='condition';
await import('./run-changelog-generated.mjs');
