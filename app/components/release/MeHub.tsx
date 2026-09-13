'use client'

import type { ReactNode } from 'react'
import MeAccountSummary from './MeAccountSummary'
import AppearanceSettings from './AppearanceSettings'

const links = [
  { label: 'Contact support', href: '/support', detail: 'Get help with your account or the app.' },
  { label: 'Privacy', href: '/privacy', detail: 'Understand how your information is handled.' },
  { label: 'Terms', href: '/terms', detail: 'Review the terms of using Cliniverse.' },
]

export default function MeHub({ learningSummary, onOpenProgress }: { learningSummary: ReactNode; onOpenProgress: () => void }) {
  return <section aria-labelledby="me-title" data-commercial-me-surface>
    <header style={{ marginBottom: 20 }}>
      <div style={{ color: 'var(--cv-gold)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>YOUR CLINIVERSE</div>
      <h1 id="me-title" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', margin: '7px 0 8px' }}>Me</h1>
      <p style={{ color: 'var(--cv-text-secondary)', margin: 0 }}>Manage your profile, learning, display and subscription.</p>
    </header>
    <div style={{ display: 'grid', gap: 16 }}>
      <MeAccountSummary />
      <AppearanceSettings />
      <section aria-label="Your saved learning">
        {learningSummary}
        <button type="button" onClick={onOpenProgress} style={{ ...actionStyle, marginTop: 10 }}>View learning progress →</button>
      </section>
      <section aria-labelledby="help-title" style={cardStyle}>
        <h2 id="help-title" style={headingStyle}>Help & privacy</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          {links.map(link => <a key={link.href} href={link.href} style={{ ...actionStyle, display: 'block', textDecoration: 'none', color: 'var(--cv-blue)' }}>
            <span style={{ fontWeight: 700 }}>{link.label} →</span>
            <span style={{ display: 'block', color: 'var(--cv-text-secondary)', fontWeight: 400, fontSize: '0.875rem', marginTop: 4 }}>{link.detail}</span>
          </a>)}
        </div>
      </section>
      <details style={cardStyle}>
        <summary style={{ minHeight: 44, cursor: 'pointer', fontWeight: 700 }}>Connections & devices</summary>
        <p style={{ color: 'var(--cv-text-secondary)' }}>Apple Health and Apple Watch are not connected in this version. No device readings are imported.</p>
        <p style={{ color: 'var(--cv-text-secondary)', marginBottom: 0 }}>Hospital and NeuraOps connections are not available from this account yet.</p>
      </details>
    </div>
  </section>
}
const headingStyle = { fontSize: '1rem', margin: '0 0 12px' } as const
const cardStyle = { padding: 16, borderRadius: 18, border: '1px solid var(--cv-border)', background: 'var(--cv-surface)', color: 'var(--cv-text)' } as const
const actionStyle = { minHeight: 44, width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--cv-border)', background: 'var(--cv-surface-elevated)', color: 'var(--cv-teal)', textAlign: 'left', cursor: 'pointer', fontWeight: 600 } as const
