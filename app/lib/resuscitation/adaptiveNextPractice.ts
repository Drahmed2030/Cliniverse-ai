import type { ResuscitationProgressSignal } from './resuscitationCore.ts'
import { findResuscitationDrillsForDomain } from './curriculumContract.ts'

// adaptiveNextPractice — Batch 9 Section 13. weak competency -> targeted
// Code Lab drill -> Rapid Replay -> retry relevant segment -> mastery
// signal update. Adaptive selection chooses ONLY from
// RESUSCITATION_LEARNING_UNITS (governed, real content normalized by
// curriculumContract.ts) — it never invents a drill, never asks an LLM to
// generate one. A weak domain with no governed drill available simply
// recommends nothing, rather than fabricating a placeholder.

export const WEAK_COMPETENCY_THRESHOLD = 0.7

export interface NextPracticeRecommendation {
  competencyDomain: ResuscitationProgressSignal['competencyDomain']
  recommendedUnitId: string
  reason: string
}

export function recommendNextPractice(signals: readonly ResuscitationProgressSignal[]): NextPracticeRecommendation[] {
  const weakSignals = signals.filter(signal => signal.measurable && signal.score !== null && signal.score < WEAK_COMPETENCY_THRESHOLD)

  const recommendations: NextPracticeRecommendation[] = []
  for (const signal of weakSignals) {
    const drills = findResuscitationDrillsForDomain(signal.competencyDomain)
    if (!drills.length) continue // no governed drill exists for this domain yet — never fabricate one
    recommendations.push({
      competencyDomain: signal.competencyDomain,
      recommendedUnitId: drills[0].unitId,
      reason: `Scored ${Math.round((signal.score as number) * 100)}% on ${signal.competencyDomain.replace(/_/g, ' ')} — below the ${Math.round(WEAK_COMPETENCY_THRESHOLD * 100)}% mastery threshold.`,
    })
  }
  return recommendations
}
