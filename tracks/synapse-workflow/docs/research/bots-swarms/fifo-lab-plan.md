# Pending-operation accounting protocol

Predeclared before execution. Use the completely read pinned BullMQ AsyncFifoQueue class through Node's TypeScript transform, with no import substitutions (the file has no imports). No broker, package install, child process, socket or external traffic. Pending promises and watchdog timers only; every watchdog must be cleared. Never run this experiment against a production worker.

Oracles:

1. Queue two controlled promises, settle second first: fetch returns resolution order, not submission order; numTotal counts pending plus resolved-unfetched work.
2. With default ignoreErrors=false, start fetch while one controlled promise is pending, then reject that promise. Source hypothesis: pending and queued become zero, but the already waiting fetch stays unresolved through a 30ms watchdog. A subsequent fresh fetch returns undefined. Recover the old wait by adding one fulfilled sentinel and await it, leaving no unresolved experiment wait.
3. With ignoreErrors=true, a rejected promise queues undefined, allowing the waiting fetch to resolve; counts end at zero.
4. waitAll uses Promise.all: one rejected promise causes it to reject while another controlled promise is still pending. Resolve the second before cleanup. This disproves any reading of waitAll as necessarily waiting until every promise settles on error.

Record original/transformed/script hashes, runtime, exact comparisons, captured diagnostic messages and cleanup. The watchdog result establishes bounded non-resolution, not an infinite-time proof. This is an actual transformed helper-class experiment, not evidence that normal BullMQ Worker processing necessarily reaches that input path; caller error handling needs separate tracing.
