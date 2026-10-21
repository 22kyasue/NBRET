# FortiSOAR connector: retrieving and updating a Sentinel incident

Read **2026-10-17**, source-only. Repository fortinet-fortisoar/connector-microsoft-sentinel pinned at `9606fe875f20bc500bc6bafb1bfa995833523f3b` (2026-08-24). Connector metadata version **2.0.0**. This code connects FortiSOAR to Microsoft's incident API; it is not FortiGate firmware, FortiAI model code or a Fortinet SOC runbook.

## The selected contiguous chain

The [connector entry](https://github.com/fortinet-fortisoar/connector-microsoft-sentinel/blob/9606fe875f20bc500bc6bafb1bfa995833523f3b/microsoft-sentinel/connector.py) receives config, operation and params, looks up an operation function and invokes it with connector name/version. There is no per-operation approval prompt in this entry. A customer playbook/platform policy must supply any required decision boundary.

[Operation code](https://github.com/fortinet-fortisoar/connector-microsoft-sentinel/blob/9606fe875f20bc500bc6bafb1bfa995833523f3b/microsoft-sentinel/operations.py) formats subscription/resource-group/workspace paths using configuration. Get Incident List creates OData filters from creation time, status, severity and a caller query, then makes one GET. A supplied skip parameter is split at "$skipToken="; no automatic pagination loop appears in this selected function. The result must not be described as all incidents unless the caller handles subsequent pages.

Update Incident first GETs the current incident, reads its labels and appends caller-supplied comma-separated labels. It builds properties for description/title/severity/classification/comment/reason/status/labels, permits custom properties to override that dictionary, removes false-valued/empty payload members recursively, and PUTs the resulting body. An optional caller ETag is included in the JSON body; this review does not establish the server's concurrency guarantees or whether that is an effective precondition. No approval, follow-up GET, saved previous-state rollback or action-state polling is added here.

An incident update changes the investigation record. It is not endpoint containment, removal of malware or restoration of business service. The selected path should be drawn as FortiSOAR → Azure management API → Sentinel incident, not as FortiSOAR → endpoint agent.

## Authentication, requests and persistence

The [authentication module](https://github.com/fortinet-fortisoar/connector-microsoft-sentinel/blob/9606fe875f20bc500bc6bafb1bfa995833523f3b/microsoft-sentinel/microsoft_api_auth.py) supports application client secret, delegated authorization/refresh code, and certificate/MSAL paths. It builds tenant-specific token endpoints and an Azure management scope. The certificate path retrieves a private-key file through the platform CRUD helper. Token generation stores accessToken and expiresOn; check/refresh writes updated credentials back through the connector-configuration helper. These are privileged customer/platform responsibilities, not consent supplied by the connector itself.

The HTTP helper obtains a token and attaches authorization, JSON content type and eventual-consistency headers. It accepts 200/201/202/204, returning parsed JSON when headers suggest JSON, otherwise an empty dictionary. A 404 becomes a message dictionary rather than an exception. Other responses become ConnectorError. Requests have configured TLS verification but **no explicit timeout argument** in these calls; catching timeout exceptions does not create a deadline. A 202 is not separately followed to completion by this helper.

Read source also shows configuration-update keys access_token versus the authentication module's accessToken, and a refresh_token key with trailing whitespace in one old-config lookup. These are visible inconsistencies worth validation, not tested claims about real customer failures. The delegated grant_type assignment uses a trailing comma, creating a tuple in Python; exact request encoding/effect remains untested.

## Configuration and evidence limits

The [metadata](https://github.com/fortinet-fortisoar/connector-microsoft-sentinel/blob/9606fe875f20bc500bc6bafb1bfa995833523f3b/microsoft-sentinel/info.json) defaults authentication selection to delegated and TLS verification to true. It exposes workspace/tenant/app identifiers, secret or certificate setup, and incident-update fields. Some descriptions call fields optional while their required flags are true. Treat the UI schema and API behavior separately. Only configuration and selected incident-operation metadata were read; other operation schemas remain unread.

[Requirements](https://github.com/fortinet-fortisoar/connector-microsoft-sentinel/blob/9606fe875f20bc500bc6bafb1bfa995833523f3b/microsoft-sentinel/requirements.txt) names msal without a version. requests and platform connectors/integrations modules are imported but not resolved in that file. No exact transitive dependency graph or runtime was installed. A recursive nontruncated repository tree contained no dedicated test directory/files; that says nothing about private CI or platform tests. Events and supplied playbook JSON remain unread.

Read completely: entry, constants, authentication, requirements and release notes. Read operations through selected incident retrieval/update plus nearby helpers and final dispatch/health section; the rest remains partial. No code, authentication, network API or incident mutation was executed. Residency, retention, model use, approval policy and operating SLA cannot be established from this connector.
