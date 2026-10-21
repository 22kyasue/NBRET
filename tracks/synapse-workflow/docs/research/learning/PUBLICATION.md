# Inside cybersecurity: expanded research publication

Kotaro clarified that beginner explanations alone discarded too much value from the research. The intended artifact is something he can spend time reading: how attacks work, what security companies offer broadly and technically, and how to reproduce mechanisms, tools/services and company workflows. All three matter.

## Reading structure

`publication.json` defines seven chapters and eleven dossiers. Each chapter contains a connected editorial explanation from `chapters/`, followed by complete canonical Markdown studies and links into deeper implementation research. The dossiers contain the full provider profile, full grouped supporting studies, a plain introduction and an independent reconstruction notebook from `blueprints.json`. Sixty-one unique canonical studies are integrated into the current company dossiers; the full dated snapshot remains searchable.

The seven chapter guides contain approximately 5,900 words before their integrated studies. Company pages include business/services, operating mechanisms and source-qualified detail, rather than replacing source studies with thumbnail summaries. Reading-time estimates are approximate at 200 whitespace-separated words/minute and are navigation aids, not completion or mastery scores.

The dossiers cover CrowdStrike, Palo Alto Networks, Fortinet, Microsoft, Cisco/Splunk, Google/Mandiant, Trend Micro, LAC, NRI Secure, GMO Ierae and the separate GMO Flatt supplement. The sample is not a ranking. Common history/financial comparisons retain dates and legal/accounting scope in their canonical articles.

## Implementation and continuity

- `reader-publication.js` and `.css` own publication navigation and rendering. They build on the existing Markdown renderer and offline embedded documents.
- `reader-visuals.js` retains the eight illustrated beginner lessons under `#basics` and stable topic routes.
- Source-study rendering preserves text and outgoing source links. Heading IDs are namespaced to avoid collisions in multi-study pages. A study can be opened separately and saved through the existing reader tools.
- Chapter/company reading positions are retained in the existing browser state, and Resume returns to that location. Original topic notes, exports and article bookmarks remain intact.
- `labs/order-access-lab.mjs` is a new fictional, loopback-only application using synthetic account selection, orders, event logging and a simple rule-based alert. `verify-order-lab.mjs` starts and cleans up its own instance. `SERVICE-EXERCISE.md` turns that fixture into an assessment/service delivery exercise.

Blueprints describe independently implementable designs and tests, not recovered proprietary implementations or validated equivalent products. Existing stopped research operations were not retried or incorporated into these new exercises.

## Verification

The new lab verifier passed six checks: vulnerable disclosure, deceptive refusal with private data, repaired refusal without the private object, owner-access positive control, retained event distinctions and rule-generated alert. The browser UI was also exercised from vulnerable response to repaired refusal. No external target or upstream security test suite was run.

Through the existing computeruse MCP and repository harness, all eleven dossiers and seven chapter routes rendered the expected complete study counts. All dossier contents targets resolved. Resume restored a saved 1600px reading position. Beginner figures and interactive examples remained available. Real 390px browser emulation exposed two long-text overflow cases; wrapping was fixed, and all eighteen publication pages then fit without whole-page horizontal overflow. Desktop appearance was inspected; the earlier figure reduced-motion check remains applicable because its controller was unchanged.

Receipts and temporary scripts are in ignored `runs/reader-visual-review/`, including `publication-verification.json`. Rebuild with `node scripts/build-learning-reader.mjs`; this embeds a fresh snapshot of actively maintained source research. No production deployment was made.
