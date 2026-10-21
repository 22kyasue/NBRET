# Offline investigation foundation

This is the offline foundation of [build-plan.md](build-plan.md): a local record journal, deterministic review lifecycle, private report and historical assessment-artifact inspector. It does not investigate a website, send a request, start an agent, scan, execute instructions, authenticate a reviewer or establish a vulnerability. No additional packages or provider fees are required. Use it from an existing coding-agent session.

## What it preserves

The journal stores immutable ordered records with a manifest-bound hash chain. Reopening reconstructs the current state; it never replays external actions. A current revision and head are required for each append, so stale writers fail instead of losing an update. A stopped investigation stays stopped after reopening. Review disagreements and separate owner-verification records remain in history.

The report distinguishes review-supported leads, needs-action items, unconfirmed leads and rejected leads retained for audit. These are **declarations under a trusted local operator**, not independently authenticated findings. Identity and environment labels are declared strings. A matching artifact digest is only a reference until a separately trusted collector/verifier establishes its bytes and meaning.

## Local usage

Create an input manifest outside the output directory:

```json
{
  "schemaVersion": 1,
  "kind": "nbret-investigation",
  "id": "practice-records-1",
  "target": "http://127.0.0.1:39999",
  "mode": "practice",
  "createdAt": "2026-10-18T20:00:00.000Z",
  "limitations": ["Metadata only; no target activity authorized."]
}
```

The URL is inert metadata. No application needs to be running there. Manifests reject userinfo, query strings and fragments; do not put credentials in any field. Modes are practice, blind and guided, but choosing blind does not prove answer-key isolation.

```text
node src/investigation/cli.mjs init --manifest manifest.json --out runs/practice-records-1
node src/investigation/cli.mjs status --run runs/practice-records-1
```

The command returns revision and head. Supply those exact values on append. A progress event is an ordinary record, not an executable task:

```json
{
  "id": "progress-1",
  "at": "2026-10-18T20:01:00.000Z",
  "actor": {"id": "kotaro", "role": "operator"},
  "type": "progress.recorded",
  "payload": {"note": "Read the provided brief; no application contacted.", "minutes": 2}
}
```

```text
node src/investigation/cli.mjs append --run runs/practice-records-1 --event progress.json --revision 0 --head EXACT_HEAD_FROM_INIT
node src/investigation/cli.mjs report --run runs/practice-records-1 --out runs/practice-records-report-1
```

Export requires a new directory. REPORT.md is a readable projection; projection.json contains the derived summary; records.json retains the complete local declarations and journal head. These files may contain sensitive free text and are not automatically sanitized or approved for sharing. Interrupted exports can leave a partial new directory; the journal remains authoritative. Export is not transactional and does not imply publication.

Other supported event types are lead.recorded, evidence.recorded, review.recorded, verification.recorded, request.recorded, request.resolved and run.stopped. The pure schema in src/investigation/records.mjs defines the exact fields and rejects unknown ones. An unresolved request is not a grant of permission. No run, scan, browser, provider or live-resume command exists. Creation and export refuse destinations inside any enclosing journal, including a different journal or junction alias.

## Inspect an existing assessment run offline

```text
node src/investigation/cli.mjs inspect-assessment --source runs/retained-assessment --out runs/assessment-inspection-1
```

The source must contain regular local engagement.json, evidence.json and unreviewed results.json files. Limits are 1 MiB for engagement and 8 MiB each for evidence/results. The inspector rejects unsupported schemas/fields, duplicate JSON keys, invalid UTF-8, excessive structure, source links/nonfiles, changed reads and unsupported reviewed-result transformations. Normalized digests and original byte hashes are distinct. Source files are never rewritten. Output must be a new directory outside the source and all journal ancestors.

The inspector recomputes historical case assertions using the identity-bound assessment adapter, validates every observation's full identity/environment/request/oracle binding, and compares the saved machine results. Duplicate/orphan observations, changed bytes, impossible declared chronology, running checkpoints, ambiguous error-plus-response data and missing response timing reject. Explicit incomplete runs retain missing-case/incomplete counts; failed controls remain inconclusive. Retained redaction and missing structured data do not become passes. The legacy identity-agnostic offline matcher is not used.

inspection.json contains source hashes, case outcomes, candidate references and limitations, omitting raw responses/request details. Candidates still require review: this command does not insert journal leads, invent a separate producer, confirm findings, grant live permissions or prove source authenticity. Sources and output remain private; no general secret sanitizer is claimed. A successful inspection says these historical files are internally consistent with the current interpreter, not that their declared effects happened or remain true today.

The reader uses bounded file reads and consistency checks under a cooperative-local filesystem assumption. Three source files are read sequentially, not as an OS snapshot. A malicious writer controlling this account and replacing the entire consistent source set is outside this trust model. Windows file-symlink creation was unavailable for the test process; junction-root and junction-artifact rejection were exercised instead. No assertion of general OS isolation follows.

## Trust, corruption and recovery

The pure lifecycle caps each record's structure and the cumulative serialized manifest/event input at 16 Mi UTF-16 code units, independently of the journal's 64 MiB byte cap and 10,000-event ceiling. These are input budgets, not a measured process-memory guarantee. Rejected histories do not partially mutate caller inputs.

The store is for trusted local operators. Hashes detect changes relative to retained records, not an owner rewriting the complete store. Actor names and roles can be supplied by that operator; they are not authentication. Separate review labels or folders do not enforce independent access or hidden-answer secrecy.

Locks are exclusive and never automatically stolen. An interrupted write can leave a lock or temporary entry. Committed corruption and unexpected files fail closed. Preserve the directory and inspect it; no automatic unlock, truncation or repair is provided. Do not blindly delete a lock because another process may still be working. File synchronization and atomic publication do not establish a universal Windows power-loss guarantee. Filesystems without the required publication primitive are unsupported rather than silently downgraded.

## Acceptance and remaining work

Status and report operations also take the journal lock to obtain a consistent snapshot, so the journal directory must be writable. Keep a prior journal head outside the store when rollback detection matters: deleting a complete suffix cannot be detected from the remaining valid prefix alone. A failed append may have published its event before a later sync/cleanup error; reopen and compare the head before deciding what to retry. Do not interpret an error as proof that no record committed.

Focused tests are under test/investigation-*.test.mjs. They exercise in-memory declarations and owned temporary files; the CLI integration test launches only the local record CLI. No target listener, scanner, provider or browser is needed. Root npm test and existing demos are not substitutes for these focused checks.

This increment does not satisfy adaptive v1 by itself. Missing pieces include trusted effect/producer verification, enforced evaluation-role isolation, scorer admission and a competent manual baseline, authorized observation/execution adapters, the adaptive loop, real repair verification, and effectiveness measurement. Selected source-file consistency checking is implemented; arbitrary journal artifact references are not loaded. The staged plan retains those gates rather than implying that passing storage/import tests demonstrates assessment quality.
