# Trend Micro: sensors, a shared platform and two AI interfaces

**Accessed 2026-10-17; active dossier.** The [company history](https://www.trendmicro.com/en_us/about/history-vision-values.html) traces the antivirus business to Steve Chang, Jenny Chang and Eva Chen in 1988. The [2016 TippingPoint completion announcement](https://www.trendmicro.com/en/about/newsroom/local-press-releases/hk/2016/2016-03-10.html) establishes acquisition-led expansion alongside internal development. Enterprise and consumer businesses must be separated; company revenue is not all Vision One revenue or Japan-only revenue.

[2025 results, released 2026-02-18](https://newsroom.trendmicro.com/2026-02-18-Trend-Micro-Reports-Earnings-Results-for-Q4-2025-and-FY-2025) report approximately ¥276B annual net revenue. Selected annual regional statements are now read in the [economics trace](trend-annual-economics.md); segment restatements remain separate. Current documentation uses TrendAI and TrendAI Vision One naming; historical product names remain attached to their dated sources.

The [Japanese company profile](https://www.trendmicro.com/ja_jp/about.html) gives legal establishment as 1989-10-24, distinct from the 1988 business origin; it lists 6,717 employees and sales of ¥275.984B dated 2025-12-31. Keep these dated figures separate from undated rounded marketing counts.

## Platform and operating boundary

The [platform FAQ](https://success.trendmicro.com/en-US/solution/KA-0010862) describes detection/response across email, endpoints, servers, cloud workloads and network in a cloud platform or managed service. A platform license is not the same purchase as managed analyst operations. Agent rollout, product connections, cloud permissions, regional data lake, detection policies and response privileges require their own manuals; none were configured here.

## Companion: product assistant contract

The [Companion FAQ](https://docs.trendmicro.com/en-US/documentation/article/trend-vision-one-companion-faq-2) describes pretrained LLMs augmented with provider security knowledge. It checks account role permissions and enabled features before executing requests; it does not execute when these are missing. Suggested remediation can be selected or rejected by users. Exact models, prompts and performance evaluation are undisclosed.

The FAQ says evidence/source references, confidence indicators and verification context are **coming soon**. Do not present those future transparency features as currently available solely because audit logs already exist. It also says customer data is not used for model training, prompts are retained up to 30 days with a 500-prompt session limit, and administrator-visible/exportable action audit logs are stored for 180 days. Data may be processed outside the account region. The page asserts no PII goes to third-party LLMs, but supplies no field-level masking implementation; preserve that as a provider assertion.

## Public MCP server: a separate trust boundary

The official [Vision One MCP repository](https://github.com/trendmicro/vision-one-mcp-server/tree/2d137401c26e7c50345d448ea1c662746cb2e7a9) connects **external AI tooling** to Vision One APIs. Its README says the external LLM processes retrieved information and the customer must choose an approved model. Companion's model/data commitments must not automatically be transferred to a customer-selected external model.

The server defaults to read-only, supports toolset selection and registers writes only when read-only is disabled. It uses local standard input/output, with an explicit warning against exposing it as a network service. The [source trace](trend-mcp-source.md) now covers registration, argument construction, authenticated HTTP, full endpoint/task/schedule tools and selected tests. These controls do not themselves prove a per-action human approval gate.

## Representative work and next evidence

**Illustrative inference:** a customer analyst investigates a platform alert, asks Companion for an explanation, verifies the evidence in source records and chooses any permitted response. An external MCP client can instead retrieve records for a separately configured LLM; that client has a different data-handling and approval boundary. The [public MDR approval/setup trace](trend-mdr-approval.md) now establishes configured action/scope and contact routing; it remains separate from restricted contractual terms.

Remaining: complete deployment/telemetry manuals, MDR service scope, region/retention cross-checks, API task-schema/completion details beyond the [documented server/endpoint status boundary](trend-response-task-boundary.md), plus third-party dispatch semantics, and buyer-authored evidence. No runtime connection or endpoint installation was made.

## Managed-service document boundary

The [current MDR access-boundary note](trend-mdr-access-boundary.md) records the publicly visible, password-protected service-description landing page. Current detailed service terms were not read; product capability does not establish contractual response obligations.

## Geography and accounting perimeter

The [annual economics trace](trend-annual-economics.md) distinguishes consolidated regional sales, Japan parent-only accounts and the management Pre-GAAP measure. Its precise partial-reading boundary is retained.

## Managed response and effective isolation

[Public MDR operating controls](trend-mdr-approval.md) and [task-versus-endpoint status](trend-response-task-boundary.md) supply additional delivery evidence, including unresolved documentation tensions. Neither is proof of a customer deployment or signed SLA.
