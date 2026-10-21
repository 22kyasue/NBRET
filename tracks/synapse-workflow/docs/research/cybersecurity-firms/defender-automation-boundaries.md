# Defender endpoint automation: approval, exclusion and a retired interface

Read 2026-10-17; complete main text of the three manuals below. This is distinct from the generative [phishing agent](microsoft-phishing-agent.md). No model mechanism is established merely by the word automation.

## Availability comes before the workflow

The [automation-level manual](https://learn.microsoft.com/en-us/defender-endpoint/automation-levels), updated July 2, 2026, states that from **September 1, 2026**, AIR no longer runs as a separate investigation experience or supports manual triggering; its detection/response capabilities run automatically within the antivirus protection stack.

The page still describes full/semi automation settings, Action Center history/pending actions and seven-day approval timeout equivalent to rejection. Full automation acts on malicious artifacts; semi modes require approval for defined file/folder scopes. Defaults differ for pre-/post-August 16, 2020 tenants; explicit device-group settings are preserved. Defender for Business is preconfigured full.

The page oddly lists Program Files among temporary-folder examples. Do not translate that into a verified current path-matching rule. The dated transition and residual interface text need deployment-specific verification.

## Recommendation, execution and reversal

The [remediation review manual](https://learn.microsoft.com/en-us/defender-endpoint/manage-auto-investigation), also July 2, describes evidence verdicts leading to file quarantine, registry/task removal, process termination, service stop or driver disablement. Pending actions can be approved or rejected; completed supported actions can be reviewed and undone through History.

Its undo list does not include every listed remediation operation: process termination is not listed. “Undo” also does not establish restored application state or recovered business transactions. This page retains the standalone investigation language without the September transition warning; it cannot independently establish that all older screens remain current.

## Exclusions change visibility

The [folder-exclusion manual](https://learn.microsoft.com/en-us/defender-endpoint/automation-folder-exclusions-configure), updated July 17, says exclusions apply across onboarded endpoints to automated investigation/remediation, while antivirus still scans those files. Live-response collection/examination of excluded files fails too. Folder paths include subfolders; optional filenames/extensions narrow scope. This is broader than silencing one noisy alert.

Core Security Settings manage/read permissions control changes/viewing under unified role-based access control. The page records creator/time in the exclusion listing; a visible listing is not proof of immutable audit retention. Defender for Business does not offer these customizable exclusions.

No tenant configuration, exclusion, response action or test was performed.
