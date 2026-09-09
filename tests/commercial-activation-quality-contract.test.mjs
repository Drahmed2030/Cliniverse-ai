import test from 'node:test'
import assert from 'node:assert/strict'
import {
  COMMERCIAL_ACTIVATION_SURFACES_V1,
  HUMAN_PRODUCT_QUALITY_POLICY_V1,
  describeCommercialActivationQualityContractV1,
  evaluateCommercialActivationSurfaceV1,
} from '../app/lib/commercial/commercialActivationQualityContract.ts'

test('commercial activation classifies every surface with an explicit user outcome', () => {
  assert.ok(COMMERCIAL_ACTIVATION_SURFACES_V1.length >= 5)
  for (const surface of COMMERCIAL_ACTIVATION_SURFACES_V1) {
    assert.ok(surface.id.trim())
    assert.ok(surface.userOutcome.trim())
    assert.deepEqual(evaluateCommercialActivationSurfaceV1(surface).blockers, [])
  }
})

test('reviewer-relevant AI behavior cannot be hidden from review disclosure', () => {
  const intelligence = COMMERCIAL_ACTIVATION_SURFACES_V1.find(surface => surface.id === 'intelligence')
  assert.ok(intelligence)
  assert.equal(intelligence.decision, 'HOLD')
  assert.equal(intelligence.aiMentionUserRelevant, true)
  assert.equal(intelligence.requiresAppleReviewDisclosure, true)

  const invalid = evaluateCommercialActivationSurfaceV1({
    ...intelligence,
    requiresAppleReviewDisclosure: false,
  })
  assert.equal(invalid.decision, 'HOLD')
  assert.ok(invalid.blockers.includes('reviewer-relevant-ai-must-be-disclosed'))
})

test('clinical surfaces cannot be marked ACTIVATE before governance is satisfied', () => {
  const result = evaluateCommercialActivationSurfaceV1({
    id: 'clinical-new',
    decision: 'ACTIVATE',
    userOutcome: 'Practice a governed clinical case.',
    requiresClinicalGovernance: true,
    requiresAppleReviewDisclosure: true,
    aiMentionUserRelevant: false,
  })
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('clinical-governance-required-before-activation'))
})

test('policy preserves accepted baseline and prohibits deceptive human-only claims', () => {
  assert.equal(HUMAN_PRODUCT_QUALITY_POLICY_V1.acceptedAppleBaselineImmutable, true)
  assert.equal(HUMAN_PRODUCT_QUALITY_POLICY_V1.misleadingHumanOnlyClaimsProhibited, true)
  assert.equal(HUMAN_PRODUCT_QUALITY_POLICY_V1.hiddenDormantFeatureActivationProhibited, true)
  assert.equal(HUMAN_PRODUCT_QUALITY_POLICY_V1.reviewerRelevantAiBehaviorDisclosed, true)
})

test('subscription trust controls remain mandatory in commercial activation', () => {
  assert.equal(HUMAN_PRODUCT_QUALITY_POLICY_V1.storekitEntitlementServerVerified, true)
  assert.equal(HUMAN_PRODUCT_QUALITY_POLICY_V1.restorePurchasesRequired, true)
})

test('contract describes a separate, non-destructive commercial activation path', () => {
  const contract = describeCommercialActivationQualityContractV1()
  assert.equal(contract.acceptedBaselineRemainsUntouched, true)
  assert.equal(contract.commercialActivationUsesSeparateBranch, true)
  assert.equal(contract.noDeceptiveHumanOnlyPresentation, true)
  assert.equal(contract.reviewerRelevantAiDisclosureRequired, true)
})
