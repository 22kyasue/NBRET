# FortiAnalyzer transparency: disclosed models, approval and masking gaps

Read 2026-10-17: all 24 extracted pages of [FortiAI on FortiAnalyzer 1.1 transparency notes](https://fortinetweb.s3.amazonaws.com/docs.fortinet.com/v2/attachments/e7663893-5ab4-11f1-a33a-02356ffb40d9/FortiAI_on_FortiAnalyzer-1.1-AI_Transparency_Notes.pdf), issued May 28, 2026. Specification disclosure, not inspected enforcement code.

The assistant selects Azure OpenAI GPT-4.1/4.1-mini by feature. Local tools retrieve data; cloud proxy/model process masked context; results are unmasked locally. Documentation retrieval augments answers. Database/configuration writes require explicit UI confirmation; delete operations are unavailable. This does not define other FortiAI products.

An AI license, designated administrators and authenticated session gate use. Component tables mention system API users, while access-control text says GUI is the only current entry point; exact API exposure remains unresolved.

Proxy requests/responses are logged for at most 90 days. Session forgetting therefore does not mean no retention. Newly typed sensitive values absent from the session mapping may escape masking; field coverage is incomplete by design.

QA testing is described, but the performance section gives proposed metrics/methods without numerical results. Confirmation is not correctness validation.

MCP is unreleased in this document. Model/proxy outages disable AI features while core FortiAnalyzer remains available. Exact inference geography, independent validation, pricing and rollback remain unknown.
