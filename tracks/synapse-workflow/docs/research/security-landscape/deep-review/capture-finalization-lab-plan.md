# Capture finalization experiment — declared before execution

2026-10-17. Actual startCapture with a synthetic EventEmitter CDP session, no browser/HTTP/model. All enable calls succeed, detach throws once. Success criterion for reproducing source concern: first finish rejects; second resolves without evidence.json and without retrying detach. This tests lifecycle return semantics only, not actual CDP error frequency. Preserve output/hashes; production unchanged.
