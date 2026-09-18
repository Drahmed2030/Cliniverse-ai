import type { ClinicalCalculatorDefinition } from './calculatorContract.ts'
import { validateClinicalCalculatorDefinition } from './calculatorContract.ts'

// CLINICAL_CALCULATOR_REGISTRY — Batch 8. Replaces
// app/components/ClinicalCalculators.tsx's hardcoded CALCULATORS array.
//
// Audit findings from the superseded component (Batch 8 Section 2), fixed
// here:
//
// 1. CHA2DS2-VASc double-counted age: age65 ("65-74") and age75 ("≥75")
//    were two INDEPENDENT booleans, so both could be toggled true at once
//    (impossible in reality — a patient is in exactly one age band) and
//    the max score was 10, not the correct 9. Fixed below: age is one
//    mutually-exclusive select field with three options (<65/65-74/≥75),
//    each declaring its own points — it is now structurally impossible to
//    double-count.
// 2. CHA2DS2-VASc positioning: the 2024 ESC atrial fibrillation guideline
//    reclassified female sex as a risk-MODIFIER rather than an independent
//    point-scoring criterion for anticoagulation decisions, favoring the
//    sex-neutral CHA2DS2-VA score for that decision. Both variants are
//    registered below rather than silently picking one; `positioningNote`
//    makes the relationship explicit instead of leaving it implicit.
// 3. qSOFA said "Activate sepsis protocol immediately" for a score ≥2.
//    qSOFA (Sepsis-3, Singer et al. JAMA 2016) is a bedside PROMPT to
//    trigger further evaluation for organ dysfunction/sepsis — not an
//    order to activate a protocol by itself, and it has since been shown
//    to have limited sensitivity as a sole screening tool. Corrected below
//    to "warrants further assessment for organ dysfunction/sepsis."
// 4. Unsourced "Based on validated clinical guidelines • 2026" and
//    "Updated with 2026 Guidelines" footer claims are gone — every band
//    below carries its own dated sourceRefs instead of one blanket claim.
//
// eGFR/CKD-EPI does NOT live here — see the mislabeling finding in
// app/lib/clinicalReference/renalFunction.ts's header comment. This
// registry only holds additive scoring instruments.

const CHA2DS2_VASC_SHARED_BANDS = [
  {
    id: 'low',
    label: 'Low',
    minScore: 0,
    maxScore: 0,
    riskDescription: 'Annual stroke risk in the original validation cohort was approximately 0% at a score of 0.',
    managementGuidance: 'Reference guidance from the cited source generally does not favor anticoagulation at this score alone.',
    sourceRefs: ['Lip GYH et al. Chest 2010;137(2):263-272 (CHA2DS2-VASc derivation)'],
  },
  {
    id: 'moderate',
    label: 'Moderate',
    minScore: 1,
    maxScore: 1,
    riskDescription: 'Annual stroke risk in the original validation cohort was approximately 1.3% at a score of 1.',
    managementGuidance: 'Reference guidance suggests anticoagulation may be considered, with the decision weighted by whether the single point is due to sex alone — see the CHA2DS2-VA positioning note.',
    sourceRefs: ['Lip GYH et al. Chest 2010;137(2):263-272 (CHA2DS2-VASc derivation)'],
  },
  {
    id: 'high',
    label: 'High',
    minScore: 2,
    maxScore: 9,
    riskDescription: 'Annual stroke risk in the original validation cohort rose with each additional point at scores ≥2.',
    managementGuidance: 'Reference guidance generally favors anticoagulation at this score range, pending individualized bleeding-risk assessment.',
    sourceRefs: ['Lip GYH et al. Chest 2010;137(2):263-272 (CHA2DS2-VASc derivation)'],
  },
] as const

const AGE_BAND_OPTIONS = [
  { id: 'under65', label: 'Age < 65 years', points: 0 },
  { id: '65to74', label: 'Age 65-74 years', points: 1 },
  { id: '75plus', label: 'Age >= 75 years', points: 2 },
] as const

const CHA2DS2_VASC: ClinicalCalculatorDefinition = {
  calculatorId: 'cha2ds2_vasc',
  name: 'CHA2DS2-VASc',
  version: '2010.1',
  clinicalDomain: 'cardiology',
  intendedUse: 'Educational reference for atrial fibrillation stroke-risk stratification concepts. Not a substitute for guideline-directed clinical judgment.',
  inputs: [
    { id: 'chf', label: 'Congestive heart failure / LV dysfunction', type: 'boolean', points: 1 },
    { id: 'htn', label: 'Hypertension', type: 'boolean', points: 1 },
    { id: 'age_band', label: 'Age', type: 'select', options: [...AGE_BAND_OPTIONS] },
    { id: 'dm', label: 'Diabetes mellitus', type: 'boolean', points: 1 },
    { id: 'stroke_tia_thromboembolism', label: 'Prior stroke / TIA / thromboembolism', type: 'boolean', points: 2 },
    { id: 'vascular_disease', label: 'Vascular disease (MI, PAD, aortic plaque)', type: 'boolean', points: 1 },
    { id: 'female_sex', label: 'Female sex', type: 'boolean', points: 1 },
  ],
  outputUnit: 'points',
  interpretationBands: CHA2DS2_VASC_SHARED_BANDS,
  sourceRefs: ['Lip GYH et al. Chest 2010;137(2):263-272 (CHA2DS2-VASc derivation)'],
  sourceRevision: '2010',
  reviewStatus: 'pending_clinical_review',
  learnerReadiness: 'review_required',
  positioningNote: 'The 2024 ESC atrial fibrillation guideline favors the sex-neutral CHA2DS2-VA score (see calculatorId "cha2ds2_va" in this registry) for anticoagulation-initiation decisions, treating female sex as a risk-modifying rather than independently scored factor. CHA2DS2-VASc remains presented here for reference and comparison.',
}

const CHA2DS2_VA: ClinicalCalculatorDefinition = {
  calculatorId: 'cha2ds2_va',
  name: 'CHA2DS2-VA',
  version: '2024.1',
  clinicalDomain: 'cardiology',
  intendedUse: 'Educational reference for the sex-neutral atrial fibrillation stroke-risk variant favored by the 2024 ESC guideline for anticoagulation-initiation decisions.',
  inputs: [
    { id: 'chf', label: 'Congestive heart failure / LV dysfunction', type: 'boolean', points: 1 },
    { id: 'htn', label: 'Hypertension', type: 'boolean', points: 1 },
    { id: 'age_band', label: 'Age', type: 'select', options: [...AGE_BAND_OPTIONS] },
    { id: 'dm', label: 'Diabetes mellitus', type: 'boolean', points: 1 },
    { id: 'stroke_tia_thromboembolism', label: 'Prior stroke / TIA / thromboembolism', type: 'boolean', points: 2 },
    { id: 'vascular_disease', label: 'Vascular disease (MI, PAD, aortic plaque)', type: 'boolean', points: 1 },
  ],
  outputUnit: 'points',
  interpretationBands: [
    { id: 'low', label: 'Low', minScore: 0, maxScore: 0, riskDescription: 'Lowest risk category in this sex-neutral variant.', managementGuidance: 'Reference guidance from the cited source generally does not favor anticoagulation at this score alone.', sourceRefs: ['2024 ESC Guidelines for the management of atrial fibrillation (ESC AF Guidelines 2024)'] },
    { id: 'high', label: 'Elevated', minScore: 1, maxScore: 8, riskDescription: 'Elevated risk category; risk generally rises with each additional point.', managementGuidance: 'Reference guidance generally favors anticoagulation consideration at this score range, pending individualized bleeding-risk assessment.', sourceRefs: ['2024 ESC Guidelines for the management of atrial fibrillation (ESC AF Guidelines 2024)'] },
  ],
  sourceRefs: ['2024 ESC Guidelines for the management of atrial fibrillation (ESC AF Guidelines 2024)'],
  sourceRevision: '2024',
  reviewStatus: 'pending_clinical_review',
  learnerReadiness: 'review_required',
  positioningNote: 'Sex-neutral successor to CHA2DS2-VASc (calculatorId "cha2ds2_vasc" in this registry) for anticoagulation-initiation decisions per the 2024 ESC guideline.',
}

const TIMI_NSTEMI: ClinicalCalculatorDefinition = {
  calculatorId: 'timi_nstemi',
  name: 'TIMI Risk Score (NSTEMI/UA)',
  version: '2000.1',
  clinicalDomain: 'cardiology',
  intendedUse: 'Educational reference for NSTEMI/unstable angina risk stratification concepts.',
  inputs: [
    { id: 'age_65_plus', label: 'Age >= 65 years', type: 'boolean', points: 1 },
    { id: 'cad_risk_factors_3_plus', label: '>=3 CAD risk factors', type: 'boolean', points: 1 },
    { id: 'known_cad_stenosis', label: 'Known CAD (stenosis >=50%)', type: 'boolean', points: 1 },
    { id: 'aspirin_past_7_days', label: 'Aspirin use in past 7 days', type: 'boolean', points: 1 },
    { id: 'severe_angina_24h', label: '>=2 anginal events in prior 24h', type: 'boolean', points: 1 },
    { id: 'st_deviation', label: 'ST deviation >=0.5mm on presenting ECG', type: 'boolean', points: 1 },
    { id: 'elevated_troponin', label: 'Elevated cardiac biomarkers', type: 'boolean', points: 1 },
  ],
  outputUnit: 'points',
  interpretationBands: [
    { id: 'low', label: 'Low', minScore: 0, maxScore: 2, riskDescription: '14-day composite endpoint (death, MI, or urgent revascularization) rate approximately 4.7-8.3% in the derivation cohort.', managementGuidance: 'Reference guidance associates this range with a conservative-strategy discussion; individualized assessment is required.', sourceRefs: ['Antman EM et al. JAMA 2000;284(7):835-842 (TIMI risk score derivation)'] },
    { id: 'intermediate', label: 'Intermediate', minScore: 3, maxScore: 4, riskDescription: '14-day composite endpoint rate approximately 13.2-19.9% in the derivation cohort.', managementGuidance: 'Reference guidance associates this range with consideration of an early invasive strategy; individualized assessment is required.', sourceRefs: ['Antman EM et al. JAMA 2000;284(7):835-842 (TIMI risk score derivation)'] },
    { id: 'high', label: 'High', minScore: 5, maxScore: 7, riskDescription: '14-day composite endpoint rate approximately 26.2-40.9% in the derivation cohort.', managementGuidance: 'Reference guidance associates this range with consideration of an urgent invasive strategy; individualized assessment is required.', sourceRefs: ['Antman EM et al. JAMA 2000;284(7):835-842 (TIMI risk score derivation)'] },
  ],
  sourceRefs: ['Antman EM et al. JAMA 2000;284(7):835-842 (TIMI risk score derivation)'],
  sourceRevision: '2000',
  reviewStatus: 'pending_clinical_review',
  learnerReadiness: 'review_required',
}

const WELLS_PE: ClinicalCalculatorDefinition = {
  calculatorId: 'wells_pe',
  name: 'Wells Score for Pulmonary Embolism',
  version: '2000.1',
  clinicalDomain: 'pulmonology',
  intendedUse: 'Educational reference for pulmonary embolism pretest-probability concepts.',
  inputs: [
    { id: 'dvt_signs', label: 'Clinical signs/symptoms of DVT', type: 'boolean', points: 3 },
    { id: 'pe_most_likely_dx', label: 'PE is the #1 diagnosis, or equally likely', type: 'boolean', points: 3 },
    { id: 'heart_rate_over_100', label: 'Heart rate > 100 bpm', type: 'boolean', points: 1.5 },
    { id: 'immobilization_or_surgery', label: 'Immobilization >=3 days or surgery in past 4 weeks', type: 'boolean', points: 1.5 },
    { id: 'prior_dvt_pe', label: 'Previous, objectively diagnosed DVT or PE', type: 'boolean', points: 1.5 },
    { id: 'hemoptysis', label: 'Hemoptysis', type: 'boolean', points: 1 },
    { id: 'malignancy', label: 'Active malignancy (treatment within 6 months, or palliative)', type: 'boolean', points: 1 },
  ],
  outputUnit: 'points',
  interpretationBands: [
    { id: 'low', label: 'Low probability', minScore: 0, maxScore: 1.5, riskDescription: 'PE prevalence approximately 1.3% in the original three-tier derivation cohort.', managementGuidance: 'Reference guidance associates this tier with a D-dimer-first diagnostic strategy.', sourceRefs: ['Wells PS et al. Ann Intern Med 2001;135(2):98-107 (Wells PE score derivation)'] },
    { id: 'moderate', label: 'Moderate probability', minScore: 2, maxScore: 6, riskDescription: 'PE prevalence approximately 16.2% in the original three-tier derivation cohort.', managementGuidance: 'Reference guidance associates this tier with imaging (CTPA) being generally indicated.', sourceRefs: ['Wells PS et al. Ann Intern Med 2001;135(2):98-107 (Wells PE score derivation)'] },
    { id: 'high', label: 'High probability', minScore: 6.5, maxScore: 12.5, riskDescription: 'PE prevalence approximately 37.5% in the original three-tier derivation cohort.', managementGuidance: 'Reference guidance associates this tier with imaging being generally indicated and empiric anticoagulation being considered pending results, per local protocol.', sourceRefs: ['Wells PS et al. Ann Intern Med 2001;135(2):98-107 (Wells PE score derivation)'] },
  ],
  sourceRefs: ['Wells PS et al. Ann Intern Med 2001;135(2):98-107 (Wells PE score derivation)'],
  sourceRevision: '2001',
  reviewStatus: 'pending_clinical_review',
  learnerReadiness: 'review_required',
  positioningNote: 'Many current protocols instead use the simplified two-tier "PE likely / PE unlikely" Wells model (cutoff at 4 points) rather than this three-tier model. Both are legitimate; this registry presents the original three-tier derivation.',
}

const HEART_SCORE: ClinicalCalculatorDefinition = {
  calculatorId: 'heart_score',
  name: 'HEART Score',
  version: '2008.1',
  clinicalDomain: 'cardiology',
  intendedUse: 'Educational reference for chest-pain risk-stratification concepts in the emergency department.',
  inputs: [
    { id: 'history', label: 'History', type: 'select', options: [
      { id: 'slightly_suspicious', label: 'Slightly suspicious', points: 0 },
      { id: 'moderately_suspicious', label: 'Moderately suspicious', points: 1 },
      { id: 'highly_suspicious', label: 'Highly suspicious', points: 2 },
    ] },
    { id: 'ecg', label: 'ECG', type: 'select', options: [
      { id: 'normal', label: 'Normal', points: 0 },
      { id: 'nonspecific_repolarization', label: 'Non-specific repolarization disturbance', points: 1 },
      { id: 'significant_st_deviation', label: 'Significant ST deviation', points: 2 },
    ] },
    { id: 'age', label: 'Age', type: 'select', options: [
      { id: 'under_45', label: '< 45 years', points: 0 },
      { id: '45_to_65', label: '45-65 years', points: 1 },
      { id: 'over_65', label: '>= 65 years', points: 2 },
    ] },
    { id: 'risk_factors', label: 'Risk factors', type: 'select', options: [
      { id: 'none', label: 'No known risk factors', points: 0 },
      { id: 'one_or_two', label: '1-2 risk factors', points: 1 },
      { id: 'three_plus', label: '>=3 factors, or known atherosclerotic disease', points: 2 },
    ] },
    { id: 'troponin', label: 'Troponin', type: 'select', options: [
      { id: 'normal', label: '<= normal limit', points: 0 },
      { id: 'one_to_three_x', label: '1-3x normal limit', points: 1 },
      { id: 'over_three_x', label: '> 3x normal limit', points: 2 },
    ] },
  ],
  outputUnit: 'points',
  interpretationBands: [
    { id: 'low', label: 'Low risk', minScore: 0, maxScore: 3, riskDescription: '6-week major adverse cardiac event (MACE) rate approximately 0.9-1.7% in validation cohorts.', managementGuidance: 'Reference guidance associates this range with consideration of early discharge and outpatient follow-up.', sourceRefs: ['Six AJ et al. Neth Heart J 2008;16(6):191-196 (HEART score derivation)', 'Backus BE et al. Int J Cardiol 2013;168(3):2153-2158 (HEART score validation)'] },
    { id: 'moderate', label: 'Moderate risk', minScore: 4, maxScore: 6, riskDescription: '6-week MACE rate approximately 12-16.6% in validation cohorts.', managementGuidance: 'Reference guidance associates this range with observation and serial troponin measurement.', sourceRefs: ['Six AJ et al. Neth Heart J 2008;16(6):191-196 (HEART score derivation)', 'Backus BE et al. Int J Cardiol 2013;168(3):2153-2158 (HEART score validation)'] },
    { id: 'high', label: 'High risk', minScore: 7, maxScore: 10, riskDescription: '6-week MACE rate approximately 50-65% in validation cohorts.', managementGuidance: 'Reference guidance associates this range with consideration of an early invasive strategy.', sourceRefs: ['Six AJ et al. Neth Heart J 2008;16(6):191-196 (HEART score derivation)', 'Backus BE et al. Int J Cardiol 2013;168(3):2153-2158 (HEART score validation)'] },
  ],
  sourceRefs: ['Six AJ et al. Neth Heart J 2008;16(6):191-196 (HEART score derivation)'],
  sourceRevision: '2008',
  reviewStatus: 'pending_clinical_review',
  learnerReadiness: 'review_required',
}

const CURB_65: ClinicalCalculatorDefinition = {
  calculatorId: 'curb_65',
  name: 'CURB-65',
  version: '2003.1',
  clinicalDomain: 'pulmonology',
  intendedUse: 'Educational reference for community-acquired pneumonia severity concepts.',
  inputs: [
    { id: 'confusion', label: 'New confusion/disorientation', type: 'boolean', points: 1 },
    { id: 'urea_over_7', label: 'Blood urea > 7 mmol/L (BUN > 19 mg/dL)', type: 'boolean', points: 1 },
    { id: 'respiratory_rate_30_plus', label: 'Respiratory rate >= 30 breaths/min', type: 'boolean', points: 1 },
    { id: 'low_blood_pressure', label: 'Systolic BP < 90 mmHg or diastolic BP <= 60 mmHg', type: 'boolean', points: 1 },
    { id: 'age_65_plus', label: 'Age >= 65 years', type: 'boolean', points: 1 },
  ],
  outputUnit: 'points',
  interpretationBands: [
    { id: 'low', label: 'Low mortality risk', minScore: 0, maxScore: 1, riskDescription: '30-day mortality approximately 1.5% in the derivation cohort.', managementGuidance: 'Reference guidance associates this range with outpatient treatment generally being appropriate.', sourceRefs: ['Lim WS et al. Thorax 2003;58(5):377-382 (CURB-65 derivation)'] },
    { id: 'moderate', label: 'Moderate mortality risk', minScore: 2, maxScore: 2, riskDescription: '30-day mortality approximately 9.2% in the derivation cohort.', managementGuidance: 'Reference guidance associates this score with consideration of a short inpatient admission.', sourceRefs: ['Lim WS et al. Thorax 2003;58(5):377-382 (CURB-65 derivation)'] },
    { id: 'severe', label: 'Severe mortality risk', minScore: 3, maxScore: 5, riskDescription: '30-day mortality approximately 22% or higher in the derivation cohort.', managementGuidance: 'Reference guidance associates this range with consideration of ICU-level care.', sourceRefs: ['Lim WS et al. Thorax 2003;58(5):377-382 (CURB-65 derivation)'] },
  ],
  sourceRefs: ['Lim WS et al. Thorax 2003;58(5):377-382 (CURB-65 derivation)'],
  sourceRevision: '2003',
  reviewStatus: 'pending_clinical_review',
  learnerReadiness: 'review_required',
}

const QSOFA: ClinicalCalculatorDefinition = {
  calculatorId: 'qsofa',
  name: 'qSOFA',
  version: '2016.1',
  clinicalDomain: 'critical_care',
  intendedUse: 'Educational reference for the Sepsis-3 bedside prompt concept. qSOFA is a screening prompt, not a diagnostic or protocol-activation trigger by itself.',
  inputs: [
    { id: 'respiratory_rate_22_plus', label: 'Respiratory rate >= 22 breaths/min', type: 'boolean', points: 1 },
    { id: 'altered_mentation', label: 'Altered mentation (GCS < 15)', type: 'boolean', points: 1 },
    { id: 'sbp_100_or_less', label: 'Systolic BP <= 100 mmHg', type: 'boolean', points: 1 },
  ],
  outputUnit: 'points',
  interpretationBands: [
    { id: 'low', label: 'Low qSOFA', minScore: 0, maxScore: 1, riskDescription: 'A lower qSOFA score does not exclude sepsis or serious illness — it has limited sensitivity as a sole screening tool.', managementGuidance: 'Reference guidance treats a low score as insufficient by itself to rule out organ dysfunction; ongoing clinical judgment is required.', sourceRefs: ['Singer M et al. JAMA 2016;315(8):801-810 (Sepsis-3 definitions)'] },
    { id: 'high', label: 'Elevated qSOFA', minScore: 2, maxScore: 3, riskDescription: 'An elevated qSOFA score is associated with a greater likelihood of poor outcome and warrants further assessment for organ dysfunction/sepsis — it is a prompt for evaluation, not a diagnosis.', managementGuidance: 'Reference guidance treats this as a prompt to pursue further assessment for organ dysfunction/sepsis per local protocol, not as an instruction to act by itself.', sourceRefs: ['Singer M et al. JAMA 2016;315(8):801-810 (Sepsis-3 definitions)'] },
  ],
  sourceRefs: ['Singer M et al. JAMA 2016;315(8):801-810 (Sepsis-3 definitions)'],
  sourceRevision: '2016',
  reviewStatus: 'pending_clinical_review',
  learnerReadiness: 'review_required',
}

export const CLINICAL_CALCULATOR_REGISTRY: readonly ClinicalCalculatorDefinition[] = [
  CHA2DS2_VASC,
  CHA2DS2_VA,
  TIMI_NSTEMI,
  WELLS_PE,
  HEART_SCORE,
  CURB_65,
  QSOFA,
]

export function validateClinicalCalculatorRegistry(registry: readonly ClinicalCalculatorDefinition[] = CLINICAL_CALCULATOR_REGISTRY): void {
  const ids = new Set<string>()
  for (const definition of registry) {
    validateClinicalCalculatorDefinition(definition)
    if (ids.has(definition.calculatorId)) throw new Error(`Duplicate calculatorId: ${definition.calculatorId}`)
    ids.add(definition.calculatorId)
  }
}

export function findClinicalCalculator(calculatorId: string): ClinicalCalculatorDefinition | null {
  return CLINICAL_CALCULATOR_REGISTRY.find(candidate => candidate.calculatorId === calculatorId) ?? null
}
