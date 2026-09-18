import { deriveEchoPhenotypeReadiness, findEchoPhenotype, type EchoPhenotype } from './echoPhenotype.ts'
import { findEchoStudyRecord, type EchoStudyRecord } from './echoStudyRecord.ts'
import { findEchoEvidence, type EchoEvidence } from './echoEvidence.ts'
import { findingsForStudy, type EchoFinding } from './echoFinding.ts'

// EchoComparison — Batch 6, contrastive learning mode. A comparison is only
// ever CONSTRUCTED when both phenotypes are ready AND each has reviewed
// evidence — this function does not fabricate a comparison to populate a UI.
// With today's real data (Normal ready; DCM/HCM review_required) every
// comparison involving DCM or HCM correctly comes back ineligible — that is
// the expected, honest result, not a bug. See tests/echo-intelligence-atlas-contract.test.mjs.

export interface EchoComparisonEligibility {
  phenotypeAKey: string
  phenotypeBKey: string
  eligible: boolean
  reason: string
}

export interface EchoComparison extends EchoComparisonEligibility {
  eligible: true
  sameView: boolean
  distinguishingFindings: { phenotypeKey: string; studyKey: string; findingKey: string; finding: string }[]
}

function isPhenotypeReady(phenotype: EchoPhenotype, studyRecords: readonly EchoStudyRecord[]): boolean {
  return deriveEchoPhenotypeReadiness(phenotype, studyRecords) === 'ready'
}

function hasReviewedEvidence(phenotype: EchoPhenotype, evidence: readonly EchoEvidence[]): boolean {
  return phenotype.studyIds.every(studyId => findEchoEvidence(studyId, evidence)?.reviewStatus === 'reviewed')
}

export function evaluateEchoComparisonEligibility(
  phenotypeAKey: string,
  phenotypeBKey: string,
  context: {
    phenotypes?: readonly EchoPhenotype[]
    studyRecords?: readonly EchoStudyRecord[]
    evidence?: readonly EchoEvidence[]
  } = {},
): EchoComparisonEligibility {
  const phenotypes = context.phenotypes
  const studyRecords = context.studyRecords ?? []
  const evidence = context.evidence ?? []
  const a = findEchoPhenotype(phenotypeAKey, phenotypes)
  const b = findEchoPhenotype(phenotypeBKey, phenotypes)

  if (!a || !b) return { phenotypeAKey, phenotypeBKey, eligible: false, reason: 'unknown-phenotype' }
  if (phenotypeAKey === phenotypeBKey) return { phenotypeAKey, phenotypeBKey, eligible: false, reason: 'cannot-compare-phenotype-with-itself' }
  if (!a.comparisonGroup.includes(phenotypeBKey) || !b.comparisonGroup.includes(phenotypeAKey)) {
    return { phenotypeAKey, phenotypeBKey, eligible: false, reason: 'comparison-not-declared' }
  }
  if (!isPhenotypeReady(a, studyRecords) || !isPhenotypeReady(b, studyRecords)) {
    return { phenotypeAKey, phenotypeBKey, eligible: false, reason: 'one-or-both-phenotypes-not-learner-ready' }
  }
  if (!hasReviewedEvidence(a, evidence) || !hasReviewedEvidence(b, evidence)) {
    return { phenotypeAKey, phenotypeBKey, eligible: false, reason: 'one-or-both-phenotypes-lack-reviewed-evidence' }
  }
  return { phenotypeAKey, phenotypeBKey, eligible: true, reason: 'eligible' }
}

/** Throws if not eligible — callers that already checked eligibility (or want to fail loudly) use this instead of re-deriving eligibility themselves. Never fabricates findings: if a side has none, distinguishingFindings simply omits it. */
export function buildEchoComparison(
  phenotypeAKey: string,
  phenotypeBKey: string,
  context: {
    phenotypes?: readonly EchoPhenotype[]
    studyRecords?: readonly EchoStudyRecord[]
    evidence?: readonly EchoEvidence[]
    findings?: readonly EchoFinding[]
  } = {},
): EchoComparison {
  const eligibility = evaluateEchoComparisonEligibility(phenotypeAKey, phenotypeBKey, context)
  if (!eligibility.eligible) throw new Error(`Echo comparison ${phenotypeAKey} vs ${phenotypeBKey} is not eligible: ${eligibility.reason}`)

  const a = findEchoPhenotype(phenotypeAKey, context.phenotypes)!
  const b = findEchoPhenotype(phenotypeBKey, context.phenotypes)!
  const studyRecords = context.studyRecords ?? []
  const findings = context.findings ?? []

  const aViews = a.studyIds.map(id => findEchoStudyRecord(id, studyRecords)?.views ?? []).flat()
  const bViews = b.studyIds.map(id => findEchoStudyRecord(id, studyRecords)?.views ?? []).flat()
  const sameView = aViews.length > 0 && aViews.every(view => bViews.includes(view))

  const distinguishingFindings = [
    ...a.studyIds.flatMap(studyId => findingsForStudy(studyId, findings).map(f => ({ phenotypeKey: a.phenotypeKey, studyKey: studyId, findingKey: f.findingKey, finding: f.finding }))),
    ...b.studyIds.flatMap(studyId => findingsForStudy(studyId, findings).map(f => ({ phenotypeKey: b.phenotypeKey, studyKey: studyId, findingKey: f.findingKey, finding: f.finding }))),
  ]

  return { phenotypeAKey, phenotypeBKey, eligible: true, reason: 'eligible', sameView, distinguishingFindings }
}
