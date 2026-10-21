# Synapse Practice Workspace

A runnable owned local work-order app with synthetic data, two fictional organizations and ordinary draft → submitted → approved behavior. This is a guided/familiar workspace with no planted vulnerabilities. It does not establish discovery performance, a blind evaluation or client readiness.

## Run and use

From this repository:

```text
node src/practice/cli.mjs
```

Open the loopback URL printed by the command. An optional `--port 8897` selects a free fixed port; the default chooses an available port. The CLI logs the URL only. Stop with Ctrl+C; restarting resets every order, session and synthetic token.

Choose Alice (Northline member), submit the draft, switch to Carol (Northline approver), then approve it. Bob and Dana provide the equivalent flow in the separate Southbank organization. Members submit their own draft orders; approvers approve submitted orders in their organization. Records in other organizations are unavailable. The UI includes responsive layout, system light/dark appearance and a theme toggle.

There are no real accounts, passwords, billing, uploads, filesystem browsing, external assets, outbound calls or persistence. Every account is openly selectable for this guided local demonstration. Do not use real data. Tokens and cookies are ephemeral. Local HTTP cookies are HttpOnly/SameSite=Strict; this loopback app is not a production authentication service.

## In-process API and routes

`startPracticeApp({port:0})` from `src/practice/app.mjs` returns `{url,tokens:{alice,bob},identities:{alice,bob},requestLog,isListening,close}`. `close()` is idempotent. Only `127.0.0.1` is bound. Integration bearer tokens are returned to the caller only, never HTML or logs. Request receipts contain only method/path/declared actor ID, capped at 10,000 entries; they are in-process observations, not independent trusted collector evidence.

| Route | Normal result |
| --- | --- |
| `GET /` | Self-contained workspace HTML, 200. |
| `GET /api/csrf` | `{csrf}`, 200, plus an HttpOnly strict cookie for browser writes. |
| `POST /api/session` | JSON `{user:"alice"}` (or bob/carol/dana); 200 `{profile:{id,principal,tenant,role,name,organization}}`, sets auth cookie. |
| `POST /api/logout` | JSON `{}`; 200 `{signedOut:true}`, revokes browser session. |
| `GET /api/me` | 200 `{profile:{...}}`; anonymous/invalid auth 401 `{error:"Authentication required"}` with no profile. |
| `GET /api/work-orders` | 200 `{orders:[...]}` for the authenticated organization; anonymous 401. |
| `GET /api/work-orders/:id` | 200 `{order:{...}}`; foreign or missing order 404 `{error:"Work order not found"}`. |
| `POST /api/work-orders/:id/submit` | JSON `{}`; member-owned draft → submitted, 200 `{order:{...}}`. |
| `POST /api/work-orders/:id/approve` | JSON `{}`; organization approver submitted → approved, 200 `{order:{...}}`. |

All writes require an exact `Origin` equal to the returned URL and JSON content type. Cookie writes also require `X-CSRF-Token` equal to the nonce from `/api/csrf`; bearer writes use explicit tokens and exact origin. Role mismatch is 403, state mismatch 409, unsupported method 405, unknown route 404, invalid JSON/route 400, unsupported media 415, oversized body 413. No CORS is enabled. Request body limit is 2 KiB, route limit 256 characters, header limit 8 KiB and session count bounded. Restart resets resource limits and data.

Alice identity is principal `alice`, tenant `north`, role `member`; Bob is `bob` / `south` / `member`. Initial Alice order IDs are `WO-N101`, `WO-N102`, `WO-N103`; Bob has `WO-S201`, `WO-S202`, `WO-S203`. Each organization starts with one draft, one submitted and one approved order.

## Verification and design provenance

```text
node --test test/practice-app.test.mjs
```

The focused suite starts only owned loopback servers and checks ordinary anonymous/sign-in/profile/list/detail behavior, tenant scoping, submit/approve roles/states, write origin/CSRF/media/size boundaries, no token exposure in HTML/receipts, script parsing, closure and reset. It does not run scanners, research scripts or public target requests.

Elm's final focused run on 2026-10-18 passed 4 tests, with zero failures/skips (181.47 ms runner duration). Visible QA through the existing computeruse harness confirmed Alice sign-in, WO-N101 submission, Carol switch and approval with updated counters. Desktop light/dark and 390-pixel mobile views were inspected. The temporary QA tab was closed with `closed:true`, and the owned CLI process was stopped. This verifies an ordinary guided flow, not exhaustive UI/security behavior.

Before UI implementation, consulted the existing prompt library manifest and saved-design catalog plus `prototypes/tobira-library-shelf/library.css` for restrained system typography, light/dark tokens and a compact workspace layout. Source files remain in `C:/Users/kotar/githubprojects/prompt`; no external asset restoration or source/provenance changes were needed. Research principles applied: explicit identity/evidence limits and legitimate controls from the previously read claim-record/scorer-admission research. A functioning guided application supplies observable normal behavior; it supplies no hidden answer key or effect-independent evaluation.
