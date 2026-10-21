# How a security-testing engine is built

A testing engine turns a question into actions and observations. The difficult part is preserving the meaning of the question through scope, identity, input generation, network behavior, matching, storage and reporting.

NBRET already has capture, exploration, request probes, assertions, analysis and scoped ZAP integration. The research examined those paths and selected ZAP and Nuclei implementations, rather than treating another scanner integration as an automatic improvement.

## Separate the pipeline into contracts

| Stage | Input | Output | Important failure |
| --- | --- | --- | --- |
| Scope | Approved targets, actions and budgets | A decision about each proposed action | A redirect or alternate path escapes the intended boundary |
| Identity | A known role, tenant and session context | An identity-bound request | Evidence from another account is reused |
| Generation | A hypothesis or selected rule | A concrete request/test case | The generated input does not test the intended property |
| Execution | Request plus limits | Response, error and timing | A timeout is silently treated as a clean negative |
| Matching | Observed data and check logic | A match or assertion result | A status or pattern answers the wrong question |
| Evidence | Original observations and metadata | Durable, attributable records | Normalization, grouping or redaction removes a distinction |
| Reporting | Findings, errors and coverage | An understandable account of the work | “No finding” is presented as “no weakness” |
| Retest | Versioned property and repaired context | Fresh evidence about the repair | A different account or inaccessible page makes an apparent pass |

## A scanner rule is a small program with assumptions

A template-driven scanner loads a rule, chooses a protocol path, constructs requests and applies matchers or extractors to responses. A matcher's result depends on precisely what it checks. Some checks can identify a known exposed condition; others supply a clue requiring investigation. The template's name is not a substitute for reading its logic.

The Nuclei studies trace template loading, request execution, identity, caches, authentication, matching and output. They investigate how context can be reused and what reaches the final event. This is the kind of reading needed to understand whether a tool integration preserves the account, request and result that a downstream claim depends on.

ZAP introduces another orchestration problem: starting a job, observing progress, stopping the right operation and interpreting alerts and reports. A progress counter, completed job, generated file and verified security property are separate observations. The report studies follow those states through configuration, serialization and user interfaces.

## Define the check before looking at the result

For the order example, the property is that Alice must not receive Bob's private order. The test must establish the identity and target object, actually reach the route, inspect the content and include a positive control showing Bob can still read his own order.

A useful negative result needs successful observation. A timeout, rejected fixture, missing body or failed login cannot silently become a pass. The local research used known-answer cases to make such distinctions visible. These finite checks do not measure general discovery ability across unknown applications.

## Evidence needs identity and version

Requests with the same URL and body can have different meanings under different users or policy states. Retaining raw credentials is dangerous and often unnecessary, but stripping identity entirely can make records ambiguous. A non-secret identity envelope should record tenant/role/test-account labels, session epoch where relevant, environment revision and the evidence source.

Likewise, an imported report can change grouping and lifecycle. A finding that disappeared because a parser filtered it is different from a weakness that was retested and repaired. Keep raw observations and derived findings as separate layers.

## Reproduce, build, deliver

### Three concrete lessons from a database driver's tests

The pgx source study supplies useful examples of how to judge a test, even outside security scanning. First, its runner clears inherited test-environment settings before selecting a database target. Maintainer comments describe a prior case where PostgreSQL tests could be labelled as CockroachDB passes. The current reset code addresses attribution: a result needs to belong to the environment its label names. We inspected this source and its comments; we did not reproduce that historical failure or execute the upstream runner.

Second, one numeric fixture explicitly forces binary parameters so automatic text fallback cannot hide the binary behavior under test. This is a practical lesson for scanner adapters too: reaching a successful alternative path does not establish that the intended path worked.

Third, an authored regression policy rejects literal direct binary integer reads in a selected source set. That is a reusable check against one recurrence pattern. Its line-based matching cannot establish all decoder safety or catch unchecked slice indexing. A useful automated guard has a defined search space and a visible limit. Read the [full database binding and test-oracle study](../../assessment-evidence/pgx-binding-boundaries.md) for the exact files, ranges, positive evidence and contrary controls. These additions are source/test-authoring evidence; no upstream tests were run here.

### When the expected output does not establish execution

Two inspected pgx executable examples illustrate another distinction. On their CockroachDB branch, they deliberately print the expected output and return because the examples cannot use an ordinary test skip. An output checker could therefore see the expected answer without the unsupported custom-type or child-record capability having run. The ordinary branches query and render actual values. This is documented conditional behavior in the inspected source, not an observed execution or an allegation of dishonesty.

A related derived-type test scans an array but does not assert its contents; its scalar-value and type-name assertions still supply positive evidence for those narrower checks. Reading the setup tells you what the test could exercise. Reading the assertions tells you what its success actually establishes. The [canonical study section](../../assessment-evidence/pgx-binding-boundaries.md#authored-example-success-versus-capability-execution) preserves both sides. No upstream example or database test was executed in this review.

Benchmark names need the same scrutiny. In the inspected pgx source, a benchmark named for mapping row fields **by name** actually calls the mapper that uses field **position**. Its adjacent by-name benchmark calls the by-name implementation correctly, and the generic collection benchmarks retain explicit row-count checks. The narrow lesson is to inspect the actual workload and its checks before attributing a measurement to a capability. This was a source finding; no benchmark was run and no speed comparison was made. The [full study](../../assessment-evidence/pgx-binding-boundaries.md) records the exact benchmark and lines.

**Reproduce the mechanism:** run the local order lab's verification script. It intentionally includes a deceptive refusal whose response body still contains private data. Compare status-only reasoning with the defined property check.

**Build a minimal engine:** start with explicit cases rather than automatic discovery. Implement allowlisted loopback origins, bounded requests, identity labels, content assertions, structured errors and an immutable receipt. Add discovery only after the executor and evidence contracts work.

**Deliver the service:** translate a validated observation into a finding that includes preconditions, consequence, evidence, repair guidance and a retest. Review the evidence independently before presenting an automated hit as a confirmed vulnerability. A large tool catalogue adds value only when its outputs remain interpretable.
