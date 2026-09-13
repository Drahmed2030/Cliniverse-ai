import test from 'node:test'
import assert from 'node:assert/strict'
import { matchesReviewedEcgPdf, RECORD10_REVIEW_PDF } from '../app/lib/clinicalIntelligence/ecgReviewedPdfIdentity.ts'
test('wrong size cannot be treated as reviewed PDF', async () => {
  assert.equal(await matchesReviewedEcgPdf(new ArrayBuffer(10)), false)
})
test('matching size alone does not authorize a substitute PDF', async () => {
  assert.equal(await matchesReviewedEcgPdf(new ArrayBuffer(RECORD10_REVIEW_PDF.bytes)), false)
})
