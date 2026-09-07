import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { ECHO_PATHOLOGY_DERIVATIVE_POLICY as policy, evaluatePathologySource,
  evaluatePathologyBatch, evaluatePathologyArtifact } from '../app/lib/clinicalMedia/echoPathologyDerivativeReadiness.ts'

const root = new URL('../', import.meta.url)
const folder = new URL('docs/echo-media-lab-2026-09-07/batch-01-pathology-derivatives/', root)
const read = p => JSON.parse(readFileSync(new URL(p, folder), 'utf8'))
const summary = read('batch-summary.json')
const screenFor = rule => read(`${rule.candidateId}/evidence.json`).sourceScreen

test('batch has exactly eight distinct scoped candidates and rejects duplicates', () => {
  assert.equal(policy.length, 8)
  assert.equal(new Set(policy.map(p => p.candidateId)).size, 8)
  const s = screenFor(policy[0])
  assert.throws(() => evaluatePathologyBatch([s, s]), /Duplicate/)
  for (const candidateId of ['echo-a4c-dcm-e00476', 'echo-a4c-apical-hcm-e00291', 'echo-a4c-normal-cardionetworks', 'echo-a4c-takotsubo-cardionetworks']) {
    assert.throws(() => evaluatePathologySource({ ...s, candidateId }), /outside/)
  }
})

for (const rule of policy) {
  test(`${rule.candidateId}: source and rights fail closed`, () => {
    const s = screenFor(rule)
    for (const mutation of [{ sourceSha256: 'bad' }, { commercialReuseVerified: false },
      { sourcePageSha256: 'bad' }, { licenseId: 'unknown' }]) {
      assert.equal(evaluatePathologySource({ ...s, ...mutation }).disposition, 'reject')
    }
    assert.equal(evaluatePathologySource({ ...s, sourceSha256: null }).disposition, 'hold')
    const old = JSON.parse(readFileSync(new URL(`docs/echo-media-lab-2026-09-06/${rule.candidateId}/evidence.json`, root)))
    assert.equal(rule.sourceSha256, old.technical.sourceSha256)
    assert.equal(rule.sourcePageSha256, old.rights.sourcePageSha256)
  })
  test(`${rule.candidateId}: every pathology boundary is required`, () => {
    const s = screenFor(rule)
    for (const claim of rule.prohibitedClaims) {
      const result = evaluatePathologySource({ ...s, prohibitedClaims: s.prohibitedClaims.filter(c => c !== claim) })
      assert.notEqual(result.disposition, 'process-derivative')
      assert.ok(result.blockers.includes(`missing-boundary:${claim}`))
    }
  })
}

test('privacy uncertainty and inadequate visibility prevent processing', () => {
  const s = screenFor(policy[0])
  for (const key of ['completeFrameReview', 'noDirectIdentifiers', 'noUnresolvedDateTime',
    'noUnexpectedAudio', 'usableViewContext', 'anatomyPreservable']) {
    for (const value of [false, undefined]) assert.equal(evaluatePathologySource({ ...s, [key]: value }).disposition, 'hold')
  }
  assert.equal(evaluatePathologySource(screenFor(policy[3])).disposition, 'hold')
})

test('artifact checksum/decode/frame-review failures block acceptance', () => {
  const s = screenFor(policy[0])
  const a = read(`${policy[0].candidateId}/evidence.json`).artifactScreen
  for (const mutation of [{ actualSha256: 'bad' }, { expectedSha256: null }, { decodePassed: false }, { completeContactSheetReview: false }]) {
    const result = evaluatePathologyArtifact(s, { ...a, ...mutation })
    assert.equal(result.disposition, 'hold')
    assert.equal(result.artifactIntegrityVerified, false)
  }
})

test('clinical and privacy reviews cannot be approved by a technical batch', () => {
  const s = screenFor(policy[0]); const a = read(`${policy[0].candidateId}/evidence.json`).artifactScreen
  for (const clinicalReviewComplete of [false, true]) for (const finalPrivacyReviewComplete of [false, true]) {
    const result = evaluatePathologyArtifact(s, { ...a, clinicalReviewComplete, finalPrivacyReviewComplete })
    assert.equal(result.governedPromotionAllowed, false)
    assert.equal(result.learnerReady, false)
    assert.equal(result.binaryCommitEligible, false)
    assert.ok(result.promotionBlockers.includes('specialist-clinical-review-pending'))
    assert.ok(result.promotionBlockers.includes('final-privacy-review-pending'))
  }
})

test('evidence preserves frames and records VSD integrity failure without promotion', () => {
  assert.equal(summary.candidates.length, 8)
  assert.equal(summary.candidates.filter(c => c.derivativeCreated).length, 7)
  assert.equal(summary.candidates.filter(c => c.derivativeIntegrityVerified).length, 6)
  for (const row of summary.candidates) {
    assert.equal(row.learnerReady, false)
    assert.equal(row.binaryCommitEligible, false)
    const t = read(`${row.candidateId}/technical.json`)
    if (row.derivativeIntegrityVerified) {
      assert.equal(t.derivativeSha256, t.observedDerivativeSha256)
      assert.equal(t.before.frameCount, t.after.frameCount)
      assert.deepEqual(t.before.timestampsSeconds, t.after.timestampsSeconds)
      assert.ok(Math.abs(t.durationDifferenceMilliseconds) <= 1)
      assert.equal(t.crop, null); assert.equal(t.mask, null)
      assert.equal(t.interpolation, false); assert.equal(t.faststart, true)
    }
  }
  const vsd = summary.candidates.find(c => c.candidateId === 'echo-plax-vsd-rtl-e00832')
  assert.equal(vsd.disposition, 'hold')
  assert.notEqual(vsd.derivativeSha256, vsd.observedDerivativeSha256)
})

test('Foundation, DCM, Apical and frozen Player files remain byte-identical', () => {
  for (const [path, expected] of Object.entries(read('frozen-assets.json'))) {
    assert.equal(createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex'), expected, path)
  }
})
