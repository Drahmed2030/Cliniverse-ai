import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { evaluateDcmDerivativeReadiness, DCM_DERIVATIVE_IDENTITY } from '../scripts/echo-dcm-derivative-readiness.mts'

const dir = new URL('../docs/echo-media-lab-2026-09-06/echo-a4c-dcm-e00476/', import.meta.url)
const evidence = JSON.parse(readFileSync(new URL('evidence.json', dir)))
const readiness = JSON.parse(readFileSync(new URL('derivative-v1/readiness.json', dir)))
const technical = JSON.parse(readFileSync(new URL('derivative-v1/technical.json', dir)))
const input = readiness.gateInput

test('recorded DCM derivative is technically prepared but clinical/privacy/device gates hold', () => {
  const result = evaluateDcmDerivativeReadiness(input)
  assert.equal(result.technicalPreviewPrepared, true)
  assert.equal(result.status, 'hold')
  assert.deepEqual(result.blockers, ['privacy-review-incomplete', 'clinical-review-incomplete', 'device-playback-review-incomplete'])
  assert.equal(result.binaryCommitAllowed, false)
  assert.equal(result.learnerReady, false)
  assert.equal(result.normalGoldPromotionAllowed, false)
  assert.deepEqual(readiness.result, result)
})

test('readiness identity and measurements agree with source and derivative evidence', () => {
  assert.equal(DCM_DERIVATIVE_IDENTITY.sourceSha256, evidence.technical.sourceSha256)
  assert.equal(DCM_DERIVATIVE_IDENTITY.sourcePageSha256, evidence.rights.sourcePageSha256)
  assert.equal(DCM_DERIVATIVE_IDENTITY.derivativeSha256, technical.derivativeSha256)
  assert.equal(input.derivativeBytes, technical.derivativeBytes)
  assert.equal(input.sourceFrameCount, technical.before.frameCount)
  assert.equal(input.derivativeFrameCount, technical.after.frameCount)
  assert.equal(input.sourceDurationMs, Math.round(technical.before.durationSeconds * 1000))
  assert.equal(input.derivativeDurationMs, Math.round(technical.after.durationSeconds * 1000))
  assert.deepEqual(input.sourceTimestampsMs, technical.before.timestampsSeconds.map(t => Math.round(t * 1000)))
  assert.deepEqual(input.derivativeTimestampsMs, technical.after.timestampsSeconds.map(t => Math.round(t * 1000)))
})

for (const key of Object.keys(DCM_DERIVATIVE_IDENTITY)) {
  test(`${key} mismatch blocks even a purported completed review`, () => {
    const result = evaluateDcmDerivativeReadiness({ ...input, [key]: '0'.repeat(64),
      clinicalReviewComplete: true, clinicalReviewEvidence: 'review-reference',
      privacyReviewComplete: true, privacyReviewEvidence: 'review-reference', devicePlaybackReviewComplete: true })
    assert.equal(result.technicalPreviewPrepared, false)
    assert.equal(result.status, 'hold')
    assert.ok(result.blockers.includes(`${key}-mismatch`))
    assert.equal(result.learnerReady, false)
  })
}

for (const [key, value, blocker] of [
  ['rightsVerified', false, 'rightsVerified-not-confirmed'],
  ['noDirectIdentifiersObserved', false, 'noDirectIdentifiersObserved-not-confirmed'],
  ['noAudioStreams', false, 'noAudioStreams-not-confirmed'],
  ['noUndocumentedAcquisitionDateTimeObserved', false, 'noUndocumentedAcquisitionDateTimeObserved-not-confirmed'],
  ['anatomyPreserved', false, 'anatomyPreserved-not-confirmed'],
  ['motionContinuityScreenPassed', false, 'motionContinuityScreenPassed-not-confirmed'],
  ['noInterpolation', false, 'noInterpolation-not-confirmed'],
  ['derivativeFrameCount', 45, 'frame-count-mismatch'],
  ['derivativeDurationMs', NaN, 'duration-mismatch'],
  ['derivativeTimestampsMs', [...input.derivativeTimestampsMs].reverse(), 'timestamp-sequence-mismatch'],
  ['derivativeTimestampsMs', input.derivativeTimestampsMs.map((t, i) => i === 3 ? 58 : t), 'timestamp-sequence-mismatch'],
  ['requestedNumericalEfClaims', true, 'numerical-ef-prohibited'],
]) {
  test(`${blocker} fails closed`, () => {
    const result = evaluateDcmDerivativeReadiness({ ...input, [key]: value })
    assert.equal(result.technicalPreviewPrepared, false)
    assert.ok(result.blockers.includes(blocker))
    assert.equal(result.learnerReady, false)
    assert.equal(result.numericalEfClaimsAllowed, false)
  })
}

test('each omitted required technical field fails closed', () => {
  for (const key of Object.keys(input).filter(key => !['privacyReviewComplete', 'privacyReviewEvidence',
    'clinicalReviewComplete', 'clinicalReviewEvidence', 'devicePlaybackReviewComplete'].includes(key))) {
    const missing = { ...input }
    delete missing[key]
    assert.equal(evaluateDcmDerivativeReadiness(missing).technicalPreviewPrepared, false, key)
  }
  assert.equal(evaluateDcmDerivativeReadiness().status, 'hold')
})

test('review booleans without review evidence cannot clear clinical or privacy gates', () => {
  const result = evaluateDcmDerivativeReadiness({ ...input, clinicalReviewComplete: true, privacyReviewComplete: true })
  assert.ok(result.blockers.includes('clinical-review-incomplete'))
  assert.ok(result.blockers.includes('privacy-review-incomplete'))
  assert.equal(result.learnerReady, false)
})

test('completed checklist still requires existing governance; never authorizes EF or release', () => {
  const result = evaluateDcmDerivativeReadiness({ ...input,
    clinicalReviewComplete: true, clinicalReviewEvidence: 'test-fixture-only',
    privacyReviewComplete: true, privacyReviewEvidence: 'test-fixture-only', devicePlaybackReviewComplete: true })
  assert.equal(result.status, 'ready-for-existing-governance-review')
  assert.equal(result.binaryCommitAllowed, false)
  assert.equal(result.learnerReady, false)
  assert.equal(result.numericalEfClaimsAllowed, false)
})

test('recipe refuses altered source before producing any derivative', () => {
  const temp = mkdtempSync(join(tmpdir(), 'echo-dcm-checksum-'))
  try {
    const source = join(temp, 'altered.webm')
    const page = join(temp, 'source.html')
    const output = join(temp, 'output')
    writeFileSync(source, 'wrong-source-bytes')
    writeFileSync(page, 'unused-license-page')
    const result = spawnSync('python3', [new URL('../scripts/prepare-echo-dcm-derivative.py', import.meta.url).pathname,
      source, page, output], { encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Source checksum mismatch/)
    assert.equal(existsSync(output), false)
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
})
