# Monitoring: persistence, confidentiality and observer effects

UnifiedAgent pin `acff8eeadf93e367d4a1578d3a2739cbc9d3ace5`, read 2026-10-17. These complete-file reads extend [the agent flow](deep-pentestgpt.md), not a separate platform survey. No tracked LICENSE was found in this dependency snapshot; do not inherit PentestGPT's MIT license for it. [Queue](deep-reading-queue.json) preserves hashes and ranges. No real monitor database or provider was accessed.

## Complete source trace

| File / contiguous ranges | Established contract and boundary |
| --- | --- |
| `task.py` 29–51 | Reads caller-selected context files whole, then truncates to 200,000 characters for rendering. No workspace containment check or trust isolation between task instructions and target-derived context is established here. Truncating the rendered text is not a file-read memory bound. |
| `skills.py` 46–106 | Safe-loads YAML and validates skill name/description/directory agreement; portability lint reports selected host-specific syntax. This validates formatting, not trustworthiness or tool permissions. |
| Same 120–162 | Installs symlink/copy into both discovery roots; copy mode forces replacement of existing target directories. Treat source/workspace/installation as trusted configuration. The research did not invoke installation, replacement or deletion. |
| `monitoring.py` 96–185 | SQLite connection, lock, WAL, schema version checks, run/event tables and event foreign key. Initializes schema even for an inspector connection; “read-only” describes API actions, not a SQLite mode=ro connection. |
| Same 191–292 | Exclusive run ID insertion, parameterized run/event reads and ordered pagination. API has no caller/tenant authorization argument; knowing a run ID is not an access-control mechanism. Run filters constrain accidental mixing, not a malicious reader with database/API access. |
| Same 298–362, 381–406 | Attempts file/WAL/SHM mode 0600; append uses conditional expected sequence within a transaction and rejects closed runs; finish transitions only running records. Filesystem ACL behavior is host-specific and untested. No authenticity signature or retention/deletion/revocation policy is implemented here. |
| Same 364–378, 429–458 | Omits reasoning and raw backend data by default; converts/truncates retained text. Command/tool outputs, prompt and nested metadata can still contain sensitive values. `_json_safe` means serializable, not secret-redacted. |
| `monitor_web.py` 45–113 | Adds CSP/referrer/nosniff/frame headers. CLI bind validator rejects non-loopback addresses. Optional dependency imports are lazy; neither these headers nor loopback binding are a tenant-authentication layer. |
| Same 172–300, 303–393 | Lifespan opens SQLite monitor; routes list runs/details/events without per-user authorization. SSE resumes by sequence and ends on final state. `create_app` can be embedded independently of CLI bind validation; external deployment requires its own access-control and bind policy. No network server was started here. |
| Same 116–133 | `_owner_alive` uses same-host PID and os.kill(pid,0); liveness is only inferred for running rows. PID reuse and OS-specific signal behavior are separate assumptions. |
| Same 396–539, 542–603 | Demo manufactures safe event text and completed statuses; it does not execute the displayed curl/read commands. CLI controls demo flag, host/port/poll interval and uvicorn launch. Demo traces must never be labeled actual command execution. |
| `backends/base.py` 11–19 | Protocol requires a normalized stream ending in TurnCompleted; a structural protocol cannot independently enforce a backend's actual effects. |

## Narrow runtime evidence

[Plan](deep-lab-plan.md), [fixture](deep-monitor-lab.py), [receipt](deep-monitor-receipt-r2.json) and [run](deep-monitor-run-r2.json): actual in-memory SQLite monitor omitted reasoning/raw data, retained a synthetic command secret and prompt by default, returned no events for another run ID, and rejected recording after finish. AST-loaded bind helper rejected 0.0.0.0 and accepted 127.0.0.1. No SDK, shell command represented by an event, web app or real credential was used. This is confidentiality/ordering behavior on synthetic data, not a tenant-isolation certification.

## A rejected Windows hypothesis

The initial hypothesis was that signal zero would reach Windows TerminateProcess and terminate an owned child. That inference was **wrong**: zero is Windows CTRL_C_EVENT, a special branch. The [failed first run](deep-monitor-run.json) preserves its five-second timeout, not a passing termination result. A second hidden child using the base interpreter also stayed alive for the two-second observation interval; the helper returned true. Finally blocks terminated/waited only those newly created owned children. No existing session PID was passed to the helper.

Primary sources: [Python os.kill documentation](https://docs.python.org/3.14/library/os.html#os.kill) distinguishes the special console-control signals; [CPython v3.14.7 posixmodule.c](https://github.com/python/cpython/blob/v3.14.7/Modules/posixmodule.c#L9702-L9750) 9702–9750 takes GenerateConsoleCtrlEvent for the special values before the TerminateProcess branch. This is a **partial function-level dependency read**, not a complete read of that large file. Local Python 3.14.7 reports CTRL_C_EVENT=0 and CTRL_BREAK_EVENT=1. The fetched tagged file is retained in ignored local receipts storage.

The evidence supports a narrower portability concern: the helper invokes a console signal API instead of an explicitly neutral Windows process-status API. These no-console synthetic runs establish no termination, no actual user-visible signal and no deployed exploit. Whether the helper accurately reports liveness for real console groups, inaccessible processes, remote-host rows or reused PIDs remains untested. Preserve the rejected hypothesis instead of promoting the documentation fragment into an impact claim.

## What would improve an assessment claim

Separate recorder durability from evidence truth, serialization from redaction, loopback from tenant authorization, and demonstration events from executed events. A useful smallest experiment is a synthetic secret-flow test across prompt, tool result, stored SQLite, SSE and rendered UI, with an explicit retention/access policy. Reject the proposal if redaction removes required provenance or a supposedly authorized reader can observe another tenant's canary. UI DOM insertion/rendering assets and actual HTTP/SSE integration remain unread/unexecuted; do not claim browser content isolation from response headers alone.
