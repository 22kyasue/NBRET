# Acquisition watchdog / cleanup boundary

Before execution: extract unchanged complete isClientLive, resetBlockedConnection and waitForJob bodies from the fully read pinned redis-queue-backend.ts. Wrap them in a local fixture class and erase TypeScript. Inject deterministic timers, a synthetic Redis client and connection methods. isRedisCluster is stubbed false; test clients use ready status, so that branch is not relied on. Record exact source-fragment hashes and wrapper substitutions. No packages, Redis, sockets, subprocesses or real timeouts.

Oracles: successful blocking result is parsed and watchdog cleared; when the watchdog fires while reset's reconnect remains pending, the outer method stays pending; releasing reconnect permits null return. A closing backend skips reset after watchdog. Rejection of the abandoned underlying command is observed by its existing catch. This validates extracted actual method ordering, not real transport behavior or a production outage.
