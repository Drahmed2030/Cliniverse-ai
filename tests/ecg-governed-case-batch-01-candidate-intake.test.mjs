import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1,
  evaluateEcgBatch01MetadataCandidateIntakeV1,
} from '../app/lib/clinicalIntelligence/ecgGovernedCaseBatch01CandidateIntake.ts'

test('metadata shortlist is ready only for waveform inspection', () => {
  const result = evaluateEcgBatch01MetadataCandidateIntakeV1()
  assert.equal(result.decision, 'READY_FOR_WAVEFORM_INSPECTION')
  assert.equal(result.selectedMetadataCandidateCount, 7)
  assert.equal(result.clinicalTruthEstablished, false)
  assert.equal(result.learnerReady, false)
})

test('all shortlisted records preserve fold 9 or 10 high-label-quality preference', () => {
  assert.equal(ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1.every(item => item.stratFold === 9 || item.stratFold === 10), true)
})

test('patient grouping prevents duplicate patient selection in the intake', () => {
  const ids = ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1.map(item => item.patientId)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(evaluateEcgBatch01MetadataCandidateIntakeV1().patientGroupingPreserved, true)
})

test('source metadata never becomes a diagnosis or learner-ready authorization', () => {
  for (const candidate of ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1) {
    assert.equal(candidate.diagnosisLabel, null)
    assert.equal(candidate.learnerReady, false)
    assert.equal(candidate.technicalWaveformInspectionStatus, 'PENDING')
    assert.equal(candidate.privacyReviewStatus, 'PENDING')
    assert.equal(candidate.clinicalReviewStatus, 'PENDING')
  }
})

test('known source conflicts and technical caveats remain explicit', () => {
  const conflictIds = ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1.filter(item => item.sourceLabelConflict).map(item => item.ecgId)
  assert.ok(conflictIds.includes(17))
  assert.ok(conflictIds.includes(347))
  const rbbb = ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1.find(item => item.ecgId === 195)
  assert.ok(rbbb?.technicalCaveatFromMetadata)
})

test('invalid duplicate patient intake fails closed', () => {
  const first = ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1[0]
  const duplicatePatient = {
    ...ECG_GOVERNED_BATCH_01_METADATA_CANDIDATES_V1[1],
    patientId: first.patientId,
  }
  const result = evaluateEcgBatch01MetadataCandidateIntakeV1([first, duplicatePatient])
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('duplicate-patient-id'))
})
