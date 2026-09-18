import type { EchoStudyView } from './echoStudyContract.ts'
import type { EchoStudyReviewStatus } from './echoStudyRecord.ts'

// EchoMeasurement — Batch 6. Every measurement preserves who/what produced
// it (origin) and its review status; an AI-produced measurement can never
// collapse into an undifferentiated number — it MUST carry provider/model/
// version metadata and its own clinician-verification state, kept separate
// from reviewStatus (reviewStatus is about the measurement claim generally;
// clinicianVerified is specifically about whether a clinician confirmed
// THIS AI output). No measurement is generated in this batch — the seed
// below is intentionally empty because no verified measurement value exists
// anywhere in this checkout yet (see docs/ECHO_INTELLIGENCE_ATLAS_V1.md).

export type EchoMeasurementType = 'ef_visual_estimate' | 'lv_wall_thickness' | 'lv_internal_diameter' | 'other'
export type EchoMeasurementOrigin = 'manual' | 'machine' | 'report' | 'ai_provider'

interface EchoMeasurementBase {
  measurementKey: string
  studyKey: string
  type: EchoMeasurementType
  value: number
  unit: string
  method: string
  sourceView: EchoStudyView
  reviewStatus: EchoStudyReviewStatus
  provenanceRef: string
}

export interface EchoManualMeasurement extends EchoMeasurementBase {
  origin: 'manual' | 'machine' | 'report'
}

export interface EchoAiProviderMeasurement extends EchoMeasurementBase {
  origin: 'ai_provider'
  provider: string
  model: string
  modelVersion: string
  qualityFlag: 'good' | 'limited' | 'unusable'
  clinicianVerified: boolean
  verifiedAt: string | null
}

export type EchoMeasurement = EchoManualMeasurement | EchoAiProviderMeasurement

/** Intentionally empty — see file header. Do not populate without a real, verified measurement source. */
export const ECHO_MEASUREMENT_SEED: readonly EchoMeasurement[] = []

export function validateEchoMeasurement(measurement: EchoMeasurement): void {
  if (!measurement.measurementKey.trim() || !measurement.studyKey.trim() || !measurement.unit.trim() || !measurement.method.trim()) {
    throw new Error('Echo measurement identity, study, unit and method are required.')
  }
  if (!Number.isFinite(measurement.value)) throw new Error(`Echo measurement ${measurement.measurementKey} value must be finite.`)
  if (!measurement.provenanceRef.trim()) throw new Error(`Echo measurement ${measurement.measurementKey} requires a provenance reference.`)
  if (measurement.origin === 'ai_provider') {
    if (!measurement.provider.trim() || !measurement.model.trim() || !measurement.modelVersion.trim()) {
      throw new Error(`Echo measurement ${measurement.measurementKey} has origin 'ai_provider' but is missing provider/model/modelVersion.`)
    }
    if (measurement.clinicianVerified && !measurement.verifiedAt) {
      throw new Error(`Echo measurement ${measurement.measurementKey} is marked clinicianVerified but has no verifiedAt timestamp.`)
    }
    if (!measurement.clinicianVerified && measurement.verifiedAt) {
      throw new Error(`Echo measurement ${measurement.measurementKey} has a verifiedAt timestamp but clinicianVerified is false.`)
    }
  }
}

export function validateEchoMeasurementSeed(measurements: readonly EchoMeasurement[] = ECHO_MEASUREMENT_SEED): void {
  const keys = new Set<string>()
  for (const measurement of measurements) {
    validateEchoMeasurement(measurement)
    if (keys.has(measurement.measurementKey)) throw new Error(`Duplicate Echo measurement key: ${measurement.measurementKey}`)
    keys.add(measurement.measurementKey)
  }
}

/** An AI-produced measurement is safe to present as learner-facing "verified" only once a clinician has actually confirmed it — never on origin alone. */
export function isMeasurementClinicallyVerified(measurement: EchoMeasurement): boolean {
  if (measurement.origin !== 'ai_provider') return measurement.reviewStatus === 'reviewed'
  return measurement.clinicianVerified && measurement.reviewStatus === 'reviewed'
}
