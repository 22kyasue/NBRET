# Deep implementation investigation — active

Resumed 2026-10-17 at Kotaro's request, relayed by Rowan. The earlier dossier is a checkpoint, not completion. Tomo owns NBRET capture/scanner/identity/evidence/reporting plus ZAP and Nuclei; Agate owns agent/evaluator/defender execution. Neither changes production code as part of source research.

## Reading discipline

[snapshots.json](snapshots.json) records exact repository roots and commits. [file-queue.json](file-queue.json) is a pinned file-level inventory with unread/partial/complete states, hashes and inspected ranges. Inventory entries are not claimed understanding. The new queue starts conservatively: earlier complete reads remain in the older `source-reads.json`, and receive new credit only when deliberately reconciled. A complete file read does not mean every dependency or runtime behavior is validated.

`node scripts/research-source-queue.mjs show REPO FILE START COUNT` emits bounded contiguous source without marking it read. Only after inspecting an untruncated output is `mark REPO FILE START END` used. The helper refuses oversized outputs and changed source hashes. `status` counts reading states, not assurance. New discoveries are annotated in [NBRET scanner](nbret-scanner.md) and [ZAP control path](zap-control-path.md); Nuclei gets its own traced workflow as reading proceeds.

## Current workflow and continuation

Start with CLI/config → daemon ownership → context creation → URL seeding → selected policy/active scanner → progress and alert attribution → analysis/reporting → stop/remove/daemon close. Follow exact callees and tests, then repeat for template parse/compile → HTTP execution → operators/matchers/extractors → result generation in Nuclei. Cross-cutting identity/evidence matching will extend the original E01 lab rather than claiming a production repair.

The scanner adapter lab has a [predefined plan](scanner-adapter-lab-plan.md) and [receipt](scanner-adapter-lab-receipt.json). Its API is simulated; only adapter behavior is runtime-established. No real ZAP active scanner or third-party target executed in that experiment. All remaining accessible source dependencies continue in the queue. Only actual inaccessible dependencies may be called blocked.

## 2026-10-17 continuation checkpoint

A second fetch found no new remote commits: origin/main remains 0fcdfa667d1276cfe7e9834ae87d42d917251dfb. Existing local work and the separate API investigation worktree remain preserved. New complete engine/controller/API/host/factory/test reads are annotated, with hashes/ranges in the queue. [Terminal-state experiment](terminal-state-lab-plan.md) and [receipt](terminal-state-lab-receipt.json) separate in-memory adapter behavior from Java source. [Report-state experiment](report-state-lab-plan.md) and [receipt](report-state-lab-receipt.json) validate failed-scanner/no-recorded-gaps coexistence using synthetic inputs. No production fix or Java runtime claim. Continue AbstractPlugin, exact installed network/scan-rule addons, Session context cleanup, alert persistence and relevant tests, followed by Nuclei.

Installed addon provenance is preserved in [addon-artifacts.json](addon-artifacts.json). Matching source snapshots extend the unread queue without resetting it. [Network continuation](zap-network.md) follows actual outgoing request, redirect, authentication recovery and rate-limit behavior.

## Real-daemon follow-through

[Directory-rule walkthrough](zap-directory-rule.md) now traces one installed rule and its tests. [Normal receipt](real-zap-lab-receipt.json) confirms /allowed to /allowed/ path expansion; [stop receipt](real-zap-stop-receipt.json) confirms status100 and adapter completed while an in-flight response remained pending, with an alert arriving later. These are owned-loopback runtime results, separate from earlier simulations. No production fix implemented.

## Nuclei follow-through

[NBRET capture lifecycle](nbret-capture.md) now includes complete collector/harness/test source reads and a [synthetic finalization receipt](capture-finalization-lab-receipt.json). Injected detach failure rejects first finish, while second finish resolves without evidence file; no browser run or production fix. [Project-cache component plan](nuclei-project-cache-lab-plan.md) and [receipt](nuclei-project-cache-lab-receipt.json) separate byte-key replay behavior from still-unvalidated full-engine principal confusion.

[Template path](nuclei-template-path.md), [matcher path](nuclei-matchers.md) and [HTTP execution/client/policy path](nuclei-http-path.md) record complete-file ranges and unresolved dependencies. [Matcher lab receipt](nuclei-matcher-lab-receipt.json) records26 passing stub/configuration tests, with no live model or target. [Composition receipt](nuclei-composition-lab-receipt.json) records a failed build and zero executed tests because Windows blocked a transitive module archive. Controls remain unchanged and that download is not retried. Source predictions from that experiment remain unvalidated. [Repeated real-ZAP receipts](real-zap-repeats.json) preserve two normal and two stopped runs rather than overwriting the individual baselines.

Latest fetch2026-10-17: main and origin/main still0fcdfa667d1276cfe7e9834ae87d42d917251dfb. Current next reads: HTTP construction, event creation, auth/project cache identity, pool lifecycle and their tests; NBRET capture/identity expansion and ZAP alert persistence remain outstanding. These accessible tasks are not blocked by the one Nuclei build dependency.

[Probe/check/identity continuation](nbret-checks-identity.md) now traces scope, bounded transport, probes, assertions, offline matching, baseline comparison, contract proposals and reader/scenario reports. Earlier E01 runtime evidence remains separate from new source concerns.

[Source/discovery walkthrough](nbret-discovery.md) covers acquisition, route catalog, example/exploration status, static parser and report entry points. [Synthetic source-identity receipt](structure-identity-lab-receipt.json) confirms initiator linking accepts a deliberately mismatched saved script while coverage correlation rejects that mismatch. This is a local evidence-integrity scenario, not demonstrated tampering in customer environments.

[ZAP alert persistence](zap-alert-persistence.md) now follows alertFound, history promotion, DB/tags, tree/events, false-positive/XML filtering, refresh and deletion; distinguishes default Paros table from alternate experimental SQL table. Source-only positional mismatch in alternate SQL update is not attributed to default runtime. Remaining DB/history/tag/report dependencies stay unread in queue.

[Nuclei rendering receipt](nuclei-render-lab-receipt.json):15 top-level component tests pass (21 events with subcases), supporting single-render data/code separation with stub allocators/helpers. No module network/target/model calls. This is positive evidence for an implemented guard, separate from LLM postprocessing weaknesses and unresolved cross-file execution boundaries.

[Credential selection continuation](nuclei-auth.md) traces ordered providers and host-level secret matching; overlapping strategy order, dynamic refresh and principal/cache binding remain explicit questions. No real credential use.

[Dynamic-auth receipt](nuclei-auth-lab-receipt.json):13 top-level tests pass (57 pass events with subcases), validating tested callback synchronization/reentry and cookie ownership with synthetic data. Failed auth fetch yields nil strategies; no full-engine unauthenticated-send runtime claim. Module network disabled.

[Template execution/output walkthrough](nuclei-execution.md) traces generic, multiprotocol, Flow VM, scan context, writer and tests. Flow true can mean extraction/protocol control, progress includes skipped branches, writer boolean can remain true after output failure. These are source-only semantics, not a claim of externally validated findings. Public-target upstream tests were read and explicitly not run.

[ZAP Alert object receipt](zap-alert-object-lab-receipt.json) confirms nine object-level assertions including clone identity omissions and cached SYSTEMIC behavior, with assigned-ID/tag-order controls. Installed jar methods executed in an owned Java process; no daemon/target/DB. Caller/report impact remains unvalidated.

[Modern ZAP reports](zap-reports.md) traces filtered tree selection, count semantics and template/artifact generation at pinned reports0.43.0. It is a distinct path from legacy XML, raw alert API and NBRET simplified report. Source-only filter/error/persistence questions remain explicit.

## 20:40 UTC report checkpoint — active

[SARIF transformation and serialization experiment](zap-sarif-lab.md) now follows installed classes through the pinned JSON template: two identical locally parsed synthetic artifacts preserve cookies/custom keys/query/body fields while masking Authorization. [Report-filter experiment](zap-report-filter-lab.md) validates raw site-prefix inclusion and original-tree fallback under an explicit injected getter exception, with ordinary filtering controls. Neither demonstrates a target-triggered error, customer exposure or scanner scope escape. Complete helper/test reads reveal a specific truncation test ignoring its own case limits/expected outputs; recorded without claiming implementation failure. Earlier source-only statements above remain historical checkpoints; follow the linked walkthrough for current evidence status.

Next: finish report rule/metadata and integration tests; trace context inclusion and DB/history consistency; then return to Nuclei transport/output dependencies. These are accessible active tasks. `node scripts/research-verify-dossier.mjs` checks artifact links/JSON and hashes of read files; it does not certify understanding or security assurance.

[Context continuation](zap-context.md) now completes core Context/test source and confirms report filtering uses include-only membership, independently of context exclusions/inScope. Installed synthetic controls pass; scanner authorization and artifact impact remain distinct. Rule/integration tests have now been read completely; DB/history consistency and Nuclei dependencies remain active.

[Nuclei output continuation](nuclei-output.md) traces result schema, keyed redaction, optional failure records, debug/trace sinks, file writes, formatters and sequential MultiWriter. In-place omission/redaction and partial sink delivery are source findings, not runtime-established here. Full-package testing is not claimed; the earlier blocked dependency is not retried.

[Narrow output-composition experiment](nuclei-output-lab.md) now validates four predefined shared-object/sink-order/failure/count behaviors with unchanged two source files and explicit reduced adapters. This supersedes only those source-only concerns, not redaction/exporter/whole-engine boundaries.

[ZAP history continuation](zap-history.md) traces complete HistoryReference, cached metadata, record and table contract. Missing-body reload can become empty string, and bulk tag cache can advance after caught DB errors; these are source concerns pending default table and fault validation. No production repair or real evidence deletion.

[History-table receipt](zap-history-lab.md) now confirms exact-limit body readback and oversize rejection before row insertion in an owned memory-only HSQLDB fixture. Default table source/options/tests fully read. History cache's complete caller/equality path, tag failure propagation, shutdown and actual DB-to-report completeness remain next.

[Native Nuclei dependency trace](nuclei-native-network.md) pins existing Fastdialer/NetworkPolicy cache artifacts and completes NetworkPolicy root source/tests/license. Narrow test setup did not execute tests (module-cache overlay guard, then uncached standalone dependencies with networking off); scheme/port concerns remain source-only. Complete core legacy proxy trace limits current-default impact of the history-cache component finding. [History lab](zap-history-lab.md) now separately validates eighteen controls including injected history-tag DB failures; shutdown source has been read, not runtime fault-tested.

[Dialer binding experiment](nuclei-dialer-cache-lab.md) validates twelve controls in each of two guarded loopback runs: cached wrapper retains earlier context-IP set/skips changed validation callback, fresh controls honor both. DNS trap0; no third-party requests. [Selected upstream DialWrap test](nuclei-dialwrap-lab.md) separately passes its one-connection regression case. Source-caller applicability remains distinct from these component successes.

[Input-to-transport identity](nuclei-input-identity.md) now traces complete MetaInput/list provider and exact previously read HTTP/pool callers. Multi-IP input identity can differ from shared transport/dialer identity, while event `ip` prefers requested CustomIP. This is a concrete full-workflow test hypothesis, not yet an engine-validated attribution failure.

[Prioritized finite backlog](priorities.md) records the exhaustion instruction and actual boundaries. All partial files are now closed; Model631 completes the formerly partial history lifecycle caller. [Remaining NBRET test/demo source](nbret-test-evidence.md) completes the original48-file NBRET inventory, with eleven newly selected browser-free tests passing. This is not broad task completion: pinned ZAP/Nuclei/addon/material dependency queues and caller/impact questions remain accessible and active.

Upload buffering follow-through: [plan, repeated results and limits](nuclei-upload-buffer-lab.md). Exact buffering functions with inert upload stand-ins omit the crossing record; four fixture checks establish the branch behavior, not cloud/customer outcomes. See expanded [input/selection/lifecycle trace](nuclei-input-identity.md) and [output trace](nuclei-output.md).

2026-10-17 continued checkpoint: [HTTP cache budget lab](nuclei-http-cache-budget-lab.md) and [unchanged WAF telemetry component tests](nuclei-waf-component-lab.md) add repeated, isolated runtime evidence. Expanded [input/identity walkthrough](nuclei-input-identity.md), [output/telemetry walkthrough](nuclei-output.md) and [current ZAP network walkthrough](zap-network.md) record source ranges, test limitations and contrary evidence. Investigation remains active; the queue is not exhausted.

2026-10-17 later checkpoint: [installed AlertSet projection lab](zap-alert-set-lab.md) repeats actual object-level stale-maximum counterexamples with compensating caller limits; [ZAP history annotations](zap-history.md) and [attack-mode scope trace](zap-network.md) preserve source vs runtime distinctions. Nuclei selected indexed HTTP implementation/tests now complete source reads; no full-engine suite pass.

- [Structural hierarchy consistency lab](zap-structure-lab.md): installed low-memory node/table classes; isolated repeated counterexamples, no live scanner impact claim.

- [Structural naming round trip](zap-structure-name-lab.md): repeated insertion-helper/public-lookup mismatch with parameter-free control; explicit reflection/history limitations.

- [Reporting controls and status interpretation](report-interpretation.md): ordinary UI versus automation editor, empty/null/allfalse, independent context/risk filters, and limits of PASS/URL/GUID fields.

- [Report interpretation envelope proposal](report-assurance-proposal.md): new design inference, required access, small inert prototype criteria and falsification; no implementation or market-demand claim.

- [Reporting boundaries comparison](reporting-boundaries-comparison.md): selected NBRET/ZAP/Nuclei paths, evidence-tier limits and open questions; no rankings or full-product assurance.
