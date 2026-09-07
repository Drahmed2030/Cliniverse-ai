import {
  NEXUS_MODULE_IDS,
  type NexusCardiovascularCase,
  type NexusLearningState,
  type NexusModuleId,
} from './types'

export const NEXUS_CARDIOVASCULAR_STORAGE_KEY = 'cliniverse:nexus:cardiovascular-learning:simulation:v1'
export const NEXUS_REFLECTION_MIN_LENGTH = 20

const moduleIds = new Set<string>(NEXUS_MODULE_IDS)

export const nexusCardiovascularCase: NexusCardiovascularCase = {
  id: 'SIM-NEXUS-CARD-001',
  title: 'Cardiovascular transfer and handover reliability',
  setting: 'Fictional cardiac care area',
  version: 1,
  contentStatus: 'draft-unreviewed',
  reviewedBy: null,
  sources: [],
  summary: 'A fictional transfer contains incomplete ownership documentation, an unresolved medication-reconciliation checkpoint, and a duplicated operational task. The learning objective is system reliability and communication, not clinical management.',
  boundaryNotice: 'Simulation only. Do not enter real patient information, make clinical decisions, or use this exercise to direct diagnosis, treatment, prescribing, or order entry.',
  caseSignals: [
    'The receiving owner is not documented in the simulated handover.',
    'A medication-reconciliation checkpoint is recorded as incomplete.',
    'Two simulated teams appear to own the same operational follow-up.',
    'The event timeline lacks a closed-loop acknowledgement.',
  ],
  nursingPrompts: [
    {
      id: 'NURSING-01',
      title: 'Observation continuity',
      body: 'Identify what information should be explicitly carried forward between simulated teams without adding clinical interpretation.',
    },
    {
      id: 'NURSING-02',
      title: 'Ownership clarity',
      body: 'Describe how responsibility could be documented so the next simulated team knows who will close each operational item.',
    },
    {
      id: 'NURSING-03',
      title: 'Escalation language',
      body: 'Draft neutral escalation wording that reports the documentation gap without diagnosing, blaming, or recommending treatment.',
    },
  ],
  medicationPrompts: [
    {
      id: 'MED-01',
      title: 'Reconciliation status',
      body: 'Record which simulated documentation checkpoint is incomplete; do not add medication names, doses, interactions, or recommendations.',
    },
    {
      id: 'MED-02',
      title: 'Human review owner',
      body: 'Identify the appropriate fictional licensed-review role and how acknowledgement should be recorded.',
    },
    {
      id: 'MED-03',
      title: 'Closed-loop confirmation',
      body: 'Describe what operational evidence would show that the simulated review request was received and closed.',
    },
  ],
  safetyTimeline: [
    {
      id: 'TIME-01',
      phase: 'Transfer preparation',
      observation: 'A simulated operational checklist is started but the receiving owner field remains blank.',
    },
    {
      id: 'TIME-02',
      phase: 'Handover',
      observation: 'The medication-reconciliation checkpoint is mentioned without a documented acknowledgement.',
    },
    {
      id: 'TIME-03',
      phase: 'Follow-up',
      observation: 'Two simulated teams retain the same open task and neither records closure.',
    },
  ],
  contributoryFactors: [
    'Unclear handover ownership',
    'Duplicated operational responsibility',
    'Missing acknowledgement field',
    'No shared closure convention',
  ],
  debriefPoints: [
    'A reliable handover makes ownership, acknowledgement, and closure visible.',
    'Medication-safety learning can focus on reconciliation workflow without generating prescribing guidance.',
    'A safety review should examine system conditions and barriers rather than assign individual blame.',
    'Human review remains required before any clinical content or workflow is exposed beyond simulation.',
  ],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isModuleId(value: unknown): value is NexusModuleId {
  return typeof value === 'string' && moduleIds.has(value)
}

function hasValidReflections(value: unknown): value is Record<NexusModuleId, string> {
  if (!isRecord(value)) return false
  return NEXUS_MODULE_IDS.every(moduleId => typeof value[moduleId] === 'string')
}

export function createNexusLearningState(): NexusLearningState {
  return {
    schemaVersion: 1,
    activeModule: 'huddle',
    completedModules: [],
    reflections: {
      huddle: '',
      nursing: '',
      medication: '',
      safety: '',
    },
    fictionalBoundaryConfirmed: false,
    debriefRevealed: false,
  }
}

export function hasCompletedNexusModules(completedModules: readonly NexusModuleId[]) {
  return NEXUS_MODULE_IDS.every(moduleId => completedModules.includes(moduleId))
}

export function canRevealNexusDebrief(state: NexusLearningState) {
  return state.fictionalBoundaryConfirmed
    && hasCompletedNexusModules(state.completedModules)
    && state.completedModules.every(moduleId => state.reflections[moduleId].trim().length >= NEXUS_REFLECTION_MIN_LENGTH)
}

export function isNexusLearningState(value: unknown): value is NexusLearningState {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isModuleId(value.activeModule)) return false
  if (!Array.isArray(value.completedModules) || !value.completedModules.every(isModuleId)) return false
  if (new Set(value.completedModules).size !== value.completedModules.length) return false
  if (!hasValidReflections(value.reflections)) return false
  if (typeof value.fictionalBoundaryConfirmed !== 'boolean' || typeof value.debriefRevealed !== 'boolean') return false

  const typed = value as unknown as NexusLearningState
  if (!typed.completedModules.every(moduleId => typed.reflections[moduleId].trim().length >= NEXUS_REFLECTION_MIN_LENGTH)) return false
  return !typed.debriefRevealed || canRevealNexusDebrief(typed)
}
