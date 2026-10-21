# Red teaming, penetration testing and ethical hacking

Research dossier opened **2026-10-17**, with access dates and snapshots preserved. This is a staged investigation, not a security certification or an exhaustive market census.

Start with [what NBRET already contains](inventory.md), then [the discipline map and glossary](discipline-map.md). Follow [companies and delivery processes](companies.md), [standards](standards.md), [the technical library](technical-library.md), [implementation walkthroughs](implementation-reviews.md), [local evaluation](lab-results.md), and [market direction and testable opportunities](synthesis.md). The [coverage ledger and handoff](coverage.md) says precisely what is understood and what remains to investigate. Machine-readable provenance is in `sources.json`, `repositories.json`, `additional-repositories.json`, and `source-reads.json`.

## Evidence rules

**Prior** means inherited findings from October 12–16, preserved in their original files. **Primary / vendor** means the provider's own documentation or description, not independently verified performance. **Primary / engagement artifact** means an actual published report, still authored by its assessor. **Source-read** means inspected implementation at the recorded commit or working-tree SHA-256. **Inference** means this investigation's interpretation. **Local validated** means a predefined check executed in a synthetic loopback lab, with receipts. **Downloaded** means saved bytes, which does not imply reading or understanding.

Every finding needs a narrow claim, evidence, assumptions, alternatives, and a way to disprove it. A scanner alert, model judgment, successful command, completed checklist, or matching hash alone does not establish exploitability, defense effectiveness, complete coverage, or trusted provenance.

## Checkpoints

1. **Inventory and field map:** NBRET has two divergent development tracks, substantial evidence/testing machinery, and earlier source research. Remote `main` has no newer pushed commit after fetch. We now distinguish collecting evidence, testing security properties, and assessing operational defenses. Unknown: reconciliation of both tracks and complete runtime coverage.
2. **Company process:** Public documentation establishes concrete staffing, triage, reporting and retest workflows for some providers. Other products expose only advertised workflows. Unknown: actual internal QA, failure rates, contracts, customer retention and operational safety guarantees.
3. **Technical review:** NBRET's HTTP assertion path and garak's harness-to-evaluation path have contiguous annotations; PentestGPT's evidence compiler and role code are reviewed, with runtime/dependency gaps identified. Unknown: full provider boundaries, all plugins, and real model behavior.
4. **Lab:** Known-answer tenant disclosure cases show why status-only checks are insufficient; redirects, scope rejection, missing evidence and offline behavior are measured. Unknown: discovery ability, real identity integration, large-app coverage and model stochasticity.
5. **Synthesis:** Evidence continuity, semantic validation, boundary enforcement and remediation verification merit experiments. These are hypotheses, not a chosen business strategy or demonstrated willingness to pay.

The complementary [assessment-evidence track](../assessment-evidence/) is independently owned by Agate; its findings must retain their own evidence labels and receipts.


For a thematic reading order and finite milestones, see the [learning reader map](learning-reader-map.md). Detailed annotations and receipts remain linked underneath each topic.
