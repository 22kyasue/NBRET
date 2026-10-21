# Source catalog and provenance

Consulted 2026-10-17 through the existing computeruse HTTP fetch harness, except repository source/version metadata also fetched directly from GitHub using Node. No third-party target testing occurred. Publication dates are source dates, not claims that these are current operational configurations. Incident pages can change; URLs and access outcomes are retained below. Text was read for research, not archived wholesale into the repository.

| ID | Primary source | Reading and use |
| --- | --- | --- |
| I1 | [Cloudflare Thanksgiving incident](https://blog.cloudflare.com/thanksgiving-2023-security-incident/) — 2024-02-01 | Main narrative including chain and hardening; page output bounded at 22,000 chars including long navigation; not every later timeline detail read |
| I2 | [Microsoft Midnight Blizzard responder guidance](https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/) — 2024-01-25, query update 2024-02-05 | Incident chain, permissions, hunting guidance and linked Sentinel rule; ongoing-investigation caveat retained |
| I3 | [CircleCI report](https://circleci.com/blog/jan-4-2023-incident-report/) — page date 2023-01-12 | Full main narrative read; attributed account, not raw forensic artifacts |
| I4 | [CircleCI customer alert](https://circleci.com/blog/january-4-2023-security-alert/) — January 2023 updates | Issuer revocation, rotation support, audit access; page has later updates |
| I5 | [Sourcegraph admin-token incident](https://sourcegraph.com/blog/security-update-august-2023) — 2023-08-30, updated 08-31 | Full incident narrative and stated impact limits |
| I6 | [Twilio incident](https://www.twilio.com/en-us/blog/august-2022-social-engineering-attack) — final update 2022-10-27 | Initial and revised accounts including final remediation; evolving impact counts not conflated |
| I7 | [Mandiant 3CX investigation](https://cloud.google.com/blog/topics/threat-intelligence/3cx-software-supply-chain-compromise/) — 2023-04-20 | Main chain and detection appendix read partly; long output clipped near end; not a complete malware/source audit |
| M1 | [OWASP WSTG latest](https://wstg.owasp.org/latest/) | Landing/foreword and contents, not every linked chapter; moving document |
| M2 | [WSTG v4.2 reporting](https://github.com/OWASP/wstg/blob/v4.2/document/5-Reporting/README.md) | Complete reporting guidance; scope, limitations, reproducibility and retest structure; methodology rather than measured hours |
| E1 | [OWASP Benchmark](https://owasp.org/www-project-benchmark/) | Project overview read; documentation's ground-truth intentions, not independently validated benchmark scores; GPL-2.0 listed by project for Java benchmark |
| E2 | [AgentDojo](https://github.com/ethz-spylab/agentdojo) | Initial README read expanded into [scorer/runtime/default-task audit](deep-agentdojo.md); synthetic code checks, no model benchmark run |
| E3 | [PurpleLlama CybersecurityBenchmarks](https://github.com/meta-llama/PurpleLlama/tree/main/CybersecurityBenchmarks) | First 16,000 chars only; explicit partial read; no performance conclusion |
| D1 | [Cure53 Obsidian Sync report](https://github.com/cure53/Publications/blob/3070b31cf51e966d504303936f0a12f20b198911/pentest-report_obsidian-3.pdf) — September 2024, footer 2024-10-17 | Selected complete pages 1–4, 14, 16; pypdf 6.19.0; downloaded outside repo; no render engine; [study](sample-deliverable.md), [pin](sample-report-pin.json) |

## Pinned representative implementations

| Repository | Commit | License inspected | Scope |
| --- | --- | --- | --- |
| [REA](https://github.com/morluto/rea/tree/54c71313aeb2cbdf21626af9557673a6f6397180) | `54c71313aeb2cbdf21626af9557673a6f6397180` | MIT | Eight complete files, caller/read/cleanup trace; [hash ledger](source-reading.json) |
| [Atomic Red Team](https://github.com/redcanaryco/atomic-red-team/tree/388942adbd9641f4dfdcf079d7efe9a75ec0ac43) | `388942adbd9641f4dfdcf079d7efe9a75ec0ac43` | MIT | One complete YAML, T1078.001; no execution or runner audit |
| [Sentinel](https://github.com/Azure/Azure-Sentinel/tree/cbb05d9204c89a9d83d8ec69b59dea4fc9b207a8) | `cbb05d9204c89a9d83d8ec69b59dea4fc9b207a8` | MIT | One complete analytic YAML; file-affecting commit; no KQL runtime |
| [AgentDojo](https://github.com/ethz-spylab/agentdojo/tree/089ed468cf3ed0322acc66b0211f26d9d90dbf60) | `089ed468cf3ed0322acc66b0211f26d9d90dbf60` | MIT; YAML representer snippet separately notes CC-BY-SA | Tracked src/tests complete or byte-verified empty; docs/config/table continuation and original/revised task/data oracles. Earlier synthetic fixtures remain separate runtime evidence. |
| [DeepDiff 8.6.1](https://pypi.org/pypi/deepdiff/8.6.1/json) | Exact AgentDojo lock sdist SHA256 `ec56d7a769ca80891b5200ec7bd41eec300ced91ebcc7797b41eb2b3f3ff643a`; Git commit unknown | Distributed MIT license read | [Dependency walkthrough](deep-deepdiff.md), acquisition receipts and explicit unread queue; no package import/install/test |
| [orderly-set 5.5.0](https://pypi.org/pypi/orderly-set/5.5.0/json) | Exact same lock sdist SHA256 `e87185c8e4d8afa64e7f8160ee2c542a475b738bc891dc3f58102e654125e6ce`; Git commit unknown | Distributed MIT license read | Complete sets implementation and actual StableSetEq callee traced; tests/other metadata pending, no runtime claim |
| [PurpleLlama](https://github.com/meta-llama/PurpleLlama/tree/d934ea285d124d81c10f7e15a06a1e1f74eff2c3) | `d934ea285d124d81c10f7e15a06a1e1f74eff2c3` | Root LICENSE is Llama 3.2 Community License; GitHub API returned NOASSERTION | Documentation only; component-specific terms not exhaustively inventoried |

Benchmark documentation hashes and license hashes are in [benchmark-pins.json](benchmark-pins.json). MIT license files were read in full. No upstream code was copied into the synthetic lab. Existing local clones reside under `C:/Users/kotar/.codex/research/`; those directories and upstream source are not modified by this track. Pinning makes a reading repeatable; it does not imply that a historical rule or dependency is appropriate to deploy now.

## Resumed implementation provenance

These are a selected flow and its direct dependencies, not a claim to have reviewed every file in each repository. [Deep provenance](deep-provenance.json) records origin, checkout commit and available license-file hashes; [file queue](deep-reading-queue.json) adds source hashes/read ranges and runtime boundaries. Tomo's prior reads retain his attribution rather than being counted as new Agate reads.

| Repository | Reviewed commit | License/provenance boundary | Selected flow |
| --- | --- | --- | --- |
| [PentestGPT](https://github.com/GreyDGL/PentestGPT/tree/e8b1bb77d1ac00329675cec3b060aba971ec1ac8) | `e8b1bb77d1ac00329675cec3b060aba971ec1ac8` | MIT, reused source/license provenance | Runtime, execution, plan, trace, memory, audit and selected tests |
| [UnifiedAgent](https://github.com/PentestGPT-Project/UnifedAgentWrapper/tree/acff8eeadf93e367d4a1578d3a2739cbc9d3ace5) | `acff8eeadf93e367d4a1578d3a2739cbc9d3ace5` | No tracked LICENSE found; do not transfer parent project's license | Direct pinned dependency; all inventoried Python implementation files, including monitor/context/skills |
| [garak](https://github.com/NVIDIA/garak/tree/cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc) | `cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc` | Apache-2.0; bundled PromptInject resource has MIT attribution | Production PromptInject → generator/OpenAI adapter → detector → evaluator |
| [Invoke-AtomicRedTeam](https://github.com/redcanaryco/invoke-atomicredteam/tree/8af478bb9e4637df568ac1e596553b025b16cd1b) | `8af478bb9e4637df568ac1e596553b025b16cd1b` | MIT, module 2.1.0 at pin | Executor, prerequisites, substitutions, process lifecycle and logging |
| [OpenFGA](https://github.com/openfga/openfga/tree/fb8e7df866742a0c947e3066919ee59ac9e70eea) | `fb8e7df866742a0c947e3066919ee59ac9e70eea` | Apache-2.0, full root license read | v1/v2 check, strategies, request identity, keys/cache/invalidation and selected regression |

Primary OS dependency check: [Python os.kill](https://docs.python.org/3.14/library/os.html#os.kill) and [CPython v3.14.7 function](https://github.com/python/cpython/blob/v3.14.7/Modules/posixmodule.c#L9702-L9750), accessed 2026-10-17. The latter is a tagged, **partial function read**, not a whole-file review. Source branch and local constants corrected an initially wrong termination inference; [contradictory evidence](deep-monitor.md) is retained.

New labs import or AST-extract selected upstream definitions; Go uses an overlay plus an unchanged upstream regression test. This differs from the initial dependency-free lab. A local Python virtual environment was installed and Tomo's portable Go reused; dependency acquisition is recorded separately from zero target/model calls. These environments are not each project's full locked environment. No production code, dependency lockfile or upstream source was intentionally edited.

## Unavailable or insufficient sources

- CISA AA23-320A and the attempted CSRB landing page returned 403; no substantive claims rely on them.
- NIST SP 800-115 PDF returned 200 but this fetch tool did not extract the PDF. It was not read and is not used as substantive evidence here.
- NIST SARD hostname resolution failed; PTES reporting connection was refused.
- Initial Microsoft January 19 URL, GitHub OAuth incident URL and GitLab release URL returned missing-page content. They were not treated as evidence. Correct Microsoft January 25 material was read instead.
- An attempted Sigma rule path returned 404; a concrete official Sentinel rule linked from the Microsoft incident account replaced it.
- A Cloudflare learning page was blocked; the actual incident blog was accessible. No access controls were bypassed.

The gaps matter: one selected deliverable is not a representative sample; this dossier lacks contemporaneous pre-incident reports, measured practitioner time diaries and customer remediation records. The catalog is a selected evidence trail, not a comprehensive bibliography or a repository leaderboard.

Exact material dependency continuation: [OpenFGA API proto](https://github.com/openfga/api/tree/f153694bfc20f7be303e33cabe72b668596c5a06/proto), module v0.0.0-20260319214821-f153694bfc20 from pinned OpenFGA go.mod33. Apache2 LICENSE fully read; cached module origin, license SHA and file/range provenance in dependency-reading-queue.json. Generated message validation is source-complete; generated service/request paths remain queued. No new package execution or public API evidence follows.

[OpenFGA request contract](openfga-request-contract.md) also traces exact go-grpc-middleware/v2 v2.3.4 validator implementation/docs/tests already cached under pinned OpenFGA go.mod24; source notices Apache2, module origin/license hash in dependency-reading-queue.json. This is a selected component, not complete dependency review.

- grpc-gateway/v2 v2.30.0, root OpenFGA go.mod selection; cached origin https://github.com/grpc-ecosystem/grpc-gateway/tree/1debdeabd09134bc7755b9bc85802a7840bae100 ; BSD3 LICENSE1–27 read. Selected transport/query/marshaler source and authored handler tests traced in openfga-request-contract.md. Full dependency queue records unread files; no import/install/execution.

- golang-jwt/jwt/v5 v5.3.1 (root selected), https://github.com/golang-jwt/jwt/tree/7ceae619e739dc8a7bf577214aa8ebf26668e9db ; MIT license read. Parser/claims/RSA enforcement traced in openfga-request-contract.md; other algorithms/tests queued separately.
- MicahParks/keyfunc/v2 v2.1.0 (root selected), https://github.com/MicahParks/keyfunc/tree/94c4af8c07aff4d01809daa8b1b7892002c3f714 ; Apache2 license read. Public source downloaded only, acquisition receipt keyfunc-source-acquisition-20261018.json. No package execution or issuer request.

### Exact OpenFGA HTTP dependencies (source review 2026-10-17 local / 2026-10-18 UTC)

- go-retryablehttp v0.7.8, cached origin e1f5485fe84728709b857cb89e17088894c301d6, MPL-2.0. Root-selected client/transport, complete authored tests, build-tag classifiers and license read; metadata queue retains file hashes. [Pinned client](https://github.com/hashicorp/go-retryablehttp/blob/e1f5485fe84728709b857cb89e17088894c301d6/client.go). No package execution or outbound request.
- go-cleanhttp v0.5.2, MPL-2.0, cached version metadata2021-02-03T18:51:13Z has no origin commit field; do not invent one. Exact module version and file/license hashes retained in dependency-reading-queue.json. [Tagged source](https://github.com/hashicorp/go-cleanhttp/tree/v0.5.2). Full finite distributed inventory source-read.
