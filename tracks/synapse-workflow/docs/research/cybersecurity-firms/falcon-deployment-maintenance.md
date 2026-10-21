# Falcon deployment: identity, region and policy are separate controls

Accessed 2026-10-17. Complete main text read for the public [falcon_configure role](https://developer.crowdstrike.com/falcon-sensor/ansible/roles/falcon-configure/) and [sensor_update_policy module](https://developer.crowdstrike.com/falcon-sensor/ansible/modules/sensor-update-policy/). These are documentation for automation components, not a runtime or complete deployment audit.

## Who supplies what

The configure role assumes the sensor is already installed. The operator supplies the customer ID (CID) with checksum or grants credentials to retrieve it. Its documentation requires privileged execution (sudo/runas); Windows defaults to SYSTEM. API identity, endpoint privilege and the customer/tenant association are different authorities.

API cloud selection and sensor cloud selection are separate variables. Explicit sensor region requires unified-installer support from sensor 7.28. The listed regions do not establish a Japanese inference or storage region for Charlotte AI.

Grouping tags help select hosts for policy assignment. Version 6.42+ enables post-install Windows tag changes; a previously Linux/macOS-only top-level variable can therefore affect Windows in a mixed fleet. The documented equality check avoids unnecessary tag changes; no implementation test was run.

## Updates and maintenance

The policy module separates policy creation, enablement and host-group assignment. Newly created policies are disabled by default. It supports build selection and time blocks that prohibit sensor cloud updates; disabling version updates is documented by omitting the build parameter. These are **sensor update** controls, not evidence that the July 2024 Rapid Response Content path uses the same schedule.

For protected Linux sensors from version 7.20, the configure guide recommends temporarily moving hosts to a maintenance policy with protection and version updates disabled, making the change, then restoring original policies. Bulk maintenance tokens are an alternative and work across hosts. The resulting temporary reduction in protection and restoring policy membership need explicit operational ownership; the document does not establish that every failed automation run restores it.

## Representative day

**Illustrative inference:** an endpoint engineer reconciles intended assets with enrolled hosts and policy membership, investigates missing/late host identities, and schedules approved maintenance. A SOC analyst then works with the evidence the enrolled sensor provides. Successful local installation, cloud enrollment, assigned policy, detection coverage and effective response are separate milestones.

Remaining: complete installation/OS entitlement prerequisites, prevention-policy baselines, actual action-completion checks and customer-specific service agreements. No installer, role, module, policy or token was used.
