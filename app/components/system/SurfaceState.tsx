'use client'

import type { ReactNode } from 'react'

export type SurfaceStateKind =
  | 'loading'
  | 'empty'
  | 'unavailable'
  | 'stale'
  | 'permission-limited'
  | 'read-only'
  | 'error'
  | 'partial'

const LABELS: Record<SurfaceStateKind, string> = {
  loading: 'Loading',
  empty: 'No record',
  unavailable: 'Unavailable',
  stale: 'Stale',
  'permission-limited': 'Limited',
  'read-only': 'Read only',
  error: 'Error',
  partial: 'Partial',
}

interface Props {
  kind: SurfaceStateKind
  title: string
  detail: string
  action?: ReactNode
  compact?: boolean
  live?: 'polite' | 'assertive' | 'off'
}

export default function SurfaceState({
  kind,
  title,
  detail,
  action = null,
  compact = false,
  live = 'polite',
}: Props) {
  const isError = kind === 'error'
  const role = isError ? 'alert' : 'status'

  return (
    <section
      className="cv-system-state"
      data-state={kind}
      data-compact={compact ? 'true' : 'false'}
      role={role}
      aria-live={live}
    >
      <div className="cv-system-state-label">
        <span className="cv-system-state-dot" aria-hidden="true" />
        <span>{LABELS[kind]}</span>
      </div>
      <div className="cv-system-state-copy">
        <h3>{title}</h3>
        <p>{detail}</p>
      </div>
      {action ? <div className="cv-system-state-action">{action}</div> : null}
    </section>
  )
}
