# Implementation inventory for the offline foundation

Inventory by Bryn, 2026-10-18. Source inspection only; no assessment, demo, research experiment, scanner, target request, installation or inference was executed. Version/help commands and the permitted research-register search were used. No credentials, environment values, agent settings or authentication stores were read. The shared tree contains substantial existing modified/untracked work; nothing was cleaned, checked out or committed.

## Recommendation for Skye

Build an offline investigation journal and report package around retained assessment artifacts. Reuse identity bindings and assertion semantics; keep evidence immutable and interpretations versioned. The first increment should accept local, explicitly supplied records, preserve provenance and objections, resume by replaying durable records, and render the three requested output categories. It should have no target executor, model launch, scanner, browser or network capability. Existing interactive coding-agent sessions can operate it manually. This follows Skye's architecture direction and the discovery decisions; it does not implement autonomous investigation.

Use a pure domain core plus a separately owned local store. The core validates events and derives state without filesystem, clock, random, process or network dependencies; supply IDs/timestamps explicitly. The store owns bounded reads, ordered append, concurrency control and recovery. Commit an event before acknowledging it. A report is a derived snapshot linked to a journal head, never the authoritative state. Decide the durable write/recovery contract explicitly before implementation; existing helpers do not supply it.

## Reusable source and its limits

| Source | Observed capability | Foundation implication |
| --- | --- | --- |
| `src/assessment/core.mjs:10` | Canonical JSON SHA-256 digest | Reusable for JSON record identity, with explicit schema/version and JSON-only values. It is not producer authentication. |
| `src/assessment/core.mjs:18` | Engagement validation: actors, policy/build, explicit cases, semantic JSON security assertions, controls and budgets | Useful import contract. Its mandatory predefined cases are too narrow for a URL-first investigation record. Keep investigation schema distinct. |
| `src/assessment/core.mjs:71` | Binding includes principal, tenant, role, session epoch, environment revision, policy, case, request, oracle and controls | Preserve this complete envelope on imported observations. Labels remain operator declarations. |
| `src/assessment/core.mjs:84` | Offline evaluation requires engagement digest, terminal evidence and exactly one matching observation; checks binding and entry digest | Reuse for historical adapter evaluation. Missing/ambiguous/tampered evidence becomes incomplete. Do not map a passing predicate to a clean application. |
| `src/assertions.mjs:15`, `:60` | Own-property RFC6901 lookup; semantic predicates; missing/redacted evidence unavailable | Reusable predicate semantics; not an independent effect oracle or proof of producer truth. |
| `src/assessment/core.mjs:161` | Clone-and-review results, unique finding reviews, rationale/impact/remediation/owner, confirmation gated on controls, parent digest | Useful review shape, but reviewer is free text and no reviewer independence, actual re-observation or Kotaro verification is enforced. |
| `src/assessment/core.mjs:178` | Retest requires different declared repair revision, stable claims/actors/policy/requests/controls, working current controls | Preserve as bounded case comparison. Allows changed session epoch; does not establish actual session identity, class-wide repair or independent review. |
| `src/assessment/core.mjs:205` | Markdown report with tested cases, evidence IDs, impact, remediation, review and exclusions | Reference renderer. Missing discovery branches, questions, rejected-candidate history, independent verification provenance and the requested three-category reporting model. |
| `src/assessment/cli.mjs:14` | Re-evaluates retained evidence before review/retest and checks factual result fields | Useful import verification pattern. Does not authenticate review metadata or enforce reviewer independence. Review starts from re-evaluated candidates, so cumulative review history needs its own journal. |
| `src/assessment/matrix.mjs:4` | Explicit allowed actors expand to owner/foreign cases; resets authorization to draft | Later reuse for declared access rules, not discovery or policy inference. |
| `src/evidence-files.mjs:4` | Realpath containment and pre/post-read byte caps | Useful local artifact read pattern. Containment is not OS access separation or protection from a hostile concurrent filesystem writer. |
| `src/assessment/core.mjs:115`, `:222` | New-directory exclusive writes; bounded JSON load | Useful primitives, not an atomic multi-file transaction, journal or fsync durability guarantee. `loadJson` has a size cap but no run-root containment. |

`core.mjs` currently mixes pure functions, timestamps and filesystem execution. Importing it does not itself execute requests: transport is dynamically imported inside `runAssessment`. Nevertheless a dedicated foundation module should expose only offline operations, with tests checking its dependency boundary.

## Identity split and executor boundaries

`src/checks.mjs:82–83` still uses the first method + sanitized URL + cleaned-body match for offline evidence. Principal, tenant, role, session, environment and uniqueness are absent. `compareChecks` at line 40 compares keys/snapshots without equivalent identity binding. Exclude this path from identity-specific investigation imports unless an explicit adapter rejects ambiguity and supplies independently established provenance. The assessment adapter is a separate implementation; its binding does not repair legacy checks.

`src/assessment/core.mjs:120–158` executes predefined sequential requests, checkpoints after cases and emits final files. It has no resume reader, retry journal, multi-writer fencing, persistent hypothesis graph or per-event history. A crash can leave partial files. Checkpoint replacement uses rename but no explicit fsync; checkpoint terminal state remains running and is correctly rejected as final evidence. These are useful progress artifacts, not a durable resumable investigation contract.

`src/assessment/transport.mjs:5–28` sends supplied headers, retains key-redacted JSON, removes exact known header values in response strings, omits response headers and non-JSON payloads. Case bindings still retain case bodies and expectations. Generic redaction in `src/capture.mjs:5–12` recognizes secret-like keys; arbitrary field values, object keys and encoded/transformed secrets are not comprehensively scrubbed. Do not export arbitrary journal text or artifacts as automatically sanitized.

`src/scope.mjs:2–22` checks exact URL origins. `src/http.mjs:10–57` bounds request time/wire/decoded bytes and follows no redirects. Neither is a destination-IP/DNS/network sandbox. Cancellation is checked before/subsequent cases (`core.mjs:136`, `transport.mjs:6`); it is not passed into `requestBounded`. In-flight requests finish or time out. These executors stay outside the first increment.

## Installed capabilities observed locally

| Item | Evidence/version | Verified interface and remaining uncertainty |
| --- | --- | --- |
| Node | `node --version`: **v24.21.0**, executable `C:/Program Files/nodejs/node.exe` | Meets root `package.json` engine range. Built-in test runner and filesystem/crypto available; no package install needed for offline core/store. |
| NBRET | root `package.json`: **0.1.0** | ESM; `assess` routes to `src/assessment/cli.mjs`. Root `test` expands all test files and is not a scoped offline gate. |
| Dependencies | Installed `node_modules/{playwright,rea-agents,sharp,postcss}/package.json`: **1.64.0 / 6.4.0 / 0.35.5 / 8.5.29** | Installed manifests match declarations. Runtime loading/native binaries not exercised. |
| Codex | `C:/Users/kotar/AppData/Roaming/npm/node_modules/@openai/codex/package.json`: **0.163.0**; `codex --help` succeeds | Advertises `exec`, `review`, `resume`, `app-server` (experimental), MCP and sandbox options. No session/model launch, SDK installation, subscription automation entitlement or enforcement was tested. |
| Claude Code | `C:/Users/kotar/.local/bin/claude.exe` file/product metadata **2.1.302.0**; `claude --help` succeeds | Advertises print/noninteractive output, resume, output formats and tool controls. No inference, authentication, billing, effective permissions or subscription/API entitlement tested. |
| Computeruse | `src/harness.mjs:6–10` refers to existing computeruse root and Python bridge; `scripts/harness-browser.py` is the bridge path | Source configuration observed, not a running-browser health check. Harness child inherits parent environment. No browser/desktop step was needed or performed. |
| REA | `src/rea.mjs:7–17` invokes installed REA inspect-web-page CLI via hidden child | After-actions observation, not autonomous assessment or a security isolation boundary. No invocation performed. |

No claim that these are latest upstream versions is made. No new provider, API or framework is needed for the offline increment. Help output establishes discoverable commands only; it does not establish successful inference, free usage, independent agents or sandbox enforcement. Machine-wide capability inventory beyond these located programs is incomplete.

## Evaluation and isolation gaps

The inspected modules have no enforced split between target preparer, investigator and reviewer. Different names, work directories or sessions on this shared account do not prevent reading the answer key, source, board or memory. An offline review packet can record provenance and declared independence but cannot truthfully certify access separation. Aiko's critique and the updated blind/guided distinction in `discovery-decisions.md` remain acceptance constraints for later evaluation.

The first increment should record evaluation mode, assistance/hints, actor and environment provenance, missing observations, review objections and a separate Kotaro verification event. Independent-effect confirmation must require its own referenced observation and reviewer provenance; a typed status alone is insufficient. No experiment here measures discovery quality, review error, recall, pricing, teaching effectiveness or client readiness. The Synapse engine was not searched across the machine in this inventory and remains an unverified dependency; foundation records should stand alone.

## Research used and contrary evidence

Ran the permitted register search for “identity evidence finding record review retest agent runtime permissions”; read the cited source passages and the E01 correction. This inventory adds no research finding or experiment to the register.

* `evidence-handling.e01-offline-identity-ambiguity` (component-lab), `authorization.nbret-offline-match-ignores-principal` (source-trace): `docs/research/security-landscape/lab-results.md:29–33`, `deep-review/nbret-checks-identity.md:17–23`, and `implementation-reviews.md:67–75`. These establish a narrow fixture/source evidence-selection defect, not a live-client vulnerability. Current source inspection agrees. Correction `corr.evidence-handling.e01-still-present` explicitly distinguishes legacy checks from operator-declared assessment bindings.
* `standards.claim-record-fields` (synthesis): `docs/research/assessment-evidence/framework.md:33–49` calls for versioned identity, evidence/producer/redaction history, status, exclusions and revalidation. Its contrary passage `coverage.md:22` says reviewer-comprehension improvement remains untested. Adopt the record structure as a design choice, not validated superiority.
* Evaluation limits: `framework.md:5–15` requires frozen criteria, comparable access/budget, held-out families, assistance provenance and all failed runs; `framework.md:28` states open-world recall is unknowable. These are protocol requirements, not a benchmark result.

The research and inspected prototype agree on separating observations from interpretations. The prototype's stronger identity envelope is useful contrary evidence against saying all NBRET paths are identity-agnostic. Neither sources nor inventory establish OS isolation or independent verification.

## Recommended acceptance tests for the assigned foundation

All below should use in-memory synthetic records or owned temporary files, with no listener, target request, browser, scanner, model or package install.

1. Round-trip create/append/reopen/replay yields identical derived state and stable IDs; reports link the exact journal head. Inject failure before/after commit and after partial tail write; never acknowledge an uncommitted event or silently discard accepted history.
2. Two writers with the same expected revision cannot both commit. Duplicate event IDs are idempotent only when their bytes agree; conflicting duplicates and out-of-order/forked records fail explicitly. Stale locks and interrupted recovery need a documented outcome.
3. Imports reject changed identity/session/build/policy/oracle, duplicates, missing entries and altered bytes. Preserve original artifact references and digests. A checkpoint cannot masquerade as final evidence.
4. State transitions retain rejected candidates, objections, superseded interpretations, missing/blocked branches and pending questions. Review and Kotaro verification remain separate events. An author's self-review or unsupported confirmation cannot be rendered as independent verification.
5. Three report categories match the saved evidence/review state. No empty or incomplete investigation becomes clean; no disappearance becomes repair. Historical reports remain reproducible after later events.
6. Bounded local reads/writes reject traversal, symlink escape and oversize inputs; report text cannot introduce active HTML. Export includes only explicitly selected artifacts and flags redaction/retention limits. Do not claim generic secret detection from a few synthetic examples.
7. Dependency tests and denied-network/child-process stubs prove the foundation commands cannot invoke executor, scanner, browser or inference paths. Pure-core tests supply time/IDs; store tests own and remove only their temporary directory.

## Inspected test entrypoints; none executed

`node --test test/scope.test.mjs` is pure and contains one URL-validation test with no requests or filesystem writes. It is a suitable existing offline smoke gate once implementation is assigned.

`test/assessment.test.mjs:145–155` (“matrix expands actor-resource rules into explicit cases and resets authorization”) is a pure test. A name-filtered invocation is a potential offline gate after confirming the runner filter; do not run the whole file for this inventory. The other tests create loopback listeners, send synthetic requests, spawn the assessment CLI and remove their own temp directories (`:18–31`, `:34–143`, `:157–184`). They are local fixtures, not no-network tests. They reveal the existing intended acceptance behavior but were not rerun.

Root `npm test`, research scripts and demo commands are not approved substitutes for a focused foundation gate. `test/contracts.test.mjs` also writes persistent fixture files under `runs/`; no claim is made here that the entire repository suite is pure, isolated or safe to execute without further inspection.
