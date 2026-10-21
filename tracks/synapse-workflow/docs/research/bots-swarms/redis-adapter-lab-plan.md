# Redis adapter synthetic oracle

Run only the pinned RateLimiterRedis and already reviewed local dependencies. Supply inert recording clients; never instantiate a Redis client or open sockets. This checks JavaScript readiness, error/fallback classification and response interpretation, not Redis atomicity, Lua execution, replication or cluster behavior.

Predefined assertions: closed recognized client rejects before an operation; default readiness checking off reaches the supplied client; unknown client shape is not rejected by the readiness option; node-redis boolean readiness false rejects; above-budget RateLimiterRes rejects without consuming insurance; ordinary storage Error uses insurance; local insurance instances permit separate budgets; configured key prefix reaches the recorded command; default command registration contains SET NX/INCRBY/PTTL; decimal points reject before a command; successful synthetic consumed count returns remaining quota. Use fresh instances and synthetic keys only. Disable even execution and use no memory-limiter timer by supplying a compatible inert insurance class.

Record script and source hashes, Node version, exact comparisons and cleanup (no sockets/timers/processes created). Preserve an exclusive timestamped receipt. Command: `node docs/research/bots-swarms/redis-adapter-lab.mjs`.
