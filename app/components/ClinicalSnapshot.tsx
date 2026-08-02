'use client'
import { useState, useEffect } from 'react'

const F = '-apple-system, sans-serif'

const CASES = [
  { id:1, icon:'\u{1FAC0}', color:'#00C4B4', title:'52M — Anterior STEMI', detail:'Door-to-balloon: 67 min', level:'CRITICAL', city:'Riyadh' },
  { id:2, icon:'\u{1F9E0}', color:'#cc5de8', title:'34F — Status Epilepticus', detail:'IV Lorazepam given', level:'URGENT', city:'London' },
  { id:3, icon:'\u{1FAC1}', color:'#74c0fc', title:'61M — Massive PE', detail:'Systemic thrombolysis', level:'CRITICAL', city:'Dubai' },
  { id:4, icon:'\u{1F9A0}', color:'#51cf66', title:'28F — Septic Shock', detail:'Noradrenaline started', level:'CRITICAL', city:'Toronto' },
  { id:5, icon:'\u{1F9E0}', color:'#cc5de8', title:'71M — Acute Stroke', detail:'NIHSS 14 - tPA candidate', level:'URGENT', city:'Cairo' },
  { id:6, icon:'\u{1FAD8}', color:'#fbbf24', title:'45M — AKI on CKD', detail:'K+ 6.8 - Urgent dialysis', level:'CRITICAL', city:'Riyadh' },
  { id:7, icon:'\u{1FAC0}', color:'#00C4B4', title:'67F — Acute HF', detail:'BNP 4200 - BiPAP started', level:'URGENT', city:'London' },
  { id:8, icon:'\u{1F489}', color:'#ffa94d', title:'19M — DKA', detail:'pH 7.1 - Insulin infusion', level:'CRITICAL', city:'Dubai' },
]

export default function ClinicalSnapshot({ onCaseClick }: { onCaseClick?: () => void }) {
  const [offset, setOffset] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setOffset(o => o - 1), 25)
    return () => clearInterval(t)
  }, [paused])

  const cardW = 230
  const gap = 12
  const totalW = CASES.length * (cardW + gap)
  const x = ((offset % totalW) + totalW) % totalW

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff6b6b', boxShadow: '0 0 8px #ff6b6b' }}/>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary, #0A1628)', letterSpacing: 1.5, textTransform: 'uppercase' as const, fontFamily: F }}>Live Clinical Feed</span>
        </div>
        <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', fontFamily: F }}>{CASES.length} active</span>
      </div>
      <div
        style={{ overflow: 'hidden', position: 'relative' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 32, background: 'linear-gradient(90deg,#0d1b2a,transparent)', zIndex: 2, pointerEvents: 'none' as const }}/>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, background: 'linear-gradient(-90deg,#0d1b2a,transparent)', zIndex: 2, pointerEvents: 'none' as const }}/>
        <div style={{ display: 'flex', gap: gap, transform: 'translateX(' + (-x) + 'px)', width: totalW * 2, willChange: 'transform' }}>
          {[...CASES, ...CASES].map((c, i) => (
            <div key={i} onClick={onCaseClick} style={{
              flexShrink: 0, width: cardW,
              background: 'rgba(13,27,42,0.8)',
              border: '1px solid ' + c.color + '25',
              borderRadius: 16, padding: '12px 14px', cursor: 'pointer',
              backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 20px ' + c.color + '10',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 60, height: 60, borderRadius: '50%', background: c.color + '15', filter: 'blur(12px)', pointerEvents: 'none' as const }}/>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: c.level === 'CRITICAL' ? '#ff6b6b' : '#fbbf24', background: c.level === 'CRITICAL' ? 'rgba(255,107,107,0.12)' : 'rgba(255,212,59,0.12)', padding: '2px 7px', borderRadius: 6, fontFamily: F }}>{c.level}</div>
                <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.45)', fontFamily: F }}>{c.city}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: c.color + '15', border: '1px solid ' + c.color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{c.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary, #0A1628)', marginBottom: 3, lineHeight: 1.2, fontFamily: F }}>{c.title}</div>
                  <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.6)', lineHeight: 1.3, fontFamily: F }}>{c.detail}</div>
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 5 }}>
                {['Labs', 'ECG', 'Echo'].map((t, j) => (
                  <div key={j} style={{ fontSize: 8, padding: '2px 7px', borderRadius: 6, background: c.color + '10', border: '1px solid ' + c.color + '20', color: c.color, fontWeight: 700, fontFamily: F }}>{t}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
