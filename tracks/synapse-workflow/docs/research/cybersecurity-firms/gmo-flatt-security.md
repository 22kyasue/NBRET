# GMO Flatt Security: Takumi's assessment and fix workflow

**Supplement to the ten-company sample, accessed 2026-10-17.** GMO Flatt Security is a distinct operating company from GMO Cybersecurity by Ierae. The [2024-02-13 funding/group announcement](https://flatt.tech/news/flatt-security-10-yen-gmo) describes approximately ¥1B new financing and GMO's acquisition of 66.6% of existing shares effective February 29. It traces the security business to 2019 and names Shisho Cloud, expert assessments and KENRO secure-coding training. Group membership is not evidence that Takumi is Ierae's SOLOBAN or that their revenues are interchangeable.

## What the product does

The [assessment catalog](https://shisho.dev/docs/t/assessment/) describes whitebox source review, blackbox application testing, graybox source-plus-live verification, periodic assessment, dependency PR triage, fix proposals and vulnerability verification. These are different evidence modes. Whitebox candidates do not automatically carry live reproduction evidence.

The [commercial assessment page](https://flatt.tech/takumi/features/assessment) lists a ¥70,000/month tax-exclusive base subscription with 250 monthly credits and optional additional credits at ¥280 each. Prices and scope are dated to this capture, not a quote. Its percentages of vulnerability categories are a distribution of reported detections from 2026-05-29 through August 4, not recall against all vulnerabilities or proof of parity with senior engineers. Named customer quotes on the vendor page remain vendor-selected evidence.

## Graybox: source → candidates → dynamic verification → report

The complete [graybox manual](https://shisho.dev/docs/t/assessment/features/graybox-assessment/), updated 2026-10-16, supplies the following contract:

| Stage | Customer input / system work | Evidence and limitation |
| --- | --- | --- |
| Eligibility | Organization or target ownership verification before live requests | [Two alternative gates](takumi-authority-boundary.md): enterprise approval or per-target DNS/HTTP verification; enterprise approval removes per-target verification |
| Source | Selected GitHub repositories/branches or uploaded archives | Default branch may move; configured include paths can still be excluded by Takumi's judgment |
| Target | One/multiple running URLs, exclusions, test-account roles/credentials and optional client certificates | Excluded URLs may still be accessed; the manual explicitly says this is not a complete access block |
| Enumeration | Identify features and assessment perspectives; optional maximum feature count | Enumeration is a model-produced coverage map, not independent proof of exhaustive discovery |
| Budget | Separate enumeration/scan credit thresholds; graybox scan minimum 40 credits | Budget bounds consumption, not completeness or finding quality |
| Scan | Static candidates followed by live reproduction attempts | Accounts/data may be created, modified or deleted; provider recommends isolated staging |
| Pending | Pause when threshold reached or selected cells finish | Matrix distinguishes scanned, skipped and unscanned; user can reprioritize/resume or finalize |
| Report | Reproduced findings have verification/reproduction steps; unconfirmed static candidates are separate | Reproduction failure can reflect insufficient role/data rather than absence of a vulnerability |
| Retest | New full assessment or reuse earlier feature enumeration | Source is freshly fetched; reusing enumeration may miss changed features |

Reports show feature/perspective coverage and run times. PDF links expire after 15 minutes; issued PDFs are deleted after 30 days. These are delivery/retention terms, not a security effectiveness measurement.

Uploaded code is retained for 30 days, extended by reuse, with immediate source deletion offered after completion. Organization owner, Takumi manager and Takumi user roles can view assessment settings/results; only owner/manager can delete assessments. Credentials persist in settings for execution/reuse and may appear **unmasked** in progress messages. The manual recommends dedicated assessment accounts. This is a disclosed handling boundary, not an experimentally discovered leak.

## Autofix: why “Completed” does not mean remediated

The complete [Autofix manual](https://shisho.dev/docs/t/assessment/features/autofix/), updated 2026-10-16, requires a write-enabled GitHub App with repository content access. A task identifies vulnerability, repository and base branch/tag/commit. Running it clones code, analyzes the issue, generates a patch, unit tests and an explanation, then enters **Reviewing**.

The user reviews a selected proposal version and clicks to create its PR. **Completed means the PR was created.** The manual explicitly says Takumi does not verify the fixed code afterward; a separate Vulnerability Verification is needed. Human review/tests before production are recommended. Retry adds a version; dismiss/delete have different lifecycle effects. Nothing here authorizes us to upload this repository or connect its GitHub account.

This is an action-taking agent: repository writes/PR creation are distinct from suggestions, and merging/deploying are further decisions. No signed approval envelope, transactional rollback or customer production outcome was established.

## Data handling: Japan storage does not imply Japan inference

The [vendor security page](https://shisho.dev/docs/c/security/), updated 2026-10-16, says customer data defaults to Japan storage, with some operational metadata/SaaS logs following their providers. It names Vertex AI, AWS Bedrock and Anthropic API as inference providers, excludes customer-data model training, and says inference may run outside Japan. Exact deployed model names/versions are undisclosed.

Zero data retention is requested where possible but **not guaranteed**, particularly where model-provider cyber-abuse controls require retention. Those statements are more precise than “data stays in Japan” or “nothing is retained.” Product-specific data rules take precedence over generic claims; terms/provider configuration must be verified for an actual purchase.

## Representative work and remaining evidence

**Illustrative inference:** a product team connects an authorized source snapshot and isolated test environment, reviews enumeration, selects budget/priorities, inspects reproduced and unconfirmed findings, requests a patch, reviews the diff and creates a PR. After merge, it separately verifies the fix against the deployed version. Assessment-finalized, PR-created, code-merged, fix-reproduced and production-recovered are separate states.

The English guide identifies itself as beta machine translation; ambiguous terms need Japanese-source cross-checking. Architecture subpages are read below. [Ownership verification is now read](takumi-authority-boundary.md); complete App permission enumeration, actual report samples, API/SDK source and complete pricing remain queued. The [December blackbox benchmark](takumi-blackbox-benchmark.md) is now read; the separately referenced October evaluation material remains unresolved. No assessment was executed.

## Architecture: what validates a hypothesis

The [whitebox architecture manual](https://shisho.dev/docs/t/assessment/architecture/whitebox/) (updated 2026-10-16) describes source cloned into an assessment sandbox, feature enumeration, hypothesis generation and a separate validation agent tracing data flow, intended permissions and a concrete scenario. It unconditionally excludes tests, lock files and third-party code, plus model-discovered exclusions. Missing headers, rate limiting and logging are outside the described reporting emphasis. Thus its “coverage” is coverage of its selected model/feature scope, not a whole supply-chain or control audit.

The [blackbox architecture manual](https://shisho.dev/docs/t/assessment/architecture/blackbox/) describes an assessment-specific VM with browser, shell, recorded proxy traffic and callback observation. Recon, attack and verify are separate phases. Verification checks intended specification when supplied, asks an agent to reproduce, then applies a vulnerability-specific deterministic verifier where available. Authorization-read verification compares canaries across sessions; write verification checks the changed state from an authorized account. Hard-to-formalize types fall back to AI assessment of evidence. Exact verifier code and cross-session identity binding are not public in these pages.

The vendor contrasts this with traditional scanners as simple pattern matching and universally deterministic. Those comparisons are marketing generalizations, not findings of this review: non-LLM tools can perform semantic/data-flow analysis and scripted multi-step work, while changing target state can change any dynamic scan's output. The meaningful distinction is which evidence and validator the selected implementation actually uses. Takumi itself documents stochastic run-to-run misses.

The separate [Vulnerability Verification manual](https://shisho.dev/docs/t/assessment/features/vulnverification/) defines **Not Vulnerable as could not reproduce**, not proof the defect is absent. Errors/uncertain decisions enter Waiting Review; a running task can be cancelled. Retry supports a redeployed fix, but the UI verdict alone does not prove that the tested instance/source/identity matched the intended production version. All architecture claims here are documented behavior, not inspected code enforcement or runtime measurements.

Availability update: [October 5 domestic-inference announcement](takumi-domestic-inference-announcement.md) names a future November 2 start and paid individual arrangements. It does not replace the default inference boundary as of October 17. Japanese security manual cross-check is complete.

See [GitHub feature-specific permission boundaries](takumi-github-scope-boundary.md): Runner permissions do not establish the assessment/autofix manifest.
