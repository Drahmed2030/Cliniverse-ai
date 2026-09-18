import type { EchoStudyView } from './echoStudyContract.ts'

// EchoStudyRecord — Batch 6, Atlas-level governance record. Distinct from
// the existing EchoStudy in echoStudyContract.ts, which is the Studio
// PLAYER's clip-sequencing contract and always requires real, governed
// playable clips. A study can exist here — with identity, provenance and an
// honest readiness state — long before (or without ever) having playable
// media. Only a 'ready' record may carry a playableStudyId; every other
// state MUST leave it null, because there is no media to link yet.

export type EchoStudyReviewStatus = 'reviewed' | 'pending_review' | 'unverified'
export type EchoStudyLicenseStatus = 'licensed-verified' | 'pending'
export type EchoStudyLearnerReadiness = 'ready' | 'review_required' | 'media_pending' | 'labs'

export interface EchoStudyRecord {
  studyKey: string
  title: string
  phenotypeKey: string
  learnerReadiness: EchoStudyLearnerReadiness
  reviewStatus: EchoStudyReviewStatus
  licenseStatus: EchoStudyLicenseStatus
  provenanceRef: string
  views: EchoStudyView[]
  /** The matching echoStudyContract.ts EchoStudy.studyId with playable clips — null unless learnerReadiness === 'ready'. */
  playableStudyId: string | null
}

export const ECHO_STUDY_RECORD_SEED: readonly EchoStudyRecord[] = [
  {
    studyKey: 'echo-a4c-governed-preview-v1',
    title: 'A4C Normal · Governed Preview Study',
    phenotypeKey: 'echo-phenotype:normal',
    learnerReadiness: 'ready',
    reviewStatus: 'reviewed',
    licenseStatus: 'licensed-verified',
    provenanceRef: 'app/lib/clinicalMedia/echoPreviewStudy.ts, echoClinicalReviewAttestation.ts',
    views: ['A4C'],
    playableStudyId: 'echo-a4c-governed-preview-v1',
  },
  {
    studyKey: 'echo-a4c-dcm-e00476',
    title: 'Dilated cardiomyopathy (candidate)',
    phenotypeKey: 'echo-phenotype:dcm',
    learnerReadiness: 'review_required',
    reviewStatus: 'pending_review',
    licenseStatus: 'licensed-verified',
    provenanceRef: 'docs/case-media-resume/echo-readiness-snapshot.json (echo-a4c-dcm-e00476): rights verified CC-BY-SA-3.0 / VRT 2011102310008874, checksums frozen; specialist clinical review, final privacy review and device-playback review all incomplete — status "hold", learnerReady:false',
    views: ['A4C'],
    playableStudyId: null,
  },
  {
    studyKey: 'echo-a4c-severe-hcm-mm0002',
    title: 'Severe hypertrophic cardiomyopathy (candidate)',
    phenotypeKey: 'echo-phenotype:hcm',
    learnerReadiness: 'review_required',
    reviewStatus: 'pending_review',
    licenseStatus: 'pending',
    provenanceRef: 'docs/case-media-resume/echo-readiness-snapshot.json (echo-a4c-severe-hcm-mm0002): artifact integrity verified, disposition process-derivative; specialist clinical review, final privacy review and device-playback review all pending-human-review, learnerReady:false. Full rights-block verification not yet recorded for this candidate in this checkout.',
    views: ['A4C'],
    playableStudyId: null,
  },
] as const

export function validateEchoStudyRecordSeed(records: readonly EchoStudyRecord[] = ECHO_STUDY_RECORD_SEED): void {
  const keys = new Set<string>()
  for (const record of records) {
    if (!record.studyKey.trim() || !record.title.trim() || !record.phenotypeKey.trim()) {
      throw new Error('Echo study record identity, title and phenotype are required.')
    }
    if (keys.has(record.studyKey)) throw new Error(`Duplicate Echo study record key: ${record.studyKey}`)
    keys.add(record.studyKey)
    if (!record.views.length) throw new Error(`Echo study record ${record.studyKey} must declare at least one view.`)
    if (record.learnerReadiness === 'ready') {
      if (!record.playableStudyId) throw new Error(`Echo study record ${record.studyKey} is marked ready but has no playableStudyId.`)
      if (record.reviewStatus !== 'reviewed') throw new Error(`Echo study record ${record.studyKey} is marked ready but reviewStatus is not 'reviewed'.`)
    } else if (record.playableStudyId) {
      throw new Error(`Echo study record ${record.studyKey} is not ready and must not carry a playableStudyId (no media to link).`)
    }
  }
}

export function findEchoStudyRecord(studyKey: string, records: readonly EchoStudyRecord[] = ECHO_STUDY_RECORD_SEED): EchoStudyRecord | null {
  return records.find(record => record.studyKey === studyKey) ?? null
}

export function isEchoStudyRecordLearnerReady(record: EchoStudyRecord): boolean {
  return record.learnerReadiness === 'ready' && record.reviewStatus === 'reviewed' && Boolean(record.playableStudyId)
}
