import { ECHO_A4C_CLINICAL_REVIEW_ATTESTATION } from './echoClinicalReviewAttestation.ts'
import type { EchoStudyReviewStatus } from './echoStudyRecord.ts'

// EchoEvidence — Batch 6. A typed, reusable provenance record, one per
// study. app/lib/clinicalMedia/echoClinicalReviewAttestation.ts already
// holds one real, hardcoded attestation (Normal A4C) — that object is
// adapted into the first entry below rather than duplicated. DCM/HCM
// entries are grounded in docs/case-media-resume/echo-readiness-snapshot.json
// and the (unmerged, referenced-only) feature/echo-competency-engine-v1
// branch's governance gates — never fabricated.

export interface EchoEvidence {
  studyKey: string
  provenanceRef: string
  source: string
  license: string
  reviewStatus: EchoStudyReviewStatus
  sourceRevision: string
}

export const ECHO_EVIDENCE_SEED: readonly EchoEvidence[] = [
  {
    studyKey: 'echo-a4c-governed-preview-v1',
    provenanceRef: 'app/lib/clinicalMedia/echoClinicalReviewAttestation.ts',
    source: 'CardioNetworks / Vdbilt via Wikimedia Commons',
    license: 'CC-BY-SA-3.0',
    reviewStatus: 'reviewed',
    sourceRevision: ECHO_A4C_CLINICAL_REVIEW_ATTESTATION.date,
  },
  {
    studyKey: 'echo-a4c-dcm-e00476',
    provenanceRef: 'docs/case-media-resume/echo-readiness-snapshot.json (echo-a4c-dcm-e00476)',
    source: 'CardioNetworks ECHOpedia via Wikimedia Commons',
    license: 'CC-BY-SA-3.0',
    reviewStatus: 'pending_review',
    sourceRevision: '2026-09-06',
  },
  {
    studyKey: 'echo-a4c-severe-hcm-mm0002',
    provenanceRef: 'docs/case-media-resume/echo-readiness-snapshot.json (echo-a4c-severe-hcm-mm0002); branch feature/echo-competency-engine-v1 echoBatch01CandidateRegistry.ts (source page + license claim, referenced only, not merged)',
    source: 'CardioNetworks ECHOpedia via Wikimedia Commons',
    license: 'CC-BY-SA-3.0',
    reviewStatus: 'pending_review',
    sourceRevision: '2026-09-07',
  },
] as const

export function validateEchoEvidenceSeed(evidence: readonly EchoEvidence[] = ECHO_EVIDENCE_SEED): void {
  const keys = new Set<string>()
  for (const record of evidence) {
    if (!record.studyKey.trim() || !record.provenanceRef.trim() || !record.source.trim() || !record.license.trim() || !record.sourceRevision.trim()) {
      throw new Error(`Echo evidence for ${record.studyKey || '(missing studyKey)'} is missing a required field.`)
    }
    if (keys.has(record.studyKey)) throw new Error(`Duplicate Echo evidence for study: ${record.studyKey}`)
    keys.add(record.studyKey)
  }
}

export function findEchoEvidence(studyKey: string, evidence: readonly EchoEvidence[] = ECHO_EVIDENCE_SEED): EchoEvidence | null {
  return evidence.find(record => record.studyKey === studyKey) ?? null
}
