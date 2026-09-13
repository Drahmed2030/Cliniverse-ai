import { ecgRubricDigest, submitEcgAnswers, type EcgAnswerRubric } from './ecgAnswerSubmission.ts'
import { ECG_RECORD10_QUESTION } from './ecgRecord10Question.ts'

const reviewer = 'human-project-owner-rubric-reviewer'
/** Frozen approval of this definition. Changes require a new explicit approval;
 * never recalculate this constant automatically when editing the question.
 */
export const ECG_RECORD10_RUBRIC_APPROVAL_SHA256 = 'af98fc721119f470afd3679a26bcf9dcda3914288506aca39430012108edd0af'
export function getApprovedRecord10Rubric(): EcgAnswerRubric {
  const rubric: EcgAnswerRubric = {
    caseId: 'ecg-governed-case-001', version: ECG_RECORD10_QUESTION.version,
    clinicalEventId: 'ecg-record-10-clinical-attested-v1',
    approval: { actorId: reviewer, definitionSha256: ECG_RECORD10_RUBRIC_APPROVAL_SHA256 },
    questions: [{ id: ECG_RECORD10_QUESTION.id, skillId: ECG_RECORD10_QUESTION.skillId,
      weight: 1, optionIds: ECG_RECORD10_QUESTION.options.map(o => o.id), correctOptionId: 'sinus', critical: false }],
  }
  if (ecgRubricDigest(rubric) !== ECG_RECORD10_RUBRIC_APPROVAL_SHA256) throw new Error('Approved ECG rubric definition changed')
  return rubric
}
/** Supplies the approved definition from the server; preserves all eligibility
 * and atomic-write checks. Does not publish a registry decision or grant access.
 */
export function submitApprovedRecord10Answers(
  auth: Parameters<typeof submitEcgAnswers>[0], writer: Parameters<typeof submitEcgAnswers>[1],
  payload: unknown, snapshot: Parameters<typeof submitEcgAnswers>[3], receivedAt: string,
) {
  return submitEcgAnswers(auth, writer, payload, snapshot, getApprovedRecord10Rubric(), [reviewer], receivedAt)
}
