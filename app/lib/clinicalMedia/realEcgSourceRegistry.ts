export type RealEcgSourceRole =
  | 'broad-12-lead-case-library'
  | 'beat-level-arrhythmia'
  | 'wave-delineation-and-morphology'

export interface RealEcgSourceRecord {
  sourceId: string
  title: string
  version: string
  publisher: 'PhysioNet'
  url: string
  doi: string
  licenseId: 'CC-BY-4.0' | 'ODC-BY-1.0'
  licenseUrl: string
  access: 'open'
  signalObject: 'wfdb-calibrated-time-series'
  role: RealEcgSourceRole
  selectionStatus: 'approved-for-file-level-curation-no-signals-ingested'
  facts: {
    records: number
    leads: number
    durationSeconds?: number
    samplingHertz: number[]
    annotation: string
  }
}

export const REAL_ECG_SOURCE_REGISTRY: readonly RealEcgSourceRecord[] = [
  {
    sourceId: 'physionet:ptb-xl:1.0.3',
    title: 'PTB-XL, a large publicly available electrocardiography dataset',
    version: '1.0.3',
    publisher: 'PhysioNet',
    url: 'https://physionet.org/content/ptb-xl/1.0.3/',
    doi: '10.13026/kfzx-aw45',
    licenseId: 'CC-BY-4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    access: 'open',
    signalObject: 'wfdb-calibrated-time-series',
    role: 'broad-12-lead-case-library',
    selectionStatus: 'approved-for-file-level-curation-no-signals-ingested',
    facts: {
      records: 21799,
      leads: 12,
      durationSeconds: 10,
      samplingHertz: [100, 500],
      annotation: 'Up to two cardiologists; 71 SCP-ECG diagnostic, form and rhythm statements.',
    },
  },
  {
    sourceId: 'physionet:mit-bih-arrhythmia:1.0.0',
    title: 'MIT-BIH Arrhythmia Database',
    version: '1.0.0',
    publisher: 'PhysioNet',
    url: 'https://physionet.org/content/mitdb/1.0.0/',
    doi: '10.13026/C2F305',
    licenseId: 'ODC-BY-1.0',
    licenseUrl: 'https://opendatacommons.org/licenses/by/1-0/',
    access: 'open',
    signalObject: 'wfdb-calibrated-time-series',
    role: 'beat-level-arrhythmia',
    selectionStatus: 'approved-for-file-level-curation-no-signals-ingested',
    facts: {
      records: 48,
      leads: 2,
      samplingHertz: [360],
      annotation: 'Reference beat annotations for all 48 half-hour ambulatory records.',
    },
  },
  {
    sourceId: 'physionet:ludb:1.0.1',
    title: 'Lobachevsky University Electrocardiography Database',
    version: '1.0.1',
    publisher: 'PhysioNet',
    url: 'https://physionet.org/content/ludb/1.0.1/',
    doi: '10.13026/eegm-h675',
    licenseId: 'ODC-BY-1.0',
    licenseUrl: 'https://opendatacommons.org/licenses/by/1-0/',
    access: 'open',
    signalObject: 'wfdb-calibrated-time-series',
    role: 'wave-delineation-and-morphology',
    selectionStatus: 'approved-for-file-level-curation-no-signals-ingested',
    facts: {
      records: 200,
      leads: 12,
      durationSeconds: 10,
      samplingHertz: [500],
      annotation: 'Cardiologist-marked P, QRS and T boundaries and peaks, with record-level diagnoses.',
    },
  },
]

export const REAL_ECG_CURATION_CONTRACT = {
  schemaVersion: '0.1',
  language: 'en',
  currentState: 'source-contract-only-no-signals-ingested',
  scientificObject: 'calibrated-multilead-time-series',
  acceptedFormats: ['wfdb-header', 'wfdb-signal', 'wfdb-annotation'],
  firstTranche: {
    targetCases: 30,
    ptbXl: {
      cases: 15,
      cohorts: ['normal', 'myocardial-infarction', 'st-t-change', 'conduction-disturbance', 'hypertrophy'],
    },
    ludb: { cases: 8, focus: 'wave-boundary-and-morphology-teaching' },
    mitBih: { cases: 7, focus: 'beat-level-arrhythmia-teaching' },
  },
  requiredPerCase: [
    'frozen-source-version-and-record-id',
    'source-license-and-attribution',
    'signal-calibration-sampling-rate-and-lead-map',
    'dataset-label-provenance',
    'cardiology-reviewed-explanation-and-answer-key',
    'patient-identifier-and-metadata-review',
    'deterministic-render-and-receipt-tests',
  ],
  prohibited: [
    'screenshot-as-primary-signal',
    'llm-generated-diagnosis-label',
    'unreviewed-clinical-interpretation',
    'real-patient-upload',
  ],
} as const
