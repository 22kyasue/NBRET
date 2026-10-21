# Cortex playbooks: dispatch, eligibility and containment

Read **2026-10-17**, source-only. demisto/content pin `e46f08b8fafc9207f4f658fca4fa949c3ffd687d`. These are explicit automation graphs. They do not reveal Cortex endpoint detection internals or AgentiX model implementation.

## Version-specific dispatch

Two files have the same logical playbook ID. The [older Generic V2](https://github.com/demisto/content/blob/e46f08b8fafc9207f4f658fca4fa949c3ffd687d/Packs/CommonPlaybooks/Playbooks/playbook-Isolate_Endpoint_-_Generic_V2.yml) declares versions 5.5.0 through 6.7.9. The [6.8+ definition](https://github.com/demisto/content/blob/e46f08b8fafc9207f4f658fca4fa949c3ffd687d/Packs/CommonPlaybooks/Playbooks/playbook-Isolate_Endpoint_-_Generic_V2_6_8.yml) adds a Core isolate command and uses Carbon Black Response V2.1. Both were read completely; do not merge their node lists into a supposedly universal current workflow.

The 6.8+ start node fans out to Cybereason, Cortex XDR, CrowdStrike, FireEye HX, Microsoft Defender, Core and Carbon Black branches. Hostname, IP and endpoint-ID inputs are optional and are passed in product-specific argument forms. Branches are marked skipunavailable and generally use separate context for sub-playbooks. The parent has no explicit human approval or exclusive “choose exactly one product” condition. This is a graph-level observation; actual availability, instance selection and execution semantics depend on the runtime and sub-playbooks.

Each branch leads to a Done title. Declared output fields include isolation/action IDs and product status, but declarations do not themselves poll or validate those fields. The graph must not be explained as proof that every configured endpoint was isolated successfully.

## One child traced completely

The [CrowdStrike isolate child](https://github.com/demisto/content/blob/e46f08b8fafc9207f4f658fca4fa949c3ffd687d/Packs/CrowdStrikeFalcon/Playbooks/playbook-Crowdstrike_Falcon_-_Isolate_Endpoint.yml) checks IsIntegrationAvailable for CrowdstrikeFalcon, then checks that Device_id is nonempty. It calls cs-falcon-search-device with that ID and tests CrowdStrike.Device.Status equals normal. If so, cs-falcon-contain-host receives the input device ID, then execution ends. Unavailable integration, missing input or a non-normal status also lead to Done. There is no per-action human decision or post-containment polling in this child. It has no declared outputs. The condition should be described as the graph's eligibility check, not a guarantee that a device is safe to disrupt.

The command description explicitly preserves communication with CrowdStrike cloud and containment-policy addresses. Provider API permissions, customer containment policy and upstream incident decision remain separate responsibilities. The child is marked for the xsoar marketplace and excluded from marketplacev2. Its repository presence alone does not establish availability in every Cortex product/version.

## What the selected test establishes

The [isolate/unisolate test graph](https://github.com/demisto/content/blob/e46f08b8fafc9207f4f658fca4fa949c3ffd687d/Packs/CommonPlaybooks/TestPlaybooks/playbook-Isolate_and_unisolate_endpoint_-_test.yml) was read completely. It deletes context, calls isolate/unisolate flows, deletes context again and invokes those flows with a deduplicated endpoint input. Despite an “empty inputs” title, one isolation call forwards the test's input, which has a nonempty default. Titles alone therefore do not establish actual empty-input coverage. No explicit state assertion appears in this graph; it relies on sub-workflow execution and failure behavior. It can perform real isolation/release and context deletion. **It was not run.**

## Remaining boundaries

The integration command implementation, availability helper, runtime dispatch, other product branches, unisolate graph and the separate CrowdStrike test named by the child remain unread. The larger integration Python/YAML/test files were discovered, not reviewed. This is a complete parent-plus-one-child graph trace with a selected test, not complete end-to-end action verification. The [FalconPy trace](falcon-host-action-source.md) concerns a different public client path and cannot substitute for the XSOAR connector implementation.
