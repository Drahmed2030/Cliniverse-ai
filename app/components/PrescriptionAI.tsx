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

const DIAGNOSES = [
  'Hypertension', 'Type 2 Diabetes', 'Heart Failure', 'Atrial Fibrillation',
  'COPD', 'Asthma', 'Community Acquired Pneumonia', 'UTI',
  'Acute Coronary Syndrome', 'DVT / PE', 'CKD', 'Hypothyroidism',
  'GERD', 'Depression', 'Anxiety', 'Osteoporosis', 'Gout', 'Epilepsy',
]

const ALLERGIES = ['Penicillin', 'Sulfa', 'NSAIDs', 'Aspirin', 'Codeine', 'Contrast dye']

interface RxForm {
  patientName: string
  age: string
  gender: string
  weight: string
  egfr: string
  diagnosis: string
  customDiagnosis: string
  allergies: string[]
  comorbidities: string
  currentMeds: string
  language: 'en' | 'ar'
}

export default function PrescriptionAI({ onXP }: { onXP?: (n: number) => void }) {
  const [form, setForm] = useState<RxForm>({
    patientName: '', age: '', gender: 'M', weight: '', egfr: '',
    diagnosis: '', customDiagnosis: '', allergies: [],
    comorbidities: '', currentMeds: '', language: 'en',
  })
  const [prescription, setPrescription] = useState('')
  const [generating, setGenerating]     = useState(false)
  const [copied, setCopied]             = useState(false)
  const [step, setStep]                 = useState<'form' | 'result'>('form')

  const toggleAllergy = (a: string) => {
    setForm(prev => ({
      ...prev,
      allergies: prev.allergies.includes(a)
        ? prev.allergies.filter(x => x !== a)
        : [...prev.allergies, a]
    }))
  }

  const generate = async () => {
    const dx = form.customDiagnosis || form.diagnosis
    if (!dx) return
    setGenerating(true)

    const prompt = form.language === 'en'
      ? `You are a senior clinician. Generate a complete evidence-based prescription for:
Patient: ${form.patientName || 'Patient'}, ${form.age}y ${form.gender}, ${form.weight}kg${form.egfr ? ', eGFR ' + form.egfr : ''}
Diagnosis: ${dx}
Allergies: ${form.allergies.length > 0 ? form.allergies.join(', ') : 'NKDA'}
Comorbidities: ${form.comorbidities || 'None'}
Current medications: ${form.currentMeds || 'None'}

Write a professional prescription including:
1. MEDICATIONS: Drug name, dose, route, frequency, duration
2. RENAL ADJUSTMENTS: If eGFR provided, adjust doses accordingly
3. MONITORING: Key parameters to check
4. PATIENT ADVICE: 2-3 key instructions
5. FOLLOW-UP: When to review

Use standard medical abbreviations. Flag any drug interactions with current meds.`

      : `أنت طبيب استشاري. اكتب وصفة طبية كاملة مبنية على الأدلة لـ:
المريض: ${form.patientName || 'المريض'}, ${form.age} سنة, ${form.gender === 'M' ? 'ذكر' : 'أنثى'}, ${form.weight} كجم${form.egfr ? ', معدل الترشيح الكبيبي ' + form.egfr : ''}
التشخيص: ${dx}
الحساسية: ${form.allergies.length > 0 ? form.allergies.join('، ') : 'لا توجد حساسية'}
الأمراض المصاحبة: ${form.comorbidities || 'لا يوجد'}
الأدوية الحالية: ${form.currentMeds || 'لا يوجد'}

اكتب وصفة طبية احترافية تتضمن:
١. الأدوية: الاسم، الجرعة، طريقة الإعطاء، التكرار، المدة
٢. تعديل الجرعة: حسب وظائف الكلى إذا توفرت
٣. المراقبة: المعايير المهمة للمتابعة
٤. إرشادات المريض: ٢-٣ تعليمات أساسية
٥. المتابعة: موعد المراجعة`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      setPrescription(data.content?.[0]?.text || 'Could not generate prescription.')
      setStep('result')
      onXP?.(20)
    } catch { setPrescription('Connection error. Please try again.') }
    setGenerating(false)
  }

  const copy = () => {
    navigator.clipboard.writeText(prescription)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── RESULT VIEW ──
  if (step === 'result') {
    const dx = form.customDiagnosis || form.diagnosis
    return (
      <div style={{ fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => setStep('form')} style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 12, padding: '9px 16px', color: T.sub, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← New Rx</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>💊 Prescription</div>
            <div style={{ fontSize: 11, color: T.teal }}>{dx} · {form.patientName || 'Patient'}</div>
          </div>
          <button onClick={copy} style={{ background: copied ? T.green + '20' : T.glass, border: '1px solid ' + (copied ? T.green : T.border), borderRadius: 12, padding: '8px 14px', color: copied ? T.green : T.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
            {copied ? '✓' : '📋'}
          </button>
        </div>

        {/* Patient summary */}
        <div style={{ background: T.glass2, border: '1px solid ' + T.border, borderRadius: 14, padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { l: 'Patient', v: form.patientName || '—' },
            { l: 'Age/Sex', v: form.age + form.gender },
            { l: 'Weight',  v: form.weight ? form.weight + 'kg' : '—' },
            { l: 'eGFR',   v: form.egfr || '—' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center', flex: 1, minWidth: 60 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{s.v}</div>
              <div style={{ fontSize: 9, color: T.muted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Allergy warning */}
        {form.allergies.length > 0 && (
          <div style={{ background: 'rgba(255,59,48,0.10)', border: '1px solid ' + T.red + '30', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 12, color: T.red, fontWeight: 700 }}>Allergies: {form.allergies.join(', ')}</span>
          </div>
        )}

        {/* Prescription */}
        <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.green + '25', borderRadius: 20, padding: '18px', marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: T.green, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>💊 AI PRESCRIPTION</div>
          <div style={{ fontSize: 13, color: T.sub, lineHeight: 2, whiteSpace: 'pre-line', direction: form.language === 'ar' ? 'rtl' : 'ltr' }}>{prescription}</div>
        </div>

        <div style={{ background: T.gold + '08', border: '1px solid ' + T.gold + '18', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: T.muted }}>⭐ Always verify doses with BNF/local formulary before prescribing</div>
        </div>
      </div>
    )
  }

  // ── FORM VIEW ──
  return (
    <div style={{ fontFamily: F }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: T.green + 'CC', fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>AI PRESCRIPTION WRITER</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
          Rx <span style={{ color: T.green }}>Generator</span>
        </div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>Evidence-based · Renal-adjusted · EN + AR</div>
      </div>

      {/* Language toggle */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4, marginBottom: 16, border: '1px solid rgba(255,255,255,0.10)' }}>
        {([['en', '🇬🇧 English'], ['ar', '🇸🇦 العربية']] as [string, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setForm(prev => ({ ...prev, language: id as any }))} style={{ flex: 1, padding: '9px', cursor: 'pointer', borderRadius: 10, fontFamily: F, fontWeight: 700, fontSize: 12, border: form.language === id ? '1px solid ' + T.green + '25' : '1px solid transparent', background: form.language === id ? 'rgba(255,255,255,0.10)' : 'transparent', color: form.language === id ? T.green : T.muted, transition: 'all 0.2s' }}>{label}</button>
        ))}
      </div>

      {/* Patient info */}
      <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 20, padding: '16px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>PATIENT INFO</div>

        <input value={form.patientName} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} placeholder="Patient name (optional)" style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid ' + T.border, background: T.glass2, color: T.text, fontSize: 13, outline: 'none', fontFamily: F, marginBottom: 10, boxSizing: 'border-box' }} />

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginBottom: 4 }}>AGE</div>
            <input value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} placeholder="Years" type="number" style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid ' + T.border, background: T.glass2, color: T.text, fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginBottom: 4 }}>WEIGHT (kg)</div>
            <input value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="kg" type="number" style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid ' + T.border, background: T.glass2, color: T.text, fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginBottom: 4 }}>eGFR</div>
            <input value={form.egfr} onChange={e => setForm(p => ({ ...p, egfr: e.target.value }))} placeholder="mL/min" type="number" style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1px solid ' + T.border, background: T.glass2, color: T.text, fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['M', 'F'].map(g => (
            <button key={g} onClick={() => setForm(p => ({ ...p, gender: g }))} style={{ flex: 1, padding: '9px', borderRadius: 12, border: '1px solid ' + (form.gender === g ? T.teal : T.border), background: form.gender === g ? T.teal + '18' : T.glass2, color: form.gender === g ? T.teal : T.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              {g === 'M' ? '👨 Male' : '👩 Female'}
            </button>
          ))}
        </div>
      </div>

      {/* Diagnosis */}
      <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 20, padding: '16px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>DIAGNOSIS *</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {DIAGNOSES.map(d => (
            <button key={d} onClick={() => setForm(p => ({ ...p, diagnosis: p.diagnosis === d ? '' : d, customDiagnosis: '' }))} style={{ background: form.diagnosis === d ? T.green + '18' : T.glass2, border: '1px solid ' + (form.diagnosis === d ? T.green : T.border), borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: F, color: form.diagnosis === d ? T.green : T.muted, fontSize: 11, fontWeight: form.diagnosis === d ? 700 : 400 }}>{d}</button>
          ))}
        </div>
        <input value={form.customDiagnosis} onChange={e => setForm(p => ({ ...p, customDiagnosis: e.target.value, diagnosis: '' }))} placeholder="Or type custom diagnosis..." style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid ' + (form.customDiagnosis ? T.green : T.border), background: T.glass2, color: T.text, fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
      </div>

      {/* Allergies */}
      <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 20, padding: '16px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>KNOWN ALLERGIES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ALLERGIES.map(a => (
            <button key={a} onClick={() => toggleAllergy(a)} style={{ background: form.allergies.includes(a) ? 'rgba(255,59,48,0.15)' : T.glass2, border: '1px solid ' + (form.allergies.includes(a) ? T.red : T.border), borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: F, color: form.allergies.includes(a) ? T.red : T.muted, fontSize: 11, fontWeight: form.allergies.includes(a) ? 700 : 400 }}>
              {form.allergies.includes(a) ? '⚠️ ' : ''}{a}
            </button>
          ))}
        </div>
      </div>

      {/* Comorbidities + current meds */}
      <div style={{ background: T.glass, backdropFilter: 'blur(16px)', border: '1px solid ' + T.border, borderRadius: 20, padding: '16px', marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>ADDITIONAL INFO</div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginBottom: 4 }}>COMORBIDITIES</div>
          <input value={form.comorbidities} onChange={e => setForm(p => ({ ...p, comorbidities: e.target.value }))} placeholder="e.g. CKD, Heart failure, Diabetes..." style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid ' + T.border, background: T.glass2, color: T.text, fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
        </div>
        <div>
          <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginBottom: 4 }}>CURRENT MEDICATIONS</div>
          <input value={form.currentMeds} onChange={e => setForm(p => ({ ...p, currentMeds: e.target.value }))} placeholder="e.g. Ramipril 5mg, Metformin 500mg..." style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid ' + T.border, background: T.glass2, color: T.text, fontSize: 13, outline: 'none', fontFamily: F, boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Generate button */}
      <button onClick={generate} disabled={generating || (!form.diagnosis && !form.customDiagnosis)} style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: generating || (!form.diagnosis && !form.customDiagnosis) ? 'rgba(52,199,89,0.2)' : 'linear-gradient(135deg,' + T.green + ',#00A048)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: generating || (!form.diagnosis && !form.customDiagnosis) ? 'not-allowed' : 'pointer', fontFamily: F, boxShadow: !form.diagnosis && !form.customDiagnosis ? 'none' : '0 8px 28px rgba(52,199,89,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {generating
          ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', animation: 'spin 0.8s linear infinite' }} />Generating prescription...</>
          : '💊 Generate Prescription'}
      </button>

      <div style={{ marginTop: 14, background: T.gold + '08', border: '1px solid ' + T.gold + '18', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: T.muted }}>⭐ Always verify with BNF/local formulary before prescribing</div>
      </div>

      <style>{'@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} input::placeholder{color:rgba(238,246,250,0.30)}'}</style>
    </div>
  )
}
