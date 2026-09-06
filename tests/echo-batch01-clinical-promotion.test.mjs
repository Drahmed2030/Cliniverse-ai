import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ECHO_BATCH_01_CLINICAL_PROMOTION,
  summarizeEchoBatch01ClinicalPromotion,
  validateEchoBatch01ClinicalPromotion,
} from '../app/lib/clinicalMedia/echoBatch01ClinicalPromotion.ts'

test('promotion queue remains fail-closed before specialist review', () => {
  validateEchoBatch01ClinicalPromotion()
  for (const record of ECHO_BATCH_01_CLINICAL_PROMOTION) {
    assert.equal(record.learnerReady, false)
    assert.equal(record.clinicalReviewComplete, false)
    assert.equal(record.finalPrivacyReviewComplete, false)
    assert.equal(record.promotionState, 'clinical-review-required')
  }
})

test('DCM maps to existing global-function and cardiomyopathy skills without EF claims', () => {
  const dcm = ECHO_BATCH_01_CLINICAL_PROMOTION.find(record => record.candidateId === 'echo-a4c-dcm-e00476')
  assert.ok(dcm)
  assert.ok(dcm.mappedSkillIds.includes('echo.function.lv-global-visual'))
  assert.ok(dcm.mappedSkillIds.includes('echo.cardiomyopathy.pattern-recognition'))
  assert.ok(dcm.prohibitedClaims.includes('numerical EF estimation'))
})

test('pericardial effusion exposes a deliberate skill-graph gap instead of inventing competency support', () => {
  const summary = summarizeEchoBatch01ClinicalPromotion()
  assert.deepEqual(summary.skillGraphGaps, ['echo.pericardium.effusion-pattern'])
  assert.equal(summary.learnerReady, 0)
  assert.equal(summary.clinicalReviewRequired, 3)
})
