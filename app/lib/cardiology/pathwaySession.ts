import { z } from 'zod'
import {
  matchesConfiguredMarker,
  type SyntheticLeadId,
} from './ecgWaveform.ts'
import type { PathwayReplayReport } from './pathwayReplayAgents.ts'
import type { PathwayRegistrySnapshot } from './pathwayRegistrySnapshot.ts'
import {
  createCodeLabTrainingReceipt,
  parseCodeLabTrainingReceipt,
  type CodeLabTrainingCompletionReceipt,
} from '../codelab/trainingActivity.ts'
import {
  appendPathwayEvent,
  deriveStageFromEventHistory,
  parsePathwayEventHistory,
  pathwayEventHistorySchema,
  verifyPathwayEventChain,
  type PathwayEvent,
} from './pathwayEvent.ts'

// PathwaySession — Batch 7 v2. ADAPTED from ops/platform-governance-v1's
// app/lib/cardiology/pathwaySession.ts. The core state machine is a pure,
// deterministic reducer (replay → drill → reassessment → closure) — kept
// as-is rather than ported to XState v5. See "Orchestration decision"
// below for why.
//
// New in v2: every transition appends a hash-chained PathwayEvent (see
// pathwayEvent.ts) to session.events, so the session's current stage is
// always independently re-derivable from its own event history — not just
// asserted by the `stage` field. Receipts are now tamper-evident SHA-256
// structural receipts (see codelab/trainingActivity.ts), which makes
// receipt creation/validation async — every function that touches a
// receipt or appends an event is therefore async too.
//
// ── Orchestration decision (Batch 7 Section 2) ──────────────────────────
// XState v5 was evaluated and NOT adopted. This machine has exactly four
// linear stages and three guards (evidence/gap context valid; valid
// training receipt required; reassessment passed) — the existing
// hand-rolled pure-function reducer already satisfies every requirement
// XState would add: deterministic, serializable state, zero network calls,
// no actor complexity. Introducing a new state-machine dependency for a
// machine this small would be exactly the "large workflow engine" this
// batch's contract explicitly warns against, and this repo's established
// convention (see echoStudySessionController.ts, the pre-v2 version of
// this same file) is already this pattern. Revisit only if a future batch
// needs branching/parallel states this shape cannot express cleanly.

export const PATHWAY_SESSION_SCHEMA_VERSION = 3 as const
export const PATHWAY_SESSION_STORAGE_KEY = 'cliniverse_pathway_replay_session_v3'

export type PathwaySessionStage = 'replay' | 'drill' | 'reassessment' | 'closure'
export type PathwayDrillResult = 'not-submitted' | 'needs-review' | 'passed'

export interface PathwayReplaySession {
  schemaVersion: typeof PATHWAY_SESSION_SCHEMA_VERSION
  sessionId: string
  caseId: string
  activityId: PathwayReplayReport['training']['activityId']
  stage: PathwaySessionStage
  selectedLeads: SyntheticLeadId[]
  attempts: number
  drillResult: PathwayDrillResult
  trainingReceipt: CodeLabTrainingCompletionReceipt | null
  reassessment: {
    state: 'not-run' | 'passed'
    illustrativeMinutes: number | null
  }
  reviewCompleted: boolean
  /** Append-only, hash-chained. See pathwayEvent.ts. Never mutated in place — only ever appended to via appendPathwayEvent. */
  events: PathwayEvent[]
}

export interface PathwayClosureBrief {
  schemaVersion: '2.0'
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
    receipt: CodeLabTrainingCompletionReceipt
  }
  reassessment: {
    baselineMinutes: number | null
    illustrativeMinutes: number
    configuredTargetMinutes: number
    state: 'passed-in-simulation'
  }
  registry: PathwayRegistrySnapshot
  eventChain: {
    eventCount: number
    verified: boolean
    lastEventHash: string | null
  }
  closure: {
    /** Always 'human-review-required' — never auto-completed by AI, score, receipt, or replay state. See reviewCompleted for the one explicit, separate human action that can later clear it. */
    state: 'human-review-required'
    reasons: string[]
    reviewCompleted: boolean
  }
}

const STAGES: PathwaySessionStage[] = ['replay', 'drill', 'reassessment', 'closure']
const LEADS: SyntheticLeadId[] = ['II', 'V2', 'V3', 'V4']
export const PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES = 8

function newSessionId(): string {
  return `pathway-session-${crypto.randomUUID()}`
}

function newEventId(): string {
  return crypto.randomUUID()
}

export async function createPathwayReplaySession(report: PathwayReplayReport): Promise<PathwayReplaySession> {
  const sessionId = newSessionId()
  const events = await appendPathwayEvent([], {
    eventId: newEventId(),
    sessionId,
    eventType: 'pathway.opened',
    occurredAt: new Date().toISOString(),
    stage: 'replay',
    actorType: 'learner',
    evidenceRefs: [],
    payload: { caseId: report.caseId, pathwayVersion: report.pathwayVersion },
  })

  return {
    schemaVersion: PATHWAY_SESSION_SCHEMA_VERSION,
    sessionId,
    caseId: report.caseId,
    activityId: report.training.activityId,
    stage: 'replay',
    selectedLeads: [],
    attempts: 0,
    drillResult: 'not-submitted',
    trainingReceipt: null,
    reassessment: { state: 'not-run', illustrativeMinutes: null },
    reviewCompleted: false,
    events,
  }
}

/** Guard: replay → drill is always available once a report exists (evidence/gap context is the report itself); reassessment requires a valid training receipt; closure requires a passed reassessment. */
export function isPathwayStageAvailable(
  session: PathwayReplaySession,
  stage: PathwaySessionStage,
): boolean {
  if (stage === 'replay' || stage === 'drill') return true
  if (stage === 'reassessment') return session.trainingReceipt !== null
  return session.reassessment.state === 'passed'
}

export async function openPathwayStage(
  session: PathwayReplaySession,
  stage: PathwaySessionStage,
  report: PathwayReplayReport,
): Promise<PathwayReplaySession> {
  if (!isPathwayStageAvailable(session, stage) || session.stage === stage) return session

  const enteringDrillFirstTime = stage === 'drill' && session.stage === 'replay'
  let events = session.events

  if (enteringDrillFirstTime) {
    events = await appendPathwayEvent(events, {
      eventId: newEventId(),
      sessionId: session.sessionId,
      eventType: 'evidence.reviewed',
      occurredAt: new Date().toISOString(),
      stage: 'replay',
      actorType: 'learner',
      evidenceRefs: report.gap.evidenceIds,
      payload: { gapTitle: report.gap.title },
    })
  }

  if (stage === 'drill') {
    events = await appendPathwayEvent(events, {
      eventId: newEventId(), sessionId: session.sessionId, eventType: 'drill.started',
      occurredAt: new Date().toISOString(), stage: 'drill', actorType: 'learner',
      evidenceRefs: report.gap.evidenceIds, payload: { activityId: session.activityId },
    })
  } else if (stage === 'reassessment') {
    events = await appendPathwayEvent(events, {
      eventId: newEventId(), sessionId: session.sessionId, eventType: 'reassessment.started',
      occurredAt: new Date().toISOString(), stage: 'reassessment', actorType: 'learner',
      evidenceRefs: [], payload: { attempts: session.attempts },
    })
  }
  // Note: there is no 'closure' branch here — completePathwayReassessment is
  // the only path that ever transitions a session into 'closure', and it
  // appends closure.requested/review.pending itself (see its own comment).

  return { ...session, stage, events }
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

export async function submitPathwayDrill(
  session: PathwayReplaySession,
  report: PathwayReplayReport,
): Promise<PathwayReplaySession> {
  if (session.drillResult !== 'not-submitted' || session.selectedLeads.length === 0) return session
  if (session.caseId !== report.caseId || session.activityId !== report.training.activityId) return session

  const passed = matchesConfiguredMarker(session.selectedLeads)
  const attempts = session.attempts + 1

  let events = await appendPathwayEvent(session.events, {
    eventId: newEventId(), sessionId: session.sessionId, eventType: 'drill.submitted',
    occurredAt: new Date().toISOString(), stage: 'drill', actorType: 'learner',
    evidenceRefs: report.gap.evidenceIds, payload: { attempts, passed, selectedLeadCount: session.selectedLeads.length },
  })

  // A receipt is only ever created AFTER a passing submission is recorded as
  // its own event — never before, and never as a side effect of anything
  // other than this exact passing-drill path. See createCodeLabTrainingReceipt's
  // own header comment for the same rule stated at the receipt layer.
  const trainingReceipt = passed
    ? await createCodeLabTrainingReceipt({
        activityId: report.training.activityId,
        attempts,
        caseId: report.caseId,
        matchedLeadIds: session.selectedLeads,
        registrySnapshotId: report.training.registrySnapshotId,
        sourceRevisionIds: report.training.referenceIds,
      })
    : null

  if (trainingReceipt) {
    events = await appendPathwayEvent(events, {
      eventId: newEventId(), sessionId: session.sessionId, eventType: 'receipt.created',
      occurredAt: new Date().toISOString(), stage: 'drill', actorType: 'system',
      evidenceRefs: [], payload: { receiptId: trainingReceipt.receiptId, receiptHash: trainingReceipt.receiptHash },
    })
  }

  return {
    ...session,
    attempts,
    drillResult: passed ? 'passed' : 'needs-review',
    trainingReceipt,
    events,
  }
}

export function retryPathwayDrill(session: PathwayReplaySession): PathwayReplaySession {
  if (session.drillResult !== 'needs-review') return session
  return { ...session, selectedLeads: [], drillResult: 'not-submitted' }
}

export async function completePathwayReassessment(session: PathwayReplaySession): Promise<PathwayReplaySession> {
  if (!session.trainingReceipt) return session
  // This function is itself the replay -> closure transition (it sets stage
  // below), so the closure.requested / review.pending events belong here,
  // not in openPathwayStage — by the time a caller could call
  // openPathwayStage(session, 'closure', ...), session.stage is already
  // 'closure' and that function's own no-op guard would silently skip them.
  let events = await appendPathwayEvent(session.events, {
    eventId: newEventId(), sessionId: session.sessionId, eventType: 'reassessment.completed',
    occurredAt: new Date().toISOString(), stage: 'reassessment', actorType: 'learner',
    evidenceRefs: [], payload: { illustrativeMinutes: PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES },
  })
  events = await appendPathwayEvent(events, {
    eventId: newEventId(), sessionId: session.sessionId, eventType: 'closure.requested',
    occurredAt: new Date().toISOString(), stage: 'closure', actorType: 'learner',
    evidenceRefs: [], payload: {},
  })
  events = await appendPathwayEvent(events, {
    eventId: newEventId(), sessionId: session.sessionId, eventType: 'review.pending',
    occurredAt: new Date().toISOString(), stage: 'closure', actorType: 'system',
    evidenceRefs: [], payload: { reason: 'closure always requires explicit human review' },
  })
  return {
    ...session,
    stage: 'closure',
    reassessment: { state: 'passed', illustrativeMinutes: PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES },
    events,
  }
}

/**
 * Explicit, separate reviewer action — never called automatically by this
 * app. No UI in this batch invokes it (there is no reviewer-role surface
 * yet); it exists so a future governed reviewer workflow has a real,
 * event-sourced place to record review.completed without inventing a
 * second mechanism. Calling this does NOT change closure.state, which
 * remains 'human-review-required' permanently — it only records that the
 * required human review itself has now happened.
 */
export async function recordPathwayReviewCompletion(
  session: PathwayReplaySession,
  reviewer: { actorType: 'reviewer'; note: string },
): Promise<PathwayReplaySession> {
  if (session.stage !== 'closure') throw new Error('Review completion can only be recorded once closure has been reached.')
  const events = await appendPathwayEvent(session.events, {
    eventId: newEventId(), sessionId: session.sessionId, eventType: 'review.completed',
    occurredAt: new Date().toISOString(), stage: 'closure', actorType: reviewer.actorType,
    evidenceRefs: [], payload: { note: reviewer.note },
  })
  return { ...session, reviewCompleted: true, events }
}

export async function createPathwayClosureBrief(
  report: PathwayReplayReport,
  session: PathwayReplaySession,
): Promise<PathwayClosureBrief> {
  const receipt = await parseCodeLabTrainingReceipt(session.trainingReceipt, {
    activityId: report.training.activityId,
    caseId: report.caseId,
    registrySnapshotId: report.training.registrySnapshotId,
    sourceRevisionIds: report.training.referenceIds,
  })

  if (
    session.caseId !== report.caseId
    || session.activityId !== report.training.activityId
    || receipt === null
    || session.drillResult !== 'passed'
    || session.attempts !== receipt.assessment.attempts
    || !matchesConfiguredMarker(session.selectedLeads)
    || session.reassessment.state !== 'passed'
    || session.reassessment.illustrativeMinutes === null
  ) {
    throw new Error('A completed synthetic training and reassessment session is required.')
  }

  const chainVerification = await verifyPathwayEventChain(session.events)

  return {
    schemaVersion: '2.0',
    briefId: `${report.caseId}:${report.training.activityId}:brief-v2`,
    caseId: report.caseId,
    pathway: { label: report.pathwayLabel, version: report.pathwayVersion, dataMode: report.dataMode },
    gap: {
      title: report.gap.title,
      configuredRule: `${report.gap.rule.label} · ${report.gap.rule.version}`,
      evidenceIds: [...report.gap.evidenceIds],
      accountableRole: report.gap.owner,
    },
    training: {
      activityId: session.activityId,
      attempts: receipt.assessment.attempts,
      result: 'configured-marker-matched',
      matchedLeads: [...receipt.assessment.matchedLeadIds],
      receipt,
    },
    reassessment: {
      baselineMinutes: report.metrics.elapsedMinutes,
      illustrativeMinutes: session.reassessment.illustrativeMinutes,
      configuredTargetMinutes: report.metrics.targetMinutes,
      state: 'passed-in-simulation',
    },
    registry: {
      ...report.registry,
      sourceIds: [...report.registry.sourceIds],
      sources: report.registry.sources.map(source => ({ ...source })),
      clinicalExecution: { ...report.registry.clinicalExecution, reasons: [...report.registry.clinicalExecution.reasons] },
    },
    eventChain: {
      eventCount: session.events.length,
      verified: chainVerification.valid,
      lastEventHash: session.events.length ? session.events[session.events.length - 1].eventHash : null,
    },
    closure: {
      state: 'human-review-required',
      reasons: report.closure.reasons.length ? [...report.closure.reasons] : ['final reviewer decision remains required'],
      reviewCompleted: session.reviewCompleted,
    },
  }
}

export function serializePathwayReplaySession(session: PathwayReplaySession): string {
  return JSON.stringify(session)
}

// ── Zod restore boundary ────────────────────────────────────────────────
// Session restore from sessionStorage is exactly the kind of trust boundary
// Batch 7 Section 5 calls out. A malformed or tampered stored session must
// fail closed to a brand-new session, never partially trust stale data.

const pathwaySessionEnvelopeSchema = z.object({
  schemaVersion: z.literal(PATHWAY_SESSION_SCHEMA_VERSION),
  sessionId: z.string().min(1),
  caseId: z.string().min(1),
  activityId: z.literal('door-to-ecg-drill-v1'),
  stage: z.enum(['replay', 'drill', 'reassessment', 'closure']),
  selectedLeads: z.array(z.enum(LEADS as [SyntheticLeadId, ...SyntheticLeadId[]])),
  attempts: z.number().int().min(0),
  drillResult: z.enum(['not-submitted', 'needs-review', 'passed']),
  trainingReceipt: z.unknown().nullable(),
  reassessment: z.object({
    state: z.enum(['not-run', 'passed']),
    illustrativeMinutes: z.number().nullable(),
  }),
  reviewCompleted: z.boolean(),
  events: pathwayEventHistorySchema,
}).strict()

export async function parsePathwayReplaySession(
  raw: string | null,
  report: PathwayReplayReport,
): Promise<PathwayReplaySession> {
  const fallback = await createPathwayReplaySession(report)
  if (!raw) return fallback

  try {
    const parsed = pathwaySessionEnvelopeSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return fallback
    const candidate = parsed.data

    if (candidate.caseId !== report.caseId || candidate.activityId !== report.training.activityId) return fallback

    const verifiedEvents = await parsePathwayEventHistory(candidate.events)
    if (!verifiedEvents) return fallback
    if (verifiedEvents.some(item => item.sessionId !== candidate.sessionId)) return fallback

    const trainingReceipt = await parseCodeLabTrainingReceipt(candidate.trainingReceipt, {
      activityId: report.training.activityId,
      caseId: report.caseId,
      registrySnapshotId: report.training.registrySnapshotId,
      sourceRevisionIds: report.training.referenceIds,
    })
    const trainingCompleted = trainingReceipt !== null
    const reassessmentPassed = candidate.reassessment.state === 'passed'
      && candidate.reassessment.illustrativeMinutes === PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES
    const reassessmentNotRun = candidate.reassessment.state === 'not-run'
      && candidate.reassessment.illustrativeMinutes === null

    const derivedStage = deriveStageFromEventHistory(verifiedEvents)
    const rank: Record<PathwaySessionStage, number> = { replay: 0, drill: 1, reassessment: 2, closure: 3 }

    const structurallyValid = (candidate.trainingReceipt === null || trainingReceipt !== null)
      && (reassessmentPassed || reassessmentNotRun)
      && ((candidate.drillResult === 'passed') === trainingCompleted)
      && (candidate.drillResult !== 'passed' || matchesConfiguredMarker(candidate.selectedLeads))
      && (!trainingReceipt || trainingReceipt.assessment.attempts === candidate.attempts)
      && (candidate.drillResult !== 'needs-review' || (candidate.attempts > 0 && !matchesConfiguredMarker(candidate.selectedLeads)))
      && (!trainingCompleted || candidate.attempts > 0)
      && (!reassessmentPassed || trainingCompleted)
      && (candidate.stage !== 'reassessment' || trainingCompleted)
      && (candidate.stage !== 'closure' || reassessmentPassed)
      // The declared stage may never claim to be further along than the event
      // history actually reached — this is the event-sourcing cross-check.
      && rank[candidate.stage] <= rank[derivedStage]

    if (!structurallyValid) return fallback

    return {
      schemaVersion: PATHWAY_SESSION_SCHEMA_VERSION,
      sessionId: candidate.sessionId,
      caseId: report.caseId,
      activityId: report.training.activityId,
      stage: candidate.stage,
      selectedLeads: candidate.selectedLeads,
      attempts: candidate.attempts,
      drillResult: candidate.drillResult,
      trainingReceipt,
      reassessment: reassessmentPassed
        ? { state: 'passed', illustrativeMinutes: PATHWAY_ILLUSTRATIVE_REASSESSMENT_MINUTES }
        : { state: 'not-run', illustrativeMinutes: null },
      reviewCompleted: candidate.reviewCompleted,
      events: verifiedEvents,
    }
  } catch {
    return fallback
  }
}
