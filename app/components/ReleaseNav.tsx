'use client'

import { Activity, BookOpenCheck, BrainCircuit, Home, UserRound } from 'lucide-react'

export type ReleaseTab = 'home' | 'care' | 'intelligence' | 'atlas' | 'me'

interface Props {
  active: ReleaseTab
  onChange: (tab: ReleaseTab) => void
}

const items = [
  { id: 'home' as const, label: 'Home', Icon: Home },
  { id: 'care' as const, label: 'Care', Icon: Activity },
  { id: 'intelligence' as const, label: 'Intelligence', Icon: BrainCircuit },
  { id: 'atlas' as const, label: 'Atlas', Icon: BookOpenCheck },
  { id: 'me' as const, label: 'Me', Icon: UserRound },
]

export default function ReleaseNav({ active, onChange }: Props) {
  return (
    <nav
      aria-label="Primary"
      style={{
        position: 'fixed',
        left: 'max(12px, env(safe-area-inset-left, 0px))',
        right: 'max(12px, env(safe-area-inset-right, 0px))',
        bottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
        zIndex: 100,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: 4,
        maxWidth: 620,
        margin: '0 auto',
        padding: 6,
        borderRadius: 22,
        border: '1px solid rgba(148,163,184,0.24)',
        background: 'rgba(8,12,22,0.94)',
        boxShadow: '0 14px 40px rgba(2,6,23,0.28)',
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
              background: selected ? 'rgba(37,99,235,0.16)' : 'transparent',
              color: selected ? '#FFFFFF' : '#94A3B8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: 10,
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
