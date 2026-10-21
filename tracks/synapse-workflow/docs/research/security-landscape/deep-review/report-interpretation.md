# How to interpret reporting controls and status

Reviewed2026-10-17 against ZAP core8a1bff313f4d183dba5aa154ecbe89ad751c9153 and reports addon snapshotedad2323431a8dec407d46129fedc74fd30d3ba6. This table summarizes source reading and test-oracle review. It is not new runtime evidence, an authorization bypass claim, or a claim about all versions.

| Control or output | Actual source semantics | What a reader can conclude |
|---|---|---|
| Ordinary report dialog: all risk/confidence boxes unchecked | Writes each flag false directly (ReportDialog444–452). | Selected finding categories can be excluded; it does not silently convert these flags to alltrue. |
| Automation report editor: all risk/confidence boxes unchecked | Saves null lists (ReportJobDialog309–331); ReportJob200–213 interprets null as includeall. | Empty selection means all categories in this editing path, unlike ordinary dialog. |
| Ordinary report dialog: zero sections | Validation rejects when template defines sections (ReportDialog548–549). | This path has a safeguard against a sectionless report. |
| Automation editor: zero sections | Saves null (ReportJobDialog296–299), which selects all template sections (ReportJob216–217). | Empty means default/all sections here. |
| No sites selected in ordinary dialog | Expands to current site inventory (ReportDialog440–442). | Blank selection is not a request to include zero sites. |
| Empty or null reportData.sites | Skips site restriction (ExtensionReports224–237). | Other filters still matter; empty site list does not itself yield zero findings. |
| Unknown requested site in automation | Warns; adds no site (ReportJob240–257). Tests allow zero selected sites/noerror with mocked generation. | Site dimension can become unrestricted; context, confidence and risk filters still apply. Actual rendered output not tested in this continuation. |
| Context restriction | Report filter requires matching inclusion from at least one supplied context when list nonempty (ExtensionReports209–219). | It remains an independent report selection constraint. This is report projection, not scanner authorization. |
| Report API omitted category filters | API tests295–340 expect all risks/confidences including falsepositive, empty context/sites and displayfalse; generateReport mocked. | Entry paths have different defaults; inspect the actual report configuration before comparing counts. |
| Automation job status COMPLETED | ExtensionAutomation461–484 catches runJob exception into progress.error, then marks COMPLETED. | Job lifecycle finished; GUI renderer separately checks job errors/warnings before green, and CLI exit mapping is separate. |
| Alert assertion passIfAbsent | AutomationAlertTest163–177 also returns pass when its result-data object is missing. | Absence assertion over stored data; not proof the scanner evaluated the required case. Source-only observation. |
| Failed test configured onFail INFO | AbstractAutomationTest89–104 records failure as info; child test state remains failed. | Parent error/warning status and child assertion status answer different questions. |
| Summary PASS | Passive rule metadata ID absent from current alert-count map (OutputSummaryJob192–220). | No alert was counted for that rule. This alone does not prove applicable input, complete execution or no vulnerability. |
| Summary FAIL-NEW | Rule classified by output configuration; summary counts matching rule IDs (OutputSummaryJob299–333). | It is a displayed/serialized category here; process exit policy requires separate evidence. |
| URL total | Deduplicated URI strings in tree (ExtensionReportAutomation117–130). | Inventory size, not tested methods/principals/cases or coverage. |
| SARIF taxonomy GUID | Deterministic provider name/version/id UUID (SarifGuid49–76). | Taxonomy identity; not evidence signing or environment binding. |
| Base64 report content | Reversible byte encoding (SarifBase64Encoder28–32). | Representation, not secret removal or encryption. |

Exact source ranges, file hashes, test limitations and original links: [report source annotations](zap-reports.md). No UI was opened or preferences changed. All earlier runtime receipts remain separate. The flagged operation remains stopped; this ordinary interpretation work does not retry it.
