import { PTB_XL_SOURCE_MANIFEST } from './ecgContentSourceManifest.ts'

export type EcgGovernedCaseSkeletonStatus = 'SOURCE_SELECTED' | 'HOLD'

export interface EcgGovernedCaseSkeleton {
  caseId: string
  sourceId: string
  sourceVersion: string
  sourceRecordId: string | null
  modality: 'ECG'
  intendedUse: 'EDUCATIONAL_COMPETENCY'
  requiredLeadCount: 12
  preferredSamplingHz: 500
  sourceLicense: 'CC-BY-4.0'
  attributionRequired: true
  privacyReviewStatus: 'PENDING'
  clinicalReviewStatus: 'PENDING'
  technicalValidationStatus: 'PENDING'
  telemetryBindingStatus: 'PENDING'
  evidenceLedgerBindingStatus: 'PENDING'
  learnerReady: false
  diagnosisLabel: null
  skillIds: readonly string[]
  blockers: readonly string[]
}

/**
 * Deliberately contains no selected record and no diagnosis. The next governed
 * step is record selection against a documented educational objective, followed
 * by technical/privacy/clinical review. This prevents label-driven case
 * fabrication before the waveform itself has been inspected.
 */
export const ECG_FIRST_GOVERNED_CASE_SKELETON: EcgGovernedCaseSkeleton = {
  caseId: 'ecg-governed-case-001',
  sourceId: PTB_XL_SOURCE_MANIFEST.sourceId,
  sourceVersion: PTB_XL_SOURCE_MANIFEST.version,
  sourceRecordId: null,
  modality: 'ECG',
  intendedUse: 'EDUCATIONAL_COMPETENCY',
  requiredLeadCount: 12,
  preferredSamplingHz: 500,
  sourceLicense: 'CC-BY-4.0',
  attributionRequired: true,
  privacyReviewStatus: 'PENDING',
  clinicalReviewStatus: 'PENDING',
  technicalValidationStatus: 'PENDING',
  telemetryBindingStatus: 'PENDING',
  evidenceLedgerBindingStatus: 'PENDING',
  learnerReady: false,
  diagnosisLabel: null,
  skillIds: [],
  blockers: [
    'source-record-selection-required',
    'educational-objective-required',
    'skill-binding-required',
    'technical-validation-required',
    'privacy-review-required',
    'human-clinical-review-required',
    'telemetry-binding-required',
    'evidence-ledger-binding-required',
  ],
}

export function bindEcgCaseSourceRecord(input: {
  skeleton: EcgGovernedCaseSkeleton
  sourceRecordId: string
  educationalObjective: string
  skillIds: readonly string[]
}): EcgGovernedCaseSkeleton {
  const sourceRecordId = input.sourceRecordId.trim()
  const educationalObjective = input.educationalObjective.trim()
  const skillIds = input.skillIds.filter(skillId => skillId.trim().length > 0)

  const blockers = input.skeleton.blockers.filter(blocker => ![
    'source-record-selection-required',
    'educational-objective-required',
    'skill-binding-required',
  ].includes(blocker))

  if (!sourceRecordId) blockers.push('source-record-selection-required')
  if (!educationalObjective) blockers.push('educational-objective-required')
  if (!skillIds.length) blockers.push('skill-binding-required')

  return {
    ...input.skeleton,
    sourceRecordId: sourceRecordId || null,
    skillIds,
    blockers,
  }
}
