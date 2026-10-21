# Defender: the API contract separates action creation from execution state

Read **2026-10-17**. Three public Microsoft Learn manuals, each marked updated **2025-11-24**, were read fully in extracted text. No tenant/API was accessed. This closes a documentation dependency in the [Sentinel template trace](sentinel-playbooks-source.md); it does not fill the template's missing polling step.

## Request and completion

The [isolate API](https://learn.microsoft.com/en-us/defender-endpoint/api/isolate-machine) returns **201 Created plus a MachineAction object** on success. The [MachineAction resource](https://learn.microsoft.com/en-us/defender-endpoint/api/machineaction) separately defines status values **Pending, InProgress, Succeeded, Failed, TimeOut and Cancelled**, with creation/update times, device ID, requestor, source and comment. Creating an action object therefore must not be treated as synonymous with Succeeded.

The [get-action API](https://learn.microsoft.com/en-us/defender-endpoint/api/get-machineaction-object) retrieves that object by action ID, returning 200 plus the entity or 404 when absent. An implementation can retain the submitted action ID and inspect this status; a 200 from this GET means the status object was retrieved, not necessarily that its status is Succeeded. The documented rate limits for both selected request/get endpoints are 100 calls/minute and 1,500/hour. These manuals specify no universal polling interval, deadline or successful business-recovery criterion.

## Authority is operation-specific

Isolation requires Machine.Isolate, for application or delegated calls. A delegated user additionally needs Active remediation actions permission and device-group access. The get-action manual lists **Machine.ReadWrite.All** for applications or **Machine.ReadWrite** delegated, plus the delegated View Data role permission. It would be inaccurate to assume a token that can submit isolation automatically has the documented grant needed to retrieve its completion object. Broad permission wording should be preserved rather than silently renamed to a read-only scope.

Full/Selective refer to managed devices; UnManagedDevice is a separate isolation type for unmanaged-device containment. Only selected processes/destinations are allowed during isolation. The manual warns that a full VPN tunnel can prevent an isolated device reaching the Defender cloud and recommends split tunneling for relevant Defender traffic. This can affect the ability to observe and reverse an action; it is not evidence that every environment loses management connectivity.

The older contributed Sentinel template uses api.securitycenter.microsoft.com; the current manual displays api.security.microsoft.com. This review records the difference without assuming the older endpoint is broken or testing either endpoint.

## Learning-library flow

Incident + authorized device ID → submit isolation → retain action ID → retrieve action object → branch on its status → escalate failure/timeout/cancellation or verify recovery prerequisites. The middle retrieval/status branches are **documented API capabilities and a proposed interpretation**, not steps present in the selected Sentinel template. Release authorization, unisolation, network-state checks and business recovery still require their own procedures.
