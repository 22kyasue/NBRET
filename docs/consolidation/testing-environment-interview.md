# Testing-environment design interview

Kotaro and Cass. Started 2026-10-20 Pacific; updated 2026-10-21. This records decisions and open questions, not completed implementation, a benchmark answer key or a live execution grant.

## Confirmed decisions

| Topic | Kotaro's answer | Design consequence |
| --- | --- | --- |
| Primary objectives | Choose useful tools and improve discovery capability (initial interview options 1 and 2). | Evaluate tool combinations and iterate on measured misses/false claims. |
| Engagement context | A client e-commerce system; a digital twin is being prepared but is not yet available. Database involvement is uncertain. | Use an owned practice environment while the twin is unavailable. Do not assume direct database access. |
| Schedule | Report intended for professional-company review; later clarification says no exact deadline or strict timeline is needed now. | Do not impose an invented delivery date or fixed schedule. |
| Permitted effects | Corrected “everything prohibited” to “everything permitted” within the eventual test environment. | Record as intended broad isolated-test scope; actual target boundaries and external services remain to be established before execution. Existing Shopify/live/stopped-work restrictions are unchanged. |
| Successful discovery | Level 3: demonstrated violation, retained evidence, affected conditions, business consequence, repair guidance and repeatable verification steps. | Plausible leads remain separate and do not count as successful discoveries. Actual repair/retest is a separate later exercise. |
| Autonomy | Option 1: autonomous inside one agreed scope. | Define target/effects/budgets/stopping once; enforce them outside the model and retain an action history. No per-test prompt by default inside the admitted lab. |
| Starting access | Only the digital-twin URL; no company-supplied accounts. | Agent must discover registration, create its own test account, establish ordinary capabilities and investigate additional access from observed evidence. No assumption of an administrator ladder or planted weakness. |
| Email | Option 1: dedicated test inbox the agent can read. | Support normal registration/verification and appropriate account-recovery flows using the dedicated test identity. No inbox/provider/domain or credentials have been supplied or selected yet. |
| Product shape | A reusable security research lab where Kotaro and agents formulate hypotheses/strategies, test them and build know-how across e-commerce, web apps and later target families. | E-commerce is an initial use case, not a permanently fixed target schema or an exhaustive application specification. |
| Agent-written helpers | Option 2: agents may write and run new test helpers inside the admitted lab. | Helpers inherit boundaries; agents do not silently change platform code, permissions or scoring. |
| Experiment environments | Option 3: support both supplied applications and generated disposable environments. | Generated scenarios support method development; held-out discovery requires investigator/answer separation. |
| Interview continuity | Check prior decision-making/grill-me-like documents before asking further questions. | Reconcile recorded decisions and ask only genuinely open consequential questions. Do not restart design discovery. |

## Interpretation kept separate from user decisions

Legitimate registration/account transitions and an unauthorized privilege escalation are different outcomes. Any claimed escalation still needs level-3 evidence. No findings are required for a completed investigation. Inbox access does not authorize reading unrelated mail, using personal accounts, contacting third parties or bypassing verification controls. No inbox has been provisioned or accessed.

The earlier suggestion of two supplied shopper accounts was not selected. The agent may need multiple self-created identities to establish legitimate comparison cases; whether and how many it may create remains an open scope decision.

## Open design questions

1. Which narrow experiment first demonstrates the broader research-lab workflow? Product breadth and supplied/generated environment support are settled; do not ask again whether the platform is only an account demo/store/marketplace.
2. How may the agent obtain additional comparison identities, and what account/transaction limits apply?
3. What test inbox/provider/domain is available, how are credentials isolated and messages correlated, and which external mail operations are permitted?
4. Which legitimate application flows and effect classes should the first benchmark score? No hidden weakness counts/answers belong here.
5. How are normal versus elevated capabilities established from observations and owner-declared business rules?
6. Inventory and verify which available runtime can enforce the already required target, filesystem, provider and answer-custody boundaries. Do the engineering investigation before asking for a technology preference.
7. Implement/admit the scorer/evidence/adjudication and stopping contracts already specified in the October 18 evaluation-admission/completion records; choose concrete experiment-specific limits and reset observations. Do not re-ask whether evidence, frozen evaluation or bounded stopping are wanted.
8. Which tool arms run with matched URL-only access, and what evidence imports must be built?
9. How do we implement the already agreed separation between held-out evaluation, guided learning and familiar regression? The need for those modes is not an open preference question.

## Existing context

Start with [CONTEXT](../../CONTEXT.md), [benchmark proposal](benchmark-plan.md) and [ARTEX deep dive](artex-deep-dive.md). These interview decisions refine that proposal; they do not imply a sandbox or hidden benchmark has been built. Continue one consequential question at a time, explain tradeoffs in plain English, and update this record as answers arrive.
