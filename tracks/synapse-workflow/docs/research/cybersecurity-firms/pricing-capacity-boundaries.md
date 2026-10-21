# Pricing: a capacity allowance is different from an analyst or a completed case

Accessed 2026-10-17. The following public terms are dated evidence, not customer quotes. Unlisted prices remain unknown.

## Microsoft: two capacity models

The [pricing page](https://www.microsoft.com/en-us/security/pricing/microsoft-security-copilot/) describes minimum one provisioned security compute unit (SCU), hourly reservation billed monthly, and usage-based overage. Its USD example uses $4 per provisioned SCU/hour and $6 per overage SCU. Unused reserved capacity still costs money. Regional/agreement/tax differences apply.

The [E5/E7 inclusion manual](https://learn.microsoft.com/en-us/copilot/security/security-copilot-inclusion), updated June 19, describes 400 SCUs/month per 1,000 paid user licenses, scaling proportionally and capped at 10,000. This shared tenant bucket resets without rollover and is not an hourly reservation. Rollout is phased; eligibility does not prove a given tenant is already enabled.

The manual says future throttling/paid excess will receive advance notice; that wording does not establish present enforcement. Partner agent licenses, Logic Apps, Sentinel data-lake compute/storage and other prerequisite products can cost extra.

Capacity auto-provisioning does **not** automatically deploy agents. The manual says agents require setup/deployment. Default provisioning enables access to supported Microsoft 365 service data while improvement sharing is off; administrators retain choices. [Provisioning defaults are now traced](security-copilot-provisioning.md).

## Google: a data benefit is not a complete platform price

The [Security Operations benefit page](https://cloud.google.com/products/security-operations/pricing), captured in Japanese, exempts eligible sources from a qualifying subscription's data cap. Examples include up to 10 GB/day each for Cloud Audit and Workspace logs, and approved third-party EDR **alerts**, excluding raw logs.

Eligibility requires Enterprise/Enterprise Plus, eligible contract date and Google's current minimum annual spend threshold; the number is not disclosed here. Benefits begin after tenant provisioning and activation, have no unused-period carryover or retroactive credit, and do not stack.

The capture also lists a separately conditioned Wiz Defend benefit for agreements from October 8, 2026; do not apply it universally. This page does not disclose a complete ingestion tariff, TIN per-investigation price or managed analyst fee.

## Limits of comparison

One endpoint price, one ingestion allowance and one SCU cannot be converted into equivalent coverage without workload, licensing, retention, source volume and operating-responsibility assumptions. A cheap generated verdict can still require costly human investigation or recovery.
