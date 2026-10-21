# Security Copilot: enabled capacity comes with data and role defaults

Read 2026-10-17: complete [auto-provisioning manual](https://learn.microsoft.com/en-us/copilot/security/auto-provisioning-security-copilot), updated June 18, 2026.

For enabled eligible E5/E7 tenants, provisioning creates capacity/default workspace or uses the earliest existing workspace. Workspace scope determines storage, capacity and owner/contributor access.

Storage defaults to Entra geography, accounting for supported Microsoft 365 overrides. **GPU prompt processing is different:** EU storage defaults to EU processing; non-EU storage defaults to global processing in US/UK/EU/ANZ according to locality/capacity. Japanese storage therefore does not establish Japanese inference.

Two optional human-review/model-improvement sharing settings default off. Access to Microsoft 365 service data defaults on; supported queries can copy/process/store data under applicable permissions. These are separate settings.

Owner inheritance includes security, conditional-access, Intune and named compliance/data-governance administrators, beyond Global Administrator. Contributor inheritance depends on relevant Defender/Intune/Purview role permissions. Assignments are editable; the page does not establish this tenant's effective privileges or a universal immutable audit record.

**Operational implication:** onboarding includes reviewing storage, processing, service-data access and inherited roles, alongside purchased capacity. This research did not inspect or change any tenant.

[Pricing/capacity scope](pricing-capacity-boundaries.md) remains separate from agent deployment and per-action approval.
