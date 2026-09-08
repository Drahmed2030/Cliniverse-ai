import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluateGovernedEducationalContent,
  canEntitlementAccessGovernedContent,
} from '../app/lib/clinicalIntelligence/governedEducationalContentContract.ts'

function approvedContent(overrides = {}) {
  return {
    contentId: 'echo-a4c-normal-lesson-v1',
    version: '1.0.0',
    kind: 'LESSON',
    title: 'Apical four-chamber orientation',
    sourceBindings: [{
      sourceId: 'echo-a4c-normal-cardionetworks-v1-en',
      sourceType: 'VERIFIED_CLINICAL_MEDIA',
      sourceVersion: '1.0.0',
      evidenceRecordIds: ['evidence-echo-a4c-normal-v1'],
      provenanceVerified: true,
    }],
    generatedWithAI: false,
    clinicalReview: {
      status: 'APPROVED',
      reviewerId: 'clinical-reviewer-1',
      reviewedVersion: '1.0.0',
      clinicalScopeAccepted: true,
    },
    ledgerEventIds: ['evt-content-clinical-review-1'],
    requestedAudience: 'FREE',
    ...overrides,
  }
}

test('approved evidence-bound content can become promotion candidate', () => {
  const result = evaluateGovernedEducationalContent(approvedContent())
  assert.equal(result.decision, 'PROMOTE')
  assert.deepEqual(result.blockers, [])
  assert.equal(result.entitlementRequired, 'free')
  assert.equal(result.educationalTruthIndependentOfEntitlement, true)
})

test('commercial audience never bypasses evidence or clinical review', () => {
  const content = approvedContent({
    requestedAudience: 'INSTITUTION',
    ledgerEventIds: [],
    clinicalReview: { status: 'PENDING' },
  })
  const result = evaluateGovernedEducationalContent(content)
  assert.equal(result.decision, 'HOLD')
  assert.equal(result.entitlementRequired, 'institution')
  assert.ok(result.blockers.includes('evidence-ledger-binding-missing'))
  assert.ok(result.blockers.includes('clinical-review-not-approved'))
})

test('AI-assisted educational content requires human clinical approval', () => {
  const result = evaluateGovernedEducationalContent(approvedContent({
    generatedWithAI: true,
    clinicalReview: { status: 'PENDING' },
  }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('ai-assisted-content-requires-human-clinical-approval'))
})

test('content version drift invalidates prior clinical approval', () => {
  const result = evaluateGovernedEducationalContent(approvedContent({ version: '1.1.0' }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('clinical-review-version-mismatch'))
})

test('rejected clinical review rejects content rather than holding it', () => {
  const result = evaluateGovernedEducationalContent(approvedContent({
    clinicalReview: { status: 'REJECTED', reviewerId: 'clinical-reviewer-1', reviewedVersion: '1.0.0' },
  }))
  assert.equal(result.decision, 'REJECT')
  assert.ok(result.blockers.includes('clinical-review-rejected'))
})

test('entitlements control access only, with monotonic tier ordering', () => {
  assert.equal(canEntitlementAccessGovernedContent('free', 'free'), true)
  assert.equal(canEntitlementAccessGovernedContent('free', 'pro'), false)
  assert.equal(canEntitlementAccessGovernedContent('pro', 'free'), true)
  assert.equal(canEntitlementAccessGovernedContent('pro', 'institution'), false)
  assert.equal(canEntitlementAccessGovernedContent('institution', 'pro'), true)
})
