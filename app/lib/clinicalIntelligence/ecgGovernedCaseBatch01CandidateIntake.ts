export type EcgBatch01CandidateIntakeStatus = 'METADATA_SHORTLISTED' | 'HOLD'

export interface EcgBatch01MetadataCandidateV1 {
  slotId: string
  ecgId: number
  patientId: number
  stratFold: 9 | 10
  filenameHr: string
  filenameLr: string
  sourceScpCodes: Readonly<Record<string, number>>
  sourceReportSummary: string
  targetSkillIds: readonly string[]
  sourceLabelConflict?: boolean
  technicalCaveatFromMetadata?: string | null
  diagnosisLabel: null
  technicalWaveformInspectionStatus: 'PENDING'
  privacyReviewStatus: 'PENDING'
  clinicalReviewStatus: 'PENDING'
  learnerReady: false
  status: EcgBatch01CandidateIntakeStatus
}

/**
 * Metadata-only shortlist from the official PTB-XL v1.0.3 database.
 *
 * These are actual record identifiers, but they are not governed diagnoses and
 * are not learner-ready. Source report/SCP statements are selection hints only.
 * Every record still requires waveform inspection, privacy review and human
 * clinical review before it may become a governed case.
 */
export const ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1: readonly EcgBatch01MetadataCandidateV1[] = [
  {
    slotId: 'batch01-normal-sinus-01',
    ecgId: 10,
    patientId: 9456,
    stratFold: 9,
    filenameHr: 'records500/00000/00010_hr',
    filenameLr: 'records100/00000/00010_lr',
    sourceScpCodes: { NORM: 100, SR: 0 },
    sourceReportSummary: 'sinus rhythm / normal ECG source report',
    targetSkillIds: ['ecg-rhythm-sinus-recognition', 'ecg-normal-pattern-recognition', 'ecg-rate-assessment'],
    diagnosisLabel: null,
    technicalWaveformInspectionStatus: 'PENDING',
    privacyReviewStatus: 'PENDING',
    clinicalReviewStatus: 'PENDING',
    learnerReady: false,
    status: 'METADATA_SHORTLISTED',
  },
  {
    slotId: 'batch01-rbbb-01',
    ecgId: 195,
    patientId: 14472,
    stratFold: 9,
    filenameHr: 'records500/00000/00195_hr',
    filenameLr: 'records100/00000/00195_lr',
    sourceScpCodes: { CRBBB: 100, SR: 0 },
    sourceReportSummary: 'sinus rhythm / right bundle branch block source report',
    targetSkillIds: ['ecg-qrs-duration-assessment', 'ecg-bundle-branch-block-recognition', 'ecg-frontal-axis-assessment'],
    technicalCaveatFromMetadata: 'baseline-drift metadata present in II-V2; inspect waveform before any clinical use',
    diagnosisLabel: null,
    technicalWaveformInspectionStatus: 'PENDING',
    privacyReviewStatus: 'PENDING',
    clinicalReviewStatus: 'PENDING',
    learnerReady: false,
    status: 'METADATA_SHORTLISTED',
  },
  {
    slotId: 'batch01-lbbb-01',
    ecgId: 180,
    patientId: 15592,
    stratFold: 10,
    filenameHr: 'records500/00000/00180_hr',
    filenameLr: 'records100/00000/00180_lr',
    sourceScpCodes: { CLBBB: 100, SR: 0 },
    sourceReportSummary: 'sinus rhythm / left bundle branch block source report',
    targetSkillIds: ['ecg-qrs-duration-assessment', 'ecg-bundle-branch-block-recognition'],
    technicalCaveatFromMetadata: 'electrode-problem metadata references V4; inspect before use',
    diagnosisLabel: null,
    technicalWaveformInspectionStatus: 'PENDING',
    privacyReviewStatus: 'PENDING',
    clinicalReviewStatus: 'PENDING',
    learnerReady: false,
    status: 'METADATA_SHORTLISTED',
  },
  {
    slotId: 'batch01-av-block-01',
    ecgId: 347,
    patientId: 1875,
    stratFold: 10,
    filenameHr: 'records500/00000/00347_hr',
    filenameLr: 'records100/00000/00347_lr',
    sourceScpCodes: { LVH: 50, ISC_: 100, 'LAO/LAE': 50, '1AVB': 100, NST_: 0, LPR: 0, SR: 0, AFLT: 0 },
    sourceReportSummary: 'complex source annotation including first-degree AV block',
    targetSkillIds: ['ecg-pr-interval-assessment', 'ecg-av-block-recognition'],
    sourceLabelConflict: true,
    diagnosisLabel: null,
    technicalWaveformInspectionStatus: 'PENDING',
    privacyReviewStatus: 'PENDING',
    clinicalReviewStatus: 'PENDING',
    learnerReady: false,
    status: 'METADATA_SHORTLISTED',
  },
  {
    slotId: 'batch01-lvh-01',
    ecgId: 299,
    patientId: 7852,
    stratFold: 10,
    filenameHr: 'records500/00000/00299_hr',
    filenameLr: 'records100/00000/00299_lr',
    sourceScpCodes: { LVH: 100, ISC_: 100, 'LAO/LAE': 50, SR: 0 },
    sourceReportSummary: 'source report describing LVH with ST-T abnormalities',
    targetSkillIds: ['ecg-lvh-pattern-recognition', 'ecg-frontal-axis-assessment'],
    diagnosisLabel: null,
    technicalWaveformInspectionStatus: 'PENDING',
    privacyReviewStatus: 'PENDING',
    clinicalReviewStatus: 'PENDING',
    learnerReady: false,
    status: 'METADATA_SHORTLISTED',
  },
  {
    slotId: 'batch01-ischemia-01',
    ecgId: 271,
    patientId: 2751,
    stratFold: 10,
    filenameHr: 'records500/00000/00271_hr',
    filenameLr: 'records100/00000/00271_lr',
    sourceScpCodes: { ASMI: 100, LVH: 100, ISC_: 100, PAC: 0, STD_: 0, SR: 0 },
    sourceReportSummary: 'source report describing old anteroseptal injury / ischemic changes',
    targetSkillIds: ['ecg-ischemia-stemi-pattern-recognition', 'ecg-lvh-pattern-recognition'],
    sourceLabelConflict: true,
    diagnosisLabel: null,
    technicalWaveformInspectionStatus: 'PENDING',
    privacyReviewStatus: 'PENDING',
    clinicalReviewStatus: 'PENDING',
    learnerReady: false,
    status: 'METADATA_SHORTLISTED',
  },
  {
    slotId: 'batch01-atrial-arrhythmia-01',
    ecgId: 17,
    patientId: 13619,
    stratFold: 9,
    filenameHr: 'records500/00000/00017_hr',
    filenameLr: 'records100/00000/00017_lr',
    sourceScpCodes: { AFLT: 100, ABQRS: 0, AFIB: 0 },
    sourceReportSummary: 'source report and SCP statements are not fully concordant for atrial arrhythmia',
    targetSkillIds: ['ecg-atrial-fibrillation-recognition', 'ecg-rate-assessment'],
    sourceLabelConflict: true,
    diagnosisLabel: null,
    technicalWaveformInspectionStatus: 'PENDING',
    privacyReviewStatus: 'PENDING',
    clinicalReviewStatus: 'PENDING',
    learnerReady: false,
    status: 'METADATA_SHORTLISTED',
  },
] as const

export function evaluateEcgBatch01MetadataCandidateIntakeV1(
  candidates: readonly EcgBatch01MetadataCandidateV1[] = ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1,
) {
  const blockers: string[] = []
  const ecgIds = candidates.map(item => item.ecgId)
  const patientIds = candidates.map(item => item.patientId)
  const slotIds = candidates.map(item => item.slotId)

  if (!candidates.length) blockers.push('metadata-candidates-required')
  if (new Set(ecgIds).size !== ecgIds.length) blockers.push('duplicate-ecg-id')
  if (new Set(patientIds).size !== patientIds.length) blockers.push('duplicate-patient-id')
  if (new Set(slotIds).size !== slotIds.length) blockers.push('duplicate-slot-id')

  for (const candidate of candidates) {
    if (candidate.stratFold !== 9 && candidate.stratFold !== 10) blockers.push(`high-label-quality-fold-required:${candidate.ecgId}`)
    if (!candidate.filenameHr.endsWith('_hr')) blockers.push(`500hz-path-required:${candidate.ecgId}`)
    if (!candidate.filenameLr.endsWith('_lr')) blockers.push(`100hz-path-required:${candidate.ecgId}`)
    if (!candidate.targetSkillIds.length) blockers.push(`target-skill-required:${candidate.ecgId}`)
    if (candidate.diagnosisLabel !== null) blockers.push(`source-label-cannot-auto-promote-diagnosis:${candidate.ecgId}`)
    if (candidate.learnerReady) blockers.push(`metadata-candidate-cannot-be-learner-ready:${candidate.ecgId}`)
  }

  return {
    decision: blockers.length ? 'HOLD' as const : 'READY_FOR_WAVEFORM_INSPECTION' as const,
    blockers,
    selectedMetadataCandidateCount: candidates.length,
    patientGroupingPreserved: new Set(patientIds).size === patientIds.length,
    clinicalTruthEstablished: false as const,
    learnerReady: false as const,
  }
}
