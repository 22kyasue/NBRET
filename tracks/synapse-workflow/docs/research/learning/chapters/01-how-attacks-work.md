# How hacking actually works

Hacking is not one special program that breaks a computer. It is finding a way to make a system do something its owner did not intend. Sometimes the system has a software defect. Sometimes it correctly accepts a stolen credential. Sometimes a legitimate feature gives someone far more power than the business intended.

The useful question is: **what access does the person start with, what boundary do they cross, and what new ability do they gain?** That question connects an individual technical defect to a real incident.

## Start with the system, not an attack name

A typical web application has a browser, an application server, a database, accounts and external services. The browser sends requests. The server decides what to do, reads or changes data, and returns a response. The browser then displays some of that response. The visible screen is only one part of this system.

Suppose Alice clicks an order. The browser might request `/api/orders/42`. The server receives an account identity and an order number. It must establish that Alice may read that particular order before returning it. Hiding Bob's order in the interface does not enforce that rule: the server still needs to check it for every relevant route.

This is an **authorization** problem: who may do what to which object? **Authentication** is the different question of who signed in. A correctly authenticated Alice can still receive data she is not authorized to read. The same distinction applies to employees, service accounts, cloud applications and AI agents.

## Several mechanisms produce very different failures

| Mechanism | What goes wrong | What a meaningful investigation checks |
| --- | --- | --- |
| Broken object access | An account can read or change an object belonging to someone else | Ownership, tenant, role, object state and every alternative interface |
| Stolen credentials or sessions | The system accepts a credential now possessed by an unintended person | Credential lifetime, granted permissions, device/context requirements and revocation |
| Injection | Untrusted input is interpreted as instructions in another language or subsystem | How input crosses into a query, shell, template or interpreter; separation of data from instructions |
| Browser script execution | Attacker-controlled content runs as script in a page's security context | Where the content enters, how it is rendered, which browser protections apply and what the script can reach |
| Server-side request abuse | A feature that fetches a URL can reach destinations it should not | URL resolution, redirects, destination checks and the actual egress path |
| Unsafe file or object processing | A parser or loader interprets hostile structure in a dangerous way | Accepted formats, parser behavior, resource limits and any execution boundary |
| Memory corruption | Native code reads or writes memory incorrectly | The exact input, affected operation, build, protections and observed failure; a crash alone is not proof of reliable code execution |
| Excessive identity permissions | An account or application can grant access or reach resources beyond its job | Effective permissions and prerequisites, not only role names |
| Business-logic failure | Individually valid operations violate a larger rule | Ordering, repeated actions, approval revisions, balances and who may initiate versus approve |
| Supply-chain compromise | A trusted dependency, build process or update carries an unwanted change | Developer/build/release trust, signing and distribution, plus what actually ran |

These are mechanisms to learn, not claims that this investigation reproduced every category. The research goes especially deep into identity, evidence, tools, automation and action boundaries. A source catalog entry for a fuzzing or binary-analysis tool does not mean its complete engine was reviewed.

## A real attack is usually a path with prerequisites

Consider a stolen session. A session is a credential representing an already signed-in interaction. Possession of it may let someone act without repeating the original login. Whether it works depends on expiry, revocation, session binding, required step-up checks and the permissions behind the session. Saying “MFA was enabled” does not answer every question about a stolen authenticated session.

Now add a second boundary: the account can access an administrative application. A third boundary might allow that application to grant another identity access. A fourth might expose a data store. The harmful result depends on the conjunction of these conditions. A graph showing a possible path helps investigate the chain, but the path must still be checked for current credentials, reachability, permissions and state.

The incident studies below make this concrete. The reported CircleCI chain connects an engineer's session to production access and downstream secrets. Microsoft's reported January 2024 chain connects a legacy account to application permissions and mailbox access. Sourcegraph's account describes a publicly committed administrative token. These are different entry mechanisms with an overlapping lesson: existing authority can be as consequential as a new software exploit.

## How a tester establishes a weakness

A tester first writes the expected rule. “Alice cannot read Bob's order” is more useful than “the API must be secure.” They establish accounts and state, perform a bounded action, retain the request and response, compare the result with the rule, and test alternatives. A refusal label is insufficient if the response still contains Bob's details. A failure to reach the page is insufficient evidence of a successful refusal.

The tester then explains the consequence without silently adding capabilities. Reading one synthetic order does not prove full database access. A suspicious version string does not prove an exploitable deployment. A publicly reported incident is not a locally reproduced result. Those distinctions make a finding stronger because the reader knows precisely what was demonstrated.

## Reproduce, build, deliver

**Reproduce the concept:** use the local order-access lab in the reproduction chapter. Make the same request as Alice and Bob, compare vulnerable and repaired behavior, and inspect the returned data rather than only the status. The lab uses a deliberately simplified identity selector; it is not a production login system.

**Build the tool:** represent a test as identity, preconditions, action, expected property, result and evidence. Keep failed collection distinct from a negative result. Add a repaired version and positive controls so a test cannot “pass” by making the whole application unavailable.

**Deliver the service:** agree on targets, roles, permitted techniques, operational limits and escalation before testing. An engagement report should connect demonstrated behavior to affected business rules, a repair owner and a repeatable retest. The services chapter expands the staffing and commercial side.

## Read the investigation underneath this explanation

The following studies retain their original source links, qualifications and counterexamples. Read them to follow individual incidents and assessment mechanisms in depth, rather than treating this introductory model as the entire research result.
