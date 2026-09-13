export type EcgWaveformSourceFormat = 'WFDB' | 'DICOM_WAVEFORM' | 'SCP_ECG' | 'VENDOR_ADAPTER'
export type EcgLeadId =
  | 'I' | 'II' | 'III' | 'aVR' | 'aVL' | 'aVF'
  | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6'

export type CanonicalEcgVersion = '1.0.0' | '1.1.0'
export type CanonicalEcgProfile = 'COMPLETE_SIMULTANEOUS_12_LEAD' | 'GENERAL_ECG_WAVEFORM'

export interface CanonicalEcgLead {
  leadId: EcgLeadId
  sampleCount: number
  samplingFrequencyHz: number
  gainUnitsPerMv: number
  baselineUnits: number
  unit: 'mV'
  channelInstanceId?: string
  sourceCode?: string
  sourceCodingSystem?: string
  sourceModifierCodes?: readonly string[]
  multiplexGroupId?: string
  startOffsetMs?: number
  channelSkewMs?: number
  invalidSampleValue?: number
}

export interface CanonicalEcgSampleBufferRef {
  artifactId: string
  sha256: string
  encoding: string
  immutable: true
}

export interface CanonicalEcgAnnotation {
  annotationId: string
  code: string
  codingSystem: string
  startMs: number
  endMs?: number
  channelInstanceIds: readonly string[]
  value?: string
  authorOrSource?: string
  interpretationStatus?: 'SOURCE' | 'DERIVED' | 'HUMAN_REVIEWED'
}

export interface CanonicalEcgMultiplexGroup {
  groupId: string
  startOffsetMs: number
  durationMs: number
  channelInstanceIds: readonly string[]
}

export interface EcgIngestionProvenance {
  sourceSystemId: string
  sourceProfileId: string
  adapterId: string
  adapterVersion: string
  decoderId: string
  decoderVersion: string
  configurationDigestSha256: string
  mappingEvidenceId: string
  canonicalWaveformSha256: string
}

export interface CanonicalEcgWaveform {
  canonicalVersion: CanonicalEcgVersion
  profile?: CanonicalEcgProfile
  sourceFormat: EcgWaveformSourceFormat
  sourceRecordId: string
  durationMs: number
  leadCount: number
  leads: readonly CanonicalEcgLead[]
  sourceArtifactSha256: readonly string[]
  decoderId: string
  decoderVersion: string
  calibrationPolicyId: string
  calibrationPolicyVersion: string
  timingPreserved: boolean
  samplesPreserved: boolean
  annotationsPreservedAsMetadata: boolean
  sampleBufferRef?: CanonicalEcgSampleBufferRef
  multiplexGroups?: readonly CanonicalEcgMultiplexGroup[]
  annotations?: readonly CanonicalEcgAnnotation[]
  ingestionProvenance?: EcgIngestionProvenance
}

/**
 * Renderer identity is intentionally canonical-input based. Source-system,
 * adapter and decoder identity belong to ingestion provenance, not the
 * deterministic renderer/device fingerprint.
 */
export interface EcgRendererFingerprintV1 {
  rendererId: string
  rendererVersion: string
  layoutPolicyId: string
  layoutPolicyVersion: string
  calibrationPolicyId: string
  calibrationPolicyVersion: string
  outputRecipeId: string
  outputRecipeVersion: string
  platformFamily: string
  canonicalWaveformSha256?: string
  outputArtifactSha256?: string
}

export interface EcgAdapterResultV1 {
  status: 'ADAPTED' | 'HOLD' | 'UNSUPPORTED'
  sourceFormat: EcgWaveformSourceFormat
  sourceProfileId: string
  sourceSystemId: string
  adapterId: string
  adapterVersion: string
  decoderId: string
  decoderVersion: string
  configurationDigestSha256: string
  sourceArtifactSha256: readonly string[]
  canonicalWaveformSha256?: string
  mappingEvidenceId?: string
  unsupportedFeatureBlockers: readonly string[]
}

export interface CanonicalWaveformValidationResult {
  valid: boolean
  blockers: readonly string[]
}

const REQUIRED_12_LEADS: readonly EcgLeadId[] = [
  'I', 'II', 'III', 'aVR', 'aVL', 'aVF',
  'V1', 'V2', 'V3', 'V4', 'V5', 'V6',
]

const SUPPORTED_CANONICAL_VERSIONS = new Set<CanonicalEcgVersion>(['1.0.0', '1.1.0'])

function validSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value)
}

function finitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function finiteNumber(value: number): boolean {
  return Number.isFinite(value)
}

export function validateCanonicalEcgWaveform(
  waveform: CanonicalEcgWaveform,
): CanonicalWaveformValidationResult {
  const blockers: string[] = []

  if (!SUPPORTED_CANONICAL_VERSIONS.has(waveform.canonicalVersion)) blockers.push('canonical-version-unsupported')
  if (!waveform.sourceRecordId.trim()) blockers.push('source-record-id-required')
  if (!finitePositive(waveform.durationMs)) blockers.push('duration-invalid')
  if (!Number.isInteger(waveform.leadCount) || waveform.leadCount <= 0) blockers.push('lead-count-invalid')
  if (waveform.leadCount !== waveform.leads.length) blockers.push('lead-count-mismatch')
  if (!waveform.sourceArtifactSha256.length) blockers.push('source-sha-required')
  for (const sha of waveform.sourceArtifactSha256) {
    if (!validSha256(sha)) blockers.push('source-sha-invalid')
  }
  if (!waveform.decoderId.trim() || !waveform.decoderVersion.trim()) blockers.push('decoder-fingerprint-required')
  if (!waveform.calibrationPolicyId.trim() || !waveform.calibrationPolicyVersion.trim()) {
    blockers.push('calibration-policy-required')
  }
  if (!waveform.timingPreserved) blockers.push('timing-must-be-preserved')
  if (!waveform.samplesPreserved) blockers.push('samples-must-be-preserved')
  if (!waveform.annotationsPreservedAsMetadata) blockers.push('annotations-must-remain-metadata')

  const leadIds = waveform.leads.map(lead => lead.leadId)
  const presentLeads = new Set(leadIds)
  if (presentLeads.size !== leadIds.length) blockers.push('duplicate-lead-id')

  const requiresCompleteTwelveLead = waveform.profile !== 'GENERAL_ECG_WAVEFORM'
  if (requiresCompleteTwelveLead) {
    for (const leadId of REQUIRED_12_LEADS) {
      if (!presentLeads.has(leadId)) blockers.push(`required-lead-missing:${leadId}`)
    }
  }

  for (const lead of waveform.leads) {
    if (!Number.isInteger(lead.sampleCount) || lead.sampleCount <= 0) blockers.push(`sample-count-invalid:${lead.leadId}`)
    if (!finitePositive(lead.samplingFrequencyHz)) blockers.push(`sampling-frequency-invalid:${lead.leadId}`)
    if (!finitePositive(lead.gainUnitsPerMv)) blockers.push(`gain-invalid:${lead.leadId}`)
    if (!finiteNumber(lead.baselineUnits)) blockers.push(`baseline-invalid:${lead.leadId}`)
    if (lead.startOffsetMs !== undefined && !finiteNumber(lead.startOffsetMs)) blockers.push(`start-offset-invalid:${lead.leadId}`)
    if (lead.channelSkewMs !== undefined && !finiteNumber(lead.channelSkewMs)) blockers.push(`channel-skew-invalid:${lead.leadId}`)

    if (finitePositive(lead.samplingFrequencyHz) && Number.isInteger(lead.sampleCount) && lead.sampleCount > 0 && finitePositive(waveform.durationMs)) {
      const expectedDurationMs = (lead.sampleCount / lead.samplingFrequencyHz) * 1000
      const startOffsetMs = lead.startOffsetMs ?? 0
      if (startOffsetMs === 0 && Math.abs(expectedDurationMs - waveform.durationMs) > 2) {
        blockers.push(`sample-duration-inconsistent:${lead.leadId}`)
      }
    }
  }

  return { valid: blockers.length === 0, blockers }
}

export function validateHospitalCanonicalEcgWaveformV11(
  waveform: CanonicalEcgWaveform,
): CanonicalWaveformValidationResult {
  const blockers = [...validateCanonicalEcgWaveform(waveform).blockers]

  if (waveform.canonicalVersion !== '1.1.0') blockers.push('hospital-profile-requires-v1.1.0')
  if (!waveform.profile) blockers.push('canonical-profile-required')
  if (!waveform.sampleBufferRef) blockers.push('immutable-sample-buffer-required')
  else {
    if (!waveform.sampleBufferRef.artifactId.trim()) blockers.push('sample-buffer-artifact-id-required')
    if (!validSha256(waveform.sampleBufferRef.sha256)) blockers.push('sample-buffer-sha-invalid')
    if (!waveform.sampleBufferRef.encoding.trim()) blockers.push('sample-buffer-encoding-required')
    if (waveform.sampleBufferRef.immutable !== true) blockers.push('sample-buffer-must-be-immutable')
  }

  const channelIds = waveform.leads.map(lead => lead.channelInstanceId?.trim()).filter(Boolean) as string[]
  if (channelIds.length !== waveform.leads.length) blockers.push('channel-instance-id-required')
  if (new Set(channelIds).size !== channelIds.length) blockers.push('duplicate-channel-instance-id')
  for (const lead of waveform.leads) {
    if (!lead.sourceCode?.trim() || !lead.sourceCodingSystem?.trim()) blockers.push(`coded-lead-metadata-required:${lead.leadId}`)
  }

  if (!waveform.multiplexGroups?.length) blockers.push('multiplex-group-required')
  else {
    const knownChannels = new Set(channelIds)
    for (const group of waveform.multiplexGroups) {
      if (!group.groupId.trim()) blockers.push('multiplex-group-id-required')
      if (!finiteNumber(group.startOffsetMs) || !finitePositive(group.durationMs)) blockers.push(`multiplex-group-timing-invalid:${group.groupId}`)
      if (!group.channelInstanceIds.length) blockers.push(`multiplex-group-channels-required:${group.groupId}`)
      for (const channelId of group.channelInstanceIds) {
        if (!knownChannels.has(channelId)) blockers.push(`multiplex-group-channel-unknown:${group.groupId}:${channelId}`)
      }
    }
  }

  if (!waveform.ingestionProvenance) blockers.push('ingestion-provenance-required')
  else {
    const provenance = waveform.ingestionProvenance
    if (!provenance.sourceSystemId.trim()) blockers.push('source-system-id-required')
    if (!provenance.sourceProfileId.trim()) blockers.push('source-profile-id-required')
    if (!provenance.adapterId.trim() || !provenance.adapterVersion.trim()) blockers.push('adapter-fingerprint-required')
    if (!provenance.decoderId.trim() || !provenance.decoderVersion.trim()) blockers.push('ingestion-decoder-fingerprint-required')
    if (!validSha256(provenance.configurationDigestSha256)) blockers.push('adapter-configuration-digest-invalid')
    if (!validSha256(provenance.canonicalWaveformSha256)) blockers.push('canonical-waveform-sha-invalid')
    if (!provenance.mappingEvidenceId.trim()) blockers.push('mapping-evidence-id-required')
  }

  for (const annotation of waveform.annotations ?? []) {
    if (!annotation.annotationId.trim()) blockers.push('annotation-id-required')
    if (!annotation.code.trim() || !annotation.codingSystem.trim()) blockers.push(`annotation-code-required:${annotation.annotationId}`)
    if (!finiteNumber(annotation.startMs) || (annotation.endMs !== undefined && !finiteNumber(annotation.endMs))) {
      blockers.push(`annotation-timing-invalid:${annotation.annotationId}`)
    }
    if (annotation.endMs !== undefined && annotation.endMs < annotation.startMs) blockers.push(`annotation-range-invalid:${annotation.annotationId}`)
    if (!annotation.channelInstanceIds.length) blockers.push(`annotation-channel-reference-required:${annotation.annotationId}`)
  }

  return { valid: blockers.length === 0, blockers }
}

export function validateEcgAdapterResultV1(result: EcgAdapterResultV1): CanonicalWaveformValidationResult {
  const blockers: string[] = []
  if (!result.sourceProfileId.trim()) blockers.push('source-profile-id-required')
  if (!result.sourceSystemId.trim()) blockers.push('source-system-id-required')
  if (!result.adapterId.trim() || !result.adapterVersion.trim()) blockers.push('adapter-fingerprint-required')
  if (!result.decoderId.trim() || !result.decoderVersion.trim()) blockers.push('decoder-fingerprint-required')
  if (!validSha256(result.configurationDigestSha256)) blockers.push('adapter-configuration-digest-invalid')
  if (!result.sourceArtifactSha256.length || result.sourceArtifactSha256.some(sha => !validSha256(sha))) blockers.push('source-artifact-sha-invalid')
  if (result.status === 'ADAPTED') {
    if (!result.canonicalWaveformSha256 || !validSha256(result.canonicalWaveformSha256)) blockers.push('canonical-waveform-sha-required')
    if (!result.mappingEvidenceId?.trim()) blockers.push('mapping-evidence-id-required')
    if (result.unsupportedFeatureBlockers.length) blockers.push('adapted-result-cannot-have-unsupported-blockers')
  }
  if (result.status === 'UNSUPPORTED' && !result.unsupportedFeatureBlockers.length) blockers.push('unsupported-feature-blocker-required')
  return { valid: blockers.length === 0, blockers }
}

export function describeEcgInteroperabilityBoundary() {
  return {
    canonicalModelRequired: true,
    rendererReadsCanonicalModel: true,
    sourceAdapters: ['WFDB', 'DICOM_WAVEFORM', 'SCP_ECG', 'VENDOR_ADAPTER'] as const,
    sourceSpecificLogicAllowedInRenderer: false,
    sourceSamplesMayBeSilentlyNormalized: false,
    sourceTimingMayBeSilentlyChanged: false,
    annotationsRemainMetadata: true,
    futureHospitalFormatsDoNotChangeCompetencyContract: true,
    hospitalCanonicalVersion: '1.1.0' as const,
    transportModelSeparateFromTwelveLeadEducationalProfile: true,
    ingestionProvenanceSeparateFromRendererFingerprint: true,
  } as const
}
