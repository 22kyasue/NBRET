# A buyer's Falcon troubleshooting workflow: heartbeat is insufficient

Accessed October 17, 2026. Duke OIT's [Linux troubleshooting article KB0035319](https://oit.duke.edu/help/articles/kb0035319/), main text read completely, has a displayed validity date of October 8, 2027. It is institutional operating guidance, not a measured product evaluation or universal current support matrix.

Duke limits this deployment to institution-owned devices because enrollment places devices under Duke policies/control. It checks installer checksum, dependencies, process/module presence and cloud connectivity. Its Planisphere inventory polls CrowdStrike on a schedule; inventory visibility is therefore not necessarily instantaneous.

It distinguishes connection from successful communication: an absent/all-zero agent identifier suggests networking or installation-token trouble. Most importantly, reduced-functionality mode can continue heartbeat events while lacking detection/process-execution events. An installed, online-looking host can therefore lack the expected protection in this documented Linux path.

Kernel compatibility must be checked after kernel upgrades. The article warns its preinstallation kernel-check tool does not reflect support added later through Zero Touch Linux channel files. Local diagnostic logs follow host rotation; that is distinct from cloud retention.

The internal escalation path is Device Engineering, with diagnostics passed to CrowdStrike support as needed. No commands, downloads, enrollment or support contact were performed here. Its legacy examples and kernel recommendations require version-specific review before real deployment; they are evidence of operational checks, not instructions to change this PC.
