import type { ClinicalMediaModality, GovernanceState } from './clinicalMediaGovernancePipeline'

export type DryRunStageStatus = 'PASS' | 'PENDING' | 'HOLD' | 'REJECT'

export interface ClinicalMediaPipelineDryRunInput {
  assetId: string
  modality: ClinicalMediaModality
  artifactSha256: string
  sourceAndRights: DryRunStageStatus
  automatedMediaGate: DryRunStageStatus
  privacyHumanAttestation: DryRunStageStatus
  clinicalHumanAttestation: DryRunStageStatus
  rendererBaseline: DryRunStageStatus
  registryBoundary: DryRunStageStatus
  promotionDecision: DryRunStageStatus
}

export interface ClinicalMediaPipelineDryRunResult {
  assetId: string
  modality: ClinicalMediaModality
  artifactSha256: string
  finalState: GovernanceState
  learnerEligible: false
  firstBlockingStage: keyof Omit<ClinicalMediaPipelineDryRunInput, 'assetId' | 'modality' | 'artifactSha256'> | null
  blockers: readonly string[]
}

const ORDER: readonly (keyof Omit<ClinicalMediaPipelineDryRunInput, 'assetId' | 'modality' | 'artifactSha256'>)[] = [
  'sourceAndRights',
  'automatedMediaGate',
  'privacyHumanAttestation',
  'clinicalHumanAttestation',
  'rendererBaseline',
  'registryBoundary',
  'promotionDecision',
]

function requireSha256(value: string): void {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error('artifactSha256 must be a SHA256 hex digest')
}

export function evaluateClinicalMediaPipelineDryRun(input: ClinicalMediaPipelineDryRunInput): ClinicalMediaPipelineDryRunResult {
  if (!input.assetId.trim()) throw new Error('assetId is required')
  requireSha256(input.artifactSha256)

  const blockers: string[] = []
  let firstBlockingStage: ClinicalMediaPipelineDryRunResult['firstBlockingStage'] = null

  for (const stage of ORDER) {
    const status = input[stage]
    if (status !== 'PASS') {
      if (!firstBlockingStage) firstBlockingStage = stage
      blockers.push(`${stage}:${status.toLowerCase()}`)
      if (status === 'REJECT') {
        return {
          assetId: input.assetId,
          modality: input.modality,
          artifactSha256: input.artifactSha256,
          finalState: 'REJECTED',
          learnerEligible: false,
          firstBlockingStage,
          blockers,
        }
      }
    }
  }

  if (firstBlockingStage) {
    const finalState: GovernanceState = firstBlockingStage === 'sourceAndRights' || firstBlockingStage === 'automatedMediaGate'
      ? 'QUARANTINED'
      : firstBlockingStage === 'privacyHumanAttestation'
        ? 'TECHNICALLY_VERIFIED'
        : firstBlockingStage === 'clinicalHumanAttestation'
          ? 'PRIVACY_CLEARED'
          : firstBlockingStage === 'rendererBaseline'
            ? 'CLINICALLY_REVIEWED'
            : 'DEVICE_BASELINE_COVERED'

    return {
      assetId: input.assetId,
      modality: input.modality,
      artifactSha256: input.artifactSha256,
      finalState,
      learnerEligible: false,
      firstBlockingStage,
      blockers,
    }
  }

  return {
    assetId: input.assetId,
    modality: input.modality,
    artifactSha256: input.artifactSha256,
    finalState: 'DEVICE_BASELINE_COVERED',
    learnerEligible: false,
    firstBlockingStage: null,
    blockers: ['promotion-execution-not-performed-in-dry-run'],
  }
}
