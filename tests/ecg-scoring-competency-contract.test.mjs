import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildEcgSkillScoreTelemetryV1,
  describeEcgScoringCompetencyContractV1,
  evaluateEcgScoringAttemptV1,
} from '../app/lib/clinicalIntelligence/ecgScoringCompetencyContract.ts'
import { validateCompetencyTelemetryEvent } from '../app/lib/clinicalIntelligence/unifiedCompetencyTelemetryContract.ts'

function attempt(overrides = {}) {
  return {
    scoringVersion: '1.0.0',
    caseId: 'ecg-case-1',
    attemptId: 'attempt-1',
    learnerId: 'learner-1',
    gateState: 'LEARNER_ELIGIBLE',
    referenceAuthority: 'HUMAN_REVIEWED',
    humanClinicalAttestationId: 'clinical-attestation-1',
    dimensions: [
      { skillId: 'rhythm-recognition', weight: 2, score: 1 },
      { skillId: 'rate-assessment', weight: 1, score: 0.8 },
      { skillId: 'qt-qtc-assessment', weight: 1, score: 0.6 },
    ],
    confidence: 0.9,
    ...overrides,
  }
}

test('scores an eligible ECG attempt deterministically with normalized weighted output', () => {
  const result = evaluateEcgScoringAttemptV1(attempt())
  assert.equal(result.decision, 'SCORED')
  assert.equal(result.overallScore, 0.85)
  assert.equal(result.outcome, 'PASS')
  assert.equal(result.skillScores.length, 3)
  assert.equal(result.confidence, 0.9)
})

test('confidence is captured separately and cannot change correctness scoring', () => {
  const high = evaluateEcgScoringAttemptV1(attempt({ confidence: 1 }))
  const low = evaluateEcgScoringAttemptV1(attempt({ confidence: 0 }))
  assert.equal(high.overallScore, low.overallScore)
  assert.equal(high.outcome, low.outcome)
})

test('fails closed when governance has not made the case learner eligible', () => {
  const held = evaluateEcgScoringAttemptV1(attempt({ gateState: 'HOLD' }))
  assert.equal(held.decision, 'HOLD')
  assert.equal(held.overallScore, null)
  assert.equal(held.outcome, 'NOT_SCORED')
  assert.ok(held.blockers.includes('case-not-learner-eligible'))

  const rejected = evaluateEcgScoringAttemptV1(attempt({ gateState: 'REJECTED' }))
  assert.equal(rejected.decision, 'REJECT')
  assert.equal(rejected.outcome, 'NOT_SCORED')
})

test('rejects malformed rubric values and duplicate skills instead of normalizing silently', () => {
  const malformed = evaluateEcgScoringAttemptV1(attempt({
    dimensions: [
      { skillId: 'rate-assessment', weight: 0, score: 2 },
      { skillId: 'rate-assessment', weight: 1, score: Number.NaN },
    ],
  }))
  assert.equal(malformed.decision, 'HOLD')
  assert.ok(malformed.blockers.includes('duplicate-skill-id'))
  assert.ok(malformed.blockers.includes('weight-invalid:rate-assessment'))
  assert.ok(malformed.blockers.includes('score-out-of-range:rate-assessment'))
})

test('critical miss can fail the aggregate outcome without mutating numeric skill evidence', () => {
  const result = evaluateEcgScoringAttemptV1(attempt({
    dimensions: [
      { skillId: 'rhythm-recognition', weight: 1, score: 1 },
      { skillId: 'high-risk-pattern-recognition', weight: 1, score: 1, criticalMiss: true },
    ],
  }))
  assert.equal(result.overallScore, 1)
  assert.equal(result.outcome, 'FAIL')
  assert.equal(result.skillScores[1].criticalMiss, true)
})

test('builds unified ECG SKILL_SCORED telemetry only from a successfully scored attempt', () => {
  const sourceAttempt = attempt()
  const result = evaluateEcgScoringAttemptV1(sourceAttempt)
  const events = buildEcgSkillScoreTelemetryV1(sourceAttempt, result, {
    occurredAt: '2026-09-09T12:00:00Z',
    evidenceEventIds: ['governance-event-1'],
    algorithmId: 'ecg-scoring-v1',
    algorithmVersion: '1.0.0',
  })
  assert.equal(events.length, 3)
  for (const event of events) {
    assert.equal(event.modality, 'ECG')
    assert.equal(event.eventKind, 'SKILL_SCORED')
    assert.equal(validateCompetencyTelemetryEvent(event).valid, true)
  }

  const heldResult = evaluateEcgScoringAttemptV1(attempt({ gateState: 'HOLD' }))
  assert.deepEqual(buildEcgSkillScoreTelemetryV1(sourceAttempt, heldResult, {
    occurredAt: '2026-09-09T12:00:00Z',
    evidenceEventIds: [],
    algorithmId: 'ecg-scoring-v1',
    algorithmVersion: '1.0.0',
  }), [])
})

test('contract keeps human-reviewed reference truth and mastery updates as separate boundaries', () => {
  const contract = describeEcgScoringCompetencyContractV1()
  assert.equal(contract.humanReviewedReferenceRequired, true)
  assert.equal(contract.sourceDatasetLabelsAreNotFinalAuthority, true)
  assert.equal(contract.confidenceSeparatedFromCorrectness, true)
  assert.equal(contract.masteryUpdatesProducedHere, false)
  assert.equal(contract.unifiedTelemetryCompatible, true)
})
