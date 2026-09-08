import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validateCompetencyTelemetryEvent,
  buildCrossModalityCompetencySnapshot,
} from '../app/lib/clinicalIntelligence/unifiedCompetencyTelemetryContract.ts'

function baseEvent(overrides = {}) {
  return {
    telemetryVersion: '1.0.0',
    eventId: 'evt-1',
    occurredAt: '2026-09-08T18:00:00Z',
    learnerId: 'learner-1',
    modality: 'ECHO',
    caseId: 'case-1',
    attemptId: 'attempt-1',
    eventKind: 'ATTEMPT_STARTED',
    evidenceEventIds: [],
    algorithmId: 'competency-engine',
    algorithmVersion: '1.0.0',
    ...overrides,
  }
}

test('valid Echo and ECG events share one telemetry contract', () => {
  const echo = validateCompetencyTelemetryEvent(baseEvent({ modality: 'ECHO' }))
  const ecg = validateCompetencyTelemetryEvent(baseEvent({ eventId: 'evt-2', modality: 'ECG' }))
  assert.equal(echo.valid, true)
  assert.equal(ecg.valid, true)
})

test('skill score fails closed without skill, score, or outcome', () => {
  const result = validateCompetencyTelemetryEvent(baseEvent({ eventKind: 'SKILL_SCORED' }))
  assert.equal(result.valid, false)
  assert.ok(result.blockers.includes('skill-id-required-for-score'))
  assert.ok(result.blockers.includes('score-required-for-skill-score'))
  assert.ok(result.blockers.includes('outcome-required-for-skill-score'))
})

test('normalized competency values are constrained to zero through one', () => {
  const result = validateCompetencyTelemetryEvent(baseEvent({
    eventKind: 'SKILL_SCORED',
    skillId: 'echo.lv-function',
    score: 1.2,
    outcome: 'PASS',
  }))
  assert.equal(result.valid, false)
  assert.ok(result.blockers.includes('score-out-of-range'))
})

test('mastery updates require a skill and before/after values', () => {
  const result = validateCompetencyTelemetryEvent(baseEvent({ eventKind: 'MASTERY_UPDATED' }))
  assert.equal(result.valid, false)
  assert.ok(result.blockers.includes('skill-id-required-for-mastery'))
  assert.ok(result.blockers.includes('mastery-before-required'))
  assert.ok(result.blockers.includes('mastery-after-required'))
})

test('cross-modality snapshot uses latest mastery per modality', () => {
  const events = [
    baseEvent({ eventId: 'e1', eventKind: 'MASTERY_UPDATED', modality: 'ECHO', skillId: 'echo.lv', masteryBefore: 0.4, masteryAfter: 0.6, occurredAt: '2026-09-08T10:00:00Z' }),
    baseEvent({ eventId: 'e2', eventKind: 'MASTERY_UPDATED', modality: 'ECHO', skillId: 'echo.lv', masteryBefore: 0.6, masteryAfter: 0.8, occurredAt: '2026-09-08T12:00:00Z' }),
    baseEvent({ eventId: 'e3', eventKind: 'MASTERY_UPDATED', modality: 'ECG', skillId: 'ecg.rhythm', masteryBefore: 0.3, masteryAfter: 0.7, occurredAt: '2026-09-08T11:00:00Z' }),
  ]
  const snapshot = buildCrossModalityCompetencySnapshot('learner-1', events)
  assert.equal(snapshot.modalityScores.ECHO, 0.8)
  assert.equal(snapshot.modalityScores.ECG, 0.7)
  assert.equal(snapshot.overallScore, 0.75)
})

test('cross-modality aggregation never fabricates a missing modality score', () => {
  const snapshot = buildCrossModalityCompetencySnapshot('learner-1', [
    baseEvent({ eventKind: 'MASTERY_UPDATED', modality: 'ECHO', skillId: 'echo.lv', masteryBefore: 0.2, masteryAfter: 0.5 }),
  ])
  assert.equal(snapshot.modalityScores.ECHO, 0.5)
  assert.equal(snapshot.modalityScores.ECG, null)
  assert.deepEqual(snapshot.contributingModalities, ['ECHO'])
  assert.equal(snapshot.overallScore, 0.5)
})
