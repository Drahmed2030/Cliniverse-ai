'use client'
import { useState, useEffect, useRef } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', border:'#E2E8F0',
  violet:'#7C3AED', textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#7C3AED,#DB2777)',
}

function getDeviceId() {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('cliniverse_device_id')
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('cliniverse_device_id', id)
  }
  return id
}

const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]

const PHASES = [
  { label: 'Breathe In', seconds: 4 },
  { label: 'Hold', seconds: 4 },
  { label: 'Breathe Out', seconds: 6 },
]

function BreathingExercise() {
  const [running, setRunning] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setPhaseIdx(pIdx => {
            const nextIdx = (pIdx + 1) % PHASES.length
            if (nextIdx === 0) setCycles(c => c + 1)
            setSecondsLeft(PHASES[nextIdx].seconds)
            return nextIdx
          })
          return PHASES[(phaseIdx + 1) % PHASES.length].seconds
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phaseIdx])

  const phase = PHASES[phaseIdx]
  const scale = phase.label === 'Breathe In' ? 1.4 : phase.label === 'Hold' ? 1.4 : 1

  return (
    <div style={{background:L.surface, borderRadius:20, padding:24, border:`1px solid ${L.border}`, textAlign:'center'}}>
      <div style={{fontSize:14, fontWeight:600, color:L.textSub, marginBottom:20, letterSpacing:0.5, textTransform:'uppercase'}}>
        Breathing Exercise
      </div>
      <div style={{position:'relative', width:200, height:200, margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{
          position:'absolute', width:140, height:140, borderRadius:'50%',
          background:L.gradient, opacity:0.15,
          transform:`scale(${running ? scale : 1})`,
          transition:'transform 1s ease-in-out',
        }}/>
        <div style={{
          position:'absolute', width:100, height:100, borderRadius:'50%',
          background:L.gradient, opacity:0.3,
          transform:`scale(${running ? scale : 1})`,
          transition:'transform 1s ease-in-out',
        }}/>
        <div style={{
          width:70, height:70, borderRadius:'50%', background:L.gradient,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontWeight:700, fontSize:22,
          transform:`scale(${running ? scale : 1})`,
          transition:'transform 1s ease-in-out',
          boxShadow:'0 4px 20px rgba(124,58,237,0.35)',
        }}>
          {running ? secondsLeft : '🌬️'}
        </div>
      </div>
      {running && (
        <div style={{fontSize:18, fontWeight:600, color:L.textPrimary, marginBottom:4}}>
          {phase.label}
        </div>
      )}
      {running && (
        <div style={{fontSize:13, color:L.textMuted, marginBottom:16}}>
          Cycle {cycles + 1}
        </div>
      )}
      <button
        onClick={() => { setRunning(r => !r); if (running) { setPhaseIdx(0); setSecondsLeft(PHASES[0].seconds); setCycles(0) } }}
        style={{
          background: running ? L.surface : L.gradient,
          color: running ? L.textSub : '#fff',
          border: running ? `1px solid ${L.border}` : 'none',
          borderRadius:14, padding:'12px 32px', fontSize:15, fontWeight:600,
          cursor:'pointer', marginTop: running ? 0 : 4,
        }}
      >
        {running ? 'Stop' : 'Start Breathing'}
      </button>
    </div>
  )
}

function MoodLog() {
  const [deviceId, setDeviceId] = useState('')
  const [selected, setSelected] = useState<number|null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [entries, setEntries] = useState<any[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)

  useEffect(() => {
    const id = getDeviceId()
    setDeviceId(id)
    if (id) {
      fetch(`/api/mood?deviceId=${id}`)
        .then(r => r.json())
        .then(d => setEntries(d.entries || []))
        .catch(() => {})
        .finally(() => setLoadingEntries(false))
    }
  }, [])

  const handleSave = async () => {
    if (!selected || !deviceId) return
    setSaving(true)
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, mood: selected, note: note.trim() || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setEntries(prev => [data.entry, ...prev].slice(0, 14))
        setTimeout(() => { setSaved(false); setSelected(null); setNote('') }, 1800)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{background:L.surface, borderRadius:20, padding:24, border:`1px solid ${L.border}`, marginTop:16}}>
      <div style={{fontSize:14, fontWeight:600, color:L.textSub, marginBottom:16, letterSpacing:0.5, textTransform:'uppercase'}}>
        How are you feeling today?
      </div>
      <div style={{display:'flex', justifyContent:'space-between', gap:8, marginBottom:16}}>
        {MOODS.map(m => (
          <button
            key={m.value}
            onClick={() => setSelected(m.value)}
            style={{
              flex:1, background: selected === m.value ? 'rgba(124,58,237,0.1)' : 'transparent',
              border: selected === m.value ? `2px solid ${L.violet}` : `1px solid ${L.border}`,
              borderRadius:14, padding:'12px 4px', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              transition:'all 0.2s',
            }}
          >
            <span style={{fontSize:26}}>{m.emoji}</span>
            <span style={{fontSize:11, color:L.textMuted, fontWeight:500}}>{m.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Anything on your mind? (optional)"
          style={{
            width:'100%', minHeight:60, borderRadius:12, border:`1px solid ${L.border}`,
            padding:12, fontSize:14, color:L.textPrimary, marginBottom:12,
            fontFamily:'inherit', resize:'none', boxSizing:'border-box',
          }}
        />
      )}

      <button
        onClick={handleSave}
        disabled={!selected || saving}
        style={{
          width:'100%', background: saved ? '#10B981' : (selected ? L.gradient : L.border),
          color: selected || saved ? '#fff' : L.textMuted,
          border:'none', borderRadius:14, padding:'14px', fontSize:15, fontWeight:600,
          cursor: selected && !saving ? 'pointer' : 'not-allowed', transition:'all 0.2s',
        }}
      >
        {saved ? '✓ Saved' : saving ? 'Saving...' : 'Log Mood'}
      </button>

      {!loadingEntries && entries.length > 0 && (
        <div style={{marginTop:20, paddingTop:16, borderTop:`1px solid ${L.border}`}}>
          <div style={{fontSize:12, fontWeight:600, color:L.textMuted, marginBottom:10, textTransform:'uppercase', letterSpacing:0.5}}>
            Recent
          </div>
          <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:4}}>
            {entries.map((e, i) => {
              const m = MOODS.find(x => x.value === e.mood)
              return (
                <div key={i} style={{
                  minWidth:44, textAlign:'center', background:L.canvas,
                  borderRadius:10, padding:'8px 6px', flexShrink:0,
                }}>
                  <div style={{fontSize:18}}>{m?.emoji}</div>
                  <div style={{fontSize:9, color:L.textMuted, marginTop:2}}>
                    {new Date(e.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MentalWellness({ onBack }: { onBack: () => void }) {
  return (
    <div style={{minHeight:'100vh', background:L.canvas, padding:'20px 16px 100px'}}>
      <button
        onClick={onBack}
        style={{
          background:'none', border:'none', color:L.textSub, fontSize:15,
          fontWeight:600, cursor:'pointer', marginBottom:16, padding:0,
          display:'flex', alignItems:'center', gap:6,
        }}
      >
        ← Back
      </button>
      <h1 style={{fontSize:24, fontWeight:800, color:L.textPrimary, marginBottom:4}}>
        🧠 Mental Wellness
      </h1>
      <p style={{fontSize:14, color:L.textMuted, marginBottom:20}}>
        Stress · Sleep · Mindfulness
      </p>
      <BreathingExercise />
      <MoodLog />
    </div>
  )
}
