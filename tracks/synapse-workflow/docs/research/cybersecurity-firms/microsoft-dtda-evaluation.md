# Microsoft DTDA: detecting a missing attack step

Read 2026-10-17: complete main text/tables of [Microsoft-authored arXiv v2](https://arxiv.org/html/2605.20896v2), May 22, 2026. Closed code was unavailable; deployment/results are provider-reported.

Prioritized incidents → bounded telemetry expansion/aggregation plus behavioral/intelligence context → two-round planner/executor → grounded, nonduplicate dynamic alert. It **generates detections**, not demonstrated containment. Schema checks, bounded retries and suppression constrain invalid outputs; they do not prove resistance to malicious telemetry.

Online GPT-4.1 results: 120 days, 12 regions, 1,088 customer-graded alerts/208 organizations, 80.1% precision. Sparse voluntary feedback does not establish overall recall or representativeness of ungraded alerts.

Offline GPT-5.4 macro-F1 .78 uses only ten complex incidents, hidden phase alerts and three repeated frozen-snapshot runs. Its model/result differs from the online cohort; neither compares competing commercial platforms.

Median 28-minute single-incident latency is not a containment SLA. Median $2.04 token cost excludes compute/storage and is **not customer pricing**. Job failure .38% is not missed-attack rate.

Regional replication is described; exact customer residency/retention and action approvals remain unestablished. Research proposals for fine-tuning, adaptive retrieval and feedback must not be labeled current deployed mechanisms.
