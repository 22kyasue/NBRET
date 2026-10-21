# Local lab morning runbook

2026-10-21, Mori. Commands and fields checked against `src/lab/cli.mjs` and `src/lab/run.mjs`. Focused CLI smoke tests passed 4/4, including an actual two-mode local suite and interactive stop/EOF cleanup. This is selected local evidence, not general acceptance. The [local lab contract](local-lab-contract.md) owns the interfaces; the [acceptance checklist](local-lab-acceptance.md) owns acceptance evidence.

This lab lets you rehearse going from a local application URL to an evidence-linked Synapse report. It uses disposable synthetic accounts and orders. The default sequence is scripted and openly guided: it demonstrates engineering steps, not autonomous vulnerability discovery or performance on an unseen target.

## 1. Start the morning

Work in the consolidated branch and the track directory. These commands only inspect the checkout and runtime:

```powershell
Set-Location C:\Users\kotar\githubprojects\NBRET
git branch --show-current
Set-Location tracks\synapse-workflow
node --version
```

The branch must be `kotaro/synapse-consolidation`. Node observed during drafting was `v24.21.0`; the track declares `^22.19.0 || ^24.11.0 || >=26.0.0`. Do not install dependencies to make this new operational path work: its contract requires Node built-ins. Existing package scripts belong to several older workflows and are not substitutes for the new lab CLI. Do not run a recursive test suite or historical setup/demo scripts.

Before starting, read the latest acceptance receipt and note whether it describes this source/build. Preserve earlier failures and review objections. An old passing test is not proof that today's listeners, mailbox or cleanup work.

## 2. Start a fresh disposable run

Run from `tracks/synapse-workflow`. Use a new output path for every run invocation; the examples include a timestamp and random suffix to avoid reusing old evidence. `inspect` is the exception: it reads existing records without starting services.

```powershell
$labAttempt = Get-Date -Format 'yyyyMMdd-HHmmss'
$labSuffix = [guid]::NewGuid().ToString('N').Substring(0,8)
node src/lab/cli.mjs suite --out "runs/local-lab-$labAttempt-$labSuffix"
```

`suite` runs both secure and deliberately vulnerable controls. For one mode, create another fresh path and use:

```powershell
$labAttempt = Get-Date -Format 'yyyyMMdd-HHmmss'
$labSuffix = [guid]::NewGuid().ToString('N').Substring(0,8)
node src/lab/cli.mjs rehearse --out "runs/local-lab-secure-$labAttempt-$labSuffix" --mode secure
```

Use `--mode ownership-gap` for the explicit vulnerable control. Do not reuse the secure run's output path. No external target flag is provided: the runner creates its owned numeric-loopback target.

For a trusted interactive operator session, use `node src/lab/cli.mjs session --out <freshdir> --mode secure`. Replace `<freshdir>` with a new actual path; it is a placeholder, not literal command syntax. This session reads JSONL: one JSON command per line. The sanitized `ready` response includes run metadata and origins without the mailbox token. A trusted session is not an OS sandbox. Its lifetime is ten minutes, with a 100-request transport budget.

Enter these individual JSON lines after launching the session:

```json
{"command":"status"}
{"command":"request","path":"/","identity":"anonymous"}
{"command":"request","path":"/api/register","method":"POST","identity":"owner","body":{"email":"owner@lab.test","password":"replace-with-a-disposable-password"}}
{"command":"verify-mail","identity":"owner"}
{"command":"request","path":"/api/login","method":"POST","identity":"owner","body":{"email":"owner@lab.test","password":"replace-with-a-disposable-password"}}
{"command":"request","path":"/api/me","identity":"owner"}
```

Choose a disposable password and reuse that value only for this synthetic account's login. Stdin can contain credentials: do not record/share its input or use real passwords. Repeat registration, verification, login and `/api/me` with identity `other` and a distinct `.test` address. Auth is managed in memory per identity. Request `target` defaults to `app`; `inbox` is also supported. Only admitted relative paths and caller headers `accept`/`content-type` are accepted.

Create an order using `request` with `method: "POST"`, `path: "/api/orders"`, `identity: "owner"` and `body: {"description":"Synthetic test order"}`. Read `/api/orders/ORDER_ID` using its actual returned order ID as owner and anonymous. Save the emitted `receipt.id` values and both `/api/me` receipt IDs. Record a hypothesis before the foreign read, then read that same path as `other` and evaluate. Uppercase values below are placeholders for actual receipt IDs, not order IDs:

```json
{"command":"hypothesis","question":"Does this order read enforce ownership?","prediction":"The other user cannot receive the owner's order.","disconfirmation":"The other corroborated user receives the exact protected order.","evidenceIds":["OWNER_CREATE_RECEIPT","OWNER_READ_RECEIPT"]}
{"command":"evaluate","ownerCreate":"OWNER_CREATE_RECEIPT","ownerRead":"OWNER_READ_RECEIPT","otherRead":"OTHER_READ_RECEIPT","otherMe":"OTHER_ME_RECEIPT","ownerMe":"OWNER_ME_RECEIPT","anonymousRead":"ANONYMOUS_READ_RECEIPT"}
{"command":"report"}
{"command":"stop"}
```

`evaluate` requires a recorded hypothesis and resolves these six receipts from this session. Custom identity labels require matching `ownerIdentity`/`otherIdentity` fields. Interactive commands do not automatically advance scripted stage statuses; `not-attempted` rows can remain despite collected receipts. Invalid commands emit generic `command-rejected`; inspect retained observations before repeating a write.

The startup receipt should identify the new run, generation, source/config-bound build ID, target origin and inbox origin. Listeners must use literal `127.0.0.1` with assigned ephemeral ports. Use only those exact admitted origins; another port is a different origin. Do not substitute a client URL, localhost hostname, external inbox, provider, scanner or browser.

A fresh startup creates new application state. Keep passwords, login tokens, verification links and the mailbox bearer token in the run's ephemeral credential handling. Do not paste them into Git, a shared board, screenshots or exported reports. A locally declared identity name becomes corroborated only when an authenticated `/api/me` response identifies the principal.

## 3. Run and understand the eight stages

| Stage | What you should observe | What it does not establish |
| --- | --- | --- |
| URL and scope | Startup origin and bounded transport scope agree; target root links explain ordinary use. | An unrestricted coding session is not sandboxed by this transport. |
| Self-registration | New synthetic `.test` account is registered through the app. | Pre-supplied credentials are not self-registration. |
| Delivered-mail verification | Local SMTP receives a message; the authenticated local HTTP inbox exposes it to the run; its verification link is used. | External email deliverability, OAuth or a ready external mailbox integration. |
| Legitimate use | Verified login, `/api/me`, own order creation and own read succeed with matching identity/object evidence. | A successful login alone does not prove ownership enforcement. |
| Hypothesis and disconfirmation | Record why another principal's read might expose the order, and what response would disprove that selected effect. | A scripted hypothesis is not an independently discovered weakness. |
| Test and controls | Owner read, foreign read and anonymous control have complete, same-run/build receipts and actual response contents. | A status code or guessed object ID alone is not disclosure evidence. |
| Challenge/replay | Retain the reviewer's objections and any fresh replay evidence, including failures. | Same-host independent authorship is not blinded evidence custody. |
| Report and stop/reset | Canonical reader shows actual states; cleanup receipt confirms closed resources and no active transport work. | A rendered report or a stop acknowledgement alone is not acceptance. |

The SMTP server and inbox are local lab components. The inbox's HTTP reading interface is separate from SMTP delivery: merely adding a message to an array would not demonstrate the delivery path required by the contract. No mail is sent to real addresses; only run-local reserved `.test` recipients are admitted.

Run the secure and deliberately `ownership-gap` controls as separate fresh runs, retaining their actual mode labels. The latter intentionally omits an authenticated foreign-read owner check. Neither is a hidden target. Denial in the secure control is a useful selected observation, not a claim that the entire application is secure. Comparing the two modes is not a demonstrated repair of a previously tested build.

## 4. Read evidence and the report

Keep each run's artifacts together in its unique output directory. Each run writes `summary.json`, `evidence.json`, `assessment-state.json`, `assessment.html` and a `journal/` directory. A suite places separate runs in `secure/` and `ownership-gap/`, plus `suite.json` at the suite root. Record the command, time, assistance, build/generation, scope, total request accounting, evaluator status, review objections, report path and cleanup result. Credentials are not part of that record.

`demonstrated` means the selected effect met this evaluator's evidence requirements. `not-demonstrated` means that effect was not established in the collected evidence. `inconclusive` means the evidence cannot support a decision; inspect the recorded reasons. A missing, denied, partial or timed-out collection is never silently a clean result.

Check response payloads as well as status codes. Tie the observed order to the owner creation/read, the other user's authenticated `/api/me`, and the exact foreign-read receipt in the same run/build/generation. Request receipts carry safe redacted content and raw-body digests; a digest does not authenticate an independent collector, restore omitted content or prove absence of secrets. Review narrative and business values before sharing any report.

Use the approved [canonical reader](reader-report.md). The rehearsal summary includes `status`, `stages` (each with `id`, `status`, `evidenceIds`, `details`), `evaluation`, `cleanup`, `reportPath` and `journalPath`. Interactive `report` returns `type: "report"` plus exported session fields and paths; `stop` emits `type: "stopped"`, `cleanup`, `reportPath` and `summaryPath`. Open the returned `reportPath` for the standalone read-only HTML. The old reader guide's workbench commands must not be assumed compatible with this lab. Re-export updates this run's generated report/state/evidence/summary; journal history retains earlier conclusions. Keep that journal with the report. `verifiedFindings` stays empty unless its separate independent-authority requirements are actually met; a guided reproduced effect can be reported with its limitations as an owner-action result.

## 5. Stop and verify

Scripted runs close services in `finally` and return `cleanup`. In an interactive session enter `{"command":"stop"}`; EOF, SIGINT, SIGTERM and the ten-minute lifetime also invoke close/export. Focused CLI tests exercised explicit stop and EOF; signals/lifetime were source-inspected, not exercised by those tests. Require `cleanup.status: "observed-closed"`, empty `errors`, `transport.active: 0`, `transport.stopped: true`, and closed `listenerChecks` for target HTTP, inbox HTTP and SMTP. Closure checks require connection refusal; a timeout is not proof. Target inspection also checks no live handlers/connections. Inspect accounting: attempted, sent, completed, errors, denied, active and stopped are different values. Terminal exit alone is not verified cleanup.

If the process exits unexpectedly or cleanup evidence is absent, record **cleanup unverified** with the run's known owned origins and error. Do not infer closure from a terminal status. Do not kill general Node/browser processes, sweep ports or restart services. Escalate the exact owned-resource uncertainty to Cass without broadening the task.

## 6. Retry, resume or reset without losing evidence

1. Keep the original run directory intact, including partial receipts, errors and cleanup uncertainty. Do not overwrite a failed run with a passing rerun.
2. Use `node src/lab/cli.mjs inspect --out runs/EXISTING_RUN` to read saved journal records and any saved summary without networking or restarting the target. Replace the path with a concrete run directory; for a suite choose its `secure` or `ownership-gap` child. Inspect reports manifest, revision, head and last event even when the final summary is absent. Its saved cleanup status is historical, not a live-process assertion. Viewing evidence is not permission to replay requests; there is no in-place execution resume command.
3. If a rerun is needed, first verify the earlier run stopped, then create a fresh run/generation and new output directory. Record the earlier run ID and reason for retry. Do not reuse its ephemeral tokens or combine its receipts with the new generation.
4. Do not automatically retry registration or other writes after a timeout: the first request may have taken effect. Preserve the ambiguous receipt. The transport has no automatic retries; stop/reset and start a separate clean generation when appropriate.
5. Reset means starting fresh disposable application state through the owned lifecycle. It does not mean deleting evidence, clearing shared directories, changing host accounts or killing unrelated processes.
6. After source changes, retain both builds and perform a fresh comparable test before calling anything repaired. If the build, identity, object or controls cannot be matched, retain uncertainty rather than closing the result.

## Current resource gaps

- Focused verification: `node --test test/lab-cli.test.mjs`, 4 passed, 0 failed. Two-mode suite artifacts retained at `C:/Users/kotar/AppData/Local/Temp/synapse-cli-suite-ydMS5K`; explicit-stop session at `C:/Users/kotar/AppData/Local/Temp/synapse-cli-session-hrjHex`; EOF session at `C:/Users/kotar/AppData/Local/Temp/synapse-cli-session-AX6i7U`. Both modes produced expected selected evaluator states and observed closed resources. No recursive cleanup/deletion was performed.
- SIGINT/SIGTERM, ten-minute expiry, setup failure and interrupted export durability were not exercised by Mori's smoke tests. Missing artifacts still require an honest incomplete/cleanup-unverified record.
- An external mail provider, broader execution sandbox, arbitrary generated helper execution and autonomous investigation remain outside this local rehearsal's readiness claim.

Research consulted: the local contract plus `scanners.nbret-http-path-boundaries` (selected source/loopback evidence), `workers-queues.kill-switch-sequence` (design synthesis), and the cited passages in [implementation reviews](../research/security-landscape/implementation-reviews.md) and [worker model](../research/bots-swarms/model.md). These motivate evidence and stop checks; they do not verify this new implementation. Existing stopped-work restrictions remain in force.
