'use client'

import { BarChart3, BookOpenCheck, CalendarDays, Compass, UserRound } from 'lucide-react'
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_LEFT,
  NATIVE_SAFE_AREA_RIGHT,
} from '../lib/nativeSafeArea'

export type ReleaseTab = 'today' | 'learn' | 'progress' | 'explore' | 'me'

interface Props {
  active: ReleaseTab
  onChange: (tab: ReleaseTab) => void
}

const items = [
  { id: 'today' as const, label: 'Today', Icon: CalendarDays },
  { id: 'learn' as const, label: 'Learn', Icon: BookOpenCheck },
  { id: 'progress' as const, label: 'Progress', Icon: BarChart3 },
  { id: 'explore' as const, label: 'Explore', Icon: Compass },
  { id: 'me' as const, label: 'Me', Icon: UserRound },
]

export default function ReleaseNav({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Primary"
      data-commercial-navigation
      style={{
        position: 'fixed',
        left: `max(12px, ${NATIVE_SAFE_AREA_LEFT})`,
        right: `max(12px, ${NATIVE_SAFE_AREA_RIGHT})`,
        bottom: `max(12px, ${NATIVE_SAFE_AREA_BOTTOM})`,
        zIndex: 100,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: 4,
        maxWidth: 620,
        margin: '0 auto',
        padding: 6,
        borderRadius: 22,
        border: '1px solid var(--cv-border)',
        background: 'var(--cv-nav-bg)',
        boxShadow: 'var(--cv-shadow)',
        WebkitBackdropFilter: 'blur(18px)',
        backdropFilter: 'blur(18px)',
      }}
    >
      {items.map(({ id, label, Icon }) => {
        const selected = active === id
        return (
          <button
            key={id}
            type="button"
            aria-current={selected ? 'page' : undefined}
            aria-label={label}
            onClick={() => onChange(id)}
            style={{
              minWidth: 0,
              minHeight: 52,
              border: 0,
              borderRadius: 16,
              background: selected ? 'var(--cv-nav-selected)' : 'transparent',
              color: selected ? 'var(--cv-text)' : 'var(--cv-nav-inactive)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: '0.75rem',
              lineHeight: 1.15,
              fontWeight: selected ? 700 : 600,
              cursor: 'pointer',
            }}
          >
            <Icon size={20} strokeWidth={selected ? 2.4 : 2} aria-hidden="true" />
            <span
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
