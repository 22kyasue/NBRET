# First guided investigation — 2026-10-18

Completed run: `runs/guided-investigation-a39df90a-a5d5-4ab9-afb8-d89a3e72e601/REPORT.html`.

The fresh owned practice app received 22 requests; 21 selected checks passed, zero failed, and its listener closed. The additional request collected the synthetic session setup nonce, which is omitted from saved evidence. Five hypotheses covered selected cross-organization reads, member approval, draft approval, cross-organization submission and resubmission of an approved order. The legitimate member-submit/approver-approve path succeeded, with subsequent reads of the exact object. Selected denied actions were followed by exact-object state reads.

No vulnerability or unauthorized damage was demonstrated. Each hypothesis records the possible consequence separately; the app has no payment execution, so no monetary-loss claim is supported. This result applies only to the selected local cases.

Skye read the source and chose the hypotheses and next branches. The script executes and records that fixed guided sequence. No autonomous investigator, adaptive hypothesis generator, continuous self-improvement or independent effect oracle is implemented by this run. The separate review is [first-investigation-review.md](first-investigation-review.md); shared host/account access is an explicit limitation.

Run another fresh guided instance from the repository:

```sh
node src/practice/investigate.mjs
```

It accepts no target URL, creates a new output directory under `runs`, prints its location and closes its own application. It does not alter the companion practice workspace or contact a production application.

For your own normal-flow check, open the companion practice app from `npm run synapse:demo`, select Alice and sign in, note draft WO-N101, submit it, switch to Carol and approve it. The same order should move draft → submitted → approved, and the counters should follow. This is a separate instance from the recorded run. There is no reproduced vulnerability in this report for you to validate as a finding.

Focused runner acceptance:

```sh
node --test test/practice-investigation.test.mjs
```

## Review and validation

Bryn accepted the final package with explicit limits after comparing digests, observed actors, predicates and all returned fields in the four denied-action follow-ups. He made no target requests and did not independently reproduce effects. His critique is copied beside the report as `review.md`; `review-receipt.json` records its digest. The original execution-time pending-review field is retained unchanged. The final focused foundation/app/rehearsal/investigation suite passed 45 tests, zero failures or skips.

## Why this design

Question: can the owned application support a traceable first guided investigation across identity and approval boundaries, including business consequences and an honest coverage ledger? A source-assisted session is appropriate for engineering validation now; it cannot substitute for the future blind/manual-baseline comparison.

Research: `evidence-handling.e01-offline-identity-ambiguity` and its current-code correction in [implementation-reviews.md](../research/security-landscape/implementation-reviews.md) require principal/session/environment binding and exclude the legacy matcher. This run records the app-observed principal separately from the intended session label; unauthenticated Carol setup remains anonymous. E01 is component-lab evidence of an evidence-selection issue, not a live application vulnerability.

`ai-evaluation.text-canary-oracle-not-effect`, [deep-pentestgpt.md](../research/assessment-evidence/deep-pentestgpt.md), is component-lab evidence that textual success need not demonstrate effect. Accordingly, the run checks exact objects through follow-up reads, not only HTTP status. These are observations through the same application interface, not independent database verification or proof of absent extra effects.

[framework.md](../research/assessment-evidence/framework.md), especially its claim record and evaluator admission sections, grounds declared access, positive controls, actual request counts, state/identity predicates, explicit omissions and distinct reviewer judgment. This is a proposed framework and source/component-grounded design guidance; it does not establish discovery performance. The current run retains parsed JSON plus body byte counts/digests, with secrets and raw headers omitted. It is not the historical assessment-import schema and is not automatically imported into supported findings.

The remaining uncertainty is substantial: incomplete role-pair coverage, browser/session behaviors, concurrency, persistence and integrations were not investigated. Stopping means the five selected branches were completed; diminishing useful returns were not measured. Next development remains a session-operated exploration ledger and permission-gated observation adapter, followed by full review/manual verification/repair-retest. No repair is proposed for an unobserved vulnerability.
