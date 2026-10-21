# A real processing incident: ingestion continued while analyst work was delayed

Accessed October 17, 2026. Google's [security status incident](https://status.cloud.google.com/security/incidents/cSxDAnszXHrxJNsSrT1u), complete main text read, reports Mandiant Threat Defense/Managed Defense disruption on May 20, 2026, 14:58–22:29 US/Pacific.

The final update attributes delayed triage/investigation to excessively large detections from a third-party signature consuming processing resources. Device-data ingestion was unaffected, but analysts' review and investigation reports could be delayed. Intermediate updates describe slow backlog clearing while new alerts remained delayed; the final update says mitigation and backlog processing completed.

This is provider-authored incident evidence, not an independently audited root-cause report. It discloses no source code, affected customer count, missed attacks, exact delay distribution, detailed fix, replay/deduplication validation or prevention test.

The location list includes Tokyo and other regions; it is not proof of a particular customer's storage or analyst location. This incident concerns managed-service alert processing, not evidence that Google's TIN agent caused the fault.

**Learning implication:** healthy collectors do not guarantee a healthy investigation queue. Source arrival, queue processing, analyst access, report delivery and eventual response need separate checks. A final “mitigated” update does not establish that every customer's business risk was resolved.
