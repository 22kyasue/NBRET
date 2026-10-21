import json
from unittest.mock import patch
import pytest
from claude_agent_sdk import InMemorySessionStore, import_session_to_store


@pytest.mark.asyncio
async def test_invalid_tail_leaves_committed_prefix_and_replay_duplicates(tmp_path):
    # Success criterion fixed in advance: batch_size=1 stores the first entry,
    # then malformed JSON raises; replay duplicates it in the reference store.
    sid = '550e8400-e29b-41d4-a716-446655440000'
    project = tmp_path / 'synthetic-project'
    project.mkdir()
    transcript = project / (sid + '.jsonl')
    entry = {'type': 'user', 'uuid': 'synthetic-only', 'message': {'content': 'inert'}}
    transcript.write_text(json.dumps(entry) + '\n{invalid\n', encoding='utf-8')
    store = InMemorySessionStore()
    key = {'project_key': project.name, 'session_id': sid}
    with patch('claude_agent_sdk._internal.session_import._resolve_session_file_path', return_value=transcript):
        for expected in (1, 2):
            with pytest.raises(json.JSONDecodeError):
                await import_session_to_store(sid, store, batch_size=1, include_subagents=False)
            assert len(await store.load(key)) == expected
            assert all(item == entry for item in await store.load(key))


@pytest.mark.asyncio
async def test_same_invalid_tail_before_first_flush_leaves_no_prefix(tmp_path):
    sid = '550e8400-e29b-41d4-a716-446655440000'
    transcript = tmp_path / (sid + '.jsonl')
    transcript.write_text('{"type":"user","uuid":"synthetic"}\n{invalid\n', encoding='utf-8')
    store = InMemorySessionStore()
    with patch('claude_agent_sdk._internal.session_import._resolve_session_file_path', return_value=transcript):
        with pytest.raises(json.JSONDecodeError):
            await import_session_to_store(sid, store, batch_size=2, include_subagents=False)
    assert await store.load({'project_key': tmp_path.name, 'session_id': sid}) == []
