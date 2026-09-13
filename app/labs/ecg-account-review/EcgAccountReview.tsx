'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ECG_RECORD10_QUESTION } from '../../lib/competency/ecgRecord10Question'
import AuthGate from '../../components/auth/AuthGate'
import { supabase } from '../../supabase'
import { matchesReviewedEcgPdf, RECORD10_REVIEW_PDF } from '../../lib/clinicalIntelligence/ecgReviewedPdfIdentity'

export default function EcgAccountReview() {
  return <AuthGate allowGuest={false}>{user => <Review key={user.id} owner={user.id} />}</AuthGate>
}
function Review({ owner }: { owner: string }) {
  const [allowed, setAllowed] = useState(false)
  const [status, setStatus] = useState('Checking review access…')
  const [pdf, setPdf] = useState('')
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const currentUrl = useRef('')
  const generation = useRef({ epoch: 0, active: false })
  useEffect(() => {
    let cancelled = false
    const lifecycle = generation.current
    lifecycle.active = true
    void (async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user.id !== owner) throw Error('Account changed')
      // Same confirmed reviewer audience as the existing Echo review workspace.
      const response = await fetch('/api/echo-review-access', { headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: 'no-store', signal: AbortSignal.timeout(15000) })
      if (cancelled) return
      setAllowed(response.ok)
      setStatus(response.ok ? 'Select the reviewed PDF to begin. The file stays on this device.' : 'This page is restricted to the review account.')
    })().catch(() => { if (!cancelled) setStatus('Access could not be verified. Reload to retry.') })
    return () => { cancelled = true; lifecycle.active = false; lifecycle.epoch++; if (currentUrl.current) URL.revokeObjectURL(currentUrl.current) }
  }, [owner])
  async function selectFile(file?: File) {
    const epoch = ++generation.current.epoch
    if (currentUrl.current) URL.revokeObjectURL(currentUrl.current)
    currentUrl.current = ''; setPdf(''); setAnswer(''); setRevealed(false)
    if (!file) { setStatus('No file selected.'); return }
    setStatus('Verifying the reviewed file…')
    try {
      if (file.size !== RECORD10_REVIEW_PDF.bytes) throw Error('Wrong file')
      const bytes = await file.arrayBuffer()
      if (!await matchesReviewedEcgPdf(bytes)) throw Error('Wrong file')
      if (!generation.current.active || epoch !== generation.current.epoch) return
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      currentUrl.current = url; setPdf(url)
      setStatus('Verified: this is the previously reviewed four-page PDF. Viewing does not record a score.')
    } catch { if (generation.current.active && epoch === generation.current.epoch) setStatus('This file does not match the reviewed PDF, or could not be read. Select the original review file.') }
  }
  return <main className="ecg-review" style={{ maxWidth: 1100, margin: '0 auto', padding: 24, color: 'var(--text-primary)', lineHeight: 1.6 }}>
    <Link href="/">Back to Cliniverse</Link>
    <h1>ECG · Record 10 review</h1>
    <p>Inspect the reviewed tracing and the accepted rhythm question. Assessment scoring is not enabled.</p>
    <p role="status">{status}</p>
    {allowed && <>
      <label htmlFor="review-pdf">Reviewed file: {RECORD10_REVIEW_PDF.filename}</label>
      <input id="review-pdf" type="file" accept="application/pdf,.pdf" onChange={e => void selectFile(e.target.files?.[0])} />
      {pdf && <>
        <p><a href={pdf} target="_blank" rel="noreferrer">Open verified PDF in a separate viewer</a></p>
        <object data={pdf} type="application/pdf" aria-label="Reviewed 12-lead ECG, four pages" style={{ width: '100%', height: '65vh', minHeight: 320 }}>
          <p>Your browser does not embed PDF files. Use the separate viewer link above.</p>
        </object>
        <section aria-labelledby="rhythm-question">
          <h2 id="rhythm-question">Accepted question · {ECG_RECORD10_QUESTION.prompt}</h2>
          <p>Accepted skill: sinus-rhythm-recognition. One question, weight 1. Scoring and account saving are not enabled for this review.</p>
          <fieldset><legend>Select one answer</legend>
            {ECG_RECORD10_QUESTION.options.map(option => <label key={option.id} style={{ display: 'block', padding: 10 }}>
              <input type="radio" name="rhythm" checked={answer === option.id} onChange={() => { setAnswer(option.id); setRevealed(false) }} /> {option.label}
            </label>)}
          </fieldset>
          <button disabled={!answer} onClick={() => setRevealed(true)}>Show reviewed interpretation</button>
          {revealed && <p role="status">The existing human review identifies sinus rhythm. Source: ECG Record 10 Human Clinical Attestation v1. This is feedback for reviewing the accepted question, not a saved result.</p>}
          <p>The final 106 ms remain unchanged and must not be used as a target morphology feature.</p>
        </section>
      </>}
    </>}
    <style>{`.ecg-review input[type=file],.ecg-review button{display:block;min-height:44px;margin:12px 0;max-width:100%}.ecg-review :focus-visible{outline:3px solid var(--accent,#00897b);outline-offset:3px}.ecg-review fieldset{border:1px solid var(--border-color,#64748b);border-radius:12px}.ecg-review p,.ecg-review label{overflow-wrap:anywhere}`}</style>
  </main>
}
