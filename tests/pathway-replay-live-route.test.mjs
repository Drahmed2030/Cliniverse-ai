import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

import { CLINICAL_ORBIT_NODE_SEED, CLINICAL_ORBIT_EDGE_SEED } from '../app/lib/clinicalOrbitGraphSeed.ts'
import { getOrbitNeighbors, getOrbitCenter } from '../app/lib/clinicalOrbitGraphQueries.ts'
import { CLINICAL_CONTENT_CATALOG_SEED } from '../app/lib/contentCatalogSeed.ts'
import { isAvailable, countByContentType } from '../app/lib/contentCatalogQueries.ts'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

const GRAPH = { nodes: CLINICAL_ORBIT_NODE_SEED, edges: CLINICAL_ORBIT_EDGE_SEED }
const CATALOG = CLINICAL_CONTENT_CATALOG_SEED

// ── Live route wiring ────────────────────────────────────────────────────

test('Pathway Replay is reachable from exactly one Explore/Atlas entry point — no second nav system', () => {
  const atlas = read('app/components/release/AtlasReleaseCatalog.tsx')
  const links = atlas.match(/href: '\/labs\/pathway-replay'/g) ?? []
  assert.equal(links.length, 1)
  assert.match(atlas, /title: 'Pathway Replay'/)
})

test('the pathway-replay route exists and renders the real experience component, not a stub', () => {
  assert.ok(existsSync(new URL('../app/labs/pathway-replay/page.tsx', import.meta.url)))
  const page = read('app/labs/pathway-replay/page.tsx')
  assert.match(page, /runPathwayReplay\(STEMI_REPLAY_DEMO\)/)
  assert.match(page, /<PathwayReplayExperience/)
})

test('no competing pathway-replay route directory exists', () => {
  assert.equal(existsSync(new URL('../app/labs/pathway-replay-v2', import.meta.url)), false)
  assert.equal(existsSync(new URL('../app/labs/pathway', import.meta.url)), false)
})

// ── Timeline UX: focus state, swipe, keyboard, reduced motion ───────────

test('the timeline has a real focus state driven by user interaction, not just static rendering', () => {
  const experience = read('app/labs/pathway-replay/PathwayReplayExperience.tsx')
  assert.match(experience, /useState<number \| null>\(null\)/)
  assert.match(experience, /setFocusedIndex/)
})

test('keyboard navigation moves timeline focus and closes the evidence drawer on Escape/Backspace', () => {
  const experience = read('app/labs/pathway-replay/PathwayReplayExperience.tsx')
  assert.match(experience, /handleKeyDown/)
  assert.match(experience, /ArrowRight/)
  assert.match(experience, /ArrowLeft/)
  assert.match(experience, /'Escape'/)
  assert.match(experience, /'Backspace'/)
})

test('swipe (drag) is implemented via framer-motion, already a repo dependency, and is disabled under reduced motion', () => {
  const experience = read('app/labs/pathway-replay/PathwayReplayExperience.tsx')
  assert.match(experience, /from 'framer-motion'/)
  assert.match(experience, /useReducedMotion/)
  assert.match(experience, /drag=\{reducedMotion \? false : 'x'\}/)
})

test('every timeline row is a real keyboard-focusable button, not a bare clickable div', () => {
  const experience = read('app/labs/pathway-replay/PathwayReplayExperience.tsx')
  assert.equal(/onClick=\{[^}]*setFocusedIndex[^}]*\}[\s\S]{0,40}<div(?![^>]*role="button")/.test(experience), false)
  assert.match(experience, /className=\{`\$\{styles\.eventRow\}/)
})

test('the evidence drawer offers a "Practice this gap" action that opens the drill stage', () => {
  const experience = read('app/labs/pathway-replay/PathwayReplayExperience.tsx')
  assert.match(experience, /Practice this gap/)
  assert.match(experience, /onPracticeGap/)
})

test('touch targets meet the 44px minimum used elsewhere in this app', () => {
  const css = read('app/labs/pathway-replay/pathway-replay.module.css')
  const count = (css.match(/min-height:\s*44px/g) ?? []).length
  assert.ok(count >= 5, `expected several 44px touch targets, found ${count}`)
})

test('the page stays responsive (mobile/tablet/desktop breakpoints) and the shell width uses min() rather than a fixed overflow-prone width', () => {
  const css = read('app/labs/pathway-replay/pathway-replay.module.css')
  assert.match(css, /@media \(max-width: 760px\)/)
  assert.match(css, /@media \(max-width: 430px\)/)
  assert.match(css, /width: min\(1180px, 100%\)/)
})

test('reduced motion disables transitions/animation globally within the shell, matching the repo-wide convention', () => {
  const css = read('app/labs/pathway-replay/pathway-replay.module.css')
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
})

test('there is no Back-button maze — only the single inline "back" affordance per stage view, not a stack of nested Back buttons', () => {
  const experience = read('app/labs/pathway-replay/PathwayReplayExperience.tsx')
  const backButtons = experience.match(/className=\{styles\.inlineBack\}/g) ?? []
  assert.ok(backButtons.length <= 3, `expected at most 3 stage-level Back buttons, found ${backButtons.length}`)
})

// ── Governance / boundary language in the UI itself ─────────────────────

test('the UI never claims certification, a digital signature, or a credential for a receipt — it only ever disclaims them', () => {
  const experience = read('app/labs/pathway-replay/PathwayReplayExperience.tsx')
  const lowered = experience.toLowerCase()
  assert.equal(lowered.includes('certification granted'), false)
  // "credential"/"signature" may appear only in an explicit negation (e.g.
  // "not ... a digital signature or credential") — never as a positive claim.
  assert.equal(/\bis an? (digital signature|credential|certificate)\b/.test(lowered), false)
  assert.match(experience, /not certification, not clinical validation, and not a digital signature or credential/)
  assert.match(experience, /tamper-evident/i)
})

test('closure remains explicitly human-owned in the UI copy — no automatic-approval language', () => {
  const experience = read('app/labs/pathway-replay/PathwayReplayExperience.tsx')
  assert.match(experience, /human reviewer still owns classification/)
  assert.match(experience, /No AI, score, receipt, or replay state can complete this step automatically/)
})

// ── Clinical Orbit integration ───────────────────────────────────────────

test('Anterior STEMI/ACS links to the live Pathway Replay node, and Cardiac Arrest/ACLS links to the live drill node', () => {
  const stemiNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:anterior_stemi_acs')
  assert.ok(stemiNeighbors.some(n => n.node.nodeKey === 'content:pathway:pathway:stemi-replay-demo-v2'))
  const aclsNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:cardiac_arrest_acls')
  assert.ok(aclsNeighbors.some(n => n.node.nodeKey === 'content:pathway:drill:door-to-ecg-drill-v1'))
})

test('both new Batch 7 Clinical Orbit edges are reviewed (both targets are genuinely live/visible) and carry real provenance', () => {
  const batch7Edges = CLINICAL_ORBIT_EDGE_SEED.filter(edge => edge.targetNodeKey.startsWith('content:pathway:'))
  assert.equal(batch7Edges.length, 2)
  for (const edge of batch7Edges) {
    assert.equal(edge.evidenceStatus, 'reviewed')
    assert.ok(edge.provenanceRef && edge.provenanceRef.trim().length > 0)
  }
})

test('the pathway and drill content nodes both resolve to real, visible/ready catalog items', () => {
  const pathwayNode = getOrbitCenter(GRAPH, CATALOG, 'content:pathway:pathway:stemi-replay-demo-v2')
  const drillNode = getOrbitCenter(GRAPH, CATALOG, 'content:pathway:drill:door-to-ecg-drill-v1')
  assert.ok(pathwayNode)
  assert.ok(drillNode)
})

test('the curated graph stays within the current deliberately-reconciled ceiling — no silent creep past it', () => {
  // This ceiling moves only via an explicit reconciliation decision (see
  // tests/clinical-orbit-graph-contract.test.mjs's own ceiling test for
  // the authoritative current value and its history) — pinning an exact
  // count here duplicates that decision and goes stale every time a later
  // batch legitimately reconciles it again, so this checks the bound
  // rather than a batch-specific snapshot.
  assert.ok(CLINICAL_ORBIT_NODE_SEED.length <= 30)
  assert.ok(CLINICAL_ORBIT_EDGE_SEED.length <= 25)
})

// ── Catalog integration ──────────────────────────────────────────────────

test('pathway/drill/replay_activity/receipt_schema are differentiated content types, never counted as a clinical "case"', () => {
  // 'pathway' and 'replay_activity' remain Pathway Replay-module-specific,
  // so they stay exact. 'drill' and 'receipt_schema' are shared vocabulary
  // terms other modules (e.g. Batch 9's resuscitation module) also use
  // legitimately — checked as "at least the one Pathway Replay row", not
  // pinned to an exact cross-module count that goes stale every time
  // another batch adds a real drill/receipt_schema row.
  assert.equal(countByContentType(CATALOG, 'pathway'), 1)
  assert.ok(countByContentType(CATALOG, 'drill') >= 1)
  assert.equal(countByContentType(CATALOG, 'replay_activity'), 1)
  assert.ok(countByContentType(CATALOG, 'receipt_schema') >= 1)
  const pathwayModuleCaseRows = CATALOG.filter(item => item.module === 'pathway' && item.content_type === 'case')
  assert.equal(pathwayModuleCaseRows.length, 0)
})

test('the receipt schema catalog row is a governance artifact, correctly hidden from learner scope', () => {
  const schemaItem = CATALOG.find(item => item.source_key === 'pathway-replay-receipt-v2-schema')
  assert.ok(schemaItem)
  assert.equal(isAvailable(schemaItem), false)
  assert.equal(schemaItem.visibility, 'hidden')
})

test('the pathway, drill and replay_activity catalog rows are all visible/ready — matching the live, reachable route', () => {
  for (const sourceKey of ['pathway-replay-stemi-demo-v2', 'pathway-replay-door-to-ecg-drill-v1', 'pathway-replay-reassessment-closure-v1']) {
    const item = CATALOG.find(candidate => candidate.source_key === sourceKey)
    assert.ok(item, `missing catalog row: ${sourceKey}`)
    assert.equal(isAvailable(item), true)
    assert.equal(item.route, '/labs/pathway-replay')
  }
})
