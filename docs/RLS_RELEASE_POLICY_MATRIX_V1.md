# RLS Release Policy Matrix v1

Status: **REVIEW READY / NOT APPLIED TO PRODUCTION**

## Verified production baseline
Read-only inspection confirmed:
- `profiles`: RLS ON, but legacy public read/insert/update policies remain permissive.
- `subscriptions`: RLS ON, but the insert policy is currently available to `public` with `WITH CHECK (true)` despite its service-role name.
- `case_completions`: RLS ON, no active client policy observed.
- `mcq_answers`: RLS ON, no active client policy observed.
- `cases`: RLS OFF.
- `user_progress`: RLS OFF.
- `leaderboard`: RLS OFF.

## Intended release policy
| Table | Release role | Authenticated user access | Server/service access | Decision |
| --- | --- | --- | --- | --- |
| profiles | account profile | own SELECT / INSERT / UPDATE only | yes | harden in migration 001 |
| subscriptions | entitlement authority | own SELECT only | write via service-controlled path | harden in migration 001 |
| case_completions | user progress | own SELECT / INSERT only | yes | harden in migration 001 |
| mcq_answers | user progress | own SELECT / INSERT only | yes | harden in migration 001 |
| cases | educational/reference content | SELECT only | yes | migration 003 |
| user_progress | legacy user progress | own SELECT / INSERT / UPDATE only | yes | migration 003 |
| leaderboard | non-essential social surface | no client access for RC1 | service only | RLS ON, no client policy in migration 003 |

## Why leaderboard is deny-by-default
The App Store release does not require a public leaderboard. Exposing usernames, rank or activity creates privacy and product-claim work with no release benefit. It remains gated until a data-minimization and consent model is explicitly approved.

## Negative runtime proofs required after controlled migration
1. User A cannot read or update User B profile.
2. User A cannot read User B subscription.
3. User A cannot insert a subscription from the public client.
4. User A cannot insert/read case completion for User B.
5. User A cannot insert/read MCQ answer for User B.
6. Authenticated users can read `cases`, but cannot insert/update/delete them from the client.
7. User A cannot read/update User B `user_progress`.
8. Client access to `leaderboard` is denied for RC1.
9. Existing signed-in profile bootstrap and progress flows still succeed for the owner.

## Promotion rule
No RC1 promotion until migrations 001–003 are reviewed as one change set, rollback files are present, runtime negative tests pass, and the production migration window receives explicit approval.
