# Critical review: Synapse discovery decisions (product & process)

Reviewer: Aiko (Claude session, NBRET@main). Date: 2026-10-18.
Scope reviewed: `docs/synapse/discovery-decisions.md` only. This is a review of **proposed product and process requirements**, not of any security technique. It contains no attack methods, payloads, or execution procedures by design.

## What this review is and is not

- `build-plan.md` does not exist yet, so everything here critiques *proposed requirements*, not implemented capability.
- I did not open the referenced toolkit/tiers/testing/research documents and did not run `find-research.mjs` or any research script, consistent with the narrow, no-scripts scope of this task.
- I evaluated decision completeness, internal consistency, workflow, evidence provenance, reviewer independence, blind-evaluation bias, resources, approval boundaries, stopping rules, and acceptance criteria. Nothing below should be read as authorization to assess a live target, resume a stopped experiment, deploy, or publish.

## Ranked issues

Ranked by how much each threatens the project's stated goals (a trustworthy, independently verified assessment workflow). Highest first.

1. **Reviewer independence is a policy, not an enforced design.** The document requires that investigator and reviewer "must not receive preparation answers or source access" and that "agent agreement is not proof." But every agent here is a session for the same human, on the same PC, sharing a board, memory files, and the evidence filesystem. Nothing in the requirements describes *how* context leakage between investigator and reviewer is prevented. The entire validity of "independent confirmation" rests on this, so the independence mechanism needs to be a first-class design artifact: separate working directories, no shared memory namespace, and evidence passed only through a controlled, read-only handoff. Until that exists, "independent" is aspirational.

2. **No measurable definition of done for version one.** The document is rich on capabilities (resumable, adaptive, hypothesis selection, evidence filter, independent review, teaching) and explicit that "finding a substantial vulnerability is not required for completion." But it never states the positive bar that makes v1 complete. Without a definition of done, scope is unbounded and the build plan cannot be sized or accepted. This is the most consequential *missing decision*.

3. **The blind-evaluation protocol has a built-in role conflict.** Kotaro simultaneously (a) holds the hidden answer key for the synthetic target, (b) conversationally steers the live investigation, and (c) performs final verification. A steerer who knows the answers can leak them through prioritization ("look harder at X"), which quietly contaminates any generalization claim. The requirements acknowledge blind evaluation but do not address this conflict. Decide how steering is constrained during an evaluated run, or separate the steering human from the key holder.

4. **"Diminishing useful returns" is not operationalized.** It is named the primary stopping signal, bounded by a hard resource ceiling, but "useful return" has no in-session metric. As written, an agent can justify either stopping early or running to the ceiling. Pick a concrete proxy (for example, rate of genuinely new surface or new hypotheses per unit of budget) and say who decides when it is reached.

5. **The evidence filter's false-negative rate is unmeasurable as specified.** "Candidates pass an initial evidence check before independent review" and "retain rejection reasons to evaluate that filter." But there is no ground truth for rejected candidates unless someone re-reviews them, which conflicts with the goal of reducing Kotaro's load. Decide explicitly: either sample-audit the rejects (and budget for it) or accept the blind spot and say so.

6. **Capability inventory is listed as a step but not gated.** "Use existing subscriptions and programs... no additional fees" sits beside "do not assume subscription access supplies an API or automation interface." Together these create a real risk that the design assumes an automation surface a subscription does not expose. The requirement to "inventory actual available capabilities before selecting execution technology" has no gate: nothing says the build plan is blocked until a written capability list is confirmed. Make the inventory a hard prerequisite artifact that the build plan must cite.

7. **A flagged architectural fork has no decision.** The document correctly warns that identity-bound evidence in the adapter and identity-agnostic matching in legacy `src/checks.mjs` are different paths, and that a fix in one may not fix the other. Good hazard-flagging, but no decision is recorded about which path v1 uses. That unresolved fork blocks a coherent build plan.

8. **Undecided dependency status for the "engine."** The requirements responsibly refuse to inherit absolute-absence wording about the engine not found "within inspected scope." But the consequence is left open: for v1, is that component a dependency, a reuse candidate, or treated as absent? An undecided dependency is a planning hole.

9. **Naming a live, client-adjacent domain in a planning doc invites later scope conflation.** The document is careful that ownership plus future interest is "not an approved test scope," which is the right instinct. Strengthen it: state that any live target, that domain included, requires a fresh, separately written authorization with its own scope, evidence limits, budget, and stop conditions, and that such authorization can never be inferred from this planning document.

10. **"Compare with a manual baseline" is undefined.** No baseline owner, protocol, or target is specified, so the central "is this better than doing it by hand" question cannot actually be answered. Define whose manual baseline, measured how, on which frozen target.

11. **Teaching is a stated outcome with no success measure and a structural crowd-out.** "Teach Kotaro during internal practice," with deeper explanations deferred "while other permitted work continues." As written, teaching can be perpetually displaced by throughput, and there is no signal for whether learning happened. If teaching is a real v1 acceptance goal, give it its own measure; if it is secondary, say so explicitly so it is not quietly dropped.

12. **"Must not quietly change its own operating permissions or evaluation rules" lacks a control.** Sound principle, but it is a policy without an enforcement mechanism or a detection/audit path. State what prevents self-modification of permissions and how a violation would be noticed.

## Useful additions

- A one-page **definition of done for v1** with a short pass/fail checklist, separating required capabilities from deferred ones.
- An explicit **session-separation design** for investigator vs reviewer (distinct working dirs, no shared memory namespace, controlled evidence handoff).
- A **capability-inventory artifact** the build plan must cite, listing each capability actually available programmatically on this PC, with the automation surface confirmed rather than assumed.
- A **decision-log entry** resolving the identity-path fork before the build plan references either path.
- A **reject-sample audit policy** (or an explicit, recorded acceptance of the filter blind spot).
- A reusable **authorization record template** (target, accounts, permitted activity, evidence limits, budget, stop conditions), kept separate from this planning doc and created per engagement.
- A short **evaluation-integrity note** describing how steering is constrained during an evaluated run.

## Questions for Kotaro

1. What is the minimum capability set that makes v1 "done"? (This unblocks the build plan more than anything else.)
2. How do you want investigator/reviewer independence enforced technically, given that every session shares this PC, board, and memory?
3. During an evaluated synthetic run, are you willing to separate the steering role from holding the answer key, or to constrain steering, to protect the blind-evaluation claim?
4. Will you adjudicate a sample of rejected candidates, or should the design accept the filter's false-negative blind spot?
5. Who or what is the manual baseline, measured how, and on which target?
6. Is teaching a primary v1 acceptance goal or a nice-to-have?
7. For the identity-handling fork (adapter vs legacy matching), which implementation is canonical for v1?

## Limitations of this review

I reviewed one document at the requirements level and deliberately produced no security technique, tool instruction, or vulnerability design. Reviewing the referenced implementation docs and tracing decisions to the research register (per `AGENTS.md`) would sharpen items 6, 7, and 8, but those steps were out of this task's scope. Where the requirements are genuinely undecided rather than wrong, I have said so rather than inventing a preference.
