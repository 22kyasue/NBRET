import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-agent-recovery.mjs',import.meta.url),'utf8');
code=code.replace("'tests/test_episode.py','tests/test_execution.py'","'tests/test_loop.py'")
.replace("'tests/test_episode.py','tests/test_execution.py','pyproject.toml'","'tests/test_loop.py','src/pentestgpt_agent/loop.py','src/pentestgpt_agent/memory.py','src/pentestgpt_agent/plan.py','pyproject.toml'")
.replace('unchanged episode/execution tests pass; no live/provider tests selected','unchanged loop tests pass; scripted providers, constructed recovery states and temporary local storage only')
.replace('scripted backend trace persistence, missing terminal/crash recovery, metadata/monitor and execution evidence grounding; no actual HTTP/command/provider invocation','scripted loop retry, existing episode recovery, validation settlement and persistent decision budget; no actual HTTP/command/provider invocation or killed process')
.replace("'run-agent-recovery.mjs'","'run-agent-loop-generated.mjs'");
fs.writeFileSync(new URL('./run-agent-loop-generated.mjs',import.meta.url),code);
await import('./run-agent-loop-generated.mjs');
