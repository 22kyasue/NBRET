# NBRET inventory and prior evidence

Observed 2026-10-17. No pre-existing changes were reverted, staged, committed, merged, or pushed.

## Repository state

`git fetch --all --tags` completed. The only configured remote is `https://github.com/22kyasue/NBRET.git`. `main`, `origin/main` and `origin/HEAD` resolve to `0fcdfa667d1276cfe7e9834ae87d42d917251dfb`; ahead/behind is 0/0. A remote fetch does not discover unpushed work on another PC or an unconfigured fork.

Two worktrees exist:

| Location / identity | Existing work | Evidence status |
| --- | --- | --- |
| `NBRET`, `main` at `0fcdfa6` plus a large dirty working tree | Capture/Explore/Probe/Scan; assertions and baselines; static source analysis, workflow understanding, route discovery, HTML reports | README, guides and selected source read; historical fixture receipts; a new focused HTTP lab |
| `NBRET-api-investigation`, `feat/api-investigation` at `62e2b72` | Ten commits beyond the shared base: API exports, profiles, proxies, same-state visual evidence, nested contracts, session transfer, streams, workers, artifact review, CA audit | Clean worktree at inventory; branch documentation and history read; no fresh browser/proxy experiment here |

The branch's [RESUME](C:/Users/kotar/githubprojects/NBRET-api-investigation/docs/RESUME.md) includes an earlier instruction to work on that development branch, plus historical statements about uncommitted work. Its later section and actual Git history establish that this work was committed locally. This dossier stays in the user's explicitly requested NBRET home and does not resume feature development or merge tracks. Absolute sibling worktree paths are also recorded in the Git receipt.

Several documents are temporally inconsistent. For example the branch roadmap's initial table lists ZAP/mitmproxy as unimplemented, whereas later verification records describe completed local experiments. Treat early tables as historical, not authoritative current capability registers. The main README's older Japanese capture instructions likewise coexist with newer harness/default-COPY behavior in `docs/testing.md`.

## Existing architecture and responsibilities

The package is private ESM Node software. Current working-tree `package.json` pins Playwright 1.64.0, REA 6.4.0, Sharp 0.35.5 and PostCSS 8.5.29. Those are declared dependencies; availability and behavior require separate checks.

| Capability | Existing files / evidence | What it establishes and what it cannot |
| --- | --- | --- |
| Network evidence | `src/capture.mjs`, `run.mjs`, `rea.mjs`; `docs/existing-network.md`, `verification.md` | Requests, structured bodies, initiators, script hashes and coverage limits; not server-source recovery |
| Harness exploration | `harness.mjs`, `harness-capture.mjs`, `explore.mjs`, `discover.mjs`, `interactions.mjs` | Bounded configured exploration and UI observations; not exhaustive authenticated state coverage |
| HTTP probes and checks | `scope.mjs` → `http.mjs` → `probe.mjs` → `assertions.mjs` → `checks.mjs` | Exact-origin request selection, resource limits, explicit assertions and offline regression; not automatic vulnerability discovery |
| Scanner integration | `zap.mjs`, `managed-zap.mjs`, `tiers.mjs`; tier verification | Passive-default scanner adapter with owned lifecycle; alerts require validation |
| Source understanding | `structure.mjs`, `understand.mjs`, `workflow-examples.mjs`, `analyze.mjs` | Static candidates, observed initiators and scenario-specific coverage; not universal causal reconstruction |
| Diagnosis/reporting | `diagnose.mjs`, `reader-report.mjs`, `report-html.mjs` | Organizes observations and hypotheses; generated recommendations require review |
| Reference/rebuild work | `copy/`, `mirror/`; sibling branch visual/comparison modules | Appearance and behavior evidence; does not establish security equivalence |

NBRET currently makes no LLM API calls itself according to its documentation; upstream REA tools or an agent using outputs must be reviewed separately. A local executable does not imply local model processing.

## Preserved previous conclusions

The [October 12 evaluation](../../evaluation/effectiveness-20261012.md) showed richer observations than screenshots alone, while explicitly leaving superiority over properly configured REA unproven. It demonstrated an action-label/cause mismatch for delayed requests and indistinguishable server implementations with identical observed I/O. These are earlier local results, not re-executed here.

[October 14 testing verification](../../testing-verification.md) and [tier verification](../../tier-verification.md) record controlled-fixture checks, historical test totals, ZAP integration and separately authorized TOBIRA observations. They do not authorize repeating third-party tests in this task. Historical totals of 10, 19, 42 or 53 refer to different revisions/suites and must not be combined.

The [October 16 research](../2026-10-16-rea-and-security-workflows.md), [snapshot list](../repository-snapshots.json), and [reading ledger](../review-findings.json) preserve eleven repositories and partial/full read distinctions. Their proposals—finding-to-regression, agent boundary evaluation, and detection evidence—remain proposals except where the new lab supplies narrower evidence. No file-count metric proves source understanding.

## What the new investigation adds

The field/service map, primary company-process evidence, current version checks, source/license metadata, three implementation review scopes, and a reproducible tenant-authorization assertion lab. It does not replace NBRET with a new testing framework. The next technical step is to compare both tracks' evidence models before proposing integration changes.
