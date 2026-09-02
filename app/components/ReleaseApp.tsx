'use client'

import dynamic from 'next/dynamic'
import { Capacitor } from '@capacitor/core'
import { useEffect, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import ReleaseNav, { type ReleaseTab } from './ReleaseNav'
import MeHub from './release/MeHub'
import AtlasReleaseCatalog from './release/AtlasReleaseCatalog'
import AuthGate from './auth/AuthGate'
import SubscriptionPurchaseProvider, { useCliniverseSubscription } from './release/SubscriptionPurchaseProvider'

const WardIndex = dynamic(() => import('./ward'), {
  ssr: false,
  loading: () => <SectionLoading label="Loading Care" />,
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

function getNativeHeaderTopPadding() {
  const isIOSWebView = Capacitor.getPlatform() === 'ios'
    || /iPad|iPhone|iPod/.test(window.navigator.userAgent)

  if (!isIOSWebView) return null
  return window.innerWidth >= 768 ? 24 : 44
}

export default function ReleaseApp() {
  return (
    <AuthGate allowGuest={false}>
      {() => (
        <SubscriptionPurchaseProvider>
          <ReleaseShell />
        </SubscriptionPurchaseProvider>
      )}
    </AuthGate>
  )
}

function ReleaseShell() {
  const [tab, setTab] = useState<ReleaseTab>('home')
  const [nativeHeaderTopPadding, setNativeHeaderTopPadding] = useState<number | null>(null)
  const { openPaywall } = useCliniverseSubscription()

  useEffect(() => {
    const syncNativeHeaderTopPadding = () => {
      setNativeHeaderTopPadding(getNativeHeaderTopPadding())
    }

    // Resolve after hydration even when WKWebView never emits a resize event.
    // The prior external-store subscription could leave the first release
    // surfaces on the server fallback until a later viewport change.
    syncNativeHeaderTopPadding()
    window.addEventListener('resize', syncNativeHeaderTopPadding)
    return () => window.removeEventListener('resize', syncNativeHeaderTopPadding)
  }, [])

  return (
    <main data-release-shell style={{ minHeight: '100dvh', background: C.bg, color: C.text, paddingBottom: 'calc(92px + env(safe-area-inset-bottom, 0px))', isolation: 'isolate' }}>
      <ReleaseHeader active={tab} nativeTopPadding={nativeHeaderTopPadding} />
      <div
        data-release-header-inner
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          paddingTop: 18,
          paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
          paddingBottom: 28,
          paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
        }}
      >
        {tab === 'home' && <HomeSurface onNavigate={setTab} />}
        {tab === 'care' && (
          <ErrorBoundary section="Care">
            <WardIndex />
          </ErrorBoundary>
        )}
        {tab === 'intelligence' && <ReleaseIntelligenceGate />}
        {tab === 'atlas' && <AtlasReleaseCatalog onNavigate={setTab} onOpenPlan={openPaywall} />}
        {tab === 'me' && <MeHub />}
      </div>
      <ReleaseNav active={tab} onChange={setTab} />
    </main>
  )
}

function ReleaseHeader({ active, nativeTopPadding }: { active: ReleaseTab; nativeTopPadding: number | null }) {
  const titles: Record<ReleaseTab, { title: string; sub: string }> = {
    home: { title: 'Cliniverse AI', sub: 'Healthcare Intelligence by NeuraOps' },
    care: { title: 'Care', sub: 'Cardiology learning, simulated workflows and human review' },
    intelligence: { title: 'Intelligence', sub: 'Release-gated AI workspace' },
    atlas: { title: 'Atlas', sub: 'Curated clinical tools and references' },
    me: { title: 'Me', sub: 'Profile, Life, plan, privacy and settings' },
  }
  const current = titles[active]
  // WKWebView can report a zero CSS safe-area inset during remote navigation
  // on some iOS versions. Keep the release header below the system status bar
  // while still allowing a larger device-provided inset to win in CSS.
  const topPadding = nativeTopPadding === null
    ? 'calc(10px + env(safe-area-inset-top, 0px))'
    : `max(${nativeTopPadding}px, calc(10px + env(safe-area-inset-top, 0px)))`

  return (
    <header data-release-header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${C.border}`, background: 'rgba(8,12,22,0.97)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          minHeight: 'calc(68px + env(safe-area-inset-top, 0px))',
          paddingTop: topPadding,
          paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
          paddingBottom: 10,
          paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
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
    { tab: 'care', eyebrow: 'CARE OPERATIONS', title: 'Open cardiology learning', text: 'Run fictional Ward, Cardiology Operations and Nexus learning workflows with human review.', accent: C.teal },
    { tab: 'intelligence', eyebrow: 'CLINICAL INTELLIGENCE', title: 'Review AI release boundary', text: 'AI assistance stays gated until disclosure, consent and clinical-claims review are complete.', accent: C.violet },
    { tab: 'atlas', eyebrow: 'ATLAS', title: 'Browse curated tools', text: 'See capabilities only after they are clearly classified for the current release.', accent: C.blue },
    { tab: 'me', eyebrow: 'ACCOUNT', title: 'Manage Me', text: 'Keep profile, Life, plan, privacy and settings under one identity.', accent: C.gold },
  ]

  return (
    <section aria-labelledby="home-title">
      <div style={{ padding: '24px 20px', borderRadius: 24, border: `1px solid ${C.border}`, background: `linear-gradient(145deg, ${C.panel}, ${C.elevated})`, marginBottom: 14 }}>
        <div style={{ color: C.blue, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>CLINIVERSE AI · BY NEURAOPS</div>
        <h1 id="home-title" style={{ fontSize: 28, lineHeight: 1.12, margin: '9px 0 10px' }}>One clear path through healthcare intelligence.</h1>
        <p style={{ margin: 0, color: C.sub, lineHeight: 1.65, maxWidth: 760, fontSize: 14 }}>
          Care operations, curated tools and account controls remain available only within the current release boundary. AI features are enabled only after their privacy, consent and clinical-safety gates pass.
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
        Release safety: this build is not cleared for real patient data. Human review remains required for healthcare workflows.
      </div>
    </section>
  )
}

function ReleaseIntelligenceGate() {
  return (
    <section aria-labelledby="intelligence-gate-title" style={{ padding: 22, borderRadius: 22, border: `1px solid ${C.border}`, background: C.panel }}>
      <div style={{ color: C.violet, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>RELEASE GATE</div>
      <h2 id="intelligence-gate-title" style={{ margin: '9px 0 8px', fontSize: 22 }}>Clinical Intelligence is not enabled in this release build.</h2>
      <p style={{ margin: 0, color: C.sub, fontSize: 13, lineHeight: 1.65, maxWidth: 760 }}>
        User-entered content will not be sent to third-party AI providers until explicit disclosure and consent, provider/data-use review, and clinical-claims validation are complete. Do not enter patient-identifiable information into Cliniverse AI.
      </p>
      <div style={{ marginTop: 14, fontSize: 12, color: C.teal, fontWeight: 800 }}>Human review remains the release default.</div>
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
