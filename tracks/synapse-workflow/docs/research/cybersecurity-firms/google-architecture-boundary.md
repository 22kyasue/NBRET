# Google SecOps: platform orchestration versus the TIN feature contract

**Read 2026-10-17:** complete extracted English main content of the [architecture manual](https://docs.cloud.google.com/chronicle/docs/secops/secops-architecture?hl=en), updated **2026-10-13**. Diagrams' pixels were not inspected.

The architecture connects collectors/APIs/pull connectors to normalized UDM events, stateful YARA-L detection, case management and response orchestration. UDM supplies consistent fields across otherwise different logs; normalization is not itself AI.

For private-network actions, a local remote agent polls a cloud publisher queue over outbound TLS, executes locally and returns status/logs. No inbound connection from the platform is needed in this described model. Customer permissions and target-tool credentials still govern execution.

The page describes AI verdicts triggering response playbooks and false positives closing cases. That broad architecture statement must be separated from the [TIN feature manual](https://docs.cloud.google.com/chronicle/docs/secops/triage-investigation-agent?hl=en), also fully read in English, whose documented investigation output is verdict, explanation, timeline and suggested investigation. Exact automated-close/response configuration and approval semantics remain unresolved here.

Platform compliance packages also do not override TIN's specific non-FedRAMP statement. Neither page proves every tenant has identical features or configured automation.

Use the [dossier](google-cloud-security.md) for TIN limits and [SDK trace](google-investigations-source.md) for the separate request/completion boundary.
