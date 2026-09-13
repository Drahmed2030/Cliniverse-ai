'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

/** Historical evidence only: this component cannot grant eligibility or write scores. */
export default function EcgSavedHistory({ owner, refresh }: { owner: string; refresh: number }) {
  const [rows, setRows] = useState<Array<{id:string;at:string;score:number}>>([])
  const [state, setState] = useState<'loading'|'ready'|'error'>('loading')
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const identity = await supabase.auth.getUser()
      if (identity.error || identity.data.user?.id !== owner) throw Error('Account changed')
      const result = await supabase.from('ecg_competency_attempts').select('event_id,created_at,evidence,decision_receipt').eq('user_id', owner).eq('case_id', 'ecg-governed-case-001').order('created_at', { ascending: false }).limit(20)
      if (result.error) throw Error('History unavailable')
      const current = await supabase.auth.getUser()
      if (current.error || current.data.user?.id !== owner) throw Error('Account changed')
      const items = result.data.flatMap(row => {
        const score = row.evidence?.result?.overallScore
        return row.decision_receipt?.decision === 'LEARNER_ELIGIBLE' && typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1
          ? [{id:row.event_id,at:row.created_at,score}] : []
      })
      if (!cancelled) { setRows(items); setState('ready') }
    })().catch(() => { if (!cancelled) setState('error') })
    return () => { cancelled = true }
  }, [owner, refresh])
  return <section aria-labelledby="saved-ecg-title">
    <h3 id="saved-ecg-title">ECG · Saved answers</h3>
    <p role="status">{state === 'loading' ? 'Loading ECG history…' : state === 'error' ? 'ECG history could not be loaded. Use Refresh history to retry.' : rows.length ? `${rows.length} recent saved answers.` : 'No saved ECG answers yet.'}</p>
    <ul style={{listStyle:'none',padding:0}}>{rows.map(row => <li key={row.id} style={{padding:'12px 0',borderBottom:'1px solid var(--cv-border)'}}>
      <strong>Record 10 · Rhythm recognition</strong><br/>
      <time dateTime={row.at}>{new Date(row.at).toLocaleString()}</time> · {Math.round(row.score*100)}% for this question
    </li>)}</ul>
    <p style={{color:'var(--cv-text-secondary)'}}>Saved educational answers are separate from lesson completion and clinical certification.</p>
  </section>
}
