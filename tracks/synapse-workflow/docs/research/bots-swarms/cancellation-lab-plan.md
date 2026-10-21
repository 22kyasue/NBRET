# Pinned lock-manager protocol, before execution

Use only the already completely read BullMQ lock-manager.ts, Node's built-in TypeScript transform and a synthetic worker backend. No Redis, actual job processor infrastructure, third-party requests or package installation. Replace three imports with native AbortController and inert telemetry constants; erase TypeScript through Node's `stripTypeScriptTypes` transform. Record original and transformed hashes. This is an adapter-level class experiment, not a complete BullMQ worker integration test.

Oracles:

1. Tracking without a controller makes cancelJob return false.
2. Tracking with a controller makes cancellation return true and sets signal.aborted; tracked count remains one until explicit untracking.
3. A synthetic processor that ignores the signal can still perform one in-memory effect after cancellation. Cancellation acknowledgement therefore does not establish quiescence.
4. A synthetic backend reporting failed lock renewal emits lockRenewalFailed and error, while that tracked processor's abort signal remains un-aborted in this method.
5. Closing clears tracked jobs and sets manager non-running; it is not asserted to have killed a processor or cancelled an in-flight backend call.

Explicitly invoke no timers: do not call start(). Close each manager. Record assertions, transformations and limitations in a timestamped receipt.
