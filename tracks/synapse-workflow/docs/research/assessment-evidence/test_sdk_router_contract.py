"""No CLI, provider, process, target, credential or blocking queue reads."""
from openai_codex.client import CodexClient
from openai_codex.generated.v2_all import Turn, TurnCompletedNotification, TurnStartResponse
from openai_codex.models import Notification


def completion():
    return Notification(method='turn/completed', payload=TurnCompletedNotification(
        thread_id='synthetic-thread',
        turn=Turn(id='synthetic-turn', items=[], status='completed'),
    ))


def test_terminal_before_registration_is_not_available_after_turn_start():
    client = CodexClient()  # Constructor initializes state; start() is never called.

    def inert_response(method, params, *, response_model):
        assert method == 'turn/start'
        client._router.route_notification(completion())
        return TurnStartResponse(turn=Turn(id='synthetic-turn', items=[], status='inProgress'))

    client.request = inert_response
    started = client.turn_start('synthetic-thread', 'inert input')
    queue = client._router._turn_notifications[started.turn.id]
    assert queue.empty()
    assert not client._router._pending_turn_notifications
    # Control: once registered, the identical typed terminal is delivered.
    terminal = completion()
    client._router.route_notification(terminal)
    assert queue.get_nowait() is terminal
    assert queue.empty()


def test_registered_terminal_delivery_and_failure_wakeup_are_distinct():
    client = CodexClient()
    client.register_turn_notifications('synthetic-turn')
    terminal = completion()
    client._router.route_notification(terminal)
    queue = client._router._turn_notifications['synthetic-turn']
    assert queue.get_nowait() is terminal
    error = RuntimeError('synthetic transport close')
    client._router.fail_all(error)
    assert queue.get_nowait() is error
