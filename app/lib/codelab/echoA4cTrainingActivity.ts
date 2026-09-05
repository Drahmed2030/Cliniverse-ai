import {
  A4C_NORMAL_ACTIVITY_ID,
  A4C_NORMAL_CLINICAL_STUDIO_ASSET,
  A4C_NORMAL_ENGINE_ID,
  A4C_NORMAL_SOURCE_ID,
} from '../clinicalMedia/licensedEchoAsset.ts'

export const ECHO_A4C_ACTIVITY_SCHEMA_VERSION = 1 as const
export const ECHO_A4C_RECEIPT_SCHEMA_VERSION = 1 as const

export type EchoA4cQuestionId = 'view-identity' | 'visible-landmarks' | 'safe-conclusion'
export type EchoA4cAnswerId =
  | 'apical-four-chamber'
  | 'parasternal-long-axis'
  | 'subcostal-ivc'
  | 'four-chambers-av-valves-septa'
  | 'aortic-arch-only'
  | 'coronary-arteries-only'
  | 'source-labeled-view-recognition-only'
  | 'calculate-ejection-fraction'
  | 'exclude-all-pathology'

export type EchoA4cAnswers = Record<EchoA4cQuestionId, EchoA4cAnswerId>

export interface EchoA4cCompletionReceipt {
  schemaVersion: 1 | 2
  receiptId: string
  activityId: typeof A4C_NORMAL_ACTIVITY_ID
  activityVersion: '1.0.0-preview'
  contentAssetId: typeof A4C_NORMAL_CLINICAL_STUDIO_ASSET.assetId
  contentVersion: typeof A4C_NORMAL_CLINICAL_STUDIO_ASSET.version
  playerId: 'clinical-studio-real-cine-player-v1'
  engineId: typeof A4C_NORMAL_ENGINE_ID
  locale: 'en'
  source: {
    sourceId: typeof A4C_NORMAL_SOURCE_ID
    sourceKind: 'licensed-real-echo-cine'
    originalSha1: typeof A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.originalSha1
    derivativeSha256: typeof A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.derivativeSha256
    licenseId: typeof A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.licenseId
  }
  assessment: {
    kind: 'a4c-view-recognition-check'
    answerKeyVersion: 'echo-a4c-answer-key-v1'
    attempts: number
    result: 'passed'
    answers: EchoA4cAnswers
    history?: EchoA4cAnswers[]
  }
  intendedUse: 'education-only'
  dataMode: 'licensed-real-clinical-media'
  reviewStatus: typeof A4C_NORMAL_CLINICAL_STUDIO_ASSET.reviewStatus
  completionMode: 'session-only'
  verification: 'deterministic-learning-receipt'
  humanReviewRequired: true
}

export const ECHO_A4C_TRAINING_ACTIVITY = {
  schemaVersion: ECHO_A4C_ACTIVITY_SCHEMA_VERSION,
  activityId: A4C_NORMAL_ACTIVITY_ID,
  activityVersion: '1.0.0-preview',
  contentAssetId: A4C_NORMAL_CLINICAL_STUDIO_ASSET.assetId,
  contentVersion: A4C_NORMAL_CLINICAL_STUDIO_ASSET.version,
  playerId: 'clinical-studio-real-cine-player-v1',
  engineId: A4C_NORMAL_ENGINE_ID,
  track: 'echo-learning',
  locale: 'en',
  intendedUse: 'education-only',
  dataMode: 'licensed-real-clinical-media',
  reviewStatus: A4C_NORMAL_CLINICAL_STUDIO_ASSET.reviewStatus,
  completionMode: 'session-only',
  assessment: {
    kind: 'a4c-view-recognition-check',
    answerKeyVersion: 'echo-a4c-answer-key-v1',
    minimumAttempts: 1,
    correctAnswers: {
      'view-identity': 'apical-four-chamber',
      'visible-landmarks': 'four-chambers-av-valves-septa',
      'safe-conclusion': 'source-labeled-view-recognition-only',
    },
  },
} as const

export function matchesEchoA4cAnswerKey(answers: EchoA4cAnswers): boolean {
  return answers['view-identity'] === ECHO_A4C_TRAINING_ACTIVITY.assessment.correctAnswers['view-identity']
    && answers['visible-landmarks'] === ECHO_A4C_TRAINING_ACTIVITY.assessment.correctAnswers['visible-landmarks']
    && answers['safe-conclusion'] === ECHO_A4C_TRAINING_ACTIVITY.assessment.correctAnswers['safe-conclusion']
}

export function createEchoA4cCompletionReceipt(input: {
  attempts: number
  answers: EchoA4cAnswers
  history?: EchoA4cAnswers[]
}): EchoA4cCompletionReceipt {
  if (!Number.isInteger(input.attempts) || input.attempts < ECHO_A4C_TRAINING_ACTIVITY.assessment.minimumAttempts) {
    throw new Error('At least one completed A4C training attempt is required.')
  }
  if (!matchesEchoA4cAnswerKey(input.answers)) {
    throw new Error('The governed A4C answer key must be matched before completion.')
  }

  const history = input.history?.map(item => ({ ...item }))
  if (history && (history.length !== input.attempts
    || !history.every(isEchoA4cAnswers)
    || !matchesEchoA4cAnswerKey(history[history.length - 1])
    || history.slice(0, -1).some(matchesEchoA4cAnswerKey))) {
    throw new Error('History must contain every attempt and end at the first passing attempt.')
  }
  const answers = { ...ECHO_A4C_TRAINING_ACTIVITY.assessment.correctAnswers }
  const receiptId = createReceiptId(input.attempts, answers, history)
  return {
    schemaVersion: history ? 2 : ECHO_A4C_RECEIPT_SCHEMA_VERSION,
    receiptId,
    activityId: ECHO_A4C_TRAINING_ACTIVITY.activityId,
    activityVersion: ECHO_A4C_TRAINING_ACTIVITY.activityVersion,
    contentAssetId: ECHO_A4C_TRAINING_ACTIVITY.contentAssetId,
    contentVersion: ECHO_A4C_TRAINING_ACTIVITY.contentVersion,
    playerId: ECHO_A4C_TRAINING_ACTIVITY.playerId,
    engineId: ECHO_A4C_TRAINING_ACTIVITY.engineId,
    locale: 'en',
    source: {
      sourceId: A4C_NORMAL_SOURCE_ID,
      sourceKind: 'licensed-real-echo-cine',
      originalSha1: A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.originalSha1,
      derivativeSha256: A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.derivativeSha256,
      licenseId: A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.licenseId,
    },
    assessment: {
      kind: ECHO_A4C_TRAINING_ACTIVITY.assessment.kind,
      answerKeyVersion: ECHO_A4C_TRAINING_ACTIVITY.assessment.answerKeyVersion,
      attempts: input.attempts,
      result: 'passed',
      answers,
      ...(history ? { history } : {}),
    },
    intendedUse: ECHO_A4C_TRAINING_ACTIVITY.intendedUse,
    dataMode: ECHO_A4C_TRAINING_ACTIVITY.dataMode,
    reviewStatus: ECHO_A4C_TRAINING_ACTIVITY.reviewStatus,
    completionMode: ECHO_A4C_TRAINING_ACTIVITY.completionMode,
    verification: 'deterministic-learning-receipt',
    humanReviewRequired: true,
  }
}

export function parseEchoA4cCompletionReceipt(value: unknown): EchoA4cCompletionReceipt | null {
  if (!isRecord(value) || !isRecord(value.assessment)) return null
  if (!Number.isInteger(value.assessment.attempts) || !isEchoA4cAnswers(value.assessment.answers)) return null
  if (value.schemaVersion !== 1 && value.schemaVersion !== 2) return null
  if (value.schemaVersion === 2 && (!Array.isArray(value.assessment.history) || !value.assessment.history.every(isEchoA4cAnswers))) return null

  try {
    const canonical = createEchoA4cCompletionReceipt({
      attempts: Number(value.assessment.attempts),
      answers: value.assessment.answers,
      ...(value.schemaVersion === 2 ? { history: value.assessment.history as EchoA4cAnswers[] } : {}),
    })
    return JSON.stringify(value) === JSON.stringify(canonical) ? canonical : null
  } catch {
    return null
  }
}

function createReceiptId(attempts: number, answers: EchoA4cAnswers, history?: EchoA4cAnswers[]): string {
  const canonical = JSON.stringify([
    A4C_NORMAL_ACTIVITY_ID,
    ECHO_A4C_TRAINING_ACTIVITY.activityVersion,
    A4C_NORMAL_CLINICAL_STUDIO_ASSET.assetId,
    A4C_NORMAL_CLINICAL_STUDIO_ASSET.version,
    A4C_NORMAL_SOURCE_ID,
    A4C_NORMAL_CLINICAL_STUDIO_ASSET.rights.derivativeSha256,
    answers['view-identity'],
    answers['visible-landmarks'],
    answers['safe-conclusion'],
    attempts,
    ...(history ? [history] : []),
  ])
  let hash = 2_166_136_261
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return `echo-a4c-receipt-v${history ? 2 : 1}-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

function isEchoA4cAnswers(value: unknown): value is EchoA4cAnswers {
  if (!isRecord(value)) return false
  const allowed: EchoA4cAnswerId[] = [
    'apical-four-chamber',
    'parasternal-long-axis',
    'subcostal-ivc',
    'four-chambers-av-valves-septa',
    'aortic-arch-only',
    'coronary-arteries-only',
    'source-labeled-view-recognition-only',
    'calculate-ejection-fraction',
    'exclude-all-pathology',
  ]
  return allowed.includes(value['view-identity'] as EchoA4cAnswerId)
    && allowed.includes(value['visible-landmarks'] as EchoA4cAnswerId)
    && allowed.includes(value['safe-conclusion'] as EchoA4cAnswerId)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
