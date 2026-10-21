# Observation and execution audit for an adaptive website investigator

Thistle, 2026-10-21; read-only source audit for Cass. **We have useful observation, evidence and operator-interface components, but no existing path combines an unfamiliar website, observation-driven coding-agent decisions, a complete outside-model action boundary and a live monitor.** The next integration should connect these pieces around one real permitted investigation, rather than relabel the scripted rehearsal as autonomy or replace the whole foundation.

## Scope and evidence

Read root `AGENTS.md`/`CONTEXT.md`, track `AGENTS.md`, the research usage guide and relevant source/studies. Ran the required research lookup for autonomous browser exploration/forms/authentication/session/capture/scope. No browser, target traffic, scanners, providers, old lab scripts, installs or runtime tests were launched. Only this report was written; no shared source/context/register or prototype UI edits and no commit.

Latest scope relayed by Cass: Kotaro selected `https://tobirastudio.com` as the first real-site acceptance target and states ownership. Cass is doing fresh public read-only mapping on that exact HTTPS origin. Contact-form submission, account actions, third-party expansion and live mutations are excluded. This changes that new scope only; it does not resume prior stopped research. I made no request to the site and claim no current page, login, technology or vulnerability facts about it. The URL-only registration requirement is a broader lab capability, not evidence this agency website has registration or an admin ladder.

All current-code conclusions below are **source-trace**, not current runtime proof. Prior component results and vendor descriptions retain their original narrower labels. Working branch is `kotaro/synapse-consolidation`; HEAD at inspection was `8e42aeeae452ce626f79dae2d9f5bf96c915556e`. Active peers may change sources after this inspection. Paths below are repository-root-relative unless prefixed with the track directory. No tests mentioned in old studies were rerun here.

## Reuse, adapt, missing and incompatible

“Reuse” means a relevant existing primitive, not automatic runtime admission. “Incompatible” means its present contract conflicts with the intended integration or PC rules, not that the work should be deleted.

| Capability | Source evidence | Disposition and concrete implication |
| --- | --- | --- |
| Existing computeruse browser connection | `tracks/synapse-workflow/src/harness.mjs:6–32`; `scripts/harness-browser.py:1–31` under the track | **Adapt.** Existing repo/Python bridge, hidden subprocess, one pending request, generic errors and 45-second timeout. This is a usable route into the preferred harness, but timeout kills the bridge; close does not await child exit or explicitly reject a pending call. It inherits the parent environment. Browser/host authority is not narrowed by this bridge. |
| Paginated DOM/text and readiness | Track `src/harness.mjs:34–69` | **Reuse with binding changes.** Bounded text/elements, stable URL across chunks and explicit truncation flags. A stable URL is not a stable DOM revision/session, and `ready` absent is treated as settled. Bind observations to tab, identity/context, navigation/revision and collection interval. |
| Link discovery and route/state inventory | Track `src/explore.mjs:8–113` | **Adapt.** Bounded link queue, depth/page/state/time limits, text/DOM fingerprints, skipped reasons and cleanup. This is breadth-first discovery plus supplied interaction names, not a model choosing new actions. A fingerprint measures captured appearance, not semantic state equivalence. |
| Named browser actions | Track `src/interactions.mjs:1–24`; `src/harness-capture.mjs:51–80` | **Incompatible for general signup; useful narrow read actions.** Capture can click/hover/fill selected nonpassword fields; it excludes password inputs, frames and risky-name matches. Explore accepts click/hover only. These guards intentionally exclude common submit/send/register flows. Do not silently disable them to achieve registration; add a separately admitted credential/form action contract. |
| Persistent multistep browser investigation | Track `src/explore.mjs:77–93`; `src/harness-capture.mjs:17–29,101–115` | **Missing integration.** Explore resets to the source page before each supplied interaction, so it does not compose a registration/verification/login workflow. Harness capture runs a fixed interaction list and closes its tab by default. A new bounded session controller needs one owned tab/context, a fresh observation before each selected action, and explicit state/history. |
| CDP HTTP/redirect/cache/script observations | Root `src/capture.mjs:63–165`; track `src/capture.mjs:42–149` | **Reuse/adapt collectors.** Pair request/response/failure, action intervals, initiators, cache metadata, bounded structured bodies and omission reasons. Configured origins filter retention, not outgoing browser traffic. Body hashes frequently bind sanitized representations rather than original response bytes; record representation and original digest separately when available. |
| Links, geometry, page metadata and coverage | Track `src/capture.mjs:178–230` | **Reuse partial observation.** Snapshots include bounded geometry/styles/links, accessibility heuristics, storage counts and optional V8 coverage. They do not provide a complete form schema or a general accessibility audit. V8 execution counts are not application/security path coverage. |
| Multi-target workers/frames | Root `src/targets.mjs:52–117`; root `src/run.mjs:136–144` | **Adapt, not default broad attachment.** Root has bounded worker/frame recorder and target lifecycles; track harness capture declares page-only limits. Root attaches through an owned browser endpoint and pauses targets for instrumentation. Do not attach to unrelated tabs/targets in the shared harness. Shared-browser target ownership and permitted frame origins must be established first. |
| Screenshots and visible text | Root `src/visual.mjs:5–29`; track workbench screenshot registration routes | **Adapt.** Root already produces sequential DOM/screenshot artifacts with identity/action metadata, explicitly unredacted. Harness bridge does not currently expose its native screenshot operation. Any monitor image must be a real registered capture with time/context and privacy limits, never a recreated page or fabricated effect. |
| Session persistence | Root `src/sessions.mjs:5–66` | **Adapt, confidential only.** Validates and imports/exports cookies, localStorage, sessionStorage and IndexedDB. Cookie scope is domain-based, and sessionStorage export picks the first observed frame per origin. Raw session exports are secret artifacts, not public evidence or monitoring data. No complete account lifecycle/credential broker is supplied. |
| Selector-based action scripts and fresh browser profile | Root `src/run.mjs:56–89,126–165`; track `src/run.mjs:18–61` | **Incompatible as a direct PC browser executor.** They can fill/click supplied selectors, but isolated mode launches headless persistent contexts. Use the established computeruse route under Kotaro's standing preference. These fixed action arrays are also not an adaptive investigator. Keep root capabilities as source references until explicitly integrated and verified. |
| Proxy support and TLS diagnostics | Root `src/investigation.mjs:9–40`; `src/run.mjs:43–53,74–76,235–242`; `src/proxy-client.mjs:8–66` | **Adapt selectively; no safety-boundary claim.** Proxy settings are credential-free; trusted-CA capture accepts certificate errors and audits chains afterwards. Separate COPY can use its own direct connection. A post-hoc TLS audit cannot protect already-sent credentials, and a proxy option is not mandatory egress mediation. The loopback-only TLS diagnostic is not an external assessment executor. |
| Offline endpoint inventory and request export | Root `src/investigation.mjs:44–91`; `src/analyze.mjs:11–44` | **Reuse derived evidence.** Export observed methods/paths, statuses, query keys, action associations and omitted-body counts. It is an inventory of recorded traffic, not all routes. Postman examples omit credentials and warn that replaying writes repeats effects. Cached analysis is not a new observation. |
| Local replay | Root `src/replay.mjs:8–55` | **Incompatible as external authenticated replay.** Explicit literal-loopback destination, manual redirects, writes opt-in, incomplete/redacted inputs rejected, auth/cookies omitted. Valuable negative boundary; do not widen it into a real-site replay tool by substitution. |
| Explicit identity-bound API cases | Track `src/assessment/core.mjs:19–81,84–128,137–184`; `src/assessment/transport.mjs:5–32` | **Adapt for later admitted API questions.** Cases bind actor/environment/policy/oracle/controls, validate authorization window and declared write permission, use semantic assertions and retain incomplete results. They require supplied cases and environment credentials; they do not discover registration, refresh credentials, extract multistep variables or implement a browser session. |
| General bounded HTTP | Track `src/http.mjs:10–64`; `src/scope.mjs:2–25` | **Adapt, not an external containment solution.** Exact-origin selection exists at the caller; requestBounded permits general HTTP(S) with normal resolution and does not receive an AbortSignal. Assessment checks signal before sending, so a later abort does not directly cancel that request. Timeout bounds an attempt; no supplied egress sandbox or shared target-wide load accounting follows. |
| New local guided HTTP/SMTP session | Track `src/lab/transport.mjs:88–239`; `src/lab/run.mjs:59–150`; `src/lab/cli.mjs:45–88` | **Reuse patterns; incompatible destination contract.** Typed loopback requests, accumulated budgets, cancellable active work, secret handling, durable observations and interactive JSONL exist. Local bearer account handling and delivered-mail correlation are real, but limited to owned local protocol/headers and services. No arbitrary external URL or browser option exists. |
| Live operator workbench | Track `src/practice/workbench-server.mjs:10–110`; `workbench-ui.js:5–18,21–60` | **Adapt UI/event concepts.** Live one-second polling, current proposal/reason/evidence, decisions, observations, owner requests, pause/stop/priority, rejection state and export already exist. Execution is hardwired to `createPracticeTarget`, not a website adapter. “Continue” repeatedly executes deterministic selector proposals. |
| New lab monitoring GUI | Track `src/lab/cli.mjs:45–102`; `src/lab/run.mjs:150–182` | **Missing live GUI.** The lab offers JSONL status/requests, journal and exported canonical HTML; it is not attached to the workbench server. The requested three new UI prototypes are saved-rehearsal replays per Cass's latest direction; replay presentation must remain visibly distinct from a live connection. |

Root/track capture modules differ materially. The root carries richer sessions, visual/proxy and multi-target options; the track carries preferred-harness capture and Explore. Neither should overwrite the other because names match. The task is to integrate the needed primitives, not restart every preserved path.

## The strongest exact gaps

### 1. The decision maker is still separate from operational observation

The workbench has a session-proposal entry point with question, reason, evidence IDs and typed action; it appends intent before target execution and outcome afterwards. This is a strong reusable transaction pattern (`src/practice/workbench.mjs:174–208` under the track). But fresh workbench creation calls `createPracticeTarget()` directly (`:100–131`), and `chooseNext` supports fixed actors, action kinds and order workflow states (`src/practice/next-step.mjs:3–10,30–46`). The model cannot currently choose a new ordinary website action through that runtime.

The target adapter corroborates known practice actors, objects and transitions using its private local app request log (`src/practice/session-target.mjs:7–15,58–156`). This is meaningful local evidence and an actual execution gate, but neither its actor list nor its app-private identity receipt can be carried over to an unfamiliar site. Preserve the journal/intent/rejection/progress contract, replace only the selected adapter/decision source under a new explicit contract, and retain operator-declared versus externally corroborated identity limits.

The lab runner likewise validates a specific public API guide and hardcodes registration/login/orders/replay sequences (`src/lab/run.mjs:237–295`). Its interactive session permits an operator to choose requests; that makes it operable from a coding session, not an already implemented autonomous planner. A prewritten sequence with observation-shaped checkpoints does not demonstrate adaptive selection.

### 2. Browser-native capability exists beyond the NBRET bridge

A bounded read-only inspection of `C:/Users/kotar/githubprojects/computeruse/harness/browser.py:15–20` shows native operations include `form`, `select`, `password`, `tabs`, `screenshot` and more. The NBRET Python bridge admits only `new_tab/read/find/navigate/close_tab/hover/click/fill/scroll` plus its connection endpoint (`scripts/harness-browser.py:17–24` under the track). Therefore “NBRET lacks integrated form/password support” must not become “the existing harness cannot do forms.” Raw native operation availability is not approval to expose every operation: especially do not add generic `script`/input execution to bypass typed-action mediation.

The browser module also supports named secret references and profile-aware windows (`browser.py:20,96–165`); this audit did not inspect all of their implementation or validate credential/profile isolation. A dedicated browser identity/context and verified account binding are still required before signup/auth investigation. An owned tab in a signed-in profile is not a new isolated identity. Default profile reuse can send ambient cookies even in a nominally anonymous investigation.

### 3. Scope selection is not complete enforcement

`createScope` is a good exact-origin URL selector. Explore admits initial/queued navigation and checks final observed URLs. However page redirects, subresources, frames, workers, speculative loads and automatic requests are not prevented by its allowlist. Harness capture opens a new tab at the URL before attaching its recorder and then navigates again (`src/harness-capture.mjs:27–44`). Thus the initial traffic is unrecorded, and both visits can have ordinary effects. Recording an out-of-scope request after the fact is not blocking it.

Before claiming the external executor enforces exact-domain scope, demonstrate that every enabled network/action route is mediated before dispatch, including redirects and browser side traffic. Do not advertise a page-route interception callback alone as OS-wide egress isolation. If the approved harness cannot provide the necessary restriction, use an appropriately narrower observation route or record the specific unsupported capability; do not widen origins, create an alternate browser or replay an old tool to make it work.

For the first TOBIRA pass, retain exact `https://tobirastudio.com` scope. An external link, subdomain, embedded form, email link or third-party service is evidence of a boundary, not automatic expansion. A visible “contact” control is not permission to submit it. Captured public page facts can support a question; a missing header, returned status or empty scanner output alone cannot establish a meaningful vulnerability.

### 4. A persistent identity and multistep variable layer is missing

General signup needs observed form fields/actions, credential injection without retaining values, CSRF/hidden field handling, a fresh submit observation, dedicated mailbox message correlation, validation of any verification destination, authentication confirmation and identity-scoped continuation. Failures/CAPTCHA/user checks must be explicit blockers. Existing capture only observes traffic and storage counts; it does not manage this lifecycle.

Root session import/export is a useful reference, but raw storage artifacts require separate protected handling. The new local mail sink cannot receive real provider mail: it accepts reserved `.test` recipients and is a local SMTP fixture. The lab's `/api/register`/`/api/login` token extraction and target-generation headers are protocol-specific. The assessment runner pre-resolves environment credentials before executing cases and does not update them from earlier responses. These are three different identity contracts, not interchangeable implementations.

For TOBIRA's current public scope, do not build or invoke signup, mail or authenticated test machinery merely because the synthetic rehearsal used it. Record “not applicable to the observed permitted surface” or “not assessed” accurately; a registration-less website is not a failed lab run.

### 5. Stop, persistence and recovery have independent outcomes

The browser bridge close kills a helper but does not await exit. Explore/capture attempt tab closure but do not re-list inventory as the current PC preference requires. Capture's `finish` sets `finished=true` before detach/write (`track src/capture.mjs:208–246`; root `src/capture.mjs:250–269`). The historical synthetic correction confirms that repeated finish can resolve after a failed first detach without an evidence file; that result concerns a stub, not failure prevalence. A reusable live collector needs independently inspectable persisted/finalized/disconnected/closed outcomes and recoverable failure records.

Stop should first prevent new proposals, then end the owned action and await its actual result/cleanup, close only owned resources, and verify the final inventory. Preserve unknown quiescence; never kill all browsers/Node processes or retry a security-blocked operation via another session. Pause may stop pickup while an admitted action settles; label that separately from hard stop.

## Live monitoring: expose what is happening, without overstating it

The operator monitor and canonical assessment reader have different jobs. Keep the canonical `reader-report.mjs`/`reader-model.mjs`/`reader-ui.js`/CSS as the reader of retained results; a new monitor may adapt the current workbench's operational concepts. This audit proposes no visual design or prototype changes.

Minimum monitor data should come from actual append-only run events, not a staged “agent thinking” animation:

- Connection mode: live-connected, disconnected with last receipt time, saved replay, or completed. Pause replay controls must not appear to stop a real target.
- Current evidence question, observation IDs and reason for the chosen next action; expose concise saved rationale, not private internal reasoning.
- Research consulted: entry/source/version, applicability to this surface, relevant correction, chosen action/control, and what was deliberately excluded. A citation does not establish that a check executed.
- Exact permitted scope/identity/context and remaining budgets, plus current in-flight action versus queued proposals. Show changed scope as a new admitted version, not silent edits.
- Coverage distinctions: discovered, observed, proposed, attempted, completed, blocked, deferred and not applicable; preserve omissions/truncation and unknowns. Do not show “80% secure” or reinterpret V8/DOM counts as vulnerability recall.
- Human steering and review history, rejected proposals, security-block records and verified/unknown cleanup. Blocks retain exact action/reason where available; if the original reason is unavailable, do not invent one.
- Result facts and effect controls, followed by separate hypotheses and conditional consequences. Saved local vulnerable-control data must stay labeled local/familiar and must not appear as a TOBIRA finding.

Current workbench nonce/same-origin/Host checks are useful browser request hygiene (`workbench-server.mjs:29–55`), not authentication against other processes on the same unrestricted Windows account. A live monitor must expose a bounded projection with no session tokens, raw credential bodies, unrelated tabs/accounts or private paths; adding an auto-refresh page does not establish safe session sharing.

## Research that changes the integration

All study paths below are under `tracks/synapse-workflow/docs/research/`. These passages were opened, not just retrieved as cards.

| Research ID / strength | Passage and consequence |
| --- | --- |
| `evidence-handling.nbret-capture-redaction-egress` / source-trace | `security-landscape/deep-review/nbret-capture.md:7–15`: capture origin limits govern retention; key heuristics are incomplete redaction; unavailable bodies and pending/entry limits remain explicit. Current source inspection above confirms the material boundary. Keep request gating and evidence filtering separate. |
| `corr.evidence.capture-finalization-confirmed` / component-lab correction | Same study `:29–35`: injected detach failure followed by a repeated finish yielded no evidence file. Do not leave the older “pending synthetic validation” sentence as the latest conclusion. No browser runtime or repair was tested here. |
| `scanners.nbret-http-path-boundaries` / source-trace with selected historical loopback evidence | `security-landscape/implementation-reviews.md:19–46`: requestBounded has no allowlist; no redirect/retry loop; upstream caller filtering does not enforce DNS/IP egress; cleaned-body hashes differ from raw bytes. Reuse bounded transport concepts, not a sandbox claim. |
| `safety.capability-gate-outside-model` / component-lab | `assessment-evidence/executable-claims.md:25`: fixed gate refused export/cross-tenant candidates; no model or OS sandbox was involved. All operational paths must use the new gate; direct shell/CDP/alternate tool access cannot become an unexamined bypass. |
| `agent-runtime.pentestgpt-full-access-no-scope` / source-trace | `assessment-evidence/deep-pentestgpt.md:12–27`: FULL_ACCESS/SDK configuration depends on deployment isolation, not target validation alone. An “autonomous agent” label cannot replace restricted runtime capabilities. This does not authorize running that upstream system. |
| `authorization.stdlib-cookiejar-semantics` / component-lab | `bots-swarms/cookie-policy-review.md:10–24`: reused jars overwrite sessions, ordinary cookies cross ports, legacy client semantics differ from browsers. Use per-identity state and explicit session provenance; do not generalize a Python fixture to the preferred browser implementation. |
| `ai-evaluation.takumi-pipeline-and-coverage-scope` / public-doc | `cybersecurity-firms/gmo-flatt-security.md:51–59`: documented recon/hypothesis/reproduce/verify stages and session-aware effect checks are a workflow reference. Actual verifier code is not public; use this as a question for our implementation, not measured vendor performance or proof of our integration. |
| `hazard.demo-tiers-active-scan`; existing safety context | `security-landscape/deep-review/nbret-test-evidence.md:9` and `safety-context/README.md:1–45`: historical demos can launch browsers/scanners; prior blocks are not replay instructions. Preserve actual error/action and do not infer the cause of a user-reported pause. No such operation was run in this audit. |

Using all accumulated intelligence means routing each observed question through relevant research and corrections, not running every catalogued tool. For each next-step record retain: question → current evidence → retrieved rule/limit/counterexample → applicable test/control → rejected alternatives → intended observation → actual result. An unused tool may be the correct decision when its access, side effect or effect oracle does not fit. This is how research becomes operational judgment rather than a separate reading archive.

## Smallest real, non-scripted investigator slice

**Question/outcome:** can the existing coding session investigate an unfamiliar permitted public website from a URL, choose subsequent observations from what it actually sees, and let Kotaro watch and steer the real run? Start with TOBIRA's current public exact-domain scope; do not conflate this with the later self-registration acceptance family.

1. Establish one fresh run with immutable public-read scope, budgets, owned tab/context identity and stop behavior. Inventory the selected existing computeruse capability first; use its documented route and preserve all other sessions. Verify the actual request/action restrictions before claiming enforcement.
2. Let the current coding agent see a real bounded page/links/forms observation. It chooses one next permitted observation and records a concise question, supporting observation IDs, relevant research/corrections, expected evidence and disconfirmation. Do not supply a site-specific selector/route sequence or require the synthetic `/api-docs` protocol.
3. A typed executor independently checks that action against the current boundary, observed control/tab/revision and remaining budget. It either rejects with a reason or executes once, retains a bounded receipt and updates the monitor. Do not add arbitrary JS/shell or relax the old submit denylist as a shortcut.
4. Repeat for a small real branch chosen from new evidence: for example an internal page/link whose purpose or interaction needs clarification, if actually observed. Record external links/contact forms as excluded controls, not actions to execute. The choice must change when the actual observed page changes; this discriminates adaptation from a fixed route tour.
5. Retain a useful site/surface map, one supported or refuted question, all skipped/blocked branches and evidence gaps. Let Kotaro pause/change a permitted priority; the next decision acknowledges that steering. Export the canonical reader for actual retained results, without inventing findings. End with verified owned-tab cleanup and preserved records.

Acceptance is real observation → agent-selected action/reason → independent admission → actual receipt → visible monitor update → changed next decision → supported/refuted/inconclusive result → verified stop. A route crawler alone, playback of saved lab events, or a model-generated plan without execution does not meet it. This first slice establishes adaptive public observation, not general security discovery, authenticated isolation, broad outside-model sandboxing or autonomous signup.

The subsequent signup slice should target a separately authorized unfamiliar application that actually exposes registration, use a dedicated inbox/credential channel and multistep persistent state, and independently corroborate identity before authorization tests. It should reuse the proven loop while adding only missing capabilities. Do not make that future slice a prerequisite for a useful public TOBIRA investigation.

### What to build versus defer

Build the narrow observation/action adapter, journal/event projection to a live monitor, real decision/research linkage, rejected/blocked states and tested cleanup first. Reuse the existing coding session for reasoning; a new paid model/provider/framework is not required merely to make the first agent choose a next observation. Broader always-on autonomous execution remains a separately bounded implementation question.

Defer automatic scanner fleets, full-site COPY, blanket raw scripts/storage capture, proxy/TLS trust changes, generic signup attempts, speculative role ladders, broad callback services, hidden target generation and a unified root/track rewrite. None is necessary to show this first outcome. If the actual restriction layer is unavailable, surface that exact gap and narrow the claim; do not substitute a beautiful saved-replay UI for real execution.

## Source snapshot anchors

SHA-256 at inspection (trusted local byte consistency, not provenance authentication):

| File | SHA-256 |
| --- | --- |
| `src/run.mjs` | `5033a7bf34fdeb58b83345f39e0f9d2dfeb9a958c5f98bb0ac363213ac8d716a` |
| `src/capture.mjs` | `e730de565711fe4121ab0871d492373bdfef7f28be054dfbf93d8ccf73ea79d5` |
| `src/sessions.mjs` | `6e06671d1cc932e882e44dd380497fcd1797ada7c027f5c1924ae32a102eeef4` |
| Track `src/explore.mjs` | `9b5dd6a4111367fd3c0196af97238fd3662769e698186503d6fe22bbbe278fbc` |
| Track `src/harness-capture.mjs` | `5d903df97a2e435b342da31069924aecb5ac9a30d0e9a1a2646b90e4abc3ea2c` |
| Track `src/capture.mjs` | `53c9b1be8ee9a44c2d7bf95c59ec78d3b6073239c480f580f29158a2860c0dc5` |
| Track `src/practice/workbench.mjs` | `37779479dbeaf610196aa1e9707f24ca19c0728d11fc1c73f1763134dbbc69aa` |
| Track `src/lab/run.mjs` | `9c92e6fa3dac7876fb54a57eddc4de23d6a6df3d14f543dc32d65c311a4d18e5` |
| Track `src/lab/transport.mjs` | `53584dd6e0f2865eeb323e06ff5a9ee8ffec9db82be057397788595bb7967220` |

Read coverage was targeted to observation/execution/UI integration, not a full audit of every root/track module or the external computeruse repository. Current runtime compatibility, site behavior, browser isolation and live-monitor operation remain untested here. No browser task was performed, so no task-owned tabs/windows were opened.
