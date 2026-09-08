import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CLINICAL_INTELLIGENCE_CAPABILITIES,
  getCapabilitiesByLifecycle,
  getCapabilitiesForRevenueSurface,
  getHighRiskCapabilities,
} from '../app/lib/clinicalIntelligence/platformCapabilityRegistry.ts'

test('registry keeps Echo active and governed', () => {
  const echo = CLINICAL_INTELLIGENCE_CAPABILITIES.find(item => item.id === 'echo-competency-engine')
  assert.ok(echo)
  assert.equal(echo.lifecycle, 'ACTIVE')
  assert.equal(echo.requiresEvidenceLedger, true)
  assert.equal(echo.requiresHumanClinicalReview, true)
  assert.equal(echo.requiresHumanPrivacyReview, true)
})

test('high-risk modalities require institutional integration', () => {
  const highRisk = getHighRiskCapabilities()
  assert.ok(highRisk.length >= 3)
  for (const capability of highRisk) {
    assert.equal(capability.requiresInstitutionIntegration, true)
    assert.equal(capability.requiresEvidenceLedger, true)
  }
})

test('enterprise assurance never bypasses evidence ledger', () => {
  const enterprise = getCapabilitiesForRevenueSurface('ENTERPRISE_ASSURANCE')
  assert.ok(enterprise.length > 0)
  for (const capability of enterprise) {
    assert.equal(capability.requiresEvidenceLedger, true)
  }
})

test('future capabilities cannot silently become active', () => {
  const future = getCapabilitiesByLifecycle('FUTURE')
  assert.ok(future.some(item => item.id === 'ct-competency-engine'))
  assert.ok(future.some(item => item.id === 'external-clinical-data-adapters'))
  assert.equal(future.some(item => item.lifecycle === 'ACTIVE'), false)
})
