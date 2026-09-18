import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CLINICAL_CALCULATOR_REGISTRY,
  validateClinicalCalculatorRegistry,
  findClinicalCalculator,
} from '../app/lib/clinicalReference/calculatorRegistry.ts'
import { scoreClinicalCalculator } from '../app/lib/clinicalReference/calculatorContract.ts'
import {
  calculateEgfrCkdEpi2021,
  calculateCreatinineClearanceCockcroftGault,
} from '../app/lib/clinicalReference/renalFunction.ts'
import {
  GOVERNED_SEED_DRUG_IDENTITIES,
  findGovernedSeedIdentity,
} from '../app/lib/clinicalReference/drugIdentity.ts'
import {
  DRUG_INTERACTION_RULES,
  validateDrugInteractionRules,
  findDrugInteractionRule,
  findDrugInteractionsAmong,
} from '../app/lib/clinicalReference/drugInteractionRules.ts'
import {
  RENAL_DOSE_RULES,
  validateRenalDoseRules,
  resolveRenalDoseThreshold,
  findRenalDoseRule,
} from '../app/lib/clinicalReference/renalDosingRules.ts'
import {
  GOVERNED_SEED_LABEL_EVIDENCE,
  findGovernedSeedLabelEvidence,
} from '../app/lib/clinicalReference/drugLabelEvidence.ts'
import { validateReferenceRelations, REFERENCE_RELATIONS } from '../app/lib/clinicalReference/referenceGraph.ts'

// ── CALCULATORS ───────────────────────────────────────────────────────

test('every registered calculator is structurally valid (sourceRefs, bands, points)', () => {
  assert.doesNotThrow(() => validateClinicalCalculatorRegistry())
  assert.ok(CLINICAL_CALCULATOR_REGISTRY.length >= 7)
})

test('CHA2DS2-VASc cannot double-count age — it is one mutually-exclusive select, not two independent booleans', () => {
  const definition = findClinicalCalculator('cha2ds2_vasc')
  const ageField = definition.inputs.find(field => field.id === 'age_band')
  assert.equal(ageField.type, 'select')
  assert.equal(ageField.options.length, 3)
  const totalPossibleAgePoints = Math.max(...ageField.options.map(o => o.points))
  assert.equal(totalPossibleAgePoints, 2)
})

test('CHA2DS2-VASc max score is 9 (not 10) with every field maximally scored', () => {
  const definition = findClinicalCalculator('cha2ds2_vasc')
  const result = scoreClinicalCalculator(definition, {
    chf: true, htn: true, age_band: '75plus', dm: true,
    stroke_tia_thromboembolism: true, vascular_disease: true, female_sex: true,
  })
  assert.equal(result.score, 9)
})

test('CHA2DS2-VASc score of 0 is deterministic and lands in the low band', () => {
  const definition = findClinicalCalculator('cha2ds2_vasc')
  const result = scoreClinicalCalculator(definition, {
    chf: false, htn: false, age_band: 'under65', dm: false,
    stroke_tia_thromboembolism: false, vascular_disease: false, female_sex: false,
  })
  assert.equal(result.score, 0)
  assert.equal(result.band.id, 'low')
})

test('CHA2DS2-VA (sex-neutral variant) has no sex field at all', () => {
  const definition = findClinicalCalculator('cha2ds2_va')
  assert.equal(definition.inputs.some(field => field.id.includes('sex')), false)
})

test('scoreClinicalCalculator throws on a missing required field rather than silently defaulting', () => {
  const definition = findClinicalCalculator('qsofa')
  assert.throws(() => scoreClinicalCalculator(definition, { respiratory_rate_22_plus: true }))
})

test('scoreClinicalCalculator throws on an unknown select option (edge case: malformed input)', () => {
  const definition = findClinicalCalculator('heart_score')
  assert.throws(() => scoreClinicalCalculator(definition, {
    history: 'not-a-real-option', ecg: 'normal', age: 'under_45', risk_factors: 'none', troponin: 'normal',
  }))
})

test('qSOFA no longer commands "activate sepsis protocol" — it frames itself as a further-assessment prompt', () => {
  const definition = findClinicalCalculator('qsofa')
  const serialized = JSON.stringify(definition).toLowerCase()
  assert.equal(serialized.includes('activate sepsis protocol immediately'), false)
  assert.match(serialized, /further assessment/)
})

test('no calculator carries unsourced marketing copy ("updated with", "based on validated clinical guidelines" without a citation)', () => {
  for (const definition of CLINICAL_CALCULATOR_REGISTRY) {
    const serialized = JSON.stringify(definition).toLowerCase()
    assert.equal(serialized.includes('updated with 2026 guidelines'), false, definition.calculatorId)
    assert.equal(/based on validated clinical guidelines(?!\s*\()/.test(serialized), false, definition.calculatorId)
  }
})

test('every interpretation band carries its own sourceRefs — no band-wide unsourced claim', () => {
  for (const definition of CLINICAL_CALCULATOR_REGISTRY) {
    for (const band of definition.interpretationBands) {
      assert.ok(band.sourceRefs.length > 0, `${definition.calculatorId}/${band.id} has no sourceRefs`)
    }
  }
})

test('a calculator cannot be learnerReadiness "ready" without reviewStatus "reviewed" (validateClinicalCalculatorDefinition guard)', () => {
  for (const definition of CLINICAL_CALCULATOR_REGISTRY) {
    if (definition.learnerReadiness === 'ready') assert.equal(definition.reviewStatus, 'reviewed')
  }
})

// ── RENAL FUNCTION ────────────────────────────────────────────────────

test('CKD-EPI 2021 and Cockcroft-Gault are separate methods with separate result shapes', () => {
  const egfr = calculateEgfrCkdEpi2021({ serumCreatinineMgDl: 1.0, ageYears: 60, sex: 'male' })
  const crcl = calculateCreatinineClearanceCockcroftGault({ serumCreatinineMgDl: 1.0, ageYears: 60, weightKg: 70, sex: 'male', weightBasis: 'actual' })
  assert.equal(egfr.method, 'ckd_epi_2021_race_free')
  assert.equal(crcl.method, 'cockcroft_gault_1976')
  assert.notEqual(egfr.method, crcl.method)
  assert.ok(!('creatinineClearanceMlMin' in egfr))
  assert.ok(!('ckdStage' in crcl))
})

test('CKD-EPI 2021 is NOT the MDRD formula the superseded component actually implemented — values diverge for the same inputs', () => {
  // Superseded MDRD-mislabeled-as-CKD-EPI formula from
  // app/components/ClinicalCalculators.tsx: 186 * Scr^-1.154 * Age^-0.203 * (0.742 if female)
  const mdrdMislabeled = Math.round(186 * Math.pow(1.0, -1.154) * Math.pow(60, -0.203) * 1)
  const realCkdEpi = calculateEgfrCkdEpi2021({ serumCreatinineMgDl: 1.0, ageYears: 60, sex: 'male' })
  assert.notEqual(realCkdEpi.egfrMlMinPer1_73m2, mdrdMislabeled)
})

test('eGFR and CrCl are never silently interchangeable — no function accepts one where the other is expected', () => {
  const egfr = calculateEgfrCkdEpi2021({ serumCreatinineMgDl: 1.0, ageYears: 60, sex: 'male' })
  assert.throws(() => calculateCreatinineClearanceCockcroftGault({ ...egfr, sex: 'male', weightBasis: 'actual' }))
})

test('renal function calculators reject non-finite/invalid inputs (edge cases)', () => {
  assert.throws(() => calculateEgfrCkdEpi2021({ serumCreatinineMgDl: 0, ageYears: 60, sex: 'male' }))
  assert.throws(() => calculateEgfrCkdEpi2021({ serumCreatinineMgDl: NaN, ageYears: 60, sex: 'male' }))
  assert.throws(() => calculateCreatinineClearanceCockcroftGault({ serumCreatinineMgDl: 1, ageYears: 60, weightKg: -5, sex: 'male', weightBasis: 'actual' }))
})

test('female sex coefficient is applied correctly and differently in each formula (never conflated)', () => {
  const maleEgfr = calculateEgfrCkdEpi2021({ serumCreatinineMgDl: 1.0, ageYears: 60, sex: 'male' })
  const femaleEgfr = calculateEgfrCkdEpi2021({ serumCreatinineMgDl: 1.0, ageYears: 60, sex: 'female' })
  assert.notEqual(maleEgfr.egfrMlMinPer1_73m2, femaleEgfr.egfrMlMinPer1_73m2)
  const maleCrcl = calculateCreatinineClearanceCockcroftGault({ serumCreatinineMgDl: 1.0, ageYears: 60, weightKg: 70, sex: 'male', weightBasis: 'actual' })
  const femaleCrcl = calculateCreatinineClearanceCockcroftGault({ serumCreatinineMgDl: 1.0, ageYears: 60, weightKg: 70, sex: 'female', weightBasis: 'actual' })
  assert.equal(Math.round((maleCrcl.creatinineClearanceMlMin - femaleCrcl.creatinineClearanceMlMin) * 100) / 100 > 0, true)
})

// ── DRUG IDENTITY ─────────────────────────────────────────────────────

test('every governed seed identity has a distinct rxcui — identity key is rxcui, never a display name', () => {
  const rxcuis = GOVERNED_SEED_DRUG_IDENTITIES.map(identity => identity.rxcui)
  assert.equal(new Set(rxcuis).size, rxcuis.length)
})

test('a stale/unknown drug name fails safely (returns null), never fabricating an identity', () => {
  assert.equal(findGovernedSeedIdentity('not-a-real-drug-xyz'), null)
})

// ── DRUG LABEL EVIDENCE ───────────────────────────────────────────────

test('governed label evidence entries are all pending_clinical_review, never silently asserted reviewed', () => {
  for (const entry of GOVERNED_SEED_LABEL_EVIDENCE) {
    assert.equal(entry.reviewStatus, 'pending_clinical_review')
  }
})

test('findGovernedSeedLabelEvidence fails safe for an rxcui with no seeded label', () => {
  assert.equal(findGovernedSeedLabelEvidence('not-a-real-rxcui'), null)
})

// ── DRUG INTERACTIONS ─────────────────────────────────────────────────

test('every interaction rule requires provenance (sourceRefs)', () => {
  assert.doesNotThrow(() => validateDrugInteractionRules())
  for (const rule of DRUG_INTERACTION_RULES) assert.ok(rule.sourceRefs.length > 0)
})

test('symmetric pair handling: order of the two rxcuis never changes the lookup result', () => {
  const warfarin = '11289'
  const aspirin = '1191'
  const forward = findDrugInteractionRule(warfarin, aspirin)
  const backward = findDrugInteractionRule(aspirin, warfarin)
  assert.ok(forward)
  assert.equal(forward.interactionId, backward.interactionId)
})

test('duplicate rule prevention: the registry cannot contain two rules for the same unordered pair', () => {
  const duplicated = [...DRUG_INTERACTION_RULES, { ...DRUG_INTERACTION_RULES[0], interactionId: 'dup' }]
  assert.throws(() => validateDrugInteractionRules(duplicated))
})

test('an unlisted pair returns null — no LLM-generated or fabricated interaction ever appears', () => {
  assert.equal(findDrugInteractionRule('11289', '3407'), null) // warfarin+digoxin: not in the governed seed
})

test('findDrugInteractionsAmong only ever returns governed rules, never invents one for the remaining pairs in a larger list', () => {
  const rxcuis = GOVERNED_SEED_DRUG_IDENTITIES.map(identity => identity.rxcui)
  const found = findDrugInteractionsAmong(rxcuis)
  assert.equal(found.length, DRUG_INTERACTION_RULES.length)
  for (const rule of found) assert.ok(DRUG_INTERACTION_RULES.includes(rule))
})

test('controlled severity vocabulary only — no ad hoc severity string can exist', () => {
  const allowed = new Set(['informational', 'caution', 'major', 'contraindicated'])
  for (const rule of DRUG_INTERACTION_RULES) assert.ok(allowed.has(rule.severity))
})

test('no interaction rule text implies LLM authorship or invented content — sourceRefs point at a real repo file', () => {
  for (const rule of DRUG_INTERACTION_RULES) {
    assert.match(rule.sourceRefs[0], /app\/components\/ClinicalStrip\.tsx/)
  }
})

// ── RENAL DOSING ──────────────────────────────────────────────────────

test('every renal dose rule declares a real renalFunctionBasis, never "none"', () => {
  assert.doesNotThrow(() => validateRenalDoseRules())
  for (const rule of RENAL_DOSE_RULES) assert.notEqual(rule.renalFunctionBasis, 'none')
})

test('thresholds are deterministic and source revision is mandatory', () => {
  const metformin = findRenalDoseRule('235743')
  assert.ok(metformin)
  assert.ok(metformin.labelRevision)
  const threshold = resolveRenalDoseThreshold(metformin, 20)
  assert.equal(threshold.contraindicated, true)
})

test('resolveRenalDoseThreshold throws rather than silently defaulting when no threshold covers the eGFR', () => {
  const metformin = findRenalDoseRule('235743')
  assert.throws(() => resolveRenalDoseThreshold(metformin, -5))
})

test('unreviewed renal dose rules are excluded from asserting learner-ready truth — all are pending_clinical_review', () => {
  for (const rule of RENAL_DOSE_RULES) assert.equal(rule.reviewStatus, 'pending_clinical_review')
})

test('no renal dosing UI copy in the rule text claims a patient-specific recommendation', () => {
  for (const rule of RENAL_DOSE_RULES) {
    const serialized = JSON.stringify(rule).toLowerCase()
    assert.equal(serialized.includes('recommended dose for this patient'), false)
  }
})

// ── EVIDENCE / REFERENCE GRAPH ────────────────────────────────────────

test('every reference relation has provenance — no relationship added without it', () => {
  assert.doesNotThrow(() => validateReferenceRelations())
  for (const relation of REFERENCE_RELATIONS) assert.ok(relation.provenanceRef.trim().length > 0)
})
