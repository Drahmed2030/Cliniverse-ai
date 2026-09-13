import { ECHO_A4C_COMPETENCY_TASKS } from './echoA4cCompetencyTasks.ts'
import { scoreEchoAssessment, type EchoAssessmentResponse } from './echoAssessmentContract.ts'
import { toEchoCompetencyEvent } from './echoPersistenceContract.ts'
import { validateEchoAccountEvent } from './echoAccountEventRepository.ts'

/** Prepare once when assessment is submitted; retain this event on network retries.
 * Call from the governed review surface only. This is not an eligibility grant,
 * a public API authorization check, or a client-writable mastery projection.
 */
export function prepareEchoAccountAttempt(input: {
  userId: string
  caseId: string
  taskVersion: string
  response: EchoAssessmentResponse
}) {
  const task = ECHO_A4C_COMPETENCY_TASKS.find(task => task.id === input.response.taskId)
  if (!task || task.caseId !== input.caseId || task.version !== input.taskVersion) {
    throw new Error('Unknown or stale Echo assessment identity')
  }
  const selected = input.response.selectedOptionIds
  if (!Array.isArray(selected) || selected.length !== 1 ||
      !task.options.some(option => option.id === selected[0])) {
    throw new Error('Select one valid option for this Echo task')
  }
  // Existing scorer owns the score; the caller cannot supply a result or skill ID.
  const result = scoreEchoAssessment(task, input.response)
  const event = toEchoCompetencyEvent({
    userId: input.userId, caseId: task.caseId, taskVersion: task.version,
    result, observedAt: input.response.attemptedAt,
  })
  validateEchoAccountEvent(event)
  return Object.freeze(event)
}
