'use client'

import type { CSSProperties, ReactNode } from 'react'
import type {
  AdaptiveClinicalLayoutMode,
  AdaptiveClinicalSessionStateV1,
} from '../../lib/clinicalIntelligence/adaptiveClinicalLayoutContract.ts'

export interface EcgGovernedAdaptiveWorkspaceProps {
  mode: AdaptiveClinicalLayoutMode
  session: AdaptiveClinicalSessionStateV1
  caseContext: ReactNode
  waveform: ReactNode
  interpretation: ReactNode
  competencyFeedback: ReactNode
  status?: ReactNode
}

const shellStyle: CSSProperties = {
  width: '100%',
  minWidth: 0,
  display: 'grid',
  gap: 16,
  alignItems: 'start',
}

const panelStyle: CSSProperties = {
  minWidth: 0,
  borderRadius: 18,
  border: '1px solid rgba(122, 148, 171, 0.16)',
  background: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  boxShadow: '0 12px 34px rgba(19, 39, 56, 0.08)',
  overflow: 'hidden',
}

const sectionStyle: CSSProperties = {
  padding: 16,
}

function gridForMode(mode: AdaptiveClinicalLayoutMode): CSSProperties {
  switch (mode) {
    case 'COMPACT':
      return { gridTemplateColumns: 'minmax(0, 1fr)' }
    case 'EXPANDED':
      return { gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.65fr)' }
    case 'WIDE_CLINICAL':
      return { gridTemplateColumns: 'minmax(220px, 0.52fr) minmax(0, 1.48fr) minmax(300px, 0.72fr)' }
  }
}

/**
 * First governed responsive ECG learner workspace shell.
 *
 * It deliberately renders only supplied governed content. It does not generate
 * synthetic waveforms, derive diagnosis truth, own attempt identity, or change
 * learner state during resize/fold/unfold. Layout is selected upstream from
 * available geometry through AdaptiveClinicalLayoutContractV1.
 */
export default function EcgGovernedAdaptiveWorkspace({
  mode,
  session,
  caseContext,
  waveform,
  interpretation,
  competencyFeedback,
  status,
}: EcgGovernedAdaptiveWorkspaceProps) {
  const isCompact = mode === 'COMPACT'
  const isWide = mode === 'WIDE_CLINICAL'

  return (
    <section
      aria-label="Governed ECG learner workspace"
      data-layout-mode={mode}
      data-attempt-id={session.attemptId}
      data-case-id={session.caseId}
      style={{ ...shellStyle, ...gridForMode(mode) }}
    >
      {isWide ? (
        <aside aria-label="Case context" style={panelStyle}>
          <div style={sectionStyle}>{caseContext}</div>
        </aside>
      ) : null}

      <main aria-label="ECG waveform workspace" style={panelStyle}>
        {!isWide ? <div style={{ ...sectionStyle, paddingBottom: 0 }}>{caseContext}</div> : null}
        <div style={sectionStyle}>{waveform}</div>
        {isCompact ? (
          <div style={{ ...sectionStyle, paddingTop: 0 }}>
            {interpretation}
          </div>
        ) : null}
      </main>

      <aside aria-label="Interpretation and competency" style={panelStyle}>
        {!isCompact ? <div style={sectionStyle}>{interpretation}</div> : null}
        <div style={sectionStyle}>{competencyFeedback}</div>
        {status ? <div style={{ ...sectionStyle, paddingTop: 0 }}>{status}</div> : null}
      </aside>
    </section>
  )
}
