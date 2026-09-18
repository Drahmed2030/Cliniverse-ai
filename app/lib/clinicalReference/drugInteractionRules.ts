// DrugInteractionRule — Batch 8 Section 7. Replaces THREE superseded,
// architecturally unsafe variants found in the reconciliation audit:
//
//   - app/components/DrugInteractionChecker.tsx: called
//     https://api.anthropic.com/v1/messages directly from the CLIENT with
//     no auth header (would 401 as written) — REMOVE FROM LIVE PATH, not
//     reused. Broken and architecturally forbidden even if fixed.
//   - app/components/DrugInteractionAI.tsx: correctly server-proxied via
//     /api/generate-case, but still asks an LLM to INVENT interaction
//     severity/mechanism for arbitrary free-text drug pairs — REMOVE FROM
//     LIVE PATH. Architecturally forbidden by this batch's own contract
//     ("Do NOT use an LLM as drug-interaction authority") regardless of
//     how it's wired.
//   - app/components/ClinicalStrip.tsx's embedded DrugInteractionCard: a
//     hardcoded, string-keyed table of 9 real pairs (duplicated as 18
//     string keys for both orderings) — the most clinically sound of the
//     three. REUSED as the seed for this governed registry, restructured
//     with a proper symmetric lookup instead of duplicate string keys, a
//     controlled severity vocabulary, and rxcui-based drug identity
//     instead of free-text name matching.
//
// Clinical interaction truth here comes only from this hand-authored,
// rxcui-keyed registry — never from a client-side or server-side LLM call.
// An LLM may later EXPLAIN a rule already in this registry in simpler
// language, but this file is the only place a rule may be defined.

export type DrugInteractionSeverity = 'informational' | 'caution' | 'major' | 'contraindicated'
export type DrugInteractionReviewStatus = 'reviewed' | 'pending_clinical_review'

export interface DrugInteractionRule {
  interactionId: string
  /** rxcui of the first drug — identity, never a free-text name. */
  drugA: string
  drugALabel: string
  /** rxcui of the second drug. */
  drugB: string
  drugBLabel: string
  severity: DrugInteractionSeverity
  mechanism: string
  clinicalEffect: string
  /** Educational management guidance, not a prescribing command. */
  managementText: string
  sourceRefs: readonly string[]
  reviewStatus: DrugInteractionReviewStatus
  lastReviewed: string
}

// rxcui values match app/lib/clinicalReference/drugIdentity.ts's
// GOVERNED_SEED_DRUG_IDENTITIES — live-verified against RxNav, not
// recalled from memory (see that file's header comment).
const WARFARIN = '11289'
const ASPIRIN = '1191'
const AMIODARONE = '203114'
const DIGOXIN = '3407'
const METFORMIN = '235743'
const FUROSEMIDE = '4603'
const CLOPIDOGREL = '236991'
const OMEPRAZOLE = '283742'
const LISINOPRIL = '29046'
const METOPROLOL = '221124'
const ATORVASTATIN = '83367'
const MORPHINE = '235751'

export const DRUG_INTERACTION_RULES: readonly DrugInteractionRule[] = [
  {
    interactionId: 'warfarin-aspirin-v1',
    drugA: WARFARIN, drugALabel: 'warfarin', drugB: ASPIRIN, drugBLabel: 'aspirin',
    severity: 'major',
    mechanism: 'Additive antiplatelet + anticoagulant effect on hemostasis.',
    clinicalEffect: 'Increased bleeding risk.',
    managementText: 'Reference guidance suggests avoiding the combination where possible; if clinically necessary, guidance typically suggests PPI gastroprotection and closer INR monitoring.',
    sourceRefs: ['app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)'],
    reviewStatus: 'pending_clinical_review',
    lastReviewed: '2026-09-18',
  },
  {
    interactionId: 'amiodarone-digoxin-v1',
    drugA: AMIODARONE, drugALabel: 'amiodarone', drugB: DIGOXIN, drugBLabel: 'digoxin',
    severity: 'major',
    mechanism: 'Amiodarone inhibits P-glycoprotein and CYP3A4, reducing digoxin clearance.',
    clinicalEffect: 'Elevated digoxin levels and toxicity risk.',
    managementText: 'Reference guidance typically suggests reducing digoxin dose (often by around half) and monitoring levels/ECG when amiodarone is co-administered.',
    sourceRefs: ['app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)'],
    reviewStatus: 'pending_clinical_review',
    lastReviewed: '2026-09-18',
  },
  {
    interactionId: 'warfarin-amiodarone-v1',
    drugA: WARFARIN, drugALabel: 'warfarin', drugB: AMIODARONE, drugBLabel: 'amiodarone',
    severity: 'major',
    mechanism: 'Amiodarone inhibits CYP2C9, the primary metabolic pathway for warfarin.',
    clinicalEffect: 'Elevated INR and bleeding risk.',
    managementText: 'Reference guidance typically suggests an empiric warfarin dose reduction and closer INR monitoring when amiodarone is started or stopped.',
    sourceRefs: ['app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)'],
    reviewStatus: 'pending_clinical_review',
    lastReviewed: '2026-09-18',
  },
  {
    interactionId: 'metformin-furosemide-v1',
    drugA: METFORMIN, drugALabel: 'metformin', drugB: FUROSEMIDE, drugBLabel: 'furosemide',
    severity: 'caution',
    mechanism: 'Diuretic-induced dehydration/renal hypoperfusion can impair metformin clearance.',
    clinicalEffect: 'Increased lactic acidosis risk in the setting of dehydration or acute kidney injury.',
    managementText: 'Reference guidance typically suggests monitoring renal function and holding metformin if the patient becomes dehydrated or renal function declines acutely.',
    sourceRefs: ['app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)'],
    reviewStatus: 'pending_clinical_review',
    lastReviewed: '2026-09-18',
  },
  {
    interactionId: 'aspirin-clopidogrel-v1',
    drugA: ASPIRIN, drugALabel: 'aspirin', drugB: CLOPIDOGREL, drugBLabel: 'clopidogrel',
    severity: 'caution',
    mechanism: 'Dual antiplatelet therapy — additive antiplatelet effect.',
    clinicalEffect: 'Increased bleeding risk; this combination is also a recognized, intentional post-ACS regimen in appropriate patients.',
    managementText: 'Reference guidance frames this as an indicated combination for a defined period post-ACS in appropriate patients, typically with PPI gastroprotection; it is not automatically an error to see this pair together.',
    sourceRefs: ['app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)'],
    reviewStatus: 'pending_clinical_review',
    lastReviewed: '2026-09-18',
  },
  {
    interactionId: 'lisinopril-furosemide-v1',
    drugA: LISINOPRIL, drugALabel: 'lisinopril', drugB: FUROSEMIDE, drugBLabel: 'furosemide',
    severity: 'caution',
    mechanism: 'Synergistic blood-pressure lowering, particularly pronounced with the first dose in a volume-depleted patient.',
    clinicalEffect: 'First-dose hypotension.',
    managementText: 'Reference guidance typically suggests starting at a low dose and monitoring blood pressure, renal function and potassium after initiation or dose change.',
    sourceRefs: ['app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)'],
    reviewStatus: 'pending_clinical_review',
    lastReviewed: '2026-09-18',
  },
  {
    interactionId: 'omeprazole-clopidogrel-v1',
    drugA: OMEPRAZOLE, drugALabel: 'omeprazole', drugB: CLOPIDOGREL, drugBLabel: 'clopidogrel',
    severity: 'caution',
    mechanism: 'Omeprazole inhibits CYP2C19, which is required to activate the clopidogrel prodrug.',
    clinicalEffect: 'Potentially reduced clopidogrel antiplatelet efficacy.',
    managementText: 'Reference guidance typically suggests using a PPI with less CYP2C19 inhibition (e.g. pantoprazole) when gastroprotection is needed alongside clopidogrel.',
    sourceRefs: ['app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)'],
    reviewStatus: 'pending_clinical_review',
    lastReviewed: '2026-09-18',
  },
  {
    interactionId: 'atorvastatin-amiodarone-v1',
    drugA: ATORVASTATIN, drugALabel: 'atorvastatin', drugB: AMIODARONE, drugBLabel: 'amiodarone',
    severity: 'caution',
    mechanism: 'Amiodarone inhibits CYP3A4, a major metabolic pathway for atorvastatin.',
    clinicalEffect: 'Increased statin exposure and myopathy risk.',
    managementText: 'Reference guidance typically suggests capping the atorvastatin dose and monitoring for muscle symptoms (with CK if symptomatic) when co-administered with amiodarone.',
    sourceRefs: ['app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)'],
    reviewStatus: 'pending_clinical_review',
    lastReviewed: '2026-09-18',
  },
  {
    interactionId: 'morphine-metoprolol-v1',
    drugA: MORPHINE, drugALabel: 'morphine', drugB: METOPROLOL, drugBLabel: 'metoprolol',
    severity: 'informational',
    mechanism: 'Additive hemodynamic depressant effects (opioid + beta-blocker).',
    clinicalEffect: 'Possible additive hypotension and bradycardia.',
    managementText: 'Reference guidance typically suggests monitoring vital signs, with added caution in hemodynamically unstable patients.',
    sourceRefs: ['app/components/ClinicalStrip.tsx (pre-existing seed, restructured for Batch 8)'],
    reviewStatus: 'pending_clinical_review',
    lastReviewed: '2026-09-18',
  },
] as const

function pairKey(rxcuiA: string, rxcuiB: string): string {
  return [rxcuiA, rxcuiB].sort().join('|')
}

export function validateDrugInteractionRules(rules: readonly DrugInteractionRule[] = DRUG_INTERACTION_RULES): void {
  const ids = new Set<string>()
  const pairs = new Set<string>()
  for (const rule of rules) {
    if (!rule.interactionId.trim() || !rule.drugA.trim() || !rule.drugB.trim()) {
      throw new Error('Interaction rule identity and both drug rxcuis are required.')
    }
    if (rule.drugA === rule.drugB) throw new Error(`Interaction rule ${rule.interactionId} references the same drug twice.`)
    if (!rule.sourceRefs.length) throw new Error(`Interaction rule ${rule.interactionId} has no sourceRefs — severity may never be asserted unsourced.`)
    if (ids.has(rule.interactionId)) throw new Error(`Duplicate interactionId: ${rule.interactionId}`)
    ids.add(rule.interactionId)
    const key = pairKey(rule.drugA, rule.drugB)
    if (pairs.has(key)) throw new Error(`Duplicate interaction rule for pair ${key} (${rule.interactionId}) — a pair may only have one governed rule.`)
    pairs.add(key)
  }
}

/** Symmetric lookup — order of the two rxcuis never matters. Returns null (never fabricates) if no governed rule exists for the pair. */
export function findDrugInteractionRule(
  rxcuiA: string,
  rxcuiB: string,
  rules: readonly DrugInteractionRule[] = DRUG_INTERACTION_RULES,
): DrugInteractionRule | null {
  const key = pairKey(rxcuiA, rxcuiB)
  return rules.find(rule => pairKey(rule.drugA, rule.drugB) === key) ?? null
}

/** Checks every pairwise combination in a drug list against the governed registry — never invents a result for an unlisted pair. */
export function findDrugInteractionsAmong(
  rxcuis: readonly string[],
  rules: readonly DrugInteractionRule[] = DRUG_INTERACTION_RULES,
): DrugInteractionRule[] {
  const found: DrugInteractionRule[] = []
  for (let i = 0; i < rxcuis.length; i += 1) {
    for (let j = i + 1; j < rxcuis.length; j += 1) {
      const rule = findDrugInteractionRule(rxcuis[i], rxcuis[j], rules)
      if (rule) found.push(rule)
    }
  }
  return found
}
