import type { ResuscitationScenario } from './scenarioContract.ts'
import type { ResuscitationEngineState } from './scenarioEngine.ts'
import type { ResuscitationDebrief, ResuscitationEvent } from './resuscitationCore.ts'
import { deriveResuscitationPerformance, deriveOverallScore } from './performanceModel.ts'
import { recommendNextPractice } from './adaptiveNextPractice.ts'

// debriefEngine — Batch 9 Section 12. Structured REACTION / DESCRIPTION /
// ANALYSIS / SUMMARY / NEXT PRACTICE debrief, generated deterministically
// from event evidence (scenario manifest + engine history) — no LLM
// authority anywhere in this file. A future AI adapter may summarize
// ALREADY-VERIFIED events in friendlier language, but this function is
// the only place that decides what happened and how it's scored; an AI
// layer downstream could never declare competency itself.

function reactionText(state: ResuscitationEngineState): string {
  return state.passed
    ? 'Simulation completed. Take a moment before reviewing what happened.'
    : 'Simulation ended without completion. Take a moment before reviewing what happened — this is a learning tool, not an assessment of you as a person.'
}

function descriptionText(scenario: ResuscitationScenario, state: ResuscitationEngineState): string {
  const phasesVisited = new Set(state.history.map(entry => entry.phaseId)).size
  const criticalErrors = state.history.filter(entry => entry.critical && !entry.correct).length
  const totalActions = state.history.length
  return `You moved through ${phasesVisited} phase${phasesVisited === 1 ? '' : 's'} of "${scenario.title}", selecting ${totalActions} action${totalActions === 1 ? '' : 's'}, with ${criticalErrors} critical error${criticalErrors === 1 ? '' : 's'} recorded.`
}

function analysisText(scenario: ResuscitationScenario, state: ResuscitationEngineState): string[] {
  const signals = deriveResuscitationPerformance(scenario, state)
  return signals.map(signal => {
    const label = signal.competencyDomain.replace(/_/g, ' ')
    if (signal.score === null) return `${label}: no evidence recorded in this playthrough.`
    return `${label}: ${Math.round(signal.score * 100)}% (${signal.eventRefs.length} action${signal.eventRefs.length === 1 ? '' : 's'} evaluated).`
  })
}

function summaryText(scenario: ResuscitationScenario, state: ResuscitationEngineState): string {
  const signals = deriveResuscitationPerformance(scenario, state)
  const overall = deriveOverallScore(signals)
  const outcome = state.passed ? 'completed' : 'not completed'
  const scoreText = overall.totalScore === null ? 'no measurable score available' : `${Math.round(overall.totalScore * 100)}% across ${overall.measuredComponentCount} measured domain${overall.measuredComponentCount === 1 ? '' : 's'}`
  return `Scenario ${outcome}. Overall reference summary: ${scoreText}. This is educational simulation feedback, not a certification or competency declaration.`
}

export function generateResuscitationDebrief(
  scenario: ResuscitationScenario,
  state: ResuscitationEngineState,
  events: readonly ResuscitationEvent[],
): ResuscitationDebrief {
  const signals = deriveResuscitationPerformance(scenario, state)
  const nextPractice = recommendNextPractice(signals)

  return {
    schemaVersion: 1,
    sessionId: events[0]?.sessionId ?? 'unknown-session',
    scenarioId: scenario.scenarioId,
    reaction: reactionText(state),
    description: descriptionText(scenario, state),
    analysis: analysisText(scenario, state),
    summary: summaryText(scenario, state),
    nextPractice: nextPractice.map(recommendation => ({ competencyDomain: recommendation.competencyDomain, recommendedUnitId: recommendation.recommendedUnitId })),
    eventRefs: events.map(event => event.eventId),
    generatedAt: new Date().toISOString(),
  }
}
