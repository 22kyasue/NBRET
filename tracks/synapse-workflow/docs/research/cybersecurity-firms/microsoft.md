# Microsoft Security: products, customer configuration and expert operations

**Accessed 2026-10-17; active dossier.** Microsoft Security is a portfolio within a much larger company. Microsoft's consolidated sales are not security sales. The [January 2023 security milestone](https://www.microsoft.com/en-us/security/blog/2023/01/25/microsoft-security-reaches-another-milestone-comprehensive-customer-centric-solutions-drive-results/) reported more than $20B security revenue then; that dated statement must not be relabeled FY2026 audited segment revenue.

The [Trustworthy Computing retrospective](https://www.microsoft.com/en-us/security/blog/2022/01/21/celebrating-20-years-of-trustworthy-computing/) traces the January 2002 security engineering initiative. It is one milestone in improving the company's software after growing security problems, not the founding date of every current security product. Acquisition/organic lineage for individual products remains to be reconstructed.

## What the portfolio does

The [Japanese security catalog](https://www.microsoft.com/ja-jp/security) identifies Defender for threat protection across devices/identity/apps/email/cloud; Sentinel for security event analytics; Entra for identity/access; Purview for data protection/governance; and Intune for device management. It separately lists managed response, hunting, threat intelligence and incident response expert services. Japanese-language availability establishes local product/service marketing, not identical licensing, staffing or residency across every offer.

A buyer can therefore purchase software controls, an operating service or an expert engagement. The customer still configures tenant access, policies, source connections, devices and business response authority. A bundle's name does not prove that every capability is active or properly configured.

## Operational mechanism already reconstructed

The [phishing-agent deep read](microsoft-phishing-agent.md) is canonical for one full manual-driven slice: prerequisites → dedicated identity/permissions → user-report trigger → LLM/tool investigation → alert classification/resolution → human escalation → audited feedback memory. It also preserves the privacy page's conflicting shared-data retention statements and distinguishes workspace storage from prompt processing.

That path demonstrates an action-taking investigator with a narrow state change. Other Defender automated investigations, Sentinel playbooks and Copilot agents have their own approval models; do not reuse the phishing-agent mandate by analogy.

## Representative day and incident

**Illustrative inference:** the customer SOC monitors source/device health and capacity, reviews the supported queue, audits agent verdicts and handles malicious or unsupported cases. Administrators review identity permissions and feedback lessons. A false-positive auto-closure reduces manual queue work but also makes oversight of erroneous closures important.

During a reported phishing incident, the agent may resolve a false alarm or mark a malicious report true positive and leave the incident open. An analyst then determines whether other recipients, accounts and devices are affected and uses separately authorized response tools. Changing an alert is not proof of message removal, credential revocation or recovery.

The [Azure-Sentinel repository @ 4aee8b861e8f0542a3fe525757762a7487ba1b3b](https://github.com/Azure/Azure-Sentinel/tree/4aee8b861e8f0542a3fe525757762a7487ba1b3b) has [two selected workflow JSON paths](sentinel-playbooks-source.md) read, plus the [Defender action-state API contract](defender-action-contract.md); connector runtime and tests remain partial. Public Sentinel content is not the proprietary Copilot model. Further work: product history/economics/channel details, deployment and daily operating manuals, scoped expert-service terms, primary public incident artifacts and buyer-authored outcomes.

## Endpoint automation has a separate dated lifecycle

The [endpoint automation trace](defender-automation-boundaries.md) preserves the September 1, 2026 standalone AIR retirement warning, remaining approval/undo controls, exclusion permissions and inconsistent older interface descriptions. These controls do not define the phishing agent mandate.

## Acquisition lineage with retrieval limits

Primary indexed extracts of the [September 8, 2015 Adallom announcement](https://blogs.microsoft.com/blog/2015/09/08/microsoft-acquires-adallom-to-advance-identity-and-security-in-the-cloud/) describe an acquired cloud-access security broker, adding visibility/control for cloud apps. The [June 8, 2017 Hexadite notice](https://news.microsoft.com/source/2017/06/08/microsoft-signs-agreement-to-acquire-hexadite/) establishes an acquisition agreement for automatic investigation/remediation intended for Windows Defender ATP; it does not establish closing or current implementation. Direct reads of both pages returned 403; neither was retried or rerouted. These are inspected primary extracts, not full-page reading.

[Separate DTDA research/evaluation trace](microsoft-dtda-evaluation.md) adds a distinct feature with its own evidence limits.
