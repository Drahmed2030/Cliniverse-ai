import { ACLS_DISCLAIMER, ACLS_LESSONS, type ACLSLesson } from './aclsLessons.ts'
import { BLS_DISCLAIMER, BLS_LESSONS, type BlsLesson } from './blsLessons.ts'
import { parseCodeLabLessonReceipt, type CodeLabLessonCompletionReceipt } from './lessonReceipt.ts'

export type TrainingTrack = 'bls' | 'acls'
export type TrainingPracticeType =
  | 'sequence'
  | 'timer'
  | 'checklist'
  | 'scenario'
  | 'mini_megacode'
  | 'algorithm'
  | 'drug_drill'

export interface TrainingLesson {
  id: string
  track: TrainingTrack
  order: number
  title: string
  durationMin: number
  objective: string
  keyPoints: string[]
  videoBrief: string
  clinicalContext?: string
  practice: {
    type: TrainingPracticeType
    prompt: string
    items: string[]
  }
  mcqs: {
    q: string
    options: string[]
    answerIndex: number
    explanation?: string
  }[]
  keyNumbers: { label: string; value: string }[]
  commonMistakes: string[]
  disclaimer: string
}

export interface CodeLabProgress {
  schemaVersion: 2
  completedByTrack: Record<TrainingTrack, string[]>
  receiptsByLesson: Record<string, CodeLabLessonCompletionReceipt>
}

export const CODE_LAB_CATALOG = {
  schemaVersion: 1,
  catalogVersion: '1.0.0-draft',
  playerId: 'codelab-unified-player-v1',
  intendedUse: 'education-only',
  dataMode: 'fictional-and-skills-training-only',
  reviewStatus: 'draft-human-review-required',
  sourceStatus: 'provisional-source-family-mapping-human-review-required',
  progressStorage: 'device-local',
} as const

export const EMPTY_CODELAB_PROGRESS: CodeLabProgress = {
  schemaVersion: 2,
  completedByTrack: { bls: [], acls: [] },
  receiptsByLesson: {},
}

export const TRAINING_TRACKS: Record<TrainingTrack, {
  label: string
  shortLabel: string
  description: string
  lessons: TrainingLesson[]
}> = {
  bls: {
    label: 'Basic Life Support',
    shortLabel: 'BLS',
    description: 'Recognition, high-quality CPR, AED and coordinated response.',
    lessons: BLS_LESSONS.map(normalizeBlsLesson),
  },
  acls: {
    label: 'Advanced Cardiovascular Life Support',
    shortLabel: 'ACLS',
    description: 'Systematic approach, rhythm pathways, team roles and reassessment.',
    lessons: ACLS_LESSONS.map(normalizeAclsLesson),
  },
}

export function normalizeBlsLesson(lesson: BlsLesson): TrainingLesson {
  return {
    ...lesson,
    practice: { ...lesson.practice, items: lesson.practice.items ?? [] },
    keyNumbers: [],
    commonMistakes: [],
    disclaimer: BLS_DISCLAIMER,
  }
}

export function normalizeAclsLesson(lesson: ACLSLesson): TrainingLesson {
  return {
    ...lesson,
    practice: { ...lesson.practice, items: lesson.practice.items ?? [] },
    disclaimer: ACLS_DISCLAIMER,
  }
}

export function parseCodeLabProgress(
  raw: string | null,
  previousRaw?: string | null,
  legacyRaw?: string | null,
): CodeLabProgress {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<CodeLabProgress>
      if (parsed.schemaVersion === 2 && parsed.completedByTrack) {
        const completedByTrack = {
          bls: validLessonIds(parsed.completedByTrack.bls, 'bls'),
          acls: validLessonIds(parsed.completedByTrack.acls, 'acls'),
        }
        const completedIds = new Set([...completedByTrack.bls, ...completedByTrack.acls])
        const receiptsByLesson = Object.fromEntries(
          Object.entries(parseReceipts(parsed.receiptsByLesson))
            .filter(([lessonId]) => completedIds.has(lessonId)),
        )
        return {
          schemaVersion: 2,
          completedByTrack,
          receiptsByLesson,
        }
      }
    } catch {
      // Fall through to the safe empty state or legacy migration.
    }
  }

  if (previousRaw) {
    try {
      const previous = JSON.parse(previousRaw) as { schemaVersion?: unknown; completedByTrack?: Record<string, unknown> }
      if (previous.schemaVersion === 1 && previous.completedByTrack) {
        return {
          schemaVersion: 2,
          completedByTrack: {
            bls: validLessonIds(previous.completedByTrack.bls, 'bls'),
            acls: validLessonIds(previous.completedByTrack.acls, 'acls'),
          },
          receiptsByLesson: {},
        }
      }
    } catch {
      // Fall through to the legacy BLS migration.
    }
  }

  if (legacyRaw) {
    try {
      const legacy = JSON.parse(legacyRaw) as { completedIds?: unknown }
      return {
        schemaVersion: 2,
        completedByTrack: {
          bls: validLessonIds(legacy.completedIds, 'bls'),
          acls: [],
        },
        receiptsByLesson: {},
      }
    } catch {
      // Ignore invalid local-only progress.
    }
  }

  return EMPTY_CODELAB_PROGRESS
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string => typeof item === 'string'))]
}

function validLessonIds(value: unknown, track: TrainingTrack): string[] {
  const allowed = new Set(TRAINING_TRACKS[track].lessons.map(lesson => lesson.id))
  return uniqueStrings(value).filter(lessonId => allowed.has(lessonId))
}

function parseReceipts(value: unknown): Record<string, CodeLabLessonCompletionReceipt> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
  const receipts: Record<string, CodeLabLessonCompletionReceipt> = {}
  for (const [lessonId, candidate] of Object.entries(value)) {
    const receipt = parseCodeLabLessonReceipt(candidate)
    if (receipt?.lessonId === lessonId) receipts[lessonId] = receipt
  }
  return receipts
}
