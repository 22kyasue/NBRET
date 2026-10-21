# Microsoft phishing triage: what the agent can actually do

**Mechanism review, accessed 2026-10-17.** This is a detailed slice of the Microsoft dossier; company history, economics and the full portfolio remain pending. The canonical source is the [Phishing Triage Agent manual](https://learn.microsoft.com/en-us/defender-xdr/phishing-triage-agent), showing an update date of 2026-07-02.

## Before and after

A user reports a suspicious email. Without this agent, an analyst must inspect evidence and classify the resulting alert using the available email/security tools. With the agent enabled, the alert triggers an LLM-assisted investigation. The system can read associated email content, consult intelligence and hunting tools, analyze screenshots and use Microsoft's file/URL analysis tools. It writes a verdict and explanation. A false-positive verdict resolves the alert; a true-positive verdict leaves the incident open for analyst action. Thus “triage only” still includes a real state mutation; it does not imply the agent itself removes all malicious mail or repairs endpoints.

The current page says the same agent is being extended into Security Alert Triage for selected identity/cloud alerts, **in preview**. That does not put all phishing functionality in preview or establish universal alert coverage.

## Onboarding and permission path

The customer needs Defender for Office 365 Plan 2, Security Copilot capacity, unified Defender role-based access control, user-reported-message monitoring and the relevant alert policy. Rules that already auto-resolve those reports prevent the agent from triaging them.

The administrator assigns either an Entra Agent ID or an existing account. Required permissions include reading basic security data and email metadata, reading email content associated with alerts, managing alerts and accessing Security Copilot. Access to alert-associated content is narrower than arbitrary mailbox read access. The agent inherits the assigned identity's permissions; an overprivileged account is a configuration risk, not evidence of a bypass.

Existing-account authentication can expire and halt operation. The manual says privileged identity management and temporary access passes are not compatible with this background identity option. Teams monitoring the agent need at least its access level to inspect its output.

## Decision and audit flow

| Step | Input / operation | Persistent effect and human control |
| --- | --- | --- |
| Trigger | User report produces a supported alert | Agent assigns itself and tags the incident |
| Investigate | Email/context plus security tools and LLM reasoning | Activity graph and natural-language explanation are available |
| Classify | Determine malicious versus false alarm | Alert classification changes; false positives resolve; true positives remain open |
| Correct | Analyst changes classification and explains why | Feedback is recorded for audit; correction alone does not teach memory |
| Teach | Analyst explicitly chooses teaching, evaluates the proposed lesson and saves | Lesson enters memory after review; relevance/conflict checks may reject it |
| Govern | Administrator rejects a lesson or pauses/removes agent | Rejected lesson stops influencing future triage; removing agent deletes feedback but retains triaged-incident history |

The manual also names Microsoft Purview audit logs. A displayed reasoning graph supports inspection; it does not establish correctness or expose the complete proprietary model computation.

Feedback handling is a useful concrete failure path: conflicting lessons can be rejected/rephrased; saving an annotation without teaching retains audit context without changing future behavior. Rejecting a lesson does **not** automatically undo all earlier classifications. The manual documents pause/run, identity replacement and removal, not transactional rollback of every downstream effect.

## Data, capacity and an unresolved documentation inconsistency

The [Security Copilot privacy page](https://learn.microsoft.com/en-us/security-copilot/privacy-data-security), updated 2026-04-08 in the capture, separates customer prompts/retrieved content/responses/files from operational logs. Workspace storage region is selected at creation; prompt evaluation location and optional wider processing are separate choices. Data sharing can include human review and development of security-specific models, while the page excludes sharing with OpenAI or training the Azure OpenAI foundation model. E5/E7 defaults are explicitly treated separately. “Not foundation-model training” therefore must not be shortened to “no model improvement use.”

The page says inactive session data is deleted after 180 days and requested customer-data deletion within 30 days. Its shared-data language is internally inconsistent: one section gives 90-day evaluation retention and deletion within 30 days after opt-out, while a later section permits previously shared data for up to 180 days. Preserve both statements; contractual/current policy confirmation is required before selecting one as authoritative. Turning off source-data access does not instantly delete already retrieved data.

The agent consumes Security Compute Units (SCUs). The manual points to per-email consumption and capacity dashboards, but establishes no universal fixed price per triaged email. No customer tenant was accessed.

## Evidence limits and next boundary

The manual establishes the operational contract above, not deployed source code, exact model/version, false-negative rate or measured customer labor savings. The vendor-authored randomized trial has now been read; its [canonical methodology note](microsoft-phishing-trial.md) explains the experimental boundary and limitations. Public documentation Git history, relevant Sentinel/API samples and read-only contract examples will be pinned separately. This manual is a complete content read; broader Microsoft source/code coverage is not complete.
