# A report as executable, bounded claims

## Worked claim: approval belongs to a specific revision

Claim `APPROVAL-REV-01`: in this synthetic invoice workflow, payment is allowed only for an invoice approved at its current revision; editing invalidates approval. A maker may submit payment but may not approve. An approver from another tenant may not approve the invoice. These are declared business rules, not rules inferred from the implementation.

**Assumptions:** authenticated actor attributes are trustworthy; one operation runs at a time; the object is the only authoritative state; there is no administrative exception. **Environment:** Node version and fixture SHA-256 in the [receipt](lab-receipt-20261017.json). **Tested roles/paths:** maker Alice A, approver Bob A, approver Eve B; six sequences covering draft payment, approved payment, stale approval after edit, cross-tenant approval, self-approval and duplicate payment. **Evidence:** before/after objects, actor/action, decisions and independent expected sequence outcomes. **Revalidation:** changes to transition code, role policy, approval semantics, interfaces or persistence should stale the claim.

The regression is intentionally required to fail on weaker implementations. An all-deny implementation would fail the valid-payment case. A permissive implementation fails draft payment. The one-instance repair passes the direct denial while failing the stale-approval sequence. The class repair passes the selected cases. Tests should retain positive functionality and nearby negative cases so a fix cannot “succeed” simply by breaking the workflow.

## Reproduce

From repository root, use a new output path:

```powershell
node docs/research/assessment-evidence/lab.mjs docs/research/assessment-evidence/lab-receipt-repeat.json
```

The script uses exclusive file creation and refuses to overwrite a receipt. It performs no networking, launches no subprocess, uses no credentials and calls no model API. Its imports are Node built-ins only. A failed assertion exits nonzero. The retained run contains 18 implementation/case combinations; six of six class-repair cases passed and the two predefined weak-implementation failures were observed. This is a fixture validation, not a measured assessment-tool recall result.

## Additional linked claims

The attack-path exercise requires every prerequisite for each transition. With session, console reachability, grant authority and mail reachability, `mail-read` is reachable in the model. Removing grant authority makes it unreachable. The result is explicitly `demonstrated: false`: no account, cloud API or network service is involved. The monotone graph cannot model revocation during an execution, cycles consuming resources, race conditions or uncertainty in collected permissions. A real path needs versioned facts and step-specific validation.

The capability exercise treats a hostile target instruction as data and submits candidate actions directly to a code gate. One allowed read passes; export and another tenant's read fail. The gate validates operation, tenant, record and unexpected fields against fixed policy. This establishes those gate decisions only. It is not an LLM prompt-injection benchmark, an operating-system sandbox or proof that all execution paths use the gate. A real system must prevent bypass through shell, network, filesystem and alternate tools.

The defender exercise classifies four manually supplied event-state records. It distinguishes missing telemetry, missed alert and missing containment. It validates bookkeeping logic, not event collection, detection quality or responder performance. Those need a real isolated instrumented endpoint, a detection backend and an approved response exercise.

## Why this is not universal proof

Finite examples leave untested inputs and interleavings. The fixture has no bulk endpoint, database transaction, cache, webhook, asynchronous worker, recovery path or delegated administrator. Correct behavior in one function does not establish the behavior of every caller. Stronger evidence could combine domain-reviewed specifications, central policy enforcement, property-based state-machine tests, transactional invariants, source analysis and deployment-specific runtime tests. Even formal reasoning would remain conditional on the model, specification and implementation correspondence.

## Moving from report prose to a claim bundle

The report remains useful for context, consequences and judgment. Attach executable cases with policy authority, versioned fixtures, prerequisites, evidence references and explicit exclusions. Separate a safe regression from a dangerous reproduction: a production retest may need a read-only policy query or synthetic canary rather than a replay of the original attack. Require review when new versions change effects. Preserve the failed hypothesis, because it prevents another analyst from repeating an already invalidated path without noticing changed assumptions.

If a claim uses a generic state comparator, include its extraction schema, ignored bookkeeping, normalization and budget/completeness status too. The [comparison dependency trace](deep-deepdiff.md) explains why a successful export, empty scoped diff or repeated identical verdict is insufficient without that contract. This invoice fixture uses explicitly specified built-in state fields; the dependency study does not retroactively change its implementation or receipt.

Tomo's complementary work owns the actual NBRET HTTP tenant/status/redirect lab in `../security-landscape/` and `scripts/research-security-lab.mjs`. This local experiment deliberately does not duplicate that fixture or claim that NBRET already consumes this record format.
