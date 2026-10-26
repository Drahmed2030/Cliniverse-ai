# ARCHIVED — WITHDRAWN — DO NOT PUBLISH

Withdrawn by MASTER decision (after Work 1 review): these Claude proposals are kept for history only. They must **not** be used in the privacy policy, App Store Connect privacy answers, App Review notes, product copy or any implementation. Reasons: transaction identifiers and their hashes can remain personal data linkable to a person, so a "de-identified/anonymous" record cannot be promised; no retention period, ledger table or schema change is approved before legal review. The controlling position is Work 1's legally conditional minimum-retention proposal (delete account data; keep only minimum transaction records where a specific legal basis exists).

Withdrawn items: Option A/B/C table, the recommendation of Option B, the hashing idea, the migration/ledger requirements, and the user-facing wording containing "de-identified" and "[N] months".

---

## 3. Options
| Option | Behaviour | Pros | Cons |
|---|---|---|---|
| A. Full erase (current cascade) | All user rows incl. purchase events removed | Simplest; strongest privacy | Loses reconciliation/fraud evidence; re-subscribing on a new account cannot be linked to the prior ownership; any tax-record duty must be met elsewhere (Apple/finance records) |
| B. De-identified ledger | Before delete, copy to a ledger table: Apple `original_transaction_id` (hashed or kept as legal basis permits), product id, period dates, environment, no user id/email; retain N months | Supports disputes, sticky-ownership checks, finance | Needs schema change, policy text, legal basis; hash of a stable id may still be personal data |
| C. Retain account tombstone | Keep `user_id` pseudonym + subscription row, drop profile/content | Easy reconciliation | Weakest privacy position; likely conflicts with user expectation of deletion |

**[WITHDRAWN — see note at top] Former recommendation: Option B**, retention period chosen by legal (commonly the applicable tax/dispute limitation period), with an explicit privacy-policy sentence and a pre-delete warning when a subscription is active ("Deleting your account does not cancel your subscription; cancel it in Apple Settings").

## 4. Required if B is chosen (future, separate authorization)
Migration adding the ledger table with the four-policy RLS pattern from `CLAUDE.md`; changing the cascade path or adding a pre-delete function; `delete-account` update; tests against a TEST project; privacy policy, App Privacy answers and App Review notes aligned; no test deletion on production accounts.

## 5. Draft user-facing wording (for legal edit)
"When you delete your account we permanently remove your profile, progress and sign-in. We keep a limited, de-identified record of your Apple subscription transaction (product, dates, transaction reference) for [N] months for payment reconciliation and legal obligations. Deleting your account does not cancel an active subscription — manage it in your Apple ID settings."

