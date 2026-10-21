# Limiter composition oracle

Execute SHA-verified unchanged pinned CommonJS wrapper, union and timeout modules with synthetic compatible limiters. Standard Node only; no database, server, package installation or real identity.

Predeclared checks: allow wins overlapping deny and avoids inner consumption; deny consume rejects while deny get resolves a synthetic result; union rejection still leaves the successful sibling consumed; duplicate union prefixes collapse result entries; a timeout rejects before a synthetic primary settles and does not cancel its later effect; insurance can settle the caller while the primary remains pending and later settles too. Settle all synthetic promises and allow wrapper timers to clear. Treat this as composition behavior, not Redis atomicity or full request enforcement.
