# Route discovery and access breakdown

Start with one known page, not a list of hidden routes:

```sh
npm run understand -- --config docs/examples/discover.json --out runs/new-discovery
```

A configuration with `seedUrl` selects discovery mode. The tool reads declared scripts/maps, indexes all recovered route declarations and path getters, and creates `access-catalog.json` and `ACCESS.md`. With `explore: true`, it uses the existing computeruse harness to capture a bounded set of candidate visits, adds observed links to the catalog, then selects more candidates for the next round. It operates sequentially and closes only the tabs it creates. Existing profile session/cache state is preserved.

Live exploration requires a connected managed AI browser window. If none is open, use computeruse `desk` followed by `launch(app='chrome', url=seedUrl)` before running the command. NBRET's bridge does not start or restart the person's browser. Missing browser connectivity yields incomplete examples, not invented observations.

Each candidate records:

- URL, path, origin scope, and whether route parameters must be supplied.
- Where it was discovered: rendered link, original route declaration, navigation literal, or observed document request.
- Link label/title, source page, target, rel, role, visibility, disabled state and download attribute when captured.
- How to access it: direct navigation or the observed labeled link on its source page.
- Same-file component wrappers that express access/feature gates, their exact expressions, source files and lines.
- Observed visit status/final route and links to browser/source evidence.
- Whether automatic navigation is eligible, and why it was excluded when applicable.

For example, `home/routes.js` can contain `<Route path={urlStudent()} element={<AuthorizedStudentHome />} />`, `urlStudent()` can resolve to `/student/`, and `AuthorizedStudentHome` can be declared as `authorizeOrRedirect([PERM_REDIRECT_STUDENT])(StudentHome)`. These three source facts produce a candidate and a static gate even when no rendered student link was recorded. The catalog does not claim that the gate ran or that the backend uses the same check.

Path getters are resolved only when all indexed literal definitions agree. This is a name/value candidate match, not full JavaScript module resolution. Relative, index, computed and ambiguous routes are retained in the unresolved section. Parameterized routes are catalogued but not automatically visited. No guessed IDs, route wordlists or endpoint brute force are used.

## Configuration

`seedUrl` is required. `origins` defaults to its exact origin. `explore` defaults to false (catalogue only). Limits default to three visits, two rounds and 500 candidates; maximums are 12 visits, four rounds and 2,000 candidates. The first round visits the seed; later rounds prioritize observed links over source-only declarations. The limits bound work rather than imply completeness.

`sourceDir` supplies saved maps, and `runDir` supplies existing NBRET browser evidence. Set `acquireSources: false` to work offline with those inputs. By default, public source acquisition uses unauthenticated bounded GETs within the origin scope. Source metadata is not fetched recursively from map source paths.

## Access certainty

“Unknown” means no supported gate was identified; it does not mean public access. Static gate detection currently supports route element components wrapped in same-file declarations with recognizable authentication/permission/feature/guard operation names. Cross-file wrappers, parent-layout gates, JSX feature-flag ancestry, server policies and computed predicates may remain unknown. Follow the gate to its selector/provider and verify runtime values before asserting why a particular user was redirected.

Only evidence-backed HTTP(S) navigation candidates are eligible for automated visits. External origins, parameterized paths, confirmed same-document anchors, query-bearing destinations, disabled links, downloads and obvious mutation/sign-out paths are retained but skipped. Capture checks whether a fragment names an existing element on the same document; it does not assume every hash is an anchor. Hash destinations such as `/websites#catalog` remain candidates when that anchor interpretation is not confirmed. This heuristic is not a proof that every GET is side-effect free. The runner does not submit forms, change permissions, clear storage or bypass gates.

The catalog does not yet read sitemaps/robots or service-worker manifests as route discovery sources. It currently uses browser links/documents and recovered JavaScript route/navigation evidence. Source excerpts and DOM labels can contain site or personal information; keep ignored run artifacts private.

## Include the catalog in the analysis report

`analyze` automatically reads `access-catalog.json` from its input run. Alternatively, set `accessFile` in its JSON configuration to combine a catalog with a particular captured run:

```json
{
  "runDir": "runs/discovery/round-1/visit-1-1/capture",
  "accessFile": "runs/discovery/access-catalog.json",
  "deep": false
}
```

Run `npm run analyze -- --config analysis.json --out runs/access-report`. Both `REPORT.html` and `ANALYSIS.md` include discovered links/routes and gate evidence. The browser/network overview describes the selected capture, while the access catalog can contain discoveries from other examples; their provenance remains separate. Analyzing a discovery root without a capture can still render its catalog, but correctly reports insufficient network evidence for the normal overview.
