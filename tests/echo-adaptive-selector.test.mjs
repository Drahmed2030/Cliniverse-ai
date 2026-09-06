import test from 'node:test'
import assert from 'node:assert/strict'
import { selectNextEchoCase } from '../app/lib/competency/echoAdaptiveSelector.ts'

test('adaptive selection targets the weakest unlocked learner-ready skill', () => {
  const selection = selectNextEchoCase({
    now: '2026-09-06T12:00:00.000Z',
    masteries: [
      { skillId: 'echo.view.a4c-recognition', evidenceCount: 3, score: 80, confidenceCalibration: 80, band: 'proficient', lastObservedAt: '2026-09-05T12:00:00.000Z' },
      { skillId: 'echo.anatomy.a4c-landmarks', evidenceCount: 1, score: 40, confidenceCalibration: 60, band: 'novice', lastObservedAt: '2026-09-01T12:00:00.000Z' },
    ],
    candidates: [
      { caseId: 'case-view', skillId: 'echo.view.a4c-recognition', difficulty: 'foundation', qaState: 'learner-ready', qualityScore: 95, lastSeenAt: '2026-09-05T12:00:00.000Z' },
      { caseId: 'case-landmarks', skillId: 'echo.anatomy.a4c-landmarks', difficulty: 'foundation', qaState: 'learner-ready', qualityScore: 95, lastSeenAt: null },
    ],
  })

  assert.equal(selection?.caseId, 'case-landmarks')
  assert.equal(selection?.reason, 'target-weak-skill')
})

test('adaptive selection never selects preview-only or blocked content', () => {
  const selection = selectNextEchoCase({
    now: '2026-09-06T12:00:00.000Z',
    masteries: [],
    candidates: [
      { caseId: 'preview', skillId: 'echo.view.a4c-recognition', difficulty: 'foundation', qaState: 'clinical-review-required', qualityScore: 99 },
      { caseId: 'blocked', skillId: 'echo.view.a4c-recognition', difficulty: 'foundation', qaState: 'blocked', qualityScore: 99 },
    ],
  })
  assert.equal(selection, null)
})
