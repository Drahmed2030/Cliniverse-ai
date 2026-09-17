// Typed engagement event contract. Events carry only structured, non-clinical
// metadata — there is no free-text field anywhere in this contract, and the
// validator below rejects payloads that try to smuggle one in regardless.

export const ENGAGEMENT_EVENT_TYPES = [
  'app_opened',
  'onboarding_completed',
  'ward_case_opened',
  'ward_case_completed',
  'ecg_case_opened',
  'ecg_case_completed',
  'echo_study_opened',
  'echo_study_completed',
  'reference_opened',
  'evidence_article_opened',
  'clinical_trial_opened',
  'drug_reference_opened',
  'guideline_opened',
  'subscription_paywall_viewed',
  'subscription_started',
  'restore_purchases_requested',
] as const

export type EngagementEventType = typeof ENGAGEMENT_EVENT_TYPES[number]

export function isEngagementEventType(value: string): value is EngagementEventType {
  return (ENGAGEMENT_EVENT_TYPES as readonly string[]).includes(value)
}

// Events that only make sense tied to a real account — an anonymous/no-session
// caller must be rejected outright, never silently recorded under a
// fabricated or device-derived identity.
export const IDENTITY_REQUIRED_EVENT_TYPES: ReadonlySet<EngagementEventType> = new Set([
  'ward_case_completed',
  'ecg_case_completed',
  'echo_study_completed',
  'subscription_started',
  'restore_purchases_requested',
])

export interface EngagementEventProperties {
  caseId?: string
  studyId?: string
  articleId?: string
  trialId?: string
  drugId?: string
  guidelineId?: string
  topic?: string
  appPath?: string
  plan?: 'monthly' | 'yearly'
}

export interface EngagementEventInput {
  type: EngagementEventType
  userId: string | null
  properties?: EngagementEventProperties
  occurredAt: string
}

const DISALLOWED_PROPERTY_KEYS = new Set([
  'notes', 'note', 'freeText', 'free_text', 'comment', 'comments',
  'diagnosis', 'diagnoses', 'symptom', 'symptoms',
  'medicalHistory', 'medical_history', 'condition', 'conditions',
  'password', 'token', 'accessToken', 'access_token', 'refreshToken', 'refresh_token',
  'ssn', 'dob', 'dateOfBirth', 'date_of_birth',
  'patientName', 'patient_name', 'mrn', 'phone', 'address', 'email',
])

// Belt-and-suspenders text scan — even an allowed key must not carry a value
// that reads like clinical free text or an identifier for a real person.
const SENSITIVE_TEXT_PATTERN = /\b(diagnos\w*|patient|symptom\w*|\bmrn\b|\bssn\b|date of birth)\b/i
const MAX_STRUCTURED_VALUE_LENGTH = 200

export type EngagementEventValidation =
  | { ok: true; event: EngagementEventInput }
  | { ok: false; blockers: string[] }

export function validateEngagementEvent(input: {
  type: string
  userId: string | null
  properties?: Record<string, unknown>
  occurredAt: string
}): EngagementEventValidation {
  const blockers: string[] = []

  if (!isEngagementEventType(input.type)) blockers.push('event-type-not-in-taxonomy')
  if (!input.occurredAt || Number.isNaN(Date.parse(input.occurredAt))) blockers.push('occurredAt-must-be-a-valid-iso-timestamp')

  if (isEngagementEventType(input.type) && IDENTITY_REQUIRED_EVENT_TYPES.has(input.type) && !input.userId) {
    blockers.push('authenticated-user-id-required-for-this-event-type')
  }

  if (input.properties) {
    for (const [key, value] of Object.entries(input.properties)) {
      if (DISALLOWED_PROPERTY_KEYS.has(key)) { blockers.push(`disallowed-property:${key}`); continue }
      if (typeof value === 'string') {
        if (SENSITIVE_TEXT_PATTERN.test(value)) blockers.push(`sensitive-text-pattern:${key}`)
        if (value.length > MAX_STRUCTURED_VALUE_LENGTH) blockers.push(`property-too-long-for-structured-metadata:${key}`)
      }
    }
  }

  if (blockers.length) return { ok: false, blockers }
  return {
    ok: true,
    event: {
      type: input.type as EngagementEventType,
      userId: input.userId,
      properties: input.properties as EngagementEventProperties | undefined,
      occurredAt: input.occurredAt,
    },
  }
}
