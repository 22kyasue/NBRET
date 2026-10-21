# Splunk Triage agent: selected findings, frontier models and connector authority

Accessed October 17, 2026. This is the ES **8.6 documentation path**, with individual update dates below. It is distinct from the general assistant and from an assumed universal autonomous-response service. Main text was read completely for five manuals; the license page was read only at its ES editions table.

## What the agent does

The [July 21 setup overview](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/setting-up-the-triage-agent-in-splunk-enterprise-security) describes an LLM investigating queued findings and presenting disposition, rationale and next steps before analyst review. Response plans can guide its investigation with descriptions, searches and actions. This establishes a documented tool-based investigation mechanism, not a model architecture, calibrated confidence score or independently measured speed/accuracy improvement.

Before/after: analysts previously assembled that initial evidence themselves; the agent can prepare it for selected findings. Staff must still inspect reasoning, missing coverage and the appropriate response mandate.

## Deployment and model choice

The [September 8 activation manual](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/setting-up-the-triage-agent-in-splunk-enterprise-security/turn-on-or-turn-off-the-triage-agent) requires Premier, AWS Cloud platform 10.1.x or higher, SOAR pairing, AI Assistant enabled and the es_ai_edit_settings role capability.

Its opening says ES 8.6 or higher, while a note says only ES 8.6 Premier; that version wording is retained rather than silently reconciled.

Crucially, this manual supports only frontier models for Triage: the general Splunk-hosted-model selection does not apply. It says deployments incompatible with that choice must leave the agent off. Exact model/version, physical inference location, retention, training policy and price are not established by this page. Do not apply another assistant feature's hosted-only setting to this agent.

## Selection and incomplete coverage

The [July 20 detection-selection manual](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/setting-up-the-triage-agent-in-splunk-enterprise-security/identify-the-detections-that-the-triage-agent-can-use-to-analyze-findings) requires both agent activation and an already-enabled event-based detection. Administrators select individual or multiple detections for triage. Turning on a product does not automatically make every detection eligible.

The [September 8 analysis manual](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/setting-up-the-triage-agent-in-splunk-enterprise-security/analyze-the-findings-using-the-triage-agent) limits a simultaneous detection batch to its first ten findings and describes an approximately 200-findings-per-tenant daily limit. It exposes summary, justification, tools, evidence and detailed analysis steps in the finding panel.

Those are two distinct coverage limits. Neither an empty AI panel nor an untriaged finding establishes low risk. The page does not specify selection ordering, overflow queue/retry behavior, an immutable audit store or its retention.

The [licensed-capacity page](https://www.splunk.com/en_us/legal/licensed-capacity.html), labelled September 2026, separately lists Triage per finding for Premier with maximum 200 findings/day across listed licensing metrics; Essentials is N/A. This confirms a licensed ceiling, not a unit price or completed-work guarantee. Other table limits belong to other capabilities and are not transferred to Triage. Only this table was read; the entire legal page is not credited.

## Connectors and response authority

The [July 21 connector manual](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/setting-up-the-triage-agent-in-splunk-enterprise-security/specify-soar-connectors-to-enrich-findings-using-the-triage-agent) allows selected SOAR connectors/actions for autonomous enrichment **or adaptive response**. The UI starts with preselected connectors; administrators can deselect them, including to avoid consuming external quotas. They also select permitted actions.

This page is not a promise that Triage is strictly read-only. Conversely, listing adaptive actions does not establish unrestricted containment. Exact connector credentials, action behavior and per-call approval need their own contracts. The [Guided Response trace](splunk-guided-response.md) remains a separate feature-specific scope; its controls cannot automatically answer every Triage connector question.

## Version and evidence limits

An indexed ES 8.7 setup result described additional investigation-level behavior, but its exact fetched URL returned a 404 page. That content is discovery only, not a complete 8.7 manual read or proof of this 8.6 deployment. No alternate retrieval of the failed URL was attempted.

These are provider manuals and a license table. No tenant settings, selected connectors, permissions, live model call, quota enforcement or actual outcome was inspected. The source catalog/manual ledger retain each page's date and read state.

## Training consent is separate from inference and deletion

The [September 29, 2026 training-setting manual](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/opt-in-or-out-of-ai-training-and-fine-tuning-in-splunk-enterprise-security) says Splunk does not use the assistant's AI service data for training or fine-tuning by default. Administrators can opt in using Security AI Assistant settings. Opting out immediately stops use of new telemetry and feedback for that purpose, but does not delete previously collected data.

This narrows the earlier unknown: the assistant has a documented training-consent control. It does not establish deletion deadlines, inference retention, region, downstream provider terms, or that every Triage-specific data path obeys identical controls. Its broad opening references Azure OpenAI policy, while the operative paragraphs describe the AI Assistant; that is insufficient evidence to identify Triage's exact model or hosting. Training consent, operational inference and deletion are separate questions.

The [July 20 general model-choice manual](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/choose-which-models-the-ai-assistant-uses-in-splunk-enterprise-security) provides an administrator selection between Frontier and Splunk-hosted models, but supplies no model names, geography or retention details. Read together with the Triage activation exception above, it demonstrates why a product-wide settings screenshot cannot establish the agent's inference route.
