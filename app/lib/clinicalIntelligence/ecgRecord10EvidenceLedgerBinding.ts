import type { EvidenceLedgerEvent } from '../governance/evidenceProvenanceLedger.ts'
import { evaluateEcgEligibility, type EcgEligibilitySnapshot } from './ecgEligibilityDecision.ts'

export const ECG_RECORD_10_PRIMARY_SHA256 = 'e1ac8a8873741cb85d2533c9c3c79acfaa34b2f9f80a108b6b1dfc0635c0c2e5'
export const ECG_RECORD_10_LOW_RES_SHA256 = '64a407d42f60568f789cb301e839018050af2c6e57e57c3cd24f815ced86b525'

const artifacts = [
  {
    artifactId: 'ptb-xl-record-10-500hz',
    sha256: ECG_RECORD_10_PRIMARY_SHA256,
    mediaType: 'application/octet-stream',
    uri: 'records500/00000/00010_hr.dat',
    version: 'ptb-xl-1.0.3',
  },
  {
    artifactId: 'ptb-xl-record-10-100hz',
    sha256: ECG_RECORD_10_LOW_RES_SHA256,
    mediaType: 'application/octet-stream',
    uri: 'records100/00000/00010_lr.dat',
    version: 'ptb-xl-1.0.3',
  },
] as const

/**
 * Repository-bound evidence chain for PTB-XL record 10.
 *
 * This intentionally stops at HOLD. A DEVICE_BASELINE_BOUND PASS event has not
 * yet been established for this ECG rendering path, so no learner promotion is
 * authorized. The technical event timestamp is normalized to the documented
 * inspection date because the source review artifact records the date but not
 * a precise execution timestamp.
 */
export const ECG_RECORD_10_EVIDENCE_EVENTS: readonly EvidenceLedgerEvent[] = [
  {
    eventId: 'ecg-record-10-probed-v1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'ecg-governed-case-001',
    kind: 'PROBED',
    occurredAt: '2026-09-09T00:00:00Z',
    actor: {
      actorType: 'SYSTEM',
      actorId: 'ecg-waveform-technical-inspection',
      qualificationsOrRole: 'technical waveform inspection workflow',
    },
    artifacts,
    policies: [
      { policyId: 'ecg-record-selection-provenance-policy', policyVersion: '1.0.0' },
      { policyId: 'ecg-vertical-slice-contract', policyVersion: '1.0.0' },
    ],
    evidenceRecordIds: ['PTBXL-record10-review-only.pdf'],
    decision: 'PASS',
    notes: [
      '12/12 leads, 10-second duration and calibration consistency verified.',
      'Final 106 ms constant terminal behavior retained without crop, repair, filtering or interpolation.',
      'Uploaded-byte SHA values are local integrity evidence and are not an independent publisher digest verification.',
      'occurredAt time-of-day is normalized to the documented inspection date; it is not the acquisition time.',
    ],
  },
  {
    eventId: 'ecg-record-10-clinical-attested-v1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'ecg-governed-case-001',
    kind: 'CLINICAL_ATTESTED',
    occurredAt: '2026-09-09T07:09:50Z',
    actor: {
      actorType: 'HUMAN',
      actorId: 'human-cardiology-reviewer',
      qualificationsOrRole: 'cardiology physician reviewer',
    },
    artifacts,
    policies: [
      { policyId: 'ecg-human-clinical-attestation', policyVersion: '1.0.0' },
    ],
    evidenceRecordIds: ['ECG_RECORD_10_HUMAN_CLINICAL_ATTESTATION_V1.md'],
    decision: 'PASS',
    humanAttestation: {
      scope: 'CLINICAL',
      attested: true,
    },
    parentEventIds: ['ecg-record-10-probed-v1'],
    notes: [
      'Sinus rhythm baseline educational interpretation approved by a human cardiology reviewer.',
      'Terminal 106 ms caveat accepted as non-material to the approved interpretation and retained in provenance.',
    ],
  },
  {
    eventId: 'ecg-record-10-privacy-attested-v1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'ecg-governed-case-001',
    kind: 'PRIVACY_ATTESTED',
    occurredAt: '2026-09-09T07:25:16Z',
    actor: {
      actorType: 'HUMAN',
      actorId: 'human-project-privacy-reviewer',
      qualificationsOrRole: 'project privacy reviewer',
    },
    artifacts,
    policies: [
      { policyId: 'ecg-human-privacy-attestation', policyVersion: '1.0.0' },
    ],
    evidenceRecordIds: ['ECG_RECORD_10_HUMAN_PRIVACY_ATTESTATION_V1.md'],
    decision: 'PASS',
    humanAttestation: {
      scope: 'PRIVACY',
      attested: true,
    },
    parentEventIds: ['ecg-record-10-probed-v1'],
    notes: [
      'No direct patient identifiers or patient-linked acquisition date/time are carried into the governed review artifact.',
      'Dataset record and numeric patient identifiers remain pseudonymous provenance identifiers only.',
    ],
  },
  {
    eventId: 'ecg-record-10-promotion-hold-v1',
    ledgerVersion: '1.0.0',
    product: 'CLINIVERSE',
    subjectId: 'ecg-governed-case-001',
    kind: 'PROMOTION_DECIDED',
    occurredAt: '2026-09-09T07:25:17Z',
    actor: {
      actorType: 'SYSTEM',
      actorId: 'cliniverse-governance-gate',
      qualificationsOrRole: 'governed promotion gate',
    },
    artifacts,
    policies: [
      { policyId: 'evidence-ledger-integrity-v2', policyVersion: '2.0.0' },
      { policyId: 'ecg-vertical-slice-contract', policyVersion: '1.0.0' },
    ],
    evidenceRecordIds: [
      'ECG_RECORD_10_HUMAN_CLINICAL_ATTESTATION_V1.md',
      'ECG_RECORD_10_HUMAN_PRIVACY_ATTESTATION_V1.md',
    ],
    decision: 'HOLD',
    parentEventIds: [
      'ecg-record-10-clinical-attested-v1',
      'ecg-record-10-privacy-attested-v1',
    ],
    notes: [
      'Evidence Ledger binding is established in the repository chain.',
      'DEVICE_BASELINE_BOUND PASS is still missing; learner promotion is not authorized.',
      'Learner-ready remains false.',
    ],
  },
] as const

export function evaluateEcgRecord10EvidenceBinding(
  binding: Omit<EcgEligibilitySnapshot, 'caseId' | 'sourceArtifactSha256' | 'events'> & { events?: readonly EvidenceLedgerEvent[] } = { authorizedPromotionActorIds: [] },
) {
  const decision = evaluateEcgEligibility({
    ...binding,
    events: binding.events ?? ECG_RECORD_10_EVIDENCE_EVENTS,
    caseId: 'ecg-governed-case-001',
    sourceArtifactSha256: ECG_RECORD_10_PRIMARY_SHA256,
  })
  return { ...decision, evidenceLedgerBound: decision.integrityValid }
}
