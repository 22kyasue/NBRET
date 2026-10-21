# Assessment toolkit verification

Implemented and verified locally on 2026-10-18. No client target, upstream exploit/agent runtime or stopped research operation was exercised.

## Executed checks

`node --test test/assessment.test.mjs test/testing.test.mjs test/scope.test.mjs test/tiers.test.mjs`

Result: **24 passed, 0 failed, 0 skipped**, including nine new assessment tests.

The new assessment cases verify:

- Preflight rejects expired/unapproved scopes, unapproved writes including declared GET side effects, foreign origins, status-only security assertions and missing credentials before requests.
- A deceptive 403 containing a private object fails the content rule, with a successful legitimate owner control.
- Reviewed repair verification accepts fresh session epochs/build revisions while retaining stable claims; comparison does not mutate input manifests.
- Offline evaluation detects duplicate evidence, changed identities, missing session binding, changed bytes, stale configurations and unfinished checkpoints without sending requests.
- Failed legitimate controls prevent confirmation/repair closure; denying all requests cannot manufacture a successful repair.
- Redirects are not followed, non-JSON content is incomplete, and known credential strings reflected in response values are removed.
- Pre-execution cancellation sends no requests. Evidence-budget exhaustion stops later requests and retains an explicitly unfinished checkpoint.
- Matrix generation expands actor/resource cases and resets authorization to draft.
- CLI init/plan are offline; existing output directories, unknown flags and draft execution are rejected. CLI evaluate/review/retest operate end to end; altered stored result facts are rejected against retained evidence.

Adjacent tests cover existing HTTP compression/deadlines, scope selection, assertions, probes, fake-harness exploration, and simulated ZAP orchestration. They do not establish live scanner correctness or browser coverage. The complete repository browser/capture suite was not run for this CLI-only change.

`npm run demo:assessment` also completed the synthetic lifecycle: disclosure despite refusal status → scripted known-answer review → repaired denial plus legitimate access → `repair-verified-for-tested-cases`. The demo uses new ignored folders under `runs/assessment-demo-*` and closes its owned loopback server.

`git diff --check` passed, with pre-existing LF/CRLF conversion notices on unrelated capture files. Existing working-tree changes and research records were preserved.

## Remaining limits

The tests demonstrate the named finite fixtures, not general vulnerability discovery, client readiness, exhaustive authorization coverage or independent review. In-flight cancellation is timeout-bounded rather than immediate. Actor/build labels and grant references are declared by the trusted operator; session verification and tamper-resistant external evidence storage remain unimplemented. See [the toolkit guide](assessment-toolkit.md) for precise implemented boundaries and next acceptance gates.
