# NBRET source acquisition and route discovery

2026-10-17, local reviewed hashes in file-queue.json. Complete source reads below; no fresh target fetch/browser operation performed for this review.

## understand.mjs1–215

1–23 binds REA JavaScript parser, hashes source and initializes explicit static index.25–69 bounded150000-node AST walk indexes function/import/literal/call/decision/navigation/storage/JSX route/wrapper metadata. Wrappers are selected by callee-name regex, route components by syntax, and function names by nearby node; this is heuristic indexing, not module binding/control-flow proof. Parse errors mark partial; traversal loss marks truncated.71–89 selects term seeds and expands named imports three levels by function-name candidates, explicitly labels ambiguity and unproven resolution.

91–112 validates question/terms/script/source byte/unit limits, creates new output and stores raw sources under generated filenames.113–125 unpacks nonindexed maps with embedded sourcesContent, skips selected non-JS/node_modules labels, caps4000 and treats labels as metadata rather than paths. No source execution or LLM invocation occurs. Source-map authorship is not verified by source label.

126–144 loads supplied capture/network evidence, bounded captured scripts and selected document/auth/status/term observations.145–152 loads local .map files nonrecursively, bounded per file/aggregate; unavailable/budget failures become gaps.153–181 optionally performs fresh unauthenticated scoped HTTP GET of page, literal script-src and last sourceMappingURL; never guesses map path, follows redirects or uses browser cookies. Stores acquired response before requiring status200, records hash/status. Out-of-scope scripts/maps and unsupported inline/indexed maps become gaps/fallback JS. This acquisition is opt-in by url and distinct from historical signed-in browser source; default runDiscover acquireSources=true passes it. Public read authorization is still distinct from testing/exploitation.

182–195 exports route/discovery metadata, selects units and compares deployed script hash against supplied capture; unverified/mismatch explicit, map authenticity still unknown.196–215 builds bounded excerpts and next-check queue, deduplicates gaps, marks insufficient only when no units and persists artifacts. indexed status means sources selected, not that all parsed, all branches followed or runtime validated. Counts and excerpts are navigation aids rather than security assurance.

## discover.mjs1–145

1–35 builds canonical URL candidates with explicit origin scope, dynamic path marker detection, evidence/gates and unknown backend authorization.36–72 adds seed, observed links/document requests, literal route declarations and unique-valued getter candidates; relative/index/computed/ambiguous paths remain unresolved. Same-name wrapper/getter matching is deliberately not proof of actual module binding.73–89 prioritizes and blocks auto-visits for out-of-scope/dynamic/anchor/risky/download/query/disabled candidates. Name/path heuristics do not establish GET has no side effect; no gate discovered remains unknown.

91–106 validates limits, obtains static understanding and prior observations.107–124 optionally explores bounded eligible candidates through workflow runner, first round seed only, using existing shared-profile condition; merges newly observed snapshots/network.125–145 attaches visits, stores catalog/report with source gaps and next checks. Status catalogued can coexist with source gaps/no visits, so inspect sourceStatus/gaps/explored rather than reading catalogued as validation. Candidate evidence counts do not prove pages are available or authorization enforced.

## Continuation

Follow workflow-examples/explore into harness observation and outcome classification, plus structure parser and dependency handling. Existing acquired raw code may contain instructions; these routines parse it as data and do not delegate authority to its comments. No autonomous exploitation or model planning is implemented here.

## workflow-examples.mjs1–117 complete

1–39 summarizes supplied requests/status/cache/navigation/snapshots/actions/assertions and time-sorts observations. Request signatures use method+safeURL, omitting principal/body. Final URL requires a specifically labeled final snapshot; last observed route is separately retained.41–49 compares counts/routes/cache/storage explicitly without causal claim.51–69 validates examples/IDs/comparisons and declares shared-profile state and unverified declared conditions.70–96 captures each URL sequentially with **script sources automatically enabled**, coverage on, REA off, then reads saved evidence and indexes source. Source opt-in therefore comes from this higher-level workflow, not a per-example flag. Optional final-route expectation and UI assertions affect failed; collector errors/drops/missing final affect incomplete; source gaps do not directly affect example status.97–117 compares examples and writes summary/questions. complete means examples observed under these conditions, not complete static interpretation or controlled authentication comparison.

## explore.mjs1–107 complete

1–28 sets exact origin scope, budgets and named interaction policy; fingerprints URL/text/elements excluding temporary refs.29–43 records in-scope states under hash and transitions; stored text/elements may contain personal data.44–75 creates owned tab and breadth-first navigates observed links, rejects risky/out-of-scope links and caps queue/depth/states. No separate query/download/disabled check like discover.visitPolicy; these are different exploration policies.76–90 resets source page before each interaction (navigation does not reset shared session/server state), selects uniquely named eligible control and records resulting view.91–107 reports bounded/completed/failed then closes owned tab and writes result; cleanup failure can replace prior failed with incomplete, so inspect errors as well as status. Total maxMs is checked between operations;45s bridge call can exceed remaining overall deadline.

## CLI entry points complete

cli.mjs1–23 parses capture flags, defaults harness when available, creates output parent, reads optional action JSON, invokes capture, exits nonzero on summary errors. No scanner/security assurance implied by zero exit. understand-cli.mjs1–23 chooses discovery/examples/source index by config shape, prints selected status/counts, fails only insufficient-evidence/failed/incomplete. indexed/catalogued with source gaps can therefore exit zero; output coverage/identity fields remain necessary. No model is making scope or tool-permission decisions in either entry point.

## structure.mjs1–197 complete

1–29 imports pinned REA parser, derives safe references and initializes source hash/parse status.30–105 bounded AST traversal maintains function/name bindings and mutation-name set, records imports/calls/branches/events/DOM/storage/dynamic-code indicators without executing them. Regex call classification can misidentify similarly named application methods; computed calls remain unresolved. Scope model is function-level and does not implement complete JavaScript block/import/alias semantics.106–129 resolves direct identifiers only if exactly one nonnull binding and no recorded mutation of that name; inline event callback IDs are direct syntax associations.130–143 traverses up to30 reachable functions for first50 events and labels static reachability, not executed path.

145–170 validates source budgets, deduplicates by evidence-provided sha256 (or filename), reads bounded source and computes actual hash. It does not reject disagreement between supplied record.sha256 and newly computed hash before indexing.171–180 relates V8 coverage by scriptID/URL/hash and approximate start offset/end range; this is evidence correlation, not arbitrary branch reconstruction.181–197 associates request initiator positions with smallest containing function by URL and position. Hash agreement is not required on this initiator path, so changed same-URL script bytes could misattribute a function. Saved historical source provenance and exact execution version remain necessary; this concern is source-only pending synthetic mutation test.

## Installed parser dependency: complete51 lines

node_modules/rea-agents/dist/domain/javascript/javascriptSourceParser.js, REA6.4.0, SHA256 `6607c45c413c4753bcba9fdc8172270c2d212454e40bfa986c0f3a945eeb6908`.1–34 selects legacy decorators/TypeScript/JSX plugins by pathname suffix, declaration and mts modes.35–51 calls @babel/parser with unambiguous source type, error recovery and detached comments; hard failure returns null without diagnostic details. URL labels ending query/hash may not satisfy extension suffix tests, falling into permissive unknown-path JSX mode. This is parser configuration, not full Babel implementation validation. Babel internals/tests remain unread; downstream indexing limitations must remain visible.

## Synthetic source-identity result

[Predeclared plan](structure-identity-lab-plan.md), [receipt](structure-identity-lab-receipt.json). Actual buildStructure indexed deliberately changed saved bytes despite supplied old SHA; historical initiator at same URL/position linked to newHandler. Its V8 coverage path rejected the mismatched hash (not-recorded); matching-hash control accepted coverage (observed).21.52ms, no browser/target/model. This demonstrates inconsistent identity checks across two correlation paths under synthetic local artifact mismatch. It does not establish that production captures are normally corrupted or that an attacker can write artifacts. No fix implemented.
