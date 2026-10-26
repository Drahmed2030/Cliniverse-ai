# Build 69 — R6.3: worker identity captured, re-enumerated before use, unverifiable enumeration blocks (Issue #36) — for Work 1 review

**Apply order on a clean checkout of baseline `e4dab595d96c1d7e2583a28b15f2bb2497b4e65b`** (digests re-computed on the clean checkout):
1. R4 `80d3fdac…93f9` (approved) → 2. R5 `020c0918…d5fb` → 3. R6 `4f7dba1d…93ae` → 4. R6.1 `00a37464…e11d` → 5. R6.2 `c83c3a7e8f73d124c0f67d49ecea50570bb7b6325e670b5edf666a568b4278f2` → 6. **R6.3 `docs/patches/build69-r6-3-worker-identity.patch` — SHA-256 `6aa429dc0483da030ab3979df65a137d7549e8d640cfbcdeb8114399937ec5d6`** (incremental, 4 files, +291 −57).
**Status:** DRAFT, not merged, not deployed. No production deployment, iOS build, Supabase configuration, Apple submission or paid resource. **BUILD / APPLE / RELEASE = HOLD.** R4's `authSessionController.ts`, `authMutationCoordinator.ts`, `emailVerification.ts`, `AuthGate.tsx` are byte-identical (diff checked). No change to `sw.js`, `register-sw.js`, the page component, copy, the cache-cleanup logic or the cancellation rules.

## Changed files (R6.3 only)
`app/lib/staleWorkerGuard.ts`, `app/lib/recoveryRun.ts`, `tests/stale-worker-guard.test.mjs`, `scripts/verify-service-worker-browser.cjs`.

## The confirmed defect (reproduced first)
R6.2 kept the *registration objects* and compared `registration.active` of the same objects before and after the probe. But `registration.active` is a live property — in a browser the same registration object starts pointing at a different worker when one activates — so both sides of the comparison read the same current value and the comparison was trivially equal. Result: an in-place change (no `controllerchange` needed) produced `clean`, and `stillCurrent()` stayed `true`. Likewise "registrations cannot be listed" was read as "no workers".
**Reproduction before the fix** (two tests written against the R6.2 code, both FAILED there): (1) `registration.active` swapped in place to an old worker while the probe is pending ⇒ R6.2 returned `clean`; (2) swapped in place after a clean result ⇒ R6.2's `stillCurrent()` stayed `true`. With the full R6.3 test file run against the R6.2 sources, 10 tests fail (those two plus the identity, enumeration, `confirm()` and integrated cases).

## The correction
1. **Immutable identity snapshot.** `enumerate()` records, at that instant, the actual active worker *object* of every registration (`{registration, worker}`) and the controller. Probing uses the recorded worker, never a later `registration.active` read. After the probes and the cache inspection the guard enumerates **again** and compares the recorded identities (multiset of workers + the controller; and, for a registration present in both, the worker recorded first must equal the one recorded second). Any difference, or a `controllerchange`, discards the evaluation (bounded retries, then `blocked`).
2. **Re-validation immediately before the session is used.**
   - `stillCurrent()` (synchronous): no controller change, same controller, and every captured registration still points at the captured worker (live property read, so an in-place change shows).
   - `confirm()` (new, asynchronous): enumerates the registrations again and requires every active worker (and the controller) to be one that was **probed as current** in the clean evaluation. A worker identity never probed ⇒ not confirmed.
   - `recoveryRun.start()` awaits `confirm()`, then checks `stillCurrent()` synchronously after that await, and only then reads the fragment / creates the recovery client. A failed confirmation triggers a full re-check (max 3), then `blocked`.
3. **Unverifiable enumeration fails closed.** `getRegistrations()` that throws, rejects, never settles (3 s timeout), returns something that is not an array, or returns an entry that is not a registration-like object ⇒ **`blocked`**, with no side effects, regardless of controller state (none / current / old). Failure on the *second* enumeration (the stability check) or on `confirm()` also blocks. A browser with no service-worker support at all (`navigator.serviceWorker` absent) is still clean — nothing can control the page.
4. **Cancellation preserved across the new awaits.** `isCancelled` is checked before/after every enumeration and `confirm()`; after cancel `confirm()` and `stillCurrent()` are false and `recoveryRun` returns before any token handling. Test: leaving the page while the confirmation enumeration is pending ⇒ nothing read, stripped, created, requested or shown. (Removing the `alive` check right after `confirm()` is not caught by a test because the later `alive` check before token use covers it; the redundancy is intentional.)

## Evidence
| Check | Result |
|---|---|
| `tests/stale-worker-guard.test.mjs` | 40/40 PASS (R6.2: 30). New: in-place swap during probe (repro), in-place swap after clean (repro), swap to another *current* worker is re-probed, enumeration failure matrix (5 modes × 3 controller states), failure on repeat, no-SW-support clean, `confirm()` true / unprobed identity / unavailable / cancelled, and four integrated guard+run scenarios |
| Mutation checks (each makes tests fail) | stability comparison always true (3), unverifiable read as empty (2), run skips `confirm()` (4), `stillCurrent()` ignores captured identities (1), `confirm()` accepts unprobed (1) |
| Negative control | the same test file against the R6.2 guard/run: 10 failures (listed above) |
| Full suite, clean checkout, baseline + R4 + R5 + R6 + R6.1 + R6.2 + R6.3 | **989 / 989** (2 runs). In the working tree 2 of 3 runs were 989/989; **1 run showed the known open `account-codelab` fixed-delay flake (988/989)** — unrelated to this patch, still OPEN |
| `npx tsc --noEmit` / `next build` (empty `.next`, dummy public Supabase env) | PASS / PASS |
| Chromium, genuinely controlling legacy worker + previous (R6.2) build as control — `scripts/verify-service-worker-browser.cjs` | **41/41**, four complete runs (one earlier run's summary line was lost by my output filter; the two re-runs were 41/41) |
| Chromium recovery + account isolation | 24/24, 2 runs |
New real-browser scenarios: **D8** registration enumeration that rejects / never settles / returns a non-list ⇒ blocked, "This page did not use your recovery session.", zero Supabase requests, no tokens in the address bar; **D8b** no worker installed but enumeration broken ⇒ blocked; **control D9:** the previous R6.2 build in the same situation reported clean and **used the recovery session** (`GET /auth/v1/user` issued). D1–D6 (first direct visit under an old worker, unremovable worker, failed cache deletion, update delivery) unchanged and passing.

## Limits (stated, not hidden)
- The in-place identity change is proven with fakes whose `registration.active` is mutated; the real-browser equivalent (an update activating mid-check) did not occur in my runs, as before. The enumeration failures are real-browser (patched `getRegistrations`).
- After the final synchronous confirmation there is no zero-length guarantee against a worker taking control before the first network call; it narrows the window to microtasks.
- Chromium only; Safari/WebKit/WKWebView semantics, real Supabase behaviour, the production-origin worker upgrade, Confirm email / SMTP / reviewer account, deletion-retention HOLD, Codemagic provenance, App Store/onboarding ECG wording, the Vercel production-branch setting and the `account-codelab` flake remain open or unverified.

## Work 1 review scope
`app/lib/staleWorkerGuard.ts` (enumerate / sameSnapshot / evaluate / stillCurrent / confirm), the `start()` loop in `app/lib/recoveryRun.ts`, the new tests and D8/D9 scenarios; confirm R4 files unchanged. Recommendation: READY FOR WORK 1 REVIEW (patch only). If a guarantee is judged unproven the answer is HOLD, not a rewrite.
