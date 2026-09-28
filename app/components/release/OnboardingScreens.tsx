'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppearance } from './AppearanceSettings'
import {
  NATIVE_SAFE_AREA_BOTTOM,
  NATIVE_SAFE_AREA_LEFT,
  NATIVE_SAFE_AREA_RIGHT,
  NATIVE_SAFE_AREA_TOP,
} from '../../lib/nativeSafeArea'

const PROOF = [
  { number: '01', term: 'Observe', text: 'Start with the tracing, cine or case — before the label.' },
  { number: '02', term: 'Commit', text: 'Choose the interpretation or next clinical step.' },
  { number: '03', term: 'Refine', text: 'Use reasoning and evidence to sharpen the next attempt.' },
]

const TOTAL_STEPS = 2

interface Props {
  onComplete: (startTrial: boolean) => void
}

export default function OnboardingScreens({ onComplete }: Props) {
  const appearance = useAppearance()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'none' | 'forward' | 'back'>('none')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const changed = useRef(false)

  useEffect(() => {
    if (!changed.current) return
    headingRef.current?.focus()
  }, [step])

  function go(next: number) {
    changed.current = true
    setDirection(next > step ? 'forward' : 'back')
    setStep(next)
  }

  const enter = () => onComplete(false)
  const openPlan = () => onComplete(true)

  return (
    <main
      data-commercial-shell
      data-appearance={appearance}
      data-commercial-onboarding
      aria-labelledby="onboarding-title"
      className="cv-onboarding"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        background: 'var(--cv-bg)',
        boxSizing: 'border-box',
        padding: `max(18px, ${NATIVE_SAFE_AREA_TOP}) max(20px, ${NATIVE_SAFE_AREA_RIGHT}) 0 max(20px, ${NATIVE_SAFE_AREA_LEFT})`,
      }}
    >
      <div className="cv-onboarding-frame">
        <header className="cv-onboarding-bar">
          <span className="cv-onboarding-wordmark">CLINIVERSE</span>
          {step === 0
            ? <button type="button" className="cv-onboarding-quiet" onClick={enter}>Skip</button>
            : <button type="button" className="cv-onboarding-quiet" onClick={() => go(0)}>Back</button>}
        </header>

        <div className="cv-onboarding-step" key={step} data-direction={direction}>
          {step === 0 ? (
            <>
              <div className="cv-onboarding-mark" aria-hidden="true"><span /></div>
              <p className="cv-onboarding-eyebrow">CLINICAL LEARNING · ONE SYSTEM</p>
              <h1 id="onboarding-title" className="cv-onboarding-title" ref={headingRef} tabIndex={-1}>
                <span>See the case.</span>
                <span>Read the signal.</span>
                <span>Make the decision.</span>
              </h1>
              <p className="cv-onboarding-body">
                ECG, Echo and clinical reasoning in one focused practice system built for deliberate learning.
              </p>
              <ol className="cv-onboarding-proof" aria-label="How practice works">
                {PROOF.map(item => (
                  <li key={item.term}>
                    <span className="cv-onboarding-number" aria-hidden="true">{item.number}</span>
                    <span>
                      <span className="cv-onboarding-term">{item.term}</span>
                      <span className="cv-onboarding-text">{item.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <p className="cv-onboarding-eyebrow">READY WHEN YOU ARE</p>
              <h1 id="onboarding-title" className="cv-onboarding-title" ref={headingRef} tabIndex={-1}>
                <span>Start with your next step.</span>
              </h1>
              <p className="cv-onboarding-body">
                Today keeps the next action clear. Learn holds your ECG, Echo and Ward practice. Progress shows what to revisit.
              </p>
            </>
          )}
        </div>

        <footer className="cv-onboarding-foot" style={{ paddingBottom: `max(20px, ${NATIVE_SAFE_AREA_BOTTOM})` }}>
          {step === 0 ? (
            <button type="button" className="cv-onboarding-cta" onClick={() => go(1)}>Continue</button>
          ) : (
            <>
              <button type="button" className="cv-onboarding-cta" onClick={enter}>Enter Cliniverse</button>
              <button type="button" className="cv-onboarding-secondary" onClick={openPlan}>See Cliniverse PRO options</button>
            </>
          )}
          <div role="group" aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`} className="cv-onboarding-progress">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <span key={index} aria-hidden="true" data-active={index === step} />
            ))}
          </div>
          {step === 0 ? <p className="cv-onboarding-tagline">Built for deliberate clinical practice.</p> : null}
        </footer>
      </div>

      <style>{CSS}</style>
    </main>
  )
}

const CSS = `
  .cv-onboarding-frame {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    gap: var(--cv-space-6);
    min-width: 0;
  }
  .cv-onboarding-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
  }
  .cv-onboarding-wordmark {
    font-size: var(--cv-text-support);
    font-weight: 800;
    letter-spacing: 0.16em;
  }
  .cv-onboarding-quiet {
    min-height: 44px;
    padding: 0 var(--cv-space-2);
    border: 0;
    background: transparent;
    color: var(--cv-text-secondary);
    font-size: var(--cv-text-support);
    font-weight: 700;
    cursor: pointer;
  }
  .cv-onboarding-step { min-width: 0; animation: cvOnboardingStepIn var(--cv-motion-base) ease-out both; }
  .cv-onboarding-step[data-direction="none"] { animation: none; }
  .cv-onboarding-step[data-direction="back"] { --cv-onboarding-shift: -16px; }
  .cv-onboarding-step[data-direction="forward"] { --cv-onboarding-shift: 16px; }
  @keyframes cvOnboardingStepIn {
    from { opacity: 0; transform: translateX(var(--cv-onboarding-shift, 16px)); }
    to { opacity: 1; transform: none; }
  }
  .cv-onboarding-mark {
    position: relative;
    width: 60px;
    height: 60px;
    margin-bottom: var(--cv-space-5);
    border-radius: var(--cv-radius-md);
    background: #0b0f19;
    border: 1px solid color-mix(in srgb, var(--cv-blue) 34%, var(--cv-border));
  }
  .cv-onboarding-mark::before {
    content: "";
    position: absolute;
    inset: 13px 14px 13px 12px;
    border: 5px solid var(--cv-blue);
    border-right-color: transparent;
    border-radius: 50%;
  }
  .cv-onboarding-mark::after {
    content: "";
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    right: 12px;
    bottom: 13px;
    background: var(--cv-violet);
  }
  .cv-onboarding-mark > span {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    right: 11px;
    top: 13px;
    background: #fff;
  }
  .cv-onboarding-eyebrow {
    margin: 0 0 var(--cv-space-4);
    color: var(--cv-blue);
    font-size: var(--cv-text-caption);
    font-weight: 800;
    letter-spacing: 0.1em;
  }
  .cv-onboarding-title {
    margin: 0 0 var(--cv-space-4);
    font-size: var(--cv-text-display);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -0.02em;
    overflow-wrap: break-word;
  }
  .cv-onboarding-title:focus { outline: none; }
  .cv-onboarding-title > span { display: block; }
  .cv-onboarding-body {
    max-width: 46ch;
    margin: 0;
    color: var(--cv-text-secondary);
    font-size: 1rem;
    line-height: 1.55;
  }
  .cv-onboarding-proof {
    margin: var(--cv-space-6) 0 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--cv-border);
  }
  .cv-onboarding-proof > li {
    display: grid;
    grid-template-columns: 2.25rem minmax(0, 1fr);
    gap: var(--cv-space-3);
    padding: var(--cv-space-4) 0;
    border-bottom: 1px solid var(--cv-border);
  }
  .cv-onboarding-number {
    padding-top: 0.15rem;
    color: color-mix(in srgb, var(--cv-teal) 74%, var(--cv-text));
    font-size: var(--cv-text-caption);
    font-weight: 800;
    letter-spacing: 0.06em;
    font-variant-numeric: tabular-nums;
  }
  .cv-onboarding-term,.cv-onboarding-text { display: block; overflow-wrap: break-word; }
  .cv-onboarding-term { font-size: var(--cv-text-body); font-weight: 800; line-height: 1.3; }
  .cv-onboarding-text { margin-top: var(--cv-space-1); color: var(--cv-text-secondary); font-size: var(--cv-text-body); line-height: 1.5; }
  .cv-onboarding-foot { display: grid; gap: var(--cv-space-3); margin-top: auto; padding-top: var(--cv-space-4); }
  @media (min-height: 600px) { .cv-onboarding-foot { position: sticky; bottom: 0; background: var(--cv-bg); } }
  .cv-onboarding-cta {
    width: 100%;
    min-height: 52px;
    padding: 14px var(--cv-space-5);
    border: 1px solid transparent;
    border-radius: var(--cv-radius-sm);
    background: var(--cv-blue);
    color: #fff;
    font-size: var(--cv-text-body);
    font-weight: 800;
    cursor: pointer;
  }
  .cv-onboarding-secondary {
    width: 100%;
    min-height: 44px;
    padding: var(--cv-space-2) var(--cv-space-4);
    border: 1px solid var(--cv-border);
    border-radius: var(--cv-radius-sm);
    background: var(--cv-surface-elevated);
    color: var(--cv-text);
    font-size: var(--cv-text-body);
    font-weight: 700;
    cursor: pointer;
  }
  .cv-onboarding-progress { display: flex; justify-content: center; gap: var(--cv-space-2); }
  .cv-onboarding-progress > span { width: 16px; height: 4px; border-radius: 999px; background: var(--cv-border); }
  .cv-onboarding-progress > span[data-active="true"] { width: 40px; background: var(--cv-blue); }
  .cv-onboarding-tagline { margin: 0; color: var(--cv-text-secondary); font-size: var(--cv-text-support); text-align: center; }
  @media (min-width: 700px) {
    .cv-onboarding-frame { gap: var(--cv-space-7); }
    .cv-onboarding-step { margin-top: auto; }
    .cv-onboarding-foot { margin-top: 0; margin-bottom: auto; }
    .cv-onboarding-title { font-size: clamp(2.5rem, 4.5vw, 3.5rem); }
  }
  @media (min-width: 700px) and (max-height: 900px) {
    .cv-onboarding-frame { gap: var(--cv-space-5); }
    .cv-onboarding-title { font-size: clamp(2.25rem, 4vw, 3rem); }
    .cv-onboarding-proof { margin-top: var(--cv-space-5); }
    .cv-onboarding-proof > li { padding: var(--cv-space-3) 0; }
  }
  @media (prefers-reduced-motion: reduce) { .cv-onboarding-step { animation: none; } }
`
