import { createHash } from 'node:crypto'
import { evaluateEcgEligibility, type EcgEligibilitySnapshot } from '../clinicalIntelligence/ecgEligibilityDecision.ts'
import { saveGovernedEcgAttempt } from './ecgAtomicAccountSave.ts'

/** Loaded from a trusted server registry, never from request JSON.
 * Approval is specific to this question/answer/weight definition, not merely to
 * the clinical interpretation of the source ECG.
 */
export interface EcgAnswerRubric {
  caseId: string
  version: string
  clinicalEventId: string
  approval: { actorId: string; definitionSha256: string }
  questions: readonly {
    id: string; skillId: string; weight: number
    optionIds: readonly string[]; correctOptionId: string; critical: boolean
  }[]
}
export function ecgRubricDigest(rubric: Omit<EcgAnswerRubric, 'approval'>): string {
  return createHash('sha256').update(JSON.stringify([
    rubric.caseId, rubric.version, rubric.clinicalEventId,
    rubric.questions.map(q => [q.id, q.skillId, q.weight, [...q.optionIds], q.correctOptionId, q.critical]),
  ])).digest('hex')
}
type Auth = Parameters<typeof saveGovernedEcgAttempt>[0]
type Writer = Parameters<typeof saveGovernedEcgAttempt>[1]
const record = (x: unknown): x is Record<string, unknown> => Boolean(x) && typeof x === 'object' && !Array.isArray(x)
const exactKeys = (x: Record<string, unknown>, keys: readonly string[]) => Object.keys(x).every(k => keys.includes(k))
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Authenticated answer -> existing scorer -> existing atomic writer.
 * Caller identity, scores, gate, reference answers and dates are not accepted.
 * No active record-10 rubric is installed by this module.
 */
export async function submitEcgAnswers(
  auth: Auth, writer: Writer, payload: unknown,
  snapshot: EcgEligibilitySnapshot, rubric: EcgAnswerRubric | null,
  trustedRubricReviewerIds: readonly string[], receivedAt: string,
) {
  const identity = await auth.getUser()
  if (identity.error || !identity.data.user) throw new Error('ECG sign-in required')
  const owner = identity.data.user.id
  if (!record(payload) || !exactKeys(payload, ['attemptId', 'caseId', 'rubricVersion', 'answers', 'confidence']) ||
      typeof payload.attemptId !== 'string' || !uuid.test(payload.attemptId) || payload.caseId !== snapshot.caseId ||
      typeof payload.rubricVersion !== 'string' || !Array.isArray(payload.answers) || payload.answers.length > 64 ||
      (payload.confidence !== undefined && (typeof payload.confidence !== 'number' || !Number.isFinite(payload.confidence) || payload.confidence < 0 || payload.confidence > 1))) {
    throw new Error('Invalid ECG answer submission')
  }
  const eligibility = evaluateEcgEligibility(snapshot)
  if (!eligibility.learnerReady) return { state: 'not-saveable' as const, eligibility }
  if (!rubric) return { state: 'not-saveable' as const, blockers: ['approved-answer-rubric-required'] }
  if (rubric.caseId !== snapshot.caseId || !rubric.version.trim() || rubric.version !== payload.rubricVersion ||
      !trustedRubricReviewerIds.includes(rubric.approval.actorId) || rubric.approval.definitionSha256 !== ecgRubricDigest(rubric)) {
    throw new Error('Unbound ECG answer rubric')
  }
  const clinical = [...snapshot.events].reverse().find(e => e.kind === 'CLINICAL_ATTESTED' && e.subjectId === snapshot.caseId &&
    e.product === 'CLINIVERSE' && e.artifacts.some(a => a.sha256.toLowerCase() === snapshot.sourceArtifactSha256.toLowerCase()))
  if (clinical?.eventId !== rubric.clinicalEventId || clinical.decision !== 'PASS') throw new Error('Stale ECG rubric reference')
  if (!rubric.questions.length || rubric.questions.length > 64 ||
      new Set(rubric.questions.map(q => q.id)).size !== rubric.questions.length ||
      new Set(rubric.questions.map(q => q.skillId)).size !== rubric.questions.length ||
      rubric.questions.some(q => !q.id.trim() || !q.skillId.trim() || !Number.isFinite(q.weight) || q.weight <= 0 ||
        typeof q.critical !== 'boolean' || q.optionIds.length < 2 || q.optionIds.some(o => !o.trim()) ||
        new Set(q.optionIds).size !== q.optionIds.length || !q.optionIds.includes(q.correctOptionId))) throw new Error('Invalid ECG rubric')
  const answers = new Map<string, string>()
  for (const a of payload.answers) {
    if (!record(a) || !exactKeys(a, ['questionId', 'optionId']) || typeof a.questionId !== 'string' ||
        typeof a.optionId !== 'string' || answers.has(a.questionId)) throw new Error('Invalid ECG answers')
    answers.set(a.questionId, a.optionId)
  }
  if (answers.size !== rubric.questions.length) throw new Error('Incomplete ECG answers')
  const dimensions = rubric.questions.map(q => {
    const selected = answers.get(q.id)
    if (!selected || !q.optionIds.includes(selected)) throw new Error('Unknown ECG answer')
    return { skillId: q.skillId, weight: q.weight, score: selected === q.correctOptionId ? 1 : 0,
      criticalMiss: q.critical && selected !== q.correctOptionId }
  })
  // Bind the exact grading definition and submitted answers into persisted evidence.
  const auditedWriter: Writer = { rpc(name, args) {
    const evidence = args.p_evidence as Record<string, unknown>
    return writer.rpc(name, { ...args, p_evidence: { ...evidence, answerSubmission: {
      rubricVersion: rubric.version, rubricDigest: rubric.approval.definitionSha256,
      clinicalEventId: rubric.clinicalEventId,
      answers: rubric.questions.map(q => ({ questionId: q.id, optionId: answers.get(q.id) })),
    } } })
  } }
  return saveGovernedEcgAttempt(auth, auditedWriter, {
    scoringVersion: '1.0.0', caseId: snapshot.caseId, attemptId: payload.attemptId, learnerId: owner,
    dimensions, ...(payload.confidence === undefined ? {} : { confidence: payload.confidence as number }),
  }, receivedAt, snapshot)
}
