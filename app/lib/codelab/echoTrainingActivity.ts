import type { EchoCineLocale } from '../clinicalMedia/echoCinePhantom.ts'
import {
  ECHO_CINE_ENGINE_ID,
  ECHO_CINE_SOURCE_ID,
} from '../clinicalMedia/echoCinePhantom.ts'

export const ECHO_ACTIVITY_SCHEMA_VERSION = 1 as const
export const ECHO_RECEIPT_SCHEMA_VERSION = 1 as const

export type EchoAssessmentQuestionId = 'scientific-object' | 'permitted-observation'
export type EchoAssessmentAnswerId =
  | 'ordered-cine-frames'
  | 'time-series-signal'
  | 'voxel-volume'
  | 'describe-cyclical-motion'
  | 'estimate-function'
  | 'name-pathology'

export type EchoAssessmentAnswers = Record<EchoAssessmentQuestionId, EchoAssessmentAnswerId>

export interface EchoMotionTrainingActivity {
  schemaVersion: typeof ECHO_ACTIVITY_SCHEMA_VERSION
  activityId: 'echo-motion-orientation-v0'
  activityVersion: '0.1.0'
  contentAssetIds: Record<EchoCineLocale, string>
  contentVersion: '0.1.0-draft'
  playerId: 'clinical-studio-cine-player-v0'
  engineId: typeof ECHO_CINE_ENGINE_ID
  track: 'echo-learning'
  intendedUse: 'education-only'
  dataMode: 'synthetic-non-clinical'
  reviewStatus: 'draft-human-review-required'
  completionMode: 'session-only'
  assessment: {
    kind: 'modality-boundary-check'
    answerKeyVersion: 'echo-cine-answer-key-v0'
    minimumAttempts: 1
    correctAnswers: EchoAssessmentAnswers
  }
}

export interface EchoMotionCompletionReceipt {
  schemaVersion: typeof ECHO_RECEIPT_SCHEMA_VERSION
  receiptId: string
  activityId: EchoMotionTrainingActivity['activityId']
  activityVersion: EchoMotionTrainingActivity['activityVersion']
  contentAssetId: string
  contentVersion: EchoMotionTrainingActivity['contentVersion']
  playerId: EchoMotionTrainingActivity['playerId']
  engineId: EchoMotionTrainingActivity['engineId']
  locale: EchoCineLocale
  source: {
    sourceId: typeof ECHO_CINE_SOURCE_ID
    sourceKind: 'internally-authored-synthetic-phantom'
  }
  assessment: {
    kind: EchoMotionTrainingActivity['assessment']['kind']
    answerKeyVersion: EchoMotionTrainingActivity['assessment']['answerKeyVersion']
    attempts: number
    result: 'passed'
    answers: EchoAssessmentAnswers
  }
  intendedUse: EchoMotionTrainingActivity['intendedUse']
  dataMode: EchoMotionTrainingActivity['dataMode']
  reviewStatus: EchoMotionTrainingActivity['reviewStatus']
  completionMode: EchoMotionTrainingActivity['completionMode']
  verification: 'deterministic-structural-receipt'
  humanReviewRequired: true
}

export const ECHO_MOTION_TRAINING_ACTIVITY: EchoMotionTrainingActivity = {
  schemaVersion: ECHO_ACTIVITY_SCHEMA_VERSION,
  activityId: 'echo-motion-orientation-v0',
  activityVersion: '0.1.0',
  contentAssetIds: {
    en: 'echo-motion-orientation-v0-en',
    ar: 'echo-motion-orientation-v0-ar',
  },
  contentVersion: '0.1.0-draft',
  playerId: 'clinical-studio-cine-player-v0',
  engineId: ECHO_CINE_ENGINE_ID,
  track: 'echo-learning',
  intendedUse: 'education-only',
  dataMode: 'synthetic-non-clinical',
  reviewStatus: 'draft-human-review-required',
  completionMode: 'session-only',
  assessment: {
    kind: 'modality-boundary-check',
    answerKeyVersion: 'echo-cine-answer-key-v0',
    minimumAttempts: 1,
    correctAnswers: {
      'scientific-object': 'ordered-cine-frames',
      'permitted-observation': 'describe-cyclical-motion',
    },
  },
}

export function createEchoMotionCompletionReceipt(input: {
  locale: EchoCineLocale
  attempts: number
  answers: EchoAssessmentAnswers
}): EchoMotionCompletionReceipt {
  if (!Number.isInteger(input.attempts) || input.attempts < ECHO_MOTION_TRAINING_ACTIVITY.assessment.minimumAttempts) {
    throw new Error('At least one completed Echo training attempt is required.')
  }
  if (!matchesEchoAnswerKey(input.answers)) {
    throw new Error('The governed Echo modality answer key must be matched before completion.')
  }

  const answers = { ...ECHO_MOTION_TRAINING_ACTIVITY.assessment.correctAnswers }
  const receiptId = createReceiptId({
    activityId: ECHO_MOTION_TRAINING_ACTIVITY.activityId,
    activityVersion: ECHO_MOTION_TRAINING_ACTIVITY.activityVersion,
    answers,
    attempts: input.attempts,
    contentAssetId: ECHO_MOTION_TRAINING_ACTIVITY.contentAssetIds[input.locale],
    contentVersion: ECHO_MOTION_TRAINING_ACTIVITY.contentVersion,
    engineId: ECHO_MOTION_TRAINING_ACTIVITY.engineId,
    locale: input.locale,
    sourceId: ECHO_CINE_SOURCE_ID,
  })

  return {
    schemaVersion: ECHO_RECEIPT_SCHEMA_VERSION,
    receiptId,
    activityId: ECHO_MOTION_TRAINING_ACTIVITY.activityId,
    activityVersion: ECHO_MOTION_TRAINING_ACTIVITY.activityVersion,
    contentAssetId: ECHO_MOTION_TRAINING_ACTIVITY.contentAssetIds[input.locale],
    contentVersion: ECHO_MOTION_TRAINING_ACTIVITY.contentVersion,
    playerId: ECHO_MOTION_TRAINING_ACTIVITY.playerId,
    engineId: ECHO_MOTION_TRAINING_ACTIVITY.engineId,
    locale: input.locale,
    source: {
      sourceId: ECHO_CINE_SOURCE_ID,
      sourceKind: 'internally-authored-synthetic-phantom',
    },
    assessment: {
      kind: ECHO_MOTION_TRAINING_ACTIVITY.assessment.kind,
      answerKeyVersion: ECHO_MOTION_TRAINING_ACTIVITY.assessment.answerKeyVersion,
      attempts: input.attempts,
      result: 'passed',
      answers,
    },
    intendedUse: ECHO_MOTION_TRAINING_ACTIVITY.intendedUse,
    dataMode: ECHO_MOTION_TRAINING_ACTIVITY.dataMode,
    reviewStatus: ECHO_MOTION_TRAINING_ACTIVITY.reviewStatus,
    completionMode: ECHO_MOTION_TRAINING_ACTIVITY.completionMode,
    verification: 'deterministic-structural-receipt',
    humanReviewRequired: true,
  }
}

export function parseEchoMotionCompletionReceipt(value: unknown): EchoMotionCompletionReceipt | null {
  if (!isRecord(value) || !isRecord(value.assessment)) return null
  if (value.locale !== 'en' && value.locale !== 'ar') return null
  if (!Number.isInteger(value.assessment.attempts) || !isEchoAssessmentAnswers(value.assessment.answers)) return null

  try {
    const canonical = createEchoMotionCompletionReceipt({
      locale: value.locale,
      attempts: Number(value.assessment.attempts),
      answers: value.assessment.answers,
    })
    return JSON.stringify(value) === JSON.stringify(canonical) ? canonical : null
  } catch {
    return null
  }
}

export function matchesEchoAnswerKey(answers: EchoAssessmentAnswers): boolean {
  return answers['scientific-object'] === ECHO_MOTION_TRAINING_ACTIVITY.assessment.correctAnswers['scientific-object']
    && answers['permitted-observation'] === ECHO_MOTION_TRAINING_ACTIVITY.assessment.correctAnswers['permitted-observation']
}

function createReceiptId(value: {
  activityId: string
  activityVersion: string
  answers: EchoAssessmentAnswers
  attempts: number
  contentAssetId: string
  contentVersion: string
  engineId: string
  locale: EchoCineLocale
  sourceId: string
}): string {
  const canonical = JSON.stringify([
    value.activityId,
    value.activityVersion,
    value.answers['scientific-object'],
    value.answers['permitted-observation'],
    value.attempts,
    value.contentAssetId,
    value.contentVersion,
    value.engineId,
    value.locale,
    value.sourceId,
  ])
  let hash = 2_166_136_261
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return `echo-cine-receipt-v0-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function isEchoAssessmentAnswers(value: unknown): value is EchoAssessmentAnswers {
  if (!isRecord(value)) return false
  const allowedAnswers: EchoAssessmentAnswerId[] = [
    'ordered-cine-frames',
    'time-series-signal',
    'voxel-volume',
    'describe-cyclical-motion',
    'estimate-function',
    'name-pathology',
  ]
  return allowedAnswers.includes(value['scientific-object'] as EchoAssessmentAnswerId)
    && allowedAnswers.includes(value['permitted-observation'] as EchoAssessmentAnswerId)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
