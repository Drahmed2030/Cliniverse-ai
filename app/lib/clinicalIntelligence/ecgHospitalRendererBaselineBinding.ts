import type { EcgRendererFingerprintV1 } from './ecgCanonicalWaveformInteroperabilityBoundary.ts'

export type EcgHospitalRendererDecision = 'COVERED' | 'HOLD'

export interface EcgHospitalRendererTarget {
  canonicalWaveformSha256: string
  outputArtifactSha256: string
  platformFamily: string
  rendererId: string
  rendererVersion: string
  layoutPolicyId: string
  layoutPolicyVersion: string
  calibrationPolicyId: string
  calibrationPolicyVersion: string
  outputRecipeId: string
  outputRecipeVersion: string
}

export interface EcgHospitalRendererEvidence {
  fingerprint: EcgRendererFingerprintV1
  platformFamily: string
  exactOutputArtifactSha256: string
  currentDeviceEvidence: boolean
  geometryPreserved: boolean
  fullTimelinePreserved: boolean
  leadIdentityPreserved: boolean
  calibrationPreserved: boolean
  annotationsReadable: boolean
  deviations: readonly string[]
}

export interface EcgHospitalRendererCoverageResult {
  decision: EcgHospitalRendererDecision
  blockers: readonly string[]
}

function validSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value)
}

function requireText(value: string, blocker: string, blockers: string[]): void {
  if (!value.trim()) blockers.push(blocker)
}

/**
 * Hospital renderer/device evidence is bound to canonical content identity,
 * exact output artifact identity, and the exact target platform family. Source
 * system, adapter, and decoder identity remain ingestion provenance and are
 * intentionally excluded from renderer identity.
 */
export function evaluateEcgHospitalRendererCoverage(
  target: EcgHospitalRendererTarget,
  evidence: EcgHospitalRendererEvidence,
): EcgHospitalRendererCoverageResult {
  const blockers: string[] = []

  if (!validSha256(target.canonicalWaveformSha256)) blockers.push('canonical-waveform-sha-invalid')
  if (!validSha256(target.outputArtifactSha256)) blockers.push('output-artifact-sha-invalid')
  requireText(target.platformFamily, 'target-platform-family-required', blockers)
  requireText(target.rendererId, 'renderer-id-required', blockers)
  requireText(target.rendererVersion, 'renderer-version-required', blockers)
  requireText(target.layoutPolicyId, 'layout-policy-id-required', blockers)
  requireText(target.layoutPolicyVersion, 'layout-policy-version-required', blockers)
  requireText(target.calibrationPolicyId, 'calibration-policy-id-required', blockers)
  requireText(target.calibrationPolicyVersion, 'calibration-policy-version-required', blockers)
  requireText(target.outputRecipeId, 'output-recipe-id-required', blockers)
  requireText(target.outputRecipeVersion, 'output-recipe-version-required', blockers)

  const fp = evidence.fingerprint
  if (evidence.platformFamily !== target.platformFamily || fp.platformFamily !== target.platformFamily) {
    blockers.push('platform-family-mismatch')
  }
  if (fp.rendererId !== target.rendererId || fp.rendererVersion !== target.rendererVersion) {
    blockers.push('renderer-fingerprint-mismatch')
  }
  if (fp.layoutPolicyId !== target.layoutPolicyId || fp.layoutPolicyVersion !== target.layoutPolicyVersion) {
    blockers.push('layout-policy-fingerprint-mismatch')
  }
  if (fp.calibrationPolicyId !== target.calibrationPolicyId || fp.calibrationPolicyVersion !== target.calibrationPolicyVersion) {
    blockers.push('calibration-policy-fingerprint-mismatch')
  }
  if (fp.outputRecipeId !== target.outputRecipeId || fp.outputRecipeVersion !== target.outputRecipeVersion) {
    blockers.push('output-recipe-fingerprint-mismatch')
  }
  if (fp.canonicalWaveformSha256 !== target.canonicalWaveformSha256) blockers.push('canonical-waveform-identity-mismatch')
  if (fp.outputArtifactSha256 !== target.outputArtifactSha256) blockers.push('output-artifact-identity-mismatch')
  if (evidence.exactOutputArtifactSha256 !== target.outputArtifactSha256) blockers.push('evidence-output-artifact-mismatch')

  if (!evidence.currentDeviceEvidence) blockers.push('current-device-evidence-required')
  if (!evidence.geometryPreserved) blockers.push('geometry-preservation-required')
  if (!evidence.fullTimelinePreserved) blockers.push('full-timeline-preservation-required')
  if (!evidence.leadIdentityPreserved) blockers.push('lead-identity-preservation-required')
  if (!evidence.calibrationPreserved) blockers.push('calibration-preservation-required')
  if (!evidence.annotationsReadable) blockers.push('annotation-readability-required')
  if (evidence.deviations.length) blockers.push(...evidence.deviations.map(item => `renderer-deviation:${item}`))

  return {
    decision: blockers.length ? 'HOLD' : 'COVERED',
    blockers,
  }
}

export function describeEcgHospitalRendererBinding() {
  return {
    sourceVendorExcludedFromRendererIdentity: true,
    adapterDecoderExcludedFromRendererIdentity: true,
    canonicalWaveformIdentityRequired: true,
    exactOutputArtifactIdentityRequired: true,
    exactPlatformFamilyRequired: true,
    deviceEvidenceRequired: true,
    deviationsFailClosed: true,
  } as const
}
