import type { SyntheticLeadId } from '../cardiology/ecgWaveform'
import {
  ECHO_CINE_CYCLE_FRAMES,
  ECHO_CINE_ENGINE_ID,
  ECHO_CINE_SOURCE_ID,
} from './echoCinePhantom.ts'

interface ClinicalStudioAssetBase {
  schemaVersion: '0.1'
  assetId: string
  version: string
  locale: 'en' | 'ar'
  modality: 'ecg' | 'echo'
  intendedUse: 'education-only'
  dataMode: 'synthetic-non-clinical'
  reviewStatus: 'draft-human-review-required'
  linkedActivityId: string
  scenes: { id: string; durationFrames: number; narrationKey: string }[]
  evidence: {
    sourceId: string
    sourceType: 'internal-demonstration-rule' | 'internal-synthetic-phantom'
  }[]
  disclaimer: string
}

export interface EcgClinicalStudioAsset extends ClinicalStudioAssetBase {
  modality: 'ecg'
  renderTargets: ('web-svg' | 'remotion-video')[]
  waveform: { engine: 'deterministic-svg-v1'; leads: SyntheticLeadId[] }
}

export interface EchoClinicalStudioAsset extends ClinicalStudioAssetBase {
  modality: 'echo'
  renderTargets: ('web-canvas' | 'remotion-video')[]
  cine: {
    engine: typeof ECHO_CINE_ENGINE_ID
    sourceId: typeof ECHO_CINE_SOURCE_ID
    cycleFrames: typeof ECHO_CINE_CYCLE_FRAMES
  }
}

export type ClinicalStudioAsset = EcgClinicalStudioAsset | EchoClinicalStudioAsset

const sharedEcg = {
  schemaVersion: '0.1' as const,
  assetId: 'door-to-ecg-acquisition-evidence-v1',
  version: '1.0.0-draft',
  modality: 'ecg' as const,
  intendedUse: 'education-only' as const,
  dataMode: 'synthetic-non-clinical' as const,
  reviewStatus: 'draft-human-review-required' as const,
  linkedActivityId: 'door-to-ecg-drill-v1',
  scenes: [
    { id: 'gap-context', durationFrames: 150, narrationKey: 'doorToEcg.context' },
    { id: 'waveform-inspection', durationFrames: 240, narrationKey: 'doorToEcg.inspect' },
    { id: 'evidence-check', durationFrames: 180, narrationKey: 'doorToEcg.evidence' },
    { id: 'reassessment', durationFrames: 150, narrationKey: 'doorToEcg.reassess' },
  ],
  waveform: { engine: 'deterministic-svg-v1' as const, leads: ['II', 'V2', 'V3', 'V4'] as SyntheticLeadId[] },
  evidence: [{ sourceId: 'DEMO-PATHWAY-RULESET-V1', sourceType: 'internal-demonstration-rule' as const }],
  disclaimer: 'Synthetic educational asset. Not validated for diagnosis, treatment, certification, or real-patient decisions.',
}

const sharedEcho = {
  schemaVersion: '0.1' as const,
  version: '0.1.0-draft',
  modality: 'echo' as const,
  intendedUse: 'education-only' as const,
  dataMode: 'synthetic-non-clinical' as const,
  reviewStatus: 'draft-human-review-required' as const,
  linkedActivityId: 'echo-motion-orientation-v0',
  renderTargets: ['web-canvas', 'remotion-video'] as ('web-canvas' | 'remotion-video')[],
  scenes: [
    { id: 'echo-boundary', durationFrames: 120, narrationKey: 'echoMotion.boundary' },
    { id: 'ordered-frames', durationFrames: 180, narrationKey: 'echoMotion.frames' },
    { id: 'motion-cycle', durationFrames: 150, narrationKey: 'echoMotion.cycle' },
    { id: 'echo-review-gate', durationFrames: 90, narrationKey: 'echoMotion.review' },
  ],
  cine: {
    engine: ECHO_CINE_ENGINE_ID,
    sourceId: ECHO_CINE_SOURCE_ID,
    cycleFrames: ECHO_CINE_CYCLE_FRAMES,
  },
  evidence: [{ sourceId: ECHO_CINE_SOURCE_ID, sourceType: 'internal-synthetic-phantom' as const }],
  disclaimer: 'Synthetic educational motion phantom. Not an echocardiogram and not validated for anatomy, measurement, diagnosis, treatment, or real-patient decisions.',
}

// Retain the ECG-only export for the existing pathway contract.
export const CLINICAL_STUDIO_ASSETS: EcgClinicalStudioAsset[] = [
  { ...sharedEcg, locale: 'en', renderTargets: ['web-svg', 'remotion-video'] },
  { ...sharedEcg, assetId: `${sharedEcg.assetId}-ar`, locale: 'ar', renderTargets: ['web-svg', 'remotion-video'] },
]

export const ECHO_CLINICAL_STUDIO_ASSETS: EchoClinicalStudioAsset[] = [
  { ...sharedEcho, assetId: 'echo-motion-orientation-v0-en', locale: 'en' },
  { ...sharedEcho, assetId: 'echo-motion-orientation-v0-ar', locale: 'ar' },
]

export const ALL_CLINICAL_STUDIO_ASSETS: readonly ClinicalStudioAsset[] = [
  ...CLINICAL_STUDIO_ASSETS,
  ...ECHO_CLINICAL_STUDIO_ASSETS,
]
