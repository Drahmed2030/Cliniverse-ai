'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import ReleaseNav, { type ReleaseTab } from './ReleaseNav'
import MeHub from './release/MeHub'
import AtlasReleaseCatalog from './release/AtlasReleaseCatalog'

const WardIndex = dynamic(() => import('./ward'), {
  ssr: false,
  loading: () => <SectionLoading label="Loading Care" />,
})

const OracleScreen = dynamic(() => import('./oracle/OracleScreen'), {
  ssr: false,
  loading: () => <SectionLoading label="Loading Intelligence" />,
})

const C = {
  bg: '#080C16',
  panel: '#111827',
  elevated: '#172033',
  border: 'rgba(148,163,184,0.20)',
  text: '#F8FAFC',
  sub: '#94A3B8',
  blue: '#3B82F6',
  teal: '#14B8A6',
  violet: '#8B5CF6',
  gold: '#D4A72C',
}

export default function ReleaseApp() {
  const [tab, setTab] = useState<ReleaseTab>('home')

  return (
    <main style={{ minHeight: '100dvh', background: C.bg, color: C.text, paddingBottom: 'calc(92px + env(safe-area-inset-bottom))' }}>
      <ReleaseHeader active={tab} />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '18px 16px 28px' }}>
        {tab === 'home' && <HomeSurface onNavigate={setTab} />}
        {tab === 'care' && (
          <ErrorBoundary section="Care">
            <WardIndex />
          </ErrorBoundary>
        )}
        {tab === 'intelligence' && (
          <ErrorBoundary section="Clinical Intelligence">
            <OracleScreen />
          </ErrorBoundary>
        )}
        {tab === 'atlas' && <AtlasReleaseCatalog />}
        {tab === 'me' && <MeHub />}
      </div>
      <ReleaseNav active={tab} onChange={setTab} />
    </main>
  )
}

function ReleaseHeader({ active }: { active: ReleaseTab }) {
  const titles: Record<ReleaseTab, { title: string; sub: string }> = {
    home: { title: 'Cliniverse AI', sub: 'Healthcare Intelligence by NeuraOps' },
    care: { title: 'Care', sub: 'Follow-up, prioritization and human escalation' },
    intelligence: { title: 'Intelligence', sub: 'Evidence-aware clinical reasoning support' },
    atlas: { title: 'Atlas', sub: 'Curated clinical tools and references' },
    me: { title: 'Me', sub: 'Profile, Life, plan, privacy and settings' },
  }
  const current = titles[active]

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${C.border}`, background: 'rgba(8,12,22,0.94)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', minHeight: 68, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{current.title}</div>
          <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>{current.sub}</div>
        </div>
        <div aria-label="Cliniverse human review status" style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: C.teal, border: '1px solid rgba(20,184,166,0.28)', borderRadius: 999, padding: '6px 9px', whiteSpace: 'nowrap' }}>
          HUMAN-IN-THE-LOOP
        </div>
      </div>
    </header>
  )
}

function HomeSurface({ onNavigate }: { onNavigate: (tab: ReleaseTab) => void }) {
  const cards: Array<{ tab: ReleaseTab; eyebrow: string; title: string; text: string; accent: string }> = [
    { tab: 'care', eyebrow: 'CARE OPERATIONS', title: 'Review care workflow', text: 'Follow up, prioritize, escalate and keep the next human action accountable.', accent: C.teal },
    { tab: 'intelligence', eyebrow: 'CLINICAL INTELLIGENCE', title: 'Open reasoning workspace', text: 'Use evidence-aware support for structured clinical questions and human review.', accent: C.violet },
    { tab: 'atlas', eyebrow: 'ATLAS', title: 'Browse curated tools', text: 'See capabilities only after they are clearly classified for the current release.', accent: C.blue },
    { tab: 'me', eyebrow: 'ACCOUNT', title: 'Manage Me', text: 'Keep profile, Life, plan, privacy and settings under one identity.', accent: C.gold },
  ]

  return (
    <section aria-labelledby="home-title">
      <div style={{ padding: '24px 20px', borderRadius: 24, border: `1px solid ${C.border}`, background: `linear-gradient(145deg, ${C.panel}, ${C.elevated})`, marginBottom: 14 }}>
        <div style={{ color: C.blue, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>CLINIVERSE AI · BY NEURAOPS</div>
        <h1 id="home-title" style={{ fontSize: 28, lineHeight: 1.12, margin: '9px 0 10px' }}>One clear path through healthcare intelligence.</h1>
        <p style={{ margin: 0, color: C.sub, lineHeight: 1.65, maxWidth: 760, fontSize: 14 }}>
          Care operations, clinical intelligence, curated tools and account controls are separated into predictable workspaces so each screen has one purpose.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        {cards.map(card => (
          <button key={card.tab} type="button" onClick={() => onNavigate(card.tab)} style={{ textAlign: 'left', minHeight: 164, padding: 18, borderRadius: 20, border: `1px solid ${C.border}`, background: C.panel, color: C.text, cursor: 'pointer' }}>
            <div style={{ color: card.accent, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{card.eyebrow}</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 10 }}>{card.title}</div>
            <div style={{ color: C.sub, fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>{card.text}</div>
            <div style={{ color: card.accent, fontSize: 12, fontWeight: 800, marginTop: 14 }}>Open →</div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 16, border: '1px solid rgba(212,167,44,0.22)', background: 'rgba(212,167,44,0.06)', color: '#D8C690', fontSize: 12, lineHeight: 1.55 }}>
        Release safety: this build is not cleared for real patient data. Human review remains required for clinical workflows.
      </div>
    </section>
  )
}

function SectionLoading({ label }: { label: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 18, border: `1px solid ${C.border}`, background: C.panel, color: C.sub }} role="status" aria-live="polite">
      {label}…
    </div>
  )
}