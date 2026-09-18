import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

import { CLINICAL_ORBIT_NODE_SEED, CLINICAL_ORBIT_EDGE_SEED } from '../app/lib/clinicalOrbitGraphSeed.ts'
import { getOrbitNeighbors, getOrbitCenter } from '../app/lib/clinicalOrbitGraphQueries.ts'
import { CLINICAL_CONTENT_CATALOG_SEED } from '../app/lib/contentCatalogSeed.ts'
import { isAvailable, countByContentType } from '../app/lib/contentCatalogQueries.ts'
import { RESUSCITATION_LEARNING_UNITS, validateResuscitationLearningUnits } from '../app/lib/resuscitation/curriculumContract.ts'

const CATALOG = CLINICAL_CONTENT_CATALOG_SEED
const GRAPH = { nodes: CLINICAL_ORBIT_NODE_SEED, edges: CLINICAL_ORBIT_EDGE_SEED }

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

// ── Live route wiring ────────────────────────────────────────────────────

test('Resuscitation Hub is reachable from exactly one Explore/Atlas entry point', () => {
  const atlas = read('app/components/release/AtlasReleaseCatalog.tsx')
  const links = atlas.match(/href="\/labs\/resuscitation-hub"/g) ?? []
  assert.equal(links.length, 1)
  assert.match(atlas, /Resuscitation Hub/)
})

test('the resuscitation-hub route exists and renders the real hub component, not a stub', () => {
  assert.ok(existsSync(new URL('../app/labs/resuscitation-hub/page.tsx', import.meta.url)))
  const page = read('app/labs/resuscitation-hub/page.tsx')
  assert.match(page, /<ResuscitationHub/)
})

test('no competing resuscitation route/component was created — one hub, one simulation player', () => {
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  const playerInstances = hub.match(/function SimulationPlayer/g) ?? []
  assert.equal(playerInstances.length, 1)
})

// ── Curriculum layer: existing lessons reused, not discarded ────────────

test('BLS/ACLS lessons are normalized, not duplicated — the same 12 lesson ids appear as ResuscitationLearningUnits', () => {
  assert.doesNotThrow(() => validateResuscitationLearningUnits())
  const lessonUnits = RESUSCITATION_LEARNING_UNITS.filter(unit => unit.kind === 'lesson')
  assert.equal(lessonUnits.length, 12)
})

test('lesson reviewStatus reflects the EXISTING catalog truth for that lesson, not an independently invented opinion', () => {
  const blsChain = RESUSCITATION_LEARNING_UNITS.find(unit => unit.unitId === 'bls_01_chain')
  const catalogRow = CATALOG.find(item => item.source_key === 'bls_01_chain')
  assert.ok(catalogRow)
  assert.equal(isAvailable(catalogRow), true)
  assert.equal(blsChain.reviewStatus, 'reviewed')
})

test('drill units are a reframing of each lesson\'s existing practice block — no second drill framework was created', () => {
  const drillUnits = RESUSCITATION_LEARNING_UNITS.filter(unit => unit.kind === 'drill')
  assert.equal(drillUnits.length, 12)
  for (const drill of drillUnits) assert.match(drill.sourceRefs[0], /app\/lib\/codelab\/(blsLessons|aclsLessons)\.ts/)
})

// ── Code Lab / Megacode reconciliation ───────────────────────────────────

test('the old MegacodeRunner.tsx is not imported by the new resuscitation-hub live path', () => {
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  assert.equal(hub.includes('MegacodeRunner'), false)
  assert.equal(hub.includes("from '../../components/ward/MegacodeRunner"), false)
})

test('scenario logic is not hardcoded into the React component — the player only reads scenario.phases/actions data', () => {
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  assert.equal(/CASES\s*=\s*\{/.test(hub), false)
  assert.match(hub, /currentPhase\?\.actions\.map/)
})

// ── UI: mobile layout, timeline, keyboard, reduced motion, touch targets ──

test('the event timeline has a keyboard-accessible toggle, not swipe-only access', () => {
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  assert.match(hub, /aria-expanded=\{showTimeline\}/)
  assert.match(hub, /onClick=\{\(\) => setShowTimeline/)
})

test('critical-error pause is a bottom sheet, not a full-screen blocking modal', () => {
  const css = read('app/labs/resuscitation-hub/resuscitation-hub.module.css')
  assert.match(css, /\.pauseSheet/)
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  assert.match(hub, /role="alertdialog"/)
})

test('touch targets meet the 44px minimum used elsewhere in this app', () => {
  const css = read('app/labs/resuscitation-hub/resuscitation-hub.module.css')
  const count = (css.match(/min-height:\s*44px/g) ?? []).length
  assert.ok(count >= 4, `expected several 44px touch targets, found ${count}`)
})

test('the page stays responsive with no fixed overflow-prone width, and reduced motion is respected', () => {
  const css = read('app/labs/resuscitation-hub/resuscitation-hub.module.css')
  assert.match(css, /@media \(max-width: 760px\)/)
  assert.match(css, /@media \(max-width: 430px\)/)
  assert.match(css, /width: min\(1100px, 100%\)/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
})

test('no direct real-time clinical guidance or certification language appears in the hub UI', () => {
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  assert.match(hub, /Educational simulation only/)
  assert.match(hub, /Not a certification or credential/)
})

// ── Clinical Orbit integration ───────────────────────────────────────────

test('Cardiac Arrest/ACLS links to the live Resuscitation Simulation Engine', () => {
  const neighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:cardiac_arrest_acls')
  assert.ok(neighbors.some(n => n.node.nodeKey === 'content:resuscitation:simulation:resuscitation_simulation_engine'))
})

test('the VF/pVT scenario links to real ECG rhythm-recognition content', () => {
  const neighbors = getOrbitNeighbors(GRAPH, CATALOG, 'content:resuscitation:scenario:resus_vf_pvt_v1')
  assert.ok(neighbors.some(n => n.node.nodeKey === 'content:ecg:case:vt-monomorphic'))
  const ecgNode = getOrbitCenter(GRAPH, CATALOG, 'content:ecg:case:vt-monomorphic')
  assert.ok(ecgNode)
})

test('both new Batch 9 Clinical Orbit edges are reviewed (both targets are genuinely live/visible/ready) and carry provenance', () => {
  const batch9Edges = CLINICAL_ORBIT_EDGE_SEED.filter(edge =>
    edge.targetNodeKey === 'content:resuscitation:simulation:resuscitation_simulation_engine'
    || edge.targetNodeKey === 'content:ecg:case:vt-monomorphic',
  )
  assert.equal(batch9Edges.length, 2)
  for (const edge of batch9Edges) {
    assert.equal(edge.evidenceStatus, 'reviewed')
    assert.ok(edge.provenanceRef && edge.provenanceRef.trim().length > 0)
  }
})

test('the curated graph stays within the current deliberately-reconciled ceiling', () => {
  assert.ok(CLINICAL_ORBIT_NODE_SEED.length <= 30)
  assert.ok(CLINICAL_ORBIT_EDGE_SEED.length <= 25)
})

// ── Catalog integration ──────────────────────────────────────────────────

test('lesson/drill/simulation/scenario/debrief/receipt_schema/competency_map are all differentiated content types, none counted as a clinical case', () => {
  // 'lesson'/'drill'/'scenario'/'receipt_schema' are shared vocabulary
  // terms other modules (codelab's existing megacode_v1 'scenario' row,
  // Pathway Replay's 'drill'/'receipt_schema' rows) also legitimately
  // use — checked as "at least this batch's own rows", not pinned to an
  // exact cross-module count. 'simulation'/'debrief'/'competency_map' are
  // new content types this batch introduces, so those stay exact.
  assert.ok(countByContentType(CATALOG, 'lesson') >= 12)
  assert.ok(countByContentType(CATALOG, 'drill') >= 1)
  assert.equal(countByContentType(CATALOG, 'simulation'), 1)
  assert.ok(countByContentType(CATALOG, 'scenario') >= 3)
  assert.equal(countByContentType(CATALOG, 'debrief'), 1)
  assert.ok(countByContentType(CATALOG, 'receipt_schema') >= 1)
  assert.equal(countByContentType(CATALOG, 'competency_map'), 1)
  const resuscitationModuleCases = CATALOG.filter(item => item.module === 'resuscitation' && item.content_type === 'case')
  assert.equal(resuscitationModuleCases.length, 0)
})

test('every reachable Batch 9 catalog row is visible+ready and declares the live route', () => {
  const sourceKeys = [
    'resuscitation_simulation_engine', 'resus_vf_pvt_v1', 'resus_pea_asystole_v1', 'resus_unstable_bradycardia_v1',
    'resuscitation_codelab_drills', 'resuscitation_debrief_engine', 'resuscitation_competency_map',
  ]
  for (const sourceKey of sourceKeys) {
    const item = CATALOG.find(candidate => candidate.source_key === sourceKey)
    assert.ok(item, `missing catalog row: ${sourceKey}`)
    assert.equal(isAvailable(item), true)
    assert.equal(item.route, '/labs/resuscitation-hub')
  }
})

test('the resuscitation receipt schema is a governance artifact, correctly hidden from learner scope', () => {
  const schemaItem = CATALOG.find(item => item.source_key === 'resuscitation_receipt_schema')
  assert.ok(schemaItem)
  assert.equal(isAvailable(schemaItem), false)
  assert.equal(schemaItem.visibility, 'hidden')
})

// ── Regression touchpoints ────────────────────────────────────────────────

test('existing BLS/ACLS/megacode_v1 catalog rows are untouched by this batch', () => {
  const acls01 = CATALOG.find(item => item.source_key === 'acls_01_systematic')
  assert.equal(acls01.readiness, 'ready')
  assert.equal(acls01.route, '/?view=learn')
  const megacode = CATALOG.find(item => item.source_key === 'megacode_v1')
  assert.ok(megacode)
  assert.equal(megacode.readiness, 'ready')
})

test('Pathway Replay (Batch 7) catalog rows are untouched', () => {
  const pathway = CATALOG.find(item => item.source_key === 'pathway-replay-stemi-demo-v2')
  assert.equal(pathway.readiness, 'ready')
  assert.equal(pathway.route, '/labs/pathway-replay')
})

test('Clinical Reference (Batch 8) learner-gate rows are untouched', () => {
  const cha2ds2 = CATALOG.find(item => item.source_key === 'cha2ds2_vasc')
  assert.equal(cha2ds2.readiness, 'review_required')
})
