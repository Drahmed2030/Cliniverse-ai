# RC1 operational release checklist (concise)

Approved source: commit `9bf17282630cb525916cb412601478574aa5419c`, tree `14888df202bb3bda6e2988452a52bd67cc1926d0` (Work 1: SOURCE APPROVED). **Build / Apple / Release = HOLD.** Detail per row: `RELEASE_GATE_CHECKLIST_1.1_BUILD_69.md`. Order matters.

1. **Vercel** — record Production Branch and promotion/rollback controls (UNVERIFIED); Preview READY is not a deploy authorization. Owner Work 1.
2. **Isolated TEST Supabase project** — build a protected preview against it (never defaulting to production); plan `PASSWORD_RECOVERY_PREVIEW_TEST_PLAN.md`. Needs MASTER authorization.
3. **Auth on TEST** — Confirm Email ON, Anonymous OFF, Site URL/allow-list incl. `/reset-password`, SMTP choice (Resend first, Brevo alternative; sender domain, volume, SPF/DKIM). Tests: sign-up email, confirm, login/logout, recovery link, global sign-out, Safari/WKWebView, service-worker upgrade on same origin.
4. **Apple/Google provider callbacks** — verify independently.
5. **Deletion retention** — legal decision on `ACCOUNT_DELETION_RETENTION_POLICY_DRAFT.md`; no live deletion before.
6. **Apple gates** — reviewer clean-device test, StoreKit sandbox purchase/restore, IAP name/attachment, privacy labels, support URLs, refreshed metadata/screenshots (register: `APPSTORE_METADATA_MISMATCH_REGISTER_RC1.md`).
7. **Production web release** — only after 2–6 evidence: MASTER-authorized promotion of the exact SHA, rollback plan agreed (baseline rollback re-opens fixed security issues; prefer forward fix).
8. **Build decision** — separate MASTER GO; Codemagic `CM_COMMIT` == `/api/release-contract` commit; IPA ↔ SHA ↔ ASC "1.1 (69)" provenance; TestFlight device QA; then Apple submission decision.

Open items kept explicit: `account-codelab` intermittent failure **OPEN**; P1 subscription ownership/entitlement audit separate HOLD; no GitHub Actions run exists on the candidate.
