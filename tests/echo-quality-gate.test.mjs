import test from 'node:test'
import assert from 'node:assert/strict'
import { A4C_NORMAL_CLINICAL_STUDIO_ASSET } from '../app/lib/clinicalMedia/licensedEchoAsset.ts'
import {
  assertEchoLearnerReady,
  evaluateEchoQuality,
} from '../app/lib/clinicalMedia/echoQualityGate.ts'

test('licensed A4C preview exposes evidence-driven quality and trust signals', () => {
  const report = evaluateEchoQuality(A4C_NORMAL_CLINICAL_STUDIO_ASSET)

  assert.equal(report.assetId, A4C_NORMAL_CLINICAL_STUDIO_ASSET.assetId)
  assert.equal(report.totalChecks, 10)
  assert.equal(report.passedChecks, 9)
  assert.equal(report.score, 90)
  assert.equal(report.releaseState, 'preview-ready')
  assert.equal(report.blockingIssues.length, 1)
  assert.match(report.blockingIssues[0], /clinicalReview/)
  assert.ok(report.trustSignals.some(signal => /CC-BY-SA-3.0/.test(signal)))
  assert.ok(report.trustSignals.some(signal => /Privacy/.test(signal)))
  assert.ok(report.trustSignals.some(signal => /checksums/.test(signal)))
})

test('learner publication fails closed while clinical copy review is still required', () => {
  assert.throws(
    () => assertEchoLearnerReady(A4C_NORMAL_CLINICAL_STUDIO_ASSET),
    /not learner-ready/i,
  )
})

test('a privacy regression blocks even preview readiness', () => {
  const unsafe = {
    ...A4C_NORMAL_CLINICAL_STUDIO_ASSET,
    privacy: {
      ...A4C_NORMAL_CLINICAL_STUDIO_ASSET.privacy,
      directPatientIdentifiersVisible: true,
    },
  }

  const report = evaluateEchoQuality(unsafe)
  assert.equal(report.releaseState, 'blocked')
  assert.ok(report.blockingIssues.some(issue => issue.startsWith('privacy:')))
})
