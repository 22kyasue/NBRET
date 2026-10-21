# Concurrent results and assessment evidence

Source review dated 2026-10-18 UTC. conc v0.3.0, commit 7b8c8f2875cb861bb61844c9bcaa1aed070adbd4; MIT license, SHA-256 e3dfc7ac698a5b64eefc720531595b9d6e3f6c5da7f741ef15e453709e173ee2. Exact file hashes and complete emitted ranges are in dependency-reading-queue.json. No upstream tests or runtime reproduction were executed in this continuation. The previously stopped OpenFGA operation remains stopped.

## Result retention is a policy, not a complete task ledger

Complete result_pool.go:1?93 traces Go:32?35 to the mutex-protected aggregator:89?93 and Wait:40?43. Results arrive in completion order, not submission order. Returned slices do not provide immutable evidence, task identity, or provenance. result_error_pool.go:25?32 normally excludes a result when its callback returns an error; WithCollectErrored:45?48 changes that policy. Wait returns a result slice and a combined error separately, without pairing each error to its result. A caller therefore needs its own explicit task-status records to distinguish attempted, successful, failed, and omitted work.

WithContext in result_error_pool.go:55?59 constructs a new result-context pool without copying collectErrored. Source-established configuration-order boundary; no application impact demonstrated. result_context_pool.go:1?75 delegates cancellation policy to ContextPool; its introductory automatic-cancellation wording is broader than the default behavior. WithCancelOnError is explicit.

## Error registration and cancellation

Complete context_pool.go:24?57 invokes a callback with the context without an initial canceled-state rejection. Opt-in cancellation records the initiating error before cancellation; Wait cancels on return. These mechanisms do not forcibly stop a callback that ignores its context. Complete error_pool.go:85?97 serializes registration and either retains the first registered error or joins errors. First registered does not establish which underlying fault occurred first in real time. internal/multierror/multierror_go119.go:1?10 and multierror_go120.go:1?10 select multierr.Combine versus errors.Join by Go version; their external implementations are separate boundaries.

Complete pool.go:39?70 traces admission through an unbuffered task channel and optional limiter. Blocking admission has no context-select arm. Configuration freezes after initialization. Pool behavior does not itself produce an assessment coverage receipt. This is source reasoning, not a measured deadlock, cancellation failure, or lost finding.

## Authored tests: positive evidence and oracle limits

Read complete pool_test.go:1?144, error_pool_test.go:1?118, context_pool_test.go:1?238, result_pool_test.go:1?97, result_error_pool_test.go:1?131, and result_context_pool_test.go:1?215. Positive authored assertions cover aggregate errors, finite result sets, concurrency ceilings, final active counts, explicit cooperative cancellation, and configuration restrictions. They have not been run here.

result_pool_test.go:42?47 labels a case ?after wait? without calling Wait; the equivalent ordinary/error/context pool cases do call it. The collection-on-error result test checks length rather than the retained value, while other fixtures assert exact successful values. First-error tests explicitly acknowledge scheduling races and use sleeps to favor registration order (context_pool_test.go:161?173); these are not proofs of chronological fault ordering. The combination test:176?188 positively expects the original error and excludes cancellation. Panic-related tests were read as source only; no prohibited reproduction was performed.

## Actual application boundary

At OpenFGA fb8e7df866742a0c947e3066919ee59ac9e70eea, complete internal/concurrency/concurrency.go:1?33 constructs a plain ContextPool with cancel-on-error, first-error, and a goroutine ceiling. Tree-wide source search found no NewWithResults or WithCollectErrored call. Therefore the result-collection configuration behavior is a dependency contract, not an established OpenFGA finding. Existing application channel/error annotations remain separate.

## Iterator continuation

Complete iter/iter.go:1?85 uses a per-call atomic index and limits workers to input length. A negative explicit MaxGoroutines reaches a loop that starts no workers; there is no positive-value validator here, unlike Pool.WithMaxGoroutines. This is a source precondition boundary, not demonstrated application misuse. Complete iter/map.go:24?65 preserves input positions in an allocated result slice; MapErr stores a result even when its callback returns an error and aggregates errors separately. It has no per-index error map and no cancellation parameter. Tests and application reachability remain next work.

## Falsifiable implications

An evidence collector should record one task identity, terminal status, result reference, error, environment version, and attempted-path description per scheduled operation. A result count alone cannot establish completed coverage. The smallest later permitted experiment would compare such a ledger with returned successful and errored results under explicitly chosen collection policies; disproof would be a caller that already retains complete per-task terminal records. This is a proposed experiment only, not an authorization to resume the stopped operation.

## Ordered callbacks, finite package closure

Complete stream/stream.go:1?152 queues each callback channel before admitting its task (:62?86). One callback reader consumes channels in queued order (:119?135); an earlier unfinished task therefore delays later callbacks even if their tasks completed. This preserves callback order, not task completion order, external transactionality, or durable delivery. Wait:89?103 waits for workers and cleans up the callback reader; callers still must call it. Channel pooling:138?152 is reuse, not an evidence archive. No callback or failure reproduction was run.

Complete stream/stream_test.go:1?143 has an exact ordered-result assertion:38?53 and authored task/callback concurrency checks:55?83. The worker callbacks use t.Fatal on excessive concurrency; Go testing control-flow semantics are an external boundary, not established by this source file. Remaining authored cases test panic propagation; they were read only. Benchmark per-task:131?143 increments a count but does not assert the count.

Complete iter/iter_test.go:1?180 positively checks receiver reuse, empty input, exact mutations and finite large-input results. No negative-MaxGoroutines case appears. Complete iter/map_test.go:1?179 checks exact indexed partial results plus both ErrorIs identities for combined errors:132?164, even though both errors share message text. Its ?huge inputs? case inside TestMapErr:167?178 calls Map, so that particular case does not exercise MapErr. Other MapErr cases remain meaningful positive evidence. Complete waitgroup_test.go:1?156 includes exact completion counts and returned failure identity expectations; no tests were executed.

Complete README.md:1?464 describes scoped ownership and waiting, but :24/:38 broadly associates WithContext with cancellation on first error without the explicit option required by implementation. The pinned historical release-status text is not a current project-status claim. Complete .github/workflows/go.yml:1?43 configures build, lint and race-enabled tests, but floating stable Go/latest linter and tag-based actions do not identify a unique historical execution environment. A configured workflow is not a passing CI receipt. Complete .golangci.yml:1?11 and go.sum:1?36 describe configured checks and dependency hashes, not execution.

All 32 inventoried conc package files now have complete source/documentation ranges. This finite cached-package closure excludes imported standard-library, test-framework, and multierr implementations and does not imply runtime verification or OpenFGA-wide closure. Next source work returns to the original dependency/application queue.
