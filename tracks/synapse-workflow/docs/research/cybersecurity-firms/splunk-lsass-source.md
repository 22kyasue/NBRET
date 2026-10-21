# Splunk detection content: when process access becomes a finding

Read **2026-10-17**, source-only. splunk/security_content pin `d6afc62b750dc2ed34e3696999bf26fe476b9b1e`. This is a public detection recipe, not proof of customer deployment or Splunk's proprietary analysis internals.

## Complete selected detection

[Detect Credential Dumping through LSASS Access](https://github.com/splunk/security_content/blob/d6afc62b750dc2ed34e3696999bf26fe476b9b1e/detections/endpoint/detect_credential_dumping_through_lsass_access.yml) is version 16, modified 2026-10-09, marked production/TTP in its metadata. LSASS is a Windows process that handles logon-related security; access to its memory can be relevant to credential theft, but access alone is not proof of theft.

The search starts from the sysmon macro and selects Sysmon Event ID 10 with a target image ending in lsass.exe. It converts GrantedAccess from hexadecimal to a number and checks bit masks representing read-memory and limited-query access, with an additional query-information bit handled by the expression. It groups user, destination, source/target process identities and call trace, then formats first/last timestamps and invokes a detection-specific filter macro. The risk object assigns a user entity score of 50. This is explicit rule logic; no generative AI or learned model is needed to explain this artifact.

The [sysmon macro](https://github.com/splunk/security_content/blob/d6afc62b750dc2ed34e3696999bf26fe476b9b1e/macros/sysmon.yml) selects configured Sysmon source types. The [ctime macro](https://github.com/splunk/security_content/blob/d6afc62b750dc2ed34e3696999bf26fe476b9b1e/macros/security_content_ctime.yml) formats epoch time. The [Sysmon EventID 10 data-source definition](https://github.com/splunk/security_content/blob/d6afc62b750dc2ed34e3696999bf26fe476b9b1e/data_sources/sysmon_eventid_10.yml) supplies fields, a Sysmon add-on reference/version and a configuration-source link. Its example event targets winlogon, so it must not be treated as a positive LSASS detection fixture.

## Buyer and analyst workflow

The customer must generate and ingest the right process-access telemetry, map source types/fields and choose scheduling, retention, exceptions and response ownership. The detection's known-false-positive text recognizes legitimate software accessing LSASS; an analyst must investigate the source process, user, host, timing and surrounding evidence. A match is a reason to investigate, not an automatic authorization to isolate or remove a process. No containment API appears in this YAML.

The search calls a detection-specific filter macro. A guessed standalone YAML path for it returned 404; that absence does not establish whether packaging generates it or a deployed customer has configured it. Its effective runtime definition remains unknown here. Consequently the exact exclusions in a customer's resulting search cannot be reconstructed from this file alone.

## Tests and remaining dependencies

The detection metadata specifies one positive test referencing an attack_data dataset through a **mutable master URL**. The fixture was neither downloaded nor replayed. A separate Atomic reference identifies a test technique; no technique was executed. A passing test, if independently obtained, would still establish performance only on that fixture, not population false-positive/false-negative rates.

Read fully: detection YAML, sysmon macro, ctime macro and data-source YAML. Unread dependencies include search-engine execution semantics, installed add-on transforms, generated filter packaging, referenced telemetry configuration and the actual positive fixture. No Splunk instance, agent or attack simulation was installed or used.
