# Cloudflare security-audit-skill: source review for the Synapse research lab

Reviewed by Thistle on 2026-10-21 for Cass. **Recommendation: use this as a source-assisted investigation method and artifact-contract reference, not as a ready-made URL-only investigator, execution sandbox, or benchmark scorer.** Its strongest contribution is requiring a concrete boundary failure, adversarial review, explicit missing facts and visible coverage gaps. The executable portion validates declared records; it does not establish that their security claims are true.

## Scope, provenance and evidence strength

- Repository/origin: `https://github.com/cloudflare/security-audit-skill`.
- Full reviewed HEAD: `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`.
- Local source root: `C:/Users/kotar/githubprojects/NBRET/.tools/repository-reviews/2026-10-21/security-audit-skill` (Git-ignored, verified before cloning).
- License: MIT, copyright 2025–2026 Cloudflare, Inc.; preserve its notice for copied substantial portions. [Pinned license](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/LICENSE#L1-L21).
- Read all 22 tracked files, 328,101 working-tree bytes: README, license, four workflow documents, attack catalog, ten domain companions, schema, both validators and both test files. No upstream code was executed, including validators and tests. The external `SKILL.md` was research data, not an installed or applied skill.
- Companion receipt: [cloudflare-provenance-thistle.json](cloudflare-provenance-thistle.json), with capture time, origin, full HEAD, clean source status, per-file SHA-256, Git blob ID, size and line count. These bind this inspection to bytes; they do not authenticate upstream authorship or attest runtime correctness.
- Evidence labels: **public-doc** for prescribed behavior and upstream claims; **source-trace** for executable control flow and authored test assertions; **synthesis** for our proposed reuse. No integrated-lab or component-lab result was produced here.

For every upstream citation below, its exact local counterpart is the source root above plus the displayed repository-relative filename and the cited line interval. The source index at the end supplies explicit local paths and read ranges.

Before acquisition I read root `AGENTS.md`, `CONTEXT.md`, the track's `docs/research/reconciliation/USE-RESEARCH.md`, and ran the prescribed research search for Cloudflare audit/verification/evidence. A case-insensitive search for `security-audit-skill` across root `docs` and track `docs` returned no prior exact-name coverage at inspection time. This is a bounded text-search result, not proof that no related ideas exist. Existing relevant work includes the evidence-admission worksheet/record reviewer, evaluation-admission contract, casebook and canonical reader. Their limitations already reject the equation “well-formed record = demonstrated effect.” Cass owns subsequent register admission; this report changes no register, shared source, interview or root context.

## Alignment with settled product decisions

Cass's [2026-10-21 decision reconciliation](../../../../../../docs/consolidation/decision-reconciliation-2026-10-21.md) and the track's [October 18 discovery decisions](../../../synapse/discovery-decisions.md) are the planning basis. Adaptive target hypotheses, one initial scope approval with autonomous permitted work, conversational steering, evidence/retest, guided/blind/familiar separation and measured iterations are already settled. New direction broadens this into a security research lab with bounded agent-written helpers, supplied and generated disposable targets, URL-only self-registration and a dedicated readable test inbox. This review maps Cloudflare ideas onto that direction; it does not reopen those preferences or select a replacement architecture.

Separate target hypotheses (a particular rule fails), method hypotheses (a strategy/helper improves discovery) and platform hypotheses (orchestration/evidence changes improve operation). Cloudflare primarily contributes source-audit method and review/artifact discipline. Its restrictions on local execution are the upstream method's conditions, not a new request for per-test approval inside our already admitted lab scope. Any future helper still inherits the lab's actual capability, evidence, resource and stop boundaries, and cannot modify its own scorer or authority. Source-assisted evaluation remains a complementary arm; URL-only self-registration/inbox capability still needs its own implementation and evidence.

## What the repository actually supplies

The repository is mostly instructions for a capable coding agent. It includes two zero-dependency Node validators and their authored tests. There is no packaged agent scheduler, model client, tool registry, browser controller, source analyzer, scanner integration, sandbox launcher, artifact-promotion implementation, durable event store, hidden target generator or independent effect scorer in the tracked inventory.

The README describes this as the single-repository starting point from which Cloudflare's larger discovery harness evolved. That ancestry is an upstream statement; this checkout is not the fleet-wide harness. The README's claim that one run found roughly half the vulnerabilities found over repeated runs has no supplied target population, run receipts, models, budgets or scoring dataset here. It supports a reason to investigate repeated passes, not a reusable recall number. [README.md:3–22, 91–99](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/README.md#L3-L22).

### Inputs and access: source-assisted, not URL-only

Full audit mode expects an absolute local repository root, reviewed commit plus dirty-worktree declaration, selected paths/profile, a new output directory, locally available tools/dependencies, prior compatible ledgers/findings and a coordinating agent with tool use and delegation. Reconnaissance reads source, build/test definitions, identity controls and deployment configuration. Source paths and positive line numbers are mandatory finding evidence. HTTP is just one possible interface: CLI, library, parser, policy, native IPC and message fixtures also fit. [SKILL.md:17–55](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md#L17-L55), [RECONNAISSANCE.md:9–55](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/RECONNAISSANCE.md#L9-L55), [VALIDATION-AND-REPORTING.md:184–186](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/VALIDATION-AND-REPORTING.md#L184-L186).

A URL alone does not satisfy these inputs. The workflow explicitly forbids probing deployed endpoints, real accounts, external/shared services or live control planes. A deployment validation plan means an owner observes a missing configuration/runtime fact; it does not authorize the agent to send audit traffic. Unknown proxy, IdP, browser, provider, broker or packaging behavior remains unresolved. This differs materially from Kotaro's URL-only starting access and self-registration lab objective. We could adapt the reasoning discipline to that track, or evaluate the skill in a separately declared source-access arm. Giving one contestant source and comparing it to a URL-only contestant would test different configurations.

### Execution assumptions

Target-controlled builds/tests/processes/browsers/emulators/fuzzers/fixtures require an OS sandbox with external networking disabled, empty allowlisted environment, read-only target/toolchain, scratch-only writes and explicit CPU, memory, process, file-size, disk and wall-clock limits. Dependency fetch/install is excluded. Missing any control blocks execution and leaves an exact validation blocker. These are unusually specific requirements, but they are prose requirements for the host to implement. [SKILL.md:28–44](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md#L28-L44).

Only the parent writes shared artifacts. Each worker writes scratch, while trusted parent-side code would promote predeclared files after all sandbox processes terminate. The prescribed copy uses retained directory descriptors, no-follow traversal at source and destination, nonblocking leaf opens, regular-file/link-count/size checks, exclusive destination creation and bounded descriptor reads. Non-POSIX implementations must supply equivalent race-safe APIs. None of this promotion machinery is implemented in this repo. A directory named `scratch` or an agent prompt cannot supply those controls. [SKILL.md:57–86](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md#L57-L86).

## Whole workflow, including stopping and reruns

| Stage | Work and outputs | What remains dependent on the host/agent |
| --- | --- | --- |
| Setup | Resolve source/scope/profile/output; parent writes `run-metadata.json`; assign ownership and execution policy. | Actual permission, sandbox availability, source pin integrity, invocation accounting and write isolation. |
| 1. Reconnaissance | Four baseline research roles map product/build, principals/controls, entry/copy/sink paths, and execution/deployment visibility. Parent produces an approximately 1,000-word `architecture.md` and deterministic `coverage-ledger.json`. | Completeness of the architecture map and truthful source interpretation. |
| 2. Hunting | Assign ledger units to focused hunters. Prompts contain architecture, precise selected attack blocks, exclusions/reasons, boundary method, promotion rules and schema branches. Workers return JSON with per-unit checks, candidates, hardening and uncovered work. | Scheduling, prompt construction, result admission, capability limits and semantic root-cause deduplication. |
| Coverage critics | Fresh source readers inspect missing surfaces, lifecycle paths, weak exclusions and unresolved prior work. Parent accepts/rejects proposed units, archives reopened attempts and reassigns to fresh owners. Standard/deep require a distinct final-clean critic after the post-wave critic finds no work. | Critic coverage is judgment, not an exhaustive security proof. |
| 3. Candidate validation | Every unique proposed confirmed or blocked lead gets a fresh verifier who did not hunt it, rereads current source and tries to refute the claim. | Actual distinct reviewer execution and safe reproduction where possible. |
| 4. Structured output | Parent writes fingerprint-sorted `findings.json`, runs schema/semantic validator and coverage validator. | Both files must be reconciled by parent; the validators do not cross-read them. |
| 5. Final record verification | Fresh reviewers inspect final confirmed and needs-validation records. Material replacements require another independent reviewer before final acceptance. | Provenance of reviews, state changes and consensus are not authenticated by code here. |
| 6. Reports | Derive `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md` from final records/ledger, preserving partial coverage and unresolved candidates. | No report generator/checker is supplied; prose fidelity is instructed. |

Workflow detail: [RECONNAISSANCE.md:59–156](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/RECONNAISSANCE.md#L59-L156), [HUNTING.md:3–25, 168–251](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/HUNTING.md#L168-L251), [VALIDATION-AND-REPORTING.md:3–186](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/VALIDATION-AND-REPORTING.md#L3-L186).

**Profiles preserve the evidence bar.** Quick coarsens subsystem identity, permits exactly one hunter wave plus one final critic, defers newly found work, and merges candidate/final review into one fresh reviewer. Standard keeps the usual waves and distinct reviews. Deep splits lifecycle/subsystem units and independently rechecks previously covered same-source units. Scoped/quick passes must describe partial coverage. [SKILL.md:107–117](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md#L107-L117).

**Budget is agent invocations, not a complete resource budget.** The method reserves baseline reconnaissance, critics and validation before hunting; it defers work rather than silently thinning evidence. If candidates outgrow validation funds, it stops hunting, validates in fingerprint order and marks the run incomplete. Unvalidated candidates stay in the ledger, never disguised as `needs_validation` findings. A complete run requires report artifacts and passing validators; an incomplete run needs an exact reason and disclosed gaps. There is no executable accounting implementation or proof of stop/quiescence. [SKILL.md:119–134, 168–179](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md#L119-L134).

**Reruns compare relevant source, not merely commit IDs.** Unchanged prior confirmations retain their fingerprint but undergo current verification. Changed confirmations become revalidation work without hunter exclusions. Prior blocked/deferred/out-of-scope/needs-validation work cannot suppress current coverage. Unchanged rejections suppress only that failed claim. This is a useful stale-evidence discipline; no source-diff/revalidation automation is supplied. [SKILL.md:94–105](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md#L94-L105).

## Coverage and finding lifecycle

Coverage units combine source-derived surface, boundary, subsystem, attack class and optional lifecycle references. Canonical IDs use NFC references and exact UTF-8 percent encoding, avoiding lossy display-name slugs. The ledger records prompt block selections/exclusions, owner, wave, reviewed paths, individually owned checks, result fingerprints and unresolved facts. A source check has no artifact; a local check names an artifact under its check owner's retained subtree. [RECONNAISSANCE.md:90–156](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/RECONNAISSANCE.md#L90-L156).

States are deliberately different: planned and in-progress have no evidence yet; deferred/out-of-scope/not-applicable are unassigned with reasons; blocked has owned partial checks and unresolved facts; covered has owned checks without candidates/unresolved facts; candidate has owned checks and linked fingerprints. Reopened terminal attempts retain their old owner/evidence in an archive, while a fresh owner starts an empty new attempt. The validator can compare these fields within the submitted snapshot; it cannot prove that an older archive was never edited.

| Finding verdict | Required meaning in the written method | Machine-readable distinction |
| --- | --- | --- |
| `confirmed` | Complete source trace and bounded observed boundary result, meaningful effect, conditions, no visible preventing layer; independently reviewed. | Root cause/intended behavior, trace/evidence, conditions, execution input/instructions/result, remediation, likelihood/impact/overall severity, confidence. |
| `needs_validation` | Source-grounded boundary hypothesis with an exact decisive missing fact; not a speculative idea or a candidate merely awaiting its first reviewer. | Claimed root cause, trace/evidence, nonempty blockers and at least one local or owner-observed deployment plan; no severity or execution/remediation assertion. |
| `rejected` | Source/control/behavior/prerequisite/impact refutes the candidate. | Claimed root cause, trace/evidence and reason; retained for future comparisons, excluded from finding tables. |

Every state uses a stable source-derived fingerprint; one root cause should consolidate multiple paths while preserving evidence. Severity separates likelihood from observed impact and overall cannot exceed impact. Hardening and positive patterns remain separate from findings. Schema contracts: [report-schema.json:1–461](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/report-schema.json#L1-L461); interpretation: [VALIDATION-AND-REPORTING.md:87–118, 151–186](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/VALIDATION-AND-REPORTING.md#L87-L118).

This schema is not a complete chain of custody. Finding evidence contains source location/description, and execution contains textual inputs/instructions/result. It does not require a run/build digest, collection timestamp, authenticated collector, identity/object identifiers, raw artifact digest, oracle version, structured review history or retest history. Some context lives in metadata/ledger/prose by instruction; the finding itself cannot independently establish those bindings.

## Independent verification: useful procedure, bounded independence

Candidate verification receives the candidate, its linked evidence, necessary architecture, relevant validation blocks, schema and same-fingerprint history. It does not receive another verifier's conclusion. The reviewer checks the strongest visible preventing control, input shape, conditions, principal/resource and smallest observable effect. A proposed confirmation can be rejected or demoted. Final verification separately checks final records, including blocked leads; this prevents an untested false premise being handed to an owner as a respectable unresolved issue.

Material Phase 5 changes to verdict, root cause, trace, execution input/result, impact or severity require a new reviewer who neither hunted, performed Phase 3 nor proposed the replacement. Without budget/independence, remove the disputed record from findings, retain the unresolved ledger candidate and mark incomplete. Quick intentionally has less redundancy. [VALIDATION-AND-REPORTING.md:5–7, 24–45, 120–149](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/VALIDATION-AND-REPORTING.md#L120-L149).

This means independent review of authorship/process, not demonstrated statistical independence or benchmark secrecy. Reviewers see the claim and may share the same model, target, host authority and evidence. No reviewer-attestation store, model-diversity rule or credential boundary is supplied. Distinct agent labels do not prove independent access or a correct effect oracle. A corroborated source claim is also not proof of deployment impact.

## What code enforces, and what it does not

| Area | Executable source checks | Outside the supplied enforcement |
| --- | --- | --- |
| Findings shape | Supported schema keywords, exactly one verdict branch, required/extra fields, visible prose, enums, positive lines, unique/sorted fingerprints, trace kind ordering, safe relative path syntax, nonempty validation plan, overall severity no higher than declared impact. | Source file existence/line accuracy, root-cause identity across revisions, real effect, credible severity, truthful result, actual independent review. |
| Coverage snapshot | Canonical ID derivation/order/duplicates, declared semantic collisions, block selection overlap, state/evidence invariants, check-owned path union, artifact path ownership syntax, increasing archived waves/fresh assignment owner and selected evidence-reuse prohibitions. | Existence/content of artifacts or source, actual block identifiers/verbatim prompt use, external promotion, complete inventory, actual checks performed, global reviewer identity, immutable history. |
| Input handling | CLI regular-file input via no-follow/nonblocking flags, byte cap, strict UTF-8, structural depth/cardinality limits, capped/escaped diagnostics. | Target sandbox, safe artifact publication, environment cleansing, egress/resource enforcement or authenticity. |
| Run/report | Parent is instructed to validate after updates and reconcile final dispositions. | Neither validator loads run metadata, the other JSON file, reports, target source or execution receipts. No code establishes overall run completeness or report consistency. |

Findings source: [validate-findings.cjs:247–470, 473–595](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/validate-findings.cjs#L473-L595). Ledger source: [validate-coverage-ledger.cjs:348–469, 518–718](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/validate-coverage-ledger.cjs#L518-L718). CLI boundaries: [validate-findings.cjs:604–756](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/validate-findings.cjs#L604-L756), [validate-coverage-ledger.cjs:721–852](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/validate-coverage-ledger.cjs#L721-L852).

Important details from source inspection:

- Both validators accept an empty array. This is appropriate for an empty document, but cannot distinguish a genuinely completed zero-finding audit from one that never ran.
- The findings validator consumes only findings plus its local schema. The coverage validator consumes only the ledger. There is no executable cross-document check that each candidate fingerprint has a final reviewed finding, or that every finding has supporting coverage/local evidence.
- A coverage `local` check only needs a syntactically owned artifact path; the validator does not open it. A `confirmed` finding needs visible `observed_result` text, not a verified runtime receipt. Honest missing-evidence handling still depends on the parent and reviewer.
- “Selected block” validation means text/duplicate/overlap checks; it does not read companion files to establish that the block exists or all required discipline sections were selected.
- Input safety is narrower than the artifact-promotion specification: the CLI opens the supplied pathname with leaf no-follow/nonblocking flags and bounds reads. It does not implement descriptor-relative traversal of every parent or the promotion procedure. Do not advertise it as that procedure.
- Both CLIs fail closed when required Node no-follow/nonblocking constants are absent. This is a portability gate for this Windows workflow, not something checked here by running the code. The ledger tests skip safe-open-dependent CLI checks when unavailable; several findings CLI expectations are unconditional. Cross-platform suite portability is unresolved.
- Bounds include 5 MiB input and depth 64 for both; findings arrays are limited to 1,000 items, with bounded canonical uniqueness storage; ledger permits 10,000 top-level units, 1,000 nested entries/fields and 500,000 values. Both cap error counts at 100. These are parser defenses, not a target request/load budget.

Authored tests cover verdicts, empty documents, Unicode and reserved paths, schema misuse, duplicates, trace/severity rules, hostile sizes/depth, invalid UTF-8, escaped diagnostics, FIFO/symlink handling and constrained-heap CLI inputs. Ledger tests add canonical identity, state evidence, reassignment archives and owned artifacts. They demonstrate intended assertions in source only: **none was run in this review, and none establishes hunting effectiveness or host isolation.** Their helper subprocesses omit `windowsHide`, another reason not to casually run them on this PC. [validate-findings.test.cjs:101–114, 151–214, 375–652](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/validate-findings.test.cjs#L101-L114), [validate-coverage-ledger.test.cjs:60–72, 129–740](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/validate-coverage-ledger.test.cjs#L129-L740).

## Attack catalog and learning value

All ten companions follow applicability → domain discipline → named classes → cross-cutting investigative moves → validation gates. They are question libraries tied to a discovered boundary, not scanners or evidence that every listed class was tested.

| File | Learning/reuse value |
| --- | --- |
| `ATTACK-CLASSES.md` | Injection, access control, resources/files, crypto, business logic, alternate data readers, chained boundaries, wildcard and basic exposure review. Follow alternate paths and actual impact rather than grep hits. |
| `AI-AND-LLM.md` | Separate prompt injection from a deterministic authority/action-binding failure; follow context writers, memory readers, tool dispatch, MCP identity and exact approved action. |
| `WEB-PROTOCOL-AND-AUTH.md` | Compare two parser/cache interpretations and credential bindings; include recovery/linking/step-up, not just login. |
| `CLIENT-SIDE.md` | Establish controllable source plus executing/disclosing sink, actual browser controls and cross-account lifecycle. |
| `SUPPLY-CHAIN-AND-RELEASE.md` | Trace immutable source/build/artifact/test/signature/promotion identity and lower-trust writers. |
| `CLOUD-AND-DEPLOYMENT.md` | Separate desired manifests from active overlays, workload identity, attachments and drift; unknown deployment facts stay unknown. |
| `PROTOCOLS-RPC-AND-MESSAGING.md` | Compare channel identity with payload principal; distinguish broker delivery guarantees from application authorization/idempotency. |
| `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | Require input-to-cost amplification and shared impact, aggregate bounds, cancellation and recovery; avoid live stress. |
| `DATA-ISOLATION-AND-LIFECYCLE.md` | Follow a protected object through primary data, cache/search/export/backup/delete/restore and current authorization. |
| `DESKTOP-MOBILE-AND-LOCAL-IPC.md` | Name the actual lower-trust local actor; distinguish claimed sender/path from OS peer identity and helper authorization. |
| `MEMORY-SAFETY-AND-BINARY.md` | Re-derive bounds/lifetimes/units, check instrumentation and classify only observed effects; no crash-to-code-execution leap. |

Pinned catalog entry points: [ATTACK-CLASSES.md:3–27](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/ATTACK-CLASSES.md#L3-L27), [AI-AND-LLM.md:9–17, 76–83](https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/AI-AND-LLM.md#L9-L17). Exact complete local ranges for every companion are below. This table is a source-content summary, not a measured coverage/effectiveness rating.

For Kotaro, a useful practice sequence is: state the rule in plain language; name who can supply input and who should be protected; trace the strongest existing control; write what would disprove the hypothesis; gather the smallest matched evidence; then explain what remains unknown. The companion's discipline is more useful than memorizing vulnerability names. No learning improvement was measured here.

## Concrete mapping to our lab and existing prototypes

These are proposals, not implemented adapters or a selected unified architecture. Existing root API code and track runtime remain separate.

| Our component | Reuse proposal | Boundary to preserve |
| --- | --- | --- |
| Journal | Record a coverage unit/question, hypothesis, chosen method/reason, assignment intent, result, rejection and stop as explicit linked events; retain critic reopening and prior attempt references. | Do not replace the journal with a mutable ledger snapshot. Hash consistency does not authenticate actors or hide benchmark keys. |
| Casebook | Use fingerprint/root cause as an external deduplication reference; retain each verifier objection and material replacement as a revision. Map exact blockers to existing lead/owner-action workflow only after current admission. | Never map upstream `confirmed` automatically into our `verifiedFindings`. Current casebook intentionally leaves that category empty because independent effect/reviewer authority is not established. |
| Evidence admission | Wrap original source artifacts plus schema version, upstream verdict, source/build, principal/tenant/object, producer, collection times, raw/normalized hashes, completeness and redaction limits. | Upstream source paths and result prose alone cannot satisfy our effect requirement. Preserve contradictory controls, unknowns and synthetic/local/live distinctions. |
| Scorer | Treat validator output as a structural-check result with exact version, not a finding or effect verdict. Audit an independent predicate with wrong-identity/object, missing/stale/partial evidence, quoted-success and pre-existing-state controls. | Freeze scorer/eligibility before investigations; hidden labels/answers stay outside investigator repos, search, memory and shared board. Fresh agents on this shared account do not create blind separation. |
| Approved reader | Feed only an admitted, bounded projection through `reader-model.mjs` and `reader-report.mjs`; expose observed behavior, unresolved facts, objections and actual retest history progressively. | Keep canonical `reader-ui.js`/CSS. No replacement report UI, fabricated consequence map/screenshots, or stronger reader category based on upstream wording. |
| Research loop | Use coverage critics to ask the next missing evidence question, with explicit budget and competing explanations; compare source-assisted and URL-only methods as separately declared arms. | Unit counts measure planned/reviewed work, not security completeness or vulnerability recall. Source access, assistance, familiarity and unscored failures remain visible. |

Local anchors inspected: `tracks/synapse-workflow/src/investigation/casebook.mjs:90–100,108–131` records declared-review limitations and matched-observation-only retests; `src/practice/reader-model.mjs:7,99–106,128–148` projects existing categories/history and validated screenshot pointers. Also read `docs/synapse/evidence-admission-worksheet.md:1–71`, `evidence-admission-records.md:1–73`, `evaluation-admission-contract.md:1–127`, and `reader-report.md:1–81` (all under the track; see current files if later edits shift lines). These are existing contract/source facts, not a runtime acceptance check.

Relevant prior research opened: `docs/research/assessment-evidence/framework.md:5–49,75–91` separates access conditions, oracle validity, denominators and artifact integrity; the evaluation-admission contract carries the narrower interpretation and corrections. In particular, structural validity and textual grounding cannot substitute for independently observed effects. The Cloudflare method complements these requirements but does not satisfy them by itself.

### Falsifiable method hypotheses for the settled research-lab loop

1. **Coverage planning improves useful discovery per total effort.** Compare a predeclared ledger/critic method with the same investigator/tool access and budget without it. Measure independently adjudicated unique roots, missed eligible cases, rejected/inconclusive leads, setup/review time and costs. Disprove the benefit if extra bookkeeping/critics do not improve the prespecified outcome. Complete source access and URL-only experiments must remain separate.
2. **Fresh refutation reduces unsupported confirmations.** Freeze initial candidate submissions, then compare reviewer decisions against independently established effects/policy. Count wrong rejections and unresolved cases as well as false confirmations; lower finding volume alone is not success.
3. **Explicit blockers improve learning and owner handoff.** Ask whether a reader can identify the exact missing observation and choose an allowed next step without additional explanation. Compare that usability with free-form leads; do not claim usability from schema pass rates.
4. **Source-aware reruns reduce stale claims without masking gaps.** Under a prospectively approved fixture protocol, compare unchanged and changed-source cases with current controls. Success requires stale confirmations to reopen and unresolved gaps to remain counted; repeated public cases are familiar regression, not held-out discovery.

No target variants, secret keys, scored cases or new runtime experiments were created by this report. These hypotheses require a separately agreed access boundary, oracle and evaluation protocol before execution.

## Decision and validation limits

**Decision question:** what can this repo contribute to a readable, evidence-preserving research lab that starts from a URL? **Choice:** reuse the boundary/refutation/blocker/coverage ideas and study its validators as contract examples; preserve a distinct source-audit track if evaluated. **Alternative:** directly install and run the skill, which would require source access, platform delegation, actual sandbox/promotion support and separate admission. That alternative does not currently answer the URL-only objective.

Evidence strength is source-trace/public-doc plus synthesis. Unresolved: real model/agent behavior, sandbox availability and escape resistance, Windows validator portability, provenance authenticity, independent review effectiveness, recall/precision, token/dollar cost, learner benefit and production applicability. The README's claimed lineage/repeated-run result was not independently investigated beyond this repo.

Validation completed for this review: branch verified as `kotaro/synapse-consolidation`; ignored destination verified before clone; source HEAD/origin/inventory captured; all tracked text read without running it; SHA-256/Git blob receipt written; clean upstream working tree checked; report citations and local read ranges checked against the pinned files. No browser/desktop tabs or windows were opened, so no task-owned browser cleanup was needed. No upstream tests, validators, installs, scans, providers, target code, production/client actions, commit or push occurred.

## Complete source reading index

Prefix every relative path in this table with `C:/Users/kotar/githubprojects/NBRET/.tools/repository-reviews/2026-10-21/security-audit-skill/`. All ranges mean complete source reading, not execution. File hashes and Git blob IDs are in the provenance receipt.

| Exact source-relative path | Lines read |
| --- | --- |
| `LICENSE` | 1–21 |
| `README.md` | 1–106 |
| `skills/security-audit/SKILL.md` | 1–192 |
| `skills/security-audit/RECONNAISSANCE.md` | 1–156 |
| `skills/security-audit/HUNTING.md` | 1–251 |
| `skills/security-audit/VALIDATION-AND-REPORTING.md` | 1–186 |
| `skills/security-audit/ATTACK-CLASSES.md` | 1–130 |
| `skills/security-audit/AI-AND-LLM.md` | 1–83 |
| `skills/security-audit/CLIENT-SIDE.md` | 1–83 |
| `skills/security-audit/CLOUD-AND-DEPLOYMENT.md` | 1–86 |
| `skills/security-audit/DATA-ISOLATION-AND-LIFECYCLE.md` | 1–84 |
| `skills/security-audit/DESKTOP-MOBILE-AND-LOCAL-IPC.md` | 1–89 |
| `skills/security-audit/MEMORY-SAFETY-AND-BINARY.md` | 1–101 |
| `skills/security-audit/PROTOCOLS-RPC-AND-MESSAGING.md` | 1–81 |
| `skills/security-audit/RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` | 1–78 |
| `skills/security-audit/SUPPLY-CHAIN-AND-RELEASE.md` | 1–73 |
| `skills/security-audit/WEB-PROTOCOL-AND-AUTH.md` | 1–105 |
| `skills/security-audit/report-schema.json` | 1–461 |
| `skills/security-audit/validate-findings.cjs` | 1–773 |
| `skills/security-audit/validate-coverage-ledger.cjs` | 1–872 |
| `skills/security-audit/validate-findings.test.cjs` | 1–652 |
| `skills/security-audit/validate-coverage-ledger.test.cjs` | 1–740 |
