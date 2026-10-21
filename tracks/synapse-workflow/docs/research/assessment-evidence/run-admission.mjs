import fs from 'node:fs';
const original=fs.readFileSync(new URL('./run-openfga-lab.mjs',import.meta.url),'utf8');
let code=original.replace("const state=", "const admission=process.argv[2]==='admission'; const state=")
.replace("condition?'deep-openfga-condition-lab_test.go'", "admission?'deep-openfga-admission-lab_test.go':condition?'deep-openfga-condition-lab_test.go'")
.replace("condition?'internal/condition/research_evidence_test.go'", "admission?'pkg/server/commands/research_evidence_admission_test.go':condition?'internal/condition/research_evidence_test.go'")
.replace("condition?'./internal/condition'", "admission?'./pkg/server/commands':condition?'./internal/condition'")
.replace('(state||condition)?','(admission||state||condition)?')
.replace('const sources=condition?', "const sources=admission?['go.mod','go.sum','pkg/server/commands/write_authzmodel.go','pkg/typesystem/typesystem.go','pkg/typesystem/resolver.go','pkg/storage/memory/memory.go']:condition?")
.replace('scope:condition?', "scope:admission?'ordinary model command rejection, persistence absence and valid model resolver reuse; synthetic in-memory store, no server':condition?")
.replace("runnerSha256:hash(path.join(own,'run-openfga-lab.mjs'))", "runnerSha256:hash(path.join(own,'run-admission-generated.mjs'))");
fs.writeFileSync(new URL('./run-admission-generated.mjs',import.meta.url),code);
process.argv[2]='admission';
await import('./run-admission-generated.mjs');
