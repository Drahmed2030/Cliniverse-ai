import type { CompetencyTelemetryEvent } from './unifiedCompetencyTelemetryContract.ts'
import type { EcgMasteryBand } from './ecgLongitudinalMasteryContract.ts'

export type EcgReviewSchedulingDecision = 'SCHEDULED' | 'HOLD'

export interface EcgReviewScheduleInputV1 {
  schedulingVersion: '1.0.0'
  learnerId: string
  skillId: string
  mastery: number
  band: EcgMasteryBand
  evidenceCount: number
  lastObservedAt: string
  asOf: string
  recentCriticalMiss?: boolean
}

export interface EcgReviewSchedulingConfigV1 {
  noviceIntervalDays: number
  developingIntervalDays: number
  proficientIntervalDays: number
  masteredIntervalDays: number
  criticalMissIntervalDays: number
  maximumScheduleHorizonDays: number
}

export interface EcgReviewScheduleResultV1 {
  decision: EcgReviewSchedulingDecision
  nextReviewAt: string | null
  intervalDays: number | null
  reason: 'CRITICAL_MISS' | EcgMasteryBand | null
  blockers: readonly string[]
}

export const DEFAULT_ECG_REVIEW_SCHEDULING_CONFIG_V1: EcgReviewSchedulingConfigV1 = {
  noviceIntervalDays: 7,
  developingIntervalDays: 14,
  proficientIntervalDays: 30,
  masteredIntervalDays: 90,
  criticalMissIntervalDays: 3,
  maximumScheduleHorizonDays: 180,
}

function validDate(value: string): boolean {
  return Number.isFinite(Date.parse(value))
}

function inUnitRange(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1
}

function validateConfig(config: EcgReviewSchedulingConfigV1): readonly string[] {
  const blockers: string[] = []
  const values = [
    ['novice', config.noviceIntervalDays],
    ['developing', config.developingIntervalDays],
    ['proficient', config.proficientIntervalDays],
    ['mastered', config.masteredIntervalDays],
    ['critical-miss', config.criticalMissIntervalDays],
    ['maximum-horizon', config.maximumScheduleHorizonDays],
  ] as const

  for (const [name, value] of values) {
    if (!Number.isInteger(value) || value <= 0) blockers.push(`${name}-interval-days-invalid`)
  }

  if (config.noviceIntervalDays > config.developingIntervalDays) blockers.push('novice-interval-must-not-exceed-developing')
  if (config.developingIntervalDays > config.proficientIntervalDays) blockers.push('developing-interval-must-not-exceed-proficient')
  if (config.proficientIntervalDays > config.masteredIntervalDays) blockers.push('proficient-interval-must-not-exceed-mastered')
  if (config.criticalMissIntervalDays > config.noviceIntervalDays) blockers.push('critical-miss-interval-must-not-exceed-novice')
  if (config.masteredIntervalDays > config.maximumScheduleHorizonDays) blockers.push('mastered-interval-exceeds-maximum-horizon')

  return blockers
}

function baseIntervalDays(
  band: EcgMasteryBand,
  config: EcgReviewSchedulingConfigV1,
): number {
  switch (band) {
    case 'NOVICE': return config.noviceIntervalDays
    case 'DEVELOPING': return config.developingIntervalDays
    case 'PROFICIENT': return config.proficientIntervalDays
    case 'MASTERED': return config.masteredIntervalDays
  }
}

/**
 * Deterministic review scheduling boundary.
 *
 * Scheduling consumes an already-derived mastery state. It never recalculates
 * correctness or mastery, never promotes a learner/case, and never fabricates
 * missing evidence. Critical misses shorten the interval but do not mutate the
 * mastery value itself.
 */
export function scheduleEcgSkillReviewV1(
  input: EcgReviewScheduleInputV1,
  config: EcgReviewSchedulingConfigV1 = DEFAULT_ECG_REVIEW_SCHEDULING_CONFIG_V1,
): EcgReviewScheduleResultV1 {
  const blockers = [...validateConfig(config)]

  if (!input.learnerId.trim()) blockers.push('learner-id-required')
  if (!input.skillId.trim()) blockers.push('skill-id-required')
  if (!inUnitRange(input.mastery)) blockers.push('mastery-out-of-range')
  if (!Number.isInteger(input.evidenceCount) || input.evidenceCount <= 0) blockers.push('evidence-count-invalid')
  if (!validDate(input.lastObservedAt)) blockers.push('last-observed-at-invalid')
  if (!validDate(input.asOf)) blockers.push('as-of-invalid')
  if (validDate(input.lastObservedAt) && validDate(input.asOf)
    && Date.parse(input.lastObservedAt) > Date.parse(input.asOf)) {
    blockers.push('last-observed-after-as-of')
  }

  if (blockers.length) {
    return {
      decision: 'HOLD',
      nextReviewAt: null,
      intervalDays: null,
      reason: null,
      blockers,
    }
  }

  const intervalDays = input.recentCriticalMiss
    ? config.criticalMissIntervalDays
    : baseIntervalDays(input.band, config)
  const boundedIntervalDays = Math.min(intervalDays, config.maximumScheduleHorizonDays)
  const nextReviewMs = Date.parse(input.asOf) + boundedIntervalDays * 24 * 60 * 60 * 1000

  return {
    decision: 'SCHEDULED',
    nextReviewAt: new Date(nextReviewMs).toISOString(),
    intervalDays: boundedIntervalDays,
    reason: input.recentCriticalMiss ? 'CRITICAL_MISS' : input.band,
    blockers: [],
  }
}

export interface EcgReviewTelemetryContextV1 {
  caseId: string
  attemptId: string
  occurredAt: string
  evidenceEventIds: readonly string[]
  algorithmId: string
  algorithmVersion: string
}

export function buildEcgReviewScheduledTelemetryV1(
  input: EcgReviewScheduleInputV1,
  result: EcgReviewScheduleResultV1,
  context: EcgReviewTelemetryContextV1,
): CompetencyTelemetryEvent | null {
  if (result.decision !== 'SCHEDULED' || !result.nextReviewAt) return null

  return {
    telemetryVersion: '1.0.0',
    eventId: `${context.attemptId}:ecg-review:${input.skillId}`,
    occurredAt: context.occurredAt,
    learnerId: input.learnerId,
    modality: 'ECG',
    caseId: context.caseId,
    attemptId: context.attemptId,
    eventKind: 'REVIEW_SCHEDULED',
    skillId: input.skillId,
    nextReviewAt: result.nextReviewAt,
    evidenceEventIds: context.evidenceEventIds,
    algorithmId: context.algorithmId,
    algorithmVersion: context.algorithmVersion,
  }
}

export function describeEcgReviewSchedulingContractV1() {
  return {
    deterministicScheduling: true,
    consumesDerivedMasteryOnly: true,
    masteryValueMutatedHere: false,
    criticalMissShortensIntervalWithoutChangingMastery: true,
    learnerPromotionProducedHere: false,
    adaptiveCaseSelectionProducedHere: false,
    unifiedTelemetryCompatible: true,
  } as const
}
