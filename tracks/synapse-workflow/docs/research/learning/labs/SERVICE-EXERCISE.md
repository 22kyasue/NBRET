# A complete small-service exercise

This is a worked template for the fictional order-access lab. Its purpose is to connect technical investigation to an actual deliverable. Replace the example scope and roles only when you have a real, agreed engagement. The template itself is not a client contract or a completed customer assessment.

## 1. Define the purchase

**Offer:** investigate whether one fictional customer can read another customer's order, deliver a reviewed finding, and perform one retest after a repair.

**Included:** the local lab's two accounts, two orders, three teaching modes, event records and simple alert rule. Review the server's ownership decision and the contents returned to the requester.

**Excluded from this exercise:** real login/session security, internet targets, native memory safety, production infrastructure, payment processing and third-party accounts. Those are different questions requiring different fixtures and evidence.

**Deliverables:** an access matrix, a request/response observation, one finding, a proposed repair, a retest receipt and a list of untested areas.

## 2. Assign the work

| Role | Responsibility | Output |
| --- | --- | --- |
| Scope owner | States the rule and approves the fictional environment being tested | Scope and access matrix |
| Tester | Establishes accounts/state, performs the bounded case and retains observations | Evidence bundle |
| Reviewer | Checks that the observation supports the stated consequence | Reviewed finding |
| Engineer | Implements the owner check without breaking legitimate access | Proposed repair |
| Retester | Repeats the defined test against the repaired version | Fresh result and control |
| Operations analyst | Inspects event collection and the simple alert | Event-to-alert explanation |

One person can play several roles in a learning exercise, but record when the same person creates and reviews an assumption. In a real service, workload, independence and customer decision rights need explicit treatment.

## 3. Write the rule before testing

| Requester | Alice's order | Bob's order |
| --- | --- | --- |
| Alice | Allowed | Refused without private contents |
| Bob | Refused without private contents | Allowed |

The intended result includes the contents, not only a status label. State the lab mode and code revision with each observation. A record from vulnerable mode is not evidence that repaired mode is broken.

## 4. Example finding

**Title:** the order endpoint returns another customer's private order when ownership is not checked.

**Precondition:** the fixture is in vulnerable mode; the requester is labelled Alice; order 2 belongs to Bob. The identity label is a lab simulation rather than a production credential.

**Observation:** Alice's request for order 2 returns Bob's item and fictional address. The verifier checks the returned owner's identity directly. In deceptive mode the response status becomes a refusal while the private object is still returned.

**Demonstrated consequence:** Alice receives Bob's synthetic order contents through this endpoint. This does not establish all-order enumeration, write access, a real authentication bypass or a customer-data incident.

**Cause:** the vulnerable path does not enforce the owner relation before returning the object. Changing the refusal label while retaining the object does not repair that rule.

**Repair proposal:** derive the authenticated principal on the server in a real application, establish the relevant account/tenant context and enforce object access before serializing private fields. The fixture's repaired mode demonstrates only its simplified owner check.

## 5. Review and retest

Confirm that the request used Alice, that the returned object belongs to Bob and that the private data came from the actual response. Check for a cache or record-selection mistake before assigning a consequence. Preserve failure states rather than assuming missing data means refusal.

After the change, check Alice requesting Bob's order and Bob requesting his own. The first should refuse without the private object; the second should still succeed. A repair that denies every request fails the positive control. Retain the executed verifier receipt, code version and relevant observations.

## 6. Explain the operating result

Inspect the event stream and the alert rule. The event records both the decision label and whether private data was returned. The deliberately simple detector counts denied cross-account attempts. It does not establish universal account-abuse detection, and its label-based input can be misleading in deceptive mode.

Write a short handoff: what was observed, what the rule alerted on, which account was affected, what changed and what remains untested. If an action were added, distinguish proposal, approval, request, acknowledgement and verified effect. Finish by recording the owner's next decision rather than treating an exported report as the end of the work.
