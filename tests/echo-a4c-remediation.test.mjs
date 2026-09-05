import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateEchoA4cAttempt } from '../app/lib/codelab/echoA4cRemediation.ts'
import { ECHO_A4C_TRAINING_ACTIVITY, createEchoA4cCompletionReceipt, parseEchoA4cCompletionReceipt } from '../app/lib/codelab/echoA4cTrainingActivity.ts'

test('v1 remains readable; v2 preserves history and rejects history tampering', () => {
  const answers = { ...ECHO_A4C_TRAINING_ACTIVITY.assessment.correctAnswers }
  const legacy = createEchoA4cCompletionReceipt({ attempts: 1, answers })
  assert.deepEqual(parseEchoA4cCompletionReceipt(legacy), legacy)
  const wrong = { ...answers, 'safe-conclusion': 'exclude-all-pathology' }
  const receipt = createEchoA4cCompletionReceipt({ attempts: 2, answers, history: [wrong, answers] })
  assert.equal(receipt.schemaVersion, 2)
  assert.deepEqual(parseEchoA4cCompletionReceipt(receipt), receipt)
  wrong['safe-conclusion'] = answers['safe-conclusion']
  assert.equal(receipt.assessment.history[0]['safe-conclusion'], 'exclude-all-pathology')
  const tampered = structuredClone(receipt)
  tampered.assessment.history[0]['safe-conclusion'] = 'calculate-ejection-fraction'
  assert.equal(parseEchoA4cCompletionReceipt(tampered), null)
  assert.throws(() => createEchoA4cCompletionReceipt({ attempts: 2, answers, history: [answers] }))
  assert.throws(() => createEchoA4cCompletionReceipt({ attempts: 2, answers, history: [answers, answers] }))
})

test('remediation isolates a missed scope boundary and preserves the submitted snapshot', () => {
  const answers = { ...ECHO_A4C_TRAINING_ACTIVITY.assessment.correctAnswers, 'safe-conclusion': 'exclude-all-pathology' }
  const attempt = evaluateEchoA4cAttempt(answers)
  assert.deepEqual(attempt.missed, ['safe-conclusion'])
  assert.equal(attempt.correct, 2)
  answers['safe-conclusion'] = 'source-labeled-view-recognition-only'
  assert.equal(attempt.answers['safe-conclusion'], 'exclude-all-pathology')
  assert.equal(evaluateEchoA4cAttempt(answers).correct, 3)
})

test('all incorrect answers require review of all three skills', () => {
  const attempt = evaluateEchoA4cAttempt({ 'view-identity': 'parasternal-long-axis', 'visible-landmarks': 'aortic-arch-only', 'safe-conclusion': 'calculate-ejection-fraction' })
  assert.equal(attempt.correct, 0)
  assert.equal(attempt.missed.length, 3)
})
