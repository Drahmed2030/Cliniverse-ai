import assert from 'node:assert/strict'
import test from 'node:test'

const SOURCE_URL = new URL('../app/lib/clinicalMedia/echoBatch01PlaybackReview.ts', import.meta.url)
const source = await (await fetch(SOURCE_URL)).text()

function requireText(fragment) {
  assert.ok(source.includes(fragment), `Expected playback contract to contain: ${fragment}`)
}

test('playback review is SHA-bound and fail-closed', () => {
  requireText("throw new Error('Playback review artifact checksum mismatch')")
  requireText("if (decisions.includes('FAIL')) return 'failed'")
  requireText("if (decisions.includes('HOLD')) return 'hold'")
})

test('Catalina is explicitly legacy compatibility evidence only', () => {
  requireText("submission.environment === 'macos-catalina-safari'")
  requireText("submission.environment === 'macos-catalina-quicktime'")
  requireText("blockers.push('current-apple-platform-playback-pending')")
})

test('playback evidence cannot authorize learner readiness or binary inclusion', () => {
  requireText('learnerReady: false')
  requireText('binaryCommitEligible: false')
  requireText("blockers.push('post-review-quality-gate-pending')")
})

test('required playback checks include clinical geometry and failure-state visibility', () => {
  for (const check of [
    'playbackStarts',
    'playPauseWorks',
    'seekWorks',
    'frameSteppingWorks',
    'loopWorks',
    'aspectRatioPreserved',
    'noCropOrDistortion',
    'anatomyReadable',
    'overlaysReadable',
    'noBlankOrBlackFailure',
    'reducedMotionSafe',
  ]) requireText(check)
})
