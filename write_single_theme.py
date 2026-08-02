#!/usr/bin/env python3
"""
write_single_theme.py — Cliniverse AI
══════════════════════════════════════
ثيم واحد Ocean/Apple style على كل التطبيق
+ تبسيط Settings في ProfilePage
"""

from pathlib import Path
import re, shutil

PROJECT = Path('/Users/macbook/cliniverse-ai')
COMP    = PROJECT / 'app' / 'components'
BACKUP  = PROJECT / '_theme_backups'
BACKUP.mkdir(exist_ok=True)

# ── 1. globals.css — ثيم واحد نظيف ──────────────────────────────
GLOBALS_SINGLE_THEME = """
/* ══════════════════════════════════════════════════════
   CLINIVERSE AI — Single Ocean Theme (Apple Style 2026)
   Applied globally — no theme switching needed
══════════════════════════════════════════════════════ */
:root {
  /* Backgrounds */
  --bg-base:         #F2F7FF;
  --bg-card:         rgba(255, 255, 255, 0.82);
  --bg-elevated:     #FFFFFF;
  --bg-deep:         #E4EEF8;
  --bg-input:        rgba(255, 255, 255, 0.70);

  /* Text */
  --text-primary:    #0A1F3C;
  --text-secondary:  rgba(10, 31, 60, 0.65);
  --text-muted:      rgba(10, 31, 60, 0.40);
  --text-inverse:    #FFFFFF;

  /* Borders */
  --border-card:     rgba(10, 132, 255, 0.10);
  --border-subtle:   rgba(10, 132, 255, 0.06);
  --border-accent:   rgba(0, 184, 169, 0.25);

  /* Accents */
  --accent:          #00B8A9;
  --accent-blue:     #0A84FF;
  --accent-coral:    #FF6B6B;
  --accent-amber:    #FFB347;
  --accent-mint:     #30D158;
  --accent-violet:   #7C5CFC;
  --accent-glow:     rgba(0, 184, 169, 0.15);

  /* Nav */
  --nav-bg:          rgba(255, 255, 255, 0.92);
  --nav-border:      rgba(10, 132, 255, 0.10);
  --nav-active:      #0A84FF;
  --nav-inactive:    rgba(10, 31, 60, 0.35);
  --tab-active:      rgba(10, 132, 255, 0.10);
  --tab-text:        #0A84FF;

  /* Shadows */
  --shadow:          0 2px 20px rgba(10, 132, 255, 0.08);
  --shadow-md:       0 8px 32px rgba(10, 132, 255, 0.12);
  --shadow-lg:       0 20px 60px rgba(10, 132, 255, 0.18);
  --shadow-card:     0 4px 24px rgba(10, 132, 255, 0.08), 0 1px 4px rgba(0,0,0,0.04);

  /* Legacy bridge vars */
  --bg-primary:      #F2F7FF;
  --bg-card-hover:   rgba(255, 255, 255, 0.95);
  --text:            #0A1F3C;
  --t1:              #0A1F3C;
  --t2:              rgba(10, 31, 60, 0.65);
  --bg:              #F2F7FF;
  --bg1:             #FFFFFF;
  --bg2:             #E4EEF8;
  --border:          rgba(10, 132, 255, 0.10);
  --aurora:          radial-gradient(ellipse at 30% 0%, rgba(0,184,169,0.08), rgba(10,132,255,0.05) 50%, transparent 75%);
}

/* Body */
html, body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
               'SF Pro Text', 'Helvetica Neue', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg-deep); }
::-webkit-scrollbar-thumb { background: var(--border-accent); border-radius: 4px; }

/* Glass card utility */
.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--border-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
}

/* Input */
input, textarea {
  color: var(--text-primary);
  background: var(--bg-input);
}
input::placeholder, textarea::placeholder {
  color: var(--text-muted);
}

/* Tap highlight */
*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

@keyframes spin    { to { transform: rotate(360deg) } }
@keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
@keyframes pulse   { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
@keyframes shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }
"""

# ── 2. ProfilePage Settings section ──────────────────────────────
# نكتب settings section بسيطة بدون ThemeToggle
SETTINGS_COMPONENT = r"""'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const CertificateGenerator = dynamic(() => import('./CertificateGenerator'), { ssr:false })

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

// ── Design tokens ────────────────────────────────────────────────
const D = {
  bg:          'var(--bg-base, #F2F7FF)',
  card:        'var(--bg-card, rgba(255,255,255,0.82))',
  cardSolid:   '#FFFFFF',
  text:        'var(--text-primary, #0A1F3C)',
  textSub:     'var(--text-secondary, rgba(10,31,60,0.65))',
  textMuted:   'var(--text-muted, rgba(10,31,60,0.40))',
  border:      'var(--border-card, rgba(10,132,255,0.10))',
  accent:      'var(--accent, #00B8A9)',
  accentBlue:  'var(--accent-blue, #0A84FF)',
  accentCoral: 'var(--accent-coral, #FF6B6B)',
  accentMint:  'var(--accent-mint, #30D158)',
  accentAmber: 'var(--accent-amber, #FFB347)',
  shadow:      'var(--shadow-card)',
  glass: {
    background:           'var(--bg-card, rgba(255,255,255,0.82))',
    backdropFilter:       'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius:         20,
    border:               '1px solid var(--border-card, rgba(10,132,255,0.10))',
    boxShadow:            '0 4px 24px rgba(10,132,255,0.08)',
  }
}

const RANKS = [
  { name:'Clinical Clerk',    icon:'🩺', color:'#64748b', xpNeeded:0 },
  { name:'Junior Resident',   icon:'📋', color:'#00B8A9', xpNeeded:100 },
  { name:'Senior Resident',   icon:'🔬', color:'#30D158', xpNeeded:300 },
  { name:'Registrar',         icon:'⚕️', color:'#FFB347', xpNeeded:600 },
  { name:'Specialist',        icon:'🏥', color:'#0A84FF', xpNeeded:1000 },
  { name:'Consultant',        icon:'👨‍⚕️', color:'#FF6B6B', xpNeeded:1500 },
  { name:'Senior Consultant', icon:'🎓', color:'#FFD60A', xpNeeded:2200 },
  { name:'Chief of Medicine', icon:'🌟', color:'#7C5CFC', xpNeeded:3000 },
]

const BADGES = [
  { id:'first_case', icon:'🏅', name:'First Case',   color:'#FFD60A' },
  { id:'cardio',     icon:'🫀', name:'Cardiologist', color:'#FF6B6B' },
  { id:'speed',      icon:'⚡', name:'Lightning MD', color:'#FFD60A' },
  { id:'streak3',    icon:'🔥', name:'On Fire',      color:'#FF6B35' },
  { id:'mcq10',      icon:'🧬', name:'Brain Trust',  color:'#30D158' },
  { id:'stemi',      icon:'❤️‍🔥', name:'STEMI Master',color:'#FF6B6B' },
  { id:'sports',     icon:'⚽', name:'FIFA Medic',   color:'#30D158' },
  { id:'peds',       icon:'🧸', name:'Pediatrician', color:'#7C5CFC' },
]

interface ProfileProps {
  xp: number
  streak: number
  casesCompleted: number
  mcqCorrect: number
  isPro: boolean
  name: string
  onUpgrade: () => void
  onReset: () => void
}

export default function ProfilePage({ xp, streak, casesCompleted, mcqCorrect, isPro, name, onUpgrade, onReset }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile'|'stats'|'settings'>('profile')
  const [showCert, setShowCert] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [soundFX, setSoundFX] = useState(true)
  const [haptics, setHaptics] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  const getRank = () => {
    let r = RANKS[0]
    for (let i = RANKS.length-1; i >= 0; i--) { if (xp >= RANKS[i].xpNeeded) { r = RANKS[i]; break } }
    return r
  }
  const getNextRank = () => { for (let i=0;i<RANKS.length;i++) { if (xp<RANKS[i].xpNeeded) return RANKS[i] } return null }
  const rank = getRank()
  const nextRank = getNextRank()
  const rankPct = nextRank ? Math.round(((xp - rank.xpNeeded)/(nextRank.xpNeeded - rank.xpNeeded))*100) : 100

  // ── TABS ─────────────────────────────────────────────────────
  const tabs = [
    { id:'profile',  label:'Profile',  icon:'👤' },
    { id:'stats',    label:'Stats',    icon:'📊' },
    { id:'settings', label:'Settings', icon:'⚙️' },
  ] as const

  return (
    <div style={{ fontFamily:F, paddingBottom:20 }}>

      {/* ── TAB BAR ── */}
      <div style={{
        display:'flex', gap:4,
        background:D.card, backdropFilter:'blur(16px)',
        border:`1px solid ${D.border}`,
        borderRadius:16, padding:4, marginBottom:20,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex:1, padding:'9px 4px', border:'none', cursor:'pointer',
            borderRadius:12, fontFamily:F, fontWeight:700, fontSize:11,
            background: activeTab===t.id ? D.cardSolid : 'transparent',
            color: activeTab===t.id ? D.accentBlue : D.textMuted,
            boxShadow: activeTab===t.id ? '0 2px 8px rgba(10,132,255,0.10)' : 'none',
            transition:'all 0.2s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══ PROFILE TAB ══ */}
      {activeTab === 'profile' && (
        <div>
          {/* Avatar + Rank */}
          <div style={{
            ...D.glass,
            padding:'28px 20px 20px', marginBottom:14, textAlign:'center',
            background:`linear-gradient(145deg, rgba(0,184,169,0.08), rgba(10,132,255,0.05))`,
          }}>
            {/* Avatar */}
            <div style={{
              width:80, height:80, borderRadius:'50%', margin:'0 auto 12px',
              background:`linear-gradient(135deg, ${D.accent}, ${D.accentBlue})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:36, boxShadow:`0 8px 24px rgba(0,184,169,0.30)`,
              border:'3px solid rgba(255,255,255,0.90)',
            }}>👤</div>

            <div style={{ fontSize:20, fontWeight:800, color:D.text, marginBottom:2 }}>
              {name || 'Dr. Ahmed'}
            </div>
            <div style={{ fontSize:13, color:D.textSub, marginBottom:16 }}>
              {rank.icon} {rank.name}
            </div>

            {/* XP Progress */}
            <div style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color:D.textMuted, fontWeight:600 }}>XP Progress</span>
                <span style={{ fontSize:11, fontWeight:700, color:D.accentBlue }}>{xp} XP</span>
              </div>
              <div style={{ height:8, background:'rgba(10,132,255,0.10)', borderRadius:4, overflow:'hidden' }}>
                <div style={{
                  height:'100%', width:`${rankPct}%`,
                  background:`linear-gradient(90deg, ${D.accent}, ${D.accentBlue})`,
                  borderRadius:4, transition:'width 0.6s ease',
                  boxShadow:`0 0 8px rgba(0,184,169,0.40)`,
                }}/>
              </div>
              {nextRank && (
                <div style={{ fontSize:10, color:D.textMuted, marginTop:4, textAlign:'right' }}>
                  {nextRank.xpNeeded - xp} XP to {nextRank.icon} {nextRank.name}
                </div>
              )}
            </div>

            {/* PRO badge */}
            {isPro && (
              <div style={{
                display:'inline-flex', alignItems:'center', gap:6,
                background:'linear-gradient(135deg,#FFD60A,#FFB347)',
                borderRadius:12, padding:'4px 14px',
                fontSize:11, fontWeight:800, color:'#000',
              }}>👑 PRO Member</div>
            )}
          </div>

          {/* Quick stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
            {[
              { label:'Cases Done', value:casesCompleted, icon:'🏥', color:D.accent },
              { label:'MCQ Correct', value:mcqCorrect, icon:'🧬', color:D.accentBlue },
              { label:'Day Streak', value:streak, icon:'🔥', color:D.accentAmber },
            ].map(s => (
              <div key={s.label} style={{
                ...D.glass, padding:'14px 10px', textAlign:'center',
              }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:9, color:D.textMuted, fontWeight:600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ ...D.glass, padding:16, marginBottom:14 }}>
            <div style={{ fontSize:10, color:D.textMuted, fontWeight:700, letterSpacing:1.5, marginBottom:12 }}>
              🏅 BADGES EARNED
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {BADGES.map(b => (
                <div key={b.id} style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  background:`${b.color}10`, border:`1px solid ${b.color}25`,
                  borderRadius:14, padding:'10px 12px', minWidth:64,
                }}>
                  <span style={{ fontSize:22 }}>{b.icon}</span>
                  <span style={{ fontSize:9, color:b.color, fontWeight:700, textAlign:'center' }}>{b.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate */}
          <button onClick={() => setShowCert(true)} style={{
            width:'100%', padding:14, borderRadius:16, border:'none',
            background:`linear-gradient(135deg, ${D.accent}, ${D.accentBlue})`,
            color:'white', fontSize:14, fontWeight:700, cursor:'pointer',
            boxShadow:'0 8px 24px rgba(0,184,169,0.25)', marginBottom:10,
          }}>
            📜 Generate Clinical Certificate
          </button>

          {!isPro && (
            <button onClick={onUpgrade} style={{
              width:'100%', padding:14, borderRadius:16,
              border:`1px solid rgba(255,214,10,0.30)`,
              background:'rgba(255,214,10,0.08)',
              color:'#B8860B', fontSize:14, fontWeight:700, cursor:'pointer',
            }}>
              ⭐ Upgrade to PRO — $14.99/mo
            </button>
          )}

          {showCert && <CertificateGenerator rank={rank.name} xp={xp} casesCompleted={casesCompleted} onClose={() => setShowCert(false)}/>}
        </div>
      )}

      {/* ══ STATS TAB ══ */}
      {activeTab === 'stats' && (
        <div>
          {/* Weekly activity */}
          <div style={{ ...D.glass, padding:16, marginBottom:14 }}>
            <div style={{ fontSize:10, color:D.textMuted, fontWeight:700, letterSpacing:1.5, marginBottom:12 }}>
              📈 WEEKLY ACTIVITY
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', height:60 }}>
              {['M','T','W','T','F','S','S'].map((d,i) => {
                const h = [40,75,55,90,60,30,20][i]
                return (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1 }}>
                    <div style={{
                      width:'70%', height:`${h}%`, minHeight:4,
                      background: i===4 ? `linear-gradient(180deg,${D.accent},${D.accentBlue})` : 'rgba(10,132,255,0.12)',
                      borderRadius:'4px 4px 0 0',
                    }}/>
                    <span style={{ fontSize:9, color:D.textMuted }}>{d}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Performance cards */}
          {[
            { label:'Total XP Earned',    value:xp,            unit:'points',   icon:'⚡', color:D.accentBlue },
            { label:'Cases Completed',    value:casesCompleted, unit:'cases',   icon:'🏥', color:D.accent },
            { label:'MCQ Accuracy',       value:mcqCorrect,    unit:'correct',  icon:'🧬', color:D.accentMint },
            { label:'Current Streak',     value:streak,        unit:'days',     icon:'🔥', color:D.accentAmber },
          ].map(s => (
            <div key={s.label} style={{
              ...D.glass, padding:'14px 16px', marginBottom:10,
              display:'flex', alignItems:'center', gap:14,
            }}>
              <div style={{
                width:44, height:44, borderRadius:14, flexShrink:0,
                background:`${s.color}12`, border:`1px solid ${s.color}25`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
              }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:D.textMuted, fontWeight:600, marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
              </div>
              <div style={{ fontSize:11, color:D.textMuted }}>{s.unit}</div>
            </div>
          ))}
        </div>
      )}

      {/* ══ SETTINGS TAB ══ */}
      {activeTab === 'settings' && (
        <div>

          {/* Account */}
          <div style={{ fontSize:10, color:D.textMuted, fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>
            ACCOUNT
          </div>
          <div style={{ ...D.glass, marginBottom:16, overflow:'hidden' }}>
            {[
              { icon:'👤', label:'Edit Profile',      sub:'Name · Specialty · Country',   action:()=>{} },
              { icon:'🔔', label:'Notifications',     sub:'On-call reminders · Alerts',   action:()=>{} },
              { icon:'📱', label:'Install App',        sub:'Add to Home Screen for offline',action:()=>{} },
              { icon:'🔒', label:'Privacy & Security', sub:'Data · Account settings',      action:()=>{} },
            ].map((item, i, arr) => (
              <div key={item.label} onClick={item.action} style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'14px 16px',
                borderBottom: i < arr.length-1 ? `1px solid ${D.border}` : 'none',
                cursor:'pointer',
              }}>
                <div style={{
                  width:36, height:36, borderRadius:10,
                  background:'rgba(10,132,255,0.08)', border:`1px solid ${D.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
                }}>{item.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:D.text }}>{item.label}</div>
                  <div style={{ fontSize:11, color:D.textMuted }}>{item.sub}</div>
                </div>
                <span style={{ fontSize:18, color:D.textMuted }}>›</span>
              </div>
            ))}
          </div>

          {/* Preferences — Toggle switches */}
          <div style={{ fontSize:10, color:D.textMuted, fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>
            PREFERENCES
          </div>
          <div style={{ ...D.glass, marginBottom:16, overflow:'hidden' }}>
            {[
              { icon:'🔔', label:'Notifications', sub:'Clinical reminders', val:notifications, set:setNotifications },
              { icon:'🔊', label:'Sound Effects',  sub:'Feedback sounds',   val:soundFX,       set:setSoundFX },
              { icon:'📳', label:'Haptics',         sub:'Tactile feedback',  val:haptics,        set:setHaptics },
              { icon:'⬛', label:'Compact Mode',    sub:'Denser layout',     val:compactMode,    set:setCompactMode },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'13px 16px',
                borderBottom: i < arr.length-1 ? `1px solid ${D.border}` : 'none',
              }}>
                <div style={{
                  width:36, height:36, borderRadius:10,
                  background:'rgba(10,132,255,0.08)', border:`1px solid ${D.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
                }}>{item.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:D.text }}>{item.label}</div>
                  <div style={{ fontSize:11, color:D.textMuted }}>{item.sub}</div>
                </div>
                {/* iOS Toggle */}
                <div onClick={() => item.set(!item.val)} style={{
                  width:51, height:31, borderRadius:16, cursor:'pointer',
                  background: item.val ? D.accentBlue : 'rgba(10,31,60,0.15)',
                  position:'relative', transition:'background 0.25s ease', flexShrink:0,
                }}>
                  <div style={{
                    position:'absolute', top:2,
                    left: item.val ? 22 : 2,
                    width:27, height:27, borderRadius:'50%',
                    background:'#FFFFFF',
                    boxShadow:'0 2px 6px rgba(0,0,0,0.18)',
                    transition:'left 0.25s ease',
                  }}/>
                </div>
              </div>
            ))}
          </div>

          {/* App info */}
          <div style={{ fontSize:10, color:D.textMuted, fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>
            ABOUT
          </div>
          <div style={{ ...D.glass, marginBottom:16, overflow:'hidden' }}>
            {[
              { icon:'ℹ️', label:'Version',         sub:'Cliniverse AI v6.0 · 2026' },
              { icon:'⚖️', label:'Terms & Privacy', sub:'Legal · Data usage' },
              { icon:'💬', label:'Send Feedback',   sub:'Help us improve' },
              { icon:'⭐', label:'Rate the App',    sub:'Support Cliniverse AI' },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'13px 16px',
                borderBottom: i < arr.length-1 ? `1px solid ${D.border}` : 'none',
                cursor:'pointer',
              }}>
                <div style={{
                  width:36, height:36, borderRadius:10,
                  background:'rgba(10,132,255,0.08)', border:`1px solid ${D.border}`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
                }}>{item.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:D.text }}>{item.label}</div>
                  <div style={{ fontSize:11, color:D.textMuted }}>{item.sub}</div>
                </div>
                <span style={{ fontSize:18, color:D.textMuted }}>›</span>
              </div>
            ))}
          </div>

          {/* Reset */}
          <button onClick={onReset} style={{
            width:'100%', padding:14, borderRadius:16,
            border:`1px solid rgba(255,107,107,0.25)`,
            background:'rgba(255,107,107,0.06)',
            color:'#C0392B', fontSize:14, fontWeight:600, cursor:'pointer',
          }}>
            🔄 Reset Onboarding
          </button>
        </div>
      )}
    </div>
  )
}
"""

def main():
    print("\n" + "═"*60)
    print("  Cliniverse AI — Single Ocean Theme + Simplified Settings")
    print("═"*60 + "\n")

    # 1. Update globals.css
    globals_path = PROJECT / 'app' / 'globals.css'
    if globals_path.exists():
        shutil.copy2(globals_path, BACKUP / 'globals.css.pre-single')
    globals_path.write_text(GLOBALS_SINGLE_THEME, encoding='utf-8')
    print(f"✅ globals.css — single Ocean theme")

    # 2. Write ProfilePage.tsx
    profile_path = COMP / 'ProfilePage.tsx'
    if profile_path.exists():
        shutil.copy2(profile_path, BACKUP / 'ProfilePage.tsx.pre-single')
    profile_path.write_text(SETTINGS_COMPONENT, encoding='utf-8')
    print(f"✅ ProfilePage.tsx — simplified settings, no ThemeToggle")

    print(f"""
═══════════════════════════════════════════════════
✅ Done!

Next:
  npx next build
  git add -A && git commit -m "feat: single Ocean theme + simplified settings"
  git push
═══════════════════════════════════════════════════
""")

if __name__ == '__main__':
    main()
