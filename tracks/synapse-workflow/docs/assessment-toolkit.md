# Client assessment toolkit

This is the first implemented service workflow derived from the research: a scoped web/API assessment with explicit identity-aware tests, retained observations, reviewed findings and repair verification. It is a local CLI toolkit. The current implemented slice is JSON HTTP authorization and predefined sequential request cases; it is not an autonomous pentester or a complete client-ready assessment practice.

## The service we can build around it

Offer a **web application and API security assessment with remediation verification**. Start with one application, named environments, representative roles/tenants and agreed business workflows. Deliver an asset/access map, a tested coverage ledger, reviewed findings with reproducible evidence, engineering guidance and one scoped retest.

Three useful engagement forms:

| Engagement | Work | Deliverable |
| --- | --- | --- |
| Initial audit | Review architecture/access/configuration and observe approved workflows; identify coverage gaps | Risk observations and a prioritized test plan; distinguish suspected weaknesses from demonstrated findings |
| Scoped pentest | Exercise agreed hypotheses and validate consequences under representative identities | Reviewed findings with evidence, business impact, affected conditions and repair guidance |
| Release/retest service | Repeat selected invariants after changes and investigate regressions | Version-bound verification, reopened findings and explicit remaining coverage |

Proposed scope expansions include session security, business-state transitions, exposure/configuration review, source-assisted analysis and selected scanner evidence. Each needs its own implemented adapter, known-answer evaluation and service procedure. Infrastructure/AD, cloud authorization, AI-agent assessments and defender validation are later specialist modules. This document does not claim those integrations are built.

## Operating workflow

1. **Intake and authority:** record the business objective, client owner, assets, environment, account roles, dates, excluded actions, contact/escalation route and approved operations. Link the actual scope agreement. Templates do not establish permission.
2. **Access and understanding:** obtain synthetic/representative test data and role accounts. Use existing NBRET capture, route discovery and workflow understanding to map observations. Confirm actual identity with the application owner; labels alone cannot authenticate a session.
3. **Write the rule:** express who may perform which operation on which resource and in which state. Establish legitimate positive controls. Have the client/domain owner confirm the intended rule.
4. **Plan and execute:** inspect the explicit case list; execute only the approved cases within time/byte budgets. Existing Capture/Explore and Scan remain separate operations with their own authorization. They are not automatically invoked by `assess`.
5. **Adjudicate:** inspect the exact observation, preconditions and control results; distinguish a genuine consequence from stale identity, reflected data, missing evidence or a scanner hypothesis. Record severity, demonstrated impact, owner, rationale and remediation.
6. **Engineering handoff:** provide the report and restricted evidence bundle; explain root cause and nearby variants. Customer systems are not patched by this toolkit.
7. **Retest:** collect a new run at a distinct repair revision, preserving the original rule/actors/policy/requests and functioning control cases. Keep still-reproduced and inconclusive results visible. Broader class fixes need additional cases.

Client Shopify remains audit-only unless Kotaro explicitly approves the specific mutations/testing scope. General engagement instructions do not override that standing rule.

## Commands

All output directories must be new. Prefer ignored `runs/`. These commands do not overwrite prior runs.

```sh
npm run assess -- init --out runs/client-draft
npm run assess -- plan --engagement runs/client-draft/engagement.json --out runs/client-plan
```

Edit the generated engagement to match the actual authorized environment and policies. Its initial authorization is deliberately `draft` and has placeholder/expired dates. Credentials are supplied through named environment variables referenced by each actor's `headersEnv`; header values are never written as request headers. Do not put secrets into URLs, case bodies, descriptions or expected values. The v1 adapter intentionally supports path-only URLs and JSON responses.

After the actual client approval has been obtained, record its reference, approver, permitted case IDs and valid time window in `authorization`. All request methods have an explicit `effect`; even a GET may change state. Writes require `authorization.allowWrites: true` in addition to case approval. Declaring a state-changing operation `read` cannot make it harmless: the operator must review endpoint behavior.

```sh
npm run assess -- run --engagement runs/client-draft/engagement.json --out runs/client-initial
npm run assess -- evaluate --engagement runs/client-initial/engagement.json --evidence runs/client-initial/evidence.json --out runs/client-offline-review
npm run assess -- review --run runs/client-initial --reviews runs/client-draft/reviews.example.json --out runs/client-reviewed
```

Replace every review placeholder with a real adjudication. The review command does not invent impact or severity. Offline evaluation sends zero requests and evaluates the historical observation only. It requires the exact engagement/configuration digest and exactly one matching observation per case.

For a retest, copy the engagement to a new input file and update its environment revision, session epoch if sessions changed, credentials and authorization window as necessary. Keep stable principal, tenant, role, policy and case semantics unchanged for comparison. Obtain a fresh run, then compare against reviewed findings:

```sh
npm run assess -- run --engagement repair-engagement.json --out runs/client-repaired
npm run assess -- retest --previous runs/client-reviewed --current runs/client-repaired --out runs/client-retest
```

Changing a policy, assertion, resource, actor or control makes the old finding incomparable rather than silently repaired. Session epoch and deployment revision may change, and both are retained. A repair that denies every user fails its legitimate control and cannot verify closure. The CLI returns 2 for a retest with no confirmed findings to verify.

Run the complete synthetic lifecycle:

```sh
npm run demo:assessment
node --test test/assessment.test.mjs
```

The demo creates its own loopback-only fictional order service, demonstrates disclosure despite a 403 response, applies a scripted known-answer review, switches the owned fixture to its repaired mode, and verifies the original denial plus legitimate owner access. No real client or upstream security runtime is exercised. The review in this teaching demo is explicitly scripted, not independent human validation.

## Generate an authorization matrix

The `matrix` command expands the declared actors against each resource and its allowed actor list. Every allowed actor becomes a positive control; denied actors require both a refusal status and absence of the private object.

```json
{
  "schemaVersion": 1,
  "resources": [{
    "id": "bob-order",
    "url": "http://127.0.0.1:3000/api/orders/2",
    "allowedActors": ["bob"],
    "preconditions": "Synthetic order 2 belongs to Bob in tenant B",
    "identity": {"path": "/order/owner", "equals": "bob"},
    "privateObjectPath": "/order",
    "deniedStatuses": [403, 404]
  }]
}
```

```sh
npm run assess -- matrix --engagement runs/client-draft/engagement.json --matrix matrix.json --out runs/client-matrix
```

Generated engagements return to draft authorization because the cases changed. Generation does not infer the correct business policy or prove exhaustive role coverage.

## Evidence and finding contracts

`engagement.json` holds the scoped intent. `evidence.json` contains the observed exchanges and identity envelopes. `results.json` contains derived case assertions and candidate findings. `REPORT.md` presents those results and limitations. `progress.json` and `checkpoint.json` retain progress and partial observations if a later operation fails; a checkpoint marked running is not a completed run.

Each evidence binding includes engagement ID, environment ID/revision, policy revision, non-secret principal/tenant/role/session epoch, case ID, preconditions, exact request and oracle. Duplicate matches, stale configurations and changed bytes become unavailable/incomplete. Hashes preserve relative integrity, not authenticity of a hostile producer.

The adapter retains structured, key-redacted JSON and removes known credential header values reflected in string values. It omits unstructured bodies and response headers. Header assertions are rejected. The evidence can still contain personal data or secrets: object keys, transformed/encoded secrets and unrecognized fields are not comprehensively sanitized. Store run folders with suitable access restrictions and a client retention/deletion policy. No encryption, tenant-hosted storage, access audit service or secure deletion guarantee is implemented.

Case results are `passed`, `failed` or `incomplete`. A failed security property with working controls creates a `reproduced-candidate`, awaiting review. Failed controls make that candidate `inconclusive`. Reviews can confirm, reject or request further investigation. A test pass is always scoped to its explicit predicate; there is no overall percentage-secure score. Client reports should include additional manual observations and coverage gaps rather than treating these generated cases as the whole assessment.

## Current execution boundaries

- Exact HTTP(S) origin membership and explicit path-only case URLs; redirects are observed and never followed. This is application-level request selection, not an OS/network sandbox or destination-IP/DNS-pinning boundary.
- Sequential bounded requests; no shell commands, scanner execution, arbitrary plugins, background job fanout, browser launch or agent-selected targets.
- Credentials are resolved before any request. Missing credentials, invalid grants or out-of-scope cases fail preflight. Grants are rechecked against the execution deadline through their expiry time.
- Cancellation prevents subsequent cases; an already running request is allowed to finish or reach its bounded timeout. No immediate in-flight abort or process-kill guarantee is claimed.
- The byte budget limits each response and retained entry data. Metadata/checkpoint files add overhead; this is not a total disk quota or a global network-byte cap.
- Runs are local trusted operator files. A person able to replace both evidence and hashes can forge them. Client consent, session validity, identity labels and build revision need independent corroboration.

## Research decisions carried into code

| Research observation | Implementation |
| --- | --- |
| [NBRET-E01: wrong identity on offline reuse](research/security-landscape/lab-results.md) | Exact identity/configuration binding; ambiguity and stale config rejected |
| [Deceptive refusal and semantic validation](research/assessment-evidence/framework.md) | Security assertions require JSON content predicates, plus passing controls |
| [Submission/completion differ from outcome](research/security-landscape/deep-review/report-interpretation.md) | Execution terminal state, test verdicts, reviewed finding and repair verdict remain distinct |
| [Report transformations can lose provenance](research/toolchain/reporting-retest.md) | Retain original observations, hashes, stable case IDs and parent review digest |
| [Operating delivery exceeds a scanner report](research/cybersecurity-firms/service-process-comparison.md) | Intake, accountable review, engineering handoff and fresh retest in the playbook |

The repository research spans considerably more than this implementation. Deep dependency annotations and pending queues remain research, not shipped capabilities. Existing approved cutoffs and stopped operations are preserved.

## Next build increments and acceptance gates

1. **Real session identity:** integrate owned-app whoami/session evidence and short-lived credential delivery; evaluate rotated, expired and mislabeled identities before promoting the labels to verified facts.
2. **Stateful business workflows:** add explicit extracted variables, approved transitions, state resets, cleanup observations and revision-aware approval predicates. Current sequential cases do not model races or automatically discover state machines.
3. **Scanner evidence:** import original ZAP/Nuclei artifacts with exact tool/template/rule/run/scan/message IDs, scope attribution, stopped/failed rules and truncation. Alerts remain hypotheses until controlled validation and review. Existing NBRET scanner summaries lose proof fields and should not become confirmed findings automatically.
4. **Coverage and source-assisted audit:** link capture/discovery/source observations to a role × workflow × interface ledger; preserve unknown, denied, missing, unsupported and untested states. Build a reviewed checklist informed by versioned OWASP WSTG, without claiming complete coverage merely from a checklist.
5. **Operational readiness:** independent reviewer workflow, encrypted evidence storage, tenant isolation, retention/audit controls, vetted reporting template, access-ready pilot acceptance and measured total delivery hours. These are prerequisites to stronger commercial promises.

Primary methodology references: [OWASP WSTG](https://owasp.org/projects/web-security-testing-guide) supplies the web-testing reference structure; [NIST SP 800-115](https://csrc.nist.gov/pubs/sp/800/115/final) supplies planning, assessment, analysis and mitigation context. The toolkit is not a certification or proof of conformance to either publication.
