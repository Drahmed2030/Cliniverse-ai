# RLS Runtime Validation v1

Status: PRE-APPLY / SECURITY GATE
Branch: `security/rls-user-data-isolation`

## Purpose
Define the exact runtime evidence required before and immediately after applying the prepared RLS/RPC hardening migrations to production.

A migration is not considered successful because SQL executes without error. It is successful only if the intended user-isolation behavior is observed through authenticated client paths and the rollback remains available.

## Migration package under test
1. `001_user_data_rls_hardening.sql`
2. `002_entitlement_rpc_hardening.sql`
3. `003_release_surface_rls_completion.sql`

Associated rollback files must remain available before the production window begins.

## Preconditions before production apply
- Latest integration release contracts PASS.
- Latest authoritative Vercel preview PASS.
- Real email/password sign-in works with an approved test account.
- Magic-link sign-in is confirmed sign-in-only and does not create unknown accounts.
- Profile bootstrap implementation derives id from Supabase Auth.
- No PHI/patient-identifiable data is used during testing.
- No payment activation or client-side entitlement grant is enabled.
- A controlled maintenance/migration window is explicitly approved.

## Test identities
Use two non-clinical test users only:
- User A
- User B

Never use patient data, production clinical records, passwords in screenshots, or copied tokens in issue comments.

## Positive runtime tests
### Profile
- User A signs in successfully.
- User A can read own profile.
- User A can update only approved editable profile fields.
- Session termination/relaunch restores User A session and reuses the same profile row.
- First-login bootstrap does not create duplicate rows.

### Progress
- User A can insert an own-row case completion.
- User A can read own case completions.
- User A can insert an own-row MCQ answer.
- User A can read own MCQ answers.
- If legacy `user_progress` is exercised, User A can read/insert/update only own rows.

### Content
- Authenticated User A can read `cases` content.
- Client write attempts to `cases` remain blocked.

### Entitlement
- User A can read only User A subscription rows.
- Approved service-controlled subscription insertion remains possible when tested by the server path.

## Negative runtime tests — release-critical
These must PASS before RC1.

### Cross-user isolation
- User A cannot SELECT User B profile.
- User A cannot UPDATE User B profile.
- User A cannot SELECT User B subscription.
- User A cannot INSERT case completion with `user_id = User B`.
- User A cannot SELECT User B case completions.
- User A cannot INSERT MCQ answer with `user_id = User B`.
- User A cannot SELECT User B MCQ answers.
- User A cannot read/update User B `user_progress` rows if that table is exposed to the release client.

### Entitlement authority
- anon cannot insert subscription rows.
- authenticated client cannot insert subscription rows.
- authenticated client cannot execute `public.is_user_pro(uuid)` after migration 002.
- client-side code cannot grant Pro by updating `profiles.is_pro` or `subscription_status`.

### Release-surface minimization
- anon cannot read `cases`.
- client cannot read `leaderboard` in RC1.
- client cannot write `leaderboard` in RC1.

## Post-apply catalog checks
After migration, inspect PostgreSQL metadata and verify:
- RLS is enabled on `profiles`, `subscriptions`, `case_completions`, `mcq_answers`, `cases`, `user_progress`, `leaderboard`.
- permissive legacy profile policies (`Public read`, `Public insert`, `Public update`) are absent.
- subscription INSERT policy targets `service_role`, not `public`.
- own-row policies use `auth.uid()`.
- `leaderboard` has no client policy for RC1.
- `is_user_pro(uuid)` is not executable by PUBLIC/anon/authenticated.

## Rollback trigger
Rollback is considered only if the migration causes a release-critical regression that cannot be safely corrected within the approved window, such as:
- valid authenticated users cannot load the release shell because profile bootstrap is blocked;
- valid own-row profile updates fail consistently;
- valid own-row progress writes fail consistently;
- service-controlled entitlement creation is unexpectedly blocked and required for active users.

Security behavior that correctly blocks legacy permissive access is NOT a rollback trigger.

## Evidence record
For every test record:
- timestamp;
- environment;
- app/build commit SHA;
- test case id;
- PASS/FAIL;
- sanitized response/error;
- no credentials, tokens, PHI or patient-identifiable data.

## Promotion rule
`RLS RUNTIME GATE: PASS` only when all required positive and negative tests pass and catalog verification confirms the expected policies/grants.

Production apply remains HOLD until explicit migration approval is given.
