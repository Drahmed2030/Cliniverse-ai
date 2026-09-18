import type { EchoStudyView } from './echoStudyContract.ts'

// EchoAiAdapter — Batch 6. Vendor-neutral contract only. No Us2.ai, TOMTEC,
// Ultromics, DiA, or any other vendor is integrated here or anywhere else
// in this batch — see docs/ECHO_INTELLIGENCE_ATLAS_V1.md Section 9. The
// rest of Cliniverse must consume EchoAnalysisResult, never a vendor's raw
// JSON shape; a provider swap touches only the adapter that implements
// EchoAiProviderAdapter, not any call site.

export interface EchoAnalysisMeasurement {
  type: string
  value: number
  unit: string
  sourceView: EchoStudyView
}

export interface EchoAnalysisFinding {
  structure: string
  finding: string
  sourceView: EchoStudyView
}

export interface EchoAnalysisQualityFlag {
  view: EchoStudyView
  flag: 'good' | 'limited' | 'unusable'
  reason?: string
}

/** The single normalized shape every AI provider's output must be mapped into before anything else in Cliniverse consumes it. */
export interface EchoAnalysisResult {
  studyKey: string
  provider: string
  model: string
  modelVersion: string
  views: EchoStudyView[]
  measurements: EchoAnalysisMeasurement[]
  findings: EchoAnalysisFinding[]
  qualityFlags: EchoAnalysisQualityFlag[]
  generatedAt: string
  /** Always starts false. Only a real clinician-review step may flip this — never set true by an adapter itself. */
  clinicianVerified: boolean
}

/** Implement this per vendor. Nothing outside the adapter may depend on a vendor's own request/response shape. */
export interface EchoAiProviderAdapter {
  readonly provider: string
  analyzeStudy(input: { studyKey: string; views: EchoStudyView[] }): Promise<EchoAnalysisResult>
}

export function validateEchoAnalysisResult(result: EchoAnalysisResult): void {
  if (!result.studyKey.trim() || !result.provider.trim() || !result.model.trim() || !result.modelVersion.trim()) {
    throw new Error('Echo analysis result identity (studyKey/provider/model/modelVersion) is required.')
  }
  if (!result.views.length) throw new Error(`Echo analysis result for ${result.studyKey} declares no views.`)
  if (result.clinicianVerified) {
    throw new Error(`Echo analysis result for ${result.studyKey} must not be constructed with clinicianVerified already true — that can only be set by a separate, explicit clinician-review step.`)
  }
  if (Number.isNaN(Date.parse(result.generatedAt))) throw new Error(`Echo analysis result for ${result.studyKey} has an invalid generatedAt timestamp.`)
  for (const measurement of result.measurements) {
    if (!Number.isFinite(measurement.value) || !measurement.unit.trim() || !measurement.type.trim()) {
      throw new Error(`Echo analysis result for ${result.studyKey} has an invalid measurement.`)
    }
  }
}

/** No vendor is registered — this map exists so a future adapter has exactly one place to register, and so "unknown vendor payload" has somewhere concrete to fail. */
export const ECHO_AI_PROVIDER_ADAPTERS: ReadonlyMap<string, EchoAiProviderAdapter> = new Map()

export function resolveEchoAiProviderAdapter(provider: string): EchoAiProviderAdapter {
  const adapter = ECHO_AI_PROVIDER_ADAPTERS.get(provider)
  if (!adapter) throw new Error(`No Echo AI provider adapter is registered for "${provider}" — an unrecognized vendor payload cannot bypass normalization.`)
  return adapter
}
