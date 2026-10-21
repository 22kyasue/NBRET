# Learning path and evidence status

Updated 2026-10-17. This is a navigation checkpoint for the integrated HTML reader, not research completion.

The finite local continuation inventory is now closed:1511 main and651 supporting files have complete bounded read records, zero partial/unread. [Scope closure](scope-closure.md) lists unresolved runtime/dependency checks. The full annotations remain canonical in continuation.md; do not translate reading counts into measured security coverage. The factual [session safety audit](safety-audit.md) distinguishes unavailable original warning text from visible local errors and voluntary scope limits.

Start with [the identity and architecture model](model.md): a bot is an automated participant; a swarm coordinates multiple participants. Legitimate automation and compromised-device botnets differ in ownership and authorization. A worker, process, agent, account, session, device, address and operator are separate things. One address can represent many people; one person can use many addresses.

| Learning topic | Read first | Deeper evidence |
| --- | --- | --- |
| Definitions and coordination | [Model](model.md) | [Pinned catalog](catalog.md), [source walkthroughs](source-notes.md) |
| Enrollment, leases, retries and stopping work | [Enforcement checkpoint](continuation-checkpoint.md) | [Sustained annotations](continuation.md), immutable cancellation/parallel lab receipts linked from [README](README.md) |
| Accounts, cookies and network identity | [Model](model.md), [cookie review](cookie-policy-review.md) | [Identity lab protocol](identity-lab-plan.md), [continuation](continuation.md) |
| Quotas, rejection and false positives | [Defensive evaluation](defense.md) | [Accessibility evaluation](accessibility-evaluation.md), [claim ledger](findings.md) |
| Compromised botnets and disruption | [Incident review](incident-review.md) | Attributed original incident sources and their cleanup limitations |
| What is actually known | [Claim ledger](findings.md) | [Coverage and reading queue](coverage.md), exact file hashes/ranges in [queue.json](queue.json) |
| Atomic insertion and external effects | [Bulk insertion trace](continuation.md#bulk-insertion-do-not-infer-all-or-none-from-batching) | [Transactional-jobs proposal limits](continuation.md#transactional-jobs-proposal-bounded-database-claim-not-implemented-exactly-once-fleet) |
| Events, counters and output receipts | [Event acknowledgement trace](continuation.md#event-receipt-is-not-durable-application-acknowledgement) | [Output side effects](continuation.md#output-policy-needs-enforcement-before-every-side-effect), [metric denominators](continuation.md#observability-denominators-and-missing-data-states) |

Read evidence labels literally. **Source finding** means the pinned code path was inspected. **Runtime finding** means only the stated synthetic fixture and recorded oracle ran. **Hypothesis** needs a focused test or missing dependency. **Rejected/corrected** findings stay visible in the annotations so readers can see why a claim changed. A configuration value or interface promise is not proof that protection executes.

Finite main-inventory milestones: all1511 selected files have complete bounded read records: Scrapy538, BullMQ453, limiter78, memberlist40 and Coraza402. Supporting configuration/documentation, imported dependencies and runtime behavior remain separate work; consult the dated queue for current counts. Complete file reading is not measured security coverage or a claim that every behavior is understood.

The newest Python lifecycle and Postgres findings, their test limits and unresolved cases have one canonical explanation in [continuation](continuation.md).
