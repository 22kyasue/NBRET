import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-agent-recovery.mjs',import.meta.url),'utf8');
code=code.replace("'tests/test_episode.py','tests/test_execution.py'","'tests/test_plan.py'")
.replace("'tests/test_episode.py','tests/test_execution.py','pyproject.toml'","'tests/test_plan.py','src/pentestgpt_agent/plan.py','src/pentestgpt_agent/memory.py','pyproject.toml'")
.replace('unchanged episode/execution tests pass; no live/provider tests selected','unchanged plan tests pass; constructed decisions and temporary SQLite state only')
.replace('scripted backend trace persistence, missing terminal/crash recovery, metadata/monitor and execution evidence grounding; no actual HTTP/command/provider invocation','plan scope/reference/provenance and finish-state contracts; no actual HTTP/command/provider invocation')
.replace("'run-agent-recovery.mjs'","'run-agent-plan-generated.mjs'");
fs.writeFileSync(new URL('./run-agent-plan-generated.mjs',import.meta.url),code);
await import('./run-agent-plan-generated.mjs');
