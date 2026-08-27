# Runtime Trust Gate v1

This gate must pass before `integration/auth-release-shell-v1` can be promoted to a release-candidate branch.

## Pre-migration checkpoint — 2026-08-27

- The current PR #13 integration head passes Release Contracts and its four Vercel preview deployments are Ready.
- The protected preview visibly fails closed at the sign-in gate, keeps Apple/Google disabled, states that account creation is unavailable, and exposes working Terms, Privacy and Support pages.
- The native-configured production origin still resolves to main-branch commit `423b4501a8e219027dced45e88c6bdad59c1ad86`, not the RC integration head.
- That production origin returns 404 for `/terms` and `/support`, and still deploys `/api/debug-supabase`. The diagnostics route is removed from the integration branch but production promotion is not authorized by this checkpoint.
- Unauthenticated production calls to `/api/cron-pulse` and `/api/cron-nexus` return HTTP 401.
- Supabase reports three public tables with RLS disabled: `cases`, `user_progress` and `leaderboard`.
- Current production `profiles` policies permit public insert/read/update, and current grants give `anon` and `authenticated` broad table privileges.
- Current production `subscriptions` policy named `Service role can insert subscriptions` is actually assigned to `public` with an unconditional check. Combined with the current grants, it permits a client to insert a subscription row and violates the release entitlement authority.
- `case_completions` and `mcq_answers` have RLS enabled but no policies, so the auth-scoped progress helpers cannot currently persist data.
- Supabase branching registered the production schema baseline as migration `20260827071109_remote_schema`. No Apple RC1 RLS migration or production authority mutation had been made at this pre-migration checkpoint.
- The deferred knowledge-match API and legacy signup helper are now included in the fail-closed RC contract: client execution is revoked, and the HTTP route defaults to 503 unless separately enabled after AI consent/security review.
- A Next.js 16 `proxy.ts` release boundary returns 404 before deferred AI, storage, ingestion, mood, cache and legacy API handlers execute. Their source remains available for later validation, but they are not runtime Apple v1 surfaces.

## Production migration evidence — 2026-08-27

- Full executive authority was recorded as the migration-window GO after the isolated staging, rollback and recovery drills passed.
- The production preflight at 08:00 UTC found no other non-idle database session, eight profile rows, and zero subscription, progress or deferred-table rows in the migration scope.
- Forward migration `20260827080127_apple_rc1_runtime_trust` was applied through the Supabase migration mechanism and completed successfully.
- Read-only post-apply catalog assertions passed. A separate verification confirmed: anon profile read denied; authenticated own-profile table access retained; subscription insert denied; `is_pro` update denied; allowed name update retained; and legacy signup/entitlement RPC execution denied.
- Production Data API requests using the public publishable key returned HTTP 401 for anonymous reads of `profiles`, `subscriptions` and deferred `cases`, proving that the catalog boundary is also enforced through PostgREST.
- The eight production profile rows remained present and the zero-row subscription count was unchanged.
- The connector refused the transactional synthetic User A/User B test on production because it inserts temporary Auth rows and changes roles. That test was not bypassed or repeated; its identical SQL had already passed twice on the isolated branch, including after rollback recovery.
- Emergency rollback remains `supabase/rollback/20260827044500_apple_rc1_safe_hold.sql`. It intentionally denies all client data access rather than restoring insecure public policies.
- Production advisors now report only the expected no-policy informational notices for deny-closed/deferred tables, the deferred `vector` extension placement warning, and disabled Auth leaked-password protection.
- Production web promotion, valid-account runtime testing, leaked-password protection, and the native gate remain **HOLD**.

## Isolated staging evidence — 2026-08-27

- Supabase Pro branch `apple-rc1-runtime-trust-staging` (`xcpllnhtbcgyohuvotto`) was created at the confirmed rate of USD 0.01344/hour with no production data.
- The branch completed a `remote_schema` snapshot of the real production schema before the RC migration was applied.
- The final forward migration passed its internal assertions and the separate catalog assertions.
- Transactional User A/User B/anon/service-role tests passed for profile ownership, read-only subscription authority, progress ownership, deferred-table denial and legacy-RPC denial. Test identities and rows were rolled back.
- The emergency safe-hold rollback passed deny-all assertions, preserved trusted service-role authority, and the forward migration recovered successfully. Catalog and two-user tests then passed again.
- Supabase security advisors no longer report the exposed `SECURITY DEFINER` helper or mutable knowledge-match search path. The remaining warning-level item is the `vector` extension in `public`; no-policy informational notices correspond to deliberately deny-closed deferred tables. Moving the extension is a broader structural migration, not an Apple v1 client-authority path.
- No production migration has been applied by this staging checkpoint.
- After the production migration and read-only assertions passed, the disposable staging branch was deleted successfully. Its hourly charge is no longer running.

## Already passed
- Authoritative Vercel build on the current integration head.
- Release contract GitHub Actions workflow.
- Static release contracts for P0 cron/debug regressions, fail-closed client Pro activation, and closed guest access.

## Runtime checks still required

### Authentication
- Email/password sign-in succeeds against the real Supabase project.
- Invalid credentials fail closed without entering the release shell.
- Magic-link request succeeds and does not grant a session before callback completion.
- Existing session restores after reload/relaunch.
- Sign-out invalidates the app session and returns to the auth gate.
- Apple/Google OAuth remains unavailable unless provider configuration is explicitly verified.
- Enable and recheck Supabase Auth leaked-password protection; production currently reports this control as disabled.

### Profile ownership
- First authenticated login creates at most one profile row with `id = auth.uid()`.
- Repeated session restore does not create duplicate profile rows.
- Profile read returns only the authenticated user's profile.
- Profile edit updates only the authenticated user's row.
- A mismatched user id cannot be used by a release-surface helper.

### Entitlement / subscriptions
- Entitlement reads only the authenticated user's active subscription.
- Client-side Pro activation remains impossible.
- Direct client subscription insert is rejected once hardened RLS is applied.
- Approved server/service-role subscription creation is verified before production activation.
- Upgrade UI remains gated until the iOS IAP/web-checkout architecture is approved and entitlement synchronization is implemented.

### Progress data
- Own case completion insert/read succeeds.
- Own MCQ answer insert/read succeeds.
- Mismatched `user_id` writes are rejected by RLS.
- Release surfaces use auth-scoped helpers rather than caller-supplied identity.

### Cron / P0 security
- `CRON_SECRET` exists in the authoritative Vercel environment.
- Unauthenticated `/api/cron-pulse` and `/api/cron-nexus` return HTTP 401.
- Authorized cron invocation succeeds using the expected Bearer header.
- The removed Supabase diagnostics route returns 404 / is not deployed.
- Cron errors do not expose raw provider/database exception strings.

## Promotion rule
Do not create or promote `release/cliniverse-rc1` until the runtime checks above are evidenced as PASS, the RLS migration has a tested rollback path, and the native iOS clean-install gate is scheduled.

Build success is necessary but not sufficient for production, PHI use, or App Store resubmission.

Current checkpoint:

- BUILD: PASS
- RUNTIME: HOLD
- SECURITY: HOLD
- NATIVE: HOLD
- APPLE RC1: HOLD
