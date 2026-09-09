export type EcgBatch01CoverageDecision = 'READY_FOR_RECORD_SELECTION' | 'HOLD'

export interface EcgBatch01SkillTarget {
  skillId: string
  minimumGovernedCases: number
  priority: 'FOUNDATION' | 'CORE' | 'ADVANCED'
}

export interface EcgBatch01CoveragePlanV1 {
  batchId: 'ecg-governed-batch-01'
  targetCaseCountMin: number
  targetCaseCountMax: number
  skillTargets: readonly EcgBatch01SkillTarget[]
  sourceSelectionPolicyId: 'ecg-record-selection-provenance-policy'
  humanClinicalReferenceRequired: true
  sourceLabelsMayAutoBecomeDiagnosis: false
  learnerEligibilityRequiredBeforeAdaptiveUse: true
}

export const ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1: EcgBatch01CoveragePlanV1 = {
  batchId: 'ecg-governed-batch-01',
  targetCaseCountMin: 12,
  targetCaseCountMax: 20,
  skillTargets: [
    { skillId: 'ecg-rhythm-sinus-recognition', minimumGovernedCases: 2, priority: 'FOUNDATION' },
    { skillId: 'ecg-normal-pattern-recognition', minimumGovernedCases: 2, priority: 'FOUNDATION' },
    { skillId: 'ecg-rate-assessment', minimumGovernedCases: 2, priority: 'FOUNDATION' },
    { skillId: 'ecg-pr-interval-assessment', minimumGovernedCases: 2, priority: 'CORE' },
    { skillId: 'ecg-qrs-duration-assessment', minimumGovernedCases: 2, priority: 'CORE' },
    { skillId: 'ecg-qt-qtc-assessment', minimumGovernedCases: 2, priority: 'CORE' },
    { skillId: 'ecg-frontal-axis-assessment', minimumGovernedCases: 2, priority: 'CORE' },
    { skillId: 'ecg-atrial-fibrillation-recognition', minimumGovernedCases: 1, priority: 'CORE' },
    { skillId: 'ecg-av-block-recognition', minimumGovernedCases: 1, priority: 'CORE' },
    { skillId: 'ecg-bundle-branch-block-recognition', minimumGovernedCases: 1, priority: 'CORE' },
    { skillId: 'ecg-lvh-pattern-recognition', minimumGovernedCases: 1, priority: 'ADVANCED' },
    { skillId: 'ecg-ischemia-stemi-pattern-recognition', minimumGovernedCases: 1, priority: 'ADVANCED' },
  ],
  sourceSelectionPolicyId: 'ecg-record-selection-provenance-policy',
  humanClinicalReferenceRequired: true,
  sourceLabelsMayAutoBecomeDiagnosis: false,
  learnerEligibilityRequiredBeforeAdaptiveUse: true,
}

export function evaluateEcgBatch01CoveragePlanV1(
  plan: EcgBatch01CoveragePlanV1 = ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1,
): { decision: EcgBatch01CoverageDecision; blockers: readonly string[] } {
  const blockers: string[] = []

  if (!Number.isInteger(plan.targetCaseCountMin) || plan.targetCaseCountMin < 1) blockers.push('target-case-count-min-invalid')
  if (!Number.isInteger(plan.targetCaseCountMax) || plan.targetCaseCountMax < plan.targetCaseCountMin) blockers.push('target-case-count-max-invalid')
  if (plan.targetCaseCountMin < 12 || plan.targetCaseCountMax > 20) blockers.push('batch-01-case-count-outside-approved-range')
  if (!plan.skillTargets.length) blockers.push('skill-targets-required')

  const skillIds = plan.skillTargets.map(item => item.skillId.trim())
  if (skillIds.some(skillId => !skillId)) blockers.push('skill-id-required')
  if (new Set(skillIds).size !== skillIds.length) blockers.push('duplicate-skill-target')

  for (const target of plan.skillTargets) {
    if (!Number.isInteger(target.minimumGovernedCases) || target.minimumGovernedCases <= 0) {
      blockers.push(`minimum-governed-cases-invalid:${target.skillId}`)
    }
  }

  if (!plan.humanClinicalReferenceRequired) blockers.push('human-clinical-reference-required')
  if (plan.sourceLabelsMayAutoBecomeDiagnosis) blockers.push('source-label-auto-diagnosis-prohibited')
  if (!plan.learnerEligibilityRequiredBeforeAdaptiveUse) blockers.push('learner-eligibility-required-before-adaptive-use')

  return {
    decision: blockers.length ? 'HOLD' : 'READY_FOR_RECORD_SELECTION',
    blockers,
  }
}

export function describeEcgGovernedBatch01CoverageContractV1() {
  return {
    governedRecordSelectionOnly: true,
    sourceDiagnosisLabelsAreNotClinicalTruth: true,
    humanClinicalReviewRequired: true,
    batchSizeBounded: true,
    adaptiveSelectionConsumesLearnerEligibleCasesOnly: true,
    noHospitalIntegrationDependency: true,
  } as const
}
