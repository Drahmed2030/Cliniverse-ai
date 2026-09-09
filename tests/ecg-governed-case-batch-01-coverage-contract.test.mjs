import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1,
  describeEcgGovernedBatch01CoverageContractV1,
  evaluateEcgBatch01CoveragePlanV1,
} from '../app/lib/clinicalIntelligence/ecgGovernedCaseBatch01CoverageContract.ts'

test('batch 01 coverage plan is ready for governed record selection', () => {
  const result = evaluateEcgBatch01CoveragePlanV1()
  assert.equal(result.decision, 'READY_FOR_RECORD_SELECTION')
  assert.deepEqual(result.blockers, [])
})

test('batch 01 remains bounded to the approved 12 to 20 case range', () => {
  assert.equal(ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1.targetCaseCountMin, 12)
  assert.equal(ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1.targetCaseCountMax, 20)
  const invalid = evaluateEcgBatch01CoveragePlanV1({
    ...ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1,
    targetCaseCountMin: 10,
  })
  assert.equal(invalid.decision, 'HOLD')
  assert.ok(invalid.blockers.includes('batch-01-case-count-outside-approved-range'))
})

test('source labels cannot auto-promote to clinical truth', () => {
  const result = evaluateEcgBatch01CoveragePlanV1({
    ...ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1,
    sourceLabelsMayAutoBecomeDiagnosis: true,
  })
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('source-label-auto-diagnosis-prohibited'))
})

test('adaptive use requires learner eligibility and human clinical reference', () => {
  const result = evaluateEcgBatch01CoveragePlanV1({
    ...ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1,
    humanClinicalReferenceRequired: false,
    learnerEligibilityRequiredBeforeAdaptiveUse: false,
  })
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('human-clinical-reference-required'))
  assert.ok(result.blockers.includes('learner-eligibility-required-before-adaptive-use'))
})

test('coverage plan contains foundation, core and advanced targets', () => {
  const priorities = new Set(ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1.skillTargets.map(item => item.priority))
  assert.deepEqual([...priorities].sort(), ['ADVANCED', 'CORE', 'FOUNDATION'])
})

test('contract preserves governance and avoids hospital-integration dependency', () => {
  const contract = describeEcgGovernedBatch01CoverageContractV1()
  assert.equal(contract.governedRecordSelectionOnly, true)
  assert.equal(contract.sourceDiagnosisLabelsAreNotClinicalTruth, true)
  assert.equal(contract.humanClinicalReviewRequired, true)
  assert.equal(contract.noHospitalIntegrationDependency, true)
})
