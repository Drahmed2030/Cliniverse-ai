import { evaluateEcgScoringAttemptV1, type EcgScoringAttemptV1 } from '../clinicalIntelligence/ecgScoringCompetencyContract.ts'

// Persistence boundary for the existing engine, not a promotion or scoring engine.
// The application must supply governance from its verified registry, never form input.
export function prepareEcgAccountAttempt(attempt: EcgScoringAttemptV1, observedAt: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attempt.learnerId)) {
    throw new Error('Authenticated ECG account identity required')
  }
  if (attempt.scoringVersion !== '1.0.0' || attempt.referenceAuthority !== 'HUMAN_REVIEWED' || !Number.isFinite(Date.parse(observedAt))) {
    throw new Error('Invalid ECG assessment provenance')
  }
  const snapshot = structuredClone(attempt)
  const result = evaluateEcgScoringAttemptV1(snapshot)
  if (result.decision !== 'SCORED') {
    return { state: 'not-saveable' as const, decision: result.decision, blockers: [...result.blockers] }
  }
  if (result.overallScore === null || !Number.isFinite(result.overallScore)) throw new Error('Non-finite ECG score')
  return {
    state: 'prepared' as const,
    evidence: { eventId: snapshot.attemptId, userId: snapshot.learnerId, caseId: snapshot.caseId,
      scoringVersion: snapshot.scoringVersion, humanClinicalAttestationId: snapshot.humanClinicalAttestationId,
      observedAt: new Date(observedAt).toISOString(), attempt: snapshot, result },
  }
}
