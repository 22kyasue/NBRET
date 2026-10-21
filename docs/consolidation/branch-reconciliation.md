# Branch and context reconciliation

2026-10-20 Pacific. This reconciles preserved implementations and decisions; it does not claim their runtime contracts have been merged.

## Branch lineage

Remote `origin` advertises only `main`, at `0fcdfa667d1276cfe7e9834ae87d42d917251dfb` in the fresh read-only `ls-remote --heads` check. The old local `feat/api-investigation` is at `62e2b7274daee13750a0b974edf0af599f8e2d19`, ten commits beyond the shared base. The new `kotaro/synapse-consolidation` starts at that API commit, so it retains every API commit before the old local name is removed. No remote branch is deleted or updated.

Main's extensive newer code/research/context was uncommitted. Its Git base alone did not preserve that work. A local backup captured 1,428 nonignored regular files with readback hashes and a binary tracked diff, plus both histories as verified Git bundles. Nested scratch-directory pointers and excluded ignored data are explicit in that backup. The working files were then copied, except temporary `.scratch`, into `tracks/synapse-workflow` on the new branch. The import receipt records exact original bytes; later development should be tracked as subsequent Git changes.

The API branch had a clean working tree before the import. Its 95 nonignored files and history were separately backed up. Root source files are retained unchanged by this consolidation. The selected ARTEX report, manifest and 40 source copies are imported under `references/`; the original full checkout and runtime settings remain on KrisPC.

## Why the tracks stay separate

| Overlap | Root API branch | Newer Synapse track | Integration decision |
| --- | --- | --- | --- |
| Capture/run/CLI | Profiles, proxy/session/worker/stream capture and same-state extraction. | Harness capture, coverage/budgets, discovery/testing and later service workflow. | Compare exact state/session/provenance semantics before selecting one collector. No wholesale overwrite. |
| `analyze` / `contracts` | Observed API structures, comparisons and capture-associated evidence. | Source/workflow/testing contracts and diagnosis. | Matching filenames do not establish compatible exports/schemas. Preserve both. |
| `assess` | Root `src/assess.mjs` exposes the older API investigation assessment. | `src/assessment/cli.mjs` implements identity-bound explicit JSON/API cases, reviews and matched retest. | Newer service evidence imports must use the identity-aware contract; do not silently route into older offline matching. |
| `scope` | Branch fixtures/contracts concern capture/proxy paths. | Exact-origin selector and narrower owned-app executor. | Neither is proof of network or filesystem confinement. Sandbox enforcement is separate. |
| Reports | API evidence/comparison/review artifacts. | Approved portable Synapse reader, casebook and consequence/effect separation. | Canonical client-facing presentation remains the newer reader. |
| Sessions | Export/import includes cookies/storage and may contain credentials. | Practice credentials remain in memory; saved evidence is normalized with limits. | Do not copy raw session exports into journals, reports, Git or model prompts. |

## Saved development chronology

- October 12–14: capture/REA/COPY plus separate API investigation work. The API branch added same-state child-frame/canvas evidence, sessions, streams, nested contracts, proxy verification, artifact review and CA auditing. Historical 53 tests are not freshly rerun.
- October 16–18: expanded service/tool/source research, reconciliation register, corrections and stop chronology. The original 264-study snapshot is historical; later files increase directory counts.
- October 18–19: identity-aware assessment, durable investigation records, ordinary practice app, workbench/session CLI, review/retest/measurement, consequence reader, narrow work-order effect checker and structural evidence admission. Later receipts supersede earlier test totals and missing-feature statements.
- October 20: Kensei's ARTEX message; separate Synapse CE review; fresh KrisPC source/bridge discovery; whole-system inventory and three new source findings. Current copied register has 328 findings, 203 corrections and 80 hazards.
- This consolidation: new branch selected by Kotaro; old local branch-name deletion authorized; preserved all above as independent tracks plus a current context/plan. No apps/scans/VMs/providers launched by consolidation.

## Decisions carried forward

Existing discovery/build/acceptance contracts remain the authority for staged workflow goals. Their outdated engine-not-found language is historical, superseded by the dated KrisPC inspection. Software acceptance, effect evidence, independent provenance, blind performance, repair verification and market validation remain different conclusions.

The new benchmark proposal refines those contracts; it does not reopen stopped operations. Training on an answer-exposed target is useful, but held-out performance needs a different protected target family. Public vulnerable apps can supply lessons and compatibility checks without proving unseen discovery skill.

Next integration should address a measured gap. A result adapter is useful only if original artifacts, identities, configuration, completeness and errors survive. ARTEX findings and CE scanner hits enter as candidates; neither gets automatic verified status. Keep the current reports and records usable while the investigator choice remains open.
