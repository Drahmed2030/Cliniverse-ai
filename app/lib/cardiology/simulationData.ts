import type {
  CardiologyCase,
  CardiologyOperationsState,
  HandoverRecord,
  OperationalTask,
  SurgicalListItem,
} from './types'

export const CARDIOLOGY_SIMULATION_STORAGE_KEY = 'cliniverse:cardiology-operations:simulation:v1'

const casePathways = new Set(['chest-pain', 'stemi', 'post-procedure'])
const casePriorities = new Set(['time-sensitive', 'watch', 'routine'])
const caseStatuses = new Set(['new', 'reviewing', 'awaiting-action', 'handover-ready'])
const taskKinds = new Set(['note', 'order'])
const taskStatuses = new Set(['pending', 'acknowledged', 'done'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function hasString(record: Record<string, unknown>, key: string) {
  return typeof record[key] === 'string'
}

function hasBoolean(record: Record<string, unknown>, key: string) {
  return typeof record[key] === 'boolean'
}

function isCardiologyCase(value: unknown): value is CardiologyCase {
  if (!isRecord(value)) return false
  return ['id', 'location', 'shiftOwner', 'summary', 'lastUpdated'].every(key => hasString(value, key))
    && typeof value.notesOpen === 'number'
    && Number.isFinite(value.notesOpen)
    && value.notesOpen >= 0
    && typeof value.ordersOpen === 'number'
    && Number.isFinite(value.ordersOpen)
    && value.ordersOpen >= 0
    && casePathways.has(String(value.pathway))
    && casePriorities.has(String(value.priority))
    && caseStatuses.has(String(value.status))
}

function isSurgicalListItem(value: unknown): value is SurgicalListItem {
  if (!isRecord(value)) return false
  const checklist = value.checklist
  if (!isRecord(checklist)) return false
  return ['id', 'caseId', 'label', 'window', 'area'].every(key => hasString(value, key))
    && ['identity', 'documents', 'destination'].every(key => hasBoolean(checklist, key))
}

function isOperationalTask(value: unknown): value is OperationalTask {
  if (!isRecord(value)) return false
  return ['id', 'caseId', 'label', 'owner'].every(key => hasString(value, key))
    && taskKinds.has(String(value.kind))
    && taskStatuses.has(String(value.status))
}

function isHandoverRecord(value: unknown): value is HandoverRecord {
  if (!isRecord(value)) return false
  return ['caseId', 'note', 'updatedAt'].every(key => hasString(value, key))
    && ['pendingReviewed', 'ownerConfirmed', 'simulationConfirmed', 'ready'].every(key => hasBoolean(value, key))
}

export function createCardiologySimulationState(): CardiologyOperationsState {
  return {
    schemaVersion: 1,
    cases: [
      {
        id: 'SIM-CARD-001',
        location: 'CCU-SIM-01',
        pathway: 'chest-pain',
        priority: 'time-sensitive',
        shiftOwner: 'Night Team A',
        status: 'new',
        notesOpen: 1,
        ordersOpen: 2,
        summary: 'Chest-pain pathway simulation awaiting operational review.',
        lastUpdated: 'Start of shift',
      },
      {
        id: 'SIM-CARD-002',
        location: 'ED-SIM-02',
        pathway: 'stemi',
        priority: 'time-sensitive',
        shiftOwner: 'Night Team B',
        status: 'reviewing',
        notesOpen: 1,
        ordersOpen: 1,
        summary: 'STEMI pathway simulation for timer and team-ownership review only.',
        lastUpdated: 'Recent simulation update',
      },
      {
        id: 'SIM-CARD-003',
        location: 'WARD-SIM-04',
        pathway: 'post-procedure',
        priority: 'watch',
        shiftOwner: 'Night Team A',
        status: 'awaiting-action',
        notesOpen: 2,
        ordersOpen: 1,
        summary: 'Post-procedure simulation with an incomplete operational checklist.',
        lastUpdated: 'Earlier this shift',
      },
      {
        id: 'SIM-CARD-004',
        location: 'STEPDOWN-SIM-03',
        pathway: 'chest-pain',
        priority: 'routine',
        shiftOwner: 'Night Team C',
        status: 'handover-ready',
        notesOpen: 0,
        ordersOpen: 0,
        summary: 'Operational simulation prepared for structured handover.',
        lastUpdated: 'Handover checkpoint',
      },
    ],
    surgicalItems: [
      {
        id: 'SIM-SURG-001',
        caseId: 'SIM-CARD-003',
        label: 'Planned cardiac procedure simulation',
        window: 'First shift window',
        area: 'CARDIAC-OR-SIM',
        checklist: { identity: true, documents: false, destination: false },
      },
      {
        id: 'SIM-SURG-002',
        caseId: 'SIM-CARD-004',
        label: 'Procedure follow-up simulation',
        window: 'Second shift window',
        area: 'CATH-SIM',
        checklist: { identity: true, documents: true, destination: true },
      },
    ],
    tasks: [
      {
        id: 'SIM-TASK-001',
        caseId: 'SIM-CARD-001',
        kind: 'note',
        label: 'Complete simulated shift note',
        owner: 'Night Team A',
        status: 'pending',
      },
      {
        id: 'SIM-TASK-002',
        caseId: 'SIM-CARD-001',
        kind: 'order',
        label: 'Acknowledge simulated operational order',
        owner: 'Night Team A',
        status: 'acknowledged',
      },
      {
        id: 'SIM-TASK-003',
        caseId: 'SIM-CARD-002',
        kind: 'order',
        label: 'Confirm pathway owner in the simulation',
        owner: 'Night Team B',
        status: 'pending',
      },
      {
        id: 'SIM-TASK-004',
        caseId: 'SIM-CARD-003',
        kind: 'note',
        label: 'Review simulated procedure note status',
        owner: 'Night Team A',
        status: 'acknowledged',
      },
      {
        id: 'SIM-TASK-005',
        caseId: 'SIM-CARD-004',
        kind: 'note',
        label: 'Close simulated handover note',
        owner: 'Night Team C',
        status: 'done',
      },
    ],
    handovers: [
      {
        caseId: 'SIM-CARD-004',
        note: 'Fictional case ready for the next simulated shift; no real patient data recorded.',
        pendingReviewed: true,
        ownerConfirmed: true,
        simulationConfirmed: true,
        ready: true,
        updatedAt: 'Saved in demo state',
      },
    ],
  }
}

export function isCardiologyOperationsState(value: unknown): value is CardiologyOperationsState {
  if (!isRecord(value) || value.schemaVersion !== 1) return false
  return Array.isArray(value.cases)
    && value.cases.every(isCardiologyCase)
    && Array.isArray(value.surgicalItems)
    && value.surgicalItems.every(isSurgicalListItem)
    && Array.isArray(value.tasks)
    && value.tasks.every(isOperationalTask)
    && Array.isArray(value.handovers)
    && value.handovers.every(isHandoverRecord)
}
