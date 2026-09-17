import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_ECG_MASTERY_CONFIG_V1,
  buildEcgMasteryUpdatedTelemetryV1,
  describeEcgLongitudinalMasteryContractV1,
  updateEcgSkillMasteryV1,
} from '../app/lib/clinicalIntelligence/ecgLongitudinalMasteryContract.ts'
import { validateCompetencyTelemetryEvent } from '../app/lib/clinicalIntelligence/unifiedCompetencyTelemetryContract.ts'

const baseEvidence = [
  {
    eventId: 'skill-1',
    learnerId: 'learner-1',
    skillId: 'sinus-rhythm-recognition',
    score: 0.6,
    occurredAt: '2026-06-01T00:00:00Z',
    evidenceEventIds: ['ledger-1'],
  },
  {
    eventId: 'skill-2',
    learnerId: 'learner-1',
    skillId: 'sinus-rhythm-recognition',
    score: 0.8,
    occurredAt: '2026-08-01T00:00:00Z',
    evidenceEventIds: ['ledger-2'],
  },
  {
    eventId: 'skill-3',
    learnerId: 'learner-1',
    skillId: 'sinus-rhythm-recognition',
    score: 1,
    occurredAt: '2026-09-01T00:00:00Z',
    evidenceEventIds: ['ledger-3'],
  },
]

test('longitudinal mastery applies deterministic recency weighting', () => {
  const result = updateEcgSkillMasteryV1(null, baseEvidence, '2026-09-09T00:00:00Z')
  assert.equal(result.decision, 'UPDATED')
  assert.ok(result.updatedMastery > 0.8)
  assert.ok(result.updatedMastery < 1)
  assert.equal(result.band, 'PROFICIENT')
})

test('higher mastery bands require repeated evidence, not one strong attempt', () => {
  const result = updateEcgSkillMasteryV1(null, [
    { ...baseEvidence[2], score: 1 },
  ], '2026-09-09T00:00:00Z')
  assert.equal(result.decision, 'UPDATED')
  assert.equal(result.updatedMastery, 1)
  assert.notEqual(result.band, 'MASTERED')
  assert.notEqual(result.band, 'PROFICIENT')
})

test('mixed learner or skill evidence fails closed', () => {
  const mixedLearner = updateEcgSkillMasteryV1(null, [
    baseEvidence[0],
    { ...baseEvidence[1], learnerId: 'learner-2' },
  ], '2026-09-09T00:00:00Z')
  assert.ok(mixedLearner.blockers.includes('mixed-learner-evidence'))

  const mixedSkill = updateEcgSkillMasteryV1(null, [
    baseEvidence[0],
    { ...baseEvidence[1], skillId: 'qrs-duration-assessment' },
  ], '2026-09-09T00:00:00Z')
  assert.ok(mixedSkill.blockers.includes('mixed-skill-evidence'))
})

test('future evidence, duplicate ids and malformed scores are rejected', () => {
  const future = updateEcgSkillMasteryV1(null, [
    { ...baseEvidence[0], occurredAt: '2027-01-01T00:00:00Z' },
  ], '2026-09-09T00:00:00Z')
  assert.ok(future.blockers.some(blocker => blocker.startsWith('future-evidence-not-allowed:')))

  const duplicate = updateEcgSkillMasteryV1(null, [baseEvidence[0], { ...baseEvidence[1], eventId: 'skill-1' }], '2026-09-09T00:00:00Z')
  assert.ok(duplicate.blockers.includes('duplicate-evidence-event-id'))

  const malformed = updateEcgSkillMasteryV1(null, [{ ...baseEvidence[0], score: Number.NaN }], '2026-09-09T00:00:00Z')
  assert.ok(malformed.blockers.some(blocker => blocker.startsWith('score-out-of-range:')))
})

test('mastery update telemetry is compatible with unified competency telemetry', () => {
  const result = updateEcgSkillMasteryV1(null, baseEvidence, '2026-09-09T00:00:00Z')
  const event = buildEcgMasteryUpdatedTelemetryV1(
    null,
    'learner-1',
    'sinus-rhythm-recognition',
    result,
    {
      caseId: 'ecg-governed-case-001',
      attemptId: 'attempt-1',
      occurredAt: '2026-09-09T00:00:00Z',
      evidenceEventIds: baseEvidence.map(item => item.eventId),
      algorithmId: 'ecg-longitudinal-mastery',
      algorithmVersion: '1.0.0',
    },
  )
  assert.ok(event)
  assert.equal(event.eventKind, 'MASTERY_UPDATED')
  assert.equal(validateCompetencyTelemetryEvent(event).valid, true)
})

test('previous state must match learner and skill and remain in range', () => {
  const previous = {
    masteryVersion: '1.0.0',
    learnerId: 'learner-2',
    skillId: 'sinus-rhythm-recognition',
    mastery: 1.2,
    band: 'MASTERED',
    evidenceCount: 5,
    lastObservedAt: '2026-08-01T00:00:00Z',
    algorithmId: 'old',
    algorithmVersion: '1.0.0',
  }
  const result = updateEcgSkillMasteryV1(previous, baseEvidence, '2026-09-09T00:00:00Z')
  assert.ok(result.blockers.includes('previous-mastery-out-of-range'))
  assert.ok(result.blockers.includes('previous-learner-mismatch'))
})

test('contract keeps review scheduling separate and exposes explicit defaults', () => {
  const contract = describeEcgLongitudinalMasteryContractV1()
  assert.equal(contract.reviewSchedulingProducedHere, false)
  assert.equal(contract.explicitRecencyHalfLife, true)
  assert.equal(contract.unifiedTelemetryCompatible, true)
  assert.equal(DEFAULT_ECG_MASTERY_CONFIG_V1.halfLifeDays, 90)
})
