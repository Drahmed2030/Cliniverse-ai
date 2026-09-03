import {
  DOOR_TO_ECG_MARKER_LEADS,
  matchesConfiguredMarker,
  type SyntheticLeadId,
} from '../cardiology/ecgWaveform.ts'

export const CODE_LAB_ACTIVITY_SCHEMA_VERSION = 1 as const
export const CODE_LAB_RECEIPT_SCHEMA_VERSION = 1 as const

export interface CodeLabTrainingActivity {
  schemaVersion: typeof CODE_LAB_ACTIVITY_SCHEMA_VERSION
  activityId: 'door-to-ecg-drill-v1'
  activityVersion: '1.0.0'
  contentAssetId: 'door-to-ecg-acquisition-evidence-v1'
  contentVersion: '1.0.0-draft'
  playerId: 'codelab-governed-player-v1'
  track: 'pathway-ecg'
  title: string
  origin: 'pathway-gap'
  returnStage: 'reassessment'
  intendedUse: 'education-only'
  dataMode: 'synthetic-non-clinical'
  reviewStatus: 'draft-human-review-required'
  completionMode: 'session-only'
  assessment: {
    kind: 'configured-marker-selection'
    answerKeyVersion: 'deterministic-svg-v1'
    requiredLeadIds: readonly SyntheticLeadId[]
    minimumAttempts: 1
  }
}

export interface CodeLabTrainingCompletionReceipt {
  schemaVersion: typeof CODE_LAB_RECEIPT_SCHEMA_VERSION
  receiptId: string
  activityId: CodeLabTrainingActivity['activityId']
  activityVersion: CodeLabTrainingActivity['activityVersion']
  contentAssetId: CodeLabTrainingActivity['contentAssetId']
  contentVersion: CodeLabTrainingActivity['contentVersion']
  playerId: CodeLabTrainingActivity['playerId']
  caseId: string
  source: {
    registrySnapshotId: string
    revisionIds: string[]
  }
  assessment: {
    kind: CodeLabTrainingActivity['assessment']['kind']
    answerKeyVersion: CodeLabTrainingActivity['assessment']['answerKeyVersion']
    attempts: number
    result: 'passed'
    matchedLeadIds: SyntheticLeadId[]
  }
  intendedUse: CodeLabTrainingActivity['intendedUse']
  dataMode: CodeLabTrainingActivity['dataMode']
  reviewStatus: CodeLabTrainingActivity['reviewStatus']
  completionMode: CodeLabTrainingActivity['completionMode']
  verification: 'deterministic-structural-receipt'
  humanReviewRequired: true
}

export interface CreateCodeLabTrainingReceiptInput {
  activityId: string
  attempts: number
  caseId: string
  matchedLeadIds: SyntheticLeadId[]
  registrySnapshotId: string
  sourceRevisionIds: string[]
}

export interface CodeLabTrainingReceiptExpectation {
  activityId: string
  caseId: string
  registrySnapshotId: string
  sourceRevisionIds: string[]
}

export const DOOR_TO_ECG_CODE_LAB_ACTIVITY: CodeLabTrainingActivity = {
  schemaVersion: CODE_LAB_ACTIVITY_SCHEMA_VERSION,
  activityId: 'door-to-ecg-drill-v1',
  activityVersion: '1.0.0',
  contentAssetId: 'door-to-ecg-acquisition-evidence-v1',
  contentVersion: '1.0.0-draft',
  playerId: 'codelab-governed-player-v1',
  track: 'pathway-ecg',
  title: 'Door-to-ECG acquisition drill',
  origin: 'pathway-gap',
  returnStage: 'reassessment',
  intendedUse: 'education-only',
  dataMode: 'synthetic-non-clinical',
  reviewStatus: 'draft-human-review-required',
  completionMode: 'session-only',
  assessment: {
    kind: 'configured-marker-selection',
    answerKeyVersion: 'deterministic-svg-v1',
    requiredLeadIds: [...DOOR_TO_ECG_MARKER_LEADS],
    minimumAttempts: 1,
  },
}

export function createCodeLabTrainingReceipt(
  input: CreateCodeLabTrainingReceiptInput,
): CodeLabTrainingCompletionReceipt {
  if (input.activityId !== DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityId) {
    throw new Error('The Code Lab activity does not match the governed training contract.')
  }
  if (!input.caseId.trim()) {
    throw new Error('A synthetic case ID is required for the Code Lab receipt.')
  }
  if (!Number.isInteger(input.attempts) || input.attempts < DOOR_TO_ECG_CODE_LAB_ACTIVITY.assessment.minimumAttempts) {
    throw new Error('At least one completed training attempt is required.')
  }
  if (!input.registrySnapshotId.trim()) {
    throw new Error('A Medical Operations Registry snapshot is required.')
  }
  if (!hasUniqueNonEmptyStrings(input.sourceRevisionIds)) {
    throw new Error('Code Lab source revisions must be unique immutable IDs.')
  }
  if (!matchesConfiguredMarker(input.matchedLeadIds)) {
    throw new Error('The configured deterministic marker must be matched before completion.')
  }

  const matchedLeadIds = [...DOOR_TO_ECG_CODE_LAB_ACTIVITY.assessment.requiredLeadIds]
  const sourceRevisionIds = [...input.sourceRevisionIds]
  const receiptId = createReceiptId({
    activityId: DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityId,
    activityVersion: DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityVersion,
    attempts: input.attempts,
    caseId: input.caseId,
    contentVersion: DOOR_TO_ECG_CODE_LAB_ACTIVITY.contentVersion,
    matchedLeadIds,
    registrySnapshotId: input.registrySnapshotId,
    sourceRevisionIds,
  })

  return {
    schemaVersion: CODE_LAB_RECEIPT_SCHEMA_VERSION,
    receiptId,
    activityId: DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityId,
    activityVersion: DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityVersion,
    contentAssetId: DOOR_TO_ECG_CODE_LAB_ACTIVITY.contentAssetId,
    contentVersion: DOOR_TO_ECG_CODE_LAB_ACTIVITY.contentVersion,
    playerId: DOOR_TO_ECG_CODE_LAB_ACTIVITY.playerId,
    caseId: input.caseId,
    source: {
      registrySnapshotId: input.registrySnapshotId,
      revisionIds: sourceRevisionIds,
    },
    assessment: {
      kind: DOOR_TO_ECG_CODE_LAB_ACTIVITY.assessment.kind,
      answerKeyVersion: DOOR_TO_ECG_CODE_LAB_ACTIVITY.assessment.answerKeyVersion,
      attempts: input.attempts,
      result: 'passed',
      matchedLeadIds,
    },
    intendedUse: DOOR_TO_ECG_CODE_LAB_ACTIVITY.intendedUse,
    dataMode: DOOR_TO_ECG_CODE_LAB_ACTIVITY.dataMode,
    reviewStatus: DOOR_TO_ECG_CODE_LAB_ACTIVITY.reviewStatus,
    completionMode: DOOR_TO_ECG_CODE_LAB_ACTIVITY.completionMode,
    verification: 'deterministic-structural-receipt',
    humanReviewRequired: true,
  }
}

export function parseCodeLabTrainingReceipt(
  value: unknown,
  expected: CodeLabTrainingReceiptExpectation,
): CodeLabTrainingCompletionReceipt | null {
  if (!isRecord(value) || !isRecord(value.source) || !isRecord(value.assessment)) return null
  if (value.schemaVersion !== CODE_LAB_RECEIPT_SCHEMA_VERSION) return null
  if (value.activityId !== expected.activityId || value.caseId !== expected.caseId) return null
  if (value.source.registrySnapshotId !== expected.registrySnapshotId) return null
  if (!sameStringArray(value.source.revisionIds, expected.sourceRevisionIds)) return null
  if (!Number.isInteger(value.assessment.attempts)) return null
  if (!isSyntheticLeadArray(value.assessment.matchedLeadIds)) return null

  try {
    const canonical = createCodeLabTrainingReceipt({
      activityId: value.activityId,
      attempts: Number(value.assessment.attempts),
      caseId: value.caseId,
      matchedLeadIds: value.assessment.matchedLeadIds,
      registrySnapshotId: value.source.registrySnapshotId,
      sourceRevisionIds: value.source.revisionIds,
    })

    const exactContract = value.receiptId === canonical.receiptId
      && value.activityVersion === canonical.activityVersion
      && value.contentAssetId === canonical.contentAssetId
      && value.contentVersion === canonical.contentVersion
      && value.playerId === canonical.playerId
      && value.assessment.kind === canonical.assessment.kind
      && value.assessment.answerKeyVersion === canonical.assessment.answerKeyVersion
      && value.assessment.result === canonical.assessment.result
      && value.intendedUse === canonical.intendedUse
      && value.dataMode === canonical.dataMode
      && value.reviewStatus === canonical.reviewStatus
      && value.completionMode === canonical.completionMode
      && value.verification === canonical.verification
      && value.humanReviewRequired === true

    return exactContract ? canonical : null
  } catch {
    return null
  }
}

function createReceiptId(value: {
  activityId: string
  activityVersion: string
  attempts: number
  caseId: string
  contentVersion: string
  matchedLeadIds: readonly SyntheticLeadId[]
  registrySnapshotId: string
  sourceRevisionIds: readonly string[]
}): string {
  const canonical = JSON.stringify([
    value.activityId,
    value.activityVersion,
    value.attempts,
    value.caseId,
    value.contentVersion,
    value.matchedLeadIds,
    value.registrySnapshotId,
    value.sourceRevisionIds,
  ])
  let hash = 2_166_136_261
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return `codelab-receipt-v1-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function hasUniqueNonEmptyStrings(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length > 0
    && value.every(item => typeof item === 'string' && item.trim().length > 0)
    && new Set(value).size === value.length
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isSyntheticLeadArray(value: unknown): value is SyntheticLeadId[] {
  return Array.isArray(value)
    && value.every(item => item === 'II' || item === 'V2' || item === 'V3' || item === 'V4')
    && new Set(value).size === value.length
}

function sameStringArray(value: unknown, expected: string[]): value is string[] {
  return Array.isArray(value)
    && value.length === expected.length
    && value.every((item, index) => item === expected[index])
}
