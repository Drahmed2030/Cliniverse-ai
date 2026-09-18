// ClinicalCalculatorDefinition — Batch 8. The canonical, typed calculator
// registry contract. Separates three things that Batch 7's audit found
// conflated in app/components/ClinicalCalculators.tsx:
//
//   A. the deterministic score/formula        (pure, no clinical judgment)
//   B. the interpretation (risk band)         (requires sourced evidence)
//   C. management/action guidance             (requires sourced evidence,
//                                               never a command)
//
// The scoring engine (scoreClinicalCalculator) only ever touches (A). Bands
// carry their own sourceRefs — there is no calculator-wide "trust me" claim,
// and no hardcoded marketing copy (no "Updated with 2026 Guidelines", no
// "Based on validated clinical guidelines" without a real, dated source).

export type ClinicalCalculatorReviewStatus = 'reviewed' | 'pending_clinical_review'
export type ClinicalCalculatorLearnerReadiness = 'ready' | 'review_required'

export interface ClinicalCalculatorSelectOption {
  id: string
  label: string
  points: number
}

export interface ClinicalCalculatorInputField {
  id: string
  label: string
  type: 'boolean' | 'select'
  /** Points awarded when a boolean field is true. Required for boolean fields — never implicitly defaulted, so a field can never silently score 1 point by omission. */
  points?: number
  /** Required for select fields — each option declares its own points explicitly, so mutually-exclusive categories (e.g. age bands) cannot be double-counted the way two independent booleans could be. */
  options?: ClinicalCalculatorSelectOption[]
}

export interface ClinicalCalculatorInterpretationBand {
  id: string
  label: string
  minScore: number
  maxScore: number
  /** Descriptive risk statement, not a command — e.g. "associated with an estimated annual stroke risk of ~X%", never "give anticoagulation." */
  riskDescription: string
  /** Educational management guidance, phrased as "typically considered" / "reference guidance suggests" — never a direct imperative ("give", "start", "activate"). Gated: only present when sourceRefs actually backs it. */
  managementGuidance: string
  sourceRefs: readonly string[]
}

export interface ClinicalCalculatorDefinition {
  calculatorId: string
  name: string
  version: string
  clinicalDomain: string
  intendedUse: string
  inputs: readonly ClinicalCalculatorInputField[]
  outputUnit: string
  interpretationBands: readonly ClinicalCalculatorInterpretationBand[]
  sourceRefs: readonly string[]
  sourceRevision: string
  reviewStatus: ClinicalCalculatorReviewStatus
  learnerReadiness: ClinicalCalculatorLearnerReadiness
  /** Optional note on how this calculator relates to a superseding/alternate variant — e.g. CHA2DS2-VASc vs. the newer sex-neutral CHA2DS2-VA. Never silent about a positioning change. */
  positioningNote?: string
}

export interface ClinicalCalculatorResult {
  calculatorId: string
  score: number
  band: ClinicalCalculatorInterpretationBand
}

export function validateClinicalCalculatorDefinition(definition: ClinicalCalculatorDefinition): void {
  if (!definition.calculatorId.trim() || !definition.name.trim()) {
    throw new Error('Calculator identity is required.')
  }
  if (!definition.sourceRefs.length) {
    throw new Error(`Calculator ${definition.calculatorId} has no sourceRefs.`)
  }
  for (const field of definition.inputs) {
    if (field.type === 'boolean' && (field.points === undefined || !Number.isFinite(field.points))) {
      throw new Error(`Boolean field ${field.id} on ${definition.calculatorId} must declare explicit points.`)
    }
    if (field.type === 'select' && (!field.options || field.options.length < 2)) {
      throw new Error(`Select field ${field.id} on ${definition.calculatorId} must declare at least two options.`)
    }
  }
  if (!definition.interpretationBands.length) {
    throw new Error(`Calculator ${definition.calculatorId} has no interpretation bands.`)
  }
  for (const band of definition.interpretationBands) {
    if (!band.sourceRefs.length) {
      throw new Error(`Interpretation band ${band.id} on ${definition.calculatorId} has no sourceRefs.`)
    }
    if (band.minScore > band.maxScore) {
      throw new Error(`Interpretation band ${band.id} on ${definition.calculatorId} has minScore > maxScore.`)
    }
  }
  if (definition.learnerReadiness === 'ready' && definition.reviewStatus !== 'reviewed') {
    throw new Error(`Calculator ${definition.calculatorId} cannot be learnerReadiness 'ready' without reviewStatus 'reviewed'.`)
  }
}

/**
 * Pure, deterministic scoring (concern A only). Every value must be
 * supplied for every declared input field — there is no implicit default,
 * so an incomplete form can never silently produce a score.
 */
export function scoreClinicalCalculator(
  definition: ClinicalCalculatorDefinition,
  values: Readonly<Record<string, boolean | string>>,
): ClinicalCalculatorResult {
  let score = 0
  for (const field of definition.inputs) {
    const value = values[field.id]
    if (value === undefined) throw new Error(`Missing value for required field ${field.id} on ${definition.calculatorId}.`)
    if (field.type === 'boolean') {
      if (typeof value !== 'boolean') throw new Error(`Field ${field.id} on ${definition.calculatorId} expects a boolean.`)
      if (value) score += field.points as number
    } else {
      const option = field.options?.find(candidate => candidate.id === value)
      if (!option) throw new Error(`Field ${field.id} on ${definition.calculatorId} has an unknown option: ${String(value)}.`)
      score += option.points
    }
  }

  const band = definition.interpretationBands.find(candidate => score >= candidate.minScore && score <= candidate.maxScore)
  if (!band) throw new Error(`Score ${score} for ${definition.calculatorId} does not fall within any declared interpretation band.`)

  return { calculatorId: definition.calculatorId, score, band }
}
