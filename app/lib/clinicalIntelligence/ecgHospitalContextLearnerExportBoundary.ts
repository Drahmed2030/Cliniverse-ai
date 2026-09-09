export interface EcgRestrictedHospitalContext {
  contextVersion: '1.0.0'
  sourceSystemId: string
  patientReference?: string
  encounterReference?: string
  orderReference?: string
  diagnosticReportReference?: string
  accessionOrStudyReference?: string
  acquisitionDateTime?: string
  containsPhi: true
}

export interface EcgLearnerExportInput {
  exportVersion: '1.0.0'
  canonicalWaveformSha256: string
  educationalCaseId: string
  opaqueSourceReference: string
  approvedAnnotationIds: readonly string[]
  attributionText: string
  directPatientIdentifiersPresent: boolean
  acquisitionDateTimePresent: boolean
  restrictedContextEmbedded: boolean
  freeTextReviewed: boolean
  hospitalUseAuthorized: boolean
}

export interface EcgLearnerExportDecision {
  decision: 'EXPORT_CANDIDATE' | 'HOLD' | 'REJECT'
  blockers: readonly string[]
  phiCopiedToLearnerStorage: false
}

function validSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value)
}

/**
 * Restricted hospital context remains outside learner storage. This boundary
 * permits only a governed educational projection with opaque linkage and
 * explicit authorization. It is not a de-identification certification.
 */
export function evaluateEcgLearnerExport(
  input: EcgLearnerExportInput,
): EcgLearnerExportDecision {
  const blockers: string[] = []

  if (!validSha256(input.canonicalWaveformSha256)) blockers.push('canonical-waveform-sha-invalid')
  if (!input.educationalCaseId.trim()) blockers.push('educational-case-id-required')
  if (!input.opaqueSourceReference.trim()) blockers.push('opaque-source-reference-required')
  if (!input.attributionText.trim()) blockers.push('attribution-required')
  if (!input.freeTextReviewed) blockers.push('free-text-review-required')
  if (!input.hospitalUseAuthorized) blockers.push('hospital-use-authorization-required')
  if (input.directPatientIdentifiersPresent) blockers.push('direct-patient-identifiers-present')
  if (input.acquisitionDateTimePresent) blockers.push('patient-linked-acquisition-datetime-present')
  if (input.restrictedContextEmbedded) blockers.push('restricted-hospital-context-embedded')

  const reject = blockers.some(blocker =>
    blocker === 'direct-patient-identifiers-present'
    || blocker === 'restricted-hospital-context-embedded',
  )

  return {
    decision: reject ? 'REJECT' : blockers.length ? 'HOLD' : 'EXPORT_CANDIDATE',
    blockers,
    phiCopiedToLearnerStorage: false,
  }
}

export function describeEcgHospitalContextBoundary() {
  return {
    restrictedContextMayContainPhi: true,
    restrictedContextStoredInLearnerDomain: false,
    learnerProjectionUsesOpaqueSourceReference: true,
    patientEncounterOrderReferencesRemainRestricted: true,
    hospitalUseAuthorizationRequired: true,
    freeTextMustBeReviewedBeforeExport: true,
    learnerExportIsNotLegalDeidentificationCertification: true,
  } as const
}
