# Clinical Content Catalog v1

Status: **STAGING VERIFIED (Batch 4, 71 rows) — LOCAL SEED NOW 72, RESEED NOT YET APPLIED — PRODUCTION NOT APPLIED.** Applied to Supabase staging (`xhwotblarwsxoanpiloe`) 2026-09-18; truth-match gate passed 71/71 against `app/lib/contentCatalogSeed.ts` as it stood at Batch 4's close, with zero drift at that time. Batch 5 (Clinical Orbit) additively appended one more item (`cha2ds2_vasc`) to the same seed manifest for its Atrial Fibrillation anchor — see "Known drift after Batch 5" below. Production (`zbiujqxinvcxvuviuenx`) is unchanged. See "Staging" below.

## Objective

Fix the ClinicalLibrary "500+ cases / 8 specialties" claims-integrity problem permanently by giving Cliniverse one canonical, governed index of what content exists, what's learner-visible, and what's still pending — instead of hardcoded numbers scattered across components.

## Architectural boundary — three layers, not one

**Content payload** — unchanged. Ward case text stays in `app/lib/ward/*`, ECG images stay in `public/ecg-cases/`, Echo assets stay in `app/lib/clinicalMedia/*` and Supabase's existing `cases`/`daily_cases`/etc. tables. This batch does not move any content body anywhere.

**Catalog** — `public.clinical_content_catalog` (Supabase, draft in `supabase/drafts/clinical_content_catalog_v1.sql`). A control-plane index only: one row per learner-facing content item, recording what it is, where it lives, and whether it's actually ready to show. It stores no content body — `provenance_ref` points back at the real source file/table instead of duplicating it.

**UI** — `app/lib/contentCatalog.ts`, a single typed adapter. Every learner-facing surface that needs a content count, a group count, or a filtered list must call this adapter — never query `clinical_content_catalog` directly and never hardcode a number.

Future migrations (content bodies moving server-side, a real CMS, etc.) change the catalog's `provenance_ref` and the adapter's Supabase query — they do not change the UI contract, because the UI never saw the raw shape to begin with.

**No second source of truth.** `app/lib/contentCatalogSeed.ts` is the only place content-inventory facts are declared. The Supabase seed script (`scripts/seed-clinical-content-catalog.mjs`) upserts from it; the adapter's local fallback (`app/lib/contentCatalog.ts`) reads the same file directly when the catalog table is unreachable. There is no independent count anywhere else — if a future component needs a number, it calls the adapter.

## What this batch found

**`ClinicalLibrary.tsx` — the component that displayed "500+ cases, 8 specialties" — is not reachable from the live app at all.** Confirmed by exhaustive grep: its only importer, `ToolsPage.tsx`, is itself imported by nothing, and no `/tools` route exists. `app/page.tsx` renders only `ReleaseApp`, which has no path to either file. This was true before this batch and remains true after it — fixing the component's own claims was still done (Section 7), because the component is real code that could be wired in later and should be truthful when it is, but the live App Store risk this component posed was already zero at the start of this batch, not eliminated by it.

A cross-surface audit for similar inflated claims found four more instances, all in the same dead legacy shell, none reachable from `ReleaseApp`: `app/components/UserGuide.tsx` ("1000+ doctors"), `app/components/FHIRIntegration.tsx` ("500+ EHR systems"), `app/components/PaymentModal.tsx` ("10,000+ doctors worldwide"), `app/components/MedicalTechnology.tsx` ("500+ spine and cardiac procedures"), plus `ToolsPage.tsx` itself ("CLINICAL LIBRARY · 500+ CASES"). **None were edited in this batch** — they're unreachable, out of this batch's stated scope (ClinicalLibrary specifically), and editing unrelated dead files risks touching copy this batch wasn't asked to change. Flagged here for a future decision: either delete the legacy shell entirely, or fix its claims if any part of it is ever reconnected.

The live, reachable surfaces this batch was asked to check — `AtlasReleaseCatalog.tsx`, `OnboardingScreens.tsx`, `PaywallSheet.tsx`, the Apple reviewer package, the native screenshot contracts — carry **no** inflated content-count claims. The claims-integrity problem was fully contained to already-dead code.

## Staging

This sandbox has no Supabase credentials, CLI, or network access — every part of this batch that touched a real database was drafted here and applied externally, then synced back, the same pattern Batch 3 used. That external apply is now complete:

**Applied to staging (`xhwotblarwsxoanpiloe`), 2026-09-18:**
- `clinical_content_catalog_v1.sql` — table created, RLS enabled, authenticated SELECT-only, anon denied, unique + three CHECK constraints present and confirmed enforced (duplicate logical item, invalid `access_tier`, invalid `visibility`, invalid `readiness` all rejected inside a throwaway transaction that was then rolled back).
- Seed: `scripts/seed-clinical-content-catalog.mjs` upserted the full manifest as it stood at Batch 4's close. Row count at that time: **71**.
- **Truth Match Gate: PASS (as of Batch 4, 2026-09-18).** Every field (`source_key`, `module`, `content_type`, `title`, `access_tier`, `visibility`, `readiness`, `route`, `provenance_ref`, `source_revision`, `sort_order`) compared exactly between `app/lib/contentCatalogSeed.ts` and the staging table at that time. 0 missing rows, 0 extra rows, 0 metadata mismatches across all 10 modules. This PASS result describes that point in time — it is not re-verified below.

### Known drift after Batch 5

Batch 5 (Clinical Orbit) added one new item to `app/lib/contentCatalogSeed.ts` — `cha2ds2_vasc` (`reference` module, `calculator` content type, `hidden`/`ready`) — as the real catalog anchor for Clinical Orbit's Atrial Fibrillation `measured_by` edge. This is an additive, in-scope catalog change (a real calculator confirmed present in `ClinicalCalculators.tsx`, same "component unreachable from ReleaseApp" pattern as the existing `clinical_library` items), not a correction to Batch 4's work.

As of this addition, the **local seed manifest has 72 items**, while **Supabase staging still has 71 rows** — the new item has not yet been seeded there (this sandbox has no Supabase credentials, per the standing constraint). This is expected, known drift, not a silent inconsistency: staging will read **71** via `app/lib/contentCatalog.ts` until an operator re-runs `scripts/seed-clinical-content-catalog.mjs` against staging, at which point it should read 72 and a fresh truth-match should be re-run and recorded here. Until that reseed happens, do not treat "71" or "72" as the current staging count without re-checking — treat this section as the live note of record instead.

**Not applied to production.** `zbiujqxinvcxvuviuenx` is unchanged — no migration, no seed, no write of any kind. Promotion requires the same explicit migration-window decision every other v1.2 production step does.

In staging (and, later, production once promoted), `app/lib/contentCatalog.ts` reads real rows from `public.clinical_content_catalog`. Everywhere else — including this sandbox — it transparently falls back to `contentCatalogSeed.ts`, reported via `getContentCatalogSource()`. Because the fallback is drawn from the exact file the seed script upserts, the two paths cannot silently disagree; the truth-match run above is the proof for this pass, not a standing guarantee that needs re-trusting blindly — re-run it after any future seed-manifest change.

**Current staging counts** (2026-09-18, as last truth-matched in Batch 4 — see "Known drift after Batch 5" above): 71 total, 34 visible+ready. By module: `academy` 1/0, `cardiology_ops` 1/1, `clinical_library` 7/0 (all 7 hidden — see below), `codelab` 13/13, `ecg` 7/7, `ecg_batch20` 11/0, `echo` 1/1, `echo_batch20` 9/0, `reference` 6/5, `ward` 15/7. By readiness+visibility: `ready+visible` 34, `ready+hidden` 7, `review_required+hidden` 14, `review_required+visible` 1, `media_pending+hidden` 14, `labs+hidden` 1. By access tier: `free` 69, `pro` 2.

**Local manifest counts after Batch 5** (not yet applied to staging): 72 total — the above plus `reference` module `cha2ds2_vasc` (`ready`/`hidden`/`free`), so `reference` becomes 7 items (6/5 → 7/5) and total ready+hidden becomes 8. These are manifest-only numbers until the reseed above happens.

**Echo scope note:** the single live, learner-ready Echo item (`echo-a4c-normal-cardionetworks-v1`) and the 9 `echo_batch20` candidates (5 `review_required` — dilated-lv, hypertrophic-phenotype, aortic-stenosis, mitral-regurgitation, pericardial-effusion; 3 `media_pending` — diastolic-function, rv-strain, echo-quality; 1 `labs` — a4c-orientation) remain exactly as truthfully classified in this batch — none visible. Expanding Echo readiness (Echo Intelligence Atlas, Study Model, Phenotype Graph, Competency Interactions, Comparison Mode) is explicitly out of scope here and reserved for a later phase.

## Readiness semantics, precisely

- `ready` + `visible` — a learner can reach and use this today. This is the only combination `getVisibleContent()` returns.
- `ready` + `hidden` — the content itself is complete and truthful, but nothing currently routes to it. ClinicalLibrary's 7 cases are the exact example: real, complete case content, zero live entry point.
- `review_required` — content exists but has an open clinical/privacy/rights review blocking exposure (e.g. the 5 deferred batch20 Echo candidates, `Doc Analyzer`'s missing PHI/DLP contract).
- `media_pending` — text/structure exists, no matching media has been sourced yet (e.g. 11 of the 20 batch20 ECG cases).
- `labs` — reachable only through a reviewer/labs-gated route, not the general learner path (e.g. the batch20 A4C orientation link via `/labs/echo-account-review`).

## What's deliberately excluded from the catalog

Content that exists only on an unmerged branch (`feature/megacode-v2`'s Megacode v2, `feature/echo-competency-engine-v1`'s 6 additional Echo pathology candidates beyond the batch20 set, `ops/platform-governance-v1`'s Pathway Replay) has no file in current HEAD to set `provenance_ref` to, so it isn't in the seed manifest. Cataloging it would mean inventing a provenance reference that doesn't exist in this checkout — exactly what this batch was told not to do. When any of that work is actually recovered into HEAD (see `CLINIVERSE_V1_2_EXECUTION_PLAN.md`'s later phases), add it to the seed then.
