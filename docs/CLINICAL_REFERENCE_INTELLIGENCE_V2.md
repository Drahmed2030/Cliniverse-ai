# Clinical Reference Intelligence v2

*Batch 8. Documents the actual implementation on `qa/case-batch20-cloud` as of this closeout — not a roadmap, not marketing copy. Every claim below is sourced from a specific committed file.*

---

## 1. Objective

Replace three superseded, architecturally unsafe reference components with a governed, evidence-first reference layer: drug identity → evidence → renal function → dosing rule → interaction → calculator → explanation → provenance → Clinical Orbit. Remains educational/reference software — never autonomous clinical decision authority.

---

## 2. Reconciliation — existing reference systems

| Component | Classification | Notes |
|---|---|---|
| `ClinicalCalculators.tsx` | **REWRITE CORE LOGIC** | Real audit findings below (Section 3). Superseded by `app/lib/clinicalReference/calculatorRegistry.ts` + `calculatorContract.ts`. Old component left as unreachable dead code. |
| `RenalDosingAI.tsx` | **REMOVE FROM LIVE PATH** (architecture) / **REUSE** (content) | Called `https://api.anthropic.com/v1/messages` directly from the client with no auth header (would 401). The 8-drug dosing table itself was reasonable — reused as the seed for `renalDosingRules.ts`, LLM call removed entirely. |
| `DrugInteractionChecker.tsx` | **REMOVE FROM LIVE PATH** | Same broken/forbidden client-side Anthropic call pattern as above, for interaction severity. Dead code, not reused. |
| `DrugInteractionAI.tsx` | **REMOVE FROM LIVE PATH** | Correctly server-proxied via `/api/generate-case`, but still asks an LLM to invent interaction severity/mechanism for arbitrary pairs — forbidden by this batch's contract regardless of proxy correctness. Dead code, not reused. |
| `ClinicalStrip.tsx`'s `DrugInteractionCard` | **REUSE** (content, restructured) | A hardcoded, 9-pair interaction table — the most clinically sound of the three interaction variants. Reused as the seed for `drugInteractionRules.ts`, restructured with rxcui identity, symmetric lookup, and a controlled severity vocabulary. |
| `/api/fda` (openFDA) | **REUSE AS-IS** | Correctly implemented, unchanged. |
| `/api/rxnorm` | **REWRITE CORE LOGIC** | **Real bug found**: despite its "RxNorm Lookup" catalog title, this route actually called openFDA + PubMed — duplicating `/api/fda`'s logic — and never touched RxNorm/RxNav at all. Rewritten to a real RxNav-backed identity adapter. |
| `/api/who`, `/api/who-meds`, `/api/pubmed`, `/api/clinical-trials` | **REUSE AS-IS** | Unchanged, already governed and catalogued. |
| Doc Analyzer (`/api/analyze-doc`, `DocAnalyzer.tsx`) | **GOVERNED ONLY — unchanged** | Already `review_required` in the catalog pending a PHI/DLP governance decision; left exactly as-is (Section 17). |
| Existing catalog reference entries | **EXTENDED** | The pre-existing `cha2ds2_vasc` row (Batch 5) is corrected, not replaced — see Section 3. |
| Clinical Orbit reference nodes | **EXTENDED** | The pre-existing `condition:atrial_fibrillation → measured_by → cha2ds2_vasc` proof edge is updated, not replaced. |
| Older recoverable reference branch code | **NONE FOUND** | No other branch was found carrying a more complete/safe reference architecture than what's described above. |

No second reference architecture was created — every new file lives under one new namespace, `app/lib/clinicalReference/`.

---

## 3. Critical clinical audit findings

Real, checkable bugs found in the superseded `ClinicalCalculators.tsx` and `/api/rxnorm/route.ts` — not stylistic nitpicks:

1. **CHA2DS2-VASc age double-count.** Age 65-74 and age ≥75 were two *independent* booleans, both togglable simultaneously (impossible in reality), inflating the max score to 10 instead of the correct 9. Fixed: age is now one mutually-exclusive select with three options, each declaring its own points — structurally impossible to double-count (`calculatorRegistry.ts`, tested).
2. **CHA2DS2-VASc / CHA2DS2-VA positioning.** The 2024 ESC AF guideline treats female sex as a risk-*modifier*, not an independently scored criterion, for anticoagulation-initiation decisions, favoring the sex-neutral CHA2DS2-VA score for that decision. Both variants are now registered explicitly, with a `positioningNote` making the relationship visible rather than silently picking one.
3. **eGFR mislabeled as CKD-EPI.** The formula actually implemented — `186 × Scr^-1.154 × Age^-0.203 × (0.742 if female)` — is the 2006 4-variable **MDRD** equation, not CKD-EPI, despite the component's own "Renal Function Assessment (CKD-EPI)" label. Replaced with the real CKD-EPI 2021 race-free equation (`renalFunction.ts`), verified by test to diverge numerically from the old MDRD-mislabeled formula for the same inputs.
4. **qSOFA command language.** "Activate sepsis protocol immediately" at score ≥2 overstates qSOFA's actual role (Sepsis-3, Singer et al. 2016): a bedside prompt for further evaluation, not a protocol trigger, and known to have limited standalone sensitivity. Corrected to "warrants further assessment for organ dysfunction/sepsis."
5. **`/api/rxnorm` mislabeling.** Despite its catalog title, this route called openFDA + PubMed — a near-duplicate of `/api/fda` — and never called RxNorm/RxNav. Rewritten to a real, live-verified RxNav adapter.
6. **Unsourced marketing copy.** "Updated with 2026 Guidelines" and "Based on validated clinical guidelines • 2026" carried no citation or date basis. Removed; every interpretation band now carries its own `sourceRefs`.

TIMI, Wells PE, HEART, and CURB-65 formulas and cutoffs were checked against their original derivation papers and found structurally consistent with those papers' published thresholds; their percentages are now attributed to specific, dated citations instead of presented as unsourced numbers.

---

## 4. Calculator registry

`app/lib/clinicalReference/calculatorContract.ts` + `calculatorRegistry.ts`. Separates concern A (deterministic scoring — `scoreClinicalCalculator`, pure, no clinical judgment) from B/C (interpretation bands and management guidance, each carrying its own `sourceRefs`, phrased as reference guidance rather than a command). Seven calculators registered: CHA2DS2-VASc, CHA2DS2-VA, TIMI (NSTEMI/UA), Wells PE, HEART, CURB-65, qSOFA. eGFR/CKD-staging deliberately does **not** live here — see Section 5. Every calculator is `reviewStatus: 'pending_clinical_review'` / `learnerReadiness: 'review_required'` — corrected math and cited sources, but not independently re-verified by a licensed clinical reviewer in this batch.

---

## 5. Renal function engine

`app/lib/clinicalReference/renalFunction.ts`. Two separate, type-distinct concepts, never silently interchanged:

- **`calculateEgfrCkdEpi2021`** — CKD-EPI 2021 race-free creatinine equation, normalized mL/min/1.73m², kidney-function/CKD-staging context. Source: Inker LA et al. NEJM 2021;385(19):1737-1749.
- **`calculateCreatinineClearanceCockcroftGault`** — Cockcroft-Gault, mL/min (not BSA-normalized), dosing-oriented context, with an explicit `weightBasis` (`actual`/`ideal`/`adjusted`) the caller must declare. Source: Cockcroft DW, Gault MH. Nephron 1976;16(1):31-41.

Every `RenalDoseRule` (Section 7) declares its own `renalFunctionBasis` (`'egfr' | 'cockcroft_gault_crcl' | 'label_specific' | 'none'`); the current 8-drug seed uses `'egfr'`, matching the original component's eGFR-slider input model.

---

## 6. Drug identity layer

`app/lib/clinicalReference/drugIdentity.ts` + rewritten `app/api/rxnorm/route.ts`. RxNorm (via NLM's public RxNav REST API, no key required) is the canonical identity adapter — `rxcui` is the identity key everywhere in this batch, never a display name. A governed, 12-drug offline seed (`GOVERNED_SEED_DRUG_IDENTITIES`) backs the interaction/dosing registries so they remain testable without live network access; every `rxcui` in that seed was verified live against RxNav during implementation, not recalled from memory — several initially-recalled values were wrong and were corrected before commit (documented in the file's own header). A stale/unknown name fails safe (`found: false`), never fabricating an identity.

---

## 7. Drug label evidence layer

New `app/api/dailymed/route.ts` (real DailyMed/SPL REST API, no scraping) + `app/lib/clinicalReference/drugLabelEvidence.ts`. The live adapter returns only identity/version/link metadata (safe to show unreviewed). Narrative label sections (`dosageSection`, `renalImpairmentSection`, etc.) come only from a small, human-authored, `pending_clinical_review` seed — never scraped or LLM-summarized from live label text, and never large copied protected text.

---

## 8. Drug interaction engine

`app/lib/clinicalReference/drugInteractionRules.ts`. Replaces all three superseded variants (Section 2). Clinical truth comes only from this hand-authored, rxcui-keyed registry — never a client-side or server-side LLM call. Controlled severity vocabulary (`informational | caution | major | contraindicated`); every rule requires `sourceRefs`; symmetric pair lookup (`findDrugInteractionRule`) makes drug order irrelevant; duplicate-pair prevention is enforced by `validateDrugInteractionRules`. Nine pairs seeded from `ClinicalStrip.tsx`'s existing table, all `pending_clinical_review`. An LLM may in a future batch *explain* an already-verified rule in simpler language — it may never define one.

---

## 9. Renal dosing engine

`app/lib/clinicalReference/renalDosingRules.ts`. Eight governed drugs (vancomycin, gentamicin, metformin, enoxaparin, amoxicillin-clavulanate, digoxin, ramipril, gabapentin), each with `renalFunctionBasis`, per-threshold dose/frequency text, and `sourceRefs`. No patient-specific prescription output — UI and rule text consistently say "Reference dosing information," never "Recommended dose for this patient" (verified by test). `resolveRenalDoseThreshold` throws rather than silently defaulting when no threshold covers a given eGFR.

---

## 10. Reference evidence graph

`app/lib/clinicalReference/referenceGraph.ts`. A typed relation layer (`drug → label → renal_dose_rule → interaction_rule → calculator → condition → evidence_source`), deliberately separate from Clinical Orbit's own graph — this is the fine-grained reference-domain layer that feeds a small, curated subset of high-quality links into Clinical Orbit (Section 13). Every relation requires a `provenanceRef`.

---

## 11. Search-first reference workspace

`app/labs/clinical-reference/` (`page.tsx`, `ClinicalReferenceWorkspace.tsx`, `clinical-reference.module.css`). One workspace: a search field groups results by kind (Calculators, Drugs), progressive disclosure into a calculator-detail view (interactive scoring form) or drug-detail view (identity, governed interactions, renal dosing, label evidence). No separate giant dashboards. Reached from **Explore → "Clinical Reference"** — no navigation redesign, no duplicate reference surface.

---

## 12. Mobile UX

Matches the established dark-studio CSS-module pattern (`--ref-*` custom properties, same convention as Echo Preview's `--media-*` and Pathway Replay's `--replay-*`). Swipe via framer-motion `drag` on the related-interactions rail, gated off under `prefers-reduced-motion`; keyboard-equivalent Previous/Next buttons drive identical navigation; 44px minimum touch targets; responsive breakpoints at 760px/430px; `width: min(1100px, 100%)` avoids fixed-width overflow.

---

## 13. Provenance-first

Every calculator and drug result renders a `ProvenanceCard`: source, review status, last reviewed, intended use — no exceptions, no "Evidence-based" badge without a real citation attached.

---

## 14. Clinical Orbit integration

Additive only. The pre-existing `condition:atrial_fibrillation → measured_by → cha2ds2_vasc` edge's `provenanceRef` is corrected (it pointed at the now-superseded buggy component); a new `cha2ds2_va` calculator node/edge is added; and `condition:heart_failure → related_to →` the aggregate renal-dosing-reference node is added (digoxin, a heart-failure-relevant drug, is in that reference set). All three edges stay `pending_review`, matching the catalog's honest `review_required` readiness. **Severe Hyperkalemia → potassium/drug reference** was deliberately *not* added — no real potassium-specific drug content exists in this batch's registries, and this batch does not inflate the graph to fill space. The curated-seed ceiling was deliberately reconciled from ≤24 nodes/≤20 edges (Batch 6/7) to **≤26/≤22** for these two genuine additions; the graph now sits exactly at that ceiling (26/22).

---

## 15. Catalog truth

Six new differentiated `content_type` values: `calculator` (6 new rows + 1 corrected), `drug_reference`, `renal_rule`, `interaction_rule`, `evidence_source`, `reference_workspace` — one aggregate row per registry (not one row per drug), so counts are never inflated. None are counted as a clinical `case`. Every new row declares `route: '/labs/clinical-reference'` and is genuinely reachable there. All are `visibility: 'visible'` + `readiness: 'review_required'` — matching the pre-existing `doc_analyzer` precedent: the tool is real and reachable, but content has not had a fresh human clinical-review pass, so it correctly does not surface via `isAvailable()`/default learner-facing queries yet.

---

## 16. Doc Analyzer boundary

Unchanged. `doc_analyzer`'s catalog row remains `visibility: 'visible'`, `readiness: 'review_required'`, provenance still citing its unresolved PHI/DLP contract. No file under `app/api/analyze-doc/` or `app/components/DocAnalyzer.tsx` was touched by this batch.

---

## 17. Security / privacy

No PHI. No user medication list persistence — the workspace holds only ephemeral React state per calculation/search, nothing written to storage. No medication-history storage. No clinical-recommendation profile. No client-side vendor API secret — RxNorm and DailyMed are public NIH APIs requiring no key, and both are still proxied server-side (`/api/rxnorm`, `/api/dailymed`) rather than called from the client, consistent with every other external adapter in this repo.

---

## 18. Supabase

**No new schema.** Every registry (calculators, renal function, drug identity, label evidence, interactions, dosing, reference graph) lives as versioned TypeScript, the same pattern established in Batches 6-7 — reusing the existing `clinical_content_catalog` and Clinical Orbit graph tables rather than introducing new ones. Nothing was drafted or applied to staging or production.

---

## 19. Future FHIR / CQL compatibility boundary (documentation only)

No FHIR server, CDS Hooks service, or CQL runtime exists or is planned for this batch. This section documents how the contracts above *could* map to FHIR/CQL concepts later, so a future batch has a clean target rather than an invented one:

| This batch's contract | Future FHIR/CQL mapping target |
|---|---|
| `DrugIdentity` (`drugIdentity.ts`) | `Medication` / `MedicationKnowledge` (RxNorm `rxcui` already aligns with FHIR's preferred RxNorm coding for `Medication.code`) |
| `DrugLabelEvidence` (`drugLabelEvidence.ts`) | `MedicationKnowledge.monograph`, `ClinicalUseDefinition` (dosing/contraindication/interaction sub-resources) |
| `RenalDoseRule` / `DrugInteractionRule` | `ClinicalUseDefinition` (type `indication`/`contraindication`/`interaction`/`dosage`), potentially expressed as `PlanDefinition` + `Library` (CQL) rules in a future governed rules-engine batch |
| `ClinicalCalculatorDefinition` result | `Observation` (the computed score) + `RiskAssessment` (the interpretation band) |
| eGFR / CrCl results | `Observation` with LOINC codes for eGFR (e.g. 62238-1 family) and creatinine clearance |
| `ReferenceRelation` graph | Informal precursor to CQL `Library`/`PlanDefinition` rule logic — today expressed as plain TypeScript relations, not executable CQL |

No implementation work follows from this table in this batch — it exists solely so contract shapes chosen now don't have to be redesigned later.

---

## 20. What is NOT implemented

- No fresh human clinical review has occurred for any calculator, interaction rule, or dosing rule in this batch — all remain `pending_clinical_review` / `review_required` by design.
- `DrugLabelEvidence`'s narrative sections are seeded for only 2 of the 12 governed drugs (metformin, warfarin) — the rest have live DailyMed identity/version lookup only, no narrative summary yet.
- No FHIR server, CDS Hooks, or CQL runtime — architecture-only mapping notes (Section 19).
- `RenalDosingAI.tsx`, `DrugInteractionChecker.tsx`, and `DrugInteractionAI.tsx` still exist as unreachable dead code (not deleted) — a future hygiene batch could remove them along with their `_theme_backups/` duplicates.
- `Severe Hyperkalemia → potassium/drug reference` was deliberately deferred — no real content exists for it yet (Section 14).
