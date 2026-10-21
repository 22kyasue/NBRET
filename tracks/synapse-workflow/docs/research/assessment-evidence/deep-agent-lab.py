"""Pinned upstream functions, synthetic events only. Never invokes a backend."""
import ast
import dataclasses
import hashlib
import json
import pathlib
import sys
import time
import types

PG = pathlib.Path('C:/Users/kotar/.codex/research/pentestgpt-20261017/pentestgpt_agent/src')
WR = pathlib.Path('C:/Users/kotar/.codex/research/unified-agent-acff8ee')
sys.path[:0] = [str(PG), str(WR)]
from pentestgpt_agent.memory import MemoryKernel, RunSpec, StaleRevisionError
from pentestgpt_agent.plan import SupervisorDecision, TaskProposal, TaskKind, compile_plan
from pentestgpt_agent.execution import ExecutionDelta, ExecutionOutcome, ValidExecution, compile_execution
from pentestgpt_agent.trace import TraceStore
from pentestgpt_agent.audit import audit_run
from unified_agent import events, types as agent_types

out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=False)
run_id = 'synthetic-run'; root = out / run_id
memory = MemoryKernel(root / 'state.sqlite3')
snapshot = memory.create_run(RunSpec(run_id, 'Verify a synthetic consequence', ('synthetic-target',)))
decision = SupervisorDecision(0, (TaskProposal('inspect', TaskKind.DISCOVER, 'synthetic-target',
    'Read a local fixture', 'Evidence is retained'),), 'inspect', False, 'Start fixture')
plan = compile_plan(decision, snapshot); lease = memory.commit_plan(plan).lease
assert lease
try:
    memory.commit_plan(plan)
    raise AssertionError('stale commit accepted')
except StaleRevisionError:
    stale_rejected = True

canary = 'SYNTHETIC-CANARY-ONLY'
traces = TraceStore(out)
episode = lease.trace_episode_id
episode_dir = traces._begin(run_id, episode, {'run_id': run_id, 'episode_id': episode,
    'role': 'executor', 'state_revision': lease.revision, 'task_id': lease.task_id,
    'attempt_id': lease.attempt_id, 'opened_at': time.time()})
# This records a fabricated fixture receipt, not a real executed command.
traces._append(episode_dir, {'sequence': 1, 'type': 'command_run',
    'command': 'synthetic-echo-not-executed', 'exit_code': 0, 'output': canary})
traces._finish(episode_dir, {'success': True, 'closed_at': time.time(), 'usage': {}})
trace = traces.load(run_id, episode)
execution = compile_execution(ExecutionDelta('inspect', ExecutionOutcome.DONE,
    'Text was observed; target effect remains unverified', canary), lease, trace)
done = memory.commit_execution(execution)
observation_id = done.observations[0].id
memory.commit_plan(compile_plan(SupervisorDecision(done.revision, (), None, True,
    'Finish synthetic fixture', (observation_id,)), done))
audit = audit_run(root, expected_flag=canary)
target_effect = False
assert audit['passed'] and not target_effect
no_canary = audit_run(root, expected_flag='ABSENT-CANARY')
assert not no_canary['checks']['oracle_in_canonical_observation']
input_path = episode_dir / 'input.json'
original = input_path.read_text(); changed = json.loads(original); changed['task_id'] = 'different-task'
input_path.write_text(json.dumps(changed))
bad_identity = audit_run(root, expected_flag=canary)
assert not bad_identity['checks']['all_observation_identities_match']
input_path.write_text(original)

# Same database can contain another run; cross-run observation reuse must reject.
b = memory.create_run(RunSpec('run-b', 'Independent fixture', ('synthetic-target',)))
bl = memory.commit_plan(compile_plan(SupervisorDecision(0,
    (TaskProposal('inspect-b', TaskKind.DISCOVER, 'synthetic-target', 'Read', 'Read retained'),),
    'inspect-b', False, 'Start B'), b)).lease
try:
    memory.commit_execution(ValidExecution('run-b', bl.task_id, bl.attempt_id, bl.revision,
        bl.trace_episode_id, ExecutionOutcome.DONE, 'Try wrong run evidence', None, (),
        reused_observation_id=observation_id))
    raise AssertionError('cross-run observation accepted')
except ValueError as exc:
    cross_run_rejected = str(exc)

# Extract reviewed pure adapter functions only. No SDK import or execution.
source_path = WR / 'unified_agent/backends/codex.py'
tree = ast.parse(source_path.read_text())
names = {'build_turn_kwargs', '_TurnState', '_status_str', '_stringify_mcp_result',
    '_mcp_arguments', '_root_value', '_normalize_item'}
nodes = [n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.ClassDef)) and n.name in names]
module = ast.Module(body=[ast.ImportFrom(module='__future__', names=[ast.alias(name='annotations')], level=0), *nodes], type_ignores=[])
env = {'json': json, 'CODEX_EFFORTS': {'low'}, 'AgentRunError': agent_types.AgentRunError,
       **vars(events)}
exec(compile(ast.fix_missing_locations(module), str(source_path), 'exec'), env)
options = [types.SimpleNamespace(output_schema=None, effort=None, max_turns=n) for n in (2, 99)]
kwargs = [env['build_turn_kwargs'](o) for o in options]
assert kwargs[0] == kwargs[1] and 'max_turns' not in kwargs[0]
state = env['_TurnState'](options[0])
item = types.SimpleNamespace(type='mcpToolCall', id='c1', server='fixture', tool='read',
    arguments={}, status='completed', error=None,
    result=types.SimpleNamespace(is_error=True, content=[types.SimpleNamespace(text='fixture tool failed')]))
normalized = list(env['_normalize_item'](item, state))
normalized_result = next(e for e in normalized if isinstance(e, events.ToolResult))
assert normalized_result.is_error is False

receipt = {'at': time.time(), 'python': sys.version, 'scope': 'Synthetic event and SQLite fixtures; no actual command/backend/model/network',
    'stalePlanRejected': stale_rejected, 'crossRunReuseRejected': cross_run_rejected,
    'auditTextPass': audit['passed'], 'independentTargetEffect': target_effect,
    'noCanaryRejected': not no_canary['checks']['oracle_in_canonical_observation'],
    'identityMutationRejected': not bad_identity['checks']['all_observation_identities_match'],
    'adapterKwargsForBudgets2and99': kwargs,
    'syntheticInnerMcpErrorNormalizedAsError': normalized_result.is_error,
    'compatibilityLimit': 'Inner MCP error test uses SimpleNamespace, not a real SDK wire event',
    'modelCalls': 0, 'meteredCostUsd': 0,
    'scriptSha256': hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),
    'sources': {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in
        [PG/'pentestgpt_agent/memory.py', PG/'pentestgpt_agent/plan.py', PG/'pentestgpt_agent/execution.py',
         PG/'pentestgpt_agent/trace.py', PG/'pentestgpt_agent/audit.py', source_path]}}
(out/'receipt.json').write_text(json.dumps(receipt, indent=2)+'\n')
(out/'audit.json').write_text(json.dumps(audit, indent=2)+'\n')
print(json.dumps(receipt, indent=2))
