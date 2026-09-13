import { scoreEchoAssessment, type EchoAssessmentResponse } from './echoAssessmentContract.ts'
import { ECHO_A4C_COMPETENCY_TASKS } from './echoA4cCompetencyTasks.ts'
import { completeEchoCompetencyInteraction } from './echoVerticalSlice.ts'
import type { EchoMasteryEvidence } from './echoMasteryEngine.ts'

const TASK_BY_ID = new Map(ECHO_A4C_COMPETENCY_TASKS.map(task => [task.id, task]))

export interface EchoPreviewCompetencySubmission {
  userId: string
  taskId: string
  selectedOptionId: string
  confidence: 1 | 2 | 3 | 4 | 5
  responseTimeMs: number
  attemptedAt: string
  priorEvidence?: readonly EchoMasteryEvidence[]
}

/**
 * Preview adapter only. It deliberately has no database client and therefore cannot
 * make the Clinical Studio depend on Supabase. A production persistence port can be
 * injected later at the application boundary after the database gate is approved.
 */
export async function submitEchoPreviewCompetency(input: EchoPreviewCompetencySubmission) {
  const task = TASK_BY_ID.get(input.taskId)
  if (!task) throw new Error(`Unknown governed Echo preview task: ${input.taskId}`)

  const response: EchoAssessmentResponse = {
    taskId: task.id,
    selectedOptionIds: [input.selectedOptionId],
    confidence: input.confidence,
    responseTimeMs: input.responseTimeMs,
    attemptedAt: input.attemptedAt,
  }
  const result = scoreEchoAssessment(task, response)
  const completion = await completeEchoCompetencyInteraction({
    userId: input.userId,
    caseId: task.caseId,
    taskVersion: task.version,
    result,
    observedAt: input.attemptedAt,
    priorEvidence: input.priorEvidence ?? [],
    persistencePort: null,
  })

  return {
    task,
    result,
    mastery: completion.mastery,
    persistenceState: completion.degradedReason,
  }
}
