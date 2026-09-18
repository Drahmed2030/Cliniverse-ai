import type { ResuscitationScenario } from './scenarioContract.ts'
import type { ResuscitationEngineState } from './scenarioEngine.ts'

// rapidReplay — Batch 9 Section 9. scenario segment -> critical error ->
// pause -> focused feedback -> rewind to checkpoint -> retry -> continue
// after mastery. Never ends the whole scenario after one error unless the
// scenario's own criticalErrorPolicy explicitly says 'end_scenario' — see
// scenarioEngine.ts's applyResuscitationAction, which is the only place
// that decision is made, driven entirely by manifest data.

export interface RapidReplayFeedback {
  actionLabel: string
  feedback: string
  sourceRefs: readonly string[]
}

/** Returns the focused, source-bound feedback for the error that just paused the segment. Null if the engine isn't currently paused. */
export function presentRapidReplayFeedback(state: ResuscitationEngineState): RapidReplayFeedback | null {
  if (state.status !== 'paused_for_feedback' || !state.pausedByAction) return null
  return {
    actionLabel: state.pausedByAction.label,
    feedback: state.pausedByAction.feedback ?? '',
    sourceRefs: state.pausedByAction.sourceRefs,
  }
}

/**
 * Rewinds to the last checkpoint phase and clears the error count for that
 * segment — the learner retries from the checkpoint, not from the very
 * start of the scenario, and not from the exact failed action either
 * (matching "rewind to checkpoint", not "undo one action").
 */
export function rewindToCheckpoint(scenario: ResuscitationScenario, state: ResuscitationEngineState): ResuscitationEngineState {
  if (state.status !== 'paused_for_feedback') {
    throw new Error(`Illegal transition: cannot rewind a ${scenario.scenarioId} engine that is not paused_for_feedback.`)
  }
  return {
    ...state,
    currentPhaseId: state.lastCheckpointPhaseId,
    criticalErrorsSinceCheckpoint: 0,
    status: 'running',
    pausedByAction: null,
  }
}

/** True once the learner has cleared the checkpoint segment without pausing again — "mastery" for Rapid Replay purposes is simply "no longer paused, and has progressed past the checkpoint it rewound to." Kept as an explicit, testable predicate rather than an implicit UI assumption. */
export function hasResumedAfterRetry(state: ResuscitationEngineState): boolean {
  return state.status === 'running' && state.currentPhaseId !== state.lastCheckpointPhaseId
}
