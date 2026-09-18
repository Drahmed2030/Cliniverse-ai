import type { EchoStudyLearnerReadiness, EchoStudyRecord } from './echoStudyRecord.ts'

// EchoPhenotype — Batch 6. A phenotype groups one or more EchoStudyRecords
// under a shared educational label (e.g. "Dilated cardiomyopathy") and
// declares what it can be compared against. It never carries media itself;
// it only references real study identities that already exist elsewhere,
// and its own learnerReadiness is DERIVED from its member studies'
// readiness, never asserted independently — see
// deriveEchoPhenotypeReadiness below.

export interface EchoPhenotype {
  phenotypeKey: string
  label: string
  /** studyIds of every EchoStudy this phenotype currently groups. Must be non-empty. */
  studyIds: string[]
  /** Other phenotypeKeys this one may be contrasted against in Clinical Orbit / contrastive mode. Symmetry is not assumed — declare both directions explicitly if both are intended. */
  comparisonGroup: string[]
  provenanceRef: string
}

export const ECHO_PHENOTYPE_SEED: readonly EchoPhenotype[] = [
  {
    phenotypeKey: 'echo-phenotype:normal',
    label: 'Normal',
    studyIds: ['echo-a4c-governed-preview-v1'],
    comparisonGroup: ['echo-phenotype:dcm', 'echo-phenotype:hcm'],
    provenanceRef: 'app/lib/clinicalMedia/echoPreviewStudy.ts (echo-a4c-governed-preview-v1)',
  },
  {
    phenotypeKey: 'echo-phenotype:dcm',
    label: 'Dilated cardiomyopathy',
    studyIds: ['echo-a4c-dcm-e00476'],
    comparisonGroup: ['echo-phenotype:normal', 'echo-phenotype:hcm'],
    provenanceRef: 'docs/case-media-resume/echo-readiness-snapshot.json (echo-a4c-dcm-e00476); branch feature/echo-competency-engine-v1 echoBatch01CandidateRegistry.ts + echoDcmDerivativeReview.ts (candidate identity, governance gate — not merged, referenced only)',
  },
  {
    phenotypeKey: 'echo-phenotype:hcm',
    label: 'Hypertrophic cardiomyopathy',
    studyIds: ['echo-a4c-severe-hcm-mm0002'],
    comparisonGroup: ['echo-phenotype:normal', 'echo-phenotype:dcm'],
    provenanceRef: 'branch feature/echo-competency-engine-v1 echoBatch01CandidateRegistry.ts (echo-a4c-severe-hcm-mm0002) + echoBatch01ClinicalPromotion.ts (governance gate — not merged, referenced only)',
  },
] as const

export function validateEchoPhenotypeSeed(phenotypes: readonly EchoPhenotype[] = ECHO_PHENOTYPE_SEED): void {
  const keys = new Set<string>()
  for (const phenotype of phenotypes) {
    if (!phenotype.phenotypeKey.trim() || !phenotype.label.trim()) throw new Error('Echo phenotype identity and label are required.')
    if (!phenotype.studyIds.length) throw new Error(`Echo phenotype ${phenotype.phenotypeKey} must reference at least one study.`)
    if (keys.has(phenotype.phenotypeKey)) throw new Error(`Duplicate Echo phenotype key: ${phenotype.phenotypeKey}`)
    keys.add(phenotype.phenotypeKey)
  }
  for (const phenotype of phenotypes) {
    for (const target of phenotype.comparisonGroup) {
      if (!phenotypes.some(candidate => candidate.phenotypeKey === target)) {
        throw new Error(`Echo phenotype ${phenotype.phenotypeKey} references an unknown comparison target: ${target}`)
      }
      if (target === phenotype.phenotypeKey) throw new Error(`Echo phenotype ${phenotype.phenotypeKey} cannot compare against itself.`)
    }
  }
}

/**
 * A phenotype's readiness is the readiness of its WEAKEST member study — it
 * is never asserted directly. If every member study is learner-ready the
 * phenotype is 'ready'; otherwise it inherits the most restrictive study
 * state. This means a phenotype can never claim to be more ready than the
 * real content backing it.
 */
export function deriveEchoPhenotypeReadiness(
  phenotype: EchoPhenotype,
  studyRecords: readonly EchoStudyRecord[],
): EchoStudyLearnerReadiness {
  const rank: Record<EchoStudyLearnerReadiness, number> = { ready: 0, labs: 1, media_pending: 2, review_required: 3 }
  let worst: EchoStudyLearnerReadiness = 'ready'
  for (const studyId of phenotype.studyIds) {
    const record = studyRecords.find(candidate => candidate.studyKey === studyId)
    if (!record) throw new Error(`Echo phenotype ${phenotype.phenotypeKey} references unknown study: ${studyId}`)
    if (rank[record.learnerReadiness] > rank[worst]) worst = record.learnerReadiness
  }
  return worst
}

export function findEchoPhenotype(phenotypeKey: string, phenotypes: readonly EchoPhenotype[] = ECHO_PHENOTYPE_SEED): EchoPhenotype | null {
  return phenotypes.find(phenotype => phenotype.phenotypeKey === phenotypeKey) ?? null
}
