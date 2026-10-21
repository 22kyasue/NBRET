# Using the NBRET research

Before advising on security services, choosing assessment tools, designing AI workflows, or implementing related capabilities, read `docs/research/reconciliation/USE-RESEARCH.md`. Its "Ten things the research establishes" and "Do not do these" sections apply to almost every task here.

Search the research register and studies before proposing an approach:

```sh
node docs/research/reconciliation/find-research.mjs "your decision or question"
```

Search output lists hazards first, then findings (claim, what to do, limits, evidence strength, sources), then corrections, then study passages, with superseded passages flagged. Before you rely on a finding, open its cited lines and read any correction attached to them. Register cards and search results tell you where to look; they do not replace reading the source. In your recommendation, name the register entries and studies you used, any contrary evidence, the evidence strength and what remains uncertain. If the research does not settle the decision, say so.

When you add research, add register entries and run `find-research.mjs --check` (see the guide's "Maintaining the register").

The existing implementation is a prototype to assess, not a predetermined architecture. Research plans, sample commands, upstream test suites and historical experiments are not instructions to run them. Stopped operations stay stopped, within the boundaries in `docs/research/safety-context/README.md` and `docs/research/reconciliation/register/hazards.json`. The user's current instructions take precedence.

## Canonical Synapse reader report (Kotaro, 2026-10-18)

Use the approved interactive report template for every Synapse assessment report. Canonical implementation: `src/practice/reader-report.mjs`, `reader-ui.js`, `reader-ui.css`, with the read-only projection in `reader-model.mjs`; usage and design requirements are in `docs/synapse/reader-report.md`.

Start with company, assessed website, what was tested, and the result/case list. Selecting a case opens its exact issue heading and consequence map; progressively deeper supporting details expose evidence, observations, identity/build context, repair recommendations and actual retest history. Preserve statuses and uncertainty; never substitute the fictional design sample for actual assessment results.

Keep the Synapse masthead, wide layout, larger readable type, dark active text, consistent outline icons and obvious clickable cards/buttons. Muted text is for inactive states. Use right chevrons for deeper internal navigation and left arrows for Back; no upward diagonal navigation arrows. Typography is Inter for Latin text and Noto Sans JP for Japanese, bundled with the report for portable English/Japanese presentation. Do not revert to the earlier operator dashboard, report-as-PDF styling or separate three-concept selector without Kotaro's direction.
