import test from 'node:test'
import assert from 'node:assert/strict'
import { validateEchoA4cCompetencyTasks } from '../app/lib/competency/echoA4cCompetencyTasks.ts'
import { submitEchoPreviewCompetency } from '../app/lib/competency/echoPreviewCompetencySession.ts'

test('governed A4C competency tasks validate against skill and case contracts', () => {
  assert.doesNotThrow(() => validateEchoA4cCompetencyTasks())
})

test('preview submission produces deterministic mastery without requiring persistence', async () => {
  const output = await submitEchoPreviewCompetency({
    userId: 'preview-session',
    taskId: 'echo-a4c-view-identity-v1',
    selectedOptionId: 'apical-four-chamber',
    confidence: 4,
    responseTimeMs: 3500,
    attemptedAt: '2026-09-06T10:00:00Z',
  })

  assert.equal(output.result.correct, true)
  assert.equal(output.result.normalizedScore, 100)
  assert.equal(output.mastery.skillId, 'echo.view.a4c-recognition')
  assert.equal(output.mastery.band, 'mastered')
  assert.equal(output.persistenceState, 'persistence-unavailable')
})

test('incorrect preview answer remains valid evidence rather than throwing', async () => {
  const output = await submitEchoPreviewCompetency({
    userId: 'preview-session',
    taskId: 'echo-a4c-view-identity-v1',
    selectedOptionId: 'parasternal-long-axis',
    confidence: 5,
    responseTimeMs: 2800,
    attemptedAt: '2026-09-06T10:00:00Z',
  })

  assert.equal(output.result.correct, false)
  assert.equal(output.result.normalizedScore, 0)
  assert.equal(output.mastery.band, 'novice')
})
