"""Normal in-memory context/serialization contracts; no server, tools or fault injection."""
import contextvars
import anyio
from mcp.shared._context_streams import create_context_streams
from mcp.shared.dispatcher import as_request_id, coerce_request_id


def test_context_is_per_message_and_requires_explicit_restoration():
    async def scenario():
        marker = contextvars.ContextVar("research_marker", default="receiver")
        send, receive = create_context_streams[str](2)
        async with send, receive:
            token = marker.set("synthetic-first")
            await send.send("first")
            marker.set("synthetic-second")
            await send.send("second")
            marker.reset(token)
            assert await receive.receive() == "first"
            first_context = receive.last_context
            assert first_context.run(marker.get) == "synthetic-first"
            assert marker.get() == "receiver"
            assert await receive.receive() == "second"
            assert receive.last_context.run(marker.get) == "synthetic-second"
            assert first_context.run(marker.get) == "synthetic-first"
            assert marker.get() == "receiver"
    anyio.run(scenario)


def test_normal_end_of_stream_after_last_sender_closes():
    async def scenario():
        send, receive = create_context_streams[str](1)
        clone = send.clone()
        await send.aclose()
        await clone.send("synthetic-final")
        await clone.aclose()
        async with receive:
            assert [item async for item in receive] == ["synthetic-final"]
    anyio.run(scenario)


def test_request_id_normalization_preserves_nonnumeric_names():
    assert as_request_id("request-a") == "request-a"
    assert as_request_id(7) == 7
    assert as_request_id(True) is None
    assert coerce_request_id("7") == 7
    assert coerce_request_id("request-a") == "request-a"
