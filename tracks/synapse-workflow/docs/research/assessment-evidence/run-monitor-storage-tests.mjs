import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-monitor-web-tests-generated.mjs',import.meta.url),'utf8');
code=code.replaceAll("'tests/test_monitor_web.py'","'tests/test_monitoring.py'")
.replace('unchanged monitor web tests pass using ASGITransport and owned synthetic SQLite; no listener or provider','unchanged monitor storage tests pass, including platform-specific file mode assertion; synthetic backends and owned temporary files only')
.replace('actual in-process ASGI snapshots, finite SSE stream, validation and asset delivery; no browser runtime, socket listener, SDK or target command','actual temporary SQLite monitor state, concurrent writer threads, lifecycle and omission cases; no external tool/provider calls')
.replace("'run-monitor-web-tests-generated.mjs'","'run-monitor-storage-tests-generated.mjs'");
fs.writeFileSync(new URL('./run-monitor-storage-tests-generated.mjs',import.meta.url),code);
await import('./run-monitor-storage-tests-generated.mjs');
