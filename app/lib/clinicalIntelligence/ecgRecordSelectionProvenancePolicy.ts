export type EcgRecordSelectionDecision = 'ELIGIBLE_FOR_CASE_REVIEW' | 'HOLD' | 'REJECT'

export interface PtbXlRecordSelectionCandidate {
  datasetSourceId: 'physionet-ptb-xl-v1.0.3'
  datasetVersion: '1.0.3'
  ecgId: string
  patientId: string
  stratFold: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  filenameHr: string
  filenameLr: string
  samplingHz: 500
  waveformSha256?: string
  scpCodes: readonly string[]
  validatedByHuman: boolean
  educationalObjective: string
  skillIds: readonly string[]
  sourceLicense: 'CC-BY-4.0'
  attributionPlanPresent: boolean
  waveformTechnicallyInspected: boolean
  privacyReviewed: boolean
  clinicalLabelReviewed: boolean
}

export interface EcgRecordSelectionResult {
  decision: EcgRecordSelectionDecision
  blockers: readonly string[]
  patientGroupKey: string
  preserveOriginalFold: true
  labelAuthority: 'SOURCE_ANNOTATION_REQUIRES_HUMAN_CLINICAL_REVIEW'
}

/**
 * PTB-XL provides patient_id plus a patient-respecting strat_fold assignment.
 * Cliniverse preserves both rather than creating an independent random split.
 * Dataset labels remain source annotations only until the selected waveform and
 * educational interpretation are reviewed by a human clinical reviewer.
 */
export function evaluatePtbXlRecordSelection(
  candidate: PtbXlRecordSelectionCandidate,
): EcgRecordSelectionResult {
  const blockers: string[] = []

  if (!candidate.ecgId.trim()) blockers.push('ecg-id-required')
  if (!candidate.patientId.trim()) blockers.push('patient-id-required')
  if (!candidate.filenameHr.trim()) blockers.push('high-resolution-path-required')
  if (!candidate.filenameLr.trim()) blockers.push('low-resolution-path-required')
  if (candidate.samplingHz !== 500) blockers.push('500hz-source-required')
  if (!candidate.educationalObjective.trim()) blockers.push('educational-objective-required')
  if (!candidate.skillIds.some(skillId => skillId.trim().length > 0)) blockers.push('skill-binding-required')
  if (!candidate.attributionPlanPresent) blockers.push('attribution-plan-required')
  if (!candidate.waveformTechnicallyInspected) blockers.push('technical-waveform-inspection-required')
  if (!candidate.privacyReviewed) blockers.push('record-privacy-review-required')
  if (!candidate.clinicalLabelReviewed) blockers.push('human-clinical-label-review-required')
  if (!candidate.waveformSha256?.trim()) blockers.push('waveform-sha256-required')

  const reject = candidate.sourceLicense !== 'CC-BY-4.0'
  if (reject) blockers.push('source-license-mismatch')

  return {
    decision: reject ? 'REJECT' : blockers.length ? 'HOLD' : 'ELIGIBLE_FOR_CASE_REVIEW',
    blockers,
    patientGroupKey: `${candidate.datasetSourceId}:${candidate.patientId}`,
    preserveOriginalFold: true,
    labelAuthority: 'SOURCE_ANNOTATION_REQUIRES_HUMAN_CLINICAL_REVIEW',
  }
}

export function describePtbXlSelectionPolicy() {
  return {
    preservePatientGrouping: true,
    preserveOriginalStratFold: true,
    recommendedTrainingFolds: [1, 2, 3, 4, 5, 6, 7, 8] as const,
    recommendedValidationFold: 9 as const,
    recommendedTestFold: 10 as const,
    preferHighResolution500HzForCaseReview: true,
    sourceLabelsAutoAuthorizeDiagnosis: false,
    sourceLabelsRequireHumanClinicalReview: true,
    recordChecksumRequiredBeforeCaseReview: true,
    educationalObjectiveRequiredBeforeSelection: true,
    skillBindingRequiredBeforeSelection: true,
  } as const
}
