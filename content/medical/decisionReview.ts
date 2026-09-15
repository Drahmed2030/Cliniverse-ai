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

export const decisionReviewPathFeedback: Record<string, string> = {
  '0-0': 'The decision was held after the note. The note repeated the restricted opening without adding Doppler or flow context, so the evidence available did not change. Holding here is consistent with the original observation.',
  '0-1': 'The decision changed toward the appearance-only option after a repeated observation. The note added no new measurement — only the same description again. If the repetition felt like additional evidence, that is worth re-checking: nothing new was supplied.',
  '0-2': 'The decision changed toward the murmur-volume option after a repeated observation. The note did not introduce murmur data, Doppler, or flow context. Repetition of the same finding does not substitute for the missing measurements.',
  '1-0': 'The decision moved toward the integrated assessment. Whether the change came from recognising the note added nothing, or from re-reading the original description, the same requirement applies: valve severity is not graded from appearance alone.',
  '2-0': 'The decision moved toward the integrated assessment. Murmur volume and valve severity are not interchangeable — the note did not bridge that gap. The correct option was available from the original description alone.',
  '1-1': 'The appearance-based decision was held. The note repeated the restricted opening — the same isolated observation. It still supplies neither Doppler nor flow context, which is what grading severity requires.',
  '2-2': 'The murmur-based decision was held. Murmur volume is not a severity grade, and the note did not add Doppler or flow measurements. A repeated description does not substitute for the missing haemodynamic data.',
  '1-2': 'The reason changed but the conclusion did not. Appearance alone and murmur volume alone both fall short of grading severity. The note added neither Doppler nor flow context, so neither observation is sufficient.',
  '2-1': 'The reason changed but the conclusion did not. Neither appearance nor murmur volume grades severity on its own. The note added none of the missing measurements, so the conclusion remains unsupported.'
}

export function getPathFeedback(before: number, after: number): string {
  return decisionReviewPathFeedback[`${before}-${after}`] ?? ''
}
