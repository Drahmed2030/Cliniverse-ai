import test from 'node:test'
import assert from 'node:assert/strict'
import {
  deriveAdaptiveClinicalLayoutModeV1,
  describeAdaptiveClinicalLayoutContractV1,
  reflowAdaptiveClinicalSessionV1,
} from '../app/lib/clinicalIntelligence/adaptiveClinicalLayoutContract.ts'

const state = {
  attemptId: 'attempt-1',
  caseId: 'ecg-governed-case-001',
  selectedLeadId: 'II',
  zoomScale: 1.5,
  timelinePositionMs: 4200,
  annotationIds: ['ann-1', 'ann-2'],
  confidence: 0.8,
}

test('derives compact, expanded and wide clinical modes from available geometry only', () => {
  assert.equal(deriveAdaptiveClinicalLayoutModeV1({ availableWidthPx: 390, availableHeightPx: 844 }), 'COMPACT')
  assert.equal(deriveAdaptiveClinicalLayoutModeV1({ availableWidthPx: 820, availableHeightPx: 1180 }), 'EXPANDED')
  assert.equal(deriveAdaptiveClinicalLayoutModeV1({ availableWidthPx: 1366, availableHeightPx: 1024 }), 'WIDE_CLINICAL')
})

test('reflow preserves learner attempt and clinical session state', () => {
  const compact = reflowAdaptiveClinicalSessionV1({ availableWidthPx: 390, availableHeightPx: 844 }, state)
  const wide = reflowAdaptiveClinicalSessionV1({ availableWidthPx: 1366, availableHeightPx: 1024 }, compact.sessionState)
  assert.equal(compact.mode, 'COMPACT')
  assert.equal(wide.mode, 'WIDE_CLINICAL')
  assert.deepEqual(wide.sessionState, state)
  assert.strictEqual(wide.sessionState, state)
})

test('invalid geometry or mutable-looking session values fail closed', () => {
  const invalid = reflowAdaptiveClinicalSessionV1(
    { availableWidthPx: Number.NaN, availableHeightPx: 800 },
    { ...state, zoomScale: 0, confidence: 2 },
  )
  assert.ok(invalid.blockers.includes('viewport-geometry-invalid'))
  assert.ok(invalid.blockers.includes('zoom-scale-invalid'))
  assert.ok(invalid.blockers.includes('confidence-out-of-range'))
})

test('contract explicitly avoids device, orientation and fold-specific branching', () => {
  const contract = describeAdaptiveClinicalLayoutContractV1()
  assert.equal(contract.geometryDriven, true)
  assert.equal(contract.deviceModelChecksRequired, false)
  assert.equal(contract.orientationChecksRequired, false)
  assert.equal(contract.foldStateChecksRequired, false)
  assert.equal(contract.layoutDoesNotOwnLearnerState, true)
})
