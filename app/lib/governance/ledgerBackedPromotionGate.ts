import type { EvidenceLedgerEvent, LedgerProduct } from './evidenceProvenanceLedger.ts'
import { validateEvidenceLedgerIntegrityV2 } from './evidenceLedgerIntegrityV2.ts'

export type LedgerPromotionDecision = 'PROMOTION_CANDIDATE' | 'HOLD' | 'REJECT'

export interface LedgerBackedPromotionInput {
  product: LedgerProduct
  subjectId: string
  expectedArtifactSha256: string
  events: readonly EvidenceLedgerEvent[]
  rightsStillValid: boolean
  provenanceStillValid: boolean
  requirePromotionDecisionEvent?: boolean
}

export interface LedgerBackedPromotionResult {
  product: LedgerProduct
  subjectId: string
  decision: LedgerPromotionDecision
  learnerEligible: false
  blockers: readonly string[]
  satisfiedEventKinds: readonly string[]
  evidenceEventIds: readonly string[]
}

const REQUIRED_PASS_EVENTS = [
  'PROBED',
  'PRIVACY_ATTESTED',
  'CLINICAL_ATTESTED',
  'DEVICE_BASELINE_BOUND',
] as const

function validSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value)
}

function eventMatchesArtifact(event: EvidenceLedgerEvent, expectedSha256: string): boolean {
  return event.artifacts.some(artifact => artifact.sha256.toLowerCase() === expectedSha256.toLowerCase())
}

export function evaluateLedgerBackedPromotion(
  input: LedgerBackedPromotionInput,
): LedgerBackedPromotionResult {
  const blockers: string[] = []

  if (!validSha256(input.expectedArtifactSha256)) {
    throw new Error('expectedArtifactSha256 must be a SHA256 hex digest')
  }

  const integrity = validateEvidenceLedgerIntegrityV2(input.events)
  if (!integrity.valid) blockers.push(...integrity.blockers.map(blocker => `ledger-integrity-v2:${blocker}`))

  const subjectEvents = input.events.filter(event => event.product === input.product && event.subjectId === input.subjectId)
  if (!subjectEvents.length) blockers.push('subject-ledger-events-missing')

  const shaBoundEvents = subjectEvents.filter(event => eventMatchesArtifact(event, input.expectedArtifactSha256))
  if (!shaBoundEvents.length) blockers.push('expected-artifact-sha-not-bound-in-ledger')

  if (!input.rightsStillValid) blockers.push('rights-no-longer-valid')
  if (!input.provenanceStillValid) blockers.push('provenance-no-longer-valid')

  const hasRejectOrRecall = shaBoundEvents.some(event =>
    event.decision === 'REJECT' || event.kind === 'RECALLED' || event.kind === 'RETIRED',
  )
  if (hasRejectOrRecall) blockers.push('rejected-recalled-or-retired-event-present')

  const satisfiedEventKinds: string[] = []
  for (const kind of REQUIRED_PASS_EVENTS) {
    const match = shaBoundEvents.find(event => event.kind === kind && event.decision === 'PASS')
    if (!match) blockers.push(`required-pass-event-missing:${kind}`)
    else satisfiedEventKinds.push(kind)
  }

  const privacy = shaBoundEvents.find(event => event.kind === 'PRIVACY_ATTESTED' && event.decision === 'PASS')
  if (privacy && (privacy.actor.actorType !== 'HUMAN' || privacy.humanAttestation?.scope !== 'PRIVACY' || privacy.humanAttestation.attested !== true)) {
    blockers.push('privacy-attestation-not-human-valid')
  }

  const clinical = shaBoundEvents.find(event => event.kind === 'CLINICAL_ATTESTED' && event.decision === 'PASS')
  if (clinical && (clinical.actor.actorType !== 'HUMAN' || clinical.humanAttestation?.scope !== 'CLINICAL' || clinical.humanAttestation.attested !== true)) {
    blockers.push('clinical-attestation-not-human-valid')
  }

  if (input.requirePromotionDecisionEvent) {
    const promotion = shaBoundEvents.find(event => event.kind === 'PROMOTION_DECIDED' && event.decision === 'PROMOTE')
    if (!promotion) blockers.push('promotion-decision-event-missing')
    else if (promotion.actor.actorType === 'AI') blockers.push('ai-cannot-authorize-promotion')
    else satisfiedEventKinds.push('PROMOTION_DECIDED')
  }

  const reject = blockers.some(blocker =>
    blocker === 'rights-no-longer-valid'
    || blocker === 'provenance-no-longer-valid'
    || blocker === 'rejected-recalled-or-retired-event-present',
  )

  return {
    product: input.product,
    subjectId: input.subjectId,
    decision: reject ? 'REJECT' : blockers.length ? 'HOLD' : 'PROMOTION_CANDIDATE',
    learnerEligible: false,
    blockers,
    satisfiedEventKinds,
    evidenceEventIds: shaBoundEvents.map(event => event.eventId),
  }
}
