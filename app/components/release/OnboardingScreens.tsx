'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion'
import {
  Activity,
  BookOpen,
  Check,
  ChevronLeft,
  GraduationCap,
  LayoutGrid,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { useAppearance } from './AppearanceSettings'
import { FeatureFlow, CapabilityBeam, AnchorFrame, EditorialMark, SelectionSummary } from './OnboardingVisuals'
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_LEFT,
  NATIVE_SAFE_AREA_RIGHT,
  NATIVE_SAFE_AREA_TOP,
} from '../../lib/nativeSafeArea'

const INTERESTS = ['ECG', 'Echo', 'Resuscitation', 'Cardiology Operations', 'Clinical Reference'] as const
const INTERESTS_KEY = 'cliniverse:onboarding:interests'

const WHAT_YOU_CAN_DO = [
  { icon: GraduationCap, label: 'Learn', detail: 'Ward simulation, ECG, Echo, and Code Lab.' },
  { icon: Activity, label: 'Studio', detail: 'Real cardiac ultrasound, assessed against evidence.' },
  { icon: BookOpen, label: 'Reference', detail: 'Calculators, dosing, interactions — sourced.' },
  { icon: LayoutGrid, label: 'Operations', detail: 'A live cardiology console, not a mockup.' },
]

const HOW_IT_WORKS = [
  { icon: ShieldCheck, label: 'Evidence' },
  { icon: Target, label: 'Practice' },
  { icon: RotateCcw, label: 'Replay' },
  { icon: TrendingUp, label: 'Progress' },
]

interface Props {
  onComplete: (startTrial: boolean) => void
}

export default function OnboardingScreens({ onComplete }: Props) {
  const appearance = useAppearance()
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [interests, setInterests] = useState<string[]>([])

  const totalSteps = 5
  const isLast = step === totalSteps - 1

  function next() {
    if (isLast) return
    setDirection(1)
    setStep(s => s + 1)
  }

  function back() {
    if (step === 0) return
    setDirection(-1)
    setStep(s => s - 1)
  }

  function toggleInterest(name: string) {
    setInterests(prev => (prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]))
  }

  function finish(startTrial: boolean) {
    try { localStorage.setItem(INTERESTS_KEY, JSON.stringify(interests)) } catch { /* best-effort only */ }
    onComplete(startTrial)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const threshold = 60
    if (info.offset.x < -threshold) next()
    else if (info.offset.x > threshold) back()
  }

  return (
    <main
      data-commercial-shell
      data-appearance={appearance}
      aria-labelledby="onboarding-title"
      className="cv-onboarding"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--cv-bg)',
        boxSizing: 'border-box',
        padding: `max(18px, ${NATIVE_SAFE_AREA_TOP}) max(16px, ${NATIVE_SAFE_AREA_RIGHT}) max(20px, ${NATIVE_SAFE_AREA_BOTTOM}) max(16px, ${NATIVE_SAFE_AREA_LEFT})`,
      }}
    >
      <div className="cv-onboarding-glow cv-onboarding-glow-a" aria-hidden="true" />
      <div className="cv-onboarding-glow cv-onboarding-glow-b" aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, marginBottom: 8 }}>
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          style={{
            width: 44,
            height: 44,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 999,
            border: '1px solid var(--cv-border)',
            background: 'var(--cv-surface)',
            color: 'var(--cv-text-secondary)',
            cursor: step === 0 ? 'default' : 'pointer',
            opacity: step === 0 ? 0 : 1,
            pointerEvents: step === 0 ? 'none' : 'auto',
            transition: 'opacity var(--cv-motion-base) ease',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <div role="group" aria-label={`Step ${step + 1} of ${totalSteps}`} style={{ display: 'flex', gap: 7 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              animate={{ scale: i === step ? 1.2 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: i === step ? 'var(--cv-teal)' : 'var(--cv-border)',
                transition: 'background-color var(--cv-motion-base) ease',
              }}
            />
          ))}
        </div>

        {!isLast ? (
          <button
            type="button"
            onClick={() => finish(false)}
            style={{
              minHeight: 44,
              padding: '0 4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--cv-text-secondary)',
              fontSize: 'var(--cv-text-support)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Skip
          </button>
        ) : (
          <div style={{ width: 44 }} aria-hidden="true" />
        )}
      </div>

      <div className="cv-onboarding-layout">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="cv-onboarding-card"
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              drag={prefersReducedMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={handleDragEnd}
              initial={{ x: direction > 0 ? 36 : -36, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -36 : 36, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <StepContent step={step} interests={interests} onToggleInterest={toggleInterest} />
            </motion.div>
          </AnimatePresence>

          <div style={{ marginTop: 26 }}>
            {!isLast ? (
              <button type="button" onClick={next} className="cv-onboarding-cta">
                Next
              </button>
            ) : (
              <>
                <button type="button" onClick={() => finish(true)} className="cv-onboarding-cta">
                  Start my free trial →
                </button>
                <button
                  type="button"
                  onClick={() => finish(false)}
                  className="cv-onboarding-secondary"
                >
                  Enter Cliniverse
                </button>
              </>
            )}
          </div>
        </motion.div>

        <div className="cv-onboarding-anchor" aria-hidden="true">
          <StepAnchor step={step} interests={interests} />
        </div>
      </div>

      <style>{CSS}</style>
    </main>
  )
}

/** Each step gets a composition tied to what that step is actually about — never a lone decorative icon. */
function StepAnchor({ step, interests }: { step: number; interests: string[] }) {
  if (step === 0) {
    return (
      <AnchorFrame tone="teal">
        <EditorialMark icon={Sparkles} label="CLINIVERSE" tone="teal" />
      </AnchorFrame>
    )
  }
  if (step === 1) {
    return (
      <AnchorFrame tone="teal">
        <FeatureFlow ariaLabel="What you can do in Cliniverse" items={WHAT_YOU_CAN_DO} large />
      </AnchorFrame>
    )
  }
  if (step === 2) {
    return (
      <AnchorFrame tone="violet">
        <CapabilityBeam ariaLabel="How the system works" stages={HOW_IT_WORKS} orientation="vertical" large />
      </AnchorFrame>
    )
  }
  if (step === 3) {
    return (
      <AnchorFrame tone="teal">
        <SelectionSummary options={INTERESTS} selected={interests} />
      </AnchorFrame>
    )
  }
  return (
    <AnchorFrame tone="teal">
      <EditorialMark icon={ShieldCheck} label="READY" tone="teal" />
    </AnchorFrame>
  )
}

function StepContent({
  step,
  interests,
  onToggleInterest,
}: {
  step: number
  interests: string[]
  onToggleInterest: (name: string) => void
}) {
  if (step === 0) {
    return (
      <>
        <StepIcon icon={Sparkles} />
        <h1 id="onboarding-title" className="cv-onboarding-title">Cliniverse</h1>
        <p className="cv-onboarding-body">Clinical intelligence for learning, interpretation, and operational practice.</p>
      </>
    )
  }

  if (step === 1) {
    return (
      <>
        <p className="cv-onboarding-eyebrow">WHAT YOU CAN DO</p>
        <h1 id="onboarding-title" className="cv-onboarding-title-sm">Everything in one governed workspace</h1>
        <div style={{ marginTop: 18 }}>
          <FeatureFlow ariaLabel="What you can do in Cliniverse" items={WHAT_YOU_CAN_DO} />
        </div>
      </>
    )
  }

  if (step === 2) {
    return (
      <>
        <p className="cv-onboarding-eyebrow">HOW THE SYSTEM WORKS</p>
        <h1 id="onboarding-title" className="cv-onboarding-title-sm">Built on evidence, not guesses</h1>
        <div style={{ marginTop: 22, marginBottom: 16 }}>
          <CapabilityBeam ariaLabel="How the system works" stages={HOW_IT_WORKS} />
        </div>
        <p className="cv-onboarding-body">Every case is sourced. Every attempt is tracked.</p>
      </>
    )
  }

  if (step === 3) {
    return (
      <>
        <p className="cv-onboarding-eyebrow">PERSONALIZE</p>
        <h1 id="onboarding-title" className="cv-onboarding-title-sm">What are you here to work on?</h1>
        <p className="cv-onboarding-body" style={{ marginBottom: 16 }}>You can change this anytime.</p>
        <div role="group" aria-label="Choose your interests" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {INTERESTS.map(name => {
            const active = interests.includes(name)
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleInterest(name)}
                className="cv-onboarding-chip"
                data-active={active}
              >
                {active && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                {name}
              </button>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <>
      <StepIcon icon={ShieldCheck} />
      <h1 id="onboarding-title" className="cv-onboarding-title">You&rsquo;re ready.</h1>
      <p className="cv-onboarding-body" style={{ marginBottom: 14 }}>
        Everything above is live — not a preview.
      </p>
    </>
  )
}

function StepIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div aria-hidden="true" className="cv-onboarding-icon">
      <Icon size={30} color="var(--cv-teal)" strokeWidth={2} />
    </div>
  )
}

const CSS = `
  .cv-onboarding-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }
  .cv-onboarding-glow-a {
    background: radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--cv-teal) 22%, transparent), transparent 55%);
    animation: cvOnboardingAmbient 8s ease-in-out infinite alternate;
  }
  .cv-onboarding-glow-b {
    background: radial-gradient(circle at 82% 30%, color-mix(in srgb, var(--cv-violet) 16%, transparent), transparent 55%);
    animation: cvOnboardingAmbient 8s ease-in-out infinite alternate-reverse;
  }
  @keyframes cvOnboardingAmbient {
    0%   { opacity: 0.55; transform: scale(1) translate(0, 0); }
    100% { opacity: 0.9; transform: scale(1.1) translate(12px, -10px); }
  }

  .cv-onboarding-layout {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: auto;
    width: 100%;
    max-width: 440px;
    gap: var(--cv-space-6);
  }

  .cv-onboarding-anchor { display: none; }

  @media (min-width: 700px) {
    .cv-onboarding-layout {
      max-width: 1040px;
      align-items: stretch;
    }
    .cv-onboarding-card { flex: 1 1 45%; margin: auto 0; }
    .cv-onboarding-anchor { display: block; flex: 1 1 55%; margin: auto 0; }
  }

  .cv-onboarding-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    border-radius: var(--cv-radius-xl);
    padding: 32px 26px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.68);
    border: 0.5px solid rgba(255, 255, 255, 0.22);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 20px 60px rgba(0, 0, 0, 0.08);
  }
  [data-commercial-shell]:where(:not([data-appearance="light"])) .cv-onboarding-card {
    background: rgba(20, 20, 30, 0.55);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 20px 60px rgba(0, 0, 0, 0.35);
  }
  [data-commercial-shell][data-appearance="dark"] .cv-onboarding-card {
    background: rgba(20, 20, 30, 0.55);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 20px 60px rgba(0, 0, 0, 0.35);
  }
  @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
    .cv-onboarding-card {
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
    }
  }
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .cv-onboarding-card { background: rgba(255, 255, 255, 0.95); }
    [data-commercial-shell]:where(:not([data-appearance="light"])) .cv-onboarding-card,
    [data-commercial-shell][data-appearance="dark"] .cv-onboarding-card {
      background: rgba(20, 20, 30, 0.95);
    }
  }

  .cv-onboarding-icon {
    width: 64px;
    height: 64px;
    border-radius: var(--cv-radius-lg);
    display: grid;
    place-items: center;
    margin-bottom: 22px;
    background: rgba(15, 118, 110, 0.14);
    border: 1px solid rgba(15, 118, 110, 0.22);
  }
  [data-commercial-shell]:where(:not([data-appearance="light"])) .cv-onboarding-icon {
    background: rgba(45, 212, 191, 0.14);
    border: 1px solid rgba(45, 212, 191, 0.24);
  }
  [data-commercial-shell][data-appearance="dark"] .cv-onboarding-icon {
    background: rgba(45, 212, 191, 0.14);
    border: 1px solid rgba(45, 212, 191, 0.24);
  }

  .cv-onboarding-eyebrow {
    font-size: var(--cv-text-eyebrow);
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--cv-teal);
    margin: 0 0 8px;
  }
  .cv-onboarding-title {
    font-size: var(--cv-text-display);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--cv-teal);
    margin: 0 0 12px;
  }
  .cv-onboarding-title-sm {
    font-size: var(--cv-text-title);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: var(--cv-text);
    margin: 0 0 4px;
  }
  .cv-onboarding-body {
    font-size: var(--cv-text-body);
    line-height: 1.55;
    color: var(--cv-text-secondary);
    margin: 0 0 8px;
  }

  .cv-onboarding-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid var(--cv-border);
    background: var(--cv-surface);
    color: var(--cv-text);
    font-size: var(--cv-text-support);
    font-weight: 700;
    cursor: pointer;
    transition: background-color var(--cv-motion-base) ease, border-color var(--cv-motion-base) ease;
  }
  .cv-onboarding-chip[data-active="true"] {
    background: color-mix(in srgb, var(--cv-teal) 16%, var(--cv-surface));
    border-color: color-mix(in srgb, var(--cv-teal) 55%, transparent);
    color: var(--cv-teal);
  }

  .cv-onboarding-cta {
    width: 100%;
    min-height: 50px;
    border: 1px solid rgba(15, 118, 110, 0.45);
    border-radius: var(--cv-radius-md);
    padding: 14px 18px;
    font-size: 15px;
    font-weight: 800;
    color: var(--cv-text);
    background: rgba(15, 118, 110, 0.20);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
    cursor: pointer;
    transition: transform var(--cv-motion-base) ease, box-shadow var(--cv-motion-base) ease;
  }
  [data-commercial-shell]:where(:not([data-appearance="light"])) .cv-onboarding-cta {
    border-color: rgba(45, 212, 191, 0.45);
    background: rgba(45, 212, 191, 0.18);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }
  [data-commercial-shell][data-appearance="dark"] .cv-onboarding-cta {
    border-color: rgba(45, 212, 191, 0.45);
    background: rgba(45, 212, 191, 0.18);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }
  @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
    .cv-onboarding-cta {
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
    }
  }
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .cv-onboarding-cta { background: var(--cv-teal); border-color: var(--cv-teal); color: #ffffff; }
  }
  .cv-onboarding-cta:hover {
    transform: scale(1.02);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 24px rgba(15, 118, 110, 0.45);
  }
  [data-commercial-shell]:where(:not([data-appearance="light"])) .cv-onboarding-cta:hover,
  [data-commercial-shell][data-appearance="dark"] .cv-onboarding-cta:hover {
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 24px rgba(45, 212, 191, 0.45);
  }
  .cv-onboarding-cta:active { transform: scale(0.98); }

  .cv-onboarding-secondary {
    width: 100%;
    min-height: 44px;
    margin-top: 8px;
    border: 1px solid var(--cv-border);
    border-radius: var(--cv-radius-md);
    background: transparent;
    color: var(--cv-text-secondary);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  @media (prefers-reduced-motion: reduce) {
    .cv-onboarding-glow-a, .cv-onboarding-glow-b { animation: none; }
    .cv-onboarding-cta { transition: none; }
  }
`
