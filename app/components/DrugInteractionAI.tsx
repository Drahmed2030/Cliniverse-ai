'use client'
import { useState } from 'react'

const F = '"Inter", -apple-system, "SF Pro Display", sans-serif'
const T = {
  card: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.12)',
  text: '#ffffff', sub: 'rgba(148,163,184,0.8)', muted: 'rgba(148,163,184,0.4)',
  teal: '#38bdf8', amber: '#fbbf24', rose: '#f87171', green: '#4ade80', purple: '#a78bfa',
}

const COMMON = ['Warfarin','Aspirin','Metformin','Lisinopril','Atorvastatin','Amiodarone','Digoxin','Furosemide','Metoprolol','Amlodipine','Omeprazole','Clopidogrel']

type Risk = 'safe' | 'moderate' | 'severe' | null

export default function DrugInteractionAI({ onXP }: { onXP?: (n: number) => void }) {
  const [drug1, setDrug1] = useState('')
  const [drug2, setDrug2] = useState('')
  const [result, setResult] = useState<string>('')
  const [risk, setRisk] = useState<Risk>(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!drug1.trim() || !drug2.trim()) return
    setLoading(true)
    setResult('')
    setRisk(null)

    try {
      const res = await fetch('/api/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialty: 'Pharmacology',
          difficulty: 'Advanced',
          userPrompt: 'Check drug interaction between ' + drug1 + ' and ' + drug2 + '. Return JSON: {"risk":"safe|moderate|severe","mechanism":"...","effect":"...","management":"...","clinical_pearl":"..."}',
          systemPrompt: 'You are a clinical pharmacologist. Return ONLY valid JSON with these exact keys: risk, mechanism, effect, management, clinical_pearl. No markdown.',
          fullCase: false,
        }),
      })
      const data = await res.json()
      if (data.success && data.case) {
        const c = data.case
        if (c.risk) {
          setRisk(c.risk as Risk)
          setResult(JSON.stringify(c))
        } else {
          setResult(typeof c === 'string' ? c : JSON.stringify(c))
          setRisk('moderate')
        }
        if (onXP) onXP(15)
      }
    } catch {
      setResult('Network error')
    }
    setLoading(false)
  }

  const riskColor = risk === 'severe' ? T.rose : risk === 'moderate' ? T.amber : T.green
  const riskLabel = risk === 'severe' ? '⛔ SEVERE INTERACTION' : risk === 'moderate' ? '⚠️ MODERATE INTERACTION' : '✅ SAFE COMBINATION'

  let parsed: any = null
  try { if (result) parsed = JSON.parse(result) } catch {}

  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(248,113,113,0.08), rgba(251,191,36,0.06))',
        border: '1px solid rgba(248,113,113,0.15)', borderRadius: 20, padding: '14px 18px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 9, color: T.rose, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>AI Pharmacology</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>Drug Interaction Checker 💊</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Check interactions instantly — powered by AI</div>
      </div>

      {/* Drug Inputs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 6 }}>Drug 1</div>
          <input
            value={drug1} onChange={e => setDrug1(e.target.value)}
            placeholder="e.g. Warfarin"
            style={{ width: '100%', background: T.card, border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '12px 14px', color: T.text, fontSize: 14, fontFamily: F, outline: 'none', boxSizing: 'border-box' as const }}
          />
        </div>
        <div style={{ fontSize: 20, color: T.muted, marginTop: 18 }}>+</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 6 }}>Drug 2</div>
          <input
            value={drug2} onChange={e => setDrug2(e.target.value)}
            placeholder="e.g. Aspirin"
            style={{ width: '100%', background: T.card, border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '12px 14px', color: T.text, fontSize: 14, fontFamily: F, outline: 'none', boxSizing: 'border-box' as const }}
          />
        </div>
      </div>

      {/* Common Drugs */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Common Drugs</div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
          {COMMON.map((d, i) => (
            <button key={i} onClick={() => !drug1 ? setDrug1(d) : setDrug2(d)} style={{
              padding: '5px 12px', borderRadius: 10, border: '1px solid ' + T.border,
              background: T.card, color: T.sub, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: F,
            }}>{d}</button>
          ))}
        </div>
      </div>

      {/* Check Button */}
      <button onClick={check} disabled={loading || !drug1.trim() || !drug2.trim()} style={{
        width: '100%', padding: '15px', border: 'none', borderRadius: 16,
        background: loading || !drug1.trim() || !drug2.trim() ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #f87171, #fbbf24)',
        color: '#fff', fontSize: 14, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
        fontFamily: F, marginBottom: 16,
        boxShadow: loading ? 'none' : '0 6px 24px rgba(248,113,113,0.25)',
      }}>
        {loading ? 'Checking Interaction...' : 'Check Interaction 🔍'}
      </button>

      {/* Result */}
      {parsed && risk && (
        <div>
          {/* Risk Badge */}
          <div style={{
            background: risk === 'severe' ? 'rgba(248,113,113,0.08)' : risk === 'moderate' ? 'rgba(251,191,36,0.08)' : 'rgba(74,222,128,0.08)',
            border: '1px solid ' + riskColor + '30',
            borderRadius: 20, padding: '16px 18px', marginBottom: 12,
            textAlign: 'center' as const,
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{risk === 'severe' ? '⛔' : risk === 'moderate' ? '⚠️' : '✅'}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: riskColor, marginBottom: 4 }}>{riskLabel}</div>
            <div style={{ fontSize: 12, color: T.sub }}>{drug1} + {drug2}</div>
          </div>

          {/* Details */}
          {[
            { label: 'Mechanism', value: parsed.mechanism, icon: '⚙️' },
            { label: 'Clinical Effect', value: parsed.effect, icon: '📊' },
            { label: 'Management', value: parsed.management, icon: '💊' },
            { label: 'Clinical Pearl', value: parsed.clinical_pearl, icon: '💡' },
          ].filter(x => x.value).map((item, i) => (
            <div key={i} style={{
              background: T.card, border: '1px solid ' + T.border,
              borderRadius: 16, padding: '14px 16px', marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const }}>{item.label}</span>
              </div>
              <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.65, margin: 0 }}>{item.value}</p>
            </div>
          ))}

          <button onClick={() => { setDrug1(''); setDrug2(''); setResult(''); setRisk(null) }} style={{
            width: '100%', padding: '12px', border: '1px solid ' + T.border, borderRadius: 14,
            background: 'transparent', color: T.muted, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: F,
          }}>Check Another Pair ↻</button>
        </div>
      )}
      <style>{`input::placeholder{color:rgba(148,163,184,0.3);}`}</style>
    </div>
  )
}
