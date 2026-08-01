'use client'
import { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'var(--bg-card,rgba(255,255,255,0.07))',
  glass2: 'var(--bg-card,rgba(255,255,255,0.04))',
  border: 'var(--border-card,rgba(255,255,255,0.12))',
  text:   'var(--text-primary,#EEF6FA)',
  sub:    'var(--text-secondary,rgba(238,246,250,0.72))',
  muted:  'var(--text-muted,rgba(238,246,250,0.50))',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

// ── DRUG DATABASE ──
const DRUGS = [
  {
    name: 'Vancomycin',
    icon: '💉',
    color: T.red,
    category: 'Antibiotic',
    normalDose: '15–20 mg/kg IV Q8–12h',
    renalAdjustment: [
      { egfr: [60, 999], dose: '15–20 mg/kg', interval: 'Q8–12h', note: 'Standard dosing. Monitor levels.' },
      { egfr: [30, 59],  dose: '15–20 mg/kg', interval: 'Q24h',   note: 'Extended interval. Target trough 15–20.' },
      { egfr: [15, 29],  dose: '15–20 mg/kg', interval: 'Q48h',   note: 'Monitor closely. Check levels before each dose.' },
      { egfr: [0, 14],   dose: '15–20 mg/kg', interval: 'Q72–96h', note: '⚠️ HD patients: give after dialysis. Level-guided.' },
    ],
    monitoring: 'Trough: 15–20 mg/L (AUC-guided preferred)',
    caution: 'Nephrotoxic — avoid concurrent NSAIDs/aminoglycosides',
  },
  {
    name: 'Gentamicin',
    icon: '🧬',
    color: T.orange,
    category: 'Antibiotic',
    normalDose: '5–7 mg/kg IV Q24h',
    renalAdjustment: [
      { egfr: [60, 999], dose: '5–7 mg/kg',   interval: 'Q24h',   note: 'Standard once-daily dosing.' },
      { egfr: [40, 59],  dose: '4–5 mg/kg',   interval: 'Q36h',   note: 'Reduce dose and extend interval.' },
      { egfr: [20, 39],  dose: '3–4 mg/kg',   interval: 'Q48h',   note: 'Level monitoring essential.' },
      { egfr: [0, 19],   dose: '2 mg/kg',     interval: 'Q72h+',  note: '⚠️ Avoid if possible. HD: give post-dialysis.' },
    ],
    monitoring: 'Peak: 5–10 mg/L | Trough: <1 mg/L',
    caution: 'Highly nephrotoxic & ototoxic — avoid in CKD if alternatives exist',
  },
  {
    name: 'Metformin',
    icon: '💊',
    color: T.blue,
    category: 'Antidiabetic',
    normalDose: '500–1000mg BD',
    renalAdjustment: [
      { egfr: [60, 999], dose: '500–1000mg',  interval: 'BD',     note: 'Full dose permitted.' },
      { egfr: [45, 59],  dose: '500–1000mg',  interval: 'BD',     note: 'Continue with caution. Monitor renal function 3–6 monthly.' },
      { egfr: [30, 44],  dose: '500mg',       interval: 'BD',     note: '⚠️ Reduce dose. Monitor closely.' },
      { egfr: [0, 29],   dose: 'STOP',        interval: '—',      note: '🛑 Contraindicated — lactic acidosis risk.' },
    ],
    monitoring: 'eGFR every 3–6 months',
    caution: 'Stop before contrast/surgery. Lactic acidosis risk if eGFR <30.',
  },
  {
    name: 'Enoxaparin',
    icon: '🩸',
    color: T.red,
    category: 'Anticoagulant',
    normalDose: '1 mg/kg SC BD (therapeutic)',
    renalAdjustment: [
      { egfr: [30, 999], dose: '1 mg/kg',     interval: 'SC BD',  note: 'Standard therapeutic dose.' },
      { egfr: [15, 29],  dose: '1 mg/kg',     interval: 'SC OD',  note: '⚠️ Reduce to once daily. Monitor anti-Xa.' },
      { egfr: [0, 14],   dose: '0.5–1 mg/kg', interval: 'SC OD',  note: '🛑 High bleed risk. Use UFH if possible. Anti-Xa guided.' },
    ],
    monitoring: 'Anti-Xa: 0.5–1.0 IU/mL (therapeutic)',
    caution: 'Accumulates in renal failure — UFH preferred in severe CKD',
  },
  {
    name: 'Amoxicillin-Clavulanate',
    icon: '🔬',
    color: T.green,
    category: 'Antibiotic',
    normalDose: '625mg TDS or 1g BD',
    renalAdjustment: [
      { egfr: [30, 999], dose: '625mg',       interval: 'TDS',    note: 'Standard dosing.' },
      { egfr: [10, 29],  dose: '625mg',       interval: 'BD',     note: 'Reduce frequency.' },
      { egfr: [0, 9],    dose: '625mg',       interval: 'OD',     note: '⚠️ Once daily. HD: give after dialysis.' },
    ],
    monitoring: 'Clinical response. LFTs if prolonged use.',
    caution: 'Cholestatic jaundice risk with prolonged use',
  },
  {
    name: 'Digoxin',
    icon: '❤️',
    color: T.purple,
    category: 'Cardiac',
    normalDose: '125–250 mcg OD',
    renalAdjustment: [
      { egfr: [60, 999], dose: '125–250 mcg', interval: 'OD',     note: 'Standard. Monitor levels.' },
      { egfr: [30, 59],  dose: '125 mcg',     interval: 'OD',     note: 'Reduce dose. Check levels.' },
      { egfr: [10, 29],  dose: '62.5–125 mcg',interval: 'OD',     note: '⚠️ Use with caution. Frequent levels.' },
      { egfr: [0, 9],    dose: '62.5 mcg',    interval: 'OD/EOD', note: '🛑 Avoid if possible. Toxicity risk.' },
    ],
    monitoring: 'Digoxin level: 0.5–1.0 ng/mL (heart failure). Check K+.',
    caution: 'Narrow therapeutic index — hypokalaemia increases toxicity',
  },
  {
    name: 'Ramipril',
    icon: '🫀',
    color: T.teal,
    category: 'ACE Inhibitor',
    normalDose: '2.5–10mg OD',
    renalAdjustment: [
      { egfr: [30, 999], dose: '2.5–10mg',    interval: 'OD',     note: 'Standard dosing. Monitor K+ and creatinine.' },
      { egfr: [10, 29],  dose: '1.25–5mg',    interval: 'OD',     note: '⚠️ Start low. Watch for hyperkalaemia.' },
      { egfr: [0, 9],    dose: 'Use caution', interval: '—',      note: '🛑 Seek specialist advice. Dialysis patients: variable.' },
    ],
    monitoring: 'U&E at 1–2 weeks after start/dose change. Stop if Cr rises >30%.',
    caution: 'Stop if AKI develops. Avoid with K+-sparing diuretics.',
  },
  {
    name: 'Gabapentin',
    icon: '🧠',
    color: T.gold,
    category: 'Neuropathic',
    normalDose: '300–1200mg TDS',
    renalAdjustment: [
      { egfr: [60, 999], dose: '300–1200mg',  interval: 'TDS',    note: 'Standard dosing.' },
      { egfr: [30, 59],  dose: '300–600mg',   interval: 'BD',     note: 'Reduce dose and frequency.' },
      { egfr: [15, 29],  dose: '300mg',       interval: 'OD–BD',  note: '⚠️ Significant reduction required.' },
      { egfr: [0, 14],   dose: '300mg',       interval: 'OD',     note: '🛑 HD: give 200–300mg after each session.' },
    ],
    monitoring: 'Clinical response. Sedation and dizziness common.',
    caution: 'Sedating — caution in elderly. Risk of respiratory depression.',
  },
]

const CKD_STAGES = [
  { stage: 'G1', egfr: '≥90',    label: 'Normal',           color: T.green  },
  { stage: 'G2', egfr: '60–89',  label: 'Mildly reduced',   color: T.teal   },
  { stage: 'G3a',egfr: '45–59',  label: 'Mild-moderate',    color: T.gold   },
  { stage: 'G3b',egfr: '30–44',  label: 'Moderate-severe',  color: T.orange },
  { stage: 'G4', egfr: '15–29',  label: 'Severely reduced', color: '#FF6B35'},
  { stage: 'G5', egfr: '<15',    label: 'Kidney failure',   color: T.red    },
]

function getCKDStage(egfr: number) {
  if (egfr >= 90) return CKD_STAGES[0]
  if (egfr >= 60) return CKD_STAGES[1]
  if (egfr >= 45) return CKD_STAGES[2]
  if (egfr >= 30) return CKD_STAGES[3]
  if (egfr >= 15) return CKD_STAGES[4]
  return CKD_STAGES[5]
}

function getDrugDose(drug: typeof DRUGS[0], egfr: number) {
  for (const adj of drug.renalAdjustment) {
    if (egfr >= adj.egfr[0] && egfr <= adj.egfr[1]) return adj
  }
  return drug.renalAdjustment[drug.renalAdjustment.length - 1]
}

// ── AI ANALYSIS ──
async function getAIAnalysis(drug: typeof DRUGS[0], egfr: number, weight: number, age: number) {
  const adj = getDrugDose(drug, egfr)
  const stage = getCKDStage(egfr)
  const prompt = `You are a clinical pharmacist. Provide a brief renal dosing recommendation for:
Drug: ${drug.name}
Patient: ${age}y, ${weight}kg, eGFR ${egfr} mL/min/1.73m² (CKD Stage ${stage.stage} - ${stage.label})
Standard recommendation: ${adj.dose} ${adj.interval}
Note: ${adj.note}

Give 3-4 sentences covering: dose rationale, monitoring parameters, key safety alert, and one practical tip. Be concise and clinical.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  return data.content?.[0]?.text || 'Unable to generate analysis.'
}

export default function RenalDosingAI({ onXP }: { onXP?: (n: number) => void }) {
  const [egfr, setEgfr]       = useState(45)
  const [weight, setWeight]   = useState(70)
  const [age, setAge]         = useState(60)
  const [selected, setSelected] = useState<typeof DRUGS[0] | null>(null)
  const [aiText, setAiText]   = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView]       = useState<'list' | 'detail'>('list')

  const stage = getCKDStage(egfr)

  const openDrug = async (drug: typeof DRUGS[0]) => {
    setSelected(drug)
    setView('detail')
    setAiText('')
    setLoading(true)
    try {
      const text = await getAIAnalysis(drug, egfr, weight, age)
      setAiText(text)
      onXP?.(10)
    } catch { setAiText('Connection error. Please try again.') }
    setLoading(false)
  }

  // ── DETAIL VIEW ──
  if (view === 'detail' && selected) {
    const adj = getDrugDose(selected, egfr)
    const isStop = adj.dose === 'STOP'

    return (
      <div style={{ fontFamily: F }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setView('list')} style={{
            background: T.glass, backdropFilter: 'blur(16px)',
            border: `1px solid ${T.border}`, borderRadius: 12,
            padding: '9px 16px', color: T.sub, fontSize: 13,
            fontWeight: 700, cursor: 'pointer', fontFamily: F,
          }}>← Back</button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: T.text }}>{selected.icon} {selected.name}</div>
            <div style={{ fontSize: 11, color: selected.color, fontWeight: 600 }}>{selected.category}</div>
          </div>
        </div>

        {/* Patient summary */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16,
          background: T.glass2, borderRadius: 14, padding: '12px 14px',
          border: `1px solid ${T.border}`,
        }}>
          {[
            { l: 'eGFR', v: `${egfr}`, u: 'mL/min' },
            { l: 'Weight', v: `${weight}`, u: 'kg' },
            { l: 'Age', v: `${age}`, u: 'yrs' },
            { l: 'CKD', v: stage.stage, u: stage.label.split(' ')[0] },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: stage.color }}>{s.v}</div>
              <div style={{ fontSize: 8, color: T.muted, marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Recommended dose */}
        <div style={{
          background: isStop ? 'rgba(255,59,48,0.10)' : `${selected.color}10`,
          border: `1.5px solid ${isStop ? T.red : selected.color}35`,
          borderRadius: 20, padding: '18px', marginBottom: 14,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle,${isStop ? T.red : selected.color}15,transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ fontSize: 10, color: isStop ? T.red : selected.color, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>RECOMMENDED DOSE FOR eGFR {egfr}</div>

          {isStop ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 32 }}>🛑</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: T.red }}>CONTRAINDICATED</div>
                <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>{adj.note}</div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: selected.color }}>{adj.dose}</div>
                  <div style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>DOSE</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: selected.color }}>{adj.interval}</div>
                  <div style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>INTERVAL</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                {adj.note}
              </div>
            </div>
          )}
        </div>

        {/* Monitoring */}
        <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.border}`, borderRadius: 16, padding: '14px', marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: T.teal, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>📊 MONITORING</div>
          <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>{selected.monitoring}</div>
        </div>

        {/* Caution */}
        <div style={{ background: 'rgba(255,149,0,0.08)', border: `1px solid ${T.orange}25`, borderRadius: 16, padding: '14px', marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: T.orange, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>⚠️ CAUTION</div>
          <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.6 }}>{selected.caution}</div>
        </div>

        {/* AI Analysis */}
        <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.purple}25`, borderRadius: 16, padding: '16px' }}>
          <div style={{ fontSize: 9, color: T.purple, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>🤖 AI CLINICAL ANALYSIS</div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid rgba(175,82,222,0.3)`, borderTop: `2px solid ${T.purple}`, animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 12, color: T.muted }}>Analysing renal dosing...</span>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{aiText}</div>
          )}
        </div>

        <div style={{ marginTop: 16, background: `${T.gold}08`, border: `1px solid ${T.gold}18`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: T.muted }}>⭐ Educational use only — always verify with local guidelines & pharmacist</div>
        </div>

        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  // ── LIST VIEW ──
  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: `${T.teal}CC`, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>RENAL DOSING AI</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
          Renal <span style={{ color: T.teal }}>Dose</span> Calculator
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Adjust drug doses based on eGFR in real time</div>
      </div>

      {/* Patient inputs */}
      <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: `1px solid ${T.border}`, borderRadius: 20, padding: '16px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 14 }}>PATIENT PARAMETERS</div>

        {/* eGFR slider */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>eGFR</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: stage.color }}>{egfr} <span style={{ fontSize: 10, fontWeight: 600 }}>mL/min/1.73m²</span></span>
          </div>
          <input type="range" min={1} max={120} value={egfr} onChange={e => setEgfr(+e.target.value)}
            style={{ width: '100%', accentColor: stage.color }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 9, color: T.muted }}>1 (ESRD)</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: stage.color }}>CKD {stage.stage} — {stage.label}</span>
            <span style={{ fontSize: 9, color: T.muted }}>120 (Normal)</span>
          </div>
        </div>

        {/* Weight + Age */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>Weight</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: T.teal }}>{weight} kg</span>
            </div>
            <input type="range" min={30} max={150} value={weight} onChange={e => setWeight(+e.target.value)}
              style={{ width: '100%', accentColor: T.teal }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>Age</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: T.blue }}>{age} yrs</span>
            </div>
            <input type="range" min={18} max={95} value={age} onChange={e => setAge(+e.target.value)}
              style={{ width: '100%', accentColor: T.blue }} />
          </div>
        </div>
      </div>

      {/* CKD Stage bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        {CKD_STAGES.map(s => (
          <div key={s.stage} style={{
            flex: 1, borderRadius: 8, padding: '6px 2px', textAlign: 'center',
            background: stage.stage === s.stage ? `${s.color}25` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${stage.stage === s.stage ? s.color : 'rgba(255,255,255,0.06)'}`,
            transition: 'all 0.2s',
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: stage.stage === s.stage ? s.color : T.muted }}>{s.stage}</div>
          </div>
        ))}
      </div>

      {/* Drug list */}
      <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>SELECT DRUG</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DRUGS.map(drug => {
          const adj = getDrugDose(drug, egfr)
          const isStop = adj.dose === 'STOP'
          const isWarning = adj.note.includes('⚠️') || adj.note.includes('🛑')

          return (
            <div key={drug.name} onClick={() => openDrug(drug)} style={{
              background: T.glass, backdropFilter: 'blur(16px)',
              border: `1px solid ${isStop ? T.red : isWarning ? T.orange : drug.color}22`,
              borderRadius: 18, padding: '14px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderRadius: '50%', background: `radial-gradient(circle,${drug.color}08,transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: `${drug.color}15`, border: `1px solid ${drug.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{drug.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 2 }}>{drug.name}</div>
                <div style={{ fontSize: 11, color: T.sub }}>{drug.category}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 11, fontWeight: 800,
                  color: isStop ? T.red : isWarning ? T.orange : drug.color,
                  background: isStop ? 'rgba(255,59,48,0.12)' : isWarning ? 'rgba(255,149,0,0.12)' : `${drug.color}12`,
                  border: `1px solid ${isStop ? T.red : isWarning ? T.orange : drug.color}25`,
                  borderRadius: 8, padding: '3px 8px', marginBottom: 3,
                }}>
                  {isStop ? '🛑 STOP' : `${adj.dose}`}
                </div>
                <div style={{ fontSize: 10, color: T.muted }}>{isStop ? 'Contraindicated' : adj.interval}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 16, background: `${T.gold}08`, border: `1px solid ${T.gold}18`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>⭐ Educational use only — verify with BNF/local formulary</div>
      </div>
    </div>
  )
}
