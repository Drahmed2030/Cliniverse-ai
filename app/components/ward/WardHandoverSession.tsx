'use client'

import { useEffect, useRef, useState } from 'react'
import AuthGate from '../auth/AuthGate'
import { supabase } from '../../supabase'
import { HANDOVER_SOURCE_V1 } from '../../lib/ward/handoverContentV1'
import { checkpointHandover, restoreHandover } from '../../lib/ward/handoverCheckpoint'
import { handoverAccountRepository } from '../../lib/ward/handoverAccountRepository'
import { advanceHandover, createHandoverSession, draftHandover, type HandoverAction } from '../../lib/ward/handoverSession'

const card = { background: 'var(--cv-surface)', color: 'var(--cv-text)', border: '1px solid var(--cv-border)', borderRadius: 20, padding: 20, marginBottom: 16 }
const button = { minHeight: 44, padding: '10px 16px', borderRadius: 12, border: '1px solid var(--cv-border)', background: 'var(--cv-surface-elevated)', color: 'var(--cv-text)', cursor: 'pointer' }
const labels = { brief: 'Brief', review: 'Review the record', gaps: 'Check the gaps', handover: 'Draft the handover', complete: 'Session summary' }
export default function WardHandoverSession() {
  return <AuthGate allowGuest={false}>{user => <AccountSession key={user.id} owner={user.id} />}</AuthGate>
}
const repository=handoverAccountRepository(supabase)
function AccountSession({owner}:{owner:string}) {
  const [session, setSession] = useState(() => createHandoverSession(HANDOVER_SOURCE_V1))
  const [busy,setBusy]=useState(true)
  const [ready,setReady]=useState(false)
  const [saveStatus,setSaveStatus]=useState('Restoring your saved practice…')
  const [retry,setRetry]=useState(0)
  const sessionId=useRef('')
  const mounted=useRef(false)
  const pending=useRef(false)
  useEffect(()=>{
    let active=true; mounted.current=true
    repository.latest(owner).then(row=>{
      if(!active)return
      if(row){setSession(restoreHandover(owner,row));sessionId.current=row.session_id;setSaveStatus('Restored your saved practice on its original content version.')}
      else {sessionId.current=crypto.randomUUID();setSaveStatus('No saved practice yet. Save before leaving to resume later.')}
      setReady(true)
    }).catch(()=>{if(active)setSaveStatus('Saved practice could not be restored. Retry before starting; your history has not been replaced.')}).finally(()=>{if(active)setBusy(false)})
    return()=>{active=false;mounted.current=false}
  },[owner,retry])
  async function save() {
    if(pending.current || !ready)return
    pending.current=true;setBusy(true);setSaveStatus('Saving your practice…')
    try{await repository.save(owner,checkpointHandover(owner,sessionId.current,session));if(mounted.current)setSaveStatus('Saved to your account. You can leave and resume this practice.')}
    catch{if(mounted.current)setSaveStatus('Save not confirmed. Keep this page open and retry. If another tab changed this session, reload to restore it.')}
    finally{pending.current=false;if(mounted.current)setBusy(false)}
  }
  const [confirmed, setConfirmed] = useState(false)
  const draft = draftHandover(session)
  const step = Object.keys(labels).indexOf(session.stage)
  function act(action: HandoverAction) {
    if(busy || !ready)return
    setSaveStatus('Unsaved changes. Save your practice before leaving.')
    const at = new Date().toISOString()
    setSession(current => {
      try { return advanceHandover(current, action, at) } catch { return current }
    })
  }
  return <section aria-labelledby="ward-handover-title" style={card}>
    <p role="status" aria-live="polite">{saveStatus}</p>
    {!ready && !busy && <button type="button" style={button} onClick={()=>{setBusy(true);setRetry(value=>value+1)}}>Retry restoring practice</button>}
    <fieldset disabled={busy || !ready} style={{border:0,padding:0,margin:0,minWidth:0}}>
    <p style={{ color: 'var(--cv-text-secondary)', marginTop: 0 }}>WARD · INTERACTIVE REVIEW</p>
    <h2 id="ward-handover-title">A clearer handover</h2>
    <p>Practise separating recorded facts from missing information in one fictional case. No treatment decisions or patient outcomes are generated.</p>
    <p role="status" aria-live="polite">Step {Math.min(step + 1, 4)} of 4 · {labels[session.stage]}</p>
    <progress aria-label="Handover session steps" value={step} max={4} style={{ width: '100%' }} />
    {session.stage === 'brief' && <><p>{draft.situation}</p><p>Review the source snapshot, identify what is unknown, then prepare a structured handover.</p><button type="button" style={button} onClick={() => act('start')}>Start handover session</button></>}
    {session.stage === 'review' && <><h3>Supplied record</h3><p>{draft.situation}</p><p>{draft.background}</p><p>{draft.recorded}</p><p>{draft.followUp}</p><p>These are existing fictional case notes, not current observations or new recommendations.</p><button type="button" style={button} onClick={() => act('review-record')}>I have reviewed the snapshot</button></>}
    {session.stage === 'gaps' && <><h3>No current observations are supplied. How should the handover describe this?</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}><button type="button" style={button} onClick={() => act('assume-stable')}>Assume stable because no alert is shown</button><button type="button" style={button} onClick={() => act('mark-unknown')}>Mark current status as unknown</button></div><p role="status" aria-live="polite">{session.feedback}</p></>}
    {(session.stage === 'handover' || session.stage === 'complete') && <><h3>Draft handover · not sent</h3><dl>{Object.entries(draft).map(([key, value]) => <div key={key} style={{ marginBottom: 12 }}><dt style={{ fontWeight: 700, textTransform: 'capitalize' }}>{key === 'followUp' ? 'Pending items from the record' : key}</dt><dd style={{ margin: '4px 0', lineHeight: 1.6 }}>{value}</dd></div>)}</dl></>}
    {session.stage === 'handover' && <><label style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44, marginBottom: 12 }}><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />I have checked the draft against the snapshot and kept missing information explicit.</label><button type="button" style={button} disabled={!confirmed} onClick={() => act('complete-handover')}>Finish practice</button></>}
    {session.stage === 'complete' && <><h3>What you practised</h3><p>You reviewed the source, identified a documentation gap, and prepared a draft. {session.events.some(event => event.action === 'assume-stable') ? 'You also reconsidered an unsupported assumption before completing the draft.' : 'You kept the missing current status explicit.'}</p><p>No score, certification, discharge or real handover was recorded.</p><button type="button" style={button} onClick={() => { setSession(createHandoverSession(HANDOVER_SOURCE_V1)); sessionId.current=crypto.randomUUID();setConfirmed(false);setSaveStatus('New practice not saved. Save before leaving.') }}>Start a new practice</button></>}
    {session.events.length > 0 && <details><summary style={{ minHeight: 44, cursor: 'pointer', paddingTop: 12 }}>Your session timeline · {session.events.length} actions</summary><ol>{session.events.map((event, index) => <li key={index}>{event.label} · <time dateTime={event.at}>{new Date(event.at).toLocaleTimeString()}</time></li>)}</ol></details>}
    <button type="button" style={button} onClick={save}>Save practice to account</button>
    <p style={{ color: 'var(--cv-text-secondary)', fontSize: '0.875rem' }}>Review preview · Saved checkpoints resume here on the same content version. Unsaved changes are lost when you leave. This practice is not a competency score and is not yet included in Progress.</p>
    </fieldset>
  </section>
}
