# ARTEX research report

Open `index.html` in a browser. It is a self-contained, private human-facing research report with embedded fonts, 300 research Markdown sources, supporting context and selected original receipts/code excerpts. It works offline; source-repository links require a network connection. No hosting or deployment is required.

The report is a dated synthesis and evidence browser, not another living platform plan. `../../SYNAPSE-PLATFORM.md` remains the maintained plan. Original research and operational receipts remain authoritative for their precise scopes and dates.

## Coverage and verification

- `inventory.json`: fresh SHA-256 inventory of all files under the track research directory. Inventory does not establish semantic reading or correctness.
- `source-verification.json`: official upstream metadata checks and six original PentestGPT fixture source-hash comparisons.
- `report-manifest.json`: final HTML digest, size and coverage counts.
- `qa-static.json`: source/citation resolution, ID/script checks and Diagram Design checks on the two isolated figures.
- `qa-browser.json`: actual computeruse-harness interaction and layout observations, recorded after final build.
- `qa-routing.json`: final expanded teaching-map checks and desktop/mobile observations; each QA record retains the HTML digest it actually checked.

All research Markdown and all register entries/corrections/hazards are embedded as inert data. Most JSON/scripts/dependencies are inventoried rather than re-reviewed or embedded. No held-out target keys, ignored run directories or credentials are imported. Keep this human report out of an investigator's future benchmark context.

## Regeneration

From the repository root, `node docs/reports/artex-research/audit.mjs` rebuilds the inventory; `verify-sources.mjs` performs read-only public metadata checks; `build.mjs` creates the HTML; `qa.mjs` validates the artifact and isolated figures. These scripts do not run historical security labs, providers, scanners or source-package tests. The build reads the named source archives and Rook's co-op receipt if locally present. Font cache preserves the fetched official typography for offline rebuilding.

Design: Kotaro explicitly selected Diagram Design's default editorial style. Existing prompt-library catalog and saved Plausible/R2 provenance were consulted before implementation; no reference restoration was required. This research report is distinct from the canonical Synapse client assessment reader.

No source commit, remote push, production deployment, target assessment or runtime modification was performed for this report.
