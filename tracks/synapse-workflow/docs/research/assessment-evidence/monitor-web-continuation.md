# Monitor API/UI evidence boundaries

2026-10-17. UnifiedAgent acff8eeadf93e367d4a1578d3a2739cbc9d3ace5; no tracked LICENSE at this pin. Extends deep-monitor.md, not a deployment assessment.

## Storage → API → UI

Complete fresh reading: monitoring.py 1–467, tests/test_monitoring.py 1–307, tests/test_monitor_web.py 1–189, monitor_web_assets/app.js 1–667, index.html 1–156 and docs/process-monitor-design.md 1–232. monitor_web.py was already completely read; 1–420 re-read here to follow routes. CSS and remaining SDK/tests/docs stay queued.

monitoring.py 191–234 captures prompt by default, recursively serializes metadata and records host/PID; 236–292 selects rows by supplied run ID and sequence. 311–340 atomically updates sequence and inserts the event. 364–378 omits reasoning/raw payloads by default but preserves normalized events. 429–458 truncates strings, not confidential fields; recursive containers are not globally size/depth bounded here. This establishes serialization behavior, not a demonstrated exhaustion attack.

monitor_web.py 187–202 opens SQLiteRunMonitor in lifespan; this reader uses the normal initializing/writable monitor class. “Read-only inspector” describes the exposed routes, not SQLite read-only URI enforcement or a separate low-privilege database principal. Routes 238–300 return whole run payloads/events. 303–378 streams by sequence, batching 1,000 and terminating when final status is caught up. Last-Event-ID and query cursor choose their maximum. Security headers 45–76 constrain browser behavior; no authentication or per-run authorization middleware appears in route construction 380–393. CLI loopback binding validation is a separate boundary, not evidence that create_app is safe for arbitrary hosting. No remote hosting or third-party access was attempted.

app.js 225–249 loads detail/history together and checks a selection generation before accepting them; SSE 257–295 checks run IDs and deduplicates by sequence. This supports ordinary snapshot-to-stream reconciliation. It is not a guarantee for every reconnect or event ordering. state.events grows and each incoming event sorts and re-renders the timeline (268–272); no bounded browser history eviction here. Do not infer measured browser memory/performance from this source.

app.js 19–23 and 520–621 construct text nodes/textContent for target-derived display. No HTML interpretation of evidence was found in this complete file. This is stronger evidence than the test's literal `innerHTML`/`eval(` absence assertions alone, but still not a browser exploit test. Prompts, metadata, raw event JSON and tool input/output remain visible/copyable (553–616, 647–649). UI safety and artifact sanitization are distinct.

Timeline 387–455 groups commands/tools by call ID and replaces output with a truthy terminal aggregate; empty aggregate retains earlier deltas. Action count 331–337 counts represented command/tool events, not independently observed actions or detections. “Passed” at 56–63 is the monitor succeeded status; it does not prove assessment goal or defensive detection. Unknown provider cost renders a dash at 354–356, useful contrary evidence to the prior higher-level aggregate treating unknown costs as zero.

## Actual local validation

Dependencies were initially absent. prepare-monitor-lab.mjs installed only Starlette/httpx into the existing isolated research venv; retained monitor-dependencies JSON records command/output and resolved Starlette 1.8.0, httpx 0.28.1, anyio 4.15.1. No global install, SDK extras, uvicorn listener or browser. An initial inline dependency query failed due to PowerShell quoting; corrected file-based query established absence before installation. It was not a safety rejection.

* monitor-web-receipt-1792273583421.json: **10 upstream tests pass** using HTTPX ASGITransport in-process, owned synthetic SQLite, finite completed SSE, query validation and assets. No TCP/HTTP connection leaves the process; inspector.test is an inert ASGI base URL.
* monitor-web-receipt-1792273602329.json: **one custom contract passes**. Synthetic prompt, metadata and command-output sentinel strings survive SQLite → actual ASGI JSON; no auth headers supplied. no-store/CSP headers exist, permissive CORS absent and POST returns405. These headers coexist with retained sensitive-shaped data. Not a real credential leak or proof of remote exposure.
* monitor-web-receipt-1792273621508.json: **9 upstream storage tests pass, 1 fails**. The unmodified file-mode test expects0600 at test_monitoring.py 285–298; this Windows runtime reports0666 for the owned temporary main DB. Preserve this failure. monitoring.py 298–309 calls chmod0600, not Windows DACL enforcement. POSIX-mode assertion failure does **not** establish that another Windows account can read the file; actual DACL/principal effective access was not measured. No permission change was applied beyond the unmodified monitor's chmod on its synthetic files. Do not label the entire suite passing or promote this to cross-user disclosure.

Other limits: the test called “second process facade” (131–159) instantiates two monitors within one process; concurrent-writer test258–282 uses two threads/instances with distinct run IDs. Neither establishes hostile multi-process writers or same-run competing writers. The omission test230–255 truncates its prompt at8 characters; absence of full `prompt-secret` is not proof that prompts are secret-redacted. Our separate default-capture sentinel test resolves that ambiguity.

## Documentation versus enforcement

process-monitor-design.md 111–114 explicitly acknowledges potential secrets and says omission is not full redaction—consistent with the lab. Phases208–221 propose project/run authorization and a collector outside the agent container; they are not current enforcement. Its phase3 integration red gate172–175 describes an older PentestGPT state: our pinned PentestGPT's actual serializer/tests accept the progress events. Cross-repository documentation is therefore dated design context, not proof of current integration failure. No benchmark visibility latency, overhead or secret-retention improvement was measured; suggested budgets205–206 remain proposals.

Next: complete CSS and remaining backend fixture tests, trace actual installed SDK event/permission types where available, then source-level failure propagation from monitor into agent. No missing runtime dependency blocks the independent source queue.
