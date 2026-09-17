import type { CompetencyTelemetryEvent } from './unifiedCompetencyTelemetryContract.ts'

export type EcgMasteryBand = 'NOVICE' | 'DEVELOPING' | 'PROFICIENT' | 'MASTERED'
export type EcgMasteryDecision = 'UPDATED' | 'HOLD'

export interface EcgMasteryEvidenceV1 {
  eventId: string
  learnerId: string
  skillId: string
  score: number
  occurredAt: string
  evidenceEventIds: readonly string[]
}

export interface EcgMasteryStateV1 {
  masteryVersion: '1.0.0'
  learnerId: string
  skillId: string
  mastery: number
  band: EcgMasteryBand
  evidenceCount: number
  lastObservedAt: string | null
  algorithmId: string
  algorithmVersion: string
}

export interface EcgMasteryUpdateConfigV1 {
  halfLifeDays: number
  minimumEvidenceForProficient: number
  minimumEvidenceForMastered: number
  proficientThreshold: number
  masteredThreshold: number
}

export interface EcgMasteryUpdateResultV1 {
  decision: EcgMasteryDecision
  previousMastery: number
  updatedMastery: number | null
  band: EcgMasteryBand | null
  evidenceCount: number
  blockers: readonly string[]
}

export const DEFAULT_ECG_MASTERY_CONFIG_V1: EcgMasteryUpdateConfigV1 = {
  halfLifeDays: 90,
  minimumEvidenceForProficient: 3,
  minimumEvidenceForMastered: 5,
  proficientThreshold: 0.75,
  masteredThreshold: 0.9,
}

function inUnitRange(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1
}

function validDate(value: string): boolean {
  return Number.isFinite(Date.parse(value))
}

function validateConfig(config: EcgMasteryUpdateConfigV1): readonly string[] {
  const blockers: string[] = []
  if (!Number.isFinite(config.halfLifeDays) || config.halfLifeDays <= 0) blockers.push('half-life-days-invalid')
  if (!Number.isInteger(config.minimumEvidenceForProficient) || config.minimumEvidenceForProficient <= 0) {
    blockers.push('minimum-evidence-proficient-invalid')
  }
  if (!Number.isInteger(config.minimumEvidenceForMastered)
    || config.minimumEvidenceForMastered < config.minimumEvidenceForProficient) {
    blockers.push('minimum-evidence-mastered-invalid')
  }
  if (!inUnitRange(config.proficientThreshold)) blockers.push('proficient-threshold-invalid')
  if (!inUnitRange(config.masteredThreshold) || config.masteredThreshold <= config.proficientThreshold) {
    blockers.push('mastered-threshold-invalid')
  }
  return blockers
}

function bandForMastery(
  mastery: number,
  evidenceCount: number,
  config: EcgMasteryUpdateConfigV1,
): EcgMasteryBand {
  if (mastery >= config.masteredThreshold && evidenceCount >= config.minimumEvidenceForMastered) return 'MASTERED'
  if (mastery >= config.proficientThreshold && evidenceCount >= config.minimumEvidenceForProficient) return 'PROFICIENT'
  if (mastery >= 0.5) return 'DEVELOPING'
  return 'NOVICE'
}

/**
 * Deterministic longitudinal ECG mastery model.
 *
 * Evidence is source-independent SKILL_SCORED output. More recent observations
 * receive exponentially greater weight using an explicit half-life. The model
 * never changes source scores, never fabricates missing evidence, and requires
 * repeated evidence before proficiency/mastery bands can be reached.
 */
export function updateEcgSkillMasteryV1(
  previous: EcgMasteryStateV1 | null,
  evidence: readonly EcgMasteryEvidenceV1[],
  asOf: string,
  config: EcgMasteryUpdateConfigV1 = DEFAULT_ECG_MASTERY_CONFIG_V1,
): EcgMasteryUpdateResultV1 {
  const blockers = [...validateConfig(config)]
  if (!validDate(asOf)) blockers.push('as-of-invalid')

  if (!evidence.length) blockers.push('mastery-evidence-required')

  const learnerIds = new Set(evidence.map(item => item.learnerId))
  const skillIds = new Set(evidence.map(item => item.skillId))
  if (learnerIds.size > 1) blockers.push('mixed-learner-evidence')
  if (skillIds.size > 1) blockers.push('mixed-skill-evidence')

  const eventIds = evidence.map(item => item.eventId)
  if (new Set(eventIds).size !== eventIds.length) blockers.push('duplicate-evidence-event-id')

  for (const item of evidence) {
    if (!item.eventId.trim()) blockers.push('evidence-event-id-required')
    if (!item.learnerId.trim()) blockers.push('learner-id-required')
    if (!item.skillId.trim()) blockers.push('skill-id-required')
    if (!inUnitRange(item.score)) blockers.push(`score-out-of-range:${item.eventId}`)
    if (!validDate(item.occurredAt)) blockers.push(`occurred-at-invalid:${item.eventId}`)
    if (validDate(asOf) && validDate(item.occurredAt) && Date.parse(item.occurredAt) > Date.parse(asOf)) {
      blockers.push(`future-evidence-not-allowed:${item.eventId}`)
    }
  }

  if (previous) {
    if (!inUnitRange(previous.mastery)) blockers.push('previous-mastery-out-of-range')
    if (learnerIds.size === 1 && !learnerIds.has(previous.learnerId)) blockers.push('previous-learner-mismatch')
    if (skillIds.size === 1 && !skillIds.has(previous.skillId)) blockers.push('previous-skill-mismatch')
  }

  if (blockers.length) {
    return {
      decision: 'HOLD',
      previousMastery: previous?.mastery ?? 0,
      updatedMastery: null,
      band: null,
      evidenceCount: evidence.length,
      blockers,
    }
  }

  const asOfMs = Date.parse(asOf)
  const halfLifeMs = config.halfLifeDays * 24 * 60 * 60 * 1000
  let weightedScore = 0
  let totalWeight = 0

  for (const item of evidence) {
    const ageMs = Math.max(0, asOfMs - Date.parse(item.occurredAt))
    const weight = Math.pow(0.5, ageMs / halfLifeMs)
    weightedScore += item.score * weight
    totalWeight += weight
  }

  const updatedMastery = weightedScore / totalWeight
  const band = bandForMastery(updatedMastery, evidence.length, config)

  return {
    decision: 'UPDATED',
    previousMastery: previous?.mastery ?? 0,
    updatedMastery,
    band,
    evidenceCount: evidence.length,
    blockers: [],
  }
}

export interface EcgMasteryTelemetryContextV1 {
  caseId: string
  attemptId: string
  occurredAt: string
  evidenceEventIds: readonly string[]
  algorithmId: string
  algorithmVersion: string
}

export function buildEcgMasteryUpdatedTelemetryV1(
  previous: EcgMasteryStateV1 | null,
  learnerId: string,
  skillId: string,
  result: EcgMasteryUpdateResultV1,
  context: EcgMasteryTelemetryContextV1,
): CompetencyTelemetryEvent | null {
  if (result.decision !== 'UPDATED' || result.updatedMastery === null) return null

  return {
    telemetryVersion: '1.0.0',
    eventId: `${context.attemptId}:ecg-mastery:${skillId}`,
    occurredAt: context.occurredAt,
    learnerId,
    modality: 'ECG',
    caseId: context.caseId,
    attemptId: context.attemptId,
    eventKind: 'MASTERY_UPDATED',
    skillId,
    masteryBefore: previous?.mastery ?? 0,
    masteryAfter: result.updatedMastery,
    evidenceEventIds: context.evidenceEventIds,
    algorithmId: context.algorithmId,
    algorithmVersion: context.algorithmVersion,
  }
}

export function describeEcgLongitudinalMasteryContractV1() {
  return {
    sourceScoresRemainImmutable: true,
    deterministicUpdate: true,
    explicitRecencyHalfLife: true,
    repeatedEvidenceRequiredForHigherBands: true,
    mixedLearnerOrSkillEvidenceRejected: true,
    futureEvidenceRejected: true,
    confidenceDoesNotAlterMasteryCorrectness: true,
    reviewSchedulingProducedHere: false,
    unifiedTelemetryCompatible: true,
  } as const
}
