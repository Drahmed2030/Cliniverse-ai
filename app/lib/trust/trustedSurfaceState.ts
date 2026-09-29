import type { EvidenceTrustEnvelope } from './evidenceTrust'
import type { SurfaceStateKind } from '../../components/system/SurfaceState'

export interface EvidencePresentationState {
  state: SurfaceStateKind | 'ready'
  reason: string
}

export function evidencePresentationState(
  envelope: EvidenceTrustEnvelope,
): EvidencePresentationState {
  if (envelope.availability === 'permission-limited') {
    return {
      state: 'permission-limited',
      reason: 'Access is limited. This does not mean the evidence is absent or normal.',
    }
  }

  if (envelope.availability === 'unknown') {
    return {
      state: 'unavailable',
      reason: 'Evidence availability is not confirmed.',
    }
  }

  if (envelope.availability === 'unavailable') {
    return {
      state: 'unavailable',
      reason: 'The evidence source is unavailable right now.',
    }
  }

  if (envelope.freshness === 'stale') {
    return {
      state: 'stale',
      reason: 'Evidence exists, but freshness is not confirmed.',
    }
  }

  if (envelope.freshness === 'unknown') {
    return {
      state: 'partial',
      reason: 'Evidence exists, but freshness is still unknown.',
    }
  }

  if (envelope.verification !== 'verified' || !envelope.provenanceRef?.trim()) {
    return {
      state: 'partial',
      reason: 'Evidence is present but not fully verified for governed use.',
    }
  }

  return {
    state: 'ready',
    reason: 'Evidence is available, current, verified and traceable.',
  }
}
