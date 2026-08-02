#!/usr/bin/env python3
"""
write_hubpage.py — Cliniverse AI
HubPage rewrite — Apple Health 2026 · Ocean Blue · Clean Cards
"""

from pathlib import Path
import shutil

PROJECT = Path('/Users/macbook/cliniverse-ai')
COMP    = PROJECT / 'app' / 'components'
BACKUP  = PROJECT / '_theme_backups'
BACKUP.mkdir(exist_ok=True)

HUBPAGE = r"""'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const AmbientScribe      = dynamic(() => import('./AmbientScribe'),      { ssr:false })
const HealthStatusHeader = dynamic(() => import('./HealthStatusHeader'), { ssr:false })
const LiveCaseViewer     = dynamic(() => import('./LiveCaseViewer'),     { ssr:false })
const PulseAcademy       = dynamic(() => import('./PulseAcademy'),       { ssr:false })

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── Design tokens — Ocean Blue / Apple Health 2026 ──────────────
const D = {
  bg:         'var(--bg-base, #F2F7FF)',
  card:       'rgba(255,255,255,0.85)',
  cardBorder: 'rgba(10,132,255,0.10)',
  text:       'var(--text-primary, #0A1F3C)',
  textSub:    'var(--text-secondary, rgba(10,31,60,0.65))',
  textMuted:  'var(--text-muted, rgba(10,31,60,0.40))',
  blue:       '#0A84FF',
  teal:       '#00B8A9',
  coral:      '#FF6B6B',
  mint:       '#30D158',
  amber:      '#FFB347',
  violet:     '#7C5CFC',
  gold:       '#FFD60A',
  glass: (accent = 'rgba(10,132,255,0.10)') => ({
    background:           'rgba(255,255,255,0.85)',
    backdropFilter:       'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderRadius:         20,
    border:               `1px solid ${accent}`,
    boxShadow:            '0 4px 20px rgba(10,132,255,0.07), 0 1px 3px rgba(0,0,0,0.04)',
  }),
}

// ── Section label ────────────────────────────────────────────────
const SLabel = ({ children }: { children: string }) => (
  <div style={{
    fontSize:10, fontWeight:800, letterSpacing:1.5,
    color:D.textMuted, textTransform:'uppercase',
    marginBottom:10, marginTop:4, paddingLeft:2,
  }}>{children}</div>
)

// ── Case Card ────────────────────────────────────────────────────
const CaseCard = ({ c, onPress, onUpgrade, isPro }: any) => (
  <div onClick={() => c.free || isPro ? onPress(c.id) : onUpgrade()}
    style={{
      ...D.glass(`${c.color}18`),
      padding:'16px', marginBottom:10, cursor:'pointer',
      display:'flex', alignItems:'center', gap:14,
      transition:'transform 0.15s ease, box-shadow 0.15s ease',
    }}
    onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.98)')}
    onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
  >
    {/* Icon */}
    <div style={{
      width:52, height:52, borderRadius:16, flexShrink:0,
      background:`${c.color}12`, border:`1.5px solid ${c.color}25`,
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:26,
    }}>{c.icon}</div>

    {/* Content */}
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:15, fontWeight:800, color:D.text, marginBottom:2 }}>{c.title}</div>
      <div style={{ fontSize:12, color:D.textSub }}>{c.sub}</div>
    </div>

    {/* Right */}
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
      <div style={{
        fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:10,
        background:`${c.color}12`, color:c.color, border:`1px solid ${c.color}25`,
      }}>+{c.xpReward} XP</div>
      {!c.free && !isPro && (
        <div style={{
          fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:10,
          background:'rgba(255,214,10,0.12)', color:'#B8860B',
          border:'1px solid rgba(255,214,10,0.25)',
        }}>🔒 PRO</div>
      )}
    </div>
  </div>
)

// ── Quick Tool ───────────────────────────────────────────────────
const QuickTool = ({ icon, label, color, onPress }: any) => (
  <div onClick={onPress} style={{
    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
    cursor:'pointer', minWidth:64,
  }}>
    <div style={{
      width:56, height:56, borderRadius:18,
      background:`${color}10`, border:`1px solid ${color}22`,
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:26,
      boxShadow:`0 2px 12px ${color}15`,
    }}>{icon}</div>
    <span style={{ fontSize:10, fontWeight:600, color:D.textSub, textAlign:'center' }}>{label}</span>
  </div>
)

// ── Live Case Card ───────────────────────────────────────────────
const LiveCard = ({ title, location, urgency, tags, color }: any) => {
  const urgencyColor = urgency === 'CRITICAL' ? D.coral : urgency === 'URGENT' ? D.amber : D.mint
  return (
    <div style={{
      ...D.glass(`${color}18`),
      padding:14, minWidth:240, flexShrink:0,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:10, color:D.textMuted, fontWeight:600 }}>{location}</span>
        <span style={{
          fontSize:9, fontWeight:800, padding:'2px 8px', borderRadius:8,
          background:`${urgencyColor}15`, color:urgencyColor,
          border:`1px solid ${urgencyColor}30`,
        }}>{urgency}</span>
      </div>
      <div style={{ fontSize:14, fontWeight:800, color:D.text, marginBottom:8, lineHeight:1.3 }}>{title}</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {tags.map((t: string) => (
          <span key={t} style={{
            fontSize:10, fontWeight:600, padding:'3px 8px', borderRadius:8,
            background:`${color}10`, color:color, border:`1px solid ${color}20`,
          }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ── PROPS ────────────────────────────────────────────────────────
interface HubProps {
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
  onXP: (n: number) => void
}

export default function HubPage({
  xp, streak, casesCompleted, mcqCorrect, isPro,
  criticalCases, sportsCases, pedsCases,
  setActiveCase, setShowUpgrade, setTab, setToolTab, onXP,
}: HubProps) {

  const [liveCount, setLiveCount] = useState(1247)
  const [showScribe, setShowScribe] = useState(false)
  const [showAcademy, setShowAcademy] = useState(false)
  const [showLiveCases, setShowLiveCases] = useState(false)

  // Animate live count
  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(n => n + Math.floor(Math.random() * 3) - 1)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  if (showScribe)    return <AmbientScribe onXP={onXP} onClose={() => setShowScribe(false)}/>
  if (showAcademy)   return <PulseAcademy onXP={onXP} onClose={() => setShowAcademy(false)}/>
  if (showLiveCases) return <LiveCaseViewer onXP={onXP} onClose={() => setShowLiveCases(false)}/>

  const quickTools = [
    { icon:'🎙️', label:'AI Scribe',  color:D.teal,   action: () => setShowScribe(true) },
    { icon:'🧠', label:'Academy',    color:D.violet, action: () => setShowAcademy(true) },
    { icon:'📋', label:'Rx AI',      color:D.blue,   action: () => { setTab('tools'); setToolTab('rx') } },
    { icon:'⚡', label:'Code Blue',  color:D.coral,  action: () => { setTab('tools'); setToolTab('codeblue') } },
    { icon:'💊', label:'Drug Check', color:D.mint,   action: () => { setTab('tools'); setToolTab('drugcheck') } },
    { icon:'📊', label:'Risk Calc',  color:D.amber,  action: () => { setTab('tools'); setToolTab('riskcalc') } },
  ]

  const liveCases = [
    { title:'52M — Anterior STEMI', location:'Riyadh', urgency:'CRITICAL', tags:['Labs','ECG','Echo'], color:D.coral },
    { title:'67F — Acute Heart Failure', location:'Dubai', urgency:'URGENT', tags:['BNP','CXR','Echo'], color:D.amber },
    { title:'34M — Tension PTX', location:'Jeddah', urgency:'CRITICAL', tags:['CXR','ABG','Needle'], color:D.coral },
    { title:'28F — PE High Probability', location:'Riyadh', urgency:'URGENT', tags:['CTPA','D-Dimer','ECG'], color:D.blue },
  ]

  return (
    <div style={{ fontFamily:F, paddingBottom:20 }}>

      {/* ── 1. HEALTH STATUS HEADER ── */}
      <HealthStatusHeader onXP={onXP}/>

      {/* ── 2. AMBIENT AI SCRIBE ── */}
      <div
        onClick={() => setShowScribe(true)}
        style={{
          ...D.glass(`${D.teal}20`),
          padding:'16px 18px', marginBottom:20, cursor:'pointer',
          background:`linear-gradient(135deg, rgba(0,184,169,0.08), rgba(10,132,255,0.05))`,
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:48, height:48, borderRadius:15, flexShrink:0,
            background:`${D.teal}15`, border:`1px solid ${D.teal}25`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
          }}>🎙️</div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
              <span style={{ fontSize:10, fontWeight:800, color:D.teal, letterSpacing:1 }}>AMBIENT AI SCRIBE</span>
              <span style={{
                fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:6,
                background:`${D.blue}15`, color:D.blue, border:`1px solid ${D.blue}25`,
              }}>2026</span>
            </div>
            <div style={{ fontSize:16, fontWeight:800, color:D.text }}>Start Consultation</div>
            <div style={{ fontSize:12, color:D.textSub }}>Record → AI generates SOAP note · EN + AR</div>
          </div>
          <div style={{
            width:36, height:36, borderRadius:12,
            background:`linear-gradient(135deg,${D.teal},${D.blue})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'white', fontSize:16, flexShrink:0,
            boxShadow:`0 4px 12px ${D.teal}30`,
          }}>›</div>
        </div>

        {/* Chips */}
        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          {['2h/day saved','SOAP format','Arabic + English'].map(t => (
            <span key={t} style={{
              fontSize:10, fontWeight:600, padding:'4px 10px', borderRadius:10,
              background:'rgba(255,255,255,0.70)', color:D.textSub,
              border:`1px solid ${D.cardBorder}`,
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── 3. QUICK TOOLS ── */}
      <SLabel>⚡ Quick Tools</SLabel>
      <div style={{
        ...D.glass(),
        padding:'16px', marginBottom:20,
        overflowX:'auto', WebkitOverflowScrolling:'touch',
      }}>
        <div style={{ display:'flex', gap:16, width:'max-content' }}>
          {quickTools.map(t => (
            <QuickTool key={t.label} {...t} onPress={t.action}/>
          ))}
        </div>
      </div>

      {/* ── 4. CASE OF THE DAY ── */}
      <SLabel>🏥 Case of the Day</SLabel>
      <div style={{
        ...D.glass(`${D.coral}18`),
        padding:'18px', marginBottom:20, cursor:'pointer',
        background:`linear-gradient(135deg, rgba(255,107,107,0.06), rgba(10,132,255,0.04))`,
      }}
        onClick={() => setActiveCase('septic_shock')}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div style={{
            width:52, height:52, borderRadius:16,
            background:`${D.coral}12`, border:`1.5px solid ${D.coral}25`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
          }}>🦠</div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
              <span style={{ fontSize:10, fontWeight:800, color:D.coral, letterSpacing:1 }}>CASE OF THE DAY</span>
              <span style={{
                fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:6,
                background:'rgba(10,132,255,0.10)', color:D.blue,
              }}>TODAY</span>
            </div>
            <div style={{ fontSize:17, fontWeight:800, color:D.text }}>Septic Shock</div>
            <div style={{ fontSize:12, color:D.textSub }}>Vasopressors · Bundle · 30 XP</div>
          </div>
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            width:36, height:36, borderRadius:12,
            background:`${D.coral}12`, border:`1px solid ${D.coral}25`,
            justifyContent:'center',
          }}>
            <span style={{ fontSize:8, color:D.coral, fontWeight:800 }}>●</span>
            <span style={{ fontSize:8, color:D.coral, fontWeight:700 }}>LIVE</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height:4, background:'rgba(10,132,255,0.08)', borderRadius:2, overflow:'hidden' }}>
          <div style={{
            height:'100%', width:'35%',
            background:`linear-gradient(90deg,${D.coral},${D.amber})`,
            borderRadius:2,
          }}/>
        </div>
        <div style={{ fontSize:10, color:D.textMuted, marginTop:4 }}>35% of doctors attempted today</div>
      </div>

      {/* ── 5. LIVE CLINICAL FEED ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <SLabel>🔴 Live Clinical Feed</SLabel>
        <span style={{ fontSize:11, fontWeight:700, color:D.teal }}>
          {liveCount.toLocaleString()} active
        </span>
      </div>

      <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch', marginBottom:20 }}>
        <div style={{ display:'flex', gap:12, paddingBottom:4, width:'max-content' }}>
          {liveCases.map((c, i) => <LiveCard key={i} {...c}/>)}
        </div>
      </div>

      {/* ── 6. ACADEMY ── */}
      <SLabel>🎓 Academy</SLabel>
      <div
        onClick={() => setShowAcademy(true)}
        style={{
          ...D.glass(`${D.violet}20`),
          padding:'16px 18px', marginBottom:20, cursor:'pointer',
          background:`linear-gradient(135deg, rgba(124,92,252,0.06), rgba(10,132,255,0.04))`,
        }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:48, height:48, borderRadius:15,
            background:`${D.violet}12`, border:`1px solid ${D.violet}25`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
          }}>🎓</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, color:D.text, marginBottom:2 }}>Clinical Academy</div>
            <div style={{ fontSize:11, color:D.textSub }}>AI Lectures · Board Prep · EN + AR</div>
          </div>
          <div style={{
            fontSize:10, fontWeight:700, padding:'4px 12px', borderRadius:10,
            background:`${D.violet}12`, color:D.violet, border:`1px solid ${D.violet}25`,
          }}>Open →</div>
        </div>
      </div>

      {/* ── 7. CASE LIBRARY ── */}
      <SLabel>📚 Case Library</SLabel>

      {/* Critical Care */}
      <div style={{ ...D.glass(`${D.coral}15`), padding:'14px 16px', marginBottom:10, cursor:'pointer' }}
        onClick={() => setActiveCase('septic_shock')}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:44, height:44, borderRadius:14,
            background:`${D.coral}12`, border:`1px solid ${D.coral}22`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
          }}>🚨</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:800, color:D.text }}>Critical Care</div>
            <div style={{ fontSize:11, color:D.textSub }}>ED · ICU · CCU — {criticalCases.length} cases</div>
          </div>
          <span style={{ fontSize:20, color:D.textMuted }}>›</span>
        </div>
      </div>

      {/* Sports Medicine */}
      <div style={{ ...D.glass(`${D.mint}15`), padding:'14px 16px', marginBottom:10, cursor:'pointer' }}
        onClick={() => setActiveCase('concussion')}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:44, height:44, borderRadius:14,
            background:`${D.mint}12`, border:`1px solid ${D.mint}22`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
          }}>⚽</div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:14, fontWeight:800, color:D.text }}>Sports Medicine</span>
              <span style={{
                fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:6,
                background:`${D.mint}15`, color:D.mint,
              }}>FIFA 2026</span>
            </div>
            <div style={{ fontSize:11, color:D.textSub }}>Pitch-side · {sportsCases.length} cases</div>
          </div>
          <span style={{ fontSize:20, color:D.textMuted }}>›</span>
        </div>
      </div>

      {/* Pediatrics */}
      <div style={{ ...D.glass(`${D.violet}15`), padding:'14px 16px', marginBottom:20, cursor:'pointer' }}
        onClick={() => setActiveCase('febrile')}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:44, height:44, borderRadius:14,
            background:`${D.violet}12`, border:`1px solid ${D.violet}22`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
          }}>🧸</div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:14, fontWeight:800, color:D.text }}>Pediatrics</span>
              <span style={{
                fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:6,
                background:`${D.violet}15`, color:D.violet,
              }}>NEW</span>
            </div>
            <div style={{ fontSize:11, color:D.textSub }}>Febrile · Procedures · {pedsCases.length} cases</div>
          </div>
          <span style={{ fontSize:20, color:D.textMuted }}>›</span>
        </div>
      </div>

      {/* ── 8. STATS STRIP ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
        {[
          { icon:'⚡', label:'XP', value:xp, color:D.blue },
          { icon:'🏥', label:'Cases', value:casesCompleted, color:D.teal },
          { icon:'🔥', label:'Streak', value:`${streak}d`, color:D.amber },
        ].map(s => (
          <div key={s.label} style={{
            ...D.glass(`${s.color}15`),
            padding:'14px 10px', textAlign:'center',
          }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:9, color:D.textMuted, fontWeight:700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── 9. COMING SOON ── */}
      <SLabel>🚀 Coming Soon</SLabel>
      {[
        { icon:'📄', title:'Medical Reports AI', sub:'Discharge · Referral · Handover', color:D.blue, stat:'12+ Types' },
        { icon:'🔬', title:'Non-Invasive Tech',  sub:'ECG AI · Retinal · Skin lesion',  color:D.teal, stat:'94% Accuracy' },
      ].map(item => (
        <div key={item.title} style={{
          ...D.glass(`${item.color}12`),
          padding:'14px 16px', marginBottom:10,
          display:'flex', alignItems:'center', gap:12,
        }}>
          <div style={{
            width:44, height:44, borderRadius:14, flexShrink:0,
            background:`${item.color}10`, border:`1px solid ${item.color}20`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
          }}>{item.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:D.text, marginBottom:2 }}>{item.title}</div>
            <div style={{ fontSize:11, color:D.textSub }}>{item.sub}</div>
          </div>
          <div style={{
            fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:10,
            background:'rgba(10,31,60,0.06)', color:D.textMuted,
            border:`1px solid rgba(10,31,60,0.08)`,
            whiteSpace:'nowrap',
          }}>
            {item.stat}
          </div>
        </div>
      ))}

    </div>
  )
}
"""

def main():
    print("\n" + "═"*60)
    print("  Cliniverse AI — HubPage Rewrite")
    print("  Apple Health 2026 · Ocean Blue · Clean Cards")
    print("═"*60 + "\n")

    target = COMP / 'HubPage.tsx'
    if target.exists():
        shutil.copy2(target, BACKUP / 'HubPage.tsx.pre-rewrite')
        print(f"📁 Backup saved")

    target.write_text(HUBPAGE, encoding='utf-8')
    print(f"✅ HubPage.tsx written ({len(HUBPAGE):,} chars)")
    print(f"""
═══════════════════════════════════════════════════
What's new:
  • HealthStatusHeader (Apple Watch) — top
  • Ambient AI Scribe — prominent CTA
  • Quick Tools — horizontal scroll, 6 tools
  • Case of the Day — live progress bar
  • Live Clinical Feed — horizontal scroll cards
  • Academy — clean entry card
  • Case Library — Critical/Sports/Peds
  • Stats strip — XP/Cases/Streak
  • Coming Soon — clean 2-item list

Next:
  npx next build
  git add -A && git commit -m "feat: HubPage Apple Health 2026 redesign"
  git push
═══════════════════════════════════════════════════
""")

if __name__ == '__main__':
    main()
