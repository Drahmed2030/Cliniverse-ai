import { ACLS_DISCLAIMER, ACLS_LESSONS, type ACLSLesson } from './aclsLessons.ts'
import { BLS_DISCLAIMER, BLS_LESSONS, type BlsLesson } from './blsLessons.ts'

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
  schemaVersion: 1
  completedByTrack: Record<TrainingTrack, string[]>
}

export const CODE_LAB_CATALOG = {
  schemaVersion: 1,
  catalogVersion: '1.0.0-draft',
  playerId: 'codelab-unified-player-v1',
  intendedUse: 'education-only',
  dataMode: 'fictional-and-skills-training-only',
  reviewStatus: 'draft-human-review-required',
  sourceStatus: 'lesson-level-source-mapping-required',
  progressStorage: 'device-local',
} as const

export const EMPTY_CODELAB_PROGRESS: CodeLabProgress = {
  schemaVersion: 1,
  completedByTrack: { bls: [], acls: [] },
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

export function parseCodeLabProgress(raw: string | null, legacyRaw?: string | null): CodeLabProgress {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<CodeLabProgress>
      if (parsed.schemaVersion === 1 && parsed.completedByTrack) {
        return {
          schemaVersion: 1,
          completedByTrack: {
            bls: uniqueStrings(parsed.completedByTrack.bls),
            acls: uniqueStrings(parsed.completedByTrack.acls),
          },
        }
      }
    } catch {
      // Fall through to the safe empty state or legacy migration.
    }
  }

  if (legacyRaw) {
    try {
      const legacy = JSON.parse(legacyRaw) as { completedIds?: unknown }
      return {
        schemaVersion: 1,
        completedByTrack: {
          bls: uniqueStrings(legacy.completedIds),
          acls: [],
        },
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
