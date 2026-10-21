# Detection, investigation and response

An attack attempt, a recorded event, an alert and a successful response are different stages. A security operations service needs to connect them reliably while preserving what is known and what remains uncertain.

## Events are the raw material

An endpoint might report a process start. An identity system might report a sign-in or permission grant. An application might record an account reading an order. Each event has a source, schema, timestamp and collection path. Before discussing detection quality, ask whether the relevant source was enabled, healthy and retained.

A SIEM searches and correlates these records. A detection rule might look for a particular event shape or sequence. If the expected field is missing, named differently or collected from the wrong product, the query may never see the behavior. The Splunk and Sentinel source studies demonstrate why a rule is a contract with its data source, not only a persuasive description of a threat.

## A case is an investigation, not merely an alert

An analyst asks whether the behavior is expected, which accounts and systems are involved, what else happened nearby and what action is justified. They combine event records with asset ownership, user context and business importance. A false positive is a warning that does not represent the condition of concern in that context; closing it is a decision with its own evidence and consequences.

Case management should retain the reasoning basis, related observations, open questions and ownership. Severity is an interpretation that may change as facts arrive. An alert queue and a reviewed incident should not be forced into one undifferentiated status field.

## Responses have their own state machine

“Isolate host” can mean an operator selected an action, approval was requested, an API accepted it, an agent received it, or the intended network effect was observed. These states are not interchangeable. An offline host can delay enforcement. An API can return a result without establishing the downstream effect.

The reviewed Defender contract, Falcon public code, Trend task documents and Cortex workflows provide concrete examples. They also show why code reading and service manuals establish different things. Public SDK behavior does not expose a closed endpoint agent or prove that it enforced an action on a customer device.

Containment may reduce immediate access while leaving credential, persistence and recovery work. A compromised account can have multiple sessions. A credential copied into another system needs issuer-side invalidation, not merely removal from one local store. The incident chapter supplies several examples of these downstream dependencies.

## Validate detection and recovery deliberately

A detection exercise starts with a defined behavior and expected event evidence. Establish whether the activity executed, the source produced telemetry, the pipeline retained it, the query matched, the alert reached a case, an analyst understood it and an authorized response had the intended effect.

Atomic Red Team provides descriptions of individual technique tests and execution/cleanup structures. Its presence does not establish that a particular organization's sensor, query or responder worked. The reviewed orchestration and mocked dispatcher receipts answer narrower questions. Those limits remain visible in the full study below.

Response quality also includes undo, business continuity and follow-up. Blocking legitimate activity can cause damage. CrowdStrike's documented 2024 update failure is an important case of a security control itself crossing an operational risk boundary. Device protection and safe content/software distribution both need engineering and verification.

## Reproduce, build, deliver

**Reproduce the mechanism:** the local lab records account/object decisions and raises a simple rule-based alert after repeated denied cross-account requests. Inspect the underlying events and the rule. This teaches a pipeline; it is not an enterprise detector or an accuracy benchmark.

**Build the workflow:** create event ingestion, normalized fields, versioned queries, case records, approvals and an action adapter. Keep collection failures, query errors and pending actions separate from normal outcomes. Implement a read-only observation mode before adding writes.

**Deliver the service:** document monitored sources, supported hours, severity definitions, analyst handoff, escalation contacts, action permissions and verification responsibility. Exercise at least one false alarm, one unreachable asset and one failed action. These failures expose responsibilities that a happy-path demonstration misses.
