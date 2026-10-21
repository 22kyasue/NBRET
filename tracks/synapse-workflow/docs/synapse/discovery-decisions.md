# Synapse first capability: discovery decisions

Recorded from Kotaro's discussion with Skye, 2026-10-18. These are product requirements and sequencing decisions, not authorization to assess a live target, start a stopped experiment, deploy, or publish. This supersedes conflicting earlier proposal assumptions for planning; it does not approve the strategy's prices or service commitments.

## Intended outcome

Build a resumable, adaptive assessment workflow operated through a coding-agent session. Investigate one business web application at a time. Start from a URL and as much optional context as is available. Explore the application's features, data, identities and business workflows before prioritizing deeper investigation. Combine independent discovery with any client description of intended rules. Missing context remains explicit and generates follow-up questions rather than blocking all exploration.

Outside access is the primary mode. Support unauthenticated investigation and supplied-account investigation as separate tracks; either can be used alone. Source/configuration-assisted assessment is an eventual complementary mode. Broader stack coverage is the long-term direction, not a first-version completeness claim.

## Adaptive investigation and human control

First improve hypothesis selection within a single investigation. Cross-investigation learning comes later, followed by evaluated changes to software and workflow. The first version must not quietly change its own operating permissions or evaluation rules.

Allow autonomous work and conversational steering. Kotaro can ask what has been examined, challenge interpretations, suggest workflows and change priorities. Answers must come from saved investigation records, including evidence, unknowns and reasons for stopping branches.

Use one initial approval of target, accounts, permitted activity, evidence limits, budget and stop conditions. Requests outside those boundaries require approval. URL-only input is supported but does not itself establish authorization. A blocked branch is recorded while other useful permitted branches continue. Consolidate pending access, context and approval needs with reasons and what each would enable. Urgent findings are escalated immediately.

Stopping rules are configurable. Diminishing useful returns is a main signal, bounded by a hard time/resource ceiling. Exhaust useful permitted alternatives before returning a pending-action list. Finding a substantial vulnerability is not required for completion.

## Evidence, review and outputs

Candidates pass an initial evidence check before independent review. Retain rejection reasons to evaluate that filter. Agent agreement is not proof: independent confirmation must establish the actual effect. Kotaro's verification is a separate recorded step.

Deliver three clearly separated categories: independently verified findings; promising issues needing Kotaro's action; and unconfirmed leads. Preserve reviewer objections and uncertainties.

Each material finding explains the weakness, relevant identity/environment, evidence, demonstrated consequence, potential further consequences, uncertainty, suggested repair and written independent verification instructions. Continue investigating extent and business consequences within approved boundaries, using minimum necessary evidence. Separate effects demonstrated live, demonstrated in an isolated environment, and inferred possibilities.

Damage coverage includes information exposure, unauthorized actions, operational disruption, additional reach, availability and resource exhaustion. No validated financial-loss estimation requirement has been established. Disruptive availability demonstrations belong only in the owned isolated practice environment for version one; live disruptive testing is not authorized by this discussion.

Recommend repairs; do not modify client applications. After someone implements changes, independently reassess the original issue and related cases, including legitimate functionality. No review dashboard is required initially: written instructions and saved investigation artifacts are sufficient.

## Environments and evaluation

Support the eventual need for both authorized live assessment and isolated validation; isolation alone cannot establish present production behavior. First build/evaluate using an owned synthetic application. A subsequent candidate is Kotaro's application at **tobirastudio.com** (not tobira.studio). Ownership statement and future interest are not an approved test scope.

Keep target preparation and investigation in separate sessions with actual access separation. Kotaro holds the hidden answer key. The investigator and reviewer must not receive preparation answers or source access inconsistent with the outside-access evaluation. Include realistic legitimate behavior and clean cases; do not disclose the number or presence of weaknesses. Freeze the target and scoring criteria before evaluation. Independently adjudicate unexpected findings. Use unseen evaluations later to measure generalization.

Evaluate real findings and misses, false claims surviving review, accuracy of damage explanations, Kotaro's ability to reproduce results, and total time/resource use including review. Compare with a manual baseline. Synthetic performance does not prove client-replica fidelity, market demand, acceptable pricing or exhaustive coverage. A real-app assessment without a complete answer key cannot establish recall.

## Teaching and resources

### Evaluation modes confirmed after critical review

Kotaro approved two distinct runs. In the blind scored run, Kotaro does not open the hidden answer key or provide investigative hints before results are frozen. Target preparation answers remain inaccessible to investigators and reviewers. In the guided learning run, Kotaro can steer freely and ask questions; results are explicitly assisted and are not counted as independent discovery performance. Once a target's answers have been revealed, later runs on it are familiar-target exercises, not fresh blind evaluations. Teaching during a scored run must remain grounded in observed evidence and must not expose hidden answers.

Teach Kotaro during internal practice: concise explanations at meaningful milestones, with deeper explanations on request while other permitted work continues. Explain the current question, observation, evidentiary limits, hypothesis disposition, business consequence and independent verification. Do not reveal evaluation answers or present hypotheses as facts. Client deliverables remain concise; internal teaching content is separate.

Use existing subscriptions and programs installed on this PC. No additional fees, paid APIs or new purchases. Inventory actual available capabilities before selecting execution technology. Do not assume subscription access supplies an API or automation interface.

## Existing implementation: documentation-level inventory

Read docs/assessment-toolkit.md, docs/tiers.md, docs/testing.md and docs/research/safety-context/README.md. The assessment documentation describes an existing CLI lifecycle and identity-bound JSON evidence/review/retest slice; it explicitly does not claim autonomous investigation. Capture/explore/probe/scanner paths have separate boundaries and limitations. These are reuse candidates requiring source inspection, not a newly verified integrated system.

Important distinction: the assessment documentation describes identity binding in its adapter; the research flags identity-agnostic offline matching in legacy src/checks.mjs. Do not assume that a fix in one path fixes all paths. Source review must establish which implementation is used.

Bodhi's source handoff: docs/synapse/handoff-to-skye.md. The full KrisPC report states that the engine was not found within its inspected scope; this does not prove absence elsewhere. BUSINESS-ALIGNMENT.md was located and summarized in that report; obtaining the actual document locally remains useful. Do not inherit the handoff's stronger absolute-absence wording.

## Remaining planning work

### First milestone and improvement program confirmed

Kotaro accepted workflow acceptance as the initial milestone even if investigation effectiveness initially needs substantial improvement, provided there is a clear improvement plan. Separate successful workflow operation from measured discovery quality. Classify misses/false claims by stage; propose a specific change, freeze comparison conditions, measure against the previous version, check review burden/resource and false-claim regressions, and validate on unseen cases. Familiar revealed targets are for debugging, not fresh blind performance claims.

Kotaro authorized local foundation planning/implementation on 2026-10-18, explicitly assigning Bryn (named Brin in the request) and Elm as builders/reviewers, with Skye responsible for architecture, delegation and quality. No additional fees, provider purchases, production changes or live-target testing are included in that authorization.

Inspect existing code and installed capabilities read-only. Trace proposed design choices to the research findings and corrected passages before recommending implementation. Separate reusable code, necessary repairs, missing orchestration, scope enforcement, independent verification and evaluation. Write the concrete build plan to docs/synapse/build-plan.md. Do not run assessment/research scripts or contact the live target as part of this inventory. Preserve stopped-work boundaries.
