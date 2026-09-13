import type { EchoAssessmentResult } from './echoAssessmentContract.ts'
import type { EchoMasteryEvidence, EchoSkillMastery } from './echoMasteryEngine.ts'

export interface EchoCompetencyEvent {
  eventId: string
  userId: string
  caseId: string
  taskId: string
  taskVersion: string
  skillId: string
  selectedAnswer: string
  normalizedScore: number
  confidence: number
  responseTimeMs: number
  observedAt: string
}

export interface EchoMasteryProjectionRow {
  userId: string
  skillId: string
  evidenceCount: number
  score: number
  confidenceCalibration: number
  band: EchoSkillMastery['band']
  lastObservedAt: string | null
  projectedAt: string
}

const eventIdFor = (input: Omit<EchoCompetencyEvent, 'eventId'>) =>
  [input.userId, input.caseId, input.taskId, input.taskVersion, input.observedAt].join(':')

export function toEchoCompetencyEvent(params: {
  userId: string
  caseId: string
  taskVersion: string
  result: EchoAssessmentResult
  observedAt: string
}): EchoCompetencyEvent {
  const base = {
    userId: params.userId,
    caseId: params.caseId,
    taskId: params.result.taskId,
    taskVersion: params.taskVersion,
    skillId: params.result.skillId,
    selectedAnswer: params.result.selectedAnswer,
    normalizedScore: params.result.normalizedScore,
    confidence: params.result.confidence,
    responseTimeMs: params.result.responseTimeMs,
    observedAt: params.observedAt,
  }
  return { eventId: eventIdFor(base), ...base }
}

export function toEchoMasteryEvidenceFromEvent(event: EchoCompetencyEvent): EchoMasteryEvidence {
  return {
    taskId: event.taskId,
    skillId: event.skillId,
    normalizedScore: event.normalizedScore,
    confidence: event.confidence,
    responseTimeMs: event.responseTimeMs,
    observedAt: event.observedAt,
  }
}

export function toEchoMasteryProjection(
  userId: string,
  mastery: EchoSkillMastery,
  projectedAt: string,
): EchoMasteryProjectionRow {
  return {
    userId,
    skillId: mastery.skillId,
    evidenceCount: mastery.evidenceCount,
    score: mastery.score,
    confidenceCalibration: mastery.confidenceCalibration,
    band: mastery.band,
    lastObservedAt: mastery.lastObservedAt,
    projectedAt,
  }
}

export function validateEchoCompetencyEvent(event: EchoCompetencyEvent): void {
  if (!event.userId || !event.caseId || !event.taskId || !event.taskVersion || !event.skillId) {
    throw new Error('Echo competency events require user, case, task version and skill identity.')
  }
  if (event.normalizedScore < 0 || event.normalizedScore > 100) {
    throw new Error('Echo competency score must be between 0 and 100.')
  }
  if (event.confidence < 1 || event.confidence > 5) {
    throw new Error('Echo competency confidence must be between 1 and 5.')
  }
  if (!Number.isFinite(event.responseTimeMs) || event.responseTimeMs < 0) {
    throw new Error('Echo competency response time must be a non-negative finite number.')
  }
  if (Number.isNaN(Date.parse(event.observedAt))) {
    throw new Error('Echo competency observedAt must be an ISO-compatible timestamp.')
  }
}
