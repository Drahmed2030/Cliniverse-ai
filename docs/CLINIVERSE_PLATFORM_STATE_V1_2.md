# Cliniverse Platform State — v1.2 (Batches 1–10)

*Canonical architectural/current-platform snapshot. This document exists so a future Claude Code session (or human) can recover an accurate picture of the platform without replaying chat history. It is refreshed at batch boundaries, not continuously — always cross-check a specific claim against the source file or the batch doc cited before acting on it, per CLAUDE.md's "verify, don't assume" rule.*

*Baseline: Batches 1–10 closed. Branch `qa/case-batch20-cloud`. Do not read git SHAs, test counts, or row counts below as live — they are dated snapshots, explicitly marked, kept only for historical orientation. For current HEAD/branch/test state, run `git log` / `npm test` / `npx tsc --noEmit` / `npx next build` yourself.*

---

## A. Platform structure

Cliniverse is organized into five layers (first established in `CLINIVERSE_MASTER_RECOVERY_UNIFICATION_REPORT_V2.md` Section 13, still the correct top-level map):

- **Cliniverse Learn** — Ward/Patient Journey case simulation, ACLS/BLS/Code Lab, Megacode v1, Cardiology Operations, Pathway Replay, Resuscitation Hub.
- **Cliniverse Studio** — ECG image bank + scoring/eligibility/adaptive-selection/xAPI pipeline, Echo Intelligence Atlas (study/phenotype/measurement/evidence model, one licensed asset).
- **Cliniverse Reference** — Clinical Reference Intelligence v2 (calculators, renal function, drug identity, interactions, dosing), FDA/RxNorm/WHO/PubMed/ClinicalTrials proxies, Doc Analyzer, Knowledge Graph (vector-match, API-gated).
- **Cliniverse Connect** — FHIR sandbox client (orphaned demo), Cardio Nexus Core (specification only), QAPAS-DIRECT simulator, DICOM/HL7/PACS (specification/none), NeuraOps `/neuraops` positioning page.
- **NeuraOps Operations** (infrastructure, not learner-facing) — auth/entitlement foundation, RLS isolation hardening, StoreKit 2 subscription authority, engagement/evidence foundation.

**Live navigation is `ReleaseNav.tsx`** (`type ReleaseTab = 'today' | 'learn' | 'progress' | 'explore' | 'me'`), rendered by `ReleaseApp.tsx` (`app/page.tsx`'s actual entry point). `app/components/FloatingNav.tsx` (`type Tab = 'hub' | 'ward' | 'oracle' | 'tools' | 'me'`) still exists in the tree but has **zero importers anywhere in the live app** (verified by grep, Batch 11-prep pass) — it is dead code, not a secondary or fallback nav contract. Do not design against it.

Inside `learn`, `ReleaseApp.tsx` further routes by `careWorkspace: 'ward' | 'cardiology' | 'nexus' | 'codelab'` (`app/components/ward/index.tsx`'s `WardIndex`), and Cardiology Operations has its own internal `CardiologyModuleId` tab set (`overview | console | pathway | census | surgery | tasks | handover`). These are internal/nested routing states, not the top-level nav contract.

---

## B. Current major systems

| System | Batch | Entry surface | Status |
|---|---|---|---|
| Content Catalog | 4 | n/a (control plane, no UI of its own) | ACTIVE — staging verified, production not applied |
| Clinical Orbit | 5 | `/labs/clinical-orbit` | ACTIVE — staging verified, production not applied |
| Echo Intelligence Atlas | 6 | `/labs/echo-preview` | ACTIVE — staging verified, production not applied |
| ECG governed content | pre-existing, hardened across batches | Learn tab, ECG Challenge | ACTIVE in production |
| Pathway Replay Intelligence | 7 | `/labs/pathway-replay` | ACTIVE — staging verified (no schema needed), production not applied |
| Clinical Reference Intelligence | 8 | `/labs/clinical-reference` | ACTIVE but `review_required` — reachable, not yet learner-default-visible pending clinical review |
| Resuscitation Intelligence | 9 | `/labs/resuscitation-hub` | ACTIVE — BLS/ACLS lessons and engine ready; Code Lab drills and 3 governed scenarios `review_required` (gated, not launchable; drill content has no completed source review — see `app/lib/codelab/lessonSources.ts`) pending clinical review |
| Cardiology Operations Intelligence | 10 | Learn → Cardiology Operations (PRO) → Console tab | ACTIVE, PRO-gated; Supabase untouched (no schema needed) |
| Auth / entitlement / StoreKit boundary | 1–3 (+ ongoing hardening) | app-wide | ACTIVE — real Supabase-backed auth, StoreKit 2 entitlement authority live; RLS isolation hardening staging-verified, production promotion pending an explicit migration-window decision |
| Engagement / evidence foundation | 2 (+ reused throughout 7–10) | app-wide, non-UI | ACTIVE — `evidenceProvenanceLedger.ts` pattern; canonical-JSON+SHA-256 receipts (Pathway Replay, Resuscitation) reuse this lineage |

---

## C. Batch history (1–10)

Each entry: objective → architecture introduced → status → durable invariant. Test counts and row counts are historical snapshots at each batch's close, not current truth — re-verify before citing.

**Batch 1 — Build 67 documentation closeout.** *Objective:* close the gap between reported release state (Codemagic build, Apple validation, TestFlight install) and committed docs. *Architecture:* none — pure documentation. *Status:* closed (`docs/APPLE_BUILD_67_OUTCOME_2026-09-17.md`). *Invariant:* externally-reported facts (Codemagic/App Store/TestFlight outcomes) are always labeled `[externally reported, not repo-verifiable]` vs `[repo-verified]` — never blended.

**Batch 2 — Real auth + engagement foundation.** *Objective:* replace simulated/localStorage auth with real, fail-closed Supabase-backed auth; establish an engagement/evidence-provenance foundation reused by later batches. *Architecture:* `app/lib/identity.ts`, `app/lib/entitlements.ts` (fail-closed `getOwnEntitlement()` — no session or a failed lookup returns the `FREE_ENTITLEMENT` object, never an assumed-pro default), engagement/evidence provenance ledger pattern. *Status:* closed, live. *Invariant:* an entitlement or identity lookup that cannot complete must resolve to the least-privileged state, never silently to access-granted.

**Batch 3 — RLS isolation hardening.** *Objective:* close remaining Row-Level-Security gaps beyond the applied Apple RC1 migration. *Architecture:* pure additive SQL migrations + a read-only catalog-check script, no application code. *Status:* **staging verified, production not yet applied** (`docs/RLS_ISOLATION_BATCH3_STATUS.md`) — an explicit migration-window decision is still required before production promotion. *Invariant:* for every RLS-enabled table, confirm explicit per-operation policies exist and re-`.select()` a row back after any write in manual verification — a clean HTTP 200 is not proof of a real write (this lesson, learned here, is preserved verbatim in CLAUDE.md §2).

**Batch 4 — Clinical Content Catalog.** *Objective:* replace hardcoded/inflated content-count claims (e.g. ClinicalLibrary's "500+ cases / 8 specialties" against 7 actual cases) with one governed control-plane table. *Architecture:* `public.clinical_content_catalog` (Supabase) + `app/lib/contentCatalogSeed.ts` (single source of truth) + `app/lib/contentCatalog.ts`/`contentCatalogQueries.ts` (the only sanctioned read path). *Status:* staging verified 2026-09-18 (71 rows at close), production not applied. *Invariant:* `visibility === 'visible' && readiness === 'ready'` is the only combination a learner-facing query may return — see Section D.

**Batch 5 — Clinical Orbit.** *Objective:* give Cliniverse an entity-centered way to browse how a clinical concept connects to real, governed content, reusing the pre-existing empty `kg_nodes`/`kg_edges` tables rather than building new schema. *Architecture:* `app/lib/clinicalOrbitGraphSeed.ts` (curated node/edge seed), `clinicalOrbitGraphQueries.ts` (pure, 1-hop, `maxNeighbors`-capped, catalog-gated), `clinicalOrbit.ts` (Supabase-or-fallback adapter), `/labs/clinical-orbit`. *Status:* staging verified 2026-09-18 (17 nodes/12 edges at close; **30 nodes/25 edges as of Batch 10**, ceiling deliberately re-reconciled at each genuine addition), production not applied. *Invariant:* a content node's availability is derived by resolving its `catalogRef` against the Content Catalog's own `isAvailable()` gate — Clinical Orbit never maintains a second, independent readiness opinion; an edge's own `evidenceStatus` gates independently of its target's availability.

**Batch 6 — Echo Intelligence Atlas.** *Objective:* model Echo content at the **study** level (not "one video = one case"), so phenotype/comparison/measurement claims are always derived from, never asserted ahead of, real backing media and review state. *Architecture:* `EchoStudyRecord` (Atlas-level governance, distinct from the pre-existing player-level `EchoStudyContract`), `EchoFinding`, `EchoMeasurement` (origin-typed: manual/machine/report/`ai_provider`, with mandatory `clinicianVerified`+`verifiedAt` pairing), `EchoPhenotype` (readiness = weakest member study, never asserted independently), `echoComparison.ts` (only ever constructs a comparison when both sides are independently `ready` + `reviewed`), `echoAiAdapter.ts` (vendor-neutral contract, zero vendors integrated, empty adapter map). *Status:* staging verified (`docs/ECHO_INTELLIGENCE_ATLAS_V1.md`), production not applied. *Invariant:* an AI-origin measurement can never present as clinically verified without both `clinicianVerified: true` and `reviewStatus: 'reviewed'` — this exact pairing rule is the template every later batch's "AI output vs. governed truth" split follows (Pathway Replay's receipts, Resuscitation's debrief, Cardiology Operations' KPI draft/validated split).

**Batch 7 — Pathway Replay Intelligence v2.** *Objective:* upgrade the recovered Pathway Replay experience into a governed `replay → drill → reassessment → closure` loop with a real, verifiable event history. *Architecture:* `pathwaySession.ts` (pure 4-stage reducer, not a workflow-engine library), `pathwayEvent.ts` (hash-chained event stream — every event's hash covers the previous event's hash, `verifyPathwayEventChain` detects tampering/reordering), `app/lib/receipts/canonicalHash.ts` (deterministic sorted-key canonical JSON + SHA-256 — explicitly **not** RFC 8785 JCS, never described as such), `pathwayCredentialBoundary.ts` (architecture-only; every credential-issuance precondition hardcoded false — Receipt ≠ Credential). *Status:* staging verified (no schema needed — `sessionStorage`-only by design). *Invariant:* `PathwayClosureBrief.closure.state` is always the literal `'human-review-required'` — no code path sets it to anything else; a receipt's `verification` field is always `'tamper-evident-structural-receipt'`, never `'signature'`/`'certificate'`/`'credential'`.

**Batch 8 — Clinical Reference Intelligence v2.** *Objective:* replace three architecturally-unsafe reference components (one made an unauthenticated direct client-side Anthropic call) with a governed, evidence-first layer: drug identity → evidence → renal function → dosing rule → interaction → calculator → provenance. *Architecture:* `app/lib/clinicalReference/*` — `calculatorRegistry.ts` (7 calculators, scoring separated from interpretation, both carrying `sourceRefs`), `renalFunction.ts` (CKD-EPI 2021 vs. Cockcroft-Gault, never interchanged), `drugIdentity.ts` (RxNorm `rxcui` as the only identity key), `drugInteractionRules.ts` / `renalDosingRules.ts` (hand-authored, rxcui-keyed, LLM never defines a rule). Real audit findings fixed in-flight: CHA₂DS₂-VASc age double-count, `/api/rxnorm` actually calling openFDA+PubMed instead of RxNav, eGFR mislabeled as CKD-EPI when it was 2006 MDRD. *Status:* reachable at `/labs/clinical-reference`, but every registry is `visibility: 'visible'` + `readiness: 'review_required'` — real and discoverable, not yet learner-default-visible. *Invariant:* an LLM may explain an already-verified rule in simpler language; it may never define, invent, or independently generate a dosing/interaction rule — enforced by removing all three prior LLM-backed variants, not just documenting the rule.

**Batch 9 — Resuscitation Intelligence Foundation.** *Objective:* generalize BLS/ACLS/Megacode into a shared resuscitation architecture: Learn → Practice → Simulate → Rapid Replay → Debrief → Competency → Evidence. *Architecture:* `app/lib/resuscitation/` — `scenarioContract.ts` (declarative scenario DSL, plain-data/pure-function, XState v5 evaluated and explicitly not adopted at this batch's complexity), `scenarioEngine.ts` (interpreter), `rapidReplay.ts` (pause → focused feedback → rewind-to-checkpoint → retry, never ends a scenario after one error unless `criticalErrorPolicy` is explicitly `end_scenario`), `debriefEngine.ts`, `evidenceReceipt.ts` (same canonical-hash receipt lineage as Batch 7). *Status:* Hub live at `/labs/resuscitation-hub`; BLS/ACLS/drills/engine/debrief/competency map all `visible`+`ready`. **Governance fix applied same batch cycle:** the three governed simulation scenarios (VF/pVT, PEA/asystole, unstable bradycardia) each declare `reviewStatus: 'pending_clinical_review'` in their own manifest but were initially miscataloged `ready` — corrected to `readiness: 'review_required'`, and the Hub's launch button is now gated through the catalog (not the manifest's own self-declared status) before a learner can start a simulation. *Invariant:* a content item's own internal/manifest-declared review status is never the exposure authority — only the Content Catalog's row is (the exact Batch 4 lesson, re-learned and now enforced by a reusable `catalogReviewStatusFor()` helper).

**Batch 10 — Cardiology Operations Intelligence v2.** *Objective:* generalize the 5-module Cardiology Operations simulation and the QAPAS-DIRECT pathway engine into one shared operational model: Encounter → Work Items → Ownership → Events → Procedure → Handover → Escalation → Closure → Audit. *Architecture:* `app/lib/cardiologyOperations/` — `operationalCore.ts` (shared types), `operationalEventLedger.ts` (append-only, deterministic, generalized from `nexusCore.ts`'s proven engine), `operationalWorkItems.ts` (9-kind generalized Work Queue, replacing the narrow note/order split), `operationalEscalation.ts` (workflow-only; every `EscalationState` sets `clinicalSeverityClaimed: false` structurally), `operationalKpi.ts` (draft/validated split, generalized from `nexusKpiEngine.ts`), `careBeam.ts` (pathway-agnostic projection of the event ledger — stores no independent state), `nexusOperationalProfile.ts` / `legacyOperationsProfile.ts` (read-only "pathway profile" adapters over the existing QAPAS `nexusCore.ts` engine and the original 5-module state, respectively — neither underlying system was rewritten). New `OperationsConsole.tsx` tab renders Care Beam / Operational Pulse / Ownership / Procedure Board / Handover readiness / Exception Lens, with swipe+keyboard+button parity, verified in a real browser (Playwright, production build, 5 required viewports) — one CSS grid `min-width` overflow bug found and fixed during that pass. *Status:* live, PRO-gated; Supabase untouched (no new schema). QAPAS bidirectional write-through (QapasDirectSimulation writing through the shared ledger instead of its own `nexusCore.ts` engine) is an explicit, documented, deferred scope limit — see Section G. *Invariant:* Care Beam is a projection of the operational event ledger and stores no independent truth of its own; `nexusCore.ts` remains the sole authority over what QAPAS-DIRECT itself may do — a "pathway profile" reads its output, it never becomes a second, independently-writable ledger.

---

## D. Current governance model

**The learner-readiness gate — the single most load-bearing rule in the platform:**

```
visibility === 'visible' AND readiness === 'ready'
```

is the *only* combination a learner-facing query may return. `review_required`, `media_pending`, `labs`, and `hidden` must never leak to a learner outside an explicitly reviewer/labs-gated scope. This is enforced by `isAvailable()` in `app/lib/contentCatalogQueries.ts` and must never be reimplemented independently by a new module — every governed content surface built since Batch 4 (Clinical Orbit, Echo Atlas, Pathway Replay, Clinical Reference, Resuscitation, Cardiology Operations) calls this same function, directly or through a thin wrapper (e.g. `isReferenceItemLearnerReady()`, `catalogReviewStatusFor()`).

**Preserved, non-negotiable invariants:**

- **Catalog authority** — the Content Catalog is the sole exposure authority for learner-facing content. A component's own internal state (a scenario's `reviewStatus`, a calculator's `learnerReadiness` field, a lesson's own opinion) is descriptive, never authoritative. Batch 9's governance fix is the concrete cautionary example: a scenario manifest correctly said `pending_clinical_review`, but the catalog row said `ready` — the catalog was wrong, and the fix was to correct the catalog and gate the UI through it, not to trust the manifest.
- **Clinical Orbit filtering** — a content node's availability is always resolved through the Content Catalog; an edge's `evidenceStatus` gates independently of its target node.
- **Provenance requirements** — every clinical relationship, KPI, calculator band, dosing rule, and interaction rule carries `sourceRefs`/`provenanceRef` pointing at a real, named source. No invented SNOMED/LOINC/RxNorm code; only a normalized code where a verified one exists.
- **Human clinical review requirements** — no AI-generated clinical relationship, measurement, or claim is ever promoted to "reviewed" without an actual human clinical review step. `review_required` is the honest default for new clinical-adjacent content until that review happens — not a temporary inconvenience to route around.
- **No PHI** — no real patient data, no real MRN, no real patient identifiers, anywhere in the general/learner product. Institutional/patient-data workflows require separate, explicit governance (see Section F).
- **Staging before production, always** — every Supabase-touching batch (4 through present) has been staging-verified only; production (`zbiujqxinvcxvuviuenx`) remains on its pre-v1.2 baseline pending an explicit migration-window decision for each. Never treat "staging verified" as "production applied."
- **Explicit RLS verification** — for every RLS-enabled, client-facing table: confirm explicit per-operation policies exist (don't trust a clean write response), and `DROP POLICY IF EXISTS` anything not in the intended final state — a stale policy `REVOKE` doesn't remove (Batch 5's `kg_nodes`/`kg_edges` legacy-PUBLIC-policy finding is the concrete precedent).

---

## E. Major architectural contracts

**Content Catalog = content control plane.** One governed index (`clinical_content_catalog`) of what content exists and whether it's learner-ready. No component hardcodes a content count or queries content tables directly — everything goes through `app/lib/contentCatalog.ts`.

**Clinical Orbit = governed relationship layer.** A small, curated graph (not a medical ontology) connecting clinical concepts to real catalog content, 1-hop-only, `maxNeighbors`-capped, provenance-and-evidence-status-gated on every edge.

**Echo:** `Study → Views → Findings → Measurements → Phenotype → Evidence → Activities`. A phenotype's readiness is derived from its weakest member study. A measurement's origin (manual/machine/report/ai_provider) is never collapsed into an undifferentiated number.

**Pathway Replay:** event stream + deterministic canonical JSON/SHA-256 receipts. Explicitly **not** certification or credentials — a receipt's `verification` field is always `'tamper-evident-structural-receipt'`; `PathwayClosureBrief.closure.state` is always `'human-review-required'`.

**Clinical Reference:** `drug identity → evidence → renal function → dosing rule → interaction → calculator → provenance`. The LLM is not dosing/interaction authority — it may explain an already-verified rule, never define one.

**Resuscitation:** `Learn → Practice → Simulate → Rapid Replay → Debrief → Competency → Evidence`. Registry presence (a scenario existing in code) is never sufficient for learner exposure — only the catalog row is.

**Cardiology Operations:** `Encounter → Work Items → Ownership → Events → Procedure → Handover → Escalation → Closure → Audit`. **Care Beam is a projection of operational events, never an independent truth store** — it holds no state of its own; recompute it from the event ledger + work items + escalations every time. This same "derive, never duplicate" principle governs Operational Pulse (all counts derived, never a stored counter) and the Ownership/Exception Lens views.

---

## F. Institutional future boundaries (architecture-only — not live integrations)

None of the following is a live integration. Each exists only as a documented mapping intent or an inert contract, specifically so a future batch has a clean target instead of an invented one:

- **FHIR R4/R5** — `app/lib/cardiologyOperations/fhirMappingBoundary.ts` (Batch 10) and Clinical Reference's own mapping table (`CLINICAL_REFERENCE_INTELLIGENCE_V2.md` §19) document intended mappings (`OperationalEncounter → Encounter`, `ClinicalWorkItem → Task`, `DrugIdentity → Medication`, etc.). No FHIR server, no resource construction anywhere. `FHIRIntegration.tsx` (pre-existing, orphaned) makes real calls to a public HAPI sandbox but is not imported by any live route.
- **SMART App Launch** — documented only (`docs/CARDIOLOGY_OPERATIONS_V2.md` §12). No OAuth/launch-context code anywhere.
- **CDS Hooks** — documented only. No hook service exists; the operational escalation model's "workflow fact, never clinical severity" rule is the design constraint any future hook must inherit.
- **DICOM/PACS** — specification/fictional only (`TeleconsultModule.tsx` is scripted roleplay copy, not a real client). No DICOMweb/PACS/VNA client code exists anywhere in the repo's history.
- **Institutional Echo teaching intake** — `app/lib/clinicalMedia/echoInstitutionalIntake.ts` (Batch 6): a governed state machine (`raw → deidentification_pending → deidentified → review_pending → approved_for_teaching`) exists so a real institutional pipeline has somewhere to slot in later. `isEchoInstitutionalIntakeLearnerVisible` returns `false` unconditionally — even `approved_for_teaching` must re-enter through the ordinary catalog path as an independently-governed study.
- **Hospital operational integration** — Cardio Nexus Core (`supabase/drafts/cardio_nexus_core_contract.sql`) is specification only, deliberately ends in `rollback;`, never applied anywhere. QAPAS-DIRECT is a fully offline TypeScript simulator with zero network/hospital dependency.
- **Hardware CPR/manikin adapters** — `app/lib/resuscitation/hardwareAdapterBoundary.ts` (Batch 9): unsupported hardware metrics (compression depth/rate, ventilation quality, recoil, hands-off time) are explicitly declared unavailable, never estimated or faked, with an architecture-only boundary for a future real adapter.

**None of the above should be marketed as institution-ready.** Each requires a named institutional partner, a completed governance sign-off chain, and — for anything schema-touching — an isolated sandbox Supabase project, before any of it becomes real integration work.

---

## G. Deferred / not implemented

Explicitly listed so a future session does not assume any of the following exists:

- **QAPAS bidirectional write-through** — `QapasDirectSimulation.tsx` still writes through `nexusCore.ts`'s own `applyNexusEvent`, not the shared `operationalEventLedger.ts`. `nexusOperationalProfile.ts` only *reads* `nexusCore.ts`'s output. This is a documented, deliberate Batch 10 scope limit, not an oversight.
- **Cardiology Operations Procedure Board / Work Queue UI** — the shared-core logic (`operationalProcedureBoard.ts`, `operationalWorkItems.ts`) exists and is exercised by the new Console, but the *original* `SurgicalList.tsx` / `NotesOrdersTracker.tsx` components were not rewritten to consume it — they remain their own, separately-tested, pre-existing UI.
- **DCM/HCM pathology-batch governance pipeline** (17 files on the unmerged `feature/echo-competency-engine-v1` branch) — not ported. DCM/HCM exist in Echo Intelligence Atlas only as hand-authored `EchoStudyRecord` placeholders with `learnerReadiness: 'review_required'` and `playableStudyId: null`. No playable DCM/HCM media exists anywhere in this checkout.
- **Real Echo AI vendor integration** — `echoAiAdapter.ts`'s provider map is empty; no vendor (Us2.ai, TOMTEC, Ultromics, DiA, or otherwise) is integrated.
- **Real xAPI LRS / credential issuance** — `pathwayXapiAdapter.ts` and `pathwayCredentialBoundary.ts` are architecture-only; no statement is ever sent to a real LRS, no credential/badge is ever issued.
- **DailyMed narrative label content** — seeded for only 2 of 12 governed drugs (metformin, warfarin); the rest have live identity/version lookup only.
- **Fresh human clinical review** for any Clinical Reference calculator/interaction/dosing rule, or any Resuscitation governed scenario — all remain `pending_clinical_review`/`review_required` by design, not by omission.
- **Megacode v2** (`MegacodeRunner.tsx`, VF/PE/Sepsis) — exists in the tree, unwired, has been wired-and-reverted twice historically. Not part of Resuscitation Intelligence's actual architecture (which superseded this plan item with a different, broader design — see Batch 9 above).
- **Institutional sandbox** (Cardio Nexus Core promotion, `AudienceNavigator.tsx`, Medical Operations Registry) — never implemented. The original execution plan's Batch 10 scope (institutional sandbox) was superseded by Cardiology Operations Intelligence v2, a deliberate re-scoping, not a silent drop.
- **`ClinicalLibrary.tsx`'s 248-vs-7 display gap** — flagged in the master recovery report, not fixed by any of Batches 1–10 (the component remains unreachable/dead code, so the live App Store risk was already zero).
- **Angiography / cath-lab viewer** — confirmed not implemented anywhere in the repo's history, across all branches.
- **A repo-wide design-token convention for Labs surfaces** — `ResuscitationHub.tsx` and `OperationsConsole.tsx` (Batches 9–10) use scoped CSS Modules with their own local custom properties (`--rh-*`, `--oc-*`) rather than the global `var(--cv-*)` tokens CLAUDE.md's styling contract otherwise describes. This is a known, real inconsistency — not yet reconciled — worth a deliberate decision in a future batch rather than an assumption either way.

---

*Maintained alongside each future batch's own status doc. When a new batch changes platform architecture, update Section B/C/E here — do not let this document silently drift from source, and do not let a batch-specific status doc (e.g. `docs/CARDIOLOGY_OPERATIONS_V2.md`) become the only place a durable architectural fact lives.*
