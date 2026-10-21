# Learning workspace: durable conversation context

Owner: Rowan. Kotaro wants detailed understanding, visual explanations and back-and-forth discussion, without repeating material. This reader is an editorial layer over active research, not a replacement for source annotations.

Latest October 17 direction supersedes the beginner-first homepage: Kotaro felt the research had been flattened too far. He wants substantial individual company studies, a broad and technical understanding of hacking and security services, and all three forms of replication: local mechanisms, tools/services and company workflows. Start with `publication.json`, `chapters/` and `blueprints.json`. The reader renders full canonical studies within eleven dossiers and seven chapters. Keep plain explanations and visuals while preserving depth; use the short `beginner.json` lessons as optional introductions.

October 17 clarification: Kotaro found the earlier overview too verbose and assumed vocabulary hard to understand. Start with `beginner.json`: short explanations using the fictional Alice/Bob online shop example. Explain new terms before using them. `topics.json` retains the original source mapping and stable IDs; the builder overlays the beginner lessons. Illustrations and selectable examples belong to the learning layer, not to the evidence record of a real shop. See `VISUALS.md` for the visual implementation and checks.

## Start here in a future session

1. Read `beginner.json` for the eight accessible lessons, then `topics.json` for the stable IDs and canonical article links.
2. Ask which question or topic Kotaro is exploring. If already provided, continue it directly.
3. Read the relevant canonical studies and their current evidence limits. The HTML is a dated snapshot; Markdown may have advanced.
4. Carry forward corrections and contrary evidence. Distinguish source review, synthetic runtime results, hypotheses and actual customer-environment evidence.
5. Explain only the missing mechanism or connection. Use a concrete example, an appropriate diagram and a prediction or teach-back question when useful. Do not regenerate every overview.

## Topic vocabulary

| ID | Topic |
| --- | --- |
| 01 | Security companies, products, services and responsibilities |
| 02 | Assessment objectives, scope and evidence |
| 03 | Toolchain and evidence transformations |
| 04 | VPNs, proxies, tunnels and network identity |
| 05 | Bots, workers, queues, leases and coordination |
| 06 | Claims, oracles, proof limits and reporting |
| 07 | AI agents, tool permissions and effect verification |
| 08 | Detection, response, remediation and retesting |

## Reader behavior

`index.html` is self-contained and can be opened locally. It embeds the canonical Markdown from five research tracks, supports internal article navigation and full-text search, and stores topic notes/discussed markers/bookmarks in browser local storage. Notes can be exported/imported. A copied discussion prompt includes topic, user notes, snapshot date and canonical file paths. A future assistant does not automatically receive local browser notes.

Rebuild from NBRET root with `node scripts/build-learning-reader.mjs`. This updates the snapshot and `build-receipt.json` without changing the research articles. Rebuild only after checking current content; artifact hashes are not semantic verification.

## Visual and editorial requirements

Use one canonical explanation per idea, with deeper mechanism and evidence links rather than duplicated prose. Diagrams must label what arrows mean and their evidence status. Do not turn a source hypothesis into a visually asserted outcome. Topic learning controls record visits and notes, not mastery scores or security-coverage percentages.

Kotaro explicitly chose the reader's existing cream/ink/orange style on October 17. The eight illustrated walkthroughs use user-controlled steps, with static complete frames when reduced motion is enabled. The earlier style question is resolved.
