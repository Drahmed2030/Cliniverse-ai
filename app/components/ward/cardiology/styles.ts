import type { CSSProperties } from 'react'

export const CARDIOLOGY_COLORS = {
  panel: '#111827',
  elevated: '#172033',
  border: 'rgba(148,163,184,0.20)',
  text: '#F8FAFC',
  sub: '#94A3B8',
  teal: '#2DD4BF',
  blue: '#60A5FA',
  gold: '#FBBF24',
  violet: '#A78BFA',
  red: '#F87171',
}

export const panelStyle: CSSProperties = {
  borderRadius: 20,
  border: `1px solid ${CARDIOLOGY_COLORS.border}`,
  background: CARDIOLOGY_COLORS.panel,
  padding: 16,
}

export const compactButtonStyle: CSSProperties = {
  borderRadius: 12,
  border: `1px solid ${CARDIOLOGY_COLORS.border}`,
  background: CARDIOLOGY_COLORS.elevated,
  color: CARDIOLOGY_COLORS.text,
  padding: '10px 12px',
  fontWeight: 800,
  cursor: 'pointer',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  color: CARDIOLOGY_COLORS.sub,
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 7,
}

export const fieldStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 12,
  border: `1px solid ${CARDIOLOGY_COLORS.border}`,
  background: '#0B1220',
  color: CARDIOLOGY_COLORS.text,
  padding: '11px 12px',
  font: 'inherit',
}
