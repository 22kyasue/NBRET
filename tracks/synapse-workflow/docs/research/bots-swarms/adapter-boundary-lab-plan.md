# Adapter boundary oracles

Use unchanged hash-verified Etcd/EtcdNonAtomic/SQLite modules with inert, explicit client doubles. No database, network, package installation or user files.

Specific unresolved questions: (1) does an already-expired Etcd JSON record disappear or reset before quota enforcement; (2) does the atomic variant dereference null when a key disappears after create-if-absent failure; (3) does SQLite release a pooled raw connection before its callback operation finishes? Oracles: expired record is returned with zero retry time, subsequent consume accumulates old points and rejects at a one-point limit; atomic post-create-failure missing read rejects TypeError; SQLite release occurs while selected query callback remains pending, and the operation later settles after the callback. Compare a successful normal SQLite result and cleanup all synthetic promises. These establish JS adapter control flow only, not actual Etcd/Knex/SQLite runtime behavior.
