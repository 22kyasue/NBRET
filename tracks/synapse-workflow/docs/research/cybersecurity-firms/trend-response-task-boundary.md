# Trend isolation: task status and endpoint state can diverge

Read 2026-10-17: complete public [Isolate Endpoint manual](https://docs.trendmicro.com/en-us/documentation/article/trend-vision-one-isolate-endpoint-task) and [KA-0013234 troubleshooting article](https://success.trendmicro.com/en-US/solution/KA-0013234), the latter updated February 27, 2026. No task was submitted.

The isolation manual distinguishes pending approval/rejected Workbench actions, sent/in-progress commands, offline-agent queued commands, successful commands and unsuccessful/time-out states. Its explicit caveat is decisive: task status reflects the **managing server's** receipt/execution and does not necessarily establish target Security Agent/object execution. Linux isolation requires iptables or nftables. Critical-asset exceptions and connection restoration are separately configured/performed.

The troubleshooting article describes routing through SecOps Endpoint Sensor or Apex Central according to backend agent information. It records status synchronization gaps, independent isolation/restore controls and allowlists between products, and a restore that remains displayed as queued after an Apex Central timeout. It also documents existing connections not being blocked in the described issue set.

Its claim that custom allowlisting is future functionality differs from the isolation manual's exception instructions. Treat this as version/path-specific documentation tension, not a universal present limitation or proof it was fixed.

**Practical consequence:** identify the actual managing product, check endpoint enforcement and restore through the matching path. A wrapper's HTTP success or even server task completion cannot alone establish containment or recovered service.
