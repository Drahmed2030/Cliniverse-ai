# Cliniverse 1.1 — Coordinated Assessment: Release Gates (Issue #36) and Free Core + PRO Advanced (Issue #37)

**Status:** ASSESSMENT ONLY. No code, patch, subscription, PR, build, deployment or Apple action was made or changed. R4 (`docs/patches/build69-r4-auth-queue-safety.patch`, SHA-256 `80d3fdac…93f9`, Work 1-approved) is untouched and is the security baseline.
**Source examined:** Build 69 baseline `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b` with R4 applied in a scratch checkout (read-only reading; HEAD of that checkout `d1d1733`).
**Evidence classes used:** `[SRC]` read directly in source · `[TEST]` asserted by an existing test · `[INFER]` inference from source · `[UNVERIFIED]` needs an operator, a live database, a device or Apple.

---

## 1. Executive summary — release blockers vs future monetization

| # | Item | Class | Owner | Smallest next action |
|---|---|---|---|---|
| R1 | Supabase **Confirm email = ON**, providers, reviewer pre-confirmed, password minimum length, SMTP | Release blocker `[UNVERIFIED]` | Work 1 / operator | Record sanitized evidence of the Auth settings (§3.4) |
| R2 | **Password recovery** missing for self-service email/password accounts | Release blocker (decision already made) | Claude (future PR) | Approve the small PR in §3 |
| R3 | **Account deletion**: completeness and `subscriptions` FK behaviour unknown; privacy-policy text does not describe in-app deletion/retention | Release blocker `[UNVERIFIED]` | Work 1 + MASTER (policy) | Run the read-only catalog checks in §4.4, decide retention |
| R4 | **Paywall/Learn copy accuracy:** ECG is *held* for learners in this source (§2.2) yet R4 copy says ECG is "included free" | Release blocker for *honest copy* (copy-only) | MASTER decision, Claude (copy PR) | Approve the copy-only correction in §7.1 |
| R5 | **Release identity:** the iOS shell loads the live website; web deploys change the shipped app (§2.1) | Process gate | Work 1 / MASTER | Decide deploy discipline before any web deploy |
| R6 | Apple subscription migration v2 is marked "PRODUCTION HOLD — commit only"; applied status unknown | Release blocker `[UNVERIFIED]` | Work 1 | Check `persist_verified_apple_subscription` exists in prod (§6.1) |
| R7 | Codemagic SHA→IPA→ASC identity, TestFlight device QA, StoreKit sandbox purchase/restore | Release gates (existing) | Work 1 / MASTER | unchanged |
| M1 | Free Core + PRO Advanced matrix, server-authoritative entitlement, new advanced content | **Future monetization**, not a 1.1 blocker | MASTER decision, then Claude | Phase plan in §6 |
| M2 | NeuraOps Design Foundation | Future, separate project | — | not started here |

**Bottom line:** 1.1 can be stabilised without any entitlement change. What 1.1 does need is (a) the five gates above, and (b) a *copy-only* correction so no screen promises something the app does not deliver. The PRO Advanced model is buildable, but **two honest constraints** shape it: most "premium" content is static data bundled in the client (it cannot be protected by a server check until it is moved), and the ECG/Echo learner experiences are currently one held case and one video — there is no "advanced ECG/Echo" content to sell yet.

---

## 2. Cross-cutting findings (new in this assessment)

### 2.1 The native app loads the production website `[SRC]`
`capacitor.config.json` sets `server.url = https://www.cliniverseai.com`; `webDir` is `public` (only `native-offline.html`). `codemagic.yaml` runs `verify-native-release-origin.mjs` against `https://www.cliniverseai.com/api/release-contract` and an `EXPECTED_COMMIT` before building. Consequences:
- Whatever Vercel serves **is** the app. A web deployment changes behaviour for already-installed Build 69 users and for App Review, with no new IPA. Conversely, an IPA does not pin web code.
- "R4 is not in any IPA" is true but incomplete: R4 reaches users when the website is deployed from the R4 lineage, subject to the release-contract commit check.
- The same applies to the password-recovery page and any paywall change. Recommendation: treat **production web deploys as release events** (same approval path as an IPA) and keep the release-contract commit pin authoritative.

### 2.2 ECG is *held* for learners in the current source `[SRC][TEST]`
`app/learn/ecg/page.tsx` renders `evaluateEcgLearnerAvailability()`. Because `ECG_LEARNER_ARTIFACT_SOURCE = null` and the display route is not covered by device evidence, the state is `held`; `tests/ecg-learner-workspace.test.mjs` asserts `decision.learnerReady === false`. The learner sees "This tracing isn't shown yet", and answering is not possible. The legacy 8-image ECG challenge exists but is deliberately not linked.
- So **ECG cannot be offered as Free Core or PRO today** — it is not functioning for anyone.
- R4's paywall line "Included free: ECG, Echo, …" and the Learn track copy ("Read the tracing, commit an interpretation…") over-promise for ECG. This is a copy defect I introduced in R3/R4 by reading "no entitlement gate" as "available". Corrected wording in §7.1.

### 2.3 PRO gates are client-only, and most premium content ships in the client `[SRC]`
| Gate | Where | Server-side? |
|---|---|---|
| Ward cases 2–7 | `WardHome`: `isPro \|\| patient.id === 'w1'`; data `app/lib/ward/wardData.ts` (bundled) | No — all 7 cases are in the JS bundle |
| Code Lab lessons | `CodeLabHub.canAccess` (order ≤ 2 free); data `app/lib/codelab/{bls,acls}Lessons.ts` (bundled) | No |
| Ward evidence panel | `RelatedEvidencePanel` `if (isPro)`; calls `/api/ward/case-evidence` | **Endpoint is unauthenticated** (fixed 6-term PubMed map; low sensitivity, but the "PRO" gate is purely cosmetic) |
| Cardiology Operations, Nexus | `ward/index.tsx` `premium:true` + paywall | No; privacy page says their records are local-device only |
So with today's architecture a server entitlement check **cannot** protect bundled content; it can only protect (a) server-delivered content, (b) server writes/results, (c) paid API calls. This drives the design in §6.

### 2.4 Entitlement authority is already server-written `[SRC]`
`/api/subscriptions/apple/verify` authenticates the bearer token, verifies the Apple transaction, and persists through `persist_verified_apple_subscription` (service-role only; ownership of an original transaction is sticky; replay-safe; out-of-order events kept as `stale_ignored`). Clients can only `select` limited columns of their own `subscriptions` row. Gaps: **no App Store Server Notifications endpoint** (refund/revoke/expiry arrive only when the client re-verifies; expiry is enforced by a time check on read); the verify route accepts `yearly` though only `monthly` is Apple-approved; the migration is flagged PRODUCTION HOLD (applied status `[UNVERIFIED]`).

### 2.5 Other facts that affect the release
- Arabic paywall copy exists but `PaywallScreen` never passes `locale`, so **Arabic is not shown in the release** `[SRC]`. Issue #37 asks for Arabic only if used → English only for now.
- Server-side password minimum is not set by the app; the 8-character rule is client-side only `[INFER: Supabase default minimum is 6]`. Calling the Auth API directly bypasses it.
- Confirm-email ON makes every sign-up send mail; the default Supabase mail service is heavily rate-limited, so production needs custom SMTP `[UNVERIFIED]`.
- The privacy page describes subscriptions and says deletion is by contacting support; it does not describe the new in-app deletion or what is retained `[SRC]`.

---

## 3. Track A1 — Smallest secure password recovery (design only)

### 3.1 Current state `[SRC]`
No `resetPasswordForEmail`, no `PASSWORD_RECOVERY` handling, no reset page, no auth callback route, no Universal Links/associated domains. The shared Supabase client (`app/supabase.ts`) uses defaults: `detectSessionInUrl` on, implicit flow. `proxy.ts` only touches `/api/*`.

### 3.2 Proposed flow (no deep-linking required)
1. **Request.** In `AuthScreen` sign-in mode add "Forgot password?" → email field → `requestPasswordReset(email)` in `identity.ts` → `supabase.auth.resetPasswordForEmail(email, { redirectTo: RESET_URL })`. Always show the same neutral message ("If an account exists, we've sent a link") — no account enumeration. `RESET_URL` is a **constant** (`https://www.cliniverseai.com/reset-password`), never `window.location.origin`.
2. **Link opens in the system browser** (mail apps do), on a standalone page `app/reset-password/` outside `ReleaseApp`/`AuthGate`. The user sets the password in Safari and is told to return to the app and sign in. Works without Universal Links and without touching the app's WebView session.
3. **Isolation (account-switch protection).** The page must **not** import `app/supabase.ts` (its client would auto-consume the URL hash and replace any stored session). It builds its own client with `persistSession:false, autoRefreshToken:false, detectSessionInUrl:false`, reads `access_token`/`refresh_token`/`type=recovery` from the hash, immediately strips the hash (`history.replaceState`), calls `setSession` → `updateUser({ password })` → `signOut({ scope:'global' })` (ends every session of that account, including a stolen one). A source test pins "the reset page imports no shared client".
4. **One-time/expired links.** Hash `error=access_denied&error_code=otp_expired` (or no tokens) → "This link has expired or was already used" + request-again link. A recovery token is single-use in Supabase; a replay fails at `setSession`.
5. **Password rules:** ≥ 8, confirm field; success is shown only after `updateUser` returns no error. Errors never echo tokens.
6. **Headers:** `/reset-password` served with `Referrer-Policy: no-referrer` and `Cache-Control: no-store` (`next.config.js` `headers()`).
7. **Controller interaction:** none needed, because recovery uses an isolated client; if a `PASSWORD_RECOVERY` event ever reached the app client it is an ordinary session event and R4's generation/verification rules apply (a test will pin this).

### 3.3 Smallest future PR (≈ 7 files)
`app/lib/passwordRecovery.ts` (pure logic: parse hash, validate, run flow with an injected client) · `app/reset-password/page.tsx` + `ResetPasswordForm.tsx` · `app/lib/identity.ts` (`requestPasswordReset`, routed through the same mutation guard test as other auth calls or explicitly allow-listed because it does not change a session) · `app/components/AuthScreen.tsx` (+ link, EN strings; AR strings kept for parity) · `next.config.js` (headers) · tests.
Tests (behavioral, real source + fake client): valid hash → exact call order and hash stripped; expired/invalid/missing hash; mismatch/short password; `setSession` or `updateUser` error → no success message; global sign-out after success; no shared-client import; `RESET_URL` constant equals the approved URL; request message identical for existing/unknown email; session of another user in storage is untouched.
Because of §2.1 this ships by **web deploy**, so it needs the same approval as an IPA.

### 3.4 Operator-only steps (not code) `[UNVERIFIED]`
Supabase Auth → URL configuration: Site URL and **redirect allow-list = exactly the reset URL** (+ the sign-up redirect origin); email template for "Reset password" uses `{{ .ConfirmationURL }}`; **Confirm email ON**; password minimum length 8 (server side); custom SMTP; rate limits; reviewer account pre-confirmed.

---

## 4. Track A2 — Account deletion inventory (no live deletion performed)

### 4.1 What happens today `[SRC]`
Client: `DeleteAccountAction` (type DELETE) → `deleteCurrentAccount()` → Edge Function `delete-account` (`supabase/functions/delete-account/index.ts`). The function validates the bearer token and `confirmation === "DELETE"`, then with the service role deletes rows in **10 tables** (`profiles`, `ecg_competency_attempts`, `exam_usage`, `case_completions`, `leaderboard`, `mcq_answers`, `user_activity`, `user_progress`, `feedback`, `app_errors`) sequentially, then `auth.admin.deleteUser`. Failures return 500 and stop; there is no transaction.

### 4.2 Dependent data map
| Data | Defined in repo | Removed by | Note |
|---|---|---|---|
| `profiles`, `case_completions`, `mcq_answers`, `user_progress`, `leaderboard`, `exam_usage`, `user_activity`, `feedback`, `app_errors` | RLS in migration (some); table DDL not in repo | explicit delete | existence/column names `[UNVERIFIED]` |
| `ecg_competency_attempts` | draft `ecg_account_atomic_v1.sql`: `user_id references auth.users(id)` **without cascade** | explicit delete (required, else `deleteUser` would fail) | OK as ordered |
| `echo_competency_events` | draft: `on delete cascade` | cascade on `deleteUser` | not in explicit list; relies on draft being applied |
| `ward_practice_checkpoints` (Handover saved practice) | `docs/sql/…v1.sql`: `on delete cascade` | cascade | not in explicit list |
| `subscriptions` | **DDL not in repo**; v2 migration only alters it | **not touched** | FK to `auth.users` and its `ON DELETE` rule **UNKNOWN** |
| `apple_subscription_events` | `subscription_id … on delete cascade`; `user_id uuid not null` (no FK) | cascades only if its `subscriptions` row is deleted | |
| Cardiology Ops / Nexus records | privacy page: local device storage | n/a | not account data |

### 4.3 Risk analysis (the `subscriptions` unknown is decisive)
- **If `subscriptions.user_id` is a plain FK (no cascade):** `auth.admin.deleteUser` fails for any user who ever subscribed ⇒ `account_delete_failed`; deletion is impossible for paying users (Apple 5.1.1(v) risk).
- **If it cascades:** deletion silently destroys purchase/audit evidence (`apple_subscription_events` cascades from it) and frees the sticky Apple original-transaction ownership, so the same Apple subscription could later be attached to another account.
- **If there is no FK:** orphan rows keep a personal identifier (`user_id`) after "deletion".
All three need an explicit retention decision. Other weaknesses: no atomicity (a mid-way failure leaves a partly deleted account that `ensureOwnProfile` would partly recreate), no audit record of deletion, no recent-re-authentication requirement, the deployed function version is `[UNVERIFIED]`, and the privacy/support pages do not describe in-app deletion or retention.

### 4.4 Read-only checks for Work 1 (catalog queries, no data read, no deletion)
`select conrelid::regclass, conname, confdeltype, pg_get_constraintdef(oid) from pg_constraint where contype='f' and confrelid='auth.users'::regclass;` — lists every FK to `auth.users` and its `ON DELETE` rule (`a` no action / `c` cascade / `n` set null).
`select table_name from information_schema.columns where table_schema='public' and column_name in ('user_id','owner_id') order by 1;` — every user-keyed table, to compare with the 10-table list.
Also: `\d public.subscriptions`, whether `persist_verified_apple_subscription` exists, and the deployed `delete-account` version/`verify_jwt`.

### 4.5 Proposed small future PR (after policy approval)
1. Policy (MASTER + legal): what purchase evidence is retained, for how long, and in what form (recommended: retain a **de-identified** ledger — hashed original-transaction id, product, dates, status — and delete the identified rows; disclose it in the privacy policy).
2. Edge Function: one transaction via a `security definer` RPC `delete_user_account(p_user)` that (a) writes the de-identified ledger row, (b) deletes user rows from a table list generated from the catalog check, (c) deletes `subscriptions`/events per policy, then calls `deleteUser`; idempotent and safe to retry; optional recent-sign-in check.
3. Tests with a fake admin client for ordering/partial-failure/retry; a DB test on a **non-production** project only.
4. UI/privacy text: describe retention and App Store subscription cancellation (the cancellation notice already exists).
No live deletion or test-account deletion is proposed until the policy and the §4.4 results exist.

---

## 5. Track B1 — Feature inventory from source contracts

Depth is measured from the data files (what a user can actually open), not from marketing text. `CF` = currently free (no gate found), `CP` = currently client-gated PRO.

| Feature | Source path | Current gate | Content depth `[SRC]` | Works for a learner today? | Proposed (matrix) |
|---|---|---|---|---|---|
| **Ward Simulation** | `components/ward/WardHome.tsx`, `lib/ward/wardData.ts` | **CP** cases 2–7; case 1 (`w1`) CF | 7 fictional cases, bundled | Yes | Free: case 1 + overview. PRO: remaining cases |
| Ward evidence panel | `RelatedEvidencePanel.tsx`, `api/ward/case-evidence` | **CP** (UI only; API open) | 6 fixed PubMed topics | Yes | PRO Advanced; API must then require entitlement |
| **Code Lab – BLS** | `lib/codelab/blsLessons.ts`, `CodeLabHub.tsx` | lessons 1–2 CF, 3–6 **CP** | 6 lessons | Yes | Free: 1–2; PRO: 3–6 |
| **Code Lab – ACLS** | `lib/codelab/aclsLessons.ts` | same rule | 6 lessons | Yes | Free: 1–2; PRO: 3–6 (4 free / 8 PRO overall) |
| **ECG** | `app/learn/ecg`, `lib/competency/ecgLearnerAvailability.ts` | none (CF) | **1** governed case; **learner display HELD** (no governed artifact, route not covered by evidence) | **No** — "tracing isn't shown yet" | NOT VERIFIED / not offerable until governance releases the artifact. Do not list as free or PRO |
| ECG legacy challenge | `app/labs/ecg-challenge`, `public/ecg-cases` (8 images) | none | 8 images, **unlinked** by design | Not reachable from shell | Out of scope (legacy) |
| **Echo** | `app/learn/echo`, `public/clinical-media/echo` | none (CF) | **1** licensed A4C cine + guided checks; page states no persistence/backend | Yes (single study) | Free Core (it *is* the introduction). "Advanced Echo" = does not exist |
| **Resuscitation hub** | `app/labs/resuscitation-hub`, `lib/resuscitation/scenarios` | none (CF) | 3 scenarios (VF/pVT, PEA/asystole, unstable bradycardia) + foundations/replay/progress | Yes | Candidate PRO Advanced *or* Free — product decision; currently free |
| **Pathway Replay** | `app/labs/pathway-replay` | none (CF) | one fictional pathway experience (count not enumerated) | Yes | NOT VERIFIED depth |
| **Clinical Reference** | `app/labs/clinical-reference`, `lib/clinicalReference/*` | none (CF) | calculators, drug identity/interaction/renal rules (static) | Yes | NOT VERIFIED depth; candidate PRO or Free |
| **Handover Practice** | `components/ward/WardHandoverSession.tsx`, `lib/ward/handover*` | none (CF; `premium:false`) | 1 scenario, 3 questions (post-PCI), checkpoints saved to account | Yes | Free Core |
| **Cardiology Operations** | `components/ward/cardiology` | **CP** (workspace `premium:true`) | not enumerated; records local-only | Yes | PRO Advanced (existing) |
| **Nexus Learning** | `components/nexus/NexusCardiovascularSlice` | **CP** | four-role huddle slice | Yes | PRO Advanced (existing) |
| Progress / saved records | `components/release/ProgressTrajectory.tsx` etc. | none | ECG/Echo/Ward projections | Yes | Free (do not gate saved progress) |
| Account, Me, deletion, appearance | `components/release/Me*` | none | — | Yes | Free |

Counts: Ward 7 (1 free / 6 PRO), Code Lab 12 lessons (4 free / 8 PRO), Echo 1 study, ECG 1 case (held), Handover 1 scenario, Resuscitation 3 scenarios.
`[UNVERIFIED]`: Pathway Replay and Clinical Reference content volume; Cardiology Operations module count; real-device behaviour of every row above; screenshots (not captured — no device/simulator in this environment).

---

## 6. Track B2 — Free Core + PRO Advanced proposal (post-1.1)

### 6.1 Honest product matrix (only what exists today)
- **FREE CORE:** Ward case 1; Code Lab lessons 1–2 of each track; Echo introductory study; Handover Practice; Resuscitation foundations/practice (decision); Clinical Reference (decision); saved progress; account features. ECG joins Free Core only after its governance hold is lifted.
- **PRO ADVANCED (today's real content):** Ward cases 2–7 and evidence panel; Code Lab lessons 3–6 of each track; Cardiology Operations; Nexus Learning.
- **PRO ADVANCED (aspirational — needs new content/engineering before any marketing):** advanced ECG/Echo cases, adaptive review. **Nothing in the current source can be sold as advanced ECG/Echo.**
- Open product decisions for MASTER: are Resuscitation, Pathway Replay and Clinical Reference Free or PRO? (They are free today; moving them to PRO is a loss of existing free access — Issue #37 says no surprise loss in 1.1.)

### 6.2 Server-authoritative entitlement design
Principle: **the server decides; the client only renders.** Layers, smallest first:
1. **Contract (exists):** `subscriptions` + `persist_verified_apple_subscription`. Add a stable SQL function `public.has_pro(uid)` (`security definer`, reads status/expiry/revoked) — single definition of "PRO".
2. **Read endpoint:** `GET /api/entitlement` (bearer → `getUser` → `has_pro`) returning `{tier, status, expiresAt, ttl}` for UI; the client keeps its current RLS read as a fallback only.
3. **Protect what can be protected:**
   a. *Server-delivered content* — move PRO Ward cases 2–7 and Code Lab lessons 3–6 out of the bundle into a table or route that checks `has_pro` (e.g. `pro_content` with RLS `using (has_pro(auth.uid()))`, or an API route). Until moved, a client check is UX only.
   b. *Server writes/results* — RLS `with check (has_pro(auth.uid()))` on attempt/result tables for PRO modules, so progress for PRO content cannot be created without entitlement.
   c. *Paid API calls* — require `has_pro` in `/api/ward/case-evidence` (and close the open endpoint).
4. **Lifecycle:** App Store Server Notifications V2 endpoint (refund, revoke, expire, grace, billing retry) feeding the same RPC; reject `yearly` until it is an approved SKU; sticky original-transaction ownership already prevents account hopping.
5. **Offline/grace:** cache the last signed entitlement response with a short TTL (e.g. 24–72 h) so a flight does not lock a paying user, and never grant PRO from the cache after the TTL.
6. **Reviewer access:** keep the server route (`/api/reviewer-feature-access`); reviewer gets PRO through the same `has_pro` path (a reviewer flag in the function, not a client switch), documented in App Review Notes.
7. **Rollout in shadow mode first:** log "would deny" decisions for a release before enforcing, so free-path regressions are found without harming users.

### 6.3 Threat model (summary for Work 1)
| Threat | Today | After design |
|---|---|---|
| Modified client unlocks PRO UI | trivial | UI unlocks, but content/writes denied server-side (for protected content) |
| Reading PRO data from the JS bundle | trivial (all 7 cases bundled) | only after content moves server-side |
| Replay/forged Apple receipt | mitigated (JWS verify, replay-safe RPC) | unchanged |
| Refund/revocation not reflected | only on next client verify | ASSN V2 closes it |
| Account hopping with one subscription | mitigated (sticky ownership) | unchanged |
| Offline abuse | n/a | bounded by cache TTL |
| Unverified-email accounts buying/using | verify route does not require confirmation | server check on confirmed email if policy requires |
| Open paid-resource APIs | `/api/ward/case-evidence` open | gated |

### 6.4 Phased plan (each phase independently reviewable; none authorised yet)
P0 inventory + decisions (this document) → P1 `has_pro` + `/api/entitlement` + shadow logging → P2 ASSN V2 endpoint → P3 move PRO content server-side + RLS write gates → P4 enforcement flip behind a flag, then new Paywall → P5 new advanced content (separate product work).

---

## 7. Honest copy

### 7.1 Needed in the next RC (copy-only, no access change)
- Paywall free line (EN): *"Included free: Echo, Resuscitation, Pathway Replay, Clinical Reference and Handover Practice, plus the first Ward case and the first two lessons of each Code Lab track. ECG practice is being prepared."* — remove ECG from "included free".
- PRO line for Code Lab: *"all BLS and ACLS lessons (the first two lessons of each track are free)"* (current wording "lessons 1–2" is ambiguous).
- Learn → ECG description: add a "coming soon"/held state or soften to what is shown ("One reviewed 12-lead recording and one approved question — opens when its evidence is complete"), consistent with the screen the learner actually sees.
- Arabic: leave unchanged (not displayed in the release).
Tests to add: a test that ties the free list to `ecgLearnerAvailability` (if ECG is held, it must not be listed as available).

### 7.2 For the future PRO release
Describe PRO as the deeper practice that exists (Ward cases 2–7, Code Lab 3–6, Cardiology Operations, Nexus). Do not mention advanced ECG/Echo, adaptive review or certificates until built and enforced. Keep price/period/auto-renew/Terms/Privacy/Restore on the sheet (present today `[SRC]`).

---

## 8. QA plan (independent gates)

| Gate | What | Who | Evidence |
|---|---|---|---|
| Source | focused behavioral tests per phase; full suite; tsc; local build | Claude | CI output |
| Server entitlement | with a PRO and a free test user: protected content/API returns 200/403 correctly; revoked/expired user denied; forged client flag ignored | Work 1 | request logs, sanitized |
| Real device (TestFlight) | free path complete without sign-in prompts for PRO; PRO purchase; restore on second device; subscription expiry/refund (sandbox); offline within TTL / after TTL; account switch; reviewer account | MASTER/tester | screenshots, notes |
| Password recovery | request → email → open link in Safari → set password → old sessions end → sign in; expired and reused link; unknown email message identical | Work 1/tester | notes |
| Deletion | on a non-production project only, after policy: delete free user, delete subscribed user, retry after forced failure | Work 1 | DB catalog before/after |
| Accessibility | VoiceOver on paywall, locked/free labels, reset page; Dynamic Type; contrast | tester | checklist |
| Copy accuracy | every sentence on Paywall/Learn mapped to a working, correctly gated feature (test + device) | Work 2/Work 1 | mapping table |

---

## 9. Apple / legal / privacy implications
- **3.1.2 / 3.1.1:** auto-renew terms, price, period and Terms/Privacy links must remain visible; restore purchases present. No claim of features that are held or non-existent (see §2.2). Removing previously free features after release is allowed but should be announced; Issue #37 already forbids doing it in 1.1.
- **5.1.1(v):** deletion must be complete and discoverable; retention of purchase records must be minimal, disclosed, and de-identified where possible. The subscription-cancellation notice already exists; the privacy policy needs the in-app deletion + retention text.
- **App Privacy labels:** `PrivacyInfo.xcprivacy` declares email, name, user id, purchase history, other diagnostic data; password recovery adds no new data type; entitlement logging must not add identifiers beyond those.
- **Medical-use wording:** keep "education, not diagnosis" language on any new PRO copy.
- **Remote web content (§2.1):** the reviewed app is the live site; post-approval web changes alter what Apple reviewed, so deploy discipline and App Review Notes matter.
- Reviewer access must keep working through whatever entitlement path ships.

---

## 10. Release split and recommendations

**1.1 stabilisation (no monetization change):** R1–R7 gates; copy-only correction §7.1; password-recovery PR; deletion policy + safety PR; web-deploy discipline. **No gate is added or removed** — the current open features stay open.
**Future PRO-gating release:** Phases P1–P5 above, after Work 1 reviews the entitlement contract and MASTER authorises each phase.

| Question (Issue #37 §5) | Recommendation |
|---|---|
| Overall | **PROPOSE SMALL DESIGN PR** for P1 only (entitlement contract + shadow mode), **KEEP EXISTING** access/pricing/SKU for 1.1 |
| Making Resuscitation/Pathway/Reference/ECG/Echo paid | **HOLD** until content is server-deliverable and product decision is made |
| ECG as a product feature | **HOLD** — governance hold on its only case |
| Release 1.1 with current R4 copy | **HOLD the copy** — correct §7.1 first |

## 11. Proposed small future PRs (not started)
A. Copy-only correction (§7.1) · B. Password recovery (§3.3) · C. Account-deletion safety + retention (§4.5, after policy) · D. Entitlement contract + shadow mode (§6.2 items 1–2, 7) · E. ASSN V2 endpoint · F. Move PRO content server-side.

## 12. Decisions needed from MASTER
1. Approve the copy-only correction (ECG not "free"; Code Lab wording).
2. Free vs PRO for Resuscitation, Pathway Replay, Clinical Reference, Handover (matrix §6.1).
3. Retention policy for purchase records on deletion.
4. Web-deploy discipline given the remote-origin shell.
5. Whether to start PR B (password recovery) now in parallel with Work 1's operator checks.

## 13. Not verified in this assessment
Supabase dashboard settings (Confirm email, providers, SMTP, redirect URLs, password length); production database schema and FK rules; whether migration v2 and the `delete-account` function are deployed; Codemagic/IPA identity; any device/simulator behaviour or screenshots; Apple App Review outcome; legal retention requirements; Pathway Replay/Clinical Reference/Cardiology Operations content volume.
