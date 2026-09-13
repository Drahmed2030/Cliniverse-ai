'use client'
import { useEffect, useRef, useState } from 'react'
import AuthGate from '../auth/AuthGate'
import { supabase } from '../../supabase'
import { createEchoAccountEventRepository } from '../../lib/competency/echoAccountEventRepository'
import type { EchoCompetencyEvent } from '../../lib/competency/echoPersistenceContract'

const repository = createEchoAccountEventRepository(supabase)
type Cursor = { createdAt: string; eventId: string } | null
const labels: Record<string, string> = {
  'echo-a4c-view-identity-v1': 'A4C · View recognition',
  'echo-a4c-landmarks-v1': 'A4C · Anatomical landmarks',
}
export default function AssessmentHistory() {
  return <AuthGate allowGuest={false}>{user => <History key={user.id} owner={user.id} />}</AuthGate>
}
function History({ owner }: { owner: string }) {
  const [events, setEvents] = useState<EchoCompetencyEvent[]>([])
  const [cursor, setCursor] = useState<Cursor>(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const alive = useRef(false)
  const pending = useRef(false)
  useEffect(() => {
    alive.current = true
    let cancelled = false
    repository.historyPage(owner).then(page => {
      if (cancelled) return
      setEvents(page.events); setCursor(page.nextCursor); setError(false)
    }).catch(() => { if (!cancelled) setError(true) }).finally(() => { if (!cancelled) setBusy(false) })
    return () => { cancelled = true; alive.current = false }
  }, [owner, refresh])
  async function more() {
    if (pending.current || busy || !cursor) return
    pending.current = true; setBusy(true)
    try {
      const page = await repository.historyPage(owner, cursor)
      if (!alive.current) return
      setEvents(previous => [...previous, ...page.events.filter(event => !previous.some(row => row.eventId === event.eventId))])
      setCursor(page.nextCursor); setError(false)
    } catch { if (alive.current) setError(true) }
    finally { pending.current = false; if (alive.current) setBusy(false) }
  }
  async function exportHistory() {
    if (exporting) return
    setExporting(true); setExportStatus('Preparing your saved assessments…')
    try {
      const session = await supabase.auth.getSession()
      if (session.data.session?.user.id !== owner) throw new Error('Sign in again to export.')
      const response = await fetch('/api/learning-export', { headers: { Authorization: `Bearer ${session.data.session.access_token}` }, cache: 'no-store', signal: AbortSignal.timeout(30000) })
      if (!response.ok) throw new Error('Export unavailable. Please retry.')
      const blob = await response.blob()
      const current = await supabase.auth.getSession()
      if (!alive.current || current.data.session?.user.id !== owner) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a'); link.href = url; link.download = 'cliniverse-assessments-xapi.json'
      document.body.appendChild(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setExportStatus('Download requested. This file contains your account’s saved assessments.')
    } catch { if (alive.current) setExportStatus('Export unavailable. Your saved history is unchanged. Please retry.') }
    finally { if (alive.current) setExporting(false) }
  }
  return <section aria-labelledby="saved-assessments-title" style={{ marginBottom: 16, padding: 20, borderRadius: 22, border: '1px solid var(--cv-border)', background: 'var(--cv-surface)', color: 'var(--cv-text)' }}>
    <h2 id="saved-assessments-title" style={{ margin: '0 0 8px' }}>Saved assessments</h2>
    <p style={{ color: 'var(--cv-text-secondary)' }}>Your account’s assessment attempts. These results are separate from lesson completion and clinical certification.</p>
    <p role="status" aria-live="polite">{busy ? 'Loading assessment history…' : error ? 'History could not be fully loaded. Your saved attempts have not been removed.' : events.length ? `${events.length} saved Echo attempts shown.` : 'No saved Echo assessment attempts yet.'}</p>
    {events.length ? <ul style={{ listStyle: 'none', padding: 0 }}>{events.map(event => <li key={event.eventId} style={{ padding: '12px 0', borderBottom: '1px solid var(--cv-border)', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
      <span><strong>{labels[event.taskId] ?? 'Echo assessment'}</strong><br /><small style={{ color: 'var(--cv-text-secondary)' }}>Version {event.taskVersion} · <time dateTime={event.observedAt}>{new Date(event.observedAt).toLocaleString()}</time></small></span>
      <span>Score {event.normalizedScore}% · Confidence {event.confidence}/5</span>
    </li>)}</ul> : null}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <button type="button" disabled={busy} onClick={() => { setBusy(true); setRefresh(value => value + 1) }} style={buttonStyle}>Refresh history</button>
      <button type="button" disabled={exporting} onClick={exportHistory} style={buttonStyle}>{exporting ? 'Preparing export…' : 'Download assessments (xAPI)'}</button>
      {cursor ? <button type="button" disabled={busy} onClick={more} style={buttonStyle}>Load older attempts</button> : null}
    </div>
    <p role="status" aria-live="polite">{exportStatus}</p>
    <p style={{ color: 'var(--cv-text-secondary)', marginBottom: 0 }}>ECG scored history is not available yet. Viewing an ECG does not count as a scored assessment.</p>
  </section>
}
const buttonStyle = { minHeight: 44, borderRadius: 12, border: '1px solid var(--cv-border)', padding: '8px 14px', background: 'var(--cv-surface-elevated)', color: 'var(--cv-text)', cursor: 'pointer' } as const
