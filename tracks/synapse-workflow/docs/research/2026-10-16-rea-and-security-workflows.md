# REA and ten repositories for NBRET security workflows

Research handoff dated October 16, 2026. Kotaro requested research into Reverse Engineer Anything, its codebase, cybersecurity and red-team applications, and ten other popular or distinctive GitHub projects. This note preserves the findings for a later discussion. No implementation, installation, scan, or deployment is proposed as already approved by this document.

## Start here next time

The most promising direction is to connect **investigation → independently validated finding → repeatable regression → defensive telemetry**. Start with one known-answer local fixture and measure the value before adding orchestration or a large tool collection.

NBRET already incorporates REA; the immediate question is how to improve that integration and evidence model. The current repository pins `rea-agents@6.4.0`. The upstream source snapshot reviewed here is a separate main-branch commit. Capabilities seen upstream must not be assumed to exist in the pinned package.

The earlier conversation called this NBRT/NBERT. The repository identifies itself as **NBRET — Network Based Reverse Engineering Tool**. Repository context now resolves the name; engagement-specific requirements remain open.

## What exists in NBRET already

The repository's [README](../../README.md), [architecture](../architecture.md), [tier guide](../tiers.md), and [workflow understanding guide](../workflow-understanding.md) describe these existing capabilities:

- Capture records browser actions, requests/responses, initiators, scripts, fingerprints, and coverage limitations. REA observes the page after the capture actions; it does not recover network traffic that already ended.
- Explore uses the existing computeruse harness for bounded discovery and explicitly configured interactions.
- Probe runs selected request cases with scope and resource limits. Plans are proposals rather than automatic permission to replay them.
- Scan integrates ZAP, with passive scanning as the default and active scanning requiring explicitly authorized scope.
- Analyze and Understand connect saved network/script evidence to source structure, branch conditions, state/storage, navigation, and candidate cross-file links. The documentation distinguishes static candidates from proof of runtime behavior.

These are documentation-derived observations for this handoff, not a fresh execution test of NBRET. Existing working-tree changes were preserved.

## Research coverage and confidence

This is an **initial source assessment**, not a completed exhaustive audit. Eleven repositories were cloned at recorded commits, totaling 51,922 tracked files at the time of inventory. Selected implementations, contracts, architecture, and documentation were inspected. Full line-by-line understanding of all source, tests, generated code, fixtures, and submodules remains unfinished.

No reviewed tool was installed or executed against a target in this session. Source-derived conclusions are not runtime verification, performance measurements, security attestations, or proof that a proposed integration works.

- [Detailed findings and reading coverage](review-findings.json) records full-file versus partial reads and limitations. Some oversized tool outputs were clipped; those files are marked as partial reads.
- [Repository snapshots](repository-snapshots.json) records origins, exact commits, local paths, and tracked file counts.
- Source clones remain under `C:/Users/kotar/.codex/research/`; they are not copied into this repository.
- The ten additional repositories are curated for relevance and distinctive engineering, not a verified global top-ten star ranking.

## REA architecture and the main lesson

REA is an agent-facing investigation layer with shared CLI/MCP workflows and adapters for specialized tools. Its architecture separates domain contracts, provider adapters, application workflows, and external entry points. Native analysis depends on selected providers; static artifact analysis and runtime observation have different capabilities and effects.

The inspected evidence schema records artifact identity, provider/version, operation and parameters, normalized/raw results, confidence, authority, environment, limitations, source locations, and supporting evidence links. Composed workflows retain upstream caveats and unresolved questions. Stable artifact reads check file identity and changes during the read before returning a SHA-256 digest.

For NBRET, the useful pattern is a finding that preserves the distinction between **observed behavior, static source facts, derived relationships, hypotheses, and missing evidence**. A shared action identifier or nearby timestamp is an association, not sufficient proof of causation. A client-side gate is not proof of server-side authorization.

Evidence hashes can detect record/content inconsistency; they do not establish trusted origin, truth, a forensic chain of custody, or analyst correctness on their own.

REA's Windows Ghidra support is documented as experimental with a bounded read-only scope. The integration should detect actual installed capabilities rather than assume cross-platform parity. Local tool execution also does not establish local-only model processing or a sandbox.

## Repository findings and proposed applications

The learning statements below come from the inspected source scope. Applications are proposals, not demonstrated integrations.

### 1. morluto/rea

Agent-facing investigation and evidence workflows. [Repository](https://github.com/morluto/rea). Snapshot: `54c71313aeb2cbdf21626af9557673a6f6397180`.

**What we can learn.** Provider-neutral observations, explicit confidence and authority, preserved upstream caveats, artifact digests, and residual unknowns.

**Potential application.** Investigation records that connect artifact identity, suspected weakness, evidence, validation experiment, and remediation regression.

**Limits and adoption considerations.** Source review does not establish real-provider behavior. Windows Ghidra support is explicitly experimental and narrower than general cross-platform support. Local analysis does not make the connected model local or establish isolation.

Source coverage:

- Full-file output inspected: [README.md](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/README.md)
- Full-file output inspected: [AGENTS.md](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/AGENTS.md)
- Full-file output inspected: [docs/architecture.mermaid](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/docs/architecture.mermaid)
- Full-file output inspected: [src/application/WorkflowEvidence.ts](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/src/application/WorkflowEvidence.ts)
- Full-file output inspected: [src/application/AnalysisProvider.ts](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/src/application/AnalysisProvider.ts)
- Full-file output inspected: [src/application/ProviderOperationExecution.ts](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/src/application/ProviderOperationExecution.ts)
- Full-file output inspected: [src/artifacts/readStableArtifact.ts](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/src/artifacts/readStableArtifact.ts)
- Full-file output inspected: [src/browser/PlaywrightExecutionBoundary.ts](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/src/browser/PlaywrightExecutionBoundary.ts)
- Full-file output inspected: [src/application/InvestigationProviders.ts](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/src/application/InvestigationProviders.ts)
- Partial read: [package.json](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/package.json)
- Partial read: [src/domain/evidence.ts:1-230](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/src/domain/evidence.ts)
- Partial read: [docs/windows-ghidra-p0.md:1-120](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/docs/windows-ghidra-p0.md)
- Partial read: [experiments/analysis-efficiency/README.md](https://github.com/morluto/rea/blob/54c71313aeb2cbdf21626af9557673a6f6397180/experiments/analysis-efficiency/README.md)

### 2. NationalSecurityAgency/ghidra

Binary analysis engine. [Repository](https://github.com/NationalSecurityAgency/ghidra). Snapshot: `9a723ce99952771b8368329503aa589ae233e916`.

**What we can learn.** Persistent program-bound decompiler interface, explicit completion checks, process recovery.

**Potential application.** Repeatable headless analysis of owned native software and comparisons across releases.

**Limits and adoption considerations.** Decompiled pseudocode is a reconstruction; engine correctness and architecture coverage need target-specific validation.

Source coverage:

- Partial read: [Ghidra/Features/Decompiler/src/main/java/ghidra/app/decompiler/DecompInterface.java:1-130](https://github.com/NationalSecurityAgency/ghidra/blob/9a723ce99952771b8368329503aa589ae233e916/Ghidra/Features/Decompiler/src/main/java/ghidra/app/decompiler/DecompInterface.java)

### 3. frida/frida

Runtime instrumentation. [Repository](https://github.com/frida/frida). Snapshot: `2ff8f72375c8d3d5e53bb3ad250ba240964a4a39`.

**What we can learn.** The release repository delegates implementation to separate core, gum, language binding, and tooling repositories; interceptor state includes transactions and per-thread invocation context.

**Potential application.** Validate narrowly defined runtime hypotheses in disposable lab instances.

**Limits and adoption considerations.** Instrumentation can change timing and behavior. Main repository review alone cannot cover implementation.

Source coverage:

- Full-file output inspected: [.gitmodules](https://github.com/frida/frida/blob/2ff8f72375c8d3d5e53bb3ad250ba240964a4a39/.gitmodules)
- Partial read: [frida-gum/gum/guminterceptor.c:1-150 at pinned submodule 3f13ee69c738013e61884701d8c1c39eed0cc679](https://github.com/frida/frida-gum/blob/3f13ee69c738013e61884701d8c1c39eed0cc679/gum/guminterceptor.c)

### 4. semgrep/semgrep

Source pattern and dataflow checks. [Repository](https://github.com/semgrep/semgrep). Snapshot: `51602ad27f09ef9342a5620601de5ef8f572fbc6`.

**What we can learn.** Language-neutral AST pattern matching preserves metavariables and source ranges; scan orchestration is distinct from matching.

**Potential application.** Convert a confirmed source-level weakness into a reviewed rule with positive and negative fixtures.

**Limits and adoption considerations.** Pattern matches are not exploitability proof; commercial engine capabilities must be distinguished from this repository.

Source coverage:

- Partial read: [cli/src/semgrep/run_scan.py:1-130](https://github.com/semgrep/semgrep/blob/51602ad27f09ef9342a5620601de5ef8f572fbc6/cli/src/semgrep/run_scan.py)
- Partial read: [src/matching/Match_patterns.ml:1-210](https://github.com/semgrep/semgrep/blob/51602ad27f09ef9342a5620601de5ef8f572fbc6/src/matching/Match_patterns.ml)

### 5. projectdiscovery/nuclei

Template-based checks. [Repository](https://github.com/projectdiscovery/nuclei). Snapshot: `a151a1d54fad0d5ef71f01662b0bb3955a98c7c5`.

**What we can learn.** Separate protocol/headless concurrency and per-template lifecycle callbacks; failed origin-scoped attempts should not suppress later attempts.

**Potential application.** Versioned approved checks with target scope, rate budgets, and lifecycle receipts.

**Limits and adoption considerations.** Templates vary in side effects; scanner output needs independent confirmation and pinned template provenance.

Source coverage:

- Full-file output inspected: [pkg/core/engine.go](https://github.com/projectdiscovery/nuclei/blob/a151a1d54fad0d5ef71f01662b0bb3955a98c7c5/pkg/core/engine.go)

### 6. apache/caldera

Adversary emulation orchestration. [Repository](https://github.com/apache/caldera). Snapshot: `cb8d6a8160e0f4990af323a7c071d5e8482b42c7`.

**What we can learn.** Ability selection uses agent capabilities and operation facts; sequential and batch execution have different stop-check granularity; cleanup links are generated separately.

**Potential application.** Bounded purple-team exercises with expected telemetry and explicit stopping conditions.

**Limits and adoption considerations.** Generated cleanup is not proof that cleanup completed. Batch behavior can delay stopping-condition checks. Plugin submodules were not recursively inspected.

Source coverage:

- Full-file output inspected: [app/service/planning_svc.py](https://github.com/apache/caldera/blob/cb8d6a8160e0f4990af323a7c071d5e8482b42c7/app/service/planning_svc.py)

### 7. redcanaryco/atomic-red-team

Technique-specific detection tests. [Repository](https://github.com/redcanaryco/atomic-red-team). Snapshot: `388942adbd9641f4dfdcf079d7efe9a75ec0ac43`.

**What we can learn.** Tests carry stable identities, platforms, arguments, prerequisites, executors, and optional cleanup.

**Potential application.** Detection coverage matrix that distinguishes selected, executed, observed, alerted, investigated, and cleaned-up tests.

**Limits and adoption considerations.** Even one technique file mixes simple discovery with tests that download external code; technique ID alone is not an adequate scope or risk boundary.

Source coverage:

- Partial read: [atomics/T1082/T1082.yaml:1-210](https://github.com/redcanaryco/atomic-red-team/blob/388942adbd9641f4dfdcf079d7efe9a75ec0ac43/atomics/T1082/T1082.yaml)

### 8. NVIDIA/garak

LLM probe and detector evaluation. [Repository](https://github.com/NVIDIA/garak). Snapshot: `cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc`.

**What we can learn.** Separate generation, probes, detectors, and evaluators; unscored outputs are counted separately from passes; plugin metadata and attempt identity are retained.

**Potential application.** Independent evaluation of agent boundary failures with preserved attempts and uncertainty.

**Limits and adoption considerations.** Detector scores are measurements under a rubric, not confirmed real-world vulnerabilities. Some components require external models or services.

Source coverage:

- Full-file output inspected: [garak/harnesses/base.py](https://github.com/NVIDIA/garak/blob/cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc/garak/harnesses/base.py)
- Partial read: [garak/detectors/base.py](https://github.com/NVIDIA/garak/blob/cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc/garak/detectors/base.py)
- Partial read: [garak/evaluators/base.py:1-210](https://github.com/NVIDIA/garak/blob/cc1215c5c301a69f115b0b2b7ef8e4172ae2e7fc/garak/evaluators/base.py)

### 9. promptfoo/promptfoo

Application-level AI regression and red-team evaluation. [Repository](https://github.com/promptfoo/promptfoo). Snapshot: `79011700b4cb544ddd9267565571a1d42d3a3051`.

**What we can learn.** Separate test plugins, strategies, providers, and assertions. Remote generation selection depends on credentials, cloud login, endpoints, and flags.

**Potential application.** Agent tests for untrusted document instructions, cross-tenant access, inappropriate tool calls, and canary-data leakage, scored against tool traces and deterministic assertions.

**Limits and adoption considerations.** Local CLI installation does not ensure local processing. Model-judge agreement alone is insufficient evidence; review data flow and costs before real cases.

Source coverage:

- Full-file output inspected: [src/redteam/remoteGeneration.ts](https://github.com/promptfoo/promptfoo/blob/79011700b4cb544ddd9267565571a1d42d3a3051/src/redteam/remoteGeneration.ts)
- Partial read: [src/redteam/index.ts:1-130](https://github.com/promptfoo/promptfoo/blob/79011700b4cb544ddd9267565571a1d42d3a3051/src/redteam/index.ts)
- Partial read: [src/redteam/plugins/base.ts:1-210](https://github.com/promptfoo/promptfoo/blob/79011700b4cb544ddd9267565571a1d42d3a3051/src/redteam/plugins/base.ts)

### 10. temporalio/temporal

Durable workflow service. [Repository](https://github.com/temporalio/temporal). Snapshot: `48a1e5ff025e55b3d4d0f44247423d4c279ff636`.

**What we can learn.** Validate command sequences and preserve distinctions between workflow completion, retry, and unprocessed updates.

**Potential application.** Long-running engagements that survive restarts and retain approval and result history.

**Limits and adoption considerations.** Retryable workflows need idempotent external activities; durability is not automatic permission to repeat an action. Running a service introduces operational cost.

Source coverage:

- Partial read: [docs/architecture/README.md](https://github.com/temporalio/temporal/blob/48a1e5ff025e55b3d4d0f44247423d4c279ff636/docs/architecture/README.md)
- Partial read: [service/history/api/respondworkflowtaskcompleted/workflow_task_completed_handler.go:181-340](https://github.com/temporalio/temporal/blob/48a1e5ff025e55b3d4d0f44247423d4c279ff636/service/history/api/respondworkflowtaskcompleted/workflow_task_completed_handler.go)

### 11. langchain-ai/langgraph

Stateful agent orchestration. [Repository](https://github.com/langchain-ai/langgraph). Snapshot: `41c9c22fdc83d68a2859d0c9a2b627c8615a792f`.

**What we can learn.** Explicit node subscriptions, writes, retries, timeouts, checkpoint versions and pending writes. Delta-channel retention can depend on ancestor history.

**Potential application.** Branching investigations with review interrupts and replayable state; borrow state design before adopting another orchestration framework.

**Limits and adoption considerations.** Checkpoints are not a sandbox. Naive checkpoint pruning can break delta reconstruction; persistence adapters and serializer policy require separate review.

Source coverage:

- Partial read: [libs/langgraph/langgraph/pregel/main.py:1-130,201-370](https://github.com/langchain-ai/langgraph/blob/41c9c22fdc83d68a2859d0c9a2b627c8615a792f/libs/langgraph/langgraph/pregel/main.py)
- Partial read: [libs/checkpoint/langgraph/checkpoint/base/__init__.py](https://github.com/langchain-ai/langgraph/blob/41c9c22fdc83d68a2859d0c9a2b627c8615a792f/libs/checkpoint/langgraph/checkpoint/base/__init__.py)

## Three proposed pilots

### Finding to regression

Use one owned, deliberately vulnerable local web fixture with a known repaired version. Capture the same scenario under each version with NBRET, preserve request/script identity, and investigate the relevant code path using its existing REA integration. Independently verify the finding before writing a test.

For a source-level pattern, consider a reviewed Semgrep rule with positive and negative fixtures. For observable application behavior, first use NBRET's existing assertions/probes; evaluate a narrowly selected Nuclei template only if it adds coverage. Do not assume a generic scanner hit proves exploitability.

Measure analyst time, reproducibility, false positives, correct failure on the vulnerable fixture, correct success on the repaired fixture, and remaining evidence gaps. Preserve the exact tool, configuration, template/rule, and artifact versions.

### Agent boundary evaluation

Test a separate synthetic agent application with untrusted documents, repository text, and tool responses. Ask whether those inputs can induce an inappropriate tool call, cross-tenant access, or disclosure of a synthetic canary. Use disposable credentials and data.

Promptfoo can organize application-level test cases; garak can provide a separate probe/detector evaluation. Score actual tool calls, data access, and deterministic policy assertions alongside generated text. A refusal is not success if the tool action already occurred, and an LLM judge's score alone is not proof of a vulnerability.

Record benign-task success as well as boundary failures, repeated-run frequencies, costs, and unscored/error outcomes. Promptfoo source can select remote generation depending on credentials/cloud configuration; confirm the processing destinations before supplying real engagement material.

### Detection evidence matrix

Choose a small reviewed set of Atomic Red Team tests for disposable instrumented endpoints. Add a CALDERA scenario only when multi-step execution contributes something beyond individual tests.

Record selected, attempted, executed, telemetry observed, alert generated, investigated, and cleanup verified as separate states. Map each to a run and stable test identity. A completed command does not prove a defense detected it. Generated cleanup is not verified cleanup.

CALDERA's batch execution can check stopping conditions after a group completes rather than after each individual action. Scope must therefore include execution granularity and explicit stop behavior. Technique labels alone are insufficient to approve every test grouped under them; inspected Atomic examples mix simple discovery with external-code downloads and elevated actions.

## Integration order for NBRET

1. Select one known-answer fixture and analyst question; establish the current NBRET/CLI baseline.
2. Define a portable finding record linked to existing action, request, script/hash, source-location, and coverage records. Keep evidence immutable and interpretations separately revisable.
3. Improve REA evidence projection and recovery where it demonstrably reduces investigation effort. Preserve full evidence while returning compact selected views to an agent.
4. Turn one independently confirmed finding into a regression test using existing NBRET checks before adding a new scanner.
5. Add one optional adapter only if the pilot shows a real coverage or efficiency gap.
6. Consider Temporal or LangGraph only after durable execution or branching state becomes an observed problem. Borrow their design lessons without assuming another framework is necessary.

Benchmark REA against a plain existing-tool workflow on the same question. Measure correctness, retained evidence, calls/retries, elapsed time, and model tokens/cost when applicable. Upstream experiment results are not measurements of NBRET on this PC, and smaller output bytes do not automatically imply lower total cost.

## Decisions and remaining research

- Which NBRET use case should lead: web/API assessment, native software, mobile, AI-agent testing, or endpoint detection validation?
- What counts as success for the pilot, and what baseline workflow are we replacing or improving?
- Which upstream REA features actually exist in pinned 6.4.0, and which require a separately reviewed upgrade?
- What evidence schema can interoperate with NBRET without duplicating its current provenance and coverage records?
- Which tool/provider installations and isolated lab environments are already available?
- What processing destinations, retention, costs, and credentials apply to the selected configuration?
- Continue exhaustive source coverage, including implementation submodules. Frida's main repository is primarily a composition/release entry point; CALDERA plugins likewise require separate inspection.
- Inspect failure, cancellation, cleanup, parser-boundary, and coverage tests, then validate selected real-provider workflows. No security or performance conclusion should be inferred from README claims or mocked providers alone.

## Scope for later work

This handoff authorizes no target testing or tool integration by itself. Follow Kotaro's existing computeruse preference for browser/desktop operations, preserve unrelated sessions, and keep production/client boundaries intact. Client Shopify remains read-only unless Kotaro explicitly approves the specific mutation and scope. Production deployment, publication, and external messages retain their existing confirmation requirements.

Kotaro chose to pick this research up another day. Research is paused after saving this handoff; no background audit or scan is running.
