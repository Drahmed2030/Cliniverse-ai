import type { EchoStudy } from '../clinicalMedia/echoStudyContract.ts'
import { getEchoStudyCursor, resolveEchoStudyResumeClip, validateEchoStudy } from '../clinicalMedia/echoStudyContract.ts'
import type { EchoCompetencyEvent, EchoMasteryProjectionRow } from './echoPersistenceContract.ts'
import type { EchoAdaptiveCandidate, EchoAdaptiveSelection } from './echoAdaptiveSelector.ts'
import { selectNextEchoCase } from './echoAdaptiveSelector.ts'
import type { EchoSkillMastery } from './echoMasteryEngine.ts'

export interface EchoStudioCoreState {
  study: EchoStudy
  activeClipId: string
}

export interface EchoStudioEnhancementState {
  competencyAvailable: boolean
  persistenceAvailable: boolean
  adaptiveAvailable: boolean
  degradedReasons: string[]
}

export interface EchoStudioSessionProjection {
  core: {
    activeClipId: string
    position: number
    total: number
    previousClipId: string | null
    nextClipId: string | null
    progressPercent: number
  }
  enhancement: EchoStudioEnhancementState & {
    recommendedNextCase: EchoAdaptiveSelection | null
  }
}

export function projectEchoStudioSession(params: {
  core: EchoStudioCoreState
  masteries?: readonly EchoSkillMastery[] | null
  adaptiveCandidates?: readonly EchoAdaptiveCandidate[] | null
  now: string
  persistenceHealthy?: boolean
}): EchoStudioSessionProjection {
  validateEchoStudy(params.core.study)
  const cursor = getEchoStudyCursor(params.core.study, params.core.activeClipId)

  const degradedReasons: string[] = []
  const competencyAvailable = Array.isArray(params.masteries)
  const adaptiveAvailable = competencyAvailable && Array.isArray(params.adaptiveCandidates)
  const persistenceAvailable = params.persistenceHealthy !== false

  if (!competencyAvailable) degradedReasons.push('competency-unavailable')
  if (!adaptiveAvailable) degradedReasons.push('adaptive-unavailable')
  if (!persistenceAvailable) degradedReasons.push('persistence-unavailable')

  let recommendedNextCase: EchoAdaptiveSelection | null = null
  if (adaptiveAvailable) {
    try {
      recommendedNextCase = selectNextEchoCase({
        masteries: params.masteries ?? [],
        candidates: params.adaptiveCandidates ?? [],
        now: params.now,
      })
    } catch {
      degradedReasons.push('adaptive-error')
    }
  }

  return {
    core: {
      activeClipId: cursor.clipId,
      position: cursor.position,
      total: cursor.total,
      previousClipId: cursor.previousClipId,
      nextClipId: cursor.nextClipId,
      progressPercent: cursor.progressPercent,
    },
    enhancement: {
      competencyAvailable,
      persistenceAvailable,
      adaptiveAvailable,
      degradedReasons,
      recommendedNextCase,
    },
  }
}

export function resolveSafeEchoResume(study: EchoStudy, lastCompletedClipId?: string | null): string {
  try {
    return resolveEchoStudyResumeClip(study, lastCompletedClipId)
  } catch {
    const fallback = [...study.clips].sort((a, b) => a.order - b.order)[0]
    if (!fallback) throw new Error(`Echo study ${study.studyId} has no safe resume target.`)
    return fallback.clipId
  }
}

export interface EchoStudioPersistencePort {
  appendEvent(event: EchoCompetencyEvent): Promise<void>
  upsertProjection(projection: EchoMasteryProjectionRow): Promise<void>
}

export async function persistEchoCompetencySafely(params: {
  port?: EchoStudioPersistencePort | null
  event: EchoCompetencyEvent
  projection: EchoMasteryProjectionRow
}): Promise<{ persisted: boolean; degradedReason: string | null }> {
  if (!params.port) return { persisted: false, degradedReason: 'persistence-unavailable' }

  try {
    await params.port.appendEvent(params.event)
    await params.port.upsertProjection(params.projection)
    return { persisted: true, degradedReason: null }
  } catch {
    return { persisted: false, degradedReason: 'persistence-error' }
  }
}
