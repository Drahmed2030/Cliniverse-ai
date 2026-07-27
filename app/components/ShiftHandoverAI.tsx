'use client'
import { useState } from 'react'

const F = '"Inter", -apple-system, "SF Pro Display", sans-serif'
const T = {
  card: 'rgba(255,255,255,0.11)', border: 'rgba(255,255,255,0.18)',
  text: '#ffffff', sub: 'rgba(148,163,184,0.8)', muted: 'rgba(148,163,184,0.4)',
  teal: '#38bdf8', amber: '#fbbf24', rose: '#f87171', green: '#4ade80', purple: '#a78bfa',
}

export default function ShiftHandoverAI({ onXP }: { onXP?: (n: number) => void }) {
  const [patients, setPatients] = useState('')
  const [ward, setWard] = useState('ICU')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!patients.trim()) return
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: 'Clinical Handover',
          difficulty: 'Advanced',
          userPrompt: 'Generate a professional SBAR shift handover report for ' + ward + ' ward. Patients: ' + patients + '. Format as structured SBAR handover with patient summaries, outstanding tasks, and overnight concerns. Use clinical language.',
          systemPrompt: 'You are a senior physician writing a professional shift handover report. Write in clear clinical language. Include SBAR format, patient summaries, pending tasks, and overnight concerns. Plain text format, well structured.',
          fullCase: false,
        }),
      })
      const data = await res.json()
      if (data.success && data.case) {
        const c = data.case
        let text = ''
        if (typeof c === 'string') text = c
        else if (c.management) text = c.management.join('\n\n')
        else text = JSON.stringify(c, null, 2)
        setResult(text)
        if (onXP) onXP(20)
      }
    } catch {
      setResult('Network error. Please try again.')
    }
    setLoading(false)
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(56,189,248,0.06))',
        border: '1px solid rgba(74,222,128,0.15)', borderRadius: 20, padding: '14px 18px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 9, color: T.green, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>AI SBAR Generator</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Shift Handover AI 📋</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Generate professional SBAR handover in seconds</div>
      </div>

      {/* Ward Selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Ward / Department</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {['ICU', 'CCU', 'ED', 'Medical Ward', 'Surgical Ward', 'Pediatrics'].map(w => (
            <button key={w} onClick={() => setWard(w)} style={{
              padding: '7px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontFamily: F, fontWeight: 700, fontSize: 12,
              background: ward === w ? T.green : T.card,
              color: ward === w ? '#1e2d40' : T.muted,
              border: '1px solid ' + (ward === w ? T.green : T.border),
              boxShadow: ward === w ? '0 4px 12px rgba(74,222,128,0.25)' : 'none',
            }}>{w}</button>
          ))}
        </div>
      </div>

      {/* Patient Input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Patient Summary (brief notes)</div>
        <textarea
          value={patients}
          onChange={e => setPatients(e.target.value)}
          placeholder={'Bed 1: 65M, post-CABG day 2, stable, on heparin drip\nBed 2: 45F, DKA, improving, K+ 3.2 needs replacement\nBed 3: 78M, septic shock, on noradrenaline 0.3mcg/kg/min'}
          rows={5}
          style={{
            width: '100%', background: T.card, border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: 16, padding: '14px 16px', color: T.text, fontSize: 13,
            fontFamily: F, outline: 'none', resize: 'none' as const, boxSizing: 'border-box' as const,
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Generate Button */}
      <button onClick={generate} disabled={loading || !patients.trim()} style={{
        width: '100%', padding: '15px', border: 'none', borderRadius: 16,
        background: loading || !patients.trim() ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #4ade80, #38bdf8)',
        color: '#1e2d40', fontSize: 14, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
        fontFamily: F, marginBottom: 16,
        boxShadow: loading ? 'none' : '0 6px 24px rgba(74,222,128,0.25)',
      }}>
        {loading ? 'Generating Handover...' : 'Generate SBAR Report 📋'}
      </button>

      {/* Result */}
      {result && (
        <div>
          <div style={{
            background: T.card, border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: 20, padding: '18px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: T.green, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>
                {ward} Handover Report
              </div>
              <button onClick={copy} style={{
                padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(74,222,128,0.3)',
                background: copied ? 'rgba(74,222,128,0.15)' : 'transparent',
                color: T.green, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F,
              }}>
                {copied ? '✓ Copied!' : 'Copy 📋'}
              </button>
            </div>
            <pre style={{
              fontSize: 12, color: T.sub, lineHeight: 1.7, margin: 0,
              whiteSpace: 'pre-wrap' as const, fontFamily: F,
            }}>{result}</pre>
          </div>

          <button onClick={() => { setResult(''); setPatients('') }} style={{
            width: '100%', padding: '12px', border: '1px solid ' + T.border, borderRadius: 14,
            background: 'transparent', color: T.muted, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: F,
          }}>New Handover ↻</button>
        </div>
      )}
      <style>{`textarea::placeholder{color:rgba(148,163,184,0.25);}textarea{scrollbar-width:none;}`}</style>
    </div>
  )
}
