# Reproduce the mechanisms. Build the workflow.

There are three useful meanings of replication: reproducing a technical mechanism, implementing a similar tool capability, and delivering the surrounding service. This chapter connects them without pretending that public documentation can recreate a closed commercial platform.

## Project one: an application-access testing lab

The included `order-access-lab.mjs` is a small loopback-only Node application with two fictional accounts and two orders. It has a deliberately vulnerable mode, a deceptive-refusal mode and a repaired mode. It also records application decisions and produces a simple alert from repeated denied cross-account requests.

From the NBRET repository root, run:

```sh
node docs/research/learning/labs/order-access-lab.mjs
```

Open the loopback address printed by the process. Choose Alice or Bob, select an order and inspect the response. Change the lab mode using the labelled teaching controls. The identity selector is a simulation; this lab intentionally does not implement a real login or session system.

Run the repeatable checks separately:

```sh
node docs/research/learning/labs/verify-order-lab.mjs
```

The verifier starts its own ephemeral loopback instance and closes it afterward. It checks vulnerable disclosure, deceptive refusal with leaked content, repaired cross-account denial, the owner's normal access and the event-to-alert rule. Its output is a receipt for those constructed cases, not a security assessment of a real application.

### Understand the code in four parts

**Identity:** the request supplies a lab account label. A real implementation would establish an authenticated principal through a real login/session mechanism, then derive account and tenant context on the server.

**Authorization:** an order has an owner. In repaired mode, the server checks owner against the lab principal before returning private fields. The vulnerable mode omits that check. The deceptive mode sends a refusal status while still including the private object, demonstrating why status-only checks are inadequate.

**Observation:** each access produces an event containing the actor, object, owner, decision and mode. This is a deliberately small schema. A production pipeline would need consistent clocks, correlation IDs, retention, transport guarantees and sensitive-data minimization.

**Detection:** repeated denied cross-account attempts generate a local alert. The threshold is an explicit teaching rule, not an independently validated detector. Change the test sequence and ask which behaviors the rule misses or wrongly groups.

## Project two: build a minimal assessment engine

Start with explicit request cases against your own fixture. Each case should contain a non-secret actor label, environment revision, preconditions, request, intended property and expected evidence. The executor returns a structured outcome: observed, denied by scope, unreachable, timed out, failed to parse or missing required evidence. Those are not all “pass” or “fail.”

Add a normalizer that links derived fields to the retained exchange. Keep original bytes when appropriate, with deliberate handling of credentials and private content. Next add finding review: suspected, reproduced, validated and repair-verified are useful distinct states. A model can propose a test or explain a result, but deterministic checks should judge the defined property whenever possible.

Only then add discovery, scanner adapters and concurrency. Each addition introduces new identity, scope and evidence-transfer problems. The NBRET, Nuclei and ZAP source studies describe those problems in much greater depth than this starter architecture.

## Project three: build a small investigation service

Use the lab's event stream as your first source. Implement an event table, a detection rule registry, an alert queue and a case record. Let an investigator attach observations and write a conclusion. Add an action proposal containing the target, operation, rationale and required approval. Keep proposal, approval, submission and observed effect separate.

A first response can be entirely simulated: change a fictional account's allowed state and verify a later request sees that state. Add an undo path. Do not call it a complete MDR platform: real endpoint enforcement, customer identities, resilient ingestion, staffing, service continuity and incident response are additional systems.

For AI assistance, begin with summarization over the retained case records. Add tool selection only after an allowlist and permission gate are in place. Evaluate the assistant against known cases, including missing logs, misleading labels and an action that was accepted but not applied. The provider dossiers show several documented approaches and their remaining unknowns.

## Replicate the service, not only the dashboard

A small assessment service needs an agreed scope, access checklist, test plan, evidence-handling process, reviewer, report and retest. A monitoring service additionally needs source-health monitoring, shifts or coverage hours, severity rules, escalation, action authority and a plan for failures. A response service needs evidence preservation, accountable containment and recovery coordination.

Produce these artifacts for the fictional shop: asset/account map, responsibility table, rules of engagement, observation bundle, validated finding, repair proposal and retest receipt. Then run a tabletop incident: the data source stops, the target is offline, the customer declines an action, or a supposedly fixed finding returns. This is where an operating model becomes concrete.

## What the individual company blueprints mean

Each company dossier includes a reconstruction blueprint: an independently implementable version of a documented capability, plus the operating responsibilities around it. It is a design derived from public evidence, not recovered proprietary code or a claim of product equivalence. Reproducing a toy permission check is much smaller than reproducing fleet-scale enforcement; reproducing one triage workflow is much smaller than replicating a vendor's trained model and operating team.

Use the full source studies below to decide which mechanisms have actually been read or tested. Follow their exact pins and receipts. Existing stopped operations and excluded source material remain excluded; these new teaching exercises do not reopen them.
