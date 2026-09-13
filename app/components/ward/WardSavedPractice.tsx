'use client'
import { useEffect, useState } from 'react'
import AuthGate from '../auth/AuthGate'
import { supabase } from '../../supabase'
import { handoverAccountRepository } from '../../lib/ward/handoverAccountRepository'
import { restoreHandover } from '../../lib/ward/handoverCheckpoint'
import { scenarioFor } from '../../lib/ward/handoverScenarios'
import type { HandoverSession } from '../../lib/ward/handoverSession'

const repository = handoverAccountRepository(supabase)
const stages = { brief: 'Brief', review: 'Review the record', gaps: 'Check the gaps', handover: 'Draft the handover', complete: 'Practice completed' }
const button = { minHeight: 44, padding: '10px 16px', borderRadius: 12, border: '1px solid var(--cv-border)', background: 'var(--cv-surface-elevated)', color: 'var(--cv-text)', cursor: 'pointer' }

export default function WardSavedPractice({ onOpen }: { onOpen: () => void }) {
  return <AuthGate allowGuest={false}>{user => <SavedPractice key={user.id} owner={user.id} onOpen={onOpen} />}</AuthGate>
}

function SavedPractice({ owner, onOpen }: { owner: string; onOpen: () => void }) {
  const [session, setSession] = useState<HandoverSession | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    let active = true
    repository.latest(owner).then(row => {
      if (!active) return
      setSession(row ? restoreHandover(owner, row) : null)
      setStatus('ready')
    }).catch(() => { if (active) setStatus('error') })
    return () => { active = false }
  }, [owner, refresh])
  return <section aria-labelledby="ward-saved-title" aria-busy={status === 'loading'} style={{ padding: 20, marginBottom: 16, borderRadius: 22, border: '1px solid var(--cv-border)', background: 'var(--cv-surface)', color: 'var(--cv-text)' }}>
    <h2 id="ward-saved-title">Ward practice</h2>
    <p style={{ color: 'var(--cv-text-secondary)' }}>Your latest saved practice. This record does not award a competency score or certification.</p>
    <p role="status">{status === 'loading' ? 'Loading saved practice…' : status === 'error' ? 'Saved practice could not be loaded. Retry to check your account.' : session ? stages[session.stage] : 'No saved Ward practice yet.'}</p>
    {status === 'ready' && session && <><h3>{scenarioFor(session).title}</h3><p>{session.events.length} recorded actions · Version {scenarioFor(session).version}</p></>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <button type="button" style={button} onClick={onOpen}>{session?.stage === 'complete' ? 'Review Ward practice' : 'Open Ward practice'}</button>
      <button type="button" style={button} disabled={status === 'loading'} onClick={() => { setSession(null); setStatus('loading'); setRefresh(value => value + 1) }}>{status === 'error' ? 'Retry' : 'Refresh practice'}</button>
    </div>
  </section>
}
