import { ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1 } from './ecgGovernedCaseBatch01CoverageContract.ts'

export type EcgBatch01SelectionSlotStatus = 'TARGET_DEFINED' | 'RECORD_SELECTED' | 'HOLD'

export interface EcgBatch01SelectionSlotV1 {
  slotId: string
  educationalObjective: string
  governedSkillIds: readonly string[]
  preferredStratFolds: readonly (9 | 10)[]
  selectedRecordId: string | null
  selectedPatientId: string | null
  sourceLabelsAreSelectionHintsOnly: true
  humanClinicalReviewRequired: true
  technicalInspectionRequired: true
  privacyReviewRequired: true
  status: EcgBatch01SelectionSlotStatus
}

export const ECG_GOVERNED_BATCH_01_SELECTION_PLAN_V1: readonly EcgBatch01SelectionSlotV1[] = [
  { slotId: 'batch01-slot-01', educationalObjective: 'recognize normal sinus rhythm and normal ECG pattern', governedSkillIds: ['ecg-rhythm-sinus-recognition', 'ecg-normal-pattern-recognition'], preferredStratFolds: [9, 10], selectedRecordId: '10', selectedPatientId: '9456', sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'RECORD_SELECTED' },
  { slotId: 'batch01-slot-02', educationalObjective: 'assess heart rate across a governed non-emergent tracing', governedSkillIds: ['ecg-rate-assessment'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-03', educationalObjective: 'assess PR interval and AV conduction', governedSkillIds: ['ecg-pr-interval-assessment'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-04', educationalObjective: 'assess QRS duration and intraventricular conduction', governedSkillIds: ['ecg-qrs-duration-assessment'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-05', educationalObjective: 'assess QT and QTc interval', governedSkillIds: ['ecg-qt-qtc-assessment'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-06', educationalObjective: 'assess frontal QRS axis', governedSkillIds: ['ecg-frontal-axis-assessment'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-07', educationalObjective: 'recognize atrial fibrillation pattern', governedSkillIds: ['ecg-atrial-fibrillation-recognition'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-08', educationalObjective: 'recognize clinically meaningful AV block pattern', governedSkillIds: ['ecg-av-block-recognition'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-09', educationalObjective: 'recognize bundle branch block pattern', governedSkillIds: ['ecg-bundle-branch-block-recognition'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-10', educationalObjective: 'recognize LVH pattern using governed criteria', governedSkillIds: ['ecg-lvh-pattern-recognition'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-11', educationalObjective: 'recognize ischemic ST-T pattern', governedSkillIds: ['ecg-ischemia-stemi-pattern-recognition'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
  { slotId: 'batch01-slot-12', educationalObjective: 'recognize STEMI-pattern morphology under human-reviewed reference truth', governedSkillIds: ['ecg-ischemia-stemi-pattern-recognition'], preferredStratFolds: [9, 10], selectedRecordId: null, selectedPatientId: null, sourceLabelsAreSelectionHintsOnly: true, humanClinicalReviewRequired: true, technicalInspectionRequired: true, privacyReviewRequired: true, status: 'TARGET_DEFINED' },
] as const

export function evaluateEcgBatch01SelectionPlanV1(
  slots: readonly EcgBatch01SelectionSlotV1[] = ECG_GOVERNED_BATCH_01_SELECTION_PLAN_V1,
) {
  const blockers: string[] = []
  if (slots.length < ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1.targetCaseCountMin || slots.length > ECG_GOVERNED_BATCH_01_COVERAGE_PLAN_V1.targetCaseCountMax) blockers.push('selection-slot-count-outside-approved-range')
  const slotIds = slots.map(slot => slot.slotId.trim())
  if (slotIds.some(id => !id)) blockers.push('slot-id-required')
  if (new Set(slotIds).size !== slotIds.length) blockers.push('duplicate-slot-id')
  for (const slot of slots) {
    if (!slot.educationalObjective.trim()) blockers.push(`educational-objective-required:${slot.slotId}`)
    if (!slot.governedSkillIds.length) blockers.push(`governed-skill-required:${slot.slotId}`)
    if (!slot.sourceLabelsAreSelectionHintsOnly) blockers.push(`source-label-authority-prohibited:${slot.slotId}`)
    if (!slot.humanClinicalReviewRequired) blockers.push(`human-clinical-review-required:${slot.slotId}`)
    if (!slot.technicalInspectionRequired) blockers.push(`technical-inspection-required:${slot.slotId}`)
    if (!slot.privacyReviewRequired) blockers.push(`privacy-review-required:${slot.slotId}`)
    if ((slot.selectedRecordId === null) !== (slot.selectedPatientId === null)) blockers.push(`record-patient-binding-incomplete:${slot.slotId}`)
    if (slot.status === 'RECORD_SELECTED' && (!slot.selectedRecordId || !slot.selectedPatientId)) blockers.push(`selected-record-evidence-required:${slot.slotId}`)
  }
  return {
    decision: blockers.length ? 'HOLD' as const : 'READY_FOR_BATCH_RECORD_SELECTION' as const,
    selectedCount: slots.filter(slot => slot.status === 'RECORD_SELECTED').length,
    pendingCount: slots.filter(slot => slot.status === 'TARGET_DEFINED').length,
    blockers,
  }
}

export function describeEcgBatch01SelectionPlanV1() {
  return {
    firstRecordPreserved: true,
    remainingRecordsNotInvented: true,
    patientLevelBindingRequired: true,
    highQualityFoldsPreferred: true,
    humanClinicalTruthRequired: true,
    sourceLabelsRemainHintsOnly: true,
    selectionCanProceedAsGovernedBatch: true,
  } as const
}
