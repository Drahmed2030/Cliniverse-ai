import type { EvidenceLedgerEvent } from '../governance/evidenceProvenanceLedger'

export const ECHO_BATCH_01_LEDGER_ASSETS = [
  ['echo-a4c-pericardial-effusion-e00674', 'ac4ae1abd4ba3a14f050a5e2222af0a8a46f910669934892eac2b6e1f89e7d1a'],
  ['echo-a4c-severe-hcm-mm0002', '39f7d2930a1383c688723871887c02e75ddd932819a01b176bbc6e03cb6cf913'],
  ['echo-a4c-severe-ms-e00613', 'c9db61d29ae454e9967023aa0b2ce3e218b333b4b199f6394b8665199616f274'],
  ['echo-a3c-severe-ar-e00234', '13f3d791637cdc7e8704fd36fc98269b458afc0d472f03ca1349540b09ca91cc'],
  ['echo-psax-severe-as-e00261', '1f2e57f80802dc0f13c1c8732d8b48f05b228e39cdcd408a91956a76877fb715'],
  ['echo-a4c-arvd-e00299', '2e83143bd1e969b4b53349687cc2371cc9896c54e7c2c475659c7bb1b767c97b'],
] as const

export interface EchoBatch01LedgerSeedInput {
  occurredAt: string
  privacyHumanAttestationRecordId?: string
  privacyHumanReviewerId?: string
}

export function buildEchoBatch01EvidenceLedger(input: EchoBatch01LedgerSeedInput): readonly EvidenceLedgerEvent[] {
  const events: EvidenceLedgerEvent[] = []

  for (const [assetId, sha256] of ECHO_BATCH_01_LEDGER_ASSETS) {
    const probeEventId = `echo-b01:${assetId}:probe`
    const privacyPreflightEventId = `echo-b01:${assetId}:privacy-preflight`
    const clinicalEventId = `echo-b01:${assetId}:clinical`
    const deviceEventId = `echo-b01:${assetId}:device`

    events.push({
      eventId: probeEventId,
      ledgerVersion: '1.0.0',
      product: 'CLINIVERSE',
      subjectId: assetId,
      kind: 'PROBED',
      occurredAt: input.occurredAt,
      actor: { actorType: 'SYSTEM', actorId: 'batch-01-existing-machine-evidence-adapter' },
      artifacts: [{ artifactId: `${assetId}:derivative-v1`, sha256, mediaType: 'video/mp4', version: 'v1' }],
      policies: [
        { policyId: 'clinical-media-governance-pipeline', policyVersion: '1.0.0' },
        { policyId: 'automated-media-gate', policyVersion: '1.0.0' },
      ],
      evidenceRecordIds: [`batch-01-pathology-derivatives/${assetId}/technical.json`],
      decision: 'PASS',
      notes: ['Reuses existing exact-SHA machine evidence; does not claim a fresh byte-level re-probe.'],
    })

    events.push({
      eventId: privacyPreflightEventId,
      ledgerVersion: '1.0.0',
      product: 'CLINIVERSE',
      subjectId: assetId,
      kind: 'PRIVACY_PREFLIGHT',
      occurredAt: input.occurredAt,
      actor: { actorType: 'SYSTEM', actorId: 'privacy-governance-v2' },
      artifacts: [{ artifactId: `${assetId}:derivative-v1`, sha256, mediaType: 'video/mp4', version: 'v1' }],
      policies: [{ policyId: 'clinical-media-privacy-governance-v2', policyVersion: '2.0.0' }],
      parentEventIds: [probeEventId],
      decision: 'HOLD',
      notes: ['Technical privacy screening is clear-candidate evidence only; named human privacy attestation remains required.'],
    })

    events.push({
      eventId: clinicalEventId,
      ledgerVersion: '1.0.0',
      product: 'CLINIVERSE',
      subjectId: assetId,
      kind: 'CLINICAL_ATTESTED',
      occurredAt: input.occurredAt,
      actor: {
        actorType: 'HUMAN',
        actorId: 'dr-ahmed-fadul',
        displayName: 'Dr Ahmed Fadul',
        qualificationsOrRole: 'Cardiology resident',
      },
      artifacts: [{ artifactId: `${assetId}:derivative-v1`, sha256, mediaType: 'video/mp4', version: 'v1' }],
      policies: [{ policyId: 'echo-batch-01-human-review', policyVersion: '1.0.0' }],
      parentEventIds: [probeEventId],
      evidenceRecordIds: ['batch-01-human-review/clinical-review-attestation.pending.json'],
      decision: 'PASS',
      humanAttestation: { scope: 'CLINICAL', attested: true },
    })

    events.push({
      eventId: deviceEventId,
      ledgerVersion: '1.0.0',
      product: 'CLINIVERSE',
      subjectId: assetId,
      kind: 'DEVICE_BASELINE_BOUND',
      occurredAt: input.occurredAt,
      actor: { actorType: 'SYSTEM', actorId: 'echo-renderer-baseline-v1' },
      artifacts: [{ artifactId: `${assetId}:derivative-v1`, sha256, mediaType: 'video/mp4', version: 'v1' }],
      policies: [{ policyId: 'renderer-baseline-contract', policyVersion: '1.0.0' }],
      parentEventIds: [probeEventId],
      decision: 'PASS',
      notes: ['Physical iPhone and Catalina playback evidence bound; iPad remains PENDING_NOT_AVAILABLE.'],
    })

    if (input.privacyHumanAttestationRecordId && input.privacyHumanReviewerId) {
      events.push({
        eventId: `echo-b01:${assetId}:privacy-human`,
        ledgerVersion: '1.0.0',
        product: 'CLINIVERSE',
        subjectId: assetId,
        kind: 'PRIVACY_ATTESTED',
        occurredAt: input.occurredAt,
        actor: { actorType: 'HUMAN', actorId: input.privacyHumanReviewerId },
        artifacts: [{ artifactId: `${assetId}:derivative-v1`, sha256, mediaType: 'video/mp4', version: 'v1' }],
        policies: [{ policyId: 'clinical-media-privacy-governance-v2', policyVersion: '2.0.0' }],
        parentEventIds: [privacyPreflightEventId],
        evidenceRecordIds: [input.privacyHumanAttestationRecordId],
        decision: 'PASS',
        humanAttestation: { scope: 'PRIVACY', attested: true },
      })
    }
  }

  return events
}
