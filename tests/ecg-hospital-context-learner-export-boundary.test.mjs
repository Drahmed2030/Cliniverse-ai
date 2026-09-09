import test from 'node:test'
import assert from 'node:assert/strict'
import {
  describeEcgHospitalContextBoundary,
  evaluateEcgLearnerExport,
} from '../app/lib/clinicalIntelligence/ecgHospitalContextLearnerExportBoundary.ts'

function validExport(overrides = {}) {
  return {
    exportVersion: '1.0.0',
    canonicalWaveformSha256: 'a'.repeat(64),
    educationalCaseId: 'ecg-governed-case-001',
    opaqueSourceReference: 'opaque:ecg:001',
    approvedAnnotationIds: [],
    attributionText: 'PTB-XL / PhysioNet or approved hospital source attribution',
    directPatientIdentifiersPresent: false,
    acquisitionDateTimePresent: false,
    restrictedContextEmbedded: false,
    freeTextReviewed: true,
    hospitalUseAuthorized: true,
    ...overrides,
  }
}

test('approved learner projection remains PHI-free and export-candidate only', () => {
  const result = evaluateEcgLearnerExport(validExport())
  assert.equal(result.decision, 'EXPORT_CANDIDATE')
  assert.equal(result.phiCopiedToLearnerStorage, false)
  assert.deepEqual(result.blockers, [])
})

test('direct identifiers or restricted context are rejected', () => {
  const direct = evaluateEcgLearnerExport(validExport({ directPatientIdentifiersPresent: true }))
  assert.equal(direct.decision, 'REJECT')
  assert.ok(direct.blockers.includes('direct-patient-identifiers-present'))

  const context = evaluateEcgLearnerExport(validExport({ restrictedContextEmbedded: true }))
  assert.equal(context.decision, 'REJECT')
  assert.ok(context.blockers.includes('restricted-hospital-context-embedded'))
})

test('missing authorization, free-text review or patient-linked time holds export', () => {
  const result = evaluateEcgLearnerExport(validExport({
    hospitalUseAuthorized: false,
    freeTextReviewed: false,
    acquisitionDateTimePresent: true,
  }))
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('hospital-use-authorization-required'))
  assert.ok(result.blockers.includes('free-text-review-required'))
  assert.ok(result.blockers.includes('patient-linked-acquisition-datetime-present'))
})

test('hospital identity and learner identity remain separate by contract', () => {
  const boundary = describeEcgHospitalContextBoundary()
  assert.equal(boundary.restrictedContextStoredInLearnerDomain, false)
  assert.equal(boundary.learnerProjectionUsesOpaqueSourceReference, true)
  assert.equal(boundary.patientEncounterOrderReferencesRemainRestricted, true)
  assert.equal(boundary.learnerExportIsNotLegalDeidentificationCertification, true)
})
