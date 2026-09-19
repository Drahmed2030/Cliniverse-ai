'use client'
import { useState, useEffect, useRef } from 'react'
import { loadEcgChallengeProgress, recordEcgCaseAnswer, totalEcgXp, type EcgChallengeProgressState } from '../lib/ecgChallengeProgress'
import { evaluateEcgScoringAttemptV1, type EcgScoringAttemptV1 } from '../lib/clinicalIntelligence/ecgScoringCompetencyContract'
import { updateEcgSkillMasteryV1, type EcgMasteryStateV1, type EcgMasteryEvidenceV1 } from '../lib/clinicalIntelligence/ecgLongitudinalMasteryContract'
import { selectNextEcgCaseV1, type EcgAdaptiveCaseCandidateV1 } from '../lib/clinicalIntelligence/ecgAdaptiveCaseSelectionContract'

/**
 * Session-only learner id for the deterministic contracts below — this screen
 * has no account/auth context and must not read or write any persisted state.
 */
const SESSION_LEARNER_ID = 'ecg-challenge-session'
/** These 7 cases are pre-authored static quiz content, not a governed Record10 attestation. */
const STATIC_CONTENT_ATTESTATION_ID = 'ecg-challenge-static-quiz-v1'

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
  imagePaths?: string[]
  imageCaptions?: string[]
}

const ECG_CASES: EcgCase[] = [
  {
    id: 'stemi-lateral',
    title: 'Lateral STEMI',
    difficulty: 'CRITICAL',
    diffColor: '#ff3b30',
    description: 'Male 62 years. History of myocardial infarction a few months ago (with resuscitated VF arrest at the time). ECG now shows lateral changes.',
    options: ['Normal Sinus Rhythm', 'Lateral STEMI', 'Acute Pericarditis', 'LVH with strain'],
    correct: 1,
    findings: [
      { label: 'Rhythm', color: '#00C4B4', note: 'Sinus rhythm' },
      { label: 'QRS', color: '#ff9500', note: 'Rightward axis; wide Q waves in I, aVL; poor R-wave progression anteriorly' },
      { label: 'ST Segment', color: '#ff3b30', note: 'Slight elevation in I, aVL ⚠' },
      { label: 'T Wave', color: '#ff9500', note: 'Inversion in the lateral leads' },
    ],
    explain: 'Slight ST elevation in I, aVL with lateral T-wave inversion, wide Q waves in I/aVL, and poor anterior R-wave progression — consistent with a lateral wall myocardial infarction. Correlate with troponin and clinical course to guide reperfusion decision-making.',
    xpReward: 50,
    heartRate: 88,
    imagePaths: ['/ecg-cases/stemi-lateral-1.jpg'],
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
    imagePaths: ['/ecg-cases/afib-rvr-1.jpg', '/ecg-cases/afib-rvr-2.jpg'],
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
    imagePaths: ['/ecg-cases/complete-hb-1.jpg'],
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
      { label: 'Rate', color: '#ff3b30', note: '~270 bpm' },
      { label: 'QRS', color: '#ff3b30', note: 'Wide complex, uniform (monomorphic) morphology' },
      { label: 'P Wave', color: '#ff3b30', note: 'Absent — no visible atrial activity' },
      { label: 'VT Criteria', color: '#ff3b30', note: 'RBBB-pattern QRS — monomorphic R in V1, R/S <1 in V6 (favors VT over SVT)' },
    ],
    explain: 'Wide-complex regular tachycardia with uniform QRS morphology = monomorphic VT. Unstable: synchronized cardioversion. Stable: IV amiodarone. Avoid verapamil.',
    xpReward: 50,
    heartRate: 270,
    imagePaths: ['/ecg-cases/vt-monomorphic-1.jpg'],
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
    imagePaths: ['/ecg-cases/hyperkalemia-severe-1.jpg'],
  },
  {
    id: 'wellens',
    title: 'Wellens Syndrome',
    difficulty: 'INTERMEDIATE',
    diffColor: '#ff9500',
    description: 'Male 55 years. Chest pain resolved. Biphasic T waves V2-V3.',
    options: ['Normal ECG', 'Wellens syndrome', 'Anterior STEMI', 'Benign early repolarization'],
    correct: 1,
    findings: [
      { label: 'T Wave V2-V3', color: '#ff3b30', note: 'Biphasic — initial negative, terminal positive ⚠' },
      { label: 'ST Segment', color: '#ff9500', note: 'Isoelectric or minimal elevation' },
      { label: 'R Waves', color: '#30d158', note: 'Preserved precordial R progression' },
      { label: 'Troponin', color: '#00C4B4', note: 'Normal or mildly elevated' },
    ],
    explain: 'Wellens syndrome: biphasic T waves in V2-V3 with preserved R waves in a pain-free patient = critical proximal LAD stenosis. Urgent angiography. High risk of extensive anterior MI within days.',
    xpReward: 50,
    heartRate: 78,
    imagePaths: ['/ecg-cases/wellens-2.jpg'],
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
    imagePaths: ['/ecg-cases/brugada-1.png'],
  },
]

// SVG fallback for cases with no imagePaths. All current cases have real images,
// so this is unreachable today — kept as a safety net for a future image-less case,
// not as a retry path for a failed image load (that's the "preview pending" text below).
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
  const [progress, setProgress] = useState<EcgChallengeProgressState>({})
  const [animOffset, setAnimOffset] = useState(0)
  const [imgError, setImgError] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const animRef = useRef<number>(0)
  const attemptSeq = useRef(0)
  const svgW = 340, svgH = 80

  // In-memory only (session scoped) — no account/auth context here, so this
  // must never be persisted. Cleared whenever this component unmounts.
  const [masteryBySkill, setMasteryBySkill] = useState<Record<string, EcgMasteryStateV1>>({})
  const [evidenceBySkill, setEvidenceBySkill] = useState<Record<string, EcgMasteryEvidenceV1[]>>({})
  const [lastSeenBySkill, setLastSeenBySkill] = useState<Record<string, string>>({})
  const [criticalMissBySkill, setCriticalMissBySkill] = useState<Record<string, boolean>>({})
  const [lastOutcome, setLastOutcome] = useState<{ outcome: string; band: string | null } | null>(null)

  const current = ECG_CASES[caseIdx]
  const score = totalEcgXp(progress)

  useEffect(() => { setProgress(loadEcgChallengeProgress()) }, [])

  useEffect(() => {
    // The scan-line is the only animated element on this screen with no static
    // equivalent, so a reduced-motion preference stops the loop entirely rather
    // than just shortening its duration.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const animate = () => {
      frame += 0.8
      setAnimOffset(frame % svgW)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [caseIdx])

  useEffect(() => { setImgError(false) }, [caseIdx, imgIdx])

  const handleAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === current.correct
    const alreadyScored = progress[current.id]?.correct === true
    if (correct && !alreadyScored) onXP(current.xpReward)
    setProgress(prev => recordEcgCaseAnswer(prev, current.id, correct, current.xpReward))

    const now = new Date().toISOString()
    attemptSeq.current += 1
    const attemptId = `${SESSION_LEARNER_ID}:${current.id}:${attemptSeq.current}`

    const attempt: EcgScoringAttemptV1 = {
      scoringVersion: '1.0.0',
      caseId: current.id,
      attemptId,
      learnerId: SESSION_LEARNER_ID,
      gateState: 'LEARNER_ELIGIBLE',
      referenceAuthority: 'HUMAN_REVIEWED',
      humanClinicalAttestationId: STATIC_CONTENT_ATTESTATION_ID,
      dimensions: [{
        skillId: current.id,
        weight: 1,
        score: correct ? 1 : 0,
        criticalMiss: !correct && current.difficulty === 'CRITICAL',
      }],
    }
    const scoring = evaluateEcgScoringAttemptV1(attempt)

    let band: string | null = null
    if (scoring.decision === 'SCORED') {
      const skillScore = scoring.skillScores[0]
      const nextEvidence: EcgMasteryEvidenceV1[] = [
        ...(evidenceBySkill[current.id] ?? []),
        {
          eventId: `${attemptId}:evidence`,
          learnerId: SESSION_LEARNER_ID,
          skillId: current.id,
          score: skillScore.score,
          occurredAt: now,
          evidenceEventIds: [attemptId],
        },
      ]
      const masteryResult = updateEcgSkillMasteryV1(masteryBySkill[current.id] ?? null, nextEvidence, now)
      setEvidenceBySkill(prev => ({ ...prev, [current.id]: nextEvidence }))
      if (masteryResult.decision === 'UPDATED' && masteryResult.updatedMastery !== null && masteryResult.band) {
        band = masteryResult.band
        setMasteryBySkill(prev => ({
          ...prev,
          [current.id]: {
            masteryVersion: '1.0.0',
            learnerId: SESSION_LEARNER_ID,
            skillId: current.id,
            mastery: masteryResult.updatedMastery as number,
            band: masteryResult.band as EcgMasteryStateV1['band'],
            evidenceCount: masteryResult.evidenceCount,
            lastObservedAt: now,
            algorithmId: 'ecg-challenge-session-v1',
            algorithmVersion: '1.0.0',
          },
        }))
      }
      setCriticalMissBySkill(prev => ({ ...prev, [current.id]: skillScore.criticalMiss }))
      setLastOutcome({ outcome: scoring.outcome, band })
    }
    setLastSeenBySkill(prev => ({ ...prev, [current.id]: now }))
    setTimeout(() => setShowFindings(true), 600)
  }

  const next = () => {
    const now = new Date().toISOString()
    const candidates: EcgAdaptiveCaseCandidateV1[] = ECG_CASES
      .filter(c => c.id !== current.id)
      .map(c => ({
        caseId: c.id,
        learnerEligible: true,
        governedSkillIds: [c.id],
        qualityScore: 1,
        lastSeenAt: lastSeenBySkill[c.id] ?? null,
      }))
    const skillStates = ECG_CASES
      .map(c => masteryBySkill[c.id])
      .filter((m): m is EcgMasteryStateV1 => Boolean(m))
      .map(m => ({
        skillId: m.skillId,
        mastery: m.mastery,
        band: m.band,
        recentCriticalMiss: criticalMissBySkill[m.skillId] === true,
      }))

    const selection = selectNextEcgCaseV1({
      selectionVersion: '1.0.0',
      learnerId: SESSION_LEARNER_ID,
      now,
      skillStates,
      candidates,
    })

    const selectedIdx = selection.decision === 'SELECTED' && selection.caseId
      ? ECG_CASES.findIndex(c => c.id === selection.caseId)
      : -1

    setCaseIdx(selectedIdx >= 0 ? selectedIdx : (caseIdx + 1) % ECG_CASES.length)
    setSelected(null)
    setShowFindings(false)
    setImgIdx(0)
    setLastOutcome(null)
  }

  const ecgPath = generateEcgPath(current.id, svgW, svgH)
  const imagePaths = current.imagePaths

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.5 }}>ECG Challenge</h2>
          <span style={{ fontSize: 13, color: '#00C4B4', fontWeight: 700 }}>⚡ {score} XP</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {ECG_CASES.map((c, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i === caseIdx ? '#00C4B4' : progress[c.id] ? '#00C4B499' : 'rgba(0,0,0,0.08)' }} />
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
          {imagePaths && imagePaths.length > 0 ? (
            imgError ? (
              <div style={{ height: svgH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 11, fontWeight: 600 }}>ECG signal preview pending</div>
            ) : (
              <img src={imagePaths[imgIdx]} alt={`${current.title} ECG tracing${imagePaths.length > 1 ? ` (${imgIdx + 1} of ${imagePaths.length})` : ''}`} style={{ width: '100%', height: svgH, objectFit: 'contain', display: 'block' }} onError={() => setImgError(true)} />
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

        {imagePaths && imagePaths.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, padding: '0 2px' }}>
            <button type="button" onClick={() => setImgIdx(i => (i - 1 + imagePaths.length) % imagePaths.length)} style={{ background: 'none', border: 'none', color: '#00C4B4', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '4px 8px' }}>‹ Prev</button>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{imgIdx + 1} / {imagePaths.length}</span>
            <button type="button" onClick={() => setImgIdx(i => (i + 1) % imagePaths.length)} style={{ background: 'none', border: 'none', color: '#00C4B4', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '4px 8px' }}>Next ›</button>
          </div>
        )}
        {current.imageCaptions?.[imgIdx] && (
          <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginBottom: 4, fontStyle: 'italic' }}>{current.imageCaptions[imgIdx]}</div>
        )}
        <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginBottom: 4 }}>25mm/s · 10mm/mV · Lead II</div>
      </div>

      {/* Question */}
      <div style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderRadius: 18, padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 14, lineHeight: 1.5 }}>
          What is the most likely ECG diagnosis?
        </div>
        <div role="group" aria-label="Answer options" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {current.options.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.7)', border = '1px solid rgba(0,0,0,0.07)', tc = '#0f172a'
            if (selected !== null) {
              if (i === current.correct) { bg = 'rgba(220,252,231,0.9)'; border = '2px solid #16a34a'; tc = '#14532d' }
              else if (i === selected) { bg = 'rgba(254,226,226,0.9)'; border = '2px solid #dc2626'; tc = '#7f1d1d' }
            }
            return (
              <button
                key={i}
                type="button"
                aria-pressed={selected === i}
                onClick={() => handleAnswer(i)}
                style={{ textAlign: 'left', width: '100%', font: 'inherit', background: bg, backdropFilter: 'blur(8px)', borderRadius: 12, padding: '13px 16px', border, cursor: selected === null ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: selected !== null && i === current.correct ? '#16a34a' : selected === i && i !== current.correct ? '#dc2626' : 'rgba(0,196,180,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: selected !== null && (i === current.correct || i === selected) ? 'white' : '#00C4B4' }}>{['A', 'B', 'C', 'D'][i]}</span>
                </div>
                <span style={{ fontSize: 13, color: tc, fontWeight: 500, flex: 1 }}>{opt}</span>
                {selected !== null && i === current.correct && <span aria-hidden="true">✅</span>}
                {selected !== null && i === selected && i !== current.correct && <span aria-hidden="true">❌</span>}
              </button>
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
            {lastOutcome?.band && (
              <div style={{ marginTop: 2, fontSize: 11, color: '#1d4ed8', fontWeight: 700 }}>
                🎯 Skill mastery: {lastOutcome.band} (session only)
              </div>
            )}
          </div>

          {/* Explanation */}
          <div style={{ background: selected === current.correct ? 'rgba(220,252,231,0.8)' : 'rgba(254,226,226,0.8)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${selected === current.correct ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: selected === current.correct ? '#15803d' : '#dc2626', letterSpacing: 1, marginBottom: 8 }}>
              {selected === current.correct ? '💡 EXCELLENT! +' + current.xpReward + ' XP' : '💡 EXPLANATION'}
            </div>
            <p style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.75, margin: 0, fontWeight: 500 }}>{current.explain}</p>
          </div>

          <button onClick={next} style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background:'var(--bg-base,#F7F9FC)', color: 'var(--text-primary, #0A1628)', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,196,180,0.25)' }}>
            Next ECG →
          </button>
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
