import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildEcgAdaptiveLearnerWorkspaceV1,
  describeEcgAdaptiveLearnerWorkspaceContractV1,
  validateEcgAdaptiveLearnerWorkspaceV1,
} from '../app/lib/clinicalIntelligence/ecgAdaptiveLearnerWorkspaceContract.ts'

const state = {
  attemptId: 'attempt-ecg-1',
  caseId: 'ecg-governed-case-001',
  selectedLeadId: 'II',
  zoomScale: 1.5,
  timelinePositionMs: 4200,
  annotationIds: ['ann-1'],
  confidence: 0.8,
}

test('compact workspace keeps governed ECG waveform as the focused primary pane', () => {
  const workspace = buildEcgAdaptiveLearnerWorkspaceV1('COMPACT', state)
  assert.deepEqual(workspace.visiblePanes, ['ECG_WAVEFORM'])
  assert.equal(workspace.primaryPane, 'ECG_WAVEFORM')
  assert.deepEqual(validateEcgAdaptiveLearnerWorkspaceV1(workspace), [])
})

test('expanded workspace adds interpretation without replacing waveform', () => {
  const workspace = buildEcgAdaptiveLearnerWorkspaceV1('EXPANDED', state)
  assert.deepEqual(workspace.visiblePanes, ['ECG_WAVEFORM', 'INTERPRETATION'])
  assert.equal(workspace.sessionState, state)
  assert.deepEqual(validateEcgAdaptiveLearnerWorkspaceV1(workspace), [])
})

test('wide clinical workspace exposes context and competency feedback', () => {
  const workspace = buildEcgAdaptiveLearnerWorkspaceV1('WIDE_CLINICAL', state)
  assert.ok(workspace.visiblePanes.includes('CASE_CONTEXT'))
  assert.ok(workspace.visiblePanes.includes('COMPETENCY_FEEDBACK'))
  assert.deepEqual(validateEcgAdaptiveLearnerWorkspaceV1(workspace), [])
})

test('workspace layout never owns attempt state and legacy synthetic ECG stays excluded', () => {
  const contract = describeEcgAdaptiveLearnerWorkspaceContractV1()
  assert.equal(contract.legacySyntheticEcgExcluded, true)
  assert.equal(contract.sessionStateSurvivesLayoutRecomposition, true)
  assert.equal(contract.noDeviceSpecificForks, true)
  const workspace = buildEcgAdaptiveLearnerWorkspaceV1('WIDE_CLINICAL', state)
  assert.equal(workspace.waveformOwnsAttemptState, false)
  assert.equal(workspace.layoutOwnsAttemptState, false)
  assert.equal(workspace.legacySyntheticWaveformAllowed, false)
})
