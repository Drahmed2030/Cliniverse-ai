export interface EcgCaseProgress {
  correct: boolean
  xpEarned: number
  answeredAt: string
  attempts: number
}

export type EcgChallengeProgressState = Record<string, EcgCaseProgress>

const STORAGE_KEY = 'cliniverse:ecg-challenge:v1'

function isEcgCaseProgress(value: unknown): value is EcgCaseProgress {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.correct === 'boolean' &&
    typeof v.xpEarned === 'number' &&
    typeof v.answeredAt === 'string' &&
    typeof v.attempts === 'number'
}

function isEcgChallengeProgressState(value: unknown): value is EcgChallengeProgressState {
  if (!value || typeof value !== 'object') return false
  return Object.values(value as Record<string, unknown>).every(isEcgCaseProgress)
}

export function loadEcgChallengeProgress(): EcgChallengeProgressState {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return isEcgChallengeProgressState(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function saveEcgChallengeProgress(state: EcgChallengeProgressState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Local save unavailable (private browsing, storage full, etc.) — progress stays session-only.
  }
}

/** First-correct-answer-wins: XP is only ever credited once per case. */
export function recordEcgCaseAnswer(
  state: EcgChallengeProgressState,
  caseId: string,
  correct: boolean,
  xpReward: number,
): EcgChallengeProgressState {
  const existing = state[caseId]
  const alreadyScored = existing?.correct === true
  const next: EcgChallengeProgressState = {
    ...state,
    [caseId]: {
      correct: alreadyScored || correct,
      xpEarned: alreadyScored ? existing.xpEarned : correct ? xpReward : 0,
      answeredAt: new Date().toISOString(),
      attempts: (existing?.attempts ?? 0) + 1,
    },
  }
  saveEcgChallengeProgress(next)
  return next
}

export function totalEcgXp(state: EcgChallengeProgressState): number {
  return Object.values(state).reduce((sum, entry) => sum + entry.xpEarned, 0)
}
