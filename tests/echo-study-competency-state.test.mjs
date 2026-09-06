import test from 'node:test'
import assert from 'node:assert/strict'
import { createEchoStudyCompetencyState, recordEchoClipCompetency, projectEchoStudyCompetencyProgress } from '../app/lib/competency/echoStudyCompetencyState.ts'

const study = {
  schemaVersion: '1.0', studyId: 'study-1', title: 'Full study preview', studyType: 'full-echo-study', modality: 'echo', intendedUse: 'education-only',
  clips: [
    { clipId: 'clip-1', assetId: 'asset-1', order: 1, view: 'A4C', label: 'A4C', kind: 'cine', mediaPath: '/clinical-media/echo/a4c.mp4', qaState: 'learner-ready', skillIds: ['echo.view.a4c-recognition'], assessmentTaskIds: ['task-1'] },
    { clipId: 'clip-2', assetId: 'asset-2', order: 2, view: 'PLAX', label: 'PLAX', kind: 'cine', mediaPath: '/clinical-media/echo/plax.mp4', qaState: 'learner-ready', skillIds: ['echo.view.a4c-recognition'], assessmentTaskIds: [] },
  ],
}

const mastery = { skillId: 'echo.view.a4c-recognition', evidenceCount: 1, score: 100, confidenceCalibration: 100, band: 'mastered', lastObservedAt: '2026-09-06T10:00:00Z' }

test('competency state is stored per clip without changing study navigation', () => {
  let state = createEchoStudyCompetencyState(study)
  state = recordEchoClipCompetency({ state, study, clipId: 'clip-1', mastery, taskId: 'task-1', updatedAt: '2026-09-06T10:00:00Z' })
  assert.equal(state.byClipId['clip-1'].masteries[0].band, 'mastered')
  assert.equal(state.byClipId['clip-2'], undefined)
})

test('repeated task evidence does not duplicate completion identity', () => {
  let state = createEchoStudyCompetencyState(study)
  state = recordEchoClipCompetency({ state, study, clipId: 'clip-1', mastery, taskId: 'task-1', updatedAt: '2026-09-06T10:00:00Z' })
  state = recordEchoClipCompetency({ state, study, clipId: 'clip-1', mastery, taskId: 'task-1', updatedAt: '2026-09-06T10:01:00Z' })
  assert.deepEqual(state.byClipId['clip-1'].completedTaskIds, ['task-1'])
})

test('study competency coverage remains separate from viewer progress', () => {
  let state = createEchoStudyCompetencyState(study)
  state = recordEchoClipCompetency({ state, study, clipId: 'clip-1', mastery, taskId: 'task-1', updatedAt: '2026-09-06T10:00:00Z' })
  const progress = projectEchoStudyCompetencyProgress(study, state)
  assert.equal(progress.coveragePercent, 50)
  assert.equal(progress.completedTasks, 1)
})
