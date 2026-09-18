import type { EchoAssessmentResult, EchoConfidence } from './echoAssessmentContract.ts'

// EchoConfidenceCalibration — Batch 6. Purely additive over the existing
// EchoAssessmentResult (already carries correct + confidence separately) —
// no change to echoMasteryEngine.ts or the global mastery contract. This
// classifies a single result into the four quadrants the batch asked for;
// echoMasteryEngine.ts's own numeric confidenceCalibration score is
// untouched and this does not replace it.
//
// EchoConfidence is a 1-5 scale (unchanged). The four required quadrants
// are correct/incorrect x high/low confidence — a 1-5 scale doesn't map
// onto a clean binary, so band 3 ("medium") is deliberately treated as
// "not high" for quadrant purposes only; confidenceBand itself still
// reports low/medium/high faithfully for display.

export type EchoConfidenceBand = 'low' | 'medium' | 'high'
export type EchoCalibrationQuadrant =
  | 'correct_high_confidence'
  | 'correct_low_confidence'
  | 'incorrect_low_confidence'
  | 'incorrect_high_confidence'

export function toEchoConfidenceBand(confidence: EchoConfidence): EchoConfidenceBand {
  if (confidence <= 2) return 'low'
  if (confidence === 3) return 'medium'
  return 'high'
}

export interface EchoCalibrationSignal {
  taskId: string
  skillId: string
  correct: boolean
  confidence: EchoConfidence
  confidenceBand: EchoConfidenceBand
  quadrant: EchoCalibrationQuadrant
  /** True only for incorrect + high confidence — the highest-priority misconception signal, per Batch 6's spec. */
  isMisconceptionPriority: boolean
}

export function classifyEchoCalibration(result: EchoAssessmentResult): EchoCalibrationSignal {
  const confidenceBand = toEchoConfidenceBand(result.confidence)
  const highConfidence = confidenceBand === 'high'
  const quadrant: EchoCalibrationQuadrant = result.correct
    ? highConfidence ? 'correct_high_confidence' : 'correct_low_confidence'
    : highConfidence ? 'incorrect_high_confidence' : 'incorrect_low_confidence'

  return {
    taskId: result.taskId,
    skillId: result.skillId,
    correct: result.correct,
    confidence: result.confidence,
    confidenceBand,
    quadrant,
    isMisconceptionPriority: quadrant === 'incorrect_high_confidence',
  }
}

export interface EchoCalibrationSummary {
  total: number
  counts: Record<EchoCalibrationQuadrant, number>
  misconceptionPriorityCount: number
}

export function summarizeEchoCalibration(signals: readonly EchoCalibrationSignal[]): EchoCalibrationSummary {
  const counts: Record<EchoCalibrationQuadrant, number> = {
    correct_high_confidence: 0,
    correct_low_confidence: 0,
    incorrect_low_confidence: 0,
    incorrect_high_confidence: 0,
  }
  for (const signal of signals) counts[signal.quadrant] += 1
  return { total: signals.length, counts, misconceptionPriorityCount: counts.incorrect_high_confidence }
}
