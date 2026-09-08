import type { MediaGateDecision } from './automatedMediaGate'

export interface ExistingBatch01TechnicalEvidence {
  candidateId: string
  sourceSha256: string
  derivativeSha256: string
  observedDerivativeSha256: string
  derivativeIntegrityVerified: boolean
  derivativeFrameCount: number
  temporalFidelity: string
  technicalPrivacyScreen: string
  machineEvidencePaths: readonly string[]
}

export interface ExistingBatch01GateReuseResult {
  candidateId: string
  decision: MediaGateDecision
  technicallyVerified: boolean
  evidenceReused: boolean
  localReprobeRequiredForThisPilot: false
  blockers: readonly string[]
}

function sha(value: string, field: string): void {
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new Error(`${field} must be a SHA256 hex digest`)
}

export function evaluateBatch01ExistingTechnicalEvidence(
  evidence: ExistingBatch01TechnicalEvidence,
): ExistingBatch01GateReuseResult {
  sha(evidence.sourceSha256, 'sourceSha256')
  sha(evidence.derivativeSha256, 'derivativeSha256')
  sha(evidence.observedDerivativeSha256, 'observedDerivativeSha256')

  const blockers: string[] = []
  if (evidence.derivativeSha256.toLowerCase() !== evidence.observedDerivativeSha256.toLowerCase()) blockers.push('derivative-checksum-mismatch')
  if (!evidence.derivativeIntegrityVerified) blockers.push('derivative-integrity-not-verified')
  if (!Number.isInteger(evidence.derivativeFrameCount) || evidence.derivativeFrameCount <= 0) blockers.push('frame-count-invalid')
  if (evidence.temporalFidelity !== 'PASS-identical-presentation-timestamps') blockers.push('temporal-fidelity-not-passed')
  if (!evidence.technicalPrivacyScreen.startsWith('PASS-')) blockers.push('technical-privacy-screen-not-passed')
  if (evidence.machineEvidencePaths.length < 2) blockers.push('machine-evidence-incomplete')

  const decision: MediaGateDecision = blockers.length ? 'HOLD' : 'PASS'
  return {
    candidateId: evidence.candidateId,
    decision,
    technicallyVerified: decision === 'PASS',
    evidenceReused: true,
    localReprobeRequiredForThisPilot: false,
    blockers,
  }
}
