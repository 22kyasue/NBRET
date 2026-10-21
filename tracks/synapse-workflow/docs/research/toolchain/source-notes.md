# Pinned implementation annotations

Pins and file hashes are in `snapshots.json` and `queue.json`. These are default-branch research snapshots, not release certifications. Contiguous ranges below identify what was inspected. Reading is not execution; hypotheses require independent tests.

## Burp public extension boundary

Repository `PortSwigger/burp-extensions-montoya-api-examples`, commit `e4c83c505e6ad42207710f26c7cdd41b232500a6`. Only the public example source and official API documentation are available here. Burp internals, TLS implementation, scheduler, persistence and scanner implementation remain inaccessible to this source review.

* `proxyhandler/.../ProxyHandlerExample.java` 1–27: implements `BurpExtension`; `initialize` names the extension and registers request/response handlers through `api.proxy()`. Registration is integration, not proof that a handler was invoked in a particular engagement.
* `MyProxyHttpRequestHandler.java` 1–49: received callback drops POST, bypasses interception for URLs containing `foo`, highlights JSON, otherwise requests interception. The to-be-sent callback continues the possibly user-modified request. This example can alter application behavior: its dropped POST is not evidence the application rejected an operation. URL substring checks are demonstration logic, not a robust scope boundary. No allowlist, timeout or credential redaction exists in this example.
* `MyProxyHttpResponseHandler.java` 1–34: checks decoded body text for `username`, adds blue annotation, and otherwise passes through. A text match is a triage cue; it does not establish disclosure, sensitivity, identity or authorization failure. Both response stages return explicit continuation actions.

The [official extension workshop](https://portswigger.net/burp-but-yours/extension-workshop/) distinguishes proxy/http/UI APIs and Professional-only scanner extension capabilities. The [desktop documentation](https://portswigger.net/burp/documentation/desktop) is edition-scoped. Both accessed 2026-10-17. The example file headers condition use on the Burp product terms; public source availability does not make Burp itself open source. Full example-license review remains queued.

## mitmproxy addon dispatch and lifecycle

Repository `mitmproxy/mitmproxy`, commit `77355977e5ea540b51ed029a40ed1dc2f1c2ba7b`.

`mitmproxy/addonmanager.py` 1–309 (complete):

* 1–60 defines safe callback handling: ordinary exceptions are logged; `AddonHalt` and `OptionsError` propagate out of `safecall`. Therefore an addon error is not intrinsically a fail-closed network policy. Whether forwarding continues depends on the caller/state machine, still queued.
* 62–128 supplies option/command registration and recursive addon traversal. Equal option signatures are reused; conflicting signatures warn and override. Sub-addons participate in hook traversal.
* 131–204 wires option changes to configuration hooks; detects duplicate names and obsolete APIs; invokes load, registers names, collects commands, then processes deferred options. Add order is the chain order.
* 206–262 removes addon registrations and invokes done; lifecycle handling calls the event and then emits an update for flow objects. Hook lookup uses the event name and only callable methods; colliding imported modules are skipped.
* 264–309 invokes sync or async handlers serially per addon chain. Async results are awaited; async functions are forbidden in the sync path. `AddonHalt` ends traversal. There is no per-handler deadline or sandbox in this file. An untrusted addon executes Python within the proxy process; practical containment must exist outside this dispatcher.

`mitmproxy/master.py` 1–146 (complete):

* 1–53 initializes options, commands, addons and global context under an active asyncio loop.
* 54–94 starts proxy servers while also observing shutdown, performs startup error checks, enters running and guarantees done in a finally block after entering that phase. The earlier startup returns are a separate cleanup question for the proxyserver addon.
* 96–123 schedules thread-safe shutdown and logs uncaught asynchronous failures.
* 125–146 loads stored flows through lifecycle events; in a single reverse mode it rewrites the loaded request host/port/scheme to the reverse destination. Consequently a saved flow is evidence of an earlier exchange, while a replay can target a different destination. Capture identity and execution destination must be recorded separately.

The [addon overview](https://docs.mitmproxy.org/stable/addons/overview/) documents event-driven mutation and testing callbacks directly (accessed 2026-10-17). Remaining flow: CLI/options → listener → protocol parsing/TLS → request hooks → upstream I/O → response hooks → flow save → shutdown. Dispatcher and master reading alone do not complete it.

## SharpHound collection orchestration and output

Repository `SpecterOps/SharpHound`, commit `85924979a9d23ab0e83a3fcfabee3b9962bb14be`.

`src/Runtime/CollectionTask.cs` 1–155 (complete):

* 1–62 creates a bounded LDAP channel of 1,000 with producer waiting, but unbounded output and computer-status channels. Producer selection depends on flags/computer file. Bounded input does not imply globally bounded memory: output accumulation needs a separate resource analysis.
* 64–109 starts consumers according to context thread count, starts writers, awaits domain and configuration naming-context producers, completes LDAP input, awaits consumers, adds well-known principals, completes output/status and awaits writers. A returned ZIP path is an artifact outcome, not proof every object was processed. Exception cleanup around the orchestration remains to inspect in the caller.
* 111–155 resolves directory objects, excludes unresolved/base labels, dispatches processing, marks selected domain records, and writes results. Per-object exceptions are logged and collection continues; clear-event-handlers is after channel exhaustion. Completeness requires error/status accounting alongside object counts. Cancellation/failure paths remain open.

`src/Writers/JsonDataWriter.cs` 1–120 (complete):

* 1–49 configures JSON enums/formatting and no-output behavior. Data schema version is **6** at this pin, distinct from the binary version.
* 51–79 rejects an already existing output filename, starts `data` array and serializes queued items. The existence check and file open are separate operations; this is not an atomic exclusive-create guarantee.
* 81–120 flushes remaining queue and appends `meta`: count, collection-method bitset, data type, data version and assembly collector version, then closes the writer. Metadata describes the emitted dataset; it does not attest authorization, collection coverage, freshness of every relationship or integrity against later editing.

The [maintainer collector documentation](https://bloodhound.specterops.io/collect-data/ce-collection/sharphound) says collection uses native Windows APIs and LDAP and produces JSON/ZIP for BloodHound. Its default collection includes permissions and sessions, whose lifetimes differ. Accessed 2026-10-17; doc defaults must be checked against this source pin before treating them as source-established. No domain collection was run.
# Continuation: public Burp example license closure

The pinned public Montoya example repository's `LICENSE` is fully read, 1–552. Its text addresses product licensing, extensions/API/BApp terms, collaborator data handling, deployed instrumentation, source-access restrictions and general contractual clauses. This is a record of that exact repository artifact, not proof that it is the current agreement for every Burp edition/account or that public examples license proprietary internals. Public API/example source remains reviewable; proprietary product implementation is still inaccessible. No circumvention, product purchase, extension publication or target instrumentation was attempted. Existing custom-license catalog classification remains; no integration clearance is inferred.
