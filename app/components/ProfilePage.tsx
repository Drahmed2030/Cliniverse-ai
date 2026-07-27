'use client'
import React, { useState } from 'react'

const F = '"Inter", -apple-system, "SF Pro Display", sans-serif'

// ── DESIGN TOKENS ──
const T = {
  bg: '#0a1628',
  card: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.07)',
  borderBlue: 'rgba(0,212,255,0.18)',
  text: '#ffffff',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.18)',
  teal: '#38bdf8',
  blue: '#0066ff',
  purple: '#a78bfa',
  green: '#4ade80',
  amber: '#fbbf24',
  rose: '#f87171',
}

// ── TIER SYSTEM ──
const TIERS = [
  { min: 0,    max: 100,  id: 'intern',     label: 'Intern',     color: '#64748b', shape: '○' },
  { min: 100,  max: 500,  id: 'resident',   label: 'Resident',   color: '#38bdf8', shape: '◇' },
  { min: 500,  max: 1500, id: 'fellow',     label: 'Fellow',     color: '#a78bfa', shape: '⬡' },
  { min: 1500, max: 3000, id: 'specialist', label: 'Specialist', color: '#38bdf8', shape: '◈' },
  { min: 3000, max: 9999, id: 'consultant', label: 'Consultant', color: '#fbbf24', shape: '✦' },
]

function getTier(xp: number) {
  return TIERS.find(t => xp >= t.min && xp < t.max) || TIERS[TIERS.length - 1]
}

// ── CV WATERMARK ──
const CVWatermark = () => (
  <svg style={{ position: 'absolute', bottom: 12, right: 16, opacity: 0.06, pointerEvents: 'none' }}
    width="80" height="80" viewBox="0 0 40 40" fill="none">
    <path d="M22 8 C14 8 8 13.5 8 20 C8 26.5 14 32 22 32 C26 32 29.5 30.5 32 28"
      stroke="url(#cwm)" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M20 10 L27 30 L34 10" stroke="url(#cwm)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="cwm" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00d4ff"/><stop offset="1" stopColor="#7c3aed"/>
      </linearGradient>
    </defs>
  </svg>
)

// ── XP RING ──
const XPRing = ({ xp, tier }: { xp: number, tier: typeof TIERS[0] }) => {
  const pct = Math.min(((xp - tier.min) / (tier.max - tier.min)) * 100, 100)
  const r = 52, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
        <circle cx="65" cy="65" r={r} fill="none" stroke={tier.color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${tier.color})` }}/>
        <circle cx="65" cy="65" r="44" fill="rgba(255,255,255,0.03)"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontSize: 22, color: tier.color, fontWeight: 900, lineHeight: 1 }}>{tier.shape}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text, lineHeight: 1.1 }}>{xp}</div>
        <div style={{ fontSize: 11, color: T.sub, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>XP</div>
      </div>
    </div>
  )
}

// ── ACHIEVEMENT CARD ──
const AchievementCard = ({ icon, label, desc, color, unlocked }: {
  icon: string, label: string, desc: string, color: string, unlocked: boolean
}) => (
  <div style={{
    background: unlocked ? `${color}08` : 'rgba(255,255,255,0.02)',
    border: `1px solid ${unlocked ? color + '25' : 'rgba(255,255,255,0.05)'}`,
    borderRadius: 16, padding: '12px 14px',
    display: 'flex', alignItems: 'center', gap: 12,
    opacity: unlocked ? 1 : 0.4,
    transition: 'all 0.3s',
  }}>
    <div style={{
      width: 42, height: 42, borderRadius: 13, flexShrink: 0,
      background: unlocked ? `${color}15` : 'rgba(255,255,255,0.07)',
      border: `1px solid ${unlocked ? color + '30' : 'rgba(255,255,255,0.12)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      boxShadow: unlocked ? `0 0 16px ${color}20` : 'none',
    }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: unlocked ? T.text : T.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: T.muted }}>{desc}</div>
    </div>
    {unlocked && <div style={{
      width: 8, height: 8, borderRadius: '50%', background: color,
      boxShadow: `0 0 8px ${color}`,
    }}/>}
  </div>
)

// ── STAT CARD ──
const StatCard = ({ label, value, color, icon }: { label: string, value: string | number, color: string, icon: string }) => (
  <div style={{
    background: `${color}06`, border: `1px solid ${color}18`,
    borderRadius: 18, padding: '14px 12px', textAlign: 'center',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginTop: 4, letterSpacing: 0.8, textTransform: 'uppercase' }}>{label}</div>
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
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'settings'>('stats')
  const tier = getTier(xp)
  const accuracy = mcqCorrect > 0 ? Math.round((mcqCorrect / (mcqCorrect + 1)) * 100) : 0
  const nextTier = TIERS[TIERS.findIndex(t => t.id === tier.id) + 1]

  const ACHIEVEMENTS = [
    { icon: '🫀', label: 'STEMI Master', desc: 'Complete STEMI case perfectly', color: T.rose, unlocked: casesCompleted >= 1 },
    { icon: '⚡', label: 'Lightning MD', desc: 'Answer in under 10 seconds', color: T.amber, unlocked: mcqCorrect >= 5 },
    { icon: '🧬', label: 'Brain Trust', desc: 'Score 10 correct MCQs', color: T.green, unlocked: mcqCorrect >= 10 },
    { icon: '🔥', label: 'On Fire', desc: '3-day streak achieved', color: '#f97316', unlocked: streak >= 3 },
    { icon: '🌍', label: 'Global MD', desc: 'Join the global leaderboard', color: T.blue, unlocked: casesCompleted >= 3 },
    { icon: '🤖', label: 'AI Pioneer', desc: 'Use AI Case Generator', color: T.teal, unlocked: false },
    { icon: '👑', label: 'Consultant', desc: 'Reach Consultant tier', color: T.amber, unlocked: xp >= 3000 },
    { icon: '💎', label: 'PRO Member', desc: 'Unlock all features', color: '#a78bfa', unlocked: isPro },
  ]

  return (
    <div style={{ fontFamily: F, paddingBottom: 8 }}>

      {/* ── HERO CARD ── */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(0,20,50,0.95), rgba(0,10,30,0.98))',
        borderRadius: 24, padding: '22px 20px', marginBottom: 14,
        border: `1px solid ${T.borderBlue}`,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
      }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: -50, left: -20, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,255,0.1),transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -40, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%)', pointerEvents: 'none' }}/>
        <CVWatermark />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}>
          <XPRing xp={xp} tier={tier} />

          <div style={{ flex: 1 }}>
            {/* Tier badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${tier.color}15`, border: `1px solid ${tier.color}30`,
              borderRadius: 10, padding: '4px 10px', marginBottom: 8,
            }}>
              <span style={{ fontSize: 12, color: tier.color }}>{tier.shape}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: tier.color, letterSpacing: 1.5, textTransform: 'uppercase' }}>{tier.label}</span>
            </div>

            <div style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: -0.5, marginBottom: 4, lineHeight: 1.1 }}>
              {name ? `Dr. ${name}` : 'Dr. Physician'}
            </div>

            <div style={{ fontSize: 11, color: T.sub, marginBottom: 10 }}>
              Cliniverse AI · {isPro ? '👑 PRO Member' : 'Free Plan'}
            </div>

            {/* XP Progress */}
            {nextTier && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>NEXT: {nextTier.label.toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: tier.color, fontWeight: 700 }}>{nextTier.min - xp} XP away</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color})`,
                    width: `${Math.min(((xp - tier.min) / (nextTier.min - tier.min)) * 100, 100)}%`,
                    boxShadow: `0 0 8px ${tier.color}`,
                    transition: 'width 0.6s ease',
                  }}/>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Streak */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 16, padding: '10px 16px',
          background: 'rgba(245,158,11,0.06)', borderRadius: 14,
          border: '1px solid rgba(245,158,11,0.15)',
          position: 'relative', zIndex: 1,
        }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <span style={{ fontSize: 15, fontWeight: 900, color: T.amber }}>{streak}</span>
          <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>day streak</span>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', margin: '0 8px' }}/>
          <span style={{ fontSize: 12, color: T.sub }}>{casesCompleted} cases · {accuracy}% accuracy</span>
        </div>
      </div>

      {/* ── TAB SELECTOR ── */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16,
        background: T.card, borderRadius: 16, padding: 4,
        border: `1px solid ${T.border}`,
      }}>
        {(['stats', 'achievements', 'settings'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
            borderRadius: 12, fontFamily: F, fontWeight: 700, fontSize: 12,
            transition: 'all 0.2s',
            background: activeTab === t ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,102,255,0.1))' : 'transparent',
            color: activeTab === t ? T.teal : T.muted,
            boxShadow: activeTab === t ? `0 0 16px rgba(0,212,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)` : 'none',
            border: activeTab === t ? `1px solid rgba(0,212,255,0.2)` : '1px solid transparent',
          }}>
            {t === 'stats' ? '📊 Stats' : t === 'achievements' ? '🏆 Awards' : '⚙️ Settings'}
          </button>
        ))}
      </div>

      {/* ── STATS TAB ── */}
      {activeTab === 'stats' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
            <StatCard label="Cases Done" value={casesCompleted} color={T.teal} icon="🏥"/>
            <StatCard label="Accuracy" value={`${accuracy}%`} color={T.green} icon="🎯"/>
            <StatCard label="MCQ Correct" value={mcqCorrect} color={T.purple} icon="🧬"/>
            <StatCard label="Day Streak" value={streak} color={T.amber} icon="🔥"/>
          </div>

          {/* Tier Progress */}
          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 20, padding: '18px', marginBottom: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            <CVWatermark />
            <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>Tier Progression</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIERS.map((t, i) => {
                const isActive = t.id === tier.id
                const isPast = xp >= t.max
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: isActive ? `${t.color}20` : isPast ? `${t.color}10` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? t.color + '40' : isPast ? t.color + '20' : 'rgba(255,255,255,0.06)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, color: isActive || isPast ? t.color : T.muted,
                      boxShadow: isActive ? `0 0 12px ${t.color}30` : 'none',
                    }}>{t.shape}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: isActive ? 800 : 600, color: isActive ? T.text : isPast ? T.sub : T.muted }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: 12, color: T.muted }}>{t.min}–{t.max === 9999 ? '∞' : t.max} XP</div>
                    </div>
                    {isActive && <div style={{ fontSize: 12, color: t.color, fontWeight: 800, background: `${t.color}15`, padding: '3px 8px', borderRadius: 8 }}>CURRENT</div>}
                    {isPast && <div style={{ fontSize: 14, color: t.color }}>✓</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* PRO Upgrade */}
          {!isPro && (
            <div onClick={onUpgrade} style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(124,58,237,0.08))',
              border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '18px',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
            }}>
              <CVWatermark />
              <div style={{ fontSize: 12, color: T.teal, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Unlock Everything</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: T.text, marginBottom: 6 }}>Upgrade to PRO 👑</div>
              <div style={{ fontSize: 12, color: T.sub, marginBottom: 14 }}>Unlimited cases · AI Generator · All specialties</div>
              <div style={{
                display: 'inline-block', background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 800, color: '#fff',
                boxShadow: '0 6px 20px rgba(0,180,255,0.3)',
              }}>Start PRO — $9.99/mo →</div>
            </div>
          )}
        </div>
      )}

      {/* ── ACHIEVEMENTS TAB ── */}
      {activeTab === 'achievements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            {ACHIEVEMENTS.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length} Unlocked
          </div>
          {ACHIEVEMENTS.map((a, i) => (
            <AchievementCard key={i} {...a} />
          ))}
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🔔', label: 'Daily Reminders', desc: 'Get notified to train daily', color: T.teal },
            { icon: '🌐', label: 'Language', desc: 'English · العربية', color: T.blue },
            { icon: '📊', label: 'Export Progress', desc: 'Download your clinical logbook', color: T.green },
            { icon: '🔒', label: 'Privacy', desc: 'Control your data', color: T.purple },
          ].map((s, i) => (
            <div key={i} style={{
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 18, padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                background: `${s.color}10`, border: `1px solid ${s.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: T.sub }}>{s.desc}</div>
              </div>
              <span style={{ fontSize: 18, color: T.muted }}>›</span>
            </div>
          ))}

          <div onClick={onReset} style={{
            background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 18, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', marginTop: 4,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13, flexShrink: 0,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🔄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.rose, marginBottom: 2 }}>Reset Onboarding</div>
              <div style={{ fontSize: 11, color: T.sub }}>Return to welcome screen</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
