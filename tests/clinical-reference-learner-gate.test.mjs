import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { CLINICAL_CONTENT_CATALOG_SEED } from '../app/lib/contentCatalogSeed.ts'
import { isAvailable } from '../app/lib/contentCatalogQueries.ts'
import { isReferenceItemLearnerReady, findReferenceCatalogItem } from '../app/lib/clinicalReference/learnerExposure.ts'
import { CLINICAL_CALCULATOR_REGISTRY } from '../app/lib/clinicalReference/calculatorRegistry.ts'
import { GOVERNED_SEED_DRUG_IDENTITIES } from '../app/lib/clinicalReference/drugIdentity.ts'
import { DRUG_INTERACTION_RULES } from '../app/lib/clinicalReference/drugInteractionRules.ts'
import { RENAL_DOSE_RULES } from '../app/lib/clinicalReference/renalDosingRules.ts'
import { CLINICAL_ORBIT_NODE_SEED, CLINICAL_ORBIT_EDGE_SEED } from '../app/lib/clinicalOrbitGraphSeed.ts'
import { getOrbitNeighbors } from '../app/lib/clinicalOrbitGraphQueries.ts'

const CATALOG = CLINICAL_CONTENT_CATALOG_SEED
const GRAPH = { nodes: CLINICAL_ORBIT_NODE_SEED, edges: CLINICAL_ORBIT_EDGE_SEED }

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

// ── 1. Calculators cannot be opened/used while review_required ──────────

test('1. every calculator in the registry is currently review_required, and the catalog gate correctly reports none as learner-ready', () => {
  assert.ok(CLINICAL_CALCULATOR_REGISTRY.length >= 7)
  for (const definition of CLINICAL_CALCULATOR_REGISTRY) {
    const catalogItem = findReferenceCatalogItem(definition.calculatorId)
    assert.ok(catalogItem, `missing catalog row for ${definition.calculatorId}`)
    assert.equal(catalogItem.readiness, 'review_required')
    assert.equal(isReferenceItemLearnerReady(definition.calculatorId), false)
  }
})

test('1b. the workspace filters calculator search results through isReferenceItemLearnerReady, not registry presence', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /learnerReadyCalculators = useMemo\(\s*\(\) => CLINICAL_CALCULATOR_REGISTRY\.filter\(def => isReferenceItemLearnerReady\(def\.calculatorId\)\)/)
})

test('1c. CalculatorDetail re-checks the catalog gate independently (defense in depth) before rendering the interactive form', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  const fn = workspace.slice(workspace.indexOf('function CalculatorDetail'), workspace.indexOf('function CalculatorDetail') + 800)
  assert.match(fn, /if \(!isReferenceItemLearnerReady\(definition\.calculatorId\)\)/)
  assert.match(fn, /UnderClinicalReviewStub/)
})

// ── 2. Renal dosing rules cannot be exposed while review_required ───────

test('2. every renal dose rule is review_required, and the aggregate catalog row correctly gates the whole capability', () => {
  const catalogItem = findReferenceCatalogItem('clinical_reference_renal_dosing')
  assert.equal(catalogItem.readiness, 'review_required')
  assert.equal(isReferenceItemLearnerReady('clinical_reference_renal_dosing'), false)
  for (const rule of RENAL_DOSE_RULES) assert.equal(rule.reviewStatus, 'pending_clinical_review')
})

test('2b. DrugDetail only resolves a dose rule when the renal-dosing catalog row is ready', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /dosingReady = isReferenceItemLearnerReady\('clinical_reference_renal_dosing'\)/)
  assert.match(workspace, /const doseRule = dosingReady \? findRenalDoseRule\(identity\.rxcui\) : null/)
})

// ── 3. Interaction rules cannot be exposed while review_required ────────

test('3. every interaction rule is review_required, and the aggregate catalog row correctly gates the whole capability', () => {
  const catalogItem = findReferenceCatalogItem('clinical_reference_drug_interactions')
  assert.equal(catalogItem.readiness, 'review_required')
  assert.equal(isReferenceItemLearnerReady('clinical_reference_drug_interactions'), false)
  for (const rule of DRUG_INTERACTION_RULES) assert.equal(rule.reviewStatus, 'pending_clinical_review')
})

test('3b. DrugDetail only computes interactions when the interaction-rule catalog row is ready', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /interactionsReady = isReferenceItemLearnerReady\('clinical_reference_drug_interactions'\)/)
  assert.match(workspace, /interactionsReady \? findDrugInteractionsAmong/)
})

// ── 4. Ready+visible source tools remain accessible ──────────────────────

test('4. RxNorm and DailyMed catalog rows are genuinely ready+visible and pass the gate', () => {
  const rxnorm = findReferenceCatalogItem('rxnorm')
  const dailymed = findReferenceCatalogItem('dailymed')
  assert.equal(rxnorm.readiness, 'ready')
  assert.equal(isAvailable(rxnorm), true)
  assert.equal(isReferenceItemLearnerReady('rxnorm'), true)
  assert.equal(dailymed.readiness, 'ready')
  assert.equal(isAvailable(dailymed), true)
  assert.equal(isReferenceItemLearnerReady('dailymed'), true)
})

test('4b. the workspace lists both tools in a "Tools" result group whenever they are catalog-ready', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.match(workspace, /rxnormToolReady = isReferenceItemLearnerReady\('rxnorm'\)/)
  assert.match(workspace, /dailymedToolReady = isReferenceItemLearnerReady\('dailymed'\)/)
  assert.match(workspace, /heading="Tools"/)
})

// ── 5. Registry presence alone cannot make something learner-ready ──────

test('5. registries are non-empty but the catalog gate still reports zero learner-ready calculators/dosing/interactions today — presence never implies readiness', () => {
  assert.ok(CLINICAL_CALCULATOR_REGISTRY.length > 0)
  assert.ok(RENAL_DOSE_RULES.length > 0)
  assert.ok(DRUG_INTERACTION_RULES.length > 0)
  assert.ok(GOVERNED_SEED_DRUG_IDENTITIES.length > 0)

  const learnerReadyCalculatorCount = CLINICAL_CALCULATOR_REGISTRY.filter(def => isReferenceItemLearnerReady(def.calculatorId)).length
  assert.equal(learnerReadyCalculatorCount, 0)
  assert.equal(isReferenceItemLearnerReady('clinical_reference_renal_dosing'), false)
  assert.equal(isReferenceItemLearnerReady('clinical_reference_drug_interactions'), false)
  assert.equal(isReferenceItemLearnerReady('clinical_reference_drug_identity'), false)
})

test('5b. a sourceKey with no matching catalog row fails closed rather than defaulting to available', () => {
  assert.equal(findReferenceCatalogItem('not-a-real-catalog-row'), null)
  assert.equal(isReferenceItemLearnerReady('not-a-real-catalog-row'), false)
})

// ── 6. Catalog is the authoritative exposure gate (not a parallel check) ─

test('6. learnerExposure.ts reuses Batch 4\'s isAvailable() — it does not reimplement readiness/visibility logic', () => {
  const source = read('app/lib/clinicalReference/learnerExposure.ts')
  assert.match(source, /import \{ isAvailable \} from '\.\.\/contentCatalogQueries\.ts'/)
  assert.match(source, /return isAvailable\(item\)/)
  // No second definition of the visible+ready rule anywhere in this file.
  assert.equal(/visibility === 'visible'/.test(source), false)
  assert.equal(/readiness === 'ready'/.test(source), false)
})

test('6b. the workspace never reads a registry item\'s own reviewStatus/learnerReadiness to decide learner exposure — only the catalog', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  // The badge in ResultGroup is hardcoded "Ready" because every listed
  // result has already passed the catalog gate — it does not branch on
  // definition.reviewStatus/rule.reviewStatus to decide the badge.
  assert.equal(/result\.reviewStatus === 'reviewed' \? styles\.badgeReviewed/.test(workspace), false)
})

// ── 7. No implicit reviewer/internal bypass exists ───────────────────────

test('7. the workspace exposes no reviewer/internal scope bypass — every result path goes through the one learner gate', () => {
  const workspace = read('app/labs/clinical-reference/ClinicalReferenceWorkspace.tsx')
  assert.equal(/reviewerScope/i.test(workspace), false)
  assert.equal(/internalScope/i.test(workspace), false)
  assert.equal(/\?debug/i.test(workspace), false)
})

// ── 8. Clinical Orbit still excludes pending_review reference edges ─────

test('8. CHA2DS2-VA and the renal dosing reference node are absent from default (non-reviewer) Clinical Orbit scope', () => {
  const afNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:atrial_fibrillation')
  assert.equal(afNeighbors.some(n => n.node.nodeKey === 'content:reference:calculator:cha2ds2_va'), false)
  const hfNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:heart_failure')
  assert.equal(hfNeighbors.some(n => n.node.nodeKey === 'content:reference:renal_rule:clinical_reference_renal_dosing'), false)
})

test('8b. both edges remain pending_review — this fix does not promote them to reviewed', () => {
  const cha2ds2VaEdge = CLINICAL_ORBIT_EDGE_SEED.find(edge => edge.targetNodeKey === 'content:reference:calculator:cha2ds2_va')
  const renalEdge = CLINICAL_ORBIT_EDGE_SEED.find(edge => edge.targetNodeKey === 'content:reference:renal_rule:clinical_reference_renal_dosing')
  assert.equal(cha2ds2VaEdge.evidenceStatus, 'pending_review')
  assert.equal(renalEdge.evidenceStatus, 'pending_review')
})

test('8c. the same neighbors DO appear in reviewer scope, proving the edges are real and just gated, not missing', () => {
  const afNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:atrial_fibrillation', { reviewerScope: true })
  assert.ok(afNeighbors.some(n => n.node.nodeKey === 'content:reference:calculator:cha2ds2_va'))
})

// ── 9. Doc Analyzer remains gated ────────────────────────────────────────

test('9. Doc Analyzer stays review_required and unavailable — untouched by this fix', () => {
  const docAnalyzer = findReferenceCatalogItem('doc_analyzer')
  assert.equal(docAnalyzer.readiness, 'review_required')
  assert.equal(isAvailable(docAnalyzer), false)
})
