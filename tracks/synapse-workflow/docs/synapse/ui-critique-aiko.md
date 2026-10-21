# Synapse report UI — independent visual/content critique

Aiko, 2026-10-18 (task 3b05a61a, for Rowan). Scope: design and content only — no security technique, no code edits. Rowan owns the rewrite into three distinct narrative report approaches.

**How I reviewed:** read the full source of `artifacts/synapse-ui/v2.html` (all three variants — `inbox`/`board`/`film` — plus the dialog and section pages), and viewed the `board` layout rendered at `http://127.0.0.1:65190/v2.html?design=board`. Reference images (`/references/...`) load only through the preview server, so I judged layout/hierarchy, not the reference thumbnails.

## The one problem everything else follows from

The corrected purpose is a **reader-facing report**: a business owner opens it to understand *what we examined, what we found, why it matters, and what to do* — the way they would read a slide deck or a brief. v2 is still built as **software the reader operates**. That is exactly Kotaro's objection ("the report that we're going to give to the person who needs to understand... what has been done") and Rowan's own diagnosis ("I built an operator dashboard").

Concretely, every variant wraps the content in product app-chrome:
- a persistent left **sidebar** with a product logo ("synapse"), nav items carrying **count badges**, a "Workspace" switcher, and a logged-in **user avatar** block (KO / "Personal workspace");
- a **topbar** with breadcrumbs, a live "● Review ready" **status pill**, and a "Scope ↗" button;
- **filter segments** (All / Needs action / Unconfirmed), a **search box** ("Find a consequence…"), an **"Investigate next"** work queue, and a **coverage donut** gauge.

None of that is addressed to a reader. It is the furniture of a tool someone works inside. A report has no nav, no workspace, no account chip, no live status, no search — it has a cover, a summary, and sections you read in order.

## Why "three designs" did not satisfy

Kotaro is right that the three are "the same thing." `inbox`/`board`/`film` differ only in **chrome arrangement** (queue+inspector / stat-grid / filmstrip). They are three skins of one dashboard, not three ways of *telling the story*. Distinct narrative approaches differ in structure, e.g.:
- **A — Scrolling one-pager:** cover → plain-language summary → each finding as a full section (what it is → why it is possible → evidence walk → consequence → recommendation + effort) → scope & open questions → "for your engineers" appendix. Anchor table of contents.
- **B — Slide/stepper deck:** one idea per screen with Next/Prev, as if presenting live. The existing evidence step-control (owner access → exposure → proposed fix) generalizes into whole-report navigation — it is already the best narrative device in the file.
- **C — Executive brief that expands:** a short decision-maker summary (what / why it matters / what to do / effort) with inline "show the evidence" disclosures per finding for readers who want depth.

All three map cleanly onto done / found / consequence / recommendation and are genuinely different *narratives* rather than different chromes.

## Concrete content/visual problems (and the change)

1. **Drop the app shell.** Remove sidebar nav, workspace switcher, product logo, user avatar, "Review ready" status, and the scattered "Scope ↗" buttons. Replace with a document structure: cover/title → summary → sections → appendix, reachable by a table of contents, not a nav rail.

2. **Add an opening the reader needs.** v2 drops straight into "Overview" stat tiles (1 / 1 / 0) with no sentence saying what this is, who it is for, what was examined, or over what period. Start with a cover ("Northstar Portal — security assessment", prepared for / by / date) and a plain summary paragraph. (The other preview at `:65177/executive`, "Synapse · Decision brief", looks closer to the right register — worth reconciling with it.)

3. **Replace the KPI tiles and coverage ring with sentences.** The "1 Needs verification / 1 Unconfirmed / 0 Verified" tiles and the **"4/7" conic donut** read as a security score / completion gauge — and look like "57% done." The method explicitly has *no numeric risk or coverage score* and the verified bucket is structurally empty on this shared-host harness. The tiny "Example activity, not a security score" caption loses to a big gauge. Say it in words: "We examined 4 of 7 workflows; 3 remain open," and state plainly that nothing is independently verified yet and why.

4. **Make the two consequences the spine, not an inbox.** With exactly two items, the search box, "Needs your attention / 2" label, and filter segments are theater that imply a triage backlog. Present both findings in full, in priority order, as the body of the report.

5. **Fix the within-finding order.** v2 leads with operator tabs (Evidence / Proposed repair / Technical) — a triage order. A reader wants narrative order: the capability in plain words ("a signed-in customer could open another company's invoice") → why it is possible → the demonstrated sample *vs.* what is still unknown → the evidence walk → the recommendation and effort. The consequence module already carries exactly these fields — mirror them as a readable section, not as tool tabs.

6. **Promote the 3-step evidence walk.** The owner-access → cross-company-exposure → proposed-fix stepper is the clearest "what we did/found" device in the file, but it is shrunk inside a case-inspector tab. Make it a full-width figure sequence with the caption and the "illustrative reconstruction, not captured evidence" disclaimer attached *to the image*, so the honesty note travels with the picture.

7. **Demote "Technical" to a labelled appendix.** The code-style panel (Caller / Observed / Expected / Acceptance) is good content but presented as a developer console and as a peer tab to Evidence. In a report it is a clearly-marked "For your engineers" callout, visually subordinate — not something the business reader must step through.

8. **Re-title away from product identity.** "Synapse · Product studies", the "synapse" logo, "Synapse studies" switcher — that is tool branding. Title the report by its subject ("Northstar Portal — security assessment"); credit Synapse as the method/preparer in small print.

9. **Keep interactivity that serves reading; cut interactivity that serves operating.** Keep: a table of contents / section jumps, the evidence step-through, expand-to-zoom on a figure, show/hide the engineering detail. Cut: search, filters, the inbox queue, nav badges, status pills.

## What is actually good — keep it

- The **visual craft** (restrained palette, soft surfaces, compact hierarchy) is strong; that is not the problem. The problem is that the *references* are product references, so copying them yields a product. Lean the rewrite on editorial/document references (cover, generous reading measure, section dividers, figure captions, a summary callout) instead.
- The **current-vs-proposed comparison** (the Split-View reference) transfers perfectly to a report — keep it for each recommendation.
- The **honesty labelling** throughout ("not captured evidence", "proposed outcome · not retested", "example activity, not a security score", "engineering location requires source inspection") is exactly right and must survive the rewrite — just attach each disclaimer to the thing it qualifies rather than as fine print.

## Limitations of this review
Design/content only. I did not run anything security-related, did not assess the reference thumbnails (server-loaded), and did not edit code. Verdict is advisory for Rowan's rewrite; the three narrative structures above are suggestions on the *axis of difference*, not finished designs.

---

## Revision 2 — `artifacts/synapse-ui/report.html` (preview :65191)

Reviewed the rewrite (full source of all three modes + rendered the `map` mode). **This fixes the core problem.** The app shell is gone; the masthead is a document masthead (subject-first: "Northstar Portal · Assessment report · Prepared by Synapse"); the three modes are now genuinely distinct *narratives* — a 5-chapter guided briefing (What we examined / found / Why it matters / What to change / What remains open — exactly done→found→consequence→recommendation), a clickable consequence map, and a scroll case-study with a draggable current/proposed compare. No dashboard KPIs, no coverage donut, no search/filters/queue. Honesty labelling is excellent and attached to the thing it qualifies ("not retest evidence", "illustrative recreations", "Moderate effort is an illustrative estimate, not a quote", "Independent reproduction has not been established"). This is ready to hand to Kotaro. Two material items and some polish remain:

**Material:**
1. **The second finding (order approval after an edit) has gone marginal.** The assessment carried two leads; this report is entirely the invoice case. Order approval survives only as one trailing line in the briefing/story "open questions" and is **absent from the map mode**. If the report represents the whole assessment, the unconfirmed second lead needs a small honest presence in each mode so the report isn't silently narrowing scope — a reader will ask "what about the other thing?"
2. **No worded "how serious is this" statement.** Dropping fabricated scores/the donut was right. But a decision-maker's first question is severity, and the method *does* support a **declared** seriousness level with rationale (explicitly not a number). The report narrates the consequence but never states plain seriousness. Add a worded, rationale-backed line — "we consider this significant because customer billing data crossed a company boundary; we have not established how many customers are affected" — keeping the "extent unknown / not a measured score" caveat. Serves the reader without breaking the no-score rule.

**Deliverable framing (confirm, not fix):** the top "Report concepts" switcher is a *reviewer* scaffold for Kotaro to pick one of three. The report actually shipped to a business owner should commit to a single narrative, not ship a mode-toggle — worth framing the handoff as "choose one," not "here's a 3-mode report."

**Polish (non-blocking):** `screenStep` is shared across modes, so stepping to "Proposed" in one place can leave the briefing's 2-tab evidence screen on a step with no active tab; the story compare puts *proposed* on the left / *current* on the right (readers usually expect current→proposed left-to-right); map-canvas edges are hardcoded rotations that only approximate node centers; and chapter 4's disabled `→` pager coexists with a still-active "Return to the beginning" primary button. None blocks handoff.
