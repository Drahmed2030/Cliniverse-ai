import type { ClinicalMediaModality } from './clinicalMediaGovernancePipeline'

export type RendererBaselineStatus = 'ACTIVE' | 'HOLD' | 'RETIRED'
export type RendererBaselineDecision = 'COVERED' | 'SAMPLE_REQUIRED' | 'HOLD'

export interface RendererBaselineFingerprint {
  modality: ClinicalMediaModality
  rendererId: string
  rendererVersion: string
  mediaPolicyVersion: string
  encodingRecipeVersion: string
  platformFamily: 'APPLE_WEBKIT' | 'APPLE_NATIVE' | 'WEB' | 'OTHER'
}

export interface RendererBaselineEvidence {
  baselineId: string
  fingerprint: RendererBaselineFingerprint
  status: RendererBaselineStatus
  establishedAt: string
  sampleAssetIds: readonly string[]
  currentDeviceEvidence: boolean
  legacyDeviceEvidence: boolean
  playbackStarts: boolean
  controlsWork: boolean
  geometryPreserved: boolean
  noBlankFailure: boolean
  representativeFeatures: readonly string[]
  notes: readonly string[]
}

export interface RendererBaselineAssetInput {
  assetId: string
  modality: ClinicalMediaModality
  rendererId: string
  rendererVersion: string
  mediaPolicyVersion: string
  encodingRecipeVersion: string
  technicallyVerified: boolean
  requiredRepresentativeFeatures: readonly string[]
  highRiskOrNovelFeatures?: readonly string[]
}

export interface RendererBaselineCoverageResult {
  assetId: string
  decision: RendererBaselineDecision
  deviceBaselineCovered: boolean
  blockers: readonly string[]
}

function requireText(value: string, field: string): void {
  if (!value.trim()) throw new Error(`${field} is required`)
}

function baselineCorePassed(evidence: RendererBaselineEvidence): boolean {
  return evidence.currentDeviceEvidence
    && evidence.playbackStarts
    && evidence.controlsWork
    && evidence.geometryPreserved
    && evidence.noBlankFailure
}

export function evaluateRendererBaselineCoverage(
  asset: RendererBaselineAssetInput,
  baseline: RendererBaselineEvidence,
): RendererBaselineCoverageResult {
  requireText(asset.assetId, 'assetId')
  requireText(asset.rendererId, 'rendererId')
  requireText(asset.rendererVersion, 'rendererVersion')
  requireText(asset.mediaPolicyVersion, 'mediaPolicyVersion')
  requireText(asset.encodingRecipeVersion, 'encodingRecipeVersion')
  requireText(baseline.baselineId, 'baselineId')

  const blockers: string[] = []

  if (baseline.status !== 'ACTIVE') blockers.push('renderer-baseline-not-active')
  if (!asset.technicallyVerified) blockers.push('asset-not-technically-verified')
  if (asset.modality !== baseline.fingerprint.modality) blockers.push('modality-baseline-mismatch')
  if (asset.rendererId !== baseline.fingerprint.rendererId) blockers.push('renderer-id-baseline-mismatch')
  if (asset.rendererVersion !== baseline.fingerprint.rendererVersion) blockers.push('renderer-version-baseline-mismatch')
  if (asset.mediaPolicyVersion !== baseline.fingerprint.mediaPolicyVersion) blockers.push('media-policy-version-baseline-mismatch')
  if (asset.encodingRecipeVersion !== baseline.fingerprint.encodingRecipeVersion) blockers.push('encoding-recipe-version-baseline-mismatch')
  if (!baselineCorePassed(baseline)) blockers.push('baseline-core-playback-evidence-incomplete')

  if (blockers.length) {
    return { assetId: asset.assetId, decision: 'HOLD', deviceBaselineCovered: false, blockers }
  }

  const represented = new Set(baseline.representativeFeatures)
  const missingFeatures = asset.requiredRepresentativeFeatures.filter(feature => !represented.has(feature))
  const novelFeatures = asset.highRiskOrNovelFeatures?.filter(feature => !represented.has(feature)) ?? []

  if (missingFeatures.length || novelFeatures.length) {
    return {
      assetId: asset.assetId,
      decision: 'SAMPLE_REQUIRED',
      deviceBaselineCovered: false,
      blockers: [
        ...missingFeatures.map(feature => `representative-feature-not-covered:${feature}`),
        ...novelFeatures.map(feature => `novel-feature-requires-device-sample:${feature}`),
      ],
    }
  }

  return { assetId: asset.assetId, decision: 'COVERED', deviceBaselineCovered: true, blockers: [] }
}

export interface RendererBaselineInvalidationInput {
  rendererVersionChanged: boolean
  mediaPolicyVersionChanged: boolean
  encodingRecipeVersionChanged: boolean
  platformEngineMajorChanged: boolean
  playbackRegressionDetected: boolean
  newHighRiskFeatureIntroduced: boolean
}

export function rendererBaselineRequiresRevalidation(input: RendererBaselineInvalidationInput): boolean {
  return input.rendererVersionChanged
    || input.mediaPolicyVersionChanged
    || input.encodingRecipeVersionChanged
    || input.platformEngineMajorChanged
    || input.playbackRegressionDetected
    || input.newHighRiskFeatureIntroduced
}
