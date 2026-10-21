# Market direction and potential approaches

Assessment date: **2026-10-17**. This is a synthesis of the sampled evidence, not a market-size estimate, investment recommendation, or claim of validated demand.

## What customers buy beyond vulnerability discovery

The provider workflows show distinct purchases: scarce specialist attention, a bounded and accountable engagement, coordinated access/staffing, credible evidence, stakeholder reporting, help deciding what to fix, and rechecking fixes. HackerOne documents effort/team responsibilities and lead QA; Cobalt exposes a finding lifecycle; Trail of Bits publishes a scoped assessment with coverage exclusions. These are observable deliverables and process commitments, not just a count of bugs. [Provider evidence](companies.md)

**Inference:** adoption friction may be determined by trust, repeatability, existing procurement relationships and remediation ownership as much as detection capability. A technically novel engine that cannot explain scope, handle secrets, reproduce findings, work with engineering and accept responsibility can still be an unattractive purchase. That is a hypothesis to test with buyers, not a surveyed market fact.

Consulting sells scoped expertise/effort; software sells reusable execution/analysis capacity; managed validation adds operation/interpretation; researcher platforms coordinate specialized labor; hybrids combine these. An “unlimited tests” subscription still has configuration, access, coverage and operational costs. An annual credit or hour unit is not a common technical quality measure.

## Demonstrated changes versus extrapolation

| Observation | Evidence | What follows / what does not |
| --- | --- | --- |
| Platforms bundle discovery, validation, findings and remediation more closely | Current Cobalt/HackerOne/Detectify/Pentera/NodeZero offerings documented in [companies](companies.md) | Product convergence is visible; market share, displacement and actual continuous coverage are not established |
| AI is used both in delivery and as an assessment target | Cobalt's promoted hybrid autonomous offer; Trail of Bits AI/ML scope; PentestGPT current source | Mechanisms/offerings exist; reliable unsupervised full-scope assessments do not follow |
| Validation can include explicit grounding and recovery logic | PentestGPT compiler/loop review | An exact quote can reduce invented evidence; it cannot by itself enforce target scope or prove semantic truth |
| Identity/configuration chains matter alongside isolated CVEs | NodeZero/Pentera descriptions; tenant lab; identity-focused complementary research | Test identity/state explicitly; no comparative market-wide incidence is measured here |
| Supply-chain assurance needs semantics beyond passing a general suite | Public sigstore-rust assessment notes conformance success alongside signing-time/trust issues | Positive conformance evidence can coexist with important edge cases; we did not reproduce the report's findings |
| Governance shapes some demand and deliverables | ECB 2025 TIBER-EU/DORA alignment; UK CHECK context in [standards](standards.md) | Formal process/procurement matters in specific contexts; this is not a blanket mandate across all buyers |

Cloud identities, ephemeral workloads and continuous releases change state and permissions faster than a stale assessment snapshot can represent. **Inference:** this favors change-aware selection and repeat verification, but only if authenticated flows, principal identity, policy revision and environmental changes are retained. Running more identical probes can reproduce blind spots faster.

Public evidence reviewed here does **not** demonstrate that AI has eliminated expert labor, that traditional consulting is obsolete, that output generation is the primary bottleneck, or that benchmarks predict customer performance. Do not turn vendor adoption counts, selected testimonials or promotional turnaround into independent outcome statistics.

## Candidate approaches, with ways to disprove them

### 1. Identity-bound finding-to-regression evidence

**Failure / user / payer:** AppSec and engineers can retest the wrong principal/session or lose the context required to reproduce a finding. The likely budget owner is AppSec/product security, possibly via an assessor. NBRET-E01 is direct local evidence of this mechanism, not market prevalence.

**Why current approaches leave a gap:** URL/method/body equality and endpoint-level grouping omit principal, tenant, policy and session epoch; raw credential retention is undesirable and redaction can create collisions. Existing platforms may solve this internally; public pages do not establish which do.

**Mechanism:** an immutable capture identity envelope containing non-secret principal/role/tenant labels, policy/config revision, state preconditions and artifact hashes, linked to a versioned claim/oracle. Offline matches must reject ambiguity. Keep evidence immutable and interpretations revisable. A fresh retest must retain the repaired version and positive controls.

**Evidence:** [source review](implementation-reviews.md), [follow-up receipt](lab-followup-receipt.json), and existing NBRET offline behavior. This improves traceability, not automatic correctness of a label supplied by a user.

**Requirements:** application/IAM expertise, controlled test identities, source/session labeling integration, secure secret delivery and reviewer trust. **Small prototype:** repair only evidence selection in an isolated branch and test A/B tenant, role, token rotation, redaction collision and session-epoch variants. **Disproof:** it selects stale/wrong identity evidence, adds no accuracy/analyst-time benefit versus explicit manual records, or labels cannot be grounded in the tested application's identity system.

### 2. Semantic validation before finding promotion

**Failure / user / payer:** Teams receive convincing but weakly supported alerts or closure claims; assessors and AppSec teams spend time reproducing them. **Gap:** transport status and pattern matches can miss unauthorized data/actions, as the deceptive-403 fixture shows. This is not evidence that every vendor uses weak validation.

**Mechanism:** require a claim-specific oracle plus positive/negative controls, minimum preconditions, raw outcome evidence and an explicit “unavailable” state. A model may propose a case or explain a result, but code checks actual output/tool/state transitions. Record separate suspected, reproduced, validated and remediation-verified states.

**Evidence:** [local lab](lab-results.md), garak's detector/evaluator separation and documented human triage in [company processes](companies.md). **Requirements:** domain-specific test design, owned fixture data, engineering cooperation and independent review. **Prototype:** a small set of authorization/business-state claims with hidden repaired/deceptive variants; compare baseline alert promotion with controlled-oracle promotion. **Disproof:** no improvement in adjudicated false positives/misses or time per correct finding, or benign functionality is broken to manufacture security passes.

### 3. Capability-restricted testing-agent runtime

**Failure / user / payer:** An AI testing agent can act beyond its intended task even when reports look grounded. Security teams/MSPs or tool vendors would pay only if it makes execution acceptably auditable and usable. **Gap:** canonical task validation and “ignore target instructions” prompts do not mediate shell/network effects; the reviewed PentestGPT trial explicitly delegates isolation to deployment.

**Mechanism:** expose typed operations with host/IP/port/method/path/time/data budgets, explicit credentials per capability, egress mediation, short-lived approval grants, stop/kill semantics and trace receipts. Start with a small HTTP capability rather than an unrestricted shell. Untrusted target text never changes grants.

**Evidence:** [PentestGPT source boundaries](implementation-reviews.md); [Agate's complementary track](../assessment-evidence/) evaluates related boundary concepts under its own receipts. **Requirements:** sandbox/network expertise, identity isolation, audited runner/integrations, controlled target access and explicit operations ownership. **Prototype:** malicious target text, redirects, DNS changes and tool-error recovery against synthetic targets; verify both rejected out-of-scope effects and successful benign work. **Disproof:** any unauthorized effect escapes, stop is ineffective, or useful tasks require bypassing the boundary so often that manual operation is preferable. No claim of generic prompt-injection immunity is warranted.

### 4. Evidence of defense and remediation, not execution counts

**Failure / user / payer:** SOC/detection engineers may confuse a completed test with observed/detected/responded-to behavior. **Gap:** emulation content alone lacks sensor/query/alert/response proof; generated cleanup does not prove restored state.

**Mechanism:** bind test identity and preconditions to process/network receipts, sensor events, query/version, alert and analyst/response outcome, then separately verify cleanup and post-fix state. Distinguish not attempted, blocked, executed, missing telemetry, no alert and inconclusive. **Evidence:** prior Atomic/CALDERA review, AttackIQ's documented control workflow and [complementary evidence research](../assessment-evidence/). **Requirements:** disposable endpoints, instrumented defenses, timestamps, SIEM privileges and detection specialists. **Prototype:** three selected behaviors with one deliberately disabled sensor/rule and a cleanup verification case. **Disproof:** coverage scores remain unchanged when telemetry is absent, sensor changes cannot be attributed, or integrations cost more effort than the verified insight saves.

### 5. Change-aware assessment continuity

**Failure / user / payer:** Release teams repeat expensive broad preparation while role/workflow changes remain untested. **Gap:** a URL diff or source diff alone cannot determine whether an authorization/business invariant changed.

**Mechanism:** combine scenario-to-request/source evidence with identity/policy/deployment changes and prior findings; select reviewed regressions and mark remaining unknown coverage rather than output an opaque risk score. **Evidence:** NBRET already stores workflow candidates, script identities and comparisons; provider offerings show demand for repeat workflows, but willingness to pay for this mechanism is untested. **Requirements:** CI/deployment metadata, app owners, reliable scenario identity and false-negative review. **Prototype:** blinded release pairs with seeded permission/workflow changes, measured against a fixed test suite and a human baseline. **Disproof:** misses material changes, cannot maintain scenario identity, or does not improve correct coverage per analyst-hour.

## Evaluation before choosing a business

For each idea, measure correctness under known truth, missed cases, analyst assistance, reproducibility, total labor/tool/model cost, setup/maintenance effort and remediation outcome. Use equivalent scope/access/budgets when comparing approaches. Include unsuccessful and unscored runs. Hold out unfamiliar variants, remove solution text from agent inputs, and record whether a target/benchmark is public enough to have been memorized.

Next customer evidence should come from consented interviews or public buyer-authored accounts that reveal access preparation, retest friction, purchasing responsibility and acceptance criteria. No external outreach is performed or authorized by the existence of this dossier. A prototype result is a technical feasibility result; a paid pilot is different evidence.
