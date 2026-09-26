export const REASONING_DIMENSIONS = [
  'signal-recognition',
  'evidence-reconciliation',
  'change-detection',
  'handover-completeness',
  'premature-closure-avoidance',
] as const

export type ReasoningDimension = (typeof REASONING_DIMENSIONS)[number]
export type ReasoningObservationOutcome = 'demonstrated' | 'partial' | 'missed'

export interface ReasoningObservation {
  dimension: ReasoningDimension
  outcome: ReasoningObservationOutcome
  occurredAt: string
  evidenceRef: string
  contentId: string
}

export type ReasoningPatternState =
  | 'insufficient-evidence'
  | 'needs-review'
  | 'developing'
  | 'consistent'

export interface ReasoningDimensionProfile {
  dimension: ReasoningDimension
  state: ReasoningPatternState
  observationCount: number
  demonstratedCount: number
  latestAt: string | null
}

export interface ClinicalReasoningProfile {
  kind: 'observed-reasoning-patterns'
  competencyClaim: false
  dimensions: readonly ReasoningDimensionProfile[]
}

function outcomeValue(outcome: ReasoningObservationOutcome): number {
  if (outcome === 'demonstrated') return 1
  if (outcome === 'partial') return 0.5
  return 0
}

function dimensionState(
  observations: readonly ReasoningObservation[],
): ReasoningPatternState {
  if (observations.length < 3) return 'insufficient-evidence'

  const mean =
    observations.reduce((sum, item) => sum + outcomeValue(item.outcome), 0) /
    observations.length

  if (mean >= 0.8) return 'consistent'
  if (mean >= 0.5) return 'developing'
  return 'needs-review'
}

export function buildClinicalReasoningProfile(
  observations: readonly ReasoningObservation[],
): ClinicalReasoningProfile {
  const dimensions = REASONING_DIMENSIONS.map(dimension => {
    const matching = observations
      .filter(item => item.dimension === dimension)
      .filter(item => Boolean(item.evidenceRef.trim()))
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))

    return {
      dimension,
      state: dimensionState(matching),
      observationCount: matching.length,
      demonstratedCount: matching.filter(
        item => item.outcome === 'demonstrated',
      ).length,
      latestAt: matching[0]?.occurredAt ?? null,
    }
  })

  return {
    kind: 'observed-reasoning-patterns',
    competencyClaim: false,
    dimensions,
  }
}

export const CLINICAL_REASONING_PROFILE_BOUNDARY = Object.freeze({
  minimumObservationsPerDimension: 3,
  isCompetencyCredential: false,
  mayUseContinuityLabEvidence: true,
  mayUseGovernedPracticeEvidence: true,
  mayUseMarketingOrHealthConditionInference: false,
} as const)
