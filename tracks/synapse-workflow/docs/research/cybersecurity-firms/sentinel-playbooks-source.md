# Sentinel playbooks: approving activity and isolating a device are different workflows

Read **2026-10-17**, source-only. Pin: Azure/Azure-Sentinel `4aee8b861e8f0542a3fe525757762a7487ba1b3b`. These are **Accelerynt-authored, developer-supported contributions in Microsoft's repository**, not evidence of Microsoft's internal SOC procedure. The approval template's metadata dates to 2022-11-17; the isolation template to 2024-02-08. A current repository pin does not make their design newly released.

## What a reader should notice

“Approve” in the selected email playbook approves the suspicious **business activity** and closes an incident as expected. It does **not** approve isolating a machine. The separate isolation playbook contains no email approval step and does not invoke the first playbook. A customer must deliberately design any relationship between them. Source: [approval template](https://github.com/Azure/Azure-Sentinel/blob/4aee8b861e8f0542a3fe525757762a7487ba1b3b/Playbooks/AS-Incident-Response-Approval-Email/azuredeploy.json), [isolation template](https://github.com/Azure/Azure-Sentinel/blob/4aee8b861e8f0542a3fe525757762a7487ba1b3b/Playbooks/AS-MDE-Isolate-Machine/azuredeploy.json).

## Approval-email chain, read contiguously

The deployment creates Sentinel, Key Vault and Office 365 connections plus a system-assigned Logic App identity. The incident webhook supplies related entities. Execution retrieves an application secret from Key Vault, extracts incident accounts, then loops over accounts. For each, a Microsoft Graph GET requests the manager of the account's AadUserId, using an application/client identity, tenant and the retrieved secret.

On a successful manager lookup, Office 365 sends that manager an email containing the incident title, account, incident URL and Approve/Reject options. Its text explicitly says approval will close the incident as a benign positive. After the webhook response, Approve performs a Sentinel incident PUT with Closed and BenignPositive–SuspiciousButExpected. The other branch appends a comment saying the manager identified a true positive; it does not perform containment or change the incident classification to true positive.

These decisions concern the **same incident** inside each account's loop. There is no aggregation requiring every manager to approve before closure, nor a final resolution of conflicting replies. This is a source-level consequence of the loop and branches, not an observed production race. The manager-status condition runs only after the HTTP action succeeds; a failed lookup has no separate error-escalation branch. Email expiry, absent-manager routing, reviewer substitution and incident reopening are not defined in this template.

The [setup README](https://github.com/Azure/Azure-Sentinel/blob/4aee8b861e8f0542a3fe525757762a7487ba1b3b/Playbooks/AS-Incident-Response-Approval-Email/README.md) instructs a customer administrator to grant Graph application User.Read.All with admin consent, store the secret, authorize Office 365 and permit the Logic App identity to get the Key Vault secret. These are separate identities and grants; creating the workflow alone is not sufficient onboarding. The source does not establish customers' actual consent, mail retention, logging redaction or operational SLA.

## Device-isolation chain, read contiguously

The incident webhook feeds the Sentinel host-entity extraction action. After retrieving an application secret, the workflow requests an OAuth client-credentials token for the Defender API. It initializes an affected-hosts string and loops over extracted hosts. When the host's additionalData.MdatpDeviceId does not equal an empty string, it POSTs to that device's /isolate endpoint with IsolationType Full and an incident-number comment.

After the HTTP action succeeds, the workflow appends “Successfully isolated” to its summary. Once the host loop succeeds, it posts the summary as an incident comment. The alternative branch records that no MDE device ID was found. There is no hostname-based fallback lookup, explicit human review, per-device action-state polling, timeout escalation, cleanup or unisolation action in the selected JSON. In particular, HTTP action success and endpoint isolation completion are not independently compared here. The null/missing-ID behavior of the platform's expression engine was not runtime-tested; a comparison with an empty string should not be described as a comprehensive device-ID validator.

The [README](https://github.com/Azure/Azure-Sentinel/blob/4aee8b861e8f0542a3fe525757762a7487ba1b3b/Playbooks/AS-MDE-Isolate-Machine/README.md) requires an application with Machine.Isolate permission and administrator consent, its client secret in Key Vault, and the Logic App's system identity to have Microsoft Sentinel Contributor for incident comments and Key Vault secret Get access. It links a separate unisolate playbook, which is **not read in this checkpoint**. That link alone does not establish automatic rollback. The README's specific Sentinel role is clearer than the deployment metadata's generic “Microsoft Contributor” wording.

## Responsibilities, data and audit boundaries

Customer administrators select the incident trigger/automation rule, grant identities, maintain secrets and permissions, decide when machine disruption is acceptable and establish recovery verification. The contributed workflow executes configured API calls; Sentinel, Graph, Office 365, Key Vault and Defender services enforce their respective credentials. An incident comment is an audit artifact of the workflow's reported result, not independent proof that an offline endpoint enforced an action.

Manager names/addresses, incident titles and account identifiers flow into approval mail. Host identifiers, incident number and isolation requests flow into Defender. Secrets and tokens are referenced by the workflow; this review does not establish the deployed run-history redaction settings, retention, regional routing or tenant policies. No AI or statistical model is visible in these templates: they are explicit branching automation.

## Read and validation boundary

Both JSON definitions were read through resources, parameters, connections, actions, runAfter dependencies and output sections; README setup text was inspected, while screenshot contents were not. No deployment, connection authorization, message or API action was performed. No unit/integration tests were retrieved for these selected templates. Managed connector internals, Logic Apps runtime semantics, retry policies, webhook authentication and Defender's action-state contract remain dependencies to inspect. This is a complete **selected template** trace, not a complete audit of those platforms.

The [Defender action contract](defender-action-contract.md) is now read and explains the missing creation-versus-status verification and distinct read permission. Connector runtime and the template’s actual behavior remain untested.
