# Workflow understanding

The goal is to explain **action → request → state → condition → navigation/rendered result**, with evidence at each step. A list of requests or functions is an inventory; it does not by itself explain a workflow.

## Command

```sh
npm run understand -- --config workflow.json --out runs/new-workflow
```

Example configuration for a public page:

```json
{
  "question": "Why does visiting the student route return an anonymous visitor to sign-in?",
  "terms": ["PERM_REDIRECT_STUDENT", "authorizeOrRedirect", "authorizeUser", "isAnonymous", "credential-store", "SYNC-STORAGE"],
  "url": "https://hbsp.harvard.edu/student",
  "origins": ["https://hbsp.harvard.edu"]
}
```

The command performs bounded, unauthenticated GETs only. It discovers script URLs in the supplied HTML and follows their declared source-map URLs within explicit origin scope. It does not guess map paths, follow HTTP redirects, send browser credentials, scan endpoints or execute downloaded JavaScript. Source filenames are generated locally; original map paths remain metadata.

For an offline run, replace `url`/`origins` with `sourceDir` pointing to a directory of saved `.map` files. Add `runDir` to index saved NBRET scripts and requests, or `networkFile` for a standalone NBRET `evidence.json`. These inputs can be combined. Supplying a capture currently indexes captured scripts but does not automatically fetch their maps; add a public URL or a saved map directory. Fresh acquisitions are explicitly distinguished from historical browser captures.

Outputs:

- `understanding.json`: observed request facts, source provenance/hashes, original source locations, branch conditions, storage operations/constants, navigation operations, imports and candidate symbol links, excerpts, coverage gaps and next checks.
- `WORKFLOW.md`: reviewable evidence pack for a person or coding agent to explain the workflow.
- `sources/`: original source content recovered from maps, or deployed JavaScript when a map is unavailable.
- `artifacts/`: freshly fetched HTML, scripts and maps with receipts in the JSON output.

The command supports ordinary maps with `sourcesContent`. Missing source content, indexed/inline maps, budgets and unavailable/out-of-scope resources produce explicit gaps. It does not fetch the source paths listed inside a map. Default limits: 60 scripts/maps, 24 MiB per artifact, 160 MiB input total, 4,000 original source units, 35 selected units and three rounds of imported-symbol expansion.

## The steps used in the Harvard walkthrough

1. Record the user's mouse actions and page/console changes through the existing computeruse harness. Record times; do not infer exact clicks from a later screenshot. The temporary window observer used during the lesson is separate from this command.
2. Preserve Network across navigation. Inspect the initial document status and whether a new destination document was requested. `/student` returned 200; the browser then displayed `/signin` without a separate sign-in document request.
3. Inspect Fetch/XHR for authentication/session responses and initiators. Absence in this capture is a coverage-limited observation, not proof that the application never contacts an auth service.
4. Read the served HTML, retrieve its declared script URLs, then retrieve the scripts' declared source maps. Save URLs, bytes and SHA-256. Do not claim a newly fetched script is identical to the live cached script without a matching hash.
5. Search original sources for the observed route and expand through imports and references. For this application the chain is `home/routes.js` → `authorizeOrRedirect(PERM_REDIRECT_STUDENT)` → `HasPermission.jsx` → `authorizeUser()` → `User.isAuthenticated` → Redux authentication state → persisted local storage. React Router's `navigate()` changes the view and URL.
6. Inspect the persistence and credential provider separately. `SYNC-STORAGE` stores app state; `hbpToken` and related keys store credentials. A UI flag does not establish that the server accepts a token. Inspect presence/booleans if needed, rather than displaying credentials.
7. Explain the chain with file/line citations. Clearly identify observed network facts, static source behavior, inferred links and unknown runtime values. A breakpoint on the predicate plus a repeat action is the next step for proving the exact branch that executed.

## Existing NBRET versus this addition

Capture already records network initiators, cache flags, scripts, actions and optional coverage. `analyze`/`structure` index functions, direct lexical calls, effects and runtime links. This addition recovers original map sources and creates a question-driven index of decisions, storage and navigation across files. The static symbol links are candidates, including ambiguity; they are not a complete cross-module call graph.

The reasoning layer still belongs to the person/agent reading the evidence pack. Arbitrary business logic cannot reliably be reduced to a generic search script. The tool makes the investigation reproducible and citable; it does not pretend that keyword matches constitute a completed explanation.

Single-example source indexing does not launch a browser. Multi-example configurations below use the existing computeruse harness. Continuous human-action recording, breakpoint orchestration, runtime state allowlisting and automatic source-map offset mapping remain future integration work.

## Multiple examples and comparisons

```sh
npm run understand -- --config docs/examples/workflow-examples.json --out runs/student-examples
```

The same command recognizes an `examples` array. Each example must have a unique `id` and either `url` (live capture) or `runDir` (saved NBRET evidence). The top-level question and terms are defaults; examples can override `question` and `terms`. Supply explicit top-level `origins` for live examples. Optional `steps` use the existing scenario syntax: bounded non-destructive `click`, `hover`, or non-password `fill`, with exact control names and UI expectations. Optional `expectFinalUrlIncludes` is checked after capture. Failure of an expectation fails the suite; capture errors or dropped evidence mark it incomplete.

Examples run sequentially in separate owned harness tabs and close only those tabs. They share the existing profile: session and cache may carry over. A `condition` is a setup description, not proof of authentication state. The runner does not sign users in/out or clear their data. With `acquireSources: true`, each live example also fetches public scripts/maps separately, with hash identity checks against captured scripts. Without it, captured script sources are indexed locally; `sourceDir` can supply original source maps for every example.

`comparisons` contains `{ "left": "first-id", "right": "second-id" }` pairs. The suite emits `workflows.json` and `WORKFLOWS.md`, with an evidence summary and source-understanding pack per example. Comparisons show request counts/signatures, status distributions, final routes, cache attribution, storage counts and console severity counts. Differences are observational, not automatically causal. Each summary has an action/request/navigation/snapshot timeline; missing timestamps remain missing and sort after timed events. Harness capture records a final snapshot after its bounded network-drain interval. Older evidence without a final snapshot is marked incomplete, rather than treating an initial snapshot as the final result.

Capture now records document and within-document navigation events, console metadata with arguments omitted, and bounded link destinations/labels/title/target/rel/visibility/disabled/download metadata. It continues to record request initiators, source hashes, cache attribution and optional V8 coverage. Console arguments and storage values are omitted. Original source code and bounded DOM labels remain unredacted in ignored run storage, as with existing source capture.

Use independent examples for direct routes, link clicks, search input changes and repeated visits. Add paired comparisons and explicit expectations where known. Do not interpret a passing route assertion as proof of protected API authorization. Read `nextQuestions` for missing evidence and the next runtime checks needed to explain a result.
