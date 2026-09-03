import type { SyntheticLeadId } from '../cardiology/ecgWaveform'

export interface ClinicalStudioAsset {
  schemaVersion: '0.1'
  assetId: string
  version: string
  locale: 'en' | 'ar'
  intendedUse: 'education-only'
  dataMode: 'synthetic-non-clinical'
  reviewStatus: 'draft-human-review-required'
  linkedActivityId: string
  renderTarget: 'web-svg' | 'remotion-video'
  scenes: { id: string; durationFrames: number; narrationKey: string }[]
  waveform: { engine: 'deterministic-svg-v1'; leads: SyntheticLeadId[] }
  evidence: { sourceId: string; sourceType: 'internal-demonstration-rule' }[]
  disclaimer: string
}

const shared = {
  schemaVersion: '0.1' as const,
  assetId: 'door-to-ecg-acquisition-evidence-v1',
  version: '1.0.0-draft',
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

export const CLINICAL_STUDIO_ASSETS: ClinicalStudioAsset[] = [
  { ...shared, locale: 'en', renderTarget: 'web-svg' },
  { ...shared, assetId: `${shared.assetId}-ar`, locale: 'ar', renderTarget: 'remotion-video' },
]
