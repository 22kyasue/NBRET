import fs from 'node:fs';
import path from 'node:path';
let code=fs.readFileSync(new URL('./run-wrapper-offline-tests-generated.mjs',import.meta.url),'utf8');
const fixture=path.resolve('docs/research/assessment-evidence/test_wrapper_preparation_contract.py');
code=code.replace("'tests/test_codex_backend.py','tests/test_agent.py','tests/test_task.py','tests/test_tools.py'",JSON.stringify(fixture)+",'-s'")
.replace('unchanged selected offline wrapper tests pass; synthetic notifications/backends, local context files and tool metadata only','default symlink mode returns Windows1314 before backend; explicit copy mode reaches inert backend; fresh owned temporary trees only')
.replace('actual wrapper normalization/configuration/collection/task/registry methods; source-path Codex SDK model imports; no client start, CLI, MCP subprocess or provider','actual wrapper preparation failure/result capture and explicit copy control; no provider, tool subprocess or existing workspace')
.replace("'run-wrapper-offline-tests-generated.mjs'","'run-wrapper-preparation-generated.mjs'")
.replace('runnerSha256:hash(',"fixtureSha256:hash("+JSON.stringify(fixture)+"),runnerSha256:hash(");
fs.writeFileSync(new URL('./run-wrapper-preparation-generated.mjs',import.meta.url),code);
await import('./run-wrapper-preparation-generated.mjs');
