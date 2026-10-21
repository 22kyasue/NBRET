# Charlotte AgentWorks: an invocation can outlive its client request

Read 2026-10-17: complete main text of the public [AgentWorks MCP module manual](https://developer.crowdstrike.com/falcon-mcp/modules/agentworks/). This documents a public integration contract; its implementation and closed agent engine are not reviewed here.

Agent/version discovery returns published/active IDs. Invocation can choose published or explicit version and requires Charlotte AI Agent Definition read/write; observation requires read. The manual labels invocation destructive and credit-consuming.

Invocation polls by default for 45 seconds. Timeout or waiting-for-tool-approval returns the invocation ID/status; **the server run continues**. The MCP tool cannot approve a paused tool. Follow-up observation polls for completed/failed status and retrieves conversation/trace identifiers. Timeout is not cancellation or rollback.

Trace-span searches expose LLM calls, agent steps, cost and request/response content. Their start-time search window is limited to 90 days; that is not a complete contractual retention statement. A named Claude model appears as a filter example, not proof every agent uses that model.

**Workflow:** select/version → invoke → observe pending/approval/terminal state → inspect trace → separately confirm external action. A completed agent does not establish every affected business service recovered.

## Credits and a dated licensing change

Selected Charlotte sections of the [licensing FAQ](https://www.crowdstrike.com/en-us/legal/crowdstrike-licensing/) are read; the long page remains partial.

It retains endpoint-band entitlements but explicitly states that **from June 2026** customers select monthly credit tiers independently of endpoint volume. Do not reuse the older bands as a current universal entitlement; legacy/order applicability is not resolved here.

Credits reset monthly without rollover and pool by customer ID, with role/feature and per-agent controls. Tasks consume variable, potentially fractional credits; the provider calculates actual usage and may display estimates in the UI. The page does not supply an invariant dollar cost per completed investigation.

When the monthly cap is reached, credit-powered features/agents/workflows will not run until refresh or added licensing; earlier outputs remain accessible. It does not establish what happens to every already-running invocation or whether noncredit protection stops.

This is distinct from endpoint sensor counting and SIEM ingestion/retention licensing. No invocation, model call, credit purchase or credentials were used.
