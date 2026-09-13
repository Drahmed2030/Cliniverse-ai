export type CompetencyTelemetryModality = 'ECHO' | 'ECG'
export type CompetencyTelemetryEventKind =
  | 'ATTEMPT_STARTED'
  | 'ATTEMPT_COMPLETED'
  | 'SKILL_SCORED'
  | 'CONFIDENCE_RECORDED'
  | 'MASTERY_UPDATED'
  | 'REVIEW_SCHEDULED'

export type CompetencyTelemetryOutcome = 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_SCORED'

export interface CompetencyTelemetryEvent {
  telemetryVersion: '1.0.0'
  eventId: string
  occurredAt: string
  learnerId: string
  modality: CompetencyTelemetryModality
  caseId: string
  attemptId: string
  eventKind: CompetencyTelemetryEventKind
  skillId?: string
  score?: number
  confidence?: number
  outcome?: CompetencyTelemetryOutcome
  masteryBefore?: number
  masteryAfter?: number
  nextReviewAt?: string
  evidenceEventIds: readonly string[]
  algorithmId: string
  algorithmVersion: string
}

export interface CompetencyTelemetryValidationResult {
  valid: boolean
  blockers: readonly string[]
}

function isIsoDate(value: string): boolean {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed)
}

function inRange(value: number | undefined, min: number, max: number): boolean {
  return value === undefined || (Number.isFinite(value) && value >= min && value <= max)
}

export function validateCompetencyTelemetryEvent(
  event: CompetencyTelemetryEvent,
): CompetencyTelemetryValidationResult {
  const blockers: string[] = []

  if (!event.eventId.trim()) blockers.push('event-id-required')
  if (!event.learnerId.trim()) blockers.push('learner-id-required')
  if (!event.caseId.trim()) blockers.push('case-id-required')
  if (!event.attemptId.trim()) blockers.push('attempt-id-required')
  if (!event.algorithmId.trim()) blockers.push('algorithm-id-required')
  if (!event.algorithmVersion.trim()) blockers.push('algorithm-version-required')
  if (!isIsoDate(event.occurredAt)) blockers.push('occurred-at-invalid')
  if (!inRange(event.score, 0, 1)) blockers.push('score-out-of-range')
  if (!inRange(event.confidence, 0, 1)) blockers.push('confidence-out-of-range')
  if (!inRange(event.masteryBefore, 0, 1)) blockers.push('mastery-before-out-of-range')
  if (!inRange(event.masteryAfter, 0, 1)) blockers.push('mastery-after-out-of-range')
  if (event.nextReviewAt && !isIsoDate(event.nextReviewAt)) blockers.push('next-review-at-invalid')

  if (event.eventKind === 'SKILL_SCORED') {
    if (!event.skillId?.trim()) blockers.push('skill-id-required-for-score')
    if (event.score === undefined) blockers.push('score-required-for-skill-score')
    if (!event.outcome) blockers.push('outcome-required-for-skill-score')
  }

  if (event.eventKind === 'CONFIDENCE_RECORDED' && event.confidence === undefined) {
    blockers.push('confidence-required')
  }

  if (event.eventKind === 'MASTERY_UPDATED') {
    if (!event.skillId?.trim()) blockers.push('skill-id-required-for-mastery')
    if (event.masteryBefore === undefined) blockers.push('mastery-before-required')
    if (event.masteryAfter === undefined) blockers.push('mastery-after-required')
  }

  if (event.eventKind === 'REVIEW_SCHEDULED' && !event.nextReviewAt) {
    blockers.push('next-review-at-required')
  }

  return { valid: blockers.length === 0, blockers }
}

export interface CrossModalityCompetencySnapshot {
  learnerId: string
  modalityScores: Readonly<Record<CompetencyTelemetryModality, number | null>>
  overallScore: number | null
  contributingModalities: readonly CompetencyTelemetryModality[]
}

export function buildCrossModalityCompetencySnapshot(
  learnerId: string,
  events: readonly CompetencyTelemetryEvent[],
): CrossModalityCompetencySnapshot {
  const latestMastery = new Map<CompetencyTelemetryModality, CompetencyTelemetryEvent>()

  for (const event of events) {
    if (event.learnerId !== learnerId || event.eventKind !== 'MASTERY_UPDATED') continue
    const current = latestMastery.get(event.modality)
    if (!current || Date.parse(event.occurredAt) >= Date.parse(current.occurredAt)) {
      latestMastery.set(event.modality, event)
    }
  }

  const modalityScores: Record<CompetencyTelemetryModality, number | null> = {
    ECHO: latestMastery.get('ECHO')?.masteryAfter ?? null,
    ECG: latestMastery.get('ECG')?.masteryAfter ?? null,
  }
  const contributingModalities = (Object.entries(modalityScores) as [CompetencyTelemetryModality, number | null][])
    .filter(([, score]) => score !== null)
    .map(([modality]) => modality)
  const values = contributingModalities.map(modality => modalityScores[modality] as number)

  return {
    learnerId,
    modalityScores,
    overallScore: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    contributingModalities,
  }
}
