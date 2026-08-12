'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { L } from '../../lib/tokens'

const AmbientScribe  = dynamic(() => import('../AmbientScribe'),  { ssr:false })
const ClinicalNexus  = dynamic(() => import('../ClinicalNexus'),  { ssr:false })

interface Props {
  xp:number; streak:number; casesCompleted:number; mcqCorrect:number
  isPro:boolean
  setTab:(t:string)=>void; setToolTab:(t:string)=>void; onXP:(n:number)=>void
  userName?:string
}

// ── Design tokens ──────────────────────────────────────────────
const T = {
  teal:    '#0D9488',
  cobalt:  '#1E40AF',
  canvas:  '#F7FAFA',
  white:   '#FFFFFF',
  border:  '#E2E8F0',
  text:    '#0F172A',
  sub:     '#475569',
  muted:   '#94A3B8',
  red:     '#EF4444',
  amber:   '#F59E0B',
  green:   '#10B981',
  purple:  '#7C3AED',
  grad:    'linear-gradient(135deg,#0D9488,#1E40AF)',
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.white, borderRadius: 18, padding: '16px',
      border: `1px solid ${T.border}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      marginBottom: 12, ...style,
    }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
      color: T.muted, marginBottom: 10, marginTop: 4,
      textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

export default function PulseIndex({ xp, streak, casesCompleted, isPro, setTab, onXP, userName }: Props) {
  const [showScribe, setShowScribe] = useState(false)
  const [showNexus, setShowNexus]  = useState(false)
  const [aiQ, setAiQ]             = useState('')
  const [aiA, setAiA]             = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const displayName = userName || 'Doctor'

  async function askAI() {
    if (!aiQ.trim()) return
    setAiLoading(true); setAiA('')
    try {
      const res = await fetch('/api/generate-case', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: aiQ, systemPrompt: 'You are a senior clinical consultant. Answer in 3-4 sentences, evidence-based.' })
      })
      const d = await res.json()
      setAiA(d.content?.[0]?.text || 'Unable to get response.')
    } catch { setAiA('Connection error.') }
    setAiLoading(false)
  }

  // ── Quick Actions ──────────────────────────────────────────
  const QUICK_ACTIONS = [
    { icon: '🎙️', label: 'AI Scribe',     sub: 'Dictate notes',    color: T.teal,   action: () => setShowScribe(true) },
    { icon: '📋', label: 'Clinical Log',  sub: 'Track & reflect',  color: T.cobalt, action: () => setTab('ward') },
    { icon: '📄', label: 'Doc Analyzer',  sub: 'Analyze reports',  color: T.purple, action: () => setTab('docs') },
    { icon: '🌍', label: 'Global Room',   sub: 'Connect live',     color: T.green,  action: () => setTab('tools') },
  ]

  // ── Core Intelligence ──────────────────────────────────────
  const CORE = [
    {
      icon: '🔮', label: 'Multi-AI Consensus', sub: 'Cross-check with confidence',
      desc: 'Multiple AI models. One clinical consensus.',
      cta: 'Launch Consensus →', color: T.teal, isPrimary: true,
      action: () => setTab('oracle'),
    },
    {
      icon: '🏥', label: 'Emergency Nexus', sub: 'Smart triage systems',
      desc: 'Prioritize. Decide. Act.',
      cta: 'Enter Nexus →', color: T.cobalt, isPrimary: false,
      action: () => setShowNexus(true),
    },
  ]

  // ── Reference & Learning ───────────────────────────────────
  const REFERENCE = [
    { icon: '📖', label: 'Guidelines',       sub: 'Latest protocols & summaries', action: () => setTab('tools') },
    { icon: '🎓', label: 'Clinical Academy', sub: 'CME & micro-learning',         action: () => setTab('tools') },
    { icon: '📁', label: 'Case Library',     sub: 'Real cases. Real learning.',   action: () => setTab('tools') },
    { icon: '🔬', label: 'Future of Medicine', sub: 'AI & horizon scanning',      action: () => setTab('tools') },
  ]

  return (
    <div style={{ minHeight: '100vh', background: T.canvas, fontFamily: "-apple-system,'SF Pro Display',sans-serif" }}>

      {/* ── Hero Header ── */}
      <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80"
          alt="" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.08,
          }}
        />
        <div style={{
          position: 'relative', zIndex: 1,
          padding: '52px 20px 20px',
          background: 'linear-gradient(to bottom, rgba(13,148,136,0.06), transparent)',
        }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: T.sub, fontWeight: 500 }}>{greeting},</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.3 }}>Dr. {displayName}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(13,148,136,0.10)', borderRadius: 20,
                padding: '6px 12px', border: `1px solid rgba(13,148,136,0.2)`,
              }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>{xp} XP</span>
              </div>
              {streak > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'rgba(245,158,11,0.10)', borderRadius: 20,
                  padding: '6px 10px', border: '1px solid rgba(245,158,11,0.2)',
                }}>
                  <span style={{ fontSize: 14 }}>🔥</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.amber }}>{streak}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant input */}
          <div style={{
            background: T.white, borderRadius: 16,
            border: `1px solid ${T.border}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <input
              value={aiQ}
              onChange={e => setAiQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAI()}
              placeholder="Ask a clinical question..."
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: 14,
                color: T.text, background: 'transparent', fontFamily: 'inherit',
              }}
            />
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: T.grad, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }} onClick={askAI}>
              <span style={{ color: 'white', fontSize: 14 }}>✦</span>
            </div>
          </div>

          {/* AI Answer */}
          {(aiLoading || aiA) && (
            <div style={{
              marginTop: 10, padding: '12px 14px',
              background: 'rgba(13,148,136,0.06)',
              borderRadius: 12, border: `1px solid rgba(13,148,136,0.15)`,
              fontSize: 13, color: T.text, lineHeight: 1.6,
            }}>
              {aiLoading ? '⏳ Consulting AI...' : aiA}
            </div>
          )}

          {/* Live badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 12,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 99, padding: '3px 10px',
              fontSize: 11, fontWeight: 600, color: T.green,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: T.green, display: 'inline-block',
              }}/>
              {casesCompleted} cases completed
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '12px 16px 120px' }}>

        {/* Disclaimer */}
        <div style={{
          background: 'rgba(252,211,77,0.10)', border: '1px solid rgba(252,211,77,0.25)',
          borderRadius: 10, padding: '8px 12px', marginBottom: 14,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <span style={{ fontSize: 12 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
            <b>Educational use only.</b> AI-generated simulations. Not a substitute for clinical judgment.
          </p>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <SectionLabel>Quick Actions</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {QUICK_ACTIONS.map((a, i) => (
            <button key={i} onClick={a.action} style={{
              background: T.white, borderRadius: 16, padding: '14px',
              border: `1px solid ${T.border}`,
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              transition: 'transform 0.15s',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `${a.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, border: `1px solid ${a.color}25`,
              }}>{a.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── CORE INTELLIGENCE ── */}
        <SectionLabel>Core Intelligence</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {CORE.map((c, i) => (
            <button key={i} onClick={c.action} style={{
              borderRadius: 18, padding: '16px',
              border: c.isPrimary ? 'none' : `1px solid ${T.border}`,
              background: c.isPrimary ? `linear-gradient(135deg,${T.teal},${T.cobalt})` : T.white,
              boxShadow: c.isPrimary ? '0 4px 16px rgba(13,148,136,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
              cursor: 'pointer', textAlign: 'left',
              position: 'relative', overflow: 'hidden',
            }}>
              {c.isPrimary && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
                  background: 'rgba(255,255,255,0.2)', color: 'white',
                  padding: '2px 8px', borderRadius: 99,
                }}>PRIMARY</div>
              )}
              <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
              <div style={{
                fontSize: 14, fontWeight: 800, marginBottom: 4,
                color: c.isPrimary ? 'white' : T.text,
              }}>{c.label}</div>
              <div style={{
                fontSize: 11, marginBottom: 8,
                color: c.isPrimary ? 'rgba(255,255,255,0.75)' : T.muted,
              }}>{c.sub}</div>
              <div style={{ fontSize: 11, marginBottom: 10,
                color: c.isPrimary ? 'rgba(255,255,255,0.65)' : T.sub,
              }}>{c.desc}</div>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: c.isPrimary ? 'rgba(255,255,255,0.9)' : T.teal,
              }}>{c.cta}</div>
            </button>
          ))}
        </div>

        {/* ── REFERENCE & LEARNING ── */}
        <SectionLabel>Reference & Learning</SectionLabel>
        <Card style={{ padding: '4px 0' }}>
          {REFERENCE.map((r, i) => (
            <button key={i} onClick={r.action} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left',
              borderBottom: i < REFERENCE.length - 1 ? `1px solid ${T.border}` : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(13,148,136,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{r.label}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{r.sub}</div>
              </div>
              <span style={{ color: T.muted, fontSize: 14 }}>›</span>
            </button>
          ))}
        </Card>

        {/* Evidence banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(13,148,136,0.05)', borderRadius: 14,
          border: `1px solid rgba(13,148,136,0.15)`,
          padding: '12px 16px', marginTop: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🛡️</span>
            <div style={{ fontSize: 12, color: T.sub }}>
              Evidence-based. Clinically curated.{' '}
              <span style={{ color: T.teal, fontWeight: 600 }}>Always updated.</span>
            </div>
          </div>
          <span style={{ color: T.teal, fontSize: 16 }}>→</span>
        </div>
      </div>

      {/* Sheets */}
      {showScribe && (
        <div style={{ position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.5)' }}>
          <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'white',borderRadius:'20px 20px 0 0',padding:24,maxHeight:'80vh',overflowY:'auto' }}>
            <button onClick={() => setShowScribe(false)} style={{ float:'right',background:'none',border:'none',fontSize:20,cursor:'pointer' }}>×</button>
            <AmbientScribe />
          </div>
        </div>
      )}
      {showNexus && (
        <div style={{ position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.5)' }}>
          <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'white',borderRadius:'20px 20px 0 0',padding:24,maxHeight:'90vh',overflowY:'auto' }}>
            <button onClick={() => setShowNexus(false)} style={{ float:'right',background:'none',border:'none',fontSize:20,cursor:'pointer' }}>×</button>
            <ClinicalNexus />
          </div>
        </div>
      )}
    </div>
  )
}
