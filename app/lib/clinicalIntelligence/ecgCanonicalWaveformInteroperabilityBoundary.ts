export type EcgWaveformSourceFormat = 'WFDB' | 'DICOM_WAVEFORM' | 'SCP_ECG' | 'VENDOR_ADAPTER'
export type EcgLeadId =
  | 'I' | 'II' | 'III' | 'aVR' | 'aVL' | 'aVF'
  | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6'

export interface CanonicalEcgLead {
  leadId: EcgLeadId
  sampleCount: number
  samplingFrequencyHz: number
  gainUnitsPerMv: number
  baselineUnits: number
  unit: 'mV'
}

export interface CanonicalEcgWaveform {
  canonicalVersion: '1.0.0'
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
}

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
  sourceFormat: EcgWaveformSourceFormat
  decoderId: string
  decoderVersion: string
}

export interface CanonicalWaveformValidationResult {
  valid: boolean
  blockers: readonly string[]
}

const REQUIRED_12_LEADS: readonly EcgLeadId[] = [
  'I', 'II', 'III', 'aVR', 'aVL', 'aVF',
  'V1', 'V2', 'V3', 'V4', 'V5', 'V6',
]

export function validateCanonicalEcgWaveform(
  waveform: CanonicalEcgWaveform,
): CanonicalWaveformValidationResult {
  const blockers: string[] = []

  if (!waveform.sourceRecordId.trim()) blockers.push('source-record-id-required')
  if (waveform.durationMs <= 0) blockers.push('duration-invalid')
  if (waveform.leadCount !== waveform.leads.length) blockers.push('lead-count-mismatch')
  if (!waveform.sourceArtifactSha256.length) blockers.push('source-sha-required')
  if (!waveform.decoderId.trim() || !waveform.decoderVersion.trim()) blockers.push('decoder-fingerprint-required')
  if (!waveform.calibrationPolicyId.trim() || !waveform.calibrationPolicyVersion.trim()) {
    blockers.push('calibration-policy-required')
  }
  if (!waveform.timingPreserved) blockers.push('timing-must-be-preserved')
  if (!waveform.samplesPreserved) blockers.push('samples-must-be-preserved')

  const presentLeads = new Set(waveform.leads.map(lead => lead.leadId))
  for (const leadId of REQUIRED_12_LEADS) {
    if (!presentLeads.has(leadId)) blockers.push(`required-lead-missing:${leadId}`)
  }

  for (const lead of waveform.leads) {
    if (lead.sampleCount <= 0) blockers.push(`sample-count-invalid:${lead.leadId}`)
    if (lead.samplingFrequencyHz <= 0) blockers.push(`sampling-frequency-invalid:${lead.leadId}`)
    if (lead.gainUnitsPerMv <= 0) blockers.push(`gain-invalid:${lead.leadId}`)
  }

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
  } as const
}
