import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_ECG_REVIEW_SCHEDULING_CONFIG_V1,
  buildEcgReviewScheduledTelemetryV1,
  describeEcgReviewSchedulingContractV1,
  scheduleEcgSkillReviewV1,
} from '../app/lib/clinicalIntelligence/ecgReviewSchedulingContract.ts'

function validInput(overrides = {}) {
  return {
    schedulingVersion: '1.0.0',
    learnerId: 'learner-1',
    skillId: 'ecg.rhythm.sinus',
    mastery: 0.78,
    band: 'PROFICIENT',
    evidenceCount: 4,
    lastObservedAt: '2026-09-09T10:00:00.000Z',
    asOf: '2026-09-09T12:00:00.000Z',
    ...overrides,
  }
}

test('schedules deterministic review interval from mastery band', () => {
  const result = scheduleEcgSkillReviewV1(validInput())
  assert.equal(result.decision, 'SCHEDULED')
  assert.equal(result.intervalDays, 30)
  assert.equal(result.reason, 'PROFICIENT')
  assert.equal(result.nextReviewAt, '2026-10-09T12:00:00.000Z')
})

test('critical miss shortens review interval without changing mastery input', () => {
  const input = validInput({ mastery: 0.92, band: 'MASTERED', recentCriticalMiss: true })
  const before = structuredClone(input)
  const result = scheduleEcgSkillReviewV1(input)
  assert.equal(result.intervalDays, 3)
  assert.equal(result.reason, 'CRITICAL_MISS')
  assert.deepEqual(input, before)
})

test('lower mastery bands schedule sooner than higher bands', () => {
  const novice = scheduleEcgSkillReviewV1(validInput({ mastery: 0.3, band: 'NOVICE' }))
  const developing = scheduleEcgSkillReviewV1(validInput({ mastery: 0.6, band: 'DEVELOPING' }))
  const mastered = scheduleEcgSkillReviewV1(validInput({ mastery: 0.94, band: 'MASTERED', evidenceCount: 6 }))
  assert.equal(novice.intervalDays, 7)
  assert.equal(developing.intervalDays, 14)
  assert.equal(mastered.intervalDays, 90)
})

test('fails closed on malformed learner, mastery, evidence or timing input', () => {
  const cases = [
    validInput({ learnerId: '' }),
    validInput({ mastery: Number.NaN }),
    validInput({ mastery: 1.2 }),
    validInput({ evidenceCount: 0 }),
    validInput({ lastObservedAt: 'not-a-date' }),
    validInput({ lastObservedAt: '2026-09-10T00:00:00.000Z' }),
  ]
  for (const candidate of cases) {
    assert.equal(scheduleEcgSkillReviewV1(candidate).decision, 'HOLD')
  }
})

test('fails closed on invalid scheduling configuration', () => {
  const invalid = {
    ...DEFAULT_ECG_REVIEW_SCHEDULING_CONFIG_V1,
    criticalMissIntervalDays: 20,
    maximumScheduleHorizonDays: 20,
  }
  const result = scheduleEcgSkillReviewV1(validInput(), invalid)
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('critical-miss-interval-must-not-exceed-novice'))
  assert.ok(result.blockers.includes('mastered-interval-exceeds-maximum-horizon'))
})

test('builds REVIEW_SCHEDULED telemetry compatible with unified contract', () => {
  const input = validInput()
  const result = scheduleEcgSkillReviewV1(input)
  const event = buildEcgReviewScheduledTelemetryV1(input, result, {
    caseId: 'case-1',
    attemptId: 'attempt-1',
    occurredAt: '2026-09-09T12:00:00.000Z',
    evidenceEventIds: ['evidence-1'],
    algorithmId: 'ecg-review-scheduler',
    algorithmVersion: '1.0.0',
  })
  assert.equal(event?.eventKind, 'REVIEW_SCHEDULED')
  assert.equal(event?.skillId, 'ecg.rhythm.sinus')
  assert.equal(event?.nextReviewAt, '2026-10-09T12:00:00.000Z')
  assert.equal(event?.modality, 'ECG')
})

test('contract keeps review scheduling separate from mastery and adaptive selection', () => {
  const description = describeEcgReviewSchedulingContractV1()
  assert.equal(description.masteryValueMutatedHere, false)
  assert.equal(description.learnerPromotionProducedHere, false)
  assert.equal(description.adaptiveCaseSelectionProducedHere, false)
  assert.equal(description.unifiedTelemetryCompatible, true)
})
