'use client'
import { useState, useEffect } from 'react'

const F = '"Inter", -apple-system, "SF Pro Display", sans-serif'

const T = {
  bg: '#1e2d40',
  card: 'rgba(255,255,255,0.11)',
  border: 'rgba(255,255,255,0.18)',
  text: '#ffffff',
  sub: 'rgba(148,163,184,0.8)',
  muted: 'rgba(148,163,184,0.4)',
  teal: '#38bdf8',
  amber: '#fbbf24',
  rose: '#f87171',
  green: '#4ade80',
  purple: '#a78bfa',
}

type Phase = 'brief' | 'labs' | 'imaging' | 'decision' | 'result'

interface CaseData {
  title?: string
  specialty?: string
  brief?: string
  vitals?: Record<string, string>
  labs?: { name: string, value: string, status: string, ref: string }[]
  ecg?: string
  echo?: string
  xray?: string
  options?: { id: string, text: string, correct: boolean, explanation: string }[]
  question?: string
  keyLearning?: string[]
  management?: string[]
}

interface Props {
  specialty?: string
  difficulty?: string
  onXP?: (n: number) => void
  daily?: boolean
}

export default function LiveCaseViewer({ specialty = 'Emergency Medicine', difficulty = 'Intermediate', onXP, daily = false }: Props) {
  const [phase, setPhase] = useState<Phase>('brief')
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    fetchCase()
  }, [specialty, difficulty])

  const fetchCase = async () => {
    setLoading(true)
    setError('')
    setSelected(null)
    setShowResult(false)
    setPhase('brief')
    try {
      const res = await fetch('/api/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialty, difficulty, fullCase: true, daily }),
      })
      const data = await res.json()
      if (data.success) {
        setCaseData(data.case)
      } else {
        setError(data.error || 'Generation failed')
      }
    } catch (e) {
      setError('Network error')
    }
    setLoading(false)
  }

  const handleAnswer = (id: string) => {
    if (selected) return
    setSelected(id)
    setShowResult(true)
    const correct = caseData?.options?.find(o => o.id === id)?.correct
    if (correct && onXP) onXP(100)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: F }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>Generating Clinical Case...</div>
      <div style={{ fontSize: 12, color: T.muted }}>AI is creating a realistic {specialty} case with Labs, ECG, Echo & Imaging</div>
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: F }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontSize: 14, color: T.rose, marginBottom: 16 }}>{error}</div>
      <button onClick={fetchCase} style={{ padding: '12px 24px', background: T.teal, border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Try Again</button>
    </div>
  )

  if (!caseData) return null

  const phases: { id: Phase, label: string, icon: string }[] = [
    { id: 'brief', label: 'Case', icon: '📋' },
    { id: 'labs', label: 'Labs', icon: '🔬' },
    { id: 'imaging', label: 'Imaging', icon: '🩻' },
    { id: 'decision', label: 'Decision', icon: '⚡' },
  ]

  return (
    <div style={{ fontFamily: F, paddingBottom: 8 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(167,139,250,0.06))',
        border: '1px solid rgba(56,189,248,0.15)',
        borderRadius: 22, padding: '16px 18px', marginBottom: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle,rgba(56,189,248,0.1),transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ fontSize: 9, color: T.teal, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 6 }}>
          {daily ? 'Case of the Day' : 'AI Generated · ' + specialty}
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: -0.5, marginBottom: 8 }}>
          {caseData.title || 'Clinical Case'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[specialty, difficulty].map((t, i) => (
              <span key={i} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 8, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: T.teal, fontWeight: 700 }}>{t}</span>
            ))}
          </div>
          <button onClick={fetchCase} style={{ fontSize: 11, color: T.muted, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>↻ New Case</button>
        </div>
      </div>

      {/* Phase Nav */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {phases.map((p, i) => {
          const phaseIndex = phases.findIndex(x => x.id === phase)
          const done = i < phaseIndex
          const active = p.id === phase
          return (
            <button key={p.id} onClick={() => setPhase(p.id)} style={{
              flex: 1, padding: '9px 4px', border: 'none', cursor: 'pointer',
              borderRadius: 12, fontFamily: F, fontWeight: 700, fontSize: 10,
              background: active ? T.teal : done ? 'rgba(56,189,248,0.1)' : T.card,
              color: active ? '#1e2d40' : done ? T.teal : T.muted,
              border: '1px solid ' + (active ? T.teal : done ? 'rgba(56,189,248,0.2)' : T.border),
              boxShadow: active ? '0 4px 16px rgba(56,189,248,0.3)' : 'none',
            }}>
              {p.icon} {p.label}{done ? ' ✓' : ''}
            </button>
          )
        })}
      </div>

      {/* BRIEF */}
      {phase === 'brief' && (
        <div>
          <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 20, padding: '18px', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 10 }}>Clinical Presentation</div>
            <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.7, margin: 0 }}>{caseData.brief}</p>
          </div>

          {caseData.vitals && (
            <div style={{ background: T.card, border: '1px solid rgba(248,113,113,0.15)', borderRadius: 20, padding: '16px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 12 }}>Vital Signs</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {Object.entries(caseData.vitals).map(([k, v]) => (
                  <div key={k} style={{ background: 'rgba(248,113,113,0.05)', borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(248,113,113,0.12)' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: T.rose, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginTop: 4 }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setPhase('labs')} style={{ width: '100%', padding: '15px', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: '0 6px 24px rgba(56,189,248,0.25)' }}>
            Check Labs 🔬
          </button>
        </div>
      )}

      {/* LABS */}
      {phase === 'labs' && (
        <div>
          <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 20, padding: '16px', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 12 }}>Laboratory Results</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(caseData.labs || []).map((l, i) => {
                const c = l.status === 'critical' ? T.rose : l.status === 'high' ? T.amber : l.status === 'low' ? '#60a5fa' : T.green
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 14,
                    background: l.status === 'critical' ? 'rgba(248,113,113,0.05)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid ' + (l.status === 'critical' ? 'rgba(248,113,113,0.18)' : T.border),
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{l.name}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>Ref: {l.ref}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: c }}>{l.value}</div>
                      <div style={{ fontSize: 8, padding: '1px 6px', borderRadius: 6, background: c + '15', color: c, fontWeight: 700, marginTop: 2 }}>{l.status.toUpperCase()}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <button onClick={() => setPhase('imaging')} style={{ width: '100%', padding: '15px', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: '0 6px 24px rgba(56,189,248,0.25)' }}>
            Check Imaging 🩻
          </button>
        </div>
      )}

      {/* IMAGING */}
      {phase === 'imaging' && (
        <div>
          {[
            { title: 'ECG Findings', icon: '📈', color: T.teal, content: caseData.ecg },
            { title: 'Echocardiogram', icon: '🫀', color: T.rose, content: caseData.echo },
            { title: 'Chest Imaging', icon: '🩻', color: T.amber, content: caseData.xray },
          ].filter(x => x.content).map((img, i) => (
            <div key={i} style={{ background: T.card, border: '1px solid ' + img.color + '20', borderRadius: 20, padding: '16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: img.color + '15', border: '1px solid ' + img.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{img.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{img.title}</div>
              </div>
              <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.65, margin: 0 }}>{img.content}</p>
            </div>
          ))}
          <button onClick={() => setPhase('decision')} style={{ width: '100%', padding: '15px', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: F, boxShadow: '0 6px 24px rgba(56,189,248,0.25)' }}>
            Make Decision ⚡
          </button>
        </div>
      )}

      {/* DECISION */}
      {phase === 'decision' && (
        <div>
          <div style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 20, padding: '18px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: T.teal, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 8 }}>Clinical Decision</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.5, margin: 0 }}>{caseData.question || 'What is your first priority management step?'}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(caseData.options || []).map(o => {
              const isSelected = selected === o.id
              const isCorrect = o.correct
              const bg = !showResult ? T.card : isSelected && isCorrect ? 'rgba(74,222,128,0.08)' : isSelected && !isCorrect ? 'rgba(248,113,113,0.08)' : T.card
              const bdr = !showResult ? T.border : isSelected && isCorrect ? 'rgba(74,222,128,0.3)' : isSelected && !isCorrect ? 'rgba(248,113,113,0.3)' : T.border

              return (
                <div key={o.id} onClick={() => handleAnswer(o.id)} style={{ background: bg, border: '1px solid ' + bdr, borderRadius: 18, padding: '14px 16px', cursor: selected ? 'default' : 'pointer', transition: 'all 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: T.sub }}>
                      {showResult && isSelected ? (isCorrect ? '✓' : '✗') : o.id.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1, lineHeight: 1.4 }}>{o.text}</span>
                  </div>
                  {showResult && isSelected && (
                    <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: isCorrect ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)', border: '1px solid ' + (isCorrect ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)') }}>
                      <p style={{ fontSize: 12, color: isCorrect ? T.green : T.rose, margin: 0, lineHeight: 1.6 }}>{o.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {showResult && caseData.keyLearning && (
            <div style={{ marginTop: 14, background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 18, padding: '16px' }}>
              <div style={{ fontSize: 10, color: T.teal, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 10 }}>Key Learning Points</div>
              {caseData.keyLearning.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal, flexShrink: 0, marginTop: 5 }}/>
                  <span style={{ fontSize: 12, color: T.sub, lineHeight: 1.6 }}>{p}</span>
                </div>
              ))}
              <button onClick={fetchCase} style={{ width: '100%', marginTop: 12, padding: '13px', border: 'none', borderRadius: 14, background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: F }}>
                Generate New Case ↻
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
