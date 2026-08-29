import type {
  CardiologyCaseStatus,
  CardiologyPathway,
  CardiologyPriority,
  OperationalTaskStatus,
} from '../../../lib/cardiology'

export const pathwayLabels: Record<CardiologyPathway, string> = {
  'chest-pain': 'Chest Pain',
  stemi: 'STEMI',
  'post-procedure': 'Post-procedure',
}

export const priorityLabels: Record<CardiologyPriority, string> = {
  'time-sensitive': 'Time-sensitive',
  watch: 'Watch',
  routine: 'Routine',
}

export const caseStatusLabels: Record<CardiologyCaseStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  'awaiting-action': 'Awaiting action',
  'handover-ready': 'Handover ready',
}

export const taskStatusLabels: Record<OperationalTaskStatus, string> = {
  pending: 'Pending',
  acknowledged: 'Acknowledged',
  done: 'Done',
}
