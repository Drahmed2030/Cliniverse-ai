import type { ClinicalWorkItem, HandoverState } from './operationalCore'

// operationalHandover — Batch 10 Section 7. Preserves the strong existing
// readiness logic (app/components/ward/cardiology/StructuredHandover.tsx:
// ready = note.trim().length > 0 && pendingReviewed && ownerConfirmed &&
// simulationConfirmed) but makes it a pure, reusable, testable derivation
// instead of inline component state — and adds the "unresolved items
// surfaced" requirement the legacy version didn't structurally enforce
// (it only asked a human to self-report pendingReviewed, with no check
// against the actual work-item ledger).
//
// A UI must NEVER set `ready` directly — deriveHandoverReadiness is the
// only place `ready` is computed, and it always returns the exact
// blockers, never a single collapsed score (Section 18's requirement).

export interface HandoverReadiness {
  ready: boolean
  blockers: readonly string[]
  unresolvedWorkItemIds: readonly string[]
}

export function deriveHandoverReadiness(handover: HandoverState, workItems: readonly ClinicalWorkItem[]): HandoverReadiness {
  const relatedWorkItems = workItems.filter(item => handover.relatedWorkItemIds.includes(item.workItemId))
  const unresolvedWorkItemIds = relatedWorkItems
    .filter(item => item.status !== 'completed' && item.status !== 'cancelled')
    .map(item => item.workItemId)

  const blockers: string[] = []
  if (!handover.note.trim()) blockers.push('missing_note')
  if (!handover.requiredWorkReviewed) blockers.push('required_work_not_reviewed')
  if (!handover.ownerConfirmed) blockers.push('owner_not_confirmed')
  if (!handover.simulationConfirmed) blockers.push('simulation_confirmation_missing')
  if (unresolvedWorkItemIds.length > 0) blockers.push('unresolved_work_items')

  return { ready: blockers.length === 0, blockers, unresolvedWorkItemIds }
}
