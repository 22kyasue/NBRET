# AgentiX: documented authority, data handling and retention

**Read 2026-10-17:** complete main content of the [Agentic Assistant security manual](https://cortex-docs.paloaltonetworks.com/cortex-agentix/learn-about-cortex-agentix/agentic-ai-in-cortex-agentix/agentic-assistant-security). The old documentation URL redirected to this current portal. The portal displays a relative update date; the indexed old page supplies a June 30, 2026 publication date, which should not be silently applied to every current wording.

Agents can execute only assigned actions, within the invoking user's tenant permissions; inactive integrations prevent wrapped actions working. Sensitive actions require explicit approval. The manual does not establish how every action is classified as sensitive.

It describes encrypted hosting in a dedicated GCP project, regional prompt/response processing, no prompt/output collection for model training or third-party sharing, and action audit records identifying agent and invoking user. Plans and JSON artifacts are visible. These are documented provider commitments, not independently validated isolation or model-reasoning fidelity. Exact models remain undisclosed.

## Retention has a separate clock

The complete [retention manual](https://cortex-docs.paloaltonetworks.com/cortex-agentix/learn-about-cortex-agentix/data-retention-policy) says default **six months** for cases/issues and assistant chats/artifacts. Cases use Last Updated, issues Observation Time; issues have up to 31 days' display grace. Paid add-ons extend retention in 31-day increments.

Thus “used only for immediate response” must not be shortened to “chat is not stored.” Processing purpose and retained operational records are different. The page does not define a universal prompt-inference deletion clock, audit-dataset retention or customer-specific contract.

See [dossier](palo-alto-networks.md) for the broader product and managed-action matrix, and [source trace](pan-isolation-source.md) for explicit playbook graphs. Those are separate execution paths, not proof of AgentiX's closed model/tool-selection implementation.
