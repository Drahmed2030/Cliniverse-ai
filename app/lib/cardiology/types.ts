export type CardiologyModuleId = 'overview' | 'pathway' | 'census' | 'surgery' | 'tasks' | 'handover'

export type CardiologyPathway = 'chest-pain' | 'stemi' | 'post-procedure'
export type CardiologyPriority = 'time-sensitive' | 'watch' | 'routine'
export type CardiologyCaseStatus = 'new' | 'reviewing' | 'awaiting-action' | 'handover-ready'
export type OperationalTaskStatus = 'pending' | 'acknowledged' | 'done'
export type OperationalTaskKind = 'note' | 'order'
export type SurgicalChecklistKey = 'identity' | 'documents' | 'destination'

export interface CardiologyCase {
  id: string
  location: string
  pathway: CardiologyPathway
  priority: CardiologyPriority
  shiftOwner: string
  status: CardiologyCaseStatus
  notesOpen: number
  ordersOpen: number
  summary: string
  lastUpdated: string
}

export interface SurgicalListItem {
  id: string
  caseId: string
  label: string
  window: string
  area: string
  checklist: Record<SurgicalChecklistKey, boolean>
}

export interface OperationalTask {
  id: string
  caseId: string
  kind: OperationalTaskKind
  label: string
  owner: string
  status: OperationalTaskStatus
}

export interface HandoverRecord {
  caseId: string
  note: string
  pendingReviewed: boolean
  ownerConfirmed: boolean
  simulationConfirmed: boolean
  ready: boolean
  updatedAt: string
}

export interface CardiologyOperationsState {
  schemaVersion: 1
  cases: CardiologyCase[]
  surgicalItems: SurgicalListItem[]
  tasks: OperationalTask[]
  handovers: HandoverRecord[]
}
