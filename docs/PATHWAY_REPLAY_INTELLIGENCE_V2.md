# Pathway Replay Intelligence v2

*Batch 7. Documents the actual implementation on `qa/case-batch20-cloud` (commit `b348d5ac6381a249d3fc0c2d85783bdf81c17bea`) as of this closeout — not a roadmap, not marketing copy. Every claim below is sourced from a specific committed file; re-verify against current `git log`/source before trusting an older copy of this doc.*

---

## 1. Objective

Upgrade the recovered Pathway Replay + Code Lab drill bridge (originally on the unmerged `ops/platform-governance-v1` branch, reconciled surgically rather than merged wholesale) into a governed `replay → drill → reassessment → closure` experience with an explicit, hash-chained event history, a tamper-evident receipt, a human-owned closure gate, and forward-looking (architecture-only) xAPI/credential boundaries. Remains educational, fictional/simulation-only, non-diagnostic, non-certifying, human-review-gated throughout.

---

## 2. State orchestration

`app/lib/cardiology/pathwaySession.ts` — a pure, deterministic reducer over four linear stages (`replay → drill → reassessment → closure`), not XState v5. Evaluated and not adopted: this machine has exactly four stages and three guards (evidence/gap context valid; a valid training receipt required; reassessment passed) — the existing hand-rolled reducer already gives deterministic, serializable state with zero network calls, matching this repo's established convention (`echoStudySessionController.ts`) and avoiding the "large workflow engine" this batch's own contract warns against.

---

## 3. Event stream

`app/lib/cardiology/pathwayEvent.ts`. Ten typed event types (`pathway.opened`, `evidence.reviewed`, `drill.started`, `drill.submitted`, `receipt.created`, `reassessment.started`, `reassessment.completed`, `closure.requested`, `review.pending`, `review.completed`), each carrying `schemaVersion`, `eventId`, `sessionId`, `eventType`, `occurredAt`, `stage`, `actorType`, `evidenceRefs`, `payload`, `previousEventHash`, `eventHash`. Every event is hash-chained to the one before it; `verifyPathwayEventChain` recomputes every hash and checks the `previousEventHash` linkage end to end, detecting both a tampered payload and a reordered/spliced history. `deriveStageFromEventHistory` derives the furthest stage reached purely from event history, used as a cross-check against the reducer's own tracked stage at the restore boundary. No patient identifiers or PHI may appear in a payload — `assertNoForbiddenIdentifiers` enforces this at construction time, not just by convention.

A real design bug was found and fixed during implementation: the closure-transition events were originally attached to `openPathwayStage(session, 'closure', ...)`, but `completePathwayReassessment` already sets `stage: 'closure'` directly — so that path could never fire in practice (`session.stage === stage` short-circuits to a no-op). Fixed by moving `closure.requested`/`review.pending` emission into `completePathwayReassessment` itself, where the transition genuinely happens.

---

## 4. Receipt v2 — hashing method

`app/lib/receipts/canonicalHash.ts`. **Deterministic canonical JSON + SHA-256** — object keys are recursively sorted before `JSON.stringify`, then hashed with the Web Crypto API's `crypto.subtle.digest('SHA-256', ...)`. No new npm dependency; no signing key; no signer identity; no non-repudiation guarantee.

**This is explicitly not a formally verified RFC 8785 JSON Canonicalization Scheme (JCS) implementation.** JCS additionally specifies Unicode normalization and ECMA-262-conformant number serialization, neither of which this implementation handles — it is sufficient for this batch's constrained, ASCII-safe, integer/enum-shaped receipt and event payloads, but must not be described as "RFC 8785 JCS + SHA-256" anywhere in this repo unless a real, conformance-tested JCS implementation replaces it. The correct language, used consistently in code comments, tests, and this doc, is **"deterministic canonical JSON + SHA-256"** (or "sorted-key canonical JSON + SHA-256").

`app/lib/codelab/trainingActivity.ts`'s `CodeLabTrainingCompletionReceipt.verification` field is literally `'tamper-evident-structural-receipt'` — never `'signature'`, `'certificate'`, or `'credential'`, checked directly by test (`tests/pathway-replay-intelligence-v2.test.mjs`, "the receipt is never called a digital signature, certificate, or credential").

---

## 5. Human closure gate

`PathwayClosureBrief.closure.state` is always the literal `'human-review-required'` — there is no code path that sets it to anything else. `recordPathwayReviewCompletion` is a separate, explicit reviewer action (`actorType: 'reviewer'`) that only ever sets `reviewCompleted: true`; it does not and cannot change `closure.state`, and no UI in this batch calls it automatically. No AI output, drill score, receipt creation, or replay state can complete closure.

---

## 6. xAPI adapter boundary

`app/lib/cardiology/pathwayXapiAdapter.ts`. Pure, conceptual mapping from a `PathwayEvent` to an xAPI-shaped statement (actor/verb/object/result/context/timestamp) — no LRS is integrated, and no statement is ever sent anywhere. Exists so a future LRS integration touches only this file.

---

## 7. Future credential adapter boundary

`app/lib/cardiology/pathwayCredentialBoundary.ts`. Architecture only. **Hard rule: Receipt ≠ Credential.** `evaluateCredentialIssuancePreconditions` hardcodes every governance precondition (approved curriculum, verified issuer, institutional governance, human verification, explicit competency standard) to `false`/`null`, and `isEligibleForCredentialConsideration` therefore always returns `false` for anything this repo can construct today. No badge or Verifiable Credential is issued anywhere in this batch.

---

## 8. Clinical Orbit and catalog integration

Additive only. Two new content nodes (`content:pathway:pathway:stemi-replay-demo-v2`, `content:pathway:drill:door-to-ecg-drill-v1`) and two `reviewed` edges (`condition:anterior_stemi_acs → related_to → ` the pathway node; `condition:cardiac_arrest_acls → related_to → ` the drill node) — both targets are genuinely live/visible. A third suggested edge (`pathway → next_learning_step → drill`) was deliberately skipped to stay within the Batch 6-reconciled curated-seed ceiling (≤24 nodes/≤20 edges) without renegotiating it again; the graph now sits exactly at that ceiling (24/20). Four new catalog content types — `pathway`, `drill`, `replay_activity`, `receipt_schema` — none counted as a clinical case; `receipt_schema` is a governance artifact and stays `hidden`/`labs`.

---

## 9. Live UI exposure

Route: **`/labs/pathway-replay`** (new), reached from the existing **Explore → "Pathway Replay"** card in `app/components/release/AtlasReleaseCatalog.tsx` — no navigation redesign, no second Echo/Pathway player. Timeline events are focusable (click/tap or arrow keys), open an evidence drawer with framer-motion swipe support (disabled under `prefers-reduced-motion`), and offer a "Practice this gap" action into the drill stage. 44px touch targets and responsive breakpoints are preserved from the ported CSS module.

---

## 10. External staging verification

**BATCH 7 EXTERNAL VERIFICATION: PASS**

No new schema migration was required — Pathway Replay Intelligence v2 is session/`sessionStorage`-only by design; nothing was drafted or applied. The four new catalog rows and two new Clinical Orbit nodes/edges were reconciled directly into the existing `clinical_content_catalog`/`kg_nodes`/`kg_edges` tables on the staging project (`xhwotblarwsxoanpiloe`) by the operator, then reported back and cross-checked against this repo's local seed manifests. This sandbox has no live Supabase network/credential access, so the numbers below are operator-reported staging state, cross-verified against local manifest counts this repo can compute directly — they matched exactly, which is the confirmation recorded here.

| Check | Result |
|---|---|
| Catalog truth match (source_key, module, content_type, title, category, access_tier, visibility, readiness, route, provenance_ref, source_revision, sort_order) | **80 / 80 PASS** — 0 missing, 0 extra, 0 metadata drift |
| Clinical Orbit node match | **24 / 24 PASS** |
| Clinical Orbit edge match | **20 / 20 PASS** |
| Batch 7 edges (`anterior_stemi_acs`→pathway, `cardiac_arrest_acls`→drill) | Both `evidence_status = reviewed`, targets visible+ready, `route = /labs/pathway-replay`, provenance present |
| RLS/security posture (`clinical_content_catalog`, `kg_nodes`, `kg_edges`: authenticated SELECT-only, no INSERT/UPDATE/DELETE, anon denied) — Batch 4/5 posture, unmodified | **PASS** |

- **Supabase staging:** applied and verified (table above).
- **Supabase production (`zbiujqxinvcxvuviuenx`):** unchanged.
- **Deployment:** not deployed. Application code is committed and pushed to `qa/case-batch20-cloud`; production Vercel has not been promoted to include it.

---

## 11. What is NOT implemented

- No Playwright visual spec (`visual/pathway-replay.spec.ts`) was ported or written for this route — UI/UX requirements are covered by source-contract regex tests instead (`tests/pathway-replay-live-route.test.mjs`).
- The separate BLS/ACLS lesson-receipt/player system from `ops/platform-governance-v1` (`lessonGovernance.ts`, `lessonReceipt.ts`, `TrainingLessonPlayer.tsx`, `trainingContent.ts`) was **not recovered** — it would silently replace the live `BLSLessonPlayer`/`blsLessons.ts`/`aclsLessons.ts` system. Only the pathway-gap-specific `trainingActivity.ts` receipt was ported.
- The branch's separate `app/lib/evidence/medicalOperationsRegistry.ts` (NeuraOps evidence projection) was not recovered — unrelated reference IDs, no consumer on HEAD. The underlying registry-snapshot concept is instead satisfied by the new, scoped `pathwayRegistrySnapshot.ts`.
- No real xAPI LRS integration, no real credential issuance, no institutional/real-patient data path — all remain explicitly out of scope by design (Sections 6–7).
