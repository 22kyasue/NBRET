from dataclasses import asdict
from pathlib import Path
from claude_agent_sdk._internal.message_parser import parse_message
from unified_agent.backends.claude_code import normalize_message
from unified_agent.types import RunOptions
from pentestgpt_agent.execution import compile_execution, ExecutionDelta, ExecutionOutcome
from pentestgpt_agent.memory import TaskLease
from pentestgpt_agent.trace import EpisodeTrace


def compile_output(content):
    native = parse_message({'type': 'user', 'message': {'content': [
        {'type': 'tool_result', 'tool_use_id': 'synthetic-tool', 'content': content, 'is_error': False}]}})
    [normalized] = normalize_message(native, RunOptions(workspace=Path('.')))
    event = {'type': 'tool_result', 'sequence': 1, **asdict(normalized)}
    lease = TaskLease(run_id='synthetic-run', task_id='synthetic-task',
                      attempt_id='synthetic-attempt', revision=1, trace_episode_id='synthetic-episode')
    trace = EpisodeTrace(input={'role': 'executor', 'run_id': lease.run_id,
        'task_id': lease.task_id, 'attempt_id': lease.attempt_id,
        'state_revision': 1, 'episode_id': lease.trace_episode_id},
        events=(event,), output={'success': True}, truncated_tail=False)
    return compile_execution(ExecutionDelta(task_id=lease.task_id,
        outcome=ExecutionOutcome.DONE, summary='synthetic evidence projection only',
        evidence_excerpt=content), lease, trace)


def test_short_supplied_preview_marker_is_grounded_without_truncation_flag():
    preview = '<persisted-output>\nSynthetic preview only; full content not supplied.\n</persisted-output>'
    compiled = compile_output(preview)
    assert compiled.outcome is ExecutionOutcome.DONE
    assert compiled.observation == preview
    assert compiled.evidence_truncated is False


def test_local_long_excerpt_downgrades_done_to_progress():
    compiled = compile_output('x' * 4001)
    assert compiled.outcome is ExecutionOutcome.PROGRESS
    assert compiled.evidence_truncated is True
