'use client'
import Link from 'next/link'
import { useState } from 'react'
import { preparationChecks } from '../../lib/ward/reviewPreparation'

import { reviewRequests, createReviewWorklist, changeRequest, type ReviewRequestId } from '../../lib/ward/reviewWorklist'

import { reviewMediaBindings } from '../../lib/ward/reviewMediaBinding'

const button = { minHeight: 44, padding: '10px 16px', borderRadius: 12, border: '1px solid var(--cv-border)', background: 'var(--cv-surface-elevated)', color: 'var(--cv-text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }
const card = { padding: 20, marginBottom: 16, borderRadius: 22, border: '1px solid var(--cv-border)', background: 'var(--cv-surface)', color: 'var(--cv-text)' }
export default function PracticeShift({ onWard, onProgress, onPathway }: { onWard: () => void; onProgress: () => void; onPathway: () => void }) {
  const [requests, setRequests] = useState(createReviewWorklist)
  const [selected, setSelected] = useState<ReviewRequestId>('SIM-ECG-001')
  const preparation = requests[selected]
  const media = reviewMediaBindings[selected]
  const request = reviewRequests.find(item => item.id === selected)!
  return <div>
    <section aria-labelledby="practice-shift-title" style={card}>
      <p style={{ color: 'var(--cv-teal)' }}>LEARN · REVIEW PREVIEW</p>
      <h2 id="practice-shift-title">Your training shift</h2>
      <p>Choose one focused practice, save your work, then return to your learning record. These are separate educational cases.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button type="button" style={button} onClick={onWard}>Practise a Ward handover</button>
        <Link style={button} href="/labs/ecg-account-review">ECG · Rhythm recognition</Link>
        <Link style={button} href="/labs/echo-account-review">Echo · A4C recognition</Link>
        <button type="button" style={button} onClick={onProgress}>Review saved progress</button>
      </div>
      <p style={{ color: 'var(--cv-text-secondary)' }}>Ward offers three documentation tasks using one fictional case. ECG requires the reviewed PDF. Content availability follows its review status; no daily release schedule is promised.</p>
    </section>
    <section aria-labelledby="review-preparation-title" style={card}>
      <p style={{ color: 'var(--cv-blue)' }}>PRACTICAL WORKFLOW · SIMULATION</p>
      <h2 id="review-preparation-title">Remote review worklist</h2>
      <p>Two synthetic requests · Practice only · Not connected to a hospital</p>
      <div role="group" aria-label="Synthetic review requests" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {reviewRequests.map(item => <button type="button" key={item.id} style={button} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}>{item.id} · {requests[item.id].prepared ? 'Checklist rehearsed' : requests[item.id].checked.length ? 'In preparation' : 'Not started'}</button>)}
      </div>
      <h3>{request.modality} · {selected}</h3>
      <p>{request.purpose}</p>
      <dl><dt>Source</dt><dd>{request.source}</dd><dt>Examination file</dt><dd>{request.attachment}</dd><dt>Assigned clinician</dt><dd>None — simulation only</dd></dl>
      <aside aria-label="Linked educational media" style={{ padding: 16, border: '1px solid var(--cv-border)', borderRadius: 12, marginBottom: 12 }}>
        <h4 style={{ marginTop: 0 }}>{media.title}</h4>
        <p>{media.source} · {media.availability}</p>
        <p>{media.instruction}</p>
        <a style={button} href={media.href} target="_blank" rel="noopener noreferrer">Open {request.modality} educational viewer · new tab</a>
        <p style={{ color: 'var(--cv-text-secondary)' }}>Separate educational example, not this request’s examination. Opening it does not complete any checklist or verify this referral. Keep this tab open to retain your preparation.</p>
      </aside>
      <p>Checkboxes rehearse the workflow; they do not verify an examination, grant access, or assign a clinician. The ECG and Echo learning links above are separate cases.</p>
      <p>Rehearse checking a request before a colleague reviews an ECG or Echo. This checklist uses no patient data and does not connect to a hospital.</p>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>Request preparation checks</legend>
        {preparationChecks.map(item => <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44, padding: '6px 0' }}>
          <input type="checkbox" checked={preparation.checked.includes(item.id)} onChange={event => { const checked = event.target.checked; setRequests(current => changeRequest(current, selected, { kind: 'check', check: item.id, value: checked })) }} />{item.label}
        </label>)}
      </fieldset>
      <p role="status">{preparation.prepared ? 'Checklist rehearsal complete for this request. No examination was verified, sent, saved, or clinically approved.' : `${preparation.checked.length} of ${preparationChecks.length} preparation checks complete.`}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button type="button" style={button} disabled={preparation.checked.length !== preparationChecks.length || preparation.prepared} onClick={() => setRequests(current => changeRequest(current, selected, { kind: 'prepare' }))}>Prepare simulated request</button>
        <button type="button" style={button} onClick={() => setRequests(current => changeRequest(current, selected, { kind: 'reset' }))}>Reset exercise</button>
        <button type="button" style={button} onClick={onPathway}>Practise STEMI coordination · PRO</button>
      </div>
      <p style={{ color: 'var(--cv-text-secondary)' }}>Session-only exercise. Hospital access, examination delivery and urgent escalation are not active. Opens the existing QAPAS pathway simulation. Role changes and timeline events are fictional; no clinical activation occurs.</p>
    </section>
  </div>
}
