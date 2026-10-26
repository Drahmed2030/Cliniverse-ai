# App Store metadata / screenshot mismatch register — RC1 (read-only inventory; row 8–9 updated per MASTER decision: manual screenshots preferred)

Candidate `9bf17282630cb525916cb412601478574aa5419c` (tree `14888df202bb3bda6e2988452a52bd67cc1926d0`). **Nothing below was modified.** Source of the "current" text is `docs/APPLE_RC1_REVIEWER_PACKAGE.md` (repo copy); the live App Store Connect contents are UNVERIFIED and must be compared by Work 1.

| # | Item | Repo text says | RC1 reality | Fix type / authorization |
|---|---|---|---|---|
| 1 | Navigation names in review notes/description | Home / Care / Intelligence / Atlas | Today / Learn / Progress / Explore / Me | ASC text + docs |
| 2 | Account creation | "intentionally disabled" | Sign-up (email confirmation), password recovery, deletion exist | ASC review notes + docs |
| 3 | Reviewer account note | reviewer pre-confirmed, build-57 notes | must be re-checked on clean device; replace build-57 notes | ASC (Work 1) |
| 4 | Description draft tour | QAPAS / Intelligence / Atlas | Not shipped as named; ECG practice held; Echo one study | ASC text |
| 5 | Feature matrix | none current | Ward 1 free + PRO; Code Lab 2 free lessons/track; Echo 1 study; ECG being prepared | ASC text |
| 6 | IAP display name | "CLiniverse PRO Monthly" | should read "Cliniverse PRO Monthly" | ASC IAP record |
| 7 | IAP attached to version / review screenshot | unchecked | needed | ASC (Work 1) |
| 8 | Screenshot sequence | 12 shots incl. `04-intelligence`, `05-atlas`, Hassan Al-Amri case | tab "Intelligence" does not exist; **plan: manual captures from the future signed IPA**; no ECG | manual (after build GO) |
| 9 | `native/screenshot/CliniverseScreenshotTests.swift` + `tests/ios-screenshot-evidence-contract.test.mjs` | pin stale names; step 04 would fail | — | native/test change — unresolved engineering dependency, separate authorization only if the workflow is needed |
| 10 | Privacy answers | unchecked vs `native/privacy/PrivacyInfo.xcprivacy` | must match collection (email, purchase, usage) and deletion/retention text | ASC (Work 1) + legal |
| 11 | Support / Privacy / Terms URLs, support mailbox | unchecked HTTP 200 / mailbox | — | operator |
| 12 | Age rating, export compliance, category | unchecked | — | ASC (Work 1) |
| 13 | Baseline doc `CLINIVERSE_PLATFORM_STATE_V1_2.md:32` | "ECG … ACTIVE in production" | held | docs on baseline lineage; not part of RC source |
Metadata fields without ECG claims (subtitle, promo text, keywords): consistent with RC1.
