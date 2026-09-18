import type { NexusCase, NexusClockEvent, NexusClockType, NexusRoleId, NexusTransitionEvent, NexusTransitionEventType } from '../cardiology/nexusCore.ts'
import { getNextTransition } from '../cardiology/nexusCore.ts'
import type { CareBeamStageDefinition } from './careBeam'
import type { ClinicalWorkItem, OperationalClock, OperationalClockType, OperationalEncounter, OperationalEvent, OperationalRoleId } from './operationalCore'
import type { OperationalKpiDefinition } from './operationalKpi'

// nexusOperationalProfile — Batch 10 Section 9. QAPAS-DIRECT stays exactly
// what it is (app/lib/cardiology/nexusCore.ts's own append-only transition
// engine, unchanged — this file does not delete or rewrite it). This is a
// READ-ONLY projection ("pathway profile") of an existing NexusCase onto
// the shared Operational Core, so Care Beam / Operational Pulse / the
// Ownership view can render QAPAS alongside every other Cardiology
// Operations module without QAPAS becoming a second, independently
// state-managed universe.
//
// Documented, deliberate scope limit: this profile projects the REAL
// recorded ledger (what already happened) plus the single next-authorized
// step (what could happen next) — it does NOT retroactively fabricate a
// ClinicalWorkItem for every already-completed transition, since no such
// work item ever really existed in the Nexus ledger. Full bidirectional
// integration (QapasDirectSimulation.tsx writing through the shared
// ledger instead of nexusCore.ts's own engine) is NOT done in this batch;
// nexusCore.ts's transition-rule engine remains the authority over what
// QAPAS itself may do, and this file only reads its output. See
// docs/CARDIOLOGY_OPERATIONS_V2.md Section 9 for the reconciliation
// decision record.

const ROLE_MAP: Record<NexusRoleId, OperationalRoleId> = {
  referring: 'referring_team',
  coordination: 'coordination',
  cardiology: 'cardiology',
  'cath-lab': 'cath_lab',
  quality: 'quality',
}

const CLOCK_MAP: Record<NexusClockType, OperationalClockType> = {
  'first-medical-contact': 'first_medical_contact',
  'first-hospital-arrival': 'first_hospital_arrival',
  'receiving-hospital-arrival': 'receiving_hospital_arrival',
  'procedure-milestone': 'procedure_milestone',
}

/**
 * Compresses NexusCase's 9 states onto Care Beam's 7 example stages
 * (Section 13): identity-linked and in-transport both read as
 * "Coordination" (both are pre-procedure logistics); cath-lab-activated
 * and arrived both read as "Procedure" (both are inside the procedure
 * window); episode-recorded reads as "Handover" (the procedure is done
 * and the episode is being handed to Quality); quality-validated is
 * "Closure". This is a documented compression, not a 1:1 semantic match.
 */
const TRANSITION_TO_BEAM_STAGE: Record<NexusTransitionEventType, string> = {
  'referral-received': 'referral',
  'review-completed': 'review',
  'acceptance-recorded': 'acceptance',
  'identity-linked': 'coordination',
  'transport-departed': 'coordination',
  'cath-lab-activated': 'procedure',
  'arrival-recorded': 'procedure',
  'episode-recorded': 'handover',
  'quality-validated': 'closure',
}

const TRANSITION_TO_EVENT_TYPE: Record<NexusTransitionEventType, OperationalEvent['type']> = {
  'referral-received': 'encounter.created',
  'review-completed': 'work_item.completed',
  'acceptance-recorded': 'work_item.completed',
  'identity-linked': 'work_item.completed',
  'transport-departed': 'work_item.completed',
  'cath-lab-activated': 'procedure.prepared',
  'arrival-recorded': 'procedure.started',
  'episode-recorded': 'handover.prepared',
  'quality-validated': 'encounter.closed',
}

export const CARDIAC_PATHWAY_BEAM_STAGES: readonly CareBeamStageDefinition[] = [
  { stageId: 'referral', label: 'Referral', matches: event => event.payload.beamStage === 'referral' },
  { stageId: 'review', label: 'Review', matches: event => event.payload.beamStage === 'review' },
  { stageId: 'acceptance', label: 'Acceptance', matches: event => event.payload.beamStage === 'acceptance' },
  { stageId: 'coordination', label: 'Coordination', matches: event => event.payload.beamStage === 'coordination' },
  { stageId: 'procedure', label: 'Procedure', matches: event => event.payload.beamStage === 'procedure', blockingEscalationReason: 'incomplete_procedure_prep' },
  { stageId: 'handover', label: 'Handover', matches: event => event.payload.beamStage === 'handover', blockingEscalationReason: 'incomplete_handover' },
  { stageId: 'closure', label: 'Closure', matches: event => event.payload.beamStage === 'closure' },
]

export const CARDIAC_PATHWAY_KPI_DEFINITIONS: readonly OperationalKpiDefinition[] = [
  { id: 'AHACAD2', label: 'First hospital to PCI', version: 'v1', startClock: 'first_hospital_arrival', endClock: 'procedure_milestone', targetMinutes: 120, referenceIds: ['AHA-KPI-LOCAL-AUDIT'] },
  { id: 'AHACAD8', label: 'First medical contact to PCI', version: 'v1', startClock: 'first_medical_contact', endClock: 'procedure_milestone', targetMinutes: null, referenceIds: ['AHA-KPI-LOCAL-AUDIT'] },
  { id: 'AHACAD9', label: 'Receiving hospital arrival to primary PCI', version: 'v1', startClock: 'receiving_hospital_arrival', endClock: 'procedure_milestone', targetMinutes: 90, referenceIds: ['AHA-KPI-LOCAL-AUDIT'] },
]

export interface NexusOperationalProjection {
  encounter: OperationalEncounter
  events: OperationalEvent[]
  clocks: OperationalClock[]
  /** Only the single next-authorized step, if any — see this file's header for why completed steps are not retroactively fabricated as work items. */
  pendingWorkItem: ClinicalWorkItem | null
}

export function projectNexusCaseToOperationalEncounter(nexusCase: NexusCase): NexusOperationalProjection {
  const events: OperationalEvent[] = []
  const clocks: OperationalClock[] = []

  nexusCase.events.forEach((nexusEvent, index) => {
    if (nexusEvent.kind === 'clock') {
      const clockEvent = nexusEvent as NexusClockEvent
      clocks.push({
        clockType: CLOCK_MAP[clockEvent.clockType],
        occurredAt: clockEvent.occurredAt,
        eventRef: `PROFILE-EVT-${nexusCase.caseId}-${String(index + 1).padStart(4, '0')}`,
      })
      return
    }

    const transitionEvent = nexusEvent as NexusTransitionEvent
    events.push({
      eventId: `PROFILE-EVT-${nexusCase.caseId}-${String(index + 1).padStart(4, '0')}`,
      encounterId: nexusCase.caseId,
      sequence: index + 1,
      type: TRANSITION_TO_EVENT_TYPE[transitionEvent.type],
      actorRole: ROLE_MAP[transitionEvent.actorRole],
      actorId: transitionEvent.actorId,
      occurredAt: transitionEvent.occurredAt,
      recordedAt: transitionEvent.recordedAt,
      source: { system: transitionEvent.source.system, recordId: transitionEvent.source.recordId },
      evidence: {
        referenceIds: transitionEvent.referenceIds,
        provenanceKind: 'local_review_required',
        sourceRef: 'app/lib/cardiology/nexusCore.ts (projected via nexusOperationalProfile.ts)',
      },
      payload: { beamStage: TRANSITION_TO_BEAM_STAGE[transitionEvent.type] },
    })
  })

  const nextTransition = getNextTransition(nexusCase.state)
  const pendingWorkItem: ClinicalWorkItem | null = nextTransition ? {
    workItemId: `OP-WI-${nexusCase.caseId}-NEXT`,
    encounterId: nexusCase.caseId,
    kind: 'coordination',
    status: 'open',
    owner: null,
    priority: 'time_sensitive',
    createdAt: nexusCase.events.at(-1)?.occurredAt ?? new Date(0).toISOString(),
    dueAt: null,
    sourceRefs: nextTransition.referenceIds,
    relatedEventRefs: [],
    reviewStatus: 'simulation_only',
  } : null

  return {
    encounter: {
      encounterId: nexusCase.caseId,
      status: nexusCase.state === 'quality-validated' ? 'closed' : 'active',
      createdAt: nexusCase.events[0]?.occurredAt ?? new Date(0).toISOString(),
      pathwayLabel: 'stemi',
      location: 'CARDIO-NEXUS-SIM',
    },
    events,
    clocks,
    pendingWorkItem,
  }
}
