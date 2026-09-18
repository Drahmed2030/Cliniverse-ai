// ResuscitationCore — Batch 9. Shared typed domain layer unifying the
// resuscitation learning stack: LEARN -> PRACTICE -> SIMULATE -> REPLAY ->
// DEBRIEF -> PROGRESS. "Shared Core + Specialized Engines" — this file
// defines the vocabulary every specialized engine (curriculum, scenario
// engine, rapid replay, debrief, adaptive practice, receipts) imports from,
// but none of those engines are merged into one component here.

export type ResuscitationReviewStatus = 'reviewed' | 'pending_clinical_review'

/** A single normalized unit of curriculum content — a BLS/ACLS lesson or a Code Lab drill, adapted from its own source-of-truth file, never duplicated content. */
export interface ResuscitationLearningUnit {
  unitId: string
  kind: 'lesson' | 'drill'
  track: 'bls' | 'acls' | 'megacode'
  title: string
  objectives: readonly string[]
  sourceRefs: readonly string[]
  competencyDomains: readonly ResuscitationCompetencyDomainId[]
  /** Drill links / simulation prerequisites — other unitIds this one prepares a learner for. */
  drillLinks: readonly string[]
  simulationPrerequisites: readonly string[]
  reviewStatus: ResuscitationReviewStatus
}

// See competencyDomains.ts for the full, single source of truth on which
// domains exist and whether each is currently measurable.
export type ResuscitationCompetencyDomainId =
  | 'recognition'
  | 'sequence'
  | 'rhythm_interpretation'
  | 'timing'
  | 'defibrillation_sequence'
  | 'medication_timing'
  | 'reassessment'
  | 'post_rosc'
  | 'team_leadership'
  | 'closed_loop_communication'

export type ResuscitationActorType = 'learner' | 'system' | 'reviewer'

/** A single append-only, hash-chained event — the resuscitation-specific event vocabulary. Chaining/hashing itself is provided by app/lib/receipts/canonicalHash.ts (Batch 7 infrastructure), reused, not reinvented. */
export interface ResuscitationEvent {
  schemaVersion: 1
  eventId: string
  sessionId: string
  eventType: ResuscitationEventType
  occurredAt: string
  scenarioId: string | null
  actorType: ResuscitationActorType
  payload: Readonly<Record<string, string | number | boolean | null>>
  previousEventHash: string
  eventHash: string
}

export const RESUSCITATION_EVENT_TYPES = [
  'simulation.started',
  'action.selected',
  'critical_error.detected',
  'segment.paused',
  'feedback.presented',
  'segment.retried',
  'segment.passed',
  'scenario.completed',
  'debrief.started',
  'debrief.completed',
] as const
export type ResuscitationEventType = typeof RESUSCITATION_EVENT_TYPES[number]

/** Shared receipt family — an adapter over Batch 7's tamper-evident receipt primitive (app/lib/receipts/canonicalHash.ts), never a competing schema. See evidenceReceipt.ts. */
export interface ResuscitationEvidenceReceipt {
  schemaVersion: 1
  receiptId: string
  receiptHash: string
  subtype: 'lesson' | 'drill' | 'simulation' | 'pathway'
  sourceRefs: readonly string[]
  eventRefs: readonly string[]
  verification: 'tamper-evident-structural-receipt'
  humanReviewRequired: true
}

export interface ResuscitationAction {
  actionId: string
  label: string
  /** Whether missing/getting this action wrong is a critical error for the scenario's own governed answer key — never inferred, always declared per action. */
  critical: boolean
  correct: boolean
  /** The phase/state this action transitions to when selected. Null means "stay in the current phase" (e.g. an informational action). */
  transitionTo: string | null
  sourceRefs: readonly string[]
}

export interface ResuscitationDebrief {
  schemaVersion: 1
  sessionId: string
  scenarioId: string
  reaction: string
  description: string
  analysis: readonly string[]
  summary: string
  nextPractice: readonly { competencyDomain: ResuscitationCompetencyDomainId; recommendedUnitId: string }[]
  eventRefs: readonly string[]
  generatedAt: string
}

export interface ResuscitationProgressSignal {
  competencyDomain: ResuscitationCompetencyDomainId
  measurable: boolean
  /** 0-1. Only meaningful when measurable is true. */
  score: number | null
  evidenceBasis: string
  eventRefs: readonly string[]
  reviewStatus: ResuscitationReviewStatus
}

export type { ResuscitationScenario, ResuscitationScenarioPhase } from './scenarioContract.ts'
