"""Inert SDK source checks; never connect, materialize auth or touch user config."""
from dataclasses import asdict

import pytest
from claude_agent_sdk import ClaudeAgentOptions, InMemorySessionStore, ResultMessage
from claude_agent_sdk import ServerToolUseBlock, AssistantMessage, project_key_for_directory
from claude_agent_sdk._internal.transport.subprocess_cli import SubprocessCLITransport
from unified_agent.backends.claude_code import normalize_message
from unified_agent.types import RunOptions


class FinishedProcess:
    async def wait(self):
        return 0


async def chunks(*values):
    for value in values:
        yield value


@pytest.mark.asyncio
async def test_incomplete_eof_drops_tail_without_transport_error():
    transport = SubprocessCLITransport('inert', ClaudeAgentOptions(cli_path='NEVER_EXECUTED'))
    transport._process = FinishedProcess()
    transport._stdout_stream = chunks('{"x":1}\n{"unfinished":')
    assert [x async for x in transport.read_messages()] == [{'x': 1}]


@pytest.mark.asyncio
async def test_buffer_limit_counts_characters_not_utf8_bytes():
    value = '{"x":"é"}'
    assert len(value) == 9 and len(value.encode('utf-8')) == 10
    transport = SubprocessCLITransport('inert', ClaudeAgentOptions(
        cli_path='NEVER_EXECUTED', max_buffer_size=9))
    transport._process = FinishedProcess()
    transport._stdout_stream = chunks(value)
    assert [x async for x in transport.read_messages()] == [{'x': 'é'}]


def test_normalization_omits_native_denial_metadata_and_server_tool(tmp_path):
    message = ResultMessage(subtype='success', is_error=True, duration_ms=0,
                            duration_api_ms=0, num_turns=0, session_id='synthetic',
                            permission_denials=[{'tool_name': 'INERT_SYNTHETIC_TOOL'}],
                            api_error_status=429)
    [normalized] = normalize_message(message, RunOptions(workspace=tmp_path))
    assert normalized.success is False  # Failure bit is preserved: contrary control.
    payload = asdict(normalized)
    assert 'permission_denials' not in payload and 'api_error_status' not in payload
    server_message = AssistantMessage(model='synthetic', content=[
        ServerToolUseBlock(id='synthetic-only', name='web_search', input={'inert': True})])
    assert list(normalize_message(server_message, RunOptions(workspace=tmp_path))) == []


@pytest.mark.asyncio
async def test_reference_memory_path_keys_and_entry_aliasing(tmp_path):
    first, second = tmp_path / 'synthetic-a-b', tmp_path / 'synthetic-a_b'
    first.mkdir()
    second.mkdir()
    assert first.resolve() != second.resolve()
    assert project_key_for_directory(first) == project_key_for_directory(second)
    store = InMemorySessionStore()
    key = {'project_key': project_key_for_directory(first), 'session_id': 'synthetic-only'}
    entry = {'type': 'user', 'uuid': 'synthetic-entry', 'message': {'content': 'before'}}
    await store.append(key, [entry])
    loaded = await store.load(key)
    loaded[0]['message']['content'] = 'after'
    assert (await store.load(key))[0]['message']['content'] == 'after'
