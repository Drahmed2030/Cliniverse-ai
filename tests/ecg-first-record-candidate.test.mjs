import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ECG_FIRST_RECORD_CANDIDATE,
  evaluateFirstEcgRecordCandidate,
} from '../app/lib/clinicalIntelligence/ecgFirstRecordCandidate.ts'

test('first candidate is PTB-XL record 10 from a high-label-quality fold', () => {
  assert.equal(ECG_FIRST_RECORD_CANDIDATE.datasetSourceId, 'physionet-ptb-xl-v1.0.3')
  assert.equal(ECG_FIRST_RECORD_CANDIDATE.ecgId, 10)
  assert.equal(ECG_FIRST_RECORD_CANDIDATE.stratFold, 9)
  assert.equal(ECG_FIRST_RECORD_CANDIDATE.sourceValidatedByHuman, true)
})

test('first candidate preserves 500 Hz path and foundational skill objective', () => {
  assert.equal(ECG_FIRST_RECORD_CANDIDATE.filenameHr, 'records500/00000/00010_hr')
  assert.equal(ECG_FIRST_RECORD_CANDIDATE.educationalObjective, 'recognize-normal-sinus-rhythm-and-normal-ecg-pattern')
  assert.deepEqual(ECG_FIRST_RECORD_CANDIDATE.proposedSkillIds, [
    'ecg-rhythm-sinus-recognition',
    'ecg-normal-pattern-recognition',
  ])
})

test('source labels do not auto-promote a diagnosis', () => {
  assert.deepEqual(ECG_FIRST_RECORD_CANDIDATE.sourceScpCodes, { NORM: 100, SR: 0 })
  assert.equal(ECG_FIRST_RECORD_CANDIDATE.diagnosisLabel, null)
  assert.equal(ECG_FIRST_RECORD_CANDIDATE.learnerReady, false)
})

test('candidate remains blocked pending waveform, privacy, clinical and ledger review', () => {
  const result = evaluateFirstEcgRecordCandidate()
  assert.equal(result.status, 'CANDIDATE_SELECTED')
  assert.equal(result.learnerReady, false)
  assert.ok(result.blockers.includes('technical-waveform-inspection-required'))
  assert.ok(result.blockers.includes('privacy-review-required'))
  assert.ok(result.blockers.includes('human-clinical-review-required'))
  assert.ok(result.blockers.includes('evidence-ledger-binding-required'))
})
