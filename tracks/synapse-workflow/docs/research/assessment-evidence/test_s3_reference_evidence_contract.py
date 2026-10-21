from unittest.mock import patch
import pytest
from session_stores.s3_session_store import S3SessionStore, _RecordingClient


@pytest.mark.asyncio
async def test_two_writer_clock_order_and_replay():
    client = _RecordingClient()
    a = S3SessionStore(bucket='synthetic-in-memory-only', client=client)
    b = S3SessionStore(bucket='synthetic-in-memory-only', client=client)
    key = {'project_key': 'synthetic-project', 'session_id': 'synthetic-session'}
    with patch('session_stores.s3_session_store.time.time', return_value=1700000002.0):
        await a.append(key, [{'type': 'user', 'uuid': 'first', 'order': 1}])
    with patch('session_stores.s3_session_store.time.time', return_value=1700000000.0):
        await b.append(key, [{'type': 'user', 'uuid': 'second', 'order': 2}])
        await b.append(key, [{'type': 'user', 'uuid': 'second', 'order': 2}])
    loaded = await a.load(key)
    assert [e['order'] for e in loaded] == [2, 2, 1]
    assert len(client.objects) == 3
    assert len([e for e in loaded if e['uuid'] == 'second']) == 2


@pytest.mark.asyncio
async def test_malformed_line_omitted_but_valid_neighbors_retained():
    client = _RecordingClient(objects={
        'synthetic-project/synthetic-session/part-1700000000000-aaaaaa.jsonl':
        b'{"type":"user","uuid":"before"}\ninvalid\n{"type":"user","uuid":"after"}\n'})
    store = S3SessionStore(bucket='synthetic-in-memory-only', client=client)
    assert [e['uuid'] for e in await store.load({
        'project_key': 'synthetic-project', 'session_id': 'synthetic-session'})] == ['before', 'after']


@pytest.mark.asyncio
async def test_one_writer_same_clock_preserves_order():
    client = _RecordingClient()
    store = S3SessionStore(bucket='synthetic-in-memory-only', client=client)
    key = {'project_key': 'synthetic-project', 'session_id': 'synthetic-session'}
    with patch('session_stores.s3_session_store.time.time', return_value=1700000000.0):
        for n in [1, 2, 3]:
            await store.append(key, [{'type': 'user', 'order': n}])
    assert [e['order'] for e in await store.load(key)] == [1, 2, 3]
