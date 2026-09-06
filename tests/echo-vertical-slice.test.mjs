import test from 'node:test'
import assert from 'node:assert/strict'
import { completeEchoCompetencyInteraction } from '../app/lib/competency/echoVerticalSlice.ts'

const result = {
  taskId: 'echo-a4c-view-v1',
  skillId: 'echo.view.a4c-recognition',
  selectedAnswer: 'a4c',
  normalizedScore: 100,
  confidence: 4,
  responseTimeMs: 4200,
}

test('vertical slice derives mastery even when persistence is unavailable', async () => {
  const output = await completeEchoCompetencyInteraction({
    userId: 'user-1',
    caseId: 'echo-a4c-normal-cardionetworks-v1-en',
    taskVersion: '1.0.0',
    result,
    observedAt: '2026-09-06T10:00:00Z',
    priorEvidence: [],
    persistencePort: null,
  })

  assert.equal(output.mastery.score, 100)
  assert.equal(output.mastery.band, 'mastered')
  assert.equal(output.persisted, false)
  assert.equal(output.degradedReason, 'persistence-unavailable')
})

test('vertical slice keeps the scored interaction when persistence throws', async () => {
  const failingPort = {
    async appendEvent() { throw new Error('offline') },
    async upsertProjection() { throw new Error('offline') },
  }

  const output = await completeEchoCompetencyInteraction({
    userId: 'user-1',
    caseId: 'echo-a4c-normal-cardionetworks-v1-en',
    taskVersion: '1.0.0',
    result,
    observedAt: '2026-09-06T10:00:00Z',
    priorEvidence: [],
    persistencePort: failingPort,
  })

  assert.equal(output.mastery.band, 'mastered')
  assert.equal(output.persisted, false)
  assert.equal(output.degradedReason, 'persistence-error')
})

test('vertical slice persists event before projection when storage is healthy', async () => {
  const calls = []
  const healthyPort = {
    async appendEvent(event) { calls.push(['event', event.eventId]) },
    async upsertProjection(projection) { calls.push(['projection', projection.skillId]) },
  }

  const output = await completeEchoCompetencyInteraction({
    userId: 'user-1',
    caseId: 'echo-a4c-normal-cardionetworks-v1-en',
    taskVersion: '1.0.0',
    result,
    observedAt: '2026-09-06T10:00:00Z',
    priorEvidence: [],
    persistencePort: healthyPort,
  })

  assert.equal(output.persisted, true)
  assert.equal(output.degradedReason, null)
  assert.deepEqual(calls.map(call => call[0]), ['event', 'projection'])
})
