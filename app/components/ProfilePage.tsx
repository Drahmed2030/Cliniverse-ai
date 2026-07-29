'use client'
import React, { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif'

// ── DESIGN TOKENS — Teal Ocean + Apple Health ──
const T = {
  bgBase:    '#1e3d52',
  bgCard:    'rgba(36,63,82,0.55)',
  bgCard2:   'rgba(36,63,82,0.80)',
  border:    'rgba(255,255,255,0.08)',
  borderTeal:'rgba(0,196,180,0.28)',
  borderGold:'rgba(212,168,71,0.28)',
  text:      '#EEF6FA',
  dim:       'rgba(238,246,250,0.65)',
  muted:     'rgba(238,246,250,0.38)',
  // Apple Health colors
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
  amber:  '#FFB300',
}

// ── TIERS ──
const TIERS = [
  { min:0,    max:100,  id:'intern',     label:'Intern',     color:'#64748b', icon:'○' },
  { min:100,  max:500,  id:'resident',   label:'Resident',   color:T.blue,    icon:'◇' },
  { min:500,  max:1500, id:'fellow',     label:'Fellow',     color:T.purple,  icon:'⬡' },
  { min:1500, max:3000, id:'specialist', label:'Specialist', color:T.teal,    icon:'◈' },
  { min:3000, max:9999, id:'consultant', label:'Consultant', color:T.gold,    icon:'✦' },
]

function getTier(xp: number) {
  return TIERS.find(t => xp >= t.min && xp < t.max) || TIERS[TIERS.length-1]
}

// ── SUNRISE GLASS LOGO WATERMARK ──
const LogoWatermark = () => (
  <svg style={{position:'absolute',bottom:12,right:14,opacity:0.07,pointerEvents:'none'}}
    width="90" height="90" viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="wmg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD54F"/>
        <stop offset="60%" stopColor="#FF8F00"/>
      </linearGradient>
      <linearGradient id="wmt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E5FF"/>
        <stop offset="100%" stopColor="#00796B"/>
      </linearGradient>
    </defs>
    <rect x="5" y="5" width="90" height="90" rx="23" fill="rgba(255,213,79,0.15)" stroke="url(#wmg)" strokeWidth="2"/>
    <path d="M69 32C63 25 55 21 46 21C30 21 17 34 17 50C17 66 30 79 46 79C55 79 63 75 69 68"
      stroke="url(#wmg)" strokeWidth="9" strokeLinecap="round" fill="none"/>
    <path d="M36 50L46 63L70 36" stroke="url(#wmt)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="69" cy="32" r="5" fill="#FFD54F"/>
    <circle cx="69" cy="68" r="5" fill="#FFD54F"/>
  </svg>
)

// ── XP RING ──
const XPRing = ({ xp, tier }: { xp: number; tier: typeof TIERS[0] }) => {
  const pct = Math.min(((xp - tier.min) / (tier.max - tier.min)) * 100, 100)
  const r = 50, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{position:'relative',width:124,height:124,flexShrink:0}}>
      <svg width="124" height="124" viewBox="0 0 124 124">
        {/* Track */}
        <circle cx="62" cy="62" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
        {/* Gold accent ring */}
        <circle cx="62" cy="62" r={r} fill="none" stroke={T.gold} strokeWidth="1" strokeOpacity="0.2"/>
        {/* Progress */}
        <circle cx="62" cy="62" r={r} fill="none" stroke={tier.color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ*0.25}
          strokeLinecap="round" style={{filter:`drop-shadow(0 0 8px ${tier.color}88)`}}/>
        {/* Inner bg */}
        <circle cx="62" cy="62" r="42" fill="rgba(36,63,82,0.60)"/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1}}>
        <div style={{fontSize:20,color:tier.color,fontWeight:900,lineHeight:1}}>{tier.icon}</div>
        <div style={{fontSize:17,fontWeight:900,color:T.text,lineHeight:1.1}}>{xp}</div>
        <div style={{fontSize:8,color:T.muted,fontWeight:700,letterSpacing:1.5}}>XP</div>
      </div>
    </div>
  )
}

// ── STAT CARD ──
const StatCard = ({ label, value, color, icon }: { label:string; value:string|number; color:string; icon:string }) => (
  <div style={{
    background:`linear-gradient(135deg,${color}12,${color}04)`,
    border:`1px solid ${color}28`,
    borderRadius:18, padding:'14px 10px', textAlign:'center',
    position:'relative', overflow:'hidden',
  }}>
    <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
    <div style={{fontSize:24,fontWeight:900,color,lineHeight:1}}>{value}</div>
    <div style={{fontSize:9,color:T.muted,fontWeight:700,marginTop:5,letterSpacing:1,textTransform:'uppercase'}}>{label}</div>
  </div>
)

// ── ACHIEVEMENT CARD ──
const AchievementCard = ({ icon, label, desc, color, unlocked }: {
  icon:string; label:string; desc:string; color:string; unlocked:boolean
}) => (
  <div style={{
    background: unlocked ? `${color}08` : 'rgba(36,63,82,0.30)',
    border:`1px solid ${unlocked ? color+'22' : 'rgba(255,255,255,0.06)'}`,
    borderRadius:16, padding:'12px 14px',
    display:'flex', alignItems:'center', gap:12,
    opacity: unlocked ? 1 : 0.45,
  }}>
    <div style={{
      width:44,height:44,borderRadius:14,flexShrink:0,
      background: unlocked ? `${color}18` : 'rgba(36,63,82,0.50)',
      border:`1px solid ${unlocked ? color+'30' : 'rgba(255,255,255,0.07)'}`,
      display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
      boxShadow: unlocked ? `0 0 16px ${color}25` : 'none',
    }}>{icon}</div>
    <div style={{flex:1}}>
      <div style={{fontSize:13,fontWeight:800,color: unlocked ? T.text : T.muted,marginBottom:2}}>{label}</div>
      <div style={{fontSize:10,color:T.muted,lineHeight:1.4}}>{desc}</div>
    </div>
    {unlocked && <div style={{width:8,height:8,borderRadius:'50%',background:color,boxShadow:`0 0 8px ${color}`,flexShrink:0}}/>}
  </div>
)

// ── SETTINGS ROW ──
const SettingsRow = ({ icon, label, desc, color, value, danger, onClick }: {
  icon:string; label:string; desc?:string; color:string; value?:string; danger?:boolean; onClick?:()=>void
}) => (
  <div onClick={onClick} style={{
    background: danger ? 'rgba(255,59,48,0.05)' : T.bgCard,
    border:`1px solid ${danger ? 'rgba(255,59,48,0.18)' : T.border}`,
    borderRadius:16, padding:'13px 16px',
    display:'flex', alignItems:'center', gap:13, cursor:'pointer',
  }}>
    <div style={{
      width:40,height:40,borderRadius:12,flexShrink:0,
      background:`${color}18`,border:`1px solid ${color}28`,
      display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,
    }}>{icon}</div>
    <div style={{flex:1}}>
      <div style={{fontSize:14,fontWeight:700,color: danger ? T.red : T.text,marginBottom:1}}>{label}</div>
      {desc && <div style={{fontSize:11,color:T.muted}}>{desc}</div>}
    </div>
    {value && <div style={{fontSize:12,color:T.muted,marginRight:4}}>{value}</div>}
    <div style={{fontSize:18,color:T.muted,opacity:0.6}}>›</div>
  </div>
)

// ── SECTION LABEL ──
const SectionLabel = ({ label }: { label:string }) => (
  <div style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:1.5,textTransform:'uppercase',marginBottom:8,marginTop:6,paddingLeft:4}}>
    {label}
  </div>
)

// ── MAIN ──
interface Props {
  xp: number
  streak: number
  casesCompleted: number
  mcqCorrect: number
  isPro: boolean
  name?: string
  onUpgrade: () => void
  onReset: () => void
}

export default function ProfilePage({ xp, streak, casesCompleted, mcqCorrect, isPro, name, onUpgrade, onReset }: Props) {
  const [tab, setTab] = useState<'stats'|'awards'|'settings'>('stats')
  const tier = getTier(xp)
  const nextTier = TIERS[TIERS.findIndex(t => t.id === tier.id) + 1]
  const accuracy = mcqCorrect > 0 ? Math.round((mcqCorrect / Math.max(mcqCorrect + 2, 1)) * 100) : 0
  const xpToNext = nextTier ? nextTier.min - xp : 0
  const tierPct = Math.min(((xp - tier.min) / (tier.max - tier.min)) * 100, 100)

  const ACHIEVEMENTS = [
    { icon:'🫀', label:'STEMI Master',   desc:'Complete the STEMI case perfectly',    color:T.red,    unlocked: casesCompleted >= 1 },
    { icon:'⚡', label:'Lightning MD',   desc:'Answer a case in record time',          color:T.amber,  unlocked: mcqCorrect >= 5 },
    { icon:'🧬', label:'Brain Trust',    desc:'Score 10 correct MCQs in a row',        color:T.green,  unlocked: mcqCorrect >= 10 },
    { icon:'🔥', label:'On Fire',        desc:'3-day training streak achieved',         color:T.orange, unlocked: streak >= 3 },
    { icon:'🌍', label:'Global MD',      desc:'Join the global leaderboard',            color:T.blue,   unlocked: casesCompleted >= 3 },
    { icon:'🤖', label:'AI Pioneer',     desc:'Use the AI Case Generator',              color:T.teal,   unlocked: false },
    { icon:'👑', label:'Consultant',     desc:'Reach the Consultant tier (3000 XP)',    color:T.gold,   unlocked: xp >= 3000 },
    { icon:'💎', label:'PRO Member',     desc:'Unlock all PRO features',                color:T.purple, unlocked: isPro },
  ]

  return (
    <div style={{fontFamily:F, paddingBottom:8}}>

      {/* ── HERO CARD ── */}
      <div style={{
        background:'linear-gradient(145deg,rgba(13,37,53,0.98),rgba(22,46,62,0.96))',
        borderRadius:24, padding:'20px', marginBottom:14,
        border:`1px solid ${T.borderTeal}`,
        position:'relative', overflow:'hidden',
        boxShadow:`0 12px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,196,180,0.08)`,
      }}>
        {/* Ambient */}
        <div style={{position:'absolute',top:-40,left:-20,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,196,180,0.10),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-40,right:-20,width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,168,71,0.08),transparent 70%)',pointerEvents:'none'}}/>
        <LogoWatermark/>

        {/* Profile row */}
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16,position:'relative',zIndex:1}}>
          <XPRing xp={xp} tier={tier}/>
          <div style={{flex:1}}>
            {/* Tier badge */}
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:`${tier.color}15`,border:`1px solid ${tier.color}35`,borderRadius:20,padding:'4px 10px',marginBottom:8}}>
              <span style={{fontSize:11,color:tier.color}}>{tier.icon}</span>
              <span style={{fontSize:10,fontWeight:800,color:tier.color,letterSpacing:1}}>{tier.label.toUpperCase()}</span>
            </div>
            {/* Name */}
            <div style={{fontSize:20,fontWeight:900,color:T.text,lineHeight:1.1,marginBottom:3}}>
              {name || 'Dr. Physician'}
            </div>
            {/* Plan */}
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:12,color:T.dim}}>Cliniverse AI</span>
              <span style={{
                background: isPro ? `linear-gradient(135deg,${T.gold},${T.amber})` : 'rgba(238,246,250,0.08)',
                color: isPro ? '#000' : T.muted,
                borderRadius:8,padding:'2px 8px',fontSize:10,fontWeight:800,
              }}>{isPro ? '✦ PRO' : 'Free Plan'}</span>
            </div>
            {/* Next tier */}
            {nextTier && (
              <div style={{marginTop:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:9,color:T.muted,fontWeight:600,letterSpacing:0.5}}>NEXT: {nextTier.label.toUpperCase()}</span>
                  <span style={{fontSize:9,color:T.muted}}>{xpToNext} XP away</span>
                </div>
                <div style={{height:4,borderRadius:4,background:'rgba(255,255,255,0.07)',overflow:'hidden'}}>
                  <div style={{
                    height:'100%',borderRadius:4,
                    background:`linear-gradient(90deg,${tier.color},${nextTier.color})`,
                    width:`${tierPct}%`,
                    boxShadow:`0 0 8px ${tier.color}66`,
                    transition:'width 0.6s ease',
                  }}/>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Streak bar */}
        <div style={{
          display:'flex',alignItems:'center',gap:10,
          padding:'10px 14px',
          background:'rgba(36,63,82,0.60)',
          borderRadius:14,border:`1px solid ${T.border}`,
          position:'relative',zIndex:1,
        }}>
          <span style={{fontSize:18}}>🔥</span>
          <span style={{fontSize:16,fontWeight:900,color:T.orange}}>{streak}</span>
          <span style={{fontSize:12,color:T.dim,fontWeight:600}}>day streak</span>
          <div style={{width:1,height:16,background:'rgba(255,255,255,0.10)',margin:'0 4px'}}/>
          <span style={{fontSize:12,color:T.muted}}>{casesCompleted} cases · {accuracy}% accuracy</span>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{
        display:'flex',gap:4,marginBottom:16,
        background:'rgba(36,63,82,0.50)',borderRadius:16,padding:4,
        border:`1px solid ${T.border}`,
      }}>
        {(['stats','awards','settings'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:'10px 6px',border:'none',cursor:'pointer',
            borderRadius:12,fontFamily:F,fontWeight:700,fontSize:12,
            background: tab===t ? `linear-gradient(135deg,rgba(0,196,180,0.20),rgba(0,122,255,0.12))` : 'transparent',
            color: tab===t ? T.teal : T.muted,
            boxShadow: tab===t ? `inset 0 1px 0 rgba(255,255,255,0.06)` : 'none',
            border: tab===t ? `1px solid rgba(0,196,180,0.22)` : '1px solid transparent',
            transition:'all 0.2s',
          }}>
            {t==='stats' ? '📊 Stats' : t==='awards' ? '🏆 Awards' : '⚙️ Settings'}
          </button>
        ))}
      </div>

      {/* ── STATS TAB ── */}
      {tab==='stats' && (
        <div>
          {/* Stats grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
            <StatCard label="Cases Done"  value={casesCompleted} color={T.teal}   icon="🏥"/>
            <StatCard label="Accuracy"    value={`${accuracy}%`} color={T.green}  icon="🎯"/>
            <StatCard label="MCQ Correct" value={mcqCorrect}     color={T.blue}   icon="🧬"/>
            <StatCard label="Day Streak"  value={streak}         color={T.orange} icon="🔥"/>
          </div>

          {/* Tier Progression */}
          <div style={{
            background:T.bgCard,border:`1px solid ${T.border}`,
            borderRadius:20,padding:'18px',marginBottom:14,
            position:'relative',overflow:'hidden',
          }}>
            <LogoWatermark/>
            <SectionLabel label="Tier Progression"/>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {TIERS.map(t => {
                const isActive = t.id === tier.id
                const isPast = xp >= t.max
                return (
                  <div key={t.id} style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{
                      width:36,height:36,borderRadius:11,flexShrink:0,
                      background: isActive ? `${t.color}22` : isPast ? `${t.color}12` : 'rgba(36,63,82,0.50)',
                      border:`1px solid ${isActive ? t.color+'45' : isPast ? t.color+'25' : 'rgba(255,255,255,0.07)'}`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:15,color: isActive || isPast ? t.color : T.muted,
                      boxShadow: isActive ? `0 0 14px ${t.color}35` : 'none',
                    }}>{t.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:isActive?800:600,color:isActive?T.text:isPast?T.dim:T.muted}}>
                        {t.label}
                      </div>
                      <div style={{fontSize:10,color:T.muted}}>{t.min}–{t.max===9999?'∞':t.max} XP</div>
                    </div>
                    {isActive && (
                      <div style={{fontSize:10,color:t.color,fontWeight:800,background:`${t.color}18`,padding:'3px 10px',borderRadius:8,border:`1px solid ${t.color}28`}}>
                        CURRENT
                      </div>
                    )}
                    {isPast && <div style={{fontSize:16,color:t.color}}>✓</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* PRO Upgrade card */}
          {!isPro && (
            <div onClick={onUpgrade} style={{
              background:'linear-gradient(135deg,rgba(0,196,180,0.12),rgba(212,168,71,0.08))',
              border:`1px solid ${T.borderTeal}`,
              borderRadius:20,padding:'18px',cursor:'pointer',
              position:'relative',overflow:'hidden',
              boxShadow:`0 8px 32px rgba(0,196,180,0.12)`,
            }}>
              <LogoWatermark/>
              <div style={{fontSize:10,color:T.teal,fontWeight:800,letterSpacing:2,textTransform:'uppercase',marginBottom:6}}>
                Unlock Everything
              </div>
              <div style={{fontSize:19,fontWeight:900,color:T.text,marginBottom:6}}>
                Upgrade to PRO 👑
              </div>
              <div style={{fontSize:12,color:T.dim,marginBottom:16}}>
                Unlimited cases · AI Generator · All specialties
              </div>
              <div style={{
                display:'inline-block',
                background:`linear-gradient(135deg,${T.teal},${T.blue})`,
                borderRadius:14,padding:'11px 22px',
                fontSize:14,fontWeight:800,color:'#fff',
                boxShadow:`0 6px 20px rgba(0,196,180,0.35)`,
              }}>
                Start PRO — $14.99/mo →
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AWARDS TAB ── */}
      {tab==='awards' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <SectionLabel label="Achievements"/>
            <span style={{fontSize:11,color:T.muted,fontWeight:600}}>
              {ACHIEVEMENTS.filter(a=>a.unlocked).length}/{ACHIEVEMENTS.length} unlocked
            </span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {ACHIEVEMENTS.map((a,i) => <AchievementCard key={i} {...a}/>)}
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab==='settings' && (
        <div style={{display:'flex',flexDirection:'column',gap:6}}>

          {/* Account */}
          <SectionLabel label="Account"/>
          <SettingsRow icon="👤" label="Edit Profile"       desc="Name, specialty, photo"        color={T.teal}   />
          <SettingsRow icon="📧" label="Change Email"       desc="toffe24@icloud.com"            color={T.blue}   />
          <SettingsRow icon="🔑" label="Change Password"    desc="Update your password"          color={T.blue}   />

          {/* Notifications */}
          <SectionLabel label="Notifications"/>
          <SettingsRow icon="🔔" label="Daily Challenge"    desc="Remind me to train daily"      color={T.orange} value="On"/>
          <SettingsRow icon="🔥" label="Streak Reminder"    desc="Don't break your streak"       color={T.red}    value="On"/>
          <SettingsRow icon="📢" label="New Cases"          desc="Alert when new cases added"    color={T.teal}   value="Off"/>

          {/* Preferences */}
          <SectionLabel label="Preferences"/>
          <SettingsRow icon="🌐" label="Language"           desc="English · العربية"             color={T.blue}   value="EN"/>
          <SettingsRow icon="🎨" label="Appearance"         desc="Dark mode"                     color={T.purple} value="Dark"/>
          <SettingsRow icon="♿" label="Accessibility"      desc="Text size, contrast"           color={T.green}  />

          {/* Subscription */}
          <SectionLabel label="Subscription"/>
          {isPro ? (
            <SettingsRow icon="👑" label="PRO Plan"         desc="Active · Cancel anytime"       color={T.gold}   value="Active"/>
          ) : (
            <div onClick={onUpgrade} style={{
              background:`linear-gradient(135deg,rgba(0,196,180,0.12),rgba(0,122,255,0.08))`,
              border:`1px solid ${T.borderTeal}`,borderRadius:16,padding:'13px 16px',
              display:'flex',alignItems:'center',gap:13,cursor:'pointer',
            }}>
              <div style={{width:40,height:40,borderRadius:12,background:`${T.teal}18`,border:`1px solid ${T.teal}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19}}>👑</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:T.teal}}>Upgrade to PRO</div>
                <div style={{fontSize:11,color:T.muted}}>$14.99/mo · Unlimited access</div>
              </div>
              <div style={{fontSize:18,color:T.teal,opacity:0.8}}>›</div>
            </div>
          )}
          <SettingsRow icon="🔄" label="Restore Purchase"   desc="Recover previous purchase"    color={T.green}  />

          {/* Data & Privacy */}
          <SectionLabel label="Privacy & Data"/>
          <SettingsRow
            icon="🔒"
            label="Privacy Policy"
            desc="How we handle your data"
            color={T.purple}
            onClick={()=>window.open('/privacy-policy.html','_blank')}
          />
          <SettingsRow icon="📋" label="Terms of Service"   desc="Terms & conditions"            color={T.purple} />
          <SettingsRow icon="📊" label="Export My Data"     desc="Download your progress"        color={T.green}  />
          <SettingsRow icon="📈" label="Analytics"          desc="Help improve Cliniverse AI"    color={T.blue}   value="On"/>

          {/* About */}
          <SectionLabel label="About"/>
          <SettingsRow icon="⭐" label="Rate the App"       desc="Leave a review on App Store"  color={T.amber}  />
          <SettingsRow icon="📤" label="Share App"          desc="Invite a colleague"            color={T.teal}   />
          <SettingsRow icon="💬" label="Contact Support"    desc="Get help from our team"        color={T.blue}   />
          <SettingsRow icon="ℹ️" label="App Version"        desc="Cliniverse AI v2.0 · 2026"    color={T.muted}  />

          {/* Danger zone */}
          <div style={{height:8}}/>
          <SettingsRow
            icon="🔄" label="Reset Onboarding"
            desc="Return to welcome screen"
            color={T.red} danger onClick={onReset}
          />
          <SettingsRow
            icon="🗑️" label="Delete Account"
            desc="Permanently delete your data"
            color={T.red} danger
          />

          <div style={{height:16}}/>
          <div style={{textAlign:'center',fontSize:11,color:T.muted,lineHeight:1.8}}>
            <div>Cliniverse AI · cliniverseai.com</div>
            <div style={{marginTop:2}}>Built by a Doctor, for Doctors</div>
          </div>
          <div style={{height:8}}/>
        </div>
      )}
    </div>
  )
}
