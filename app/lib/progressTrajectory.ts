import type { HandoverStage } from './ward/handoverSession.ts'

// Progress v2 projection. Pure and network-free: it turns already-loaded, account-owned records into
// honest per-track states. It never reads storage, never scores, and never derives mastery, competence
// or review-due status. Three concepts stay separate:
//   activity   = a saved record exists (Ward practice checkpoint, Echo attempt, ECG saved answer)
//   assessment = a saved record carries a score for that one attempt
//   competency = not represented here; it needs its own verified evidence
// The rendering layer (ProgressTrajectory) loads the records; this module only interprets them.

export type TrackId = 'ecg' | 'echo' | 'ward'

export type TrackLoad<T> =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'unsupported' }
  | { state: 'ready'; data: T }

export type TrackEvidence = 'loading' | 'unavailable' | 'not-recorded' | 'none' | 'activity' | 'scored'

export interface TrackProjection {
  id: TrackId
  title: string
  evidence: TrackEvidence
  status: string
  detail: string
  latestAt: string | null
  /** Position inside the latest saved Ward practice run only. Never a mastery or competency measure. */
  stage: { step: number; of: number; label: string } | null
  action: string
}

/** Which tracks can carry a scored attempt. Ward practice records do not award a score. */
export const SCORED_TRACKS: readonly TrackId[] = ['ecg', 'echo']
export const TRACK_IDS: readonly TrackId[] = ['ecg', 'echo', 'ward']

export const WARD_STAGES: readonly HandoverStage[] = ['brief', 'review', 'gaps', 'handover', 'complete']
const WARD_STAGE_LABELS: Record<HandoverStage, string> = {
  brief: 'Brief',
  review: 'Review the record',
  gaps: 'Check the gaps',
  handover: 'Draft the handover',
  complete: 'Practice completed',
}

export interface EcgEvidence { count: number; latestAt: string | null }
export interface EchoEvidence { count: number; hasMore: boolean; latestAt: string | null }
export interface WardEvidence { stage: HandoverStage; title: string; actionCount: number }

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

function pending(id: TrackId, title: string, action: string): TrackProjection {
  return { id, title, evidence: 'loading', status: 'Checking…', detail: 'Checking your saved records.', latestAt: null, stage: null, action }
}
function failed(id: TrackId, title: string, action: string): TrackProjection {
  return { id, title, evidence: 'unavailable', status: 'Unavailable', detail: 'Saved records couldn’t be loaded. Your history has not been removed.', latestAt: null, stage: null, action }
}

export function projectEcg(load: TrackLoad<EcgEvidence>): TrackProjection {
  const action = 'Practice ECG'
  if (load.state === 'loading') return pending('ecg', 'ECG', action)
  if (load.state !== 'ready') return failed('ecg', 'ECG', action)
  const { count, latestAt } = load.data
  if (count === 0) return { id: 'ecg', title: 'ECG', evidence: 'none', status: 'No saved activity', detail: 'Start an ECG practice to build your record.', latestAt: null, stage: null, action }
  // The ECG history is a recent window, so this states what was read, not a lifetime total.
  return { id: 'ecg', title: 'ECG', evidence: 'scored', status: 'Scored attempts saved', detail: plural(count, 'recent saved answer', 'recent saved answers'), latestAt, stage: null, action }
}

export function projectEcho(load: TrackLoad<EchoEvidence>): TrackProjection {
  const action = 'Practice Echo'
  if (load.state === 'loading') return pending('echo', 'Echo', action)
  if (load.state !== 'ready') return failed('echo', 'Echo', action)
  const { count, hasMore, latestAt } = load.data
  if (count === 0) return { id: 'echo', title: 'Echo', evidence: 'none', status: 'No saved activity', detail: 'Start an Echo study to begin your record.', latestAt: null, stage: null, action }
  return { id: 'echo', title: 'Echo', evidence: 'scored', status: 'Scored attempts saved', detail: `${count}${hasMore ? '+' : ''} saved ${count === 1 && !hasMore ? 'attempt' : 'attempts'}`, latestAt, stage: null, action }
}

/** `unsupported` means Ward practice is not saved to accounts in this session type, which is a fact, not an empty history. */
export function projectWard(load: TrackLoad<WardEvidence | null>): TrackProjection {
  if (load.state === 'loading') return pending('ward', 'Ward', 'Open Ward')
  if (load.state === 'error') return failed('ward', 'Ward', 'Open Ward')
  if (load.state === 'unsupported') {
    return { id: 'ward', title: 'Ward', evidence: 'not-recorded', status: 'Not recorded', detail: 'Ward practice isn’t saved to your account in this release.', latestAt: null, stage: null, action: 'Open Ward' }
  }
  if (!load.data) return { id: 'ward', title: 'Ward', evidence: 'none', status: 'No saved activity', detail: 'Open Ward to start a practice.', latestAt: null, stage: null, action: 'Open Ward' }
  const { stage, title, actionCount } = load.data
  const complete = stage === 'complete'
  return {
    id: 'ward',
    title: 'Ward',
    evidence: 'activity',
    status: complete ? 'Practice completed' : 'Practice in progress',
    detail: `${title} · ${plural(actionCount, 'recorded action', 'recorded actions')}`,
    latestAt: null,
    stage: { step: WARD_STAGES.indexOf(stage) + 1, of: WARD_STAGES.length, label: WARD_STAGE_LABELS[stage] },
    action: complete ? 'Review Ward practice' : 'Open Ward practice',
  }
}

export interface ProgressSummary {
  status: 'loading' | 'unavailable' | 'ready'
  /** Tracks with at least one saved record. Activity only; not completion, not competence. */
  activityTracks: number
  activityOf: number
  /** Scoreable tracks with at least one saved scored attempt. Attempt scores only; not competence. */
  scoredTracks: number
  scoredOf: number
}

/** Counts are shown only once every track has resolved; a failed load never becomes a zero. */
export function summarize(rows: readonly TrackProjection[]): ProgressSummary {
  const status = rows.some(row => row.evidence === 'loading') ? 'loading'
    : rows.some(row => row.evidence === 'unavailable') ? 'unavailable' : 'ready'
  return {
    status,
    activityTracks: rows.filter(row => row.evidence === 'activity' || row.evidence === 'scored').length,
    activityOf: rows.length,
    scoredTracks: rows.filter(row => row.evidence === 'scored').length,
    scoredOf: SCORED_TRACKS.length,
  }
}
