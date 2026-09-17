// Non-sensitive, clinician-learning interest taxonomy only. This module must
// never model patient diagnoses, the user's own health conditions, or any
// psychological/political/religious/sensitive trait — see
// docs/ENGAGEMENT_PRIVACY_BOUNDARY_V1.md.

export const CLINICIAN_INTEREST_TOPICS = [
  'heart_failure',
  'hypertension',
  'ecg',
  'echo',
  'arrhythmia',
  'valvular_disease',
  'cardiomyopathy',
  'anticoagulation',
  'rare_cases',
  'clinical_trials',
  'new_drugs',
  'guidelines',
  'new_evidence',
] as const

export type ClinicianInterestTopic = typeof CLINICIAN_INTEREST_TOPICS[number]

export function isClinicianInterestTopic(value: string): value is ClinicianInterestTopic {
  return (CLINICIAN_INTEREST_TOPICS as readonly string[]).includes(value)
}

export type InterestSource = 'explicit' | 'behavioral'

export interface ClinicianInterestSignal {
  topic: ClinicianInterestTopic
  source: InterestSource
  /** 0..1. Required for behavioral signals — explicit selections are certain by definition. */
  confidence?: number
  updatedAt: string
}

export interface ClinicianInterestProfile {
  userId: string
  signals: ClinicianInterestSignal[]
}

export type InterestSignalValidation =
  | { ok: true; signal: ClinicianInterestSignal }
  | { ok: false; blockers: string[] }

export function validateInterestSignal(input: {
  topic: string
  source: string
  confidence?: number
  updatedAt: string
}): InterestSignalValidation {
  const blockers: string[] = []

  if (!isClinicianInterestTopic(input.topic)) blockers.push('topic-not-in-approved-taxonomy')
  if (input.source !== 'explicit' && input.source !== 'behavioral') blockers.push('source-must-be-explicit-or-behavioral')
  if (input.confidence !== undefined && (typeof input.confidence !== 'number' || Number.isNaN(input.confidence) || input.confidence < 0 || input.confidence > 1)) {
    blockers.push('confidence-must-be-between-0-and-1')
  }
  if (input.source === 'behavioral' && input.confidence === undefined) blockers.push('behavioral-signal-requires-confidence')
  if (!input.updatedAt || Number.isNaN(Date.parse(input.updatedAt))) blockers.push('updatedAt-must-be-a-valid-iso-timestamp')

  if (blockers.length) return { ok: false, blockers }
  return {
    ok: true,
    signal: {
      topic: input.topic as ClinicianInterestTopic,
      source: input.source as InterestSource,
      confidence: input.confidence,
      updatedAt: input.updatedAt,
    },
  }
}
