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

// ── CALCULATORS ──
const CALCULATORS = [
  {
    id: 'chads2vasc',
    icon: '🫀',
    name: 'CHA₂DS₂-VASc',
    color: T.red,
    category: 'Cardiology',
    description: 'Stroke risk in AF',
    criteria: [
      { id: 'chf',        label: 'Congestive Heart Failure',   points: 1 },
      { id: 'htn',        label: 'Hypertension',               points: 1 },
      { id: 'age75',      label: 'Age ≥ 75 years',             points: 2 },
      { id: 'dm',         label: 'Diabetes Mellitus',          points: 1 },
      { id: 'stroke',     label: 'Stroke / TIA / VTE history', points: 2 },
      { id: 'vasc',       label: 'Vascular disease (MI/PAD)',  points: 1 },
      { id: 'age65',      label: 'Age 65–74 years',            points: 1 },
      { id: 'female',     label: 'Female sex',                 points: 1 },
    ],
    interpret: (score: number) => {
      if (score === 0) return { risk: 'Low', color: T.green,  action: 'No anticoagulation needed', annual: '0%' }
      if (score === 1) return { risk: 'Low-Mod', color: T.gold, action: 'Consider anticoagulation (female only: no Rx)', annual: '1.3%' }
      if (score === 2) return { risk: 'Moderate', color: T.orange, action: 'Anticoagulate (OAC recommended)', annual: '2.2%' }
      return { risk: 'High', color: T.red, action: '🛑 Anticoagulate urgently (OAC required)', annual: `${(score * 1.8).toFixed(1)}%` }
    },
  },
  {
    id: 'wells_pe',
    icon: '🫁',
    name: 'Wells PE Score',
    color: T.purple,
    category: 'Respiratory',
    description: 'Pre-test probability for PE',
    criteria: [
      { id: 'dvt_sx',     label: 'Clinical signs/symptoms of DVT',              points: 3 },
      { id: 'alt_less',   label: 'PE more likely than alternative diagnosis',    points: 3 },
      { id: 'hr',         label: 'Heart rate > 100 bpm',                        points: 1.5 },
      { id: 'immobile',   label: 'Immobilisation or surgery in last 4 weeks',   points: 1.5 },
      { id: 'prev_dvt',   label: 'Previous DVT or PE',                          points: 1.5 },
      { id: 'haemoptysis',label: 'Haemoptysis',                                 points: 1 },
      { id: 'malignancy', label: 'Active malignancy (treatment within 6 months)',points: 1 },
    ],
    interpret: (score: number) => {
      if (score <= 1)  return { risk: 'Low',      color: T.green,  action: 'D-dimer then CTPA if positive', annual: '1.3%' }
      if (score <= 6)  return { risk: 'Moderate', color: T.orange, action: 'D-dimer or proceed to CTPA', annual: '16.2%' }
      return            { risk: 'High',     color: T.red,    action: '🛑 Proceed directly to CTPA', annual: '37.5%' }
    },
  },
  {
    id: 'curb65',
    icon: '🫁',
    name: 'CURB-65',
    color: T.blue,
    category: 'Respiratory',
    description: 'Pneumonia severity',
    criteria: [
      { id: 'confusion',  label: 'Confusion (AMT ≤ 8)',           points: 1 },
      { id: 'urea',       label: 'Urea > 7 mmol/L',              points: 1 },
      { id: 'rr',         label: 'Respiratory rate ≥ 30/min',    points: 1 },
      { id: 'bp',         label: 'BP: systolic <90 or diastolic ≤60 mmHg', points: 1 },
      { id: 'age65',      label: 'Age ≥ 65 years',               points: 1 },
    ],
    interpret: (score: number) => {
      if (score <= 1) return { risk: 'Low',      color: T.green,  action: 'Treat at home (oral antibiotics)', annual: '1–2% mortality' }
      if (score === 2) return { risk: 'Moderate', color: T.orange, action: 'Hospital assessment / short stay', annual: '9% mortality' }
      if (score === 3) return { risk: 'Severe',   color: T.red,    action: '⚠️ Inpatient treatment required', annual: '17% mortality' }
      return           { risk: 'Critical',  color: T.red,    action: '🛑 ICU consideration urgent', annual: '22–54% mortality' }
    },
  },
  {
    id: 'qsofa',
    icon: '🔴',
    name: 'qSOFA',
    color: T.orange,
    category: 'Critical Care',
    description: 'Sepsis quick screen',
    criteria: [
      { id: 'rr22',       label: 'Respiratory rate ≥ 22/min',    points: 1 },
      { id: 'ams',        label: 'Altered mental status (GCS <15)',points: 1 },
      { id: 'sbp',        label: 'Systolic BP ≤ 100 mmHg',       points: 1 },
    ],
    interpret: (score: number) => {
      if (score < 2) return { risk: 'Low',      color: T.green,  action: 'Low risk — reassess if deteriorates', annual: '<10% mortality' }
      return          { risk: 'High',     color: T.red,    action: '🛑 Sepsis likely — urgent assessment + cultures + IV access', annual: '>10% mortality' }
    },
  },
  {
    id: 'gcs',
    icon: '🧠',
    name: 'Glasgow Coma Scale',
    color: T.teal,
    category: 'Neurology',
    description: 'Level of consciousness',
    criteria: [],
    gcsMode: true,
    interpret: (score: number) => {
      if (score >= 13) return { risk: 'Mild',     color: T.green,  action: 'Monitor — reassess regularly', annual: 'Mild impairment' }
      if (score >= 9)  return { risk: 'Moderate', color: T.orange, action: '⚠️ Close monitoring — consider CT', annual: 'Moderate impairment' }
      return            { risk: 'Severe',   color: T.red,    action: '🛑 Airway protection — urgent CT + neurosurgery', annual: 'Severe impairment' }
    },
  },
  {
    id: 'news2',
    icon: '📊',
    name: 'NEWS2',
    color: T.gold,
    category: 'General',
    description: 'Early warning score',
    criteria: [
      { id: 'rr_low',    label: 'RR ≤ 8 or ≥ 25/min',           points: 3 },
      { id: 'spo2_low',  label: 'SpO2 ≤ 93%',                   points: 3 },
      { id: 'o2',        label: 'On supplemental oxygen',        points: 2 },
      { id: 'sbp_low',   label: 'SBP ≤ 90 or ≥ 220 mmHg',      points: 3 },
      { id: 'hr_abn',    label: 'HR ≤ 40 or ≥ 131 bpm',         points: 3 },
      { id: 'temp_abn',  label: 'Temp < 35.0 or ≥ 39.1°C',      points: 2 },
      { id: 'avpu',      label: 'AVPU: V, P, or U (not Alert)',  points: 3 },
    ],
    interpret: (score: number) => {
      if (score === 0)    return { risk: 'Zero',   color: T.green,  action: 'Routine monitoring', annual: 'Minimum 12h obs' }
      if (score <= 4)     return { risk: 'Low',    color: T.teal,   action: 'Increase monitoring frequency', annual: '4–6h obs' }
      if (score <= 6)     return { risk: 'Medium', color: T.orange, action: '⚠️ Urgent clinical review within 1h', annual: '1h obs' }
      return               { risk: 'High',   color: T.red,    action: '🛑 Emergency assessment — consider HDU/ICU', annual: 'Continuous monitoring' }
    },
  },
]

// ── GCS COMPONENT ──
function GCSCalculator({ onScore }: { onScore: (s: number) => void }) {
  const [eye, setEye]    = useState(4)
  const [verbal, setVerbal] = useState(5)
  const [motor, setMotor]  = useState(6)
  const total = eye + verbal + motor

  const EYE    = [{ v: 4, l: 'Spontaneous' }, { v: 3, l: 'To voice' }, { v: 2, l: 'To pain' }, { v: 1, l: 'None' }]
  const VERBAL = [{ v: 5, l: 'Oriented' }, { v: 4, l: 'Confused' }, { v: 3, l: 'Words' }, { v: 2, l: 'Sounds' }, { v: 1, l: 'None' }]
  const MOTOR  = [{ v: 6, l: 'Obeys commands' }, { v: 5, l: 'Localises pain' }, { v: 4, l: 'Withdraws' }, { v: 3, l: 'Flexion' }, { v: 2, l: 'Extension' }, { v: 1, l: 'None' }]

  const update = (e: number, v: number, m: number) => {
    onScore(e + v + m)
  }

  return (
    <div>
      {[
        { label: 'Eye Opening (E)', value: eye, set: (v: number) => { setEye(v); update(v, verbal, motor) }, options: EYE },
        { label: 'Verbal Response (V)', value: verbal, set: (v: number) => { setVerbal(v); update(eye, v, motor) }, options: VERBAL },
        { label: 'Motor Response (M)', value: motor, set: (v: number) => { setMotor(v); update(eye, verbal, v) }, options: MOTOR },
      ].map(row => (
        <div key={row.label} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color:'var(--text-secondary,rgba(10,22,40,0.55))', fontWeight: 700, marginBottom: 8 }}>{row.label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {row.options.map(opt => (
              <div key={opt.v} onClick={() => row.set(opt.v)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: row.value === opt.v ? `${T.teal}18` : T.glass2,
                border: `1px solid ${row.value === opt.v ? T.teal : T.border}`,
                borderRadius: 12, padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: row.value === opt.v ? T.teal : 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                  color: row.value === opt.v ? '#fff' : T.muted,
                }}>{opt.v}</div>
                <span style={{ fontSize: 13, color: row.value === opt.v ? T.text : T.sub, fontWeight: row.value === opt.v ? 700 : 400 }}>{opt.l}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        background: T.glass, border: `1px solid ${T.teal}30`, borderRadius: 16, padding: '14px', marginTop: 8,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: T.teal }}>{total}</div>
          <div style={{ fontSize: 10, color: T.muted }}>GCS TOTAL</div>
        </div>
        <div style={{ width: 1, height: 40, background: T.border }} />
        <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>
          E{eye} + V{verbal} + M{motor}
        </div>
      </div>
    </div>
  )
}

export default function ClinicalRiskCalculator({ onXP }: { onXP?: (n: number) => void }) {
  const [activeCalc, setActiveCalc] = useState<typeof CALCULATORS[0] | null>(null)
  const [checked, setChecked]       = useState<Record<string, boolean>>({})
  const [gcsScore, setGcsScore]     = useState(15)
  const [aiText, setAiText]         = useState('')
  const [aiLoading, setAiLoading]   = useState(false)

  const getScore = (calc: typeof CALCULATORS[0]) => {
    if (calc.gcsMode) return gcsScore
    return calc.criteria.reduce((sum, c) => sum + (checked[c.id] ? c.points : 0), 0)
  }

  const openCalc = (calc: typeof CALCULATORS[0]) => {
    setActiveCalc(calc)
    setChecked({})
    setGcsScore(15)
    setAiText('')
  }

  const getAI = async () => {
    if (!activeCalc) return
    const score = getScore(activeCalc)
    const result = activeCalc.interpret(score)
    setAiLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 350,
          messages: [{
            role: 'user',
            content: `${activeCalc.name} score is ${score} — ${result.risk} risk.
Action: ${result.action}

Give 3 concise clinical bullet points:
1. What this score means clinically
2. Immediate management priority  
3. Key pitfall or clinical pearl to remember

Be direct, practical, evidence-based. No preamble.`
          }]
        })
      })
      const data = await res.json()
      setAiText(data.content?.[0]?.text || '')
      onXP?.(10)
    } catch { setAiText('Connection error.') }
    setAiLoading(false)
  }

  // ── DETAIL VIEW ──
  if (activeCalc) {
    const score  = getScore(activeCalc)
    const result = activeCalc.interpret(score)

    return (
      <div style={{ fontFamily: F }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setActiveCalc(null)} style={{
            background: T.glass, backdropFilter: 'blur(16px)',
            border: `1px solid ${T.border}`, borderRadius: 12,
            padding: '9px 16px', color:'var(--text-secondary,rgba(10,22,40,0.55))', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', fontFamily: F,
          }}>← Back</button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color:'var(--text-primary,#0A1628)' }}>{activeCalc.icon} {activeCalc.name}</div>
            <div style={{ fontSize: 11, color: activeCalc.color, fontWeight: 600 }}>{activeCalc.description}</div>
          </div>
        </div>

        {/* Score display */}
        <div style={{
          background: `${result.color}12`, border: `1.5px solid ${result.color}35`,
          borderRadius: 20, padding: '16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: result.color, lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>SCORE</div>
          </div>
          <div style={{ width: 1, height: 50, background: T.border }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: result.color, marginBottom: 4 }}>{result.risk} Risk</div>
            <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.5 }}>{result.action}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>📊 {result.annual}</div>
          </div>
        </div>

        {/* Criteria */}
        {activeCalc.gcsMode ? (
          <GCSCalculator onScore={setGcsScore} />
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>CRITERIA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeCalc.criteria.map(c => (
                <div key={c.id} onClick={() => setChecked(prev => ({ ...prev, [c.id]: !prev[c.id] }))} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: checked[c.id] ? `${activeCalc.color}15` : T.glass,
                  border: `1px solid ${checked[c.id] ? activeCalc.color + '40' : T.border}`,
                  borderRadius: 14, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                    background: checked[c.id] ? activeCalc.color : 'rgba(255,255,255,0.08)',
                    border: `1.5px solid ${checked[c.id] ? activeCalc.color : T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: 'var(--text-primary,#0A1628)', transition: 'all 0.15s',
                  }}>
                    {checked[c.id] ? '✓' : ''}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: checked[c.id] ? T.text : T.sub, fontWeight: checked[c.id] ? 700 : 400 }}>
                    {c.label}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 800,
                    color: checked[c.id] ? activeCalc.color : T.muted,
                    background: checked[c.id] ? `${activeCalc.color}15` : 'rgba(255,255,255,0.05)',
                    borderRadius: 8, padding: '2px 8px',
                  }}>+{c.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Interpretation */}
        <button onClick={getAI} disabled={aiLoading} style={{
          width: '100%', padding: '14px', borderRadius: 16, border: 'none',
          background: aiLoading ? 'rgba(175,82,222,0.15)' : `linear-gradient(135deg,${T.purple},${T.blue})`,
          color: 'var(--text-primary,#0A1628)', fontSize: 13, fontWeight: 800,
          cursor: aiLoading ? 'not-allowed' : 'pointer', fontFamily: F,
          boxShadow: aiLoading ? 'none' : `0 6px 20px ${T.purple}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 14, marginTop: 4,
        }}>
          {aiLoading
            ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />Generating insight...</>
            : '🤖 AI Clinical Interpretation'
          }
        </button>

        {aiText && (
          <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.purple}25`, borderRadius: 16, padding: '16px', marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: T.purple, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>🤖 AI INSIGHT</div>
            <div style={{ fontSize: 13, color:'var(--text-secondary,rgba(10,22,40,0.55))', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{aiText}</div>
          </div>
        )}

        <div style={{ background: `${T.gold}08`, border: `1px solid ${T.gold}18`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: T.muted }}>⭐ Use alongside clinical judgement — scores guide, not dictate</div>
        </div>

        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  // ── LIST VIEW ──
  return (
    <div style={{ fontFamily: F }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: `${T.purple}CC`, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>CLINICAL DECISION</div>
        <div style={{ fontSize: 22, fontWeight: 900, color:'var(--text-primary,#0A1628)', letterSpacing: -0.5 }}>
          Risk <span style={{ color: T.purple }}>Calculators</span>
        </div>
        <div style={{ fontSize: 12, color:'var(--text-secondary,rgba(10,22,40,0.55))', marginTop: 4 }}>6 validated scores · AI interpretation</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CALCULATORS.map(calc => (
          <div key={calc.id} onClick={() => openCalc(calc)} style={{
            background: T.glass, backdropFilter: 'blur(16px)',
            border: `1px solid ${calc.color}22`,
            borderRadius: 18, padding: '16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle,${calc.color}08,transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{
              width: 50, height: 50, borderRadius: 15, flexShrink: 0,
              background: `${calc.color}15`, border: `1px solid ${calc.color}28`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>{calc.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color:'var(--text-primary,#0A1628)', marginBottom: 2 }}>{calc.name}</div>
              <div style={{ fontSize: 11, color:'var(--text-secondary,rgba(10,22,40,0.55))' }}>{calc.description}</div>
              <div style={{ fontSize: 10, color: calc.color, fontWeight: 600, marginTop: 3 }}>{calc.category}</div>
            </div>
            <div style={{
              background: `${calc.color}15`, border: `1px solid ${calc.color}28`,
              borderRadius: 12, padding: '6px 12px', fontSize: 11,
              color: calc.color, fontWeight: 700, flexShrink: 0,
            }}>
              {calc.gcsMode ? '3–15' : `0–${calc.criteria.reduce((s, c) => s + c.points, 0)}`} pts
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, background: `${T.gold}08`, border: `1px solid ${T.gold}18`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>⭐ All scores validated — use alongside clinical judgement</div>
      </div>
    </div>
  )
}
