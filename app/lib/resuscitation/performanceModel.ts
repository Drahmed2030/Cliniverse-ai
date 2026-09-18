import type { ResuscitationScenario } from './scenarioContract.ts'
import type { ResuscitationEngineState } from './scenarioEngine.ts'
import type { ResuscitationProgressSignal } from './resuscitationCore.ts'
import { getResuscitationCompetencyDomain } from './competencyDomains.ts'

// performanceModel — Batch 9 Section 11. Replaces MegacodeRunner.tsx's
// single crude 0-100 score with multidimensional performance. Every
// metric declares measurable/evidenceBasis/eventRefs/reviewStatus — never
// a bare number. A secondary total score exists but never hides the
// component metrics (see deriveOverallScore, which is additive on top of,
// not a replacement for, deriveResuscitationPerformance's output).

export function deriveResuscitationPerformance(
  scenario: ResuscitationScenario,
  state: ResuscitationEngineState,
): ResuscitationProgressSignal[] {
  return scenario.competencyDomains.map((domainId): ResuscitationProgressSignal => {
    const domain = getResuscitationCompetencyDomain(domainId)
    const relevantEntries = state.history.filter(entry => {
      const phase = scenario.phases.find(candidate => candidate.phaseId === entry.phaseId)
      const action = phase?.actions.find(candidate => candidate.actionId === entry.actionId)
      return action?.competencyDomains.includes(domainId) ?? false
    })

    if (relevantEntries.length === 0) {
      return {
        competencyDomain: domainId,
        measurable: domain.measurable,
        score: null,
        evidenceBasis: `${domain.evidenceBasis} (no matching action occurred in this playthrough yet)`,
        eventRefs: [],
        reviewStatus: 'pending_clinical_review',
      }
    }

    const correctCount = relevantEntries.filter(entry => entry.correct).length
    return {
      competencyDomain: domainId,
      measurable: domain.measurable,
      score: Math.round((correctCount / relevantEntries.length) * 100) / 100,
      evidenceBasis: domain.evidenceBasis,
      eventRefs: relevantEntries.map(entry => `${entry.phaseId}:${entry.actionId}`),
      reviewStatus: 'pending_clinical_review',
    }
  })
}

export interface ResuscitationOverallScore {
  totalScore: number | null
  componentCount: number
  measuredComponentCount: number
}

/** A secondary summary only — deriveResuscitationPerformance's per-domain signals remain the source of truth and must always be shown alongside this, never replaced by it. */
export function deriveOverallScore(signals: readonly ResuscitationProgressSignal[]): ResuscitationOverallScore {
  const measured = signals.filter(signal => signal.measurable && signal.score !== null)
  if (!measured.length) return { totalScore: null, componentCount: signals.length, measuredComponentCount: 0 }
  const average = measured.reduce((sum, signal) => sum + (signal.score as number), 0) / measured.length
  return { totalScore: Math.round(average * 100) / 100, componentCount: signals.length, measuredComponentCount: measured.length }
}
