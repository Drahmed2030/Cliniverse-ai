import type { EchoAssessmentResult } from './echoAssessmentContract.ts'
import { deriveEchoSkillMastery, toMasteryEvidence, type EchoMasteryEvidence, type EchoSkillMastery } from './echoMasteryEngine.ts'
import { toEchoCompetencyEvent, toEchoMasteryEvidenceFromEvent, toEchoMasteryProjection, validateEchoCompetencyEvent } from './echoPersistenceContract.ts'
import { persistEchoCompetencySafely, type EchoStudioPersistencePort } from './echoStudioIntegrationBoundary.ts'

export interface EchoVerticalSliceInput {
  userId: string
  caseId: string
  taskVersion: string
  result: EchoAssessmentResult
  observedAt: string
  priorEvidence: readonly EchoMasteryEvidence[]
  persistencePort?: EchoStudioPersistencePort | null
}

export interface EchoVerticalSliceOutput {
  eventId: string
  mastery: EchoSkillMastery
  persisted: boolean
  degradedReason: string | null
}

/**
 * Composes assessment -> immutable evidence -> mastery projection.
 * Persistence is deliberately last and non-authoritative: a storage outage must not
 * invalidate a scored learner interaction or break the Clinical Studio renderer.
 */
export async function completeEchoCompetencyInteraction(
  input: EchoVerticalSliceInput,
): Promise<EchoVerticalSliceOutput> {
  const event = toEchoCompetencyEvent({
    userId: input.userId,
    caseId: input.caseId,
    taskVersion: input.taskVersion,
    result: input.result,
    observedAt: input.observedAt,
  })
  validateEchoCompetencyEvent(event)

  const evidence = [
    ...input.priorEvidence,
    toEchoMasteryEvidenceFromEvent(event),
  ]
  const mastery = deriveEchoSkillMastery(event.skillId, evidence)
  const projection = toEchoMasteryProjection(input.userId, mastery, input.observedAt)

  const persistence = await persistEchoCompetencySafely({
    port: input.persistencePort,
    event,
    projection,
  })

  return {
    eventId: event.eventId,
    mastery,
    persisted: persistence.persisted,
    degradedReason: persistence.degradedReason,
  }
}

// Compile-time guard: assessment results remain convertible to mastery evidence independently
// from persistence, keeping the scoring domain reusable in offline and test environments.
export function previewEchoMasteryEvidence(result: EchoAssessmentResult, observedAt: string): EchoMasteryEvidence {
  return toMasteryEvidence(result, observedAt)
}
