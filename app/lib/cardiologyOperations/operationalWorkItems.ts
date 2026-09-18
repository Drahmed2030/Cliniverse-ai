import type {
  ClinicalWorkItem,
  ClinicalWorkItemKind,
  ClinicalWorkItemPriority,
  ClinicalWorkItemStatus,
  OperationalEvent,
  OperationalEvidenceReference,
  OperationalRoleId,
  OwnershipAssignment,
} from './operationalCore'
import { appendOperationalEvent, createOperationalEvent, type OperationalLedgerResult } from './operationalEventLedger.ts'

// operationalWorkItems — Batch 10 Section 4. Generalizes the narrow
// "Notes & Orders" concept (app/lib/cardiology/types.ts's OperationalTask,
// kinds 'note' | 'order') into a wider Work Queue. Never implies Cliniverse
// places, approves, or transmits a clinical order — a ClinicalWorkItem
// records operational acknowledgement/completion state ONLY, exactly like
// the legacy contract it generalizes.

const WORK_ITEM_KINDS: readonly ClinicalWorkItemKind[] = [
  'investigation', 'result_review', 'documentation', 'referral',
  'procedure_prep', 'follow_up', 'handover', 'coordination', 'escalation',
]

export function isKnownWorkItemKind(kind: string): kind is ClinicalWorkItemKind {
  return (WORK_ITEM_KINDS as readonly string[]).includes(kind)
}

export function createClinicalWorkItem(params: {
  encounterId: string
  index: number
  kind: ClinicalWorkItemKind
  priority: ClinicalWorkItemPriority
  createdAt: string
  dueAt?: string | null
  sourceRefs: readonly string[]
}): ClinicalWorkItem {
  return {
    workItemId: `OP-WI-${params.encounterId}-${String(params.index).padStart(3, '0')}`,
    encounterId: params.encounterId,
    kind: params.kind,
    status: 'open',
    owner: null,
    priority: params.priority,
    createdAt: params.createdAt,
    dueAt: params.dueAt ?? null,
    sourceRefs: params.sourceRefs,
    relatedEventRefs: [],
    reviewStatus: 'simulation_only',
  }
}

/** Ownership changes must produce an event (Section 5) — this is the only sanctioned way to move a work item into 'assigned'. */
export function assignOwner(
  history: readonly OperationalEvent[],
  workItem: ClinicalWorkItem,
  role: OperationalRoleId,
  assignedBy: OperationalRoleId,
  occurredAt: string,
  evidence: OperationalEvidenceReference,
): { ledger: OperationalLedgerResult; workItem: ClinicalWorkItem } {
  const event = createOperationalEvent({
    history,
    encounterId: workItem.encounterId,
    type: 'work_item.assigned',
    actorRole: assignedBy,
    actorId: `SIM-ACTOR-${assignedBy.toUpperCase()}`,
    occurredAt,
    source: { system: 'cardiology-operations-simulation', recordId: workItem.workItemId },
    evidence,
    payload: { workItemId: workItem.workItemId, role },
  })
  const ledger = appendOperationalEvent(history, event)
  if (!ledger.ok) return { ledger, workItem }

  const owner: OwnershipAssignment = { role, assignedAt: occurredAt, assignedBy, eventRef: event.eventId }
  return {
    ledger,
    workItem: { ...workItem, owner, status: workItem.status === 'open' ? 'assigned' : workItem.status, relatedEventRefs: [...workItem.relatedEventRefs, event.eventId] },
  }
}

const STATUS_ORDER: readonly ClinicalWorkItemStatus[] = ['open', 'assigned', 'acknowledged', 'completed']

export function advanceWorkItemStatus(
  history: readonly OperationalEvent[],
  workItem: ClinicalWorkItem,
  occurredAt: string,
  evidence: OperationalEvidenceReference,
): { ledger: OperationalLedgerResult; workItem: ClinicalWorkItem } {
  if (workItem.status === 'completed' || workItem.status === 'cancelled') {
    return { ledger: { ok: true, value: history }, workItem }
  }
  const currentIndex = STATUS_ORDER.indexOf(workItem.status)
  const nextStatus = STATUS_ORDER[Math.min(currentIndex + 1, STATUS_ORDER.length - 1)]
  const type = nextStatus === 'acknowledged' ? 'work_item.acknowledged' : nextStatus === 'completed' ? 'work_item.completed' : 'work_item.assigned'
  const actorRole = workItem.owner?.role ?? 'coordination'

  const event = createOperationalEvent({
    history,
    encounterId: workItem.encounterId,
    type,
    actorRole,
    actorId: `SIM-ACTOR-${actorRole.toUpperCase()}`,
    occurredAt,
    source: { system: 'cardiology-operations-simulation', recordId: workItem.workItemId },
    evidence,
    payload: { workItemId: workItem.workItemId, status: nextStatus },
  })
  const ledger = appendOperationalEvent(history, event)
  if (!ledger.ok) return { ledger, workItem }

  return { ledger, workItem: { ...workItem, status: nextStatus, relatedEventRefs: [...workItem.relatedEventRefs, event.eventId] } }
}

/** Derived, never stored — a work item is overdue purely as a function of (dueAt, now, status), exactly the "do not store ordersOpen=2" guidance in Section 2. */
export function isWorkItemOverdue(workItem: ClinicalWorkItem, nowIso: string): boolean {
  if (!workItem.dueAt) return false
  if (workItem.status === 'completed' || workItem.status === 'cancelled') return false
  return Date.parse(workItem.dueAt) < Date.parse(nowIso)
}

export function isWorkItemUnowned(workItem: ClinicalWorkItem): boolean {
  return workItem.owner === null && workItem.status !== 'completed' && workItem.status !== 'cancelled'
}

/** Every derived count in Sections 2/14/17 goes through this — never a stored counter. */
export function countOpenWorkItems(workItems: readonly ClinicalWorkItem[], encounterId?: string): number {
  return workItems.filter(item => (encounterId ? item.encounterId === encounterId : true) && item.status !== 'completed' && item.status !== 'cancelled').length
}
