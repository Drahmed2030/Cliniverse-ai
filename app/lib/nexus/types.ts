export const NEXUS_MODULE_IDS = ['huddle', 'nursing', 'medication', 'safety'] as const

export type NexusModuleId = (typeof NEXUS_MODULE_IDS)[number]

export type NexusContentStatus = 'draft-unreviewed'

export interface NexusLearningPrompt {
  id: string
  title: string
  body: string
}

export interface NexusSafetyTimelineItem {
  id: string
  phase: string
  observation: string
}

export interface NexusCardiovascularCase {
  id: string
  title: string
  setting: string
  version: 1
  contentStatus: NexusContentStatus
  reviewedBy: null
  sources: []
  summary: string
  boundaryNotice: string
  caseSignals: string[]
  nursingPrompts: NexusLearningPrompt[]
  medicationPrompts: NexusLearningPrompt[]
  safetyTimeline: NexusSafetyTimelineItem[]
  contributoryFactors: string[]
  debriefPoints: string[]
}

export interface NexusLearningState {
  schemaVersion: 1
  activeModule: NexusModuleId
  completedModules: NexusModuleId[]
  reflections: Record<NexusModuleId, string>
  fictionalBoundaryConfirmed: boolean
  debriefRevealed: boolean
}
