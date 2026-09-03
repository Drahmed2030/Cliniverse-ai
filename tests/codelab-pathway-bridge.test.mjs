import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runPathwayReplay, STEMI_REPLAY_DEMO } from '../app/lib/cardiology/pathwayReplayAgents.ts'
import {
  createCodeLabTrainingReceipt,
  DOOR_TO_ECG_CODE_LAB_ACTIVITY,
  parseCodeLabTrainingReceipt,
} from '../app/lib/codelab/trainingActivity.ts'
import { CLINICAL_STUDIO_ASSETS } from '../app/lib/clinicalMedia/clinicalStudioManifest.ts'

const report = runPathwayReplay(STEMI_REPLAY_DEMO)
const expectation = {
  activityId: report.training.activityId,
  caseId: report.caseId,
  registrySnapshotId: report.training.registrySnapshotId,
  sourceRevisionIds: report.training.referenceIds,
}

function createValidReceipt(attempts = 1) {
  return createCodeLabTrainingReceipt({
    ...expectation,
    attempts,
    matchedLeadIds: ['V2', 'V3', 'V4'],
  })
}

test('the pathway activity, media manifest and replay report share one versioned identity', () => {
  const media = CLINICAL_STUDIO_ASSETS.find(
    asset => asset.assetId === DOOR_TO_ECG_CODE_LAB_ACTIVITY.contentAssetId,
  )

  assert.ok(media)
  assert.equal(report.training.activityId, DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityId)
  assert.equal(media.linkedActivityId, DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityId)
  assert.equal(media.version, DOOR_TO_ECG_CODE_LAB_ACTIVITY.contentVersion)
  assert.equal(media.dataMode, DOOR_TO_ECG_CODE_LAB_ACTIVITY.dataMode)
  assert.equal(media.reviewStatus, DOOR_TO_ECG_CODE_LAB_ACTIVITY.reviewStatus)
  assert.equal(DOOR_TO_ECG_CODE_LAB_ACTIVITY.returnStage, 'reassessment')
})

test('a successful deterministic drill creates one canonical session-only receipt', () => {
  const first = createValidReceipt(2)
  const second = createValidReceipt(2)

  assert.deepEqual(first, second)
  assert.match(first.receiptId, /^codelab-receipt-v1-[a-f0-9]{8}$/)
  assert.equal(first.completionMode, 'session-only')
  assert.equal(first.verification, 'deterministic-structural-receipt')
  assert.equal(first.humanReviewRequired, true)
  assert.deepEqual(first.source.revisionIds, report.training.referenceIds)
  assert.equal(first.source.registrySnapshotId, report.registry.snapshotId)
  assert.deepEqual(first.assessment.matchedLeadIds, ['V2', 'V3', 'V4'])
  assert.deepEqual(parseCodeLabTrainingReceipt(first, expectation), first)
})

test('the bridge fails closed for incomplete answers, invalid sources and receipt drift', () => {
  assert.throws(
    () => createCodeLabTrainingReceipt({
      ...expectation,
      attempts: 1,
      matchedLeadIds: ['II', 'V2', 'V3'],
    }),
    /deterministic marker/i,
  )
  assert.throws(
    () => createCodeLabTrainingReceipt({
      ...expectation,
      attempts: 0,
      matchedLeadIds: ['V2', 'V3', 'V4'],
    }),
    /at least one/i,
  )
  assert.throws(
    () => createCodeLabTrainingReceipt({
      ...expectation,
      attempts: 1,
      matchedLeadIds: ['V2', 'V3', 'V4'],
      sourceRevisionIds: ['DEMO-PATHWAY-RULESET-V1', 'DEMO-PATHWAY-RULESET-V1'],
    }),
    /unique immutable/i,
  )

  const valid = createValidReceipt()
  assert.equal(
    parseCodeLabTrainingReceipt({ ...valid, receiptId: 'tampered' }, expectation),
    null,
  )
  assert.equal(
    parseCodeLabTrainingReceipt({ ...valid, reviewStatus: 'approved' }, expectation),
    null,
  )
  assert.equal(
    parseCodeLabTrainingReceipt(valid, { ...expectation, registrySnapshotId: 'different' }),
    null,
  )
})

test('the Code Lab bridge remains network-free, database-free and session-only', () => {
  const source = readFileSync(
    new URL('../app/lib/codelab/trainingActivity.ts', import.meta.url),
    'utf8',
  )

  assert.doesNotMatch(source, /fetch\s*\(/)
  assert.doesNotMatch(source, /supabase|postgres|indexedDB/i)
  assert.match(source, /completionMode: 'session-only'/)
})
