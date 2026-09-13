'use client'
import Link from 'next/link'
import { useState } from 'react'
import { preparationChecks, prepareReview, updatePreparation, type PreparationState } from '../../lib/ward/reviewPreparation'

const button = { minHeight: 44, padding: '10px 16px', borderRadius: 12, border: '1px solid var(--cv-border)', background: 'var(--cv-surface-elevated)', color: 'var(--cv-text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }
const card = { padding: 20, marginBottom: 16, borderRadius: 22, border: '1px solid var(--cv-border)', background: 'var(--cv-surface)', color: 'var(--cv-text)' }
export default function PracticeShift({ onWard, onProgress, onPathway }: { onWard: () => void; onProgress: () => void; onPathway: () => void }) {
  const [preparation, setPreparation] = useState<PreparationState>({ checked: [], prepared: false })
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
      <h2 id="review-preparation-title">Prepare a remote review request</h2>
      <p>Rehearse checking a request before a colleague reviews an ECG or Echo. This checklist uses no patient data and does not connect to a hospital.</p>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>Request preparation checks</legend>
        {preparationChecks.map(item => <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44, padding: '6px 0' }}>
          <input type="checkbox" checked={preparation.checked.includes(item.id)} onChange={event => setPreparation(current => updatePreparation(current, item.id, event.target.checked))} />{item.label}
        </label>)}
      </fieldset>
      <p role="status">{preparation.prepared ? 'Simulated request prepared. Nothing was sent, saved, or clinically approved.' : `${preparation.checked.length} of ${preparationChecks.length} preparation checks complete.`}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button type="button" style={button} disabled={preparation.checked.length !== preparationChecks.length || preparation.prepared} onClick={() => setPreparation(current => prepareReview(current))}>Prepare simulated request</button>
        <button type="button" style={button} onClick={() => setPreparation({ checked: [], prepared: false })}>Reset exercise</button>
        <button type="button" style={button} onClick={onPathway}>Open coordination practice · PRO</button>
      </div>
      <p style={{ color: 'var(--cv-text-secondary)' }}>Session-only exercise. Hospital access, examination delivery and urgent escalation are not active. The existing coordination workspace retains its subscription checks.</p>
    </section>
  </div>
}
