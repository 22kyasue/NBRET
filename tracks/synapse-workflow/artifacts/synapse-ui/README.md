# Synapse UI directions

## Selected structure: overview → issue map → supporting detail

Current preview: http://127.0.0.1:65192/ . Kotaro's latest direction combines one report hierarchy, removing the three-concept selector. Opening page identifies company, website, access/context, tested areas and the complete two-item issue list. Each issue opens an exact descriptive heading and its own consequence map. Selecting a point explains it; supporting details open a navigable sheet with deeper evidence sequence, underlying observation, exposed fields, identity/environment, expected/current/proposed behavior, repair, engineering handoff and acceptance/retest details. Back restores the previous detail level; the report breadcrumb returns to overview. Browser history supports issue routes.

Authoring sources: assessment.js + assessment.css; build-assessment.cjs reuses the previously reviewed screen/comparison visuals and writes standalone assessment.html. server-assessment.cjs serves it locally. No existing application implementation changed.

Browser validation: both overview issues, all four map selections, four-level drilldown and Back, eight supporting-detail sections, distinct unconfirmed second-issue content with no fabricated screenshot, desktop layout and 387px mobile overview/both issue views (no horizontal page overflow). Screenshot visuals inspected for overview and selected issue. All findings remain fictional mockup content; Skye confirmed the actual retained workflow has no demonstrated vulnerability/repair, so those real results must be mapped separately.

## Corrected deliverable: reader-facing report

Current preview: http://127.0.0.1:65191/ (`report.html`, `server-report.cjs`). Kotaro clarified that the deliverable presents an assessment to a reader, like sharing findings in a presentation but with explorable HTML. It is not the investigator's operational dashboard.

Three genuinely different narrative approaches: a five-chapter guided briefing; a selectable consequence path with evidence/limits; and a scrolling visual case study with draggable current/proposed comparison. No inbox, avatar, workspace controls, verification queue, metric tiles or coverage gauge. Technical recommendations are expandable supporting detail. Subject-first report title, summary first, explicit open questions. Proposed repair remains distinct from actual retest evidence. All figures are illustrative and fictional.

Independent critique requested from Aiko (Claude) after repeated rejection, task `3b05a61a-081e-4751-b249-69ccf80c0c98`; original critique `docs/synapse/ui-critique-aiko.md`. Changes use its narrative/content recommendations: remove operator shell, lead with conclusion, promote evidence sequence, demote engineering details, qualify the relevant figure directly.

Browser checks: all five chapters, four map nodes, comparison slider, scope/evidence/repair/about dialogs; no desktop horizontal overflow. Mobile map overflow was found and fixed; all three modes now fit a 387px frame (map internally scrolls). Visual review performed for all modes.

## Revised product studies

Current preview: http://127.0.0.1:65190/ (server-v2.cjs, v2.html). Layouts: inbox, board, film. These replace the first report-like options. User direction: light Casebook coloring; no uppercase labels, large explanatory headings, repetitive prose or PDF presentation.

Actual R2 restores, SHA-256 and byte lengths verified on download:

- `snapshots/linear-webapp/2026-10-02/study.json`: `12-issues-home/screen.jpg`, actual Linear application capture. Used for list/inspector navigation and restrained hierarchy, translated to light surfaces.
- `snapshots/og-x-recreate-20261016-cedar-disarto-support-analytics-dashboard/2026-10-16/study.json`: `comparison/source-full/main-0-f0.png`. Source: Maxim Kuznetsov, https://x.com/disarto_max/status/2103897094671020203. Used for compact groups, pale surfaces, segmented controls.
- `snapshots/saved-design-split-view/2026-10-13/study.json`: `frame0.png`. Used for visual comparison and evidence focus.

Original manifests and downloaded source images retained in private local `references/`; the preview's References dialog shows all three. Reference images are never assessment evidence. No production deployment or execution/API changes.

Browser checks through computeruse: all three layouts render without desktop horizontal overflow; case selection, evidence/repair/technical tabs and expand dialogs work; all three restored reference images decode; 387px mobile viewport has no horizontal overflow. Screens visually inspected for each layout. Old preview server stopped; same result tab reused for the revised preview.

Three local-only interactive directions in index.html: editorial, workspace and casebook. Fictional content and application-screen recreations are explicitly labeled. No execution API, credentials, live findings or production changes.

References consulted: prompt/library/design-recreations/saved-design/catalog.json; archives/split-view.json and focus-reading.json (private R2 verified archive manifests), and references/homepage-linear-review-2026-09-28/README.md. These guide progressive reading and split comparisons; no external assets copied or missing assets required.

Design agreement: consequence-grouped plain overview, capability plus cause, consequence and supported extent, evidence walkthrough, proposed repair separate from actual retest, deeper engineering instructions. Logic handoff assigned to Skye via Kokuban task d1e8b793-5293-4a90-8094-bffa8e436724.
