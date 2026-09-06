import type { EchoBatchQaState } from './echoBatchManifest.ts'
import { getEchoSkill } from '../competency/echoSkillGraph.ts'

export type EchoStudyView = 'A4C' | 'A2C' | 'A3C' | 'PLAX' | 'PSAX' | 'SUBCOSTAL' | 'SUPRASTERNAL' | 'OTHER'
export type EchoStudyClipKind = 'cine' | 'still'

export interface EchoStudyClip {
  clipId: string
  assetId: string
  order: number
  view: EchoStudyView
  label: string
  kind: EchoStudyClipKind
  mediaPath: string
  qaState: EchoBatchQaState
  skillIds: string[]
  assessmentTaskIds: string[]
  durationMs?: number
}

export interface EchoStudy {
  schemaVersion: '1.0'
  studyId: string
  title: string
  studyType: 'single-view-learning' | 'full-echo-study'
  modality: 'echo'
  intendedUse: 'education-only'
  clips: EchoStudyClip[]
}

export interface EchoStudyCursor {
  studyId: string
  clipId: string
  index: number
  position: number
  total: number
  previousClipId: string | null
  nextClipId: string | null
  progressPercent: number
  isFirst: boolean
  isLast: boolean
}

export function validateEchoStudy(study: EchoStudy): void {
  if (!study.studyId.trim() || !study.title.trim()) throw new Error('Echo study identity and title are required.')
  if (!study.clips.length) throw new Error(`Echo study ${study.studyId} must contain at least one clip.`)

  const clipIds = new Set<string>()
  const assetIds = new Set<string>()
  const orders = new Set<number>()

  for (const clip of study.clips) {
    if (!clip.clipId || !clip.assetId || !clip.label || !clip.mediaPath) {
      throw new Error(`Echo study clip identity, label and media path are required in ${study.studyId}.`)
    }
    if (!Number.isInteger(clip.order) || clip.order < 1) throw new Error(`Invalid Echo study order for ${clip.clipId}.`)
    if (clipIds.has(clip.clipId)) throw new Error(`Duplicate Echo study clipId: ${clip.clipId}`)
    if (assetIds.has(clip.assetId)) throw new Error(`Duplicate Echo study assetId: ${clip.assetId}`)
    if (orders.has(clip.order)) throw new Error(`Duplicate Echo study order: ${clip.order}`)
    if (!clip.mediaPath.startsWith('/clinical-media/echo/')) throw new Error(`Ungoverned Echo media path: ${clip.clipId}`)
    if (clip.qaState === 'blocked') throw new Error(`Blocked Echo clip cannot enter a study: ${clip.clipId}`)
    if (clip.durationMs !== undefined && (!Number.isFinite(clip.durationMs) || clip.durationMs <= 0)) {
      throw new Error(`Echo cine duration must be positive when provided: ${clip.clipId}`)
    }
    for (const skillId of clip.skillIds) getEchoSkill(skillId)

    clipIds.add(clip.clipId)
    assetIds.add(clip.assetId)
    orders.add(clip.order)
  }

  const sortedOrders = [...orders].sort((a, b) => a - b)
  sortedOrders.forEach((order, index) => {
    if (order !== index + 1) throw new Error(`Echo study orders must be contiguous from 1 in ${study.studyId}.`)
  })
}

export function orderedEchoStudyClips(study: EchoStudy): readonly EchoStudyClip[] {
  validateEchoStudy(study)
  return [...study.clips].sort((a, b) => a.order - b.order)
}

export function getEchoStudyCursor(study: EchoStudy, clipId: string): EchoStudyCursor {
  const clips = orderedEchoStudyClips(study)
  const index = clips.findIndex(clip => clip.clipId === clipId)
  if (index < 0) throw new Error(`Unknown Echo study clip ${clipId} in ${study.studyId}.`)

  return {
    studyId: study.studyId,
    clipId,
    index,
    position: index + 1,
    total: clips.length,
    previousClipId: clips[index - 1]?.clipId ?? null,
    nextClipId: clips[index + 1]?.clipId ?? null,
    progressPercent: Math.round(((index + 1) / clips.length) * 100),
    isFirst: index === 0,
    isLast: index === clips.length - 1,
  }
}

export function resolveEchoStudyResumeClip(study: EchoStudy, lastCompletedClipId?: string | null): string {
  const clips = orderedEchoStudyClips(study)
  if (!lastCompletedClipId) return clips[0].clipId
  const index = clips.findIndex(clip => clip.clipId === lastCompletedClipId)
  if (index < 0) return clips[0].clipId
  return clips[index + 1]?.clipId ?? clips[index].clipId
}
