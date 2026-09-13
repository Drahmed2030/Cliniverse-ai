export type LedgerProduct = 'CLINIVERSE' | 'NEURAOPS_CORE'
export type LedgerActorType = 'HUMAN' | 'AI' | 'SYSTEM'
export type LedgerEventKind =
  | 'INGESTED'
  | 'TRANSFORMED'
  | 'PROBED'
  | 'PRIVACY_PREFLIGHT'
  | 'PRIVACY_ATTESTED'
  | 'CLINICAL_ATTESTED'
  | 'DEVICE_BASELINE_BOUND'
  | 'PROMOTION_DECIDED'
  | 'RETIRED'
  | 'RECALLED'

export interface LedgerActor {
  actorType: LedgerActorType
  actorId: string
  displayName?: string
  qualificationsOrRole?: string
}

export interface EvidenceArtifactRef {
  artifactId: string
  sha256: string
  mediaType?: string
  uri?: string
  version?: string
}

export interface PolicyBinding {
  policyId: string
  policyVersion: string
}

export interface ProvenanceTransform {
  transformId: string
  transformVersion: string
  parametersDigestSha256?: string
  inputArtifactIds: readonly string[]
  outputArtifactIds: readonly string[]
}

export interface EvidenceLedgerEvent {
  eventId: string
  ledgerVersion: '1.0.0'
  product: LedgerProduct
  subjectId: string
  kind: LedgerEventKind
  occurredAt: string
  actor: LedgerActor
  artifacts: readonly EvidenceArtifactRef[]
  policies: readonly PolicyBinding[]
  transform?: ProvenanceTransform
  evidenceRecordIds?: readonly string[]
  decision?: 'PASS' | 'HOLD' | 'REJECT' | 'PROMOTE' | 'NOOP'
  humanAttestation?: {
    scope: 'PRIVACY' | 'CLINICAL' | 'PROMOTION_AUTHORITY'
    attested: boolean
  }
  parentEventIds?: readonly string[]
  notes?: readonly string[]
}

export interface EvidenceLedgerValidationResult {
  valid: boolean
  blockers: readonly string[]
}

function requireText(value: string | undefined, field: string, blockers: string[]): void {
  if (!value?.trim()) blockers.push(`${field}-required`)
}

function validSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value)
}

export function validateEvidenceLedgerEvent(event: EvidenceLedgerEvent): EvidenceLedgerValidationResult {
  const blockers: string[] = []

  requireText(event.eventId, 'eventId', blockers)
  requireText(event.subjectId, 'subjectId', blockers)
  requireText(event.occurredAt, 'occurredAt', blockers)
  requireText(event.actor.actorId, 'actor.actorId', blockers)

  if (!event.artifacts.length) blockers.push('artifacts-required')
  for (const artifact of event.artifacts) {
    requireText(artifact.artifactId, 'artifact.artifactId', blockers)
    if (!validSha256(artifact.sha256)) blockers.push(`artifact-sha256-invalid:${artifact.artifactId}`)
  }

  if (!event.policies.length) blockers.push('policy-binding-required')
  for (const policy of event.policies) {
    requireText(policy.policyId, 'policy.policyId', blockers)
    requireText(policy.policyVersion, 'policy.policyVersion', blockers)
  }

  if (event.kind === 'TRANSFORMED') {
    if (!event.transform) blockers.push('transform-required')
    else {
      requireText(event.transform.transformId, 'transform.transformId', blockers)
      requireText(event.transform.transformVersion, 'transform.transformVersion', blockers)
      if (!event.transform.inputArtifactIds.length) blockers.push('transform-input-required')
      if (!event.transform.outputArtifactIds.length) blockers.push('transform-output-required')
    }
  }

  if (event.kind === 'PRIVACY_ATTESTED') {
    if (event.actor.actorType !== 'HUMAN') blockers.push('privacy-attestation-must-be-human')
    if (event.humanAttestation?.scope !== 'PRIVACY' || event.humanAttestation.attested !== true) {
      blockers.push('privacy-human-attestation-required')
    }
  }

  if (event.kind === 'CLINICAL_ATTESTED') {
    if (event.actor.actorType !== 'HUMAN') blockers.push('clinical-attestation-must-be-human')
    if (event.humanAttestation?.scope !== 'CLINICAL' || event.humanAttestation.attested !== true) {
      blockers.push('clinical-human-attestation-required')
    }
  }

  if (event.kind === 'PROMOTION_DECIDED' && event.decision === 'PROMOTE') {
    if (event.actor.actorType !== 'HUMAN' && event.actor.actorType !== 'SYSTEM') blockers.push('promotion-authority-invalid')
    if (event.actor.actorType === 'AI') blockers.push('ai-cannot-authorize-promotion')
  }

  return { valid: blockers.length === 0, blockers }
}

export interface LedgerChainValidationInput {
  events: readonly EvidenceLedgerEvent[]
}

export interface LedgerChainValidationResult {
  valid: boolean
  blockers: readonly string[]
  orderedEventIds: readonly string[]
}

export function validateEvidenceLedgerChain(input: LedgerChainValidationInput): LedgerChainValidationResult {
  const blockers: string[] = []
  const seen = new Set<string>()

  for (const event of input.events) {
    if (seen.has(event.eventId)) blockers.push(`duplicate-event-id:${event.eventId}`)
    const result = validateEvidenceLedgerEvent(event)
    blockers.push(...result.blockers.map(blocker => `${event.eventId}:${blocker}`))
    for (const parentId of event.parentEventIds ?? []) {
      if (!seen.has(parentId)) blockers.push(`parent-not-seen-before-child:${event.eventId}:${parentId}`)
    }
    seen.add(event.eventId)
  }

  return {
    valid: blockers.length === 0,
    blockers,
    orderedEventIds: input.events.map(event => event.eventId),
  }
}

export function isHumanAttestationEvent(event: EvidenceLedgerEvent): boolean {
  return event.actor.actorType === 'HUMAN'
    && event.humanAttestation?.attested === true
    && (event.kind === 'PRIVACY_ATTESTED' || event.kind === 'CLINICAL_ATTESTED')
}
