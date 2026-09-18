# Clinical Orbit v1 — Knowledge Graph Foundation

Status: **BATCH 5 STAGING: VERIFIED.** Applied to Supabase staging (`xhwotblarwsxoanpiloe`) 2026-09-18. Catalog: **72 rows** (truth-matched against `app/lib/contentCatalogSeed.ts`, including the new `cha2ds2_vasc` item). Graph: **17 nodes / 12 edges** (matching `CLINICAL_ORBIT_NODE_SEED`/`CLINICAL_ORBIT_EDGE_SEED` identities, content references, source/target/relation/evidence/provenance values exactly). Security: authenticated SELECT-only, anon denied, client writes denied. Legacy public policies (`"public read nodes"`, `"public read edges"`, pre-dating Batch 5) were **found during live staging verification, removed, and the migration reconciled to drop them deterministically on any future apply** — see "Staging" below. **Production Supabase is unchanged** — no migration, no seed, no write of any kind.

## Objective

Give Cliniverse an entity-centered way to explore how clinical concepts (a condition, a finding, a drug) connect to real, governed Cliniverse content (a Ward case, an ECG case, a Code Lab lesson) — **Clinical Orbit**: tap a concept, see its immediate neighbors, tap a neighbor to recenter. Not a generic force-directed graph page, and not an attempt at a medical ontology — a small, curated, progressively-disclosed exploration surface over content that already exists and is already governed by Batch 4's catalog.

## Section 1 — Reconciliation: one graph system, not two

Before writing anything, this batch inspected every existing graph-shaped surface in the repo:

- **`public.kg_nodes` / `public.kg_edges`** — exist in staging today, exactly as given (`id bigint`, `node_type text`, `label text`, `normalized_code text`, `document_id bigint`, `metadata jsonb`, `created_at`; and `id bigint`, `source_node_id`, `target_node_id`, `relationship text`, `confidence real`, `created_at`). Both are **empty** and have **zero application-code references** anywhere in the repo — confirmed by exhaustive grep. Genuinely available for reuse as-is.
- **`app/api/knowledge-graph/*`, `app/lib/embeddings.ts`, `KnowledgeMatchCard.tsx`, `clinical_case_embeddings`, `clinical_documents`** — an entirely separate system: pgvector similarity search over document embeddings, gated by `RELEASE_ENABLE_KNOWLEDGE_MATCH`. No node/edge model, no overlap with `kg_nodes`/`kg_edges`. Left untouched.
- **`supabase/drafts/deferred_capabilities_safe_hold.sql`** — a never-confirmed-applied draft that would have locked `kg_nodes`/`kg_edges` (among 11 other tables) to service_role-only, declaring them out of scope for v1. Batch 5 deliberately reverses that intent for these two tables only, since Clinical Orbit needs authenticated learners to read graph data. The new migration is written to produce the correct end state (RLS on, authenticated SELECT-only, anon denied) regardless of whether that safe-hold draft was ever separately applied — see the migration's own header comment.

**Conclusion: reuse `kg_nodes`/`kg_edges` via additive `ALTER TABLE`, not a new schema.** No structural reason was found to replace them — they already have the right shape (typed node, typed edge with confidence, jsonb metadata for extensibility) for a small, curated graph.

| Existing piece | Disposition |
|---|---|
| `kg_nodes` / `kg_edges` | Reused, additively extended (`content_catalog_id`, `provenance_ref`, `evidence_status`, CHECK constraints, unique indexes) |
| `/api/knowledge-graph/*` vector-match system | Untouched — separate system, no conflict |
| `deferred_capabilities_safe_hold.sql`'s kg lockdown intent | Explicitly reconciled/overridden for these 2 tables only, documented in the new migration |

## Section 2 — Catalog → Graph contract

Every graph node that represents app content carries a `catalogRef: { module, contentType, sourceKey }` pointing at a real row in Batch 4's `clinical_content_catalog` (via `content_catalog_id` once seeded; resolved by `(module, content_type, source_key)` identity in the local seed). Concept nodes (`condition`, `finding`, etc.) have no `catalogRef` — they represent a clinical idea, not a piece of app content, and are always available.

- **Duplicate mapping prevented**: `kg_nodes_content_catalog_id_unique` (partial unique index, DB-level) + a data test asserting the seed manifest itself has no duplicate `(module, content_type, source_key)` mapped to two nodes.
- **Hidden/unready content never returned to learners**: `isNodeAvailable()` in `clinicalOrbitGraphQueries.ts` resolves a content node's `catalogRef` against the catalog and applies the exact same `isAvailable()` gate Batch 4 already uses (`visibility === 'visible' && readiness === 'ready'`) — reused, not reimplemented. A dangling `catalogRef` (can't be resolved at all) fails closed, even in reviewer scope.
- **Provenance preserved**: every edge carries a required `provenanceRef` naming a real repo file or catalog `provenance_ref` — never fabricated.
- **No PHI / user-owned data**: the graph only ever describes catalog content and clinical concepts; nothing in `kg_nodes`/`kg_edges` references a user, account, or session.

## Section 3 & 4 — Node and edge vocabulary

Controlled, small, not a medical ontology (`app/lib/clinicalOrbitGraphModel.ts`):

- **Node types (10)**: `condition, finding, investigation, treatment, drug, guideline, calculator, content, procedure, anatomy`
- **Relations (9)**: `related_to, demonstrates, diagnosed_by, treated_by, measured_by, supported_by, prerequisite_for, next_learning_step, compares_with`

Both are enforced twice — a TypeScript `as const` union with a type guard, and a Postgres `CHECK` constraint in the migration, so the constraint can't drift from the app's own vocabulary. `normalized_code` is left unset on every seed node; no SNOMED/LOINC/RxNorm code has been verified for any of them, so none was invented.

## Section 5 — Initial seed: 5 anchors, not all 72 catalog items

`app/lib/clinicalOrbitGraphSeed.ts` — **17 nodes** (5 condition anchors + 12 content nodes), **12 edges**. The 5 anchors are exactly the recommended set: Anterior STEMI/ACS, Atrial Fibrillation, Heart Failure, Severe Hyperkalemia, Cardiac Arrest/ACLS.

Every edge is grounded in either a real, ready+visible catalog item (`evidenceStatus: 'reviewed'`, provenance pointing at the actual source file) or an honest admission that the connection exists but the target isn't learner-visible yet (`evidenceStatus: 'pending_review'`). Two edges are **deliberately** left pointing at hidden content — the batch20 Anterior STEMI ECG case (`media_pending`) and the CHA₂DS₂-VASc calculator (real logic in `ClinicalCalculators.tsx`, but that component has no importer and is unreachable from `ReleaseApp`, same as Batch 4's `ClinicalLibrary` finding) — specifically so the hidden-content filtering requirement is proven against real data, not only synthetic test fixtures. The Heart Failure anchor's two known items are *both* currently hidden; rather than fabricate a third, visible connection to make the anchor look more complete, it's represented honestly as an anchor with no visible content yet.

Seeded to Supabase staging 2026-09-18 (`cha2ds2_vasc` catalog item + all 17 graph nodes/12 edges) — see "Staging" below for the verified result.

## Section 6 — Staging migration

`supabase/drafts/clinical_orbit_graph_v1.sql` (forward) / `.rollback.sql` / `_v1_catalog_check.sql` (read-only verification), following the same three-file pattern as every prior batch's Supabase work.

- Additive only: `ALTER TABLE` on the existing, empty `kg_nodes`/`kg_edges` — no `CREATE TABLE`, no data-loss risk.
- Adds `kg_nodes.content_catalog_id` (FK to `clinical_content_catalog`, nullable, `on delete set null`), a unique index on it, a unique index on `metadata->>'node_key'`, and a `node_type` CHECK.
- Adds `kg_edges.provenance_ref`, `kg_edges.evidence_status` (+ CHECK), a `relationship` CHECK, and a uniqueness constraint on `(source_node_id, target_node_id, relationship)`.
- RLS: enabled on both tables; `authenticated` gets SELECT only (one policy per table); `anon` gets nothing; no INSERT/UPDATE/DELETE policy for anyone — service_role manages the table via its default RLS-bypass, undisturbed, same as `clinical_content_catalog`.
- Self-verifying: a `do $orbit_assertions$` block checks RLS is on, authenticated SELECT exists, authenticated has no write privilege, anon has no SELECT, and — after the staging-verification reconciliation below — that the policy catalog itself converges to exactly the one intended SELECT policy per table with no legacy policy surviving — `raise exception` on any failure, so a bad apply can't silently succeed.

**Applied to staging (`xhwotblarwsxoanpiloe`), 2026-09-18. Not applied to production** — `zbiujqxinvcxvuviuenx` is unchanged. `scripts/seed-clinical-orbit-graph.mjs` was then run against staging (validated the manifest for duplicate node_keys/dangling edges before writing, resolved each node's `catalogRef` to a real `clinical_content_catalog.id`, read back every write per this repo's own RLS lesson).

### Legacy PUBLIC policies found during live staging verification

Live inspection of staging during the apply found two policies pre-dating Batch 5: **`"public read nodes"`** on `kg_nodes` and **`"public read edges"`** on `kg_edges`. This migration's `revoke all privileges ... from anon, authenticated` already meant these policies granted no *effective* access (a policy without a backing table privilege is inert), so no unintended read access actually occurred at any point. However, leaving them in the policy catalog was not acceptable: it left more than the one intended policy per table, and a future privilege change could have made them live again without anyone re-auditing policies at that time.

They were dropped externally on staging, and `clinical_orbit_graph_v1.sql` was reconciled (this same apply) to `drop policy if exists "public read nodes"` / `"public read edges"` explicitly and unconditionally, **before** creating the intended `..._select_authenticated` policies — so privileges and the policy catalog both converge to the same deterministic state on any future apply, not just on this one. The self-verification block now also asserts the exact policy count (1 per table) and the specific absence of both legacy policy names, rather than checking privileges alone. The rollback deliberately does **not** recreate the legacy policies — there is no documented, approved reason to restore a PUBLIC-role read policy, and the safest rollback target is "no client policy at all," not a guess at pre-Batch-5 state.

**Verified staging security state (2026-09-18):**

| | `kg_nodes` | `kg_edges` |
|---|---|---|
| authenticated SELECT | TRUE | TRUE |
| authenticated INSERT/UPDATE/DELETE | FALSE | FALSE |
| anon SELECT | FALSE | FALSE |
| policies present | `kg_nodes_select_authenticated` only | `kg_edges_select_authenticated` only |

**Verified staging row counts (2026-09-18):** `kg_nodes` = 17, `kg_edges` = 12 — exact match to `CLINICAL_ORBIT_NODE_SEED`/`CLINICAL_ORBIT_EDGE_SEED`. Catalog `clinical_content_catalog` = 72 rows, including the new `cha2ds2_vasc` item — exact match to `app/lib/contentCatalogSeed.ts`.

## Section 7 — Query adapter

`app/lib/clinicalOrbit.ts` is the single typed boundary. No component queries `kg_nodes`/`kg_edges` directly. It exposes `getOrbitCenter`, `getOrbitNeighbors`, `getRelatedContent`, `getOrbitPath`, `getOrbitBreadcrumbs`, `resolveOrbitContentRoute` — all async, all Supabase-or-local-fallback (`getClinicalOrbitSource()` reports which). The pure logic underneath (`clinicalOrbitGraphQueries.ts`) is what's actually unit-tested, mirroring the `contentCatalog.ts` / `contentCatalogQueries.ts` split from Batch 4:

- Depth is hardcoded to 1 hop — `getOrbitNeighbors` has no recursion path.
- Hard-capped at `maxNeighbors` (default 6) — the whole graph is never sent to the client.
- Every neighbor is filtered through `isNodeAvailable` (catalog readiness/visibility) **and** the edge's own `evidenceStatus !== 'reviewed'` check — a relationship can be excluded even when its target node is otherwise available, because review status describes the *relationship*, not just the target.
- Deterministic ordering: relation, then label, then node key — never insertion order.
- `getOrbitPath`/`getOrbitBreadcrumbs` fail closed: a navigation stack stops at the first unavailable node rather than silently skipping past it.

## Section 8 & 9 — UI and rendering technology

`app/components/release/ClinicalOrbit.tsx`, mounted at `/labs/clinical-orbit` (`app/labs/clinical-orbit/page.tsx`) and linked from `AtlasReleaseCatalog.tsx` as a new "Clinical Orbit" card, same pattern as the existing ECG Challenge / Echo Preview cards.

**Technology decision: framer-motion, not React Flow or any new dependency.** `framer-motion` (`^13.1.0`) is already a repo dependency. Clinical Orbit v1's graph is a small, fixed-size radial layout — one center node plus at most 6 neighbors — not a general force-directed or large graph, so a dedicated graph-rendering library (React Flow, Sigma, WebGL) would add real dependency weight for a problem this repo's existing tooling already solves. The radial layout is plain trigonometry (`neighborPosition()`) over absolutely-positioned buttons; `framer-motion`'s `motion.div` with `drag="x"` handles the swipe-to-cycle-siblings gesture on the focus card, and `useReducedMotion()` disables that drag entirely when the user has requested reduced motion, rather than just shortening an animation. No Tailwind/shadcn was introduced; all styling is inline `style` objects using the existing `var(--cv-*)` design tokens, matching every other component in the repo.

- **Desktop/iPad**: focused center node + up to 6 neighbor buttons arranged radially, a focus card/inspector below.
- **iPhone**: same layout, graph region above, focus card below; horizontal swipe on the focus card cycles siblings; breadcrumb trail (or Backspace/Escape) returns to a parent — no stack of Back buttons.
- **Gestures are never the only way to navigate**: every action reachable by drag (cycle siblings) or tap (focus/open) is also reachable by keyboard — `ArrowLeft`/`ArrowRight` cycle, `Enter`/`Space` focuses, `Backspace`/`Escape` pops the breadcrumb.
- **Accessibility**: every interactive graph element is a real `<button>`/`<a>` with an `aria-label` combining relation + label (never a bare clickable `div`); focus-visible styling inherited from the existing design system; `useReducedMotion()` gates the drag gesture; minimum 44px touch targets throughout, matching the rest of the app.

## Section 10 — Navigation history

An internal `focusStack: string[]` of node keys is the navigation history — pushed on focus, truncated on breadcrumb click (`jumpTo`), popped on Backspace/Escape. Back returns to a prior graph focus state, not a full app/page reload. No URL/deep-link state yet — v1 keeps this as in-memory component state, per the instruction to prefer internal focus history and only add URL state once it's proven stable and useful.

## Section 11 — Content routing

`resolveContentRoute()` (pure) / `resolveOrbitContentRoute()` (adapter) return the catalog item's real route — e.g. `/labs/ecg-challenge`, `/labs/echo-preview` — and explicitly return `null` for any route starting with `/api/`, so an API-only endpoint can never be surfaced as a learner-facing link. A node whose route can't be resolved is simply not given an "Open" action.

## Section 12 — Evidence and provenance

Every edge in the seed carries `provenanceRef` (a real file path or documented source) and `evidenceStatus` (`reviewed` / `pending_review` / `unverified`). The focus card's "Why connected?" toggle expands a panel showing exactly these two fields for the selected relationship — the UI never presents a connection as clinical authority without showing where it came from.

## Section 13 — Tests

`tests/clinical-orbit-graph-contract.test.mjs` — **36 tests**, all passing:

- **DATA**: catalog↔node link correctness, dangling-reference fail-closed behavior, duplicate-mapping prevention (seed + DB unique index), hidden/pending-review exclusion from default queries (proven against the two deliberately-hidden seed edges) and their presence in reviewer scope, 1-hop cap + `maxNeighbors` override, deterministic ordering, controlled node-type/relation vocabularies (app-level and migration CHECK constraints), required provenance + valid evidence status on every seed edge, path/breadcrumb fail-closed truncation, API-only route exclusion.
- **SECURITY** (static source-contract, same pattern as Batch 3/4 — no live Supabase in this sandbox): authenticated SELECT-only on both tables, anon denied, no write grant to authenticated, exactly one policy per table, no explicit grant/revoke SQL statement touching `service_role`, the migration's self-verifying assertion block and its reconciliation of the safe-hold draft, and that no unrelated table is touched.
- **UI** (static source-contract, not full interaction/Playwright tests — see "New blockers / honest scope" below): focus changes via component state rather than navigation, breadcrumb/back history present, swipe implemented via the existing framer-motion drag pattern, keyboard handlers present, reduced-motion gating present, mobile width constraint present, 44px touch targets, no bare clickable `div`s.
- **REGRESSION**: full suite (`npm test`) — **457/457 passing**, including the pre-existing Batch 4 catalog-contract tests, Atlas/Explore, auth, engagement, ECG, Ward, and Echo tests, none of which needed changes.

**One real bug was found and fixed while building this**: `app/lib/contentCatalog.ts`'s Supabase `.select(...)` clause never included `id`, which would have silently broken every graph→catalog join in live mode (the row would exist but never match). Fixed by adding `id` to the select clause and to the `CatalogItem`/seed-item types, and adding `getAllCatalogItems()` for the graph adapter to consume.

**A second, unrelated bug was found and fixed in this batch's own new code**: `clinicalOrbitGraphQueries.ts` imported `./contentCatalogQueries` without a `.ts` extension, which resolves fine inside Next.js's bundler but fails under Node's native TS-stripping test runner (the same class of issue noted for `app/lib/identity.ts` in Batch 2.5) — fixed by adding the extension, matching the precedent already set in `app/lib/engagement/client.ts`.

## Section 14 — What this batch deliberately did not do

No Echo DCM/HCM recovery work. No Batch 6. No large medical ontology ingestion — 10 node types and 9 relations only. No AI-generated relationships — every edge traces to a named repo file or documented source. No hidden/review_required/media_pending/labs content exposed outside reviewer scope. No production Supabase write. No deploy. No StoreKit change. No auth change. No full navigation redesign — Clinical Orbit is a new, additive `/labs/clinical-orbit` surface, not a rework of existing navigation.

**Honest scope note on UI testing**: Section 13's UI tests are static source-contract assertions (the same category Batch 3/4 used for anything touching Supabase), not executed browser/interaction tests — there is no headless browser or Playwright runner available in this sandbox. Manual verification in a real browser (tap-to-focus, swipe-to-cycle, keyboard nav, reduced-motion, mobile viewport width) is recommended before this prototype is promoted beyond `/labs/`.
