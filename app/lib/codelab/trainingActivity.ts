import {
  DOOR_TO_ECG_MARKER_LEADS,
  matchesConfiguredMarker,
  type SyntheticLeadId,
} from '../cardiology/ecgWaveform.ts'
import { sha256Hex } from '../receipts/canonicalHash.ts'

// CodeLabTrainingActivity / receipt — Batch 7, ADAPTED from
// ops/platform-governance-v1's app/lib/codelab/trainingActivity.ts (fully
// self-contained; does not depend on that branch's separate lesson
// catalog/player — see the Batch 7 reconciliation report for why that
// separate system was not recovered). Receipt hashing upgraded from v1's
// FNV-1a non-cryptographic hash to a real tamper-evident SHA-256 of the
// canonicalized payload, per Batch 7 Section 4. This is a TAMPER-EVIDENT
// STRUCTURAL RECEIPT — never called a digital signature, certificate, or
// credential anywhere in this repo. See docs/PATHWAY_REPLAY_INTELLIGENCE_V2.md.

export const CODE_LAB_ACTIVITY_SCHEMA_VERSION = 1 as const
export const CODE_LAB_RECEIPT_SCHEMA_VERSION = 2 as const

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
  /** Full SHA-256 (hex) of the canonicalized payload below (every field except receiptId/receiptHash themselves). Recompute and compare to detect tampering. */
  receiptHash: string
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
  /** Deliberately not "signature"/"certificate"/"credential" — see file header. */
  verification: 'tamper-evident-structural-receipt'
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

/** Never call this to pre-create a receipt before a drill is actually passed — see the caller-side guard in pathwaySession.ts's submitPathwayDrill. Creating a receipt is itself the evidence that the configured marker was matched. */
export async function createCodeLabTrainingReceipt(
  input: CreateCodeLabTrainingReceiptInput,
): Promise<CodeLabTrainingCompletionReceipt> {
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
    throw new Error('A pathway registry snapshot is required.')
  }
  if (!hasUniqueNonEmptyStrings(input.sourceRevisionIds)) {
    throw new Error('Code Lab source revisions must be unique immutable IDs.')
  }
  if (!matchesConfiguredMarker(input.matchedLeadIds)) {
    throw new Error('The configured deterministic marker must be matched before completion.')
  }

  const matchedLeadIds = [...DOOR_TO_ECG_CODE_LAB_ACTIVITY.assessment.requiredLeadIds]
  const sourceRevisionIds = [...input.sourceRevisionIds]

  const payload = {
    schemaVersion: CODE_LAB_RECEIPT_SCHEMA_VERSION,
    activityId: DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityId,
    activityVersion: DOOR_TO_ECG_CODE_LAB_ACTIVITY.activityVersion,
    contentAssetId: DOOR_TO_ECG_CODE_LAB_ACTIVITY.contentAssetId,
    contentVersion: DOOR_TO_ECG_CODE_LAB_ACTIVITY.contentVersion,
    playerId: DOOR_TO_ECG_CODE_LAB_ACTIVITY.playerId,
    caseId: input.caseId,
    source: { registrySnapshotId: input.registrySnapshotId, revisionIds: sourceRevisionIds },
    assessment: {
      kind: DOOR_TO_ECG_CODE_LAB_ACTIVITY.assessment.kind,
      answerKeyVersion: DOOR_TO_ECG_CODE_LAB_ACTIVITY.assessment.answerKeyVersion,
      attempts: input.attempts,
      result: 'passed' as const,
      matchedLeadIds,
    },
    intendedUse: DOOR_TO_ECG_CODE_LAB_ACTIVITY.intendedUse,
    dataMode: DOOR_TO_ECG_CODE_LAB_ACTIVITY.dataMode,
    reviewStatus: DOOR_TO_ECG_CODE_LAB_ACTIVITY.reviewStatus,
    completionMode: DOOR_TO_ECG_CODE_LAB_ACTIVITY.completionMode,
    verification: 'tamper-evident-structural-receipt' as const,
    humanReviewRequired: true as const,
  }

  const receiptHash = await sha256Hex(payload)
  return { ...payload, receiptId: `codelab-receipt-v2-${receiptHash.slice(0, 16)}`, receiptHash }
}

export async function parseCodeLabTrainingReceipt(
  value: unknown,
  expected: CodeLabTrainingReceiptExpectation,
): Promise<CodeLabTrainingCompletionReceipt | null> {
  if (!isRecord(value) || !isRecord(value.source) || !isRecord(value.assessment)) return null
  if (value.schemaVersion !== CODE_LAB_RECEIPT_SCHEMA_VERSION) return null
  if (value.activityId !== expected.activityId || value.caseId !== expected.caseId) return null
  if (value.source.registrySnapshotId !== expected.registrySnapshotId) return null
  if (!sameStringArray(value.source.revisionIds, expected.sourceRevisionIds)) return null
  if (!Number.isInteger(value.assessment.attempts)) return null
  if (!isSyntheticLeadArray(value.assessment.matchedLeadIds)) return null

  try {
    const canonical = await createCodeLabTrainingReceipt({
      activityId: value.activityId,
      attempts: Number(value.assessment.attempts),
      caseId: value.caseId,
      matchedLeadIds: value.assessment.matchedLeadIds,
      registrySnapshotId: value.source.registrySnapshotId,
      sourceRevisionIds: value.source.revisionIds,
    })

    // A single receiptHash comparison covers every other field, since the
    // hash is computed over the whole canonical payload — changing score,
    // attempts, source, or anything else invalidates it. receiptId is
    // derived from the same hash, so it's redundant to check separately,
    // but checked anyway as a cheap early exit.
    const tampered = value.receiptId !== canonical.receiptId || value.receiptHash !== canonical.receiptHash
    return tampered ? null : canonical
  } catch {
    return null
  }
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
