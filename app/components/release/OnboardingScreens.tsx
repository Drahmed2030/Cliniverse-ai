'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, Gift, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react'
import { useAppearance } from './AppearanceSettings'
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_LEFT,
  NATIVE_SAFE_AREA_RIGHT,
  NATIVE_SAFE_AREA_TOP,
} from '../../lib/nativeSafeArea'

interface OnboardingStep {
  icon: LucideIcon
  title: string
  body?: string
  bullets?: string[]
  cta: string
  secondary?: string
}

const STEPS: OnboardingStep[] = [
  {
    icon: Sparkles,
    title: 'Welcome to Cliniverse',
    body: 'Master clinical reasoning with interactive cases designed by clinicians.',
    cta: 'Next',
  },
  {
    icon: GraduationCap,
    title: 'Learn by doing, not memorizing',
    bullets: [
      'Ward Simulation — real clinical decisions, step by step',
      'ECG Challenge — 7 real ECG cases with multi-image views',
      'Echo Studies — real cardiac ultrasound with guided assessment',
      'Code Lab — 12 lessons (BLS + ACLS)',
    ],
    cta: 'Next',
  },
  {
    icon: Gift,
    title: 'Start with 7 days free',
    body: 'Full access. No commitment. Cancel anytime.',
    bullets: [
      'All Ward, ECG, Echo, and Code Lab cases',
      'Progress tracking across every case',
      'Weekly new content',
    ],
    cta: 'Start my free trial →',
    secondary: 'Maybe later',
  },
]

interface Props {
  onComplete: (startTrial: boolean) => void
}

export default function OnboardingScreens({ onComplete }: Props) {
  const appearance = useAppearance()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Icon = current.icon

  function next() {
    if (isLast) { onComplete(true); return }
    setDirection(1)
    setStep(s => s + 1)
  }

  function back() {
    if (step === 0) return
    setDirection(-1)
    setStep(s => s - 1)
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

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36, marginBottom: 8 }}>
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          style={{
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 999,
            border: '1px solid var(--cv-border)',
            background: 'var(--cv-surface)',
            color: 'var(--cv-text-secondary)',
            cursor: step === 0 ? 'default' : 'pointer',
            opacity: step === 0 ? 0 : 1,
            pointerEvents: step === 0 ? 'none' : 'auto',
            transition: 'opacity 200ms ease',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <div role="group" aria-label={`Step ${step + 1} of ${STEPS.length}`} style={{ display: 'flex', gap: 7 }}>
          {STEPS.map((_, i) => (
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
                transition: 'background-color 250ms ease',
              }}
            />
          ))}
        </div>

        {!isLast ? (
          <button
            type="button"
            onClick={() => onComplete(false)}
            style={{
              minHeight: 36,
              padding: '0 4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--cv-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Skip
          </button>
        ) : (
          <div style={{ width: 36 }} aria-hidden="true" />
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="cv-onboarding-card"
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          margin: 'auto',
          width: '100%',
          maxWidth: 440,
          borderRadius: 28,
          padding: '32px 26px',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction > 0 ? 36 : -36, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -36 : 36, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div
              aria-hidden="true"
              className="cv-onboarding-icon"
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                display: 'grid',
                placeItems: 'center',
                marginBottom: 22,
              }}
            >
              <Icon size={30} color="var(--cv-teal)" strokeWidth={2} />
            </div>

            <h1
              id="onboarding-title"
              style={{
                fontSize: 28,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'var(--cv-teal)',
                margin: '0 0 12px',
              }}
            >
              {current.title}
            </h1>

            {current.body ? (
              <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--cv-text-secondary)', margin: '0 0 8px' }}>
                {current.body}
              </p>
            ) : null}

            {current.bullets ? (
              <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {current.bullets.map(bullet => (
                  <li key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        marginTop: 1,
                        borderRadius: 999,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'var(--cv-nav-selected)',
                        color: 'var(--cv-teal)',
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--cv-text)' }}>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div style={{ marginTop: 26 }}>
          <button type="button" onClick={next} className="cv-onboarding-cta">
            {current.cta}
          </button>
          {current.secondary ? (
            <button
              type="button"
              onClick={() => onComplete(false)}
              style={{
                width: '100%',
                marginTop: 6,
                border: 'none',
                background: 'transparent',
                color: 'var(--cv-text-secondary)',
                fontSize: 13,
                fontWeight: 650,
                padding: '10px 8px 2px',
                cursor: 'pointer',
              }}
            >
              {current.secondary}
            </button>
          ) : null}
        </div>
      </motion.div>

      <style>{CSS}</style>
    </main>
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

  .cv-onboarding-icon {
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

  .cv-onboarding-card {
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

  .cv-onboarding-cta {
    width: 100%;
    min-height: 50px;
    border: 1px solid rgba(15, 118, 110, 0.45);
    border-radius: 16px;
    padding: 14px 18px;
    font-size: 15px;
    font-weight: 800;
    color: var(--cv-text);
    background: rgba(15, 118, 110, 0.20);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
    cursor: pointer;
    transition: transform 180ms ease, box-shadow 180ms ease;
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

  @media (prefers-reduced-motion: reduce) {
    .cv-onboarding-glow-a, .cv-onboarding-glow-b { animation: none; }
    .cv-onboarding-cta { transition: none; }
  }
`
