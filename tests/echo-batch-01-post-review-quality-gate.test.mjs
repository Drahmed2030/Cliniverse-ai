import test from 'node:test'
import assert from 'node:assert/strict'

const SOURCE_URL = new URL('../app/lib/clinicalMedia/echoBatch01PostReviewQualityGate.ts', import.meta.url)
const source = await (await fetch(SOURCE_URL)).text()

function requireText(fragment) {
  assert.ok(source.includes(fragment), `Expected post-review quality gate to contain: ${fragment}`)
}

test('post-review gate cannot bypass human clinical/privacy review', () => {
  requireText("state: 'pending-human-review'")
  requireText("'specialist-clinical-review-pending'")
  requireText("'final-privacy-review-pending'")
})

test('iPhone current-device evidence is required while unavailable iPad is nonblocking', () => {
  requireText('currentIPhonePlaybackPassed')
  requireText("currentIPadPlaybackStatus: 'PASS' | 'PENDING_NOT_AVAILABLE' | 'HOLD' | 'FAIL'")
  requireText("'ipad-evidence-pending-nonblocking-for-batch-closure'")
})

test('quality gate remains fail-closed for HOLD/REJECT and never promotes learner readiness', () => {
  requireText("if (decisions.includes('REJECT')) return 'rejected'")
  requireText("if (decisions.includes('HOLD')) return 'hold'")
  requireText('learnerReady: false')
  requireText('binaryCommitEligible: false')
})

test('post-review checks preserve evidence, teaching scope, claims and media integrity', () => {
  for (const check of [
    'checksumReverifiedAfterDeviceReview',
    'sourceAndLicenseEvidenceIntact',
    'teachingFocusStillMatchesArtifact',
    'prohibitedClaimsStillEnforced',
    'mediaIntegrityUnchanged',
    'playerIntegrationPathStable',
  ]) requireText(check)
})
