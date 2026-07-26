'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const TimeAwareCard = dynamic(() => import('./TimeAwareCard'), { ssr: false })
const ActivityRings = dynamic(() => import('./ActivityRings'), { ssr: false })

// ── DESIGN TOKENS ──
const T = {
  bg: '#0a0f1e',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.20)',
  teal: '#06b6d4',
  amber: '#f59e0b',
  rose: '#ef4444',
  indigo: '#3b82f6',
  green: '#10b981',
  F: '"Inter", -apple-system, "SF Pro Display", sans-serif',
}

interface Props {
  xp: number
  streak: number
  casesCompleted: number
  mcqCorrect: number
  isPro: boolean
  criticalCases: any[]
  sportsCases: any[]
  pedsCases: any[]
  setActiveCase: (id: string) => void
  setShowUpgrade: (v: boolean) => void
  setTab: (t: string) => void
  setToolTab: (t: string) => void
}

// ── SECTION MODAL ──
function SectionModal({ section, onClose, onCase, isPro, setShowUpgrade }: {
  section: any, onClose: () => void, onCase: (id: string) => void,
  isPro: boolean, setShowUpgrade: (v: boolean) => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(180deg,#10101e,#0a0a16)',
        borderRadius: '28px 28px 0 0',
        border: `1px solid ${section.color}30`,
        padding: '24px 20px 40px',
        maxHeight: '80vh', overflowY: 'auto'
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.muted, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: `${section.color}18`, border: `1px solid ${section.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
          }}>{section.icon}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: T.F }}>{section.title}</div>
            <div style={{ fontSize: 12, color: T.sub }}>{section.cases?.length || 0} cases available</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(section.cases || []).map((c: any) => (
            <div key={c.id} onClick={() => {
              if (!c.free && !isPro) { setShowUpgrade(true); return }
              onCase(c.id); onClose()
            }} style={{
              background: T.card, borderRadius: 18,
              padding: '14px 16px', border: `1px solid ${c.color || section.color}25`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                background: `${c.color || section.color}18`,
                border: `1px solid ${c.color || section.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
              }}>{c.icon || '🏥'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: T.sub }}>{c.sub}</div>
              </div>
              {!c.free && !isPro
                ? <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 8, background: 'rgba(255,149,0,0.15)', color: '#ff9500', fontWeight: 800, border: '1px solid rgba(255,149,0,0.25)' }}>PRO</span>
                : <span style={{ fontSize: 18, color: T.muted }}>›</span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ──
export default function HubPage({
  xp, streak, casesCompleted, mcqCorrect, isPro,
  criticalCases, sportsCases, pedsCases,
  setActiveCase, setShowUpgrade, setTab, setToolTab
}: Props) {

  const [openSection, setOpenSection] = useState<any>(null)
  const [liveCount, setLiveCount] = useState(1247)

  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(n => {
        const d = Math.floor(Math.random() * 5) - 2
        return Math.max(900, Math.min(1600, n + d))
      })
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const rank = xp >= 3000 ? 'Chief of Medicine' : xp >= 2200 ? 'Senior Consultant'
    : xp >= 1500 ? 'Consultant' : xp >= 1000 ? 'Specialist'
    : xp >= 600 ? 'Registrar' : xp >= 300 ? 'Senior Resident'
    : xp >= 100 ? 'Junior Resident' : 'Clinical Clerk'

  const accuracy = mcqCorrect > 0 ? Math.round((mcqCorrect / (mcqCorrect + 1)) * 100) : 0

  // ── CASE SECTIONS ──
  const sections = [
    {
      key: 'critical', icon: '🏥', title: 'Critical Care',
      sub: 'ED · ICU · CCU · Neuro · 6 cases',
      color: T.rose, cases: criticalCases
    },
    {
      key: 'sports', icon: '⚽', title: 'Sports Medicine',
      sub: 'FIFA 2026 · Pitch-side · 4 cases',
      color: T.green, cases: sportsCases, badge: 'NEW'
    },
    {
      key: 'peds', icon: '🧸', title: 'Pediatrics',
      sub: 'Febrile · Needle phobia · 2 cases',
      color: T.indigo, cases: pedsCases, badge: 'NEW'
    },
  ]

  // ── QUICK TOOLS ──
  const quickTools = [
    { icon: '⚡', label: 'Rapid Fire', tab: 'tools', tool: 'rapid', color: T.amber },
    { icon: '🫀', label: 'ECG', tab: 'tools', tool: 'ecg', color: T.rose },
    { icon: '🧮', label: 'Calculators', tab: 'tools', tool: 'calc', color: T.teal },
    { icon: '📋', label: 'SBAR', tab: 'workshop', tool: '', color: T.indigo },
  ]

  // ── ADVANCED MODULES ──
  const modules = [
    { id: 'pharmacy', icon: '💊', label: 'Pharmacy', color: T.green },
    { id: 'nursing', icon: '🩺', label: 'Nursing', color: '#64d2ff' },
    { id: 'lab', icon: '🔬', label: 'Lab', color: T.indigo },
    { id: 'radiology', icon: '🩻', label: 'Radiology', color: T.amber },
    { id: 'duels', icon: '⚔️', label: 'Duels', color: T.rose },
    { id: 'detective', icon: '🔍', label: 'Detective', color: '#bf5af2' },
    { id: 'aigen', icon: '🤖', label: 'AI Cases', color: T.teal },
    { id: 'nexus', icon: '🧠', label: 'Nexus', color: T.amber },
  ]

  return (
    <div style={{ fontFamily: T.F, paddingBottom: 8 }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(145deg,rgba(0,212,170,0.08),rgba(124,108,255,0.06))',
        borderRadius: 24, padding: '20px 18px', marginBottom: 16,
        border: '1px solid rgba(0,212,170,0.12)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,170,0.12),transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,108,255,0.1),transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 11, color: T.teal, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Clinical Intelligence</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: T.text, letterSpacing: -0.8, lineHeight: 1 }}>
              Clini<span style={{ color: T.teal }}>verse</span>
            </div>
            <div style={{ fontSize: 11, color: T.sub, marginTop: 4 }}>{rank} · {xp} XP</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {isPro && (
              <div style={{ background: 'linear-gradient(135deg,rgba(245,166,35,0.2),rgba(245,166,35,0.05))', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 12, padding: '4px 12px', marginBottom: 8, display: 'inline-block' }}>
                <span style={{ fontSize: 11, color: T.amber, fontWeight: 800 }}>👑 PRO</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: T.amber }}>{streak}</span>
              <span style={{ fontSize: 11, color: T.sub }}>day streak</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, position: 'relative', zIndex: 1 }}>
          {[
            { label: 'Cases', value: casesCompleted, color: T.teal },
            { label: 'Accuracy', value: `${accuracy}%`, color: T.green },
            { label: 'XP', value: xp, color: T.amber },
          ].map(s => (
            <div key={s.label} style={{
              background: `${s.color}08`, borderRadius: 14, padding: '10px 8px',
              border: `1px solid ${s.color}18`, textAlign: 'center'
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, marginTop: 3, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LIVE PULSE ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, marginBottom: 16, padding: '10px 20px',
        background: 'rgba(255,77,109,0.05)', borderRadius: 20,
        border: '1px solid rgba(255,77,109,0.12)'
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.rose, boxShadow: `0 0 10px ${T.rose}`, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>
          <span style={{ color: T.text, fontWeight: 800 }}>{liveCount.toLocaleString()}</span> doctors training right now
        </span>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.rose, boxShadow: `0 0 10px ${T.rose}`, flexShrink: 0 }} />
      </div>

            {/* Time Aware */}
      <TimeAwareCard />

      {/* Activity Rings */}
      <div style={{marginBottom:16}}>
        <ActivityRings accuracy={accuracy} speed={Math.min(streak*10,100)} knowledge={Math.min(casesCompleted*10,100)} />
      </div>

      {/* ── FEATURED CASE ── */}
      <div onClick={() => setActiveCase('stemi')} style={{
        background: `linear-gradient(135deg,${T.rose}cc,${T.indigo}cc)`,
        borderRadius: 22, padding: '20px', marginBottom: 16,
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        boxShadow: `0 8px 32px ${T.rose}30`
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>Today's Featured Case</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6, letterSpacing: -0.5 }}>🫀 STEMI Protocol</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>Master door-to-balloon · +80 XP</div>
        <div style={{
          display: 'inline-block', background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff', padding: '9px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700
        }}>Start Case →</div>
      </div>

      {/* ── QUICK TOOLS ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Quick Access</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {quickTools.map(t => (
            <div key={t.label} onClick={() => { setTab(t.tab); if (t.tool) setToolTab(t.tool) }} style={{
              background: `${t.color}08`, borderRadius: 16, padding: '14px 8px',
              border: `1px solid ${t.color}20`, cursor: 'pointer', textAlign: 'center'
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 10, color: t.color, fontWeight: 700 }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CLINICAL CASES ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Clinical Cases</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sections.map(s => (
            <div key={s.key} onClick={() => setOpenSection(s)} style={{
              background: T.card, borderRadius: 20, padding: '16px',
              border: `1px solid ${s.color}20`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: `0 2px 16px ${s.color}08`
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 15, flexShrink: 0,
                background: `${s.color}15`, border: `1px solid ${s.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{s.title}</span>
                  {s.badge && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 7, background: `${s.color}18`, color: s.color, fontWeight: 800, border: `1px solid ${s.color}30` }}>{s.badge}</span>}
                </div>
                <div style={{ fontSize: 11, color: T.sub }}>{s.sub}</div>
              </div>
              <div style={{ fontSize: 20, color: `${s.color}60`, fontWeight: 700 }}>›</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI CASE GENERATOR ── */}
      <div onClick={() => { setTab('tools'); setToolTab('aigen') }} style={{
        background: `linear-gradient(135deg,${T.teal}12,${T.indigo}08)`,
        borderRadius: 20, padding: '16px 18px', marginBottom: 16,
        border: `1px solid ${T.teal}20`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: 16, flexShrink: 0,
          background: `${T.teal}18`, border: `1px solid ${T.teal}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
        }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 3 }}>AI Case Generator</div>
          <div style={{ fontSize: 11, color: T.sub }}>Unlimited · Any specialty · Arabic + English</div>
        </div>
        <div style={{ fontSize: 20, color: `${T.teal}60` }}>›</div>
      </div>

      {/* ── ADVANCED MODULES GRID ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Advanced Modules</div>
          <span style={{ fontSize: 10, color: T.teal, fontWeight: 700 }}>{modules.length} modules</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {modules.map(m => (
            <div key={m.id} onClick={() => { setTab('tools'); setToolTab(m.id) }} style={{
              background: `${m.color}08`, borderRadius: 16, padding: '14px 8px',
              border: `1px solid ${m.color}18`, cursor: 'pointer', textAlign: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -8, right: -8, width: 30, height: 30, borderRadius: '50%', background: `${m.color}12`, filter: 'blur(8px)', pointerEvents: 'none' }} />
              <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 9, color: m.color, fontWeight: 700, letterSpacing: 0.3 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION MODAL ── */}
      {openSection && (
        <SectionModal
          section={openSection}
          onClose={() => setOpenSection(null)}
          onCase={setActiveCase}
          isPro={isPro}
          setShowUpgrade={setShowUpgrade}
        />
      )}

    </div>
  )
}
