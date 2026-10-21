# AI agents, automation and worker fleets

Automation and AI are different dimensions. A fixed rule can run automatically without a language model. A language model can write advice without being allowed to execute anything. An agent adds a loop in which model output can select tools or future work.

Understanding that loop requires a concrete view of inputs, capabilities, permissions, records and external effects. The word “agentic” does not supply those details.

## Follow information into an action

An investigator receives alerts, documents and tool results. Some are trustworthy records; some contain untrusted content. The planner proposes a next step. An execution layer maps that proposal to an allowed tool call. The tool returns a result, which is added to the investigation and may influence the next step.

The permission boundary belongs in the execution path. A prompt telling the model to stay within scope is an instruction; a gate that prevents a disallowed destination or action is enforcement. Both can be useful, but they answer different questions.

The provider studies distinguish triage, conversational assistance, investigative agents and action-taking workflows. CrowdStrike's described triage agreement metric, Microsoft's feature-specific investigation trial, Google's distinct chat and investigation interfaces, and NRI Secure's phase/reviewer process must retain their separate definitions. A headline accuracy or productivity number cannot be transferred to a different feature or customer environment.

## Reviewers, grounding and memory

An agent can quote an exact tool result and still misinterpret it. A reviewer agent can agree with another agent because both share the same assumption or source error. Useful evaluation needs an independent rule for judging the claim, positive and negative controls, and retention of what actually ran.

Memory and recovery add another layer. A journal can record an intention, a returned result or a completed internal transition. The external action may happen before its receipt is saved. Replaying the journal therefore does not automatically establish exactly-once execution. The PentestGPT, wrapper, SDK and persistence studies trace these boundaries in selected code and finite experiments.

## A fleet needs ownership and reconciliation

A queue stores jobs. Workers claim temporary ownership, often using a lease or lock, renew it while working and report a result. If a worker disappears, the system may reassign the job. The first worker can have performed an effect before losing contact. Temporary ownership metadata cannot undo that effect.

Cancellation has similar stages: stop admitting work, signal a worker, wait for cooperation, stop relevant execution, release ownership and reconcile effects. The bots-and-swarms research includes finite fixtures showing a processor can ignore a cancellation signal. This is a bounded observation, not a claim that every queue behaves identically.

Use an operation ID to make a particular effect repeat-safe when the destination supports it. An **idempotent** operation has the same intended effect when repeated as when performed once. A queue-level duplicate check alone cannot guarantee idempotency at an external destination. **Fencing** means the effect boundary rejects an obsolete worker's authority, rather than merely recording a newer owner in the queue.

## Identity is not one label

Operator, customer, account, session, device, worker and internet address are distinct. A shared address can represent multiple legitimate principals; one principal can use multiple addresses. The selected limiter fixtures make those tradeoffs concrete. A shared cluster key likewise does not automatically provide distinct authority for each node.

The finite bots/swarms local reading inventory is now closed, with its exact scope recorded in the closure study. That source-reading milestone does not establish all transitive dependencies, Redis/Go integrations, deployed controls or detector accuracy.

## Reproduce, build, deliver

**Reproduce the concept:** model a receipt job with a unique operation ID. Let a worker produce a receipt and lose its acknowledgement. Compare a naive retry with a destination that recognizes the operation ID. Separately show that receiving a cancellation signal is not proof the worker has stopped. This can be a deterministic in-process exercise before a real broker is introduced.

**Build the platform:** separate planner, scope gate, tools, job ownership, evidence store and effect verification. Add quotas and cancellation at each place work or side effects can occur. Retain decisions, errors and recovery provenance without exposing raw credentials.

**Deliver the service:** make a capability table for each customer: allowed data, tools, actions, approvals, destinations, budgets and recovery. Review outputs and incident handling with the same discipline applied to human work. Automation changes the implementation; it does not remove responsibility for the result.
