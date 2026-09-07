import type { CSSProperties } from 'react'

export const NEXUS_COLORS = {
  background: '#07101F',
  panel: '#111827',
  elevated: '#172033',
  border: 'rgba(148,163,184,0.22)',
  text: '#F8FAFC',
  sub: '#A7B4C8',
  teal: '#2DD4BF',
  blue: '#60A5FA',
  gold: '#FBBF24',
  violet: '#A78BFA',
  danger: '#FCA5A5',
}

export const nexusPanelStyle: CSSProperties = {
  borderRadius: 20,
  border: `1px solid ${NEXUS_COLORS.border}`,
  background: NEXUS_COLORS.panel,
  padding: 16,
}

export const nexusButtonStyle: CSSProperties = {
  borderRadius: 13,
  border: `1px solid ${NEXUS_COLORS.border}`,
  background: NEXUS_COLORS.elevated,
  color: NEXUS_COLORS.text,
  padding: '11px 13px',
  fontWeight: 850,
  cursor: 'pointer',
}

export const nexusLabelStyle: CSSProperties = {
  display: 'block',
  color: NEXUS_COLORS.text,
  fontSize: 12,
  fontWeight: 850,
  marginBottom: 8,
}

export const nexusFieldStyle: CSSProperties = {
  width: '100%',
  minHeight: 112,
  boxSizing: 'border-box',
  borderRadius: 13,
  border: `1px solid ${NEXUS_COLORS.border}`,
  background: '#091321',
  color: NEXUS_COLORS.text,
  padding: '12px 13px',
  font: 'inherit',
  lineHeight: 1.55,
  resize: 'vertical',
}
