import type { EvidenceLedgerEvent } from '../governance/evidenceProvenanceLedger.ts'
import { ECG_RECORD_10_EVIDENCE_EVENTS, ECG_RECORD_10_PRIMARY_SHA256 } from './ecgRecord10EvidenceLedgerBinding.ts'
import { evaluateEcgEligibility, type EcgEligibilitySnapshot } from './ecgEligibilityDecision.ts'
import { RECORD10_REVIEW_PDF } from './ecgReviewedPdfIdentity.ts'

/** Server registry only. These are retained evidence identities, not request fields. */
export const RECORD10_RECONSTRUCTION = {
  canonicalWaveformSha256: '040a56434ffda9688c3a1482d4b18cc1249b615e8b742cf0ef8bbd84f610441d',
  rebuiltPdfSha256: 'ab67724a9591c7c839ead90323d506d3a5087a33de3317a2c13d9138976eb983',
  comparisonSha256: '1b22dae525194a0b8a8f67ccb98cc5cfdd5d5a3fd66f8fb29f5a43df19694bff',
  rendererSha256: 'af019597f34afe76c12e620b3513e9ca0d24f4f03879d91847074e887beeaf4a',
} as const

/** Narrow educational interpretation of the retained PDF, on the reported device.
 * Does not authorize the reconstructed PDF, adaptive canvas, physical calipers,
 * institutional clinical deployment, or a different device/platform.
 */
export function getRecord10ReviewedPdfSnapshot(): EcgEligibilitySnapshot {
  const source = { artifactId: 'ptb-xl-record-10-500hz', sha256: ECG_RECORD_10_PRIMARY_SHA256 }
  const reviewed = { artifactId: 'record10-reviewed-pdf', sha256: RECORD10_REVIEW_PDF.sha256, mediaType: 'application/pdf' }
  const target = {
    canonicalWaveformSha256: RECORD10_RECONSTRUCTION.canonicalWaveformSha256,
    outputArtifactSha256: reviewed.sha256,
    platformFamily: 'iphone-xs-max-ios-18.7.10-user-reported-pdf-screen',
    rendererId: 'record10-retained-reviewed-pdf', rendererVersion: '1.0.0',
    layoutPolicyId: 'record10-four-page-reviewed-layout', layoutPolicyVersion: '1.0.0',
    calibrationPolicyId: 'record10-fixed-gain-1000-baseline-zero', calibrationPolicyVersion: '1.0.0',
    outputRecipeId: 'record10-retained-pdf-reconstruction-equivalence', outputRecipeVersion: '1.0.0',
  }
  const common = { ledgerVersion: '1.0.0' as const, product: 'CLINIVERSE' as const, subjectId: 'ecg-governed-case-001',
    policies: [{ policyId: 'ecg-evidence-eligibility', policyVersion: '1.0.0' }],
    // Date-normalized binding records, not times of device execution or user messages.
    occurredAt: '2026-09-13T00:00:00Z' }
  const reconstruction: EvidenceLedgerEvent = {
    ...common, eventId: 'record10-reconstruction-bound-v1', kind: 'TRANSFORMED', decision: 'PASS',
    actor: { actorType: 'SYSTEM', actorId: 'record10-reconstruction-verifier' },
    artifacts: [source, reviewed,
      { artifactId: 'record10-rebuilt-pdf', sha256: RECORD10_RECONSTRUCTION.rebuiltPdfSha256 },
      { artifactId: 'record10-reconstruction-comparison', sha256: RECORD10_RECONSTRUCTION.comparisonSha256 },
      { artifactId: 'record10-reconstructed-renderer', sha256: RECORD10_RECONSTRUCTION.rendererSha256 }],
    parentEventIds: ['ecg-record-10-probed-v1'],
    transform: { transformId: 'record10-renderer-reconstruction', transformVersion: '1.0.0',
      inputArtifactIds: ['ptb-xl-record-10-500hz'], outputArtifactIds: ['record10-rebuilt-pdf'] },
    evidenceRecordIds: ['tools/ecg-rebuild/reconstruction-evidence.json', 'tools/ecg-rebuild/canonical_identity.py'],
    notes: ['All four pages have equal drawing streams, text, dimensions and 1200px Poppler rasters.',
      'Distinct PDF hashes retained. Reviewed PDF is an equivalence reference, not an output of this reconstruction.',
      'Full input identities, including low-resolution source and headers, are in the comparison manifest.',
      'Binding date is normalized; no publisher checksum or new device execution is asserted.'],
  }
  const device: EvidenceLedgerEvent = {
    ...common, eventId: 'record10-reviewed-pdf-iphone-user-evidence-v1', kind: 'DEVICE_BASELINE_BOUND', decision: 'PASS',
    actor: { actorType: 'HUMAN', actorId: 'human-project-owner-device-tester' },
    artifacts: [source, reviewed], parentEventIds: [reconstruction.eventId],
    evidenceRecordIds: ['docs/ECG_RECORD10_BOUND_EVIDENCE_2026-09-13.md'],
    notes: ['Source: retained conversation screenshots and user confirmation: iPhone XS Max, iOS 18.7.10, four pages, zoom and rotation work.',
      'Reported external PDF screen viewer; browser app version not supplied. No embedded Cliniverse execution or print measurement claimed.',
      'Geometry and calibration refer to preserved PDF drawing commands; not physical screen scale.',
      'iPad confirmation is retained in documentation but excluded from this exact target because model and OS were not supplied.'],
  }
  const promotion: EvidenceLedgerEvent = {
    ...common, eventId: 'record10-reviewed-pdf-educational-promotion-v1', kind: 'PROMOTION_DECIDED', decision: 'PROMOTE',
    actor: { actorType: 'HUMAN', actorId: 'human-project-owner-release-authority' },
    humanAttestation: { scope: 'PROMOTION_AUTHORITY', attested: true },
    artifacts: [source], parentEventIds: ['ecg-record-10-clinical-attested-v1', 'ecg-record-10-privacy-attested-v1', device.eventId],
    evidenceRecordIds: ['docs/ECG_RECORD10_BOUND_EVIDENCE_2026-09-13.md'],
    notes: ['Records prior explicit user authorization to complete requirements and lift HOLD, followed by authorization to bind evidence.',
      'Scope: retained reviewed PDF and accepted record10-rhythm-v1 question; no institutional clinical approval.'],
  }
  return {
    caseId: common.subjectId, sourceArtifactSha256: source.sha256,
    events: [...structuredClone(ECG_RECORD_10_EVIDENCE_EVENTS), reconstruction, device, promotion], target,
    authorizedPromotionActorIds: [promotion.actor.actorId],
    deviceBinding: { eventId: device.eventId, evidence: {
      fingerprint: { ...target }, platformFamily: target.platformFamily, exactOutputArtifactSha256: reviewed.sha256,
      currentDeviceEvidence: true, geometryPreserved: true, fullTimelinePreserved: true,
      leadIdentityPreserved: true, calibrationPreserved: true, annotationsReadable: true, deviations: [],
    } },
  }
}

export function evaluateRecord10ReviewedPdfBinding() {
  return evaluateEcgEligibility(getRecord10ReviewedPdfSnapshot())
}
