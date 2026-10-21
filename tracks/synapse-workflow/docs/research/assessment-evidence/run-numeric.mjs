import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-admission-generated.mjs',import.meta.url),'utf8');
code=code.replace('deep-openfga-admission-lab_test.go','deep-openfga-numeric-lab_test.go')
.replace('pkg/server/commands/research_evidence_admission_test.go','internal/condition/types/research_evidence_numeric_test.go')
.replace("admission?'./pkg/server/commands'","admission?'./internal/condition/types'")
.replace("'pkg/server/commands/write_authzmodel.go','pkg/typesystem/typesystem.go','pkg/typesystem/resolver.go','pkg/storage/memory/memory.go'","'internal/condition/types/types.go','internal/condition/types/converters.go','internal/condition/types/primitives.go'")
.replace('ordinary model command rejection, persistence absence and valid model resolver reuse; synthetic in-memory store, no server','ordinary numeric conversion representation controls and boundary values; no authorization model/server/target')
.replace("'run-admission-generated.mjs'","'run-numeric-generated.mjs'");
fs.writeFileSync(new URL('./run-numeric-generated.mjs',import.meta.url),code);
process.argv[2]='admission';
await import('./run-numeric-generated.mjs');
