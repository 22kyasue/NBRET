# Queue clean batch contract

Execute only the pinned Queue.clean method, extracted unchanged from its hash-checked TypeScript file and stripped of types with Node's built-in transformer. Use an inert backend returning fabricated IDs; no Redis, file deletion, queue mutation, sockets or new packages. Trace/event stand-ins only collect arguments.

Predefined checks: a15000 requested total with full10000 backend batches (1) makes two10000 calls and (2) returns20000 fabricated IDs; (3) an exact10000 total makes one call and returns10000; (4) waiting state normalizes to wait and each completed batch emits cleaned. These compare caller accounting to its requested cap, not datastore deletion behavior. All promises must settle and no timers/services are started.
