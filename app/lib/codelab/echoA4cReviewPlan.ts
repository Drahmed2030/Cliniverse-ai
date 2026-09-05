import { parseEchoA4cCompletionReceipt, type EchoA4cQuestionId } from './echoA4cTrainingActivity.ts'
import { evaluateEchoA4cAttempt } from './echoA4cRemediation.ts'

const DAY_MS = 86_400_000

/** Product defaults for evaluation, not clinically validated retention intervals. */
export function createEchoA4cReviewPlan(value: unknown, completedAt: string) {
  const receipt = parseEchoA4cCompletionReceipt(value)
  if (!receipt) throw new Error('A valid completion receipt is required.')
  const timestamp = Date.parse(completedAt)
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== completedAt) {
    throw new Error('Completion time must be a canonical UTC ISO timestamp.')
  }
  const skills = new Set<EchoA4cQuestionId>()
  for (const answers of receipt.assessment.history ?? []) {
    for (const skill of evaluateEchoA4cAttempt(answers).missed) skills.add(skill)
  }
  const focus: EchoA4cQuestionId[] = skills.size
    ? [...skills]
    : ['view-identity', 'visible-landmarks', 'safe-conclusion']
  const intervals = skills.size ? [1, 3, 7] : [3, 7, 14]
  return {
    schemaVersion: 1 as const,
    policyVersion: 'echo-a4c-review-policy-v1' as const,
    receiptId: receipt.receiptId,
    contentVersion: receipt.contentVersion,
    answerKeyVersion: receipt.assessment.answerKeyVersion,
    completedAt,
    basis: receipt.assessment.history ? 'recorded-attempts' as const : 'legacy-history-unavailable' as const,
    focus,
    reviews: intervals.map(day => ({ dueAt: new Date(timestamp + day * DAY_MS).toISOString(), afterDays: day })),
    intervalEvidence: 'unvalidated-product-default' as const,
    transferAssessment: 'not-assessed' as const,
    notificationsScheduled: false as const,
  }
}

export function getEchoA4cReviewStatus(dueAt: string, now: string): 'upcoming' | 'due' {
  const due = Date.parse(dueAt)
  const current = Date.parse(now)
  if (!Number.isFinite(due) || !Number.isFinite(current)) throw new Error('Valid timestamps are required.')
  return current >= due ? 'due' : 'upcoming'
}
