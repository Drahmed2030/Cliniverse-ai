import type { ClinicalMediaModality } from './clinicalMediaGovernancePipeline'

export type AutomatedGateDecision = 'PASS' | 'HOLD' | 'FAIL'
export type ClinicalMediaKind = 'CINE_VIDEO' | 'STATIC_IMAGE' | 'WAVEFORM' | 'DICOM_SERIES'

export interface ClinicalMediaAutomatedObservation {
  assetId: string
  modality: ClinicalMediaModality
  mediaKind: ClinicalMediaKind
  sourceSha256: string
  derivativeSha256: string
  observedDerivativeSha256: string
  byteLength: number
  decodeSucceeded: boolean
  mediaKindCompatible: boolean
  geometryValid: boolean
  metadataPolicyPassed: boolean
  unexpectedAudioAbsent: boolean
  frameCount?: number
  durationMs?: number
  timestampsMonotonic?: boolean
  imageWidth?: number
  imageHeight?: number
  waveformSamples?: number
  dicomInstanceCount?: number
  dicomOrderingValid?: boolean
  knownSeriesCompleteness?: boolean | null
}

export interface ClinicalMediaAutomatedGateResult {
  assetId: string
  modality: ClinicalMediaModality
  decision: AutomatedGateDecision
  technicallyVerified: boolean
  privacyCleared: false
  clinicalReviewed: false
  learnerEligible: false
  blockers: readonly string[]
  warnings: readonly string[]
}

const KIND_BY_MODALITY: Readonly<Record<ClinicalMediaModality, readonly ClinicalMediaKind[]>> = {
  ECHO: ['CINE_VIDEO', 'DICOM_SERIES'],
  ECG: ['WAVEFORM', 'STATIC_IMAGE', 'DICOM_SERIES'],
  XRAY: ['STATIC_IMAGE', 'DICOM_SERIES'],
  CT: ['DICOM_SERIES'],
  ANGIO: ['CINE_VIDEO', 'DICOM_SERIES'],
}

function requireSha256(value: string, field: string): void {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error(`${field} must be a SHA256 hex digest`)
}

function requirePositiveInteger(value: number | undefined, blocker: string, blockers: string[]): void {
  if (!Number.isInteger(value) || (value ?? 0) <= 0) blockers.push(blocker)
}

export function evaluateClinicalMediaAutomatedGate(
  input: ClinicalMediaAutomatedObservation,
): ClinicalMediaAutomatedGateResult {
  requireSha256(input.sourceSha256, 'sourceSha256')
  requireSha256(input.derivativeSha256, 'derivativeSha256')
  requireSha256(input.observedDerivativeSha256, 'observedDerivativeSha256')

  const blockers: string[] = []
  const warnings: string[] = []

  if (input.observedDerivativeSha256.toLowerCase() !== input.derivativeSha256.toLowerCase()) {
    blockers.push('derivative-checksum-mismatch')
  }
  if (!Number.isInteger(input.byteLength) || input.byteLength <= 0) blockers.push('empty-or-invalid-byte-length')
  if (!input.decodeSucceeded) blockers.push('decode-failed')
  if (!input.mediaKindCompatible || !KIND_BY_MODALITY[input.modality].includes(input.mediaKind)) {
    blockers.push('media-kind-incompatible-with-modality')
  }
  if (!input.geometryValid) blockers.push('geometry-invalid')
  if (!input.metadataPolicyPassed) blockers.push('metadata-policy-failed')
  if (!input.unexpectedAudioAbsent) blockers.push('unexpected-audio-present')

  if (input.mediaKind === 'CINE_VIDEO') {
    requirePositiveInteger(input.frameCount, 'cine-frame-count-invalid', blockers)
    requirePositiveInteger(input.durationMs, 'cine-duration-invalid', blockers)
    if (input.timestampsMonotonic !== true) blockers.push('cine-timestamps-not-monotonic')
    requirePositiveInteger(input.imageWidth, 'cine-width-invalid', blockers)
    requirePositiveInteger(input.imageHeight, 'cine-height-invalid', blockers)
  }

  if (input.mediaKind === 'STATIC_IMAGE') {
    requirePositiveInteger(input.imageWidth, 'image-width-invalid', blockers)
    requirePositiveInteger(input.imageHeight, 'image-height-invalid', blockers)
  }

  if (input.mediaKind === 'WAVEFORM') {
    requirePositiveInteger(input.waveformSamples, 'waveform-sample-count-invalid', blockers)
  }

  if (input.mediaKind === 'DICOM_SERIES') {
    requirePositiveInteger(input.dicomInstanceCount, 'dicom-instance-count-invalid', blockers)
    if (input.dicomOrderingValid !== true) blockers.push('dicom-ordering-invalid')
    if (input.knownSeriesCompleteness === false) blockers.push('dicom-series-incomplete')
    if (input.knownSeriesCompleteness == null) warnings.push('dicom-series-completeness-not-established')
  }

  const decision: AutomatedGateDecision = blockers.length ? 'FAIL' : warnings.length ? 'HOLD' : 'PASS'

  return {
    assetId: input.assetId,
    modality: input.modality,
    decision,
    technicallyVerified: decision === 'PASS',
    privacyCleared: false,
    clinicalReviewed: false,
    learnerEligible: false,
    blockers,
    warnings,
  }
}

export interface BatchAutomatedGateSummary {
  total: number
  pass: number
  hold: number
  fail: number
  allTechnicallyVerified: boolean
  failedAssetIds: readonly string[]
  heldAssetIds: readonly string[]
}

export function summarizeAutomatedGateBatch(
  results: readonly ClinicalMediaAutomatedGateResult[],
): BatchAutomatedGateSummary {
  const pass = results.filter(result => result.decision === 'PASS')
  const hold = results.filter(result => result.decision === 'HOLD')
  const fail = results.filter(result => result.decision === 'FAIL')

  return {
    total: results.length,
    pass: pass.length,
    hold: hold.length,
    fail: fail.length,
    allTechnicallyVerified: results.length > 0 && pass.length === results.length,
    failedAssetIds: fail.map(result => result.assetId),
    heldAssetIds: hold.map(result => result.assetId),
  }
}
