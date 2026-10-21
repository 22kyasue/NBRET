# Reports, report formats and finding state

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 17 findings, 17 related corrections, 4 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.flagged-operation-cause`** [security-landscape/deep-review/zap-reports.md:81](../../security-landscape/deep-review/zap-reports.md#L81): An agent may infer which specific operation was flagged from nearby source comments, or treat 'flagged operation' as a known classification. **Instead:** The cause is unknown; 'flagged operation' wording overstated the evidence (docs/research/safety-context/README.md:33). Keep the stop, do not reconstruct it.
- **`hazard.garak-init-network`** [assessment-evidence/deep-garak.md:27](../../assessment-evidence/deep-garak.md#L27): An agent may initialize garak assuming it is local-only, generating provider traffic and cost. **Instead:** Treat scanner construction as network activity requiring authorization (docs/research/reconciliation/README.md:5).
- **`hazard.nbret-scanner-next-daemon-fixture`** [security-landscape/deep-review/nbret-scanner.md:41](../../security-landscape/deep-review/nbret-scanner.md#L41): An agent may launch new ZAP daemon/scanner experiments as the 'next step'. **Instead:** Done already (zap-directory-rule.md:17); scanner capability/reachability work stopped (docs/research/safety-context/README.md:14; zap-reports.md:81). Do not start new scanner runs without Kotaro's explicit instruction.
- **`hazard.takumi-connect-repo`** [cybersecurity-firms/gmo-flatt-security.md:35](../../cybersecurity-firms/gmo-flatt-security.md#L35): An agent evaluating Takumi could upload NBRET or client code or install the write-enabled GitHub App. **Instead:** Do not upload code or install apps without explicit approval (gmo-flatt-security.md:35; takumi-github-scope-boundary.md:11).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [ZAP AlertSet keeps a stale highest-risk alert after clear or downgrade](#reportingalertset-stale-highest-risk) | component-lab | reporting |
| [NBRET analysis kept scanner=failed yet reported no-recorded-gaps; reports omit SCAN_FAILED](#reportingnbret-failed-scan-no-gaps) | component-lab | reporting, evidence, triage |
| [Nuclei MultiWriter: first sink can strip raw fields for later ones; errors stop delivery](#reportingnuclei-output-sink-composition) | component-lab | reporting, evidence |
| [ZAP report filtering falls back to the unfiltered alert tree on an exception](#reportingzap-report-filter-fail-open) | component-lab | reporting |
| [ZAP report site filter is a raw prefix: lab.invalid also matches lab.invalid.sibling...](#reportingzap-report-site-prefix-filter) | component-lab | reporting, scoping |
| [DefectDojo reimport closure is bookkeeping, and its Nmap parser drops and merges ports](#reportingdefectdojo-closure-not-fix) | source-trace | reporting, remediation, retest |
| [garak report 'all secure' only means no displayed group is at DEFCON 1–2](#reportinggarak-all-secure-means-no-dc2) | source-trace | reporting, ai-evaluation |
| [garak relative z-scores floor sigma at 1/30 and its 'examples' are the first ten found](#reportinggarak-calibration-and-excerpts) | source-trace | reporting |
| [garak bootstrap intervals ignore clustering and can silently skip detector correction](#reportinggarak-confidence-intervals-limits) | source-trace | reporting, ai-evaluation |
| [garak UI labels output/generation counts as 'prompts'](#reportinggarak-prompt-count-is-output-count) | source-trace | reporting |
| [garak taxonomy detail understates failures when unknown verdicts exist](#reportinggarak-unknown-double-subtracted) | source-trace | reporting |
| [ZAP automation alert tests pass when no result data exists; failures can be INFO-only](#reportingzap-automation-vacuous-pass) | source-trace | testing, retest, reporting |
| [ZAP automation exit-status override is a static field with no internal reset](#reportingzap-exit-override-not-reset) | source-trace | operations, reporting |
| [ZAP JSON-plus/XML-plus reports embed full HTTP messages; escaping is not redaction](#reportingzap-plus-reports-raw-messages) | source-trace | reporting, evidence |
| [ZAP report defaults differ by entry path: empty can mean none or all; API adds FPs](#reportingzap-report-entry-path-defaults) | source-trace | reporting |
| [ZAP summary PASS only means no alert was counted for that passive rule](#reportingzap-summary-pass-is-absence) | source-trace | reporting, testing |
| [Takumi 'Not Vulnerable' means could not reproduce; may reflect missing roles/data](#reportingtakumi-not-vulnerable-means-not-reproduced) | public-doc | retest, reporting, evidence |

### reportingalertset-stale-highest-risk

**`reporting.alertset-stale-highest-risk`: ZAP AlertSet keeps a stale highest-risk alert after clear or downgrade** (component-lab)

Installed AlertSet: after clear, size 0 but the highest-risk getter returned the old alert; after replacing a high alert with a same-ID low alert, the getter still returned the old high object. Two repeated runs; controls passed.

**Do:** Do not read node highest-risk indicators as current; recount from the alert list.

**Limits:** Object-level only; SiteNode.deleteAllAlerts resets its own cache, so UI/report impact is per caller.

**Sources:** [security-landscape/deep-review/zap-alert-set-lab.md:11](../../security-landscape/deep-review/zap-alert-set-lab.md#L11)

**Receipts:** `security-landscape/deep-review/zap-alert-set-lab-receipt.json`

**Contrary or narrowing evidence:**
- [security-landscape/deep-review/zap-history.md:91](../../security-landscape/deep-review/zap-history.md#L91): Compensating caller behavior.

### reportingnbret-failed-scan-no-gaps

**`reporting.nbret-failed-scan-no-gaps`: NBRET analysis kept scanner=failed yet reported no-recorded-gaps; reports omit SCAN_FAILED** (component-lab)

Running NBRET's actual runAnalysis on coherent synthetic capture/explore/probe artifacts plus a failed scanner artifact produced analysis.json with scanner.status=failed and coverage.status=no-recorded-gaps; neither the Markdown nor the HTML report showed SCAN_FAILED. Scanner errors or a missing scan do not create a coverage gap in analyze.mjs.

**Do:** A 'no recorded gaps' line in an NBRET report is not evidence that scanning happened or succeeded; reviewers must check scanner terminal status separately, and the report should surface scanner failure before any client delivery.

**Limits:** One synthetic input combination; not every real failure path.

**Sources:** [security-landscape/deep-review/nbret-scanner.md:54](../../security-landscape/deep-review/nbret-scanner.md#L54), [security-landscape/deep-review/nbret-scanner.md:56](../../security-landscape/deep-review/nbret-scanner.md#L56)

**Receipts:** `security-landscape/deep-review/report-state-lab-receipt.json`

### reportingnuclei-output-sink-composition

**`reporting.nuclei-output-sink-composition`: Nuclei MultiWriter: first sink can strip raw fields for later ones; errors stop delivery** (component-lab)

Running unchanged multi_writer.go and format_json.go with stand-in sinks: an omit-raw first sink cleared the shared Request/Response before the second sink, the reversed order kept them, an error in the first sink prevented later delivery, and ResultCount returned the first positive count (2) instead of later 5 or aggregate 7.

**Do:** Order output sinks deliberately and reconcile counts per sink; a cloud or report sink can receive stripped or no data.

**Limits:** Component composition with reduced adapters; not full output package or exporters.

**Sources:** [security-landscape/deep-review/nuclei-output-lab.md:5](../../security-landscape/deep-review/nuclei-output-lab.md#L5)

**Receipts:** `security-landscape/deep-review/nuclei-output-lab-receipt.json`

### reportingzap-report-filter-fail-open

**`reporting.zap-report-filter-fail-open`: ZAP report filtering falls back to the unfiltered alert tree on an exception** (component-lab)

With an exception injected into the ReportData risk getter, the installed filtered-tree method returned the original root containing both instances instead of a filtered result. Source shows exceptions are logged and the current root (possibly the original unfiltered tree) is returned.

**Do:** Check report counts against the requested filters; an exception during report generation can silently widen the report.

**Limits:** Fault injected via a seam; no target-triggerable exception demonstrated.

**Sources:** [security-landscape/deep-review/zap-report-filter-lab.md:7](../../security-landscape/deep-review/zap-report-filter-lab.md#L7)

**Receipts:** `security-landscape/deep-review/zap-report-filter-lab-receipt.json`

### reportingzap-report-site-prefix-filter

**`reporting.zap-report-site-prefix-filter`: ZAP report site filter is a raw prefix: lab.invalid also matches lab.invalid.sibling...** (component-lab)

Calling the installed reports 0.43 inclusion/filter code with synthetic alerts, a site selector https://lab.invalid included https://lab.invalid.sibling.invalid/path. The context filter uses Context.isIncluded, so context exclusions and inScope=false do not remove alerts (an excluded /private URL still passed). An automation report with an unknown requested site yields an empty site list, which means no site restriction.

**Do:** On any shared or reused ZAP session, verify report populations against the engagement's exact hosts; do not rely on site/context report filters to keep other targets' findings out of a client report.

**Limits:** Component fixture; no generated artifact from a real multi-target session.

**Sources:** [security-landscape/deep-review/zap-report-filter-lab.md:7](../../security-landscape/deep-review/zap-report-filter-lab.md#L7), [security-landscape/deep-review/zap-context.md:17](../../security-landscape/deep-review/zap-context.md#L17), [security-landscape/deep-review/zap-reports.md:103](../../security-landscape/deep-review/zap-reports.md#L103)

**Receipts:** `security-landscape/deep-review/zap-report-filter-lab-receipt.json`

### reportingdefectdojo-closure-not-fix

**`reporting.defectdojo-closure-not-fix`: DefectDojo reimport closure is bookkeeping, and its Nmap parser drops and merges ports** (source-trace)

Reimport computes finding lifecycle from matching and disappearance; a disappearance may reflect filters, failed authentication, narrower scope, parser changes or real remediation. The Nmap parser imports only state=open and deduplicates on nmap:port without host or protocol, so finding count is not host-port-protocol count. Async dispatch does not imply background work finished when import returns.

**Do:** Verify each claimed fix with a matched retest under the same identity and scope; keep the raw scanner output alongside the tracker's view.

**Limits:** Source-established behavior at one pinned DefectDojo; no deployed reporting incident observed.

**Sources:** [toolchain/read-first.md:33](../../toolchain/read-first.md#L33), [toolchain/reporting-retest.md:14](../../toolchain/reporting-retest.md#L14), [toolchain/reporting-retest.md:13](../../toolchain/reporting-retest.md#L13), [toolchain/reporting-retest.md:30](../../toolchain/reporting-retest.md#L30)

### reportinggarak-all-secure-means-no-dc2

**`reporting.garak-all-secure-means-no-dc2`: garak report 'all secure' only means no displayed group is at DEFCON 1–2** (source-trace)

The reachable SummaryStatsCard says 'modules evaluated - all secure' whenever no group is DEFCON <=2, including when groups sit at DC-3. It does not inspect attempts, require score 1 or account for exclusions. Separately, useFlattenedModules by default excludes groups with score 1 unless reporting.show_100_pass_modules is set, so the displayed denominator can change without any change in results.

**Do:** Never relay a tool's 'all secure' banner to a client. Report 'no displayed module below the chosen cutoff under these settings', with the digest, configuration and excluded groups attached.

**Limits:** Source-only reading of the UI; no rendered report or reader study.

**Sources:** [assessment-evidence/deep-garak.md:266](../../assessment-evidence/deep-garak.md#L266), [assessment-evidence/deep-garak.md:264](../../assessment-evidence/deep-garak.md#L264), [assessment-evidence/framework.md:30](../../assessment-evidence/framework.md#L30)

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-garak.md:268](../../assessment-evidence/deep-garak.md#L268): DefconSummaryPanel has similar wording but is not mounted on the current page.

### reportinggarak-calibration-and-excerpts

**`reporting.garak-calibration-and-excerpts`: garak relative z-scores floor sigma at 1/30 and its 'examples' are the first ten found** (source-trace)

Calibration.get_z_score replaces stored sigma with at least 1/30 and ignores the stored Shapiro p-value. The calibration population is recorded as filenames, not report digests or model revisions. qual_review shows the first ten failing and passing examples in file order and uses score>0.5 rather than the evaluator's >= threshold. The excerpt is a convenience sample.

**Do:** Present relative scores as comparison with a named reference population and present example excerpts as illustrative only. Neither supports risk probabilities or representative failure rates.

**Limits:** No calibration recomputation; no claim that published calibrations are wrong.

**Sources:** [assessment-evidence/garak-report-fixture-evidence.md:51](../../assessment-evidence/garak-report-fixture-evidence.md#L51), [assessment-evidence/garak-report-fixture-evidence.md:27](../../assessment-evidence/garak-report-fixture-evidence.md#L27)

### reportinggarak-confidence-intervals-limits

**`reporting.garak-confidence-intervals-limits`: garak bootstrap intervals ignore clustering and can silently skip detector correction** (source-trace)

rebuild_cis reconstructs a flat binary vector from total/passed counts and resamples individual entries, with no prompt, application or engagement cluster structure. Stored detector metrics with sensitivity 0 and specificity 1 make the correction denominator zero, so the uncorrected fallback is used. Missing metrics default to perfect 1/1, and metric uncertainty propagation is a TODO. A test named as handling clustering supplies only a flat list.

**Do:** Do not present tool-generated confidence intervals as client-facing uncertainty about vulnerability. Identify the sampling unit and state which uncertainties are omitted.

**Limits:** This is a source/data computation reading; no CI rebuild or coverage simulation was run.

**Sources:** [assessment-evidence/deep-garak.md:196](../../assessment-evidence/deep-garak.md#L196), [assessment-evidence/deep-garak.md:198](../../assessment-evidence/deep-garak.md#L198)

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-garak.md:192](../../assessment-evidence/deep-garak.md#L192): A real test checks that bundled metrics load and differ from defaults.

### reportinggarak-prompt-count-is-output-count

**`reporting.garak-prompt-count-is-output-count`: garak UI labels output/generation counts as 'prompts'** (source-trace)

DetectorsView and its tooltip call the preferred count 'distinct-prompt count', but Evaluator.evaluate sums len(attempt.outputs) across attempts. Under multi-generation attempts the displayed unit is outputs, not prompts. Probe summaries take the minimum detector score while group aggregates pool every probe-detector row.

**Do:** When presenting LLM-test numbers, state the unit (prompt, output, detector judgment) and aggregation operator. Do not let a tool label define the denominator.

**Limits:** This is a producer/consumer source contract; no report was regenerated.

**Sources:** [assessment-evidence/deep-garak.md:178](../../assessment-evidence/deep-garak.md#L178), [assessment-evidence/framework.md:120](../../assessment-evidence/framework.md#L120)

### reportinggarak-unknown-double-subtracted

**`reporting.garak-unknown-double-subtracted`: garak taxonomy detail understates failures when unknown verdicts exist** (source-trace)

The producer sets evaluated = passes+fails and counts None separately. TaxonomyAxisList derives failed as max(nEvaluations - passed - nones, 0), subtracting unknowns a second time. With 2 passed, 3 failed and 4 unknown it would display 0 failed while the pass rate is 2/5. All-unknown cells are dropped and can show 'No techniques match'.

**Do:** Preserve all-unknown as inconclusive and recompute failure counts from raw digest fields before putting them in a client report.

**Limits:** This is a source formula mismatch shown by arithmetic. No rendered artifact was generated.

**Sources:** [assessment-evidence/deep-garak.md:222](../../assessment-evidence/deep-garak.md#L222), [assessment-evidence/deep-garak.md:226](../../assessment-evidence/deep-garak.md#L226)

### reportingzap-automation-vacuous-pass

**`reporting.zap-automation-vacuous-pass`: ZAP automation alert tests pass when no result data exists; failures can be INFO-only** (source-trace)

AutomationAlertTest returns passIfAbsent when the job's result data is missing entirely, and the upstream test explicitly expects a pass with no errors or warnings. onFail=INFO records a failed test without a warning or error (the shipped min/max templates use INFO), and ExtensionAutomation marks a job COMPLETED after catching its exception.

**Do:** Never treat an absence assertion, a green job or a COMPLETED status as evidence that a rule ran; require proof that the producing job ran and produced results, and configure onFail to error for closure checks.

**Limits:** Source and test-oracle reading; no plan was executed.

**Sources:** [security-landscape/deep-review/zap-reports.md:189](../../security-landscape/deep-review/zap-reports.md#L189), [security-landscape/deep-review/zap-reports.md:209](../../security-landscape/deep-review/zap-reports.md#L209), [security-landscape/deep-review/report-interpretation.md:16](../../security-landscape/deep-review/report-interpretation.md#L16), [security-landscape/deep-review/zap-reports.md:342](../../security-landscape/deep-review/zap-reports.md#L342)

**Contrary or narrowing evidence:**
- [security-landscape/deep-review/zap-reports.md:169](../../security-landscape/deep-review/zap-reports.md#L169): The GUI renderer does not paint an errored COMPLETED job green.

### reportingzap-exit-override-not-reset

**`reporting.zap-exit-override-not-reset`: ZAP automation exit-status override is a static field with no internal reset** (source-trace)

ExitStatusJob writes a static override; ExtensionAutomation gives a nonnull override precedence over progress errors and contains no internal reset assignment, and ExitStatusJob's finally can run before a later framework-caught exception is recorded. Exit codes are configurable integers, not assurance scores.

**Do:** In CI gating, treat the process exit code as a policy output and also check progress errors and per-job results; do not reuse a ZAP process across plans without resetting.

**Limits:** Source-level lifetime question; no wrong exit code observed.

**Sources:** [security-landscape/deep-review/zap-reports.md:382](../../security-landscape/deep-review/zap-reports.md#L382), [security-landscape/deep-review/zap-reports.md:358](../../security-landscape/deep-review/zap-reports.md#L358)

### reportingzap-plus-reports-raw-messages

**`reporting.zap-plus-reports-raw-messages`: ZAP JSON-plus/XML-plus reports embed full HTTP messages; escaping is not redaction** (source-trace)

The traditional-json-plus template serializes complete request/response header and body strings and the XML-plus template emits raw messages; their escaping is control-character/Java or markup escaping, not credential removal, and no credential hider runs on these paths. Base64 in SARIF is reversible encoding.

**Do:** Choose report formats deliberately; plus formats are evidence archives that need secret handling and access control, not client-facing summaries.

**Limits:** Template source reading; no generated plus artifact inspected.

**Sources:** [security-landscape/deep-review/zap-reports.md:145](../../security-landscape/deep-review/zap-reports.md#L145), [security-landscape/deep-review/zap-reports.md:145](../../security-landscape/deep-review/zap-reports.md#L145), [security-landscape/deep-review/zap-reports.md:91](../../security-landscape/deep-review/zap-reports.md#L91)

### reportingzap-report-entry-path-defaults

**`reporting.zap-report-entry-path-defaults`: ZAP report defaults differ by entry path: empty can mean none or all; API adds FPs** (source-trace)

The ordinary report dialog writes unchecked risk/confidence boxes as false and rejects zero sections; the automation editor saves empty selections as null, which ReportJob treats as include-all; the report API defaults to all risks and confidences including false positives. Standard preferences exclude false positives.

**Do:** Record the effective report configuration with every deliverable and never compare counts across reports produced through different entry paths without normalizing settings.

**Limits:** Source and test-oracle reading at pinned versions; dialogs not opened.

**Sources:** [security-landscape/deep-review/report-interpretation.md:8](../../security-landscape/deep-review/report-interpretation.md#L8), [security-landscape/deep-review/report-interpretation.md:15](../../security-landscape/deep-review/report-interpretation.md#L15)

### reportingzap-summary-pass-is-absence

**`reporting.zap-summary-pass-is-absence`: ZAP summary PASS only means no alert was counted for that passive rule** (source-trace)

OutputSummaryJob marks a rule PASS when its passive rule ID is absent from the alert-count map; URL totals are deduplicated URI strings in the site tree. Neither establishes applicable input, execution, method/principal coverage or absence of the vulnerability. Upstream tests use metadata-only passive scanner fixtures.

**Do:** Do not present PASS lists or URL counts as tested coverage in client reports.

**Limits:** Source reading.

**Sources:** [security-landscape/deep-review/zap-reports.md:97](../../security-landscape/deep-review/zap-reports.md#L97), [security-landscape/deep-review/report-interpretation.md:19](../../security-landscape/deep-review/report-interpretation.md#L19)

### reportingtakumi-not-vulnerable-means-not-reproduced

**`reporting.takumi-not-vulnerable-means-not-reproduced`: Takumi 'Not Vulnerable' means could not reproduce; may reflect missing roles/data** (public-doc)

Takumi's Vulnerability Verification defines Not Vulnerable as 'could not reproduce', not proof of absence; errors and uncertain decisions go to Waiting Review. Graybox reproduction failure can reflect insufficient role or data rather than a fixed defect, and a retest that reuses earlier feature enumeration may miss changed features. The UI verdict does not prove the tested instance/source/identity matched production.

**Do:** Report AI or automated retest negatives as inconclusive unless the test identities, data preconditions and deployed version are recorded and independently confirmed; re-enumerate features for retests after code changes.

**Limits:** Documented semantics; verifier code and actual false-negative rates were not inspected or measured.

**Sources:** [cybersecurity-firms/gmo-flatt-security.md:59](../../cybersecurity-firms/gmo-flatt-security.md#L59), [cybersecurity-firms/gmo-flatt-security.md:24](../../cybersecurity-firms/gmo-flatt-security.md#L24), [cybersecurity-firms/gmo-flatt-security.md:25](../../cybersecurity-firms/gmo-flatt-security.md#L25)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [security-landscape/deep-review/zap-reports.md:29](../../security-landscape/deep-review/zap-reports.md#L29) | [security-landscape/deep-review/zap-reports.md:43](../../security-landscape/deep-review/zap-reports.md#L43) | SARIF artifacts preserve cookies/API keys/bodies; only Authorization is masked. |
| high | [cybersecurity-firms/takumi-domestic-inference-announcement.md:5](../../cybersecurity-firms/takumi-domestic-inference-announcement.md#L5) | [cybersecurity-firms/gmo-flatt-security.md:61](../../cybersecurity-firms/gmo-flatt-security.md#L61) | Assume overseas inference for Takumi unless a signed domestic-inference arrangement is in place and active. |
| high | [security-landscape/deep-review/zap-reports.md:11](../../security-landscape/deep-review/zap-reports.md#L11) | [security-landscape/deep-review/zap-context.md:17](../../security-landscape/deep-review/zap-context.md#L17) | Context exclusions do not remove alerts from ZAP reports. |
| high | [security-landscape/deep-review/nbret-scanner.md:41](../../security-landscape/deep-review/nbret-scanner.md#L41) | [security-landscape/deep-review/zap-directory-rule.md:17](../../security-landscape/deep-review/zap-directory-rule.md#L17) | Out-of-path request and alert retention are runtime-observed on a real daemon. |
| high | [security-landscape/deep-review/nbret-scanner.md:49](../../security-landscape/deep-review/nbret-scanner.md#L49) | [security-landscape/deep-review/zap-directory-rule.md:25](../../security-landscape/deep-review/zap-directory-rule.md#L25) | Treat stop-as-completed as runtime-confirmed for this scenario; nbret-scanner.md SC-05 was never back-annotated. |
| medium | [security-landscape/deep-review/zap-reports.md:356](../../security-landscape/deep-review/zap-reports.md#L356) | [security-landscape/deep-review/zap-reports.md:382](../../security-landscape/deep-review/zap-reports.md#L382) | Assume the exit override persists across plans in one process. |
| medium | [security-landscape/deep-review/zap-reports.md:13](../../security-landscape/deep-review/zap-reports.md#L13) | [security-landscape/deep-review/zap-report-filter-lab.md:7](../../security-landscape/deep-review/zap-report-filter-lab.md#L7) | Fail-open confirmed under injection; target-triggerability unknown. |
| medium | [assessment-evidence/deep-garak.md:73](../../assessment-evidence/deep-garak.md#L73) | [assessment-evidence/deep-garak.md:91](../../assessment-evidence/deep-garak.md#L91) | Live-plugin tag dependence applies to Report.get_evaluations/AVID export, not the modern digest. |
| medium | [assessment-evidence/framework.md:30](../../assessment-evidence/framework.md#L30) | [assessment-evidence/deep-garak.md:178](../../assessment-evidence/deep-garak.md#L178) | Describe garak evaluation counts as output-per-detector judgments, not prompt counts. |
| medium | [security-landscape/deep-review/nuclei-output.md:19](../../security-landscape/deep-review/nuclei-output.md#L19) | [security-landscape/deep-review/nuclei-output-lab.md:5](../../security-landscape/deep-review/nuclei-output-lab.md#L5) | Sink order and fail-fast are component-confirmed. |
| medium | [security-landscape/deep-review/nbret-scanner.md:56](../../security-landscape/deep-review/nbret-scanner.md#L56) | [security-landscape/deep-review/nbret-scanner.md:54](../../security-landscape/deep-review/nbret-scanner.md#L54) | The reporting gap is runtime-confirmed with synthetic inputs. |
| low | [toolchain/reporting-retest.md:21](../../toolchain/reporting-retest.md#L21) | [toolchain/reporting-retest.md:39](../../toolchain/reporting-retest.md#L39) | The DefectDojo reimport source was fully read; earlier 'unread' text is historical. |
| low | [assessment-evidence/deep-garak.md:97](../../assessment-evidence/deep-garak.md#L97) | [assessment-evidence/deep-garak.md:202](../../assessment-evidence/deep-garak.md#L202) | The stale-first-digest risk applies to append/rebuild paths other than rebuild_cis. |
| low | [security-landscape/deep-review/zap-reports.md:329](../../security-landscape/deep-review/zap-reports.md#L329) | [security-landscape/deep-review/zap-reports.md:342](../../security-landscape/deep-review/zap-reports.md#L342) | Template snapshots are read; runtime policy still separate. |
| low | [cybersecurity-firms/gmo-flatt-security.md:49](../../cybersecurity-firms/gmo-flatt-security.md#L49) | [cybersecurity-firms/takumi-github-scope-boundary.md:11](../../cybersecurity-firms/takumi-github-scope-boundary.md#L11) | Treat the App manifest as unknown, not merely queued. |
| low | [assessment-evidence/cel-planning-provenance.md:27](../../assessment-evidence/cel-planning-provenance.md#L27) | [assessment-evidence/garak-report-fixture-evidence.md:87](../../assessment-evidence/garak-report-fixture-evidence.md#L87) | garak-report yarn.lock fully read as metadata. |
| low | [assessment-evidence/garak-report-fixture-evidence.md:67](../../assessment-evidence/garak-report-fixture-evidence.md#L67) | [assessment-evidence/garak-report-fixture-evidence.md:77](../../assessment-evidence/garak-report-fixture-evidence.md#L77) | extracted_digest.json fully read as text. |
