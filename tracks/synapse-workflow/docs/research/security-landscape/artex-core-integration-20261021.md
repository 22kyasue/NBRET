# ARTEX fact status and research integration

2026-10-21, Cass integrating Ginger's source review. Pin: `fdfb7a17b7da5e2de716c0e98475ec77a41c64c6`. This study admits one source-traced status distinction into the register; no engine, model, tool, target or database operation was executed.

## Fact insertion is not independent verification

`agent/tools.go:1316–1344` implements `recordOneFact`. A nonempty summary is required. Evidence and confidence are optional; the stored fact node is created with status `confirmed`. The function writes a `KindFact`, explicitly distinct from a vulnerability finding, and optionally links it to an intent.

This establishes native fact-record semantics at the inspected pin. It does not demonstrate that a false claim was accepted in a runtime run, that every finding workflow omits evidence, or that ARTEX is ineffective. Other inspected finding paths offer traffic bindings and versioned artifact support; their existence does not authenticate all imported target claims either.

Cass independently opened the exact saved source block after Ginger identified it. [Pinned upstream source](https://github.com/jiwoochris/artex-global/blob/fdfb7a17b7da5e2de716c0e98475ec77a41c64c6/agent/tools.go#L1316-L1344). [Preserved source](../../../../../references/artex/fdfb7a17-local-cli/source/agent/tools.go). Evidence strength: **source-trace**.

## Integration implication

Keep prior research guidance, observations from a particular target/run, and independently evaluated effects distinct. Do not preload research findings through `record_fact` as though they were observed on the current target. Preserve native status and original evidence as upstream declarations. Use ARTEX's existing task/skill/hint context and a narrowly admitted retrieval tool for research guidance; apply effect-specific controls before promoting an imported claim.

The minimum proposed wrapper consists of research access and evidence/report translation around the existing application. It does not supply a second planner or dashboard. Exact source-linked corrections, hazards and source completeness must travel with selected research; a ranked-search omission is not clearance. No such wrapper was built in this source-review task.

Detailed read coverage, extension seams, contrary evidence and provenance: [Ginger's research integration map](../../synapse/artex-core-research-integration-ginger.md). [Thistle's capability map](../../synapse/artex-core-capability-map-thistle.md) covers selected pinned frontend/API paths. [Iris's acceptance design](../../synapse/artex-core-evaluation-iris.md) separates plumbing, model-directed discovery, effect checks and verified stop. These are source-based proposals, not current runtime admission or discovery measurements.
