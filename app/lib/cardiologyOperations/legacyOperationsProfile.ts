import type { CardiologyCase, HandoverRecord, OperationalTask, SurgicalListItem } from '../cardiology/types'
import type { ClinicalWorkItem, HandoverState, OperationalEncounter, OperationalRoleId, ProcedureBoardArea, ProcedureState } from './operationalCore'

// legacyOperationsProfile — Batch 10 Section 1/2. The existing 5-module
// Cardiology Operations simulation (app/lib/cardiology/types.ts —
// CardiologyCase / OperationalTask / SurgicalListItem / HandoverRecord)
// becomes a VIEW over the shared Operational Core through this adapter,
// exactly the way nexusOperationalProfile.ts does for QAPAS-DIRECT.
// Neither app/lib/cardiology/types.ts nor useCardiologyOperations.ts is
// deleted or rewritten (ADAPT, not SUPERSEDE — see
// docs/CARDIOLOGY_OPERATIONS_V2.md's classification table); this file only
// projects their existing state into the new shape so Care Beam,
// Operational Pulse, Ownership, and Exception Lens can render the legacy
// simulation too.
//
// Two documented, honest simplifications (not fabrications — see each
// function's comment): the legacy "shiftOwner"/task.owner fields are free
// shift-team names ("Night Team A"), not the new functional role
// vocabulary, so they map to the single generic 'coordination' role rather
// than a guessed clinical role; and SurgicalListItem.area is a free string
// ("CARDIAC-OR-SIM") read heuristically into the new ProcedureBoardArea
// enum rather than asserted precisely.

const LEGACY_OWNER_ROLE: OperationalRoleId = 'coordination'

export function mapLegacyCaseToEncounter(item: CardiologyCase): OperationalEncounter {
  return {
    encounterId: item.id,
    status: item.status === 'handover-ready' ? 'handover_ready' : 'active',
    createdAt: item.lastUpdated,
    pathwayLabel: item.pathway,
    location: item.location,
  }
}

export function mapLegacyTaskToWorkItem(task: OperationalTask): ClinicalWorkItem {
  const status: ClinicalWorkItem['status'] = task.status === 'pending' ? 'open' : task.status === 'acknowledged' ? 'acknowledged' : 'completed'
  return {
    workItemId: task.id,
    encounterId: task.caseId,
    // 'note' generalizes to documentation; 'order' generalizes to
    // coordination (acknowledging/tracking, never placing or transmitting
    // an order — see operationalWorkItems.ts's header).
    kind: task.kind === 'note' ? 'documentation' : 'coordination',
    status,
    owner: task.owner
      ? { role: LEGACY_OWNER_ROLE, assignedAt: task.id, assignedBy: LEGACY_OWNER_ROLE, eventRef: `legacy:${task.id}` }
      : null,
    priority: 'routine',
    createdAt: task.id,
    dueAt: null,
    sourceRefs: ['app/lib/cardiology/types.ts (OperationalTask, legacy Notes & Orders)'],
    relatedEventRefs: [],
    reviewStatus: 'simulation_only',
  }
}

function heuristicProcedureArea(area: string): ProcedureBoardArea {
  const normalized = area.toLowerCase()
  if (normalized.includes('cath')) return 'cath_lab'
  if (normalized.includes('ep')) return 'ep'
  if (normalized.includes('structural')) return 'structural'
  if (normalized.includes('tee')) return 'tee'
  if (normalized.includes('transfer')) return 'transfer_prep'
  return 'surgery'
}

export function mapLegacySurgicalItemToProcedure(item: SurgicalListItem): ProcedureState {
  return {
    procedureId: item.id,
    encounterId: item.caseId,
    area: heuristicProcedureArea(item.area),
    label: item.label,
    window: item.window,
    checklist: [
      { key: 'identity', label: 'Simulation identity checked', complete: item.checklist.identity },
      { key: 'documents', label: 'Documents reviewed', complete: item.checklist.documents },
      { key: 'destination', label: 'Destination confirmed', complete: item.checklist.destination },
    ],
    relatedWorkItemIds: [],
  }
}

export function mapLegacyHandoverToState(record: HandoverRecord): HandoverState {
  return {
    encounterId: record.caseId,
    note: record.note,
    requiredWorkReviewed: record.pendingReviewed,
    ownerConfirmed: record.ownerConfirmed,
    simulationConfirmed: record.simulationConfirmed,
    relatedWorkItemIds: [],
    updatedAt: record.updatedAt,
  }
}
