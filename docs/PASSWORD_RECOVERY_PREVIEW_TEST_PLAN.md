# Password recovery — real end-to-end test plan on a protected preview (PROPOSAL, NOT AUTHORISED TO RUN)

**Status:** plan only. Nothing here has been executed, no setting was changed, nothing was deployed. Running any step needs explicit written approval from MASTER and Work 1 (Issue #36). If the preconditions cannot be met safely, the real end-to-end test stays **UNVERIFIED** and the recovery feature stays **HOLD**.

## Why a plan is needed
- `RESET_REDIRECT_URL` is the fixed constant `https://www.cliniverseai.com/reset-password` (`app/lib/passwordRecovery.ts`). A preview deployment therefore cannot receive its own reset link: Supabase would send the user to production (or to the Site URL when the redirect is not allow-listed — in which case the shared client at the app root would consume the tokens).
- The Supabase coordinates are literals in `app/lib/supabaseConfig.ts` (production project `zbiujqxinvcxvuviuenx`). A preview cannot point at a test project without a code change.
- Previews created from the Claude branch carry no patched code today (patches are stored as files), so a test deployment needs a dedicated, reviewed test branch.
- The simulated browser tests prove page behaviour only. They do **not** prove: that Supabase sends the link we expect, that the link lands on the page with a fragment in the format we parse, that the link is consumed once, that an invalid/expired/replayed link is rejected by the real service, or that revoked refresh tokens stop working.

## Options (recommended first)
**Option A — separate Supabase TEST project (recommended).** A throwaway project with its own Auth settings, test users and a mailbox the team controls. No production data, no production Auth change. Needs: an authorised operator to create it (a free-tier project is the likely cost — confirm before creating; "no paid resources" applies), Auth → Confirm email ON, URL Configuration with the preview URL, min password length 8, the same "Reset password" template as production.
**Option B — production project with an allow-listed preview URL.** Rejected as default: it requires a production Auth change (adding a preview redirect), widens the allow-list to a non-production host, and uses production auth for tests. Only if MASTER explicitly approves, with the entry removed immediately afterwards.

## Smallest code change that makes a preview test possible (separate reviewed PR, not in R6)
1. `resolveResetRedirect(env)` (pure, unit-tested): returns the production constant unless **all** of these hold: the build is a Vercel *preview* (`NEXT_PUBLIC_VERCEL_ENV !== 'production'`), `NEXT_PUBLIC_RESET_REDIRECT_URL` is set, and it matches an exact allow-list pattern for this project's protected preview hosts (`^https://cliniverse-ai-u7gi-[a-z0-9-]+-cliniverse-ai\.vercel\.app/reset-password$`). Any mismatch falls back to the production constant, never to the page origin.
2. `supabaseConfig.ts` reads `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` **only** when the same preview condition holds; production builds ignore them (tests pin this, including a "production env + override present → override ignored" case).
3. Preview environment variables are set on the Vercel project for the *Preview* target only, pointing at the TEST project (the anon key is public; no secret is involved).
4. Deployment Protection (Vercel SSO) stays ON so only team members can open the preview.

## Procedure (when authorised)
1. Create the test branch from the reviewed lineage (baseline + R4 + R5 + R6 + the PR above). Push → Vercel builds a **preview** only. Record deployment id and SHA. Do not promote.
2. Operator prepares the TEST Supabase project (settings listed above) and two test users with team-owned mailboxes, `A` (to reset) and `B` (to stay signed in). No real people, no PHI.
3. On the preview: sign in as `B` in the app (a signed-in session exists in storage). In a separate browser profile, request a reset for `A`.
4. Check the email: the link host is the TEST project, `redirect_to` is the preview `/reset-password`. Open it **once** in the second browser profile.
5. Verify (record sanitised evidence, never paste tokens):
   - lands on `/reset-password`, address bar fragment removed, masked email = `A`; the page does not appear in history with a fragment;
   - Network panel: no recovery tokens in any request URL, no `Referer` carrying them;
   - set a new password; `A` can sign in with it and not with the old one;
   - **other sessions:** a second signed-in session of `A` cannot refresh after the reset; record how long an already-issued access token keeps working (expected: until expiry) — this calibrates the page wording;
   - account `B` signed in at step 3 is unaffected and its stored session is unchanged;
   - **replay:** open the same email link a second time → Supabase rejects it (record the exact error hash). Then open the *post-click* URL if it can be reconstructed from a test log → document that a valid session fragment still works until expiry (this is the "consumed link vs valid session" distinction);
   - **expired:** wait for the link lifetime (or shorten it in the TEST project only) → expired state shown;
   - **scanner behaviour:** open the link with a link-preview style GET (curl without JS) and confirm the link is consumed → document the user-facing consequence;
   - enumeration: request a reset for an unknown address → identical message and timing class;
   - rate limit: repeated requests → "wait a minute" message, no stack of emails.
6. **Service worker on the preview:** repeat the cache checks from `scripts/verify-service-worker-browser.cjs` against the preview, including an upgrade from a browser that previously visited production.
7. Teardown: delete the test users/project, remove preview env vars, delete the test branch/deployment, remove any allow-list entry, record the outcome in Issue #36.

## Evidence package expected back
Preview deployment id + SHA; screenshots with tokens masked; the email header host/redirect (tokens redacted); results table for each bullet above; teardown confirmation. Work 1 reviews before any production deployment is considered.

## Explicit non-goals
No production deployment, no production Auth/redirect/template change, no use of real user accounts, no deletion of real data, no iOS build.
