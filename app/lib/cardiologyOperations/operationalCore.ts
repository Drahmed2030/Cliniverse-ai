// operationalCore — Batch 10. Shared, version-neutral operational domain
// model for Cardiology Operations Intelligence v2. Every existing
// Cardiology Operations module (census, surgical list, notes/orders,
// handover) and the QAPAS-DIRECT Nexus pathway become VIEWS over this one
// model rather than separate mini-systems — see nexusOperationalProfile.ts
// for how the existing app/lib/cardiology/nexusCore.ts ledger is projected
// into this shape without being rewritten.
//
// Synthetic simulation only. No PHI, no real MRN, no real patient
// identifiers, no hospital data, no real communications, no order
// transmission, no autonomous escalation — see operationalEscalation.ts's
// header for the explicit boundary on what an escalation may and may not
// infer.

export type OperationalRoleId =
  | 'cardiology'
  | 'coordination'
  | 'cath_lab'
  | 'nursing'
  | 'quality'
  | 'referring_team'

export type OperationalEventType =
  | 'encounter.created'
  | 'work_item.created'
  | 'work_item.assigned'
  | 'work_item.acknowledged'
  | 'work_item.completed'
  | 'result.pending'
  | 'result.received'
  | 'procedure.prepared'
  | 'procedure.started'
  | 'handover.prepared'
  | 'handover.transferred'
  | 'escalation.raised'
  | 'escalation.acknowledged'
  | 'encounter.closed'

export interface OperationalEvidenceReference {
  /** Free-text pointer into an existing governed source — a nexusReferences.ts id, a source file path, or another evidence registry entry. Never a bare claim with no referenceIds. */
  referenceIds: readonly string[]
  /** Distinguishes an internationally-verified guideline from a locally-adopted policy from a rule this batch still needs local review for, from a rule that is simulation-only and will never be operational. Mirrors nexusReferences.ts's authority split, generalized beyond Nexus. */
  provenanceKind: 'international_reference' | 'local_adopted_policy' | 'local_review_required' | 'simulation_only_rule'
  sourceRef: string
}

export interface OperationalEventSource {
  system: string
  recordId: string
}

/** Append-only. Every event is immutable once recorded — see operationalEventLedger.ts's appendOperationalEvent for the only sanctioned way to add one. */
export interface OperationalEvent {
  eventId: string
  encounterId: string
  sequence: number
  type: OperationalEventType
  actorRole: OperationalRoleId
  actorId: string
  occurredAt: string
  recordedAt: string
  source: OperationalEventSource
  evidence: OperationalEvidenceReference
  /** Free-form, PHI-free structured payload (e.g. { workItemId, kind } for a work_item.* event). Never a natural-language clinical note. */
  payload: Readonly<Record<string, string | number | boolean | null>>
}

export type ClinicalWorkItemKind =
  | 'investigation'
  | 'result_review'
  | 'documentation'
  | 'referral'
  | 'procedure_prep'
  | 'follow_up'
  | 'handover'
  | 'coordination'
  | 'escalation'

export type ClinicalWorkItemStatus = 'open' | 'assigned' | 'acknowledged' | 'completed' | 'cancelled'
export type ClinicalWorkItemPriority = 'routine' | 'watch' | 'time_sensitive'
export type OperationalReviewStatus = 'reviewed' | 'pending_clinical_review' | 'simulation_only'

/**
 * Never places, approves, or transmits a clinical order — see
 * operationalWorkItems.ts's header. A ClinicalWorkItem records operational
 * acknowledgement/completion state ONLY, exactly like the legacy
 * OperationalTask contract it generalizes (app/lib/cardiology/types.ts).
 */
export interface ClinicalWorkItem {
  workItemId: string
  encounterId: string
  kind: ClinicalWorkItemKind
  status: ClinicalWorkItemStatus
  owner: OwnershipAssignment | null
  priority: ClinicalWorkItemPriority
  createdAt: string
  dueAt: string | null
  sourceRefs: readonly string[]
  relatedEventRefs: readonly string[]
  reviewStatus: OperationalReviewStatus
}

/** Ownership is never inferred from UI position (Section 5) — it exists only because an OwnershipAssignment was explicitly recorded, and every change to it must itself produce an operational event (work_item.assigned). */
export interface OwnershipAssignment {
  role: OperationalRoleId
  assignedAt: string
  assignedBy: OperationalRoleId
  /** The event that recorded this exact assignment — an OwnershipAssignment with no eventRef is invalid; see operationalWorkItems.ts's assignOwner. */
  eventRef: string
}

export type OperationalClockType =
  | 'first_medical_contact'
  | 'first_hospital_arrival'
  | 'receiving_hospital_arrival'
  | 'procedure_milestone'
  | 'handover_prepared'
  | 'closure'

export interface OperationalClock {
  clockType: OperationalClockType
  occurredAt: string
  eventRef: string
}

export type ProcedureBoardArea = 'cath_lab' | 'pci' | 'ep' | 'structural' | 'surgery' | 'tee' | 'transfer_prep'

export interface ProcedureChecklistItem {
  key: string
  label: string
  complete: boolean
}

/**
 * Supersedes the narrow "Surgical List" terminology (Section 6) — represents
 * any of Cath Lab / PCI / EP / structural / surgery / TEE / transfer
 * preparation. Readiness is DERIVED (see operationalProcedureBoard.ts), never
 * a stored boolean a UI can flip independently. No clinical scheduling or
 * hospital booking is implied — this is an internal simulation checklist
 * only.
 */
export interface ProcedureState {
  procedureId: string
  encounterId: string
  area: ProcedureBoardArea
  label: string
  window: string
  checklist: readonly ProcedureChecklistItem[]
  relatedWorkItemIds: readonly string[]
}

/**
 * Readiness fields are the INPUTS a UI may collect; `ready` itself must
 * always be derived by operationalHandover.ts's deriveHandoverReadiness,
 * never set directly by a UI toggle (Section 7's hard requirement).
 */
export interface HandoverState {
  encounterId: string
  note: string
  requiredWorkReviewed: boolean
  ownerConfirmed: boolean
  simulationConfirmed: boolean
  relatedWorkItemIds: readonly string[]
  updatedAt: string
}

export type OperationalEscalationReason =
  | 'no_owner'
  | 'overdue_work_item'
  | 'unresolved_result'
  | 'incomplete_handover'
  | 'incomplete_procedure_prep'

/**
 * Operational workflow signaling ONLY (Section 8). An EscalationState must
 * never claim to represent patient deterioration, diagnostic severity, or
 * treatment urgency unless that claim is backed by an
 * OperationalEvidenceReference pointing at governed source data — see
 * operationalEscalation.ts's deriveEscalations, which never sets
 * clinicalSeverityClaimed to true.
 */
export interface EscalationState {
  escalationId: string
  encounterId: string
  reason: OperationalEscalationReason
  raisedAt: string
  relatedWorkItemId: string | null
  acknowledgedAt: string | null
  /** Always false in this batch — no governed source of clinical severity is wired in. Kept explicit (not omitted) so a future integration cannot silently start claiming severity without a reviewable diff. */
  clinicalSeverityClaimed: false
}

export type OperationalEncounterStatus = 'active' | 'handover_ready' | 'closed'

export interface OperationalEncounter {
  encounterId: string
  status: OperationalEncounterStatus
  createdAt: string
  /** e.g. 'chest-pain' | 'stemi' | 'post-procedure' — kept as a free string here so this core stays agnostic of any one pathway's own vocabulary (Ward, QAPAS, a future pathway all use their own). */
  pathwayLabel: string
  location: string
}

export function isReviewedForOperationalUse(reviewStatus: OperationalReviewStatus): boolean {
  return reviewStatus === 'reviewed'
}
