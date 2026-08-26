# Runtime Trust Gate v1

This gate must pass before `integration/auth-release-shell-v1` can be promoted to a release-candidate branch.

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
