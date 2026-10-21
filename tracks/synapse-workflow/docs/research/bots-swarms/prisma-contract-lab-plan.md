# Prisma adapter contract oracle

Use the unchanged, hash-checked pinned CommonJS adapter and its local base classes with an inert in-memory Prisma-shaped client. No ORM package, database, sockets, real accounts or external requests. Exercise ordinary sequential quota accounting and option/cleanup contracts only. Do not infer database transaction isolation from the stand-in.

Predefined comparisons using the adapter's `_upsert` boundary: (1) finite live record increments; (2) expired record resets; (3) null-expiry record is replaced on subsequent finite upsert; (4) duration-zero consecutive upserts return a count of one each; (5) `clearExpiredByTimeout:false` still schedules the adapter cleanup timer because its default uses `|| true`; (6) cleanup timer can be explicitly cleared by this fixture. Capture every store call and source hashes, settle all operations, and remove the sole timer in `finally`. No concurrency/database atomicity or full public-consume assertion.
