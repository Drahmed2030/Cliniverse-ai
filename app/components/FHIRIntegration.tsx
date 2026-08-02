'use client'
import { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.72)',
  muted:  'rgba(238,246,250,0.50)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

const BIO_CSS = `
  @keyframes bioGlow {
    0%,100% { box-shadow:0 0 15px rgba(0,122,255,0.3),0 0 30px rgba(0,122,255,0.15); }
    50%      { box-shadow:0 0 25px rgba(0,122,255,0.5),0 0 50px rgba(0,122,255,0.25); }
  }
  @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
`

// ── FHIR SERVER CONFIG ──
const FHIR_BASE = 'https://hapi.fhir.org/baseR4'

// ── FHIR API HELPERS ──
async function fhirGet(path: string) {
  const res = await fetch(FHIR_BASE + path, {
    headers: { 'Accept': 'application/fhir+json' }
  })
  if (!res.ok) throw new Error('FHIR error: ' + res.status)
  return res.json()
}

async function fhirPost(path: string, body: any) {
  const res = await fetch(FHIR_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/fhir+json', 'Accept': 'application/fhir+json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error('FHIR error: ' + res.status)
  return res.json()
}

// ── BUILD FHIR MEDICATION REQUEST ──
function buildMedicationRequest(patient: any, prescription: string, doctor: string) {
  return {
    resourceType: 'MedicationRequest',
    status: 'active',
    intent: 'order',
    subject: {
      reference: `Patient/${patient.id}`,
      display: patient.name?.[0]?.text || 'Patient'
    },
    requester: {
      display: doctor || 'Dr. Ahmed Osman'
    },
    medicationCodeableConcept: {
      text: prescription.substring(0, 200)
    },
    note: [{ text: prescription }],
    authoredOn: new Date().toISOString(),
  }
}

// ── PATIENT CARD ──
function PatientCard({ patient, onSelect, selected }: { patient: any, onSelect: () => void, selected: boolean }) {
  const name = patient.name?.[0]?.text || patient.name?.[0]?.family || 'Unknown'
  const dob  = patient.birthDate || '—'
  const gender = patient.gender || '—'
  const id   = patient.id

  return (
    <div onClick={onSelect} style={{
      background: selected ? T.teal + '15' : T.glass,
      backdropFilter: 'blur(16px)',
      border: `1.5px solid ${selected ? T.teal : T.border}`,
      borderRadius: 16, padding: '14px', marginBottom: 8,
      cursor: 'pointer', transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, background: T.teal + '18', border: `1px solid ${T.teal}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        {gender === 'female' ? '👩' : '👨'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color:'var(--text-primary,#0A1628)', marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 11, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>DOB: {dob} · {gender} · ID: {id?.substring(0, 8)}</div>
      </div>
      {selected && <span style={{ fontSize: 16, color: T.teal }}>✓</span>}
    </div>
  )
}

// ── OBSERVATION CARD ──
function ObservationCard({ obs }: { obs: any }) {
  const code  = obs.code?.text || obs.code?.coding?.[0]?.display || 'Observation'
  const value = obs.valueQuantity ? `${obs.valueQuantity.value} ${obs.valueQuantity.unit || ''}` : obs.valueString || '—'
  const date  = obs.effectiveDateTime ? new Date(obs.effectiveDateTime).toLocaleDateString() : '—'
  const status = obs.status || ''
  const isAbnormal = obs.interpretation?.[0]?.coding?.[0]?.code === 'H' || obs.interpretation?.[0]?.coding?.[0]?.code === 'L'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: isAbnormal ? T.orange + '08' : T.glass2,
      border: `1px solid ${isAbnormal ? T.orange + '25' : T.border}`,
      borderRadius: 12, padding: '10px 14px', marginBottom: 6,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color:'var(--text-primary,#0A1628)' }}>{code}</div>
        <div style={{ fontSize: 10, color: T.muted }}>{date}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 900, color: isAbnormal ? T.orange : T.teal }}>{value}</div>
    </div>
  )
}

// ── MEDICATION CARD ──
function MedCard({ med }: { med: any }) {
  const name   = med.medicationCodeableConcept?.text || med.medicationReference?.display || 'Medication'
  const status = med.status || ''
  const date   = med.authoredOn ? new Date(med.authoredOn).toLocaleDateString() : '—'
  const statusColor = status === 'active' ? T.green : status === 'stopped' ? T.red : T.muted

  return (
    <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${statusColor}20`, borderRadius: 14, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: statusColor + '15', border: `1px solid ${statusColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💊</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color:'var(--text-primary,#0A1628)', marginBottom: 2 }}>{name.substring(0, 60)}</div>
        <div style={{ fontSize: 10, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>{date}</div>
      </div>
      <span style={{ fontSize: 9, fontWeight: 800, color: statusColor, background: statusColor + '12', borderRadius: 8, padding: '2px 8px' }}>{status.toUpperCase()}</span>
    </div>
  )
}

export default function FHIRIntegration({ onXP }: { onXP?: (n: number) => void }) {
  const [tab, setTab]                 = useState<'search'|'record'|'prescribe'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [patients, setPatients]       = useState<any[]>([])
  const [selected, setSelected]       = useState<any>(null)
  const [observations, setObservations] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [loading, setLoading]         = useState(false)
  const [rxText, setRxText]           = useState('')
  const [rxSent, setRxSent]           = useState(false)
  const [rxSending, setRxSending]     = useState(false)
  const [error, setError]             = useState('')

  // Search patients
  const searchPatients = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setError('')
    setPatients([])
    try {
      const data = await fhirGet('/Patient?name=' + encodeURIComponent(searchQuery) + '&_count=10')
      const entries = data.entry?.map((e: any) => e.resource) || []
      setPatients(entries)
      if (entries.length === 0) setError('No patients found')
      onXP?.(5)
    } catch (e: any) {
      setError('FHIR server error — try again')
    }
    setLoading(false)
  }

  // Load patient record
  const loadRecord = async (patient: any) => {
    setSelected(patient)
    setTab('record')
    setObservations([])
    setMedications([])
    setLoading(true)
    try {
      const [obsData, medData] = await Promise.all([
        fhirGet('/Observation?patient=' + patient.id + '&_count=10&_sort=-date'),
        fhirGet('/MedicationRequest?patient=' + patient.id + '&_count=10&_sort=-authoredon'),
      ])
      setObservations(obsData.entry?.map((e: any) => e.resource) || [])
      setMedications(medData.entry?.map((e: any) => e.resource) || [])
    } catch {}
    setLoading(false)
  }

  // Send prescription via FHIR
  const sendPrescription = async () => {
    if (!rxText.trim() || !selected) return
    setRxSending(true)
    try {
      const rx = buildMedicationRequest(selected, rxText, 'Dr. Ahmed Osman')
      await fhirPost('/MedicationRequest', rx)
      setRxSent(true)
      onXP?.(20)
    } catch {
      setError('Failed to send prescription')
    }
    setRxSending(false)
  }

  const patientName = selected?.name?.[0]?.text || selected?.name?.[0]?.family || 'Patient'

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: T.blue + 'CC', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>HL7 FHIR R4</div>
        <div style={{ fontSize: 22, fontWeight: 900, color:'var(--text-primary,#0A1628)', letterSpacing: -0.5 }}>
          FHIR <span style={{ color: T.blue }}>Integration</span>
        </div>
        <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', marginTop: 4 }}>Global EHR standard · HAPI FHIR Sandbox</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'Standard', v: 'R4',      c: T.blue   },
          { l: 'Server',   v: 'HAPI',    c: T.teal   },
          { l: 'Resources',v: '150+',    c: T.purple },
          { l: 'Status',   v: 'Live',    c: T.green  },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.glass, backdropFilter: 'blur(16px)', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: `1px solid ${s.c}18` }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 4, marginBottom: 16, border: '1px solid rgba(255,255,255,0.10)' }}>
        {([
          ['search',    '🔍 Search'],
          ['record',    '📋 Record'],
          ['prescribe', '💊 Prescribe'],
        ] as [string,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)} style={{ flex: 1, padding: '10px 4px', cursor: 'pointer', borderRadius: 12, fontFamily: F, fontWeight: 700, fontSize: 11, border: tab === id ? `1px solid ${T.blue}25` : '1px solid transparent', background: tab === id ? 'rgba(255,255,255,0.10)' : 'transparent', color: tab === id ? T.blue : T.muted, transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* ── SEARCH TAB ── */}
      {tab === 'search' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchPatients()} placeholder="Search patient by name..." style={{ flex: 1, padding: '12px 14px', borderRadius: 14, border: `1px solid ${T.border}`, background: T.glass, color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', fontFamily: F }} />
            <button onClick={searchPatients} disabled={loading || !searchQuery.trim()} style={{ padding: '12px 18px', borderRadius: 14, border: 'none', background: !searchQuery.trim() ? 'rgba(0,122,255,0.15)' : `linear-gradient(135deg,${T.blue},#0055CC)`, color: 'var(--text-primary,#0A1628)', fontSize: 13, fontWeight: 800, cursor: !searchQuery.trim() ? 'not-allowed' : 'pointer', fontFamily: F }}>
              {loading ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} /> : '🔍'}
            </button>
          </div>

          {/* Quick searches */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>QUICK SEARCH</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Smith','Jones','Ahmed','Sarah','John','Mary'].map(name => (
                <button key={name} onClick={() => { setSearchQuery(name); }} style={{ background: T.glass2, border: `1px solid ${T.border}`, borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: F, color:'var(--text-secondary,rgba(10,22,40,0.55))', fontSize: 11, fontWeight: 600 }}>{name}</button>
              ))}
            </div>
          </div>

          {error && <div style={{ background: 'rgba(255,149,0,0.08)', border: `1px solid ${T.orange}25`, borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}><div style={{ fontSize: 12, color: T.orange }}>⚠️ {error}</div></div>}

          {patients.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>{patients.length} PATIENTS FOUND</div>
              {patients.map(p => (
                <PatientCard key={p.id} patient={p} selected={selected?.id === p.id} onSelect={() => loadRecord(p)} />
              ))}
            </div>
          )}

          {/* FHIR info */}
          <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px', marginTop: 14 }}>
            <div style={{ fontSize: 10, color: T.blue, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>ℹ️ ABOUT FHIR</div>
            {[
              { icon: '🌐', text: 'HL7 FHIR R4 — Global standard for health data exchange' },
              { icon: '🏥', text: 'Compatible with Epic, Cerner, NHS, and 500+ EHR systems' },
              { icon: '🔒', text: 'Sandbox mode — uses HAPI FHIR public test server' },
              { icon: '🇸🇦', text: 'Saudi MOH FHIR integration in development' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RECORD TAB ── */}
      {tab === 'record' && (
        <div>
          {!selected ? (
            <div style={{ textAlign: 'center', padding: '40px', background: T.glass, borderRadius: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
              <div style={{ fontSize: 14, color:'var(--text-primary,#0A1628)', marginBottom: 4 }}>No patient selected</div>
              <div style={{ fontSize: 12, color: T.muted }}>Search and select a patient first</div>
              <button onClick={() => setTab('search')} style={{ marginTop: 14, background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 20px', color: T.teal, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Search Patients</button>
            </div>
          ) : (
            <div>
              {/* Patient header */}
              <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.blue}25`, borderRadius: 18, padding: '14px', marginBottom: 16, animation: 'bioGlow 3s ease-in-out infinite' }}>
                <div style={{ fontSize: 9, color: T.blue, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>FHIR PATIENT RECORD</div>
                <div style={{ fontSize: 16, fontWeight: 900, color:'var(--text-primary,#0A1628)', marginBottom: 3 }}>{patientName}</div>
                <div style={{ fontSize: 11, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>
                  {selected.birthDate && `DOB: ${selected.birthDate} · `}
                  {selected.gender && `${selected.gender} · `}
                  ID: {selected.id?.substring(0, 12)}
                </div>
                <button onClick={() => setTab('prescribe')} style={{ marginTop: 12, background: `linear-gradient(135deg,${T.green},${T.teal})`, border: 'none', borderRadius: 12, padding: '9px 16px', color: 'var(--text-primary,#0A1628)', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: F }}>
                  💊 Prescribe via FHIR →
                </button>
              </div>

              {loading && (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.08)`, borderTop: `3px solid ${T.blue}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>Loading FHIR record...</div>
                </div>
              )}

              {/* Observations */}
              {observations.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>📊 OBSERVATIONS ({observations.length})</div>
                  {observations.map((obs, i) => <ObservationCard key={i} obs={obs} />)}
                </div>
              )}

              {/* Medications */}
              {medications.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>💊 MEDICATIONS ({medications.length})</div>
                  {medications.map((med, i) => <MedCard key={i} med={med} />)}
                </div>
              )}

              {!loading && observations.length === 0 && medications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', background: T.glass2, borderRadius: 16, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 13, color: T.muted }}>No observations or medications found for this patient</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PRESCRIBE TAB ── */}
      {tab === 'prescribe' && (
        <div>
          {!selected ? (
            <div style={{ textAlign: 'center', padding: '40px', background: T.glass, borderRadius: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
              <div style={{ fontSize: 14, color:'var(--text-primary,#0A1628)', marginBottom: 4 }}>No patient selected</div>
              <button onClick={() => setTab('search')} style={{ marginTop: 14, background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 20px', color: T.teal, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Search Patients</button>
            </div>
          ) : rxSent ? (
            <div style={{ textAlign: 'center', padding: '40px', background: T.green + '10', borderRadius: 20, border: `1px solid ${T.green}25` }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: T.green, marginBottom: 8 }}>Prescription Sent!</div>
              <div style={{ fontSize: 13, color:'var(--text-secondary,rgba(10,22,40,0.55))', marginBottom: 20 }}>MedicationRequest created in FHIR server</div>
              <button onClick={() => { setRxSent(false); setRxText('') }} style={{ background: T.glass, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 20px', color: T.teal, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                New Prescription
              </button>
            </div>
          ) : (
            <div>
              {/* Patient */}
              <div style={{ background: T.glass2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{selected.gender === 'female' ? '👩' : '👨'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color:'var(--text-primary,#0A1628)' }}>{patientName}</div>
                  <div style={{ fontSize: 10, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>FHIR ID: {selected.id?.substring(0, 12)}</div>
                </div>
              </div>

              {/* Prescription input */}
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>PRESCRIPTION</div>
              <textarea value={rxText} onChange={e => setRxText(e.target.value)} placeholder="Enter prescription details...&#10;e.g. Metformin 500mg BD · Ramipril 5mg OD · Review in 4 weeks" rows={6} style={{ width: '100%', padding: '14px', borderRadius: 16, border: `1px solid ${T.border}`, background: T.glass, color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: F, lineHeight: 1.7, boxSizing: 'border-box', marginBottom: 12 }} />

              {error && <div style={{ background: 'rgba(255,59,48,0.08)', border: `1px solid ${T.red}25`, borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}><div style={{ fontSize: 12, color: T.red }}>⚠️ {error}</div></div>}

              <button onClick={sendPrescription} disabled={rxSending || !rxText.trim()} style={{ width: '100%', padding: '15px', borderRadius: 18, border: 'none', background: !rxText.trim() ? 'rgba(52,199,89,0.15)' : `linear-gradient(135deg,${T.green},${T.teal})`, color: 'var(--text-primary,#0A1628)', fontSize: 14, fontWeight: 800, cursor: !rxText.trim() ? 'not-allowed' : 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {rxSending ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />Sending to FHIR...</> : '🌐 Send MedicationRequest via FHIR'}
              </button>

              <div style={{ marginTop: 14, background: T.gold + '08', border: `1px solid ${T.gold}18`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: T.muted }}>⭐ Sandbox mode — data sent to HAPI FHIR public server</div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{BIO_CSS + ' input::placeholder,textarea::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}
