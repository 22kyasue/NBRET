import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-agent-recovery.mjs',import.meta.url),'utf8');
code=code.replace("const root='C:/Users/kotar/.codex/research/pentestgpt-20261017/pentestgpt_agent';","const root='C:/Users/kotar/.codex/research/unified-agent-acff8ee';")
.replace("'tests/test_episode.py','tests/test_execution.py'","'tests/test_monitor_web.py'")
.replace("['src/pentestgpt_agent/trace.py','src/pentestgpt_agent/execution.py','src/pentestgpt_agent/agents.py','tests/test_episode.py','tests/test_execution.py','pyproject.toml']","['unified_agent/monitor_web.py','unified_agent/monitoring.py','unified_agent/monitor_web_assets/app.js','unified_agent/monitor_web_assets/index.html','tests/test_monitor_web.py','pyproject.toml']")
.replace('unchanged episode/execution tests pass; no live/provider tests selected','unchanged monitor web tests pass using ASGITransport and owned synthetic SQLite; no listener or provider')
.replace('scripted backend trace persistence, missing terminal/crash recovery, metadata/monitor and execution evidence grounding; no actual HTTP/command/provider invocation','actual in-process ASGI snapshots, finite SSE stream, validation and asset delivery; no browser runtime, socket listener, SDK or target command')
.replace("'run-agent-recovery.mjs'","'run-monitor-web-tests-generated.mjs'")
.replace('agent-recovery-receipt-${start}','monitor-web-receipt-${start}');
fs.writeFileSync(new URL('./run-monitor-web-tests-generated.mjs',import.meta.url),code);
await import('./run-monitor-web-tests-generated.mjs');
