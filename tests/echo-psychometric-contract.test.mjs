import test from 'node:test'
import assert from 'node:assert/strict'
import { deriveEchoUncertaintySignal, validateEchoPsychometricItemMetadata } from '../app/lib/competency/echoPsychometricContract.ts'

const mastery = {
  skillId: 'echo.view.a4c-recognition',
  evidenceCount: 4,
  score: 75,
  confidenceCalibration: 80,
  band: 'proficient',
  lastObservedAt: '2026-09-06T10:00:00Z',
}

test('uncertainty falls as evidence accumulates and remains interpretable', () => {
  const signal = deriveEchoUncertaintySignal({ mastery })
  assert.equal(signal.masteryEstimate, 0.75)
  assert.equal(signal.uncertainty, 0.5)
  assert.equal(signal.evidenceCount, 4)
})

test('wrong high-confidence response becomes a priority calibration signal', () => {
  const signal = deriveEchoUncertaintySignal({
    mastery,
    latestResult: {
      taskId: 'task-1', skillId: mastery.skillId, rawScore: 0, normalizedScore: 0,
      confidence: 5, responseTimeMs: 2200, correct: false,
    },
    misconceptions: ['view-confusion'],
  })
  assert.equal(signal.highConfidenceError, true)
  assert.deepEqual(new Set(signal.misconceptionCodes), new Set(['view-confusion','confidence-miscalibration']))
})

test('psychometric metadata accepts future calibration fields without requiring them now', () => {
  assert.doesNotThrow(() => validateEchoPsychometricItemMetadata({
    itemId: 'echo-a4c-view-identity-v1', itemVersion: '1.0.0', skillId: mastery.skillId,
    difficultyEstimate: null, discriminationEstimate: null, calibrationSampleSize: 0,
  }))
})
