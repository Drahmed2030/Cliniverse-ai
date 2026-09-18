import type { RenalFunctionBasis } from './renalFunction.ts'

// RenalDoseRule — Batch 8 Section 8. Replaces
// app/components/RenalDosingAI.tsx's client-side call to
// https://api.anthropic.com/v1/messages (no auth header — would 401 as
// written, and architecturally forbidden regardless: "Do NOT use an LLM
// as dose authority"). The 8-drug renal-adjustment table itself was
// reasonable content — REUSED as the seed here, restructured into typed,
// governed rules with an explicit renalFunctionBasis (all 'egfr', matching
// the original's raw eGFR-slider input) and no patient-specific output
// framing. UI copy must say "Reference dosing information", never
// "Recommended dose for this patient" (Section 8's explicit requirement).

export type RenalDoseReviewStatus = 'reviewed' | 'pending_clinical_review'

export interface RenalDoseThreshold {
  /** Inclusive lower bound of the eGFR range this threshold applies to, in mL/min/1.73m². */
  minEgfr: number
  /** Inclusive upper bound. Use a large number (e.g. 999) for "and above". */
  maxEgfr: number
  doseText: string
  frequencyText: string
  contraindicated: boolean
  note: string
}

export interface RenalDoseRule {
  drugRxcui: string
  drugName: string
  renalFunctionBasis: RenalFunctionBasis
  normalDoseText: string
  thresholds: readonly RenalDoseThreshold[]
  monitoringText: string
  cautionText: string
  sourceRefs: readonly string[]
  labelRevision: string
  reviewStatus: RenalDoseReviewStatus
}

// Every drugRxcui below was verified live against
// https://rxnav.nlm.nih.gov/REST/rxcui.json?name=<drug>&search=1 during
// this batch's implementation (gentamicin and amoxicillin-clavulanate
// initially-recalled values were wrong and were corrected before commit —
// same discipline as drugIdentity.ts's governed seed).
export const RENAL_DOSE_RULES: readonly RenalDoseRule[] = [
  {
    drugRxcui: '11124', drugName: 'vancomycin', renalFunctionBasis: 'egfr',
    normalDoseText: '15-20 mg/kg IV every 8-12 hours',
    thresholds: [
      { minEgfr: 60, maxEgfr: 999, doseText: '15-20 mg/kg', frequencyText: 'every 8-12 hours', contraindicated: false, note: 'Standard dosing; reference guidance typically suggests level monitoring.' },
      { minEgfr: 30, maxEgfr: 59, doseText: '15-20 mg/kg', frequencyText: 'every 24 hours', contraindicated: false, note: 'Extended interval; reference guidance typically targets a trough around 15-20 mg/L or an AUC-guided target where available.' },
      { minEgfr: 15, maxEgfr: 29, doseText: '15-20 mg/kg', frequencyText: 'every 48 hours', contraindicated: false, note: 'Close monitoring typically suggested; check levels before each dose per reference guidance.' },
      { minEgfr: 0, maxEgfr: 14, doseText: '15-20 mg/kg', frequencyText: 'every 72-96 hours', contraindicated: false, note: 'Hemodialysis patients: reference guidance typically suggests dosing after dialysis, level-guided.' },
    ],
    monitoringText: 'Trough 15-20 mg/L, or AUC-guided monitoring where available.',
    cautionText: 'Nephrotoxic — reference guidance typically suggests avoiding concurrent NSAIDs/aminoglycosides where possible.',
    sourceRefs: ['app/components/RenalDosingAI.tsx (pre-existing seed, restructured for Batch 8)'],
    labelRevision: 'seed-v1-2026-09-18',
    reviewStatus: 'pending_clinical_review',
  },
  {
    drugRxcui: '1596450', drugName: 'gentamicin', renalFunctionBasis: 'egfr',
    normalDoseText: '5-7 mg/kg IV every 24 hours',
    thresholds: [
      { minEgfr: 60, maxEgfr: 999, doseText: '5-7 mg/kg', frequencyText: 'every 24 hours', contraindicated: false, note: 'Standard once-daily dosing per reference guidance.' },
      { minEgfr: 40, maxEgfr: 59, doseText: '4-5 mg/kg', frequencyText: 'every 36 hours', contraindicated: false, note: 'Reduced dose and extended interval typically suggested.' },
      { minEgfr: 20, maxEgfr: 39, doseText: '3-4 mg/kg', frequencyText: 'every 48 hours', contraindicated: false, note: 'Level monitoring typically considered essential at this range.' },
      { minEgfr: 0, maxEgfr: 19, doseText: '2 mg/kg', frequencyText: 'every 72+ hours', contraindicated: false, note: 'Reference guidance typically suggests avoiding if an alternative exists; hemodialysis patients dosed post-dialysis.' },
    ],
    monitoringText: 'Peak 5-10 mg/L, trough <1 mg/L (reference ranges).',
    cautionText: 'Highly nephrotoxic and ototoxic — reference guidance typically suggests avoiding in CKD if alternatives exist.',
    sourceRefs: ['app/components/RenalDosingAI.tsx (pre-existing seed, restructured for Batch 8)'],
    labelRevision: 'seed-v1-2026-09-18',
    reviewStatus: 'pending_clinical_review',
  },
  {
    drugRxcui: '235743', drugName: 'metformin', renalFunctionBasis: 'egfr',
    normalDoseText: '500-1000 mg twice daily',
    thresholds: [
      { minEgfr: 60, maxEgfr: 999, doseText: '500-1000 mg', frequencyText: 'twice daily', contraindicated: false, note: 'Full dose per reference guidance.' },
      { minEgfr: 45, maxEgfr: 59, doseText: '500-1000 mg', frequencyText: 'twice daily', contraindicated: false, note: 'Reference guidance typically suggests continuing with caution and monitoring renal function every 3-6 months.' },
      { minEgfr: 30, maxEgfr: 44, doseText: '500 mg', frequencyText: 'twice daily', contraindicated: false, note: 'Reference guidance typically suggests a reduced dose with closer monitoring.' },
      { minEgfr: 0, maxEgfr: 29, doseText: 'not applicable', frequencyText: 'not applicable', contraindicated: true, note: 'Reference guidance typically treats this range as contraindicated due to lactic acidosis risk.' },
    ],
    monitoringText: 'eGFR every 3-6 months per reference guidance.',
    cautionText: 'Reference guidance typically suggests holding before iodinated-contrast procedures or surgery; lactic acidosis risk rises as eGFR falls below 30.',
    sourceRefs: ['app/components/RenalDosingAI.tsx (pre-existing seed, restructured for Batch 8)'],
    labelRevision: 'seed-v1-2026-09-18',
    reviewStatus: 'pending_clinical_review',
  },
  {
    drugRxcui: '67108', drugName: 'enoxaparin', renalFunctionBasis: 'egfr',
    normalDoseText: '1 mg/kg SC twice daily (therapeutic)',
    thresholds: [
      { minEgfr: 30, maxEgfr: 999, doseText: '1 mg/kg', frequencyText: 'SC twice daily', contraindicated: false, note: 'Standard therapeutic dose per reference guidance.' },
      { minEgfr: 15, maxEgfr: 29, doseText: '1 mg/kg', frequencyText: 'SC once daily', contraindicated: false, note: 'Reference guidance typically suggests reducing to once daily and monitoring anti-Xa where available.' },
      { minEgfr: 0, maxEgfr: 14, doseText: '0.5-1 mg/kg', frequencyText: 'SC once daily', contraindicated: false, note: 'Higher bleeding risk; reference guidance often favors unfractionated heparin if feasible, anti-Xa guided if enoxaparin is used.' },
    ],
    monitoringText: 'Anti-Xa 0.5-1.0 IU/mL (therapeutic reference range).',
    cautionText: 'Accumulates in renal failure — reference guidance often favors unfractionated heparin in severe CKD.',
    sourceRefs: ['app/components/RenalDosingAI.tsx (pre-existing seed, restructured for Batch 8)'],
    labelRevision: 'seed-v1-2026-09-18',
    reviewStatus: 'pending_clinical_review',
  },
  {
    drugRxcui: '19711', drugName: 'amoxicillin-clavulanate', renalFunctionBasis: 'egfr',
    normalDoseText: '625 mg three times daily, or 1 g twice daily',
    thresholds: [
      { minEgfr: 30, maxEgfr: 999, doseText: '625 mg', frequencyText: 'three times daily', contraindicated: false, note: 'Standard dosing per reference guidance.' },
      { minEgfr: 10, maxEgfr: 29, doseText: '625 mg', frequencyText: 'twice daily', contraindicated: false, note: 'Reduced frequency typically suggested.' },
      { minEgfr: 0, maxEgfr: 9, doseText: '625 mg', frequencyText: 'once daily', contraindicated: false, note: 'Hemodialysis patients: reference guidance typically suggests dosing after dialysis.' },
    ],
    monitoringText: 'Clinical response; LFTs if prolonged use, per reference guidance.',
    cautionText: 'Cholestatic jaundice risk with prolonged use.',
    sourceRefs: ['app/components/RenalDosingAI.tsx (pre-existing seed, restructured for Batch 8)'],
    labelRevision: 'seed-v1-2026-09-18',
    reviewStatus: 'pending_clinical_review',
  },
  {
    drugRxcui: '3407', drugName: 'digoxin', renalFunctionBasis: 'egfr',
    normalDoseText: '125-250 mcg once daily',
    thresholds: [
      { minEgfr: 60, maxEgfr: 999, doseText: '125-250 mcg', frequencyText: 'once daily', contraindicated: false, note: 'Standard dosing; reference guidance typically suggests level monitoring.' },
      { minEgfr: 30, maxEgfr: 59, doseText: '125 mcg', frequencyText: 'once daily', contraindicated: false, note: 'Reduced dose typically suggested; check levels.' },
      { minEgfr: 10, maxEgfr: 29, doseText: '62.5-125 mcg', frequencyText: 'once daily', contraindicated: false, note: 'Reference guidance typically suggests caution and frequent levels.' },
      { minEgfr: 0, maxEgfr: 9, doseText: '62.5 mcg', frequencyText: 'once daily or every other day', contraindicated: false, note: 'Reference guidance typically suggests avoiding if possible given toxicity risk.' },
    ],
    monitoringText: 'Digoxin level 0.5-1.0 ng/mL (heart-failure reference range); check potassium.',
    cautionText: 'Narrow therapeutic index — hypokalemia increases toxicity risk.',
    sourceRefs: ['app/components/RenalDosingAI.tsx (pre-existing seed, restructured for Batch 8)'],
    labelRevision: 'seed-v1-2026-09-18',
    reviewStatus: 'pending_clinical_review',
  },
  {
    drugRxcui: '35296', drugName: 'ramipril', renalFunctionBasis: 'egfr',
    normalDoseText: '2.5-10 mg once daily',
    thresholds: [
      { minEgfr: 30, maxEgfr: 999, doseText: '2.5-10 mg', frequencyText: 'once daily', contraindicated: false, note: 'Standard dosing; reference guidance typically suggests monitoring potassium and creatinine.' },
      { minEgfr: 10, maxEgfr: 29, doseText: '1.25-5 mg', frequencyText: 'once daily', contraindicated: false, note: 'Reference guidance typically suggests starting low and watching for hyperkalemia.' },
      { minEgfr: 0, maxEgfr: 9, doseText: 'use caution', frequencyText: 'not applicable', contraindicated: false, note: 'Reference guidance typically suggests specialist input; dosing in dialysis patients is variable.' },
    ],
    monitoringText: 'Urea and electrolytes 1-2 weeks after starting or changing dose; reference guidance typically suggests stopping if creatinine rises more than ~30%.',
    cautionText: 'Reference guidance typically suggests stopping if acute kidney injury develops; avoid with potassium-sparing diuretics.',
    sourceRefs: ['app/components/RenalDosingAI.tsx (pre-existing seed, restructured for Batch 8)'],
    labelRevision: 'seed-v1-2026-09-18',
    reviewStatus: 'pending_clinical_review',
  },
  {
    drugRxcui: '25480', drugName: 'gabapentin', renalFunctionBasis: 'egfr',
    normalDoseText: '300-1200 mg three times daily',
    thresholds: [
      { minEgfr: 60, maxEgfr: 999, doseText: '300-1200 mg', frequencyText: 'three times daily', contraindicated: false, note: 'Standard dosing per reference guidance.' },
      { minEgfr: 30, maxEgfr: 59, doseText: '300-600 mg', frequencyText: 'twice daily', contraindicated: false, note: 'Reduced dose and frequency typically suggested.' },
      { minEgfr: 15, maxEgfr: 29, doseText: '300 mg', frequencyText: 'once or twice daily', contraindicated: false, note: 'Significant reduction typically suggested.' },
      { minEgfr: 0, maxEgfr: 14, doseText: '300 mg', frequencyText: 'once daily', contraindicated: false, note: 'Hemodialysis patients: reference guidance typically suggests 200-300 mg after each session.' },
    ],
    monitoringText: 'Clinical response; sedation and dizziness are common per reference guidance.',
    cautionText: 'Sedating — caution in elderly patients; respiratory depression risk.',
    sourceRefs: ['app/components/RenalDosingAI.tsx (pre-existing seed, restructured for Batch 8)'],
    labelRevision: 'seed-v1-2026-09-18',
    reviewStatus: 'pending_clinical_review',
  },
] as const

export function validateRenalDoseRules(rules: readonly RenalDoseRule[] = RENAL_DOSE_RULES): void {
  const seen = new Set<string>()
  for (const rule of rules) {
    if (!rule.drugRxcui.trim() || !rule.drugName.trim()) throw new Error('Renal dose rule requires drug identity.')
    if (rule.renalFunctionBasis === 'none') throw new Error(`Renal dose rule for ${rule.drugName} must declare a real renalFunctionBasis, not 'none'.`)
    if (!rule.sourceRefs.length) throw new Error(`Renal dose rule for ${rule.drugName} has no sourceRefs.`)
    if (!rule.thresholds.length) throw new Error(`Renal dose rule for ${rule.drugName} has no thresholds.`)
    if (seen.has(rule.drugRxcui)) throw new Error(`Duplicate renal dose rule for rxcui ${rule.drugRxcui}`)
    seen.add(rule.drugRxcui)
  }
}

/** Never silently falls back to a default threshold — throws if no threshold covers the supplied eGFR, so a caller can never receive dosing for a range this rule doesn't actually cover. */
export function resolveRenalDoseThreshold(rule: RenalDoseRule, egfr: number): RenalDoseThreshold {
  const threshold = rule.thresholds.find(candidate => egfr >= candidate.minEgfr && egfr <= candidate.maxEgfr)
  if (!threshold) throw new Error(`No renal dose threshold for ${rule.drugName} covers eGFR ${egfr}.`)
  return threshold
}

export function findRenalDoseRule(rxcui: string, rules: readonly RenalDoseRule[] = RENAL_DOSE_RULES): RenalDoseRule | null {
  return rules.find(rule => rule.drugRxcui === rxcui) ?? null
}
