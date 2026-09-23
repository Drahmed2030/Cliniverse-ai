'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import './ecg-workspace.css'
import AuthGate from '../../components/auth/AuthGate'
import { useAppearance } from '../../components/release/AppearanceSettings'
import { matchesReviewedEcgPdf } from '../../lib/clinicalIntelligence/ecgReviewedPdfIdentity'
import type { EcgLearnerAvailability } from '../../lib/competency/ecgLearnerAvailability'
import { NATIVE_SAFE_AREA_BOTTOM, NATIVE_SAFE_AREA_TOP } from '../../lib/nativeSafeArea'

// ECG v2 learner workspace. It only presents what the server-side availability decision allows (see
// lib/competency/ecgLearnerAvailability.ts). Held is the fail-closed state: no tracing, no interactive question, no
// reference answer. Ready shows the retained reviewed PDF after its exact size and SHA-256 are verified in the browser.
// Nothing here is saved, scored or recorded as progress, and no synthetic tracing is ever drawn.

const STAGES = ['Observe', 'Interpret', 'Review'] as const
type Stage = 0 | 1 | 2

export default function EcgLearnerWorkspace({ availability }: { availability: EcgLearnerAvailability }) {
  return <AuthGate allowGuest={false}>{() => <Workspace availability={availability} />}</AuthGate>
}

function Workspace({ availability }: { availability: EcgLearnerAvailability }) {
  const appearance = useAppearance()
  // Verification lives here so the status chip always reflects what is really on screen.
  const tracing = useVerifiedTracing(availability.state === 'ready' ? availability.artifact.url : null)
  const chip = availability.state !== 'ready' ? 'Case temporarily unavailable'
    : tracing.status === 'verified' ? 'Educational case'
    : tracing.status === 'failed' ? 'Case temporarily unavailable'
    : 'Preparing case'
  return (
    <main
      data-commercial-shell
      data-appearance={appearance}
      data-ecg-workspace
      data-state={availability.state}
      aria-labelledby="ecg-title"
      style={{ paddingTop: `max(18px, ${NATIVE_SAFE_AREA_TOP})`, paddingBottom: `max(32px, ${NATIVE_SAFE_AREA_BOTTOM})` }}
    >
      <div className="ecg-frame">
        <nav className="ecg-top" aria-label="ECG navigation">
          <Link className="ecg-back" href="/?view=learn">← Learn</Link>
          <span className="ecg-chip">{chip}</span>
        </nav>
        <header>
          <p className="ecg-eyebrow">ECG · RECORD 10</p>
          <h1 id="ecg-title" className="ecg-title">Interpret an ECG</h1>
          <p className="ecg-lead">One reviewed 12-lead recording and one approved question, for educational rhythm interpretation.</p>
        </header>
        {availability.state === 'ready' ? <ReadyBody availability={availability} tracing={tracing} /> : <HeldBody availability={availability} />}
      </div>
    </main>
  )
}

function HeldBody({ availability }: { availability: Extract<EcgLearnerAvailability, { state: 'held' }> }) {
  return (
    <div className="ecg-grid">
      <section className="ecg-media ecg-media-held" aria-labelledby="ecg-held-title">
        <div className="ecg-media-state">
          <h2 id="ecg-held-title">This tracing isn’t shown yet</h2>
          <p>This ECG is temporarily unavailable while its display is being verified. Cliniverse will not substitute a different tracing.</p>
          <p role="status">You can return to Learn and continue with another available activity.</p>
        </div>
      </section>
      <div className="ecg-side">
        <section className="ecg-panel" aria-labelledby="ecg-question-title">
          <h2 id="ecg-question-title">Practice question</h2>
          <p>{availability.question.prompt}</p>
          <p className="ecg-note">The question opens together with the tracing. It is a learning activity, not a measure of clinical competence.</p>
        </section>

      </div>
    </div>
  )
}

function ReadyBody({ availability, tracing }: { availability: Extract<EcgLearnerAvailability, { state: 'ready' }>; tracing: Tracing }) {
  const [stage, setStage] = useState<Stage>(0)
  const [answer, setAnswer] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)

  // Move focus to the new stage heading so keyboard and screen-reader users land on the new content.
  useEffect(() => {
    if (!moved.current) { moved.current = true; return }
    headingRef.current?.focus()
  }, [stage])

  const chosen = availability.options.find(option => option.id === answer)
  const matches = answer !== '' && answer === availability.review.correctOptionId

  return (
    <div className="ecg-grid">
      <section className="ecg-media" aria-label="ECG tracing">
        {tracing.status === 'verified' ? (
          <>
            <object className="ecg-tracing" data={tracing.url} type="application/pdf" aria-label="Reviewed 12-lead ECG, four pages">
              <p className="ecg-tracing-fallback">Your browser does not embed PDF files. Use the separate viewer link below.</p>
            </object>
            <p className="ecg-caption">Record 10 · 12 leads · 10 seconds. Calibration and timing are those of the reviewed file.</p>
            <p className="ecg-caption">The final 106 ms remain unchanged and must not be used as a target morphology feature.</p>
            <a className="ecg-viewer-link" href={tracing.url} target="_blank" rel="noreferrer">Open in a separate viewer</a>
          </>
        ) : tracing.status === 'verifying' || tracing.status === 'idle' ? (
          <div className="ecg-media-state"><p role="status">Verifying the reviewed file…</p></div>
        ) : (
          <div className="ecg-media-state">
            <h2>The reviewed file could not be verified</h2>
            <p role="status">Nothing is shown in its place, and the question stays closed.</p>
          </div>
        )}
      </section>

      <div className="ecg-side">
        <ol className="ecg-stages" aria-label="Stages">
          {STAGES.map((name, index) => <li key={name} aria-current={index === stage ? 'step' : undefined}>{index + 1}. {name}</li>)}
        </ol>

        {tracing.status !== 'verified' ? null : stage === 0 ? (
          <section className="ecg-panel" aria-labelledby="ecg-stage-title">
            <h2 id="ecg-stage-title" ref={headingRef} tabIndex={-1}>Observe</h2>
            <p>Study the full tracing before you choose. Nothing is timed.</p>
            <button type="button" className="ecg-cta" onClick={() => setStage(1)}>Continue to interpretation</button>
          </section>
        ) : stage === 1 ? (
          <section className="ecg-panel" aria-labelledby="ecg-stage-title">
            <h2 id="ecg-stage-title" ref={headingRef} tabIndex={-1}>Interpret</h2>
            <fieldset className="ecg-question">
              <legend>{availability.question.prompt}</legend>
              {availability.options.map(option => (
                <label key={option.id} className="ecg-option">
                  <input type="radio" name="ecg-rhythm" value={option.id} checked={answer === option.id} onChange={() => setAnswer(option.id)} />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
            <button type="button" className="ecg-cta" disabled={!chosen} onClick={() => setStage(2)}>Check my answer</button>
          </section>
        ) : (
          <section className="ecg-panel" aria-labelledby="ecg-stage-title">
            <h2 id="ecg-stage-title" ref={headingRef} tabIndex={-1}>Review</h2>
            <div className="ecg-result" role="status">
              <p>Your answer: {chosen?.label}. {matches ? 'This matches the approved reference answer.' : 'This differs from the approved reference answer.'}</p>
              <p>{availability.review.statement}</p>
            </div>
            <p className="ecg-note">Feedback only. This answer is not saved and does not change your progress.</p>
            <Link className="ecg-cta" href="/?view=learn">Back to Learn</Link>
          </section>
        )}
        <Evidence availability={availability} />
      </div>
    </div>
  )
}

type Tracing = { status: 'idle' } | { status: 'verifying' } | { status: 'failed' } | { status: 'verified'; url: string }

/** Fetch the governed artifact and verify its exact size and SHA-256 before anything is shown. Unverified bytes are never displayed. */
function useVerifiedTracing(source: string | null): Tracing {
  const [tracing, setTracing] = useState<Tracing>({ status: source ? 'verifying' : 'idle' })
  useEffect(() => {
    if (!source) return
    let cancelled = false
    let objectUrl = ''
    void (async () => {
      try {
        const response = await fetch(source, { cache: 'no-store' })
        if (!response.ok) throw new Error('unavailable')
        const bytes = await response.arrayBuffer()
        if (!await matchesReviewedEcgPdf(bytes)) throw new Error('mismatch')
        objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
        if (cancelled) { URL.revokeObjectURL(objectUrl); return }
        setTracing({ status: 'verified', url: objectUrl })
      } catch {
        if (!cancelled) setTracing({ status: 'failed' })
      }
    })()
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [source])
  return tracing
}
