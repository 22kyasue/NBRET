# Evaluation boundary inventory

Bryn, 2026-10-18. Read-only prerequisite for Skye's evaluation design. **No verified blind-evaluation boundary is established by this inventory.** The existing unrestricted same-account agent sessions remain unsuitable for an enforced answer-key barrier.

## Decision and recommendation

The most concrete installed candidate is **VirtualBox 7.2.8**. Evaluate a clean guest boundary before proposing another virtualization installation or a Windows edition upgrade. This is a recommendation to investigate a configuration, not permission to create or boot a guest. Availability of a usable guest image, successful boot under the current host hypervisor, guest agent access through an existing subscription, and effective isolation remain unknown.

The smallest credible no-new-fee path to pursue is to keep preparation/scoring/key custody in a trusted host context and run investigator and reviewer in separate clean guest contexts with only approved evidence and target interfaces. Neither guest may receive the answer key, target preparation source, host workspace/profile mounts, shared agent memory or host-control connectors. A host agent remotely operating a guest while retaining unrestricted host tools does not satisfy this boundary: the investigator's actual tool authority must be confined to the guest. Guest networking must be deliberately mediated; default NAT is insufficient because Oracle documents host-loopback reachability. The installed VM application alone does not solve any of these configuration requirements.

If guest setup or subscription access cannot be established without new fees, continue procedural/guided foundation work and defer blind performance claims. A separately controlled standard Windows account with verified DACLs is a possible lighter alternative, but account availability and effective access were not inspected and it is not demonstrated here. Do not assume a differently named account or folder solves shared board, connector, network-service or model-context access.

## What was observed

| Item | Read-only observation | What it establishes and leaves open |
| --- | --- | --- |
| Windows | `Win32_OperatingSystem`: Microsoft Windows 11 Home, 64-bit, version **10.0.26300**, build **26300**, SKU **101**. Registry: EditionID **Core**, DisplayVersion **26H2**, UBR **9711**. | Identifies this installed edition/build. Does not establish an isolation configuration or supported guest boot. |
| Current token | Administrator-role/elevation check returned **false**. | Feature-state query failures below were not bypassed. This is not an account/group-membership inventory or proof the user cannot elevate elsewhere. |
| Host virtualization signals | `Win32_ComputerSystem.HypervisorPresent = true`. Processor fields `VirtualizationFirmwareEnabled`, `VMMonitorModeExtensions`, `SecondLevelAddressTranslationExtensions` each returned **false**. | Mixed host instrumentation. Do not infer virtualization is unavailable, firmware must be changed, or a guest can boot from these values. Existing hypervisor presence is not evidence of role separation. |
| Windows Sandbox | No `WindowsSandbox.exe` command resolved; `C:/Windows/System32/WindowsSandbox.exe` absent. | No launchable entrypoint found in these checks. Microsoft documents that Windows Home does not support Sandbox. No feature workaround or edition upgrade is proposed. |
| Full Hyper-V role/tools | No `Get-VM` command or installed Hyper-V PowerShell module returned. | Tools not found in the checked surface; feature state remains unknown. Microsoft says the full Hyper-V role cannot be installed on Home. Running compute services are not evidence that the management role is present. |
| WSL | `wsl.exe` resolves at `C:/Windows/System32/wsl.exe`. No current-user `HKCU:/Software/Microsoft/Windows/CurrentVersion/Lxss` registration root; no current-user `WindowsSubsystemForLinux` Appx package returned. | Entrypoint present; no distro registration found for this account in that location. This does not prove WSL is globally absent, disabled or unusable, or enumerate other users. No `wsl` invocation was made. |
| Compute/network services | `vmcompute` and `hns` were already **Running**, startup **Manual**. No `vmms`, `WslService`, `LxssManager` or `com.docker.service` returned in the exact-name query. | Existing service metadata only. No service was started, stopped or reconfigured. Their consumers and cause of current state were not investigated. |
| Docker/Podman | No `docker.exe` or `podman.exe` command resolved. Checked Docker Desktop and RedHat Podman executable locations absent. | Not found on PATH or those standard paths. Not a comprehensive disk inventory or proof no container software exists elsewhere. No daemon/client invocation. |
| VirtualBox | `C:/Program Files/Oracle/VirtualBox/VBoxManage.exe` exists; executable FileVersion and ProductVersion both **7.2.8.173730**. It did not resolve on PATH. | Installed executable metadata, not a CLI health check or verified upstream integrity/currentness. No VBoxManage/manager invocation, VM enumeration, configuration read or guest start. |
| VirtualBox components | `VBoxSDS`: **Stopped**, startup **Manual**. `Win32_SystemDriver` returned `VBoxNetAdp` Running/Manual, `VBoxNetLwf` Running/System, `VBoxSup` Running/System, `VBoxUSBMon` Running/System. | Components exist and reported states. Drivers do not establish a usable guest or secure configuration. Existing services/drivers were preserved. |
| VMware | No `vmrun.exe` command resolved; checked VMware Workstation standard executable location absent. | Limited location check only, not global absence. |
| Optional features | Individual read-only queries for `Containers-DisposableClientVM`, `Microsoft-Hyper-V-All`, `Microsoft-Windows-Subsystem-Linux`, `VirtualMachinePlatform`, `Containers` each returned **“The requested operation requires elevation.”** | All five enabled/disabled states are **not determined**. An initial attempt supplied an unsupported array to `FeatureName`; corrected individual queries produced the elevation result. Neither failure is evidence a feature is disabled. No elevation requested. |
| Accounts and guest assets | Not enumerated. | No personal account names, other users' data, guest disks/configurations, auth files, environment contents or credentials inspected. Existing suitable accounts/images remain unknown. |

The checks used bounded OS/CIM/service/registry/package metadata, command discovery and known executable-path existence/version reads. They did not start Docker, WSL, a VM, a container, a desktop/browser session or an agent. No accounts, firewall rules, permissions, host features or packages were changed. No targets contacted. Official documentation was read with the web search tool; no browser tabs were opened.

## What each option can and cannot establish

* **Separate existing coding-agent sessions, worktrees, journals or worker threads:** useful workflow separation, with no enforced secrecy from this shared host account. Journal hashes and actor labels cannot prevent an investigator from reading preparation material or the answer key.
* **WSL or a container label:** not sufficient evidence of host/key separation. Microsoft documents Windows-drive access and Windows executable interoperability from WSL. Any future design must account for mounts, host credentials, host-network services, management sockets and alternate tools. This inventory did not verify a running distro/container or any restrictions.
* **Sandbox/Hyper-V on this installation:** current edition and missing entrypoints make these poor immediate no-new-fee choices. Supported Windows edition documentation narrows the option; it does not establish all underlying host virtualization features are off.
* **VirtualBox:** a plausible guest boundary whose effectiveness depends on actual permissions, integrations and networking. Disable host-to-guest data paths not required for the trial, including shared folders, clipboard, drag/drop, device passthrough and host management access. Use separately controlled evidence handoffs and fresh investigator/reviewer state. These are proposed controls, not controls verified on this PC.
* **Separate standard Windows principal:** may support a narrower access boundary if effective access is verified and no host connector/service bypass exists. Current account layout, ACLs and session-launch integration are unknown. A POSIX `chmod` result on Windows is not a DACL verification.

None of these alone proves cognitive independence between models, absence of prior target knowledge, accurate scoring or discovery quality. Separate review contexts also need declared prior exposure and their own independent observations; the host key custodian remains trusted. Blind mode still requires the frozen target/scorer, no investigative hints and the distinct guided-mode policy in `discovery-decisions.md`.

## Operator setup and evidence needed before a blind claim

The next design should name the preparer, investigator, reviewer and scorer; place key/source/logs outside the investigator/reviewer authority; specify the guest or principal boundary; and enumerate every tool, connector, mount, clipboard path and network route available to each role. Guest-local coding-agent use through existing subscriptions needs a separately verified interface; executable presence or a host login is not an automation entitlement.

Use synthetic canaries, not real secrets, for future boundary validation. From the actual investigator/reviewer runtime, demonstrate inability to read the key-side canary, host workspace/memory/transcripts or management services; demonstrate permitted evidence/target access still works. Inspect the effective mount/integration/network policy as well as the negative result: a failed lookup of one guessed path does not establish a boundary. Verify retained guest snapshots, backups and reset procedure do not carry preparation material. Freeze the resulting configuration/versions and scorer before evaluation. These checks have **not** been executed and require a separately scoped setup/validation assignment.

Do not change firmware or disable an existing host hypervisor to resolve the mixed instrumentation during this inventory. Any guest-boot compatibility issue, resource requirement or provider-access limitation remains a setup decision rather than an observed failure. Existing PC sessions and services must remain intact.

## Research and documentation basis

Register search: “sandbox isolation shared filesystem secrets evaluation agent permissions.” Relevant underlying passages were opened. No new experiment or research finding was added to the register.

| Register entry / study | Strength and decision implication | Contrary evidence / limit |
| --- | --- | --- |
| `workers-queues.sandbox-not-security-boundary`; `docs/research/bots-swarms/continuation.md:953` | Source-trace: worker subprocess/thread separation is scheduling isolation, not an untrusted-code boundary. | Does not test VirtualBox, WSL or this machine's OS access rules. |
| `safety.capability-gate-outside-model`; `docs/research/assessment-evidence/executable-claims.md:25` | Component-lab: code admission decisions were tested; model instructions are insufficient. | Explicitly not an OS sandbox or proof all execution paths pass the gate. |
| `agent-runtime.pentestgpt-full-access-no-scope`; `docs/research/assessment-evidence/deep-pentestgpt.md:67–73` | Source-trace: host mounts/capabilities and full-access roles defeat inference from a container label. | Positive credential-handling controls coexist; no image/deployment isolation test was run in that study. |
| `evidence-handling.agent-monitor-retains-secrets`; `docs/research/assessment-evidence/monitor-web-continuation.md:24–25` | Component-lab: synthetic telemetry retained sensitive-shaped content; Windows POSIX-mode assertion did not establish DACL enforcement. | No actual cross-user access was measured; the UI's text rendering is contrary evidence to an XSS claim. |
| `docs/research/assessment-evidence/framework.md:5–15`; discovery decisions; build-plan Stage 2 | Proposed evaluation protocol: freeze criteria, separate roles/access and retain assistance/failure provenance. | Not a validated universal independence standard or proof this proposed configuration works. |

Current primary documentation checked on 2026-10-18:

* Microsoft: [Windows Sandbox](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-overview) and [Hyper-V installation requirements](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/Install-Hyper-V). Both narrow supported edition choices; neither was executed as an installation guide.
* Microsoft: [WSL file permissions](https://learn.microsoft.com/en-us/windows/wsl/file-permissions), [filesystem interoperability](https://learn.microsoft.com/en-us/windows/wsl/interop) and [advanced configuration](https://learn.microsoft.com/en-us/windows/wsl/wsl-config). Host interoperability must be addressed before treating a distro as a key boundary.
* Oracle VirtualBox 7.2: [Security Guide](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/Security.html) and [Virtual Networking](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/networkingdetails.html). Documented integration/network caveats guide the proposed guest review. They are vendor documentation, not observed isolation results here.

The research does not select a proven runtime for this workflow. **Installed VirtualBox is a candidate; enforced blind evaluation remains unverified.**
