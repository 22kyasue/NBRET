import fs from 'node:fs';
import path from 'node:path';
let code=fs.readFileSync(new URL('./run-monitor-web-tests-generated.mjs',import.meta.url),'utf8');
code=code.replace("'tests/test_monitor_web.py'",JSON.stringify(path.resolve('docs/research/assessment-evidence/test_monitor_evidence_contract.py')))
.replace('unchanged monitor web tests pass using ASGITransport and owned synthetic SQLite; no listener or provider','synthetic prompt/metadata/output survive SQLite-to-ASGI serving; no auth headers supplied; cache/security headers and read-only POST verified')
.replace('actual in-process ASGI snapshots, finite SSE stream, validation and asset delivery; no browser runtime, socket listener, SDK or target command','actual in-process monitor API with synthetic sentinel strings only; no socket or real credential; does not establish external access')
.replace("'run-monitor-web-tests-generated.mjs'","'run-monitor-contract-generated.mjs'");
// Preserve the fixture hash separately from unchanged source hashes.
code=code.replace('runnerSha256:hash(',"fixtureSha256:hash("+JSON.stringify(path.resolve('docs/research/assessment-evidence/test_monitor_evidence_contract.py'))+"),runnerSha256:hash(");
fs.writeFileSync(new URL('./run-monitor-contract-generated.mjs',import.meta.url),code);
await import('./run-monitor-contract-generated.mjs');
