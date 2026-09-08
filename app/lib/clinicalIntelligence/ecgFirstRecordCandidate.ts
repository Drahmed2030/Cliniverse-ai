export type EcgFirstRecordCandidateStatus = 'CANDIDATE_SELECTED' | 'HOLD'

export interface EcgFirstRecordCandidate {
  datasetSourceId: 'physionet-ptb-xl-v1.0.3'
  ecgId: 10
  patientId: 9456
  stratFold: 9
  filenameHr: 'records500/00000/00010_hr'
  filenameLr: 'records100/00000/00010_lr'
  sourceAnnotationBasis: 'SCP-ECG'
  sourceScpCodes: Readonly<Record<string, number>>
  sourceReport: string
  sourceValidatedByHuman: true
  sourceSignalFlags: {
    baselineDriftPresent: false
    staticNoisePresent: false
    burstNoisePresent: false
    electrodesProblemsPresent: false
    pacemakerPresent: false
  }
  educationalObjective: 'recognize-normal-sinus-rhythm-and-normal-ecg-pattern'
  proposedSkillIds: readonly [
    'ecg-rhythm-sinus-recognition',
    'ecg-normal-pattern-recognition',
  ]
  technicalWaveformInspectionStatus: 'PENDING'
  privacyReviewStatus: 'PENDING'
  clinicalReviewStatus: 'PENDING'
  evidenceLedgerBindingStatus: 'PENDING'
  learnerReady: false
  diagnosisLabel: null
  status: EcgFirstRecordCandidateStatus
  blockers: readonly string[]
}

/**
 * First record-level candidate selected from PTB-XL metadata for a foundational
 * competency objective. Source annotations remain provenance evidence only and
 * are deliberately not promoted to a Cliniverse diagnosis label. The waveform
 * itself still requires technical inspection plus human privacy and clinical
 * review before any learner-facing use.
 */
export const ECG_FIRST_RECORD_CANDIDATE: EcgFirstRecordCandidate = {
  datasetSourceId: 'physionet-ptb-xl-v1.0.3',
  ecgId: 10,
  patientId: 9456,
  stratFold: 9,
  filenameHr: 'records500/00000/00010_hr',
  filenameLr: 'records100/00000/00010_lr',
  sourceAnnotationBasis: 'SCP-ECG',
  sourceScpCodes: {
    NORM: 100,
    SR: 0,
  },
  sourceReport: 'sinusrhythmus normales ekg',
  sourceValidatedByHuman: true,
  sourceSignalFlags: {
    baselineDriftPresent: false,
    staticNoisePresent: false,
    burstNoisePresent: false,
    electrodesProblemsPresent: false,
    pacemakerPresent: false,
  },
  educationalObjective: 'recognize-normal-sinus-rhythm-and-normal-ecg-pattern',
  proposedSkillIds: [
    'ecg-rhythm-sinus-recognition',
    'ecg-normal-pattern-recognition',
  ],
  technicalWaveformInspectionStatus: 'PENDING',
  privacyReviewStatus: 'PENDING',
  clinicalReviewStatus: 'PENDING',
  evidenceLedgerBindingStatus: 'PENDING',
  learnerReady: false,
  diagnosisLabel: null,
  status: 'CANDIDATE_SELECTED',
  blockers: [
    'technical-waveform-inspection-required',
    'privacy-review-required',
    'human-clinical-review-required',
    'evidence-ledger-binding-required',
  ],
}

export function evaluateFirstEcgRecordCandidate(candidate = ECG_FIRST_RECORD_CANDIDATE) {
  const blockers = [...candidate.blockers]
  if (candidate.stratFold !== 9 && candidate.stratFold !== 10) blockers.push('high-label-quality-fold-required')
  if (!candidate.sourceValidatedByHuman) blockers.push('human-source-validation-required')
  if (!candidate.filenameHr.endsWith('_hr')) blockers.push('500hz-source-path-required')
  if (!candidate.proposedSkillIds.length) blockers.push('skill-objective-binding-required')
  if (candidate.diagnosisLabel !== null) blockers.push('source-label-cannot-auto-promote-diagnosis')

  return {
    status: blockers.length === candidate.blockers.length ? candidate.status : 'HOLD' as const,
    learnerReady: false as const,
    blockers,
  }
}
