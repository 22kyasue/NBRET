# Cortex deployment: local permissions and a buyer's operating policy

Read 2026-10-17: complete main text of the two sources below. No agent was installed.

## A versioned configuration prerequisite

The [Cortex XDR Agent 9.1 macOS configuration manual](https://cortex-docs.paloaltonetworks.com/cortex-xdr-agent/9.1/cortex-xdr-agent-for-macos/configure-cortex-xdr-agent-for-mac) guides non-MDM users through system extensions/network filters, full disk access and notifications. Its final summary requires checking whether permissions were added successfully and revisiting failed settings.

This establishes a specific onboarding boundary: an installer finishing does not establish all required operating-system permissions. It does not establish current latest-version support, complete deployment architecture or effective enforcement across every OS.

## Buyer-authored responsibility and change control

Stephen F. Austin State University's [EDR support-lifecycle policy](https://help.sfasu.edu/TDClient/2027/Portal/KB/Article/170040/Endpoint-Detection-and-Response-EDR-Agent-Support-Lifecycle), read from the buyer's own portal, assigns Security responsibility for evaluating versions, exceptions and remediation coordination; departments/system owners coordinate upgrades; users must not interfere with the agent.

Its policy distinguishes testing from approved production versions, requires unsupported versions to be upgraded within 30 days unless excepted, and describes possible restrictions/isolation/remediation. Exceptions require business justification, system details, risk acknowledgement, compensating controls and a remediation timetable. Review is at least quarterly or after material vendor changes.

The page labels 9.1 current and 8.9.x minimum **for that institution**. It supplies no visible publication/update date in this capture; it is not a universal vendor support matrix or proof the policy is successfully enforced.

**Illustrative workflow:** the customer validates a new agent version and permissions, assigns an approved rollout, tracks exceptions, then verifies endpoint health. Vendor support and a customer's operational approval are separate decisions. This buyer account establishes documented policy, not measured incident effectiveness.

## Installation settings can bound later response

The complete [9.1 manual-installation guide](https://cortex-docs.paloaltonetworks.com/cortex-xdr-agent/9.1/cortex-xdr-agent-for-macos/install-the-cortex-xdr-agent-for-mac/install-the-cortex-xdr-agent-manually) describes an administrator installing a tenant package, optional proxy/broker configuration, OS consent and final check-in/protection verification. Authenticated proxies are not supported in this described path.

Installation-time settings can disable Live Terminal, script execution and file retrieval, jointly or separately. The manual calls these restrictions irreversible without uninstalling/reinstalling with changed configuration. A later console role or managed-service preauthorization therefore must not be assumed to restore a locally disabled capability.

Dismissing the web-content-filter permission prevents network monitoring/reporting and the described network behavioral rules; the guide also says network isolation will not work. Without full disk access, file protection is partial. These are documented prerequisites, not an observed bypass or a product effectiveness measurement. Check-in identifies the tenant and last contact; it does not prove every prevention/response function worked.
