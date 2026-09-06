import type { EchoAssessmentResult } from './echoAssessmentContract.ts'
import type { EchoSkillMastery } from './echoMasteryEngine.ts'

export type EchoMisconceptionCode =
  | 'view-confusion'
  | 'landmark-confusion'
  | 'global-vs-regional-motion'
  | 'over-interpretation'
  | 'confidence-miscalibration'
  | 'other'

export interface EchoPsychometricItemMetadata {
  itemId: string
  itemVersion: string
  skillId: string
  difficultyEstimate?: number | null
  discriminationEstimate?: number | null
  calibrationSampleSize?: number | null
  lastCalibratedAt?: string | null
}

export interface EchoUncertaintySignal {
  masteryEstimate: number
  uncertainty: number
  evidenceCount: number
  confidenceCalibration: number
  highConfidenceError: boolean
  misconceptionCodes: EchoMisconceptionCode[]
}

export interface EchoInformationGainCandidate {
  caseId: string
  itemId: string
  skillId: string
  expectedInformationGain?: number | null
}

export function deriveEchoUncertaintySignal(params: {
  mastery: EchoSkillMastery
  latestResult?: EchoAssessmentResult | null
  misconceptions?: readonly EchoMisconceptionCode[]
}): EchoUncertaintySignal {
  const evidenceCount = Math.max(0, params.mastery.evidenceCount)
  const uncertainty = Number((1 / Math.sqrt(Math.max(1, evidenceCount))).toFixed(3))
  const highConfidenceError = Boolean(params.latestResult && !params.latestResult.correct && params.latestResult.confidence >= 4)
  const misconceptionCodes = new Set<EchoMisconceptionCode>(params.misconceptions ?? [])
  if (highConfidenceError) misconceptionCodes.add('confidence-miscalibration')

  return {
    masteryEstimate: Math.max(0, Math.min(1, params.mastery.score / 100)),
    uncertainty,
    evidenceCount,
    confidenceCalibration: params.mastery.confidenceCalibration,
    highConfidenceError,
    misconceptionCodes: [...misconceptionCodes],
  }
}

export function validateEchoPsychometricItemMetadata(item: EchoPsychometricItemMetadata): void {
  if (!item.itemId || !item.itemVersion || !item.skillId) throw new Error('Psychometric item identity is required.')
  if (item.difficultyEstimate != null && !Number.isFinite(item.difficultyEstimate)) throw new Error('Item difficulty must be finite.')
  if (item.discriminationEstimate != null && (!Number.isFinite(item.discriminationEstimate) || item.discriminationEstimate < 0)) {
    throw new Error('Item discrimination must be finite and non-negative.')
  }
  if (item.calibrationSampleSize != null && (!Number.isInteger(item.calibrationSampleSize) || item.calibrationSampleSize < 0)) {
    throw new Error('Calibration sample size must be a non-negative integer.')
  }
}
