import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-monitor-web-tests-generated.mjs',import.meta.url),'utf8');
const sdk='C:/Users/kotar/.codex/research/assessment-evidence-sdk-sources/openai-codex-0.1.0b3-source/openai_codex-0.1.0b3/src';
code=code.replace("'tests/test_monitor_web.py'","'tests/test_codex_backend.py','tests/test_agent.py','tests/test_task.py','tests/test_tools.py'")
.replace("PYTHONPATH:path.join(root,'src')+';'+wrapper","PYTHONPATH:root+';'+"+JSON.stringify(sdk))
.replace("['unified_agent/monitor_web.py','unified_agent/monitoring.py','unified_agent/monitor_web_assets/app.js','unified_agent/monitor_web_assets/index.html','tests/test_monitor_web.py','pyproject.toml']","['unified_agent/backends/codex.py','unified_agent/agent.py','unified_agent/task.py','unified_agent/tools.py','tests/test_codex_backend.py','tests/test_agent.py','tests/test_task.py','tests/test_tools.py','tests/fixture_registry.py','pyproject.toml']")
.replace('unchanged monitor web tests pass using ASGITransport and owned synthetic SQLite; no listener or provider','unchanged selected offline wrapper tests pass; synthetic notifications/backends, local context files and tool metadata only')
.replace('actual in-process ASGI snapshots, finite SSE stream, validation and asset delivery; no browser runtime, socket listener, SDK or target command','actual wrapper normalization/configuration/collection/task/registry methods; source-path Codex SDK model imports; no client start, CLI, MCP subprocess or provider')
.replace("'run-monitor-web-tests-generated.mjs'","'run-wrapper-offline-tests-generated.mjs'")
.replace('monitor-web-receipt-${start}','wrapper-offline-receipt-${start}');
fs.writeFileSync(new URL('./run-wrapper-offline-tests-generated.mjs',import.meta.url),code);
await import('./run-wrapper-offline-tests-generated.mjs');
