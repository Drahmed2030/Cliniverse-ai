'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', border:'#E2E8F0',
  cobalt:'#1E40AF', textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#1E40AF,#0D9488)',
}

type TimeOfDay = 'morning'|'afternoon'|'evening'|'night'

type Medication = {
  id: string
  name: string
  dosage: string
  timeOfDay: TimeOfDay
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌆 Evening',
  night: '🌙 Night',
}

const STORAGE_KEY = 'cliniverse_medications'

function loadMeds(): Medication[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMeds(meds: Medication[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meds))
}

export default function MyMedications({ onBack }: { onBack: () => void }) {
  const [meds, setMeds] = useState<Medication[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')

  useEffect(() => {
    setMeds(loadMeds())
  }, [])

  const handleAdd = () => {
    if (!name.trim()) return
    const newMed: Medication = {
      id: 'med_' + Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: name.trim(),
      dosage: dosage.trim() || '1 dose',
      timeOfDay,
    }
    const updated = [...meds, newMed]
    setMeds(updated)
    saveMeds(updated)
    setName('')
    setDosage('')
    setTimeOfDay('morning')
    setShowForm(false)
  }

  const handleRemove = (id: string) => {
    const updated = meds.filter(m => m.id !== id)
    setMeds(updated)
    saveMeds(updated)
  }

  const grouped: Record<TimeOfDay, Medication[]> = {
    morning: meds.filter(m => m.timeOfDay === 'morning'),
    afternoon: meds.filter(m => m.timeOfDay === 'afternoon'),
    evening: meds.filter(m => m.timeOfDay === 'evening'),
    night: meds.filter(m => m.timeOfDay === 'night'),
  }

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
        💊 My Medications
      </h1>
      <p style={{fontSize:14, color:L.textMuted, marginBottom:20}}>
        Track meds · Set reminders
      </p>

      {meds.length === 0 && !showForm && (
        <div style={{
          background:L.surface, borderRadius:20, padding:32, textAlign:'center',
          border:`1px solid ${L.border}`, marginBottom:16,
        }}>
          <div style={{fontSize:40, marginBottom:12}}>💊</div>
          <div style={{fontSize:15, color:L.textMuted, marginBottom:20}}>
            No medications added yet
          </div>
        </div>
      )}

      {(Object.keys(grouped) as TimeOfDay[]).map(tod => (
        grouped[tod].length > 0 && (
          <div key={tod} style={{marginBottom:16}}>
            <div style={{fontSize:13, fontWeight:600, color:L.textMuted, marginBottom:8, paddingLeft:4}}>
              {TIME_LABELS[tod]}
            </div>
            {grouped[tod].map(med => (
              <div key={med.id} style={{
                background:L.surface, borderRadius:16, padding:16,
                border:`1px solid ${L.border}`, marginBottom:8,
                display:'flex', alignItems:'center', justifyContent:'space-between',
              }}>
                <div>
                  <div style={{fontSize:15, fontWeight:600, color:L.textPrimary}}>
                    {med.name}
                  </div>
                  <div style={{fontSize:13, color:L.textMuted, marginTop:2}}>
                    {med.dosage}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(med.id)}
                  style={{
                    background:'none', border:'none', color:'#EF4444',
                    fontSize:13, fontWeight:600, cursor:'pointer', padding:'6px 10px',
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )
      ))}

      {showForm ? (
        <div style={{
          background:L.surface, borderRadius:20, padding:20,
          border:`1px solid ${L.border}`, marginTop:8,
        }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Medication name"
            style={{
              width:'100%', borderRadius:12, border:`1px solid ${L.border}`,
              padding:'12px 14px', fontSize:15, color:L.textPrimary,
              marginBottom:10, boxSizing:'border-box', fontFamily:'inherit',
            }}
          />
          <input
            value={dosage}
            onChange={e => setDosage(e.target.value)}
            placeholder="Dosage (e.g. 500mg, 1 pill)"
            style={{
              width:'100%', borderRadius:12, border:`1px solid ${L.border}`,
              padding:'12px 14px', fontSize:15, color:L.textPrimary,
              marginBottom:10, boxSizing:'border-box', fontFamily:'inherit',
            }}
          />
          <div style={{display:'flex', gap:8, marginBottom:14, flexWrap:'wrap'}}>
            {(Object.keys(TIME_LABELS) as TimeOfDay[]).map(tod => (
              <button
                key={tod}
                onClick={() => setTimeOfDay(tod)}
                style={{
                  flex:'1 1 auto', minWidth:80,
                  background: timeOfDay === tod ? L.gradient : L.canvas,
                  color: timeOfDay === tod ? '#fff' : L.textSub,
                  border: timeOfDay === tod ? 'none' : `1px solid ${L.border}`,
                  borderRadius:10, padding:'10px 8px', fontSize:13, fontWeight:600,
                  cursor:'pointer',
                }}
              >
                {TIME_LABELS[tod]}
              </button>
            ))}
          </div>
          <div style={{display:'flex', gap:8}}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                flex:1, background:L.canvas, color:L.textSub,
                border:`1px solid ${L.border}`, borderRadius:12, padding:'12px',
                fontSize:14, fontWeight:600, cursor:'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              style={{
                flex:2, background: name.trim() ? L.gradient : L.border,
                color:'#fff', border:'none', borderRadius:12, padding:'12px',
                fontSize:14, fontWeight:600, cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Add Medication
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width:'100%', background:L.gradient, color:'#fff',
            border:'none', borderRadius:14, padding:'14px', fontSize:15,
            fontWeight:600, cursor:'pointer', marginTop:8,
          }}
        >
          + Add Medication
        </button>
      )}
    </div>
  )
}
