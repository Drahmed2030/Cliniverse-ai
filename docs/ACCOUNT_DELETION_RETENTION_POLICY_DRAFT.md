# Account deletion — preliminary retention policy (DRAFT for legal/privacy review)

**Status: proposal, not legal advice, not approved.** No deletion has been run; no production database, Edge Function or Supabase setting was changed or exercised. Account-deletion behaviour stays HOLD (Issue #36 decision) until MASTER and legal decide.

## 1. Verified facts (read-only, MASTER, Issue #36)
`subscriptions.user_id → auth.users` ON DELETE CASCADE; `apple_subscription_events.subscription_id → subscriptions` ON DELETE CASCADE; `persist_verified_apple_subscription` exists; Edge Function `delete-account` ACTIVE v1. **Consequence:** deleting the auth user erases the subscription row and all stored Apple event rows for that user. Not verified: what else `delete-account` removes, backups/log retention, whether Apple original-transaction ownership (sticky) can be re-claimed by a new account after deletion.

## 2. Decisions needed
1. Is any purchase/transaction record kept after account deletion (tax, fraud, dispute, Apple reconciliation)?
2. If yes: which fields, for how long, and how de-identified?
3. Should deletion of an account with an **active** Apple subscription be blocked, warned, or allowed (Apple subscriptions continue until cancelled in Apple settings; deletion does not cancel them)?
4. How soon must deletion complete, and what happens to backups?

## 3. Options
| Option | Behaviour | Pros | Cons |
|---|---|---|---|
| A. Full erase (current cascade) | All user rows incl. purchase events removed | Simplest; strongest privacy | Loses reconciliation/fraud evidence; re-subscribing on a new account cannot be linked to the prior ownership; any tax-record duty must be met elsewhere (Apple/finance records) |
| B. De-identified ledger | Before delete, copy to a ledger table: Apple `original_transaction_id` (hashed or kept as legal basis permits), product id, period dates, environment, no user id/email; retain N months | Supports disputes, sticky-ownership checks, finance | Needs schema change, policy text, legal basis; hash of a stable id may still be personal data |
| C. Retain account tombstone | Keep `user_id` pseudonym + subscription row, drop profile/content | Easy reconciliation | Weakest privacy position; likely conflicts with user expectation of deletion |

**Recommendation (for legal to confirm): Option B**, retention period chosen by legal (commonly the applicable tax/dispute limitation period), with an explicit privacy-policy sentence and a pre-delete warning when a subscription is active ("Deleting your account does not cancel your subscription; cancel it in Apple Settings").

## 4. Required if B is chosen (future, separate authorization)
Migration adding the ledger table with the four-policy RLS pattern from `CLAUDE.md`; changing the cascade path or adding a pre-delete function; `delete-account` update; tests against a TEST project; privacy policy, App Privacy answers and App Review notes aligned; no test deletion on production accounts.

## 5. Draft user-facing wording (for legal edit)
"When you delete your account we permanently remove your profile, progress and sign-in. We keep a limited, de-identified record of your Apple subscription transaction (product, dates, transaction reference) for [N] months for payment reconciliation and legal obligations. Deleting your account does not cancel an active subscription — manage it in your Apple ID settings."

## 6. Not covered
Backups, log retention, analytics, third-party AI providers (disabled in this release), jurisdiction-specific rights handling (GDPR/UK GDPR/PDPL etc.), Apple's own record keeping.
