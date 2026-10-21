# Review of the first guided investigation

Bryn, 2026-10-18. **Accepted as a bounded, guided, source-assisted local exercise. No independently verified vulnerability or unauthorized damage is established.** The five selected hypotheses were not reproduced in the retained cases. This conclusion is narrower than an application security verdict.

## Material reviewed and reviewer role

Authoritative package: `runs/guided-investigation-a39df90a-a5d5-4ab9-afb8-d89a3e72e601/`, comprising `manifest.json`, `evidence.json`, `results.json`, `digests.json` and `REPORT.html`. Internal run ID: `guided-679678a3-99b6-467a-a397-97264455f51e`.

I read the package, `src/practice/app.mjs`, `src/practice/investigate.mjs`, the research guide and cited study passages. I performed offline JSON comparisons, predicate calculations and file hashing only. I made no target request, started no app or scanner, changed no source and performed no fresh effect reproduction. This is a separate reviewer critique on the same unrestricted host/account, with source access. It does not supply an enforced independent execution environment, a blind result or Kotaro's own verification.

The earlier two packages remain historical records. The first mislabeled Carol's unauthenticated setup requests; the later packages separate intended session labels from server-observed principals. The authoritative package above also pins the runner and states its evidence transformations and timing limits. The review does not silently retrofit these corrections into the original observations.

## What the records support

The final package contains **22 unique observations and 22 matching server request-log entries**, with **21 checks marked passed, zero failed and no execution error**. The additional request is the synthetic CSRF setup request. It is not a missing twenty-second check.

The requests all carry one recorded origin, the newly owned loopback instance. The script creates that instance itself and accepts no target URL. The records distinguish the anonymous setup/session-creation requests from the later authenticated Carol profile read. Alice and Bob have separate returned member profiles and tenant-scoped lists; Carol's returned profile establishes the selected synthetic approver session before her action requests. These are observations from the same app, rather than an external identity authority.

| Branch | Retained observation and control | Defensible conclusion |
| --- | --- | --- |
| H1: selected cross-organization reads | Alice requesting `WO-S201` and Bob requesting `WO-N101` each receive 404 with an error-only JSON body. Both principals had successful own-profile/list controls; the records exist in their owner's list and later detail responses. | No foreign object contents were returned by these two requests. This is not exhaustive object enumeration or coverage of every role/interface. |
| H2: member approval | Alice's approval request for submitted `WO-N102` returns 403. A subsequent Alice detail read still returns that exact submitted order. A legitimate Carol approval succeeds later on `WO-N101`. | This selected member action did not produce approval. The legitimate approval control uses another object; it does not exhaust every member/approver/object combination. |
| H3: approval of a draft | Carol's approval request for `WO-N101` returns 409; a subsequent detail read still shows draft. Alice then submits that same object, Carol approves it, and a fresh Alice read shows approved. | The selected draft-state denial coexists with a functioning ordinary submission/approval path on the same object. This is stronger than a refusal status alone. |
| H4: selected foreign submission | Alice's submission request for Bob's `WO-S201` returns 404. Bob subsequently reads that exact object still in draft. | The selected foreign submission did not change the returned order. Bob's own successful submission of that same object was not exercised; symmetry is source-informed, not demonstrated. |
| H5: resubmission after approval | Alice's attempt to submit approved `WO-N101` returns 409; the subsequent detail read remains approved. | No state rollback was observed for that action. No downstream job, payment or duplicate execution exists in the evidence. |

The only demonstrated business-state changes are the **authorized synthetic** transitions of `WO-N101` from draft to submitted to approved. Displayed work-order budgets are fictional data; they are not payments, loss estimates or observed financial harm. The report correctly keeps hypothetical information disclosure, unauthorized approval and downstream disruption separate from these observations.

## Offline consistency checks

* All three recorded file digests match the retained manifest/evidence/results bytes. The manifest's app and runner SHA-256 values match the source files I reviewed. This establishes consistency with the supplied receipt, not trusted collection origin or protection from whole-package rewriting.
* I independently calculated the 21 status/content/state predicates from the preceding corrected package. The final package has the same case IDs, all 21 verdicts and the same corresponding status/value inputs. Their agreement was checked offline, alongside the final file/source digests.
* Final observation IDs are unique; the request method, path and observed principal of each observation match the corresponding server log entry in order. The setup nonce and session-creation requests are anonymous; the later `approver-profile` is Carol/north/approver.
* For the 20 nonsecret JSON observations, serializing the retained parsed value reproduces its recorded response-body digest. The HTML projection and redacted CSRF value are intentionally excluded from that reconstruction. Neither their omitted contents nor any raw HTTP header can be recovered or independently inspected from this package.
* For member approval, draft approval, foreign submission and repeated submission, I compared **all returned order fields**, not only `id` and `state`, with the saved prior object. They are unchanged. The runtime scorer itself checks the selected ID/state; the stronger offline field comparison is a reviewer observation over the retained projection.

The package says `appClosed: true`, and the reviewed runner awaits the owned app's `close()` before reading `isListening()`. I did not probe the socket. Treat this as the runner's cleanup observation and supporting source trace, not my independent confirmation of process or network quiescence.

## Objections and coverage that remain

There is no blocking contradiction in the final package's narrow conclusions. The following qualifications remain part of acceptance:

1. **The scorer is bounded.** Refusal predicates test status plus absence of the top-level `order`/`orders` fields. The actual retained refusals are error-only, so this run does not show a leak. Those predicates alone would not establish absence of sensitive content in every possible response field or representation. The state predicate also does not inspect undisclosed state or external effects.
2. **The interface supplies both the action and its state observation.** Follow-up reads are useful evidence, but there is no separate database, event consumer or effect sensor. No conclusion about all side effects, persistence or integration behavior follows.
3. **Role/state coverage is asymmetric.** Dana is unused. Bob's ordinary mutation flow, cross-tenant approver actions, other same-tenant members, alternate object states, session expiry/logout/revocation, browser behavior, concurrent actions and alternate encodings were not covered. The legitimate control is not evidence those other branches were attempted.
4. **This is familiar/source-assisted work.** The UI and code expose the ordinary workflow and fictional identity selection. The fixed script records preselected hypotheses and reason strings. It is not evidence that a runtime agent explored the app, selected unseen hypotheses, adapted after evidence or improved itself.
5. **Passing cases do not measure the detector.** No deliberately incorrect implementation or held-out target was used to test whether this scorer detects a real violation. No recall, precision, expert comparison, generalization or client readiness is measured.
6. **Execution limits have a specific meaning.** Time is checked before requests and the HTTP timeout measures inactivity. These are not a hard total deadline or a general load/cancellation guarantee. A future interrupted run needs explicit unvisited/unavailable coverage; its zero failed checks must never be read as a completed investigation.
7. **Evidence remains a projection.** Parsed JSON, same-app identity labels, body hashes and local file digests strengthen traceability, but do not authenticate the producer. Credential headers and the nonce are omitted. This is neither raw HTTP preservation nor a general secret-sanitization guarantee.

These are limits and follow-up requirements, not new vulnerability findings. No repair or repair retest is warranted by an unobserved flaw. Kotaro's manual verification remains a separate step and has not been inferred from this review.

## Research grounding and acceptance boundary

`service-delivery.instance-vs-class-repair` draws on `docs/research/assessment-evidence/executable-claims.md:5–9,19`: its component fixture shows why legitimate functionality and adjacent state sequences matter. The contrary qualification in `framework.md:69` accepts only the tested cases under the fixture hash, not every interface. The current run has no repair comparison, and that research is not evidence of a defect in this work-order app.

`service-delivery.small-service-exercise-template` draws on `docs/research/learning/labs/SERVICE-EXERCISE.md:26,30–55`: record overlapping roles, inspect contents rather than status alone, and retain functioning controls. This is a fictional service-design synthesis, not a completed client engagement or proof of reviewer independence.

`standards.claim-record-fields`, grounded in `docs/research/assessment-evidence/framework.md:34–49`, calls for explicit identity, policy, evidence, limits and revisable interpretations. Its design benefit remains unmeasured. The same study's `:5–15` protocol requires declared assistance, comparable access and preserved failures; source-assisted repeats cannot be counted as fresh blind trials.

The resulting acceptance is: **the retained observations support the five selected “not reproduced in these cases” dispositions and the successful ordinary stateful control.** They demonstrate an inspectable local guided sequence. They do not establish autonomous investigation, an absence of vulnerabilities, independent effect verification or a production security result.
