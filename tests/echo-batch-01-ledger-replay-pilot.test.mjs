import test from 'node:test'
import assert from 'node:assert/strict'
import { runEchoBatch01LedgerReplayPilot } from '../app/lib/clinicalMedia/echoBatch01LedgerReplayPilot.ts'

test('Batch 01 replay persists all current governed events in memory and holds only on privacy attestation', async () => {
  const result = await runEchoBatch01LedgerReplayPilot({
    occurredAt: '2026-09-08T10:00:00Z',
    recordedAt: '2026-09-08T10:05:00Z',
  })

  assert.equal(result.mode, 'IN_MEMORY_REPLAY_ONLY')
  assert.equal(result.appendedEvents, 24)
  assert.equal(result.noopEvents, 0)
  assert.equal(result.heldPersistenceEvents, 0)
  assert.equal(result.assets.length, 6)
  assert.equal(result.allHeldOnlyByPrivacyAttestation, true)
  assert.equal(result.supabaseChanged, false)
  assert.equal(result.productionChanged, false)

  for (const asset of result.assets) {
    assert.equal(asset.persistedEventCount, 4)
    assert.equal(asset.promotionDecision, 'HOLD')
    assert.deepEqual(asset.promotionBlockers, ['required-pass-event-missing:PRIVACY_ATTESTED'])
    assert.equal(asset.learnerEligible, false)
  }
})

test('named privacy attestation advances all six to promotion candidate but never learner eligibility', async () => {
  const result = await runEchoBatch01LedgerReplayPilot({
    occurredAt: '2026-09-08T10:00:00Z',
    recordedAt: '2026-09-08T10:05:00Z',
    privacyHumanAttestationRecordId: 'batch-01-human-review/privacy-review-attestation.json',
    privacyHumanReviewerId: 'privacy-reviewer-1',
  })

  assert.equal(result.appendedEvents, 30)
  assert.equal(result.heldPersistenceEvents, 0)
  assert.equal(result.allHeldOnlyByPrivacyAttestation, false)
  for (const asset of result.assets) {
    assert.equal(asset.persistedEventCount, 5)
    assert.equal(asset.promotionDecision, 'PROMOTION_CANDIDATE')
    assert.deepEqual(asset.promotionBlockers, [])
    assert.equal(asset.learnerEligible, false)
  }
})
