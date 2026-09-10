'use client'

import dynamic from 'next/dynamic'
import { Capacitor } from '@capacitor/core'
import { useEffect, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import ReleaseNav, { type ReleaseTab } from './ReleaseNav'
import MeHub from './release/MeHub'
import AtlasReleaseCatalog from './release/AtlasReleaseCatalog'
import type { AtlasDestination } from './release/AtlasReleaseCatalog'
import type { CareWorkspace } from './ward'
import AuthGate from './auth/AuthGate'
import SubscriptionPurchaseProvider, { useCliniverseSubscription } from './release/SubscriptionPurchaseProvider'
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_LEFT,
  NATIVE_SAFE_AREA_RIGHT,
  NATIVE_SAFE_AREA_TOP,
} from '../lib/nativeSafeArea'

const WardIndex = dynamic(() => import('./ward'), {
  ssr: false,
  loading: () => <SectionLoading label="Loading learning" />,
})

const C = {
  bg: 'var(--cv-bg)',
  panel: 'var(--cv-surface)',
  elevated: 'var(--cv-surface-elevated)',
  subtle: 'var(--cv-surface-subtle)',
  border: 'var(--cv-border)',
  text: 'var(--cv-text)',
  sub: 'var(--cv-text-secondary)',
  blue: 'var(--cv-blue)',
  teal: 'var(--cv-teal)',
  violet: 'var(--cv-violet)',
  gold: 'var(--cv-gold)',
}

function getNativeHeaderTopPadding() {
  const isCompactViewport = window.innerWidth < 768
  const isTouchTablet = window.innerWidth <= 1366 && window.navigator.maxTouchPoints > 0
  const isIOSWebView = Capacitor.getPlatform() === 'ios'
    || /iPad|iPhone|iPod/.test(window.navigator.userAgent)
    || (/Macintosh/.test(window.navigator.userAgent) && window.navigator.maxTouchPoints > 1)

  if (!isIOSWebView && !isCompactViewport && !isTouchTablet) return null
  return window.innerWidth >= 768 ? 34 : 69
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
  const [tab, setTab] = useState<ReleaseTab>('today')
  const [careWorkspace, setCareWorkspace] = useState<CareWorkspace>('ward')
  const [nativeHeaderTopPadding, setNativeHeaderTopPadding] = useState<number | null>(null)
  const { openPaywall } = useCliniverseSubscription()

  useEffect(() => {
    const syncNativeHeaderTopPadding = () => {
      setNativeHeaderTopPadding(getNativeHeaderTopPadding())
    }

    syncNativeHeaderTopPadding()
    window.addEventListener('resize', syncNativeHeaderTopPadding)
    return () => window.removeEventListener('resize', syncNativeHeaderTopPadding)
  }, [])

  const handleAtlasNavigate = (destination: AtlasDestination) => {
    if (destination.workspace) setCareWorkspace(destination.workspace)
    setTab(destination.tab === 'care' ? 'learn' : 'me')
  }

  return (
    <main
      data-release-shell
      data-commercial-shell
      style={{
        minHeight: '100dvh',
        background: C.bg,
        color: C.text,
        paddingBottom: `calc(92px + ${NATIVE_SAFE_AREA_BOTTOM})`,
        isolation: 'isolate',
      }}
    >
      <ReleaseHeader active={tab} nativeTopPadding={nativeHeaderTopPadding} />
      <div
        data-commercial-content
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          paddingTop: 18,
          paddingRight: `max(16px, ${NATIVE_SAFE_AREA_RIGHT})`,
          paddingBottom: 28,
          paddingLeft: `max(16px, ${NATIVE_SAFE_AREA_LEFT})`,
        }}
      >
        {tab === 'today' && <TodaySurface onNavigate={setTab} />}
        {tab === 'learn' && (
          <ErrorBoundary section="Learn">
            <WardIndex initialWorkspace={careWorkspace} />
          </ErrorBoundary>
        )}
        {tab === 'progress' && <ProgressSurface onNavigate={setTab} />}
        {tab === 'explore' && <AtlasReleaseCatalog onNavigate={handleAtlasNavigate} onOpenPlan={openPaywall} />}
        {tab === 'me' && <MeHub />}
      </div>
      <ReleaseNav active={tab} onChange={setTab} />
    </main>
  )
}

function ReleaseHeader({ active, nativeTopPadding }: { active: ReleaseTab; nativeTopPadding: number | null }) {
  const titles: Record<ReleaseTab, { title: string; sub: string }> = {
    today: { title: 'Today', sub: 'Your next clear learning action' },
    learn: { title: 'Learn', sub: 'Governed cardiology learning and simulation' },
    progress: { title: 'Progress', sub: 'Competency, review cadence and learning history' },
    explore: { title: 'Explore', sub: 'Curated learning tools and approved experiences' },
    me: { title: 'Me', sub: 'Account, plan, privacy and settings' },
  }
  const current = titles[active]
  const topPadding = nativeTopPadding === null
    ? `calc(10px + ${NATIVE_SAFE_AREA_TOP})`
    : `max(${nativeTopPadding}px, calc(10px + ${NATIVE_SAFE_AREA_TOP}))`

  return (
    <header
      data-release-header
      data-commercial-chrome
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: `1px solid ${C.border}`,
        background: 'var(--cv-nav-bg)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div
        data-release-header-inner
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          minHeight: `calc(68px + ${NATIVE_SAFE_AREA_TOP})`,
          paddingTop: topPadding,
          paddingRight: `max(16px, ${NATIVE_SAFE_AREA_RIGHT})`,
          paddingBottom: 10,
          paddingLeft: `max(16px, ${NATIVE_SAFE_AREA_LEFT})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800 }}>{current.title}</div>
          <div style={{ fontSize: '0.75rem', color: C.sub, marginTop: 3 }}>{current.sub}</div>
        </div>
        <div
          aria-label="Cliniverse human review status"
          style={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            color: C.teal,
            border: `1px solid ${C.border}`,
            borderRadius: 999,
            padding: '6px 9px',
            whiteSpace: 'nowrap',
          }}
        >
          HUMAN-REVIEWED
        </div>
      </div>
    </header>
  )
}

function TodaySurface({ onNavigate }: { onNavigate: (tab: ReleaseTab) => void }) {
  const cards: Array<{ tab: ReleaseTab; eyebrow: string; title: string; text: string; accent: string }> = [
    { tab: 'learn', eyebrow: 'CONTINUE', title: 'Resume learning', text: 'Continue governed cardiology learning and simulation from one place.', accent: C.teal },
    { tab: 'progress', eyebrow: 'PROGRESS', title: 'Review your progress', text: 'See competency and review state as governed evidence becomes available.', accent: C.violet },
    { tab: 'explore', eyebrow: 'EXPLORE', title: 'Discover approved experiences', text: 'Browse curated learning tools without leaving the trusted release boundary.', accent: C.blue },
    { tab: 'me', eyebrow: 'ACCOUNT', title: 'Manage your plan', text: 'Review account, Cliniverse PRO, restore purchases, privacy and support.', accent: C.gold },
  ]

  return (
    <section aria-labelledby="today-title" data-commercial-surface="today">
      <div
        style={{
          padding: '24px 20px',
          borderRadius: 24,
          border: `1px solid ${C.border}`,
          background: `linear-gradient(145deg, ${C.panel}, ${C.elevated})`,
          marginBottom: 14,
        }}
      >
        <div style={{ color: C.blue, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em' }}>CLINIVERSE</div>
        <h1 id="today-title" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', lineHeight: 1.12, margin: '9px 0 10px' }}>One clear next step.</h1>
        <p style={{ margin: 0, color: C.sub, lineHeight: 1.65, maxWidth: 760, fontSize: '0.9375rem' }}>
          Continue learning, review progress, explore approved experiences, or manage your account. Clinical Intelligence remains separately gated and is not exposed from primary navigation.
        </p>
      </div>

      <div data-commercial-card-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        {cards.map(card => (
          <button
            key={card.tab}
            type="button"
            onClick={() => onNavigate(card.tab)}
            style={{
              textAlign: 'left',
              minHeight: 164,
              padding: 18,
              borderRadius: 20,
              border: `1px solid ${C.border}`,
              background: C.panel,
              color: C.text,
              cursor: 'pointer',
            }}
          >
            <div style={{ color: card.accent, fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.08em' }}>{card.eyebrow}</div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 800, marginTop: 10 }}>{card.title}</div>
            <div style={{ color: C.sub, fontSize: '0.8125rem', lineHeight: 1.6, marginTop: 8 }}>{card.text}</div>
            <div style={{ color: card.accent, fontSize: '0.8125rem', fontWeight: 800, marginTop: 14 }}>Open →</div>
          </button>
        ))}
      </div>

      <div
        data-commercial-safety-note
        style={{
          marginTop: 14,
          padding: '14px 16px',
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          background: C.subtle,
          color: C.sub,
          fontSize: '0.8125rem',
          lineHeight: 1.55,
        }}
      >
        Current safety boundary: no real-patient workflow activation and no ungated clinical AI from this commercial shell.
      </div>
    </section>
  )
}

function ProgressSurface({ onNavigate }: { onNavigate: (tab: ReleaseTab) => void }) {
  return (
    <section aria-labelledby="progress-title" data-commercial-surface="progress">
      <div style={{ padding: 20, borderRadius: 22, border: `1px solid ${C.border}`, background: C.panel }}>
        <div style={{ color: C.violet, fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.08em' }}>COMPETENCY</div>
        <h1 id="progress-title" style={{ margin: '8px 0 8px', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Progress grows from governed evidence.</h1>
        <p style={{ margin: 0, color: C.sub, fontSize: '0.875rem', lineHeight: 1.65, maxWidth: 760 }}>
          Mastery, due reviews and longitudinal competency will appear here only when backed by the governed ECG and Echo competency pipeline. No synthetic score is shown as learner truth.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('learn')}
          style={{
            marginTop: 16,
            minHeight: 44,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            background: C.elevated,
            color: C.text,
            padding: '0 16px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Go to Learn →
        </button>
      </div>
    </section>
  )
}

function ReleaseIntelligenceGate() {
  return (
    <section aria-labelledby="intelligence-gate-title" hidden>
      <h2 id="intelligence-gate-title">Clinical Intelligence is not enabled in this release build.</h2>
      <p>
        This non-primary release gate is retained as an explicit security boundary. User-entered content is not sent to third-party AI providers until explicit disclosure and consent, provider/data-use review, and clinical-claims validation are complete. Do not enter patient-identifiable information into Cliniverse AI.
      </p>
    </section>
  )
}

void ReleaseIntelligenceGate

function SectionLoading({ label }: { label: string }) {
  return (
    <div
      style={{ padding: 16, borderRadius: 18, border: `1px solid ${C.border}`, background: C.panel, color: C.sub }}
      role="status"
      aria-live="polite"
    >
      {label}…
    </div>
  )
}
