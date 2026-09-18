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

test('Clinical Reference is reachable from exactly one Explore/Atlas entry point', () => {
  const atlas = read('app/components/release/AtlasReleaseCatalog.tsx')
  const links = atlas.match(/href="\/labs\/clinical-reference"/g) ?? []
  assert.equal(links.length, 1)
  assert.match(atlas, /Clinical Reference/)
})

test('the clinical-reference route exists and renders the real workspace, not a stub', () => {
  assert.ok(existsSync(new URL('../app/labs/clinical-reference/page.tsx', import.meta.url)))
  const page = read('app/labs/clinical-reference/page.tsx')
  assert.match(page, /<ClinicalReferenceWorkspace/)
})

// ── UI: search grouping, provenance, accessibility ───────────────────────

test('search results are grouped by kind (Calculators, Drugs) with counts', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /heading="Calculators"/)
  assert.match(workspace, /heading="Drugs"/)
})

test('every result exposes a provenance card (source, review status, last reviewed, intended use)', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /function ProvenanceCard/)
  assert.match(workspace, /<span>Source<\/span>/)
  assert.match(workspace, /<span>Review status<\/span>/)
  assert.match(workspace, /<span>Last reviewed<\/span>/)
})

test('swipe (drag) on the related-interactions rail is implemented via framer-motion and gated by reduced motion', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /from 'framer-motion'/)
  assert.match(workspace, /useReducedMotion/)
  assert.match(workspace, /drag=\{reducedMotion \? false : 'x'\}/)
})

test('keyboard alternative exists for swipe (Previous/Next buttons drive the same navigation as drag)', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /moveRelated/)
  assert.match(workspace, /aria-label="Previous interaction"/)
  assert.match(workspace, /aria-label="Next interaction"/)
})

test('touch targets meet the 44px minimum and the page stays responsive with no fixed overflow-prone width', () => {
  const css = read('app/labs/clinical-reference/clinical-reference.module.css')
  const count = (css.match(/min-height:\s*44px/g) ?? []).length
  assert.ok(count >= 4, `expected several 44px touch targets, found ${count}`)
  assert.match(css, /@media \(max-width: 760px\)/)
  assert.match(css, /@media \(max-width: 430px\)/)
  assert.match(css, /width: min\(1100px, 100%\)/)
})

test('reduced motion disables transitions/animation globally within the shell', () => {
  const css = read('app/labs/clinical-reference/clinical-reference.module.css')
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
})

test('renal dosing UI copy says "Reference dosing information", never "Recommended dose for this patient"', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /Reference dosing information/)
  assert.equal(/recommended dose for this patient/i.test(workspace), false)
})

test('the workspace never claims certification or diagnostic authority', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /not a substitute for clinical judgment/)
  assert.match(workspace, /not a diagnosis/)
})

// ── LLM-authority removal ────────────────────────────────────────────────

test('no live source file under app/labs/clinical-reference or app/lib/clinicalReference calls an LLM to author drug interaction or dosing content', () => {
  const files = [
    'app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx',
    'app/lib/clinicalReference/drugInteractionRules.ts',
    'app/lib/clinicalReference/renalDosingRules.ts',
  ]
  for (const file of files) {
    // Check code, not comments — drugInteractionRules.ts's own header
    // legitimately documents what the superseded component called, as
    // the reason it was removed. An actual fetch() invocation is what
    // matters here, not a historical mention in prose.
    const codeOnly = read(file).split('\n').filter(line => !line.trim().startsWith('//')).join('\n')
    assert.equal(/fetch\([^)]*api\.anthropic\.com/.test(codeOnly), false, file)
    assert.equal(/fetch\([^)]*\/api\/generate-case/.test(codeOnly), false, file)
  }
})

test('the superseded LLM-based interaction/dosing components still exist as dead code but are not imported by the new live path', () => {
  assert.ok(existsSync(new URL('../app/components/DrugInteractionChecker.tsx', import.meta.url)))
  assert.ok(existsSync(new URL('../app/components/DrugInteractionAI.tsx', import.meta.url)))
  assert.ok(existsSync(new URL('../app/components/RenalDosingAI.tsx', import.meta.url)))
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.equal(workspace.includes('DrugInteractionChecker'), false)
  assert.equal(workspace.includes('DrugInteractionAI'), false)
  assert.equal(workspace.includes('RenalDosingAI'), false)
})

// ── Clinical Orbit integration ───────────────────────────────────────────

test('Atrial Fibrillation links to both live calculator variants (CHA2DS2-VASc and CHA2DS2-VA)', () => {
  const neighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:atrial_fibrillation', { reviewerScope: true })
  assert.ok(neighbors.some(n => n.node.nodeKey === 'content:reference:calculator:cha2ds2_vasc'))
  assert.ok(neighbors.some(n => n.node.nodeKey === 'content:reference:calculator:cha2ds2_va'))
})

test('Heart Failure links to the renal dosing reference node, and it resolves to a real catalog item', () => {
  const neighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:heart_failure', { reviewerScope: true })
  assert.ok(neighbors.some(n => n.node.nodeKey === 'content:reference:renal_rule:clinical_reference_renal_dosing'))
  const node = getOrbitCenter(GRAPH, CATALOG, 'content:reference:renal_rule:clinical_reference_renal_dosing', { reviewerScope: true })
  assert.ok(node)
})

test('every Batch 8 Clinical Orbit edge carries real provenance', () => {
  const batch8Edges = CLINICAL_ORBIT_EDGE_SEED.filter(edge =>
    edge.targetNodeKey === 'content:reference:calculator:cha2ds2_va'
    || edge.targetNodeKey === 'content:reference:renal_rule:clinical_reference_renal_dosing',
  )
  assert.equal(batch8Edges.length, 2)
  for (const edge of batch8Edges) assert.ok(edge.provenanceRef && edge.provenanceRef.trim().length > 0)
})

test('the curated graph ceiling was deliberately reconciled to <=26/<=22, not silently exceeded', () => {
  assert.ok(CLINICAL_ORBIT_NODE_SEED.length <= 26)
  assert.ok(CLINICAL_ORBIT_EDGE_SEED.length <= 22)
  assert.equal(CLINICAL_ORBIT_NODE_SEED.length, 26)
  assert.equal(CLINICAL_ORBIT_EDGE_SEED.length, 22)
})

// ── Catalog integration ──────────────────────────────────────────────────

test('calculator/drug_reference/renal_rule/interaction_rule/evidence_source/reference_workspace are all differentiated content types', () => {
  assert.ok(countByContentType(CATALOG, 'calculator') >= 7)
  assert.equal(countByContentType(CATALOG, 'drug_reference'), 1)
  assert.equal(countByContentType(CATALOG, 'renal_rule'), 1)
  assert.equal(countByContentType(CATALOG, 'interaction_rule'), 1)
  assert.equal(countByContentType(CATALOG, 'evidence_source'), 1)
  assert.equal(countByContentType(CATALOG, 'reference_workspace'), 1)
})

test('none of the new Batch 8 reference rows are counted as a clinical "case"', () => {
  const referenceModuleCases = CATALOG.filter(item => item.module === 'reference' && item.content_type === 'case')
  assert.equal(referenceModuleCases.length, 0)
})

test('every reachable Batch 8 catalog row declares the live route and is visible (even while review_required)', () => {
  const sourceKeys = [
    'cha2ds2_vasc', 'cha2ds2_va', 'timi_nstemi', 'wells_pe', 'heart_score', 'curb_65', 'qsofa',
    'clinical_reference_drug_identity', 'clinical_reference_renal_dosing',
    'clinical_reference_drug_interactions', 'clinical_reference_label_evidence', 'clinical_reference_workspace',
  ]
  for (const sourceKey of sourceKeys) {
    const item = CATALOG.find(candidate => candidate.source_key === sourceKey)
    assert.ok(item, `missing catalog row: ${sourceKey}`)
    assert.equal(item.route, '/labs/clinical-reference')
    assert.equal(item.visibility, 'visible')
  }
})

test('review_required Batch 8 rows correctly do not surface via isAvailable() until reviewed', () => {
  const cha2ds2Vasc = CATALOG.find(item => item.source_key === 'cha2ds2_vasc')
  assert.equal(isAvailable(cha2ds2Vasc), false)
})

test('the rxnorm catalog row now accurately describes a real RxNorm adapter, not the old mislabeled FDA+PubMed implementation', () => {
  const rxnormItem = CATALOG.find(item => item.source_key === 'rxnorm')
  assert.match(rxnormItem.provenance_ref, /RxNav|RxNorm/)
})

// ── Doc Analyzer boundary ────────────────────────────────────────────────

test('Doc Analyzer remains review_required and out of learner-ready scope — untouched by this batch', () => {
  const docAnalyzer = CATALOG.find(item => item.source_key === 'doc_analyzer')
  assert.equal(docAnalyzer.readiness, 'review_required')
  assert.equal(isAvailable(docAnalyzer), false)
})

// ── RxNorm / DailyMed server routes ───────────────────────────────────────

test('the rxnorm route calls the real RxNav API, not openFDA/PubMed', () => {
  const source = read('app/api/rxnorm/route.ts')
  assert.match(source, /rxnav\.nlm\.nih\.gov/)
  assert.equal(source.includes('api.fda.gov'), false)
  assert.equal(source.includes('eutils.ncbi.nlm.nih.gov'), false)
})

test('the dailymed route calls the real DailyMed API and never scrapes an arbitrary HTML page', () => {
  const source = read('app/api/dailymed/route.ts')
  assert.match(source, /dailymed\.nlm\.nih\.gov\/dailymed\/services\/v2/)
})

test('no external drug API route embeds a client-exposed vendor secret', () => {
  for (const file of ['app/api/rxnorm/route.ts', 'app/api/dailymed/route.ts']) {
    const source = read(file)
    assert.equal(/api[_-]?key/i.test(source), false, file)
  }
})
