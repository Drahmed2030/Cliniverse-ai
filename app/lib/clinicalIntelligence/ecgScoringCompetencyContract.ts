import type { CompetencyTelemetryEvent, CompetencyTelemetryOutcome } from './unifiedCompetencyTelemetryContract.ts'

export type EcgLearnerScoringGateState = 'LEARNER_ELIGIBLE' | 'HOLD' | 'REJECTED'
export type EcgScoringDecision = 'SCORED' | 'HOLD' | 'REJECT'

export interface EcgScoringDimensionV1 {
  skillId: string
  weight: number
  score: number
  criticalMiss?: boolean
}

export interface EcgScoringAttemptV1 {
  scoringVersion: '1.0.0'
  caseId: string
  attemptId: string
  learnerId: string
  gateState: EcgLearnerScoringGateState
  referenceAuthority: 'HUMAN_REVIEWED'
  humanClinicalAttestationId: string
  dimensions: readonly EcgScoringDimensionV1[]
  confidence?: number
}

export interface EcgSkillScoreV1 {
  skillId: string
  score: number
  weight: number
  outcome: CompetencyTelemetryOutcome
  criticalMiss: boolean
}

export interface EcgScoringResultV1 {
  decision: EcgScoringDecision
  overallScore: number | null
  outcome: CompetencyTelemetryOutcome
  skillScores: readonly EcgSkillScoreV1[]
  confidence: number | null
  blockers: readonly string[]
}

const PASS_THRESHOLD = 0.8
const PARTIAL_THRESHOLD = 0.6

function inUnitRange(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1
}

function scoreOutcome(score: number): CompetencyTelemetryOutcome {
  if (score >= PASS_THRESHOLD) return 'PASS'
  if (score >= PARTIAL_THRESHOLD) return 'PARTIAL'
  return 'FAIL'
}

/**
 * Deterministic ECG scoring boundary.
 *
 * - Scoring is permitted only for a governance-promoted learner-eligible case.
 * - Human-reviewed reference truth is mandatory; dataset/source labels cannot
 *   silently become final scoring authority.
 * - Confidence is measured separately and never changes the correctness score.
 * - Per-skill values and the aggregate are normalized to 0..1 for the unified
 *   competency telemetry contract.
 */
export function evaluateEcgScoringAttemptV1(
  attempt: EcgScoringAttemptV1,
): EcgScoringResultV1 {
  const blockers: string[] = []

  if (!attempt.caseId.trim()) blockers.push('case-id-required')
  if (!attempt.attemptId.trim()) blockers.push('attempt-id-required')
  if (!attempt.learnerId.trim()) blockers.push('learner-id-required')
  if (!attempt.humanClinicalAttestationId.trim()) blockers.push('human-clinical-attestation-required')
  if (!attempt.dimensions.length) blockers.push('scoring-dimensions-required')
  if (attempt.confidence !== undefined && !inUnitRange(attempt.confidence)) blockers.push('confidence-out-of-range')

  const skillIds = attempt.dimensions.map(dimension => dimension.skillId.trim())
  if (skillIds.some(skillId => !skillId)) blockers.push('skill-id-required')
  if (new Set(skillIds).size !== skillIds.length) blockers.push('duplicate-skill-id')

  for (const dimension of attempt.dimensions) {
    if (!Number.isFinite(dimension.weight) || dimension.weight <= 0) blockers.push(`weight-invalid:${dimension.skillId}`)
    if (!inUnitRange(dimension.score)) blockers.push(`score-out-of-range:${dimension.skillId}`)
  }

  if (attempt.gateState === 'REJECTED') {
    return {
      decision: 'REJECT',
      overallScore: null,
      outcome: 'NOT_SCORED',
      skillScores: [],
      confidence: attempt.confidence ?? null,
      blockers: [...blockers, 'case-governance-rejected'],
    }
  }

  if (attempt.gateState !== 'LEARNER_ELIGIBLE') blockers.push('case-not-learner-eligible')

  if (blockers.length) {
    return {
      decision: 'HOLD',
      overallScore: null,
      outcome: 'NOT_SCORED',
      skillScores: [],
      confidence: attempt.confidence ?? null,
      blockers,
    }
  }

  const totalWeight = attempt.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0)
  const overallScore = attempt.dimensions.reduce(
    (sum, dimension) => sum + (dimension.score * dimension.weight),
    0,
  ) / totalWeight
  const hasCriticalMiss = attempt.dimensions.some(dimension => dimension.criticalMiss === true)

  const skillScores = attempt.dimensions.map(dimension => ({
    skillId: dimension.skillId,
    score: dimension.score,
    weight: dimension.weight,
    outcome: scoreOutcome(dimension.score),
    criticalMiss: dimension.criticalMiss === true,
  }))

  return {
    decision: 'SCORED',
    overallScore,
    outcome: hasCriticalMiss ? 'FAIL' : scoreOutcome(overallScore),
    skillScores,
    confidence: attempt.confidence ?? null,
    blockers: [],
  }
}

export interface EcgSkillTelemetryContextV1 {
  occurredAt: string
  evidenceEventIds: readonly string[]
  algorithmId: string
  algorithmVersion: string
}

/** Build normalized SKILL_SCORED events without inventing mastery updates. */
export function buildEcgSkillScoreTelemetryV1(
  attempt: EcgScoringAttemptV1,
  result: EcgScoringResultV1,
  context: EcgSkillTelemetryContextV1,
): readonly CompetencyTelemetryEvent[] {
  if (result.decision !== 'SCORED') return []

  return result.skillScores.map((skill, index) => ({
    telemetryVersion: '1.0.0',
    eventId: `${attempt.attemptId}:ecg-skill:${index + 1}`,
    occurredAt: context.occurredAt,
    learnerId: attempt.learnerId,
    modality: 'ECG',
    caseId: attempt.caseId,
    attemptId: attempt.attemptId,
    eventKind: 'SKILL_SCORED',
    skillId: skill.skillId,
    score: skill.score,
    outcome: skill.outcome,
    evidenceEventIds: context.evidenceEventIds,
    algorithmId: context.algorithmId,
    algorithmVersion: context.algorithmVersion,
  }))
}

export function describeEcgScoringCompetencyContractV1() {
  return {
    deterministicScoring: true,
    normalizedScores: true,
    humanReviewedReferenceRequired: true,
    sourceDatasetLabelsAreNotFinalAuthority: true,
    confidenceSeparatedFromCorrectness: true,
    learnerEligibilityRequiredBeforeScoring: true,
    masteryUpdatesProducedHere: false,
    unifiedTelemetryCompatible: true,
  } as const
}
