import fs from 'node:fs';
let code=fs.readFileSync(new URL('./run-agent-recovery.mjs',import.meta.url),'utf8');
code=code.replace("'tests/test_episode.py','tests/test_execution.py'","'tests/test_trial.py'")
.replace("'tests/test_episode.py','tests/test_execution.py','pyproject.toml'","'tests/test_trial.py','src/pentestgpt_agent/trial.py','src/pentestgpt_agent/audit.py','src/pentestgpt_agent/memory.py','src/pentestgpt_agent/loop.py','pyproject.toml'")
.replace('unchanged episode/execution tests pass; no live/provider tests selected','unchanged trial tests pass; scripted providers and local temporary state only')
.replace('scripted backend trace persistence, missing terminal/crash recovery, metadata/monitor and execution evidence grounding; no actual HTTP/command/provider invocation','scripted trial completion/resume, config mismatch, malformed/tampered trace audit, typed failure settlement and CLI status; no actual HTTP/command/provider invocation')
.replace("'run-agent-recovery.mjs'","'run-agent-trial-generated.mjs'");
fs.writeFileSync(new URL('./run-agent-trial-generated.mjs',import.meta.url),code);
await import('./run-agent-trial-generated.mjs');
