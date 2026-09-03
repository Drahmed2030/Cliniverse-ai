import type { NexusEventSource, NexusRoleId } from './nexusCore'

export type ReplayDataMode = 'fictional-simulation' | 'real-patient'
export type ReplayAgentState = 'complete' | 'ready' | 'human-review'
export type ReplayIntegrityState = 'complete' | 'delayed' | 'missing' | 'conflict'

export interface ReplayEventInput {
  id: string
  label: string
  sequence: number
  occurredAt: string | null
  owner: NexusRoleId
  source: NexusEventSource
}

export interface ReplayRule {
  id: string
  label: string
  version: string
  startEventId: string
  endEventId: string
  targetMinutes: number
  owner: NexusRoleId
  referenceIds: string[]
}

export interface PathwayReplayInput {
  caseId: string
  pathwayLabel: string
  pathwayVersion: string
  dataMode: ReplayDataMode
  events: ReplayEventInput[]
  primaryRule: ReplayRule
}

export interface ReplayEvent extends ReplayEventInput {
  integrity: ReplayIntegrityState
  displayTime: string
}

export interface ReplayAgentResult {
  id:
    | 'intake-normalization'
    | 'timeline-integrity'
    | 'kpi-computation'
    | 'gap-attribution'
    | 'training-orchestration'
    | 'governance-closure'
  label: string
  state: ReplayAgentState
  output: string
  evidenceIds: string[]
  requiresHumanReview: boolean
}

export interface PathwayReplayReport {
  caseId: string
  pathwayLabel: string
  pathwayVersion: string
  dataMode: 'fictional-simulation'
  events: ReplayEvent[]
  agents: ReplayAgentResult[]
  metrics: {
    elapsedMinutes: number | null
    targetMinutes: number
    deltaMinutes: number | null
    status: 'within-target' | 'at-risk' | 'not-measured'
    completenessPercent: number
    openSafetyGates: number
  }
  gap: {
    title: string
    explanation: string
    rule: ReplayRule
    evidenceIds: string[]
    owner: NexusRoleId
    classification: 'draft-operational-delay' | 'not-identified'
    requiresHumanReview: true
  }
  training: {
    activityId: 'targeted-shift-handover-v1'
    label: string
    durationMinutes: number
    state: 'ready'
  }
  closure: {
    state: 'blocked' | 'review-required'
    reasons: string[]
    requiresHumanReview: true
  }
}

const AGENT_LABELS: Record<ReplayAgentResult['id'], string> = {
  'intake-normalization': 'Intake & normalization',
  'timeline-integrity': 'Timeline integrity',
  'kpi-computation': 'KPI computation',
  'gap-attribution': 'Gap attribution',
  'training-orchestration': 'Training orchestration',
  'governance-closure': 'Governance & closure',
}

export const STEMI_REPLAY_DEMO: PathwayReplayInput = {
  caseId: 'SIM-REPLAY-001',
  pathwayLabel: 'STEMI Pathway Replay',
  pathwayVersion: '1.0-demo',
  dataMode: 'fictional-simulation',
  primaryRule: {
    id: 'DEMO-DOOR-ECG-01',
    label: 'Door to ECG demonstration threshold',
    version: '1.0-demo',
    startEventId: 'arrival',
    endEventId: 'ecg',
    targetMinutes: 10,
    owner: 'quality',
    referenceIds: ['DEMO-PATHWAY-RULESET-V1'],
  },
  events: [
    event('arrival', 'ER arrival', 1, '2026-01-15T08:00:00.000Z', 'coordination'),
    event('ecg', 'ECG acquired', 2, '2026-01-15T08:12:00.000Z', 'referring'),
    event('activation', 'STEMI activation recorded', 3, '2026-01-15T08:18:00.000Z', 'cardiology'),
    event('cardiology-notified', 'Cardiology notified', 4, '2026-01-15T08:20:00.000Z', 'cardiology'),
    event('transfer-ready', 'Transfer readiness confirmed', 5, '2026-01-15T08:28:00.000Z', 'coordination'),
    event('cath-lab-ack', 'Cath Lab acknowledged', 6, '2026-01-15T08:34:00.000Z', 'cath-lab'),
    event('cath-lab-arrival', 'Cath Lab arrival', 7, null, 'cath-lab'),
  ],
}

export function runPathwayReplay(input: PathwayReplayInput): PathwayReplayReport {
  if (input.dataMode !== 'fictional-simulation') {
    throw new Error('Clinical Pathway Replay v1 accepts fictional simulation data only.')
  }

  const normalized = [...input.events]
    .map(item => ({ ...item, label: item.label.trim() }))
    .sort((left, right) => left.sequence - right.sequence)

  const duplicateSequences = new Set<number>()
  const seenSequences = new Set<number>()
  for (const item of normalized) {
    if (seenSequences.has(item.sequence)) duplicateSequences.add(item.sequence)
    seenSequences.add(item.sequence)
  }

  const timeline = normalized.map((item, index): ReplayEvent => {
    const previous = normalized[index - 1]
    const invalidTime = item.occurredAt !== null && !Number.isFinite(Date.parse(item.occurredAt))
    const outOfOrder = Boolean(
      previous?.occurredAt && item.occurredAt
      && Date.parse(item.occurredAt) < Date.parse(previous.occurredAt),
    )
    const integrity: ReplayIntegrityState = item.occurredAt === null
      ? 'missing'
      : duplicateSequences.has(item.sequence) || invalidTime || outOfOrder
        ? 'conflict'
        : 'complete'

    return {
      ...item,
      integrity,
      displayTime: item.occurredAt && !invalidTime
        ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }).format(new Date(item.occurredAt))
        : '—',
    }
  })

  const start = timeline.find(item => item.id === input.primaryRule.startEventId)
  const end = timeline.find(item => item.id === input.primaryRule.endEventId)
  const elapsedMinutes = start?.occurredAt && end?.occurredAt
    ? Math.round((Date.parse(end.occurredAt) - Date.parse(start.occurredAt)) / 60_000)
    : null
  const deltaMinutes = elapsedMinutes === null ? null : elapsedMinutes - input.primaryRule.targetMinutes
  const metricStatus = elapsedMinutes === null
    ? 'not-measured' as const
    : elapsedMinutes > input.primaryRule.targetMinutes
      ? 'at-risk' as const
      : 'within-target' as const
  const measuredCount = timeline.filter(item => item.occurredAt !== null && item.integrity !== 'conflict').length
  const completenessPercent = Math.round((measuredCount / Math.max(timeline.length, 1)) * 100)
  const integrityGaps = timeline.filter(item => item.integrity === 'missing' || item.integrity === 'conflict')
  const gapEvidenceIds = [start?.id, end?.id].filter((value): value is string => Boolean(value))
  const hasDelay = deltaMinutes !== null && deltaMinutes > 0

  const gap: PathwayReplayReport['gap'] = {
    title: hasDelay
      ? `${input.primaryRule.label} exceeded by ${deltaMinutes} minutes`
      : 'No operational delay identified by the configured demonstration rule',
    explanation: hasDelay
      ? `The synthetic interval was ${elapsedMinutes} minutes against a configured ${input.primaryRule.targetMinutes}-minute demonstration threshold.`
      : 'The configured demonstration rule did not identify a delay. Human review is still required.',
    rule: input.primaryRule,
    evidenceIds: gapEvidenceIds,
    owner: input.primaryRule.owner,
    classification: hasDelay ? 'draft-operational-delay' : 'not-identified',
    requiresHumanReview: true,
  }

  const closureReasons = [
    ...(integrityGaps.length ? [`${integrityGaps.length} timeline evidence gap remains open`] : []),
    ...(hasDelay ? ['draft delay attribution requires human confirmation'] : []),
  ]

  const agents: ReplayAgentResult[] = [
    agent('intake-normalization', 'complete', `${normalized.length} events normalized`, normalized.map(item => item.id), false),
    agent('timeline-integrity', 'complete', `${integrityGaps.length} missing or conflicting timestamp`, integrityGaps.map(item => item.id), false),
    agent('kpi-computation', 'complete', elapsedMinutes === null ? 'Interval not measured' : `Interval calculated: ${elapsedMinutes} min`, gapEvidenceIds, false),
    agent('gap-attribution', 'human-review', hasDelay ? 'Draft operational category prepared' : 'No draft category prepared', gapEvidenceIds, true),
    agent('training-orchestration', 'ready', 'Targeted Shift ready', gapEvidenceIds, false),
    agent('governance-closure', 'human-review', closureReasons.length ? 'Closure blocked by open evidence' : 'Reviewer closure required', [...gapEvidenceIds, ...integrityGaps.map(item => item.id)], true),
  ]

  return {
    caseId: input.caseId,
    pathwayLabel: input.pathwayLabel,
    pathwayVersion: input.pathwayVersion,
    dataMode: 'fictional-simulation',
    events: timeline.map(item => item.id === input.primaryRule.endEventId && hasDelay ? { ...item, integrity: 'delayed' } : item),
    agents,
    metrics: {
      elapsedMinutes,
      targetMinutes: input.primaryRule.targetMinutes,
      deltaMinutes,
      status: metricStatus,
      completenessPercent,
      openSafetyGates: closureReasons.length,
    },
    gap,
    training: {
      activityId: 'targeted-shift-handover-v1',
      label: 'Targeted Shift: pathway handover',
      durationMinutes: 4,
      state: 'ready',
    },
    closure: {
      state: closureReasons.length ? 'blocked' : 'review-required',
      reasons: closureReasons,
      requiresHumanReview: true,
    },
  }
}

function event(
  id: string,
  label: string,
  sequence: number,
  occurredAt: string | null,
  owner: NexusRoleId,
): ReplayEventInput {
  return {
    id,
    label,
    sequence,
    occurredAt,
    owner,
    source: { system: 'cliniverse-replay-synthetic', recordId: `SIM-${id.toUpperCase()}` },
  }
}

function agent(
  id: ReplayAgentResult['id'],
  state: ReplayAgentState,
  output: string,
  evidenceIds: string[],
  requiresHumanReview: boolean,
): ReplayAgentResult {
  return { id, label: AGENT_LABELS[id], state, output, evidenceIds, requiresHumanReview }
}
