# Research that supports the Synapse process

Prepared for Kotaro on October 18, 2026.

Synapse proposes a service that recreates selected client systems in isolation, validates attacks, traces consequences, prioritizes structural improvements, and checks the repaired system. The most useful research connects a security question to an observable result and a repeatable repair check. It gives us several concrete methods to evaluate. It does not yet demonstrate a complete client-environment replica, an integrated Synapse engagement, or a calibrated estimate of financial loss.

The strategy basis is the October 17 proposal set received from KrisPC, especially `01-decision-summary.md`, `02-service-scope.md`, `04-delivery-model.md` and `05-execution-model.md`. Those are proposals awaiting founder decisions. The canonical founder direction and private original conversation were identified in the handoff but were not included in the transferred files. The local received strategy folder is `C:/Users/kotar/Downloads/synapse-strategy-handoff-20261019/strategy/`.

## How the research fits each service step

| Synapse step | Research that helps | Practical use | Strength and remaining gap |
| --- | --- | --- | --- |
| Understand what matters | [Provider workflows](../security-landscape/companies.md), [assessment framework](../assessment-evidence/framework.md), [public assessment artifact](../assessment-evidence/sample-deliverable.md) | Ask the client which operations must keep working, which information matters, who may do what, and which starting access to assume. Use these answers to define test objectives and expected outcomes. | Documented provider processes and an inspectable report support scoped onboarding and explicit exclusions. The client must supply its own business rules and priorities. |
| Recreate a useful test environment | [Takumi source and runtime workflow](../cybersecurity-firms/gmo-flatt-security.md), [execution boundary study](../assessment-evidence/deep-pentestgpt.md), [local fixture evaluation](../security-landscape/lab-results.md) | Combine selected source/configuration with a running test service, synthetic records and dedicated identities. Declare what the replica includes and excludes. | Vendor documentation supports source-plus-live assessment; local experiments demonstrate small fixtures. None establishes automated reconstruction of a client's full network, identity service, integrations or operations. An assessor VM is not itself a replica of the client. |
| Validate intrusion or unauthorized action | [NBRET known-answer tests](../security-landscape/lab-results.md), [approval-state experiment](../assessment-evidence/executable-claims.md), [Takumi verifier descriptions](../cybersecurity-firms/gmo-flatt-security.md) | Test whether the wrong user can actually read a protected record or cause a prohibited state change. Keep legitimate operations as controls. | Direct local experiments distinguish selected vulnerable and repaired variants. Takumi documents separate hypothesis/reproduction/verification stages, but its private verifier implementation was not inspected. General discovery effectiveness remains unmeasured. |
| Trace the spread of damage | [Incident chains](../assessment-evidence/incidents.md), [identity graph study](../toolchain/identity-analysis.md), [prerequisite graph experiment](../assessment-evidence/executable-claims.md) | Represent each transition with its required identity, privilege, connectivity and state. Show which consequential assets become reachable and which missing facts prevent a conclusion. | Reported incidents support asking about cross-boundary authority. Source and selected graph tests support reachability mechanisms. A modeled edge still needs evidence in the actual environment; a graph alone does not prove a successful attack. |
| Explain business impact | [Quality framework](../assessment-evidence/framework.md), [incident consequences](../assessment-evidence/incidents.md), [deliverable example](../assessment-evidence/sample-deliverable.md) | Translate a demonstrated path into affected records, permitted business actions, dependent operations and recovery dependencies. Review those consequences with the business owner. | Research supports keeping impact and uncertainty explicit. It does not supply the client's downtime tolerance, recovery duration, loss probability or a reliable monetary-loss model. CVSS and finding counts cannot fill those gaps. |
| Design structural improvements | [Incident remediation bridges](../assessment-evidence/incidents.md), [workflow invariant experiment](../assessment-evidence/executable-claims.md), [cloud-policy limits](../toolchain/cloud-posture.md) | Break consequential paths by changing authority, isolation, revocation or workflow enforcement. Fix the rule across related paths rather than closing one symptom. | The approval fixture demonstrates a narrow example where a direct-path fix misses a related state sequence. Incident accounts motivate identity and dependency changes. No study establishes that one encryption or secret-sharing architecture is right for every client. |
| Verify repairs and report | [Executable claims](../assessment-evidence/executable-claims.md), [reporting and retest source study](../toolchain/reporting-retest.md), [assessment toolkit verification](../../assessment-verification.md) | Retest the original failure and nearby cases against fresh build/session facts; confirm legitimate work still succeeds. Deliver an executive explanation linked to technical evidence and omissions. | Local fixtures support these selected checks. Reporting imports and closed finding statuses are lifecycle bookkeeping, not proof of repair. The toolkit's verification notes record finite synthetic cases, not general client readiness. |

## Six methods worth carrying forward

### Combine source understanding with runtime evidence

Use source, configuration and workflow observations to propose specific hypotheses, then test their consequences in the running environment. This gives a focused role to NBRET's capture and workflow analysis. For example, an apparent role check in source becomes a question about what two actual test identities can do to the same synthetic record.

The [Takumi study](../cybersecurity-firms/gmo-flatt-security.md) documents feature enumeration, candidate generation and dynamic verification as separate stages. That is a reusable process pattern. It does not prove every enumerated feature was tested or that all excluded features are safe. Preserve skipped, untested and inconclusive states.

### Build paths from prerequisites with evidence dates

A path should read: account A has privilege B, B permits operation C under these conditions, and C reaches consequential asset D. Associate each fact with its source, collection time and environment version. Mark missing or stale prerequisites instead of treating them as confirmed edges.

The [incident studies](../assessment-evidence/incidents.md) connect test accounts, application permissions, sessions and administrative tools to later consequences. The [BloodHound study](../toolchain/identity-analysis.md) explains concrete traversal and collection mechanisms. Its controlled cancellation fixture also shows why an interrupted traversal can return a nil aggregate error while incomplete. Therefore an empty or apparently successful graph result needs a separate completeness state.

A useful improvement proposal is to find which authority or connection to remove and then verify that the important path breaks. This is useful for Synapse; commercial uniqueness has not been established.

### Turn business rules into sequences of tests

Ask the business owner to approve a rule such as "a payment requires approval of its current invoice revision." Test sequences involving edits, role changes and repeated requests, along with valid payment. A single endpoint response cannot establish that the rule holds throughout the workflow.

The [approval experiment](../assessment-evidence/executable-claims.md) distinguishes a direct denial fix from a broader repair: blocking draft payment still leaves payment after an approved invoice is edited. The stronger variant passes the six specified cases. This supplies a concrete method for testing structural improvement, with concurrency, databases and alternate interfaces still outside that fixture.

### Separate execution from observed defensive response

When the engagement includes detection or recovery, record distinct stages: intended effect, actual execution, raw telemetry, alert, operator response and restored state. This lets Synapse explain whether the problem is that a test never worked, a sensor collected nothing, a rule missed the event, or a response failed.

The [Atomic runner study](../assessment-evidence/deep-atomic.md) traces preparation, execution and cleanup as separate modes. Its mocked tests show that a cleanup message can appear despite a failed dispatcher result. The [provider comparison](../security-landscape/companies.md) describes recurring control validation, while the Atomic source review explains why runner logs alone do not prove detection. Use this thread for an explicitly scoped defensive-validation offering; it is not necessary to include a complete SOC exercise in the first application POC.

### Attach repeatable evidence to each material finding

Keep the business rule, principal and role, affected resource, environment version, test cases, raw evidence, interpretation and retest conditions together. Keep evidence fixed while allowing a reviewed interpretation to change. This makes findings easier to challenge, reproduce and recheck.

The [NBRET lab](../security-landscape/lab-results.md) shows why status alone is weak: a synthetic 403 response still contains the protected invoice. It also demonstrates that saved-response matching can select evidence from the wrong synthetic identity. The later [assessment toolkit notes](../../assessment-verification.md) record checks involving identity/session binding, deceptive responses and fresh retests. These represent different versions and experiment scopes; the historical lab does not establish that the later code retains the same behavior.

This is a strong candidate for Synapse's delivery discipline. Whether it reduces reviewer effort or improves real engagement quality still needs comparison with a careful manual baseline.

### Give AI bounded investigation work and an independent check

AI could propose hypotheses, draft case sequences, connect related evidence and prepare explanations. A domain-approved rule and an independent observation should decide whether the claimed effect happened. Human review remains necessary for client priorities and consequential interpretation.

The [PentestGPT study](../assessment-evidence/deep-pentestgpt.md) provides a precise caution: a constructed receipt containing the expected canary passed a textual audit while the fixture's independent effect flag remained false. That supports separating an accurately quoted observation from a demonstrated consequence. The [AI synthesis](../assessment-evidence/synthesis.md) turns these findings into falsifiable experiments rather than assuming more agents or more output improves assessment quality.

## What to prioritize and what to set aside

**Use first:** the identity/tenant tests, workflow-state experiment, prerequisite graph model, observed-effect distinctions, and fresh-retest requirements. They each change how a Synapse finding would be established or checked. Read provider processes for client onboarding, review and deliverables; use their public claims as examples of documented process, not independent proof of effectiveness.

**Keep available for a selected implementation:** detailed Nuclei, ZAP, OpenFGA, BloodHound, Prowler and SDK dependency studies. Once a component is chosen, these studies can reveal identity, cancellation, cache, output and partial-result conditions that matter. Their technical detail is not a reason to put every component into Synapse.

**Keep out of the main strategy:** repeated checkpoints, duplicate generated readers, corporate financing history, marketing terminology and unsupported success percentages. Preserve them as provenance or background. None should determine whether a security claim is accepted or which client consequence gets priority.

## The three most important gaps

1. **Replica fidelity.** Specify the minimum system facts required for a useful isolated assessment, what cannot be reproduced, and how to establish that each tested behavior corresponds to the client. The present research has small fixtures and runner boundaries, not a validated general replica builder.
2. **Business consequences.** Obtain client-owned workflow/dependency information and acceptable interruption thresholds. Demonstrate technical consequences first; attach business interpretations with their assumptions rather than inventing a loss number.
3. **A complete engagement.** Connect intake, environment preparation, execution, evidence review, business explanation, improvement and fresh retest in one observed cycle. Separate setup and expert review effort from machine runtime before judging feasibility or pricing.

## A focused POC proposal

Use one synthetic business service with two organizations, a small set of user roles, important records and one approval workflow. Establish expected behavior independently of the implementation. Include a vulnerable version, a deceptive denial, a repair that blocks everything, a narrow symptom repair and a stronger repair. Keep some variations hidden from the investigator.

Demonstrate one consequential chain from an initial account to a prohibited business outcome. Show each prerequisite and its evidence, identify a structural change, and repeat the original and neighboring tests on the repaired version. Legitimate operations must still work. Report the reachable cases, unknowns, setup effort and reviewer effort. Compare this with the same task performed using a careful manual process.

This would test the research-supported core of Synapse's workflow. It would not establish automated cloning of a real client or complete coverage of an enterprise network. A subsequent authorized staging pilot would need to test those additional assumptions.

## Evidence scope

This is a decision-oriented mapping of the existing corpus, its routing guide, and the cited studies. It is not a new claim that every supporting source or implementation was reviewed here. [Pine's reconciliation](../reconciliation/USE-RESEARCH.md) records complete reading of the original 264 Markdown files and continuing review of supporting records. Search results and file counts remain navigation aids. No source experiments were executed for this mapping, and no proposed product architecture was selected.
