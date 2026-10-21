# What security firms sell—and deliver

Security is a collection of jobs. A company may sell software, operate that software for a customer, investigate a problem, test a system or help recover from an incident. The same company can do several of these under different agreements.

To understand an offer, identify **the customer problem, the work performed, the output delivered and the decisions that remain with the customer**. Product names and acronyms become much easier to read once those four things are clear.

## Assessment services: investigate a defined question

A vulnerability assessment inventories and checks a defined environment for candidate weaknesses. A penetration test adds scoped investigation and validation: can a weakness be demonstrated, under what conditions, and with what consequence? A red-team exercise works toward agreed adversary-like objectives and may study whether defenders detect and handle the activity. Purple teaming makes collaboration with defenders explicit so both sides can improve observation and response.

These categories overlap in actual contracts. The distinction is the question being answered, not a universal checklist. An external application pentest can be rigorous without examining employee devices or a cloud identity chain. A red-team result can reveal a major defensive gap without cataloguing every application vulnerability.

Typical assessment work includes scoping, obtaining representative accounts, mapping the application, forming hypotheses, testing them, reviewing evidence, reporting and retesting. Access troubleshooting and communication are part of delivery, even though they are less visible than the exploit demonstration. The public provider and sample-deliverable studies below show why an assessment is more than running a scanner and exporting a PDF.

## Software products: supply a capability

An endpoint product places a sensor on a laptop or server. It can observe events, apply configured prevention and expose investigation or response controls. A network product controls or observes traffic where it is deployed. An identity product manages or inspects accounts, sign-ins and permissions. A cloud-posture product checks configurations through accessible cloud APIs.

The customer still needs deployment, policy, access and operational ownership. Installing a sensor does not establish that it is healthy, that every device is covered or that every prevention feature is active. Connecting logs does not establish that an effective detection exists. Product operation is its own continuing engineering job.

## Managed operations: supply people and agreed actions

A **SOC**, or security operations center, is the people-and-systems function that monitors and investigates security activity. It can be internal, outsourced or shared. **MDR**, managed detection and response, is an operating service with a defined mandate. The exact sources, hours, staffing, escalation and allowed response actions depend on the offer.

A **SIEM** collects, searches and correlates security event records. **SOAR** connects tools and orchestrates responses. A managed provider may operate a customer's SIEM or use its own platform. The difference matters for credentials, rule maintenance, data location, costs and who retains the investigation workspace if the contract ends.

An analyst might review an alert, gather related events, identify affected systems, decide severity, contact the customer and request containment. Some actions can be preauthorized, others require approval, and some are excluded. The studies of CrowdStrike, Unit 42, Trend Micro, LAC and NRI Secure show different versions of this operating boundary. None should be assumed to apply to another provider merely because both say “managed.”

## Incident response: work through an actual event

An incident-response engagement may include triage, evidence preservation, investigation, containment planning and recovery assistance. Investigators ask what happened, which identities and systems are affected, what remains active and which conclusions are supportable. The customer's legal, business and communications teams may have separate responsibilities.

Containment is limiting the immediate activity. Eradication addresses the mechanisms that sustain it. Recovery restores useful service and confidence. A command isolating one laptop is not the same deliverable as rebuilding the affected business environment. The public Mandiant assessment artifact and incident studies are useful precisely because they expose parts of the work rather than only describing a capability in general terms.

## A service has a technical and a human control plane

The technical plane contains collectors, policies, queries, credentials, action adapters and records. The human plane contains onboarding, shifts, review, escalation, permissions, customer decisions and quality assurance. A useful service blueprint describes both.

For example, an analyst's “isolate device” button needs a target identity, a permitted action, an API credential and a result. The operating procedure must also say who may press it, whether approval is required, how offline hosts are handled, who checks the result, when to undo it and who owns recovery. An attractive case dashboard solves only part of that problem.

## Reproduce, build, deliver

**Reproduce the workflow:** take one fictional finding through intake, evidence review, severity, approval, action, verification and closure. Deliberately include an unreachable target and a false alarm. Notice which decisions require information that a scanner cannot supply.

**Build the platform:** implement tenants, assets, identities, observations, findings, cases, approvals, actions and retests as distinct records. Keep raw evidence immutable and interpretations revisable. A finding and an incident need not have the same lifecycle.

**Deliver a small service:** choose a narrow, explainable offer—such as a scoped application assessment with a report and one retest. Specify access requirements, exclusions, the test plan, evidence handling, review and response times. Estimate labor across scoping, access, investigation, reporting and retest. This research does not establish market demand or a universal price.

## Use the company dossiers as worked examples

The dossiers in this reader connect individual providers to specific manuals, source paths, service schedules, AI-feature descriptions, histories and financial boundaries. They are a representative sample with Japan relevance, not a ranking of effectiveness. Read the cross-provider comparison below, then choose a company and follow its complete dossier.
