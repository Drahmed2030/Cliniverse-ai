'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import './review.css'
import { ECG_RECORD10_QUESTION } from '../../lib/competency/ecgRecord10Question'
import AuthGate from '../../components/auth/AuthGate'
import { supabase } from '../../supabase'
import { matchesReviewedEcgPdf, RECORD10_REVIEW_PDF } from '../../lib/clinicalIntelligence/ecgReviewedPdfIdentity'

export default function EcgAccountReview() {
  return <AuthGate allowGuest={false}>{user => <Review key={user.id} owner={user.id} />}</AuthGate>
}
function Review({ owner }: { owner: string }) {
  const currentUrl = useRef('')
  const generation = useRef({ epoch: 0, active: false })
  const [allowed, setAllowed] = useState(false)
  const [status, setStatus] = useState('Checking review access…')
  const [pdf, setPdf] = useState('')
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [savingConfigured, setSavingConfigured] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [historyState, setHistoryState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [history, setHistory] = useState<Array<{eventId:string;createdAt:string;score:number}>>([])
  const attempt = useRef('')
  const [locked, setLocked] = useState(false)
  const loadHistory = useCallback(async () => {
    setHistoryState('loading')
    try {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user.id !== owner) throw Error('Account changed')
    const response = await fetch('/api/ecg-review-attempt', { headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: 'no-store' })
    if (!response.ok) throw Error('History unavailable')
    const body = await response.json()
    if (generation.current.active) { setHistory(body.attempts); setSavingConfigured(body.savingConfigured === true); setHistoryState('ready') }
    } catch (error) { if (generation.current.active) setHistoryState('error'); throw error }
  }, [owner])
  async function saveAnswer() {
    if (!savingConfigured || !confirmed || !pdf || !answer || saving || saved) return
    setSaving(true); setLocked(true)
    try {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user.id !== owner) throw Error('Account changed')
      if (!attempt.current) attempt.current = crypto.randomUUID()
      const response = await fetch('/api/ecg-review-attempt', { method: 'POST', headers: { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({
        reviewedPdfSha256: RECORD10_REVIEW_PDF.sha256, reviewContext: 'confirmed-external-iphone-xs-max-ios-18.7.10',
        submission: { attemptId: attempt.current, caseId: 'ecg-governed-case-001', rubricVersion: ECG_RECORD10_QUESTION.version, answers: [{ questionId: ECG_RECORD10_QUESTION.id, optionId: answer }] }
      }) })
      const result = await response.json()
      if (!response.ok || result.state !== 'saved') throw Error('Save not confirmed')
      if (!generation.current.active) return
      setSaved(true); setStatus('Result saved to your account.'); await loadHistory()
    } catch { if (generation.current.active) setStatus('Save or history refresh not confirmed. Retry the same answer, or reload to check history.') }
    finally { if (generation.current.active) setSaving(false) }
  }
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
      if (response.ok) void loadHistory().catch(() => {})
      setStatus(response.ok ? 'Select the reviewed PDF to begin. The file stays on this device.' : 'This page is restricted to the review account.')
    })().catch(() => { if (!cancelled) setStatus('Access could not be verified. Reload to retry.') })
    return () => { cancelled = true; lifecycle.active = false; lifecycle.epoch++; if (currentUrl.current) URL.revokeObjectURL(currentUrl.current) }
  }, [owner, loadHistory])
  async function selectFile(file?: File) {
    const epoch = (generation.current = { ...generation.current, epoch: generation.current.epoch + 1 }).epoch
    if (currentUrl.current) URL.revokeObjectURL(currentUrl.current)
    currentUrl.current = ''; setPdf(''); setAnswer(''); setRevealed(false); setConfirmed(false); setSaved(false); attempt.current = ''; setLocked(false)
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
    <header><p className="review-eyebrow">CLINIVERSE · ECG PRACTICE</p><h1>Read the tracing. Review your answer.</h1><p>Record 10 · 12 leads · 10 seconds</p></header>
    <p>Inspect the reviewed tracing and the accepted rhythm question. Save an educational answer using the previously confirmed review context when account saving is available.</p>
    <p role="status" className="review-status">{status}</p>
    {allowed && <>
      <label htmlFor="review-pdf">Reviewed file: {RECORD10_REVIEW_PDF.filename}</label>
      <input id="review-pdf" type="file" disabled={saving} accept="application/pdf,.pdf" onChange={e => void selectFile(e.target.files?.[0])} />
      {pdf && <>
        <p><a href={pdf} target="_blank" rel="noreferrer">Open verified PDF in a separate viewer</a></p>
        <object data={pdf} type="application/pdf" aria-label="Reviewed 12-lead ECG, four pages" style={{ width: '100%', height: '65vh', minHeight: 320 }}>
          <p>Your browser does not embed PDF files. Use the separate viewer link above.</p>
        </object>
        <section aria-labelledby="rhythm-question">
          <h2 id="rhythm-question">Accepted question · {ECG_RECORD10_QUESTION.prompt}</h2>
          <p>Accepted skill: sinus-rhythm-recognition. One question, weight 1. This records one educational rhythm answer; it is not a measure of clinical competence.</p>
          <fieldset disabled={saving || saved || locked}><legend>Select one answer</legend>
            {ECG_RECORD10_QUESTION.options.map(option => <label key={option.id} style={{ display: 'block', padding: 10 }}>
              <input type="radio" name="rhythm" checked={answer === option.id} onChange={() => { setAnswer(option.id); setRevealed(false) }} /> {option.label}
            </label>)}
          </fieldset>
          <label><input type="checkbox" checked={confirmed} disabled={saving || saved} onChange={e => setConfirmed(e.target.checked)} /> Use my previously confirmed review of this PDF on iPhone XS Max, iOS 18.7.10. This does not report a new device test.</label>
          <p role="status">{savingConfigured ? 'Account saving is configured.' : 'Account saving is currently unavailable. You can still review the tracing and interpretation.'}</p>
          <button className="review-primary" disabled={!savingConfigured || !answer || !confirmed || saving || saved} onClick={() => void saveAnswer()}>{saved ? 'Saved to account' : saving ? 'Saving…' : 'Save reviewed answer'}</button>
          <button disabled={!answer} onClick={() => setRevealed(true)}>Show reviewed interpretation</button>
          {revealed && <p role="status">The existing human review identifies sinus rhythm. Source: ECG Record 10 Human Clinical Attestation v1. This is feedback for reviewing the accepted question, not a saved result.</p>}
          <p>The final 106 ms remain unchanged and must not be used as a target morphology feature.</p>
        </section>
      </>}
    </>}
    <section aria-label="Saved ECG results"><h2>Saved ECG results</h2>{history.length ? history.map(row => <p key={row.eventId}>{new Date(row.createdAt).toLocaleString()} · {Math.round(row.score * 100)}% for this question</p>) : <p role="status">{historyState === 'loading' ? 'Loading your saved results…' : historyState === 'error' ? 'Saved results could not be loaded. Please retry.' : 'No saved ECG answers yet.'}</p>}<button onClick={() => void loadHistory().catch(() => setStatus('History unavailable. Retry.'))}>Refresh saved results</button></section>
    <style>{`.ecg-review input[type=file],.ecg-review button{display:block;min-height:44px;margin:12px 0;max-width:100%}.ecg-review :focus-visible{outline:3px solid var(--accent,#00897b);outline-offset:3px}.ecg-review fieldset{border:1px solid var(--border-color,#64748b);border-radius:12px}.ecg-review p,.ecg-review label{overflow-wrap:anywhere}`}</style>
  </main>
}
