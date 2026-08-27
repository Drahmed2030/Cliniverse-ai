# Runtime Trust Gate v1

This gate must pass before `integration/auth-release-shell-v1` can be promoted to a release-candidate branch.

## Verified checkpoint — 2026-08-27

- PR #13 head `b0f71ea1099e8ab395151065be252ead5cfb2b70` passes Release Contracts and its four Vercel preview deployments are Ready.
- The protected preview visibly fails closed at the sign-in gate, keeps Apple/Google disabled, states that account creation is unavailable, and exposes working Terms, Privacy and Support pages.
- The native-configured production origin still resolves to main-branch commit `423b4501a8e219027dced45e88c6bdad59c1ad86`, not the RC integration head.
- That production origin returns 404 for `/terms` and `/support`, and still deploys `/api/debug-supabase`. The diagnostics route is removed from the integration branch but production promotion is not authorized by this checkpoint.
- Unauthenticated production calls to `/api/cron-pulse` and `/api/cron-nexus` return HTTP 401.
- Supabase reports three public tables with RLS disabled: `cases`, `user_progress` and `leaderboard`.
- Current production `profiles` policies permit public insert/read/update, and current grants give `anon` and `authenticated` broad table privileges.
- Current production `subscriptions` policy named `Service role can insert subscriptions` is actually assigned to `public` with an unconditional check. Combined with the current grants, it permits a client to insert a subscription row and violates the release entitlement authority.
- `case_completions` and `mcq_answers` have RLS enabled but no policies, so the auth-scoped progress helpers cannot currently persist data.
- Supabase migration history is empty. No production RLS mutation was made during this checkpoint.

## Prepared but not applied

- Forward migration: `supabase/migrations/20260827044500_apple_rc1_runtime_trust.sql`.
- Emergency rollback: `supabase/rollback/20260827044500_apple_rc1_safe_hold.sql`.
- Read-only post-apply assertions: `supabase/tests/20260827044500_apple_rc1_catalog_assertions.sql`.
- The rollback intentionally denies client data access rather than restoring insecure public policies.
- Production apply remains **HOLD** until explicit migration-window GO, backup/staging evidence and authenticated two-user runtime testing.

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
