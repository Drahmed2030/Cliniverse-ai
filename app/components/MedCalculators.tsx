'use client'
import { useState } from 'react'

const CALCS = [
  { id: 'ascvd', name: 'ASCVD Risk Score', icon: '🫀', color: '#ff3b30', desc: '10-year cardiovascular risk' },
  { id: 'chads', name: 'CHA₂DS₂-VASc', icon: '🧠', color: '#00C4B4', desc: 'AF stroke risk score' },
  { id: 'crcl', name: 'CrCl (Cockcroft-Gault)', icon: '🧪', color: '#00C4B4', desc: 'Creatinine clearance' },
  { id: 'curb65', name: 'CURB-65', icon: '🫁', color: '#ff9500', desc: 'Pneumonia severity score' },
  { id: 'timi', name: 'TIMI Score (NSTEMI)', icon: '💊', color: '#30d158', desc: 'ACS risk stratification' },
  { id: 'wells', name: 'Wells Score (PE)', icon: '🩸', color: '#ff6b35', desc: 'PE clinical probability' },
]

function AscvdCalc() {
  const [age, setAge] = useState(55)
  const [sbp, setSbp] = useState(140)
  const [chol, setChol] = useState(200)
  const [hdl, setHdl] = useState(45)
  const [smoker, setSmoker] = useState(false)
  const [diabetic, setDiabetic] = useState(false)
  const [htn, setHtn] = useState(false)

  const risk = Math.min(99, Math.round(
    (age - 40) * 0.8 + (sbp - 110) * 0.15 + (chol - 150) * 0.04 +
    (smoker ? 8 : 0) + (diabetic ? 6 : 0) + (htn ? 4 : 0) - (hdl - 30) * 0.1
  ))
  const riskLevel = risk < 5 ? { label: 'LOW', color: '#16a34a', bg: 'rgba(220,252,231,0.8)' } :
    risk < 10 ? { label: 'BORDERLINE', color: '#d97706', bg: 'rgba(254,243,199,0.8)' } :
    risk < 20 ? { label: 'INTERMEDIATE', color: '#ea580c', bg: 'rgba(255,237,213,0.8)' } :
    { label: 'HIGH', color: '#dc2626', bg: 'rgba(254,226,226,0.8)' }

  const SliderRow = ({ label, val, min, max, step=1, onChange }: any) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{val}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val} onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: '#00C4B4' }} />
    </div>
  )

  return (
    <div>
      <SliderRow label="Age (years)" val={age} min={40} max={79} onChange={setAge} />
      <SliderRow label="Systolic BP (mmHg)" val={sbp} min={90} max={200} onChange={setSbp} />
      <SliderRow label="Total Cholesterol (mg/dL)" val={chol} min={130} max={320} onChange={setChol} />
      <SliderRow label="HDL Cholesterol (mg/dL)" val={hdl} min={20} max={100} onChange={setHdl} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[{ label: '🚬 Smoker', val: smoker, set: setSmoker }, { label: '🍬 Diabetic', val: diabetic, set: setDiabetic }, { label: '💊 HTN Rx', val: htn, set: setHtn }].map(b => (
          <button key={b.label} onClick={() => b.set(!b.val)} style={{ padding: '10px 6px', borderRadius: 12, border: b.val ? '2px solid #0a84ff' : '1px solid rgba(0,196,180,0.25)', background: b.val ? 'rgba(0,196,180,0.10)' : 'rgba(255,255,255,0.14)', fontSize: 11, fontWeight: 700, color: b.val ? '#00C4B4' : 'rgba(255,255,255,0.45)', cursor: 'pointer' }}>{b.label}</button>
        ))}
      </div>
      <div style={{ background: riskLevel.bg, borderRadius: 16, padding: 16, textAlign: 'center', border: `2px solid ${riskLevel.color}33` }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: riskLevel.color, lineHeight: 1 }}>{risk}%</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: riskLevel.color, letterSpacing: 1, marginTop: 4 }}>{riskLevel.label} RISK</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>10-year ASCVD risk</div>
        {risk >= 7.5 && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 8, fontWeight: 600 }}>⚠ Consider statin therapy (AHA/ACC guidelines)</div>}
      </div>
    </div>
  )
}

function ChadsCalc() {
  const [items, setItems] = useState({ chf: false, htn: false, age75: false, dm: false, stroke: false, vasc: false, age65: false, female: false })
  const toggle = (k: keyof typeof items) => setItems(p => ({ ...p, [k]: !p[k] }))
  const score = (items.chf?1:0)+(items.htn?1:0)+(items.age75?2:0)+(items.dm?1:0)+(items.stroke?2:0)+(items.vasc?1:0)+(items.age65?1:0)+(items.female?1:0)
  const strokeRisk = [0, 1.3, 2.2, 3.2, 4.0, 6.7, 9.8, 9.6, 12.5, 15.2]
  const risk = strokeRisk[Math.min(score, 9)]
  const anticoag = score >= 2 ? 'Anticoagulation RECOMMENDED' : score === 1 ? 'Consider anticoagulation' : 'No anticoagulation needed'
  const anticoagColor = score >= 2 ? '#dc2626' : score === 1 ? '#d97706' : '#16a34a'

  const items_list = [
    { key: 'chf', label: 'C — Congestive HF', pts: 1 },
    { key: 'htn', label: 'H — Hypertension', pts: 1 },
    { key: 'age75', label: 'A₂ — Age ≥75', pts: 2 },
    { key: 'dm', label: 'D — Diabetes', pts: 1 },
    { key: 'stroke', label: 'S₂ — Stroke/TIA', pts: 2 },
    { key: 'vasc', label: 'V — Vascular disease', pts: 1 },
    { key: 'age65', label: 'A — Age 65-74', pts: 1 },
    { key: 'female', label: 'Sc — Female sex', pts: 1 },
  ]

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {items_list.map(item => (
          <div key={item.key} onClick={() => toggle(item.key as any)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: (items as any)[item.key] ? 'rgba(0,196,180,0.10)' : 'rgba(255,255,255,0.14)', border: (items as any)[item.key] ? '1.5px solid #0a84ff' : '1px solid rgba(0,196,180,0.25)', cursor: 'pointer' }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: (items as any)[item.key] ? '#00C4B4' : 'transparent', border: (items as any)[item.key] ? 'none' : '2px solid rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {(items as any)[item.key] && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, flex: 1, color: 'white', fontWeight: 500 }}>{item.label}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#00C4B4' }}>+{item.pts}</span>
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 16, padding: 16, textAlign: 'center', border: '1px solid rgba(0,196,180,0.25)' }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#00C4B4', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>Annual stroke risk: {risk}%</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: anticoagColor, padding: '8px 12px', background: `${anticoagColor}15`, borderRadius: 10, border: `1px solid ${anticoagColor}30` }}>{anticoag}</div>
      </div>
    </div>
  )
}

function CrClCalc() {
  const [age, setAge] = useState(60)
  const [weight, setWeight] = useState(70)
  const [creatinine, setCreatinine] = useState(1.2)
  const [female, setFemale] = useState(false)
  const crcl = Math.round(((140 - age) * weight) / (72 * creatinine) * (female ? 0.85 : 1))
  const stage = crcl >= 90 ? { label: 'G1 — Normal', color: '#16a34a' } :
    crcl >= 60 ? { label: 'G2 — Mildly decreased', color: '#22c55e' } :
    crcl >= 45 ? { label: 'G3a — Mild-moderate', color: '#d97706' } :
    crcl >= 30 ? { label: 'G3b — Moderate-severe', color: '#ea580c' } :
    crcl >= 15 ? { label: 'G4 — Severely decreased', color: '#dc2626' } :
    { label: 'G5 — Kidney failure', color: '#7f1d1d' }

  return (
    <div>
      {[{ label: 'Age (years)', val: age, min: 18, max: 100, set: setAge },
        { label: 'Weight (kg)', val: weight, min: 30, max: 200, set: setWeight }].map(s => (
        <div key={s.label} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{s.val}</span>
          </div>
          <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: '100%', accentColor: '#00C4B4' }} />
        </div>
      ))}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Serum Creatinine (mg/dL)</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{creatinine.toFixed(1)}</span>
        </div>
        <input type="range" min={0.4} max={15} step={0.1} value={creatinine} onChange={e => setCreatinine(+e.target.value)} style={{ width: '100%', accentColor: '#00C4B4' }} />
      </div>
      <button onClick={() => setFemale(!female)} style={{ width: '100%', padding: '10px', borderRadius: 12, border: female ? '2px solid #8b5cf6' : '1px solid rgba(0,196,180,0.25)', background: female ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.14)', fontSize: 13, fontWeight: 700, color: female ? '#00C4B4' : 'rgba(255,255,255,0.45)', cursor: 'pointer', marginBottom: 16 }}>
        {female ? '♀ Female (×0.85)' : '♂ Male'}
      </button>
      <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 16, padding: 16, textAlign: 'center', border: '1px solid rgba(0,196,180,0.25)' }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: stage.color, lineHeight: 1 }}>{crcl}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>mL/min — CrCl (Cockcroft-Gault)</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: stage.color, marginTop: 8 }}>{stage.label}</div>
        {crcl < 30 && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 8, fontWeight: 600 }}>⚠ Adjust renally-cleared drugs. Consider nephrology referral.</div>}
        {crcl < 45 && <div style={{ fontSize: 11, color: '#d97706', marginTop: 4, fontWeight: 600 }}>⚠ Avoid contrast if not urgent. Use KDIGO staging.</div>}
      </div>
    </div>
  )
}

function Curb65Calc() {
  const [items, setItems] = useState({ confusion: false, urea: false, rr: false, bp: false, age65: false })
  const toggle = (k: keyof typeof items) => setItems(p => ({ ...p, [k]: !p[k] }))
  const score = Object.values(items).filter(Boolean).length
  const severity = score <= 1 ? { label: 'LOW — Outpatient', color: '#16a34a', mortality: '< 3%', action: 'Oral antibiotics. Discharge safe.' } :
    score === 2 ? { label: 'MODERATE — Admit', color: '#d97706', mortality: '3–15%', action: 'Consider hospital admission. IV antibiotics.' } :
    { label: 'SEVERE — ICU consideration', color: '#dc2626', mortality: '15–40%', action: 'ICU assessment. IV Pip-Taz + Azithromycin.' }

  return (
    <div>
      {[
        { key: 'confusion', label: 'C — New Confusion (AMTS ≤8)' },
        { key: 'urea', label: 'U — Urea > 7 mmol/L (BUN > 19)' },
        { key: 'rr', label: 'R — RR ≥ 30 breaths/min' },
        { key: 'bp', label: 'B — BP < 90/60 mmHg' },
        { key: 'age65', label: '65 — Age ≥ 65 years' },
      ].map(item => (
        <div key={item.key} onClick={() => toggle(item.key as any)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: (items as any)[item.key] ? 'rgba(255,59,48,0.08)' : 'rgba(255,255,255,0.14)', border: (items as any)[item.key] ? '1.5px solid #ff3b30' : '1px solid rgba(0,196,180,0.12)', cursor: 'pointer', marginBottom: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: (items as any)[item.key] ? '#ff3b30' : 'transparent', border: (items as any)[item.key] ? 'none' : '2px solid rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {(items as any)[item.key] && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, flex: 1, color: 'white', fontWeight: 500 }}>{item.label}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#ff3b30' }}>+1</span>
        </div>
      ))}
      <div style={{ background: `${severity.color}15`, borderRadius: 16, padding: 16, textAlign: 'center', border: `2px solid ${severity.color}33`, marginTop: 8 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: severity.color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: severity.color, marginTop: 4 }}>{severity.label}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>30-day mortality: {severity.mortality}</div>
        <div style={{ fontSize: 12, color: severity.color, fontWeight: 600, marginTop: 8, padding: '8px', background: `${severity.color}10`, borderRadius: 10 }}>{severity.action}</div>
      </div>
    </div>
  )
}

function TimiCalc() {
  const [items, setItems] = useState({ age65: false, cad3: false, stDev: false, cardMarker: false, aspirin: false, angina2: false, stenosis: false })
  const toggle = (k: keyof typeof items) => setItems(p => ({ ...p, [k]: !p[k] }))
  const score = Object.values(items).filter(Boolean).length
  const risk = score <= 2 ? { label: 'LOW', color: '#16a34a', event: '4.7%', strategy: 'Conservative management. Serial troponins.' } :
    score <= 4 ? { label: 'INTERMEDIATE', color: '#d97706', event: '13.2%', strategy: 'Early invasive strategy within 24-48h.' } :
    { label: 'HIGH', color: '#dc2626', event: '26.2%', strategy: 'Urgent invasive strategy < 2h. Cath lab.' }

  return (
    <div>
      {[
        { key: 'age65', label: 'Age ≥ 65 years' },
        { key: 'cad3', label: '≥ 3 CAD risk factors' },
        { key: 'stDev', label: 'ST deviation ≥ 0.5mm' },
        { key: 'cardMarker', label: 'Elevated cardiac markers' },
        { key: 'aspirin', label: 'Aspirin use in past 7 days' },
        { key: 'angina2', label: '≥ 2 anginal episodes in 24h' },
        { key: 'stenosis', label: 'Prior stenosis ≥ 50%' },
      ].map(item => (
        <div key={item.key} onClick={() => toggle(item.key as any)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: (items as any)[item.key] ? 'rgba(48,209,88,0.08)' : 'rgba(255,255,255,0.14)', border: (items as any)[item.key] ? '1.5px solid #30d158' : '1px solid rgba(0,196,180,0.12)', cursor: 'pointer', marginBottom: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: (items as any)[item.key] ? '#30d158' : 'transparent', border: (items as any)[item.key] ? 'none' : '2px solid rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {(items as any)[item.key] && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, flex: 1, color: 'white', fontWeight: 500 }}>{item.label}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#30d158' }}>+1</span>
        </div>
      ))}
      <div style={{ background: `${risk.color}12`, borderRadius: 16, padding: 16, textAlign: 'center', border: `2px solid ${risk.color}33`, marginTop: 8 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: risk.color, lineHeight: 1 }}>{score}/7</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: risk.color, marginTop: 4 }}>{risk.label} RISK</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>14-day MACE: {risk.event}</div>
        <div style={{ fontSize: 12, color: risk.color, fontWeight: 600, marginTop: 8 }}>{risk.strategy}</div>
      </div>
    </div>
  )
}

function WellsCalc() {
  const [items, setItems] = useState({ dvt: false, altDx: false, hr100: false, immob: false, priorDvt: false, hemoptysis: false, malignancy: false })
  const toggle = (k: keyof typeof items) => setItems(p => ({ ...p, [k]: !p[k] }))
  const score = (items.dvt?3:0)+(items.altDx?3:0)+(items.hr100?1.5:0)+(items.immob?1.5:0)+(items.priorDvt?1.5:0)+(items.hemoptysis?1:0)+(items.malignancy?1:0)
  const prob = score > 6 ? { label: 'HIGH', color: '#dc2626', risk: '59%', action: 'CT-PA urgently. Start anticoagulation NOW.' } :
    score >= 2 ? { label: 'MODERATE', color: '#d97706', risk: '29%', action: 'CT-PA recommended. D-dimer if CT unavailable.' } :
    { label: 'LOW', color: '#16a34a', risk: '15%', action: 'D-dimer first. CT-PA if D-dimer positive.' }

  return (
    <div>
      {[
        { key: 'dvt', label: 'Clinical signs of DVT', pts: 3 },
        { key: 'altDx', label: 'PE most likely diagnosis', pts: 3 },
        { key: 'hr100', label: 'HR > 100 bpm', pts: 1.5 },
        { key: 'immob', label: 'Immobilisation ≥ 3 days / Surgery < 4 weeks', pts: 1.5 },
        { key: 'priorDvt', label: 'Prior DVT/PE', pts: 1.5 },
        { key: 'hemoptysis', label: 'Haemoptysis', pts: 1 },
        { key: 'malignancy', label: 'Active malignancy', pts: 1 },
      ].map(item => (
        <div key={item.key} onClick={() => toggle(item.key as any)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: (items as any)[item.key] ? 'rgba(255,107,53,0.08)' : 'rgba(255,255,255,0.14)', border: (items as any)[item.key] ? '1.5px solid #ff6b35' : '1px solid rgba(0,196,180,0.12)', cursor: 'pointer', marginBottom: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: (items as any)[item.key] ? '#ff6b35' : 'transparent', border: (items as any)[item.key] ? 'none' : '2px solid rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {(items as any)[item.key] && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, flex: 1, color: 'white', fontWeight: 500 }}>{item.label}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#ff6b35' }}>+{item.pts}</span>
        </div>
      ))}
      <div style={{ background: `${prob.color}12`, borderRadius: 16, padding: 16, textAlign: 'center', border: `2px solid ${prob.color}33`, marginTop: 8 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: prob.color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: prob.color, marginTop: 4 }}>{prob.label} PROBABILITY</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>PE prevalence: {prob.risk}</div>
        <div style={{ fontSize: 12, color: prob.color, fontWeight: 600, marginTop: 8 }}>{prob.action}</div>
      </div>
    </div>
  )
}

export default function MedCalculators() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', paddingBottom: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 4px', letterSpacing: -0.5 }}>Med Calculators</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Evidence-based clinical decision tools</p>
      </div>

      {!active ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {CALCS.map(c => (
            <div key={c.id} onClick={() => setActive(c.id)} style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(20px)', borderRadius: 18, padding: 16, border: '1px solid rgba(0,196,180,0.25)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4, lineHeight: 1.3 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{c.desc}</div>
              <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: `${c.color}20` }}>
                <div style={{ width: '60%', height: '100%', borderRadius: 2, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setActive(null)} style={{ background: 'rgba(0,196,180,0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(139,92,246,0.3)', color: '#6ee7e1', padding: '8px 18px', borderRadius: 20, fontSize: 13, cursor: 'pointer', marginBottom: 16, fontWeight: 600 }}>← Back</button>
          <div style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 18, border: '1px solid rgba(0,196,180,0.25)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: -0.3 }}>
              {CALCS.find(c => c.id === active)?.icon} {CALCS.find(c => c.id === active)?.name}
            </div>
            {active === 'ascvd' && <AscvdCalc />}
            {active === 'chads' && <ChadsCalc />}
            {active === 'crcl' && <CrClCalc />}
            {active === 'curb65' && <Curb65Calc />}
            {active === 'timi' && <TimiCalc />}
            {active === 'wells' && <WellsCalc />}
          </div>
        </div>
      )}
    </div>
  )
}
