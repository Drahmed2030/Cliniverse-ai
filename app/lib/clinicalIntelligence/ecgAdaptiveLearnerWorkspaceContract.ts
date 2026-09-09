import type {
  AdaptiveClinicalLayoutMode,
  AdaptiveClinicalSessionStateV1,
} from './adaptiveClinicalLayoutContract.ts'

export type EcgLearnerWorkspacePane =
  | 'CASE_CONTEXT'
  | 'ECG_WAVEFORM'
  | 'INTERPRETATION'
  | 'COMPETENCY_FEEDBACK'

export interface EcgAdaptiveLearnerWorkspaceV1 {
  workspaceVersion: '1.0.0'
  mode: AdaptiveClinicalLayoutMode
  primaryPane: EcgLearnerWorkspacePane
  visiblePanes: readonly EcgLearnerWorkspacePane[]
  sessionState: AdaptiveClinicalSessionStateV1
  waveformOwnsAttemptState: false
  layoutOwnsAttemptState: false
  legacySyntheticWaveformAllowed: false
}

export function buildEcgAdaptiveLearnerWorkspaceV1(
  mode: AdaptiveClinicalLayoutMode,
  sessionState: AdaptiveClinicalSessionStateV1,
): EcgAdaptiveLearnerWorkspaceV1 {
  const visiblePanes: readonly EcgLearnerWorkspacePane[] = mode === 'COMPACT'
    ? ['ECG_WAVEFORM']
    : mode === 'EXPANDED'
      ? ['ECG_WAVEFORM', 'INTERPRETATION']
      : ['CASE_CONTEXT', 'ECG_WAVEFORM', 'INTERPRETATION', 'COMPETENCY_FEEDBACK']

  return {
    workspaceVersion: '1.0.0',
    mode,
    primaryPane: 'ECG_WAVEFORM',
    visiblePanes,
    sessionState,
    waveformOwnsAttemptState: false,
    layoutOwnsAttemptState: false,
    legacySyntheticWaveformAllowed: false,
  }
}

export function validateEcgAdaptiveLearnerWorkspaceV1(
  workspace: EcgAdaptiveLearnerWorkspaceV1,
): readonly string[] {
  const blockers: string[] = []
  if (!workspace.sessionState.attemptId.trim()) blockers.push('attempt-id-required')
  if (!workspace.sessionState.caseId.trim()) blockers.push('case-id-required')
  if (!workspace.visiblePanes.includes('ECG_WAVEFORM')) blockers.push('waveform-pane-required')
  if (workspace.primaryPane !== 'ECG_WAVEFORM') blockers.push('waveform-must-remain-primary')
  if (workspace.waveformOwnsAttemptState) blockers.push('waveform-must-not-own-attempt-state')
  if (workspace.layoutOwnsAttemptState) blockers.push('layout-must-not-own-attempt-state')
  if (workspace.legacySyntheticWaveformAllowed) blockers.push('legacy-synthetic-waveform-prohibited')
  if (workspace.mode === 'COMPACT' && workspace.visiblePanes.length !== 1) blockers.push('compact-single-primary-pane-required')
  if (workspace.mode === 'EXPANDED' && workspace.visiblePanes.length < 2) blockers.push('expanded-two-pane-minimum-required')
  if (workspace.mode === 'WIDE_CLINICAL' && !workspace.visiblePanes.includes('COMPETENCY_FEEDBACK')) blockers.push('wide-clinical-feedback-pane-required')
  return blockers
}

export function describeEcgAdaptiveLearnerWorkspaceContractV1() {
  return {
    governedWaveformOnly: true,
    legacySyntheticEcgExcluded: true,
    compactIsFocusedSinglePane: true,
    expandedSupportsWaveformAndInterpretation: true,
    wideClinicalSupportsContextWaveformInterpretationAndCompetency: true,
    sessionStateSurvivesLayoutRecomposition: true,
    noDeviceSpecificForks: true,
  } as const
}
