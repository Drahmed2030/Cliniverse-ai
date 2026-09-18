import type { ClinicalWorkItem, EscalationState, HandoverState, OperationalEncounter, OperationalRoleId, ProcedureState } from './operationalCore'
import { deriveHandoverReadiness } from './operationalHandover.ts'
import { deriveProcedureReadiness } from './operationalProcedureBoard.ts'

// operationalPulse — Batch 10 Section 14. Every count below is derived at
// read time from the real arrays — there is no OperationalPulseState
// stored anywhere, so it can never drift out of sync with the ledger
// (the same "do not store ordersOpen=2" principle as Section 2, applied
// to the top-level summary strip).

export interface OperationalPulse {
  activeEncounters: number
  openWorkItems: number
  blockedOrExceptionItems: number
  handoverReadyEncounters: number
  procedureReadyEncounters: number
}

export function derivePulse(
  encounters: readonly OperationalEncounter[],
  workItems: readonly ClinicalWorkItem[],
  handovers: readonly HandoverState[],
  procedures: readonly ProcedureState[],
  escalations: readonly EscalationState[],
): OperationalPulse {
  const activeEncounters = encounters.filter(encounter => encounter.status === 'active').length
  const openWorkItems = workItems.filter(item => item.status !== 'completed' && item.status !== 'cancelled').length
  const blockedOrExceptionItems = escalations.filter(esc => !esc.acknowledgedAt).length

  const handoverReadyEncounters = encounters.filter(encounter => {
    const handover = handovers.find(candidate => candidate.encounterId === encounter.encounterId)
    return handover ? deriveHandoverReadiness(handover, workItems).ready : false
  }).length

  const procedureReadyEncounters = encounters.filter(encounter =>
    procedures
      .filter(procedure => procedure.encounterId === encounter.encounterId)
      .some(procedure => deriveProcedureReadiness(procedure, workItems).ready),
  ).length

  return { activeEncounters, openWorkItems, blockedOrExceptionItems, handoverReadyEncounters, procedureReadyEncounters }
}

// ── Ownership view (Section 17) ──────────────────────────────────────────

export interface OwnershipSummary {
  role: OperationalRoleId
  openItems: number
  acknowledged: number
  unresolved: number
}

/** Never a "clinical performance score" (Section 17) — plain workload counts by role, derived from the same work-item array the rest of the module uses. */
export function deriveOwnershipSummary(workItems: readonly ClinicalWorkItem[]): OwnershipSummary[] {
  const roles = new Set<OperationalRoleId>()
  for (const item of workItems) if (item.owner) roles.add(item.owner.role)

  return [...roles].sort().map(role => {
    const owned = workItems.filter(item => item.owner?.role === role)
    return {
      role,
      openItems: owned.filter(item => item.status !== 'completed' && item.status !== 'cancelled').length,
      acknowledged: owned.filter(item => item.status === 'acknowledged').length,
      unresolved: owned.filter(item => item.status === 'open' || item.status === 'assigned').length,
    }
  })
}

// ── Exception Lens (Section 19) ──────────────────────────────────────────

export interface ExceptionLensEntry {
  workItemId: string | null
  encounterId: string
  reason: EscalationState['reason']
  raisedAt: string
}

/** Operational attention management only — no autonomous clinical escalation. Simply the unacknowledged EscalationState list, reshaped for display. */
export function deriveExceptionLens(escalations: readonly EscalationState[]): ExceptionLensEntry[] {
  return escalations
    .filter(esc => !esc.acknowledgedAt)
    .map(esc => ({ workItemId: esc.relatedWorkItemId, encounterId: esc.encounterId, reason: esc.reason, raisedAt: esc.raisedAt }))
    .sort((a, b) => Date.parse(a.raisedAt) - Date.parse(b.raisedAt))
}
