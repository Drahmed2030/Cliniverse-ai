import test from 'node:test'
import assert from 'node:assert/strict'
import {
  describePtbXlSelectionPolicy,
  evaluatePtbXlRecordSelection,
} from '../app/lib/clinicalIntelligence/ecgRecordSelectionProvenancePolicy.ts'

function candidate(overrides = {}) {
  return {
    datasetSourceId: 'physionet-ptb-xl-v1.0.3',
    datasetVersion: '1.0.3',
    ecgId: '12345',
    patientId: '67890',
    stratFold: 9,
    filenameHr: 'records500/12000/12345_hr',
    filenameLr: 'records100/12000/12345_lr',
    samplingHz: 500,
    waveformSha256: 'a'.repeat(64),
    scpCodes: ['NORM'],
    validatedByHuman: true,
    educationalObjective: 'Assess rhythm and intervals before diagnostic pattern classification.',
    skillIds: ['ecg-rhythm-assessment', 'ecg-interval-assessment'],
    sourceLicense: 'CC-BY-4.0',
    attributionPlanPresent: true,
    waveformTechnicallyInspected: true,
    privacyReviewed: true,
    clinicalLabelReviewed: true,
    ...overrides,
  }
}

test('policy preserves PTB-XL patient grouping and original folds', () => {
  const policy = describePtbXlSelectionPolicy()
  assert.equal(policy.preservePatientGrouping, true)
  assert.equal(policy.preserveOriginalStratFold, true)
  assert.deepEqual(policy.recommendedTrainingFolds, [1, 2, 3, 4, 5, 6, 7, 8])
  assert.equal(policy.recommendedValidationFold, 9)
  assert.equal(policy.recommendedTestFold, 10)
})

test('dataset labels do not auto-authorize a Cliniverse diagnosis', () => {
  const result = evaluatePtbXlRecordSelection(candidate())
  assert.equal(result.labelAuthority, 'SOURCE_ANNOTATION_REQUIRES_HUMAN_CLINICAL_REVIEW')
})

test('record selection requires a waveform checksum and technical inspection', () => {
  const result = evaluatePtbXlRecordSelection(candidate({
    waveformSha256: undefined,
    waveformTechnicallyInspected: false,
  }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('waveform-sha256-required'))
  assert.ok(result.blockers.includes('technical-waveform-inspection-required'))
})

test('record selection requires educational objective and skill binding', () => {
  const result = evaluatePtbXlRecordSelection(candidate({
    educationalObjective: ' ',
    skillIds: [],
  }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('educational-objective-required'))
  assert.ok(result.blockers.includes('skill-binding-required'))
})

test('record selection requires privacy and human clinical label review', () => {
  const result = evaluatePtbXlRecordSelection(candidate({
    privacyReviewed: false,
    clinicalLabelReviewed: false,
  }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('record-privacy-review-required'))
  assert.ok(result.blockers.includes('human-clinical-label-review-required'))
})

test('fully reviewed record is eligible for case review but not learner promotion', () => {
  const result = evaluatePtbXlRecordSelection(candidate())
  assert.equal(result.decision, 'ELIGIBLE_FOR_CASE_REVIEW')
  assert.equal(result.patientGroupKey, 'physionet-ptb-xl-v1.0.3:67890')
  assert.equal(result.preserveOriginalFold, true)
})
