# Cardiology Operations Intelligence v2

Status: Batch 10 — Operational Core implemented, Console UI implemented, not deployed
Branch: `qa/case-batch20-cloud`
Supersedes: nothing. `CARDIOLOGY_OPERATIONS_EPIC_V1.md` remains accurate for the 5 original modules it documents and is not deleted (see classification table below).

## 1. Reconciliation classification

| File | Classification | Notes |
|---|---|---|
| `CardiologyOperations.tsx` | ADAPT | Added a `console` tab; lifted `nexusCase` state up so the Console and QAPAS pathway share one live ledger. Module list otherwise unchanged. |
| `OperationsOverview.tsx` | REUSE | Untouched. |
| `ChestPainCensus.tsx` | REUSE | Untouched. |
| `NotesOrdersTracker.tsx` | REUSE | Untouched. The generalized Work Queue (`ClinicalWorkItem`) exists in the shared core and is exercised by the Console via `legacyOperationsProfile.ts`; this component's own UI is not rewritten this batch. |
| `SurgicalList.tsx` | REUSE | Untouched. Procedure Board (`operationalProcedureBoard.ts`) generalizes the same concept and is exercised by the Console; this component's own UI is not rewritten this batch. |
| `StructuredHandover.tsx` | REUSE | Untouched — its inline readiness formula (`note.trim().length > 0 && pendingReviewed && ownerConfirmed && simulationConfirmed`) is preserved exactly (regression-tested by `tests/cardiology-operations-contract.test.mjs`). `operationalHandover.ts`'s `deriveHandoverReadiness` is the new, pure, independently-tested version of the same logic, used by the Console. |
| `TeamPerspective.tsx` | REUSE | Untouched. |
| `QapasDirectSimulation.tsx` | ADAPT | `nexusCase`/`setNexusCase` moved from internal `useState` to props (`createInitialQapasCase()` now exported). Every other internal behavior — checkpoints, replay, role practice — unchanged. |
| `useCardiologyOperations.ts` | REUSE | Untouched. |
| `simulationData.ts` | REUSE | Untouched. `legacyOperationsProfile.ts` adapts its output types without modifying it. |
| `types.ts` | ADAPT | Added `'console'` to `CardiologyModuleId`. Every other type untouched. |
| `nexusCore.ts` | REUSE | Untouched, per Section 9's explicit instruction not to delete it wholesale. |
| `nexusKpiEngine.ts` | REUSE | Untouched. `operationalKpi.ts` generalizes the same draft-KPI pattern in a new module rather than modifying this one. |
| `nexusReferences.ts` | REUSE | Untouched. Referenced conceptually by `OperationalEvidenceReference`'s `provenanceKind` split. |
| `decisionReplay.ts` | REUSE | Untouched. |
| `teamPerspective.ts` | REUSE | Untouched. |
| `CARDIOLOGY_OPERATIONS_EPIC_V1.md` | KEEP AS LEGACY | Still the accurate release-contract doc for the 5 original modules. This document is the v2 architecture addendum, not a replacement. |
| Catalog/Orbit/Progress wiring | ADAPT | New catalog rows/orbit edges added for the new, genuinely reachable capabilities (Console, Care Beam, Work Queue, Procedure Board, Handover Engine as views); the existing `cardiology_operations` row is untouched. |

Nothing is classified SUPERSEDE or REMOVE FROM LIVE PATH — this batch is additive throughout, per the "do not create a parallel second operations architecture" instruction.

## 2–10. Operational Core

Implemented in `app/lib/cardiologyOperations/`:

- `operationalCore.ts` — shared types (`OperationalEncounter`, `ClinicalWorkItem`, `OperationalEvent`, `OwnershipAssignment`, `OperationalClock`, `ProcedureState`, `HandoverState`, `EscalationState`, `OperationalEvidenceReference`).
- `operationalEventLedger.ts` — append-only, deterministic-ordering event ledger, generalized from `nexusCore.ts`'s proven pattern.
- `operationalWorkItems.ts` — the generalized Work Queue (9 kinds), lifecycle, ownership assignment (always event-producing), overdue/unowned derivation.
- `operationalProcedureBoard.ts` — Procedure Board readiness, derived from checklist + related work items.
- `operationalHandover.ts` — Handover readiness, derived, with exact blockers exposed (never a single collapsed score).
- `operationalEscalation.ts` — Escalation model; structurally cannot claim clinical severity (`clinicalSeverityClaimed: false` on every instance).
- `operationalKpi.ts` — KPI draft vs. validated-result split, generalized from `nexusKpiEngine.ts`.
- `careBeam.ts` — pathway-agnostic Care Beam projection; stores no state of its own.
- `operationalPulse.ts` — Operational Pulse, Ownership summary, and Exception Lens, all derived counts.
- `nexusOperationalProfile.ts` — the QAPAS "pathway profile" over the shared core (see Section 9 decision record below).
- `legacyOperationsProfile.ts` — the same kind of profile for the original 5-module Cardiology Operations simulation.
- `fhirMappingBoundary.ts` — documentation-only FHIR mapping intent (Section 11).

## 9. QAPAS/Nexus reconciliation — decision record

`nexusCore.ts`'s append-only transition-rule engine is **not** rewritten or deleted. `nexusOperationalProfile.ts` is a read-only projection: it maps an existing `NexusCase`'s recorded events onto the shared `OperationalEvent`/Care-Beam-stage shape, and separately derives at most one `ClinicalWorkItem` representing the single next-authorized transition. It does **not** retroactively fabricate a work item for every already-completed step, since no such work item ever existed in the real ledger — inventing one would violate the "derive, never fabricate" principle applied everywhere else in this batch.

Full bidirectional integration — `QapasDirectSimulation.tsx` writing through the shared `operationalEventLedger.ts` instead of `nexusCore.ts`'s own `applyNexusEvent` — is **not done in this batch**. `nexusCore.ts` remains the sole authority over what QAPAS itself may do; this is a **documented, deliberate scope limit** (Section 9's "unless technically necessary and documented" clause), not an oversight. What *is* now shared live: the `nexusCase` React state itself was lifted from `QapasDirectSimulation.tsx` into `CardiologyOperations.tsx` and passed to both the pathway tab and the new Console, so the Console's Care Beam reflects the operator's real, live progress through the pathway — not a second, independently-drifting copy.

The 9 `NexusCaseState` values compress onto Care Beam's 7 example stages (Referral → Review → Acceptance → Coordination → Procedure → Handover → Closure) as follows (documented compression, not a 1:1 semantic claim):

| NexusCaseState reached | Care Beam stage |
|---|---|
| `referral-received` | Referral |
| `reviewed` | Review |
| `accepted` | Acceptance |
| `identity-linked`, `in-transport` | Coordination |
| `cath-lab-activated`, `arrived` | Procedure |
| `episode-recorded` | Handover |
| `quality-validated` | Closure |

## 11. FHIR R4/R5 boundary — DOCUMENTED

See `app/lib/cardiologyOperations/fhirMappingBoundary.ts`. No FHIR resource is constructed anywhere in this batch; the file is a static table of future mapping intent (`OperationalEncounter → Encounter`, `ClinicalWorkItem → Task`/`ServiceRequest`, `OperationalEvent → Provenance`/`AuditEvent`, `ProcedureState → Procedure`). `isDocumentationOnlyBoundary()` exists purely as a test-anchor guard.

## 12. SMART App Launch / CDS Hooks — future boundary (DOCUMENTED, no code)

No live EHR connectivity exists or is implemented in this batch. Recorded here only as a forward-compatibility note for a future batch:

- **SMART App Launch**: if Cliniverse ever launches inside an EHR context, `OperationalEncounter.encounterId` and `OwnershipAssignment.role` are the two internal identifiers a SMART launch context (`patient`, `encounter`, `fhirUser`) would need to resolve against — via the FHIR mapping boundary above, never by giving the internal model FHIR shape directly.
- **CDS Hooks**: any future hook service would consume `OperationalEvent`/`EscalationState` as its input context and must respect the same constraint already enforced by `operationalEscalation.ts` — a hook may surface a workflow fact (no owner, overdue item) but must never be the origin of a clinical-severity judgment unless a governed clinical source produced it.
- **Event/subscription integration**: `operationalEventLedger.ts`'s append-only shape is already subscription-friendly (a future subscriber would tail `sequence`), but no subscription mechanism, webhook, or external delivery exists in this batch.

## 21–24. Data safety, persistence, catalog, orbit

- No PHI, no real MRN, no real patient identifiers, no hospital data, no real communications, no order transmission, no autonomous escalation — unchanged from the v1 Epic's boundary, and structurally reinforced by `EscalationState.clinicalSeverityClaimed: false`.
- Persistence: this batch adds no new browser-storage schema and no Supabase schema. The Console reads the existing `useCardiologyOperations()` local-storage state (schema v1, unchanged) and the existing in-memory `NexusCase` — nothing new is persisted.
- Catalog/Orbit changes are recorded in `docs/CLINICAL_CONTENT_CATALOG_V1.md` / `docs/CLINICAL_ORBIT_V1.md`'s own drift notes at the next batch that updates those files; see the Batch 10 catalog rows added under `module: 'cardiology_ops_v2'` in `app/lib/contentCatalogSeed.ts` and the new Clinical Orbit edges in `app/lib/clinicalOrbitGraphSeed.ts`.
