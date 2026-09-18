# Echo Intelligence Atlas — V1

*Batch 6. Documents the actual implementation on `qa/case-batch20-cloud` as of this closeout. This is a record of what exists in the repo today, not a roadmap or marketing description. Every claim below is sourced from a specific file; re-verify against current `git log`/source before trusting an older copy of this doc.*

---

## 1. Objective

Give Echo (transthoracic echocardiography) content a governed, study-level data model — distinct from a flat "case" concept — so that:

- content readiness is derived and honest, never asserted independently of its underlying media/review state,
- comparisons between phenotypes (e.g. Normal vs. DCM) are only ever surfaced once both sides are actually learner-ready and reviewed,
- learner-facing reasoning activities (next-best-evidence, confidence calibration) can exist without any vendor AI integration,
- an eventual real institutional intake and AI-vendor integration both have a governed contract to slot into later, without any product surface today implying either is usable now.

No real patient data, no AI diagnostic authority, no vendor integration, no production Supabase change, and no fabricated EF or other measurement are part of this batch. See Section 15 for the explicit boundary statement.

---

## 2. Study-level architecture

Echo content is modeled at the **study** level, not "one video = one case," across eight distinct, cross-referenced identity spaces:

| Concept | File | Purpose |
|---|---|---|
| EchoStudy (player contract) | `app/lib/clinicalMedia/echoStudyContract.ts` | Pre-existing (pre-Batch-6). The Studio *player's* clip-sequencing contract — always requires real, playable clips. |
| EchoStudyRecord | `app/lib/clinicalMedia/echoStudyRecord.ts` | New in Batch 6. An **Atlas-level governance record** — a study can exist here with identity, provenance and an honest readiness state long before (or without ever) having playable media. Only a `'ready'` record may carry a `playableStudyId`; every other state must leave it `null`. |
| View | `EchoStudyView` (`echoStudyContract.ts`) | Reused, not redefined — `'A4C'` etc. |
| Finding (`EchoFinding`) | `app/lib/clinicalMedia/echoFinding.ts` | A qualitative, non-numeric observation tied to a study+view. Severity is only set when a governed source actually graded it. |
| Measurement (`EchoMeasurement`) | `app/lib/clinicalMedia/echoMeasurement.ts` | A typed, provenance-carrying numeric value. Distinguishes manual/machine/report origin from `ai_provider` origin; an AI-produced value can never collapse into an undifferentiated number. |
| Phenotype | `app/lib/clinicalMedia/echoPhenotype.ts` | Groups one or more `EchoStudyRecord`s under a shared educational label. Never carries media itself. Its own readiness is **derived** from its weakest member study, never asserted independently. |
| Activity | `app/lib/competency/echoLearningActivity.ts` | A thin, typed wrapper naming which `EchoAssessmentTask` a study-level activity uses. Adds one new activity type: `next_best_evidence`. |
| Evidence (`EchoEvidence`) | `app/lib/clinicalMedia/echoEvidence.ts` | A typed, reusable provenance record — one per study (source, license, review status, source revision). |

This separation is deliberate: a phenotype can be a real, reachable concept (e.g. "Dilated cardiomyopathy") while having zero playable media, and the system is structurally prevented from claiming otherwise (see `validateEchoStudyRecordSeed` and `deriveEchoPhenotypeReadiness`).

---

## 3. Learner-ready vs. governed-non-ready semantics

`EchoStudyLearnerReadiness = 'ready' | 'review_required' | 'media_pending' | 'labs'`

A study is only ever surfaced to a learner when `learnerReadiness === 'ready' && reviewStatus === 'reviewed' && playableStudyId` is set (`isEchoStudyRecordLearnerReady`). A phenotype's readiness is the **weakest** of its member studies' readiness (`deriveEchoPhenotypeReadiness`) — it can never claim to be more ready than the real content backing it. This mirrors the repo-wide rule that only `visibility === 'visible' && readiness === 'ready'` content may reach a learner.

---

## 4. Current study/cine/phenotype/activity counts

As verified by `tests/echo-intelligence-atlas-contract.test.mjs` (32/32 passing) and `app/lib/clinicalMedia/echoAtlasMetrics.ts`:

| Metric | Count |
|---|---|
| Learner-ready Echo studies | **1** (`echo-a4c-governed-preview-v1`, Normal A4C) |
| Governed, non-ready studies | **2** (`echo-a4c-dcm-e00476`, `echo-a4c-severe-hcm-mm0002`) |
| Cine count (catalog, `echo`/`echo_batch20` modules) | **10** |
| Phenotype count | **3** (Normal, DCM, HCM) |
| Learning activity count | **1** (`echo-activity:a4c-normal-next-best-evidence`) |

These are derived counts (`deriveEchoAtlasMetrics`), never hardcoded — the source of truth is `ECHO_STUDY_RECORD_SEED`, `ECHO_PHENOTYPE_SEED`, `ECHO_LEARNING_ACTIVITY_SEED`, and `CLINICAL_CONTENT_CATALOG_SEED`.

---

## 5. DCM / HCM recovery status

**Governed placeholders exist; no playable media or ported governance pipeline exists.**

- `echo-a4c-dcm-e00476` and `echo-a4c-severe-hcm-mm0002` exist as `EchoStudyRecord`s with `learnerReadiness: 'review_required'` and `playableStudyId: null`.
- Their provenance cites `docs/case-media-resume/echo-readiness-snapshot.json` (a real file in this repo, rights/checksum metadata only) and the **unmerged** `feature/echo-competency-engine-v1` branch, referenced-only — its 17 DCM/HCM governance files (`echoBatch01CandidateRegistry.ts`, `echoDcmClinicalClosureRecord.ts`, etc., per `CLINIVERSE_V1_2_EXECUTION_PLAN.md`'s Batch 6 definition) were **not ported** in this batch.
- `echo-a4c-dcm-e00476` has `licenseStatus: 'licensed-verified'`; `echo-a4c-severe-hcm-mm0002` has `licenseStatus: 'pending'` — full rights-block verification for HCM was not recorded in this checkout.
- One qualitative finding exists per candidate (`echoFinding.ts`), sourced directly from the source page's own description/label, explicitly not independently clinically graded.
- Both phenotypes are correctly `hidden`/`review_required` in `clinical_content_catalog` and correctly excluded from the default-scope Clinical Orbit graph (Section 12).
- **This batch does not make DCM or HCM learner-reachable in any way.** Promoting either to learner-ready requires: real playable media, a completed specialist clinical review, a completed privacy review, and a completed device-playback review — none of which happened here.

---

## 6. Contrastive learning (comparison mode)

`app/lib/clinicalMedia/echoComparison.ts`. A comparison between two phenotypes is only ever **constructed** when:

1. both phenotypes declare each other in `comparisonGroup`,
2. both are independently derived as `'ready'` (Section 3), and
3. both have `reviewed` evidence (`echoEvidence.ts`).

`evaluateEchoComparisonEligibility` never fabricates a comparison to populate a UI — with today's real data (Normal ready; DCM/HCM `review_required`), **every comparison involving DCM or HCM is correctly ineligible**, which is the expected, honest result, not a bug (`tests/echo-intelligence-atlas-contract.test.mjs`, "Normal vs DCM, Normal vs HCM and DCM vs HCM are all correctly ineligible today"). `buildEchoComparison` throws rather than degrading silently if called on an ineligible pair.

---

## 7. Next-best-evidence

New activity type `next_best_evidence` (`app/lib/competency/echoLearningActivity.ts`): an educational-reasoning prompt about what to inspect next to reduce interpretive uncertainty — never patient-management advice. `assertNextBestEvidenceFraming` enforces this at validation time by banning management-language patterns (`diagnos(e|is)`, `treat(ment)?`, `prescri`, `patient (management|decision|care plan)`) and requiring explicit educational framing in `evidenceBoundary`.

One real, seeded task exists: `echo-a4c-next-best-evidence-v1`, tied to the Normal A4C study, asking what a learner would inspect next having reviewed a single A4C cine (correct answer: review an additional view). It is scored through the existing `scoreEchoAssessment` — no separate scoring path was added.

---

## 8. Confidence calibration

`app/lib/competency/echoConfidenceCalibration.ts`. Purely additive over the existing `EchoAssessmentResult` (which already separates `correct` from `confidence`) — `echoMasteryEngine.ts`'s own numeric confidence-calibration score is untouched.

- `toEchoConfidenceBand`: 1–2 → `low`, 3 → `medium`, 4–5 → `high`.
- `classifyEchoCalibration` sorts a result into one of four quadrants: `correct_high_confidence`, `correct_low_confidence`, `incorrect_low_confidence`, `incorrect_high_confidence`.
- `incorrect_high_confidence` is flagged `isMisconceptionPriority: true` — the highest-priority misconception signal.
- `summarizeEchoCalibration` aggregates counts and a `misconceptionPriorityCount` across many signals.

---

## 9. Measurement provenance

`app/lib/clinicalMedia/echoMeasurement.ts`. Every measurement records `origin: 'manual' | 'machine' | 'report' | 'ai_provider'`. An `ai_provider`-origin measurement additionally requires `provider`, `model`, `modelVersion`, a `qualityFlag`, and a `clinicianVerified` boolean that must never be `true` without a matching `verifiedAt` timestamp (and vice versa) — enforced by `validateEchoMeasurement`. `isMeasurementClinicallyVerified` only returns `true` for an AI-origin measurement when **both** `clinicianVerified` and `reviewStatus === 'reviewed'` hold — an unreviewed AI output can never present as clinically verified truth.

**`ECHO_MEASUREMENT_SEED` is intentionally empty.** No real, verified measurement exists anywhere in this checkout — nothing here fabricates an EF or any other value.

---

## 10. Echo AI adapter contract

`app/lib/clinicalMedia/echoAiAdapter.ts`. A vendor-neutral normalized contract only — **no vendor (Us2.ai, TOMTEC, Ultromics, DiA, or otherwise) is integrated anywhere in this batch.** `EchoAnalysisResult` is the single shape every AI provider's output must be mapped into; the rest of Cliniverse consumes only that shape, never a vendor's raw JSON. `ECHO_AI_PROVIDER_ADAPTERS` is an empty map — `resolveEchoAiProviderAdapter` throws for any provider name, by design, so an unrecognized vendor payload cannot bypass normalization. `validateEchoAnalysisResult` refuses to construct a result that is already `clinicianVerified: true` — that flag may only be set by a separate, explicit clinician-review step, never by an adapter itself. A future vendor integration touches only an implementation of `EchoAiProviderAdapter`, not any call site.

---

## 11. Institutional intake boundary

`app/lib/clinicalMedia/echoInstitutionalIntake.ts`. **Architecture only — no UI route exists for institutional/patient-data upload in this batch, and none was added by this closeout.** A governed state machine (`raw → deidentification_pending → deidentified → review_pending → approved_for_teaching`, with `rejected` reachable from every non-terminal state) exists so a real institutional pipeline has somewhere to slot into later. `isEchoInstitutionalIntakeLearnerVisible` returns `false` unconditionally, regardless of state — even `approved_for_teaching` output must re-enter through the ordinary `EchoStudyRecord`/catalog path as a new, independently-governed study; an intake record itself is never learner-reachable.

---

## 12. Clinical Orbit integration

`app/lib/clinicalOrbitGraphSeed.ts` (additive-only diff). Adds two condition anchors — `condition:dcm_phenotype`, `condition:hcm_phenotype` — plus three content nodes for the real DCM/HCM/Normal cine catalog items, and six edges, **all `pending_review`**. Because none of these edges is `reviewed`:

- The two new anchors are always reachable as concept nodes (no `catalogRef`, same as pre-existing anchors like `condition:heart_failure`) — reaching them returns **zero neighbors** in default learner scope.
- Their real neighbors (the DCM/HCM cine content nodes) **do** appear in reviewer scope, proving the edges are real and gated, not missing.

Total graph seed after this batch: **22 nodes / 18 edges**, within the deliberately reconciled curated ceiling of ≤24 nodes / ≤20 edges (`tests/clinical-orbit-graph-contract.test.mjs`, raised from the Batch 5 `<20`/`<15` guard specifically to accommodate this genuine addition — not a permanent product limit, but still a real guard against uncontrolled/automatic ontology expansion). Runtime constraints are unchanged: default query depth stays exactly 1 hop, `maxNeighbors` stays 6, and no speculative/unreviewed relation leaks into the default learner graph.

---

## 13. Catalog integration

`app/lib/contentCatalogSeed.ts` / `app/lib/contentCatalogQueries.ts` (additive-only diffs). Adds:

- `countByContentType()` — a truthful, unfiltered structural count helper, so callers (like `echoAtlasMetrics.ts`) can differentiate `cine` vs. `phenotype` vs. `activity` content-type buckets instead of lumping everything into one "case" count.
- Three `content_type: 'phenotype'` rows (`echo-phenotype-normal` visible/ready; `echo-phenotype-dcm` and `echo-phenotype-hcm` hidden/review_required) and one `content_type: 'activity'` row (`echo-activity-a4c-normal-next-best-evidence`, visible/ready).

No schema change was required — verified directly by test (`clinical_content_catalog.content_type has no CHECK constraint restricting its values`), not merely assumed.

---

## 14. Current UI exposure

**Route: `/labs/echo-preview`** (existing route, unchanged) — reached from the existing **Explore → "Echo Preview"** card in `app/components/release/AtlasReleaseCatalog.tsx`, which was already wired before this batch. No new route and no navigation redesign were introduced.

What changed: `app/components/clinical-media/ClinicalMediaPreview.tsx` now renders a new `EchoIntelligenceAtlasPanel` (`app/components/clinical-media/EchoIntelligenceAtlasPanel.tsx`) immediately after the existing `EchoStudySummaryPanel`, inside the **same, pre-existing** learner-ready gate (`capabilities.assessment && !dcmReview && program === 'echo-a4c-normal'`) that already gated `EchoA4cLesson`. This is additive content inside the existing Echo Preview workspace, not a second Echo player and not a second navigation entry:

- It surfaces the one seeded `next_best_evidence` activity as a small reasoning-check widget (select an option, set confidence 1–5, submit, see the rationale) — reusing `scoreEchoAssessment` and `classifyEchoCalibration`, the same scoring/calibration functions documented in Sections 7–8. State is local/session-only (no Supabase write, no persistence) — the same pattern already used elsewhere on this page for ephemeral preview state.
- It renders nothing (`return null`) if the seeded activity/task pair is ever missing — it never fabricates content to fill the space.
- It never references DCM, HCM, or any other governed non-ready phenotype, anywhere in its copy or logic — enforced by `tests/echo-intelligence-atlas-live-route.test.mjs`.

**Clinical Orbit** (`/labs/clinical-orbit`, pre-existing route) is a second, separate way the DCM/HCM anchors are technically reachable — but only as always-visible *concept* nodes with zero neighbors in default (non-reviewer) scope, per Section 12. This is graph browsing, not the Echo Studio player, and was not modified by this batch beyond the additive seed diff already covered above.

---

## 15. Privacy / PHI boundary

- No real patient data exists anywhere in this batch's code or seed data. Every study reference (Normal, DCM, HCM) points to licensed, attributed public educational source material (CardioNetworks ECHOpedia via Wikimedia Commons, CC-BY-SA-3.0), per `echoEvidence.ts` and `echoClinicalReviewAttestation.ts`.
- The institutional intake boundary (Section 11) is architecture only — it does not ingest, store, or expose any real patient study, and no UI route invites one.
- No AI vendor is integrated (Section 10) — there is no third-party data flow to govern yet.
- No production Supabase table or policy was touched by this batch. Verified as unnecessary, not merely unattempted (Sections 12–13).

---

## 16. What is NOT implemented

- The DCM/HCM pathology-batch governance pipeline code from `feature/echo-competency-engine-v1` (17 files, per the execution plan's original Batch 6 scope) was **not ported**. DCM/HCM exist here only as hand-authored governed placeholders (Section 5).
- No playable DCM or HCM media exists anywhere in this checkout.
- No real AI vendor adapter implementation exists — only the contract (Section 10).
- No institutional intake UI exists — only the state machine (Section 11).
- No measurement value (AI-produced or otherwise) has been generated or stored — the measurement seed is empty by design (Section 9).
- Comparison/contrastive mode has no real eligible pair today — it correctly reports every real pairing as ineligible until DCM or HCM reaches learner-ready (Section 6).
- Confidence calibration and next-best-evidence exist for exactly one study (Normal A4C) — they are not yet exercised across multiple studies.

---

## 17. Staging / production status

**BATCH 6 EXTERNAL STAGING: VERIFIED**

No new schema migration was required for this batch — confirmed unnecessary by test, not just unattempted: existing `supabase/drafts/clinical_orbit_graph_v1.sql` and `supabase/drafts/clinical_content_catalog_v1.sql` already allow every node type, relation, and content_type value this batch uses. The four new catalog rows and the Echo graph additions were reconciled directly into the existing `clinical_content_catalog`/`kg_nodes`/`kg_edges` tables on the staging project (`xhwotblarwsxoanpiloe`) by the operator, then reported back and cross-checked against this repo's local seed manifests. This sandbox has no live Supabase network/credential access, so the numbers below are operator-reported staging state, cross-verified against the local manifest counts this repo can compute directly (Sections 4, 12–13) — the two matched exactly, which is the confirmation recorded here.

| Check | Result |
|---|---|
| Catalog truth match (source_key, module, content_type, title, category, access_tier, visibility, readiness, route, provenance_ref, source_revision, sort_order) | **76 / 76 PASS** — 0 missing rows, 0 extra rows, 0 metadata drift |
| Clinical Orbit node match | **22 / 22 PASS** — 0 node drift |
| Clinical Orbit edge match | **18 / 18 PASS** — 0 edge drift |
| Echo learner-scope gating (Normal visible/ready; DCM/HCM cine + phenotype hidden/review_required; all DCM/HCM edges `pending_review` and excluded from default-scope queries) | **PASS** |
| RLS/security posture (`clinical_content_catalog`, `kg_nodes`, `kg_edges`: authenticated SELECT-only, anon denied, no INSERT) — existing Batch 4/5 posture, unmodified by this batch | **PASS** |

- **Supabase staging:** applied and verified (table above).
- **Supabase production (`zbiujqxinvcxvuviuenx`):** unchanged.
- **Deployment:** not deployed. This batch's application code is committed and pushed to `qa/case-batch20-cloud` (see repository history); production Vercel has not been promoted to include it.
- **App Store / Codemagic:** out of scope for this batch; no native-identity-affecting change was made.
