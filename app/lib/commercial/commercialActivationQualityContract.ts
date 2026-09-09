export type CommercialSurfaceDecision = 'ACTIVATE' | 'REDESIGN' | 'HOLD' | 'RETIRE'

export interface CommercialActivationSurfaceV1 {
  id: string
  decision: CommercialSurfaceDecision
  userOutcome: string
  requiresClinicalGovernance: boolean
  requiresAppleReviewDisclosure: boolean
  aiMentionUserRelevant: boolean
}

export const COMMERCIAL_ACTIVATION_SURFACES_V1: readonly CommercialActivationSurfaceV1[] = [
  {
    id: 'home',
    decision: 'REDESIGN',
    userOutcome: 'Show today, continue, due review and progress actions.',
    requiresClinicalGovernance: false,
    requiresAppleReviewDisclosure: true,
    aiMentionUserRelevant: false,
  },
  {
    id: 'care',
    decision: 'REDESIGN',
    userOutcome: 'Keep only governed competency and simulation experiences that support retention or paid value.',
    requiresClinicalGovernance: true,
    requiresAppleReviewDisclosure: true,
    aiMentionUserRelevant: false,
  },
  {
    id: 'intelligence',
    decision: 'HOLD',
    userOutcome: 'Remain unavailable until privacy, consent, provider-data-use and clinical-claims gates pass.',
    requiresClinicalGovernance: true,
    requiresAppleReviewDisclosure: true,
    aiMentionUserRelevant: true,
  },
  {
    id: 'atlas',
    decision: 'REDESIGN',
    userOutcome: 'Replace release-tour framing with outcome-based learning catalog.',
    requiresClinicalGovernance: false,
    requiresAppleReviewDisclosure: true,
    aiMentionUserRelevant: false,
  },
  {
    id: 'me',
    decision: 'ACTIVATE',
    userOutcome: 'Keep account, entitlement, restore, privacy, terms and support as one trusted account surface.',
    requiresClinicalGovernance: false,
    requiresAppleReviewDisclosure: true,
    aiMentionUserRelevant: false,
  },
  {
    id: 'legacy-synthetic-ecg',
    decision: 'RETIRE',
    userOutcome: 'Do not use synthetic demo ECG as the commercial governed ECG experience.',
    requiresClinicalGovernance: true,
    requiresAppleReviewDisclosure: false,
    aiMentionUserRelevant: false,
  },
] as const

export interface HumanProductQualityPolicyV1 {
  acceptedAppleBaselineImmutable: true
  misleadingHumanOnlyClaimsProhibited: true
  hiddenDormantFeatureActivationProhibited: true
  reviewerRelevantAiBehaviorDisclosed: true
  developmentToolingDisclosureRequiredByDefault: false
  clinicalAuthorshipAndReviewProvenanceRequired: true
  outcomeBasedNavigationPreferred: true
  excessiveAiBrandingDiscouraged: true
  storekitEntitlementServerVerified: true
  restorePurchasesRequired: true
}

export const HUMAN_PRODUCT_QUALITY_POLICY_V1: HumanProductQualityPolicyV1 = {
  acceptedAppleBaselineImmutable: true,
  misleadingHumanOnlyClaimsProhibited: true,
  hiddenDormantFeatureActivationProhibited: true,
  reviewerRelevantAiBehaviorDisclosed: true,
  developmentToolingDisclosureRequiredByDefault: false,
  clinicalAuthorshipAndReviewProvenanceRequired: true,
  outcomeBasedNavigationPreferred: true,
  excessiveAiBrandingDiscouraged: true,
  storekitEntitlementServerVerified: true,
  restorePurchasesRequired: true,
}

export function evaluateCommercialActivationSurfaceV1(surface: CommercialActivationSurfaceV1) {
  const blockers: string[] = []
  if (!surface.id.trim()) blockers.push('surface-id-required')
  if (!surface.userOutcome.trim()) blockers.push('user-outcome-required')
  if (surface.decision === 'ACTIVATE' && surface.requiresClinicalGovernance) {
    blockers.push('clinical-governance-required-before-activation')
  }
  if (surface.aiMentionUserRelevant && !surface.requiresAppleReviewDisclosure) {
    blockers.push('reviewer-relevant-ai-must-be-disclosed')
  }
  return {
    decision: blockers.length ? 'HOLD' as const : surface.decision,
    blockers,
  }
}

export function describeCommercialActivationQualityContractV1() {
  return {
    acceptedBaselineRemainsUntouched: true,
    commercialActivationUsesSeparateBranch: true,
    noDeceptiveHumanOnlyPresentation: true,
    reviewerRelevantAiDisclosureRequired: true,
    clinicalReviewProvenanceRequired: true,
    subscriptionTrustSurfacePreserved: true,
  } as const
}
