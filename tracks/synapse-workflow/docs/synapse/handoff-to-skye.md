# Context handoff for the Synapse build plan (Bodhi → Skye, 2026-10-18)

This lists where the context is. It does not contain the plan; Skye writes the plan from these sources.

## The goal Kotaro set

Build Synapse's first working assessment capability **in this repo (NBRET)**, in the stages below. Division of labour: the agents build the environment, programs, evidence/retest tooling, process templates and measurement; Kotaro independently verifies results, holds the answer key for the practice target, and handles client communication. A security professional reviews the method and reports before any real client.

Known facts that shape the plan:
- Synapse's own attack-reproduction / resilience engine is **not** on KrisPC and is unverified anywhere. Do not assume it exists; build to stand alone, and leave a clean seam to plug it in if it appears.
- Keep everything **read-only toward third parties and offline**: test only a practice target Kotaro owns, on a loopback/closed network. Do not resume any stopped experiment.

## Sources to read (all in this repo unless noted)

1. **Strategy verdicts** — `docs/synapse/strategy-review/d01-05.json`, `d06-10.json`, `d11-15.json` and the rendered `index.html`. These carry the per-decision methods, open questions and suggested changes the plan must honour (esp. 02 scope, 05 execution model, 07 deliverables, 12 capacity, 14 retest).
2. **Research register** — `docs/research/reconciliation/USE-RESEARCH.md`, then query `node docs/research/reconciliation/find-research.mjs "<question>"`. The plan's methods and guardrails must trace to register findings. Especially relevant: `service-delivery.small-service-exercise-template`, `service-delivery.engagement-checklist`, `standards.claim-record-fields`, `standards.recall-unknowable-measures`, `authorization.deceptive-403-status-only-oracle-fails`, `service-delivery.instance-vs-class-repair`, `safety.capability-gate-outside-model`, `ai-evaluation.audit-evaluator-before-tester`, `commercial.evaluation-and-buyer-evidence-protocol`, `evidence-handling.finding-record-separation`.
3. **Research-to-Synapse mapping** — `docs/research/synapse/research-to-service.md` (the six reusable methods and the focused POC proposal section).
4. **What NBRET already has** — `docs/assessment-toolkit.md`, `docs/tiers.md`, `docs/testing.md`, and `src/assessment/`. The plan must build on the existing `assess` CLI (init/plan/run/evaluate/review/retest), capture/evidence, and retest/compare, not restart them. Note the E01 limitation: `src/checks.mjs` offline matching ignores identity — a thing the plan should fix/flag, per register `evidence-handling.e01-offline-identity-ambiguity`.
5. **KrisPC inspection** — `C:\Users\kotar\computeruse-inbox\krispc.tailca4ab9.ts.net-8e049b7b\synapse-system-report.md`. Section 4 lists the 9 founder questions; its 12-item attack-research catalog (`C:\Users\stake\kotaro\tobira\security-research`, all `not_run`) is the candidate starting list of what to test first.
6. **Standing rules** — repo `AGENTS.md`, `docs/research/safety-context/README.md`, and Kotaro's global rules (client Shopify audit-only; no Vercel; computeruse for browser/desktop).

## What the plan should produce (stages, for Skye to flesh out)

1. A closed practice lab + a small synthetic two-tenant business app Kotaro owns (the POC target from research-to-service.md).
2. Evidence + findings record (claim-record shape), extending NBRET's existing evidence.
3. Retest harness (original + neighbouring cases + legitimate-operation positive control).
4. Process templates: engagement/scope/authorization, findings, two-layer report, untested-areas ledger.
5. An AI arm that proposes candidates inside a code-enforced capability gate, with an independent effect-oracle check and a reviewer who is not the author.
6. Measurement: time per stage + hits/misses vs a manual baseline, to feed pricing (03) and capacity (12).
Each stage: what to build, which register findings justify it, how Kotaro verifies it, what it proves and cannot prove.

## Guardrails for the plan text

- Defensive/assessment framing only: what a method establishes and its guardrail, not step-by-step offensive procedures. (A content classifier repeatedly blocked Bodhi from writing the detailed version; keep it at build-and-verify level.)
- Everything traces to a register id or a strategy decision; mark anything that doesn't as an assumption.
- Nothing in the plan authorizes running tools against third parties, deploying, or contacting clients.

## Where to write the plan

`docs/synapse/build-plan.md` in this repo. Publish nothing externally without Kotaro's explicit instruction.
