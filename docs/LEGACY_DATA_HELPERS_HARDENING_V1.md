# Legacy Data Helpers Hardening v1

## Objective
Reduce caller-controlled identity in application data helpers before RLS production enforcement.

## Decisions

1. New release code must use authenticated-user-scoped helpers.
2. `app/lib/progress.ts` derives `user_id` from the active Supabase Auth user for case completions and MCQ answers.
3. Legacy `saveCaseCompletion(userId, ...)` and `saveMcqAnswer(userId, ...)` remain temporarily for compatibility only and must not be used by new release surfaces.
4. Client-side `activatePro(...)` is now fail-closed and cannot grant paid access.
5. Paid entitlement must be created by a verified server/payment path and read via `app/lib/entitlements.ts`.
6. Legacy XP/profile helpers that accept `userId` require a usage-by-usage migration before release candidate; RLS remains the database enforcement layer during that transition.

## Why this is staged
Removing every legacy export immediately could break large parts of the existing feature inventory. The safer sequence is:

- add authenticated replacements;
- route release surfaces to replacements;
- verify usage and build;
- then remove or restrict legacy exports in focused changes.

## Release gate
Before production RLS apply or App Store release candidate:

- release surfaces must not call client-side PRO activation;
- release progress writes must derive user identity internally;
- mismatched user-id writes must fail under RLS;
- subscription creation must be server/service-role controlled;
- remaining legacy caller-supplied identity helpers must be inventoried and either migrated, gated, or proven non-release.
