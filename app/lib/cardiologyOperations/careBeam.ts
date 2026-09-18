import type { ClinicalWorkItem, ClinicalWorkItemKind, EscalationState, OperationalEvent, OperationalRoleId } from './operationalCore'

// careBeam — Batch 10 Section 13. A pathway-agnostic projection of the
// operational event ledger — it stores NO independent state of its own
// (Section 13's explicit requirement). A caller supplies an ordered list
// of CareBeamStageDefinition (e.g. the QAPAS Referral -> Review ->
// Acceptance -> Coordination -> Procedure -> Handover -> Closure profile
// in nexusOperationalProfile.ts), and deriveCareBeam reads that stage
// list plus the real event/work-item/escalation arrays to produce the
// beam. Color/state communicates OPERATIONAL state only (completed,
// current, pending, blocked) — never an unverified clinical severity
// claim (see operationalEscalation.ts's clinicalSeverityClaimed: false).

export type CareBeamNodeState = 'completed' | 'current' | 'pending' | 'blocked'

export interface CareBeamStageDefinition {
  stageId: string
  label: string
  matches: (event: OperationalEvent) => boolean
  /** If set, the node's openWorkItemCount only counts these kinds; otherwise it counts every open work item on the encounter. */
  workItemKinds?: readonly ClinicalWorkItemKind[]
  /** If a not-yet-acknowledged escalation with this reason exists for the encounter while this stage would otherwise be 'current', the stage is 'blocked' instead. */
  blockingEscalationReason?: EscalationState['reason']
}

export interface CareBeamNode {
  stageId: string
  label: string
  state: CareBeamNodeState
  owner: OperationalRoleId | null
  reachedAt: string | null
  openWorkItemCount: number
  eventRefs: readonly string[]
}

export function deriveCareBeam(
  stages: readonly CareBeamStageDefinition[],
  encounterId: string,
  events: readonly OperationalEvent[],
  workItems: readonly ClinicalWorkItem[],
  escalations: readonly EscalationState[],
): CareBeamNode[] {
  const encounterEvents = [...events.filter(event => event.encounterId === encounterId)].sort((a, b) => a.sequence - b.sequence)
  const encounterWorkItems = workItems.filter(item => item.encounterId === encounterId)
  const activeEscalationReasons = new Set(
    escalations.filter(esc => esc.encounterId === encounterId && !esc.acknowledgedAt).map(esc => esc.reason),
  )

  const reachedAtStage = stages.map(stage => {
    for (let i = encounterEvents.length - 1; i >= 0; i--) {
      if (stage.matches(encounterEvents[i])) return encounterEvents[i]
    }
    return null
  })

  let lastReachedIndex = -1
  for (let i = 0; i < stages.length; i++) {
    if (reachedAtStage[i]) lastReachedIndex = i
  }

  return stages.map((stage, index) => {
    const reachingEvent = reachedAtStage[index]
    const relevantWorkItems = stage.workItemKinds
      ? encounterWorkItems.filter(item => stage.workItemKinds!.includes(item.kind))
      : encounterWorkItems
    const openWorkItemCount = relevantWorkItems.filter(item => item.status !== 'completed' && item.status !== 'cancelled').length

    let state: CareBeamNodeState
    if (index < lastReachedIndex) state = 'completed'
    else if (index === lastReachedIndex) state = lastReachedIndex === stages.length - 1 ? 'completed' : 'current'
    else if (index === lastReachedIndex + 1 && stage.blockingEscalationReason && activeEscalationReasons.has(stage.blockingEscalationReason)) state = 'blocked'
    else state = 'pending'

    return {
      stageId: stage.stageId,
      label: stage.label,
      state,
      owner: reachingEvent?.actorRole ?? null,
      reachedAt: reachingEvent?.occurredAt ?? null,
      openWorkItemCount,
      eventRefs: reachingEvent ? [reachingEvent.eventId] : [],
    }
  })
}
