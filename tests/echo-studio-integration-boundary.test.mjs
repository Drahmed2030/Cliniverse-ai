import test from 'node:test'
import assert from 'node:assert/strict'
import {
  persistEchoCompetencySafely,
  projectEchoStudioSession,
  resolveSafeEchoResume,
} from '../app/lib/competency/echoStudioIntegrationBoundary.ts'

const study = {
  schemaVersion: '1.0',
  studyId: 'echo-study-demo',
  title: 'Echo study demo',
  studyType: 'full-echo-study',
  modality: 'echo',
  intendedUse: 'education-only',
  clips: [
    {
      clipId: 'clip-a4c',
      assetId: 'asset-a4c',
      order: 1,
      view: 'A4C',
      label: 'A4C',
      kind: 'cine',
      mediaPath: '/clinical-media/echo/a4c.mp4',
      qaState: 'learner-ready',
      skillIds: ['echo.view.a4c-recognition'],
      assessmentTaskIds: ['task-a4c'],
      durationMs: 1000,
    },
    {
      clipId: 'clip-plax',
      assetId: 'asset-plax',
      order: 2,
      view: 'PLAX',
      label: 'PLAX',
      kind: 'cine',
      mediaPath: '/clinical-media/echo/plax.mp4',
      qaState: 'learner-ready',
      skillIds: ['echo.view.a4c-recognition'],
      assessmentTaskIds: [],
      durationMs: 1000,
    },
  ],
}

test('studio core navigation remains available when competency services are absent', () => {
  const projection = projectEchoStudioSession({
    core: { study, activeClipId: 'clip-a4c' },
    now: '2026-09-06T10:00:00Z',
    masteries: null,
    adaptiveCandidates: null,
    persistenceHealthy: false,
  })

  assert.equal(projection.core.nextClipId, 'clip-plax')
  assert.equal(projection.core.position, 1)
  assert.equal(projection.core.total, 2)
  assert.equal(projection.enhancement.recommendedNextCase, null)
  assert.deepEqual(projection.enhancement.degradedReasons.sort(), [
    'adaptive-unavailable',
    'competency-unavailable',
    'persistence-unavailable',
  ])
})

test('persistence failure degrades safely instead of breaking the studio', async () => {
  const result = await persistEchoCompetencySafely({
    port: {
      appendEvent: async () => { throw new Error('offline') },
      upsertProjection: async () => { throw new Error('offline') },
    },
    event: {
      eventId: 'event-1',
      userId: 'user-1',
      caseId: 'case-1',
      taskId: 'task-1',
      taskVersion: '1.0.0',
      skillId: 'echo.view.a4c-recognition',
      selectedAnswer: 'a4c',
      normalizedScore: 100,
      confidence: 5,
      responseTimeMs: 1000,
      observedAt: '2026-09-06T10:00:00Z',
    },
    projection: {
      userId: 'user-1',
      skillId: 'echo.view.a4c-recognition',
      evidenceCount: 1,
      score: 100,
      confidenceCalibration: 100,
      band: 'mastered',
      lastObservedAt: '2026-09-06T10:00:00Z',
      projectedAt: '2026-09-06T10:00:00Z',
    },
  })

  assert.deepEqual(result, { persisted: false, degradedReason: 'persistence-error' })
})

test('resume falls back to the first ordered clip when prior progress is unknown', () => {
  assert.equal(resolveSafeEchoResume(study, 'missing-clip'), 'clip-a4c')
})
