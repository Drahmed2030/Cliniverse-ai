'use client'
import { useState, useEffect, useRef } from 'react'

interface EcgFinding {
  label: string
  color: string
  note: string
}

interface EcgCase {
  id: string
  title: string
  difficulty: string
  diffColor: string
  description: string
  options: string[]
  correct: number
  findings: EcgFinding[]
  explain: string
  xpReward: number
  heartRate?: number
  imagePath?: string
}

const ECG_CASES: EcgCase[] = [
  {
    id: 'stemi',
    title: 'STEMI — Anterior',
    difficulty: 'CRITICAL',
    diffColor: '#ff3b30',
    description: 'Male 58 years. Severe chest pain 45 minutes.',
    options: ['Normal Sinus Rhythm', 'Anterior STEMI', 'LBBB', 'Pericarditis'],
    correct: 1,
    findings: [
      { label: 'P Wave', color: '#00C4B4', note: 'Normal — sinus origin' },
      { label: 'ST Segment', color: '#ff3b30', note: 'Elevation 3mm V1-V4 ⚠' },
      { label: 'T Wave', color: '#ff9500', note: 'Hyperacute — tall peaked' },
      { label: 'QRS', color: '#30d158', note: 'Narrow — no aberrancy' },
    ],
    explain: 'ST elevation ≥1mm in ≥2 contiguous leads. Anterior STEMI: V1-V4 involvement. Culprit vessel: LAD. Activate Cath Lab — door-to-balloon < 90 min.',
    xpReward: 50,
  },
  {
    id: 'afib',
    title: 'Atrial Fibrillation',
    difficulty: 'INTERMEDIATE',
    diffColor: '#ff9500',
    description: 'Female 67 years. Palpitations, irregular pulse.',
    options: ['Sinus Tachycardia', 'Atrial Flutter', 'Atrial Fibrillation', 'VT'],
    correct: 2,
    findings: [
      { label: 'P Wave', color: '#ff3b30', note: 'Absent — replaced by fibrillatory baseline ⚠' },
      { label: 'RR Interval', color: '#ff9500', note: 'Irregularly irregular ⚠' },
      { label: 'QRS', color: '#30d158', note: 'Narrow — normal conduction' },
      { label: 'Rate', color: '#00C4B4', note: '110 bpm — rapid ventricular response' },
    ],
    explain: 'AF hallmarks: absent P waves, irregularly irregular rhythm, fibrillatory baseline. Rate control first (target HR < 110). Anticoagulate if CHA₂DS₂-VASc ≥ 2.',
    xpReward: 40,
  },
  {
    id: 'heartblock',
    title: 'Complete Heart Block',
    difficulty: 'CRITICAL',
    diffColor: '#ff3b30',
    description: 'Male 72 years. Syncope. HR 32 bpm.',
    options: ['1st Degree AV Block', '2nd Degree Mobitz II', 'Complete AV Block', 'Sinus Bradycardia'],
    correct: 2,
    findings: [
      { label: 'P Wave', color: '#00C4B4', note: 'Present — rate 75/min, independent' },
      { label: 'QRS', color: '#ff3b30', note: 'Wide escape — rate 32/min ⚠' },
      { label: 'PR Interval', color: '#ff9500', note: 'Variable — no fixed relationship ⚠' },
      { label: 'AV Dissociation', color: '#00C4B4', note: 'Complete — P and QRS independent ⚠' },
    ],
    explain: 'Complete (3rd degree) AV block: P waves and QRS completely dissociated. Ventricular escape rate 30-40/min. Urgent transcutaneous pacing. Permanent pacemaker required.',
    xpReward: 60,
  },
  {
    id: 'vt',
    title: 'Ventricular Tachycardia',
    difficulty: 'CRITICAL',
    diffColor: '#ff3b30',
    description: 'Male 55 years. Collapse. Post-MI history.',
    options: ['SVT with aberrancy', 'Ventricular Tachycardia', 'AF with WPW', 'Hyperkalaemia'],
    correct: 1,
    findings: [
      { label: 'QRS Width', color: '#ff3b30', note: '> 120ms — broad complex ⚠' },
      { label: 'Rate', color: '#ff9500', note: '180 bpm — regular tachycardia ⚠' },
      { label: 'AV Dissociation', color: '#00C4B4', note: 'Present — capture/fusion beats ⚠' },
      { label: 'Axis', color: '#00C4B4', note: 'Northwest axis — extreme deviation' },
    ],
    explain: 'VT: broad complex tachycardia >100/min. If pulseless → immediate defibrillation. If pulse present → amiodarone 300mg IV. Treat underlying ischaemia.',
    xpReward: 70,
  },
  {
    id: 'hyperk',
    title: 'Hyperkalaemia',
    difficulty: 'INTERMEDIATE',
    diffColor: '#ff9500',
    description: 'Male 67 years. CKD. K+ 7.2 mEq/L.',
    options: ['Normal', 'Hypokalaemia', 'Hyperkalaemia', 'Digoxin toxicity'],
    correct: 2,
    findings: [
      { label: 'T Wave', color: '#ff3b30', note: 'Tall peaked — tented ⚠' },
      { label: 'P Wave', color: '#ff9500', note: 'Flattened — disappearing ⚠' },
      { label: 'QRS', color: '#00C4B4', note: 'Widening — sine wave pattern ⚠' },
      { label: 'PR Interval', color: '#00C4B4', note: 'Prolonged — first degree block' },
    ],
    explain: 'Hyperkalaemia progression: peaked T → flat P → wide QRS → sine wave → VF. Immediate: Calcium gluconate 10ml IV (stabilises membrane). Then: insulin/dextrose, salbutamol, dialysis.',
    xpReward: 50,
  },
  {
    id: 'stemi-lateral',
    title: 'Lateral STEMI',
    difficulty: 'CRITICAL',
    diffColor: '#ff3b30',
    description: 'Male 62 years. Ongoing chest pain 90 minutes. ST elevation in lateral leads.',
    options: ['Normal Sinus Rhythm', 'Lateral STEMI', 'Acute Pericarditis', 'LVH with strain'],
    correct: 1,
    findings: [
      { label: 'P Wave', color: '#00C4B4', note: 'Sinus origin' },
      { label: 'ST Segment', color: '#ff3b30', note: 'Elevation 2-3mm in I, aVL, V5-V6 ⚠' },
      { label: 'Reciprocal', color: '#ff3b30', note: 'ST depression in III, aVF ⚠' },
      { label: 'QRS', color: '#30d158', note: 'Narrow — no aberrancy' },
    ],
    explain: 'ST elevation in lateral leads (I, aVL, V5-V6) with reciprocal inferior depression. Concern for left main or diagonal LAD occlusion. Activate cath lab — door-to-balloon <90 min.',
    xpReward: 50,
    heartRate: 88,
    imagePath: '/ecg-cases/stemi-lateral.png',
  },
  {
    id: 'afib-rvr',
    title: 'Atrial Fibrillation with RVR',
    difficulty: 'INTERMEDIATE',
    diffColor: '#ff9500',
    description: 'Female 74 years. Palpitations, dyspnea. Irregularly irregular pulse.',
    options: ['Sinus Tachycardia', 'Atrial Flutter', 'Atrial Fibrillation with RVR', 'Multifocal Atrial Tachycardia'],
    correct: 2,
    findings: [
      { label: 'P Wave', color: '#ff3b30', note: 'Absent — no organized atrial activity' },
      { label: 'Rhythm', color: '#ff3b30', note: 'Irregularly irregular' },
      { label: 'Rate', color: '#ff9500', note: '140-160 bpm' },
      { label: 'QRS', color: '#30d158', note: 'Narrow — no aberrancy' },
    ],
    explain: 'Irregularly irregular rhythm without P waves = atrial fibrillation. Rate >100 = rapid ventricular response. Rate control with beta-blocker or non-dihydropyridine CCB; assess CHA2DS2-VASc for anticoagulation.',
    xpReward: 40,
    heartRate: 150,
    imagePath: '/ecg-cases/afib-rvr.png',
  },
  {
    id: 'complete-hb',
    title: 'Complete Heart Block',
    difficulty: 'CRITICAL',
    diffColor: '#ff3b30',
    description: 'Male 78 years. Syncope. Bradycardia with AV dissociation.',
    options: ['First-degree AV block', 'Mobitz Type I', 'Mobitz Type II', 'Complete (third-degree) AV block'],
    correct: 3,
    findings: [
      { label: 'P Wave', color: '#00C4B4', note: 'Regular, rate ~90' },
      { label: 'QRS', color: '#ff3b30', note: 'Regular, rate ~35 — no relation to P' },
      { label: 'PR Interval', color: '#ff3b30', note: 'Variable — AV dissociation' },
      { label: 'QRS Width', color: '#ff9500', note: 'Wide (>120 ms) — ventricular escape' },
    ],
    explain: 'Complete AV dissociation with atrial rate > ventricular rate = third-degree AV block. Urgent transcutaneous pacing; transvenous pacemaker. Risk of asystole.',
    xpReward: 50,
    heartRate: 35,
    imagePath: '/ecg-cases/complete-hb.png',
  },
  {
    id: 'vt-monomorphic',
    title: 'Monomorphic Ventricular Tachycardia',
    difficulty: 'CRITICAL',
    diffColor: '#ff3b30',
    description: 'Male 68 years. Prior MI. Palpitations, hypotension. Wide-complex tachycardia.',
    options: ['SVT with aberrancy', 'Monomorphic VT', 'Torsades de Pointes', 'Ventricular fibrillation'],
    correct: 1,
    findings: [
      { label: 'Rate', color: '#ff3b30', note: '~160 bpm' },
      { label: 'QRS', color: '#ff3b30', note: 'Wide (>140 ms), uniform morphology' },
      { label: 'P Wave', color: '#ff3b30', note: 'Absent — no visible atrial activity' },
      { label: 'Axis', color: '#ff3b30', note: 'Extreme axis — precordial concordance' },
    ],
    explain: 'Wide-complex regular tachycardia with uniform QRS morphology = monomorphic VT. Unstable: synchronized cardioversion. Stable: IV amiodarone. Avoid verapamil.',
    xpReward: 50,
    heartRate: 160,
    imagePath: '/ecg-cases/vt-monomorphic.png',
  },
  {
    id: 'hyperkalemia-severe',
    title: 'Severe Hyperkalemia',
    difficulty: 'INTERMEDIATE',
    diffColor: '#ff9500',
    description: 'Female 58 years. ESRD, missed dialysis. Generalized weakness.',
    options: ['Normal sinus rhythm', 'Hyperkalemia with peaked T waves', 'Hyperacute anterior STEMI', 'Brugada pattern'],
    correct: 1,
    findings: [
      { label: 'T Waves', color: '#ff3b30', note: 'Tall, narrow, peaked — most prominent V2-V4 ⚠' },
      { label: 'PR Interval', color: '#ff9500', note: 'Prolonged' },
      { label: 'P Wave', color: '#ff9500', note: 'Flattened, low amplitude' },
      { label: 'QRS', color: '#ff9500', note: 'Mildly widened' },
    ],
    explain: 'Peaked T waves + flattened P + prolonged PR = severe hyperkalemia. K+ >7.0 → risk of VF/asystole. Treat: IV calcium gluconate, insulin/dextrose, salbutamol. Emergency dialysis in ESRD.',
    xpReward: 40,
    heartRate: 72,
    imagePath: '/ecg-cases/hyperkalemia-severe.png',
  },
  {
    id: 'wellens',
    title: 'Wellens Syndrome (Type B)',
    difficulty: 'INTERMEDIATE',
    diffColor: '#ff9500',
    description: 'Male 55 years. Chest pain resolved. Biphasic T waves V2-V3.',
    options: ['Normal ECG', 'Wellens syndrome — Type B', 'Anterior STEMI', 'Benign early repolarization'],
    correct: 1,
    findings: [
      { label: 'T Wave V2-V3', color: '#ff3b30', note: 'Biphasic — initial negative, terminal positive ⚠' },
      { label: 'ST Segment', color: '#ff9500', note: 'Isoelectric or minimal elevation' },
      { label: 'R Waves', color: '#30d158', note: 'Preserved precordial R progression' },
      { label: 'Troponin', color: '#00C4B4', note: 'Normal or mildly elevated' },
    ],
    explain: 'Wellens Type B: biphasic T waves in V2-V3 with preserved R waves in a pain-free patient = critical proximal LAD stenosis. Urgent angiography. High risk of extensive anterior MI within days.',
    xpReward: 50,
    heartRate: 78,
    imagePath: '/ecg-cases/wellens.png',
  },
  {
    id: 'brugada',
    title: 'Brugada Pattern — Type 1',
    difficulty: 'INTERMEDIATE',
    diffColor: '#ff9500',
    description: 'Male 42 years. Syncope. Family history of sudden cardiac death.',
    options: ['Right bundle branch block', 'Brugada pattern — Type 1', 'Left bundle branch block', 'Normal variant'],
    correct: 1,
    findings: [
      { label: 'V1-V2', color: '#ff3b30', note: 'Coved ST elevation ≥2mm with T-wave inversion ⚠' },
      { label: 'QRS', color: '#ff9500', note: 'RBBB-like pattern (rSR\')' },
      { label: 'PR Interval', color: '#00C4B4', note: 'Normal to short' },
      { label: 'Rhythm', color: '#00C4B4', note: 'Sinus' },
    ],
    explain: 'Type 1 Brugada pattern: coved ST elevation ≥2mm with T inversion in V1-V2. Risk of polymorphic VT/VF and sudden death. Avoid triggers (fever, sodium channel blockers). ICD evaluation and electrophysiology referral.',
    xpReward: 50,
    heartRate: 82,
    imagePath: '/ecg-cases/brugada.png',
  },
]

// ECG Path generator
function generateEcgPath(type: string, width: number, height: number): string {
  const mid = height / 2
  const points: [number, number][] = []
  const cycles = 3
  const cycleW = width / cycles

  for (let c = 0; c < cycles; c++) {
    const x0 = c * cycleW
    if (type === 'stemi') {
      points.push([x0, mid],[x0+cycleW*0.1, mid],[x0+cycleW*0.15, mid-8],[x0+cycleW*0.2, mid+5],
        [x0+cycleW*0.25, mid-height*0.45],[x0+cycleW*0.3, mid+height*0.25],[x0+cycleW*0.35, mid-height*0.18],
        [x0+cycleW*0.5, mid-height*0.18],[x0+cycleW*0.65, mid-8],[x0+cycleW*0.8, mid],[x0+cycleW, mid])
    } else if (type === 'afib') {
      for (let i = 0; i < 20; i++) points.push([x0+i*cycleW/20, mid+(Math.random()-0.5)*8])
      points.push([x0+cycleW*0.3, mid-height*0.4],[x0+cycleW*0.35, mid+height*0.2],[x0+cycleW*0.4, mid])
      for (let i = 8; i < 20; i++) points.push([x0+cycleW*0.4+i*cycleW*0.03, mid+(Math.random()-0.5)*6])
    } else if (type === 'heartblock') {
      points.push([x0, mid],[x0+cycleW*0.08, mid-6],[x0+cycleW*0.12, mid],[x0+cycleW*0.25, mid],
        [x0+cycleW*0.3, mid-height*0.4],[x0+cycleW*0.35, mid+height*0.2],[x0+cycleW*0.4, mid],[x0+cycleW*0.5, mid],
        [x0+cycleW*0.55, mid-5],[x0+cycleW*0.58, mid],[x0+cycleW, mid])
    } else if (type === 'vt') {
      points.push([x0, mid])
      for (let i = 1; i < 10; i++) {
        points.push([x0+i*cycleW/10, i%2===0?mid-height*0.35:mid+height*0.25])
      }
    } else if (type === 'hyperk') {
      points.push([x0, mid],[x0+cycleW*0.12, mid],[x0+cycleW*0.18, mid-height*0.35],
        [x0+cycleW*0.25, mid+height*0.15],[x0+cycleW*0.32, mid-height*0.1],[x0+cycleW*0.45, mid],
        [x0+cycleW*0.5, mid-height*0.28],[x0+cycleW*0.6, mid-height*0.28],[x0+cycleW*0.7, mid],[x0+cycleW, mid])
    } else {
      points.push([x0, mid],[x0+cycleW*0.1, mid],[x0+cycleW*0.15, mid-6],[x0+cycleW*0.2, mid],
        [x0+cycleW*0.25, mid-height*0.4],[x0+cycleW*0.3, mid+height*0.2],[x0+cycleW*0.35, mid],
        [x0+cycleW*0.6, mid-8],[x0+cycleW*0.7, mid],[x0+cycleW, mid])
    }
  }
  return 'M ' + points.map(p => p.join(',')).join(' L ')
}

export default function EcgChallenge({ onXP }: { onXP: (n: number) => void }) {
  const [caseIdx, setCaseIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showFindings, setShowFindings] = useState(false)
  const [score, setScore] = useState(0)
  const [animOffset, setAnimOffset] = useState(0)
  const [imgError, setImgError] = useState(false)
  const animRef = useRef<number>(0)
  const svgW = 340, svgH = 80

  const current = ECG_CASES[caseIdx]

  useEffect(() => {
    let frame = 0
    const animate = () => {
      frame += 0.8
      setAnimOffset(frame % svgW)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [caseIdx])

  const handleAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    if (i === current.correct) {
      setScore(s => s + current.xpReward)
      onXP(current.xpReward)
    }
    setTimeout(() => setShowFindings(true), 600)
  }

  const next = () => {
    setCaseIdx(i => (i + 1) % ECG_CASES.length)
    setSelected(null)
    setShowFindings(false)
    setImgError(false)
  }

  const ecgPath = generateEcgPath(current.id, svgW, svgH)

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.5 }}>ECG Challenge</h2>
          <span style={{ fontSize: 13, color: '#00C4B4', fontWeight: 700 }}>⚡ {score} XP</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {ECG_CASES.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= caseIdx ? '#00C4B4' : 'rgba(0,0,0,0.08)' }} />
          ))}
        </div>
      </div>

      {/* Case Card */}
      <div style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderRadius: 20, padding: 18, marginBottom: 12, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: -0.3 }}>{current.title}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{current.description}</div>
          </div>
          <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 8, background: `${current.diffColor}15`, color: current.diffColor, fontWeight: 800, border: `1px solid ${current.diffColor}30` }}>{current.difficulty}</span>
        </div>

        {/* ECG Strip — Animated */}
        <div style={{ background: 'var(--bg-base,#F7F9FC)', borderRadius: 14, padding: '12px 8px', marginBottom: 4, overflow: 'hidden', position: 'relative' }}>
          {/* Grid */}
          <svg style={{ position: 'absolute', inset: 0, opacity: 0.15 }} width="100%" height="100%">
            <defs>
              <pattern id="ecgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00ff9d" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ecgGrid)" />
          </svg>

          {/* ECG Line */}
          {current.imagePath ? (
            imgError ? (
              <div style={{ height: svgH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 11, fontWeight: 600 }}>ECG signal preview pending</div>
            ) : (
              <img src={current.imagePath} alt={`${current.title} ECG tracing`} style={{ width: '100%', height: svgH, objectFit: 'contain', display: 'block' }} onError={() => setImgError(true)} />
            )
          ) : (
            <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
              {/* Glow effect */}
              <filter id="ecgGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <path d={ecgPath} fill="none" stroke="rgba(0,255,157,0.3)" strokeWidth={4} strokeLinecap="round" />
              <path d={ecgPath} fill="none" stroke="#00ff9d" strokeWidth={2} strokeLinecap="round" filter="url(#ecgGlow)" />
              {/* Animated scan line */}
              <line x1={animOffset} y1={0} x2={animOffset} y2={svgH} stroke="rgba(0,255,157,0.4)" strokeWidth={1} />
            </svg>
          )}

          {/* Rate display */}
          <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, color: '#00ff9d', fontWeight: 700, letterSpacing: 1 }}>
            {current.heartRate ?? (current.id === 'heartblock' ? 32 : current.id === 'vt' ? 180 : 110)} bpm
          </div>
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginBottom: 4 }}>25mm/s · 10mm/mV · Lead II</div>
      </div>

      {/* Question */}
      <div style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderRadius: 18, padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14, lineHeight: 1.5 }}>
          What is the most likely ECG diagnosis?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {current.options.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.7)', border = '1px solid rgba(0,0,0,0.07)', tc = '#0f172a'
            if (selected !== null) {
              if (i === current.correct) { bg = 'rgba(220,252,231,0.9)'; border = '2px solid #16a34a'; tc = '#14532d' }
              else if (i === selected) { bg = 'rgba(254,226,226,0.9)'; border = '2px solid #dc2626'; tc = '#7f1d1d' }
            }
            return (
              <div key={i} onClick={() => handleAnswer(i)} style={{ background: bg, backdropFilter: 'blur(8px)', borderRadius: 12, padding: '13px 16px', border, cursor: selected === null ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: selected !== null && i === current.correct ? '#16a34a' : selected === i && i !== current.correct ? '#dc2626' : 'rgba(0,196,180,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: selected !== null && (i === current.correct || i === selected) ? 'white' : '#00C4B4' }}>{['A', 'B', 'C', 'D'][i]}</span>
                </div>
                <span style={{ fontSize: 13, color: tc, fontWeight: 500, flex: 1 }}>{opt}</span>
                {selected !== null && i === current.correct && <span>✅</span>}
                {selected !== null && i === selected && i !== current.correct && <span>❌</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Findings & Explanation */}
      {showFindings && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {/* ECG Findings */}
          <div style={{ background: 'rgba(219,234,254,0.8)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: 16, marginBottom: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', letterSpacing: 1, marginBottom: 10 }}>📊 ECG ANALYSIS</div>
            {current.findings.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 10, border: `1px solid ${f.color}22` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0, boxShadow: `0 0 6px ${f.color}` }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.label}: </span>
                  <span style={{ fontSize: 12, color: '#374151' }}>{f.note}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div style={{ background: selected === current.correct ? 'rgba(220,252,231,0.8)' : 'rgba(254,226,226,0.8)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${selected === current.correct ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: selected === current.correct ? '#15803d' : '#dc2626', letterSpacing: 1, marginBottom: 8 }}>
              {selected === current.correct ? '💡 EXCELLENT! +' + current.xpReward + ' XP' : '💡 EXPLANATION'}
            </div>
            <p style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.75, margin: 0, fontWeight: 500 }}>{current.explain}</p>
          </div>

          <button onClick={next} style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background:'var(--bg-base,#F7F9FC)', color: 'var(--text-primary, #0A1628)', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,196,180,0.25)' }}>
            {caseIdx < ECG_CASES.length - 1 ? 'Next ECG →' : 'Restart Challenge 🔄'}
          </button>
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
