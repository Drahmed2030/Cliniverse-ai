import { prepareGovernedEcgAccountAttempt } from './ecgGovernedAccountAttempt.ts'
import type { EcgEligibilitySnapshot } from '../clinicalIntelligence/ecgEligibilityDecision.ts'

type Attempt = Parameters<typeof prepareGovernedEcgAccountAttempt>[0]
interface Authenticator {
  getUser(): Promise<{ data: { user: { id: string } | null }; error: unknown }>
}
interface TrustedWriter {
  rpc(name: 'save_ecg_attempt_v1', args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }>
}
/** Server-only orchestration. auth is bound to the request's verified access token.
 * writer is the private service client; snapshot and grading are server-owned.
 * Registry publication is a separate authority operation, never a side effect of saving.
 */
export async function saveGovernedEcgAttempt(
  auth: Authenticator, writer: TrustedWriter, input: Attempt, observedAt: string, snapshot: EcgEligibilitySnapshot,
) {
  const identity = await auth.getUser()
  if (identity.error || !identity.data.user || identity.data.user.id !== input.learnerId) throw new Error('ECG account mismatch')
  const prepared = prepareGovernedEcgAccountAttempt(input, observedAt, snapshot)
  if (prepared.state !== 'prepared') return prepared
  const { eligibility, evidence } = prepared
  const result = await writer.rpc('save_ecg_attempt_v1', {
    p_user_id: identity.data.user.id, p_event_id: evidence.eventId, p_case_id: evidence.caseId,
    p_decision_id: eligibility.decisionId, p_evidence_digest: eligibility.evidenceDigest, p_evidence: evidence,
  })
  if (result.error) throw new Error('ECG save not acknowledged; retry the same attempt after checking eligibility')
  const row = result.data as Record<string, unknown> | null
  if (!row || row.user_id !== evidence.userId || row.event_id !== evidence.eventId || row.case_id !== evidence.caseId ||
      row.decision_id !== eligibility.decisionId || row.evidence_digest !== eligibility.evidenceDigest ||
      typeof row.created_at !== 'string' || !Number.isFinite(Date.parse(row.created_at))) throw new Error('Invalid ECG save acknowledgement')
  return { state: 'saved' as const, eventId: evidence.eventId, createdAt: row.created_at, eligibility }
}
