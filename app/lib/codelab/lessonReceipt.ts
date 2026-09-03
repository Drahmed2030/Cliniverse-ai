import {
  CODE_LAB_SOURCE_SNAPSHOT_ID,
  getCodeLabLessonSourceBinding,
} from './lessonGovernance.ts'

export const CODE_LAB_LESSON_RECEIPT_SCHEMA_VERSION = 1 as const

export interface CodeLabLessonCompletionReceipt {
  schemaVersion: typeof CODE_LAB_LESSON_RECEIPT_SCHEMA_VERSION
  receiptId: string
  lessonId: string
  track: 'bls' | 'acls'
  contentVersion: '1.0.0-draft'
  catalogVersion: '1.0.0-draft'
  playerId: 'codelab-unified-player-v1'
  source: {
    ledgerSnapshotId: typeof CODE_LAB_SOURCE_SNAPSHOT_ID
    sourceIds: string[]
    mappingStatus: 'provisional-source-family-only'
  }
  assessment: {
    attempts: number
    score: number
    total: number
    result: 'passed'
  }
  intendedUse: 'education-only'
  reviewStatus: 'draft-human-review-required'
  completionMode: 'device-local'
  verification: 'deterministic-structural-receipt'
  humanReviewRequired: true
}

export interface CreateCodeLabLessonReceiptInput {
  lessonId: string
  track: 'bls' | 'acls'
  attempts: number
  score: number
  total: number
}

export function createCodeLabLessonReceipt(
  input: CreateCodeLabLessonReceiptInput,
): CodeLabLessonCompletionReceipt {
  const binding = getCodeLabLessonSourceBinding(input.lessonId)
  if (!binding || binding.track !== input.track) {
    throw new Error('The lesson does not match the governed Code Lab source ledger.')
  }
  if (!Number.isInteger(input.attempts) || input.attempts < 1) {
    throw new Error('At least one submitted knowledge-check attempt is required.')
  }
  if (!Number.isInteger(input.total) || input.total !== binding.assessmentItemCount || !Number.isInteger(input.score)) {
    throw new Error('A valid knowledge-check score is required.')
  }
  if (input.score < Math.ceil(input.total / 2) || input.score > input.total) {
    throw new Error('The training threshold must be met before a receipt is created.')
  }

  const sourceIds = [...binding.sourceIds]
  const receiptId = createReceiptId({ ...input, sourceIds })
  return {
    schemaVersion: CODE_LAB_LESSON_RECEIPT_SCHEMA_VERSION,
    receiptId,
    lessonId: input.lessonId,
    track: input.track,
    contentVersion: binding.contentVersion,
    catalogVersion: '1.0.0-draft',
    playerId: 'codelab-unified-player-v1',
    source: {
      ledgerSnapshotId: CODE_LAB_SOURCE_SNAPSHOT_ID,
      sourceIds,
      mappingStatus: binding.mappingStatus,
    },
    assessment: {
      attempts: input.attempts,
      score: input.score,
      total: input.total,
      result: 'passed',
    },
    intendedUse: 'education-only',
    reviewStatus: 'draft-human-review-required',
    completionMode: 'device-local',
    verification: 'deterministic-structural-receipt',
    humanReviewRequired: true,
  }
}

export function parseCodeLabLessonReceipt(value: unknown): CodeLabLessonCompletionReceipt | null {
  if (!isRecord(value) || !isRecord(value.source) || !isRecord(value.assessment)) return null
  if (typeof value.lessonId !== 'string' || (value.track !== 'bls' && value.track !== 'acls')) return null
  if (!Number.isInteger(value.assessment.attempts) || !Number.isInteger(value.assessment.score) || !Number.isInteger(value.assessment.total)) return null

  try {
    const canonical = createCodeLabLessonReceipt({
      lessonId: value.lessonId,
      track: value.track,
      attempts: Number(value.assessment.attempts),
      score: Number(value.assessment.score),
      total: Number(value.assessment.total),
    })
    return JSON.stringify(value) === JSON.stringify(canonical) ? canonical : null
  } catch {
    return null
  }
}

function createReceiptId(input: CreateCodeLabLessonReceiptInput & { sourceIds: string[] }): string {
  const canonical = JSON.stringify([
    input.lessonId,
    input.track,
    input.attempts,
    input.score,
    input.total,
    '1.0.0-draft',
    CODE_LAB_SOURCE_SNAPSHOT_ID,
    input.sourceIds,
  ])
  let hash = 2_166_136_261
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return `codelab-lesson-receipt-v1-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
