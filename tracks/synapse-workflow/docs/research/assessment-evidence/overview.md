# What makes an assessment useful?

An assessment is a bounded investigation of a security question. A pentest usually seeks demonstrable weaknesses within agreed scope. A red-team exercise asks whether an adversary can reach an objective, often while avoiding detection. Purple teaming makes defender observation and learning explicit. Configuration review, source review, recovery exercises and identity governance answer different questions. A short external pentest cannot stand in for all of them. These are working distinctions, not universal commercial definitions; consult Tomo's landscape for delivery variants.

## 1. Incidents and assessment coverage

Start with what investigators actually observed. Separate the credential or application condition, the permission that made it useful, the reachable dependency, the consequential action and the observed impact. Then ask three different counterfactual questions: what could have prevented that step, what could have detected it, and what could have shortened recovery? The [cases](incidents.md) show that revocation, application privileges, build isolation and administrative workflows deserve scrutiny alongside software flaws. A credible report states which condition was tested and which was assumed. Published incidents overrepresent visible, serious and disclosable failures; they cannot estimate the proportion of all incidents preventable by pentesting.

## 2. Evaluating the testers

Finding count confounds scope, difficulty, duplicate counting and severity judgment. In a known-answer lab, seeded vulnerabilities create a denominator for **seed recall**, provided the seeds are reachable and independently verified. They do not reveal all accidental bugs in the lab. In an open production system, the undiscovered vulnerability set is unknown: neither a clean report nor agreement between two testers establishes recall. OWASP Benchmark explicitly supplies runnable cases and scoring support; its intended ground truth is useful within that constructed task distribution ([project documentation](https://owasp.org/www-project-benchmark/), consulted 2026-10-17). Use a held-out evaluation, reviewed negative cases, evidence adjudication and declared assistance, as specified in the [framework](framework.md).

## 3. Business logic and authorization

The oracle is the intended rule: who may do what to which object in which state? Record tenant, role, ownership, delegation, prerequisites, approval revision and alternative interfaces. An HTTP success or failure alone rarely expresses this policy. A support administrator may legitimately cross tenants; a maker may submit a payment but must not approve it. Those facts need a domain owner, policy documents and real role fixtures. OWASP's [testing guide](https://wstg.owasp.org/latest/) distinguishes business logic and authorization work and cautions that generic tools lack custom application context. AI can propose a model, but a model inferred from current behavior can simply learn the bug as normal. The local [approval lab](executable-claims.md) states its policy before executing candidate implementations.

## 4. Composing weaknesses

An attack path needs all prerequisites, not just a chain of labeled arrows. A session, reachable admin plane and grant authority may jointly enable a consequential permission. Distinguish permission to act, network reachability, successful execution and observed effect. Graph pruning by objective, privilege equivalence and bounded depth can reduce search, but may discard unusual paths; report the pruning policy. Cache facts with collection time, identity, environment version and invalidation triggers. The lab uses a monotone fixed-point model to illustrate AND prerequisites and revocation. It models possibility only: no cloud permission semantics or live execution are validated.

## 5. Remediation and recurrence

An actionable finding names an owner, affected business invariant, demonstrated consequence and reproducible conditions. Engineering chooses a fix or compensating control; a separate retest checks the original path and nearby variants. Updating an evidence store is not revoking a credential at its issuer. CircleCI's [rotation guidance](https://circleci.com/blog/january-4-2023-security-alert/) makes this distinction concrete. The lab's one-instance repair blocks unapproved payment but leaves approval valid after editing. The class repair invalidates approval on revision change. Even that repair only passes the tested cases. Recurrence may reflect ownership gaps, competing operational needs, incomplete inventories or weak class fixes; this research has no representative data assigning their relative prevalence.

## 6. Defender outcomes

Track execution → telemetry → detection → analyst understanding → containment → recovery separately. Each transition needs evidence and a clock definition. A command completing does not prove logging, and an alert does not prove an analyst could identify the affected account or revoke the right session. The inspected Sentinel rule gives a concrete data contract, while Atomic Red Team supplies execution descriptions; neither supplies proof of your organization's coverage. [Implementation notes](implementations.md) identify the relevant boundaries. ATT&CK is an indexing vocabulary, not a denominator over all attacker behavior.

## 7. Protecting assessment infrastructure

The platform contains unusually valuable access and evidence. Treat target pages, repository comments, tool output and captured documents as untrusted data. Prompt instructions cannot enforce network scope or prevent a process with broad credentials from leaking evidence. Enforce capabilities outside the model, isolate tenants and jobs, constrain egress and filesystem mounts, use short-lived credentials, log attempted actions, pin dependencies and verify cleanup. The lab injects a hostile proposal directly into a deterministic gate; it does not measure how frequently an LLM would obey hostile content. REA's stable file reading offers a narrower code-enforced integrity pattern, not a sandbox or authenticity guarantee.

## 8. Economics and expert work

Scoping, access troubleshooting, discovery, hypothesis formation, validation, evidence preparation, coordination, reporting and retesting consume distinct resources. The public incident accounts show costly rotation and investigation work, but they are not assessment time studies. This track found no representative measured breakdown of assessment hours; assigning percentages would invent precision. Automation can reduce repeated requests or report formatting while increasing setup, false-positive review and maintenance. Measure end-to-end verified outcomes per analyst hour, including failed runs, preparation and retesting. Fixed scope can bound disruption but leave important dependencies excluded; count-based incentives can reward fragmentation. These are incentive mechanisms to investigate, not findings that every provider behaves that way.

## 9. Human and organizational boundaries

Help-desk recovery, contractor delegation, offboarding, emergency access and administrator exceptions change effective permissions. Source code cannot show whether a help desk really checks identity or whether access is promptly revoked after a contractor leaves. Use approved tabletop simulations, synthetic identities and policy evidence before considering any live human exercise. Specify authorized participants and pretexts, hours, emergency stops, privacy minimization, data handling and escalation. Do not collect real passwords or judge individuals from a simulation. Twilio's [incident account](https://www.twilio.com/en-us/blog/august-2022-social-engineering-attack) supports examining both technical controls and administrative tools; it does not justify contacting employees in this research.

## 10. Accumulating knowledge safely

Reusable knowledge includes a general invariant, a redacted test pattern and a documented failure mode. Customer identities, topology, tokens, business transactions and raw evidence remain tenant-confidential. Separate immutable evidence from revisable interpretations. Every derived fact should carry source, tenant, version, collection time, reviewer, retention class and expiry trigger. Retrieval filters should enforce identity and tenant in code before model context assembly; deletion must reach caches, indexes and derived copies. A memory system earns its cost only if held-out engagements show better verified outcomes with no cross-tenant disclosure. More stored text is not evidence of learning.

The central opportunity is to preserve justified claims across investigation, engineering and defensive operations. The hard parts are establishing the policy oracle, obtaining representative access, retaining trustworthy evidence, and keeping the claims fresh after change.


## What the deeper source reviews add

The [concurrency study](conc-pool-boundaries.md) shows why ?results returned? is a different quantity from ?tasks attempted?: errored results can be omitted and combined errors need not identify each task. The [database study](pgx-binding-boundaries.md) shows why storing a finding is a transformation with its own contract: zero may merge with absence, decimal value may survive while original spelling does not, and time-zone or precision rules can change how a timeline is interpreted. These are source-established behaviors in selected pinned components, not demonstrated customer failures.

A useful evaluation also asks whether a test reaches its named path. Examples retain contrary evidence: an interval fixture with an unexpected type identifier still reaches the encoder through a fallback; a numeric fixture explicitly forces binary encoding to prevent fallback from concealing a failure. Declared CI matrices can exceed activated checks, and readiness probes cover specific prerequisites. Record the route, oracle and actual run receipt separately; a test name, configured command or complete source read is insufficient. No upstream tests were run during this source-only continuation.
