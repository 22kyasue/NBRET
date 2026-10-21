# NBRET probe → offline check → regression identity

2026-10-17, exact local hashes/ranges in file-queue.json. Existing E01 lab and receipts remain the prior runtime finding; this extends its implementation trace without a fix.

## scope.mjs1–22 and http.mjs1–57 complete

Scope1–9 accepts explicit credential-free HTTP(S) origins only;12–20 compares URL origin and rejects embedded credentials. This is URL-origin scope, not DNS/IP pinning, principal binding or path scope. Transport1–15 validates protocol/credentials/byte/deadline budgets;16–23 idempotently rejects/destroys streams.24–48 configures compression, separate wire/decoded limits, rejects unsupported/broken/aborted responses and resolves only on end.49–57 sets whole-request timer, maps connection/DNS/TLS errors and sends body. No redirects, retries, cookie jar or auth injection; explicit case headers carry auth. No destination-IP restriction beyond caller's URL scope. HTTPS uses Node defaults unlike Nuclei's deliberately permissive scanner TLS configuration.

## probe.mjs1–112 complete

1–18 imports shared transport/redaction and derives contract as method+origin+pathname, omitting query.20–42 validates cases and budgets, disallows write methods without allowWrites, GET/HEAD bodies and transport-header overrides. This is a method gate, not proof a GET has no side effects.43–58 prepares output, retains redacted headers/body and sends original supplied headers/body through bounded transport with remaining deadline.59–71 parses structured response, redacts and hashes sanitized body, records redirect without following, and maps errors.72–88 enforces retained-body budget and writes progress; expired later cases become errors without requests.89–97 groups comparisons by coarse contract: variants of query/principal/body share first response baseline. Changed status/body is an observation, not automatically an authorization defect.98–112 marks incomplete on errors/expectation/output loss, removes further bodies to fit final serialized output, persists probe/progress directly. Hash of sanitized body cannot prove raw response identity; no explicit principal/environment identifier exists.

## assertions.mjs1–75 complete

1–13 validates restricted matcher vocabulary;15–23 resolves RFC6901 own properties, preventing inherited-property matches.25–42 reports redacted sentinel unavailable and evaluates typed equality/substring/range/length.44–58 validates status/header/JSON/duration expectations.60–75 distinguishes missing response and structured body from failure, normalizes header names, treats no assertions as unavailable. A passing assertion proves its predicate on supplied evidence only. It does not authenticate evidence origin/freshness/principal.

## checks.mjs1–109 complete

1–14 canonicalizes JSON for digest and escapes output.15–38 derives depth/sample-bounded schema, optionally deletes ignored paths and hashes remaining body; dictionary-shaped large objects intentionally lose exact keys.40–53 compares baselines solely by test.key and snapshot fields. Baseline origins/principal/environment/source are not compared. Unavailable regression is a change type but is absent from allowed failOnChanges policy; result assertions can separately be incomplete. Duplicate baseline keys collapse in Map because only array/schema/kind validated.

55–80 validates explicit cases/expectations/unique names, makes fresh output, loads bounded contained probe or runs live probe, labels offline observation.81–88 selects **first** matching offline method+safeURL+cleaned-body digest, ignoring request headers, principal, timestamp, probe.origins and uniqueness. This is the source of previously runtime-confirmed E01 tenant mismatch. Redaction can collapse distinct secret query/body values as well as header identities. Live mode instead aligns by index; it does not reuse offline matching.89–109 compares optional baseline, derives pass/fail/incomplete, saves JSON/Markdown/JUnit. Escaping protects report syntax; it does not validate evidence meaning. JUnit marks incomplete tests skipped; consumers need preserve that distinction rather than treating zero failures as complete assessment.

## run.mjs1–123 complete

1–22 defaults to existing computeruse harness on Windows when available; disallows COPY/selector actions in that path.24–43 validates isolated mode actions/scope, makes fresh persistent profile and starts browser.45–81 attaches recorder, navigates/actions/snapshots, optionally REA; finally calls finish before declaring captured and closes context. Browser launch precedes enclosing try, and close failure can prevent summary persistence.82–88 optional COPY is separate child/browser context.89–123 links by URL/hash, reports pending/loss and writes summary/report. No domain egress interception in isolated path, and selector-action scope is not checked per click; only initial scope and snapshot retention checks apply. This source review does not execute isolated browser path under current PC preference.

## testing.test.mjs1–184 complete

18–38 loopback tests gzip/Brotli, decoded budget, malformed compression and truncated response.40–52 assertion absence/redaction/own-property cases.54–73 static parser nonexecution and workflow extraction.75–109 live/offline assertions/regression/JUnit and distinct POST-body matching; does not test differing headers/principal.111–134 synthetic analyzer links/coverage;136–150 failure/scanner/gap taxonomy.152–169 harness stubs exercise caps/loading/interaction validation.171–184 loopback output-budget omission. These tests were read completely here; previous focused runtime receipt is separate, and no broad rerun is claimed.

## Boundaries still open

Trace contracts grouping and discovery, stored-file validation details, CLI policy/exits, source-parser dependencies and reader report. Prototype identity/environment binding requires explicit canonical identity, provenance, freshness and ambiguity handling; research evidence does not authorize a production fix.

## contracts.mjs complete1–121

1–21 validates inventory budgets and reads network evidence under canonical root with file size checks. Evidence.json itself is not individually canonicalized before read, unlike asset paths below; symlink containment remains a source question.22–36 labels draft and source-byte SHA, records omission/credential limitations and retained budget.37–47 contains/canonicalizes body asset, checks size before read and returns sanitized JSON; lacks post-read size check and atomic file identity.48–79 trusts request.inScope from evidence, groups method+origin+path, retains query keys/statuses and bounded samples, detects redacted credentials.80–97 proposes observed structured inputs and first numeric field boundaries0/-1/1, marks requiresReview/writeAuthorization, never sends them.98–121 trims output and persists draft. The proposal format is not authorization or assertion of expected security outcome. Principal distinctions are not part of contract IDs; coarse grouping is useful inventory but insufficient identity for replay.

## reader-report.mjs complete1–20

1–7 escapes dynamic markup and allows HTTP(S) or restricted local HTML links, otherwise '#'.8–18 renders caller-supplied results/pages/journey/next checks/scope/evidence link;19–20 closes function. Renderer does not derive conclusions or reconcile scanner/collector terminal state. A polished report therefore inherits caller evidence quality. No script or external asset loading is generated here; external links remain user-navigation destinations.

## scenario.mjs complete1–24

1–9 validates steps, requires at least one explicit expectation, delegates harness capture with REA off/coverage on/zero scroll (caller options can override earlier default options).10–24 aggregates observed assertions, derives failed from UI_ASSERTION_FAILED else incomplete for any error, writes JSON/Markdown. It does not independently verify that every configured step ran; capture error list/step statuses are the evidence. The limitation describes named non-destructive controls, but name filtering is heuristic rather than a guarantee about server actions.
