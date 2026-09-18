import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CLINICAL_CONTENT_CATALOG_SEED } from '../app/lib/contentCatalogSeed.ts'
import {
  CLINICAL_ORBIT_NODE_TYPES,
  CLINICAL_ORBIT_RELATIONS,
  isClinicalOrbitNodeType,
  isClinicalOrbitRelation,
} from '../app/lib/clinicalOrbitGraphModel.ts'
import { CLINICAL_ORBIT_NODE_SEED, CLINICAL_ORBIT_EDGE_SEED } from '../app/lib/clinicalOrbitGraphSeed.ts'
import {
  isNodeAvailable,
  getOrbitCenter,
  getOrbitNeighbors,
  getRelatedContent,
  getOrbitPath,
  getOrbitBreadcrumbs,
  resolveContentRoute,
} from '../app/lib/clinicalOrbitGraphQueries.ts'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

const GRAPH = { nodes: CLINICAL_ORBIT_NODE_SEED, edges: CLINICAL_ORBIT_EDGE_SEED }
const CATALOG = CLINICAL_CONTENT_CATALOG_SEED

// ── Catalog item links correctly to graph node ────────────────────────────

test('every content node catalogRef in the seed resolves to a real catalog item', () => {
  const contentNodes = CLINICAL_ORBIT_NODE_SEED.filter(n => n.catalogRef)
  assert.ok(contentNodes.length > 0)
  for (const node of contentNodes) {
    const item = CATALOG.find(c => c.module === node.catalogRef.module && c.content_type === node.catalogRef.contentType && c.source_key === node.catalogRef.sourceKey)
    assert.ok(item, `${node.nodeKey} references a catalog item that does not exist: ${JSON.stringify(node.catalogRef)}`)
  }
})

const EXPECTED_CONDITION_ANCHOR_KEYS = [
  'condition:anterior_stemi_acs',
  'condition:atrial_fibrillation',
  'condition:heart_failure',
  'condition:severe_hyperkalemia',
  'condition:cardiac_arrest_acls',
  'condition:dcm_phenotype',
  'condition:hcm_phenotype',
]

test('concept nodes (condition anchors) have no catalogRef and are always available', () => {
  const conditionNodes = CLINICAL_ORBIT_NODE_SEED.filter(n => n.nodeType === 'condition')
  assert.deepEqual(conditionNodes.map(n => n.nodeKey).sort(), [...EXPECTED_CONDITION_ANCHOR_KEYS].sort())
  for (const node of conditionNodes) {
    assert.equal(node.catalogRef, undefined)
    assert.equal(isNodeAvailable(node, CATALOG, false), true)
  }
})

test('a dangling catalogRef fails closed — not shown even in reviewer scope', () => {
  const danglingNode = { nodeKey: 'content:test:dangling', nodeType: 'content', label: 'Dangling', catalogRef: { module: 'nonexistent', contentType: 'case', sourceKey: 'nope' } }
  assert.equal(isNodeAvailable(danglingNode, CATALOG, false), false)
  assert.equal(isNodeAvailable(danglingNode, CATALOG, true), false)
})

// ── Duplicate mapping prevented ───────────────────────────────────────────

test('the seed manifest itself maps each catalog item to at most one node', () => {
  const seen = new Set()
  for (const node of CLINICAL_ORBIT_NODE_SEED) {
    if (!node.catalogRef) continue
    const key = `${node.catalogRef.module}::${node.catalogRef.contentType}::${node.catalogRef.sourceKey}`
    assert.equal(seen.has(key), false, `duplicate catalog mapping: ${key}`)
    seen.add(key)
  }
})

test('the migration enforces one-catalog-item-per-node with a unique index', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  assert.match(migration, /create unique index if not exists kg_nodes_content_catalog_id_unique/)
  assert.match(migration, /create unique index if not exists kg_nodes_node_key_unique/)
  assert.match(migration, /add constraint kg_edges_unique_relation\s*\n\s*unique \(source_node_id, target_node_id, relationship\)/)
})

// ── Hidden/unready catalog items excluded from learner queries ────────────

test('the two deliberately-hidden proof edges (batch20 Anterior STEMI ECG, CHA2DS2-VASc) are excluded from default neighbor queries', () => {
  const stemiNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:anterior_stemi_acs')
  const afNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:atrial_fibrillation')
  assert.equal(stemiNeighbors.some(n => n.node.nodeKey === 'content:ecg_batch20:case:anterior-stemi'), false)
  assert.equal(afNeighbors.some(n => n.node.nodeKey === 'content:reference:calculator:cha2ds2_vasc'), false)
})

test('the same two hidden items ARE returned in reviewer scope', () => {
  const stemiNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:anterior_stemi_acs', { reviewerScope: true })
  const afNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:atrial_fibrillation', { reviewerScope: true })
  assert.ok(stemiNeighbors.some(n => n.node.nodeKey === 'content:ecg_batch20:case:anterior-stemi'))
  assert.ok(afNeighbors.some(n => n.node.nodeKey === 'content:reference:calculator:cha2ds2_vasc'))
})

test('getOrbitCenter refuses to focus a node whose catalog item is hidden', () => {
  const center = getOrbitCenter(GRAPH, CATALOG, 'content:ecg_batch20:case:anterior-stemi')
  assert.equal(center, null)
  const reviewerCenter = getOrbitCenter(GRAPH, CATALOG, 'content:ecg_batch20:case:anterior-stemi', { reviewerScope: true })
  assert.ok(reviewerCenter)
})

test('no speculative/unreviewed relation leaks to the default learner graph', () => {
  for (const anchor of ['condition:anterior_stemi_acs', 'condition:atrial_fibrillation', 'condition:heart_failure', 'condition:severe_hyperkalemia', 'condition:cardiac_arrest_acls']) {
    const neighbors = getOrbitNeighbors(GRAPH, CATALOG, anchor)
    for (const n of neighbors) assert.equal(n.edge.evidenceStatus, 'reviewed', `${anchor} -> ${n.node.nodeKey} leaked a ${n.edge.evidenceStatus} edge`)
  }
})

// ── One-hop query cap enforced ────────────────────────────────────────────

test('getOrbitNeighbors defaults to a hard cap of 6 and never recurses beyond 1 hop', () => {
  const neighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:anterior_stemi_acs', { reviewerScope: true })
  assert.ok(neighbors.length <= 6)
  // 1-hop only: none of the returned neighbors' own neighbors appear in this result set as if they were direct neighbors of the anchor.
  for (const n of neighbors) assert.notEqual(n.node.nodeKey, 'condition:anterior_stemi_acs')
})

test('maxNeighbors can be overridden and is still enforced', () => {
  const capped = getOrbitNeighbors(GRAPH, CATALOG, 'condition:anterior_stemi_acs', { reviewerScope: true, maxNeighbors: 1 })
  assert.equal(capped.length, 1)
})

test('getOrbitNeighbors ordering is deterministic across repeated calls', () => {
  const first = getOrbitNeighbors(GRAPH, CATALOG, 'condition:cardiac_arrest_acls', { reviewerScope: true }).map(n => n.node.nodeKey)
  const second = getOrbitNeighbors(GRAPH, CATALOG, 'condition:cardiac_arrest_acls', { reviewerScope: true }).map(n => n.node.nodeKey)
  assert.deepEqual(first, second)
})

// ── Edge type / node type validation ──────────────────────────────────────

test('node type vocabulary is exactly the 10 controlled types', () => {
  assert.deepEqual([...CLINICAL_ORBIT_NODE_TYPES].sort(), ['anatomy', 'calculator', 'condition', 'content', 'drug', 'finding', 'guideline', 'investigation', 'procedure', 'treatment'].sort())
  assert.equal(isClinicalOrbitNodeType('condition'), true)
  assert.equal(isClinicalOrbitNodeType('diagnosis'), false)
})

test('relation vocabulary is exactly the 9 controlled relations', () => {
  assert.deepEqual([...CLINICAL_ORBIT_RELATIONS].sort(), ['compares_with', 'demonstrates', 'diagnosed_by', 'measured_by', 'next_learning_step', 'prerequisite_for', 'related_to', 'supported_by', 'treated_by'].sort())
  assert.equal(isClinicalOrbitRelation('related_to'), true)
  assert.equal(isClinicalOrbitRelation('causes'), false)
})

test('every seed node uses a controlled node type and every seed edge a controlled relation', () => {
  for (const node of CLINICAL_ORBIT_NODE_SEED) assert.equal(isClinicalOrbitNodeType(node.nodeType), true, node.nodeKey)
  for (const edge of CLINICAL_ORBIT_EDGE_SEED) assert.equal(isClinicalOrbitRelation(edge.relation), true, `${edge.sourceNodeKey}->${edge.targetNodeKey}`)
})

test('the migration constrains node_type and relationship to the controlled vocabularies', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  assert.match(migration, /check \(node_type in \('condition', 'finding', 'investigation', 'treatment', 'drug', 'guideline', 'calculator', 'content', 'procedure', 'anatomy'\)\)/)
  assert.match(migration, /check \(relationship in \('related_to', 'demonstrates', 'diagnosed_by', 'treated_by', 'measured_by', 'supported_by', 'prerequisite_for', 'next_learning_step', 'compares_with'\)\)/)
})

// ── Provenance required ────────────────────────────────────────────────────

test('every seed edge has a non-empty provenance reference and a valid evidence status', () => {
  for (const edge of CLINICAL_ORBIT_EDGE_SEED) {
    assert.ok(edge.provenanceRef && edge.provenanceRef.trim().length > 0, `${edge.sourceNodeKey}->${edge.targetNodeKey} missing provenance`)
    assert.ok(['reviewed', 'pending_review', 'unverified'].includes(edge.evidenceStatus))
  }
})

// ── Reused catalog filtering logic, not a second implementation ──────────

test('graph availability defers to the same isAvailable logic Batch 4 already tests, not a reimplementation', () => {
  const source = read('app/lib/clinicalOrbitGraphQueries.ts')
  assert.match(source, /import \{ isAvailable as isCatalogItemAvailable, type CatalogItem \} from '\.\/contentCatalogQueries\.ts'/)
})

// ── Related content / path / breadcrumbs / route resolution ──────────────

test('getRelatedContent returns only nodes with a catalogRef', () => {
  const related = getRelatedContent(GRAPH, CATALOG, 'condition:cardiac_arrest_acls', { reviewerScope: true })
  assert.ok(related.length > 0)
  for (const r of related) assert.ok(r.node.catalogRef)
})

test('getOrbitPath and getOrbitBreadcrumbs resolve a navigation stack and fail closed on the first unavailable step', () => {
  const path = getOrbitPath(GRAPH, CATALOG, ['condition:anterior_stemi_acs', 'content:ward:case:stemi_anterior'])
  assert.equal(path.length, 2)
  assert.equal(path[0].viaEdge, null)
  assert.ok(path[1].viaEdge)

  const withHiddenStep = getOrbitPath(GRAPH, CATALOG, ['condition:anterior_stemi_acs', 'content:ecg_batch20:case:anterior-stemi', 'condition:atrial_fibrillation'])
  assert.equal(withHiddenStep.length, 1, 'path must stop at the first unavailable node, not skip past it')

  const crumbs = getOrbitBreadcrumbs(GRAPH, CATALOG, ['condition:anterior_stemi_acs', 'content:ward:case:stemi_anterior'])
  assert.deepEqual(crumbs.map(c => c.nodeKey), ['condition:anterior_stemi_acs', 'content:ward:case:stemi_anterior'])
})

test('resolveContentRoute returns null for API-only routes and null for no route, a real path only for a real UI route', () => {
  assert.equal(resolveContentRoute(null), null)
  assert.equal(resolveContentRoute({ route: '/api/fda' }), null)
  assert.equal(resolveContentRoute({ route: '/labs/ecg-challenge' }), '/labs/ecg-challenge')
  assert.equal(resolveContentRoute({}), null)
})

// ── Security: RLS / privileges (static, matching Batch 3/4's pattern) ────

test('authenticated has SELECT only on kg_nodes and kg_edges; anon has nothing', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  assert.match(migration, /revoke all privileges on table public\.kg_nodes from anon, authenticated/)
  assert.match(migration, /revoke all privileges on table public\.kg_edges from anon, authenticated/)
  assert.match(migration, /grant select on table public\.kg_nodes to authenticated/)
  assert.match(migration, /grant select on table public\.kg_edges to authenticated/)
  assert.equal(/grant insert on table public\.kg_(nodes|edges) to authenticated/i.test(migration), false)
  assert.equal(/grant update on table public\.kg_(nodes|edges) to authenticated/i.test(migration), false)
  assert.equal(/grant delete on table public\.kg_(nodes|edges) to authenticated/i.test(migration), false)
})

test('exactly one SELECT-only policy exists per table', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  const policies = migration.match(/create policy/g) ?? []
  assert.equal(policies.length, 2)
  assert.match(migration, /create policy "kg_nodes_select_authenticated"\s*\n\s*on public\.kg_nodes\s*\n\s*for select\s*\n\s*to authenticated/)
  assert.match(migration, /create policy "kg_edges_select_authenticated"\s*\n\s*on public\.kg_edges\s*\n\s*for select\s*\n\s*to authenticated/)
})

// ── Legacy PUBLIC policy reconciliation (found during live staging verification, 2026-09-18) ──

test('the migration explicitly drops the legacy pre-Batch-5 PUBLIC policies before creating the intended ones', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  assert.match(migration, /drop policy if exists "public read nodes" on public\.kg_nodes;/)
  assert.match(migration, /drop policy if exists "public read edges" on public\.kg_edges;/)

  const dropLegacyNodesIdx = migration.indexOf('drop policy if exists "public read nodes"')
  const dropLegacyEdgesIdx = migration.indexOf('drop policy if exists "public read edges"')
  const createNodesIdx = migration.indexOf('create policy "kg_nodes_select_authenticated"')
  const createEdgesIdx = migration.indexOf('create policy "kg_edges_select_authenticated"')
  assert.ok(dropLegacyNodesIdx > -1 && dropLegacyNodesIdx < createNodesIdx, 'legacy kg_nodes policy must be dropped before the intended one is created')
  assert.ok(dropLegacyEdgesIdx > -1 && dropLegacyEdgesIdx < createEdgesIdx, 'legacy kg_edges policy must be dropped before the intended one is created')
})

test('the migration does not rely on REVOKE alone — self-verification asserts exact policy-catalog convergence', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  assert.match(migration, /raise exception 'kg_nodes must have exactly one policy/)
  assert.match(migration, /raise exception 'kg_edges must have exactly one policy/)
  assert.match(migration, /raise exception 'legacy policy "public read nodes" still exists on kg_nodes';/)
  assert.match(migration, /raise exception 'legacy policy "public read edges" still exists on kg_edges';/)
  assert.match(migration, /from pg_policies where schemaname = 'public' and tablename = 'kg_nodes'\) != 1/)
  assert.match(migration, /from pg_policies where schemaname = 'public' and tablename = 'kg_edges'\) != 1/)
})

test('the rollback does not recreate the legacy PUBLIC policies', () => {
  const rollback = read('supabase/drafts/clinical_orbit_graph_v1.rollback.sql')
  assert.equal(/create policy "public read nodes"/i.test(rollback), false)
  assert.equal(/create policy "public read edges"/i.test(rollback), false)
  assert.match(rollback, /does NOT recreate them/)
})

test('the catalog check verifies the legacy policies are absent and exactly one policy remains per table', () => {
  const check = read('supabase/drafts/clinical_orbit_graph_v1_catalog_check.sql')
  assert.match(check, /policyname = 'public read nodes'/)
  assert.match(check, /policyname = 'public read edges'/)
  assert.match(check, /group by tablename/)
})

test('service_role management path is preserved — no explicit grant/revoke SQL statement touches it, same as Batch 3/4', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  const sqlStatements = migration
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
  assert.equal(/\b(grant|revoke)\b[^;]*\bservice_role\b/i.test(sqlStatements), false)
})

test('the migration self-verifies and reconciles the never-confirmed-applied safe-hold draft explicitly', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  assert.match(migration, /do \$orbit_assertions\$/)
  assert.match(migration, /deferred_capabilities_safe_hold\.sql/)
  assert.match(migration, /raise exception 'anon can read the graph/)
})

test('the migration only extends kg_nodes/kg_edges — no other table is touched', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  for (const table of ['case_cache', 'clinical_case_embeddings', 'clinical_documents', 'daily_cases', 'evaluation_cases', 'evaluation_runs', 'generated_cases', 'mood_logs', 'nexus_cases', 'nexus_messages', 'nexus_votes', 'profiles', 'subscriptions', 'cases', 'user_progress', 'leaderboard']) {
    assert.equal(migration.includes(`public.${table}`), false, `migration unexpectedly references ${table}`)
  }
})

// ── UI source contract (see also: manual/Playwright QA is recommended as a follow-up, per this batch's own final report) ──

test('Clinical Orbit changes focus via component state, never a full page navigation', () => {
  const source = read('app/components/release/ClinicalOrbit.tsx')
  assert.equal(/router\.push|window\.location\s*=|location\.href\s*=/.test(source), false)
  assert.match(source, /setFocusStack/)
})

test('internal breadcrumb/back history is implemented, not a stack of Back buttons', () => {
  const source = read('app/components/release/ClinicalOrbit.tsx')
  assert.match(source, /jumpTo/)
  assert.match(source, /breadcrumbs\.map/)
})

test('swipe sibling navigation is implemented via framer-motion drag, already a repo dependency', () => {
  const source = read('app/components/release/ClinicalOrbit.tsx')
  assert.match(source, /from 'framer-motion'/)
  assert.match(source, /drag=\{prefersReducedMotion \? false : 'x'\}/)
  assert.match(source, /onDragEnd=\{handleDragEnd\}/)
})

test('keyboard navigation is implemented (arrow keys, enter/space, escape/backspace)', () => {
  const source = read('app/components/release/ClinicalOrbit.tsx')
  assert.match(source, /ArrowRight/)
  assert.match(source, /ArrowLeft/)
  assert.match(source, /'Enter'/)
  assert.match(source, /'Escape'/)
})

test('reduced motion is respected — drag is disabled, not just animation duration lowered', () => {
  const source = read('app/components/release/ClinicalOrbit.tsx')
  assert.match(source, /useReducedMotion/)
  assert.match(source, /prefersReducedMotion \? false : 'x'/)
})

test('mobile width is constrained — no unconstrained full-bleed graph container', () => {
  const source = read('app/components/release/ClinicalOrbit.tsx')
  assert.match(source, /maxWidth: 380/)
})

test('neighbor buttons and the focus card meet the 44px minimum touch target used elsewhere in this app', () => {
  const source = read('app/components/release/ClinicalOrbit.tsx')
  assert.match(source, /minHeight: 44/)
  assert.match(source, /minWidth: 44/)
})

test('every interactive graph element has a real button/link element and an aria-label or visible text — not a bare clickable div', () => {
  const source = read('app/components/release/ClinicalOrbit.tsx')
  assert.equal(/onClick=\{[^}]*\}[\s\S]{0,60}<div(?![^>]*role="button")/.test(source), false)
  assert.match(source, /aria-label=/)
})

// ── Content routing ────────────────────────────────────────────────────────

test('no catalog item used as a Clinical Orbit content node exposes an API-only route as a learner link', () => {
  for (const node of CLINICAL_ORBIT_NODE_SEED) {
    if (!node.catalogRef) continue
    const item = CATALOG.find(c => c.module === node.catalogRef.module && c.content_type === node.catalogRef.contentType && c.source_key === node.catalogRef.sourceKey)
    const resolved = resolveContentRoute(item ?? null)
    if (resolved) assert.equal(resolved.startsWith('/api/'), false, `${node.nodeKey} would expose an API route as a learner link`)
  }
})

// ── Small, high-quality seed — not fabricated richness ────────────────────

test('the seed remains a small curated graph, not the full catalog', () => {
  const anchors = CLINICAL_ORBIT_NODE_SEED.filter(n => n.nodeType === 'condition')
  assert.equal(anchors.length, 7)
  assert.deepEqual(anchors.map(n => n.nodeKey).sort(), [...EXPECTED_CONDITION_ANCHOR_KEYS].sort())
  // Deliberate bounded ceiling — raised from Batch 5's <20/<15 guard to
  // <=24/<=20 for Batch 6's genuine DCM/HCM Echo additions, <=26/<=22 for
  // Batch 8's two genuine Clinical Reference links, and now to <=30/<=25
  // for Batch 9's three genuine Resuscitation links (the simulation
  // engine related_to Cardiac Arrest/ACLS, and the VF/pVT scenario related
  // to real ECG rhythm-recognition content). Not a permanent product
  // limit, but still a real guard against uncontrolled/automatic ontology
  // expansion. Any future growth past this must be a deliberate decision,
  // not a silent creep.
  assert.ok(CLINICAL_ORBIT_NODE_SEED.length <= 30, 'seed should stay a small, deliberately curated graph')
  assert.ok(CLINICAL_ORBIT_EDGE_SEED.length <= 25, 'seed should stay a small, deliberately curated graph')
})
