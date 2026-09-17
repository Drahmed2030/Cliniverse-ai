import type { ClinicianInterestTopic } from './interests'

// Domain model only — no digest is generated or sent in this batch. See
// EngagementProvider.sendEvidenceDigest, which is a stub in this release.

export type EvidenceType = 'guideline' | 'trial' | 'review' | 'case_series' | 'drug_update' | 'registry_data'

export interface EvidenceDigestItem {
  id: string
  title: string
  topic: ClinicianInterestTopic
  sourceName: string
  sourceUrl: string
  publishedAt: string
  evidenceType: EvidenceType
  /** Human-authored/curated only — no AI-generated medical claim in this release. */
  shortSummary: string
  whyItMatters: string
  appPath: string
}

export type DigestFrequency = 'weekly' | 'biweekly' | 'monthly'

export interface EvidenceDigest {
  userId: string
  topics: ClinicianInterestTopic[]
  items: EvidenceDigestItem[]
  generatedAt: string
  frequency: DigestFrequency
}

export type EvidenceDigestItemValidation =
  | { ok: true; item: EvidenceDigestItem }
  | { ok: false; blockers: string[] }

export function validateEvidenceDigestItem(input: EvidenceDigestItem): EvidenceDigestItemValidation {
  const blockers: string[] = []
  if (!input.id.trim()) blockers.push('id-required')
  if (!input.title.trim()) blockers.push('title-required')
  if (!/^https:\/\//.test(input.sourceUrl)) blockers.push('sourceUrl-must-be-https')
  if (!input.publishedAt || Number.isNaN(Date.parse(input.publishedAt))) blockers.push('publishedAt-must-be-a-valid-iso-timestamp')
  if (!input.appPath.startsWith('/')) blockers.push('appPath-must-be-a-root-relative-path')
  if (input.shortSummary.length > 400) blockers.push('shortSummary-too-long')
  if (input.whyItMatters.length > 400) blockers.push('whyItMatters-too-long')
  if (blockers.length) return { ok: false, blockers }
  return { ok: true, item: input }
}
