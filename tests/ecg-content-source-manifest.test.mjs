import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PTB_XL_SOURCE_MANIFEST,
  evaluateEcgSourceManifest,
} from '../app/lib/clinicalIntelligence/ecgContentSourceManifest.ts'
import {
  ECG_FIRST_GOVERNED_CASE_SKELETON,
  bindEcgCaseSourceRecord,
} from '../app/lib/clinicalIntelligence/ecgFirstGovernedCaseSkeleton.ts'

test('PTB-XL source manifest is verified but not learner-authorized', () => {
  const result = evaluateEcgSourceManifest(PTB_XL_SOURCE_MANIFEST)
  assert.equal(result.status, 'VERIFIED_SOURCE_CANDIDATE')
  assert.deepEqual(result.blockers, [])
  assert.equal(PTB_XL_SOURCE_MANIFEST.learnerUseAuthorized, false)
  assert.equal(PTB_XL_SOURCE_MANIFEST.selectedRecordId, null)
})

test('source manifest preserves 12-lead and 500 Hz high-resolution availability', () => {
  assert.equal(PTB_XL_SOURCE_MANIFEST.leadCount, 12)
  assert.equal(PTB_XL_SOURCE_MANIFEST.samplingFrequenciesHz.includes(500), true)
  assert.equal(PTB_XL_SOURCE_MANIFEST.licenseId, 'CC-BY-4.0')
})

test('first governed ECG case skeleton contains no fabricated record or diagnosis', () => {
  assert.equal(ECG_FIRST_GOVERNED_CASE_SKELETON.sourceRecordId, null)
  assert.equal(ECG_FIRST_GOVERNED_CASE_SKELETON.diagnosisLabel, null)
  assert.equal(ECG_FIRST_GOVERNED_CASE_SKELETON.learnerReady, false)
  assert.ok(ECG_FIRST_GOVERNED_CASE_SKELETON.blockers.includes('source-record-selection-required'))
  assert.ok(ECG_FIRST_GOVERNED_CASE_SKELETON.blockers.includes('human-clinical-review-required'))
})

test('record binding clears only selection/objective/skill blockers', () => {
  const bound = bindEcgCaseSourceRecord({
    skeleton: ECG_FIRST_GOVERNED_CASE_SKELETON,
    sourceRecordId: 'ptb-xl-record-placeholder',
    educationalObjective: 'Structured 12-lead ECG interpretation competency',
    skillIds: ['ecg-rhythm-recognition'],
  })

  assert.equal(bound.sourceRecordId, 'ptb-xl-record-placeholder')
  assert.deepEqual(bound.skillIds, ['ecg-rhythm-recognition'])
  assert.equal(bound.blockers.includes('source-record-selection-required'), false)
  assert.equal(bound.blockers.includes('educational-objective-required'), false)
  assert.equal(bound.blockers.includes('skill-binding-required'), false)
  assert.ok(bound.blockers.includes('technical-validation-required'))
  assert.ok(bound.blockers.includes('human-clinical-review-required'))
  assert.equal(bound.learnerReady, false)
})
