// RenalFunction — Batch 8. Two SEPARATE, never-interchanged renal function
// concepts, per Batch 8 Section 4.
//
// CRITICAL AUDIT FINDING (Batch 8 Section 2): the superseded
// app/components/ClinicalCalculators.tsx "gfr" calculator was labeled
// "Renal Function Assessment (CKD-EPI)" but its actual formula —
//   186 * Scr^-1.154 * Age^-0.203 * (0.742 if female)
// — is the 2006-era 4-variable MDRD Study equation, NOT CKD-EPI. It also
// omitted MDRD's own race coefficient rather than actually implementing
// the CKD-EPI 2021 race-free model. This file replaces it with the real,
// current CKD-EPI 2021 creatinine equation.

export type RenalFunctionBasis = 'egfr' | 'cockcroft_gault_crcl' | 'label_specific' | 'none'

export type BiologicalSexForRenalCalc = 'male' | 'female'

export interface EgfrCkdEpi2021Input {
  serumCreatinineMgDl: number
  ageYears: number
  sex: BiologicalSexForRenalCalc
}

export interface EgfrCkdEpi2021Result {
  method: 'ckd_epi_2021_race_free'
  sourceRef: 'Inker LA et al. N Engl J Med 2021;385(19):1737-1749 (CKD-EPI 2021 race-free creatinine equation)'
  egfrMlMinPer1_73m2: number
  ckdStage: CkdStage
}

export type CkdStage = 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5'

const CKD_STAGE_LABELS: Record<CkdStage, string> = {
  G1: 'Normal or high (>=90)',
  G2: 'Mildly decreased (60-89)',
  G3a: 'Mildly to moderately decreased (45-59)',
  G3b: 'Moderately to severely decreased (30-44)',
  G4: 'Severely decreased (15-29)',
  G5: 'Kidney failure (<15)',
}

export function ckdStageLabel(stage: CkdStage): string {
  return CKD_STAGE_LABELS[stage]
}

function classifyCkdStage(egfr: number): CkdStage {
  if (egfr >= 90) return 'G1'
  if (egfr >= 60) return 'G2'
  if (egfr >= 45) return 'G3a'
  if (egfr >= 30) return 'G3b'
  if (egfr >= 15) return 'G4'
  return 'G5'
}

/**
 * CKD-EPI 2021 race-free creatinine equation. Normalized to
 * mL/min/1.73m² — a kidney-function/CKD-staging context, NOT a dosing
 * weight-based clearance. Never silently converted to/used as
 * Cockcroft-Gault CrCl — see calculateCreatinineClearanceCockcroftGault
 * for the separate, dosing-oriented concept.
 */
export function calculateEgfrCkdEpi2021(input: EgfrCkdEpi2021Input): EgfrCkdEpi2021Result {
  if (!Number.isFinite(input.serumCreatinineMgDl) || input.serumCreatinineMgDl <= 0) {
    throw new Error('Serum creatinine must be a positive number (mg/dL).')
  }
  if (!Number.isFinite(input.ageYears) || input.ageYears <= 0 || input.ageYears > 130) {
    throw new Error('Age must be a plausible positive number of years.')
  }

  const isFemale = input.sex === 'female'
  const kappa = isFemale ? 0.7 : 0.9
  const alpha = isFemale ? -0.241 : -0.302
  const scrOverKappa = input.serumCreatinineMgDl / kappa

  const egfr = 142
    * Math.pow(Math.min(scrOverKappa, 1), alpha)
    * Math.pow(Math.max(scrOverKappa, 1), -1.2)
    * Math.pow(0.9938, input.ageYears)
    * (isFemale ? 1.012 : 1)

  const rounded = Math.round(egfr)
  return {
    method: 'ckd_epi_2021_race_free',
    sourceRef: 'Inker LA et al. N Engl J Med 2021;385(19):1737-1749 (CKD-EPI 2021 race-free creatinine equation)',
    egfrMlMinPer1_73m2: rounded,
    ckdStage: classifyCkdStage(rounded),
  }
}

export interface CreatinineClearanceCockcroftGaultInput {
  serumCreatinineMgDl: number
  ageYears: number
  weightKg: number
  sex: BiologicalSexForRenalCalc
  /** Cockcroft-Gault was derived using actual body weight; some dosing labels specify ideal or adjusted body weight instead. This must be supplied explicitly by the caller (e.g. a RenalDoseRule's own labelRevision) — this function never silently substitutes a different weight basis. */
  weightBasis: 'actual' | 'ideal' | 'adjusted'
}

export interface CreatinineClearanceCockcroftGaultResult {
  method: 'cockcroft_gault_1976'
  sourceRef: 'Cockcroft DW, Gault MH. Nephron 1976;16(1):31-41 (Cockcroft-Gault equation)'
  creatinineClearanceMlMin: number
  weightBasis: CreatinineClearanceCockcroftGaultInput['weightBasis']
}

/**
 * Cockcroft-Gault creatinine clearance. Result is mL/min (NOT normalized
 * to 1.73m² body surface area) — a dosing-oriented context, distinct from
 * CKD-EPI eGFR. Explicitly represents the weight assumption used. Never
 * silently interchanged with eGFR — a RenalDoseRule must declare which
 * basis it actually requires (see renalDosingRules.ts).
 */
export function calculateCreatinineClearanceCockcroftGault(
  input: CreatinineClearanceCockcroftGaultInput,
): CreatinineClearanceCockcroftGaultResult {
  if (!Number.isFinite(input.serumCreatinineMgDl) || input.serumCreatinineMgDl <= 0) {
    throw new Error('Serum creatinine must be a positive number (mg/dL).')
  }
  if (!Number.isFinite(input.ageYears) || input.ageYears <= 0 || input.ageYears > 130) {
    throw new Error('Age must be a plausible positive number of years.')
  }
  if (!Number.isFinite(input.weightKg) || input.weightKg <= 0) {
    throw new Error('Weight must be a positive number (kg).')
  }

  const sexCoefficient = input.sex === 'female' ? 0.85 : 1
  const crcl = ((140 - input.ageYears) * input.weightKg * sexCoefficient) / (72 * input.serumCreatinineMgDl)

  return {
    method: 'cockcroft_gault_1976',
    sourceRef: 'Cockcroft DW, Gault MH. Nephron 1976;16(1):31-41 (Cockcroft-Gault equation)',
    creatinineClearanceMlMin: Math.round(crcl * 10) / 10,
    weightBasis: input.weightBasis,
  }
}
