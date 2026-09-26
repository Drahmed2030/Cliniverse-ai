export type EvidenceAvailability =
  | 'available'
  | 'unavailable'
  | 'unknown'
  | 'permission-limited'

export type EvidenceFreshness = 'current' | 'stale' | 'unknown'
export type EvidenceVerification = 'verified' | 'unverified' | 'unknown'

export interface EvidenceTrustEnvelope {
  availability: EvidenceAvailability
  freshness: EvidenceFreshness
  verification: EvidenceVerification
  sourceAuthority:
    | 'cliniverse-governed'
    | 'health-cloud-context'
    | 'source-system'
  provenanceRef?: string
}

export interface EvidenceUseDecision {
  usable: boolean
  reasons: readonly string[]
}

export function evidenceUseDecision(
  envelope: EvidenceTrustEnvelope,
): EvidenceUseDecision {
  const reasons: string[] = []

  if (envelope.availability !== 'available') {
    reasons.push('availability-not-confirmed')
  }
  if (envelope.freshness !== 'current') {
    reasons.push('freshness-not-confirmed')
  }
  if (envelope.verification !== 'verified') {
    reasons.push('verification-not-confirmed')
  }
  if (!envelope.provenanceRef?.trim()) {
    reasons.push('provenance-required')
  }

  return { usable: reasons.length === 0, reasons }
}

export function absenceCanBeInterpretedAsNegative(
  _availability: EvidenceAvailability,
): false {
  return false
}

export const EVIDENCE_TRUST_BOUNDARY = Object.freeze({
  defaultDecision: 'fail-closed',
  absenceIsNeverClinicalNegative: true,
  permissionLimitedIsNotAbsence: true,
  staleIsNotCurrent: true,
  provenanceAndAuditStaySeparate: true,
} as const)
