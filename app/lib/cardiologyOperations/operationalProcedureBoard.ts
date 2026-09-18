import type { ClinicalWorkItem, ProcedureChecklistItem, ProcedureState } from './operationalCore'

// operationalProcedureBoard — Batch 10 Section 6. Supersedes the narrow
// "Surgical List" (app/lib/cardiology/types.ts's SurgicalListItem,
// area/checklist hardcoded to a surgical framing) with a Procedure Board
// capable of representing Cath Lab / PCI / EP / structural / surgery / TEE
// / transfer-procedure preparation. No clinical scheduling or hospital
// booking is implied — this remains a fictional simulation checklist.

export interface ProcedureReadiness {
  ready: boolean
  checklistComplete: boolean
  totalChecklistItems: number
  completedChecklistItems: number
  blockingWorkItemIds: readonly string[]
}

/** Derived, never a stored boolean a UI can flip independently — mirrors the handover-readiness requirement in Section 7, applied here to procedure prep. */
export function deriveProcedureReadiness(procedure: ProcedureState, workItems: readonly ClinicalWorkItem[]): ProcedureReadiness {
  const totalChecklistItems = procedure.checklist.length
  const completedChecklistItems = procedure.checklist.filter(item => item.complete).length
  const checklistComplete = totalChecklistItems > 0 && completedChecklistItems === totalChecklistItems

  const relatedWorkItems = workItems.filter(item => procedure.relatedWorkItemIds.includes(item.workItemId))
  const blockingWorkItemIds = relatedWorkItems
    .filter(item => item.status !== 'completed' && item.status !== 'cancelled')
    .map(item => item.workItemId)

  return {
    ready: checklistComplete && blockingWorkItemIds.length === 0,
    checklistComplete,
    totalChecklistItems,
    completedChecklistItems,
    blockingWorkItemIds,
  }
}

export function toggleChecklistItem(procedure: ProcedureState, key: string): ProcedureState {
  return {
    ...procedure,
    checklist: procedure.checklist.map((item): ProcedureChecklistItem =>
      item.key === key ? { ...item, complete: !item.complete } : item),
  }
}
