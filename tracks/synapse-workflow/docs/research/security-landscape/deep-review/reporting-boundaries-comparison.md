# Reporting boundaries across NBRET, ZAP and Nuclei

Dated2026-10-17. A technical comparison of selected pinned paths, **not a tool ranking or market claim**. Current continuation is source-only. Earlier runtime receipts retain their original narrow environments; no flagged operation is retried.

| Responsibility | NBRET reviewed path | ZAP reviewed path | Nuclei reviewed path |
|---|---|---|---|
| Where finding meaning originates | Deterministic analysis/diagnosis and separately supplied reader narrative | Alert objects and scanner rule/human confidence state | Template operators/matchers and ResultEvent constructors |
| What rendering proves | It can display supplied content; HTML escaping/disclaimers are positive controls | It selects and formats existing alert/progress objects; entry-path filter defaults differ | It formats and transports an existing result event; no retest in formatter |
| Evidence versus identity | File containment and pointers; sourceInputs filenames do not bind assessment subject | Taxonomy GUID identifies provider/version/id; job/plan IDs process-local | Event carries template/target fields, not independent proof of assessment authorization or validity |
| Category/filter transformation | Analysis labels observed/inferred/unknown; caller narrative separately loaded | Empty/null/allfalse differ by ordinary UI/editor/API; independent context/risk/confidence restrictions | JSON omission mutates raw Request/Response fields on shared event; sequential sink order matters |
| Secret handling at examined boundary | Escaping and safe links are presentation controls, not recursive secret removal | Traditional plus templates export messages using format escaping; SARIF helper is a separate path | Standard writer redacts four string fields with keyed regexes; other fields/log/debug sinks outside that pass |
| Failure/finalization | New output directory guard, sequential writes; no atomic report manifest in analyzed assembly | Progress errors separate from COMPLETED; GUI checks errors/warnings, CLI exit separate | Sink errors/counts/close semantics differ; output count is not all-sink durable acknowledgement |
| What counts cannot establish | Requests/source/function totals are not complete app coverage; report says so | PASS absence-of-alert/URI inventory is not complete executed-case coverage | Writer result count is not unique vulnerabilities or independent validation |

Grounding and exact source ranges: [NBRET report/input review](nbret-test-evidence.md), [ZAP report/template/status review](zap-reports.md), [Nuclei output review](nuclei-output.md). Versions/hashes: [snapshots](snapshots.json), [file queue](file-queue.json). The file queue is reading provenance, not security assurance.

## Keep evidence tiers separate

Source reading explains the mechanism and candidate failure behavior. A test read describes what an author asserts; it is not a passing run. An isolated copied-helper/component experiment has a smaller boundary than the real composed engine. An installed-class lab exercises installed code but can still bypass daemon, UI, database or full capture setup. None alone demonstrates customer-environment performance.

Earlier NBRET report-state/identity receipts, ZAP SARIF/filter/class receipts and Nuclei output/buffering receipts should be consulted by their exact scope. Do not add their check counts into one score, compare incomparable runtimes, or present them as whole-product recall.

## Practical assurance implications

A technically credible delivery process separates source observations, tool findings, expert validation and remediation closure. The reviewed code shows why a polished report or green label is insufficient on its own, while also showing existing safeguards. The useful mechanism to explore is a precise effective-configuration/finalized-state record, not additional autonomous execution. See [design-only proposal and falsification](report-assurance-proposal.md).

Open questions: supported final-state APIs; template/renderer dependency semantics; job result binding across reruns; redaction requirements by evidence field; independent reviewer usefulness and customer procurement needs. No production fix or customer study has been performed.
