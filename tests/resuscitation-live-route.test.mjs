import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

import { CLINICAL_ORBIT_NODE_SEED, CLINICAL_ORBIT_EDGE_SEED } from '../app/lib/clinicalOrbitGraphSeed.ts'
import { getOrbitNeighbors, getOrbitCenter } from '../app/lib/clinicalOrbitGraphQueries.ts'
import { CLINICAL_CONTENT_CATALOG_SEED } from '../app/lib/contentCatalogSeed.ts'
import { isAvailable, countByContentType } from '../app/lib/contentCatalogQueries.ts'
import { RESUSCITATION_LEARNING_UNITS, validateResuscitationLearningUnits, catalogReviewStatusFor } from '../app/lib/resuscitation/curriculumContract.ts'
import { RESUSCITATION_SCENARIOS } from '../app/lib/resuscitation/scenarios/index.ts'

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

// ── Learner readiness gate (governance fix) ──────────────────────────────

test('all three governed scenarios still declare reviewStatus pending_clinical_review at the manifest level', () => {
  for (const scenario of RESUSCITATION_SCENARIOS) {
    assert.equal(scenario.reviewStatus, 'pending_clinical_review')
  }
})

test('catalog rows for the three governed scenarios are review_required, not ready', () => {
  for (const sourceKey of ['resus_vf_pvt_v1', 'resus_pea_asystole_v1', 'resus_unstable_bradycardia_v1']) {
    const item = CATALOG.find(candidate => candidate.source_key === sourceKey)
    assert.ok(item, `missing catalog row: ${sourceKey}`)
    assert.equal(item.readiness, 'review_required')
    assert.equal(item.visibility, 'visible', `${sourceKey} should stay listed/discoverable, just not launchable`)
    assert.equal(isAvailable(item), false)
  }
})

test('registry presence alone does not make a scenario learner-ready — the catalog row is the sole authority', () => {
  // Every governed scenario is present in RESUSCITATION_SCENARIOS (the
  // registry) — that alone must not be read as "ready." catalogReviewStatusFor
  // looks the scenarioId up in the catalog, exactly as it already does for
  // lessons, and is the one function ResuscitationHub.tsx calls to gate
  // launch — never scenario.reviewStatus directly.
  for (const scenario of RESUSCITATION_SCENARIOS) {
    assert.equal(catalogReviewStatusFor(scenario.scenarioId), 'pending_clinical_review')
  }
})

test('ResuscitationHub disables launch for a scenario the catalog marks review_required, and never calls setActiveScenario unconditionally', () => {
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  assert.match(hub, /const learnerReady = catalogReviewStatusFor\(scenario\.scenarioId\) === 'reviewed'/)
  assert.match(hub, /disabled=\{!learnerReady\}/)
  assert.match(hub, /onClick=\{\(\) => \{ if \(learnerReady\) setActiveScenario\(scenario\) \}\}/)
  assert.equal(/onClick=\{\(\) => setActiveScenario\(scenario\)\}/.test(hub), false)
})

test('ResuscitationHub shows an "Under clinical review" state, not a silent disable with no explanation', () => {
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  assert.match(hub, /Under clinical review/)
})

test('no reviewer bypass was introduced in the hub — there is no reviewer/admin scope override anywhere in the component', () => {
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  assert.equal(/reviewerScope|isReviewer|reviewerBypass|adminOverride/i.test(hub), false)
})

test('ready lessons and drills remain fully usable and are not gated by the scenario fix', () => {
  const lessons = RESUSCITATION_LEARNING_UNITS.filter(unit => unit.kind === 'lesson')
  assert.equal(lessons.length, 12)
  for (const lesson of lessons) assert.equal(lesson.reviewStatus, 'reviewed')
})

test('old Megacode v2 PE/Sepsis scenarios (MegacodeRunner.tsx) remain unpromoted — no catalog row exposes them as learner-ready', () => {
  for (const sourceKey of ['mega_pe_01', 'mega_sepsis_01', 'mega_vf_01']) {
    const item = CATALOG.find(candidate => candidate.source_key === sourceKey)
    assert.equal(item, undefined, `${sourceKey} must not have a catalog row — MegacodeRunner.tsx is not wired into any live path`)
  }
  const megacode = CATALOG.find(item => item.source_key === 'megacode_v1')
  assert.ok(megacode, 'the existing, separate megacode_v1 row must remain untouched')
  assert.equal(megacode.readiness, 'ready')
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

test('the VF/pVT scenario node is excluded from the default learner Clinical Orbit scope while pending clinical review', () => {
  // The scenario's catalog row is now review_required (governance fix),
  // so isNodeAvailable fails closed for it in the default (non-reviewer)
  // scope — getOrbitCenter returns null and getOrbitNeighbors returns [],
  // exactly like any other not-yet-ready content node. This is the
  // existing Clinical Orbit gate (clinicalOrbitGraphQueries.ts) doing its
  // job automatically once the catalog row was corrected — no new
  // filtering code was added to clinicalOrbit.ts itself.
  const center = getOrbitCenter(GRAPH, CATALOG, 'content:resuscitation:scenario:resus_vf_pvt_v1')
  assert.equal(center, null)
  const neighbors = getOrbitNeighbors(GRAPH, CATALOG, 'content:resuscitation:scenario:resus_vf_pvt_v1')
  assert.deepEqual(neighbors, [])
})

test('the VF/pVT scenario -> ECG edge still resolves in explicit reviewer scope, proving this is a real gate, not a broken link', () => {
  // reviewerScope is an existing, already-documented option on every
  // Clinical Orbit query (clinicalOrbitGraphQueries.ts OrbitQueryOptions)
  // — used here only to prove the edge/target data itself is intact, not
  // to grant learners any bypass. ResuscitationHub.tsx never sets this
  // option (see the "no reviewer bypass" test below).
  const center = getOrbitCenter(GRAPH, CATALOG, 'content:resuscitation:scenario:resus_vf_pvt_v1', { reviewerScope: true })
  assert.ok(center)
  const neighbors = getOrbitNeighbors(GRAPH, CATALOG, 'content:resuscitation:scenario:resus_vf_pvt_v1', { reviewerScope: true })
  assert.ok(neighbors.some(n => n.node.nodeKey === 'content:ecg:case:vt-monomorphic'))
  const ecgNode = getOrbitCenter(GRAPH, CATALOG, 'content:ecg:case:vt-monomorphic')
  assert.ok(ecgNode, 'the ECG target itself is independently ready/visible, unaffected by the scenario fix')
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

test('every reachable, non-scenario, non-drill Batch 9 catalog row is visible+ready and declares the live route', () => {
  const sourceKeys = [
    'resuscitation_simulation_engine',
    'resuscitation_debrief_engine', 'resuscitation_competency_map',
  ]
  for (const sourceKey of sourceKeys) {
    const item = CATALOG.find(candidate => candidate.source_key === sourceKey)
    assert.ok(item, `missing catalog row: ${sourceKey}`)
    assert.equal(isAvailable(item), true)
    assert.equal(item.route, '/labs/resuscitation-hub')
  }
})

test('the three governed scenario rows are listed (visible) and route correctly, but are NOT available (review_required)', () => {
  for (const sourceKey of ['resus_vf_pvt_v1', 'resus_pea_asystole_v1', 'resus_unstable_bradycardia_v1']) {
    const item = CATALOG.find(candidate => candidate.source_key === sourceKey)
    assert.ok(item, `missing catalog row: ${sourceKey}`)
    assert.equal(item.route, '/labs/resuscitation-hub')
    assert.equal(item.visibility, 'visible')
    assert.equal(isAvailable(item), false)
  }
})

// Pre-TestFlight governance alignment. The drill catalog row used to say
// visible/ready while every drill unit failed closed to pending_clinical_review
// and the Hub rendered them "Pending review" with no launcher. The real review
// record for the drill content (each lesson's practice block) is
// app/lib/codelab/lessonSources.ts, which has no reviewed entry, so the catalog
// row, the registry units and the Hub must all say "not learner-ready".
test('the drill catalog row is listed (visible) but review_required, and is not available', () => {
  const item = CATALOG.find(candidate => candidate.source_key === 'resuscitation_codelab_drills')
  assert.ok(item, 'missing catalog row: resuscitation_codelab_drills')
  assert.equal(item.route, '/labs/resuscitation-hub')
  assert.equal(item.visibility, 'visible')
  assert.equal(item.readiness, 'review_required')
  assert.equal(isAvailable(item), false)
  assert.equal(catalogReviewStatusFor('resuscitation_codelab_drills'), 'pending_clinical_review')
})

test('catalog row, drill registry units and Hub agree: drills are not learner-ready', async () => {
  const { getLessonSourceReview } = await import('../app/lib/codelab/lessonSources.ts')
  const drills = RESUSCITATION_LEARNING_UNITS.filter(unit => unit.kind === 'drill')
  assert.equal(drills.length, 12)
  for (const drill of drills) {
    assert.equal(drill.reviewStatus, 'pending_clinical_review', `${drill.unitId} must fail closed`)
    // The drill content is the lesson's own practice block; it cannot be more
    // reviewed than the source review recorded for that lesson.
    const lessonId = drill.unitId.replace(/::drill$/, '')
    const sourceReview = getLessonSourceReview(lessonId)
    assert.ok(sourceReview, `no source review record for ${lessonId}`)
    assert.notEqual(sourceReview.reviewState, 'reviewed', `${lessonId} source review must not be reviewed while its drill is gated`)
  }
  const hub = read('app/labs/resuscitation-hub/ResuscitationHub.tsx')
  const practice = hub.slice(hub.indexOf("section === 'practice'"), hub.indexOf("section === 'simulate'"))
  assert.match(practice, /Pending review/)
  assert.doesNotMatch(practice, /Reviewed|onClick|<Link|<button/)
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
