import { createHash } from 'node:crypto'
import type { EvidenceLedgerEvent } from '../governance/evidenceProvenanceLedger.ts'
import { validateEvidenceLedgerIntegrityV2 } from '../governance/evidenceLedgerIntegrityV2.ts'
import { evaluateEcgHospitalRendererCoverage, type EcgHospitalRendererTarget, type EcgHospitalRendererEvidence } from './ecgHospitalRendererBaselineBinding.ts'

export const ECG_ELIGIBILITY_POLICY = { id: 'ecg-evidence-eligibility', version: '1.0.0' } as const
export interface EcgEligibilitySnapshot {
  caseId: string
  sourceArtifactSha256: string
  events: readonly EvidenceLedgerEvent[]
  target?: EcgHospitalRendererTarget
  deviceBinding?: { eventId: string; evidence: EcgHospitalRendererEvidence }
  authorizedPromotionActorIds: readonly string[]
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).filter(([,v]) => v !== undefined).sort(([a],[b]) => a.localeCompare(b)).map(([key,v]) => `${JSON.stringify(key)}:${canonical(v)}`).join(',')}}`
  return JSON.stringify(value)
}
/** Server-side only: snapshots and actor allowlist come from the trusted registry,
 * not from an assessment request. This evaluates authority; it never grants it.
 */
export function evaluateEcgEligibility(snapshot: EcgEligibilitySnapshot) {
  const integrity = validateEvidenceLedgerIntegrityV2(snapshot.events)
  const blockers = [...integrity.blockers]
  if (!snapshot.caseId.trim()) blockers.push('case-id-required')
  if (!/^[a-f0-9]{64}$/i.test(snapshot.sourceArtifactSha256)) blockers.push('source-sha-required')
  const scoped = snapshot.events.filter(event => event.product === 'CLINIVERSE' && event.subjectId === snapshot.caseId &&
    event.artifacts.some(artifact => artifact.sha256.toLowerCase() === snapshot.sourceArtifactSha256.toLowerCase()))
  for (const kind of ['PROBED','CLINICAL_ATTESTED','PRIVACY_ATTESTED'] as const) {
    if ([...scoped].reverse().find(event => event.kind === kind)?.decision !== 'PASS') blockers.push(`evidence-missing:${kind}`)
  }
  if (scoped.some(event => event.kind === 'RECALLED' || event.kind === 'RETIRED')) blockers.push('case-recalled-or-retired')
  const promotion = [...scoped].reverse().find(event => event.kind === 'PROMOTION_DECIDED')
  const promotionAuthorized = promotion?.decision === 'PROMOTE' && promotion.actor.actorType === 'HUMAN' &&
    promotion.humanAttestation?.scope === 'PROMOTION_AUTHORITY' && promotion.humanAttestation.attested &&
    snapshot.authorizedPromotionActorIds.includes(promotion.actor.actorId) &&
    promotion.policies.some(policy => policy.policyId === ECG_ELIGIBILITY_POLICY.id && policy.policyVersion === ECG_ELIGIBILITY_POLICY.version)
  if (!promotionAuthorized) blockers.push('current-authorized-promotion-required')
  for (const kind of ['CLINICAL_ATTESTED', 'PRIVACY_ATTESTED'] as const) {
    const current = [...scoped].reverse().find(event => event.kind === kind)
    if (promotion && current && !(promotion.parentEventIds ?? []).includes(current.eventId)) {
      blockers.push(`promotion-current-evidence-parent-required:${kind}`)
    }
  }
  const device = scoped.find(event => event.eventId === snapshot.deviceBinding?.eventId && event.kind === 'DEVICE_BASELINE_BOUND' && event.decision === 'PASS')
  if (!device) blockers.push('device-ledger-binding-required')
  if (!snapshot.target || !snapshot.deviceBinding) blockers.push('exact-renderer-evidence-required')
  else blockers.push(...evaluateEcgHospitalRendererCoverage(snapshot.target, snapshot.deviceBinding.evidence).blockers)
  if (promotion && device && !(promotion.parentEventIds ?? []).includes(device.eventId)) blockers.push('promotion-device-parent-required')
  // Reject non-chronological same-case records, even if unrelated parents were omitted.
  if (scoped.some((event,index) => index > 0 && Date.parse(event.occurredAt) < Date.parse(scoped[index-1].occurredAt))) blockers.push('case-events-out-of-order')
  const reasons = [...new Set(blockers)].sort()
  const evidenceDigest = createHash('sha256').update(canonical(snapshot)).digest('hex')
  const decision = reasons.length ? 'HOLD' as const : 'LEARNER_ELIGIBLE' as const
  const decisionId = createHash('sha256').update(canonical({ policy: ECG_ELIGIBILITY_POLICY, evidenceDigest, decision, blockers: reasons })).digest('hex')
  return { decisionId, policy: ECG_ELIGIBILITY_POLICY, evidenceDigest, decision, learnerReady: decision === 'LEARNER_ELIGIBLE',
    promotionAuthorized: Boolean(promotionAuthorized), integrityValid: integrity.valid, deviceBaselineBound: Boolean(device),
    evidenceEventIds: scoped.map(event => event.eventId), blockers: reasons }
}
