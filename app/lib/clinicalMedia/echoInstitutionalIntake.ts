// EchoInstitutionalIntake — Batch 6. Architecture only, per Section 10 of
// the batch spec: "Prepare architecture only. Do NOT upload or ingest real
// patient studies." No UI route exists for this in Batch 6 — no page
// encourages or accepts a patient-data upload. This file exists so a real
// institutional pipeline has a governed state machine to slot into later,
// without any product surface implying that pipeline is usable today.

export type EchoInstitutionalIntakeState =
  | 'raw'
  | 'deidentification_pending'
  | 'deidentified'
  | 'review_pending'
  | 'approved_for_teaching'
  | 'rejected'

const ALLOWED_TRANSITIONS: Record<EchoInstitutionalIntakeState, readonly EchoInstitutionalIntakeState[]> = {
  raw: ['deidentification_pending', 'rejected'],
  deidentification_pending: ['deidentified', 'rejected'],
  deidentified: ['review_pending', 'rejected'],
  review_pending: ['approved_for_teaching', 'rejected'],
  approved_for_teaching: [],
  rejected: [],
}

export interface EchoInstitutionalIntakeRecord {
  intakeKey: string
  state: EchoInstitutionalIntakeState
  /** Only set once state reaches 'approved_for_teaching' — the study is not a governed Cliniverse teaching asset before that. */
  approvedTeachingStudyKey: string | null
}

export function canTransitionEchoInstitutionalIntake(from: EchoInstitutionalIntakeState, to: EchoInstitutionalIntakeState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}

export function transitionEchoInstitutionalIntake(
  record: EchoInstitutionalIntakeRecord,
  to: EchoInstitutionalIntakeState,
): EchoInstitutionalIntakeRecord {
  if (!canTransitionEchoInstitutionalIntake(record.state, to)) {
    throw new Error(`Echo institutional intake ${record.intakeKey} cannot move from '${record.state}' to '${to}'.`)
  }
  if (to === 'approved_for_teaching' && !record.approvedTeachingStudyKey) {
    throw new Error(`Echo institutional intake ${record.intakeKey} cannot reach 'approved_for_teaching' without an approvedTeachingStudyKey already set.`)
  }
  return { ...record, state: to }
}

/** Always false, regardless of state — an institutional intake record is never itself learner-reachable. Even 'approved_for_teaching' output must re-enter through the ordinary catalog/EchoStudyRecord path as a new, independently-governed study; this record is never surfaced to a learner directly. */
export function isEchoInstitutionalIntakeLearnerVisible(_record: EchoInstitutionalIntakeRecord): boolean {
  return false
}
