import test from 'node:test'
import assert from 'node:assert/strict'
import { decisionReviewDraft, parseDecisionObservation } from '../content/medical/decisionReview.ts'
import { batch20 } from '../content/medical/batch20.ts'

function form(decision = '0', confidence = '70', evidence = 'Doppler and flow context are absent.') {
  const data = new FormData()
  for (const [key, value] of Object.entries({ decision, confidence, evidence })) if (value !== null) data.set(key, value)
  return data
}
test('one draft is tied to the existing AS case without inheriting text approval', () => {
  assert.ok(batch20.some(c => c.id === decisionReviewDraft.caseId))
  assert.equal(decisionReviewDraft.status, 'draft-medical-review-pending')
  assert.equal('assetId' in decisionReviewDraft, false)
})
test('every existing decision and the confidence endpoints are accepted', () => {
  for (const decision of ['0', '1', '2']) for (const confidence of ['0', '100']) {
    assert.deepEqual(parseDecisionObservation(form(decision, confidence), 3), { decision: Number(decision), confidence: Number(confidence), evidence: 'Doppler and flow context are absent.' })
  }
})
test('missing, out-of-range and fractional values do not advance the exercise', () => {
  for (const confidence of [null, '', ' ', '-1', '101', 'NaN', 'Infinity', '0.5']) assert.equal(parseDecisionObservation(form('0', confidence), 3), null)
  for (const decision of [null, '', '-1', '3', '1.5']) assert.equal(parseDecisionObservation(form(decision), 3), null)
  for (const evidence of [null, '', '   ', 'x'.repeat(601)]) assert.equal(parseDecisionObservation(form('0', '70', evidence), 3), null)
})
test('a repeated choice remains valid and observations do not create a score', () => {
  const before = parseDecisionObservation(form(), 3)
  const after = parseDecisionObservation(form('0', '70', 'The note does not add measurements.'), 3)
  assert.equal(before.decision, after.decision)
  assert.equal('score' in after, false)
  assert.equal('calibration' in after, false)
})
