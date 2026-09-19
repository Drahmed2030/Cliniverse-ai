'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Capacitor } from '@capacitor/core'
import { useEffect, useState, type CSSProperties } from 'react'
import ErrorBoundary from './ErrorBoundary'
import ReleaseNav, { type ReleaseTab } from './ReleaseNav'
import MeHub from './release/MeHub'
import { useAppearance } from './release/AppearanceSettings'
import AtlasReleaseCatalog from './release/AtlasReleaseCatalog'
import type { AtlasDestination } from './release/AtlasReleaseCatalog'
import type { CareWorkspace } from './ward'
import AuthGate from './auth/AuthGate'
import OnboardingScreens from './release/OnboardingScreens'
import SubscriptionPurchaseProvider, { useCliniverseSubscription } from './release/SubscriptionPurchaseProvider'
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_LEFT,
  NATIVE_SAFE_AREA_RIGHT,
  NATIVE_SAFE_AREA_TOP,
} from '../lib/nativeSafeArea'

const PracticeShift = dynamic(() => import('./release/PracticeShift'), { ssr: false, loading: () => <SectionLoading label="Loading training shift" /> })
const WardSavedPractice = dynamic(() => import('./ward/WardSavedPractice'), { ssr: false, loading: () => <SectionLoading label="Loading Ward practice" /> })
const AssessmentHistory = dynamic(() => import('./release/AssessmentHistory'), { ssr: false, loading: () => <SectionLoading label="Loading assessments" /> })

const AccountLearningSummary = dynamic(() => import('./ward/AccountCodeLab'), {
  ssr: false,
  loading: () => <SectionLoading label="Loading saved lessons" />,
})

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

const ONBOARDING_SEEN_KEY = 'cliniverse:onboarding:seen'

export default function ReleaseApp({ reviewPreview = false, caseLibraryPreview = false }: { reviewPreview?: boolean; caseLibraryPreview?: boolean }) {
  return (
    <AuthGate allowGuest={false}>
      {user => (
        <SubscriptionPurchaseProvider>
          <OnboardingOrShell key={user.id} caseLibraryPreview={caseLibraryPreview} showEcgReview={reviewPreview && user.email?.toLowerCase() === 'reviewer@cliniverseai.com' && Boolean(user.email_confirmed_at)} />
        </SubscriptionPurchaseProvider>
      )}
    </AuthGate>
  )
}

function OnboardingOrShell(props: { showEcgReview: boolean; caseLibraryPreview: boolean }) {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null)
  const { openPaywall } = useCliniverseSubscription()

  useEffect(() => {
    let hasSeen = true
    try { hasSeen = localStorage.getItem(ONBOARDING_SEEN_KEY) === 'true' } catch { /* localStorage unavailable — treat as seen */ }
    // A deep link (e.g. ?view=learn) means the user is headed somewhere specific —
    // don't interrupt that with onboarding. Not persisted: next launch without a
    // deep link still shows onboarding if they haven't seen it.
    const hasDeepLink = new URLSearchParams(window.location.search).has('view')
    setShowOnboarding(!hasSeen && !hasDeepLink)
  }, [])

  function complete(startTrial: boolean) {
    try { localStorage.setItem(ONBOARDING_SEEN_KEY, 'true') } catch { /* best-effort persistence only */ }
    setShowOnboarding(false)
    if (startTrial) openPaywall()
  }

  if (showOnboarding === null) return null
  if (showOnboarding) return <OnboardingScreens onComplete={complete} />
  return <ReleaseShell {...props} />
}

function ReleaseShell({ showEcgReview, caseLibraryPreview }: { showEcgReview: boolean; caseLibraryPreview: boolean }) {
  const appearance = useAppearance()
  const [tab, setTab] = useState<ReleaseTab>(() => {
    // AuthGate mounts this shell after restoring the client session.
    const view = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('view')
    return view === 'learn' || view === 'progress' ? view : 'today'
  })
  const [cardiologyModule, setCardiologyModule] = useState<'overview' | 'pathway'>('overview')
  const [careWorkspace, setCareWorkspace] = useState<CareWorkspace>('ward')
  const [nativeHeaderTopPadding, setNativeHeaderTopPadding] = useState<number | null>(null)
  const { openPaywall, canAccessPremium } = useCliniverseSubscription()

  useEffect(() => {
    const syncNativeHeaderTopPadding = () => {
      setNativeHeaderTopPadding(getNativeHeaderTopPadding())
    }

    syncNativeHeaderTopPadding()
    window.addEventListener('resize', syncNativeHeaderTopPadding)
    return () => window.removeEventListener('resize', syncNativeHeaderTopPadding)
  }, [])

  const openCodeLab = () => { setCareWorkspace('codelab'); setTab('learn') }

  const handleAtlasNavigate = (destination: AtlasDestination) => {
    if (destination.workspace) { setCareWorkspace(destination.workspace); setCardiologyModule('overview') }
    setTab(destination.tab === 'care' ? 'learn' : 'me')
  }

  return (
    <main
      data-release-shell
      data-commercial-shell
      data-appearance={appearance}
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
        {tab === 'today' && showEcgReview && <PracticeShift onWard={() => { setCareWorkspace('ward'); setTab('learn') }} onProgress={() => setTab('progress')} onPathway={() => { setCardiologyModule('pathway'); if (!canAccessPremium) { openPaywall(); return }; setCareWorkspace('cardiology'); setTab('learn') }} />}
        {tab === 'today' && <TodaySurface onNavigate={setTab} onOpenCodeLab={openCodeLab} />}
        {tab === 'learn' && (
          <ErrorBoundary section="Learn">
            {showEcgReview && <section aria-labelledby="ecg-review-entry-title" style={{ padding: 20, marginBottom: 20, borderRadius: 22, border: `1px solid ${C.border}`, background: C.panel }}>
              <p style={{ color: C.sub, margin: '0 0 8px' }}>ECG · REVIEW PREVIEW</p>
              <h2 id="ecg-review-entry-title" style={{ margin: '0 0 8px' }}>Record 10 · Rhythm recognition</h2>
              <p style={{ color: C.sub, lineHeight: 1.6 }}>Open the reviewed 12-lead tracing, answer the rhythm question, and find your saved result in Progress. Have your reviewed PDF ready to select.</p>
              <Link href="/labs/ecg-account-review" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '8px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.elevated, color: C.text }}>Open ECG practice →</Link>
              <p style={{ color: C.sub, fontSize: '0.875rem' }}>Review-account access. This practice does not certify clinical competence.</p>
            </section>}
            <WardIndex initialCardiologyModule={cardiologyModule} initialWorkspace={careWorkspace} reviewSessions={showEcgReview} caseLibraryPreview={showEcgReview && caseLibraryPreview} />
          </ErrorBoundary>
        )}
        {tab === 'progress' && <ProgressSurface showWardPractice={showEcgReview} onNavigate={setTab} onOpenCodeLab={openCodeLab} />}
        {tab === 'explore' && <AtlasReleaseCatalog onNavigate={handleAtlasNavigate} onOpenPlan={openPaywall} caseLibraryPreview={showEcgReview && caseLibraryPreview} />}
        {tab === 'me' && <MeHub onOpenProgress={() => setTab('progress')} learningSummary={<AccountLearningSummary view="summary" isPro={false} onUpgrade={openCodeLab} onBack={openCodeLab} onOpen={openCodeLab} />} />}
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
      </div>
    </header>
  )
}

// Layout and control styling for this surface lives in commercial-visual-system.css
// under [data-commercial-surface="today"] (UI-A3). Destinations and routes are unchanged.
function TodaySurface({ onNavigate, onOpenCodeLab }: { onNavigate: (tab: ReleaseTab) => void; onOpenCodeLab: () => void }) {
  const destinations: Array<{ tab: ReleaseTab; eyebrow: string; title: string; text: string; accent: string }> = [
    { tab: 'progress', eyebrow: 'PROGRESS', title: 'Review your progress', text: 'Competency and review state, as governed evidence becomes available.', accent: C.violet },
    { tab: 'explore', eyebrow: 'EXPLORE', title: 'Discover approved experiences', text: 'Curated learning tools inside the trusted release boundary.', accent: C.blue },
    { tab: 'me', eyebrow: 'ACCOUNT', title: 'Manage your plan', text: 'Account, Cliniverse PRO, restore purchases and support.', accent: C.gold },
  ]

  return (
    <section aria-labelledby="today-title" data-commercial-surface="today">
      <div className="cv-today-primary">
        <div className="cv-today-hero">
          <div className="cv-today-eyebrow">CLINIVERSE</div>
          <h1 id="today-title" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', lineHeight: 1.12, margin: '9px 0 10px' }}>One clear next step.</h1>
          <p>Follow your learning record and return to the skills you want to strengthen.</p>
          <button type="button" className="cv-today-cta" onClick={() => onNavigate('learn')}>Resume learning →</button>
        </div>
        <AccountLearningSummary view="summary" isPro={false} onUpgrade={onOpenCodeLab} onBack={onOpenCodeLab} onOpen={onOpenCodeLab} />
      </div>

      <ul className="cv-today-list" data-commercial-card-grid aria-label="More in Cliniverse">
        {destinations.map(item => (
          <li key={item.tab}>
            <button type="button" className="cv-today-row" onClick={() => onNavigate(item.tab)} style={{ '--today-accent': item.accent } as CSSProperties}>
              <span>
                <span className="cv-today-row-eyebrow">{item.eyebrow}</span>
                <span className="cv-today-row-title">{item.title}</span>
                <span className="cv-today-row-text">{item.text}</span>
              </span>
              <span className="cv-today-row-go" aria-hidden="true">→</span>
            </button>
          </li>
        ))}
      </ul>

      <div data-commercial-safety-note>
        For education and simulation. Keep real patient information outside this workspace.
      </div>
    </section>
  )
}

function ProgressSurface({ onNavigate, onOpenCodeLab, showWardPractice }: { showWardPractice: boolean; onNavigate: (tab: ReleaseTab) => void; onOpenCodeLab: () => void }) {
  return (
    <section aria-labelledby="progress-title" data-commercial-surface="progress">
      <AccountLearningSummary view="summary" isPro={false} onUpgrade={onOpenCodeLab} onBack={onOpenCodeLab} onOpen={onOpenCodeLab} />
      <AssessmentHistory />
      {showWardPractice && <WardSavedPractice onOpen={() => onNavigate('learn')} />}
      <div style={{ padding: 20, borderRadius: 22, border: `1px solid ${C.border}`, background: C.panel }}>
        <div style={{ color: C.violet, fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.08em' }}>COMPETENCY</div>
        <h1 id="progress-title" style={{ margin: '8px 0 8px', fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Clinical competency</h1>
        <p style={{ margin: 0, color: C.sub, fontSize: '0.875rem', lineHeight: 1.65, maxWidth: 760 }}>
          Saved lessons and assessment attempts appear separately above. Competency levels require their own verified evidence.
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
