# P0 Security Integration v1

Status: INTEGRATED INTO RELEASE LANE / RUNTIME GATES REMAIN

## Why this exists
The active release integration branch was created from the UX/release lane and therefore inherited pre-hardening copies of security-sensitive files. A release integration must never reintroduce a P0 issue that was already isolated on a security branch.

## Propagated into `integration/auth-release-shell-v1`
- Removed the public Supabase diagnostics endpoint.
- Removed cron secrets from request query strings in `vercel.json`.
- Cron routes now fail closed when `CRON_SECRET` is missing.
- Cron routes require `Authorization: Bearer <CRON_SECRET>`.
- Cron failures no longer return raw exception strings.

## Runtime gates still required
1. Confirm `CRON_SECRET` exists in the authoritative Vercel project environment.
2. Confirm unauthenticated requests to both cron routes return HTTP 401.
3. Confirm authenticated Vercel cron requests succeed with the production authorization behavior.
4. Continue authorization review for healthcare-sensitive and high-cost API routes.

## Release rule
Build success is necessary but not sufficient. P0 security is considered production-ready only after the runtime gates above pass.

Production merge and PHI-capable operation remain HOLD until those checks are complete.
