import type { EchoStudyView } from './echoStudyContract.ts'
import type { EchoStudyReviewStatus } from './echoStudyRecord.ts'

// EchoFinding — Batch 6. A qualitative, non-numeric observation tied to a
// specific study and view. Severity is optional and ONLY present when a
// governed source actually graded it — an ungraded finding leaves severity
// unset rather than guessing a grade. No finding here claims a diagnosis;
// each is phrased as an observation ("dilated, reduced global systolic
// function"), and reviewStatus tracks whether a clinician has confirmed it.

export type EchoFindingSeverity = 'mild' | 'moderate' | 'severe'

export interface EchoFinding {
  findingKey: string
  studyKey: string
  structure: string
  finding: string
  severity?: EchoFindingSeverity
  sourceView: EchoStudyView
  reviewStatus: EchoStudyReviewStatus
  provenanceRef: string
}

export const ECHO_FINDING_SEED: readonly EchoFinding[] = [
  {
    findingKey: 'echo-finding:dcm-lv-dilation',
    studyKey: 'echo-a4c-dcm-e00476',
    structure: 'left_ventricle',
    finding: 'Dilated left ventricle with visually reduced global systolic function',
    sourceView: 'A4C',
    reviewStatus: 'pending_review',
    provenanceRef: 'branch feature/echo-competency-engine-v1 echoBatch01CandidateRegistry.ts (echo-a4c-dcm-e00476, sourceDescription "A4CH: dilated poor left ventricle") — source-page description only, no specialist grading recorded in this checkout; severity deliberately left unset.',
  },
  {
    findingKey: 'echo-finding:hcm-lv-hypertrophy',
    studyKey: 'echo-a4c-severe-hcm-mm0002',
    structure: 'left_ventricle',
    finding: 'Increased left ventricular wall thickness consistent with a hypertrophic pattern',
    severity: 'severe',
    sourceView: 'A4C',
    reviewStatus: 'pending_review',
    provenanceRef: 'branch feature/echo-competency-engine-v1 echoBatch01CandidateRegistry.ts (echo-a4c-severe-hcm-mm0002, diagnosisLabel "Severe hypertrophic cardiomyopathy") — severity taken directly from the source label ("Severe"), not independently graded; specialist clinical review still pending.',
  },
] as const

export function validateEchoFindingSeed(findings: readonly EchoFinding[] = ECHO_FINDING_SEED): void {
  const keys = new Set<string>()
  for (const finding of findings) {
    if (!finding.findingKey.trim() || !finding.studyKey.trim() || !finding.structure.trim() || !finding.finding.trim()) {
      throw new Error('Echo finding identity, study, structure and description are required.')
    }
    if (!finding.provenanceRef.trim()) throw new Error(`Echo finding ${finding.findingKey} requires a provenance reference.`)
    if (keys.has(finding.findingKey)) throw new Error(`Duplicate Echo finding key: ${finding.findingKey}`)
    keys.add(finding.findingKey)
  }
}

export function findingsForStudy(studyKey: string, findings: readonly EchoFinding[] = ECHO_FINDING_SEED): EchoFinding[] {
  return findings.filter(finding => finding.studyKey === studyKey)
}
