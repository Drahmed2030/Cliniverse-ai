'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const RANKS = [
  { name:'Clinical Clerk', icon:'🩺', color:'#64748b' },
  { name:'Junior Resident', icon:'📋', color:'#00C4B4' },
  { name:'Senior Resident', icon:'🔬', color:'#30d158' },
  { name:'Registrar', icon:'⚕️', color:'#ff9500' },
  { name:'Specialist', icon:'🏥', color:'#00C4B4' },
  { name:'Consultant', icon:'👨‍⚕️', color:'#ff3b30' },
  { name:'Senior Consultant', icon:'🎓', color:'#ffd60a' },
  { name:'Chief of Medicine', icon:'🌟', color:'#ff6b35' },
]

const getRankIcon = (rank: string) => RANKS.find(r => r.name === rank)?.icon || '🩺'
const getRankColor = (rank: string) => RANKS.find(r => r.name === rank)?.color || '#64748b'

interface Leader {
  id: string
  name: string
  specialty: string
  xp: number
  rank: string
  cases_completed: number
}

const DEMO_LEADERS: Leader[] = [
  { id:'1', name:'Dr. Ahmed Al-Rashidi', specialty:'Cardiology', xp:2450, rank:'Senior Consultant', cases_completed:28 },
  { id:'2', name:'Dr. Sarah Mitchell', specialty:'Emergency Medicine', xp:1890, rank:'Consultant', cases_completed:22 },
  { id:'3', name:'Dr. Khalid Hassan', specialty:'Internal Medicine', xp:1650, rank:'Consultant', cases_completed:19 },
  { id:'4', name:'Dr. Fatima Al-Zahra', specialty:'Neurology', xp:1420, rank:'Specialist', cases_completed:17 },
  { id:'5', name:'Dr. James Chen', specialty:'Critical Care', xp:1280, rank:'Specialist', cases_completed:15 },
  { id:'6', name:'Dr. Nora Al-Qasim', specialty:'Cardiology', xp:980, rank:'Registrar', cases_completed:12 },
  { id:'7', name:'Dr. Omar Khalil', specialty:'Surgery', xp:820, rank:'Registrar', cases_completed:10 },
  { id:'8', name:'Dr. Aisha Siddiqui', specialty:'Pediatrics', xp:650, rank:'Senior Resident', cases_completed:8 },
  { id:'9', name:'Dr. Mohammed Al-Amri', specialty:'Radiology', xp:480, rank:'Senior Resident', cases_completed:6 },
  { id:'10', name:'Dr. Layla Hassan', specialty:'OB/GYN', xp:320, rank:'Junior Resident', cases_completed:4 },
]

export default function Leaderboard({ currentXP = 0, currentRank = 'Clinical Clerk' }: { currentXP?: number, currentRank?: string }) {
  const [leaders, setLeaders] = useState<Leader[]>(DEMO_LEADERS)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'global'|'weekly'|'specialty'>('global')
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    // Real-time updates
    const channel = supabase
      .channel('leaderboard_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_progress'
      }, () => {
        fetchLeaderboard()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => { fetchLeaderboard() }, [])

  useEffect(() => {
    const sorted = [...leaders].sort((a, b) => b.xp - a.xp)
    const pos = sorted.findIndex(l => l.xp <= currentXP)
    setMyRank(pos >= 0 ? pos + 1 : leaders.length + 1)
  }, [currentXP, leaders])

  const fetchLeaderboard = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, specialty, xp, rank, cases_completed')
        .order('xp', { ascending: false })
        .limit(50)
      if (data && data.length > 0) setLeaders(data)
      else setLeaders(DEMO_LEADERS)
    } catch { setLeaders(DEMO_LEADERS) }
    finally { setLoading(false) }
  }

  const getMedal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`

  const podiumGlow = (i: number) => {
    if (i === 0) return { bg: 'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,180,0,0.05))', border: '1px solid rgba(255,215,0,0.35)', shadow: '0 8px 32px rgba(255,215,0,0.2)' }
    if (i === 1) return { bg: 'linear-gradient(135deg,rgba(192,192,192,0.12),rgba(150,150,150,0.05))', border: '1px solid rgba(192,192,192,0.3)', shadow: '0 4px 16px rgba(192,192,192,0.1)' }
    if (i === 2) return { bg: 'linear-gradient(135deg,rgba(205,127,50,0.12),rgba(160,100,30,0.05))', border: '1px solid rgba(205,127,50,0.3)', shadow: '0 4px 16px rgba(205,127,50,0.1)' }
    return { bg: 'rgba(36,63,82,0.60)', border: '1px solid rgba(139,92,246,0.1)', shadow: 'none' }
  }

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', paddingBottom: 20 }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', margin: '0 0 4px', letterSpacing: -0.5 }}>🏆 Global Leaderboard</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Top physicians worldwide</p>
      </div>

      {/* My Position Card */}
      <div style={{ background: 'linear-gradient(135deg,rgba(0,196,180,0.3),rgba(0,196,180,0.12))', backdropFilter: 'blur(20px)', borderRadius: 18, padding: 16, marginBottom: 16, border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 4px 24px rgba(0,196,180,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#00C4B4,#0a84ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 4px 16px rgba(139,92,246,0.5)' }}>
            {getRankIcon(currentRank)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>Your Position</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{currentRank} · {currentXP} XP</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#bf5af2', lineHeight: 1 }}>#{myRank || '—'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>global rank</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: 'rgba(36,63,82,0.65)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: 5, border: '1px solid rgba(0,196,180,0.25)' }}>
        {[{id:'global',label:'🌍 Global'},{id:'weekly',label:'📅 Weekly'},{id:'specialty',label:'🏥 Specialty'}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id as any)} style={{ flex: 1, padding: '9px 6px', borderRadius: 12, border: 'none', background: filter===f.id ? 'linear-gradient(135deg,rgba(0,196,180,0.3),rgba(0,196,180,0.20))' : 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: filter===f.id ? '#6ee7e1' : 'rgba(255,255,255,0.35)', boxShadow: filter===f.id ? '0 2px 12px rgba(139,92,246,0.3)' : 'none', border: filter===f.id ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent', transition: 'all 0.2s' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {leaders.length >= 3 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'flex-end' }}>
          {[1, 0, 2].map(idx => {
            const p = podiumGlow(idx)
            const isFirst = idx === 0
            return (
              <div key={idx} style={{ flex: 1, background: p.bg, backdropFilter: 'blur(16px)', borderRadius: isFirst ? 20 : 16, padding: isFirst ? '18px 10px 14px' : '14px 10px 12px', border: p.border, textAlign: 'center', boxShadow: p.shadow }}>
                <div style={{ fontSize: isFirst ? 32 : 28, marginBottom: 6 }}>{getMedal(idx)}</div>
                <div style={{ fontSize: isFirst ? 26 : 22 }}>{getRankIcon(leaders[idx]?.rank)}</div>
                <div style={{ fontSize: isFirst ? 12 : 11, fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginTop: 6, lineHeight: 1.3 }}>{leaders[idx]?.name?.split(' ').slice(-1)[0]}</div>
                <div style={{ fontSize: isFirst ? 13 : 12, fontWeight: 900, color: idx===0?'#ffd60a':idx===1?'#c0c0c0':'#cd7f32', marginTop: 4 }}>{leaders[idx]?.xp} XP</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leaders.map((leader, i) => {
          const p = podiumGlow(i)
          return (
            <div key={leader.id} style={{ background: p.bg, backdropFilter: 'blur(12px)', borderRadius: 16, padding: '12px 14px', border: p.border, display: 'flex', alignItems: 'center', gap: 12, boxShadow: p.shadow }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: i < 3 ? 22 : 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>
                {getMedal(i)}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${getRankColor(leader.rank)},${getRankColor(leader.rank)}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: `0 4px 12px ${getRankColor(leader.rank)}44` }}>
                {getRankIcon(leader.rank)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.92)', letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leader.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{leader.specialty} · {leader.cases_completed} cases</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: getRankColor(leader.rank) }}>{leader.xp.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 0.3 }}>XP</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Join message */}
      <div style={{ background: 'linear-gradient(135deg,rgba(0,196,180,0.12),rgba(10,132,255,0.08))', backdropFilter: 'blur(12px)', borderRadius: 16, padding: 16, marginTop: 16, border: '1px solid rgba(139,92,246,0.3)', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600, lineHeight: 1.6 }}>
          Complete cases to earn XP and climb the global leaderboard! 🚀
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Updated in real-time · Powered by Supabase</div>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
