import test from 'node:test'
import assert from 'node:assert/strict'
import { createEchoA4cReviewPlan, getEchoA4cReviewStatus } from '../app/lib/codelab/echoA4cReviewPlan.ts'
import { createEchoA4cCompletionReceipt, ECHO_A4C_TRAINING_ACTIVITY } from '../app/lib/codelab/echoA4cTrainingActivity.ts'

const answers = ECHO_A4C_TRAINING_ACTIVITY.assessment.correctAnswers
const time = '2026-12-31T23:00:00.000Z'

test('review plan retains earlier missed skills and crosses year boundary in UTC', () => {
  const receipt = createEchoA4cCompletionReceipt({ attempts: 2, answers, history: [{ ...answers, 'safe-conclusion': 'exclude-all-pathology' }, answers] })
  const plan = createEchoA4cReviewPlan(receipt, time)
  assert.deepEqual(plan.focus, ['safe-conclusion'])
  assert.deepEqual(plan.reviews.map(item => item.afterDays), [1, 3, 7])
  assert.equal(plan.reviews[0].dueAt, '2027-01-01T23:00:00.000Z')
  assert.equal(plan.notificationsScheduled, false)
  assert.deepEqual(createEchoA4cReviewPlan(receipt, time), plan)
})

test('legacy receipt never invents missed skills from attempt count', () => {
  const plan = createEchoA4cReviewPlan(createEchoA4cCompletionReceipt({ attempts: 5, answers }), time)
  assert.equal(plan.basis, 'legacy-history-unavailable')
  assert.equal(plan.focus.length, 3)
  assert.deepEqual(plan.reviews.map(item => item.afterDays), [3, 7, 14])
})

test('invalid evidence and dates are rejected, due boundary is inclusive', () => {
  assert.throws(() => createEchoA4cReviewPlan({}, time))
  const receipt = createEchoA4cCompletionReceipt({ attempts: 1, answers })
  assert.throws(() => createEchoA4cReviewPlan(receipt, 'yesterday'))
  assert.equal(getEchoA4cReviewStatus(time, time), 'due')
  assert.equal(getEchoA4cReviewStatus(time, '2026-12-31T22:59:59.999Z'), 'upcoming')
  assert.throws(() => getEchoA4cReviewStatus('invalid', time))
})
