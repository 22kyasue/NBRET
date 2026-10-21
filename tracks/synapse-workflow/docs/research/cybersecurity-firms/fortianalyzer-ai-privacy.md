# FortiAnalyzer 7.6: local query execution with a cloud model

**Read 2026-10-17:** complete main text of the [FortiAnalyzer 7.6.0 FortiAI data-privacy manual](https://docs.fortinet.com/document/fortianalyzer/7.6.0/administration-guide/13605/fortiai-data-privacy). This is versioned FortiAnalyzer behavior, not a universal FortiSOAR/FortiGate/FortiSOC contract.

The documented chain is administrator prompt → masked sensitive values → Fortinet proxy → cloud LLM selecting a function → callback through proxy → local unmasking/database query → administrator-facing answer. IP/MAC/user identifiers are masked; mappings depend on the session cookie. Locally executing the query does not make model inference local.

The manual illustrates statistics retrieval, not autonomous containment. Separate administrator-profile Privacy Masking can restrict what administrators themselves see. That is a different control from masking data sent to the LLM.

It does not disclose an exact model/version, regional inference address, retention/deletion clock, complete masking coverage or empirical re-identification testing. Those are unknown, not evidence of zero retention or perfect anonymization. Its masking examples are provider demonstrations, not tests performed here.

See [Fortinet's dossier](fortinet.md) for the distinct deterministic playbook and broader FortiAI claims, and [FortiSOAR connector trace](fortinet-sentinel-source.md) for a separate incident-record action path.

Additional disclosure: [FortiAnalyzer transparency notes](fortianalyzer-transparency.md). Keep its product/specification scope separate from this administration-manual trace.
