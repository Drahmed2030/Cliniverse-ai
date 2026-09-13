'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import AuthGate from '../../components/auth/AuthGate'
import ClinicalMediaPreview from '../../components/clinical-media/ClinicalMediaPreview'
import { supabase } from '../../supabase'
import { ECHO_A4C_COMPETENCY_TASKS } from '../../lib/competency/echoA4cCompetencyTasks'
import { prepareEchoAccountAttempt } from '../../lib/competency/echoAccountAttempt'
import { createEchoAccountEventRepository } from '../../lib/competency/echoAccountEventRepository'
import type { EchoCompetencyEvent } from '../../lib/competency/echoPersistenceContract'
import type { EchoAssessmentResponse } from '../../lib/competency/echoAssessmentContract'

const repository = createEchoAccountEventRepository(supabase)
export default function EchoAccountReview() {
  return <AuthGate allowGuest={false}>{user => <AccountReview key={user.id} user={user} />}</AuthGate>
}
function AccountReview({ user }: { user: User }) {
  const [access, setAccess] = useState<'loading' | 'allowed' | 'denied'>('loading')
  const [pending, setPending] = useState<readonly EchoCompetencyEvent[]>([])
  const [saved, setSaved] = useState<EchoCompetencyEvent[]>([])
  const [status, setStatus] = useState('Checking review access…')
  const [saving, setSaving] = useState(false)
  const [historyReady, setHistoryReady] = useState(false)
  const active = useRef(false)
  const busy = useRef(false)
  const generation = useRef(0)
  useEffect(() => {
    active.current = true
    const epoch = generation.current
    let cancelled = false
    async function restore() {
      const { data } = await supabase.auth.getSession()
      const response = await fetch('/api/echo-review-access', {
        headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}` },
        cache: 'no-store', signal: AbortSignal.timeout(15000),
      })
      if (cancelled) return
      if (!response.ok) { setAccess('denied'); setStatus('This preview is restricted to the review account.'); return }
      setAccess('allowed')
      setStatus('Loading saved assessment evidence…')
      const rows = await Promise.all(ECHO_A4C_COMPETENCY_TASKS.map(task => repository.loadLatest(user.id, {
        caseId: task.caseId, taskId: task.id, taskVersion: task.version,
      })))
      if (cancelled) return
      const restored = rows.filter((row): row is EchoCompetencyEvent => row !== null)
      setSaved(restored)
      setStatus(restored.length ? `Restored ${restored.length} saved assessment attempts from your account.` : 'No saved assessment attempts yet.')
    }
    void restore().catch(() => { if (!cancelled) setStatus('Account history could not be loaded. Reload to retry; no completion is assumed.') }).finally(() => { if (!cancelled) setHistoryReady(true) })
    return () => { cancelled = true; active.current = false; generation.current = epoch + 1 }
  }, [user.id])

  function assessment(responses: EchoAssessmentResponse[]) {
    if (busy.current) return
    try {
      const events = responses.map(response => {
        const task = ECHO_A4C_COMPETENCY_TASKS.find(task => task.id === response.taskId)
        if (!task) throw Error('Unknown task')
        return prepareEchoAccountAttempt({ userId: user.id, caseId: task.caseId, taskVersion: task.version, response })
      })
      setPending(events); setStatus('Assessment ready. Save these two attempts to your account.')
    } catch { setStatus('This assessment could not be prepared for saving. Check your answers and try again.') }
  }
  async function save() {
    if (busy.current || !pending.length) return
    busy.current = true; setSaving(true)
    const current = generation.current
    const attempts = [...pending]
    setStatus('Saving assessment attempts…')
    try {
      const rows = []
      for (const event of attempts) rows.push(await repository.save(event))
      if (!active.current || current !== generation.current) return
      setSaved(rows); setPending([]); setStatus(`Saved ${rows.length} assessment attempts to your account.`)
    } catch {
      if (active.current && current === generation.current) setStatus('Save not confirmed for all attempts. Retry the same attempts; confirmed rows will not be duplicated.')
    } finally {
      busy.current = false
      if (active.current && current === generation.current) setSaving(false)
    }
  }
  return <main style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
    <Link href="/">Back to Cliniverse</Link>
    <h1>Echo account review</h1>
    <p>Review-only A4C assessment. Saved attempts do not award XP or clinical certification.</p>
    <section aria-label="Account assessment history" style={{ padding: 16, border: '1px solid #64748b', borderRadius: 12, marginBottom: 24 }}>
      <p role="status" aria-live="polite">{status}</p>
      {saved.length ? <ul>{saved.map(row => <li key={row.eventId}>{row.taskId} · {row.normalizedScore}% · <time dateTime={row.observedAt}>{new Date(row.observedAt).toLocaleString()}</time></li>)}</ul> : null}
      {access === 'allowed' && pending.length ? <button type="button" disabled={saving} onClick={save} style={{ minHeight: 44, padding: '8px 16px' }}>{saving ? 'Saving…' : 'Save assessment attempts'}</button> : null}
    </section>
    {access === 'allowed' && historyReady ? <fieldset disabled={saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}><legend className="sr-only">Echo review activity</legend><ClinicalMediaPreview echoOnly onAssessment={assessment} /></fieldset> : null}
  </main>
}
