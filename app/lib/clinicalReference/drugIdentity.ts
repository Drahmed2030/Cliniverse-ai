// DrugIdentity — Batch 8 Section 5. RxNorm is the canonical identity
// adapter — the rxcui is the identity key, never a local display name.
// Local display names (as typed by a learner in search) are only ever a
// search query into this adapter, never persisted as identity.

export interface DrugIdentityStrength {
  strength: string
  form: string
}

export interface DrugIdentity {
  rxcui: string
  genericName: string
  brandNames: readonly string[]
  ingredientIds: readonly { rxcui: string; name: string }[]
  strength: DrugIdentityStrength | null
  sourceVersion: string
  retrievedAt: string
}

export interface DrugIdentityLookupFailure {
  found: false
  query: string
  reason: 'not_found' | 'network_error'
}

export type DrugIdentityLookupResult =
  | { found: true; identity: DrugIdentity }
  | DrugIdentityLookupFailure

interface RxNormApiResponse {
  query: string
  found: boolean
  rxcui?: string
  genericName?: string
  brandNames?: string[]
  ingredientIds?: { rxcui: string; name: string }[]
  sourceVersion?: string
  retrievedAt?: string
  error?: string
}

/**
 * Fetches and normalizes a drug identity via the server-side /api/rxnorm
 * proxy (never calls RxNav directly from the client, and never embeds any
 * vendor secret — RxNav requires none, but the proxy boundary is kept
 * consistent with every other external adapter in this repo). Fails safe:
 * a stale/unknown name returns a typed failure, never a fabricated
 * identity.
 */
export async function lookupDrugIdentity(query: string): Promise<DrugIdentityLookupResult> {
  const trimmed = query.trim()
  if (!trimmed) return { found: false, query, reason: 'not_found' }

  let data: RxNormApiResponse
  try {
    const response = await fetch(`/api/rxnorm?drug=${encodeURIComponent(trimmed)}`)
    data = await response.json()
  } catch {
    return { found: false, query: trimmed, reason: 'network_error' }
  }

  if (!data.found || !data.rxcui || !data.genericName || !data.sourceVersion || !data.retrievedAt) {
    return { found: false, query: trimmed, reason: 'not_found' }
  }

  return {
    found: true,
    identity: {
      rxcui: data.rxcui,
      genericName: data.genericName,
      brandNames: data.brandNames ?? [],
      ingredientIds: data.ingredientIds ?? [],
      strength: null,
      sourceVersion: data.sourceVersion,
      retrievedAt: data.retrievedAt,
    },
  }
}

// ── Governed offline fallback ────────────────────────────────────────
// Preserved ONLY for the small set of seeded examples this batch's
// interaction/dosing registries reference (so those registries remain
// testable and usable without live network access in this sandbox or in
// CI). This is NOT a general offline drug database, and it is never used
// as a substitute for a real lookup when the network adapter is
// available — see resolveGovernedSeedIdentity's own guard.

// Every rxcui below was verified live against
// https://rxnav.nlm.nih.gov/REST/rxcui.json?name=<drug>&search=1 during
// this batch's implementation (not recalled from memory) — several
// initially-recalled values were wrong (e.g. warfarin, amiodarone,
// metformin, clopidogrel, omeprazole, metoprolol, morphine all differed
// from the live-verified rxcui) and were corrected before this seed was
// committed.
export const GOVERNED_SEED_DRUG_IDENTITIES: readonly DrugIdentity[] = [
  { rxcui: '11289', genericName: 'warfarin', brandNames: ['Coumadin'], ingredientIds: [{ rxcui: '11289', name: 'warfarin' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '1191', genericName: 'aspirin', brandNames: [], ingredientIds: [{ rxcui: '1191', name: 'aspirin' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '203114', genericName: 'amiodarone', brandNames: ['Cordarone', 'Pacerone'], ingredientIds: [{ rxcui: '203114', name: 'amiodarone' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '3407', genericName: 'digoxin', brandNames: ['Lanoxin'], ingredientIds: [{ rxcui: '3407', name: 'digoxin' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '235743', genericName: 'metformin', brandNames: ['Glucophage'], ingredientIds: [{ rxcui: '235743', name: 'metformin' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '4603', genericName: 'furosemide', brandNames: ['Lasix'], ingredientIds: [{ rxcui: '4603', name: 'furosemide' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '236991', genericName: 'clopidogrel', brandNames: ['Plavix'], ingredientIds: [{ rxcui: '236991', name: 'clopidogrel' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '283742', genericName: 'omeprazole', brandNames: ['Prilosec'], ingredientIds: [{ rxcui: '283742', name: 'omeprazole' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '29046', genericName: 'lisinopril', brandNames: ['Zestril'], ingredientIds: [{ rxcui: '29046', name: 'lisinopril' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '221124', genericName: 'metoprolol', brandNames: ['Lopressor', 'Toprol-XL'], ingredientIds: [{ rxcui: '221124', name: 'metoprolol' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '83367', genericName: 'atorvastatin', brandNames: ['Lipitor'], ingredientIds: [{ rxcui: '83367', name: 'atorvastatin' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
  { rxcui: '235751', genericName: 'morphine', brandNames: [], ingredientIds: [{ rxcui: '235751', name: 'morphine' }], strength: null, sourceVersion: 'governed-seed-v1', retrievedAt: '2026-09-18T00:00:00.000Z' },
] as const

export function findGovernedSeedIdentity(genericName: string): DrugIdentity | null {
  const normalized = genericName.trim().toLowerCase()
  return GOVERNED_SEED_DRUG_IDENTITIES.find(identity => identity.genericName === normalized) ?? null
}
