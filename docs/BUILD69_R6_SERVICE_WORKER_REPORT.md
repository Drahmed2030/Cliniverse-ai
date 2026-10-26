# Build 69 — R6: Service Worker fail-closed fix and recovery-evidence corrections — for Work 1 review

**Lineage / apply order on a clean checkout of baseline `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b`:**
1. R4 `docs/patches/build69-r4-auth-queue-safety.patch` — SHA-256 `80d3fdac33011265720e1963c704721070fc6eeb256f97e3fb5d45d5eaff93f9` (approved, **untouched**)
2. R5 `docs/patches/build69-r5-password-recovery-and-copy.patch` — SHA-256 `020c09184a148f649537c4ce9910df63127d410e80620a5d5a46e62c239cd5fb`
3. **R6** `docs/patches/build69-r6-service-worker-and-recovery-evidence.patch` — SHA-256 **`4f7dba1d16eff6f5441cbb70bb80eb8d30eebe90aa7a6d48c1eab1f6b9d793ae`**
Verified with `git am` in exactly this order on a fresh detached checkout (digests re-computed there).
**Status:** DRAFT, not merged, not deployed. No production deployment, iOS build, App Review submission, Supabase production setting, entitlement/StoreKit change, paid resource or secret. **BUILD / APPLE / RELEASE = HOLD.** Free/PRO gating is unchanged.

## File scope — 9 files (R6 only), +533 / −50
Source: `public/sw.js` (rewritten), `public/register-sw.js`, `next.config.js`, `app/lib/passwordRecovery.ts` (comments only), `app/reset-password/ResetPasswordClient.tsx` (wording), `scripts/verify-password-recovery-browser.cjs` (relabelled/extended), `scripts/verify-service-worker-browser.cjs` (new; real-Chromium evidence script, not part of `npm test`).
Tests: `tests/service-worker-policy.test.mjs` (new), `tests/password-recovery.test.mjs` (extended).

## 1. What was wrong (confirmed, with a nuance)
The baseline worker answered **every** GET (any origin) network-first, **stored every 200 response** in Cache API, and on any failure returned the cached copy or the cached app shell `/`. That includes Supabase `auth/v1/user`, `rest/v1/*` (profile/subscription reads), same-origin `/api/*` and `/reset-password`; requests carrying `Authorization` were stored under the plain URL, so another account could be served an earlier account's `auth/v1/user` offline.
**Nuance found while testing:** the baseline worker **as shipped never installs** — its precache lists `/icons/icon-192.png` and `/icon-512.png`, which return 404 (`cache.addAll` rejects). Chromium confirms (control A1: no active worker). So the leak could only exist in browsers that installed an *earlier* `cliniverse-v*` version with the same fetch logic and kept it, because a failed install leaves the previous worker active. I cannot know which earlier versions installed; R6 therefore handles the upgrade path rather than assuming it away. Whether the iOS WKWebView shell runs service workers at all is **UNVERIFIED** (no app-bound-domains configuration was found in the repo); the realistic exposure is Safari/PWA users, including the recovery page opened in Safari.

## 2. The fix (`public/sw.js`)
- **Never intercepts** (no `respondWith`, so no cache read, no cache write, no fallback page): any cross-origin request (Supabase `/auth|rest|functions|storage|realtime|graphql/v1`, everything else); same-origin `/reset-password` (all query variants, trailing slash, case, `//`, percent-encoding such as `/%72eset-password`), `/auth`, `/api`, `/login`, `/signin`, `/signup`, `/callback`, `/account`; any URL with token-like query keys (`access_token`, `refresh_token`, `code`, `token`, `token_hash`, `type`, `error*`, `id_token`, `redirect_to`, …); any request with `Authorization`, `apikey`, `x-client-info`, `RSC`, `Next-Router-State-Tree`, `Next-Action` headers; `cache: no-store`; all non-GET.
- **Caches only an allow-list of public same-origin static files** (`/native-offline.html`, `/manifest.json`, `/icons/*`, `/_next/static/*`) and only responses that are 200, same-origin and not `no-store/private/no-cache` (except immutable) or `Vary: *`.
- **Offline navigation** shows only the generic `native-offline.html`; a cached `/` or any account page is never substituted. A failed `/reset-password` navigation gets the browser's own network error.
- **Install** cannot fail because of one missing file (individual `cache.add`, errors swallowed); `skipWaiting()`.
- **Activate:** deletes every Cliniverse-family cache other than `cliniverse-static-v4` (`/^cliniverse/i`, covers `cliniverse-v3`, `-v2`, … and case variants) and scrubs anything in the current cache the policy would not store today; **caches that are not Cliniverse's are left alone**; `clients.claim()` so the upgraded worker controls open pages.
- **`register-sw.js`:** purges legacy caches at every page load even before an updated worker takes control; registers with `updateViaCache: 'none'` and calls `update()`; **registers immediately when `document.readyState === 'complete'`** (the script loads after hydration, so the old `load`-listener could miss the event and the worker never registered — found during browser QA); never registers from `/reset-password`.
- **`next.config.js`:** `/sw.js` and `/register-sw.js` served `no-cache, no-store, must-revalidate` so the fix reaches installed browsers promptly.
- **Same-origin private content:** every `/api/*` response bypasses the worker (cached or not). No other same-origin route is cached except the allow-list. Pre-existing and left alone: the `push` handler references `/icons/icon-192.png` (404) for the notification icon — cosmetic, push is not used in this release.

## 3. Evidence
**A. Real Chromium with a genuinely controlling worker** (`navigator.serviceWorker.controller` asserted; production build served locally; Supabase traffic stubbed at browser level; the stub is removed before offline checks because a stubbed response would be served even offline). `node scripts/verify-service-worker-browser.cjs` with `LEGACY_SW` = baseline `public/sw.js`:
| Check | Result |
|---|---|
| Control A1: baseline worker as shipped | does **not** install (404 icons) |
| Control A2: baseline fetch logic (precache made installable to model earlier versions) | installs and controls the page; **cached Supabase `auth/v1/user`, `rest/v1/profiles`, `/reset-password` (with and without query) and `/api/release-contract`**; **offline, it served all of them from cache** |
| Upgrade (same browser profile, legacy cache seeded with those entries) | `cliniverse-v3` removed; no sensitive entry in any cache; only allow-listed assets remain; new worker `activated`, no waiting worker, still controlling the open page; offline auth/REST/recovery/API requests all **fail** |
| Upgrade via normal app launch | legacy cache seeded, removed once the app page loads |
| Fresh install | page controlled by the new worker; Supabase/API/icon/manifest requests work; caches contain only allow-listed assets and only the current cache name |
| Recovery page while controlled | controlled by the worker, yet nothing about it or its Supabase calls is cached; worker did not register from it |
| Offline | auth/REST/API/recovery requests fail; `/reset-password` navigation = browser network error, no cached page; `/` shows only "Connection unavailable" |
Result: **20/20** (run 6 times; one intermittent failure was an artifact of the offline page interrupting `page.goto`, fixed by judging the resulting page).
**B. Node tests on the real worker files** (`tests/service-worker-policy.test.mjs`, in `npm test`): 20 sensitive request shapes never intercepted; sensitive headers disable interception even on static paths; allow-listed assets cached only when cacheable; offline fallbacks; install survives a missing file and precache files exist; activation removes legacy caches incl. synthetic auth/recovery entries and scrubs the current one; `register-sw.js` behaviour (purge, options, late-load, no registration from recovery path); both files name the same current cache; worker files served no-store. The suite **fails 9/10 against the baseline worker**, and mutations (no cross-origin bypass, no reset-path rule, cached `/` as fallback, no legacy deletion) each fail a test.
**C. Pipeline on a clean checkout (baseline + R4 + R5 + R6):** `npm test` **944/944** (3 further runs in the working tree also 944/944), `npx tsc --noEmit` PASS, `next build` PASS from an empty `.next` (`/reset-password` static).

## 4. Corrections requested
**Global sign-out wording.** The page no longer says "signed out on all devices". It now says it revoked the saved sign-in on other devices so they cannot renew it, that a device open right now may keep working briefly (typically up to an hour) until its current access expires, and, if the revocation call fails, that other sessions could not be revoked and the user should sign out from Me on each device and contact support. Asserted by test and by the browser script; the ~1 h figure is Supabase's default access-token lifetime and is worded as "typically".
**Recovery evidence relabelled.** `type=recovery` is documented (code comment, test name, report) as a **client routing hint chosen by whoever built the URL — not proof of origin**; the trust anchor is the server validating the tokens in `setSession`. The browser-script checks for a rejected session and a weak password are now labelled **SIMULATED server responses**; they do not prove that the live service enforces one-time links. The distinction recorded: the **email link** is consumed by Supabase's verify endpoint (so a mail scanner can use it up), whereas the **session tokens that link delivers in the URL fragment stay usable until they expire or are revoked**, which is why the page strips the fragment immediately. A sentence in the earlier assessment ("a recovery token is single-use… replay fails at setSession") was inaccurate and has been corrected there.

## 5. Preview plan
`docs/PASSWORD_RECOVERY_PREVIEW_TEST_PLAN.md` (proposal only, not authorised to run): recommends a separate Supabase TEST project over adding a preview redirect to production; lists the smallest code change needed (an allow-listed, preview-only redirect and Supabase-coordinate override that production builds ignore), the real-link test procedure (reset, replay, expiry, scanner, enumeration, rate limit, account isolation, revocation timing, service-worker upgrade) and teardown. If it cannot be done safely the real recovery test stays **UNVERIFIED** and recovery stays **HOLD**.

## 6. Limitations / not proven
- Only Chromium was tested; Safari/WebKit and the iOS WKWebView behaviour of service workers are UNVERIFIED.
- Server behaviour (one-time link, token validation, revocation timing) is simulated; nothing was run against a real Supabase project.
- The legacy-leak controls model earlier worker versions; which versions real users installed is unknown.
- HTTP-cache and bfcache behaviour of `/reset-password` rely on the `no-store` header (verified on the served build) but were not exercised on Safari.
- The Supabase client's own session storage is by design not touched by this patch.
- Open: Supabase Confirm email, redirect allow-list, SMTP, reviewer account; deletion-retention HOLD; Codemagic provenance; onboarding/App Store ECG wording; `account-codelab` fixed-delay flake (did not occur in these runs); production Vercel branch setting.

## 7. Work 1 handoff checklist
1. Recompute the three digests and apply R4 → R5 → R6 on a clean baseline checkout.
2. Read `public/sw.js` once, top to bottom (≈110 lines): bypass rules, allow-list, activation cleanup.
3. Run `scripts/verify-service-worker-browser.cjs` against a local production build (needs Playwright/Chromium) and `npm test`.
4. Decide whether the all-`/api` bypass and the `/account`, `/login`, `/signin`, `/signup`, `/callback` prefixes are the right fail-closed set.
5. Confirm the preview-test approach (TEST project) and who creates it.
**Recommendation:** READY FOR WORK 1 REVIEW (patch only). HOLD for build, deployment and release.
