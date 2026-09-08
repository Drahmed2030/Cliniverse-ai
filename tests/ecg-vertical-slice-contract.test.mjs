import test from 'node:test'
import assert from 'node:assert/strict'
import {
  describeEcgVerticalSliceBoundary,
  evaluateEcgVerticalSlice,
} from '../app/lib/clinicalIntelligence/ecgVerticalSliceContract.ts'

const telemetry = [{
  eventId: 'telemetry-ecg-1',
  learnerId: 'learner-1',
  modality: 'ECG',
  caseId: 'ecg-case-1',
  skillId: 'ecg-rhythm-recognition',
  eventKind: 'MASTERY_UPDATED',
  occurredAt: '2026-09-08T18:00:00Z',
  score01: 0.8,
  confidence01: 0.7,
  mastery01: 0.75,
  algorithm: { family: 'pattern-scoring', version: '1.0.0' },
  evidenceRefs: ['evidence-1'],
}]

function input(overrides = {}) {
  return {
    caseId: 'ecg-case-1',
    stage: 'GOVERNED_CASE',
    calibration: {
      paperSpeedMmPerSec: 25,
      gainMmPerMv: 10,
      leadCount: 12,
      rhythmStripLead: 'II',
    },
    source: {
      sourceKind: 'LICENSED_DATASET',
      sourceId: 'ptb-xl-candidate',
      sourceVersion: 'candidate-v1',
      provenanceVerified: true,
      licenseVerified: true,
      commercialUseAllowed: true,
      attributionRequired: true,
      attributionPlanPresent: true,
      containsPatientIdentifiers: false,
    },
    clinicalReview: {
      reviewerId: 'clinical-reviewer',
      reviewed: true,
      approved: true,
      findingScope: ['rhythm', 'rate', 'axis', 'intervals', 'morphology'],
    },
    skillIds: ['ecg-rhythm-recognition'],
    telemetry,
    ...overrides,
  }
}

test('governed licensed 12-lead ECG can become a governed case candidate but never learner ready automatically', () => {
  const result = evaluateEcgVerticalSlice(input())
  assert.equal(result.decision, 'READY_FOR_GOVERNED_CASE')
  assert.equal(result.learnerReady, false)
  assert.equal(result.telemetryBound, true)
  assert.deepEqual(result.blockers, [])
})

test('existing synthetic ECG stays preview-only', () => {
  const result = evaluateEcgVerticalSlice(input({
    source: { ...input().source, sourceKind: 'SYNTHETIC' },
  }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('synthetic-source-preview-only'))
})

test('non-12-lead ECG holds fail closed', () => {
  const result = evaluateEcgVerticalSlice(input({
    calibration: { ...input().calibration, leadCount: 4 },
  }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('twelve-lead-ecg-required'))
})

test('patient identifiers or disallowed commercial use reject the case', () => {
  assert.equal(evaluateEcgVerticalSlice(input({
    source: { ...input().source, containsPatientIdentifiers: true },
  })).decision, 'REJECT')
  assert.equal(evaluateEcgVerticalSlice(input({
    source: { ...input().source, commercialUseAllowed: false },
  })).decision, 'REJECT')
})

test('human clinical review and ECG telemetry are required beyond preview', () => {
  const noReview = evaluateEcgVerticalSlice(input({
    clinicalReview: { reviewerId: undefined, reviewed: false, approved: false, findingScope: [] },
  }))
  assert.equal(noReview.decision, 'HOLD')
  assert.ok(noReview.blockers.includes('human-clinical-review-required'))

  const noTelemetry = evaluateEcgVerticalSlice(input({ telemetry: [] }))
  assert.equal(noTelemetry.decision, 'HOLD')
  assert.ok(noTelemetry.blockers.includes('ecg-telemetry-binding-required'))
})

test('boundary explicitly forbids synthetic learner promotion and auto learner readiness', () => {
  const boundary = describeEcgVerticalSliceBoundary()
  assert.equal(boundary.syntheticPreviewAllowed, true)
  assert.equal(boundary.syntheticLearnerPromotionAllowed, false)
  assert.equal(boundary.licensedDatasetRequiredForGovernedCase, true)
  assert.equal(boundary.learnerAutoPromotionAllowed, false)
})
