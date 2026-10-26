# Account deletion — retention policy: active questions (for legal/privacy review)

**Status: not approved; not legal advice.** No deletion has been run; no production database, Edge Function or Supabase setting was changed or exercised. Account-deletion behaviour stays HOLD until MASTER and legal decide.
**Controlling position:** Work 1's legally conditional minimum-retention proposal — delete account data; retain only the minimum transaction records, and only where a specific legal basis is identified. This file holds only verified facts and open questions. Earlier Claude proposals (de-identified ledger, hashing, a retention period, a new table, "[N] months" wording) are **ARCHIVED — WITHDRAWN — DO NOT PUBLISH**: `docs/archive/ARCHIVED_WITHDRAWN_deletion_retention_options_2026-10-26.md`.

## 1. Verified facts (read-only, MASTER, Issue #36)
`subscriptions.user_id → auth.users` ON DELETE CASCADE; `apple_subscription_events.subscription_id → subscriptions` ON DELETE CASCADE; `persist_verified_apple_subscription` exists; Edge Function `delete-account` ACTIVE v1. **Consequence:** deleting the auth user erases that user's subscription row and stored Apple event rows. Not verified: what else `delete-account` removes, backups/log retention, and what happens to Apple original-transaction ownership after deletion (see P1 in `APPLE_PACKAGE_RC1_1.1.md` §5).

## 2. Open questions for legal
1. Is there a specific legal basis requiring any transaction record to be kept after deletion? If so, which minimum fields, and for how long (period to be set by legal, not assumed here)?
2. How is the user told, accurately, what remains (without calling it anonymous)?
3. **Decided (Work 1, adopted by MASTER):** account deletion must remain available and must not be blocked because an Apple subscription is active. The deletion flow must tell the user that deleting the account does **not** cancel Apple subscription billing and direct them to manage or cancel it in their Apple subscription settings. Open for legal only: the exact wording of that notice.
4. Deletion completion time and treatment of backups and logs.
5. Jurisdiction-specific rights handling (GDPR / UK GDPR / PDPL etc.) and Apple's own record keeping.
