import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-agent-recovery.mjs',import.meta.url),'utf8');
code=code.replaceAll("'tests/test_episode.py','tests/test_execution.py'","'tests/test_supervisor.py','tests/test_executor.py'")
.replace('unchanged episode/execution tests pass; no live/provider tests selected','unchanged supervisor/executor tests pass; captured scripted prompts and options, no live/provider tests')
.replace('scripted backend trace persistence, missing terminal/crash recovery, metadata/monitor and execution evidence grounding; no actual HTTP/command/provider invocation','prompt projection, required basis context and declared turn-budget transport; scripted backend only, no SDK enforcement or target activity')
.replace("'run-agent-recovery.mjs'","'run-agent-prompts-generated.mjs'");
fs.writeFileSync(new URL('./run-agent-prompts-generated.mjs',import.meta.url),code);
await import('./run-agent-prompts-generated.mjs');
