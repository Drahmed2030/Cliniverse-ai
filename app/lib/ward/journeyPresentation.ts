import type { CaseStatus, CaseTemplate, Priority, TimelineEvent } from './types'

// Presentation rules for the learner-facing Ward journey. Pure and network-free so it can be unit-tested directly. Nothing
// here authors clinical content: it only decides which of the existing template decision points are complete enough to
// show, in what order, and how existing enum values are worded for a learner.

export type DecisionStage = CaseTemplate['decisionPoints'][number]

const STATUS_LABEL: Record<CaseStatus, string> = {
  arrived: 'Arrived',
  triaged: 'Triaged',
  workup_pending: 'Workup pending',
  decision_needed: 'Decision needed',
  admitted: 'Admitted',
  in_treatment: 'In treatment',
  awaiting_orders: 'Awaiting orders',
  awaiting_consult: 'Awaiting consult',
  ready_for_discharge: 'Ready for discharge',
  discharged: 'Discharged',
  transferred: 'Transferred',
}

export const PRIORITY_LABEL: Record<Priority, string> = { critical: 'Critical', urgent: 'Urgent', stable: 'Stable' }

export function caseStatusLabel(status: CaseStatus): string {
  return STATUS_LABEL[status] ?? status
}

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

// A decision point is learner-ready only when it is complete: a prompt, at least two options, and every option carrying an
// id, a label and the response text that explains it. Anything less is treated as unsupported rather than repaired.
export function isLearnerReadyStage(stage: DecisionStage | undefined): boolean {
  if (!stage || !hasText(stage.id) || !hasText(stage.prompt) || !Array.isArray(stage.options) || stage.options.length < 2) return false
  const ids = new Set<string>()
  for (const option of stage.options) {
    if (!option || !hasText(option.id) || !hasText(option.label) || !hasText(option.effect) || ids.has(option.id)) return false
    ids.add(option.id)
  }
  return true
}

// The stages are a sequence (later prompts assume earlier ones happened), so the learner sees the leading run of complete
// stages and stops at the first incomplete one. Skipping a broken stage would show a later prompt out of context.
export function learnerDecisionStages(template: CaseTemplate | undefined): DecisionStage[] {
  const stages: DecisionStage[] = []
  for (const stage of template?.decisionPoints ?? []) {
    if (!isLearnerReadyStage(stage)) break
    stages.push(stage)
  }
  return stages
}

// Earliest first, without mutating the record. Events with an unreadable time keep their supplied order after the dated ones.
export function orderedTimeline(events: readonly TimelineEvent[] | undefined): TimelineEvent[] {
  const time = (event: TimelineEvent) => { const value = Date.parse(event.at); return Number.isNaN(value) ? Infinity : value }
  return (events ?? []).map((event, index) => ({ event, index })).sort((a, b) => (time(a.event) - time(b.event)) || (a.index - b.index) || 0).map(entry => entry.event)
}
