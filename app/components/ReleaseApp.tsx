'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import ReleaseNav, { type ReleaseTab } from './ReleaseNav'

const WardIndex = dynamic(() => import('./ward'), {
  ssr: false,
  loading: () => <SectionLoading label="Loading Care" />,
})

const OracleScreen = dynamic(() => import('./oracle/OracleScreen'), {
  ssr: false,
  loading: () => <SectionLoading label="Loading Intelligence" />,
})

const SHELL = {
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
    <main
      style={{
        minHeight: '100dvh',
        background: SHELL.bg,
        color: SHELL.text,
        paddingBottom: 'calc(92px + env(safe-area-inset-bottom))',
      }}
    >
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

        {tab === 'atlas' && <AtlasSurface />}
        {tab === 'me' && <MeSurface />}
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
    me: { title: 'Me', sub: 'Profile, Life, subscription and settings' },
  }
  const current = titles[active]

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: `1px solid ${SHELL.border}`,
        background: 'rgba(8,12,22,0.94)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          minHeight: 68,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{current.title}</div>
          <div style={{ fontSize: 11, color: SHELL.sub, marginTop: 3 }}>{current.sub}</div>
        </div>
        <div
          aria-label="Cliniverse preview status"
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5,
            color: SHELL.teal,
            border: `1px solid rgba(20,184,166,0.28)`,
            borderRadius: 999,
            padding: '6px 9px',
            whiteSpace: 'nowrap',
          }}
        >
          HUMAN-IN-THE-LOOP
        </div>
      </div>
    </header>
  )
}

function HomeSurface({ onNavigate }: { onNavigate: (tab: ReleaseTab) => void }) {
  const cards: Array<{
    tab: ReleaseTab
    eyebrow: string
    title: string
    text: string
    accent: string
  }> = [
    {
      tab: 'care',
      eyebrow: 'CARE OPERATIONS',
      title: 'Review care workflow',
      text: 'Move from follow-up to prioritization, escalation and accountable next action.',
      accent: SHELL.teal,
    },
    {
      tab: 'intelligence',
      eyebrow: 'CLINICAL INTELLIGENCE',
      title: 'Open reasoning workspace',
      text: 'Use evidence-aware support for structured clinical questions and human review.',
      accent: SHELL.violet,
    },
    {
      tab: 'atlas',
      eyebrow: 'ATLAS',
      title: 'Browse curated tools',
      text: 'Access only capabilities that are clearly classified and safe for the current release.',
      accent: SHELL.blue,
    },
  ]

  return (
    <section aria-labelledby="home-title">
      <div
        style={{
          padding: '24px 20px',
          borderRadius: 24,
          border: `1px solid ${SHELL.border}`,
          background: `linear-gradient(145deg, ${SHELL.panel}, ${SHELL.elevated})`,
          marginBottom: 14,
        }}
      >
        <div style={{ color: SHELL.blue, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>
          CLINIVERSE AI
        </div>
        <h1 id="home-title" style={{ fontSize: 28, lineHeight: 1.12, margin: '9px 0 10px' }}>
          One clear path through clinical work.
        </h1>
        <p style={{ margin: 0, color: SHELL.sub, lineHeight: 1.65, maxWidth: 760, fontSize: 14 }}>
          Care operations, clinical intelligence and curated tools are separated into predictable workspaces so each screen has one purpose.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        {cards.map(card => (
          <button
            key={card.tab}
            type="button"
            onClick={() => onNavigate(card.tab)}
            style={{
              textAlign: 'left',
              minHeight: 168,
              padding: 18,
              borderRadius: 20,
              border: `1px solid ${SHELL.border}`,
              background: SHELL.panel,
              color: SHELL.text,
              cursor: 'pointer',
            }}
          >
            <div style={{ color: card.accent, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
              {card.eyebrow}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 10 }}>{card.title}</div>
            <div style={{ color: SHELL.sub, fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>{card.text}</div>
            <div style={{ color: card.accent, fontSize: 12, fontWeight: 800, marginTop: 14 }}>Open →</div>
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: '14px 16px',
          borderRadius: 16,
          border: '1px solid rgba(212,167,44,0.22)',
          background: 'rgba(212,167,44,0.06)',
          color: '#D8C690',
          fontSize: 12,
          lineHeight: 1.55,
        }}
      >
        Release safety: this build is not cleared for real patient data. Human review remains required for clinical workflows.
      </div>
    </section>
  )
}

function AtlasSurface() {
  const groups = [
    ['Reference', 'Drug references, calculators and evidence utilities', 'Available after individual release checks'],
    ['Simulation', 'Ward, emergency and exam-oriented simulation modules', 'Educational mode'],
    ['Advanced AI', 'Imaging and higher-risk analysis capabilities', 'Gated pending safety validation'],
  ]

  return (
    <section aria-labelledby="atlas-title">
      <SurfaceIntro
        id="atlas-title"
        kicker="CURATED CAPABILITY LIBRARY"
        title="Atlas"
        text="Atlas is intentionally curated for release. Existing modules are preserved, but incomplete or high-risk tools are not presented as production-ready."
      />
      <div style={{ display: 'grid', gap: 10 }}>
        {groups.map(([title, text, state]) => (
          <div key={title} style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
            <div style={{ color: SHELL.sub, fontSize: 12, lineHeight: 1.55, marginTop: 5 }}>{text}</div>
            <div style={{ color: SHELL.gold, fontSize: 11, fontWeight: 800, marginTop: 10 }}>{state}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MeSurface() {
  return (
    <section aria-labelledby="me-title">
      <SurfaceIntro
        id="me-title"
        kicker="ONE ACCOUNT DESTINATION"
        title="Me"
        text="Profile, Life, subscription, privacy and settings are being consolidated here so identity and account state have one source of truth."
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
        {[
          ['Profile', 'Authenticated identity and professional profile'],
          ['Life', 'Manual wellness context; connected-device data only when verified'],
          ['Subscription', 'Free / Pro / Institution entitlement state'],
          ['Privacy & Settings', 'Security, support, data controls and preferences'],
        ].map(([title, text]) => (
          <div key={title} style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
            <div style={{ color: SHELL.sub, fontSize: 12, lineHeight: 1.55, marginTop: 6 }}>{text}</div>
            <div style={{ color: SHELL.blue, fontSize: 11, fontWeight: 800, marginTop: 10 }}>Integration in progress</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SurfaceIntro({ id, kicker, title, text }: { id: string; kicker: string; title: string; text: string }) {
  return (
    <div style={{ ...cardStyle, marginBottom: 12 }}>
      <div style={{ color: SHELL.blue, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>{kicker}</div>
      <h1 id={id} style={{ fontSize: 26, margin: '7px 0 8px' }}>{title}</h1>
      <p style={{ margin: 0, color: SHELL.sub, fontSize: 13, lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}

function SectionLoading({ label }: { label: string }) {
  return (
    <div style={{ ...cardStyle, color: SHELL.sub }} role="status" aria-live="polite">
      {label}…
    </div>
  )
}

const cardStyle = {
  padding: 16,
  borderRadius: 18,
  border: `1px solid ${SHELL.border}`,
  background: SHELL.panel,
} as const
