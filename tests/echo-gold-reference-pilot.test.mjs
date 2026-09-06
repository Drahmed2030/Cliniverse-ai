import test from 'node:test'
import assert from 'node:assert/strict'
import { A4C_FOUNDATION_STANDARD_2026, evaluateA4cGoldCandidate } from '../app/lib/clinicalMedia/echoGoldReferencePilot.ts'

test('foundation reference remains benchmarked rather than implicitly gold', () => {
  assert.ok(A4C_FOUNDATION_STANDARD_2026.score > 0)
  assert.notEqual(A4C_FOUNDATION_STANDARD_2026.releaseTier, 'gold')
})

test('search metadata cannot promote an unreviewed candidate', () => {
  const decision = evaluateA4cGoldCandidate({
    candidateId: 'candidate-modern-a4c', sourcePageUrl: 'https://example.invalid/a4c', acquisitionEra: 'modern',
    rightsState: 'commercial-reuse-verified', mediaState: 'metadata-only', clinicalState: 'unreviewed',
  })
  assert.equal(decision.decision, 'hold-for-media-review')
})

test('unclear commercial rights reject before visual quality is considered', () => {
  const decision = evaluateA4cGoldCandidate({
    candidateId: 'candidate-rights-unclear', sourcePageUrl: 'https://example.invalid/a4c', acquisitionEra: 'modern',
    rightsState: 'unverified', mediaState: 'metadata-only', clinicalState: 'unreviewed',
  })
  assert.equal(decision.decision, 'reject')
  assert.equal(decision.reason, 'commercial-reuse-not-verified')
})

test('reviewed high-quality candidate can clear the promotion gate', () => {
  const decision = evaluateA4cGoldCandidate({
    candidateId: 'candidate-gold', sourcePageUrl: 'https://example.invalid/a4c', acquisitionEra: 'modern',
    rightsState: 'commercial-reuse-verified', mediaState: 'media-reviewed', clinicalState: 'view-confirmed',
    standardInput: {
      candidateId: 'candidate-gold', sourcePageUrl: 'https://example.invalid/a4c', sourceDate: '2026-01-01',
      width: 1920, height: 1080, framesPerSecond: 60, durationMs: 4000,
      view: 'A4C', intendedUse: 'education-only', licenseId: 'CC-BY-SA-3.0', vrtConfirmed: true,
      provenanceVerified: true, privacyReviewed: true, directIdentifiersVisible: false, unexpectedAudio: false,
      clinicallySuitableForViewRecognition: true, clinicallySuitableForDiscrimination: true,
      distractingOverlays: false, mobileReadable: true, ipadReadable: true, desktopReadable: true,
      normalReferenceConfirmed: true, motionContinuous: true, clinicalReviewComplete: true,
    },
  })
  assert.equal(decision.decision, 'promote')
  assert.ok(decision.candidateScore > decision.foundationScore)
})

test('incomplete privacy or clinical review holds even with a media-reviewed claim', () => {
  for (const flags of [{privacyReviewed:false, clinicalReviewComplete:true}, {privacyReviewed:true, clinicalReviewComplete:false}]) {
    const decision = evaluateA4cGoldCandidate({
      candidateId: 'pending', sourcePageUrl: 'https://example.invalid/pending', acquisitionEra: 'modern',
      rightsState: 'commercial-reuse-verified', mediaState: 'media-reviewed', clinicalState: 'view-confirmed',
      standardInput: { ...flags },
    })
    assert.equal(decision.decision, 'hold-for-media-review')
  }
})
