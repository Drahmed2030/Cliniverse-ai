# RLS + Auth Compatibility Gate v1

## Purpose
Validate that the real Supabase-authenticated release flow can operate under the proposed user-data RLS hardening before any production migration is applied.

## Verified alignment

### Profiles
The integration branch derives profile ownership from `supabase.auth.getUser()` and uses the authenticated user id for read, insert and update. This matches the proposed policies:
- SELECT where `auth.uid() = id`
- INSERT with `auth.uid() = id`
- UPDATE where/check `auth.uid() = id`

Expected compatibility: **PASS by contract**.

### Subscriptions / entitlements
The release integration reads entitlement for the authenticated user only. The proposed policy allows authenticated users to SELECT only rows where `auth.uid() = user_id`.

Subscription creation remains service-controlled. Client-side PRO activation is not part of the release integration and must remain blocked.

Expected compatibility: **PASS by contract for reads; server-side creation still requires runtime verification**.

### Case completions and MCQ answers
The proposed policies require inserted `user_id` to equal `auth.uid()` and allow each user to read only their own rows.

Legacy helper functions still accept a caller-supplied `userId`. RLS will reject a mismatched id, but the application contract should still be tightened later so UI callers cannot provide an arbitrary user id.

Expected compatibility: **RLS-protected but application helper refactor recommended before release candidate**.

## Remaining runtime validation before production migration
1. Sign in with a real Supabase user in preview.
2. Confirm first-login profile bootstrap inserts exactly one own-row profile.
3. Confirm subsequent session restore reads the same profile without duplicate insertion.
4. Confirm profile edit updates only the authenticated user's row.
5. Confirm entitlement read returns only the authenticated user's subscription.
6. Confirm subscription insertion is rejected from the anonymous/authenticated client and succeeds only through the approved service-controlled path.
7. Confirm mismatched `user_id` case/MCQ writes are rejected by RLS.
8. Confirm valid own-row case/MCQ writes succeed.

## Rollback
`supabase/migrations/001_user_data_rls_hardening.rollback.sql` restores the known pre-hardening policy state for emergency rollback only. It is intentionally less secure and must not be treated as an acceptable long-term posture.

## Production decision
**HOLD** until the runtime checks above pass against the real Supabase project and the migration window is explicitly approved.
