# Clinical Content Catalog v1

Status: **SCHEMA DRAFTED — NOT APPLIED TO PRODUCTION OR STAGING FROM THIS SANDBOX.** See "Staging" below.

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

This sandbox has no Supabase credentials, CLI, or network access (verified directly at the start of this batch, consistent with every prior batch this v1.2 execution has run). The catalog migration, its rollback, and its catalog-check queries are drafted and ready in `supabase/drafts/`, following the exact same pattern Batch 3 used successfully — drafted here, applied to staging by a process with real credentials, then synced back. Until that happens, the app runs entirely on `contentCatalogSeed.ts`'s local fallback, which `app/lib/contentCatalog.ts` reports via `getContentCatalogSource()`.

## Readiness semantics, precisely

- `ready` + `visible` — a learner can reach and use this today. This is the only combination `getVisibleContent()` returns.
- `ready` + `hidden` — the content itself is complete and truthful, but nothing currently routes to it. ClinicalLibrary's 7 cases are the exact example: real, complete case content, zero live entry point.
- `review_required` — content exists but has an open clinical/privacy/rights review blocking exposure (e.g. the 5 deferred batch20 Echo candidates, `Doc Analyzer`'s missing PHI/DLP contract).
- `media_pending` — text/structure exists, no matching media has been sourced yet (e.g. 11 of the 20 batch20 ECG cases).
- `labs` — reachable only through a reviewer/labs-gated route, not the general learner path (e.g. the batch20 A4C orientation link via `/labs/echo-account-review`).

## What's deliberately excluded from the catalog

Content that exists only on an unmerged branch (`feature/megacode-v2`'s Megacode v2, `feature/echo-competency-engine-v1`'s 6 additional Echo pathology candidates beyond the batch20 set, `ops/platform-governance-v1`'s Pathway Replay) has no file in current HEAD to set `provenance_ref` to, so it isn't in the seed manifest. Cataloging it would mean inventing a provenance reference that doesn't exist in this checkout — exactly what this batch was told not to do. When any of that work is actually recovered into HEAD (see `CLINIVERSE_V1_2_EXECUTION_PLAN.md`'s later phases), add it to the seed then.
