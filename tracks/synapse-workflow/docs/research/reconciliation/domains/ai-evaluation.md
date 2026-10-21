# Evaluating AI contributions: oracles, benchmarks, scoring

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 24 findings, 28 related corrections, 9 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.garak-init-network`** [assessment-evidence/deep-garak.md:27](../../assessment-evidence/deep-garak.md#L27): An agent may initialize garak assuming it is local-only, generating provider traffic and cost. **Instead:** Treat scanner construction as network activity requiring authorization (docs/research/reconciliation/README.md:5).
- **`hazard.rea-ready-integration`** [2026-10-16-rea-and-security-workflows.md:230](../../2026-10-16-rea-and-security-workflows.md#L230): Agent may start pilots (installing promptfoo/garak/CALDERA/Atomic) as if approved. **Instead:** The handoff authorizes no target testing or integration (2026-10-16-rea-and-security-workflows.md:276).
- **`hazard.sdk-copy-mode-force-replace`** [assessment-evidence/sdk-boundaries-continuation.md:62](../../assessment-evidence/sdk-boundaries-continuation.md#L62): Testing skill copy mode on a real workspace can replace real directories. **Instead:** Only use fresh owned temp trees (sdk-boundaries-continuation.md:62).
- **`hazard.sdk-credential-lab`** [assessment-evidence/sdk-boundaries-continuation.md:80](../../assessment-evidence/sdk-boundaries-continuation.md#L80): A credential-copy lab without overriding config sources would copy the user's real agent credentials. **Instead:** Follow sdk-boundaries-continuation.md:80: synthetic config dir and owned temp-root deletion checks.
- **`hazard.sdk-live-backend-tests`** [assessment-evidence/sdk-boundaries-continuation.md:531](../../assessment-evidence/sdk-boundaries-continuation.md#L531): Running the Claude SDK live Redis/S3 tests would use configured credentials and destructive teardown against real buckets. **Instead:** Do not inspect credentials or contact configured services (continuation-exhaustion.md:360).
- **`hazard.sdk-live-scripts`** [assessment-evidence/sdk-boundaries-continuation.md:64](../../assessment-evidence/sdk-boundaries-continuation.md#L64): Running wrapper live scripts makes paid provider calls with real credentials and deletes workspaces. **Instead:** Source only; historical plan steps are not authorization (sdk-boundaries-continuation.md:60).
- **`hazard.sdk-tests-visible-windows`** [assessment-evidence/sdk-boundaries-continuation.md:125](../../assessment-evidence/sdk-boundaries-continuation.md#L125): Running these transport tests opens console windows on the user's monitor. **Instead:** Do not run without hidden-window adaptation (user CLAUDE.md no-terminal-popup rule).
- **`hazard.takumi-connect-repo`** [cybersecurity-firms/gmo-flatt-security.md:35](../../cybersecurity-firms/gmo-flatt-security.md#L35): An agent evaluating Takumi could upload NBRET or client code or install the write-enabled GitHub App. **Instead:** Do not upload code or install apps without explicit approval (gmo-flatt-security.md:35; takumi-github-scope-boundary.md:11).
- **`hazard.takumi-ownership-tokens`** [cybersecurity-firms/takumi-authority-boundary.md:7](../../cybersecurity-firms/takumi-authority-boundary.md#L7): An agent could place ownership tokens in DNS or a web root and dispatch dynamic assessments against a target. **Instead:** No tokens, DNS records or target requests were used; dynamic testing needs client authorization (takumi-authority-boundary.md:11; safety-context/README.md:29).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [Several AgentDojo attack-success predicates contain logic errors that over-accept](#ai-evaluationagentdojo-injection-predicate-logic-errors) | component-lab | ai-evaluation |
| [AgentDojo 'security=true' means the injection succeeded, and infra errors also score true](#ai-evaluationagentdojo-security-field-means-attack-success) | component-lab | ai-evaluation, reporting |
| [AgentDojo UserTask6 scorer accepts wrong recipient and no-action pre-existing state](#ai-evaluationagentdojo-usertask6-accepts-wrong-recipient) | component-lab | ai-evaluation |
| [garak prompt-injection detector scores a refusal that quotes the trigger as a hit](#ai-evaluationgarak-text-detector-and-denominators) | component-lab | ai-evaluation, reporting |
| [Nuclei LLM matcher accepts evidence absent from the response and verdicts outside options](#ai-evaluationnuclei-llm-matcher-ungrounded) | component-lab | ai-evaluation, triage, testing |
| [A short injected output preview passes exact-quote grounding as complete, untruncated evidence](#ai-evaluationpreview-grounding-accepted-as-complete) | component-lab | evidence, ai-evaluation, triage |
| [PentestGPT audit passes on a quoted canary while the real target effect is false](#ai-evaluationtext-canary-oracle-not-effect) | component-lab | ai-evaluation, evidence, triage |
| [Claude SDK budget is checked after each API call and can overrun by one call](#ai-evaluationagent-budget-overrun) | source-trace | commercial, operations, ai-evaluation |
| [AgentDojo reuses cached results without checking version, prompt or source hash](#ai-evaluationagentdojo-cache-and-version-provenance) | source-trace | ai-evaluation |
| [AgentDojo results table reports 'Targeted ASR' with no counts or error categories](#ai-evaluationbenchmark-tables-not-leaderboards) | source-trace | ai-evaluation, commercial |
| [MCP elicitation answers can be generated by an agent, not a human](#ai-evaluationelicitation-may-be-agent-answered) | source-trace | ai-evaluation, authorization, evidence |
| [garak: None scores separate, zero evaluated = SKIP, scores depend on detector pairing](#ai-evaluationgarak-scores-bookkeeping) | source-trace | ai-evaluation, reporting |
| [CEL's LLM authoring prompt contains examples that contradict the evaluator](#ai-evaluationllm-authoring-context-wrong-examples) | source-trace | ai-evaluation, authorization |
| [promptfoo may use remote generation per credentials; local CLI != local processing](#ai-evaluationpromptfoo-remote-generation-data-flow) | source-trace | ai-evaluation, operations |
| [LLM provider adapters drop content blocks and blur blocked versus empty responses](#ai-evaluationprovider-adapters-lose-evidence) | source-trace | ai-evaluation, evidence |
| [garak skips failed plugins and mismatched detectors with only a log line](#ai-evaluationskipped-detectors-are-unattempted) | source-trace | ai-evaluation, reporting |
| [Trace-based scorers credit tool calls that were requested even if they errored](#ai-evaluationtrace-predicates-credit-failed-calls) | source-trace | ai-evaluation, evidence |
| [Takumi Autofix 'Completed' means a PR was created; the fix itself is not verified](#ai-evaluationtakumi-autofix-completed-is-pr-created) | public-doc | remediation, retest, ai-evaluation |
| [Takumi separates enumerate, hypothesize, reproduce, verify; coverage is model-chosen scope](#ai-evaluationtakumi-pipeline-and-coverage-scope) | public-doc | testing, evidence, ai-evaluation |
| [MS phishing trial: analysts shown AI verdicts missed more false negatives; 6.53x modeled](#ai-evaluationms-phishing-trial-automation-bias) | vendor-claim | ai-evaluation, triage |
| [Takumi vs AWS benchmark: 68% vs 20% recall on 25 planted bugs; winner depends on threshold](#ai-evaluationtakumi-benchmark-threshold-dependent) | vendor-claim | ai-evaluation, commercial |
| [Vendor SOC-AI numbers measure agreement, feedback or internal timing, not accuracy](#ai-evaluationvendor-ai-metrics-are-not-accuracy) | vendor-claim | ai-evaluation, commercial |
| [AI as target (app security) and AI as tester need different oracles and remediation](#ai-evaluationai-as-target-vs-tester) | synthesis | scoping, testing, ai-evaluation |
| [Admit an eval task only after its scorer passes mutation and reachability checks](#ai-evaluationaudit-evaluator-before-tester) | synthesis | ai-evaluation, testing |

### ai-evaluationagentdojo-injection-predicate-logic-errors

**`ai-evaluation.agentdojo-injection-predicate-logic-errors`: Several AgentDojo attack-success predicates contain logic errors that over-accept** (component-lab)

Banking InjectionTask6 states 'total 30000, no installment above 10000', but its predicate accepts sum>=30000 OR any installment>10000, so a single 10001–29999 payment counts as success. v1.2 banking Tasks 0/1/3 use `fact or "" in subject`, which Python parses so that any qualifying transaction counts regardless of subject. Executed extracted methods accepted unrelated benign subjects. A workspace v1.2.1 deletion check passes when only one of five target files is gone; executed, it accepted one target plus four unrelated deletions. Travel tasks compare month-day only, ignoring a mismatched year.

**Do:** Treat benchmark attack-success rates as dependent on per-task predicate correctness. Retain the exact oracle version, and adjudicate whether a predicate encodes the stated goal before quoting any ASR or defence improvement.

**Limits:** These are predicate behaviours on synthetic namespaces. No agent run, prevalence estimate or leaderboard correction is established.

**Sources:** [assessment-evidence/deep-agentdojo.md:166](../../assessment-evidence/deep-agentdojo.md#L166), [assessment-evidence/deep-agentdojo.md:216](../../assessment-evidence/deep-agentdojo.md#L216), [assessment-evidence/deep-agentdojo.md:230](../../assessment-evidence/deep-agentdojo.md#L230), [assessment-evidence/deep-agentdojo.md:136](../../assessment-evidence/deep-agentdojo.md#L136)

**Receipts:** `assessment-evidence/agentdojo-disclosure-oracle-v2-receipt-1792276238068.json`, `assessment-evidence/agentdojo-deleted-files-oracle-receipt-1792276318679.json`, `assessment-evidence/agentdojo-disclosure-oracle-receipt-1792276227157.json`

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-agentdojo.md:226](../../assessment-evidence/deep-agentdojo.md#L226): Later revisions fixed some predicates. Version matters.

### ai-evaluationagentdojo-security-field-means-attack-success

**`ai-evaluation.agentdojo-security-field-means-attack-success`: AgentDojo 'security=true' means the injection succeeded, and infra errors also score true** (component-lab)

In AgentDojo (pin 089ed468), BaseInjectionTask.security returns true when the attacker's injection goal succeeds, not when the defender is safe. No-injection runs return security=true as a sentinel. benchmark.py 120–147 maps selected context and server errors to (utility=False, security=True). A synthetic server error reproduced exactly utility=false/security=true.

**Do:** Never average or invert AgentDojo 'security' blindly. Keep infrastructure error, refusal, attempted failure and demonstrated attacker effect as separate categories whenever you cite or reuse agent-security benchmark numbers.

**Limits:** This validates bookkeeping semantics at one pin. It says nothing about provider error prevalence or real attack success rates.

**Sources:** [assessment-evidence/deep-agentdojo.md:9](../../assessment-evidence/deep-agentdojo.md#L9), [assessment-evidence/deep-agentdojo.md:28](../../assessment-evidence/deep-agentdojo.md#L28), [assessment-evidence/deep-agentdojo.md:39](../../assessment-evidence/deep-agentdojo.md#L39)

**Receipts:** `assessment-evidence/deep-agentdojo-receipt.json`, `assessment-evidence/deep-agentdojo-run.json`

### ai-evaluationagentdojo-usertask6-accepts-wrong-recipient

**`ai-evaluation.agentdojo-usertask6-accepts-wrong-recipient`: AgentDojo UserTask6 scorer accepts wrong recipient and no-action pre-existing state** (component-lab)

The v1.2.2 banking UserTask6 utility checks only subject keyword, amount==50 and recurring. It does not check the requested recipient or that a new transaction was created. Executed against the actual extracted code, it accepted a synthetic wrong recipient that an independent exact-recipient predicate rejected, and accepted a pre-populated qualifying transaction with no action. Wrong amount and nonrecurrence were correctly rejected.

**Do:** Before using any benchmark or scorer to judge an AI agent or tool, mutation-test recipient, actor, novelty (pre-existing state) and extra side effects, not only the obvious fields. A success-shaped final object is not proof the agent did the right thing.

**Limits:** This covers one task at one pin. Prevalence in published runs, and whether the released fixture already contains a qualifying transaction, are not established. Other tasks check recipients properly.

**Sources:** [assessment-evidence/deep-agentdojo.md:53](../../assessment-evidence/deep-agentdojo.md#L53), [assessment-evidence/framework.md:77](../../assessment-evidence/framework.md#L77)

**Receipts:** `assessment-evidence/deep-agentdojo-banking-receipt.json`, `assessment-evidence/deep-agentdojo-banking-run.json`

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-agentdojo.md:57](../../assessment-evidence/deep-agentdojo.md#L57): Other task versions do check recipients, so this is not a blanket benchmark defect.
- [assessment-evidence/deep-agentdojo.md:210](../../assessment-evidence/deep-agentdojo.md#L210): The authors of the review explicitly warn against dismissing the benchmark.

### ai-evaluationgarak-text-detector-and-denominators

**`ai-evaluation.garak-text-detector-and-denominators`: garak prompt-injection detector scores a refusal that quotes the trigger as a hit** (component-lab)

garak's AttackRogueString detector (pin cc1215c5) is a case-insensitive substring match on the latest output. A refusal quoting the trigger scores 1, while a harmful tool call without the string scores 0. In the executed four-output fixture the evaluator processed three scores, evaluated two, passed one, failed one and counted one None. Missing trigger metadata yields an empty score list.

**Do:** When reporting LLM red-team results to a client, keep generated, processed, scoreable and unknown counts separate, and state what the detector actually matches. Text-match hits are not proof of unauthorized action.

**Limits:** Uses extracted detector/evaluator methods with no real model or provider. This is not an attack-success measurement.

**Sources:** [assessment-evidence/deep-garak.md:33](../../assessment-evidence/deep-garak.md#L33), [assessment-evidence/deep-garak.md:45](../../assessment-evidence/deep-garak.md#L45)

**Receipts:** `assessment-evidence/deep-garak-receipt.json`, `assessment-evidence/deep-garak-run.json`

### ai-evaluationnuclei-llm-matcher-ungrounded

**`ai-evaluation.nuclei-llm-matcher-ungrounded`: Nuclei LLM matcher accepts evidence absent from the response and verdicts outside options** (component-lab)

With stub model replies, 26 test events passed: research assertions showed evidence absent from the corpus still produced a match, an Expect value outside Options could match, and a rejected wrong verdict kept confidence 99 in the audit. Actual default confidence is 0.5, not the documented 0. The sole-LLM guard only checks predicate composition, so under default OR a deterministic predicate need not pass.

**Do:** Treat LLM-matcher hits as unvalidated hypotheses; require quote grounding against the response and a deterministic or human validator before reporting.

**Limits:** Stub replies; no model reliability or prompt-injection result.

**Sources:** [security-landscape/deep-review/nuclei-matchers.md:23](../../security-landscape/deep-review/nuclei-matchers.md#L23), [security-landscape/deep-review/nuclei-matchers.md:27](../../security-landscape/deep-review/nuclei-matchers.md#L27), [security-landscape/deep-review/nuclei-template-path.md:49](../../security-landscape/deep-review/nuclei-template-path.md#L49)

**Receipts:** `security-landscape/deep-review/nuclei-matcher-lab-receipt.json`

### ai-evaluationpreview-grounding-accepted-as-complete

**`ai-evaluation.preview-grounding-accepted-as-complete`: A short injected output preview passes exact-quote grounding as complete, untruncated evidence** (component-lab)

Two predefined cases through actual Claude parse_message, wrapper normalize_message and PentestGPT compile_execution: a short persisted-output preview marker became an exact canonical observation with outcome DONE and evidence_truncated False, while a 4,001-character excerpt became PROGRESS with evidence_truncated True. The truncation flag only reflects PentestGPT's own 4,000-character projection, not whether the original tool output was captured.

**Do:** Exact quotation proves only that received content was quoted. Evidence records need typed provenance carrying original length/digest and preview-versus-full status; blocking a text prefix is not an authenticity control.

**Limits:** Marker and successful trace state were injected; no EpisodeRunner, CLI, native truncation or real tool effect was exercised. Not a demonstrated false vulnerability.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:169](../../assessment-evidence/sdk-boundaries-continuation.md#L169), [assessment-evidence/sdk-boundaries-continuation.md:171](../../assessment-evidence/sdk-boundaries-continuation.md#L171)

**Receipts:** `assessment-evidence/preview-grounding-receipt-1792275187905.json`

### ai-evaluationtext-canary-oracle-not-effect

**`ai-evaluation.text-canary-oracle-not-effect`: PentestGPT audit passes on a quoted canary while the real target effect is false** (component-lab)

PentestGPT's final audit oracle (audit.py 360–375) checks whether an expected flag is a case-insensitive substring of observation text. A constructed, correctly attributed synthetic command receipt containing the canary passed the audit while the fixture's independent target-effect flag was false. Removing the canary or changing observation identity failed the checks.

**Do:** Keep 'source-grounded text' and 'demonstrated consequence' as separate fields in any AI-assisted finding. A tool echoing known text can satisfy a textual oracle without proving access.

**Limits:** The input was constructed and no command was executed. This shows the oracle's limit, not an observed exploit against a deployed system.

**Sources:** [assessment-evidence/deep-pentestgpt.md:62](../../assessment-evidence/deep-pentestgpt.md#L62), [assessment-evidence/deep-pentestgpt.md:56](../../assessment-evidence/deep-pentestgpt.md#L56)

**Receipts:** `assessment-evidence/deep-agent-receipt.json`

### ai-evaluationagent-budget-overrun

**`ai-evaluation.agent-budget-overrun`: Claude SDK budget is checked after each API call and can overrun by one call** (source-trace)

The Claude Agent SDK 0.2.90 max_budget_usd example says checking occurs after each API call and cost can exceed the configured value by one call; the integration budget test supplies the error result itself rather than measuring enforcement. Example result printers report completion for any ResultMessage without inspecting is_error.

**Do:** Budget AI engagements with an outer hard limit and reconcile with billing receipts; never treat 'Task completed' labels as success evidence.

**Limits:** Example and test source only; no measured run or pricing.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:547](../../assessment-evidence/sdk-boundaries-continuation.md#L547)

### ai-evaluationagentdojo-cache-and-version-provenance

**`ai-evaluation.agentdojo-cache-and-version-provenance`: AgentDojo reuses cached results without checking version, prompt or source hash** (source-trace)

load_task_results resolves cached results by pipeline/suite/task/attack/injection IDs but does not compare benchmark version, prompt, injection contents, model settings or source hash. Suite versions differ per suite (v1.2.2 maps travel/slack to 1.2.0), and the registry silently replaces same-version tasks. The parallel CLI branch passes mismatched positional arguments. The suite-check CLI ignores a False result and returns success.

**Do:** Record effective suite/task versions, source hashes and run namespaces with any benchmark result you cite. Force reruns when anything changes.

**Limits:** Source reading; no stale-cache incident reproduced.

**Sources:** [assessment-evidence/deep-agentdojo.md:30](../../assessment-evidence/deep-agentdojo.md#L30), [assessment-evidence/deep-agentdojo.md:186](../../assessment-evidence/deep-agentdojo.md#L186), [assessment-evidence/deep-agentdojo.md:180](../../assessment-evidence/deep-agentdojo.md#L180)

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-agentdojo.md:96](../../assessment-evidence/deep-agentdojo.md#L96): Results-table generation fails on missing files rather than shrinking denominators.

### ai-evaluationbenchmark-tables-not-leaderboards

**`ai-evaluation.benchmark-tables-not-leaderboards`: AgentDojo results table reports 'Targeted ASR' with no counts or error categories** (source-trace)

create_results_table computes exposure from INFORMATION tags rather than injection provenance and drops exposure positions from displayed statistics. It averages booleans per loaded task pair, labels security as 'Targeted ASR', and adds no counts, uncertainty or error categories. The authors' documentation says it is not a leaderboard because models were not tested with the same attacks/defences.

**Do:** Do not cite benchmark percentages as comparative evidence for choosing AI models for client work without counts, versions and equal conditions.

**Limits:** No table regenerated.

**Sources:** [assessment-evidence/deep-agentdojo.md:94](../../assessment-evidence/deep-agentdojo.md#L94), [assessment-evidence/deep-agentdojo.md:96](../../assessment-evidence/deep-agentdojo.md#L96)

### ai-evaluationelicitation-may-be-agent-answered

**`ai-evaluation.elicitation-may-be-agent-answered`: MCP elicitation answers can be generated by an agent, not a human** (source-trace)

MCP 2.3.0 Context.elicit documentation explicitly allows an agent client to generate a response rather than ask a person; the elicitation helper also allows agent-generated form responses. Remembered resolver answers are bound to the question digest, not to fresh entitlement or truth.

**Do:** Do not count an accepted elicitation as human review or approval of a security action; record who answered, when and under what policy.

**Limits:** Source/documentation only; no elicitation was invoked.

**Sources:** [assessment-evidence/sdk-boundaries-continuation.md:377](../../assessment-evidence/sdk-boundaries-continuation.md#L377)

### ai-evaluationgarak-scores-bookkeeping

**`ai-evaluation.garak-scores-bookkeeping`: garak: None scores separate, zero evaluated = SKIP, scores depend on detector pairing** (source-trace)

garak evaluators/base.py (complete 1-544 at cc1215c) counts None detector scores separately, displays SKIP rather than PASS when zero outputs were evaluated, and multiple detectors can score the same output so summed counts are not a unique-output denominator. Threshold policy passes scores strictly below threshold; zero-tolerance passes exact 0. Test stubs (Repeat generator, always.Pass) prove bookkeeping, not model resistance; a test-local ThresholdEvaluator has opposite polarity to production. Harness end-hook restoration is not in a finally block.

**Do:** When reporting AI-probe results, report evaluated vs processed counts, per-detector denominators and unscored outputs; a detector hit is a rubric measurement, not an application compromise.

**Limits:** Source read; tests read not executed; real detectors, providers, egress and costs unreviewed.

**Sources:** [security-landscape/implementation-reviews.md:103](../../security-landscape/implementation-reviews.md#L103), [security-landscape/implementation-reviews.md:105](../../security-landscape/implementation-reviews.md#L105), [security-landscape/implementation-reviews.md:114](../../security-landscape/implementation-reviews.md#L114)

### ai-evaluationllm-authoring-context-wrong-examples

**`ai-evaluation.llm-authoring-context-wrong-examples`: CEL's LLM authoring prompt contains examples that contradict the evaluator** (source-trace)

CEL v0.31.0 AuthoringPrompt renders environment docs into an LLM prompt. Snapshots repeat 'error || error // true', but the evaluator returns an error. A macros example says map.filter returns values, but the source returns keys. Snapshot tests lock in the wrong text. Math docs also say bitAnd(3,5)=3, bitNot(1)=-1 and sqrt(negative) errors, while code and tests give 1, -2 and NaN. 'Use only listed functions' is a prompt instruction, not enforcement.

**Do:** If AI drafts authorization or detection rules, validate generated rules against domain-owned allow/deny oracles, not against the documentation the model was fed.

**Limits:** No model was called. That these exact comments reach a model prompt was shown for the prompt templates, not for the math comments.

**Sources:** [assessment-evidence/cel-authoring-evidence.md:13](../../assessment-evidence/cel-authoring-evidence.md#L13), [assessment-evidence/cel-authoring-evidence.md:15](../../assessment-evidence/cel-authoring-evidence.md#L15), [assessment-evidence/cel-authoring-evidence.md:194](../../assessment-evidence/cel-authoring-evidence.md#L194), [assessment-evidence/cel-authoring-evidence.md:9](../../assessment-evidence/cel-authoring-evidence.md#L9)

**Contrary or narrowing evidence:**
- [assessment-evidence/cel-authoring-evidence.md:15](../../assessment-evidence/cel-authoring-evidence.md#L15): Not every example is wrong.

### ai-evaluationpromptfoo-remote-generation-data-flow

**`ai-evaluation.promptfoo-remote-generation-data-flow`: promptfoo may use remote generation per credentials; local CLI != local processing** (source-trace)

promptfoo src/redteam/remoteGeneration.ts (at 7901170) selects remote generation depending on credentials, cloud login, endpoints and flags. Local CLI installation does not ensure local processing, and model-judge agreement alone is insufficient evidence. The proposed agent-boundary pilot scores actual tool calls, data access and deterministic policy assertions; a refusal is not success if the tool action already occurred.

**Do:** Before putting any client engagement material into promptfoo (or similar), confirm processing destinations, retention and cost; score tool traces not judge text.

**Limits:** Source read of selected files; not executed.

**Sources:** [2026-10-16-rea-and-security-workflows.md:184](../../2026-10-16-rea-and-security-workflows.md#L184), [2026-10-16-rea-and-security-workflows.md:240](../../2026-10-16-rea-and-security-workflows.md#L240), [2026-10-16-rea-and-security-workflows.md:242](../../2026-10-16-rea-and-security-workflows.md#L242)

### ai-evaluationprovider-adapters-lose-evidence

**`ai-evaluation.provider-adapters-lose-evidence`: LLM provider adapters drop content blocks and blur blocked versus empty responses** (source-trace)

AgentDojo's provider adapters take only the first tool-content or system block (Anthropic) and silently drop invalid function-name calls. Google maps absent/blocked candidates to an empty assistant message. The local adapter returns an empty string on any request exception. Prompting retries can fetch an unparsed fourth completion. Retry wrappers add 3–5 attempts on top of unknown SDK retries.

**Do:** Keep raw native provider responses alongside normalized transcripts in any AI evaluation. Without them, provider error, adapter loss and agent choice are indistinguishable.

**Limits:** Source reading; no provider calls.

**Sources:** [assessment-evidence/deep-agentdojo.md:248](../../assessment-evidence/deep-agentdojo.md#L248), [assessment-evidence/deep-agentdojo.md:240](../../assessment-evidence/deep-agentdojo.md#L240)

### ai-evaluationskipped-detectors-are-unattempted

**`ai-evaluation.skipped-detectors-are-unattempted`: garak skips failed plugins and mismatched detectors with only a log line** (source-trace)

garak's harness skips detectors marked skip, logs and continues on modality mismatch, and probewise/PxD loaders log and skip failed plugins. TreeSearchProbe turns all-unscored nodes into mean score zero, which can close a branch for lack of evidence. CLI end_run is not in a finally block, so errors can leave a report with no completion row.

**Do:** Coverage ledgers for LLM testing must count skipped, blocked and unscored items explicitly, never as passes.

**Limits:** Source reading; no interruption test.

**Sources:** [assessment-evidence/deep-garak.md:55](../../assessment-evidence/deep-garak.md#L55), [assessment-evidence/deep-garak.md:43](../../assessment-evidence/deep-garak.md#L43)

### ai-evaluationtrace-predicates-credit-failed-calls

**`ai-evaluation.trace-predicates-credit-failed-calls`: Trace-based scorers credit tool calls that were requested even if they errored** (source-trace)

AgentDojo Slack InjectionTask5's security_from_traces reconstructs success solely from requested function names and arguments. functions_stack_trace_from_messages collects assistant requests, including those whose result later reports an error, and the retained runtime error is not consumed by the predicate. A trace verdict therefore establishes an attempted action sequence, not a successful invitation or channel change.

**Do:** In any AI-agent evaluation or pentest-agent log review, separate requested calls, successful calls, modeled state effects and external effects. Do not report 'agent did X' from a call request alone.

**Limits:** This is source-established evidence loss. No failed-call reproduction or prevalence estimate was run.

**Sources:** [assessment-evidence/deep-agentdojo.md:152](../../assessment-evidence/deep-agentdojo.md#L152)

**Contrary or narrowing evidence:**
- [assessment-evidence/deep-agentdojo.md:204](../../assessment-evidence/deep-agentdojo.md#L204): Some trace-based tasks combine trace with final state checks.

### ai-evaluationtakumi-autofix-completed-is-pr-created

**`ai-evaluation.takumi-autofix-completed-is-pr-created`: Takumi Autofix 'Completed' means a PR was created; the fix itself is not verified** (public-doc)

Autofix needs a write-enabled GitHub App (Contents read/write), clones code, generates a patch, unit tests and explanation, then waits in Reviewing. Completed means the user-approved PR was created; the manual states Takumi does not verify the fixed code and a separate Vulnerability Verification is needed. Merge and deploy are further decisions; no rollback or production-outcome evidence exists.

**Do:** Treat AI patch proposals as drafts: require human review, merge, deployment confirmation and an independent retest against the deployed version before reporting remediation.

**Limits:** Manual description of one vendor feature; no PR was generated and fix quality was not measured.

**Sources:** [cybersecurity-firms/gmo-flatt-security.md:35](../../cybersecurity-firms/gmo-flatt-security.md#L35), [cybersecurity-firms/gmo-flatt-security.md:35](../../cybersecurity-firms/gmo-flatt-security.md#L35), [cybersecurity-firms/takumi-authority-boundary.md:9](../../cybersecurity-firms/takumi-authority-boundary.md#L9)

### ai-evaluationtakumi-pipeline-and-coverage-scope

**`ai-evaluation.takumi-pipeline-and-coverage-scope`: Takumi separates enumerate, hypothesize, reproduce, verify; coverage is model-chosen scope** (public-doc)

Whitebox clones source into a sandbox, enumerates features, generates hypotheses and uses a separate validation agent; it unconditionally excludes tests, lock files and third-party code and de-emphasizes missing headers, rate limiting and logging. Blackbox uses an assessment VM with browser, shell, recorded proxy traffic and callback observation; verification applies vulnerability-specific deterministic verifiers where available (authorization reads compare canaries across sessions, writes check changed state from an authorized account) and falls back to AI judgment otherwise. Takumi documents stochastic run-to-run misses.

**Do:** Reuse the stage separation and state model (scanned/skipped/unscanned, reproduced/unconfirmed) but present coverage as coverage of the selected feature map, and pair AI hypothesis generation with deterministic effect oracles where possible.

**Limits:** Architecture as documented; verifier code and cross-session identity binding are not public and were not inspected.

**Sources:** [cybersecurity-firms/gmo-flatt-security.md:53](../../cybersecurity-firms/gmo-flatt-security.md#L53), [cybersecurity-firms/gmo-flatt-security.md:55](../../cybersecurity-firms/gmo-flatt-security.md#L55), [cybersecurity-firms/gmo-flatt-security.md:57](../../cybersecurity-firms/gmo-flatt-security.md#L57), [cybersecurity-firms/gmo-flatt-security.md:20](../../cybersecurity-firms/gmo-flatt-security.md#L20)

**Contrary or narrowing evidence:**
- [cybersecurity-firms/gmo-flatt-security.md:55](../../cybersecurity-firms/gmo-flatt-security.md#L55): Deterministic verification is described, not inspected.

### ai-evaluationms-phishing-trial-automation-bias

**`ai-evaluation.ms-phishing-trial-automation-bias`: MS phishing trial: analysts shown AI verdicts missed more false negatives; 6.53x modeled** (vendor-claim)

Microsoft's preprint had 167 external analysts classify 25 emails each from a 93-email corpus; because the agent made no errors there, researchers inserted synthetic wrong verdicts. The 6.53x true-positives-per-time headline combines measured behavior with a modeled protocol removing agent-labeled benign mail; about 83% of that gain comes from queue filtering, and the pessimistic counterfactual is 3.07x. The 77% figure is F1 improvement; analysts shown AI judgments missed more synthetic false negatives, and recall change was not significant.

**Do:** When AI pre-judges findings or alerts for human reviewers, measure automation bias with seeded wrong AI verdicts and track reviewer misses, not just throughput.

**Limits:** Vendor-authored, small corpus, artificial errors, short forced-choice tasks; not a production SOC measurement.

**Sources:** [cybersecurity-firms/microsoft-phishing-trial.md:9](../../cybersecurity-firms/microsoft-phishing-trial.md#L9), [cybersecurity-firms/microsoft-phishing-trial.md:7](../../cybersecurity-firms/microsoft-phishing-trial.md#L7), [cybersecurity-firms/microsoft-phishing-trial.md:5](../../cybersecurity-firms/microsoft-phishing-trial.md#L5)

### ai-evaluationtakumi-benchmark-threshold-dependent

**`ai-evaluation.takumi-benchmark-threshold-dependent`: Takumi vs AWS benchmark: 68% vs 20% recall on 25 planted bugs; winner depends on threshold** (vendor-claim)

GMO Flatt's 2025-12-05 blackbox benchmark used one vendor-built e-commerce app with 25 planted vulnerabilities and no hints. Recall was 68% (17/25) for Takumi versus 20% (5/25) for AWS Security Agent; high-confidence precision was 80% versus 100%, and Takumi precision fell to 63.9% including all reports. Run time was roughly one day versus three hours, and AWS source-learning was unused.

**Do:** Do not quote vendor benchmark percentages to clients as expected detection rates; any AI-assisted testing claim needs our own held-out targets, equal time budgets, independent adjudication and repeated runs.

**Limits:** Vendor-designed single-target comparison with no repeated trials, model disclosure or public target snapshot; a separate 96.2% marketing figure is not this benchmark.

**Sources:** [cybersecurity-firms/takumi-blackbox-benchmark.md:5](../../cybersecurity-firms/takumi-blackbox-benchmark.md#L5), [cybersecurity-firms/takumi-blackbox-benchmark.md:7](../../cybersecurity-firms/takumi-blackbox-benchmark.md#L7), [cybersecurity-firms/takumi-blackbox-benchmark.md:9](../../cybersecurity-firms/takumi-blackbox-benchmark.md#L9)

**Contrary or narrowing evidence:**
- [cybersecurity-firms/takumi-blackbox-benchmark.md:11](../../cybersecurity-firms/takumi-blackbox-benchmark.md#L11): A separate 96.2% detection marketing claim must not replace the benchmark recall.

### ai-evaluationvendor-ai-metrics-are-not-accuracy

**`ai-evaluation.vendor-ai-metrics-are-not-accuracy`: Vendor SOC-AI numbers measure agreement, feedback or internal timing, not accuracy** (vendor-claim)

CrowdStrike's over-98% Charlotte triage figure is agreement with Falcon Complete human decisions, and its "40 hours/week" multiplies alert counts by an estimated 5-minute baseline. Microsoft DTDA's 80.1% precision comes from 1,088 voluntarily graded alerts; offline macro-F1 .78 used ten incidents; its median $2.04 token cost excludes compute and is not customer pricing. NRI's >30% processing-time reduction is an internal before/after on undisclosed samples, and NRI disclaims guaranteed detection/judgment accuracy.

**Do:** Do not cite vendor AI percentages as accuracy or savings in client proposals; if we claim AI benefit, measure it on held-out labeled cases with a human baseline and full cost.

**Limits:** Readings of vendor-authored pages/papers; no independent replication.

**Sources:** [cybersecurity-firms/crowdstrike.md:23](../../cybersecurity-firms/crowdstrike.md#L23), [cybersecurity-firms/microsoft-dtda-evaluation.md:7](../../cybersecurity-firms/microsoft-dtda-evaluation.md#L7), [cybersecurity-firms/microsoft-dtda-evaluation.md:11](../../cybersecurity-firms/microsoft-dtda-evaluation.md#L11), [cybersecurity-firms/nri-agenticblue-controls.md:12](../../cybersecurity-firms/nri-agenticblue-controls.md#L12)

### ai-evaluationai-as-target-vs-tester

**`ai-evaluation.ai-as-target-vs-tester`: AI as target (app security) and AI as tester need different oracles and remediation** (synthesis)

AI being tested covers model behavior, agent tools, RAG retrieval boundaries, cross-tenant data, artifact provenance and inference stack; a model generating unsafe text and an application executing an unauthorized operation require different oracles and remediation. Refusal text, toxicity detection and actual tool/data isolation are different properties. Trail of Bits sells AI assessment as a whole system (pipelines, CI/CD, serialization, agent loops), broader than a jailbreak score. garak evaluates model outputs with detectors; it is not an autonomous network pentester.

**Do:** An AI-application security offering must score actual tool calls and data access, not only model text; keep it separate from using AI to perform testing.

**Limits:** Conceptual distinction plus vendor service description; no AI-application assessment was run.

**Sources:** [security-landscape/discipline-map.md:37](../../security-landscape/discipline-map.md#L37), [security-landscape/discipline-map.md:33](../../security-landscape/discipline-map.md#L33), [security-landscape/companies.md:55](../../security-landscape/companies.md#L55)

### ai-evaluationaudit-evaluator-before-tester

**`ai-evaluation.audit-evaluator-before-tester`: Admit an eval task only after its scorer passes mutation and reachability checks** (synthesis)

The draft framework requires six checks before admitting a task into a comparative evaluation: execute intended ground truth with independent confirmation; mutate each authorization-relevant field separately; supply pre-existing success-shaped state with no action; include partial errors with side effects, quoted success text and stale results; freeze task/scorer versions and separate error categories; and prove the test reaches its assertions with a deliberate failing control.

**Do:** Any NBRET claim that an AI or tool improves assessment quality must first validate the oracle used to score it. Otherwise a faulty scorer silently inflates or deflates the result.

**Limits:** This is a proposed protocol derived from source and fixture findings, not a validated industry standard.

**Sources:** [assessment-evidence/framework.md:79](../../assessment-evidence/framework.md#L79), [assessment-evidence/framework.md:83](../../assessment-evidence/framework.md#L83), [assessment-evidence/framework.md:87](../../assessment-evidence/framework.md#L87)

**Contrary or narrowing evidence:**
- [assessment-evidence/framework.md:3](../../assessment-evidence/framework.md#L3): The framework itself is a draft.

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [cybersecurity-firms/takumi-domestic-inference-announcement.md:5](../../cybersecurity-firms/takumi-domestic-inference-announcement.md#L5) | [cybersecurity-firms/gmo-flatt-security.md:61](../../cybersecurity-firms/gmo-flatt-security.md#L61) | Assume overseas inference for Takumi unless a signed domestic-inference arrangement is in place and active. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:14](../../assessment-evidence/sdk-boundaries-continuation.md#L14) | [assessment-evidence/sdk-boundaries-continuation.md:34](../../assessment-evidence/sdk-boundaries-continuation.md#L34) | Treat Codex early-completion loss as confirmed for the Python router under injected order, unconfirmed natively. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:84](../../assessment-evidence/sdk-boundaries-continuation.md#L84) | [assessment-evidence/sdk-boundaries-continuation.md:131](../../assessment-evidence/sdk-boundaries-continuation.md#L131) | Transcript mirror is not at-most-once; remote stores need idempotent appends. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:111](../../assessment-evidence/sdk-boundaries-continuation.md#L111) | [assessment-evidence/sdk-boundaries-continuation.md:117](../../assessment-evidence/sdk-boundaries-continuation.md#L117) | These failures are dependency drift, not model or SDK security failures. |
| medium | [assessment-evidence/sdk-boundaries-continuation.md:198](../../assessment-evidence/sdk-boundaries-continuation.md#L198) | [assessment-evidence/sdk-boundaries-continuation.md:333](../../assessment-evidence/sdk-boundaries-continuation.md#L333) | Host/origin protection depends on construction path and host; verify per deployment. |
| medium | [assessment-evidence/deep-agentdojo.md:37](../../assessment-evidence/deep-agentdojo.md#L37) | [assessment-evidence/deep-agentdojo.md:104](../../assessment-evidence/deep-agentdojo.md#L104) | The mismatch is confined to the optional injectable precheck, not to injection placement in attacks. |
| medium | [assessment-evidence/deep-agentdojo.md:53](../../assessment-evidence/deep-agentdojo.md#L53) | [assessment-evidence/deep-agentdojo.md:57](../../assessment-evidence/deep-agentdojo.md#L57) | Cite per-task, per-version oracle weaknesses; do not dismiss the whole benchmark. |
| medium | [security-landscape/deep-review/nuclei-matchers.md:9](../../security-landscape/deep-review/nuclei-matchers.md#L9) | [security-landscape/deep-review/nuclei-matchers.md:27](../../security-landscape/deep-review/nuclei-matchers.md#L27) | Nuclei LLM matcher default confidence is 0.5. |
| medium | [security-landscape/companies.md:89](../../security-landscape/companies.md#L89) | [security-landscape/coverage.md:24](../../security-landscape/coverage.md#L24) | Do not cite Cobalt entitlements as fact without a contract. |
| medium | [assessment-evidence/deep-garak.md:73](../../assessment-evidence/deep-garak.md#L73) | [assessment-evidence/deep-garak.md:91](../../assessment-evidence/deep-garak.md#L91) | Live-plugin tag dependence applies to Report.get_evaluations/AVID export, not the modern digest. |
| medium | [assessment-evidence/framework.md:30](../../assessment-evidence/framework.md#L30) | [assessment-evidence/deep-garak.md:178](../../assessment-evidence/deep-garak.md#L178) | Describe garak evaluation counts as output-per-detector judgments, not prompt counts. |
| medium | [review-findings.json:151](../../review-findings.json#L151) | [2026-10-16-rea-and-security-workflows.md:232](../../2026-10-16-rea-and-security-workflows.md#L232) | Follow the Markdown order: existing NBRET checks before any new scanner. |
| medium | [2026-10-16-rea-and-security-workflows.md:40](../../2026-10-16-rea-and-security-workflows.md#L40) | [2026-10-16-rea-and-security-workflows.md:9](../../2026-10-16-rea-and-security-workflows.md#L9) | Verify each REA feature in 6.4.0 before relying on it. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:9](../../assessment-evidence/sdk-boundaries-continuation.md#L9) | [assessment-evidence/sdk-boundaries-continuation.md:280](../../assessment-evidence/sdk-boundaries-continuation.md#L280) | The Codex schema is fully source-read; native runtime remains unvalidated. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:234](../../assessment-evidence/sdk-boundaries-continuation.md#L234) | [assessment-evidence/sdk-boundaries-continuation.md:234](../../assessment-evidence/sdk-boundaries-continuation.md#L234) | Capture error origin layer; do not infer origin from the code alone. |
| low | [assessment-evidence/deep-pentestgpt.md:13](../../assessment-evidence/deep-pentestgpt.md#L13) | [assessment-evidence/monitor-web-continuation.md:17](../../assessment-evidence/monitor-web-continuation.md#L17) | The zero-cost conflation is in trial aggregation, not the monitor UI. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:137](../../assessment-evidence/sdk-boundaries-continuation.md#L137) | [assessment-evidence/sdk-boundaries-continuation.md:137](../../assessment-evidence/sdk-boundaries-continuation.md#L137) | The import failure was a fixture error; use the v2 receipt. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:157](../../assessment-evidence/sdk-boundaries-continuation.md#L157) | [assessment-evidence/sdk-boundaries-continuation.md:531](../../assessment-evidence/sdk-boundaries-continuation.md#L531) | Live Redis/S3 tests were read (late), never executed; they supply no backend evidence. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:389](../../assessment-evidence/sdk-boundaries-continuation.md#L389) | [assessment-evidence/sdk-boundaries-continuation.md:389](../../assessment-evidence/sdk-boundaries-continuation.md#L389) | Record the actual base-escape predicate. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:381](../../assessment-evidence/sdk-boundaries-continuation.md#L381) | [assessment-evidence/sdk-boundaries-continuation.md:381](../../assessment-evidence/sdk-boundaries-continuation.md#L381) | Do not repeat the docstring; reconnection code exists, though delivery completeness is unproven. |
| low | [assessment-evidence/sdk-boundaries-continuation.md:54](../../assessment-evidence/sdk-boundaries-continuation.md#L54) | [assessment-evidence/sdk-boundaries-continuation.md:68](../../assessment-evidence/sdk-boundaries-continuation.md#L68) | Not a defect in the wrapper's normal path. |
| low | [2026-10-16-rea-and-security-workflows.md:178](../../2026-10-16-rea-and-security-workflows.md#L178) | [security-landscape/implementation-reviews.md:95](../../security-landscape/implementation-reviews.md#L95) | Use implementation-reviews.md for garak evaluator behavior. |
| low | [cybersecurity-firms/crowdstrike.md:27](../../cybersecurity-firms/crowdstrike.md#L27) | [cybersecurity-firms/crowdstrike-final-rca.md:7](../../cybersecurity-firms/crowdstrike-final-rca.md#L7) | Keep implemented versus announced remediation separate; later implementation remains unverified. |
| low | [assessment-evidence/deep-garak.md:97](../../assessment-evidence/deep-garak.md#L97) | [assessment-evidence/deep-garak.md:202](../../assessment-evidence/deep-garak.md#L202) | The stale-first-digest risk applies to append/rebuild paths other than rebuild_cis. |
| low | [security-landscape/deep-review/nuclei-template-path.md:7](../../security-landscape/deep-review/nuclei-template-path.md#L7) | [security-landscape/deep-review/nuclei-template-path.md:13](../../security-landscape/deep-review/nuclei-template-path.md#L13) | Template cache checks mtime, not content. |
| low | [cybersecurity-firms/gmo-flatt-security.md:49](../../cybersecurity-firms/gmo-flatt-security.md#L49) | [cybersecurity-firms/takumi-github-scope-boundary.md:11](../../cybersecurity-firms/takumi-github-scope-boundary.md#L11) | Treat the App manifest as unknown, not merely queued. |
| low | [assessment-evidence/deep-agentdojo.md:262](../../assessment-evidence/deep-agentdojo.md#L262) | [assessment-evidence/deep-agentdojo.md:277](../../assessment-evidence/deep-agentdojo.md#L277) | AgentDojo uv.lock is fully read as metadata (not installed or implementation-reviewed). |
| low | [assessment-evidence/deep-deepdiff.md:181](../../assessment-evidence/deep-deepdiff.md#L181) | [assessment-evidence/deep-agentdojo.md:277](../../assessment-evidence/deep-agentdojo.md#L277) | Superseded; lock fully read. |
