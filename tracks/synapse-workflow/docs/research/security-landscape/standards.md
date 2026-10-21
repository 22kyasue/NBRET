# Standards and bodies of knowledge

Checked 2026-10-17. Versions identify evidence, not an automatic claim of assessment conformance.

| Resource | Verified state | What it contributes | What it does not establish |
| --- | --- | --- | --- |
| [OWASP WSTG](https://owasp.org/www-project-web-security-testing-guide/) | Stable 4.2; page says 5.0 is under development | Web-test techniques and identifiers; cite versioned tests | Complete business logic, all surfaces, legal permission or that a tester actually executed a case |
| [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) | Stable 5.0.0; official page recommends version-qualified identifiers | Explicit technical security requirements and verification rigor | A scanner test suite or blanket compliance certificate; a checked item still needs evidence |
| [MITRE ATT&CK](https://attack.mitre.org/resources/updates/) | Current live updates page says v20 / v20.0, October 13, 2026 | Common adversary behavior vocabulary, intelligence and detection context | Test safety, complete attack emulation, or percentage resilience from technique counts |
| [NIST SP 800-115](https://csrc.nist.gov/pubs/sp/800/115/final) | Final September 2008, superseding 800-42 | Planning, technical techniques, limitations, findings and mitigation lifecycle | A comprehensive modern cloud/agent methodology; age must be made visible |
| [PTES](http://www.pentest-standard.org/index.php/Main_Page) | Main page calls itself v1.0; last edited August 16, 2014; says v2 planned | Seven-phase engagement structure from pre-engagement through reporting; separate technical guidance | Evidence that v2 is released, current product certification or exhaustive per-asset controls |
| [CREST guide](https://www.crest-approved.org/wp-content/uploads/2023/04/A-Guide-to-Penetration-Testing-2022.pdf) | December 2022 edition reviewed; not asserted to be the newest publication in every CREST program | Preparation, supplier selection, test management and follow-up/maturity | That every CREST-affiliated engagement has complete coverage or a given legal status |

ATT&CK search results were inconsistent: cached summaries mentioned v19 while another page exposed v20. The live official updates page resolves the version for this review; a saved page is retained. This is why copied search snippets are insufficient version evidence.

ASVS likewise uses stable-versus-bleeding-edge wording in different page components; use the explicit stable 5.0.0 release link for requirements. Preserve identifiers with the version because numbering changes. WSTG `latest` content must not silently substitute for 4.2.

## Procurement and geography

The UK NCSC describes [CHECK](https://www.ncsc.gov.uk/schemes/check/find-an-assured-check-provider) as an assurance scheme for authorized testing of public-sector and critical-national-infrastructure systems. This is a procurement/credibility distinction, not a universal requirement for every UK buyer.

The ECB [announced a TIBER-EU update on February 11, 2025](https://www.ecb.europa.eu/press/intro/news/html/ecb.mipnews250211.en.html) to align with DORA threat-led penetration-testing standards. That supports demand for governed exercises and accountable evidence in the covered financial context. It does not mean every financial organization, every pentest or every provider automatically satisfies DORA. Applicability and formal acceptance require the relevant authority and engagement-specific analysis.

This dossier is market/technical research, not a legal applicability opinion. Vendor claims that a pentest is universally “required by SOC 2” or “HIPAA-compliant” are not adopted as legal conclusions here. Contractual customer expectations, audit evidence and specific statutory obligations must be separated.
