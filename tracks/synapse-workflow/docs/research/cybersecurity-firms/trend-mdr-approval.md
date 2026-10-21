# Trend MDR: an operating mandate with per-action and endpoint scope

Read 2026-10-17: complete main text of the four public articles below. They describe operating configuration, not the restricted service-description contract or an observed customer engagement.

## Actions and their exceptions

The [remote-action catalog KA-0019907](https://success.trendmicro.com/en-US/solution/KA-0019907), updated July 16, 2026, places linking alerts, suspicious-object/model exceptions and process memory dumps in a **no-approval-required** category. Memory dumps through Remote Shell are an explicit exception requiring separate customer approval even with general auto-approval.

Critical/recommended actions can use automatic or manual approval: examples include blocking, evidence/sample collection, account disabling, isolation/restoration, email quarantine, malware scan, process termination, custom scripts, remote shell and sandbox submission. Some evidence/query capabilities require enabling the auto-approval feature first, while still allowing per-action manual sign-off. That capability-unlock prerequisite is different from approval of an individual action.

## Customer configuration

The [approval comparison KA-0019492](https://success.trendmicro.com/en-US/solution/KA-0019492), updated July 10, defines automatic execution followed by notification versus manual request followed by approval/rejection. Customers can mix modes by action and scope automatic authority to all endpoints with exclusions or a selected-host CSV. Approval recipients must be Vision One accounts; extra email recipients can be notification-only.

The page broadly says disabling automatic approval requires approval for every response. The action catalog's no-approval-required exceptions are more specific; this research preserves that tension rather than guaranteeing a universal manual gate. Exact service terms and deployed configuration must resolve it.

The [activation manual KA-0020113](https://success.trendmicro.com/en-US/solution/KA-0020113), updated March 19, requires administrator setup, contacts, action/scope settings and recipients. For selected-endpoint automation, other endpoints require manual approval. External manually typed email addresses are not validated as accounts. Optional cross-app settings can close related Workbench alerts when MDR cases resolve and synchronize cases with ServiceNow. Case resolution/score change does not prove business recovery.

## Escalation and daily work

The [contact manual KA-0019494](https://success.trendmicro.com/en-US/solution/KA-0019494), updated July 15, distinguishes alert/report recipients and telephone eligibility. The first listed contact is primary; ordered contacts govern automated call attempts. Since March 18, 2025, this list governs notifications/primary designation, rather than being the sole list allowed to submit cases: portal users with an active contract can open cases.

**Illustrative inference:** administrators maintain contacts and delegated authority; MDR analysts investigate and initiate permitted actions; customer approvers handle manual requests and business consequences. [Endpoint-state verification](trend-response-task-boundary.md), root-cause remediation and restoration remain separate steps.

No contacts, permissions, approvals, remote actions, scripts or tenant settings were changed.
