export type EchoClinicalPromotionState =
  | 'clinical-review-required'
  | 'governed-derivative-required'
  | 'learner-ready'
  | 'blocked'

export interface EchoClinicalPromotionRecord {
  candidateId: string
  diagnosisLabel: string
  view: 'A4C'
  sourceLicense: 'CC-BY-SA-3.0'
  commercialReuseVerified: true
  sourceSha256: string
  technicalViewConfirmed: true
  technicalPrivacyScreenPassed: true
  finalPrivacyReviewComplete: false
  clinicalReviewComplete: false
  learnerReady: false
  promotionState: EchoClinicalPromotionState
  teachingObjectives: readonly string[]
  mappedSkillIds: readonly string[]
  requiredNewSkillIds: readonly string[]
  prohibitedClaims: readonly string[]
  nextStep: string
}

export const ECHO_BATCH_01_CLINICAL_PROMOTION: readonly EchoClinicalPromotionRecord[] = [
  {
    candidateId: 'echo-a4c-apical-hcm-e00291',
    diagnosisLabel: 'Apical hypertrophic cardiomyopathy',
    view: 'A4C',
    sourceLicense: 'CC-BY-SA-3.0',
    commercialReuseVerified: true,
    sourceSha256: 'e23aa565789effcae9728fc8e9a4b71e6a90062e8c0014e4fe85899bd419f97a',
    technicalViewConfirmed: true,
    technicalPrivacyScreenPassed: true,
    finalPrivacyReviewComplete: false,
    clinicalReviewComplete: false,
    learnerReady: false,
    promotionState: 'clinical-review-required',
    teachingObjectives: [
      'Recognize the source-supported apical hypertrophic pattern in A4C.',
      'Discriminate an apical cardiomyopathy pattern from a normal A4C reference without making measurement claims.',
    ],
    mappedSkillIds: ['echo.view.a4c-recognition', 'echo.cardiomyopathy.pattern-recognition'],
    requiredNewSkillIds: [],
    prohibitedClaims: ['wall-thickness measurement', 'LVOT obstruction', 'genotype inference', 'prognosis'],
    nextStep: 'Specialist review of clip suitability, teaching boundary, privacy and governed derivative before learner release.',
  },
  {
    candidateId: 'echo-a4c-dcm-e00476',
    diagnosisLabel: 'Dilated cardiomyopathy',
    view: 'A4C',
    sourceLicense: 'CC-BY-SA-3.0',
    commercialReuseVerified: true,
    sourceSha256: 'ea5a6bf54bcbda40a73ea76f3dd7fab876c9c48c8d4abd9461748cb9538aaf45',
    technicalViewConfirmed: true,
    technicalPrivacyScreenPassed: true,
    finalPrivacyReviewComplete: false,
    clinicalReviewComplete: false,
    learnerReady: false,
    promotionState: 'clinical-review-required',
    teachingObjectives: [
      'Recognize broad LV cavity dilation in A4C.',
      'Recognize grossly reduced global LV motion without numerical EF estimation.',
      'Connect the pattern to a source-supported dilated cardiomyopathy label.',
    ],
    mappedSkillIds: [
      'echo.view.a4c-recognition',
      'echo.function.lv-global-visual',
      'echo.cardiomyopathy.pattern-recognition',
    ],
    requiredNewSkillIds: [],
    prohibitedClaims: ['numerical EF estimation', 'etiology inference', 'hemodynamic quantification', 'treatment recommendation'],
    nextStep: 'Specialist review of cavity/function teaching suitability, privacy and governed derivative before learner release.',
  },
  {
    candidateId: 'echo-a4c-pericardial-effusion-e00674',
    diagnosisLabel: 'Pericardial effusion',
    view: 'A4C',
    sourceLicense: 'CC-BY-SA-3.0',
    commercialReuseVerified: true,
    sourceSha256: 'edb1a37e186c8b56a243f826691fc98a96b3cabf08b1d6f7f39130054e0443f6',
    technicalViewConfirmed: true,
    technicalPrivacyScreenPassed: true,
    finalPrivacyReviewComplete: false,
    clinicalReviewComplete: false,
    learnerReady: false,
    promotionState: 'clinical-review-required',
    teachingObjectives: [
      'Recognize an abnormal echo-free pericardial-space pattern in A4C.',
      'Differentiate pericardial-space recognition from myocardial-pattern tasks.',
    ],
    mappedSkillIds: ['echo.view.a4c-recognition', 'echo.anatomy.a4c-landmarks'],
    requiredNewSkillIds: ['echo.pericardium.effusion-pattern'],
    prohibitedClaims: ['tamponade diagnosis', 'effusion size quantification', 'hemodynamic compromise', 'treatment recommendation'],
    nextStep: 'Add a governed pericardial-pattern skill only after specialist review confirms the teaching construct; complete privacy and derivative review.',
  },
] as const

export function validateEchoBatch01ClinicalPromotion(records = ECHO_BATCH_01_CLINICAL_PROMOTION): void {
  const ids = new Set<string>()
  for (const record of records) {
    if (ids.has(record.candidateId)) throw new Error(`Duplicate clinical promotion candidate: ${record.candidateId}`)
    ids.add(record.candidateId)
    if (!record.commercialReuseVerified) throw new Error(`Commercial reuse must be verified: ${record.candidateId}`)
    if (record.learnerReady || record.clinicalReviewComplete || record.finalPrivacyReviewComplete) {
      throw new Error(`Batch 01 promotion queue must fail closed before specialist review: ${record.candidateId}`)
    }
    if (record.promotionState === 'learner-ready') {
      throw new Error(`Unreviewed candidate cannot be learner-ready: ${record.candidateId}`)
    }
    if (!record.teachingObjectives.length || !record.prohibitedClaims.length) {
      throw new Error(`Candidate lacks teaching boundary: ${record.candidateId}`)
    }
  }
}

export function summarizeEchoBatch01ClinicalPromotion(records = ECHO_BATCH_01_CLINICAL_PROMOTION) {
  validateEchoBatch01ClinicalPromotion(records)
  return {
    total: records.length,
    clinicalReviewRequired: records.filter(record => record.promotionState === 'clinical-review-required').length,
    learnerReady: records.filter(record => record.learnerReady).length,
    skillGraphGaps: [...new Set(records.flatMap(record => record.requiredNewSkillIds))],
  }
}
