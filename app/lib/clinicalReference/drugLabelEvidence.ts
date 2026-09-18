// DrugLabelEvidence — Batch 8 Section 6. Normalizes DailyMed/SPL search
// results into concise metadata + a source link. Never copies large
// protected label text into the app — dosageSection/renalImpairmentSection
// etc. below are populated only from a governed, human-authored seed (see
// GOVERNED_SEED_LABEL_EVIDENCE), never scraped or LLM-summarized from the
// live label body. The live DailyMed adapter (lookupDrugLabelCandidates)
// returns only identity/version/link metadata, which is safe to display
// unreviewed; the narrative sections require a human-reviewed seed entry.

export interface DrugLabelCandidate {
  setId: string
  title: string
  labelVersion: number | null
  effectiveDate: string | null
  sourceUrl: string
}

export interface DrugLabelCandidateLookupResult {
  found: boolean
  query: string
  candidates: readonly DrugLabelCandidate[]
}

interface DailyMedApiResponse {
  query?: string
  found: boolean
  results?: DrugLabelCandidate[]
  error?: string
}

/** Live DailyMed search via the server-side /api/dailymed proxy — identity/version/link metadata only, safe to show without clinical review. */
export async function lookupDrugLabelCandidates(query: string): Promise<DrugLabelCandidateLookupResult> {
  const trimmed = query.trim()
  if (!trimmed) return { found: false, query, candidates: [] }

  try {
    const response = await fetch(`/api/dailymed?drug=${encodeURIComponent(trimmed)}`)
    const data: DailyMedApiResponse = await response.json()
    return { found: Boolean(data.found), query: trimmed, candidates: data.results ?? [] }
  } catch {
    return { found: false, query: trimmed, candidates: [] }
  }
}

export type DrugLabelReviewStatus = 'reviewed' | 'pending_clinical_review'

export interface DrugLabelEvidence {
  rxcui: string
  drugName: string
  setId: string
  labelVersion: number
  effectiveDate: string
  /** Concise, human-authored summary — never a copy of protected label text. */
  dosageSection: string
  renalImpairmentSection: string
  contraindications: readonly string[]
  warnings: readonly string[]
  sourceUrl: string
  retrievedAt: string
  reviewStatus: DrugLabelReviewStatus
}

/**
 * Governed seed of concise, human-authored label evidence summaries for
 * the same small drug set the interaction/dosing registries reference.
 * All marked pending_clinical_review — a summary written for this batch,
 * not independently clinically re-verified against the live SPL text.
 * Narrative label content must never be presented as learner-ready
 * "reviewed" truth without an actual clinical review pass.
 */
export const GOVERNED_SEED_LABEL_EVIDENCE: readonly DrugLabelEvidence[] = [
  {
    rxcui: '235743',
    drugName: 'metformin',
    setId: 'seed-metformin-v1',
    labelVersion: 1,
    effectiveDate: '2026-09-18',
    dosageSection: 'Typically initiated at a low dose and titrated; commonly dosed twice daily with meals to reduce GI side effects.',
    renalImpairmentSection: 'Contraindicated at severely reduced eGFR due to lactic acidosis risk; dose reduction and closer monitoring are typically advised at moderately reduced eGFR. See a governed RenalDoseRule for the specific threshold used in this app.',
    contraindications: ['Severe renal impairment', 'Acute or chronic metabolic acidosis'],
    warnings: ['Lactic acidosis risk', 'Hold before iodinated contrast procedures per local protocol'],
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/',
    retrievedAt: '2026-09-18T00:00:00.000Z',
    reviewStatus: 'pending_clinical_review',
  },
  {
    rxcui: '11289',
    drugName: 'warfarin',
    setId: 'seed-warfarin-v1',
    labelVersion: 1,
    effectiveDate: '2026-09-18',
    dosageSection: 'Individualized based on INR response; typically initiated at a low dose with frequent INR monitoring during titration.',
    renalImpairmentSection: 'No specific renal dose adjustment is typically required, but bleeding risk should be monitored more closely in renal impairment.',
    contraindications: ['Active pathological bleeding', 'Pregnancy (per label)'],
    warnings: ['Bleeding risk', 'Numerous drug-drug and drug-food interactions'],
    sourceUrl: 'https://dailymed.nlm.nih.gov/dailymed/',
    retrievedAt: '2026-09-18T00:00:00.000Z',
    reviewStatus: 'pending_clinical_review',
  },
] as const

export function findGovernedSeedLabelEvidence(rxcui: string): DrugLabelEvidence | null {
  return GOVERNED_SEED_LABEL_EVIDENCE.find(entry => entry.rxcui === rxcui) ?? null
}
