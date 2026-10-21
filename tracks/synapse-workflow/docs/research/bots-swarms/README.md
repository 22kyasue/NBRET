# Bots, swarms, identities and containment

Research opened 2026-10-17. Owner: Lark. This is an evolving source investigation with synthetic experiments, not a production bot detector or a claim of exhaustive coverage.

Read the [current enforcement checkpoint](continuation-checkpoint.md) for the latest accessible findings.

Recent additions: [cookie-policy source/runtime review](cookie-policy-review.md), [botnet incident boundaries](incident-review.md), [accessibility evaluation design](accessibility-evaluation.md), and the [signed-request identity lab](identity-lab-plan.md). Each separates executed evidence from source findings and untested proposals.

**Finite continuation closed:** [the sustained reading ledger](continuation.md) records completed bounded reads of1511 main files and651 supporting files under task ac92ad9c. [Scope closure](scope-closure.md) distinguishes that reading milestone from runtime/dependency limitations and unresolved hypotheses. Earlier counts below remain historical checkpoints.

Read [the model](model.md), [pinned catalog](catalog.md), [source walkthroughs](source-notes.md), [defensive evaluation](defense.md), [experiment protocol](lab-plan.md), and [coverage and next reads](coverage.md). Exact repositories/commits are in [snapshots.json](snapshots.json); every inventoried implementation/test file has an unread/partial/complete record in [queue.json](queue.json). Inventory is not reading credit. `source.mjs read REPO FILE START END` displays hash-checked bounded ranges; `mark` records inspected ranges without upgrading other files.

The initial runtime result: the pinned memory limiter enforces a caller-selected key inside one limiter instance. In the constructed four-request fixtures, address-only limits reject two legitimate principals sharing an address and miss two over-budget requests from one principal with changing address labels. Principal limits avoid both particular errors. This establishes the fixture outcomes, not real-world detection accuracy. The [retained receipt](lab-receipt-1792266832801.json) records 23 passing comparisons, runtime, hashes and loopback server cleanup. The toy scheduler in that experiment is explicitly separate from actual BullMQ execution.

A second [nine-comparison class experiment](cancellation-receipt-1792267100379.json) executes the pinned BullMQ lock manager through a recorded TypeScript/import adaptation with synthetic broker/telemetry dependencies. It confirms that successful cancellation signals a processor but does not remove tracking or stop an ignoring processor. Renewal failure emits events without aborting that signal in this method. This is stronger than a toy-only observation but remains short of a real worker/broker integration.

Related evidence remains owned by its original researchers: [Tomo's scanner and evidence dossier](../security-landscape/README.md), [Agate's agents/memory/evaluation](../assessment-evidence/README.md), and [Linden's toolchain/network study](../toolchain/source-notes.md). No existing implementation or production system was modified.

The [claim/evidence/uncertainty ledger](findings.md) gathers the substantive results and disproof checks. The historical handoff checkpoint contains 37 completely read files and 9 partial files across five pins; this does not mean the whole projects were reviewed.

Cooperative cancellation follow-up: [plan](parallel-lab-plan.md), [12-check receipt](parallel-receipt-1792270726805865500.json). Source and runtime qualifications are in [continuation](continuation.md).

Adapter follow-up: [plan](adapter-boundary-lab-plan.md), [seven-check receipt](adapter-boundary-receipt-1792271261504.json); limiter composition [plan](limiter-composition-lab-plan.md) and [nine-check receipt](limiter-composition-receipt-1792270925219.json). Supporting configuration/docs inventory is tracked separately in supporting-queue.json.

Database adapter boundaries: Mongo retry [plan](mongo-retry-lab-plan.md) and [four-check receipt](mongo-retry-receipt-1792271347246.json); Prisma sequential store/cleanup [plan](prisma-contract-lab-plan.md) and [six-check receipt](prisma-contract-receipt-1792271657601.json). These use inert clients, not database services.

Administrative batch bounds: [plan](queue-clean-contract-plan.md) and [four-check caller receipt](queue-clean-contract-receipt-1792272518208.json), using fabricated IDs with no deletions.
