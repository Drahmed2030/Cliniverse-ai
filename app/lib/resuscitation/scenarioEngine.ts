import type { ResuscitationScenario, ResuscitationScenarioActionDefinition } from './scenarioContract.ts'

// scenarioEngine — Batch 9. Pure, deterministic interpreter over a
// ResuscitationScenario manifest. No network calls, no timers started
// inside this module (the UI's own effect drives when checkTimeouts()
// is called), fully serializable EngineState. See scenarioContract.ts's
// header for the XState v5 evaluation this design is based on.

export type ResuscitationEngineStatus = 'running' | 'paused_for_feedback' | 'completed'

export interface ResuscitationHistoryEntry {
  phaseId: string
  actionId: string
  correct: boolean
  critical: boolean
}

export interface ResuscitationEngineState {
  scenarioId: string
  currentPhaseId: string
  lastCheckpointPhaseId: string
  criticalErrorsSinceCheckpoint: number
  status: ResuscitationEngineStatus
  /** The action that most recently caused a pause-for-feedback — cleared once retried. Used by rapidReplay.ts to present focused feedback. */
  pausedByAction: ResuscitationScenarioActionDefinition | null
  history: readonly ResuscitationHistoryEntry[]
  passed: boolean | null
}

function findPhase(scenario: ResuscitationScenario, phaseId: string) {
  const phase = scenario.phases.find(candidate => candidate.phaseId === phaseId)
  if (!phase) throw new Error(`Scenario ${scenario.scenarioId} has no phase ${phaseId}.`)
  return phase
}

export function createResuscitationEngineState(scenario: ResuscitationScenario): ResuscitationEngineState {
  return {
    scenarioId: scenario.scenarioId,
    currentPhaseId: scenario.initialPhaseId,
    lastCheckpointPhaseId: scenario.initialPhaseId,
    criticalErrorsSinceCheckpoint: 0,
    status: 'running',
    pausedByAction: null,
    history: [],
    passed: null,
  }
}

/**
 * Applies exactly one learner action. Throws on an illegal transition — an
 * actionId that does not belong to the current phase, or any action
 * submitted once the engine is no longer 'running' — rather than silently
 * ignoring it or guessing intent.
 */
export function applyResuscitationAction(
  scenario: ResuscitationScenario,
  state: ResuscitationEngineState,
  actionId: string,
): ResuscitationEngineState {
  if (state.status !== 'running') {
    throw new Error(`Illegal transition: engine for ${scenario.scenarioId} is '${state.status}', not accepting actions.`)
  }
  const phase = findPhase(scenario, state.currentPhaseId)
  const action = phase.actions.find(candidate => candidate.actionId === actionId)
  if (!action) {
    throw new Error(`Illegal transition: action '${actionId}' does not exist in phase '${phase.phaseId}' of ${scenario.scenarioId}.`)
  }

  const historyEntry: ResuscitationHistoryEntry = { phaseId: phase.phaseId, actionId, correct: action.correct, critical: action.critical }
  const history = [...state.history, historyEntry]

  if (!action.correct && action.critical) {
    const criticalErrorsSinceCheckpoint = state.criticalErrorsSinceCheckpoint + 1
    if (criticalErrorsSinceCheckpoint >= scenario.criticalErrorsBeforePause) {
      if (scenario.criticalErrorPolicy === 'end_scenario') {
        return { ...state, history, criticalErrorsSinceCheckpoint, status: 'completed', passed: false, pausedByAction: action }
      }
      return { ...state, history, criticalErrorsSinceCheckpoint, status: 'paused_for_feedback', pausedByAction: action }
    }
    return { ...state, history, criticalErrorsSinceCheckpoint, pausedByAction: action }
  }

  if (!action.transitionTo) {
    // A non-critical or correct-but-informational action that does not
    // advance the phase (e.g. "attach pads") — stays in place.
    return { ...state, history }
  }

  const nextPhase = findPhase(scenario, action.transitionTo)
  const isTerminal = nextPhase.actions.length === 0
  return {
    ...state,
    history,
    currentPhaseId: nextPhase.phaseId,
    lastCheckpointPhaseId: nextPhase.isCheckpoint ? nextPhase.phaseId : state.lastCheckpointPhaseId,
    criticalErrorsSinceCheckpoint: nextPhase.isCheckpoint ? 0 : state.criticalErrorsSinceCheckpoint,
    status: isTerminal ? 'completed' : state.status,
    passed: isTerminal ? true : state.passed,
  }
}

/**
 * Pure timeout check — the caller's own timer effect supplies elapsedMs
 * (time spent in the current phase); this module never starts a clock
 * itself. Deterministic: same (scenario, state, elapsedMs) always produces
 * the same result.
 */
export function checkResuscitationTimeouts(
  scenario: ResuscitationScenario,
  state: ResuscitationEngineState,
  elapsedMsInPhase: number,
): ResuscitationEngineState {
  if (state.status !== 'running') return state
  const window = scenario.timingWindows.find(candidate => candidate.phaseId === state.currentPhaseId)
  if (!window || elapsedMsInPhase < window.maxDurationMs) return state
  if (!window.timeoutTransitionTo) return state // flagged by the window's own existence, no forced transition

  const nextPhase = findPhase(scenario, window.timeoutTransitionTo)
  return {
    ...state,
    currentPhaseId: nextPhase.phaseId,
    lastCheckpointPhaseId: nextPhase.isCheckpoint ? nextPhase.phaseId : state.lastCheckpointPhaseId,
    criticalErrorsSinceCheckpoint: nextPhase.isCheckpoint ? 0 : state.criticalErrorsSinceCheckpoint,
  }
}
