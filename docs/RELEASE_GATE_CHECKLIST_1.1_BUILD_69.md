# Release gate checklist — Cliniverse 1.1 / Build 69 (2026-10-26)

Source SHA: baseline `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b`; approved patch lineage R4→R6.3 (final digest `6aa429dc…d6`, Work 1 APPROVED patch-level). **Status of every gate: HOLD until its evidence is attached.** Nothing here authorizes a build, deployment, submission, Supabase change, or live deletion. Read-only checks only unless MASTER separately authorizes.
Suggested: Work 1 collects Supabase + Codemagic + Apple evidence in **one review** (sections A, B, E, G) and posts one table to Issue #36.

| # | Gate | What to check (read-only) | Pass criteria / evidence | Owner | State |
|---|---|---|---|---|---|
| A1 | Supabase Confirm email | Dashboard → Auth → Providers → Email: screenshot | "Confirm email" ON; unconfirmed user cannot obtain a session | Work 1 + dashboard operator | UNVERIFIED |
| A2 | SMTP / sender | Auth → SMTP settings; send a test to a mailbox the team owns | Custom SMTP or accepted default limits; email arrives, not spam, correct sender/branding | Operator | UNVERIFIED |
| A3 | Redirect allow-list | Auth → URL configuration | Site URL `https://www.cliniverseai.com`; allow-list contains `/reset-password` and the sign-up confirmation target; no wildcard to unrelated hosts | Work 1 | UNVERIFIED |
| A4 | Password policy | Auth → Policies | Min length ≥ 8 (matches client); leaked-password protection ON (reviewer package says enabled 2026-08-27 — re-confirm) | Work 1 | partly claimed |
| A5 | Recovery link semantics | Only on a TEST project or protected preview (plan: `PASSWORD_RECOVERY_PREVIEW_TEST_PLAN.md`) | Link opens `/reset-password`, fragment stripped, password updated, global sign-out, old session rejected. **Needs separate authorization** | Test team | UNVERIFIED |
| B1 | Codemagic provenance | Run page for "1.1 (69)" | Run commit == `e4dab595…` (or the approved release SHA); `CM_COMMIT` equals `/api/release-contract` commit; IPA build number 69 matches ASC | Work 1 | UNVERIFIED |
| B2 | New RC (only after build GO) | — | Not started; not authorized | MASTER | HOLD |
| C1 | Vercel Production Branch | Project settings → Git | Production Branch value recorded; auto-deploy-to-production behaviour known | Work 1 / MASTER | UNVERIFIED (project exists, preview protection seen) |
| C2 | Controlled release | `VERCEL_PRODUCTION_RELEASE_CONTROL.md` 10 steps | Exact SHA, review, authorization, rollback target `dpl_CJC9unCgx4Xd7FeHNZkU8wER14Ya` recorded | MASTER | procedure only |
| D1 | Safari / WKWebView | iOS Safari + TestFlight build | Sign-in, sign-out, recovery page, SW upgrade from the previous worker on the production origin; offline behaviour; no cached auth/API responses | Test team | UNVERIFIED (Chromium only so far) |
| E1 | StoreKit | Sandbox device | Product `com.cliniverse.ai.pro.monthly` loads, purchase, Restore Purchases, entitlement server-written; display name "Cliniverse PRO Monthly" | Work 1 / tester | UNVERIFIED |
| E2 | Product attached to version | ASC | Subscription attached to 1.1 submission; review screenshot present | Work 1 | UNVERIFIED |
| F1 | Reviewer access | Clean device, reviewer credentials | Login works without email step; sees Today/Learn/Progress/Explore/Me; PRO state as intended; credentials in the protected field only | Work 1 | provisioned (claimed 2026-08), clean-device test UNVERIFIED |
| G1 | Privacy labels | ASC App Privacy vs `native/privacy/PrivacyInfo.xcprivacy` and data flows | Answers match actual collection (email, purchase, usage); deletion described consistently | Work 1 | UNVERIFIED |
| G2 | Support / URLs | HTTP 200 on Support, Privacy, Terms; support mailbox receives a test | All 200; mailbox monitored | Operator | UNVERIFIED |
| G3 | ASC metadata & review notes | Compare with `RELEASE_COPY_AND_EVIDENCE_AUDIT_2026-10-26.md` §5 | No stale navigation/"sign-up disabled"/ECG claim; build-57 notes replaced | Work 1 | stale |
| G4 | Screenshots | Re-derive from five tabs; no ECG | Final set matches shipped UI (current native contract is stale — separate authorization) | Work 1 | stale |
| H1 | Deletion retention | `ACCOUNT_DELETION_RETENTION_POLICY_DRAFT.md` | Legal/privacy decision recorded; privacy text matches; **no live deletion test before decision** | MASTER + legal | HOLD |
| H2 | Onboarding copy | Audit §4 | Copy-only fix authorized, applied, test updated | MASTER / Claude | proposed |
| I1 | TestFlight device QA | Packet gate 7 | Sign-up → confirm → login, logout/restore, StoreKit, recovery, deletion (after H1) | Tester | not started |
| J1 | Open test reliability | `account-codelab` 10 ms tick flake | Fix authorized or accepted as known | MASTER | OPEN |
| J2 | P1 entitlement ownership audit | separate track | Not a 1.1 patch; stays HOLD | MASTER | separate HOLD |

Read-only query suggestions for Work 1 (no writes): Auth settings screenshots (A1–A4); `select count(*) from auth.users where email_confirmed_at is null` is **not** to be run against production data without MASTER approval — prefer dashboard screenshots; Vercel `get_project` / `list_deployments` for C1/C2; Codemagic build page + artifact metadata for B1.
