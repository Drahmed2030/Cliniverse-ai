export const IMAGING_ENGINE_CONTRACT_VERSION = 1 as const

export type ImagingModality = 'ecg' | 'echo' | 'ct'

export type ImagingEngineId =
  | 'deterministic-ecg-svg-v1'
  | 'echo-cine-frame-engine-v0'
  | 'ct-dicom-volume-engine-v0'

export interface ImagingEngineBoundary {
  modality: ImagingModality
  engineId: ImagingEngineId
  scientificModel: 'parametric-signal' | 'cine-frame-sequence' | 'voxel-volume'
  approvedInputs: readonly string[]
  renderTargets: readonly string[]
  implementationState: 'strategy-prototype' | 'contract-only'
  diagnosticUse: 'prohibited'
  patientDataUse: 'prohibited'
}

export interface ImagingLearningAsset {
  schemaVersion: typeof IMAGING_ENGINE_CONTRACT_VERSION
  assetId: string
  version: string
  modality: ImagingModality
  engineId: ImagingEngineId
  title: string
  locale: 'en' | 'ar'
  intendedUse: 'education-only'
  dataMode: 'synthetic-non-clinical'
  reviewStatus: 'draft-human-review-required'
  provenance: {
    sourceKind: 'internally-authored-synthetic-phantom'
    sourceId: string
    rightsStatus: 'owned-internal-draft'
    patientIdentifiers: 'none'
  }
  linkedTrack: 'ecg-learning' | 'echo-learning' | 'ct-learning'
  disclaimer: string
}

export const IMAGING_ENGINE_BOUNDARIES: Readonly<Record<ImagingModality, ImagingEngineBoundary>> = {
  ecg: {
    modality: 'ecg',
    engineId: 'deterministic-ecg-svg-v1',
    scientificModel: 'parametric-signal',
    approvedInputs: ['synthetic-waveform-parameters'],
    renderTargets: ['web-svg', 'remotion-video'],
    implementationState: 'strategy-prototype',
    diagnosticUse: 'prohibited',
    patientDataUse: 'prohibited',
  },
  echo: {
    modality: 'echo',
    engineId: 'echo-cine-frame-engine-v0',
    scientificModel: 'cine-frame-sequence',
    approvedInputs: ['synthetic-cardiac-motion-phantom'],
    renderTargets: ['web-canvas', 'remotion-video'],
    implementationState: 'strategy-prototype',
    diagnosticUse: 'prohibited',
    patientDataUse: 'prohibited',
  },
  ct: {
    modality: 'ct',
    engineId: 'ct-dicom-volume-engine-v0',
    scientificModel: 'voxel-volume',
    approvedInputs: [],
    renderTargets: ['future-dicom-viewer'],
    implementationState: 'contract-only',
    diagnosticUse: 'prohibited',
    patientDataUse: 'prohibited',
  },
} as const

const sharedEchoAsset = {
  schemaVersion: IMAGING_ENGINE_CONTRACT_VERSION,
  version: '0.1.0-draft',
  modality: 'echo' as const,
  engineId: 'echo-cine-frame-engine-v0' as const,
  intendedUse: 'education-only' as const,
  dataMode: 'synthetic-non-clinical' as const,
  reviewStatus: 'draft-human-review-required' as const,
  provenance: {
    sourceKind: 'internally-authored-synthetic-phantom' as const,
    sourceId: 'SYNTHETIC-ECHO-MOTION-PHANTOM-V0',
    rightsStatus: 'owned-internal-draft' as const,
    patientIdentifiers: 'none' as const,
  },
  linkedTrack: 'echo-learning' as const,
  disclaimer: 'Synthetic educational motion phantom. Not an echocardiogram and not validated for diagnosis, measurement, treatment, or real-patient decisions.',
}

export const ECHO_LEARNING_ASSETS: readonly ImagingLearningAsset[] = [
  {
    ...sharedEchoAsset,
    assetId: 'echo-motion-orientation-v0-en',
    title: 'Echo motion orientation prototype',
    locale: 'en',
  },
  {
    ...sharedEchoAsset,
    assetId: 'echo-motion-orientation-v0-ar',
    title: 'نموذج تعريفي لحركة الإيكو',
    locale: 'ar',
  },
] as const

export function validateImagingLearningAsset(asset: ImagingLearningAsset): ImagingLearningAsset {
  const boundary = IMAGING_ENGINE_BOUNDARIES[asset.modality]
  if (asset.engineId !== boundary.engineId) {
    throw new Error(`The ${asset.modality} asset must use its modality-specific engine.`)
  }
  if (!asset.assetId.trim() || !asset.version.trim() || !asset.provenance.sourceId.trim()) {
    throw new Error('Imaging learning assets require stable identity and provenance.')
  }
  if (asset.intendedUse !== 'education-only' || asset.dataMode !== 'synthetic-non-clinical') {
    throw new Error('Only synthetic education assets are allowed in this strategy slice.')
  }
  if (asset.reviewStatus !== 'draft-human-review-required') {
    throw new Error('Imaging learning assets cannot bypass human review.')
  }
  if (asset.provenance.patientIdentifiers !== 'none') {
    throw new Error('Patient-identifiable media is prohibited in this strategy slice.')
  }
  return asset
}
