import test from 'node:test'
import assert from 'node:assert/strict'

import {
  EVIDENCE_TRUST_BOUNDARY,
  absenceCanBeInterpretedAsNegative,
  evidenceUseDecision,
} from '../app/lib/trust/evidenceTrust.ts'
import {
  CLINIVERSE_SAFETY_CASE_BOUNDARY,
  clinicalSafetyReadiness,
} from '../app/lib/safety/clinicalSafetyCase.ts'
import {
  CLINICAL_REASONING_PROFILE_BOUNDARY,
  buildClinicalReasoningProfile,
} from '../app/lib/competency/clinicalReasoningProfile.ts'

test('evidence trust fails closed and never converts absence into a negative finding', () => {
  assert.equal(absenceCanBeInterpretedAsNegative('unknown'), false)
  assert.equal(absenceCanBeInterpretedAsNegative('permission-limited'), false)
  assert.equal(EVIDENCE_TRUST_BOUNDARY.defaultDecision, 'fail-closed')

  assert.deepEqual(
    evidenceUseDecision({
      availability: 'available',
      freshness: 'current',
      verification: 'verified',
      sourceAuthority: 'cliniverse-governed',
      provenanceRef: 'evidence://ecg/example/v1',
    }),
    { usable: true, reasons: [] },
  )

  const blocked = evidenceUseDecision({
    availability: 'permission-limited',
    freshness: 'unknown',
    verification: 'unknown',
    sourceAuthority: 'health-cloud-context',
  })

  assert.equal(blocked.usable, false)
  assert.deepEqual(blocked.reasons, [
    'availability-not-confirmed',
    'freshness-not-confirmed',
    'verification-not-confirmed',
    'provenance-required',
  ])
})

test('clinical safety case blocks open high-severity hazards', () => {
  const result = clinicalSafetyReadiness({
    product: 'cliniverse',
    version: '1',
    hazards: [
      {
        id: 'hazard-1',
        title: 'Stale evidence presented as current',
        description: 'Educational decision could be based on stale evidence.',
        severity: 'high',
        state: 'open',
        ownerRole: 'clinical-safety-owner',
        mitigationRefs: [],
        evidenceRefs: [],
        deploymentSpecific: false,
      },
    ],
    assumptions: [],
    humanReviewBoundary: ['learner-ready promotion requires governed review'],
    deploymentNotes: [],
  })

  assert.equal(result.readyForProductReview, false)
  assert.deepEqual(result.blockers, ['open-high-hazard:hazard-1'])
  assert.equal(CLINIVERSE_SAFETY_CASE_BOUNDARY.claimsCompliance, false)
})

test('mitigated safety hazards require mitigation and verification evidence', () => {
  const result = clinicalSafetyReadiness({
    product: 'cliniverse',
    version: '1',
    hazards: [
      {
        id: 'hazard-2',
        title: 'Unknown source provenance',
        description: 'Content source cannot be established.',
        severity: 'moderate',
        state: 'mitigated',
        ownerRole: 'content-governance',
        mitigationRefs: [],
        evidenceRefs: [],
        deploymentSpecific: false,
      },
    ],
    assumptions: [],
    humanReviewBoundary: ['review required'],
    deploymentNotes: [],
  })

  assert.equal(result.readyForProductReview, false)
  assert.deepEqual(result.blockers, ['mitigation-evidence-missing:hazard-2'])
})

test('reasoning profile refuses to imply competence from sparse observations', () => {
  const profile = buildClinicalReasoningProfile([
    {
      dimension: 'change-detection',
      outcome: 'demonstrated',
      occurredAt: '2026-09-26T10:00:00.000Z',
      evidenceRef: 'continuity://case-1/change-1',
      contentId: 'case-1',
    },
    {
      dimension: 'change-detection',
      outcome: 'demonstrated',
      occurredAt: '2026-09-26T11:00:00.000Z',
      evidenceRef: 'continuity://case-2/change-1',
      contentId: 'case-2',
    },
  ])

  const changeDetection = profile.dimensions.find(
    item => item.dimension === 'change-detection',
  )
  assert.equal(profile.competencyClaim, false)
  assert.equal(changeDetection.state, 'insufficient-evidence')
  assert.equal(
    CLINICAL_REASONING_PROFILE_BOUNDARY.isCompetencyCredential,
    false,
  )
})

test('reasoning profile describes repeated observed patterns only after enough evidence', () => {
  const profile = buildClinicalReasoningProfile([
    ['signal-recognition', 'demonstrated', '2026-09-26T10:00:00.000Z', 'e1'],
    ['signal-recognition', 'demonstrated', '2026-09-26T11:00:00.000Z', 'e2'],
    ['signal-recognition', 'partial', '2026-09-26T12:00:00.000Z', 'e3'],
  ].map(([dimension, outcome, occurredAt, evidenceRef], index) => ({
    dimension,
    outcome,
    occurredAt,
    evidenceRef,
    contentId: `case-${index + 1}`,
  })))

  const signal = profile.dimensions.find(
    item => item.dimension === 'signal-recognition',
  )

  assert.equal(signal.observationCount, 3)
  assert.equal(signal.state, 'consistent')
})
