'use client'
import { useState, useEffect } from 'react'

interface Shift {
  id: string
  day: string
  time: string
  dept: string
  color: string
  icon: string
}

interface OnCallCase {
  id: string
  time: string
  dept: string
  title: string
  patient: string
  urgency: 'Stat' | 'Urgent' | 'Routine'
  color: string
  icon: string
  action: string
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DEPTS = [
  {id:'ed', label:'ED', color:'#ff453a', icon:'🚨'},
  {id:'ccu', label:'CCU', color:'#ff9f0a', icon:'🫀'},
  {id:'icu', label:'ICU', color:'#00C4B4', icon:'🫁'},
  {id:'ward', label:'Ward', color:'#00C4B4', icon:'🏥'},
  {id:'peds', label:'Peds', color:'#30d158', icon:'🧸'},
  {id:'neuro', label:'Neuro', color:'#64d2ff', icon:'🧠'},
]

const SAMPLE_CASES: OnCallCase[] = [
  { id:'1', time:'02:14', dept:'CCU', title:'VF Arrest', patient:'58M post-STEMI', urgency:'Stat', color:'#ff453a', icon:'⚡', action:'CPR + Defibrillate' },
  { id:'2', time:'03:40', dept:'ED', title:'Hypoglycaemia', patient:'45F DM on insulin', urgency:'Urgent', color:'#ff9f0a', icon:'🩸', action:'Dextrose 50% IV' },
  { id:'3', time:'05:15', dept:'Ward', title:'Chest Pain', patient:'67M post-op', urgency:'Urgent', color:'#ff9f0a', icon:'🫀', action:'ECG + Troponin' },
  { id:'4', time:'06:30', dept:'ICU', title:'Desaturation', patient:'72F on vent', urgency:'Stat', color:'#ff453a', icon:'🫁', action:'Check ETT + FiO2' },
  { id:'5', time:'07:00', dept:'Peds', title:'Febrile Seizure', patient:'2yr old', urgency:'Urgent', color:'#30d158', icon:'🌡️', action:'Rectal diazepam' },
]

const TIPS = [
  '🌙 Night shift tip: Always re-examine before prescribing. Verbal orders must be documented.',
  '⚡ Stat call: Arrive within 5 min. Bring airway kit and crash trolley key.',
  '📞 When in doubt — escalate. Call your senior. Never manage alone.',
  '💊 Night prescribing: Double-check doses. Fatigue increases error by 300%.',
  '🫀 New onset AF at night: Rate control first. Anticoagulation decision in morning.',
  '🧠 GCS drop: Airway first. Then pupil check. CT head before LP.',
]

const C = {
  card: 'rgba(255,255,255,0.92)',
  border: 'rgba(0,196,180,0.25)',
  text: '#EEF6FA',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.25)',
}

export default function OnCallSystem({ onXP }: { onXP?: (n:number)=>void }) {
  const [view, setView] = useState<'schedule'|'live'|'tips'>('schedule')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay())
  const [selectedDept, setSelectedDept] = useState<string>('ed')
  const [selectedTime, setSelectedTime] = useState<string>('22:00')
  const [activeCases, setActiveCases] = useState<OnCallCase[]>(SAMPLE_CASES)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [tipIdx, setTipIdx] = useState(0)
  const [caseHandled, setCaseHandled] = useState<string[]>([])

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i+1) % TIPS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const addShift = () => {
    const dept = DEPTS.find(d => d.id === selectedDept)!
    const newShift: Shift = {
      id: Date.now().toString(),
      day: DAYS[selectedDay],
      time: selectedTime,
      dept: dept.label,
      color: dept.color,
      icon: dept.icon,
    }
    setShifts(s => [...s, newShift])
  }

  const removeShift = (id: string) => setShifts(s => s.filter(x => x.id !== id))

  const handleCase = (id: string) => {
    setCaseHandled(h => [...h, id])
    onXP && onXP(20)
  }

  const hour = currentTime.getHours()
  const isNight = hour >= 20 || hour < 8
  const timeStr = currentTime.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:false})
  const dateStr = currentTime.toLocaleDateString('en-US', {weekday:'long', month:'short', day:'numeric'})

  return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,rgba(15,5,35,0.9),rgba(10,0,21,0.95))',borderRadius:22,padding:'18px 18px 14px',marginBottom:14,border:'1px solid rgba(139,92,246,0.3)',boxShadow:'0 8px 32px rgba(0,0,0,0.4)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(139,92,246,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>
              {isNight ? '🌙 Night Shift' : '☀️ Day Shift'}
            </div>
            <div style={{fontSize:36,fontWeight:900,color:'var(--text-primary, white)',letterSpacing:-1,lineHeight:1}}>{timeStr}</div>
            <div style={{fontSize:12,color:C.sub,marginTop:4}}>{dateStr}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Active cases</div>
            <div style={{fontSize:28,fontWeight:900,color:'#ff453a'}}>{activeCases.filter(c=>!caseHandled.includes(c.id)).length}</div>
            <div style={{fontSize:10,color:'#ff453a',fontWeight:700}}>pending</div>
          </div>
        </div>
        {/* Rotating tip */}
        <div style={{background:'rgba(255,255,255,0.92)',borderRadius:12,padding:'10px 12px',marginTop:12,border:'1px solid rgba(36,63,82,0.65)'}}>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',lineHeight:1.5,transition:'all 0.5s'}}>{TIPS[tipIdx]}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:16,background:C.card,borderRadius:18,padding:5,border:`1px solid ${C.border}`}}>
        {[{id:'schedule',icon:'📅',label:'My Schedule'},{id:'live',icon:'🚨',label:'Live Cases'},{id:'tips',icon:'💡',label:'Night Tips'}].map(t=>(
          <button key={t.id} onClick={()=>setView(t.id as any)} style={{flex:1,padding:'10px 6px',borderRadius:13,border:'none',background:view===t.id?'linear-gradient(135deg,rgba(0,196,180,0.3),rgba(0,196,180,0.20))':'transparent',cursor:'pointer',color:view===t.id?'#6ee7e1':C.sub,fontSize:12,fontWeight:700,border:view===t.id?'1px solid rgba(139,92,246,0.3)':'1px solid transparent',transition:'all 0.2s'}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* SCHEDULE */}
      {view==='schedule'&&(
        <div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Add On-Call Shift</div>

          {/* Day selector */}
          <div style={{display:'flex',gap:6,marginBottom:10,overflowX:'auto',paddingBottom:4}}>
            {DAYS.map((d,i)=>(
              <button key={d} onClick={()=>setSelectedDay(i)} style={{flexShrink:0,padding:'8px 12px',borderRadius:12,border:selectedDay===i?'2px solid #8b5cf6':'1px solid rgba(0,196,180,0.25)',background:selectedDay===i?'rgba(139,92,246,0.3)':C.card,color:selectedDay===i?'#6ee7e1':C.sub,fontSize:12,fontWeight:700,cursor:'pointer'}}>
                {d}
              </button>
            ))}
          </div>

          {/* Dept + Time */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
            <div style={{background:C.card,borderRadius:14,padding:'12px',border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>DEPARTMENT</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {DEPTS.map(d=>(
                  <button key={d.id} onClick={()=>setSelectedDept(d.id)} style={{padding:'5px 10px',borderRadius:10,border:selectedDept===d.id?`2px solid ${d.color}`:'1px solid rgba(0,196,180,0.20)',background:selectedDept===d.id?`${d.color}20`:C.card,color:selectedDept===d.id?d.color:C.sub,fontSize:11,fontWeight:700,cursor:'pointer'}}>
                    {d.icon} {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{background:C.card,borderRadius:14,padding:'12px',border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>TIME</div>
              {['08:00','14:00','20:00','22:00','00:00'].map(t=>(
                <button key={t} onClick={()=>setSelectedTime(t)} style={{display:'block',width:'100%',padding:'6px 10px',borderRadius:10,border:selectedTime===t?'2px solid #8b5cf6':'1px solid rgba(36,63,82,0.65)',background:selectedTime===t?'rgba(139,92,246,0.3)':C.card,color:selectedTime===t?'#6ee7e1':C.sub,fontSize:12,fontWeight:700,cursor:'pointer',marginBottom:4,textAlign:'left'}}>
                  {t} {t>='20:00'||t<'08:00'?'🌙':'☀️'}
                </button>
              ))}
            </div>
          </div>

          <button onClick={addShift} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'var(--text-primary, white)',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 20px rgba(139,92,246,0.4)',marginBottom:16}}>
            + Add Shift to Schedule
          </button>

          {/* My shifts */}
          <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>My Shifts</div>
          {shifts.length===0?(
            <div style={{background:C.card,borderRadius:16,padding:'20px',border:`1px solid ${C.border}`,textAlign:'center'}}>
              <div style={{fontSize:24,marginBottom:8}}>📅</div>
              <div style={{fontSize:13,color:C.sub}}>No shifts added yet</div>
            </div>
          ):shifts.map(s=>(
            <div key={s.id} style={{background:C.card,borderRadius:16,padding:'14px 16px',marginBottom:8,border:`1px solid ${s.color}25`,display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:13,background:`${s.color}18`,border:`1px solid ${s.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:'var(--text-primary, white)'}}>{s.day} · {s.time}</div>
                <div style={{fontSize:11,color:C.sub,marginTop:2}}>{s.dept} Department</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:10,padding:'3px 10px',borderRadius:8,background:`${s.color}15`,color:s.color,border:`1px solid ${s.color}25`,fontWeight:700}}>
                  {parseInt(s.time)>=20||parseInt(s.time)<8?'🌙 Night':'☀️ Day'}
                </span>
                <button onClick={()=>removeShift(s.id)} style={{background:'rgba(255,69,58,0.1)',border:'1px solid rgba(255,69,58,0.2)',borderRadius:8,color:'#ff453a',padding:'4px 8px',fontSize:11,cursor:'pointer',fontWeight:700}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIVE CASES */}
      {view==='live'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:'var(--text-primary, white)'}}>🚨 Active Cases</div>
              <div style={{fontSize:11,color:C.sub,marginTop:2}}>Tap to mark as handled</div>
            </div>
            <div style={{background:'rgba(255,69,58,0.12)',border:'1px solid rgba(255,69,58,0.25)',borderRadius:12,padding:'6px 14px'}}>
              <div style={{fontSize:18,fontWeight:900,color:'#ff453a'}}>{activeCases.filter(c=>!caseHandled.includes(c.id)).length}</div>
              <div style={{fontSize:9,color:'rgba(255,69,58,0.7)',fontWeight:700}}>PENDING</div>
            </div>
          </div>

          {activeCases.map(c=>{
            const handled = caseHandled.includes(c.id)
            return (
              <div key={c.id} onClick={()=>!handled&&handleCase(c.id)}
                style={{background:handled?'rgba(48,209,88,0.06)':c.urgency==='Stat'?`${c.color}10`:C.card,borderRadius:18,padding:'14px 16px',marginBottom:10,border:handled?'1px solid rgba(48,209,88,0.2)':c.urgency==='Stat'?`1.5px solid ${c.color}40`:`1px solid ${C.border}`,cursor:handled?'default':'pointer',opacity:handled?0.6:1,transition:'all 0.3s',boxShadow:!handled&&c.urgency==='Stat'?`0 4px 20px ${c.color}20`:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:46,height:46,borderRadius:14,background:`${c.color}18`,border:`1px solid ${c.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{handled?'✅':c.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                      <span style={{fontSize:14,fontWeight:800,color:handled?'rgba(255,255,255,0.4)':'white'}}>{c.title}</span>
                      {!handled&&<span style={{fontSize:9,padding:'2px 8px',borderRadius:6,background:c.urgency==='Stat'?'rgba(255,69,58,0.2)':'rgba(255,159,10,0.15)',color:c.urgency==='Stat'?'#ff453a':'#ff9f0a',fontWeight:800,border:`1px solid ${c.urgency==='Stat'?'rgba(255,69,58,0.3)':'rgba(255,159,10,0.3)'}`}}>{c.urgency}</span>}
                    </div>
                    <div style={{fontSize:11,color:C.sub}}>{c.patient}</div>
                    <div style={{fontSize:11,color:c.color,fontWeight:700,marginTop:4}}>→ {c.action}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.muted}}>{c.time}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:2}}>{c.dept}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* NIGHT TIPS */}
      {view==='tips'&&(
        <div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:12}}>Night Shift Essentials</div>

          {[
            {title:'First 30 minutes of shift', color:'#ff453a', icon:'⏰', tips:['Check crash trolley location and key','Introduce yourself to nursing team','Review sick patients on handover list','Know the ICU bed availability']},
            {title:'Common Night Calls', color:'#ff9f0a', icon:'📞', tips:['Chest pain → ECG within 10 min','Low SpO2 → Airway first, then cause','Low BP → IV access + fluids first','Confusion → Rule out hypoglycaemia first']},
            {title:'Escalation & Safety', color:'#00C4B4', icon:'🛡️', tips:['Never manage an arrest alone — call team','Document all night calls with timestamp','Verbal orders → write up before morning','If unsure — always escalate to senior']},
            {title:'Handover at 08:00', color:'#30d158', icon:'🤝', tips:['Use SBAR for each sick patient','Mention outstanding results/imaging','Flag any patient you are worried about','Ensure day team accepts responsibility']},
          ].map(s=>(
            <div key={s.title} style={{background:C.card,borderRadius:20,padding:'16px',marginBottom:10,border:`1px solid ${s.color}20`,boxShadow:`0 4px 16px ${s.color}08`}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{width:36,height:36,borderRadius:11,background:`${s.color}18`,border:`1px solid ${s.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{s.icon}</div>
                <div style={{fontSize:14,fontWeight:800,color:'var(--text-primary, white)'}}>{s.title}</div>
              </div>
              {s.tips.map((tip,i)=>(
                <div key={i} style={{display:'flex',gap:10,marginBottom:8,paddingBottom:8,borderBottom:i<s.tips.length-1?'1px solid rgba(36,63,82,0.50)':'none'}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:s.color,flexShrink:0,marginTop:6,boxShadow:`0 0 6px ${s.color}`}}/>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.6}}>{tip}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
