# Build 69 — R6.1 small fix (Issue #36, Work 1 REQUEST SMALL FIX on R6) — minimal diff for independent review

**Apply order on a clean checkout of baseline `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b`** (each digest re-computed on the clean checkout):
1. R4 `build69-r4-auth-queue-safety.patch` `80d3fdac33011265720e1963c704721070fc6eeb256f97e3fb5d45d5eaff93f9` — approved, untouched
2. R5 `build69-r5-password-recovery-and-copy.patch` `020c09184a148f649537c4ce9910df63127d410e80620a5d5a46e62c239cd5fb`
3. R6 `build69-r6-service-worker-and-recovery-evidence.patch` `4f7dba1d16eff6f5441cbb70bb80eb8d30eebe90aa7a6d48c1eab1f6b9d793ae`
4. **R6.1 `docs/patches/build69-r6-1-sw-first-visit-and-cache-fixes.patch` — SHA-256 `00a37464a802642ccbd6710ff250ac9418ce70bd97a0b1018a3b258d2f4ce11d`** (incremental, 8 files, +438 −15)
**Status:** DRAFT, not merged, not deployed. No production change, Apple submission, iOS build, entitlement/StoreKit change or paid resource. **BUILD / APPLE / RELEASE = HOLD.** No redesign: R6's bypass rules, allow-list, activation cleanup and recovery flow are unchanged.

## Exact changed files (R6.1 only)
Source: `public/sw.js` (+23/−10 region: cache predicate, query-name matching, version handshake), `public/register-sw.js` (+4), `app/lib/staleWorkerGuard.ts` (new), `app/reset-password/ResetPasswordClient.tsx` (guard call + blocked view).
Tests/evidence scripts: `tests/service-worker-policy.test.mjs` (extended), `tests/stale-worker-guard.test.mjs` (new), `scripts/verify-service-worker-browser.cjs` (new section D), `scripts/verify-password-recovery-browser.cjs` (new account-isolation section). Docs (not in the patch): this report, the revised `docs/PASSWORD_RECOVERY_PREVIEW_TEST_PLAN.md`.

## 1. Cache-Control precedence — fixed
`isCacheable` no longer has an `immutable` exception. `no-store`, `private` and `no-cache` are matched as whole directive tokens (case-insensitive, including `private="x"`) and always win. Tests: `no-store, immutable`, `private, immutable`, `immutable, no-store`, `immutable, private`, `no-cache, immutable`, upper-case and field-specific forms are never stored; `public, max-age=31536000, immutable`, `public, max-age=0`, `max-age=3600` and no header still are. (These new tests fail against the R6 files.)

## 2. Sensitive query-parameter names are case-insensitive — fixed
Names are lower-cased (URLSearchParams already percent-decodes them, so `%63ode`/`%43ODE` are covered) before matching. Variants tested on every allow-listed path and on `/`: `CODE`, `Code`, `cOdE`, `Token_Hash`, `TOKEN_HASH`, `ACCESS_TOKEN`, `Refresh_Token`, `Type`, `ERROR_CODE`, `Id_Token`, `a=1&Token=x`, `%63ode`, `%43ODE` → never intercepted, the worker does not even fetch, nothing is written. **Cleanup:** activation reuses the same predicate, so existing cache entries with such names are removed (tested with all variants plus kept entries `/icons/icon-192.svg`, `?v=3`, `/native-offline.html`). An ordinary `?v=3` is still cached.

## 3. Old service worker still controlling the origin on the FIRST direct visit to `/reset-password` — handled, not by cache cleanup alone
**Why cleanup is not enough:** while an old worker controls the page it sees, stores and could replay the page's own requests (the recovery session's `GET /auth/v1/user` lookup); a page cannot opt out of its controlling worker, but a new navigation is not controlled once the registration is removed.
**Mechanism (narrow):**
- `sw.js` answers a tiny version handshake (`postMessage` on a `MessageChannel`, reply `{version: 'cliniverse-static-v4'}`); older workers never answer.
- New `app/lib/staleWorkerGuard.ts`, awaited by the recovery page **before** it reads the URL fragment or creates the recovery client: probe the controller and every active registration; if any is not the current version → unregister those registrations, delete Cliniverse-family caches other than the current one, and `location.replace` the same path with a non-sensitive marker `?swclean=1` and the **fragment untouched** (never sent to a server). No request carrying the tokens is made before that.
- After the one reload, a stale worker still present ⇒ **`blocked`**: the page strips the fragment, never uses the link, and shows "We could not prepare this page safely… Your link was not used." A marker query prevents loops.
- `register-sw.js` also purges legacy caches on `controllerchange`, because a still-running old worker can re-create its cache after the page-load purge (Work 1's race question).
**Evidence (real Chromium, genuinely controlling legacy worker, update deliberately not yet performed — the old worker keeps being served; fixed build on :3112, previous R6 build on :3113 as negative control; 29/29, run 3×):**
| Check | Result |
|---|---|
| D1: legacy cache seeded with an auth response; first document of the visit controlled by the old worker | PASS |
| D1: page unregisters it and reloads once (`?swclean=1`, fragment kept) into an **uncontrolled** document | PASS |
| D1: **no Supabase request while the old worker controlled the page**; the first lookup happens after the reload | PASS (order: doc controlled → doc uncontrolled → `GET /auth/v1/user`) |
| D1: form for the right masked account; tokens/marker gone from the address bar; completes the password change | PASS |
| D1: afterwards 0 registrations, no legacy cache, no sensitive entry | PASS |
| D2: unregister made to fail ⇒ fail closed: blocked message, **zero Supabase requests**, no tokens in the URL | PASS |
| **Control D3 (previous R6 build, no guard):** the page stays under the old worker, its recovery lookup goes through it, and the old worker **stores that user lookup in its cache** | confirmed — the exposure the guard prevents |
Unit tests (`tests/stale-worker-guard.test.mjs`, 9): no SW support / nothing registered ⇒ clean without side effects; current worker left alone; old controller ⇒ unregister → legacy cache deletion (only legacy Cliniverse caches) → one reload preserving the fragment byte-for-byte; stale active registration while uncontrolled; marker present and still stale ⇒ blocked with no side effects; unregister failure or unreadable registrations still end reload-then-block; the version string is identical in guard, worker and registration script; the page calls the guard before reading the tokens or creating the client.
**Limits, stated plainly:** (a) this runs only if the page's own scripts run — if an old worker serves an old cached shell while the network is down, none of this code executes (the shell is the app root and its shared client could consume a fragment; this needs the old worker, a failing network and an old shell at once; the worker upgrade itself is the remedy) — UNVERIFIED in practice; (b) Chromium only: Safari/WebKit semantics of "unregister, then navigate is uncontrolled" are not proven, which is exactly why the guard re-checks after the reload and fails closed; (c) an old worker could have cached the HTML of `/reset-password` itself earlier — harmless (no tokens in cached documents) and removed by the guard.

## 4. Preview validation plan — revised (`docs/PASSWORD_RECOVERY_PREVIEW_TEST_PLAN.md`)
- **Same origin as the worker:** a preview host cannot prove an upgrade of the production-origin worker. The plan now proves the *mechanism* on one stable preview origin (a throwaway branch alias that stays the same across commits: commit A with a legacy worker, commit B with the fix pushed to the same branch, then the real email link as a first direct visit) and states that the **production-origin upgrade stays UNVERIFIED** until the controlled production release smoke test on a browser profile that already visited production.
- **Explicit preview-only condition:** strict `NEXT_PUBLIC_VERCEL_ENV === 'preview'` plus the presence of the test configuration; `!== 'production'` is gone.
- **Configuration and redirect tied together:** one JSON value `{supabaseUrl, anonKey, resetRedirectUrl}` validated as a unit — `supabaseUrl` must be in a committed allow-list of TEST projects (empty ⇒ feature off) and must not be the production ref; the redirect must be on the current deployment host with path exactly `/reset-password`.
- **No silent fallback:** in test mode an invalid or partial configuration disables sign-in/sign-up/reset behind a blocking banner; it never substitutes production coordinates or the production redirect; production builds ignore the variable (test pinned in the plan). Still a plan; the code is a separate reviewed PR.

## 5. Account isolation — tested (real Chromium, same browser profile)
Profile holds **B's** session (seeded in the app's own storage) and the app is loaded first (control: with no session the same check shows the sign-in screen). Then **A's** recovery runs in that profile: A's masked email is shown; **every** Supabase request of the recovery (`GET /auth/v1/user`, `PUT /auth/v1/user`, `POST /auth/v1/logout?scope=global`) carries **A's token and none carries B's**; B's stored session is **byte-for-byte unchanged**; reloading the app afterwards still recognises B and uses B's token, never A's. 24/24 (run 3×).

## Results
| Check | Result |
|---|---|
| Focused: `tests/service-worker-policy.test.mjs` 15, `tests/stale-worker-guard.test.mjs` 9 | 24/24 PASS (the 5 new policy tests fail against R6's `sw.js`/`register-sw.js`) |
| Full suite on a clean checkout, baseline + R4 + R5 + R6 + R6.1 | **958 / 958 PASS** (3 further runs in the working tree 958/958) |
| `npx tsc --noEmit` / `next build` (empty `.next`, dummy public Supabase env) | PASS / PASS (`/reset-password` static) |
| Chromium service-worker script (`BASE`, `LEGACY_SW`, `BASE_R6`) | 29/29, 3 runs |
| Chromium recovery script incl. account isolation | 24/24, 3 runs |
Commands: `npm test`; `npx tsc --noEmit`; `npx next build`; `npx next start -p 3112` (fixed build) and `-p 3113` (previous build, control); `BASE=http://localhost:3112 BASE_R6=http://localhost:3113 LEGACY_SW=<git show e4dab59:public/sw.js file> node scripts/verify-service-worker-browser.cjs`; `BASE=http://localhost:3112 node scripts/verify-password-recovery-browser.cjs` (global Playwright + Chromium).

## Not proven / still open
Real Supabase behaviour (redirect, one-time link, revocation timing, scanners); Safari/WebKit and WKWebView; production-origin worker upgrade; the old-worker-plus-offline-shell corner above; Supabase Confirm email, SMTP, reviewer account; deletion-retention HOLD; Codemagic provenance; onboarding/App Store ECG wording; production Vercel branch setting; `account-codelab` fixed-delay flake (not seen in these runs).

## Review scope requested from Work 1
`public/sw.js`, `public/register-sw.js`, `app/lib/staleWorkerGuard.ts` + the page call, the new tests, the preview plan, and the account-isolation section — nothing else changed. Recommendation: READY FOR WORK 1 RE-REVIEW (patch only); HOLD for build/deploy/release.
