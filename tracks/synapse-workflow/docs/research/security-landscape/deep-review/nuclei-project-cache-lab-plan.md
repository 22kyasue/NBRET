# Project-cache component experiment — declared before execution

2026-10-17. Pinned Nuclei projectfile package at a151a1d54fad0d5ef71f01662b0bb3955a98c7c5. No HTTP engine, targets, credentials, models or proxy; synthetic response objects only. Use a Go overlay test and temporary disk cache, preserve logs/hashes. This narrow package does not import the blocked template/interactsh server path; do not retry that dependency or alter Windows controls.

Success criteria: store synthetic tenant-A response under pre-auth request bytes; retrieve by identical pre-auth bytes representing tenant B. A request with explicit Authorization header included in bytes should miss, as should a different path. Record whether caller-provided principal/environment metadata appears in cached response (none expected). This demonstrates only cache component behavior. Full auth-provider-to-cache identity confusion remains unvalidated until a permitted engine-level test is possible.
