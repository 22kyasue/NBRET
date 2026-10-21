# Cloud configuration auditing and cloud SDK behavior

Generated from `register/*.json` by `build-register.mjs`; do not edit by hand. 16 findings, 46 related corrections, 8 hazards.

Evidence strength, strongest first: integrated-lab (real tool run) > component-lab (fixture/mock run) > source-trace (code read) > public-doc > vendor-claim > synthesis. Read the cited lines before repeating a claim to a client.

## Hazards

- **`hazard.go-flagged-operation-wording`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent infers a specific recovered safety warning or rejected call behind repeated "flagged operation" phrases, or guesses what it was. **Instead:** Treat it as a conservative stop instruction with unknown cause; do not infer or retry (safety-context/README.md:33).
- **`hazard.go-integration-tests-live`** [toolchain/go-material-review.md:1350](../../toolchain/go-material-review.md#L1350): Agent runs upstream SDK integration/perf tests that load AWS config and create/delete real buckets. **Instead:** Do not run; go-material-review.md:1348 heading says do not run; research is source-only.
- **`hazard.go-jsonschema-example-network`** [toolchain/go-material-review.md:1200](../../toolchain/go-material-review.md#L1200): Agent runs `go test` on jsonschema and triggers an outbound GitHub request. **Instead:** Run nothing without containment review; filter tests.
- **`hazard.go-partial-file-status`** [toolchain/go-material-review.md:1379](../../toolchain/go-material-review.md#L1379): Agent reports api_client.go as partially reviewed. **Instead:** Completed at go-material-review.md:1391 (1–1372).
- **`hazard.go-prioritized-queue-outdated`** [toolchain/go-material-review.md:1118](../../toolchain/go-material-review.md#L1118): Agent takes the old "Prioritized unread queue" as current next work. **Instead:** Queue was completed later (S3 manager closure go-material-review.md:1361; serializers go-material-review.md:1623); verify in go-material-queue.json.
- **`hazard.go-stale-unread-counts`** [toolchain/go-material-review.md:9](../../toolchain/go-material-review.md#L9): Agent believes S3 module review is incomplete and re-reads or re-plans based on stale counts. **Instead:** Section order is newest-first in lines 3–712; later passages record file closures (e.g. go-material-review.md:1623, 1869, 2049). Check go-material-queue.json.
- **`hazard.go-transport-test-large-workloads`** [toolchain/go-material-review.md:827](../../toolchain/go-material-review.md#L827): Agent runs net/http transport tests with 1GiB bodies, unbounded producers or real DNS. **Instead:** Keep unexecuted; see go-material-review.md:847 (real DNS) and go-material-review.md:881.
- **`hazard.prowler-next-oracle`** [toolchain/cloud-posture.md:49](../../toolchain/cloud-posture.md#L49): An agent could take this 'next oracle' as an instruction and run the stopped Prowler denied-collection experiment. **Instead:** Stopped at cloud-posture.md:52 and toolchain/continuation.md:289 (cause unknown, see safety-context/README.md:13); do not run or re-propose without Kotaro's explicit instruction.

## Findings

| Finding | Strength | Stages |
| --- | --- | --- |
| [Prowler's admin-privilege check can report PASS when the policy document failed to collect](#cloudprowler-false-pass-on-missing-policy) | component-lab | testing, evidence, reporting |
| [Cloud collectors collapse denied, missing and default states into the same value](#cloudcollection-states-collapse) | source-trace | evidence, reporting |
| [Presigning builds signed request material; it is not a request or permission test](#cloudgo-presign-builds-not-sends) | source-trace | testing, evidence |
| [S3 HTTP 200 embedded errors are caught only where the special processor is installed](#cloudgo-s3-200-embedded-error-handled-selectively) | source-trace | testing, triage |
| [An ACL-shaped response is not proof ACL grants currently govern access](#cloudgo-s3-acl-response-not-authorization) | source-trace | testing, evidence |
| [DeleteObjects nil error does not mean every object was deleted](#cloudgo-s3-batch-delete-per-item-errors) | source-trace | operations, evidence, retest |
| [GetBucketPolicy returns raw policy text with no JSON parsing or validation](#cloudgo-s3-bucket-policy-raw-unparsed) | source-trace | testing, evidence |
| [Bucket default encryption config does not establish encryption of existing objects](#cloudgo-s3-default-encryption-not-existing-objects) | source-trace | testing, evidence, reporting |
| [Object Lock configuration is a default for new objects, not per-version retention evidence](#cloudgo-s3-lock-retention-default-not-per-object) | source-trace | testing, evidence, reporting |
| [S3 getters return success on empty bodies; denial, absence and empty must stay distinct](#cloudgo-s3-missing-denied-empty-distinct) | source-trace | testing, evidence, reporting |
| [S3 list decoders do not page; markers differ per operation; counts narrowed to int32](#cloudgo-s3-pagination-not-traversed) | source-trace | discovery, evidence |
| [Bucket PublicAccessBlock/PolicyStatus responses cannot establish effective public exposure](#cloudgo-s3-public-access-block-bucket-only) | source-trace | testing, evidence, reporting |
| [S3 waiters and region discovery prove a predicate, not an effect or permission](#cloudgo-waiters-and-region-lookup-predicates) | source-trace | testing, retest |
| [A cloud posture tool is not inert: it can create account artifacts, load remote code and run fixers](#cloudposture-tool-not-read-only) | source-trace | scoping, authorization, testing |
| [AWS detection products sample or scope coverage; absence of findings is conditional](#cloudgo-cloud-coverage-conditional-features) | public-doc | reporting, scoping |
| [SDK release history: features are added, reverted and reintroduced; presence ≠ availability](#cloudgo-sdk-catalog-not-availability) | public-doc | scoping, reporting |

### cloudprowler-false-pass-on-missing-policy

**`cloud.prowler-false-pass-on-missing-policy`: Prowler's admin-privilege check can report PASS when the policy document failed to collect** (component-lab)

The reviewed IAM check starts each report as PASS and changes it to FAIL only when a present policy document satisfies the admin-access test; a missing document leaves PASS. Downstream wrappers copy that PASS onward while the collection error is only in logs. A stand-in fixture run observed the missing-document case producing PASS.

**Do:** Never report a cloud check as passed without confirming its input was collected; reconcile findings against collection errors and denied APIs, and report unknown rather than clean.

**Limits:** The fixture executed the check body with stand-in objects, not the full Prowler CLI/output; no account-level false-pass incident was observed.

**Sources:** [toolchain/cloud-posture.md:12](../../toolchain/cloud-posture.md#L12), [toolchain/cloud-posture.md:43](../../toolchain/cloud-posture.md#L43)

**Receipts:** `toolchain/cloud-helper-receipt.json`

### cloudcollection-states-collapse

**`cloud.collection-states-collapse`: Cloud collectors collapse denied, missing and default states into the same value** (source-trace)

In the reviewed Prowler IAM collector, a denied login-profile read leaves console_access false, the same as having no profile; password-policy NoSuchEntity installs a default while AccessDenied leaves None; several policy methods keep defaults or partial lists after logged errors. A failed check can look like an empty result if its error channel is dropped, and muted or filtered findings are not absence of a configuration.

**Do:** Keep missing, denied, partial, empty, muted and explicitly-off as separate states in collection and in the report; list denied APIs and unvisited regions alongside successful checks.

**Limits:** Source-traced at one pinned Prowler revision; other providers and checks were not reviewed.

**Sources:** [toolchain/cloud-posture.md:54](../../toolchain/cloud-posture.md#L54), [toolchain/cloud-posture.md:29](../../toolchain/cloud-posture.md#L29), [toolchain/map.md:22](../../toolchain/map.md#L22)

### cloudgo-presign-builds-not-sends

**`cloud.go-presign-builds-not-sends`: Presigning builds signed request material; it is not a request or permission test** (source-trace)

V4 presign middleware returns on every branch and never calls next, so presigning does not reach HTTP transport (also for S3 Express). Presigning exists for mutating operations such as DeleteObject and DeleteBucket. URL presign rejects negative expiry and defaults zero to 900s; POST presign has no negative guard. Credential/Express session retrieval can still have provider effects, and signing logs include the full presigned URL unredacted.

**Do:** A generated presigned URL proves neither that a request succeeded nor that it is read-only; treat URLs as secrets in logs.

**Limits:** Source-only; custom providers/presigners not covered.

**Sources:** [toolchain/go-material-review.md:1957](../../toolchain/go-material-review.md#L1957), [toolchain/go-material-review.md:105](../../toolchain/go-material-review.md#L105), [toolchain/go-material-review.md:585](../../toolchain/go-material-review.md#L585)

### cloudgo-s3-200-embedded-error-handled-selectively

**`cloud.go-s3-200-embedded-error-handled-selectively`: S3 HTTP 200 embedded errors are caught only where the special processor is installed** (source-trace)

CopyObject and CompleteMultipartUpload install a 2xx-error middleware: empty XML becomes an error and an Error root is rerouted to the error decoder, so the blanket claim that 200-embedded errors are silently accepted is rejected for them. CreateMultipartUpload does not install it; its decoder accepts an empty 2xx body with nil UploadId, and the manager dereferences resp.UploadId directly.

**Do:** Check per-operation middleware before claiming silent acceptance; treat initiation responses without an UploadId as a conditional crash route for custom clients.

**Limits:** Source route only; no AWS response or panic observed.

**Sources:** [toolchain/go-material-review.md:1411](../../toolchain/go-material-review.md#L1411), [toolchain/go-material-review.md:1499](../../toolchain/go-material-review.md#L1499), [toolchain/go-material-review.md:1493](../../toolchain/go-material-review.md#L1493)

### cloudgo-s3-acl-response-not-authorization

**`cloud.go-s3-acl-response-not-authorization`: An ACL-shaped response is not proof ACL grants currently govern access** (source-trace)

Under BucketOwnerEnforced ownership, GetBucketAcl/GetObjectAcl still return a readable owner-full-control ACL even though ACLs are disabled as an authorization mechanism. Retrieving ACL metadata (READ_ACP) is not object-content access, and absent grants/owner in a parsed document still return success.

**Do:** Join ACL evidence with ownership controls, IAM and bucket policy before stating who can access data.

**Limits:** Pinned service documentation and parser source.

**Sources:** [toolchain/go-material-review.md:55](../../toolchain/go-material-review.md#L55), [toolchain/go-material-review.md:47](../../toolchain/go-material-review.md#L47)

### cloudgo-s3-batch-delete-per-item-errors

**`cloud.go-s3-batch-delete-per-item-errors`: DeleteObjects nil error does not mean every object was deleted** (source-trace)

DeleteObjects returns a typed output after pipeline success without inspecting output.Errors; Deleted and Errors are separate collections and the decoder never promotes per-item Errors to an operation error. Quiet mode omits successes and missing keys are reported deleted. Metadata-table results can carry embedded ErrorDetails while parsing succeeds.

**Do:** Cleanup and evidence receipts must reconcile requested keys/versions with per-item results, not rely on the call returning nil.

**Limits:** Source trace; real service behavior not observed.

**Sources:** [toolchain/go-material-review.md:505](../../toolchain/go-material-review.md#L505), [toolchain/go-material-review.md:1643](../../toolchain/go-material-review.md#L1643), [toolchain/go-material-review.md:1801](../../toolchain/go-material-review.md#L1801)

### cloudgo-s3-bucket-policy-raw-unparsed

**`cloud.go-s3-bucket-policy-raw-unparsed`: GetBucketPolicy returns raw policy text with no JSON parsing or validation** (source-trace)

The SDK reads the body into a buffer (pre-grown from Content-Length, no explicit cap) and stores any nonempty bytes as the Policy string; it does not parse JSON or validate grammar. Empty body leaves Policy nil with nil error. The directory-bucket variant does not support ExpectedBucketOwner, so universally adding that header is invalid.

**Do:** Policy analysis must parse and validate separately and preserve missing/unreadable/malformed states; do not reuse one collection recipe across bucket types.

**Limits:** Source-level consequence; no real responses or policy evaluation.

**Sources:** [toolchain/go-material-review.md:53](../../toolchain/go-material-review.md#L53), [toolchain/go-material-review.md:51](../../toolchain/go-material-review.md#L51)

### cloudgo-s3-default-encryption-not-existing-objects

**`cloud.go-s3-default-encryption-not-existing-objects`: Bucket default encryption config does not establish encryption of existing objects** (source-trace)

GetBucketEncryption returns the bucket default, which applies to new objects when an upload specifies no encryption; the bucket-key setting leaves existing objects unaffected and blocking a type still permits reads of pre-existing objects. DeleteBucketEncryption resets the default to SSE-S3; it neither removes encryption nor decrypts existing objects. KMS alias resolution can occur in the requester account, so raw key ID and resolved context must be kept.

**Do:** A cloud audit must not report "all objects encrypted with X" from a bucket default; per-object/version evidence is needed for that claim.

**Limits:** Pinned generated documentation and parser source; no account was queried.

**Sources:** [toolchain/go-material-review.md:17](../../toolchain/go-material-review.md#L17), [toolchain/go-material-review.md:519](../../toolchain/go-material-review.md#L519)

### cloudgo-s3-lock-retention-default-not-per-object

**`cloud.go-s3-lock-retention-default-not-per-object`: Object Lock configuration is a default for new objects, not per-version retention evidence** (source-trace)

GetObjectLockConfiguration is expressly a default for new objects and collects no object key/version. Retention and legal-hold getters return enum strings without membership checks, missing fields as zero strings, and do not compare expiry with current time or exercise deletion denial. Nil container, empty enum, OFF, unknown enum, expired retention and failed collection must remain distinct.

**Do:** Immutable-evidence or backup-protection claims need per-version retention evidence and time comparison, not bucket defaults.

**Limits:** Source-only; no legal or deletion test.

**Sources:** [toolchain/go-material-review.md:41](../../toolchain/go-material-review.md#L41), [toolchain/go-material-review.md:45](../../toolchain/go-material-review.md#L45)

### cloudgo-s3-missing-denied-empty-distinct

**`cloud.go-s3-missing-denied-empty-distinct`: S3 getters return success on empty bodies; denial, absence and empty must stay distinct** (source-trace)

Many generated S3 getters (retention, legal hold, tagging, ACL, ABAC, CORS, etc.) return nil error with empty output when the 2xx body hits EOF before the XML root. GetBucketTagging distinguishes NoSuchTagSet error, missing TagSet (nil) and explicit empty TagSet (non-nil empty slice). 403 versus 404 on object metadata depends on ListBucket permission, and IAM GetAccessKeyLastUsed changed NoSuchEntity to AccessDeniedException.

**Do:** Collectors must store collection outcome (denied, error, missing, empty, explicit off) separately and never convert a denied or empty response into a clean result.

**Limits:** Generated-source behavior; real-service responses were not observed.

**Sources:** [toolchain/go-material-review.md:37](../../toolchain/go-material-review.md#L37), [toolchain/go-material-review.md:45](../../toolchain/go-material-review.md#L45), [toolchain/go-material-review.md:35](../../toolchain/go-material-review.md#L35), [toolchain/go-material-review.md:161](../../toolchain/go-material-review.md#L161)

**Contrary or narrowing evidence:**
- [toolchain/go-material-review.md:1767](../../toolchain/go-material-review.md#L1767): Modeled error decoders return a typed error on empty payload; EOF-as-success applies to success getters.

### cloudgo-s3-pagination-not-traversed

**`cloud.go-s3-pagination-not-traversed`: S3 list decoders do not page; markers differ per operation; counts narrowed to int32** (source-trace)

Generated list decoders retain tokens/truncation but never request the next page or reconcile counts. Object v1 uses marker, v2 continuation-token/start-after, versions and multipart use paired key/version or key/upload-ID markers. MaxKeys/KeyCount/MaxUploads/MaxParts parse int64 then cast to int32 without range check. The handwritten paginator StopOnDuplicateToken compares only KeyMarker; absent IsTruncated is distinct from false.

**Do:** Inventory collectors must follow the exact pagination contract, retain filters/tokens/region and errors, and never report partial lists as absence.

**Limits:** Source-level; no list run.

**Sources:** [toolchain/go-material-review.md:1543](../../toolchain/go-material-review.md#L1543), [toolchain/go-material-review.md:1719](../../toolchain/go-material-review.md#L1719), [toolchain/go-material-review.md:541](../../toolchain/go-material-review.md#L541)

### cloudgo-s3-public-access-block-bucket-only

**`cloud.go-s3-public-access-block-bucket-only`: Bucket PublicAccessBlock/PolicyStatus responses cannot establish effective public exposure** (source-trace)

GetPublicAccessBlock output is bucket-level only; effective behavior also depends on account settings and inherited organization policies combined restrictively. PolicyStatus.IsPublic is a nullable service classification: an empty 2xx body returns nil error with zero output, and a document lacking IsPublic returns nil IsPublic. The four PAB booleans are independently optional; nil omits a field while false is explicit.

**Do:** Collect account and organization layers before claiming a bucket is or is not public, and keep missing/unknown separate from false in findings.

**Limits:** Source-only; no claim the real service returns incomplete documents.

**Sources:** [toolchain/go-material-review.md:61](../../toolchain/go-material-review.md#L61), [toolchain/go-material-review.md:59](../../toolchain/go-material-review.md#L59), [toolchain/go-material-review.md:1849](../../toolchain/go-material-review.md#L1849)

### cloudgo-waiters-and-region-lookup-predicates

**`cloud.go-waiters-and-region-lookup-predicates`: S3 waiters and region discovery prove a predicate, not an effect or permission** (source-trace)

HeadObject/HeadBucket Exists waiters succeed on nil error without completeness assertion; NotExists accepts modeled NotFound and does not prove erasure of historical versions; 403 is not absence. GetBucketRegion helper can return a region with nil error despite a 301/403 status error.

**Do:** Do not report deletion or access from waiter success or region discovery.

**Limits:** Source-only.

**Sources:** [toolchain/go-material-review.md:27](../../toolchain/go-material-review.md#L27), [toolchain/go-material-review.md:1338](../../toolchain/go-material-review.md#L1338)

### cloudposture-tool-not-read-only

**`cloud.posture-tool-not-read-only`: A cloud posture tool is not inert: it can create account artifacts, load remote code and run fixers** (source-trace)

Importing a Prowler IAM check is not offline: the IAM client is constructed from the global provider at module import. Prowler's IAM collector calls GenerateCredentialReport, creating an account-side artifact. It can download custom checks from S3 into installed package directories, and it has fixer functions that change the account for FAIL reports. Checks and providers are in-process Python plugins, so a blanket read-only assumption is inappropriate.

**Do:** When a cloud audit is authorized, scope it explicitly with the client: list which APIs will be called and which create artifacts, keep fixers and remote check loading disabled, and use an isolated environment for the tool itself.

**Limits:** Source reading only; none of these paths was executed in the research.

**Sources:** [toolchain/cloud-posture.md:11](../../toolchain/cloud-posture.md#L11), [toolchain/cloud-posture.md:16](../../toolchain/cloud-posture.md#L16), [toolchain/cloud-posture.md:24](../../toolchain/cloud-posture.md#L24), [toolchain/cloud-posture.md:27](../../toolchain/cloud-posture.md#L27)

### cloudgo-cloud-coverage-conditional-features

**`cloud.go-cloud-coverage-conditional-features`: AWS detection products sample or scope coverage; absence of findings is conditional** (public-doc)

Release history documents that Macie continually samples objects, Internet Monitor monitors a selected traffic percentage, GuardDuty CreateDetector can return UnprocessedDataSources, Security Hub auto-enable can opt out of default standards, and Resilience Hub credits excluded recommendations in its score.

**Do:** Client reports that cite AWS-native detections must state the configured coverage; "no findings" is not "no issues".

**Limits:** Dated publisher announcements, not observed customer settings.

**Sources:** [toolchain/go-material-review.md:117](../../toolchain/go-material-review.md#L117), [toolchain/go-material-review.md:113](../../toolchain/go-material-review.md#L113), [toolchain/go-material-review.md:149](../../toolchain/go-material-review.md#L149)

### cloudgo-sdk-catalog-not-availability

**`cloud.go-sdk-catalog-not-availability`: SDK release history: features are added, reverted and reintroduced; presence ≠ availability** (public-doc)

The pinned 26,563-line aws-sdk-go-v2 CHANGELOG records additions later reverted (Access Analyzer April 6/7, Lambda resource-policy BPA), APIs "unavailable for general use", enforcement "not yet active", ignored deprecated scope parameters (Audit Manager awsServices returns an empty list) and notes that concern Java/Python not Go.

**Do:** Assessments and tool catalogs must verify current availability and enforcement rather than infer them from SDK surface or release notes; an empty response from a deprecated parameter is not zero coverage.

**Limits:** Publisher history; not runtime or current-service verification.

**Sources:** [toolchain/go-material-review.md:307](../../toolchain/go-material-review.md#L307), [toolchain/go-material-review.md:197](../../toolchain/go-material-review.md#L197), [toolchain/go-material-review.md:311](../../toolchain/go-material-review.md#L311)

## Corrections

An earlier passage that a later one narrows or supersedes. Believe the later passage.

| Risk | Earlier | Later | What to believe now |
| --- | --- | --- | --- |
| high | [toolchain/go-material-review.md:569](../../toolchain/go-material-review.md#L569) | [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563) | Believe the conditional A/B mismatch; it is not a demonstrated bypass. |
| high | [toolchain/go-material-review.md:1009](../../toolchain/go-material-review.md#L1009) | [toolchain/go-material-review.md:999](../../toolchain/go-material-review.md#L999) | Treat the A→B→B redirect token restoration as an open source-level candidate. |
| high | [toolchain/continuation.md:333](../../toolchain/continuation.md#L333) | [toolchain/continuation.md:289](../../toolchain/continuation.md#L289) | Treat every numbered next step in toolchain/continuation.md that proposes the cloud denied-collection experiment as stopped. |
| high | [toolchain/cloud-posture.md:49](../../toolchain/cloud-posture.md#L49) | [toolchain/cloud-posture.md:52](../../toolchain/cloud-posture.md#L52) | Do not run or re-propose the denied policy-version experiment; it is stopped and needs Kotaro's explicit instruction to resume. |
| high | [toolchain/go-material-review.md:1890](../../toolchain/go-material-review.md#L1890) | [toolchain/go-material-review.md:1895](../../toolchain/go-material-review.md#L1895) | Treat GetObject checksum validation as conditional (200, EOF, supported algorithm, non-multipart). |
| high | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1935](../../toolchain/go-material-review.md#L1935) | Checksum retention across retries is intended; do not report it as an integrity bypass. |
| high | [toolchain/go-material-review.md:2019](../../toolchain/go-material-review.md#L2019) | [toolchain/go-material-review.md:2023](../../toolchain/go-material-review.md#L2023) | Require an observed End event for completeness. |
| medium | [toolchain/go-material-review.md:753](../../toolchain/go-material-review.md#L753) | [toolchain/go-material-review.md:753](../../toolchain/go-material-review.md#L753) | Do not attribute the Express token redirect hypothesis to CopyObject. |
| medium | [toolchain/go-material-review.md:563](../../toolchain/go-material-review.md#L563) | [toolchain/go-material-review.md:561](../../toolchain/go-material-review.md#L561) | Scope the Express mismatch to static default credentials plus per-operation override. |
| medium | [toolchain/go-material-review.md:1021](../../toolchain/go-material-review.md#L1021) | [toolchain/go-material-review.md:999](../../toolchain/go-material-review.md#L999) | Use go-material-review.md:999 as the current state of the redirect question. |
| medium | [toolchain/go-material-review.md:703](../../toolchain/go-material-review.md#L703) | [toolchain/go-material-review.md:693](../../toolchain/go-material-review.md#L693) | No default conflicting-region signing issue. |
| medium | [toolchain/go-material-review.md:307](../../toolchain/go-material-review.md#L307) | [toolchain/go-material-review.md:307](../../toolchain/go-material-review.md#L307) | Preserve both; do not catalog the addition as retained. |
| medium | [toolchain/go-material-review.md:207](../../toolchain/go-material-review.md#L207) | [toolchain/go-material-review.md:211](../../toolchain/go-material-review.md#L211) | Do not treat the Lambda BPA announcement as durable functionality. |
| medium | [toolchain/go-material-review.md:1409](../../toolchain/go-material-review.md#L1409) | [toolchain/go-material-review.md:1411](../../toolchain/go-material-review.md#L1411) | Check per-operation registration before claiming silent acceptance. |
| medium | [toolchain/go-material-review.md:1493](../../toolchain/go-material-review.md#L1493) | [toolchain/go-material-review.md:1499](../../toolchain/go-material-review.md#L1499) | Nil UploadId dereference is a conditional source route, not an observed panic. |
| medium | [toolchain/go-material-review.md:747](../../toolchain/go-material-review.md#L747) | [toolchain/go-material-review.md:667](../../toolchain/go-material-review.md#L667) | Conditional legacy-path source reachability; modern path rejects empty buckets. |
| medium | [toolchain/go-material-review.md:611](../../toolchain/go-material-review.md#L611) | [toolchain/go-material-review.md:607](../../toolchain/go-material-review.md#L607) | URL presign rejects negative expiry; POST presign still lacks that guard (go-material-review.md:601). |
| medium | [toolchain/go-material-review.md:1945](../../toolchain/go-material-review.md#L1945) | [toolchain/go-material-review.md:1957](../../toolchain/go-material-review.md#L1957) | Presigning does not send the application request (V4 and Express); provider effects remain separate. |
| medium | [toolchain/go-material-review.md:1749](../../toolchain/go-material-review.md#L1749) | [toolchain/go-material-review.md:2025](../../toolchain/go-material-review.md#L2025) | Select results are delivered via the eventstream middleware. |
| medium | [toolchain/go-material-review.md:1083](../../toolchain/go-material-review.md#L1083) | [toolchain/go-material-review.md:979](../../toolchain/go-material-review.md#L979) | Length mismatches error at transport but may have partial remote effect. |
| medium | [toolchain/go-material-review.md:1467](../../toolchain/go-material-review.md#L1467) | [toolchain/go-material-review.md:961](../../toolchain/go-material-review.md#L961) | No header injection claim via standard transport; custom RoundTrippers differ. |
| medium | [toolchain/go-material-review.md:1927](../../toolchain/go-material-review.md#L1927) | [toolchain/go-material-review.md:1973](../../toolchain/go-material-review.md#L1973) | Changed retry bodies require external mutation, not the SDK retry loop. |
| medium | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | [toolchain/go-material-review.md:2093](../../toolchain/go-material-review.md#L2093) | Check for retry wrappers with max 0 before assuming a bounded retry count. |
| medium | [toolchain/go-material-review.md:1965](../../toolchain/go-material-review.md#L1965) | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | Default retries are bounded at 3; see the later AddWithMaxAttempts(0) exception. |
| low | [toolchain/go-material-review.md:567](../../toolchain/go-material-review.md#L567) | [toolchain/go-material-review.md:565](../../toolchain/go-material-review.md#L565) | No default unprotected-cache race. |
| low | [toolchain/go-material-review.md:299](../../toolchain/go-material-review.md#L299) | [toolchain/go-material-review.md:299](../../toolchain/go-material-review.md#L299) | Release note does not close the redirect candidate. |
| low | [toolchain/go-material-review.md:687](../../toolchain/go-material-review.md#L687) | [toolchain/go-material-review.md:683](../../toolchain/go-material-review.md#L683) | No deployment-wide stale V4a cache inference. |
| low | [toolchain/go-material-review.md:1585](../../toolchain/go-material-review.md#L1585) | [toolchain/go-material-review.md:2039](../../toolchain/go-material-review.md#L2039) | SDK does not locally validate completed part lists. |
| low | [toolchain/go-material-review.md:631](../../toolchain/go-material-review.md#L631) | [toolchain/go-material-review.md:627](../../toolchain/go-material-review.md#L627) | Path style only without custom endpoint. |
| low | [toolchain/go-material-review.md:1879](../../toolchain/go-material-review.md#L1879) | [toolchain/go-material-review.md:1879](../../toolchain/go-material-review.md#L1879) | No usable partial output from public GetObject on error. |
| low | [toolchain/go-material-review.md:1356](../../toolchain/go-material-review.md#L1356) | [toolchain/go-material-review.md:1356](../../toolchain/go-material-review.md#L1356) | Interpret multipart checksum by algorithm and checksum type. |
| low | [toolchain/go-material-review.md:1379](../../toolchain/go-material-review.md#L1379) | [toolchain/go-material-review.md:1427](../../toolchain/go-material-review.md#L1427) | Options.Copy is shallow. |
| low | [toolchain/go-material-review.md:451](../../toolchain/go-material-review.md#L451) | [toolchain/go-material-review.md:449](../../toolchain/go-material-review.md#L449) | Reject CBOR infinite-loop and header-sized allocation claims. |
| low | [toolchain/go-material-review.md:1073](../../toolchain/go-material-review.md#L1073) | [toolchain/go-material-review.md:987](../../toolchain/go-material-review.md#L987) | SDK body logging buffers whole bodies. |
| low | [toolchain/go-material-review.md:2055](../../toolchain/go-material-review.md#L2055) | [toolchain/go-material-review.md:2075](../../toolchain/go-material-review.md#L2075) | Report only the malformed-length relationship as an open candidate, not the missing cap. |
| low | [toolchain/go-material-review.md:475](../../toolchain/go-material-review.md#L475) | [toolchain/go-material-review.md:445](../../toolchain/go-material-review.md#L445) | Weakness limited to the shared document helper. |
| low | [toolchain/go-material-review.md:1146](../../toolchain/go-material-review.md#L1146) | [toolchain/go-material-review.md:1146](../../toolchain/go-material-review.md#L1146) | No jsonschema duplicate bypass from hash collisions. |
| low | [toolchain/go-material-review.md:429](../../toolchain/go-material-review.md#L429) | [toolchain/go-material-review.md:425](../../toolchain/go-material-review.md#L425) | Misleading return contract only. |
| low | [toolchain/go-material-review.md:1945](../../toolchain/go-material-review.md#L1945) | [toolchain/go-material-review.md:1949](../../toolchain/go-material-review.md#L1949) | Checksum package findings apply to UploadPart/PutObject, with different trailer placement. |
| low | [toolchain/go-material-review.md:895](../../toolchain/go-material-review.md#L895) | [toolchain/go-material-review.md:951](../../toolchain/go-material-review.md#L951) | Closed bodies may be drained (≤256KiB) and reused. |
| low | [toolchain/go-material-review.md:1411](../../toolchain/go-material-review.md#L1411) | [toolchain/go-material-review.md:1419](../../toolchain/go-material-review.md#L1419) | Do not claim a connection leak from the NopCloser wrapper alone. |
| low | [toolchain/go-material-review.md:141](../../toolchain/go-material-review.md#L141) | [toolchain/go-material-review.md:369](../../toolchain/go-material-review.md#L369) | Do not cite RecursionDetection as a loop detector. |
| low | [toolchain/go-material-review.md:783](../../toolchain/go-material-review.md#L783) | [toolchain/go-material-review.md:803](../../toolchain/go-material-review.md#L803) | Response parsing tolerates spaces in field names. |
| low | [toolchain/go-material-review.md:423](../../toolchain/go-material-review.md#L423) | [toolchain/go-material-review.md:415](../../toolchain/go-material-review.md#L415) | Stack steps do not reject duplicate middleware IDs. |
| low | [toolchain/go-material-review.md:1965](../../toolchain/go-material-review.md#L1965) | [toolchain/go-material-review.md:1983](../../toolchain/go-material-review.md#L1983) | No default token leak; record only a quota-accounting boundary. |
| low | [toolchain/go-material-review.md:393](../../toolchain/go-material-review.md#L393) | [toolchain/go-material-review.md:375](../../toolchain/go-material-review.md#L375) | Negative delay not reached through HeadBucket/HeadObject waiters. |
