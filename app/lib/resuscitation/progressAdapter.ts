import type { ResuscitationProgressSignal } from './resuscitationCore.ts'

// progressAdapter — Batch 9 Section 21. Maps lesson/drill/simulation/
// rapid-replay results into shared competency signals via an ADAPTER, not
// by mutating app/lib/competency/echoMasteryEngine.ts or any other
// existing mastery contract. Mirrors that file's band vocabulary
// (novice/developing/proficient/mastered) for a consistent Progress UI
// feel, but is its own independent type — Echo's mastery engine is
// untouched by this batch.

export type ResuscitationMasteryBand = 'novice' | 'developing' | 'proficient' | 'mastered'

export function deriveResuscitationMasteryBand(score: number): ResuscitationMasteryBand {
  if (score >= 0.9) return 'mastered'
  if (score >= 0.75) return 'proficient'
  if (score >= 0.5) return 'developing'
  return 'novice'
}

export interface ResuscitationProgressSummary {
  competencyDomain: ResuscitationProgressSignal['competencyDomain']
  band: ResuscitationMasteryBand | 'not_yet_measured'
  score: number | null
  reviewStatus: ResuscitationProgressSignal['reviewStatus']
}

/** Pure projection from a set of progress signals (however many simulation/drill attempts produced them) into a per-domain summary a Progress surface can render — never mutates the signals or any external mastery store. */
export function summarizeResuscitationProgress(signals: readonly ResuscitationProgressSignal[]): ResuscitationProgressSummary[] {
  return signals.map(signal => ({
    competencyDomain: signal.competencyDomain,
    band: signal.score === null ? 'not_yet_measured' : deriveResuscitationMasteryBand(signal.score),
    score: signal.score,
    reviewStatus: signal.reviewStatus,
  }))
}
