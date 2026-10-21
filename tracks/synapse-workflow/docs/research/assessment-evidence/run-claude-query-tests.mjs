import fs from 'node:fs';
import path from 'node:path';
let code=fs.readFileSync(new URL('./run-claude-evidence-lab.mjs',import.meta.url),'utf8');
code=code.replace("const fixture=path.join(own,'test_claude_evidence_contract.py');","const fixture=path.join(root,'tests/test_query.py');")
.replace("'-p','pytest_asyncio.plugin',",'')
.replace("'src/claude_agent_sdk/_internal/transport/subprocess_cli.py'","'src/claude_agent_sdk/_internal/query.py','src/claude_agent_sdk/_internal/client.py','pyproject.toml','src/claude_agent_sdk/_internal/transport/subprocess_cli.py'")
.replace("'--basetemp',temp,fixture]","'--basetemp',temp,fixture,'-k','not TestQueryTrioBackend']")
.replace('incomplete EOF drops remaining tail with exit0; UTF8 byte length exceeds accepted character count; failure bit survives while metadata/server blocks omitted; colliding sanitized synthetic directory keys and mutable entry alias confirmed','unchanged selected query tests pass; entire TestQueryTrioBackend class excluded because Trio is not installed, including its asyncio parity methods')
.replace('researcher supplies inert async chunk iterator and finished process facade; no connect/spawn; hand-constructed native messages and owned temp directories/reference memory','researcher selects previously read upstream mock-transport query tests and excludes explicitly named optional-backend class; no test or SDK source edits')
.replace('actual selected SDK/wrapper functions with inert boundaries; no runtime CLI, credential/config access, native API tool or customer facts','unchanged mock-transport SDK query/control/error/lifecycle tests; no subprocess, provider, real session or auth access')
.replace('runnerSha256:hash(new URL(import.meta.url))','runnerSha256:hash(path.join(own,\'run-claude-query-generated-v2.mjs\'))')
.replace('claude-evidence-receipt-${at}','claude-query-receipt-${at}');
fs.writeFileSync(new URL('./run-claude-query-generated-v2.mjs',import.meta.url),code);
await import('./run-claude-query-generated-v2.mjs');
