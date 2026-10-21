# Standards and procurement frameworks

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 4 findings, 3 related corrections, 0 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [CHECK, TIBER-EU/DORA are sector-specific; "required by SOC 2" is not a legal finding](#standardsprocurement-regimes) | public-doc | commercial, scoping |
| [Cite WSTG 4.2 (not 5/latest), ASVS 5.0.0 versioned IDs, ATT&CK v20, NIST 800-115 (2008)](#standardsversions-to-cite) | public-doc | scoping, reporting |
| [Each finding needs a versioned claim record with status, oracle and revalidation trigger](#standardsclaim-record-fields) | synthesis | evidence, reporting, retest |
| [Open-world recall is unknowable; only seed recall on planted faults has a denominator](#standardsrecall-unknowable-measures) | synthesis | reporting, ai-evaluation, scoping |

### standardsprocurement-regimes

**`standards.procurement-regimes`: CHECK, TIBER-EU/DORA are sector-specific; "required by SOC 2" is not a legal finding** (public-doc)

UK NCSC CHECK is an assurance scheme for authorized testing of public-sector and CNI systems, not a universal UK requirement. The ECB announced (Feb 11, 2025) a TIBER-EU update aligning with DORA threat-led penetration testing, supporting demand for governed exercises in covered financial contexts, but not meaning every pentest satisfies DORA. Vendor claims that a pentest is universally required by SOC 2 or HIPAA-compliant are not adopted as legal conclusions.

**Do:** Do not market a standard pentest as DORA/TLPT- or compliance-satisfying; applicability needs the relevant authority and engagement-specific (legal) analysis. Sector regimes shape deliverable formality.

**Limits:** Market/technical research, not a legal opinion; Japanese regimes (IPA, FISC/TLPT) were not covered in this file.

**Sources:** [security-landscape/standards.md:20](../../security-landscape/standards.md#L20), [security-landscape/standards.md:22](../../security-landscape/standards.md#L22), [security-landscape/standards.md:24](../../security-landscape/standards.md#L24)

### standardsversions-to-cite

**`standards.versions-to-cite`: Cite WSTG 4.2 (not 5/latest), ASVS 5.0.0 versioned IDs, ATT&CK v20, NIST 800-115 (2008)** (public-doc)

Checked 2026-10-17: OWASP WSTG stable is 4.2 with 5.0 under development, and latest content must not silently substitute for 4.2. ASVS stable is 5.0.0 and identifiers must be version-qualified because numbering changes. MITRE ATT&CK live updates page says v20 (October 13, 2026) while cached snippets said v19. NIST SP 800-115 is final September 2008 (age must be visible). PTES main page is v1.0, last edited August 16, 2014, v2 only planned. CREST guide reviewed is the December 2022 edition.

**Do:** Test plans and reports must cite exact standard versions and identifiers; verify versions from the live official page, not search snippets; disclose the age of 800-115/PTES when citing them.

**Limits:** Versions identify evidence, not conformance; standards do not establish legal permission, business-logic completeness or that a case was executed.

**Sources:** [security-landscape/standards.md:7](../../security-landscape/standards.md#L7), [security-landscape/standards.md:16](../../security-landscape/standards.md#L16), [security-landscape/standards.md:8](../../security-landscape/standards.md#L8), [security-landscape/standards.md:14](../../security-landscape/standards.md#L14), [security-landscape/standards.md:10](../../security-landscape/standards.md#L10)

### standardsclaim-record-fields

**`standards.claim-record-fields`: Each finding needs a versioned claim record with status, oracle and revalidation trigger** (synthesis)

The framework's evidence-backed claim record has these parts:
- stable ID, owner, reviewer and tenant classification;
- exact predicate and policy authority;
- environment/build identity and the access used;
- positive and negative cases;
- evidence with time, digest, producer and redaction history;
- a status: proposed, attempted, blocked, observed, independently verified, contradicted, stale or revoked;
- exclusions;
- remediation owner, retest and change-based revalidation trigger.
A digest binds bytes but does not prove origin.

**Do:** Adopt a claim record of this shape for client findings so they can be challenged, reproduced and rechecked after change.

**Limits:** Proposed design; whether it reduces reviewer error is untested.

**Sources:** [assessment-evidence/framework.md:43](../../assessment-evidence/framework.md#L43), [assessment-evidence/framework.md:47](../../assessment-evidence/framework.md#L47)

**Contrary or narrowing evidence:**
- [assessment-evidence/coverage.md:22](../../assessment-evidence/coverage.md#L22): Benefit unmeasured.

### standardsrecall-unknowable-measures

**`standards.recall-unknowable-measures`: Open-world recall is unknowable; only seed recall on planted faults has a denominator** (synthesis)

The framework defines seed recall, finding precision, negative-case behaviour, evidence completeness, reproducibility, time to verified result, remediation verification and defensive outcomes, each with a qualification. Recall is unknowable when the true vulnerability set is unknown. Repeat engagements do not supply it, and capture-recapture assumptions are often violated. Known-answer fixtures cannot establish open-world recall.

**Do:** Never quote a detection or coverage percentage for a client system. Report tested space, exclusions and blocked items in a multidimensional limits ledger instead.

**Limits:** This is a proposed protocol, not a validated score.

**Sources:** [assessment-evidence/framework.md:28](../../assessment-evidence/framework.md#L28), [assessment-evidence/framework.md:19](../../assessment-evidence/framework.md#L19), [assessment-evidence/framework.md:65](../../assessment-evidence/framework.md#L65)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| medium | [assessment-evidence/framework.md:30](../../assessment-evidence/framework.md#L30) | [assessment-evidence/deep-garak.md:178](../../assessment-evidence/deep-garak.md#L178) | Describe garak evaluation counts as output-per-detector judgments, not prompt counts. |
| low | [security-landscape/standards.md:14](../../security-landscape/standards.md#L14) | [security-landscape/standards.md:14](../../security-landscape/standards.md#L14) | Cite ATT&CK v20 (as of 2026-10-17) and re-check the live page. |
| low | [assessment-evidence/continuation-exhaustion.md:735](../../assessment-evidence/continuation-exhaustion.md#L735) | [assessment-evidence/continuation-exhaustion.md:735](../../assessment-evidence/continuation-exhaustion.md#L735) | grpc-gateway is BSD-3-Clause. |
