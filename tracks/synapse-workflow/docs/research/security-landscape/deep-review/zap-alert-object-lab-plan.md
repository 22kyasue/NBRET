# Alert object semantics — declared before execution

2026-10-17. Run tiny Java source launcher against installed ZAP2.17.0 jar/lib with existing bundled Java26.0.2. Owned run directory, headless, no daemon/browser/network/database. Source reviewed core pin8a1bff3 matches release provenance but byte-reproducibility not independently established.

Predictions: distinct new Alert objects with unset ID compare equal despite different field hashes; clone loses custom alertRef and explicit sourceHistoryId; SYSTEMIC result stays cached after tag replacement. Controls: distinct assigned IDs expose field difference; setting SYSTEMIC before first read returns true; original reference/source IDs unchanged. These test object methods only. No assertion of dropped real findings, source misattribution in actual report callers or external exploitability. Record actual outcome/contradictions, Java/version/jar/source hashes and logs. Do not patch production.
