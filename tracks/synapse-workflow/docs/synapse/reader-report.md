# Interactive assessment report

The approved reader experience is a company/application/website and tested-area overview, followed by a list of recorded results. Selecting a case opens its exact recorded title and an evidence-linked consequence map. Selecting a point gives a short explanation; supporting details open progressively deeper views of evidence, normalized responses, identity/build context, expected versus observed behavior, proposed repairs, actual retests and retained review objections.

Visual direction confirmed by Kotaro: the masthead says **Synapse**; active content uses dark readable text, with muted styling reserved for inactive states. Use consistent outline icons, explicit button/card affordances, right chevrons for deeper detail and left arrows for Back. Do not use upward diagonal arrows for internal navigation. The page uses 90% of the available display width, larger typography and click targets, with responsive wide-screen scaling. Account/request/response visuals are derived from actual observations; they never invent an attack effect or screenshot.

Kotaro explicitly approved this as the default template for **every future Synapse report**. This standing choice is also in the project `AGENTS.md`; earlier prototypes are historical references, not alternate defaults.

Typography: embedded Inter (400/500/600) for Latin text, and Noto Sans JP (variable 400–700) for Japanese. Japanese text receives appropriate tracking/line height. The packaged Noto font preserves all 16,732 original Unicode mappings; only its weight range and WOFF2 format are narrowed. Font files, licenses and provenance live in `src/practice/fonts/`; `reader-fonts.mjs` embeds them into the standalone HTML. No remote font/CDN request is made. Font notices are readable under About this report → Typography and font licenses. Browser font loading and a bilingual rendering sample were checked; the temporary typography sample was removed from the delivered report.

This is the report delivered to a reader, separate from the operator workbench. It contains no run, pause, verification-entry, mutation or investigation controls. Internal activity/effort/baseline metrics are not the headline results.

## Open and export

The workbench serves the report at `/assessment`. Its existing technical `/report`, concise `/executive` and operator `/` routes remain available.

For a previously stopped local session, start record-only continuation:

```sh
node src/practice/workbench-server.mjs --resume runs/STOPPED_SESSION --port 65193
```

Do not add `--resume-target` merely to read a report. The retained review example is at `http://127.0.0.1:65193/assessment`.

The existing export command now returns an additional `readerPath`, while preserving `jsonPath`, `htmlPath` and `executivePath`:

```sh
node src/practice/session-cli.mjs --endpoint http://127.0.0.1:65193 export
```

The `*-assessment.html` export embeds its read-only projection, CSS and hash-bound script. It opens directly from disk without the workbench. Registered image links use relative `screenshots/<artifactId>.png` paths; retain that folder with the report when images exist. Narratives and normalized business response values require review/redaction before external delivery; the projection is not a generic secret redactor.

## Evidence and content rules

- The reader model allowlists subject, scope, cases, observations, histories and requests; it excludes operator nonce, private output paths and credential/header envelopes.
- Missing company, application and date metadata are explicitly `Not supplied`. An intake URL is displayed separately from the origin actually assessed. Names are not inferred from synthetic examples or target-controlled page titles.
- The three categories, negative/inconclusive owner results, rejected evidence checks and stale documentation survive presentation. A recorded hypothesis stays a question.
- Map points come from the recorded sequence. Without one, the linked observations appear without an invented consequence path. Sequence order alone does not establish causality.
- Observed behavior, conditional consequence, selected sample, wider-extent assumptions, declared severity/effort, repair proposal and actual changed-build retest stay distinct.
- Screenshots appear only through registered, digest- and step-evidence-matched pointers. Missing images are named as missing; no screen recreation replaces evidence in the connected report.
- A denial can be a valid observation. Empty results and terminal states do not establish an application is secure.

Research basis: `standards.claim-record-fields`, `evidence-handling.finding-record-separation`, and `service-delivery.instance-vs-class-repair`; the claim-record passage in `docs/research/assessment-evidence/framework.md:34` and the existing consequence contract. These are proposed protocol/source and selected component-lab foundations, not evidence of general assessment effectiveness.

## Current retained example

Run `complete-workflow-58f0bf86-99d5-4e59-bfe8-9bbbf6d87135`, revision 116, has one unconfirmed selected foreign-read question. The selected response is HTTP 404 with an error-only body and no order contents. No unauthorized disclosure, independently verified vulnerability, successful repair or screenshot is established. The connected report reflects those facts. The earlier Northstar/invoice mockup remains a separate fictional design artifact.

## Implementation and checks

- `src/practice/reader-model.mjs`: pure, bounded allowlisted projection (Skye).
- `src/practice/reader-report.mjs`: standalone renderer with JSON script-delimiter escaping and exact script hash.
- `src/practice/reader-ui.js` and `reader-ui.css`: approved overview, case map and supporting-detail navigation.
- Workbench server/export integration: additive reader route/path; existing authority and execution controls unchanged.

Final `npm run synapse:acceptance`: 145 tests, 144 passed, zero failed, one existing Windows file-symlink permission skip. Skye separately passed eight focused reader tests and accepted the narrow source review. Tests cover projection, stale/missing evidence, screenshot linkage, nonce/private-envelope exclusion, script-boundary escaping, CSP hash and record-only rendering/export without target traffic. Browser inspection confirmed the actual denied response, missing screenshot state and nested evidence navigation. An exported HTML file was opened under actual `file:` protocol in Chrome and its nested response view worked; the temporary QA tab was closed.

The mockup's 387px responsive layout was checked previously. Connected report inspection used the desktop viewport; screenshot output resizing is not counted as a mobile viewport test.
