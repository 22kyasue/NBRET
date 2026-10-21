import pytest
from claude_agent_sdk import ClaudeSDKClient


class InertTransport:
    def __init__(self): self.closed = 0
    async def connect(self): raise RuntimeError('synthetic connect failure')
    async def close(self): self.closed += 1


@pytest.mark.asyncio
async def test_connect_failure_before_query_does_not_close_transport():
    transport = InertTransport()
    client = ClaudeSDKClient(transport=transport)
    with pytest.raises(RuntimeError, match='synthetic connect failure'):
        await client.connect()
    assert transport.closed == 0
    assert client._transport is None and client._query is None


@pytest.mark.asyncio
async def test_query_close_failure_skips_materialized_cleanup():
    class Query:
        async def close(self): raise RuntimeError('synthetic close failure')
    class Materialized:
        calls = 0
        async def cleanup(self): self.calls += 1
    client = ClaudeSDKClient(transport=InertTransport())
    materialized = Materialized()
    client._query = Query()
    client._materialized = materialized
    with pytest.raises(RuntimeError, match='synthetic close failure'):
        await client.disconnect()
    assert materialized.calls == 0
    assert client._materialized is materialized


@pytest.mark.asyncio
async def test_normal_query_close_precedes_cleanup():
    calls = []
    class Query:
        async def close(self): calls.append('close')
        def close_receive_stream(self): calls.append('receive-close')
    class Materialized:
        async def cleanup(self): calls.append('cleanup')
    client = ClaudeSDKClient(transport=InertTransport())
    client._query = Query()
    client._materialized = Materialized()
    await client.disconnect()
    assert calls == ['close', 'receive-close', 'cleanup']
    assert client._query is None and client._materialized is None
