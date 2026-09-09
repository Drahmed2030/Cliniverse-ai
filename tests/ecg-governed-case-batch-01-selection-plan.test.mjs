import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ECG_GOVERNED_BATCH_01_SELECTION_PLAN_V1,
  describeEcgBatch01SelectionPlanV1,
  evaluateEcgBatch01SelectionPlanV1,
} from '../app/lib/clinicalIntelligence/ecgGovernedCaseBatch01SelectionPlan.ts'

test('batch 01 selection plan preserves 12 governed slots and record 10 as the only selected record', () => {
  const result = evaluateEcgBatch01SelectionPlanV1()
  assert.equal(result.decision, 'READY_FOR_BATCH_RECORD_SELECTION')
  assert.equal(ECG_GOVERNED_BATCH_01_SELECTION_PLAN_V1.length, 12)
  assert.equal(result.selectedCount, 1)
  assert.equal(result.pendingCount, 11)
  const selected = ECG_GOVERNED_BATCH_01_SELECTION_PLAN_V1.filter(slot => slot.status === 'RECORD_SELECTED')
  assert.equal(selected[0].selectedRecordId, '10')
  assert.equal(selected[0].selectedPatientId, '9456')
})

test('pending selection slots do not invent record or patient ids', () => {
  const pending = ECG_GOVERNED_BATCH_01_SELECTION_PLAN_V1.filter(slot => slot.status === 'TARGET_DEFINED')
  assert.ok(pending.length > 0)
  for (const slot of pending) {
    assert.equal(slot.selectedRecordId, null)
    assert.equal(slot.selectedPatientId, null)
  }
})

test('source labels remain hints and human clinical review remains mandatory', () => {
  for (const slot of ECG_GOVERNED_BATCH_01_SELECTION_PLAN_V1) {
    assert.equal(slot.sourceLabelsAreSelectionHintsOnly, true)
    assert.equal(slot.humanClinicalReviewRequired, true)
    assert.equal(slot.technicalInspectionRequired, true)
    assert.equal(slot.privacyReviewRequired, true)
  }
})

test('fails closed when record and patient binding is incomplete', () => {
  const slots = ECG_GOVERNED_BATCH_01_SELECTION_PLAN_V1.map((slot, index) => index === 1
    ? { ...slot, selectedRecordId: '123', selectedPatientId: null, status: 'RECORD_SELECTED' }
    : slot)
  const result = evaluateEcgBatch01SelectionPlanV1(slots)
  assert.equal(result.decision, 'HOLD')
  assert.ok(result.blockers.includes('record-patient-binding-incomplete:batch01-slot-02'))
})

test('contract keeps batch selection governed and non-fabricated', () => {
  const contract = describeEcgBatch01SelectionPlanV1()
  assert.equal(contract.firstRecordPreserved, true)
  assert.equal(contract.remainingRecordsNotInvented, true)
  assert.equal(contract.patientLevelBindingRequired, true)
  assert.equal(contract.humanClinicalTruthRequired, true)
})
