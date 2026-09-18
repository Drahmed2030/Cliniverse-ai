import type { ClinicalWorkItem, EscalationState, HandoverState, ProcedureState } from './operationalCore'
import { isWorkItemOverdue, isWorkItemUnowned } from './operationalWorkItems.ts'
import { deriveHandoverReadiness } from './operationalHandover.ts'
import { deriveProcedureReadiness } from './operationalProcedureBoard.ts'

// operationalEscalation — Batch 10 Section 8. Operational workflow
// signaling ONLY. This module must NEVER infer patient deterioration,
// diagnostic severity, or treatment urgency — every EscalationState it
// produces sets clinicalSeverityClaimed: false (see operationalCore.ts's
// own header on that field), and every reason below is a structural fact
// about the WORKFLOW (missing owner, missed due date, unresolved
// checklist/result), never a read of clinical data.

export function deriveEscalations(
  encounterId: string,
  workItems: readonly ClinicalWorkItem[],
  procedures: readonly ProcedureState[],
  handover: HandoverState | null,
  nowIso: string,
): EscalationState[] {
  const escalations: EscalationState[] = []
  const encounterWorkItems = workItems.filter(item => item.encounterId === encounterId)

  for (const item of encounterWorkItems) {
    if (isWorkItemUnowned(item)) {
      escalations.push(makeEscalation(encounterId, 'no_owner', item.workItemId, nowIso))
    }
    if (isWorkItemOverdue(item, nowIso)) {
      escalations.push(makeEscalation(encounterId, 'overdue_work_item', item.workItemId, nowIso))
    }
    if (item.kind === 'result_review' && item.status !== 'completed' && item.status !== 'cancelled') {
      escalations.push(makeEscalation(encounterId, 'unresolved_result', item.workItemId, nowIso))
    }
  }

  for (const procedure of procedures.filter(candidate => candidate.encounterId === encounterId)) {
    const readiness = deriveProcedureReadiness(procedure, workItems)
    if (!readiness.ready) {
      escalations.push(makeEscalation(encounterId, 'incomplete_procedure_prep', null, nowIso))
    }
  }

  if (handover && handover.encounterId === encounterId) {
    const readiness = deriveHandoverReadiness(handover, workItems)
    if (!readiness.ready) {
      escalations.push(makeEscalation(encounterId, 'incomplete_handover', null, nowIso))
    }
  }

  return escalations
}

function makeEscalation(
  encounterId: string,
  reason: EscalationState['reason'],
  relatedWorkItemId: string | null,
  raisedAt: string,
): EscalationState {
  return {
    escalationId: `OP-ESC-${encounterId}-${reason}-${relatedWorkItemId ?? 'encounter'}`,
    encounterId,
    reason,
    raisedAt,
    relatedWorkItemId,
    acknowledgedAt: null,
    clinicalSeverityClaimed: false,
  }
}
