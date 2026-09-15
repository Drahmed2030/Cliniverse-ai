/** New practice copy: not covered by the owner's frozen batch20 text confirmation. */
export const decisionReviewDraft = {
  id: 'as-evidence-review-v1',
  caseId: 'aortic-stenosis',
  status: 'draft-medical-review-pending',
  update: 'An additional written note repeats that aortic valve opening is restricted. It still supplies no Doppler measurements or flow context.',
  prompt: 'Does this additional note change whether you can confidently grade severity?',
  reflection: 'What evidence would you check before making this assessment in another case?',
} as const

export interface DecisionObservation { decision: number; confidence: number; evidence: string }
export function parseDecisionObservation(data: FormData, optionCount: number): DecisionObservation | null {
  const rawDecision = data.get('decision'), rawConfidence = data.get('confidence'), evidence = data.get('evidence')
  if (typeof rawDecision !== 'string' || !rawDecision.trim() || typeof rawConfidence !== 'string' || !rawConfidence.trim() || typeof evidence !== 'string') return null
  const decision = Number(rawDecision), confidence = Number(rawConfidence)
  if (!Number.isInteger(decision) || decision < 0 || decision >= optionCount || !Number.isInteger(confidence) || confidence < 0 || confidence > 100 || !evidence.trim() || evidence.length > 600) return null
  return { decision, confidence, evidence: evidence.trim() }
}
