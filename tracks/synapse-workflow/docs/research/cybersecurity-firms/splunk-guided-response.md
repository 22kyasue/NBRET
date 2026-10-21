# Splunk Guided Response: an agent that can invoke SOAR actions

**Read 2026-10-17**, complete main text of the [Enterprise Security 8.6 Guided Response manual](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/run-soar-response-actions-using-the-guided-response-agent-in-splunk-enterprise-security). This is a separate execution feature from answer/SPL generation.

The documented path requires Cloud, Essential or Premier, Platform 10.2+, ES 8.6+, paired SOAR and an eligible chat model; SecA1 is excluded. It inherits SOAR connector permissions. Installing connectors automatically adds them to the preselected connector list, so tool exposure can change during maintenance.

A finding and natural-language prompt guide action selection and parameters. Examples include reputation enrichment, blocking, disabling users, messaging and ticket creation. User disabling requests double confirmation; asynchronous actions can wait for approval. This does not establish one identical approval rule for every connector/action.

The page explicitly says an already-started investigation continues even if AI is turned off. Disabling AI is therefore not evidence of cancellation. Its opening note's awkward wording about new investigations is preserved rather than interpreted as a detailed shutdown contract.

Per-system outcomes are described for multi-provider user disablement. Exact retries, compensating actions and rollback are not disclosed. No action was executed here.

## Model selection and improvement use

The complete [model-selection page](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/choose-which-models-the-ai-assistant-uses-in-splunk-enterprise-security) offers Frontier versus Splunk-hosted model usage according to compliance needs. Its extracted text does not enumerate exact model/version identifiers. It references Azure OpenAI use-policy requirements; that alone does not identify every feature's model or processing region.

The complete [training-choice manual](https://help.splunk.com/en/splunk-enterprise-security-8/administer/8.6/ai-assistant-in-security-and-agentic-capabilities/opt-in-or-out-of-ai-training-and-fine-tuning-in-splunk-enterprise-security) says training/fine-tuning use of AI service telemetry and prompt feedback is **off by default**. Opt-out stops new use immediately but does **not delete previously collected data**. Retention/deletion of that data needs separate terms.

These manuals establish choices, documented authority and a workflow. They do not supply independent production evaluation, full data-flow fields, training-dataset lineage or customer-specific connector policy. See the [dossier](cisco-splunk.md) and the separate [deterministic detection trace](splunk-lsass-source.md).
