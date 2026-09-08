export type EcgSourceManifestStatus = 'VERIFIED_SOURCE_CANDIDATE' | 'HOLD' | 'REJECT'

export interface EcgDatasetSourceManifest {
  sourceId: string
  title: string
  publisher: string
  version: string
  licenseId: 'CC-BY-4.0'
  accessPolicy: 'OPEN_ACCESS'
  doi: string
  modality: 'ECG'
  leadCount: 12
  durationSeconds: 10
  waveformFormat: 'WFDB'
  samplingFrequenciesHz: readonly [100, 500]
  annotationBasis: 'SCP-ECG'
  humanAnnotationPresent: true
  provenanceVerified: true
  licenseVerified: true
  commercialUseAllowed: true
  attributionRequired: true
  sourceUrl: string
  learnerUseAuthorized: false
  selectedRecordId: null
  notes: readonly string[]
}

/**
 * Source-level manifest only. This does not select a patient record, approve a
 * diagnosis, or make any waveform learner-ready. Record-level privacy,
 * technical, clinical, provenance and attribution gates remain mandatory.
 */
export const PTB_XL_SOURCE_MANIFEST: EcgDatasetSourceManifest = {
  sourceId: 'physionet-ptb-xl-v1.0.3',
  title: 'PTB-XL, a large publicly available electrocardiography dataset',
  publisher: 'PhysioNet',
  version: '1.0.3',
  licenseId: 'CC-BY-4.0',
  accessPolicy: 'OPEN_ACCESS',
  doi: '10.13026/kfzx-aw45',
  modality: 'ECG',
  leadCount: 12,
  durationSeconds: 10,
  waveformFormat: 'WFDB',
  samplingFrequenciesHz: [100, 500],
  annotationBasis: 'SCP-ECG',
  humanAnnotationPresent: true,
  provenanceVerified: true,
  licenseVerified: true,
  commercialUseAllowed: true,
  attributionRequired: true,
  sourceUrl: 'https://physionet.org/content/ptb-xl/1.0.3/',
  learnerUseAuthorized: false,
  selectedRecordId: null,
  notes: [
    'Source-level verification only; no individual ECG record has been selected.',
    'Record-level privacy and clinical review remain mandatory before governed learner use.',
    'Attribution must cite the PTB-XL PhysioNet resource and version used.',
  ],
}

export function evaluateEcgSourceManifest(
  source: EcgDatasetSourceManifest,
): { status: EcgSourceManifestStatus; blockers: readonly string[] } {
  const blockers: string[] = []
  if (!source.provenanceVerified) blockers.push('source-provenance-unverified')
  if (!source.licenseVerified) blockers.push('source-license-unverified')
  if (!source.commercialUseAllowed) blockers.push('commercial-use-not-allowed')
  if (source.leadCount !== 12) blockers.push('twelve-lead-source-required')
  if (!source.samplingFrequenciesHz.includes(500)) blockers.push('high-resolution-source-missing')
  if (!source.attributionRequired) blockers.push('attribution-requirement-missing')

  const reject = blockers.includes('commercial-use-not-allowed')
  return {
    status: reject ? 'REJECT' : blockers.length ? 'HOLD' : 'VERIFIED_SOURCE_CANDIDATE',
    blockers,
  }
}
