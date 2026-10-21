import fs from 'node:fs';
const sdk='C:/Users/kotar/.codex/research/assessment-evidence-sdk-sources/claude-agent-sdk-0.2.90-source/claude_agent_sdk-0.2.90/src';
let code=fs.readFileSync(new URL('./run-wrapper-offline-tests-generated.mjs',import.meta.url),'utf8');
code=code.replace("'tests/test_codex_backend.py','tests/test_agent.py','tests/test_task.py','tests/test_tools.py'","'tests/test_claude_backend.py'")
.replace('openai-codex-0.1.0b3-source/openai_codex-0.1.0b3/src','claude-agent-sdk-0.2.90-source/claude_agent_sdk-0.2.90/src')
.replace('unchanged selected offline wrapper tests pass; synthetic notifications/backends, local context files and tool metadata only','unchanged Claude normalization tests pass with SDK source models; no query, subprocess or provider')
.replace('actual wrapper normalization/configuration/collection/task/registry methods; source-path Codex SDK model imports; no client start, CLI, MCP subprocess or provider','actual Claude wrapper options/normalization with declared-lower-bound SDK source types; installed MCP2.3.0 model dependency; no native runtime')
.replace("'run-wrapper-offline-tests-generated.mjs'","'run-claude-normalization-generated.mjs'");
code=code.replace("['unified_agent/backends/codex.py','unified_agent/agent.py','unified_agent/task.py','unified_agent/tools.py','tests/test_codex_backend.py','tests/test_agent.py','tests/test_task.py','tests/test_tools.py','tests/fixture_registry.py','pyproject.toml']","['unified_agent/backends/claude_code.py','unified_agent/types.py','unified_agent/events.py','tests/test_claude_backend.py','pyproject.toml']");
fs.writeFileSync(new URL('./run-claude-normalization-generated.mjs',import.meta.url),code);
await import('./run-claude-normalization-generated.mjs');
