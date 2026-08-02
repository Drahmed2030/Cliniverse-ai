'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

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

const PROCEDURE_TYPES = [
  { id: 'procedure',   label: 'Procedure',        icon: '🔧', color: T.blue   },
  { id: 'case',        label: 'Clinical Case',     icon: '🏥', color: T.teal   },
  { id: 'teaching',    label: 'Teaching Session',  icon: '📚', color: T.purple },
  { id: 'audit',       label: 'Audit / QI',        icon: '📊', color: T.orange },
  { id: 'research',    label: 'Research',          icon: '🔬', color: T.green  },
  { id: 'conference',  label: 'Conference / CPD',  icon: '🎓', color: T.gold   },
  { id: 'reflection',  label: 'Reflection',        icon: '💭', color: T.purple },
  { id: 'supervision', label: 'Supervision',       icon: '👨‍⚕️', color: T.teal  },
]

const COMPETENCY_LEVELS = [
  { id: 1, label: 'Observed',          color: T.muted  },
  { id: 2, label: 'Assisted',          color: T.blue   },
  { id: 3, label: 'Performed (supervised)', color: T.orange },
  { id: 4, label: 'Performed (independent)', color: T.green },
]

const SPECIALTIES = ['Cardiology','Emergency','Internal Medicine','Critical Care','Neurology','Respiratory','Pediatrics','Surgery','Nephrology','Endocrinology']

// ── ADD ENTRY MODAL ──
function AddEntryModal({ onClose, onAdd }: { onClose: () => void, onAdd: (e: any) => void }) {
  const [form, setForm] = useState({
    type: 'procedure', title: '', specialty: 'Cardiology',
    competency: 4, description: '', reflection: '',
    supervisor: '', date: new Date().toISOString().split('T')[0],
    cpd_hours: '1',
  })
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving]         = useState(false)

  const t = PROCEDURE_TYPES.find(t => t.id === form.type)!

  const generateReflection = async () => {
    if (!form.title || !form.description) return
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
            content: 'Generate a professional Gibbs Reflective Cycle entry for a medical logbook:\nActivity: ' + form.title + '\nSpecialty: ' + form.specialty + '\nDescription: ' + form.description + '\n\nWrite a concise reflection covering:\n1. Description (what happened)\n2. Feelings (reaction)\n3. Evaluation (good/bad)\n4. Analysis (why)\n5. Conclusion (what to change)\n6. Action plan\n\nKeep it professional and under 200 words.'
          }]
        })
      })
      const data = await res.json()
      setForm(prev => ({ ...prev, reflection: data.content?.[0]?.text || '' }))
    } catch {}
    setGenerating(false)
  }

  const save = async () => {
    if (!form.title) return
    setSaving(true)
    const entry = {
      type: form.type, title: form.title, specialty: form.specialty,
      competency: form.competency, description: form.description,
      reflection: form.reflection, supervisor: form.supervisor,
      date: form.date, cpd_hours: parseFloat(form.cpd_hours) || 1,
      created_at: new Date().toISOString(),
    }
    try {
      const { data } = await supabase.from('logbook_entries').insert([entry]).select()
      onAdd(data?.[0] || { id: 'local_' + Date.now(), ...entry })
    } catch {
      onAdd({ id: 'local_' + Date.now(), ...entry })
    }
    setSaving(false)
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background:'var(--bg-card,rgba(255,255,255,0.06))', backdropFilter: 'blur(12px)', overflowY: 'auto', fontFamily: F }}>
      <div style={{ padding: '20px 16px 60px', maxWidth: 480, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 12, padding: '9px 16px', color:'var(--text-secondary,rgba(10,22,40,0.55))', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Back</button>
          <div style={{ fontSize: 17, fontWeight: 900, color:'var(--text-primary,#0A1628)' }}>📋 New Logbook Entry</div>
        </div>

        {/* Type */}
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>ACTIVITY TYPE</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {PROCEDURE_TYPES.map(pt => (
            <button key={pt.id} onClick={() => setForm(p => ({ ...p, type: pt.id }))} style={{ background: form.type === pt.id ? pt.color + '18' : T.glass2, border: '1.5px solid ' + (form.type === pt.id ? pt.color : T.border), borderRadius: 20, padding: '6px 12px', cursor: 'pointer', fontFamily: F, color: form.type === pt.id ? pt.color : T.muted, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              {pt.icon} {pt.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>TITLE *</div>
        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Central line insertion, STEMI management..." style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid ' + T.border, background: T.glass, color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', fontFamily: F, marginBottom: 12, boxSizing: 'border-box' }} />

        {/* Specialty + Date */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 2 }}>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginBottom: 4 }}>SPECIALTY</div>
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
              {SPECIALTIES.slice(0, 6).map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, specialty: s }))} style={{ flexShrink: 0, background: form.specialty === s ? T.teal + '18' : T.glass2, border: '1px solid ' + (form.specialty === s ? T.teal : T.border), borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontFamily: F, color: form.specialty === s ? T.teal : T.muted, fontSize: 9, fontWeight: 700, whiteSpace: 'nowrap' }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginBottom: 4 }}>CPD HRS</div>
            <input value={form.cpd_hours} onChange={e => setForm(p => ({ ...p, cpd_hours: e.target.value }))} type="number" min="0.5" step="0.5" style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid ' + T.border, background: T.glass2, color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Date + Supervisor */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginBottom: 4 }}>DATE</div>
            <input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid ' + T.border, background: T.glass2, color:'var(--text-primary,#0A1628)', fontSize: 12, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginBottom: 4 }}>SUPERVISOR</div>
            <input value={form.supervisor} onChange={e => setForm(p => ({ ...p, supervisor: e.target.value }))} placeholder="Name" style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid ' + T.border, background: T.glass2, color:'var(--text-primary,#0A1628)', fontSize: 12, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Competency */}
        {(form.type === 'procedure' || form.type === 'case') && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>COMPETENCY LEVEL</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {COMPETENCY_LEVELS.map(cl => (
                <div key={cl.id} onClick={() => setForm(p => ({ ...p, competency: cl.id }))} style={{ display: 'flex', alignItems: 'center', gap: 10, background: form.competency === cl.id ? cl.color + '15' : T.glass2, border: '1px solid ' + (form.competency === cl.id ? cl.color : T.border), borderRadius: 12, padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: form.competency === cl.id ? cl.color : 'rgba(255,255,255,0.08)', border: '1.5px solid ' + (form.competency === cl.id ? cl.color : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-primary,#0A1628)', flexShrink: 0 }}>{form.competency === cl.id ? '✓' : cl.id}</div>
                  <span style={{ fontSize: 12, color: form.competency === cl.id ? T.text : T.sub, fontWeight: form.competency === cl.id ? 700 : 400 }}>{cl.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>DESCRIPTION</div>
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the activity..." rows={3} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid ' + T.border, background: T.glass, color:'var(--text-primary,#0A1628)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: F, lineHeight: 1.6, marginBottom: 10, boxSizing: 'border-box' }} />

        {/* AI Reflection */}
        <button onClick={generateReflection} disabled={generating || !form.title} style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', background: generating || !form.title ? 'rgba(175,82,222,0.15)' : 'linear-gradient(135deg,' + T.purple + ',' + T.blue + ')', color: 'var(--text-primary,#0A1628)', fontSize: 12, fontWeight: 800, cursor: generating || !form.title ? 'not-allowed' : 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          {generating ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />Generating reflection...</> : '🤖 AI Generate Gibbs Reflection'}
        </button>

        {form.reflection && (
          <textarea value={form.reflection} onChange={e => setForm(p => ({ ...p, reflection: e.target.value }))} rows={5} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid ' + T.purple + '25', background: T.purple + '06', color:'var(--text-secondary,rgba(10,22,40,0.55))', fontSize: 12, outline: 'none', resize: 'none', fontFamily: F, lineHeight: 1.7, marginBottom: 10, boxSizing: 'border-box' }} />
        )}

        <button onClick={save} disabled={saving || !form.title} style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background: !form.title ? 'rgba(0,196,180,0.15)' : 'linear-gradient(135deg,' + T.teal + ',' + T.blue + ')', color: 'var(--text-primary,#0A1628)', fontSize: 14, fontWeight: 800, cursor: !form.title ? 'not-allowed' : 'pointer', fontFamily: F }}>
          {saving ? 'Saving...' : '💾 Save to Logbook'}
        </button>
      </div>
      <style>{'@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} input::placeholder,textarea::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}

// ── MAIN ──
export default function ClinicalLogbook({ onXP }: { onXP?: (n: number) => void }) {
  const [entries, setEntries]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [filter, setFilter]     = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('logbook_entries').select('*').order('date', { ascending: false }).then(({ data }) => {
      if (data) setEntries(data)
      setLoading(false)
    })
  }, [])

  const totalCPD    = entries.reduce((sum, e) => sum + (e.cpd_hours || 0), 0)
  const procedures  = entries.filter(e => e.type === 'procedure').length
  const cases       = entries.filter(e => e.type === 'case').length
  const reflections = entries.filter(e => e.reflection).length

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter)

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: T.gold + 'CC', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>CLINICAL LOGBOOK</div>
        <div style={{ fontSize: 22, fontWeight: 900, color:'var(--text-primary,#0A1628)', letterSpacing: -0.5 }}>
          My <span style={{ color: T.gold }}>Logbook</span>
        </div>
        <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', marginTop: 4 }}>CPD · Procedures · Reflections · Revalidation</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { l: 'CPD Hours',   v: totalCPD.toFixed(1), c: T.gold   },
          { l: 'Procedures',  v: procedures,           c: T.blue   },
          { l: 'Cases',       v: cases,                c: T.teal   },
          { l: 'Reflections', v: reflections,          c: T.purple },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: T.glass, backdropFilter: 'blur(16px)', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: '1px solid ' + s.c + '18' }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 7, color: T.muted, marginTop: 2, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: '14px', borderRadius: 18, border: 'none', background: 'linear-gradient(135deg,' + T.gold + ',#B8860B)', color: 'var(--text-primary,#0A1628)', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: '0 6px 24px rgba(212,168,71,0.35)', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        ➕ Add Logbook Entry
      </button>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        <button onClick={() => setFilter('all')} style={{ flexShrink: 0, background: filter === 'all' ? T.glass : T.glass2, border: '1px solid ' + (filter === 'all' ? T.gold : T.border), borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: F, color: filter === 'all' ? T.gold : T.muted, fontSize: 10, fontWeight: 700 }}>All ({entries.length})</button>
        {PROCEDURE_TYPES.map(pt => {
          const count = entries.filter(e => e.type === pt.id).length
          if (count === 0) return null
          return (
            <button key={pt.id} onClick={() => setFilter(pt.id)} style={{ flexShrink: 0, background: filter === pt.id ? pt.color + '18' : T.glass2, border: '1px solid ' + (filter === pt.id ? pt.color : T.border), borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: F, color: filter === pt.id ? pt.color : T.muted, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
              {pt.icon} {pt.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Entries */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.08)', borderTop: '3px solid ' + T.gold, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 13, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>Loading logbook...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: T.glass, borderRadius: 20, border: '1px solid ' + T.border }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14, color:'var(--text-primary,#0A1628)', marginBottom: 4 }}>{entries.length === 0 ? 'Logbook is empty' : 'No entries found'}</div>
          <div style={{ fontSize: 12, color: T.muted }}>{entries.length === 0 ? 'Start documenting your clinical activities' : 'Try a different filter'}</div>
        </div>
      ) : filtered.map(entry => {
        const pt = PROCEDURE_TYPES.find(t => t.id === entry.type)!
        const cl = COMPETENCY_LEVELS.find(c => c.id === entry.competency)
        const isExpanded = expanded === entry.id

        return (
          <div key={entry.id} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + pt.color + '20', borderRadius: 18, padding: '14px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle,' + pt.color + '10,transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, background: pt.color + '15', border: '1px solid ' + pt.color + '28', borderRadius: 8, padding: '2px 8px', color: pt.color, fontWeight: 700 }}>{pt.icon} {pt.label}</span>
                {cl && (entry.type === 'procedure' || entry.type === 'case') && (
                  <span style={{ fontSize: 9, color: cl.color, background: cl.color + '12', borderRadius: 8, padding: '2px 8px', fontWeight: 600 }}>Level {entry.competency}</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {entry.cpd_hours && <span style={{ fontSize: 10, color: T.gold, fontWeight: 700 }}>{entry.cpd_hours}h CPD</span>}
                <span style={{ fontSize: 9, color: T.muted }}>{new Date(entry.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 800, color:'var(--text-primary,#0A1628)', marginBottom: 4 }}>{entry.title}</div>
            <div style={{ fontSize: 10, color: pt.color, fontWeight: 600, marginBottom: entry.description ? 8 : 0 }}>{entry.specialty}{entry.supervisor ? ' · ' + entry.supervisor : ''}</div>

            {entry.description && (
              <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.6, marginBottom: entry.reflection ? 8 : 0 }}>
                {isExpanded ? entry.description : entry.description.substring(0, 100) + (entry.description.length > 100 ? '...' : '')}
              </div>
            )}

            {entry.reflection && isExpanded && (
              <div style={{ background: T.purple + '08', border: '1px solid ' + T.purple + '18', borderRadius: 10, padding: '10px 12px', marginTop: 8 }}>
                <div style={{ fontSize: 8, color: T.purple, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>💭 REFLECTION (Gibbs)</div>
                <div style={{ fontSize: 11, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{entry.reflection}</div>
              </div>
            )}

            {(entry.description?.length > 100 || entry.reflection) && (
              <button onClick={() => setExpanded(isExpanded ? null : entry.id)} style={{ marginTop: 8, background: 'transparent', border: 'none', color: pt.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F, padding: 0 }}>
                {isExpanded ? '▲ Show less' : '▼ Show more' + (entry.reflection ? ' + Reflection' : '')}
              </button>
            )}
          </div>
        )
      })}

      {showAdd && <AddEntryModal onClose={() => setShowAdd(false)} onAdd={e => { setEntries(prev => [e, ...prev]); setShowAdd(false); onXP?.(10) }} />}

      <div style={{ marginTop: 16, background: T.gold + '08', border: '1px solid ' + T.gold + '18', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>⭐ Clinical Logbook — For revalidation, appraisal & CPD tracking</div>
      </div>

      <style>{'@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}'}</style>
    </div>
  )
}
