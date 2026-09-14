/** Editorial data only. This contract does not authorize publication. */
export interface LegacyCaseContent {
  id: string
  title: string
  tags: string[]
  difficulty: string
  mortality: string
  img: string
  history: string
  examination: string
  ecg: string
  labs: Record<string, string>
  imaging: Record<string, string>
  management: string[]
  teaching: string[]
  outcome: string
}

export interface MedicalCaseDraft {
  schemaVersion: 1
  id: string
  version: 1
  specialty: 'cardiology'
  status: 'draft'
  provenance: {
    repository: string
    commit: string
    path: string
    blob: string
    legacyId: string
    contentSha256: string
  }
  /** Exact historical text, including unverified claims. Never render as reviewed guidance. */
  legacyContent: LegacyCaseContent
  learningObjectives: string[]
  prerequisites: string[]
  decisionPoints: Array<{ id: string; prompt: string }>
  references: Array<{ id: string; url: string; supports: string[]; checkedAt: string }>
  mediaBindings: Array<{ id: string; sourceId: string; reviewId: string }>
  review: {
    status: 'pending'
    reviewer: null
    reviewedAt: null
    reviewDueAt: null
    licenseStatus: 'unverified'
    blockers: string[]
  }
}
