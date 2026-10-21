# Learning reader map

Updated 2026-10-17. Integration handoff for Rowan; Markdown navigation only. Detailed annotations and original receipts remain authoritative for claim scope. The broad investigation is active.

## Read first

Start with [NBRET inventory](inventory.md): it distinguishes inherited research and the existing implementation tracks. Then read [discipline map](discipline-map.md) to understand why scanning, pentesting, adversary emulation and detection validation answer different questions. Follow [company delivery](companies.md) for what public sources establish about the work customers purchase.

For the technical learning route, start with [report interpretation](deep-review/report-interpretation.md), then [reporting boundaries comparison](deep-review/reporting-boundaries-comparison.md). These explain a recurring finding: completion, an alert, an assertion pass and an effective defensive outcome are different observations. The [assurance proposal](deep-review/report-assurance-proposal.md) explores a falsifiable improvement; it is not an implemented product or evidence of demand.

## Topic hierarchy for integration

| Chapter | Plain-English question | Detailed evidence |
| --- | --- | --- |
| Field and buyers | What question is each assessment meant to answer? | [Discipline map](discipline-map.md), [companies](companies.md), [standards](standards.md) |
| Evidence acquisition | How does NBRET collect and associate observations? | [Capture](deep-review/nbret-capture.md), [discovery](deep-review/nbret-discovery.md), [identity/checks](deep-review/nbret-checks-identity.md) |
| Assessment orchestration | What starts, monitors and stops a scanner? | [NBRET scanner](deep-review/nbret-scanner.md), [ZAP control flow](deep-review/zap-control-path.md), [network](deep-review/zap-network.md) |
| Template-driven testing | How does a template become requests and match results? | [Nuclei template path](deep-review/nuclei-template-path.md), [matchers](deep-review/nuclei-matchers.md), [HTTP](deep-review/nuclei-http-path.md), [execution](deep-review/nuclei-execution.md) |
| Identity and reuse | Which identity survives caches and credentials? | [Nuclei input identity](deep-review/nuclei-input-identity.md), [auth](deep-review/nuclei-auth.md), [native transport](deep-review/nuclei-native-network.md) |
| Findings and persistence | What survives grouping, storage and reload? | [ZAP alerts](deep-review/zap-alert-persistence.md), [history](deep-review/zap-history.md), [Nuclei output](deep-review/nuclei-output.md) |
| Reports and closure | What can a report or status actually establish? | [Interpretation](deep-review/report-interpretation.md), [complete per-file report annotations](deep-review/zap-reports.md), [NBRET test limits](deep-review/nbret-test-evidence.md) |
| Evaluation and opportunities | What was measured, and what would disprove an idea? | [Lab overview](lab-results.md), [synthesis](synthesis.md), [assurance proposal](deep-review/report-assurance-proposal.md) |

## Evidence labels must survive rendering

Use separate visible labels for inherited conclusion, vendor claim, source-read behavior, hypothesis/inference, local runtime result and rejected or superseded interpretation. Source-reading completeness and runtime validation are separate dimensions. Historical checkpoint prose is dated; later receipts supersede only explicitly tested claims. A failed build means no executed tests, while an expected failing control must retain its original result. Do not turn a rejected generalization into a current finding merely by extracting its sentence without the limitation.

The [cross-track SDK dependency](deep-review/report-assurance-proposal.md#sdk-collection-dependency--peer-source-review-2026-10-17) is attributed peer source review. It is neither an independently reviewed implementation here nor runtime validation. Keep transport acknowledgement, returned result, callback invocation, observed effect and stored replay distinct.

## Finite milestones, not overall completion

As of this update, [file-queue.json](deep-review/file-queue.json) records all 48 selected NBRET files complete at recorded hashes, and all 11 selected NetworkPolicy files complete at their pin. These close those finite source-reading inventories only. They do not establish every dependency, deployed configuration, runtime behavior or security property. NBRET sources were selected inventory entries; avoid presenting this as every file in every branch.

A second finite milestone is the ordinary ZAP automation/report result chain: ReportJob and report helpers, progress/plan/job infrastructure, event transport and GUI projection, assertion implementations and adjacent tests, JobUtils and adjacent tests, ExtensionAutomationUnitTest and its direct YAML/template dependencies have contiguous source annotations in [zap-reports.md](deep-review/zap-reports.md). This does not close the entire ZAP or addon queue; the active scanner job remains partial in this ledger. Source tests were read, not executed in the latest continuation.

[Snapshots](deep-review/snapshots.json), [dated queue](deep-review/file-queue.json), [priority handoff](deep-review/priorities.md), and [coverage](coverage.md) retain exact boundaries. Many ZAP/Nuclei/addon dependencies remain unread. File/hash counts are inventory checks, never understanding scores or assurance percentages.

## Current continuation

Next owned thread: ordinary exit-status and report-closure implementation/test oracles. The flagged operation stays stopped; no retry, equivalent fixture or alternate route is authorized by this handoff. Latest continuation is source/documentation only. Rowan owns the HTML reader; this file does not create a competing frontend.


### Related build/regression interpretation

Lark’s canonical [Coraza/CRS continuation](../bots-swarms/continuation.md) opens with pinned source annotations showing a Docker build step that converts cheap-test failure to a warning and regression configuration that excludes specified cases. Use that source for the mechanism rather than duplicating it here. Reader implication: label build completion, selected test execution and excluded cases separately; a configured pass cannot answer for an excluded case. This is attributed peer source evidence, with no image/test execution in that review.


### Related upstream-test selection boundary

For why a broad upstream test command is not inherently offline, use Linden’s canonical [example execution boundary](../toolchain/go-material-review.md#example-execution-boundary-broad-tests-are-not-inert). Keep the HTTP example’s explicitly installed loader separate from the consuming application’s effective loader. This cross-reference adds no runtime result or independent source-reading credit; current Tomo continuation remains source-only.


For step-level versus final-job CI gates and language-matrix limits, see Lark’s canonical [selected CI gates](../bots-swarms/continuation.md#ci-configuration-selected-gates-not-executed-assurance). Keep declared workflow policy separate from actual run evidence and branch-protection policy.
