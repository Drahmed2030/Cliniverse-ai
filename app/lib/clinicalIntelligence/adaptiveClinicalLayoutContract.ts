export type AdaptiveClinicalLayoutMode = 'COMPACT' | 'EXPANDED' | 'WIDE_CLINICAL'

export interface AdaptiveClinicalViewportV1 {
  availableWidthPx: number
  availableHeightPx: number
}

export interface AdaptiveClinicalSessionStateV1 {
  attemptId: string
  caseId: string
  selectedLeadId?: string | null
  zoomScale: number
  timelinePositionMs?: number | null
  annotationIds: readonly string[]
  confidence?: number | null
}

export interface AdaptiveClinicalReflowResultV1 {
  mode: AdaptiveClinicalLayoutMode
  sessionState: AdaptiveClinicalSessionStateV1
  blockers: readonly string[]
}

function validPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function deriveAdaptiveClinicalLayoutModeV1(
  viewport: AdaptiveClinicalViewportV1,
): AdaptiveClinicalLayoutMode | null {
  if (!validPositiveFinite(viewport.availableWidthPx) || !validPositiveFinite(viewport.availableHeightPx)) return null
  if (viewport.availableWidthPx < 700) return 'COMPACT'
  if (viewport.availableWidthPx < 1100) return 'EXPANDED'
  return 'WIDE_CLINICAL'
}

/**
 * Layout recomposition is intentionally geometry-driven and state-preserving.
 * Device model, orientation, and fold state are not selection inputs. A resize,
 * fold/unfold, mirroring resize, or window resize may change layout only; it
 * must never create a new learner attempt or mutate clinical learning state.
 */
export function reflowAdaptiveClinicalSessionV1(
  viewport: AdaptiveClinicalViewportV1,
  state: AdaptiveClinicalSessionStateV1,
): AdaptiveClinicalReflowResultV1 {
  const blockers: string[] = []
  const mode = deriveAdaptiveClinicalLayoutModeV1(viewport)

  if (!mode) blockers.push('viewport-geometry-invalid')
  if (!state.attemptId.trim()) blockers.push('attempt-id-required')
  if (!state.caseId.trim()) blockers.push('case-id-required')
  if (!Number.isFinite(state.zoomScale) || state.zoomScale <= 0) blockers.push('zoom-scale-invalid')
  if (state.timelinePositionMs !== undefined && state.timelinePositionMs !== null
    && (!Number.isFinite(state.timelinePositionMs) || state.timelinePositionMs < 0)) {
    blockers.push('timeline-position-invalid')
  }
  if (state.confidence !== undefined && state.confidence !== null
    && (!Number.isFinite(state.confidence) || state.confidence < 0 || state.confidence > 1)) {
    blockers.push('confidence-out-of-range')
  }

  return {
    mode: mode ?? 'COMPACT',
    sessionState: state,
    blockers,
  }
}

export function describeAdaptiveClinicalLayoutContractV1() {
  return {
    geometryDriven: true,
    deviceModelChecksRequired: false,
    orientationChecksRequired: false,
    foldStateChecksRequired: false,
    attemptIdentityPersistsAcrossReflow: true,
    caseIdentityPersistsAcrossReflow: true,
    zoomPersistsAcrossReflow: true,
    annotationStatePersistsAcrossReflow: true,
    confidencePersistsAcrossReflow: true,
    layoutDoesNotOwnLearnerState: true,
  } as const
}
