# Botnet and residential relay evidence

Reviewed2026-10-17. These are attributed defender reports, not our malware analysis, detector benchmark or proof of current population. Only public articles were read; no samples, control infrastructure, victim devices or malware were contacted. Direct Node archive requests returned403 for all four articles; incident-sources.json preserves status/bytes/hash, but those files are **not article archives**. The main article text was available through web retrieval and reviewed there. No challenge was bypassed.

## Consent, relay service and endpoint attribution

The [FBI March12,2026 advisory, I-031226-PSA](https://www.fbi.gov/investigate/cyber/alerts/2026/evading-residential-proxy-networks-protecting-your-devices-from-becoming-a-tool-for-criminals) distinguishes consent-based participation from undisclosed or compromised enrollment. It describes SDK distribution, misleading VPN arrangements, compromised devices and paid bandwidth participation. These are different acquisition paths; a relay address does not itself establish which occurred. The advisory also warns that preinstalled malware may survive factory reset. Its prevention measures include patching, device policy, segmentation and application communication controls. Reviewed main text under definitions, enrollment, criminal uses, protections and reporting, including its caveats; no linked software was retrieved.

Design inference: model device owner, relay participant, gateway operator and requesting customer separately. IP reputation is a scoped risk input, not proof that the subscriber initiated an abusive request. Informed consent and revocable workload enrollment distinguish an owned fleet from a compromised-device botnet.

## BADBOX 2.0: supply chain and post-purchase enrollment

The [FBI June5,2025 advisory, I-060525-PSA](https://www.fbi.gov/investigate/cyber/alerts/2025/home-internet-connected-devices-facilitate-criminal-activity) reports both pre-purchase compromise and malicious app downloads during setup, followed by residential proxy use. It says individual indicators require context rather than conclusively identifying malicious activity. Reviewed the whole main advisory, indicator/mitigation lists, attribution acknowledgements and definitions. No malware installation, telemetry measurement or cleanup experiment was performed. Population claims remain the agency's dated report, not a current measured count here.

Design inference: enrollment prevention, communication containment and removal are separate controls. A product category or unusual traffic alone is insufficient for attribution. Keep detector labels and confidence separate from a containment decision, and test legitimate-device false positives.

## Qakbot: controller disruption is not full cleanup

The [FBI August29,2023 account](https://www.fbi.gov/news/stories/fbi-partners-dismantle-qakbot-infrastructure-in-multinational-cyber-takedown) describes email-mediated infection, additional payload delivery, remote control and a lawful infrastructure disruption that redirected traffic and delivered an uninstaller. Reviewed the main narrative, mechanisms and resources. Its broad wording about preventing further malware should be read with the more specific [DOJ victim resource](https://www.justice.gov/usao-cdca/divisions/national-security-division/qakbot-resources): the uninstaller removed Qakbot, not other malware already present. That resource was separately archived/read in the earlier checkpoint.

Design inference: cutting one control channel does not prove that secondary payloads, stolen credentials or persistence have been removed. Track controller reachability, endpoint isolation, credential revocation and verified restoration as separate outcomes. This comparison explains disruption boundaries; it supplies no instructions for controlling compromised devices.

## 911 S5: victim egress differs from operator identity

The [FBI identification/removal page](https://www.fbi.gov/investigate/cyber/how-to-identify-and-remove-vpn-applications-that-contain-911-s5-backdoors) attributes the proxy network to VPN-distributed backdoors and explains that abusive traffic appeared to originate at victims' devices. Reviewed its complete main text, listed identification/removal workflow and efficacy caveat; screenshots/linked PSA were not separately reviewed and no removal action was performed. This is accessible primary support distinct from the earlier DOJ challenge-page fetch. The earlier failed archive remains accurately labeled.

Design inference: an exit address, infected device and controlling customer are separate entities. A successful process stop or application uninstall must not be generalized into verified eradication of every compromise. Do not apply a historical product-name indicator as a universal detector.

## Relationship to the local source walkthroughs

The legitimate memberlist/BullMQ/controller examples are compared only at the level of coordination concepts: enrollment, state exchange, authority, termination and failure. They do not become botnets merely because they use many workers or gossip. Group membership is not operator identity, a queue completion signal is not a receipt, a valid credential is not current permission, and controller disruption is not verified endpoint recovery. Each boundary has separate evidence and uncertainty in continuation.md. No vendor accuracy claim, live adversary test or malware execution supports this dossier.
