import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {projects,base} from './content.mjs';
import {seams,routes} from './extension-map.mjs';
import {productDecisions as decisions} from './product-decisions.mjs';
const root=path.resolve(import.meta.dirname,'../../..');
const plan=path.join(root,'docs/SYNAPSE-PLATFORM.md');
const original=fs.readFileSync(plan,'utf8');
const clean=s=>s.replaceAll('|','/').replaceAll('\n',' ');
const study=p=>`[study](../${base+p.sources[0]})`;
const text=`<!-- DELTA-EXTENSION-MAP-START -->
## 8A. Research mapped to ARTEX's teaching and extension points

Added by Delta, 2026-10-21, at Kotaro's explicit request relayed through Reed (task 0cade40d-09df-4c87-b9c5-751b4f5d459f). This extends this canonical plan; the [visual HTML report](reports/artex-research/index.html#teaching) is a dated presentation/evidence snapshot, not a competing plan. Its 32 dossiers each include destination, consumer, native overlap, inputs, confidence, limits and validation. [Routing data](reports/artex-research/extension-map.mjs) is the common source for this section/report. All 300 research Markdown files and register entries are browsable there; not every underlying artifact was freshly semantically re-audited.

**Application basis:** read the clean co-op README-COOP.md and docs/COOP-STATUS.md and selected source at local security checkout HEAD d9842759b09d42ffa9b85a21ff122db80ab2000e. KrisPC runs source-built coop-9410e3c4c7e8; later documentation-only commits do not change that binary. Rook's [cutover receipt](../../security/docs/COOP-CUTOVER-2026-10-21.md) records native conversation 4's tool/model round trip. Hiro separately owns Kimi bridge work. Delta changed no application source, configuration, role binding, permission or runtime.

### The destination is chosen by the kind of change

| Native destination | What to teach/add here | Concrete source seam | Important limit |
| --- | --- | --- | --- |
${seams.map(s=>`| **${s.name}** | ${s.purpose}. ${s.native} | security/${s.source} | ${s.limit} |`).join('\n')}

Categories are organizational labels (db/task_categories.go:25–38), not a way to teach an agent. A task template carries description/goal, optional category and task intercept rules; do not assume it snapshots every setting. General working habits belong in role prompts; reusable specific procedures belong in skills; target-specific facts/access/policy belong in task context. Neither skills nor prompts retrain model weights. A chat correction is not proven global persistent learning.

Tools add execution and require their actual dependencies in the KrisPC execution environment. An installed Windows utility is not automatically in the Linux application container. MCP adds a service dependency; discovery can spawn/connect, so it is not a harmless static catalog operation. Use one bounded retrieval wrapper or one MCP only if native context cannot supply the needed research; no new retrieval service is selected here. Authority remains separate: tool visibility/bindings, effective interception, OS/container/files/network, credentials and human-approved target scope. CLI bridge restrictions apply to model decisions, not ARTEX's subsequent tool effects.

### What the bundled skills actually cover

Reed's independent inventory and Delta's direct git tracked-file/source check found three tracked skill packages at this source snapshot: **api-recon**, **playwright-cli**, **scopesentry**. This is a source-bundled catalog count, not a runtime active/visible/usable skill count. api-recon is a detailed staged frontend/API reconnaissance procedure, explicitly separated from vulnerability/exploitation testing. Its dynamic route discovery can use client-side hooks and mock/stub responses: discovered endpoints are useful leads, while mocked success is not live authenticated backend access. playwright-cli supplies browser interaction instructions; it does not prove a working browser/session lane. scopesentry assumes an already deployed external ScopeSentry MCP; its file does not establish service connectivity. PC automation continues to use Kotaro's computeruse harness.

The engine's general execution/planning ability is therefore broader than this three-package method catalog, while the catalog is not a demonstrated comprehensive pentest methodology library. The first useful knowledge work is curated identity/tenant controls, business-rule sequence hypotheses, strongest-counterexample review, source-to-runtime applicability and evidence/retest discipline. Those fill method coverage, rather than duplicate native planner/worker/report infrastructure. Dockerfile.coop inherits a pinned upstream tool environment and replaces the application binary; actual binaries/credentials/lanes still need effective runtime inventory.

Distinguish three gap types: **method/catalog gap** (a reviewed procedure is not in the bundled catalog); **configuration/connection gap** (mechanism exists but active visibility, service or dependency is unestablished); **validation gap** (implementation exists but useful outcome/enforcement has not been demonstrated). Do not call the last two missing features by default. COOP-STATUS explicitly retains the owned investigation/effect/scope/budget/stop/resume/export/client-mapping acceptance gaps. This inventory adds no grant or permission.

### Evidence-linked routing for every compared project/family

Priorities are judgments: **P0** baseline/control acceptance; **P1** useful near-term method/evidence draft; **P2** conditional specialist or measured method experiment; **P3** defer/research-only until relevant scope. Ready means ready to prepare a local reviewed procedure, not uploaded, active, granted or runtime-proven. Mechanism confidence is source-trace (plus the narrowly labeled historical receipts); benefit in current ARTEX remains unmeasured.

| Research item / provenance | Destination and consumer | Lesson and native overlap | Required inputs / dependencies | Disposition / priority | Validation / rejection condition |
| --- | --- | --- | --- | --- | --- |
${projects.map(p=>{const r=routes[p.id],s=seams.find(s=>s.id===r.destination);return `| **${p.name}** ${study(p)}${p.pin?' · '+p.pin.slice(0,12):''} | **${s.name}**; ${clean(r.secondary)}. Consumer: ${clean(r.consumer)}. | ${clean(p.borrow)} Native: ${clean(s.native)} | ${clean(r.inputs)} | **${r.priority}** · ${clean(r.disposition)} | ${clean(r.validation)} |`;}).join('\n')}

Project-specific contrary evidence and review limits remain in the linked studies and HTML dossier (including inherited versus fresh reads). No default routing upgrades a register card into a target fact. The 335-entry register is a decision index, not 335 demonstrated vulnerabilities, and absence from a search result is not clearance.

### Smallest useful preparation sequence

**Concrete current code gap (P0/P1, inspect before changing):** Delta read Hiro's saved [mock receipt](../../security/work/audit-receipts/bridge-error-classification-2026-10-21.json), dated 18:38:49 UTC at a5c08b0646b150d69812d220962395d2cae70646, and directly read runner.mjs:113–149 and server.mjs:88–97. An injected ordinary runner Error with a simulated refusal label becomes HTTP502/provider_error. This demonstrates generic error-classification loss, **not a real provider refusal or reproduction of a native CLI refusal payload**. Source independently shows Codex turn.failed/error and Claude unsuccessful structured results becoming generic errors. This may obscure refusal/auth/quota distinctions and influence retry decisions; the actual downstream effect is unmeasured. It belongs in a narrowly reviewed **bridge/error-contract code change**, not a skill, prompt or permission expansion. Proposed validation: synthetic terminal/refusal/auth/quota/transport/malformed/cancellation cases preserve sanitized category and intended retry/terminal semantics, with unknowns explicit. Do not expose raw secret-bearing provider output or switch providers to evade refusal. Delta did not rerun the mock. BASELINE.md retains the unmerged Mac refusal-classification patch. Reed reports profiles excluded from the model pool and no active pool setting; no active cross-provider fallback is claimed.

1. **P0 acceptance description:** freeze the actual effective model/role/tool/capture/scope/budget/stop/resume configuration; design one separately admitted owned ARTEX exercise. Existing chat/tool plumbing is not discovery acceptance.
2. **P1 local method drafts:** prepare three concise, source-linked procedures: research/hypothesis selection (planner + worker); fresh positive/control challenge (reviewer/retester); evidence-preserving report/retest (reporter). Preserve unknowns, failed approaches, source versus runtime access, and original native IDs. Inspect role prompt variables and native skill format before packaging. No upload/settings change is authorized by this planning task.
3. **P1 manual artifact mapping:** inspect one actual neutral native export, map it into the existing canonical reader, and record missing identity/build/completeness fields. Only a demonstrated recurring loss justifies mapping code. Reporter and model verdicts do not supply independent custody or a universal effect oracle.
4. **P2 comparison:** change one method under equal access/budget; retain failures, assistance and total setup/model/tool/review effort. Owner keeps evaluator, protected answers and permission policy outside investigator authority. Discard a method that adds no supported insight or labor benefit.
5. **P2/P3 specialists:** retrieve a specific class/product method or add one observation tool only for a measured gap. Cloud/AD/endpoint/mobile/source access are distinct scopes, not prerequisites for a web baseline. Existing stops remain in force; do not rerun the blocked Nuclei build or historical stopped labs.

**Do not carry forward:** alternate engine/dashboard/blackboard stacks where native ARTEX overlaps; catalog-as-install-list; confirmed/fixed/closed/timeout as semantic proof; generic response divergence as ownership verification; solved-only learning promotion; model-tier consensus as authority; familiar/assisted benchmark scores as held-out performance; automatic self-modification of evaluator, platform or permissions. Preserve those studies as research/provenance rather than delete them.

**What remains unresolved:** effective skill visibility/current prompt versions, an actual neutral export's field sufficiency, hard mediation and quiescence across enabled paths, real browser/inbox availability, general effect predicates, changed-build repair and protected unfamiliar-task evaluation. Missing evidence blocks the associated claim, not unrelated read-only preparation.
<!-- DELTA-EXTENSION-MAP-END -->

`;
let next=original;
const decisionText=`<!-- KOTARO-PRODUCT-DECISIONS-START -->
### Confirmed enhancement priorities — 2026-10-21

**Provenance:** ${decisions.provenance}

- **Primary objective A:** ${decisions.objective}
- **Default access:** ${decisions.access}
- **Ordinary accounts:** ${decisions.accounts}
- **Human assistance/resume:** ${decisions.assistance}
- **Continuous search after a finding:** ${decisions.continuation}

**Ongoing decision coordination:** Kotaro transferred the continuing discussion, context and tasks from Reed to Linden (message 12044). Heron subsequently assumed coordination in place of unavailable Linden (message 12209; security receipt fc0f3f8). Route further product decisions through Heron; preserve this canonical plan/report mapping rather than creating another plan.

**First enhancement package, in order:**

${decisions.firstPackage.map(([title,description],i)=>`${i+1}. **${title}:** ${description}`).join('\n')}

This sets the near-term ordering of the research destination map below: external discovery/account/session/handoff/coverage/access-boundary/workflow methods first, with chain hypotheses using the same queue/cap and evidence discipline. Source-assisted methods and extra specialist stacks remain available for explicitly matching input modes, not default prerequisites. Existing native mechanisms still need effective configuration/acceptance checks before any missing implementation is inferred.

### Locked loop, grading and P0 decisions — Linden12051

These later product decisions supersede earlier generic saturation/time-budget completion proposals and any suggestion of a separate chain mode. They define requirements, not current ARTEX behavior or permission to implement/run the benchmark. Keep **hypothesis terminal state**, **finding evidence grade** and **run outcome label** separate. Queue exhaustion includes blocked hypotheses as terminal for the current run, so complete does not mean all roadblocks were resolved or all possible vulnerabilities were tested; export the blocked/unexplored counts and limitations.

${decisions.lockedProtocol.map(([title,description],i)=>`${i+1}. **${title}:** ${description}`).join('\n\n')}

**Implementation questions to resolve through Heron, without changing the locked decisions:**

${decisions.unresolvedProtocol.map(s=>'- '+s).join('\n')}

The queue-order rationale is an intended prioritization benefit, not proof that remaining or never-generated leads have low impact. Refuted is not synonymous with unsupported/failed collection; a failure to execute must retain its actual roadblock/error evidence. P0's kill test is a recovery interruption followed by resume, not a third successful-completion rule. P1's three method drafts (hypothesis selection, positive/control challenge, evidence-preserving report/retest) must follow this contract. Existing stopped-work/account restrictions remain; changing execution-control policy or starting target containers requires the separate authorized implementation/exercise scope.

**Authority:** ${decisions.authority}
<!-- KOTARO-PRODUCT-DECISIONS-END -->

`;
if(next.includes('<!-- KOTARO-PRODUCT-DECISIONS-START -->'))next=next.replace(/<!-- KOTARO-PRODUCT-DECISIONS-START -->[\s\S]*?<!-- KOTARO-PRODUCT-DECISIONS-END -->\s*/,decisionText);
else next=next.replace('## 2. How to read the status',decisionText+'## 2. How to read the status');
if(next.includes('<!-- DELTA-EXTENSION-MAP-START -->'))next=next.replace(/<!-- DELTA-EXTENSION-MAP-START -->[\s\S]*?<!-- DELTA-EXTENSION-MAP-END -->\s*/,text);
else {if(!next.includes('## 9. Update procedure'))throw new Error('Canonical insertion anchor absent');next=next.replace('## 9. Update procedure',text+'## 9. Update procedure');}
const log='| 2026-10-21 | Delta mapped all 32 compared projects/tool families to exact native skill/prompt/task/tool/MCP/control/evidence destinations after fresh co-op source reads, with consumers, dependencies, priorities and validation; visual full-corpus report linked. Planning only, no application/settings changes. |';
next=next.replace(log+'\n','');
next=next.replace(/(\| 2026-10-21 \| Rook[^\n]*\n)/,'$1'+log+'\n');
const decisionLog='| 2026-10-21 | Kotaro, relayed by Reed12041, selected actual-issue count plus supported impact; external black-box default; two or more controlled ordinary accounts; recorded human onboarding help and resume; discovery/session/handoff/coverage/boundary/workflow package before chain assessment. Requirements only; no target or runtime authorization. |';
if(!next.includes(decisionLog))next=next.replace(log,log+'\n'+decisionLog);
const continuationLog='| 2026-10-21 | Kotaro, relayed by Reed12044, selected automatic continued searching after discovering/verifying each issue within agreed scope and existing limits; finding is not a per-finding approval checkpoint. Ongoing discussion/context/tasks transferred to Linden. Requirements only; no runtime action. |';
if(!next.includes(continuationLog))next=next.replace(decisionLog,decisionLog+'\n'+continuationLog);
const lockedLog='| 2026-10-21 | Linden12051 relayed locked queue-only completion, generated-hypothesis cap/drain budget-limited outcome, terminal states, action tiers, separate finding grades, observation-cited hybrid generation, impact queue, same-queue chains and three-container P0/acceptance contract. Planning only; ambiguities tracked for Linden, no implementation or benchmark execution. |';
if(!next.includes(lockedLog))next=next.replace(continuationLog,continuationLog+'\n'+lockedLog);
const heronLog='| 2026-10-21 | Heron12209 / security fc0f3f8 relayed Kotaro decisions: all unique seed/model admissions count toward pilot cap30; duplicate merges free; post-finish blocked resolution uses new linked run preserving original; recall ceil(N/3), actual eligible subset/N shown before executable freeze. Heron replaces unavailable Linden as coordinator. Documentation only; no runtime/readiness claim. |';
if(!next.includes(heronLog))next=next.replace(lockedLog,lockedLog+'\n'+heronLog);
fs.writeFileSync(plan,next);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync(path.join(import.meta.dirname,'canonical-update.json'),JSON.stringify({at:new Date().toISOString(),file:'docs/SYNAPSE-PLATFORM.md',beforeSha256:hash(original),afterSha256:hash(next),projectRoutes:projects.length,applicationSourceChanged:false,settingsChanged:false,scope:'Canonical research-routing section, confirmed product-priority decision section and their change-log rows only; original canonical text preserved outside those insertions.'},null,2));
console.log('Canonical mapping updated: '+projects.length+' routes; no application source/settings changes.');
