'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'var(--border-card, rgba(10,132,255,0.12))',
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

const INTERPRETATION_TYPES = [
  { id: 'ecg',     label: 'ECG',          icon: '📈', color: T.red    },
  { id: 'retinal', label: 'Retinal Scan', icon: '👁️', color: T.blue   },
  { id: 'skin',    label: 'Skin Lesion',  icon: '🔬', color: T.orange },
  { id: 'xray',    label: 'X-Ray',        icon: '🫁', color: T.teal   },
  { id: 'echo',    label: 'Echo',         icon: '🫀', color: T.purple },
  { id: 'labs',    label: 'Lab Results',  icon: '🧪', color: T.green  },
  { id: 'vitals',  label: 'Vitals',       icon: '💊', color: T.gold   },
  { id: 'note',    label: 'Clinical Note',icon: '📋', color:'var(--text-secondary,rgba(10,22,40,0.55))'    },
]

// ── ADD PATIENT MODAL ──
function AddPatientModal({ onClose, onAdd }: { onClose: () => void, onAdd: (p: any) => void }) {
  const [form, setForm] = useState({ name: '', mrn: '', age: '', gender: 'M', diagnosis: '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name || !form.mrn) return
    setSaving(true)
    try {
      const { data, error } = await supabase.from('cm_patients').insert([{
        name: form.name, mrn: form.mrn,
        age: parseInt(form.age) || 0,
        gender: form.gender,
        diagnosis: form.diagnosis,
        created_at: new Date().toISOString(),
      }]).select()
      if (!error && data?.[0]) onAdd(data[0])
      else onAdd({ id: 'local_' + Date.now(), ...form, age: parseInt(form.age) || 0, created_at: new Date().toISOString() })
    } catch {
      onAdd({ id: 'local_' + Date.now(), ...form, age: parseInt(form.age) || 0, created_at: new Date().toISOString() })
    }
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background:'var(--bg-card,rgba(255,255,255,0.88))', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontFamily: F }}>
      <div style={{ background:'var(--bg-base,#F7F9FC)', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', border: '1px solid ' + T.border }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.20)', margin: '0 auto 20px' }} />
        <div style={{ fontSize: 18, fontWeight: 900, color:'var(--text-primary,#0A1628)', marginBottom: 20 }}>➕ New Patient</div>

        {[
          { key: 'name',      label: 'Full Name *',    placeholder: 'Patient name' },
          { key: 'mrn',       label: 'MRN *',          placeholder: 'Medical record number' },
          { key: 'age',       label: 'Age',            placeholder: 'Age in years' },
          { key: 'diagnosis', label: 'Diagnosis',      placeholder: 'Primary diagnosis' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>{f.label}</div>
            <input
              value={(form as any)[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid ' + T.border, background: T.glass, color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>GENDER</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['M', 'F'].map(g => (
              <button key={g} onClick={() => setForm(prev => ({ ...prev, gender: g }))} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid ' + (form.gender === g ? T.teal : T.border), background: form.gender === g ? T.teal + '18' : T.glass2, color: form.gender === g ? T.teal : T.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                {g === 'M' ? '👨 Male' : '👩 Female'}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving || !form.name || !form.mrn} style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background: !form.name || !form.mrn ? 'rgba(0,196,180,0.2)' : 'linear-gradient(135deg,' + T.teal + ',' + T.blue + ')', color: 'var(--text-primary,#0A1628)', fontSize: 14, fontWeight: 800, cursor: !form.name || !form.mrn ? 'not-allowed' : 'pointer', fontFamily: F }}>
          {saving ? 'Saving...' : '✅ Add Patient'}
        </button>
        <button onClick={onClose} style={{ width: '100%', padding: '12px', marginTop: 8, borderRadius: 16, border: '1px solid ' + T.border, background: 'transparent', color: T.muted, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Cancel</button>
      </div>
      <style>{'input::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}

// ── ADD INTERPRETATION MODAL ──
function AddInterpretationModal({ patient, onClose, onAdd }: { patient: any, onClose: () => void, onAdd: (i: any) => void }) {
  const [type, setType]         = useState('ecg')
  const [finding, setFinding]   = useState('')
  const [generating, setGenerating] = useState(false)
  const [aiText, setAiText]     = useState('')

  const t = INTERPRETATION_TYPES.find(t => t.id === type)!

  const generateAI = async () => {
    if (!finding.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: 'You are a clinical expert. Interpret this ' + t.label + ' finding for patient ' + patient.name + ', ' + patient.age + patient.gender + ', diagnosis: ' + patient.diagnosis + '.\n\nFinding: ' + finding + '\n\nProvide: 1) Interpretation 2) Clinical significance 3) Recommended action. Be concise and clinical.'
          }]
        })
      })
      const data = await res.json()
      setAiText(data.content?.[0]?.text || '')
    } catch {}
    setGenerating(false)
  }

  const save = async () => {
    const newItem = {
      patient_id: patient.id,
      type,
      finding: finding.trim(),
      ai_interpretation: aiText,
      created_at: new Date().toISOString(),
    }
    try {
      const { data } = await supabase.from('cm_interpretations').insert([newItem]).select()
      onAdd(data?.[0] || { id: 'local_' + Date.now(), ...newItem })
    } catch {
      onAdd({ id: 'local_' + Date.now(), ...newItem })
    }
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background:'var(--bg-card,rgba(255,255,255,0.88))', backdropFilter: 'blur(12px)', overflowY: 'auto', fontFamily: F }}>
      <div style={{ padding: '20px 16px 60px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 12, padding: '9px 16px', color:'var(--text-secondary,rgba(10,22,40,0.55))', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Back</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color:'var(--text-primary,#0A1628)' }}>Add Interpretation</div>
            <div style={{ fontSize: 11, color: T.teal }}>{patient.name} · {patient.mrn}</div>
          </div>
        </div>

        {/* Type selector */}
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>TYPE</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {INTERPRETATION_TYPES.map(it => (
            <button key={it.id} onClick={() => setType(it.id)} style={{ background: type === it.id ? it.color + '18' : T.glass2, border: '1.5px solid ' + (type === it.id ? it.color : T.border), borderRadius: 20, padding: '6px 12px', cursor: 'pointer', fontFamily: F, color: type === it.id ? it.color : T.muted, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              {it.icon} {it.label}
            </button>
          ))}
        </div>

        {/* Finding input */}
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>FINDING / DESCRIPTION</div>
        <textarea
          value={finding}
          onChange={e => setFinding(e.target.value)}
          placeholder={'Describe the ' + t.label + ' finding...'}
          rows={4}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid ' + T.border, background: T.glass, color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: F, lineHeight: 1.7, boxSizing: 'border-box', marginBottom: 12 }}
        />

        {/* AI Generate */}
        <button onClick={generateAI} disabled={generating || !finding.trim()} style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: generating || !finding.trim() ? 'rgba(175,82,222,0.15)' : 'linear-gradient(135deg,' + T.purple + ',' + T.blue + ')', color: 'var(--text-primary,#0A1628)', fontSize: 13, fontWeight: 800, cursor: generating || !finding.trim() ? 'not-allowed' : 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          {generating ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />Generating AI interpretation...</> : '🤖 Generate AI Interpretation'}
        </button>

        {aiText && (
          <div style={{ background: T.purple + '08', border: '1px solid ' + T.purple + '22', borderRadius: 16, padding: '14px', marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: T.purple, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>🤖 AI INTERPRETATION</div>
            <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{aiText}</div>
          </div>
        )}

        <button onClick={save} disabled={!finding.trim()} style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background: !finding.trim() ? 'rgba(0,196,180,0.15)' : 'linear-gradient(135deg,' + T.teal + ',' + T.blue + ')', color: 'var(--text-primary,#0A1628)', fontSize: 14, fontWeight: 800, cursor: !finding.trim() ? 'not-allowed' : 'pointer', fontFamily: F }}>
          💾 Save to Patient Record
        </button>
      </div>
      <style>{'@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} textarea::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}

// ── GENERATE FULL REPORT ──
async function generateFullReport(patient: any, interpretations: any[]) {
  const summary = interpretations.map(i => {
    const t = INTERPRETATION_TYPES.find(t => t.id === i.type)
    return t?.label + ': ' + i.finding + (i.ai_interpretation ? '\nAI: ' + i.ai_interpretation.substring(0, 150) : '')
  }).join('\n\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: 'Generate a comprehensive medical report for:\nPatient: ' + patient.name + ', ' + patient.age + patient.gender + '\nDiagnosis: ' + patient.diagnosis + '\n\nInvestigations and findings:\n' + summary + '\n\nWrite a professional medical report including: Summary, Key Findings, Clinical Assessment, Recommendations, and Follow-up plan. Use medical terminology. Format clearly with sections.'
      }]
    })
  })
  const data = await res.json()
  return data.content?.[0]?.text || 'Could not generate report.'
}

// ── PATIENT DETAIL ──
function PatientDetail({ patient, onBack }: { patient: any, onBack: () => void }) {
  const [interpretations, setInterpretations] = useState<any[]>([])
  const [showAdd, setShowAdd]   = useState(false)
  const [report, setReport]     = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied]     = useState(false)

  useEffect(() => {
    supabase.from('cm_interpretations').select('*').eq('patient_id', patient.id).order('created_at', { ascending: false }).then(({ data }) => { if (data) setInterpretations(data) })
  }, [patient.id])

  const genReport = async () => {
    setGenerating(true)
    const text = await generateFullReport(patient, interpretations)
    setReport(text)
    setGenerating(false)
  }

  const copy = () => {
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (showAdd) return <AddInterpretationModal patient={patient} onClose={() => setShowAdd(false)} onAdd={i => { setInterpretations(prev => [i, ...prev]); setShowAdd(false) }} />

  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 12, padding: '9px 16px', color:'var(--text-secondary,rgba(10,22,40,0.55))', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Patients</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color:'var(--text-primary,#0A1628)' }}>{patient.name}</div>
          <div style={{ fontSize: 11, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>MRN: {patient.mrn} · {patient.age}{patient.gender} · {patient.diagnosis}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'Records',    v: interpretations.length, c: T.teal   },
          { l: 'ECG',        v: interpretations.filter(i => i.type === 'ecg').length,    c: T.red    },
          { l: 'Labs',       v: interpretations.filter(i => i.type === 'labs').length,   c: T.green  },
          { l: 'Imaging',    v: interpretations.filter(i => ['xray','echo','retinal'].includes(i.type)).length, c: T.purple },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.glass, backdropFilter: 'blur(16px)', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: '1px solid ' + s.c + '18' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Add + Report buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button onClick={() => setShowAdd(true)} style={{ flex: 1, padding: '13px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,' + T.teal + ',' + T.blue + ')', color: 'var(--text-primary,#0A1628)', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: F }}>
          ➕ Add Record
        </button>
        <button onClick={genReport} disabled={generating || interpretations.length === 0} style={{ flex: 1, padding: '13px', borderRadius: 16, border: '1px solid ' + T.gold + '30', background: T.gold + '12', color: interpretations.length === 0 ? T.muted : T.gold, fontSize: 13, fontWeight: 800, cursor: interpretations.length === 0 ? 'not-allowed' : 'pointer', fontFamily: F }}>
          {generating ? '⏳ Generating...' : '📄 Full Report'}
        </button>
      </div>

      {/* Full Report */}
      {report && (
        <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.gold + '25', borderRadius: 18, padding: '16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: T.gold, fontWeight: 700, letterSpacing: 1.5 }}>📄 MEDICAL REPORT</div>
            <button onClick={copy} style={{ background: copied ? T.green + '20' : T.glass2, border: '1px solid ' + (copied ? T.green : T.border), borderRadius: 10, padding: '5px 12px', color: copied ? T.green : T.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>{copied ? '✓ Copied' : '📋 Copy'}</button>
          </div>
          <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{report}</div>
        </div>
      )}

      {/* Interpretations list */}
      <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>
        CLINICAL RECORDS ({interpretations.length})
      </div>

      {interpretations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: T.glass, borderRadius: 20, border: '1px solid ' + T.border }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🗂️</div>
          <div style={{ fontSize: 14, color:'var(--text-primary,#0A1628)', marginBottom: 4 }}>No records yet</div>
          <div style={{ fontSize: 12, color: T.muted }}>Tap "Add Record" to start</div>
        </div>
      ) : interpretations.map((item, i) => {
        const t = INTERPRETATION_TYPES.find(t => t.id === item.type)!
        return (
          <div key={item.id || i} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + t.color + '22', borderRadius: 18, padding: '14px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle,' + t.color + '10,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: t.color + '15', border: '1px solid ' + t.color + '28', borderRadius: 20, padding: '3px 10px' }}>
                <span style={{ fontSize: 12 }}>{t.icon}</span>
                <span style={{ fontSize: 9, color: t.color, fontWeight: 800 }}>{t.label}</span>
              </div>
              <span style={{ fontSize: 9, color: T.muted }}>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ fontSize: 13, color:'var(--text-primary,#0A1628)', fontWeight: 600, marginBottom: 6, lineHeight: 1.5 }}>{item.finding}</div>
            {item.ai_interpretation && (
              <div style={{ background: T.purple + '08', border: '1px solid ' + T.purple + '18', borderRadius: 10, padding: '8px 10px', marginTop: 6 }}>
                <div style={{ fontSize: 8, color: T.purple, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>🤖 AI</div>
                <div style={{ fontSize: 11, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.6 }}>{item.ai_interpretation.substring(0, 150)}...</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── MAIN ──
export default function ClinicalMemory({ onXP }: { onXP?: (n: number) => void }) {
  const [patients, setPatients]   = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [selected, setSelected]   = useState<any>(null)
  const [search, setSearch]       = useState('')

  useEffect(() => {
    supabase.from('cm_patients').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPatients(data)
      setLoading(false)
    })
  }, [])

  if (selected) return <PatientDetail patient={selected} onBack={() => setSelected(null)} />

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn?.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: T.teal + 'CC', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>CLINICAL MEMORY</div>
        <div style={{ fontSize: 22, fontWeight: 900, color:'var(--text-primary,#0A1628)', letterSpacing: -0.5 }}>
          Patient <span style={{ color: T.teal }}>Records</span>
        </div>
        <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', marginTop: 4 }}>ECG · Retinal · Labs · Imaging · AI Report in 30s</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'Patients',  v: patients.length, c: T.teal   },
          { l: 'Records',   v: '—',             c: T.blue   },
          { l: 'Reports',   v: 'AI',            c: T.purple },
          { l: 'Time',      v: '30s',           c: T.gold   },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.glass, backdropFilter: 'blur(16px)', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: '1px solid ' + s.c + '18' }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patient name, MRN, diagnosis..."
          style={{ flex: 1, padding: '11px 14px', borderRadius: 14, border: '1px solid ' + T.border, background: T.glass, backdropFilter: 'blur(16px)', color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', fontFamily: F }}
        />
        <button onClick={() => setShowAdd(true)} style={{ padding: '11px 16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,' + T.teal + ',' + T.blue + ')', color: 'var(--text-primary,#0A1628)', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: F }}>+ New</button>
      </div>

      {/* Patients list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.08)', borderTop: '3px solid ' + T.teal, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>Loading patients...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: T.glass, borderRadius: 20, border: '1px solid ' + T.border }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🗂️</div>
          <div style={{ fontSize: 14, color:'var(--text-primary,#0A1628)', marginBottom: 4 }}>{patients.length === 0 ? 'No patients yet' : 'No results'}</div>
          <div style={{ fontSize: 12, color: T.muted }}>{patients.length === 0 ? 'Tap "+ New" to add your first patient' : 'Try a different search'}</div>
        </div>
      ) : filtered.map(p => (
        <div key={p.id} onClick={() => { setSelected(p); onXP?.(5) }} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.teal + '18', borderRadius: 18, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle,' + T.teal + '06,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: T.teal + '15', border: '1px solid ' + T.teal + '28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {p.gender === 'F' ? '👩' : '👨'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color:'var(--text-primary,#0A1628)', marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontSize: 11, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>MRN: {p.mrn} · {p.age}{p.gender}</div>
            {p.diagnosis && <div style={{ fontSize: 10, color: T.teal, marginTop: 3, fontWeight: 600 }}>{p.diagnosis}</div>}
          </div>
          <span style={{ fontSize: 18, color: T.muted }}>›</span>
        </div>
      ))}

      {showAdd && <AddPatientModal onClose={() => setShowAdd(false)} onAdd={p => { setPatients(prev => [p, ...prev]); setShowAdd(false) }} />}

      <div style={{ marginTop: 16, background: T.gold + '08', border: '1px solid ' + T.gold + '18', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>⭐ Clinical Memory — From diagnosis to report in 30 seconds</div>
      </div>

      <style>{'@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} input::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}
