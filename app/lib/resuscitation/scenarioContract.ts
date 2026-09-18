import type { ResuscitationCompetencyDomainId, ResuscitationReviewStatus } from './resuscitationCore.ts'

// ScenarioContract — Batch 9 Section 6. A declarative scenario manifest/DSL
// — scenario logic (states, actions, transitions, timing, critical errors)
// lives entirely in data, never hardcoded into a React component. The
// interpreter (scenarioEngine.ts) is a pure function over this data.
//
// ── XState v5 evaluation (Section 7) ────────────────────────────────────
// Taken seriously this time, unlike Batch 7's simpler 4-stage linear
// machine: this engine genuinely has branching states, repeated cycles,
// timeouts, and a rewind/retry (rapid-replay) requirement. Each XState v5
// primitive that looked applicable was mapped to a plain-data/pure-
// function equivalent already required by this DSL:
//
//   XState v5 concept          -> This DSL's equivalent
//   guard function on a        -> ResuscitationTransition.guard, a pure
//     transition                  (state, action) => boolean predicate
//   `after` timeout transition -> ResuscitationTimingWindow, evaluated by
//                                  scenarioEngine.ts's checkTimeouts()
//                                  against elapsed time — the caller's own
//                                  timer effect drives when this runs, the
//                                  engine itself never starts a clock
//   history state (for         -> an explicit `checkpoint` snapshot of
//     rewind/replay)              EngineState, saved by
//                                  createCheckpoint()/restored by
//                                  rewindToCheckpoint() in rapidReplay.ts
//   parallel/compound states   -> NOT needed: every governed scenario in
//                                  this batch (Section 8) is a single
//                                  linear phase graph with cycles, not
//                                  concurrent regions
//   actor spawning             -> NOT needed: single-learner scenarios
//                                  only this batch (Section 18: team mode
//                                  is architecture-only, not implemented)
//
// DECISION: XState v5 was not adopted. Every capability actually required
// this batch (guards, timeouts, checkpoint/rewind, cycles) is expressible
// as plain data interpreted by pure functions, fully unit-testable without
// mocking an actor system, and consistent with this repo's established
// convention (Batch 7's same decision, Echo's echoStudySessionController.ts).
// This is revisited, not permanently closed: if a future batch needs
// genuinely parallel/concurrent regions (e.g. real multi-role Team Mode —
// Section 18 — where several learners' state machines interact), that is
// a legitimate reason to adopt XState v5 (or a real actor model) then,
// specifically because parallel regions are the one thing plain data/
// pure functions do NOT model cleanly.

export type ResuscitationCriticalErrorPolicy = 'pause_for_feedback' | 'end_scenario'

export interface ResuscitationScenarioActionDefinition {
  actionId: string
  label: string
  critical: boolean
  correct: boolean
  transitionTo: string | null
  /** Educational feedback shown only when this specific action is selected — required for every critical action, optional otherwise. */
  feedback: string | null
  competencyDomains: readonly ResuscitationCompetencyDomainId[]
  sourceRefs: readonly string[]
}

export interface ResuscitationScenarioPhase {
  phaseId: string
  label: string
  actions: readonly ResuscitationScenarioActionDefinition[]
  /** A phase a learner can rewind to after a critical error in a LATER phase — the Rapid Replay checkpoint set. Every phase that isn't itself a checkpoint rewinds to the nearest earlier checkpoint. */
  isCheckpoint: boolean
}

export interface ResuscitationTimingWindow {
  phaseId: string
  maxDurationMs: number
  /** What happens if the window is exceeded without a correct action — a phaseId to transition to, or null to just flag it (never silently ignored). */
  timeoutTransitionTo: string | null
  competencyDomain: ResuscitationCompetencyDomainId
}

export interface ResuscitationScenario {
  scenarioId: string
  title: string
  version: string
  intendedUse: string
  sourceRefs: readonly string[]
  reviewStatus: ResuscitationReviewStatus
  initialPhaseId: string
  objectives: readonly string[]
  phases: readonly ResuscitationScenarioPhase[]
  timingWindows: readonly ResuscitationTimingWindow[]
  criticalErrorPolicy: ResuscitationCriticalErrorPolicy
  /** How many critical errors a checkpoint segment tolerates before pausing for Rapid Replay feedback. Never "end scenario after 1 error" unless criticalErrorPolicy is explicitly 'end_scenario'. */
  criticalErrorsBeforePause: number
  feedbackTags: readonly string[]
  debriefTags: readonly string[]
  competencyDomains: readonly ResuscitationCompetencyDomainId[]
}

export function validateResuscitationScenario(scenario: ResuscitationScenario): void {
  if (!scenario.scenarioId.trim() || !scenario.title.trim()) throw new Error('Scenario identity is required.')
  if (!scenario.sourceRefs.length) throw new Error(`Scenario ${scenario.scenarioId} has no sourceRefs.`)
  if (!scenario.phases.length) throw new Error(`Scenario ${scenario.scenarioId} has no phases.`)

  const phaseIds = new Set(scenario.phases.map(phase => phase.phaseId))
  if (phaseIds.size !== scenario.phases.length) throw new Error(`Scenario ${scenario.scenarioId} has duplicate phaseIds.`)
  if (!phaseIds.has(scenario.initialPhaseId)) throw new Error(`Scenario ${scenario.scenarioId} initialPhaseId does not exist.`)
  if (![...phaseIds].some(id => scenario.phases.find(phase => phase.phaseId === id)?.isCheckpoint)) {
    throw new Error(`Scenario ${scenario.scenarioId} has no checkpoint phase — Rapid Replay would have nowhere to rewind to.`)
  }

  for (const phase of scenario.phases) {
    for (const action of phase.actions) {
      if (!action.actionId.trim()) throw new Error(`A blank actionId exists in phase ${phase.phaseId} of ${scenario.scenarioId}.`)
      if (action.transitionTo !== null && !phaseIds.has(action.transitionTo)) {
        throw new Error(`Action ${action.actionId} in ${scenario.scenarioId} transitions to an unknown phase: ${action.transitionTo}`)
      }
      if (action.critical && !action.correct && !action.feedback) {
        throw new Error(`Critical, incorrect action ${action.actionId} in ${scenario.scenarioId} has no feedback text — Rapid Replay needs it to explain the pause.`)
      }
      if (!action.sourceRefs.length) throw new Error(`Action ${action.actionId} in ${scenario.scenarioId} has no sourceRefs.`)
    }
  }

  for (const window of scenario.timingWindows) {
    if (!phaseIds.has(window.phaseId)) throw new Error(`Timing window in ${scenario.scenarioId} references an unknown phase: ${window.phaseId}`)
    if (window.timeoutTransitionTo !== null && !phaseIds.has(window.timeoutTransitionTo)) {
      throw new Error(`Timing window timeout in ${scenario.scenarioId} transitions to an unknown phase: ${window.timeoutTransitionTo}`)
    }
    if (window.maxDurationMs <= 0) throw new Error(`Timing window for phase ${window.phaseId} in ${scenario.scenarioId} must have a positive duration.`)
  }

  if (scenario.criticalErrorsBeforePause < 1) {
    throw new Error(`Scenario ${scenario.scenarioId} criticalErrorsBeforePause must be at least 1.`)
  }
}
