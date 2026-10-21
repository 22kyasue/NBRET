# Defensive response: EDR/MDR actions, approval, containment

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 17 findings, 33 related corrections, 17 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.anti-blocking-advice`** [bots-swarms/continuation.md:1035](../../bots-swarms/continuation.md#L1035): Adopting evasion/IP-rotation advice for client crawling. **Instead:** Identify crawlers and use negotiated quotas; docs/research/bots-swarms/model.md:60 (study, not operational evasion).
- **`hazard.atomic-technique-execution`** [cybersecurity-firms/splunk-lsass-source.md:21](../../cybersecurity-firms/splunk-lsass-source.md#L21): An agent validating the LSASS detection could execute the credential-dumping Atomic technique. **Instead:** Do not execute attack techniques outside an authorized lab (splunk-lsass-source.md:23; safety-context/README.md:29).
- **`hazard.atomic-whatif-as-dry-run`** [assessment-evidence/deep-atomic.md:38](../../assessment-evidence/deep-atomic.md#L38): An agent may assume -WhatIf is a safe dry run on a real endpoint. **Instead:** Do not run Atomic tests on this PC or client endpoints without explicit approval (docs/research/assessment-evidence/implementations.md:25).
- **`hazard.continuation-next-step`** [bots-swarms/continuation.md:2463](../../bots-swarms/continuation.md#L2463): Outdated next-step instruction; the work is done. **Instead:** Reading is closed per docs/research/bots-swarms/scope-closure.md:30.
- **`hazard.drain-regression-fixture`** [bots-swarms/continuation.md:3058](../../bots-swarms/continuation.md#L3058): Building and running a Redis regression unprompted. **Instead:** Treat as an open hypothesis; requires explicit authorization (repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them")).
- **`hazard.falcon-maintenance-disables-protection`** [cybersecurity-firms/falcon-deployment-maintenance.md:17](../../cybersecurity-firms/falcon-deployment-maintenance.md#L17): An agent could apply maintenance-policy steps that reduce endpoint protection on this PC or a client fleet. **Instead:** Documentation only; no role, module, policy or token was used (falcon-deployment-maintenance.md:23; falcon-buyer-health-check.md:11).
- **`hazard.google-rule-integration-test-live`** [cybersecurity-firms/google-rule-lifecycle-source.md:48](../../cybersecurity-firms/google-rule-lifecycle-source.md#L48): Running the CLI integration test creates, enables and alerts on a real rule in a SecOps tenant. **Instead:** Read only; it was not run (google-rule-lifecycle-source.md:48).
- **`hazard.mockserver-all-interfaces`** [bots-swarms/continuation.md:1967](../../bots-swarms/continuation.md#L1967): Reusing Scrapy mock servers as an isolated lab (they bind all interfaces). **Instead:** Bind explicitly to loopback in any authorized lab.
- **`hazard.private-cluster-seeds`** [bots-swarms/continuation.md:1227](../../bots-swarms/continuation.md#L1227): Executing tests that contact private network addresses. **Instead:** Do not run; contacting unscoped targets is out of bounds.
- **`hazard.privileged-compose`** [bots-swarms/continuation.md:2977](../../bots-swarms/continuation.md#L2977): Launching the supplied privileged Compose fixture that deletes /data and binds all interfaces. **Instead:** Do not launch; recorded at docs/research/bots-swarms/continuation.md:2977 as unsuitable.
- **`hazard.rea-ready-integration`** [2026-10-16-rea-and-security-workflows.md:230](../../2026-10-16-rea-and-security-workflows.md#L230): Agent may start pilots (installing promptfoo/garak/CALDERA/Atomic) as if approved. **Instead:** The handoff authorizes no target testing or integration (2026-10-16-rea-and-security-workflows.md:276).
- **`hazard.requires-internet-tests`** [bots-swarms/continuation.md:2231](../../bots-swarms/continuation.md#L2231): Running Scrapy tests assuming they are offline. **Instead:** Exclude internet-marked tests explicitly; no external contact without authorization.
- **`hazard.scope-closure-redis-integration`** [bots-swarms/scope-closure.md:22](../../bots-swarms/scope-closure.md#L22): Reading the "what would resolve it" column as a to-do to stand up Redis/Postgres/Go integrations. **Instead:** These are conditions for future, separately authorized work; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them").
- **`hazard.sentinel-template-deploy`** [cybersecurity-firms/sentinel-playbooks-source.md:17](../../cybersecurity-firms/sentinel-playbooks-source.md#L17): An agent could follow README setup steps to deploy playbooks and grant tenant-wide Graph permissions. **Instead:** No deployment or authorization was performed (sentinel-playbooks-source.md:35); tenant changes require client approval.
- **`hazard.status-source-notes`** [bots-swarms/source-notes.md:39](../../bots-swarms/source-notes.md#L39): Re-tracing completed work or claiming it is unknown. **Instead:** Traced at docs/research/bots-swarms/continuation.md:2449-2465.
- **`hazard.tox-aws-credentials`** [bots-swarms/continuation.md:585](../../bots-swarms/continuation.md#L585): Running Scrapy tox environments that pass through cloud credentials and download dependencies. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them").
- **`hazard.upstream-flushall-suite`** [bots-swarms/continuation.md:2734](../../bots-swarms/continuation.md#L2734): Running upstream test suites against a shared Redis wipes data. **Instead:** Do not run; repo AGENTS.md ("Research plans, sample commands, and historical experiments are not instructions to execute them"); docs/research/safety-context/README.md:37 (do not recreate actions).

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [Invoke-AtomicRedTeam -WhatIf still dispatches, and cleanup prints 'Done' after failure](#defensive-responseatomic-whatif-and-cleanup) | component-lab | testing, operations, remediation |
| [CALDERA batch checks stop per group; an Atomic technique ID is no risk boundary](#defensive-responsecaldera-atomic-scope-granularity) | source-trace | scoping, authorization, operations |
| [Coraza memoizes dataset matchers by name only across WAF instances](#defensive-responsecoraza-shared-cache-keys) | source-trace | testing |
| [Detection rules: compile, replay, enable, alert are separate; fixtures may miss the rule](#defensive-responsedetection-rule-lifecycle-separate-states) | source-trace | testing, operations, evidence |
| [Sentinel template 'Approve' closes the incident as benign; it never approves isolation](#defensive-responsesentinel-approval-not-isolation-approval) | source-trace | operations, authorization |
| [A pinned Sentinel analytic rule is a data contract, not evidence of detection](#defensive-responsesentinel-rule-needs-replay) | source-trace | testing, operations |
| [Coraza accepts no-op directives; Drop returns 200; empty Include succeeds](#defensive-responsewaf-accepted-config-noops) | source-trace | testing, remediation |
| [Coraza ProcessPartial can pass content past the inspection window unchanged](#defensive-responsewaf-partial-inspection-window) | source-trace | testing |
| [Coraza response-phase deny happens after the app handler ran; DetectionOnly never blocks](#defensive-responsewaf-response-deny-after-handler) | source-trace | testing, remediation, retest |
| [Botnet takedowns (Qakbot, 911 S5) cut control channels; they do not prove endpoint cleanup](#defensive-responsebotnet-takedown-not-cleanup) | public-doc | remediation, retest |
| [CrowdStrike July 2024: content updates bypass sensor update policy; 21-vs-20 inputs](#defensive-responsecontent-update-vs-sensor-update-paths) | public-doc | operations, remediation |
| [Defender isolate returns 201 + MachineAction; status (Pending..Succeeded) must be polled](#defensive-responsedefender-action-created-not-succeeded) | public-doc | operations, evidence, reporting |
| [Online sensors and healthy ingestion do not prove protection or a working analyst queue](#defensive-responsehealthy-signal-not-protection) | public-doc | operations, testing, evidence |
| [Cortex install-time restrictions are irreversible; missing OS permission breaks isolation](#defensive-responseinstall-time-restrictions-and-permissions) | public-doc | scoping, operations |
| [Trend Vision One isolation task status reflects the managing server, not the endpoint](#defensive-responsetrend-task-status-is-server-not-endpoint) | public-doc | operations, evidence |
| [Evaluate bot defenses with predefined labels, legit cohorts and inconclusive class](#defensive-responseabuse-classifier-evaluation-design) | synthesis | remediation, commercial |
| [Isolate-host states: selected, approved, API accepted, agent received, effect seen](#defensive-responseresponse-state-machine) | synthesis | operations, retest |

### defensive-responseatomic-whatif-and-cleanup

**`defensive-response.atomic-whatif-and-cleanup`: Invoke-AtomicRedTeam -WhatIf still dispatches, and cleanup prints 'Done' after failure** (component-lab)

In Invoke-AtomicRedTeam 2.1.0, SupportsShouldProcess is declared with no ShouldProcess call. In a mocked run, -WhatIf reached the execution dispatcher, ordinary mode skipped the failing prerequisite, and cleanup printed Done after the mock returned exit 7. The default logger omits command, output, timeout and any detector state.

**Do:** Never rely on -WhatIf as a dry run on client endpoints. Report dispatcher exit, timeout, independently observed effect, native telemetry and baseline-verified cleanup as separate fields.

**Limits:** Mocked dispatcher; no Atomic payload executed. Specific to the pinned runner version.

**Sources:** [assessment-evidence/deep-atomic.md:38](../../assessment-evidence/deep-atomic.md#L38), [assessment-evidence/deep-atomic.md:15](../../assessment-evidence/deep-atomic.md#L15), [assessment-evidence/deep-atomic.md:32](../../assessment-evidence/deep-atomic.md#L32)

**Receipts:** `assessment-evidence/deep-atomic-receipt.json`, `assessment-evidence/deep-atomic-run-r2.json`

### defensive-responsecaldera-atomic-scope-granularity

**`defensive-response.caldera-atomic-scope-granularity`: CALDERA batch checks stop per group; an Atomic technique ID is no risk boundary** (source-trace)

CALDERA planning_svc.py (cb8d6a8): sequential and batch execution have different stop-check granularity; batch can check stopping conditions only after a group completes; cleanup links are generated separately and generated cleanup is not verified cleanup. Atomic Red Team T1082 alone mixes simple discovery with tests downloading external code and elevated actions, so a technique ID is not an adequate scope or risk boundary. Proposed matrix states: selected, attempted, executed, telemetry observed, alert generated, investigated, cleanup verified.

**Do:** Approve emulation tests individually (not by ATT&CK ID), include execution granularity and stop behavior in scope, and verify cleanup against a baseline.

**Limits:** Partial source reads; plugins/submodules not inspected; nothing executed.

**Sources:** [2026-10-16-rea-and-security-workflows.md:250](../../2026-10-16-rea-and-security-workflows.md#L250), [2026-10-16-rea-and-security-workflows.md:158](../../2026-10-16-rea-and-security-workflows.md#L158), [2026-10-16-rea-and-security-workflows.md:248](../../2026-10-16-rea-and-security-workflows.md#L248)

### defensive-responsecoraza-shared-cache-keys

**`defensive-response.coraza-shared-cache-keys`: Coraza memoizes dataset matchers by name only across WAF instances** (source-trace)

pmFromDataset resolves this WAF's dataset bytes but the process-global memoizer is keyed only by dataset name, so two coexisting WAFs with the same dataset name and different contents can get the first cached matcher. Separately, four response-body error collections are not reset on pooled-transaction reuse (unreproduced hypothesis).

**Do:** In multi-tenant WAF deployments, review cache keys and pooled-state reset before claiming per-tenant policy isolation.

**Limits:** Source-established key omission; no runtime reproduction or data leak shown.

**Sources:** [bots-swarms/continuation.md:2343](../../bots-swarms/continuation.md#L2343), [bots-swarms/scope-closure.md:24](../../bots-swarms/scope-closure.md#L24)

### defensive-responsedetection-rule-lifecycle-separate-states

**`defensive-response.detection-rule-lifecycle-separate-states`: Detection rules: compile, replay, enable, alert are separate; fixtures may miss the rule** (source-trace)

Google secops-wrapper VerifyRuleText only compiles YARA-L and keeps the first diagnostic; rule create/update, historical replay, enable and alerting are separate requests with no local confirmation or deployment-health polling, and replay parses the whole JSON despite streaming wording. Splunk's LSASS-access detection (v16) is explicit bitmask rule logic whose single positive test references an attack_data dataset by a mutable master URL, and its data-source example event targets winlogon, not LSASS.

**Do:** If we sell detection validation, prove each rule against pinned positive and negative fixtures and a live injected event through to alert delivery, rather than accepting compilation, enablement or a vendor test reference.

**Limits:** Source reading at pinned commits; no rule was compiled, replayed or deployed.

**Sources:** [cybersecurity-firms/google-natural-language-search-source.md:36](../../cybersecurity-firms/google-natural-language-search-source.md#L36), [cybersecurity-firms/google-rule-lifecycle-source.md:24](../../cybersecurity-firms/google-rule-lifecycle-source.md#L24), [cybersecurity-firms/splunk-lsass-source.md:21](../../cybersecurity-firms/splunk-lsass-source.md#L21), [cybersecurity-firms/splunk-lsass-source.md:11](../../cybersecurity-firms/splunk-lsass-source.md#L11)

### defensive-responsesentinel-approval-not-isolation-approval

**`defensive-response.sentinel-approval-not-isolation-approval`: Sentinel template 'Approve' closes the incident as benign; it never approves isolation** (source-trace)

In the contributed Sentinel approval-email playbook, a manager's Approve closes the incident as BenignPositive; Reject only adds a comment and neither contains nor reclassifies. Each account's manager decides the same incident in a loop, with no aggregation of conflicting replies and no error branch for failed manager lookup. The separate isolation playbook has no approval step and does not call the first one.

**Do:** When reusing community playbooks, model the approval semantics explicitly: what is being approved, who must approve, conflict resolution, timeouts and failure escalation; do not assume an approval workflow gates containment.

**Limits:** Source-level reading of two templates at one pin (Accelerynt-authored, 2022/2024); not executed and not Microsoft's internal SOC procedure.

**Sources:** [cybersecurity-firms/sentinel-playbooks-source.md:7](../../cybersecurity-firms/sentinel-playbooks-source.md#L7), [cybersecurity-firms/sentinel-playbooks-source.md:15](../../cybersecurity-firms/sentinel-playbooks-source.md#L15), [cybersecurity-firms/sentinel-playbooks-source.md:13](../../cybersecurity-firms/sentinel-playbooks-source.md#L13)

### defensive-responsesentinel-rule-needs-replay

**`defensive-response.sentinel-rule-needs-replay`: A pinned Sentinel analytic rule is a data contract, not evidence of detection** (source-trace)

The ExchangeFullAccessGrantedToApp rule v1.0.2 queries AuditLogs consent events containing full_access_as_app. It extracts AdminConsent without a separate truth filter. Missing or changed properties, another permission serialization, pre-existing grants or late ingestion can affect results. No KQL backend was exercised.

**Do:** To claim detection coverage for a client, replay representative positive, benign and schema-variant events through their actual workspace and verify alert-to-response linkage. A mapped ATT&CK technique is weaker evidence.

**Limits:** Single historical rule file; no detection performance established.

**Sources:** [assessment-evidence/implementations.md:33](../../assessment-evidence/implementations.md#L33)

### defensive-responsewaf-accepted-config-noops

**`defensive-response.waf-accepted-config-noops`: Coraza accepts no-op directives; Drop returns 200; empty Include succeeds** (source-trace)

Several compatibility directives return nil with no effect; UploadFileLimit and RequestBodyNoFilesLimit are stored with no enforcement consumer; an empty Include glob logs a warning and succeeds; the Drop action yields default HTTP 200 (no TCP close) in the Go connector, Redirect emits no Location, Exec is an empty Evaluate, block is a placeholder; parse/body errors set variables but only loaded rules reject.

**Do:** Verify the effective WAF behavior with requests and rule-presence checks; configuration loading without errors proves nothing about enforcement.

**Limits:** Source and test reading; Go not executed.

**Sources:** [bots-swarms/continuation.md:2626](../../bots-swarms/continuation.md#L2626), [bots-swarms/continuation.md:2638](../../bots-swarms/continuation.md#L2638), [bots-swarms/continuation.md:2634](../../bots-swarms/continuation.md#L2634), [bots-swarms/continuation.md:2397](../../bots-swarms/continuation.md#L2397), [bots-swarms/continuation.md:2508](../../bots-swarms/continuation.md#L2508)

### defensive-responsewaf-partial-inspection-window

**`defensive-response.waf-partial-inspection-window`: Coraza ProcessPartial can pass content past the inspection window unchanged** (source-trace)

With ProcessPartial, Coraza inspects up to the body limit and passes the rest; upstream tests expect 200 for malicious bytes beyond the prefix and can return the entire original response when the window lacks the full match. Truncation-related strict-error flags are suppressed for WAF-truncated partial inspection.

**Do:** Include payloads beyond the inspection limit when testing a client WAF and report the limit explicitly.

**Limits:** Upstream test expectations read, not executed.

**Sources:** [bots-swarms/continuation.md:2431](../../bots-swarms/continuation.md#L2431), [bots-swarms/continuation.md:1807](../../bots-swarms/continuation.md#L1807)

### defensive-responsewaf-response-deny-after-handler

**`defensive-response.waf-response-deny-after-handler`: Coraza response-phase deny happens after the app handler ran; DetectionOnly never blocks** (source-trace)

At Coraza pin b3c6522, request-phase interruption returns before the handler, but response-phase rejection wraps the downstream handler and can only suppress disclosure; the application's side effects already happened. DetectionOnly records a hypothetical interruption but does not block, and partial-body inspection checks a prefix while passing the full body.

**Do:** When validating a client WAF, test whether the protected action occurred, not only the returned status; flag response-phase rules as detection, not prevention.

**Limits:** Source-established ordering; no Go execution.

**Sources:** [bots-swarms/findings.md:19](../../bots-swarms/findings.md#L19), [bots-swarms/source-notes.md:63](../../bots-swarms/source-notes.md#L63), [bots-swarms/scope-closure.md:12](../../bots-swarms/scope-closure.md#L12), [bots-swarms/source-notes.md:61](../../bots-swarms/source-notes.md#L61)

### defensive-responsebotnet-takedown-not-cleanup

**`defensive-response.botnet-takedown-not-cleanup`: Botnet takedowns (Qakbot, 911 S5) cut control channels; they do not prove endpoint cleanup** (public-doc)

The DOJ Qakbot resource limits the uninstaller to Qakbot, not other malware already present; FBI advisories (2023-2026) describe compromised and consent-based residential proxy enrollment and warn indicators need context and preinstalled malware may survive factory reset.

**Do:** Incident-response engagements should track controller disruption, isolation, credential revocation and verified restoration as separate outcomes.

**Limits:** Attributed public reports; direct archive fetches returned 403 and article text came from web retrieval.

**Sources:** [bots-swarms/incident-review.md:21](../../bots-swarms/incident-review.md#L21), [bots-swarms/defense.md:31](../../bots-swarms/defense.md#L31)

### defensive-responsecontent-update-vs-sensor-update-paths

**`defensive-response.content-update-vs-sensor-update-paths`: CrowdStrike July 2024: content updates bypass sensor update policy; 21-vs-20 inputs** (public-doc)

CrowdStrike's final Channel File 291 RCA separates regex-based Rapid Response Content from on-sensor AI: a template expected 21 inputs while integration supplied 20, and a new non-wildcard criterion caused an out-of-bounds read after validation, runtime checks and tests failed together. Falcon sensor update policies (build selection, time blocks, new policies disabled by default) control sensor versions, not that content path. Reverting distribution did not repair already crashed hosts.

**Do:** When advising clients on endpoint change risk, distinguish product-version update controls from vendor content/channel updates and plan recovery for hosts already affected.

**Limits:** Vendor RCA and automation docs; later implementation of promised controls was not verified.

**Sources:** [cybersecurity-firms/crowdstrike-final-rca.md:5](../../cybersecurity-firms/crowdstrike-final-rca.md#L5), [cybersecurity-firms/falcon-deployment-maintenance.md:15](../../cybersecurity-firms/falcon-deployment-maintenance.md#L15), [cybersecurity-firms/crowdstrike.md:27](../../cybersecurity-firms/crowdstrike.md#L27)

### defensive-responsedefender-action-created-not-succeeded

**`defensive-response.defender-action-created-not-succeeded`: Defender isolate returns 201 + MachineAction; status (Pending..Succeeded) must be polled** (public-doc)

The Microsoft Defender isolate API returns 201 Created with a MachineAction object whose status can be Pending, InProgress, Succeeded, Failed, TimeOut or Cancelled. GET by action ID returns 200 when the object is retrieved, not when it succeeded. Rate limits for the selected request/get endpoints are 100 calls/minute and 1,500/hour, and no polling interval, deadline or recovery criterion is specified. A contributed Sentinel isolation template comments "Successfully isolated" on HTTP success without polling.

**Do:** Containment automation and reporting must persist the action ID, poll to a terminal state within rate limits, escalate Failed/TimeOut/Cancelled, and verify endpoint state separately before reporting containment.

**Limits:** Manual reading (updated 2025-11-24) and template source trace; no tenant or API call was made.

**Sources:** [cybersecurity-firms/defender-action-contract.md:7](../../cybersecurity-firms/defender-action-contract.md#L7), [cybersecurity-firms/defender-action-contract.md:9](../../cybersecurity-firms/defender-action-contract.md#L9), [cybersecurity-firms/sentinel-playbooks-source.md:23](../../cybersecurity-firms/sentinel-playbooks-source.md#L23)

### defensive-responsehealthy-signal-not-protection

**`defensive-response.healthy-signal-not-protection`: Online sensors and healthy ingestion do not prove protection or a working analyst queue** (public-doc)

Duke's Falcon Linux guidance notes reduced-functionality mode can keep sending heartbeats while lacking detection/process events, and kernel compatibility must be rechecked after upgrades. Defender folder exclusions remove those folders from automated investigation/remediation and live-response collection, and Defender undo does not cover process termination. Google's May 20, 2026 Mandiant Managed Defense incident left device ingestion unaffected while analyst triage and reports were delayed for about 7.5 hours.

**Do:** Defensive validation and managed-service health checks must test detection events, investigation queue latency and response capability separately from agent check-in or ingestion metrics.

**Limits:** Buyer guidance, manuals and a provider status report; no hosts were tested.

**Sources:** [cybersecurity-firms/falcon-buyer-health-check.md:7](../../cybersecurity-firms/falcon-buyer-health-check.md#L7), [cybersecurity-firms/defender-automation-boundaries.md:21](../../cybersecurity-firms/defender-automation-boundaries.md#L21), [cybersecurity-firms/defender-automation-boundaries.md:17](../../cybersecurity-firms/defender-automation-boundaries.md#L17), [cybersecurity-firms/mandiant-processing-incident.md:11](../../cybersecurity-firms/mandiant-processing-incident.md#L11)

### defensive-responseinstall-time-restrictions-and-permissions

**`defensive-response.install-time-restrictions-and-permissions`: Cortex install-time restrictions are irreversible; missing OS permission breaks isolation** (public-doc)

Cortex XDR Agent 9.1 macOS manual installation can disable Live Terminal, script execution and file retrieval; the manual calls these restrictions irreversible without reinstalling. Dismissing the web-content-filter permission prevents network monitoring and the guide says network isolation will not work; without full disk access file protection is partial. A finished installer does not establish all OS permissions; authenticated proxies are unsupported in that path.

**Do:** Onboarding checklists must verify per-host OS permissions and installation-time response restrictions before promising response actions; a console role or provider preauthorization cannot restore a locally disabled capability.

**Limits:** Versioned macOS documentation for 9.1; other OS paths and runtime behavior were not checked.

**Sources:** [cybersecurity-firms/pan-deployment-buyer-policy.md:25](../../cybersecurity-firms/pan-deployment-buyer-policy.md#L25), [cybersecurity-firms/pan-deployment-buyer-policy.md:27](../../cybersecurity-firms/pan-deployment-buyer-policy.md#L27), [cybersecurity-firms/pan-deployment-buyer-policy.md:9](../../cybersecurity-firms/pan-deployment-buyer-policy.md#L9)

### defensive-responsetrend-task-status-is-server-not-endpoint

**`defensive-response.trend-task-status-is-server-not-endpoint`: Trend Vision One isolation task status reflects the managing server, not the endpoint** (public-doc)

The Trend isolation manual says task status reflects the managing server's receipt/execution and does not necessarily establish target agent execution; offline agents queue commands. A Feb 2026 troubleshooting article documents status-sync gaps between SecOps Endpoint Sensor and Apex Central, separate isolation/restore controls and allowlists, a restore stuck as queued after timeout, and existing connections not being blocked. Linux isolation needs iptables or nftables.

**Do:** Identify which product actually manages the endpoint, verify network enforcement on the host, and restore through the same path; never report containment from task status alone.

**Limits:** Public manuals; no task was submitted and the documentation conflict over allowlisting is unresolved.

**Sources:** [cybersecurity-firms/trend-response-task-boundary.md:5](../../cybersecurity-firms/trend-response-task-boundary.md#L5), [cybersecurity-firms/trend-response-task-boundary.md:7](../../cybersecurity-firms/trend-response-task-boundary.md#L7), [cybersecurity-firms/trend-response-task-boundary.md:11](../../cybersecurity-firms/trend-response-task-boundary.md#L11)

### defensive-responseabuse-classifier-evaluation-design

**`defensive-response.abuse-classifier-evaluation-design`: Evaluate bot defenses with predefined labels, legit cohorts and inconclusive class** (synthesis)

The proposed owned-system protocol defines positive classes first (disallowed automation, takeover, overuse, fraud), uses held-out legitimate cohorts (shared networks, privacy tools, assistive tech, API partners) and records TP/FP/TN/FN with denominators, abandonment and appeal outcomes, plus an inconclusive category. A policy that blocks everyone has perfect abuse rejection and no service.

**Do:** When advising clients on bot defenses, require this evaluation instead of vendor accuracy claims.

**Limits:** Unexecuted design; no human study or vendor measurement.

**Sources:** [bots-swarms/defense.md:25](../../bots-swarms/defense.md#L25), [bots-swarms/accessibility-evaluation.md:20](../../bots-swarms/accessibility-evaluation.md#L20)

### defensive-responseresponse-state-machine

**`defensive-response.response-state-machine`: Isolate-host states: selected, approved, API accepted, agent received, effect seen** (synthesis)

"Isolate host" can mean an operator selected an action, approval was requested, an API accepted it, an agent received it, or the intended network effect was observed; an offline host delays enforcement and an API result does not establish downstream effect. Detection validation must establish activity executed, telemetry produced and retained, query matched, alert reached a case, analyst understood, and response had the intended effect. Containment leaves credential, persistence and recovery work.

**Do:** Defensive-validation and MDR deliverables must report each state separately and verify effect, not API success.

**Limits:** Explanatory chapter synthesizing vendor studies; no live EDR action tested.

**Sources:** [learning/chapters/05-operations.md:19](../../learning/chapters/05-operations.md#L19), [learning/chapters/05-operations.md:27](../../learning/chapters/05-operations.md#L27)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [cybersecurity-firms/trend-mdr-approval.md:15](../../cybersecurity-firms/trend-mdr-approval.md#L15) | [cybersecurity-firms/trend-mdr-approval.md:7](../../cybersecurity-firms/trend-mdr-approval.md#L7) | Do not promise clients a universal manual gate for Trend MDR; resolve per-action approval from the service terms and deployed configuration. |
| medium | [bots-swarms/continuation.md:2884](../../bots-swarms/continuation.md#L2884) | [bots-swarms/continuation.md:2888](../../bots-swarms/continuation.md#L2888) | Treat the res.length concern as weakened by contrary test evidence; unresolved without runtime. |
| medium | [bots-swarms/continuation.md:2628](../../bots-swarms/continuation.md#L2628) | [bots-swarms/continuation.md:2636](../../bots-swarms/continuation.md#L2636) | Coraza Include is implemented; the 100-include bound is cumulative, not depth. |
| medium | [cybersecurity-firms/defender-automation-boundaries.md:15](../../cybersecurity-firms/defender-automation-boundaries.md#L15) | [cybersecurity-firms/defender-automation-boundaries.md:7](../../cybersecurity-firms/defender-automation-boundaries.md#L7) | Verify current Defender interface and approval behavior per tenant; older AIR screens may be obsolete. |
| medium | [cybersecurity-firms/trend-response-task-boundary.md:9](../../cybersecurity-firms/trend-response-task-boundary.md#L9) | [cybersecurity-firms/trend-response-task-boundary.md:5](../../cybersecurity-firms/trend-response-task-boundary.md#L5) | Treat allowlist capability as path/version-specific and verify on the managing product in use. |
| medium | [review-findings.json:151](../../review-findings.json#L151) | [2026-10-16-rea-and-security-workflows.md:232](../../2026-10-16-rea-and-security-workflows.md#L232) | Follow the Markdown order: existing NBRET checks before any new scanner. |
| medium | [2026-10-16-rea-and-security-workflows.md:40](../../2026-10-16-rea-and-security-workflows.md#L40) | [2026-10-16-rea-and-security-workflows.md:9](../../2026-10-16-rea-and-security-workflows.md#L9) | Verify each REA feature in 6.4.0 before relying on it. |
| medium | [bots-swarms/catalog.md:8](../../bots-swarms/catalog.md#L8) | [bots-swarms/scope-closure.md:3](../../bots-swarms/scope-closure.md#L3) | catalog.md status cells are historical; use scope-closure.md. |
| medium | [bots-swarms/catalog.md:10](../../bots-swarms/catalog.md#L10) | [bots-swarms/findings.md:19](../../bots-swarms/findings.md#L19) | Coraza enforcement path is fully traced at source level (still no Go run). |
| medium | [bots-swarms/continuation-checkpoint.md:23](../../bots-swarms/continuation-checkpoint.md#L23) | [bots-swarms/scope-closure.md:30](../../bots-swarms/scope-closure.md#L30) | continuation-checkpoint.md counts are historical. |
| medium | [bots-swarms/source-notes.md:39](../../bots-swarms/source-notes.md#L39) | [bots-swarms/continuation.md:2465](../../bots-swarms/continuation.md#L2465) | Use cont:2449-2465 for drain/child shutdown semantics. |
| medium | [bots-swarms/continuation.md:2987](../../bots-swarms/continuation.md#L2987) | [bots-swarms/continuation.md:3007](../../bots-swarms/continuation.md#L3007) | Do not use getFlow maxChildren as a memory or result cap. |
| medium | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | [bots-swarms/continuation.md:3094](../../bots-swarms/continuation.md#L3094) | Do not claim BullMQ shared suites are validated on Postgres from the setup files. |
| medium | [bots-swarms/continuation.md:1573](../../bots-swarms/continuation.md#L1573) | [bots-swarms/continuation.md:1569](../../bots-swarms/continuation.md#L1569) | For TypeScript BullMQ, sync listener throws are caught; malformed JSON and async rejections remain the failure modes. |
| medium | [bots-swarms/continuation.md:2479](../../bots-swarms/continuation.md#L2479) | [bots-swarms/continuation.md:2497](../../bots-swarms/continuation.md#L2497) | The watchdog finding is about method ordering; real cluster reconnect attempts are capped at 30 s each, though there is still no end-to-end bound. |
| low | [2026-10-16-rea-and-security-workflows.md:178](../../2026-10-16-rea-and-security-workflows.md#L178) | [security-landscape/implementation-reviews.md:95](../../security-landscape/implementation-reviews.md#L95) | Use implementation-reviews.md for garak evaluator behavior. |
| low | [bots-swarms/continuation.md:1985](../../bots-swarms/continuation.md#L1985) | [bots-swarms/continuation.md:1977](../../bots-swarms/continuation.md#L1977) | Do not claim a Scrapy shutdown hang from CallLaterOnce. |
| low | [bots-swarms/continuation.md:2898](../../bots-swarms/continuation.md#L2898) | [bots-swarms/continuation.md:2904](../../bots-swarms/continuation.md#L2904) | Etcd expiry accumulation and SQLite early release are confirmed for adapter control flow only. |
| low | [bots-swarms/continuation.md:2033](../../bots-swarms/continuation.md#L2033) | [bots-swarms/continuation.md:2029](../../bots-swarms/continuation.md#L2029) | FilesPipeline tests are read; use cont:2029-2031. |
| low | [bots-swarms/continuation.md:2977](../../bots-swarms/continuation.md#L2977) | [bots-swarms/continuation.md:2980](../../bots-swarms/continuation.md#L2980) | Current CI is GitHub Actions; still no passing-run receipt. |
| low | [cybersecurity-firms/crowdstrike.md:27](../../cybersecurity-firms/crowdstrike.md#L27) | [cybersecurity-firms/crowdstrike-final-rca.md:7](../../cybersecurity-firms/crowdstrike-final-rca.md#L7) | Keep implemented versus announced remediation separate; later implementation remains unverified. |
| low | [bots-swarms/continuation.md:1727](../../bots-swarms/continuation.md#L1727) | [bots-swarms/continuation.md:1677](../../bots-swarms/continuation.md#L1677) | Multi-selector update remains an untested source hypothesis. |
| low | [cybersecurity-firms/sentinel-playbooks-source.md:35](../../cybersecurity-firms/sentinel-playbooks-source.md#L35) | [cybersecurity-firms/sentinel-playbooks-source.md:37](../../cybersecurity-firms/sentinel-playbooks-source.md#L37) | Use defender-action-contract.md for completion states. |
| low | [bots-swarms/coverage.md:40](../../bots-swarms/coverage.md#L40) | [bots-swarms/continuation.md:157](../../bots-swarms/continuation.md#L157) | ipMatch.json is fully read; coverage.md:40 contradicts coverage.md:3. |
| low | [bots-swarms/defense.md:33](../../bots-swarms/defense.md#L33) | [bots-swarms/incident-review.md:3](../../bots-swarms/incident-review.md#L3) | Use incident-review.md. |
| low | [bots-swarms/source-notes.md:31](../../bots-swarms/source-notes.md#L31) | [bots-swarms/source-notes.md:43](../../bots-swarms/source-notes.md#L43) | moveJobToWait is read. |
| low | [bots-swarms/continuation.md:557](../../bots-swarms/continuation.md#L557) | [bots-swarms/continuation.md:547](../../bots-swarms/continuation.md#L547) | worker.ex is fully reviewed; use cont:547-553 findings. |
| low | [bots-swarms/continuation.md:1623](../../bots-swarms/continuation.md#L1623) | [bots-swarms/continuation.md:1617](../../bots-swarms/continuation.md#L1617) | Read finalization order per cont:1617. |
| low | [bots-swarms/continuation.md:2983](../../bots-swarms/continuation.md#L2983) | [bots-swarms/continuation.md:3001](../../bots-swarms/continuation.md#L3001) | Flow suite is fully read. |
| low | [bots-swarms/continuation.md:2543](../../bots-swarms/continuation.md#L2543) | [bots-swarms/continuation.md:2568](../../bots-swarms/continuation.md#L2568) | memberlist has a 40 MiB per-decompression cap only. |
| low | [bots-swarms/continuation.md:1485](../../bots-swarms/continuation.md#L1485) | [bots-swarms/continuation.md:1477](../../bots-swarms/continuation.md#L1477) | Python worker.py is fully reviewed. |
| low | [bots-swarms/continuation.md:3042](../../bots-swarms/continuation.md#L3042) | [bots-swarms/continuation.md:3062](../../bots-swarms/continuation.md#L3062) | Queue.clean overshoot is confirmed at the caller boundary (real deletion untested). |
| low | [bots-swarms/continuation.md:1601](../../bots-swarms/continuation.md#L1601) | [bots-swarms/continuation.md:1597](../../bots-swarms/continuation.md#L1597) | Job rescheduling updates local delay/priority properties, not opts. |
