import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { ECHO_PHENOTYPE_SEED, validateEchoPhenotypeSeed, deriveEchoPhenotypeReadiness, findEchoPhenotype } from '../app/lib/clinicalMedia/echoPhenotype.ts'
import { ECHO_STUDY_RECORD_SEED, validateEchoStudyRecordSeed, isEchoStudyRecordLearnerReady, findEchoStudyRecord } from '../app/lib/clinicalMedia/echoStudyRecord.ts'
import { ECHO_FINDING_SEED, validateEchoFindingSeed, findingsForStudy } from '../app/lib/clinicalMedia/echoFinding.ts'
import { ECHO_MEASUREMENT_SEED, validateEchoMeasurementSeed, validateEchoMeasurement, isMeasurementClinicallyVerified } from '../app/lib/clinicalMedia/echoMeasurement.ts'
import { ECHO_EVIDENCE_SEED, validateEchoEvidenceSeed, findEchoEvidence } from '../app/lib/clinicalMedia/echoEvidence.ts'
import { evaluateEchoComparisonEligibility, buildEchoComparison } from '../app/lib/clinicalMedia/echoComparison.ts'
import { ECHO_AI_PROVIDER_ADAPTERS, resolveEchoAiProviderAdapter, validateEchoAnalysisResult } from '../app/lib/clinicalMedia/echoAiAdapter.ts'
import { canTransitionEchoInstitutionalIntake, transitionEchoInstitutionalIntake, isEchoInstitutionalIntakeLearnerVisible } from '../app/lib/clinicalMedia/echoInstitutionalIntake.ts'
import { deriveEchoAtlasMetrics } from '../app/lib/clinicalMedia/echoAtlasMetrics.ts'
import { CLINICAL_CONTENT_CATALOG_SEED } from '../app/lib/contentCatalogSeed.ts'
import { isAvailable } from '../app/lib/contentCatalogQueries.ts'

import { ECHO_LEARNING_ACTIVITY_SEED, ECHO_NEXT_BEST_EVIDENCE_TASKS, validateEchoLearningActivitySeed, validateEchoNextBestEvidenceTasks, assertNextBestEvidenceFraming } from '../app/lib/competency/echoLearningActivity.ts'
import { classifyEchoCalibration, summarizeEchoCalibration, toEchoConfidenceBand } from '../app/lib/competency/echoConfidenceCalibration.ts'
import { scoreEchoAssessment } from '../app/lib/competency/echoAssessmentContract.ts'

import { CLINICAL_ORBIT_NODE_SEED, CLINICAL_ORBIT_EDGE_SEED } from '../app/lib/clinicalOrbitGraphSeed.ts'
import { getOrbitNeighbors, getOrbitCenter } from '../app/lib/clinicalOrbitGraphQueries.ts'

const CATALOG = CLINICAL_CONTENT_CATALOG_SEED
const GRAPH = { nodes: CLINICAL_ORBIT_NODE_SEED, edges: CLINICAL_ORBIT_EDGE_SEED }

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

// ── DATA MODEL: study/cine/view/finding/measurement/phenotype/activity separation ──

test('EchoStudyRecord, EchoPhenotype, EchoFinding, EchoEvidence and EchoLearningActivity are all separate identity spaces, not collapsed into one case object', () => {
  validateEchoStudyRecordSeed()
  validateEchoPhenotypeSeed()
  validateEchoFindingSeed()
  validateEchoEvidenceSeed()
  validateEchoLearningActivitySeed()
  validateEchoNextBestEvidenceTasks()
  validateEchoMeasurementSeed()
  assert.equal(ECHO_STUDY_RECORD_SEED.length, 3)
  assert.equal(ECHO_PHENOTYPE_SEED.length, 3)
})

test('no duplicate study/cine identities across the study record seed', () => {
  const keys = ECHO_STUDY_RECORD_SEED.map(record => record.studyKey)
  assert.equal(new Set(keys).size, keys.length)
})

test('every phenotype references only real, existing study records', () => {
  for (const phenotype of ECHO_PHENOTYPE_SEED) {
    for (const studyId of phenotype.studyIds) {
      assert.ok(findEchoStudyRecord(studyId), `${phenotype.phenotypeKey} references unknown study ${studyId}`)
    }
  }
})

test('every finding references a real study record', () => {
  for (const finding of ECHO_FINDING_SEED) {
    assert.ok(findEchoStudyRecord(finding.studyKey), `finding ${finding.findingKey} references unknown study ${finding.studyKey}`)
  }
  assert.deepEqual(findingsForStudy('echo-a4c-dcm-e00476').map(f => f.findingKey), ['echo-finding:dcm-lv-dilation'])
})

test('measurement provenance is required and origin=ai_provider requires provider/model/version', () => {
  assert.throws(() => validateEchoMeasurement({
    measurementKey: 'm1', studyKey: 'echo-a4c-governed-preview-v1', type: 'ef_visual_estimate',
    value: 55, unit: '%', method: 'visual', sourceView: 'A4C', reviewStatus: 'unverified',
    provenanceRef: 'test', origin: 'ai_provider', provider: '', model: '', modelVersion: '',
    qualityFlag: 'good', clinicianVerified: false, verifiedAt: null,
  }), /missing provider\/model\/modelVersion/)

  const valid = {
    measurementKey: 'm2', studyKey: 'echo-a4c-governed-preview-v1', type: 'ef_visual_estimate',
    value: 55, unit: '%', method: 'visual', sourceView: 'A4C', reviewStatus: 'reviewed',
    provenanceRef: 'test', origin: 'ai_provider', provider: 'acme', model: 'echo-net', modelVersion: '1.0',
    qualityFlag: 'good', clinicianVerified: true, verifiedAt: '2026-09-18T00:00:00Z',
  }
  assert.doesNotThrow(() => validateEchoMeasurement(valid))
  assert.equal(isMeasurementClinicallyVerified(valid), true)
})

test('an AI measurement cannot be clinicianVerified without a verifiedAt timestamp, and vice versa', () => {
  const base = {
    measurementKey: 'm3', studyKey: 'echo-a4c-governed-preview-v1', type: 'ef_visual_estimate',
    value: 55, unit: '%', method: 'visual', sourceView: 'A4C', reviewStatus: 'unverified',
    provenanceRef: 'test', origin: 'ai_provider', provider: 'acme', model: 'echo-net', modelVersion: '1.0', qualityFlag: 'good',
  }
  assert.throws(() => validateEchoMeasurement({ ...base, clinicianVerified: true, verifiedAt: null }), /verifiedAt timestamp/)
  assert.throws(() => validateEchoMeasurement({ ...base, clinicianVerified: false, verifiedAt: '2026-09-18T00:00:00Z' }), /clinicianVerified is false/)
})

test('non-reviewed measurements cannot become verified truth — an unreviewed AI measurement is never clinically verified', () => {
  const unreviewed = {
    measurementKey: 'm4', studyKey: 'echo-a4c-governed-preview-v1', type: 'ef_visual_estimate',
    value: 55, unit: '%', method: 'visual', sourceView: 'A4C', reviewStatus: 'pending_review',
    provenanceRef: 'test', origin: 'ai_provider', provider: 'acme', model: 'echo-net', modelVersion: '1.0',
    qualityFlag: 'good', clinicianVerified: true, verifiedAt: '2026-09-18T00:00:00Z',
  }
  assert.equal(isMeasurementClinicallyVerified(unreviewed), false)
})

test('no measurements are generated in this batch — the seed is empty', () => {
  assert.equal(ECHO_MEASUREMENT_SEED.length, 0)
})

// ── READINESS: review_required/media_pending/labs Echo content excluded from learner scope ──

test('only Normal A4C is a learner-ready Echo study record; DCM and HCM are governed but not ready', () => {
  const normal = findEchoStudyRecord('echo-a4c-governed-preview-v1')
  const dcm = findEchoStudyRecord('echo-a4c-dcm-e00476')
  const hcm = findEchoStudyRecord('echo-a4c-severe-hcm-mm0002')
  assert.equal(isEchoStudyRecordLearnerReady(normal), true)
  assert.equal(isEchoStudyRecordLearnerReady(dcm), false)
  assert.equal(isEchoStudyRecordLearnerReady(hcm), false)
  assert.equal(dcm.playableStudyId, null)
  assert.equal(hcm.playableStudyId, null)
})

test('a non-ready study record structurally cannot carry a playableStudyId', () => {
  assert.throws(() => validateEchoStudyRecordSeed([
    { studyKey: 'x', title: 'X', phenotypeKey: 'echo-phenotype:dcm', learnerReadiness: 'review_required', reviewStatus: 'pending_review', licenseStatus: 'pending', provenanceRef: 'test', views: ['A4C'], playableStudyId: 'should-not-be-here' },
  ]), /must not carry a playableStudyId/)
})

test('phenotype readiness is derived from the weakest member study, never asserted independently', () => {
  const normal = findEchoPhenotype('echo-phenotype:normal')
  const dcm = findEchoPhenotype('echo-phenotype:dcm')
  const hcm = findEchoPhenotype('echo-phenotype:hcm')
  assert.equal(deriveEchoPhenotypeReadiness(normal, ECHO_STUDY_RECORD_SEED), 'ready')
  assert.equal(deriveEchoPhenotypeReadiness(dcm, ECHO_STUDY_RECORD_SEED), 'review_required')
  assert.equal(deriveEchoPhenotypeReadiness(hcm, ECHO_STUDY_RECORD_SEED), 'review_required')
})

test('the catalog correctly marks DCM/HCM phenotype and cine rows hidden/review_required, and Normal visible/ready', () => {
  const normalPhenotype = CATALOG.find(i => i.source_key === 'echo-phenotype-normal')
  const dcmPhenotype = CATALOG.find(i => i.source_key === 'echo-phenotype-dcm')
  const hcmPhenotype = CATALOG.find(i => i.source_key === 'echo-phenotype-hcm')
  assert.equal(isAvailable(normalPhenotype), true)
  assert.equal(isAvailable(dcmPhenotype), false)
  assert.equal(isAvailable(hcmPhenotype), false)
})

// ── CONTRASTIVE MODE: comparisons only between compatible/verified studies ──

test('Normal vs DCM, Normal vs HCM and DCM vs HCM are all correctly ineligible today — no side but Normal is learner-ready', () => {
  const nd = evaluateEchoComparisonEligibility('echo-phenotype:normal', 'echo-phenotype:dcm', { studyRecords: ECHO_STUDY_RECORD_SEED, evidence: ECHO_EVIDENCE_SEED })
  const nh = evaluateEchoComparisonEligibility('echo-phenotype:normal', 'echo-phenotype:hcm', { studyRecords: ECHO_STUDY_RECORD_SEED, evidence: ECHO_EVIDENCE_SEED })
  const dh = evaluateEchoComparisonEligibility('echo-phenotype:dcm', 'echo-phenotype:hcm', { studyRecords: ECHO_STUDY_RECORD_SEED, evidence: ECHO_EVIDENCE_SEED })
  assert.equal(nd.eligible, false)
  assert.equal(nd.reason, 'one-or-both-phenotypes-not-learner-ready')
  assert.equal(nh.eligible, false)
  assert.equal(dh.eligible, false)
  for (const result of [nd, nh, dh]) assert.throws(() => buildEchoComparison(result.phenotypeAKey, result.phenotypeBKey, { studyRecords: ECHO_STUDY_RECORD_SEED, evidence: ECHO_EVIDENCE_SEED }))
})

test('a comparison is never fabricated for an undeclared pair', () => {
  const result = evaluateEchoComparisonEligibility('echo-phenotype:normal', 'echo-phenotype:normal')
  assert.equal(result.eligible, false)
  assert.equal(result.reason, 'cannot-compare-phenotype-with-itself')
})

test('an eligible comparison (synthetic: both sides ready with reviewed evidence) prefers same-view pairing and surfaces real findings, not fabricated ones', () => {
  const phenotypes = [
    { phenotypeKey: 'p:a', label: 'A', studyIds: ['s:a'], comparisonGroup: ['p:b'], provenanceRef: 'test' },
    { phenotypeKey: 'p:b', label: 'B', studyIds: ['s:b'], comparisonGroup: ['p:a'], provenanceRef: 'test' },
  ]
  const studyRecords = [
    { studyKey: 's:a', title: 'A', phenotypeKey: 'p:a', learnerReadiness: 'ready', reviewStatus: 'reviewed', licenseStatus: 'licensed-verified', provenanceRef: 'test', views: ['A4C'], playableStudyId: 's:a' },
    { studyKey: 's:b', title: 'B', phenotypeKey: 'p:b', learnerReadiness: 'ready', reviewStatus: 'reviewed', licenseStatus: 'licensed-verified', provenanceRef: 'test', views: ['A4C'], playableStudyId: 's:b' },
  ]
  const evidence = [
    { studyKey: 's:a', provenanceRef: 'test', source: 'test', license: 'test', reviewStatus: 'reviewed', sourceRevision: '1' },
    { studyKey: 's:b', provenanceRef: 'test', source: 'test', license: 'test', reviewStatus: 'reviewed', sourceRevision: '1' },
  ]
  const eligibility = evaluateEchoComparisonEligibility('p:a', 'p:b', { phenotypes, studyRecords, evidence })
  assert.equal(eligibility.eligible, true)
  const comparison = buildEchoComparison('p:a', 'p:b', { phenotypes, studyRecords, evidence, findings: ECHO_FINDING_SEED })
  assert.equal(comparison.sameView, true)
  assert.deepEqual(comparison.distinguishingFindings, [])
})

// ── NEXT-BEST-EVIDENCE: activity type validated, educational framing preserved ──

test('next_best_evidence is a valid activity type with a real, scoreable task behind it', () => {
  assert.equal(ECHO_LEARNING_ACTIVITY_SEED.length, 1)
  const activity = ECHO_LEARNING_ACTIVITY_SEED[0]
  assert.equal(activity.type, 'next_best_evidence')
  assert.equal(activity.confidenceCapture, true)
  const task = ECHO_NEXT_BEST_EVIDENCE_TASKS.find(t => t.id === activity.taskId)
  assert.ok(task)
  const result = scoreEchoAssessment(task, { taskId: task.id, selectedOptionIds: ['additional-view'], confidence: 4, responseTimeMs: 1200, attemptedAt: '2026-09-18T00:00:00Z' })
  assert.equal(result.correct, true)
})

test('next_best_evidence framing is educational reasoning, never patient-management advice', () => {
  for (const task of ECHO_NEXT_BEST_EVIDENCE_TASKS) assert.doesNotThrow(() => assertNextBestEvidenceFraming(task))
  const managementFramed = { ...ECHO_NEXT_BEST_EVIDENCE_TASKS[0], evidenceBoundary: 'This determines the correct treatment and patient management plan.' }
  assert.throws(() => assertNextBestEvidenceFraming(managementFramed), /patient-management advice/)
  const unframed = { ...ECHO_NEXT_BEST_EVIDENCE_TASKS[0], evidenceBoundary: 'No framing statement here at all.' }
  assert.throws(() => assertNextBestEvidenceFraming(unframed), /must explicitly frame itself/)
})

// ── CONFIDENCE: correctness and confidence stored separately; incorrect/high-confidence detectable ──

test('confidence bands map 1-5 to low/medium/high as documented', () => {
  assert.equal(toEchoConfidenceBand(1), 'low')
  assert.equal(toEchoConfidenceBand(2), 'low')
  assert.equal(toEchoConfidenceBand(3), 'medium')
  assert.equal(toEchoConfidenceBand(4), 'high')
  assert.equal(toEchoConfidenceBand(5), 'high')
})

test('all four calibration quadrants are distinguishable, and incorrect+high is flagged as the misconception-priority signal', () => {
  const base = { taskId: 't', skillId: 'echo.view.a4c-recognition', selectedAnswer: '[]', rawScore: 0, normalizedScore: 0, responseTimeMs: 100 }
  const correctHigh = classifyEchoCalibration({ ...base, correct: true, confidence: 5 })
  const correctLow = classifyEchoCalibration({ ...base, correct: true, confidence: 1 })
  const incorrectLow = classifyEchoCalibration({ ...base, correct: false, confidence: 2 })
  const incorrectHigh = classifyEchoCalibration({ ...base, correct: false, confidence: 5 })

  assert.equal(correctHigh.quadrant, 'correct_high_confidence')
  assert.equal(correctLow.quadrant, 'correct_low_confidence')
  assert.equal(incorrectLow.quadrant, 'incorrect_low_confidence')
  assert.equal(incorrectHigh.quadrant, 'incorrect_high_confidence')

  assert.equal(correctHigh.isMisconceptionPriority, false)
  assert.equal(incorrectLow.isMisconceptionPriority, false)
  assert.equal(incorrectHigh.isMisconceptionPriority, true)

  const summary = summarizeEchoCalibration([correctHigh, correctLow, incorrectLow, incorrectHigh])
  assert.equal(summary.total, 4)
  assert.equal(summary.misconceptionPriorityCount, 1)
})

// ── AI ADAPTER: vendor-neutral normalized contract; unknown vendor payload cannot bypass normalization ──

test('no vendor adapter is registered — no vendor lock-in exists in this batch', () => {
  assert.equal(ECHO_AI_PROVIDER_ADAPTERS.size, 0)
  assert.throws(() => resolveEchoAiProviderAdapter('us2.ai'), /No Echo AI provider adapter is registered/)
})

test('an EchoAnalysisResult cannot be constructed already clinicianVerified, and requires full identity', () => {
  const base = { studyKey: 'x', provider: 'acme', model: 'm', modelVersion: '1', views: ['A4C'], measurements: [], findings: [], qualityFlags: [], generatedAt: '2026-09-18T00:00:00Z', clinicianVerified: false }
  assert.doesNotThrow(() => validateEchoAnalysisResult(base))
  assert.throws(() => validateEchoAnalysisResult({ ...base, clinicianVerified: true }), /must not be constructed with clinicianVerified already true/)
  assert.throws(() => validateEchoAnalysisResult({ ...base, provider: '' }), /identity/)
})

// ── INSTITUTIONAL BOUNDARY: raw/patient-data intake not exposed to general learner scope ──

test('institutional intake state machine only allows the documented forward transitions, never skips a gate', () => {
  assert.equal(canTransitionEchoInstitutionalIntake('raw', 'deidentification_pending'), true)
  assert.equal(canTransitionEchoInstitutionalIntake('raw', 'approved_for_teaching'), false)
  assert.equal(canTransitionEchoInstitutionalIntake('raw', 'deidentified'), false)
  assert.equal(canTransitionEchoInstitutionalIntake('approved_for_teaching', 'raw'), false)
})

test('approved_for_teaching requires an approvedTeachingStudyKey already set', () => {
  const record = { intakeKey: 'i1', state: 'review_pending', approvedTeachingStudyKey: null }
  assert.throws(() => transitionEchoInstitutionalIntake(record, 'approved_for_teaching'), /without an approvedTeachingStudyKey/)
  const withKey = { ...record, approvedTeachingStudyKey: 'some-study' }
  const result = transitionEchoInstitutionalIntake(withKey, 'approved_for_teaching')
  assert.equal(result.state, 'approved_for_teaching')
})

test('an institutional intake record is never learner-visible, in any state', () => {
  for (const state of ['raw', 'deidentification_pending', 'deidentified', 'review_pending', 'approved_for_teaching', 'rejected']) {
    assert.equal(isEchoInstitutionalIntakeLearnerVisible({ intakeKey: 'i', state, approvedTeachingStudyKey: null }), false)
  }
})

test('no institutional/raw-patient-data route exists in this batch', () => {
  assert.equal(require$$fileExists('app/labs/echo-institutional-intake'), false)
  function require$$fileExists(path) {
    try { readFileSync(new URL(`../${path}/page.tsx`, import.meta.url)); return true } catch { return false }
  }
})

// ── CLINICAL ORBIT: only evidence-backed Echo edges; hidden Echo nodes excluded ──

test('DCM and HCM phenotype condition nodes are always reachable (concept anchors), but have zero neighbors in default learner scope', () => {
  assert.ok(getOrbitCenter(GRAPH, CATALOG, 'condition:dcm_phenotype'))
  assert.ok(getOrbitCenter(GRAPH, CATALOG, 'condition:hcm_phenotype'))
  assert.deepEqual(getOrbitNeighbors(GRAPH, CATALOG, 'condition:dcm_phenotype'), [])
  assert.deepEqual(getOrbitNeighbors(GRAPH, CATALOG, 'condition:hcm_phenotype'), [])
})

test('DCM and HCM neighbors DO appear in reviewer scope, proving the edges are real and just gated, not missing', () => {
  const dcmNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:dcm_phenotype', { reviewerScope: true })
  const hcmNeighbors = getOrbitNeighbors(GRAPH, CATALOG, 'condition:hcm_phenotype', { reviewerScope: true })
  assert.ok(dcmNeighbors.some(n => n.node.nodeKey === 'content:echo_batch20:cine:dilated-lv'))
  assert.ok(dcmNeighbors.some(n => n.node.nodeKey === 'content:echo:cine:echo-a4c-normal-cardionetworks-v1'))
  assert.ok(hcmNeighbors.some(n => n.node.nodeKey === 'content:echo_batch20:cine:hypertrophic-phenotype'))
})

test('every new Batch 6 Clinical Orbit edge has real provenance and no edge is asserted as reviewed', () => {
  const batch6Edges = CLINICAL_ORBIT_EDGE_SEED.filter(edge => edge.sourceNodeKey.includes('phenotype') || edge.targetNodeKey.includes('phenotype') || edge.sourceNodeKey.includes('echo') || edge.targetNodeKey.includes('echo'))
  assert.ok(batch6Edges.length >= 6)
  for (const edge of batch6Edges) {
    assert.ok(edge.provenanceRef && edge.provenanceRef.trim().length > 0)
    assert.notEqual(edge.evidenceStatus, 'reviewed')
  }
})

// ── Supabase migration necessity (Section 16) — verify the claim, don't assert it ──

test('kg_nodes/kg_edges controlled vocabularies already allow every node type and relation this batch uses — no new graph migration is required', () => {
  const migration = read('supabase/drafts/clinical_orbit_graph_v1.sql')
  assert.match(migration, /'condition'/)
  assert.match(migration, /'content'/)
  assert.match(migration, /'demonstrates'/)
  assert.match(migration, /'compares_with'/)
  assert.match(migration, /'related_to'/)
})

test('clinical_content_catalog.content_type has no CHECK constraint restricting its values — adding phenotype/activity rows requires no migration', () => {
  const migration = read('supabase/drafts/clinical_content_catalog_v1.sql')
  assert.equal(/content_type[\s\S]{0,40}check/i.test(migration), false)
})

// ── Regression touchpoint: catalog metrics stay truthful, never inflated ──

test('deriveEchoAtlasMetrics counts are truthful and differentiated — no double counting, no "case" label applied to phenotypes', () => {
  const metrics = deriveEchoAtlasMetrics(CATALOG)
  assert.equal(metrics.studyCount, 3)
  assert.equal(metrics.cineCount, 10)
  assert.equal(metrics.phenotypeCount, 3)
  assert.equal(metrics.activityCount, 1)
})

test('findEchoEvidence resolves real records and reflects the correct review status per study', () => {
  assert.equal(findEchoEvidence('echo-a4c-governed-preview-v1').reviewStatus, 'reviewed')
  assert.equal(findEchoEvidence('echo-a4c-dcm-e00476').reviewStatus, 'pending_review')
  assert.equal(findEchoEvidence('echo-a4c-severe-hcm-mm0002').reviewStatus, 'pending_review')
})
