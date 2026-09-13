import { evaluateEcgEligibility, type EcgEligibilitySnapshot } from '../clinicalIntelligence/ecgEligibilityDecision.ts'
import { prepareEcgAccountAttempt } from './ecgAccountAttempt.ts'
import type { EcgScoringAttemptV1 } from '../clinicalIntelligence/ecgScoringCompetencyContract.ts'

/** Server boundary. Registry snapshot and graded dimensions must be server-owned.
 * The request may not supply its own gate, authority, policy or attestation.
 */
export function prepareGovernedEcgAccountAttempt(
  input: Omit<EcgScoringAttemptV1, 'gateState' | 'referenceAuthority' | 'humanClinicalAttestationId'>,
  observedAt: string,
  snapshot: EcgEligibilitySnapshot,
) {
  if (input.caseId !== snapshot.caseId) throw new Error('ECG case/eligibility mismatch')
  const eligibility = evaluateEcgEligibility(snapshot)
  if (!eligibility.learnerReady) return { state: 'not-saveable' as const, eligibility }
  const clinical = [...snapshot.events].reverse().find(event => event.subjectId === snapshot.caseId &&
    event.product === 'CLINIVERSE' && event.kind === 'CLINICAL_ATTESTED' && event.decision === 'PASS' &&
    event.artifacts.some(artifact => artifact.sha256.toLowerCase() === snapshot.sourceArtifactSha256.toLowerCase()))
  if (!clinical) throw new Error('Missing bound clinical attestation')
  const prepared = prepareEcgAccountAttempt({ ...input, gateState: eligibility.decision,
    referenceAuthority: 'HUMAN_REVIEWED', humanClinicalAttestationId: clinical.eventId }, observedAt)
  if (prepared.state !== 'prepared') return { ...prepared, eligibility }
  return { ...prepared, eligibility }
}
