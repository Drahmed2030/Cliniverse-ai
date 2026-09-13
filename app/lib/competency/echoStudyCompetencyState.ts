import type { EchoStudy } from '../clinicalMedia/echoStudyContract.ts'
import { getEchoStudyCursor, validateEchoStudy } from '../clinicalMedia/echoStudyContract.ts'
import type { EchoSkillMastery } from './echoMasteryEngine.ts'

export interface EchoClipCompetencySnapshot {
  clipId: string
  masteries: EchoSkillMastery[]
  completedTaskIds: string[]
  updatedAt: string
}

export interface EchoStudyCompetencyState {
  studyId: string
  byClipId: Record<string, EchoClipCompetencySnapshot>
}

export function createEchoStudyCompetencyState(study: EchoStudy): EchoStudyCompetencyState {
  validateEchoStudy(study)
  return { studyId: study.studyId, byClipId: {} }
}

export function recordEchoClipCompetency(params: {
  state: EchoStudyCompetencyState
  study: EchoStudy
  clipId: string
  mastery: EchoSkillMastery
  taskId: string
  updatedAt: string
}): EchoStudyCompetencyState {
  if (params.state.studyId !== params.study.studyId) throw new Error('Echo study competency state mismatch.')
  getEchoStudyCursor(params.study, params.clipId)
  const previous = params.state.byClipId[params.clipId]
  const masteries = previous?.masteries.filter(item => item.skillId !== params.mastery.skillId) ?? []
  const completedTaskIds = new Set(previous?.completedTaskIds ?? [])
  completedTaskIds.add(params.taskId)

  return {
    ...params.state,
    byClipId: {
      ...params.state.byClipId,
      [params.clipId]: {
        clipId: params.clipId,
        masteries: [...masteries, params.mastery],
        completedTaskIds: [...completedTaskIds],
        updatedAt: params.updatedAt,
      },
    },
  }
}

export function projectEchoStudyCompetencyProgress(study: EchoStudy, state: EchoStudyCompetencyState) {
  validateEchoStudy(study)
  if (state.studyId !== study.studyId) throw new Error('Echo study competency projection mismatch.')
  const clipsWithEvidence = study.clips.filter(clip => state.byClipId[clip.clipId]).length
  const completedTasks = Object.values(state.byClipId).reduce((sum, snapshot) => sum + snapshot.completedTaskIds.length, 0)
  return {
    studyId: study.studyId,
    clipsWithEvidence,
    totalClips: study.clips.length,
    completedTasks,
    coveragePercent: Math.round((clipsWithEvidence / study.clips.length) * 100),
  }
}
