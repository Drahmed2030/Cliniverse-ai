import type { EntitlementTier } from '../entitlements.ts'

export type GovernedContentKind =
  | 'LESSON'
  | 'CASE'
  | 'MCQ'
  | 'PATHWAY_SIMULATION'
  | 'GUIDELINE_SUMMARY'
  | 'INSTITUTION_CASE_PACK'

export type GovernedContentSourceType =
  | 'PRIMARY_GUIDELINE'
  | 'PEER_REVIEWED_PUBLICATION'
  | 'VERIFIED_CLINICAL_MEDIA'
  | 'INTERNAL_CURRICULUM'
  | 'AI_ASSISTED_DRAFT'

export type GovernedContentReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type GovernedContentPromotionDecision = 'PROMOTE' | 'HOLD' | 'REJECT'
export type GovernedContentAudience = 'FREE' | 'PRO' | 'INSTITUTION'

export interface GovernedContentSourceBinding {
  sourceId: string
  sourceType: GovernedContentSourceType
  sourceVersion: string
  evidenceRecordIds: readonly string[]
  provenanceVerified: boolean
}

export interface GovernedContentClinicalReview {
  status: GovernedContentReviewStatus
  reviewerId?: string
  reviewedVersion?: string
  clinicalScopeAccepted?: boolean
}

export interface GovernedEducationalContent {
  contentId: string
  version: string
  kind: GovernedContentKind
  title: string
  sourceBindings: readonly GovernedContentSourceBinding[]
  generatedWithAI: boolean
  clinicalReview: GovernedContentClinicalReview
  ledgerEventIds: readonly string[]
  requestedAudience: GovernedContentAudience
}

export interface GovernedContentEvaluation {
  decision: GovernedContentPromotionDecision
  blockers: readonly string[]
  entitlementRequired: EntitlementTier
  educationalTruthIndependentOfEntitlement: true
}

function nonEmpty(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function entitlementForAudience(audience: GovernedContentAudience): EntitlementTier {
  if (audience === 'INSTITUTION') return 'institution'
  if (audience === 'PRO') return 'pro'
  return 'free'
}

export function evaluateGovernedEducationalContent(
  content: GovernedEducationalContent,
): GovernedContentEvaluation {
  const blockers: string[] = []

  if (!nonEmpty(content.contentId)) blockers.push('content-id-missing')
  if (!nonEmpty(content.version)) blockers.push('content-version-missing')
  if (!nonEmpty(content.title)) blockers.push('content-title-missing')
  if (content.sourceBindings.length === 0) blockers.push('source-binding-missing')
  if (content.ledgerEventIds.length === 0) blockers.push('evidence-ledger-binding-missing')

  for (const source of content.sourceBindings) {
    if (!nonEmpty(source.sourceId)) blockers.push('source-id-missing')
    if (!nonEmpty(source.sourceVersion)) blockers.push(`source-version-missing:${source.sourceId || 'unknown'}`)
    if (!source.provenanceVerified) blockers.push(`source-provenance-unverified:${source.sourceId || 'unknown'}`)
    if (source.evidenceRecordIds.length === 0) blockers.push(`source-evidence-missing:${source.sourceId || 'unknown'}`)
  }

  const review = content.clinicalReview
  if (review.status === 'REJECTED') blockers.push('clinical-review-rejected')
  if (review.status !== 'APPROVED') blockers.push('clinical-review-not-approved')
  if (review.status === 'APPROVED') {
    if (!nonEmpty(review.reviewerId)) blockers.push('clinical-reviewer-missing')
    if (review.reviewedVersion !== content.version) blockers.push('clinical-review-version-mismatch')
    if (review.clinicalScopeAccepted !== true) blockers.push('clinical-scope-not-accepted')
  }

  if (content.generatedWithAI && review.status !== 'APPROVED') {
    blockers.push('ai-assisted-content-requires-human-clinical-approval')
  }

  const reject = blockers.some(blocker => blocker === 'clinical-review-rejected')

  return {
    decision: reject ? 'REJECT' : blockers.length > 0 ? 'HOLD' : 'PROMOTE',
    blockers,
    entitlementRequired: entitlementForAudience(content.requestedAudience),
    educationalTruthIndependentOfEntitlement: true,
  }
}

export function canEntitlementAccessGovernedContent(
  entitlement: EntitlementTier,
  required: EntitlementTier,
): boolean {
  const rank: Record<EntitlementTier, number> = { free: 0, pro: 1, institution: 2 }
  return rank[entitlement] >= rank[required]
}
