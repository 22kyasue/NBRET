# Rejecting abuse while preserving legitimate access

The [W3C Inaccessibility of CAPTCHA draft note,16December2021](https://www.w3.org/TR/2021/DNOTE-turingtest-20211216/) is work in progress, not an endorsed W3C Recommendation or a current vendor benchmark. On2026-10-17, reviewed its web-extracted status, accessibility challenge, visual/audio/logic/movement discussion, heuristics/limited-account discussion and conclusion. Linked studies, vendor implementations and the whole bibliography were not reviewed. No challenge was solved, bypassed or tested on a third-party service.

The draft explains that visual, auditory, motor, cognitive and language demands can exclude legitimate users. Adding audio does not provide equivalent access for everyone. Noninteractive methods can reduce interaction barriers but introduce privacy tradeoffs. Its conclusion calls for evidence-based proportionality, alternatives and monitoring; its limited-use-account discussion says thresholds need normal and exceptional user data. Treat historical product descriptions and quoted effectiveness figures as dated secondary assertions, not current measured accuracy here.

The evaluation design below is our proposed owned-system protocol. It has **not** been run as a human study and cannot establish accessibility conformance or real-world detector performance.

| Cohort or condition | Why it belongs in the oracle | Outcomes to record separately |
| --- | --- | --- |
| Legitimate users behind one shared egress | Address aggregation can exhaust a shared budget | False rejection, time to service, per-principal fairness |
| Legitimate user changing network/address | Address change is not necessarily authority change | Reauthentication frequency and successful continuity |
| Keyboard/screen-reader interaction | Mouse timing or visible-only fields can misclassify assistive use | Completion, focus/order errors, unnecessary challenges |
| Motor/cognitive/language variation | Speed and puzzle-solving are not universal | Abandonment, retries, time and accessible alternative completion |
| Privacy-restricted browser | Missing tracking signals need not mean abuse | Challenge/reject rates and ability to use an alternative |
| Authorized API/crawler/service worker | Legitimate automation is expected policy input | Scoped success, quota compliance and audit attribution |
| Authenticated abuse exceeding a budget | Valid credentials do not make all actions authorized | True rejection before effect and legitimate unaffected traffic |
| Unknown client, expired proof and revoked worker | Distinguish identity failure from behavior score | Reason code, effect prevention and recovery path |

Predefine the protected action and what counts as abuse before choosing thresholds. Keep an untouched evaluation cohort, include bursts and low-frequency legitimate outliers, and report counts/denominators alongside rates. Score rejection, challenge and delay separately: a challenge that never completes is not a successful allow. Track appeal/recovery completion and whether denial happened before the protected effect. A policy that blocks all clients can have perfect abuse rejection while providing no useful service.

Use volunteered, minimized accessibility feedback for a real study; do not infer disabilities from behavioral telemetry or require users to disclose them to obtain ordinary access. Store only identifiers needed for the bounded evaluation, document retention, and distinguish synthetic address labels from observed network sources. No such human data was collected here.

The existing quota and custom signed-request labs provide narrow reproducible checks for selected rows. They do not include disabled participants, actual assistive technologies, vendor challenges or field cohorts. Their passing results must not be promoted into this evaluation's missing outcomes. API credential paths and permission checks should remain explicit for authorized automation; a generic human-only challenge is not a workload identity system.
