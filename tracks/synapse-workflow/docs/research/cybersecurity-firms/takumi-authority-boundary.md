# Takumi: organization approval is different from target ownership

Read 2026-10-17. The [ownership manual](https://shisho.dev/docs/t/assessment/features/assessment-authentication/), updated October 16, documents **two alternative gates** for dynamic assessment.

An enterprise applies for organization authentication; the provider describes approximately 2–3 business days for approval. An authenticated organization can dispatch dynamic assessments without per-target ownership verification. Consulting/outsourcing arrangements involving other entities are expressly contemplated, subject to lawful authorization. This is not documented as a technical proof of permission for every target.

Otherwise an owner or Takumi manager verifies a target through a DNS TXT token at `_takumi-ownership.<domain>` or a plaintext token served with HTTP 200 at `/.well-known/takumi-ownership`. Other users can dispatch against already verified applications without seeing the verification token. Verification failure prevents dispatch on this path. The page describes a ten-second same-target cooldown; token expiry, revalidation and exact host/subdomain scope are not established.

The [GitHub integration guide](https://shisho.dev/docs/g/getting-started/integrate-apps/github/), also updated October 16, limits an installation to one Shisho organization and distinguishes self-installation from administrator approval. Its extracted text does **not** enumerate complete App permissions. The Autofix manual establishes Contents read/write, not a complete least-privilege manifest.

No tokens, DNS records, target requests, installation or account connection were used.

Japanese-source cross-check: the complete [organization/ownership manual](https://shisho.dev/docs/ja/t/assessment/features/assessment-authentication/) and [GitHub integration guide](https://shisho.dev/docs/ja/g/getting-started/integrate-apps/github/) agree on these gates (both October 16). Image-only permission details were not inspected; complete scope enumeration stays unknown.
