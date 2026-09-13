import type { EchoStudy } from '../clinicalMedia/echoStudyContract.ts'
import { getEchoStudyCursor, validateEchoStudy } from '../clinicalMedia/echoStudyContract.ts'
import type { EchoStudyCompetencyState } from './echoStudyCompetencyState.ts'
import { projectEchoStudyCompetencyProgress } from './echoStudyCompetencyState.ts'

export interface EchoStudySessionState {
  studyId: string
  activeClipId: string
  visitedClipIds: string[]
}

export interface EchoStudySessionProjection {
  activeClipId: string
  position: number
  total: number
  previousClipId: string | null
  nextClipId: string | null
  viewingProgressPercent: number
  visitedPercent: number
  competencyCoveragePercent: number
  completedCompetencyTasks: number
}

export function createEchoStudySession(study: EchoStudy, initialClipId?: string | null): EchoStudySessionState {
  validateEchoStudy(study)
  const first = [...study.clips].sort((a, b) => a.order - b.order)[0]
  const activeClipId = initialClipId ?? first.clipId
  getEchoStudyCursor(study, activeClipId)
  return { studyId: study.studyId, activeClipId, visitedClipIds: [activeClipId] }
}

export function navigateEchoStudySession(params: {
  study: EchoStudy
  session: EchoStudySessionState
  direction: 'previous' | 'next'
}): EchoStudySessionState {
  if (params.session.studyId !== params.study.studyId) throw new Error('Echo study session mismatch.')
  const cursor = getEchoStudyCursor(params.study, params.session.activeClipId)
  const target = params.direction === 'next' ? cursor.nextClipId : cursor.previousClipId
  if (!target) return params.session
  const visited = new Set(params.session.visitedClipIds)
  visited.add(target)
  return { ...params.session, activeClipId: target, visitedClipIds: [...visited] }
}

export function projectEchoStudySession(params: {
  study: EchoStudy
  session: EchoStudySessionState
  competency?: EchoStudyCompetencyState | null
}): EchoStudySessionProjection {
  if (params.session.studyId !== params.study.studyId) throw new Error('Echo study session projection mismatch.')
  const cursor = getEchoStudyCursor(params.study, params.session.activeClipId)
  const competency = params.competency
    ? projectEchoStudyCompetencyProgress(params.study, params.competency)
    : { coveragePercent: 0, completedTasks: 0 }
  return {
    activeClipId: cursor.clipId,
    position: cursor.position,
    total: cursor.total,
    previousClipId: cursor.previousClipId,
    nextClipId: cursor.nextClipId,
    viewingProgressPercent: cursor.progressPercent,
    visitedPercent: Math.round((new Set(params.session.visitedClipIds).size / cursor.total) * 100),
    competencyCoveragePercent: competency.coveragePercent,
    completedCompetencyTasks: competency.completedTasks,
  }
}
