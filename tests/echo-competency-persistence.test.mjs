import test from 'node:test'
import assert from 'node:assert/strict'
import {
  toEchoCompetencyEvent,
  toEchoMasteryProjection,
  validateEchoCompetencyEvent,
} from '../app/lib/competency/echoPersistenceContract.ts'

test('competency events are deterministic, versioned and auditable', () => {
  const result = {
    taskId: 'echo-a4c-view-task-v1',
    skillId: 'echo.view.a4c-recognition',
    selectedAnswer: 'A4C',
    normalizedScore: 100,
    confidence: 4,
    responseTimeMs: 3200,
  }
  const event = toEchoCompetencyEvent({
    userId: 'user-1',
    caseId: 'echo-a4c-normal-cardionetworks-v1-en',
    taskVersion: '1.0.0',
    result,
    observedAt: '2026-09-06T10:00:00.000Z',
  })

  assert.match(event.eventId, /user-1:echo-a4c-normal-cardionetworks-v1-en/)
  assert.equal(event.taskVersion, '1.0.0')
  assert.doesNotThrow(() => validateEchoCompetencyEvent(event))
})

test('invalid confidence fails closed', () => {
  const event = {
    eventId: 'bad',
    userId: 'user-1',
    caseId: 'case-1',
    taskId: 'task-1',
    taskVersion: '1',
    skillId: 'echo.view.a4c-recognition',
    selectedAnswer: 'A4C',
    normalizedScore: 100,
    confidence: 9,
    responseTimeMs: 1000,
    observedAt: '2026-09-06T10:00:00.000Z',
  }
  assert.throws(() => validateEchoCompetencyEvent(event), /confidence/i)
})

test('mastery projections remain recomputable from evidence', () => {
  const projection = toEchoMasteryProjection('user-1', {
    skillId: 'echo.view.a4c-recognition',
    evidenceCount: 3,
    score: 88,
    confidenceCalibration: 90,
    band: 'proficient',
    lastObservedAt: '2026-09-06T10:00:00.000Z',
  }, '2026-09-06T10:05:00.000Z')

  assert.equal(projection.userId, 'user-1')
  assert.equal(projection.band, 'proficient')
  assert.equal(projection.evidenceCount, 3)
})
