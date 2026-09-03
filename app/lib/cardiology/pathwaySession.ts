import {
  DOOR_TO_ECG_MARKER_LEADS,
  matchesConfiguredMarker,
  type SyntheticLeadId,
} from './ecgWaveform.ts'
import type { PathwayReplayReport } from './pathwayReplayAgents.ts'

export const PATHWAY_SESSION_SCHEMA_VERSION = 1 as const
export const PATHWAY_SESSION_STORAGE_KEY = 'cliniverse_pathway_replay_session_v1'

export type PathwaySessionStage = 'replay' | 'drill' | 'reassessment' | 'closure'
export type PathwayDrillResult = 'not-submitted' | 'needs-review' | 'passed'

export interface PathwayReplaySession {
  schemaVersion: typeof PATHWAY_SESSION_SCHEMA_VERSION
  caseId: string
  activityId: PathwayReplayReport['training']['activityId']
  stage: PathwaySessionStage
  selectedLeads: SyntheticLeadId[]
  attempts: number
  drillResult: PathwayDrillResult
  trainingCompleted: boolean
  reassessment: {
    state: 'not-run' | 'passed'
    illustrativeMinutes: number | null
  }
}

export interface PathwayClosureBrief {
  schemaVersion: '1.0'
  briefId: string
  caseId: string
  pathway: {
    label: string
    version: string
    dataMode: 'fictional-simulation'
  }
  gap: {
    title: string
    configuredRule: string
    evidenceIds: string[]
    accountableRole: string
  }
  training: {
    activityId: PathwayReplayReport['training']['activityId']
    attempts: number
    result: 'configured-marker-matched'
    matchedLeads: SyntheticLeadId[]
  }
  reassessment: {
    baselineMinutes: number | null
    illustrativeMinutes: number
    configuredTargetMinutes: number
    state: 'passed-in-simulation'
  }
  closure: {
    state: 'human-review-required'
    reasons: string[]
  }
}

const STAGES: PathwaySessionStage[] = ['replay', 'drill', 'reassessment', 'closure']
const LEADS: SyntheticLeadId[] = ['II', 'V2', 'V3', 'V4']
export const PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES = 8

export function createPathwayReplaySession(report: PathwayReplayReport): PathwayReplaySession {
  return {
    schemaVersion: PATHWAY_SESSION_SCHEMA_VERSION,
    caseId: report.caseId,
    activityId: report.training.activityId,
    stage: 'replay',
    selectedLeads: [],
    attempts: 0,
    drillResult: 'not-submitted',
    trainingCompleted: false,
    reassessment: {
      state: 'not-run',
      illustrativeMinutes: null,
    },
  }
}

export function isPathwayStageAvailable(
  session: PathwayReplaySession,
  stage: PathwaySessionStage,
): boolean {
  if (stage === 'replay' || stage === 'drill') return true
  if (stage === 'reassessment') return session.trainingCompleted
  return session.reassessment.state === 'passed'
}

export function openPathwayStage(
  session: PathwayReplaySession,
  stage: PathwaySessionStage,
): PathwayReplaySession {
  return isPathwayStageAvailable(session, stage) ? { ...session, stage } : session
}

export function togglePathwayLead(
  session: PathwayReplaySession,
  leadId: SyntheticLeadId,
): PathwayReplaySession {
  if (session.drillResult !== 'not-submitted') return session

  const selectedLeads = session.selectedLeads.includes(leadId)
    ? session.selectedLeads.filter(candidate => candidate !== leadId)
    : [...session.selectedLeads, leadId]

  return { ...session, selectedLeads }
}

export function submitPathwayDrill(session: PathwayReplaySession): PathwayReplaySession {
  if (session.drillResult !== 'not-submitted' || session.selectedLeads.length === 0) return session

  const passed = matchesConfiguredMarker(session.selectedLeads)
  return {
    ...session,
    attempts: session.attempts + 1,
    drillResult: passed ? 'passed' : 'needs-review',
    trainingCompleted: passed,
  }
}

export function retryPathwayDrill(session: PathwayReplaySession): PathwayReplaySession {
  if (session.drillResult !== 'needs-review') return session
  return {
    ...session,
    selectedLeads: [],
    drillResult: 'not-submitted',
  }
}

export function completePathwayReassessment(session: PathwayReplaySession): PathwayReplaySession {
  if (!session.trainingCompleted) return session
  return {
    ...session,
    stage: 'closure',
    reassessment: {
      state: 'passed',
      illustrativeMinutes: PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES,
    },
  }
}

export function createPathwayClosureBrief(
  report: PathwayReplayReport,
  session: PathwayReplaySession,
): PathwayClosureBrief {
  if (
    session.caseId !== report.caseId
    || session.activityId !== report.training.activityId
    || !session.trainingCompleted
    || session.drillResult !== 'passed'
    || session.attempts < 1
    || !matchesConfiguredMarker(session.selectedLeads)
    || session.reassessment.state !== 'passed'
    || session.reassessment.illustrativeMinutes === null
  ) {
    throw new Error('A completed synthetic training and reassessment session is required.')
  }

  return {
    schemaVersion: '1.0',
    briefId: `${report.caseId}:${report.training.activityId}:brief-v1`,
    caseId: report.caseId,
    pathway: {
      label: report.pathwayLabel,
      version: report.pathwayVersion,
      dataMode: report.dataMode,
    },
    gap: {
      title: report.gap.title,
      configuredRule: `${report.gap.rule.label} · ${report.gap.rule.version}`,
      evidenceIds: [...report.gap.evidenceIds],
      accountableRole: report.gap.owner,
    },
    training: {
      activityId: session.activityId,
      attempts: session.attempts,
      result: 'configured-marker-matched',
      matchedLeads: [...DOOR_TO_ECG_MARKER_LEADS],
    },
    reassessment: {
      baselineMinutes: report.metrics.elapsedMinutes,
      illustrativeMinutes: session.reassessment.illustrativeMinutes,
      configuredTargetMinutes: report.metrics.targetMinutes,
      state: 'passed-in-simulation',
    },
    closure: {
      state: 'human-review-required',
      reasons: report.closure.reasons.length
        ? [...report.closure.reasons]
        : ['final reviewer decision remains required'],
    },
  }
}

export function serializePathwayReplaySession(session: PathwayReplaySession): string {
  return JSON.stringify(session)
}

export function parsePathwayReplaySession(
  raw: string | null,
  report: PathwayReplayReport,
): PathwayReplaySession {
  const fallback = createPathwayReplaySession(report)
  if (!raw) return fallback

  try {
    const candidate = JSON.parse(raw) as Partial<PathwayReplaySession>
    const rawSelectedLeads = Array.isArray(candidate.selectedLeads) ? candidate.selectedLeads : []
    const selectedLeadsValid = Array.isArray(candidate.selectedLeads)
      && rawSelectedLeads.every(lead => LEADS.includes(lead as SyntheticLeadId))
      && new Set(rawSelectedLeads).size === rawSelectedLeads.length
    const selectedLeads = selectedLeadsValid ? rawSelectedLeads as SyntheticLeadId[] : []
    const stageValid = STAGES.includes(candidate.stage as PathwaySessionStage)
    const stage = stageValid
      ? candidate.stage as PathwaySessionStage
      : 'replay'
    const drillResultValid = ['not-submitted', 'needs-review', 'passed'].includes(candidate.drillResult ?? '')
    const drillResult = drillResultValid
      ? candidate.drillResult as PathwayDrillResult
      : 'not-submitted'
    const attempts = Number.isInteger(candidate.attempts) && Number(candidate.attempts) >= 0
      ? Number(candidate.attempts)
      : 0
    const trainingCompleted = candidate.trainingCompleted === true
    const reassessmentPassed = candidate.reassessment?.state === 'passed'
      && candidate.reassessment.illustrativeMinutes === PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES
    const reassessmentNotRun = candidate.reassessment?.state === 'not-run'
      && candidate.reassessment.illustrativeMinutes === null

    const structurallyValid = candidate.schemaVersion === PATHWAY_SESSION_SCHEMA_VERSION
      && candidate.caseId === report.caseId
      && candidate.activityId === report.training.activityId
      && selectedLeadsValid
      && stageValid
      && drillResultValid
      && (reassessmentPassed || reassessmentNotRun)
      && (drillResult !== 'passed' || (trainingCompleted && matchesConfiguredMarker(selectedLeads)))
      && (drillResult !== 'needs-review' || (attempts > 0 && !matchesConfiguredMarker(selectedLeads)))
      && (!trainingCompleted || drillResult === 'passed')
      && (!trainingCompleted || attempts > 0)
      && (!reassessmentPassed || trainingCompleted)
      && (stage !== 'reassessment' || trainingCompleted)
      && (stage !== 'closure' || reassessmentPassed)

    if (!structurallyValid) return fallback

    return {
      schemaVersion: PATHWAY_SESSION_SCHEMA_VERSION,
      caseId: report.caseId,
      activityId: report.training.activityId,
      stage,
      selectedLeads,
      attempts,
      drillResult,
      trainingCompleted,
      reassessment: reassessmentPassed
        ? { state: 'passed', illustrativeMinutes: PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES }
        : { state: 'not-run', illustrativeMinutes: null },
    }
  } catch {
    return fallback
  }
}
