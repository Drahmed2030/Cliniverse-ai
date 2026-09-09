import type { EcgMasteryBand } from './ecgLongitudinalMasteryContract.ts'

export type EcgAdaptiveSelectionDecision = 'SELECTED' | 'HOLD'
export type EcgAdaptiveSelectionReason =
  | 'DUE_REVIEW'
  | 'WEAK_SKILL'
  | 'UNSEEN_SKILL'
  | 'SPACED_PRACTICE'

export interface EcgAdaptiveSkillStateV1 {
  skillId: string
  mastery: number
  band: EcgMasteryBand
  nextReviewAt?: string | null
  recentCriticalMiss?: boolean
}

export interface EcgAdaptiveCaseCandidateV1 {
  caseId: string
  learnerEligible: boolean
  governedSkillIds: readonly string[]
  qualityScore: number
  lastSeenAt?: string | null
  prohibitedSourceLabelSelection?: boolean
}

export interface EcgAdaptiveCaseSelectionInputV1 {
  selectionVersion: '1.0.0'
  learnerId: string
  now: string
  skillStates: readonly EcgAdaptiveSkillStateV1[]
  candidates: readonly EcgAdaptiveCaseCandidateV1[]
}

export interface EcgAdaptiveCaseSelectionResultV1 {
  decision: EcgAdaptiveSelectionDecision
  caseId: string | null
  targetSkillId: string | null
  reason: EcgAdaptiveSelectionReason | null
  priorityScore: number | null
  blockers: readonly string[]
}

const bandPriority: Record<EcgMasteryBand, number> = {
  NOVICE: 100,
  DEVELOPING: 75,
  PROFICIENT: 35,
  MASTERED: 10,
}

function validDate(value: string): boolean {
  return Number.isFinite(Date.parse(value))
}

function inUnitRange(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1
}

/**
 * Deterministic adaptive ECG case selection.
 *
 * Selection consumes governed learner-eligible cases plus derived mastery/review
 * state. It never uses dataset diagnosis labels as selection authority, never
 * promotes cases, and never changes scoring or mastery state.
 */
export function selectNextEcgCaseV1(
  input: EcgAdaptiveCaseSelectionInputV1,
): EcgAdaptiveCaseSelectionResultV1 {
  const blockers: string[] = []

  if (!input.learnerId.trim()) blockers.push('learner-id-required')
  if (!validDate(input.now)) blockers.push('now-invalid')
  if (!input.candidates.length) blockers.push('candidate-cases-required')

  const skillIds = input.skillStates.map(item => item.skillId.trim())
  if (skillIds.some(skillId => !skillId)) blockers.push('skill-id-required')
  if (new Set(skillIds).size !== skillIds.length) blockers.push('duplicate-skill-state')

  for (const state of input.skillStates) {
    if (!inUnitRange(state.mastery)) blockers.push(`mastery-out-of-range:${state.skillId}`)
    if (state.nextReviewAt && !validDate(state.nextReviewAt)) blockers.push(`next-review-at-invalid:${state.skillId}`)
  }

  const caseIds = input.candidates.map(candidate => candidate.caseId.trim())
  if (caseIds.some(caseId => !caseId)) blockers.push('case-id-required')
  if (new Set(caseIds).size !== caseIds.length) blockers.push('duplicate-case-id')

  for (const candidate of input.candidates) {
    if (!candidate.governedSkillIds.length) blockers.push(`governed-skill-required:${candidate.caseId}`)
    if (!inUnitRange(candidate.qualityScore)) blockers.push(`quality-score-out-of-range:${candidate.caseId}`)
    if (candidate.lastSeenAt && !validDate(candidate.lastSeenAt)) blockers.push(`last-seen-at-invalid:${candidate.caseId}`)
    if (candidate.prohibitedSourceLabelSelection === true) blockers.push(`source-label-selection-prohibited:${candidate.caseId}`)
  }

  if (blockers.length) {
    return { decision: 'HOLD', caseId: null, targetSkillId: null, reason: null, priorityScore: null, blockers }
  }

  const nowMs = Date.parse(input.now)
  const masteryBySkill = new Map(input.skillStates.map(item => [item.skillId, item]))

  const ranked = input.candidates
    .filter(candidate => candidate.learnerEligible)
    .flatMap(candidate => candidate.governedSkillIds.map(skillId => {
      const state = masteryBySkill.get(skillId)
      const dueReview = Boolean(state?.nextReviewAt && Date.parse(state.nextReviewAt) <= nowMs)
      const unseenSkill = !state
      const weakSkill = Boolean(state && (state.band === 'NOVICE' || state.band === 'DEVELOPING'))
      const lastSeenMs = candidate.lastSeenAt ? Date.parse(candidate.lastSeenAt) : Number.NaN
      const daysSinceSeen = Number.isNaN(lastSeenMs)
        ? 365
        : Math.max(0, (nowMs - lastSeenMs) / 86_400_000)

      const masteryPriority = unseenSkill ? 110 : bandPriority[state.band]
      const dueReviewBonus = dueReview ? 60 : 0
      const criticalMissBonus = state?.recentCriticalMiss ? 40 : 0
      const spacingBonus = Math.min(30, Math.floor(daysSinceSeen))
      const qualityBonus = Math.round(candidate.qualityScore * 10)
      const priorityScore = masteryPriority + dueReviewBonus + criticalMissBonus + spacingBonus + qualityBonus

      const reason: EcgAdaptiveSelectionReason = dueReview
        ? 'DUE_REVIEW'
        : unseenSkill
          ? 'UNSEEN_SKILL'
          : weakSkill
            ? 'WEAK_SKILL'
            : 'SPACED_PRACTICE'

      return { caseId: candidate.caseId, targetSkillId: skillId, reason, priorityScore }
    }))
    .sort((a, b) =>
      b.priorityScore - a.priorityScore
      || a.caseId.localeCompare(b.caseId)
      || a.targetSkillId.localeCompare(b.targetSkillId),
    )

  const selected = ranked[0]
  if (!selected) {
    return {
      decision: 'HOLD',
      caseId: null,
      targetSkillId: null,
      reason: null,
      priorityScore: null,
      blockers: ['no-learner-eligible-candidate'],
    }
  }

  return {
    decision: 'SELECTED',
    caseId: selected.caseId,
    targetSkillId: selected.targetSkillId,
    reason: selected.reason,
    priorityScore: selected.priorityScore,
    blockers: [],
  }
}

export function describeEcgAdaptiveCaseSelectionContractV1() {
  return {
    deterministicSelection: true,
    learnerEligibleCasesOnly: true,
    datasetLabelsNotSelectionAuthority: true,
    masteryAndReviewStateConsumed: true,
    criticalMissesIncreasePriorityWithoutChangingMastery: true,
    casePromotionProducedHere: false,
    scoringProducedHere: false,
    masteryProducedHere: false,
  } as const
}
