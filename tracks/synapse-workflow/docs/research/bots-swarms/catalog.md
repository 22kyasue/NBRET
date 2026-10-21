# Pinned implementation catalog

Snapshot date 2026-10-17. Default branch snapshots are not release endorsements. All raw clones are in ignored `.tools/bots-swarms`; exact local locations, commit dates and initial clean states are in snapshots.json. Reading statuses concern selected files, not entire repositories.

| Project and immutable tree | Role in this study | Evidence obtained |
| --- | --- | --- |
| [Scrapy](https://github.com/scrapy/scrapy/tree/32579047288e06656d10b7fe97fc9acb092de8ad) | Crawler request/session construction | Complete cookie middleware/jar, Request and retry/redirect files; partial tests; no runtime |
| [BullMQ](https://github.com/taskforcesh/bullmq/tree/a5e710bf4d1bf689fe40a372b3f0ddbbaaab33cc) | Distributed queue, leases, job recovery and cooperative cancellation | Complete selected lease Lua/lock-manager; partial worker/tests; adapted class lab with synthetic backend |
| [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible/tree/d19a457455338b73172d47d004f402bd0b748152) | Quota key/storage enforcement | Complete memory dependency chain and selected test file; actual class used in loopback lab |
| [Coraza](https://github.com/corazawaf/coraza/tree/b3c652296752293652db04a54079c020e1be3c01) | Rule-to-HTTP rejection connector | Complete middleware and test file; partial internal transaction; no Go runtime test |
| [memberlist](https://github.com/hashicorp/memberlist/tree/5cd2c4b0fb09caea5de03aae1adb9c36374ef3e0) | Legitimate peer membership/failure detection | Complete suspicion timer/test, local awareness and alive delegate interface; partial state callers; no runtime |

Additional primary specifications/project documents are listed with byte hashes and content-state limitations in sources.json. A downloaded file is not automatically the requested article: the 911 S5 receipt records an interstitial. No verification challenge was executed.

[HashiCorp memberlist](https://github.com/hashicorp/memberlist) provides a peer membership substrate. Its source review must not be generalized into proof of job scheduling, effect consistency, workload authorization or a malicious botnet. No memberlist runtime test has been performed.
