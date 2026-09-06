import test from 'node:test'
import assert from 'node:assert/strict'
import {
  enqueueEchoEvidence,
  flushEchoEvidenceQueue,
  echoEvidenceQueueHealth,
} from '../app/lib/competency/echoOfflineEvidenceQueue.ts'

const event = {
  eventId: 'user-1:case-1:task-1:1.0:2026-09-06T10:00:00Z',
  userId: 'user-1',
  caseId: 'case-1',
  taskId: 'task-1',
  taskVersion: '1.0',
  skillId: 'echo.view.a4c-recognition',
  selectedAnswer: 'a4c',
  normalizedScore: 100,
  confidence: 4,
  responseTimeMs: 4000,
  observedAt: '2026-09-06T10:00:00Z',
}

const projection = {
  userId: 'user-1',
  skillId: 'echo.view.a4c-recognition',
  evidenceCount: 1,
  score: 100,
  confidenceCalibration: 100,
  band: 'mastered',
  lastObservedAt: '2026-09-06T10:00:00Z',
  projectedAt: '2026-09-06T10:00:00Z',
}

const queued = { event, projection, queuedAt: '2026-09-06T10:00:01Z' }

test('queue deduplicates by immutable event id', () => {
  const once = enqueueEchoEvidence({ items: [] }, queued)
  const twice = enqueueEchoEvidence(once, queued)
  assert.equal(once.items.length, 1)
  assert.equal(twice.items.length, 1)
})

test('offline flush leaves evidence intact without a persistence port', async () => {
  const state = enqueueEchoEvidence({ items: [] }, queued)
  const output = await flushEchoEvidenceQueue({
    state,
    port: null,
    attemptedAt: '2026-09-06T10:01:00Z',
  })
  assert.equal(output.state.items.length, 1)
  assert.deepEqual(output.persistedEventIds, [])
  assert.deepEqual(output.failedEventIds, [event.eventId])
})

test('failed flush increments retry metadata without losing evidence', async () => {
  const state = enqueueEchoEvidence({ items: [] }, queued)
  const output = await flushEchoEvidenceQueue({
    state,
    port: {
      async appendEvent() { throw new Error('network') },
      async upsertProjection() {},
    },
    attemptedAt: '2026-09-06T10:01:00Z',
  })
  assert.equal(output.state.items[0].attempts, 1)
  assert.equal(output.state.items[0].lastAttemptAt, '2026-09-06T10:01:00Z')
  assert.equal(echoEvidenceQueueHealth(output.state).retrying, 1)
})

test('healthy flush writes evidence before projection and clears queue', async () => {
  const calls = []
  const state = enqueueEchoEvidence({ items: [] }, queued)
  const output = await flushEchoEvidenceQueue({
    state,
    port: {
      async appendEvent(value) { calls.push(['event', value.eventId]) },
      async upsertProjection(value) { calls.push(['projection', value.skillId]) },
    },
    attemptedAt: '2026-09-06T10:01:00Z',
  })
  assert.deepEqual(calls.map(call => call[0]), ['event', 'projection'])
  assert.equal(output.state.items.length, 0)
  assert.deepEqual(output.persistedEventIds, [event.eventId])
})
