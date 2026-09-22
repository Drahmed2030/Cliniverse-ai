'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Capacitor } from '@capacitor/core'
import { UserRound } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import ErrorBoundary from './ErrorBoundary'
import ReleaseNav, { type ReleaseTab } from './ReleaseNav'
import MeHub from './release/MeHub'
import { useAppearance } from './release/AppearanceSettings'
import AtlasReleaseCatalog from './release/AtlasReleaseCatalog'
import LearnTracks from './release/LearnTracks'
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
const ProgressTrajectory = dynamic(() => import('./release/ProgressTrajectory'), { ssr: false, loading: () => <SectionLoading label="Loading progress" /> })

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
          <OnboardingOrShell key={user.id} caseLibraryPreview={caseLibraryPreview} accountInitial={user.email?.trim().charAt(0).toUpperCase() || null} showEcgReview={reviewPreview && user.email?.toLowerCase() === 'reviewer@cliniverseai.com' && Boolean(user.email_confirmed_at)} />
        </SubscriptionPurchaseProvider>
      )}
    </AuthGate>
  )
}

function OnboardingOrShell(props: { showEcgReview: boolean; caseLibraryPreview: boolean; accountInitial: string | null }) {
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

function ReleaseShell({ showEcgReview, caseLibraryPreview, accountInitial }: { showEcgReview: boolean; caseLibraryPreview: boolean; accountInitial: string | null }) {
  const appearance = useAppearance()
  const [tab, setTab] = useState<ReleaseTab>(() => {
    // AuthGate mounts this shell after restoring the client session.
    const view = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('view')
    return view === 'learn' || view === 'progress' ? view : 'today'
  })
  const [cardiologyModule, setCardiologyModule] = useState<'overview' | 'pathway'>('overview')
  // null = the Learn practice-track landing; a value = an explicit workspace (deep links from Explore, Today, Progress, Me).
  const [careWorkspace, setCareWorkspace] = useState<CareWorkspace | null>(null)
  const [nativeHeaderTopPadding, setNativeHeaderTopPadding] = useState<number | null>(null)
  const { openPaywall, canAccessPremium } = useCliniverseSubscription()
  const internalReviewTools = showEcgReview && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('reviewTools') === '1'

  useEffect(() => {
    const syncNativeHeaderTopPadding = () => {
      setNativeHeaderTopPadding(getNativeHeaderTopPadding())
    }

    syncNativeHeaderTopPadding()
    window.addEventListener('resize', syncNativeHeaderTopPadding)
    return () => window.removeEventListener('resize', syncNativeHeaderTopPadding)
  }, [])

  const openCodeLab = () => { setCareWorkspace('codelab'); setTab('learn') }
  const openWorkspace = (workspace: CareWorkspace) => { setCareWorkspace(workspace); setCardiologyModule('overview'); setTab('learn') }
  // Plain navigation to Learn always shows the landing; explicit workspace deep links set careWorkspace first.
  const goTab = (next: ReleaseTab) => { if (next === 'learn') setCareWorkspace(null); setTab(next) }

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
      <ReleaseHeader active={tab} nativeTopPadding={nativeHeaderTopPadding} accountInitial={accountInitial} learnLanding={careWorkspace === null} onOpenAccount={() => setTab('me')} />
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
        {tab === 'today' && internalReviewTools && <PracticeShift onWard={() => { setCareWorkspace('ward'); setTab('learn') }} onProgress={() => setTab('progress')} onPathway={() => { setCardiologyModule('pathway'); if (!canAccessPremium) { openPaywall(); return }; setCareWorkspace('cardiology'); setTab('learn') }} />}
        {tab === 'today' && <TodaySurface onNavigate={goTab} />}
        {tab === 'learn' && (
          <ErrorBoundary section="Learn">
            {internalReviewTools && <section aria-labelledby="ecg-review-entry-title" style={{ padding: 20, marginBottom: 20, borderRadius: 22, border: `1px solid ${C.border}`, background: C.panel }}>
              <p style={{ color: C.sub, margin: '0 0 8px' }}>ECG · REVIEW PREVIEW</p>
              <h2 id="ecg-review-entry-title" style={{ margin: '0 0 8px' }}>Record 10 · Rhythm recognition</h2>
              <p style={{ color: C.sub, lineHeight: 1.6 }}>Open the reviewed 12-lead tracing, answer the rhythm question, and find your saved result in Progress. Have your reviewed PDF ready to select.</p>
              <Link href="/labs/ecg-account-review" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '8px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.elevated, color: C.text }}>Open ECG practice →</Link>
              <p style={{ color: C.sub, fontSize: '0.875rem' }}>Review-account access. This practice does not certify clinical competence.</p>
            </section>}
            {careWorkspace === null ? (
              <LearnTracks onOpenWorkspace={openWorkspace} />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCareWorkspace(null)}
                  style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, marginBottom: 8, padding: '0 4px', border: 0, background: 'transparent', color: C.sub, fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Practice tracks
                </button>
                <WardIndex initialCardiologyModule={cardiologyModule} initialWorkspace={careWorkspace} showWorkspaceNav={false} reviewSessions={false} caseLibraryPreview={false} />
              </>
            )}
          </ErrorBoundary>
        )}
        {tab === 'progress' && <ProgressSurface showWardPractice onNavigate={goTab} onOpenWard={() => { setCareWorkspace('ward'); setTab('learn') }} onOpenCodeLab={openCodeLab} />}
        {tab === 'explore' && <AtlasReleaseCatalog onNavigate={handleAtlasNavigate} />}
        {tab === 'me' && <MeHub />}
      </div>
      <ReleaseNav active={tab} onChange={goTab} />
    </main>
  )
}

function ReleaseHeader({ active, nativeTopPadding, accountInitial, learnLanding, onOpenAccount }: { active: ReleaseTab; nativeTopPadding: number | null; accountInitial: string | null; learnLanding: boolean; onOpenAccount: () => void }) {
  const titles: Record<ReleaseTab, { title: string; sub: string }> = {
    today: { title: 'Today', sub: '' },
    learn: { title: 'Learn', sub: learnLanding ? 'Practice, simulate and apply clinical reasoning.' : 'Clinical practice workspace' },
    progress: { title: 'Progress', sub: 'See what is strengthening, what needs another pass, and where to go next.' },
    explore: { title: 'Explore', sub: 'Reference, operations and advanced practice — when you need them.' },
    me: { title: 'Me', sub: 'Account, plan and preferences.' },
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
        <div style={{ minWidth: 0 }}>
          {/* Progress, Explore and Me keep their h1 in the shared header (as Today's does), so each surface is labelled by it. */}
          <div style={{ fontSize: '1rem', fontWeight: 800 }}>{active === 'progress' || active === 'explore' || active === 'me' ? <h1 id={`${active}-title`} style={{ margin: 0, font: 'inherit' }}>{current.title}</h1> : current.title}</div>
          {active === 'today' ? (
            // Today's support line lives in the shell header, under the title. The h1 keeps its exact
            // text on its own element: native screenshot automation waits on "One clear next step.".
            <div className="cv-today-lead">
              <h1 id="today-title">One clear next step.</h1>{' '}
              <p>Everything else can wait.</p>
            </div>
          ) : current.sub && <div style={{ fontSize: '0.75rem', color: C.sub, marginTop: 3 }}>{current.sub}</div>}
        </div>
        {active === 'today' && (
          <button
            type="button"
            className="cv-today-account"
            aria-label="Account and plan"
            onClick={onOpenAccount}
            style={{
              background: `color-mix(in srgb, ${C.blue} 14%, ${C.elevated})`,
              borderColor: `color-mix(in srgb, ${C.blue} 55%, ${C.border})`,
            }}
          >
            {accountInitial ?? <UserRound size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
    </header>
  )
}

// Layout and control styling for this surface lives in commercial-visual-system.css
// under [data-commercial-surface="today"] (UI-A3). Destinations and routes are unchanged.
function TodaySurface({ onNavigate }: { onNavigate: (tab: ReleaseTab) => void }) {
  return (
    <section aria-labelledby="today-title" data-commercial-surface="today">
      <section className="cv-today-next" aria-labelledby="today-next-title">
        <div className="cv-today-eyebrow">NEXT</div>
        <h2 id="today-next-title">Continue your practice</h2>
        <p>Pick up where you left off.</p>
        <button type="button" className="cv-today-cta" onClick={() => onNavigate('learn')}>Resume →</button>
      </section>
      <div className="cv-today-review" data-commercial-card-grid>
        <button type="button" className="cv-today-row" onClick={() => onNavigate('progress')} style={{ '--today-accent': C.violet } as CSSProperties}>
          <span>
            <span className="cv-today-row-eyebrow">REVIEW</span>
            <span className="cv-today-row-title">What needs another pass?</span>
            <span className="cv-today-row-text">Open your learning record.</span>
          </span>
          <span className="cv-today-row-go" aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}

// Layout and control styling lives in commercial-visual-system.css under [data-commercial-surface="progress"].
// The summary, tracks and next step come from ProgressTrajectory; the detailed saved-record lists (assessment
// history and export, Ward saved practice, Code Lab lessons) stay reachable, unchanged, and load only when opened.
function ProgressSurface({ onNavigate, onOpenWard, onOpenCodeLab, showWardPractice }: { showWardPractice: boolean; onNavigate: (tab: ReleaseTab) => void; onOpenWard: () => void; onOpenCodeLab: () => void }) {
  const [recordsOpen, setRecordsOpen] = useState(false)
  return (
    <section aria-labelledby="progress-title" data-commercial-surface="progress">
      <ProgressTrajectory includeWard={showWardPractice} onOpenWard={onOpenWard} onOpenLearn={() => onNavigate('learn')} />
      <details className="cv-progress-records" onToggle={event => setRecordsOpen(event.currentTarget.open)}>
        <summary>Saved records and export</summary>
        {recordsOpen && (
          <div>
            <AssessmentHistory />
            {showWardPractice && <WardSavedPractice onOpen={onOpenWard} />}
            <AccountLearningSummary view="summary" isPro={false} onUpgrade={onOpenCodeLab} onBack={onOpenCodeLab} onOpen={onOpenCodeLab} />
          </div>
        )}
      </details>
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
