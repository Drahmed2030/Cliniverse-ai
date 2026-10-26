# Password recovery — real end-to-end test plan on a protected preview (PROPOSAL, NOT AUTHORISED TO RUN) — revised for R6.1

**Status:** plan only. Nothing here has been executed, no setting was changed, nothing was deployed. Running any step needs explicit written approval from MASTER and Work 1 (Issue #36). If the preconditions cannot be met safely, the real end-to-end test stays **UNVERIFIED** and recovery stays **HOLD**.

## Why a plan is needed
- `RESET_REDIRECT_URL` is the fixed constant `https://www.cliniverseai.com/reset-password` and the Supabase coordinates are literals in `app/lib/supabaseConfig.ts` (production project `zbiujqxinvcxvuviuenx`). A preview cannot receive its own reset link or talk to a test project without a reviewed code change.
- The simulated browser tests prove page behaviour only. They do **not** prove: what Supabase actually sends, that the link lands on the page with a fragment in the format we parse, one-time consumption of the **email link**, rejection of invalid/expired/replayed links by the real service, how long already-issued access tokens survive a global sign-out, or that real mail scanners consume the link.
- **A preview host is a different origin from production.** A service-worker or cache upgrade test on a preview host is **not** proof that an already-installed production-origin worker is upgraded (workers, caches and storage are per-origin). The plan therefore separates two claims:
  1. *Mechanism proof on a stable preview origin* — can be done before release (below).
  2. *Production-origin upgrade proof* — **UNVERIFIED until a controlled production release**, covered by the release smoke checklist in `docs/VERCEL_PRODUCTION_RELEASE_CONTROL.md` run in a browser profile that already visited production.

## Option A — separate Supabase TEST project (recommended)
A throwaway project with its own Auth settings, test users and team-owned mailboxes. No production data, no production Auth change. An authorised operator creates it (a free-tier project is the likely cost — confirm before creating; "no paid resources" applies). Settings: Confirm email ON, redirect allow-list = exactly the preview host's `/reset-password`, minimum password length 8, the same "Reset password" template as production, custom SMTP or team mailboxes within the default limits.
**Option B — production project with an allow-listed preview URL:** rejected by default (production Auth change, widens the allow-list to a non-production host, tests against production auth). Only with explicit MASTER approval and immediate removal afterwards.

## Smallest code change that makes the test possible (separate reviewed PR — NOT in R6.1)
`resolveAuthTestConfig(env, currentHost)` — pure, unit-tested, one function deciding **everything** together:
1. **Explicit preview-only condition** (strict equality, not `!== 'production'`): test mode is considered only when `NEXT_PUBLIC_VERCEL_ENV === 'preview'` **and** `NEXT_PUBLIC_AUTH_TEST_CONFIG` is present. `development`, `undefined`, `production`, any other value ⇒ not test mode ⇒ production constants. (Whether `NEXT_PUBLIC_VERCEL_ENV` is exposed to the client depends on a Vercel project setting — UNVERIFIED; if not exposed, set an explicit Preview-target-only variable instead and require both.)
2. **Project configuration and redirect are one unit.** `NEXT_PUBLIC_AUTH_TEST_CONFIG` is a single JSON value `{ supabaseUrl, anonKey, resetRedirectUrl }`, validated together:
   - `supabaseUrl` must equal an entry of a hard-coded allow-list of TEST project URLs (committed in a reviewed change; **empty ⇒ the feature stays off**), must not contain the production ref `zbiujqxinvcxvuviuenx`, and must be `https://<ref>.supabase.co`;
   - `resetRedirectUrl` must be `https` on the current deployment host (`resetRedirectUrl.host === currentHost`), path exactly `/reset-password`, host matching the project's preview-host pattern;
   - every field present and well-formed.
3. **No silent fallback to production.** If test mode is requested (flag present on a preview build) and validation fails, the result is `invalid`: the app shows a blocking banner "Auth test configuration invalid", and sign-in, sign-up and reset requests are **disabled**. It never substitutes the production Supabase project or the production redirect. A production build ignores the variable completely (a test pins "production + variable present ⇒ variable ignored, production constants used").
4. Preview environment variables are set for the Preview target only; Deployment Protection (SSO) stays ON.

## Procedure (when authorised)
**Part 1 — same-origin service-worker upgrade proof (stable preview origin).**
1. Create a throwaway test branch `test/auth-preview-1` (never `claude/*`, never `qa/*`). Its alias `https://cliniverse-ai-u7gi-git-test-auth-preview-1-cliniverse-ai.vercel.app` stays the same across commits, so it is **one origin**.
2. Commit A = the lineage with the **pre-R6 `public/sw.js`** (baseline file with its precache list made installable, to model an earlier installable version). Push → preview. In a clean browser profile open the alias, sign in with a test user, browse so the legacy worker caches Supabase/API/recovery responses; confirm the legacy cache holds them.
3. Commit B = the reviewed lineage with R6.1 and the preview-config PR. Push to the **same branch** → same origin, new deployment. Without opening the app first, request a reset for a test user and open the **real email link** (first direct visit to `/reset-password` with the old worker controlling): expect the guard to unregister the old worker, reload once and continue; record the console-free outcome. Repeat from a second profile that instead opens the app first (activation path).
4. Verify caches/registrations afterwards (DevTools → Application) and that offline `/reset-password` and Supabase calls fail.
**Part 2 — real recovery against the TEST project (same preview).**
5. Users `A` (to reset) and `B` (stays signed in in the same profile). Request a reset for `A` while `B` is signed in; open the link in that same profile. Verify `B`'s stored session is untouched and still works; `A`'s page shows `A`'s masked email; tokens never appear in request URLs/Referer; fragment removed from the address bar/history.
6. Set a new password; `A` signs in with it and not with the old one; record how long an already-issued `A` access token keeps working after the global sign-out (expected until expiry) and that its refresh stops.
7. **Replay:** open the same email link twice → the second must be rejected by Supabase (record the exact error hash). Separately reconstruct the post-click URL only from a test log → document that a valid session fragment still works until expiry (consumed link ≠ revoked session).
8. **Expired** (shorten the link lifetime in the TEST project only); **scanner** (GET the link without JS and confirm it is consumed; document the user-facing consequence); **enumeration** (unknown address ⇒ same message); **rate limit** (repeat requests ⇒ wait message).
**Part 3 — teardown.** Delete test users/project, preview env vars, the test branch and its deployments, any allow-list entry; record the outcome in Issue #36.

## Evidence package expected back
Preview deployment ids + SHAs for commits A and B; sanitised screenshots (tokens masked); the email's host/redirect (tokens redacted); a results table for every numbered step; teardown confirmation. Work 1 reviews before any production deployment is considered. **Production-origin upgrade remains UNVERIFIED until the controlled production release smoke test.**

## Explicit non-goals
No production deployment, no production Auth/redirect/template change, no use of real user accounts, no deletion of real data, no iOS build, no merge.
