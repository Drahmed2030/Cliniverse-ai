import test from 'node:test'
import assert from 'node:assert/strict'
import { ECHO_BATCH_01_REVIEW_ARTIFACTS } from '../app/lib/clinicalMedia/echoBatch01HumanReview.ts'
import { evaluateEchoPlaybackReview } from '../app/lib/clinicalMedia/echoBatch01PlaybackReview.ts'

const artifact = ECHO_BATCH_01_REVIEW_ARTIFACTS[0]

function playback(overrides = {}) {
  return {
    candidateId: artifact.candidateId,
    artifactSha256: artifact.derivativeSha256,
    environment: 'macos-catalina-safari',
    deviceModel: 'MacBook Pro 2012',
    osVersion: 'macOS Catalina',
    appOrBrowserVersion: 'Safari',
    reviewedAt: '2026-09-07',
    reviewerName: 'Device Reviewer',
    playbackStarts: 'PASS',
    playPauseWorks: 'PASS',
    seekWorks: 'PASS',
    frameSteppingWorks: 'PASS',
    loopWorks: 'PASS',
    aspectRatioPreserved: 'PASS',
    noCropOrDistortion: 'PASS',
    anatomyReadable: 'PASS',
    overlaysReadable: 'PASS',
    noBlankOrBlackFailure: 'PASS',
    reducedMotionSafe: 'PASS',
    notes: [],
    ...overrides,
  }
}

test('checksum mismatch cannot produce playback evidence', () => {
  assert.throws(
    () => evaluateEchoPlaybackReview(playback({ artifactSha256: '0'.repeat(64) })),
    /checksum mismatch/,
  )
})

test('HOLD decision fails closed', () => {
  const result = evaluateEchoPlaybackReview(playback({ anatomyReadable: 'HOLD' }))
  assert.equal(result.state, 'hold')
  assert.equal(result.devicePlaybackCleared, false)
  assert.ok(result.blockers.includes('device-playback-hold'))
  assert.equal(result.learnerReady, false)
})

test('FAIL decision fails closed', () => {
  const result = evaluateEchoPlaybackReview(playback({ noBlankOrBlackFailure: 'FAIL' }))
  assert.equal(result.state, 'failed')
  assert.equal(result.devicePlaybackCleared, false)
  assert.ok(result.blockers.includes('device-playback-failed'))
})

test('Catalina PASS is legacy compatibility evidence only', () => {
  const result = evaluateEchoPlaybackReview(playback())
  assert.equal(result.state, 'cleared')
  assert.equal(result.devicePlaybackCleared, true)
  assert.equal(result.legacyCompatibilityEvidence, true)
  assert.equal(result.currentApplePlatformEvidence, false)
  assert.ok(result.blockers.includes('current-apple-platform-playback-pending'))
  assert.ok(result.blockers.includes('post-review-quality-gate-pending'))
  assert.equal(result.learnerReady, false)
  assert.equal(result.binaryCommitEligible, false)
})

test('current Apple PASS still requires post-review quality gate', () => {
  const result = evaluateEchoPlaybackReview(playback({ environment: 'iphone-in-app', deviceModel: 'iPhone' }))
  assert.equal(result.currentApplePlatformEvidence, true)
  assert.equal(result.legacyCompatibilityEvidence, false)
  assert.ok(result.blockers.includes('post-review-quality-gate-pending'))
  assert.equal(result.learnerReady, false)
})
