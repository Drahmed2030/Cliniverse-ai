'use client'

import { useState } from 'react'
import type { CardiologyCase, HandoverRecord } from '../../../lib/cardiology'
import { pathwayLabels } from './labels'
import { CARDIOLOGY_COLORS as C, compactButtonStyle, fieldStyle, labelStyle, panelStyle } from './styles'

interface StructuredHandoverProps {
  cases: CardiologyCase[]
  handovers: HandoverRecord[]
  onSave: (record: Omit<HandoverRecord, 'updatedAt'>) => void
}

interface HandoverEditorProps {
  selectedCase: CardiologyCase
  initialRecord?: HandoverRecord
  onSave: (record: Omit<HandoverRecord, 'updatedAt'>) => void
}

function HandoverEditor({ selectedCase, initialRecord, onSave }: HandoverEditorProps) {
  const [note, setNote] = useState(initialRecord?.note ?? '')
  const [pendingReviewed, setPendingReviewed] = useState(initialRecord?.pendingReviewed ?? false)
  const [ownerConfirmed, setOwnerConfirmed] = useState(initialRecord?.ownerConfirmed ?? false)
  const [simulationConfirmed, setSimulationConfirmed] = useState(initialRecord?.simulationConfirmed ?? false)
  const [message, setMessage] = useState('')
  const ready = note.trim().length > 0 && pendingReviewed && ownerConfirmed && simulationConfirmed

  const handleSave = () => {
    onSave({
      caseId: selectedCase.id,
      note: note.trim(),
      pendingReviewed,
      ownerConfirmed,
      simulationConfirmed,
      ready,
    })
    setMessage(ready
      ? 'Handover saved locally and marked ready for the next simulated shift.'
      : 'Draft saved locally. Complete every confirmation to mark it handover ready.')
  }

  return (
    <div style={panelStyle}>
      <div style={{ borderRadius: 12, background: C.elevated, padding: 12, color: C.sub, fontSize: 11, lineHeight: 1.55 }}>
        {selectedCase.location} · {selectedCase.shiftOwner}<br />{selectedCase.summary}
      </div>

      <label htmlFor={`handover-note-${selectedCase.id}`} style={{ ...labelStyle, marginTop: 14 }}>Operational handover note</label>
      <textarea
        id={`handover-note-${selectedCase.id}`}
        value={note}
        onChange={event => setNote(event.target.value)}
        rows={5}
        maxLength={600}
        placeholder="Use fictional operational details only. Do not enter real patient data."
        style={{ ...fieldStyle, resize: 'vertical', minHeight: 120 }}
      />

      <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
        <label style={{ ...compactButtonStyle, display: 'flex', alignItems: 'center', gap: 10, color: pendingReviewed ? C.teal : C.sub }}>
          <input type="checkbox" checked={pendingReviewed} onChange={event => setPendingReviewed(event.target.checked)} />
          Pending simulated items reviewed
        </label>
        <label style={{ ...compactButtonStyle, display: 'flex', alignItems: 'center', gap: 10, color: ownerConfirmed ? C.teal : C.sub }}>
          <input type="checkbox" checked={ownerConfirmed} onChange={event => setOwnerConfirmed(event.target.checked)} />
          Next simulated owner confirmed
        </label>
        <label style={{ ...compactButtonStyle, display: 'flex', alignItems: 'center', gap: 10, color: simulationConfirmed ? C.teal : C.sub }}>
          <input type="checkbox" checked={simulationConfirmed} onChange={event => setSimulationConfirmed(event.target.checked)} />
          No real patient information entered
        </label>
      </div>

      <button type="button" onClick={handleSave} style={{ ...compactButtonStyle, width: '100%', marginTop: 12, background: ready ? '#0F766E' : C.elevated, color: ready ? '#FFFFFF' : C.teal }}>
        Save handover locally
      </button>
      <div aria-live="polite" style={{ color: message ? C.teal : C.sub, fontSize: 11, lineHeight: 1.5, marginTop: 10 }}>
        {message || 'A handover becomes ready only after a note and all three confirmations.'}
      </div>
    </div>
  )
}

export default function StructuredHandover({ cases, handovers, onSave }: StructuredHandoverProps) {
  const [caseId, setCaseId] = useState(cases[0]?.id ?? '')
  const selectedCase = cases.find(item => item.id === caseId)
  const initialRecord = handovers.find(item => item.caseId === caseId)

  return (
    <section aria-labelledby="handover-title">
      <div style={{ ...panelStyle, marginBottom: 12 }}>
        <div style={{ color: C.teal, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>SHIFT CONTINUITY</div>
        <h3 id="handover-title" style={{ margin: '8px 0 6px', fontSize: 20 }}>Structured Handover</h3>
        <p style={{ margin: 0, color: C.sub, fontSize: 12, lineHeight: 1.6 }}>
          Saved only on this device for internal simulation. No message is sent to a person, hospital, or external service.
        </p>
      </div>

      <div style={{ ...panelStyle, marginBottom: 12 }}>
        <label htmlFor="handover-case" style={labelStyle}>Fictional case</label>
        <select id="handover-case" value={caseId} onChange={event => setCaseId(event.target.value)} style={fieldStyle}>
          {cases.map(item => <option key={item.id} value={item.id}>{item.id} · {pathwayLabels[item.pathway]}</option>)}
        </select>
      </div>

      {selectedCase && (
        <HandoverEditor
          key={selectedCase.id}
          selectedCase={selectedCase}
          initialRecord={initialRecord}
          onSave={onSave}
        />
      )}
    </section>
  )
}
