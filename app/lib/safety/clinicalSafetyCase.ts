export type SafetySeverity = 'low' | 'moderate' | 'high' | 'critical'
export type SafetyHazardState = 'open' | 'mitigated' | 'accepted' | 'closed'

export interface ClinicalSafetyHazard {
  id: string
  title: string
  description: string
  severity: SafetySeverity
  state: SafetyHazardState
  ownerRole: string
  mitigationRefs: readonly string[]
  evidenceRefs: readonly string[]
  deploymentSpecific: boolean
}

export interface ClinicalSafetyAssumption {
  id: string
  statement: string
  ownerRole: string
  status: 'active' | 'invalidated'
}

export interface ClinicalSafetyCase {
  product: 'cliniverse'
  version: string
  hazards: readonly ClinicalSafetyHazard[]
  assumptions: readonly ClinicalSafetyAssumption[]
  humanReviewBoundary: readonly string[]
  deploymentNotes: readonly string[]
}

export interface ClinicalSafetyReadiness {
  readyForProductReview: boolean
  blockers: readonly string[]
}

export function clinicalSafetyReadiness(
  safetyCase: ClinicalSafetyCase,
): ClinicalSafetyReadiness {
  const blockers: string[] = []

  for (const hazard of safetyCase.hazards) {
    if (
      (hazard.severity === 'high' || hazard.severity === 'critical') &&
      hazard.state === 'open'
    ) {
      blockers.push(`open-${hazard.severity}-hazard:${hazard.id}`)
    }

    if (
      hazard.state === 'mitigated' &&
      (hazard.mitigationRefs.length === 0 || hazard.evidenceRefs.length === 0)
    ) {
      blockers.push(`mitigation-evidence-missing:${hazard.id}`)
    }
  }

  for (const assumption of safetyCase.assumptions) {
    if (assumption.status === 'invalidated') {
      blockers.push(`safety-assumption-invalidated:${assumption.id}`)
    }
  }

  if (safetyCase.humanReviewBoundary.length === 0) {
    blockers.push('human-review-boundary-required')
  }

  return {
    readyForProductReview: blockers.length === 0,
    blockers,
  }
}

export const CLINIVERSE_SAFETY_CASE_BOUNDARY = Object.freeze({
  claimsCompliance: false,
  standardReferenceOnly: ['DCB0129', 'DCB0160'],
  productSafetyIsDistinctFromDeploymentSafety: true,
  requiresLivingHazardRegister: true,
  requiresHumanAccountability: true,
} as const)
