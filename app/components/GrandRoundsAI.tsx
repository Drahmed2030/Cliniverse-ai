'use client'
import { useState } from 'react'

const F = '"Inter", -apple-system, "SF Pro Display", sans-serif'

const T = {
  bg: '#1e2d40',
  card: 'rgba(36,63,82,0.60)',
  border: 'rgba(255,255,255,0.18)',
  text: '#ffffff',
  sub: 'rgba(148,163,184,0.8)',
  muted: 'rgba(148,163,184,0.4)',
  teal: '#38bdf8',
  amber: '#fbbf24',
  rose: '#f87171',
  green: '#4ade80',
  purple: '#00DFD0',
}

const CASE = {
  id: 'gr001',
  title: '58M — Multi-system Complexity',
  brief: 'A 58-year-old male presents with 3 days of progressive dyspnea, bilateral leg swelling, and confusion. PMH: DM2, HTN, CKD stage 3. On metformin, amlodipine, lisinopril.',
  vitals: { BP: '158/96', HR: '112 bpm', RR: '24/min', SpO2: '88% RA', Temp: '37.8°C', GCS: '13/15' },
  labs: [
    { name: 'Troponin I', value: '2.4 ng/mL', status: 'critical', ref: '<0.04' },
    { name: 'BNP', value: '1840 pg/mL', status: 'critical', ref: '<100' },
    { name: 'Creatinine', value: '3.2 mg/dL', status: 'high', ref: '0.7-1.2' },
    { name: 'K+', value: '5.9 mEq/L', status: 'critical', ref: '3.5-5.0' },
    { name: 'pH', value: '7.28', status: 'critical', ref: '7.35-7.45' },
    { name: 'HbA1c', value: '9.8%', status: 'high', ref: '<7.0' },
    { name: 'Hb', value: '8.2 g/dL', status: 'low', ref: '13.5-17.5' },
    { name: 'WBC', value: '14.2 K/uL', status: 'high', ref: '4-11' },
  ],
  ecg: 'Sinus tachycardia 112 bpm · ST depression V4-V6 · LVH criteria · Peaked T waves II, III, aVF',
  echo: 'EF 30% (severely reduced) · Global hypokinesia · Moderate MR · Dilated LV · No pericardial effusion',
  xray: 'Bilateral perihilar haziness · Kerley B lines · Cardiomegaly · No pneumothorax',
  consultants: [
    {
      specialty: 'Cardiology',
      icon: '🫀',
      color: '#38bdf8',
      name: 'Dr. Al-Hassan',
      opinion: 'NSTEMI with acute decompensated heart failure. EF 30% is alarming. Needs urgent Cath — but renal function must be optimized first. Start IV diuretics, anticoagulation, dual antiplatelet. Cardio-renal syndrome is the main challenge here.',
      plan: ['IV Furosemide 80mg STAT', 'Aspirin + Ticagrelor', 'Anticoagulation with UFH', 'Echo-guided fluid management', 'Urgent Cardiology ICU admission'],
    },
    {
      specialty: 'Nephrology',
      icon: '🫘',
      color: '#00DFD0',
      name: 'Dr. Khalid',
      opinion: 'AKI on CKD — likely cardiorenal syndrome type 1. K+ 5.9 is dangerous with acidosis. Contrast for Cath is high risk. We need to stabilize kidneys before any invasive procedure. CVVH may be needed.',
      plan: ['Calcium Gluconate 1g IV STAT', 'Insulin + Dextrose for K+', 'Sodium Bicarbonate infusion', 'Avoid NSAIDs and contrast', 'Nephrology ICU consult'],
    },
    {
      specialty: 'ICU',
      icon: '🏥',
      color: '#f87171',
      name: 'Dr. Nora',
      opinion: 'This patient needs ICU-level care immediately. Confusion + SpO2 88% suggests impending respiratory failure. BiPAP now, prepare for intubation. Cardio-renal-pulmonary triple threat. Multidisciplinary approach essential.',
      plan: ['BiPAP — IPAP 14, EPAP 6', 'Arterial line + CVC access', 'Strict I&O monitoring', 'Hold metformin and ACEi', 'Family meeting — poor prognosis'],
    },
  ],
  question: 'As the attending physician, what is your FIRST priority management step?',
  options: [
    { id: 'a', text: 'Urgent cardiac catheterization', correct: false, explanation: 'Not yet — renal function and K+ must be stabilized first. Contrast nephropathy would worsen AKI.' },
    { id: 'b', text: 'BiPAP + IV diuretics + treat hyperkalemia', correct: true, explanation: 'Correct! Stabilize airway and dangerous K+ first. This addresses the immediate life threats before any invasive procedure.' },
    { id: 'c', text: 'Emergency dialysis immediately', correct: false, explanation: 'Not first — try medical management of hyperkalemia first. Reserve dialysis if K+ doesn\'t respond.' },
    { id: 'd', text: 'Thrombolysis for NSTEMI', correct: false, explanation: 'Thrombolysis is not indicated in NSTEMI. PCI is preferred — but timing depends on stabilization.' },
  ],
}

type Phase = 'brief' | 'labs' | 'imaging' | 'consultants' | 'decision' | 'result'

export default function GrandRoundsAI({ onXP }: { onXP?: (n: number) => void }) {
  const [phase, setPhase] = useState<Phase>('brief')
  const [selected, setSelected] = useState<string | null>(null)
  const [activeConsultant, setActiveConsultant] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const phases: { id: Phase, label: string, icon: string }[] = [
    { id: 'brief', label: 'Case', icon: '📋' },
    { id: 'labs', label: 'Labs', icon: '🔬' },
    { id: 'imaging', label: 'Imaging', icon: '🩻' },
    { id: 'consultants', label: 'Rounds', icon: '👨‍⚕️' },
    { id: 'decision', label: 'Decide', icon: '⚡' },
  ]

  const handleAnswer = (id: string) => {
    if (selected) return
    setSelected(id)
    setShowResult(true)
    const correct = CASE.options.find(o => o.id === id)?.correct
    if (correct && onXP) onXP(120)
  }

  return (
    <div style={{ fontFamily: F, paddingBottom: 8 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,223,208,0.1), rgba(56,189,248,0.06))',
        border: '1px solid rgba(0,223,208,0.2)',
        borderRadius: 22, padding: '16px 18px', marginBottom: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,223,208,0.12),transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ fontSize: 9, color: T.purple, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Grand Rounds AI · Multidisciplinary</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: -0.5, marginBottom: 4 }}>{CASE.title}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {['Cardiology', 'Nephrology', 'ICU', 'Complex'].map((t, i) => (
            <span key={i} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 8, background: 'rgba(0,223,208,0.1)', border: '1px solid rgba(0,223,208,0.2)', color: T.purple, fontWeight: 700 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Phase Navigator */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {phases.map((p, i) => {
          const phaseIndex = phases.findIndex(x => x.id === phase)
          const done = i < phaseIndex
          const active = p.id === phase
          return (
            <button key={p.id} onClick={() => setPhase(p.id)} style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: 'none',
              cursor: 'pointer', fontFamily: F, fontWeight: 700, fontSize: 11,
              background: active ? T.purple : done ? 'rgba(0,223,208,0.1)' : T.card,
              color: active ? '#fff' : done ? T.purple : T.muted,
              border: active ? 'none' : '1px solid ' + (done ? 'rgba(0,223,208,0.2)' : T.border),
              boxShadow: active ? '0 4px 16px rgba(0,223,208,0.3)' : 'none',
            }}>
              {p.icon} {p.label} {done ? '✓' : ''}
            </button>
          )
        })}
      </div>

      {/* BRIEF */}
      {phase === 'brief' && (
        <div>
          <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 20, padding: '18px', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Clinical Presentation</div>
            <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.7, margin: 0 }}>{CASE.brief}</p>
          </div>

          <div style={{ background: T.card, border: '1px solid rgba(248,113,113,0.2)', borderRadius: 20, padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Vital Signs</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {Object.entries(CASE.vitals).map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(248,113,113,0.05)', borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(248,113,113,0.15)' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: T.rose, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginTop: 4, letterSpacing: 0.5 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setPhase('labs')} style={{
            width: '100%', padding: '15px', border: 'none', borderRadius: 16,
            background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
            color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F,
            boxShadow: '0 6px 24px rgba(0,223,208,0.3)',
          }}>Check Labs 🔬</button>
        </div>
      )}

      {/* LABS */}
      {phase === 'labs' && (
        <div>
          <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 20, padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Laboratory Results</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CASE.labs.map((l, i) => {
                const c = l.status === 'critical' ? T.rose : l.status === 'high' ? T.amber : l.status === 'low' ? '#60a5fa' : T.green
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 14,
                    background: l.status === 'critical' ? 'rgba(248,113,113,0.06)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid ' + (l.status === 'critical' ? 'rgba(248,113,113,0.2)' : T.border),
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{l.name}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>Ref: {l.ref}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 900, color: c }}>{l.value}</div>
                      <div style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, background: c + '15', color: c, fontWeight: 700, marginTop: 2 }}>{l.status.toUpperCase()}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <button onClick={() => setPhase('imaging')} style={{ width: '100%', padding: '15px', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: '0 6px 24px rgba(0,223,208,0.3)' }}>Check Imaging 🩻</button>
        </div>
      )}

      {/* IMAGING */}
      {phase === 'imaging' && (
        <div>
          {[
            { title: 'ECG Findings', icon: '📈', color: T.teal, content: CASE.ecg },
            { title: 'Echo (TTE)', icon: '🫀', color: T.rose, content: CASE.echo },
            { title: 'Chest X-Ray', icon: '🩻', color: T.amber, content: CASE.xray },
          ].map((img, i) => (
            <div key={i} style={{ background: T.card, border: '1px solid ' + img.color + '20', borderRadius: 20, padding: '16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: img.color + '15', border: '1px solid ' + img.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{img.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{img.title}</div>
              </div>
              <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.65, margin: 0 }}>{img.content}</p>
            </div>
          ))}
          <button onClick={() => setPhase('consultants')} style={{ width: '100%', padding: '15px', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: '0 6px 24px rgba(0,223,208,0.3)' }}>Grand Rounds 👨‍⚕️</button>
        </div>
      )}

      {/* CONSULTANTS */}
      {phase === 'consultants' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {CASE.consultants.map((c, i) => (
              <button key={i} onClick={() => setActiveConsultant(i)} style={{
                flex: 1, padding: '10px 8px', border: 'none', borderRadius: 14, cursor: 'pointer',
                fontFamily: F, fontWeight: 700, fontSize: 11,
                background: activeConsultant === i ? c.color + '20' : T.card,
                color: activeConsultant === i ? c.color : T.muted,
                border: '1px solid ' + (activeConsultant === i ? c.color + '40' : T.border),
                boxShadow: activeConsultant === i ? '0 4px 16px ' + c.color + '20' : 'none',
              }}>
                {c.icon} {c.specialty}
              </button>
            ))}
          </div>

          {(() => {
            const c = CASE.consultants[activeConsultant]
            return (
              <div>
                <div style={{ background: c.color + '08', border: '1px solid ' + c.color + '20', borderRadius: 20, padding: '18px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: c.color + '15', border: '1px solid ' + c.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>{c.specialty} Consultant</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.7, margin: '0 0 14px' }}>{c.opinion}</p>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>Recommended Plan</div>
                  {c.plan.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < c.plan.length - 1 ? '1px solid ' + T.border : 'none' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, flexShrink: 0 }}/>
                      <span style={{ fontSize: 12, color: T.sub }}>{p}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setPhase('decision')} style={{ width: '100%', padding: '15px', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #a78bfa, #38bdf8)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: '0 6px 24px rgba(0,223,208,0.3)' }}>Make Decision ⚡</button>
              </div>
            )
          })()}
        </div>
      )}

      {/* DECISION */}
      {phase === 'decision' && (
        <div>
          <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 20, padding: '18px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: T.purple, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Your Decision</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.5, margin: 0 }}>{CASE.question}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CASE.options.map(o => {
              const isSelected = selected === o.id
              const isCorrect = o.correct
              const showFeedback = showResult && isSelected
              const bg = !showResult ? T.card : isSelected && isCorrect ? 'rgba(74,222,128,0.08)' : isSelected && !isCorrect ? 'rgba(248,113,113,0.08)' : T.card
              const border = !showResult ? T.border : isSelected && isCorrect ? 'rgba(74,222,128,0.3)' : isSelected && !isCorrect ? 'rgba(248,113,113,0.3)' : T.border

              return (
                <div key={o.id} onClick={() => handleAnswer(o.id)} style={{
                  background: bg, border: '1px solid ' + border,
                  borderRadius: 18, padding: '16px', cursor: selected ? 'default' : 'pointer',
                  transition: 'all 0.3s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: !showResult ? 'rgba(36,63,82,0.65)' : isSelected && isCorrect ? 'rgba(74,222,128,0.2)' : isSelected && !isCorrect ? 'rgba(248,113,113,0.2)' : 'rgba(36,63,82,0.65)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: T.sub,
                    }}>
                      {showResult && isSelected ? (isCorrect ? '✓' : '✗') : o.id.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1, lineHeight: 1.4 }}>{o.text}</span>
                  </div>
                  {showFeedback && (
                    <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: isCorrect ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)', border: '1px solid ' + (isCorrect ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)') }}>
                      <p style={{ fontSize: 12, color: isCorrect ? T.green : T.rose, margin: 0, lineHeight: 1.6 }}>{o.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {showResult && (
            <div style={{ marginTop: 14, background: 'rgba(0,223,208,0.08)', border: '1px solid rgba(0,223,208,0.2)', borderRadius: 18, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{CASE.options.find(o => o.id === selected)?.correct ? '🏆' : '📚'}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 4 }}>
                {CASE.options.find(o => o.id === selected)?.correct ? '+120 XP — Excellent Clinical Judgment!' : 'Keep Learning — Review the Consultants\' Plans'}
              </div>
              <div style={{ fontSize: 12, color: T.sub }}>Grand Rounds complete · New case tomorrow</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
