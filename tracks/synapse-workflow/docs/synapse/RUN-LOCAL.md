# Run Synapse locally

The newer observation-driven session workbench is available through `npm run synapse:workbench`; see [SESSION-WORKBENCH.md](SESSION-WORKBENCH.md). The commands below retain the earlier six-check functional rehearsal and separate ordinary practice app.

From the NBRET directory, with the already installed Node.js:

```sh
npm run synapse:demo
```

Open the printed loopback URL. No external account, installation or paid API is needed. The dashboard shows a real completed rehearsal, links its saved evidence, and has a button to run another fresh rehearsal. It also links a separate practice business application.

In that application, sign in as fictional Alice, submit a draft work order, switch to fictional Carol and approve it. Bob and Dana belong to the other organization. These are local demo identities; the application holds only synthetic in-memory records. Restarting resets them. The companion workspace is separate from each fresh rehearsal fixture, so experimenting there does not change the report.

Each rehearsal makes six predefined GET requests: Alice and Bob's profiles and organization lists, plus two unsigned requests. It saves the real responses, recalculates the assertions from the artifacts, checks saved-result consistency, closes its test server and writes an HTML report and receipt in a new `runs/practice-*` directory. A transport failure stays incomplete. Passing these controls does not establish application security.

Ctrl+C stops both dashboard and companion application. Saved reports remain available.

Validation: `npm run synapse:test` passed 44 tests with zero failures or skips on 2026-10-18. This includes injected transport/inspection failures, actual request receipts, token-free saved artifacts, output containment and both-server cleanup. See [practice-build-receipt.json](practice-build-receipt.json) for source hashes and the recorded result.

For a one-shot run without a dashboard:

```sh
npm run synapse:rehearse
```

For the practice application alone:

```sh
npm run synapse:practice
```

## What this increment establishes

An ordinary usable two-organization business app, a bounded local execution path, identity-bound retained evidence, explicit partial failures, offline artifact inspection and repeatable visible results. The existing investigation journal remains separate; this rehearsal does not promote observations into reviewed findings.

This is guided, familiar-target engineering validation. It has no autonomous exploration, vulnerability discovery, independent finding adjudication, repair retest or comparison against an expert baseline. No planted vulnerabilities or hidden answer key are included. The shared unrestricted host does not establish blind evaluation separation. No production target was contacted.

The next development gate is a reviewed session-operated exploration/evidence adapter with enforceable permissions, coverage and stopping records; then a full local investigation/review/manual-verification/retest cycle. Performance improvements follow frozen comparisons and separately held-out trials, as specified in [build-plan.md](build-plan.md). A run cannot be required to find a vulnerability to count as complete.

## Research basis

This increment follows the identity ambiguity correction `evidence-handling.e01-offline-identity-ambiguity`, [assessment-evidence/framework.md](../research/assessment-evidence/framework.md), [executable-claims.md](../research/assessment-evidence/executable-claims.md), and the scorer and manual-baseline conditions in [evaluation-admission-contract.md](evaluation-admission-contract.md). Retained bytes and matching identities establish consistency; they do not prove effect authenticity or an independent review. Functional controls provide engineering evidence only; discovery effectiveness remains unmeasured.
