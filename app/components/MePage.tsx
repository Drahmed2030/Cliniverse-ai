'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED', pink:'#DB2777',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

// ── VITALITY SCORE ────────────────────────────────────
function VitalityRing({ score, size=120 }:{ score:number, size?:number }) {
  const r = size/2 - 12
  const circ = 2 * Math.PI * r
  const dash = (score/100) * circ
  const colors = score>=80?L.sage:score>=60?L.amber:L.red

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={L.raised} strokeWidth="8"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colors} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{transition:'stroke-dasharray 1s ease'}}/>
      <text x={size/2} y={size/2-6} textAnchor="middle" fill={colors} fontSize="22" fontWeight="900">{score}</text>
      <text x={size/2} y={size/2+12} textAnchor="middle" fill={L.textMuted} fontSize="10" fontWeight="600">VITALITY</text>
    </svg>
  )
}

// ── DAILY CHECK-IN ─────────────────────────────────────
function DailyCheckIn({ onXP }:{ onXP?:(n:number)=>void }) {
  const [mood, setMood]         = useState<number|null>(null)
  const [energy, setEnergy]     = useState<number|null>(null)
  const [stress, setStress]     = useState<number|null>(null)
  const [submitted, setSubmit]  = useState(false)
  const [aiInsight, setInsight] = useState('')
  const [loading, setLoading]   = useState(false)

  const MOODS = ['😔','😐','🙂','😊','😄']
  const ENERGY = ['💤','🔋','⚡','🔥','🚀']
  const STRESS = ['😌','😊','😤','😰','🤯']

  const submit = async () => {
    if(mood===null||energy===null||stress===null) return
    setLoading(true)
    setSubmit(true)
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          question:`A physician's daily check-in: Mood ${mood+1}/5, Energy ${energy+1}/5, Stress ${stress+1}/5. Give a brief, warm, personalized wellness insight (2-3 sentences) with one practical tip for today. Be empathetic and evidence-based.`,
          specialty:'Wellness'
        })
      })
      const data = await res.json()
      setInsight(data.answer||'Great that you checked in today. Take care of yourself.')
      onXP?.(10)
    } catch { setInsight('Thank you for checking in. Remember to take breaks and stay hydrated.') }
    setLoading(false)
  }

  if(submitted) return (
    <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:L.sage}}/>
        <span style={{fontSize:12,fontWeight:700,color:L.sage,letterSpacing:1}}>TODAY'S CHECK-IN COMPLETE</span>
      </div>
      {loading ? (
        <div style={{fontSize:13,color:L.textMuted}}>⏳ AI is generating your insight...</div>
      ) : (
        <div style={{background:'rgba(13,148,136,0.06)',border:'1px solid rgba(13,148,136,0.15)',borderRadius:14,padding:'12px 14px'}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.teal,marginBottom:6}}>🤖 YOUR WELLNESS INSIGHT</div>
          <div style={{fontSize:13,color:L.textSub,lineHeight:1.7}}>{aiInsight}</div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:14}}>DAILY CHECK-IN</div>

      {[
        {label:'How are you feeling?',items:MOODS,state:mood,set:setMood},
        {label:'Energy level?',items:ENERGY,state:energy,set:setEnergy},
        {label:'Stress level?',items:STRESS,state:stress,set:setStress},
      ].map((row,ri)=>(
        <div key={ri} style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:600,color:L.textSub,marginBottom:8}}>{row.label}</div>
          <div style={{display:'flex',gap:8}}>
            {row.items.map((item,i)=>(
              <button key={i} onClick={()=>row.set(i)}
                style={{
                  flex:1,padding:'10px 0',borderRadius:12,border:'none',cursor:'pointer',
                  background:row.state===i?`rgba(13,148,136,0.12)`:L.raised,
                  border:`1.5px solid ${row.state===i?L.teal:L.border}`,
                  fontSize:22,transition:spring,
                  transform:row.state===i?'scale(1.1)':'scale(1)',
                }}>
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button onClick={submit} disabled={mood===null||energy===null||stress===null}
        style={{
          width:'100%',padding:'13px',borderRadius:14,border:'none',cursor:'pointer',
          background:mood===null||energy===null||stress===null?L.raised:L.gradient,
          color:mood===null||energy===null||stress===null?L.textMuted:'white',
          fontSize:14,fontWeight:700,transition:smooth,
          boxShadow:mood!==null&&energy!==null&&stress!==null?L.shadowGlow:'none',
        }}>
        Submit Check-in — +10 XP
      </button>
    </div>
  )
}

// ── MY MEDICATIONS ─────────────────────────────────────
function MedicationsVault() {
  const [meds, setMeds]   = useState<any[]>([])
  const [show, setShow]   = useState(false)
  const [form, setForm]   = useState({name:'',dose:'',frequency:'',condition:''})

  useEffect(()=>{
    try { setMeds(JSON.parse(localStorage.getItem('life_medications')||'[]')) } catch {}
  },[])

  const save = () => {
    if(!form.name.trim()) return
    const updated = [...meds,{...form,id:Date.now(),added:new Date().toLocaleDateString()}]
    setMeds(updated)
    localStorage.setItem('life_medications',JSON.stringify(updated))
    setForm({name:'',dose:'',frequency:'',condition:''})
    setShow(false)
  }

  const remove = (id:number) => {
    const updated = meds.filter(m=>m.id!==id)
    setMeds(updated)
    localStorage.setItem('life_medications',JSON.stringify(updated))
  }

  return (
    <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted}}>MY MEDICATIONS</div>
          <div style={{fontSize:11,color:L.textMuted,marginTop:2}}>🔒 Private · Never shared</div>
        </div>
        <button onClick={()=>setShow(!show)}
          style={{background:L.gradient,border:'none',borderRadius:10,padding:'8px 14px',color:'white',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          + Add
        </button>
      </div>

      {show && (
        <div style={{background:L.raised,borderRadius:14,padding:14,marginBottom:12,border:`1px solid ${L.border}`}}>
          {[
            {key:'name',placeholder:'Medication name (e.g. Metformin)'},
            {key:'dose',placeholder:'Dose (e.g. 500mg)'},
            {key:'frequency',placeholder:'Frequency (e.g. Twice daily)'},
            {key:'condition',placeholder:'Condition (optional)'},
          ].map(f=>(
            <input key={f.key} value={(form as any)[f.key]}
              onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))}
              placeholder={f.placeholder}
              style={{width:'100%',padding:'10px 12px',borderRadius:10,boxSizing:'border-box',border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:13,outline:'none',marginBottom:8,fontFamily:'inherit'}}/>
          ))}
          <div style={{display:'flex',gap:8}}>
            <button onClick={save} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:L.gradient,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>Save</button>
            <button onClick={()=>setShow(false)} style={{flex:1,padding:'10px',borderRadius:10,border:`1px solid ${L.border}`,background:L.raised,color:L.textSub,fontSize:13,cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}

      {meds.length===0 ? (
        <div style={{textAlign:'center',padding:'20px 0',color:L.textMuted,fontSize:13}}>
          No medications added yet
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {meds.map(m=>(
            <div key={m.id} style={{display:'flex',alignItems:'center',gap:12,background:L.raised,borderRadius:12,padding:'10px 14px',border:`1px solid ${L.border}`}}>
              <span style={{fontSize:20}}>💊</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:L.textPrimary}}>{m.name} {m.dose && `· ${m.dose}`}</div>
                <div style={{fontSize:11,color:L.textMuted}}>{m.frequency} {m.condition&&`· ${m.condition}`}</div>
              </div>
              <button onClick={()=>remove(m.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:L.textMuted}}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── LAB RESULTS ───────────────────────────────────────
function LabVault({ onXP }:{ onXP?:(n:number)=>void }) {
  const [labs, setLabs]       = useState<any[]>([])
  const [show, setShow]       = useState(false)
  const [form, setForm]       = useState({test:'',value:'',unit:'',date:''})
  const [analyzing, setAnal]  = useState(false)
  const [insight, setInsight] = useState<Record<number,string>>({})

  useEffect(()=>{
    try { setLabs(JSON.parse(localStorage.getItem('life_labs')||'[]')) } catch {}
  },[])

  const save = () => {
    if(!form.test.trim()||!form.value.trim()) return
    const updated = [...labs,{...form,id:Date.now()}]
    setLabs(updated); localStorage.setItem('life_labs',JSON.stringify(updated))
    setForm({test:'',value:'',unit:'',date:''}); setShow(false)
  }

  const analyze = async (lab:any) => {
    setAnal(true)
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          question:`Lab result: ${lab.test} = ${lab.value} ${lab.unit}. Briefly interpret this result (normal/abnormal), what it means, and if follow-up is needed. 2-3 sentences. Educational only.`,
          specialty:'Internal Medicine'
        })
      })
      const data = await res.json()
      setInsight(prev=>({...prev,[lab.id]:data.answer||''}))
      onXP?.(15)
    } catch {}
    setAnal(false)
  }

  return (
    <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted}}>LAB RESULTS</div>
          <div style={{fontSize:11,color:L.textMuted,marginTop:2}}>🔒 Private · AI Analysis</div>
        </div>
        <button onClick={()=>setShow(!show)}
          style={{background:L.gradient,border:'none',borderRadius:10,padding:'8px 14px',color:'white',fontSize:12,fontWeight:700,cursor:'pointer'}}>
          + Add
        </button>
      </div>

      {show && (
        <div style={{background:L.raised,borderRadius:14,padding:14,marginBottom:12,border:`1px solid ${L.border}`}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <input value={form.test} onChange={e=>setForm(p=>({...p,test:e.target.value}))} placeholder="Test (e.g. HbA1c)"
              style={{padding:'10px 12px',borderRadius:10,border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
            <input value={form.value} onChange={e=>setForm(p=>({...p,value:e.target.value}))} placeholder="Value (e.g. 7.2)"
              style={{padding:'10px 12px',borderRadius:10,border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
            <input value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} placeholder="Unit (e.g. %)"
              style={{padding:'10px 12px',borderRadius:10,border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
            <input value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} placeholder="Date" type="date"
              style={{padding:'10px 12px',borderRadius:10,border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={save} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:L.gradient,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>Save</button>
            <button onClick={()=>setShow(false)} style={{flex:1,padding:'10px',borderRadius:10,border:`1px solid ${L.border}`,background:L.raised,color:L.textSub,fontSize:13,cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}

      {labs.length===0 ? (
        <div style={{textAlign:'center',padding:'20px 0',color:L.textMuted,fontSize:13}}>No lab results added</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {labs.map(lab=>(
            <div key={lab.id} style={{background:L.raised,borderRadius:12,padding:'12px 14px',border:`1px solid ${L.border}`}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                <div>
                  <span style={{fontSize:13,fontWeight:700,color:L.textPrimary}}>{lab.test}</span>
                  <span style={{fontSize:15,fontWeight:900,color:L.cobalt,marginLeft:10}}>{lab.value} {lab.unit}</span>
                </div>
                <span style={{fontSize:10,color:L.textMuted}}>{lab.date}</span>
              </div>
              {insight[lab.id] ? (
                <div style={{fontSize:12,color:L.textSub,lineHeight:1.6,marginTop:6,padding:'8px 10px',background:'rgba(13,148,136,0.06)',borderRadius:10}}>
                  {insight[lab.id]}
                </div>
              ) : (
                <button onClick={()=>analyze(lab)} disabled={analyzing}
                  style={{marginTop:6,padding:'6px 12px',borderRadius:8,border:'none',background:`rgba(13,148,136,0.10)`,color:L.teal,fontSize:11,fontWeight:700,cursor:'pointer'}}>
                  {analyzing?'⏳ Analyzing...':'🤖 AI Analyze +15 XP'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{marginTop:10,fontSize:10,color:L.textMuted,textAlign:'center'}}>
        ⚠️ Educational only · Always consult your physician
      </div>
    </div>
  )
}

// ── VITALITY PILLARS ──────────────────────────────────
function VitalityPillars() {
  const PILLARS = [
    { icon:'🏃', label:'Physical',  score:72, color:L.teal,   tip:'30 min walk today' },
    { icon:'🧠', label:'Mental',    score:65, color:L.violet, tip:'5 min mindfulness' },
    { icon:'🌍', label:'Social',    score:80, color:L.cobalt, tip:'Connect with a colleague' },
    { icon:'🌿', label:'Environment',score:58, color:L.sage,  tip:'Get some fresh air' },
  ]

  return (
    <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:14}}>VITALITY PILLARS</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {PILLARS.map(p=>(
          <div key={p.label} style={{background:L.raised,borderRadius:16,padding:'14px 12px',border:`1px solid ${p.color}15`}}>
            <div style={{fontSize:24,marginBottom:6}}>{p.icon}</div>
            <div style={{fontSize:12,fontWeight:700,color:L.textPrimary,marginBottom:4}}>{p.label}</div>
            <div style={{background:L.border,borderRadius:99,height:5,overflow:'hidden',marginBottom:6}}>
              <div style={{height:'100%',width:`${p.score}%`,background:p.color,borderRadius:99,transition:'width 1s ease'}}/>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:11,color:L.textMuted}}>{p.tip}</span>
              <span style={{fontSize:13,fontWeight:900,color:p.color}}>{p.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── XP & ACHIEVEMENTS ─────────────────────────────────
function XPDashboard({ xp=0, streak=0, casesCompleted=0 }) {
  const level = Math.floor(xp/500)+1
  const nextXP = level*500
  const progress = ((xp%(500))/(500))*100

  const BADGES = [
    {icon:'🏥',label:'First Case',  unlocked:casesCompleted>=1,  color:L.red},
    {icon:'🔥',label:'3-Day Streak',unlocked:streak>=3,          color:L.amber},
    {icon:'🧠',label:'MCQ Master',  unlocked:xp>=500,            color:L.violet},
    {icon:'🌍',label:'Global Vote', unlocked:xp>=100,            color:L.cobalt},
    {icon:'💎',label:'Pearl Finder',unlocked:xp>=250,            color:L.teal},
    {icon:'⭐',label:'PRO Member',  unlocked:false,              color:L.amber},
  ]

  return (
    <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:14}}>XP & ACHIEVEMENTS</div>

      {/* Level progress */}
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
        <div style={{width:56,height:56,borderRadius:'50%',background:L.gradient,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:L.shadowGlow}}>
          <span style={{fontSize:22,fontWeight:900,color:'white'}}>L{level}</span>
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:13,fontWeight:700,color:L.textPrimary}}>Level {level}</span>
            <span style={{fontSize:12,color:L.textMuted}}>{xp} / {nextXP} XP</span>
          </div>
          <div style={{background:L.raised,borderRadius:99,height:8,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${progress}%`,background:L.gradient,borderRadius:99,transition:'width 1s ease'}}/>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
        {[
          {label:'Cases',  value:casesCompleted, color:L.red,    icon:'🏥'},
          {label:'Streak', value:`${streak}🔥`,  color:L.amber,  icon:'🔥'},
          {label:'XP',     value:xp,             color:L.teal,   icon:'⚡'},
        ].map(s=>(
          <div key={s.label} style={{background:L.raised,borderRadius:14,padding:'12px 8px',textAlign:'center',border:`1px solid ${L.border}`}}>
            <div style={{fontSize:20,fontWeight:900,color:s.color}}>{s.value}</div>
            <div style={{fontSize:10,color:L.textMuted,marginTop:2,fontWeight:600}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:10}}>BADGES</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
        {BADGES.map(b=>(
          <div key={b.label} style={{
            background:b.unlocked?`${b.color}10`:L.raised,
            border:`1px solid ${b.unlocked?b.color+'30':L.border}`,
            borderRadius:14,padding:'12px 8px',textAlign:'center',
            opacity:b.unlocked?1:0.4,
          }}>
            <div style={{fontSize:24,marginBottom:4}}>{b.icon}</div>
            <div style={{fontSize:9,fontWeight:700,color:b.unlocked?b.color:L.textMuted}}>{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


// ── LIFE SCORE ────────────────────────────────────────
function LifeScore({ xp=0, streak=0, casesCompleted=0, checkInDone=false }) {
  const physical    = Math.min(100, streak*7 + (checkInDone?20:0))
  const mental      = Math.min(100, xp/10 + (checkInDone?30:0))
  const social      = Math.min(100, casesCompleted*5 + 20)
  const professional= Math.min(100, Math.floor(xp/500)*20 + casesCompleted*4)
  const total       = Math.round((physical+mental+social+professional)/4)

  const color = total>=80?L.sage:total>=60?L.amber:L.red
  const PILLARS = [
    {label:'Physical',    score:physical,     color:L.teal,   icon:'🏃'},
    {label:'Mental',      score:mental,       color:L.violet, icon:'🧠'},
    {label:'Social',      score:social,       color:L.cobalt, icon:'🌍'},
    {label:'Professional',score:professional, color:L.amber,  icon:'🩺'},
  ]

  return (
    <div style={{marginBottom:16}}>
      <div style={{position:'relative',height:160,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.88))'}}/>
        <div style={{position:'absolute',bottom:16,left:16,right:16,display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>DAILY LIFE SCORE</div>
            <div style={{fontSize:52,fontWeight:900,color:'white',letterSpacing:-2,lineHeight:1}}>{total}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.7)'}}>out of 100 · Updated daily</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{width:80,height:80}}>
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6"/>
                <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(total/100)*201} 201`}
                  transform="rotate(-90 40 40)"
                  style={{transition:'stroke-dasharray 1.5s ease'}}/>
                <text x="40" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="900">{total}%</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {PILLARS.map(p=>(
            <div key={p.label} style={{background:L.raised,borderRadius:14,padding:'12px 10px',border:`1px solid ${p.color}15`}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                <span style={{fontSize:16}}>{p.icon}</span>
                <span style={{fontSize:11,fontWeight:700,color:L.textSub}}>{p.label}</span>
              </div>
              <div style={{background:L.border,borderRadius:99,height:5,overflow:'hidden',marginBottom:4}}>
                <div style={{height:'100%',width:`${p.score}%`,background:p.color,borderRadius:99,transition:'width 1s ease'}}/>
              </div>
              <span style={{fontSize:14,fontWeight:900,color:p.color}}>{p.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── GROWTH DNA ────────────────────────────────────────
function GrowthDNA() {
  const TRAITS = [
    {label:'Cardiology',      score:88, color:L.red,    icon:'🫀'},
    {label:'Emergency',       score:72, color:L.amber,  icon:'🚨'},
    {label:'Critical Care',   score:65, color:L.violet, icon:'🏥'},
    {label:'Neurology',       score:45, color:L.cobalt, icon:'🧠'},
    {label:'Bold Decisions',  score:82, color:L.teal,   icon:'⚡'},
    {label:'Night Learner',   score:91, color:'#4F46E5', icon:'🌙'},
    {label:'Evidence-Based',  score:78, color:L.sage,   icon:'📊'},
    {label:'Team Player',     score:70, color:L.orange, icon:'🤝'},
  ]

  return (
    <div style={{marginBottom:16}}>
      <div style={{position:'relative',height:150,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.88))'}}/>
        <div style={{position:'absolute',bottom:16,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>AI ANALYSIS · 30 DAYS</div>
          <div style={{fontSize:22,fontWeight:900,color:'white'}}>🧬 Your Growth DNA</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>Your unique medical personality fingerprint</div>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm}}>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {TRAITS.map(t=>(
            <div key={t.label} style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:18,width:24,textAlign:'center'}}>{t.icon}</span>
              <span style={{fontSize:12,fontWeight:600,color:L.textSub,width:110,flexShrink:0}}>{t.label}</span>
              <div style={{flex:1,background:L.raised,borderRadius:99,height:7,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${t.score}%`,background:t.color,borderRadius:99,transition:'width 1.2s ease'}}/>
              </div>
              <span style={{fontSize:12,fontWeight:800,color:t.color,width:32,textAlign:'right'}}>{t.score}%</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:14,padding:'12px 14px',background:'rgba(13,148,136,0.06)',borderRadius:14,border:'1px solid rgba(13,148,136,0.15)'}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.teal,marginBottom:6}}>🤖 AI PERSONALITY INSIGHT</div>
          <div style={{fontSize:13,color:L.textSub,lineHeight:1.65}}>
            You are a <strong style={{color:L.textPrimary}}>Bold Evidence-Based Cardiologist</strong> — decisive under pressure, strongest at night, with room to grow in Neurology. Your confidence score places you in the top 15% globally.
          </div>
        </div>
      </div>
    </div>
  )
}

// ── LETTER TO FUTURE ME ───────────────────────────────
function FutureLetter() {
  const [letter, setLetter]   = useState('')
  const [sent, setSent]       = useState(false)
  const [pastLetter, setPast] = useState<string|null>(null)
  const [showPast, setShowPast] = useState(false)

  useEffect(()=>{
    const saved = localStorage.getItem('life_future_letter')
    if(saved) {
      const {text, date} = JSON.parse(saved)
      const months = (Date.now()-new Date(date).getTime())/(1000*60*60*24*30)
      if(months>=6) setPast(text)
    }
    const sent = localStorage.getItem('life_letter_sent')
    if(sent) setSent(true)
  },[])

  const saveLetter = () => {
    if(!letter.trim()) return
    localStorage.setItem('life_future_letter',JSON.stringify({text:letter,date:new Date().toISOString()}))
    localStorage.setItem('life_letter_sent','1')
    setSent(true)
  }

  return (
    <div style={{marginBottom:16}}>
      <div style={{position:'relative',height:150,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.88))'}}/>
        <div style={{position:'absolute',bottom:16,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>DELIVERED IN 6 MONTHS</div>
          <div style={{fontSize:22,fontWeight:900,color:'white'}}>💌 Letter to Future Me</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>Write to yourself · Delivered when ready</div>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm}}>

        {pastLetter && (
          <div style={{marginBottom:14,padding:'14px',background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:14}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.amber,marginBottom:8}}>📬 A LETTER FROM YOUR PAST SELF</div>
            <div style={{fontSize:13,color:L.textSub,lineHeight:1.7,fontStyle:'italic'}}>"{pastLetter}"</div>
          </div>
        )}

        {sent ? (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:40,marginBottom:12}}>💌</div>
            <div style={{fontSize:15,fontWeight:700,color:L.textPrimary,marginBottom:6}}>Letter saved!</div>
            <div style={{fontSize:13,color:L.textMuted}}>You'll receive it in 6 months via email with your progress report.</div>
          </div>
        ) : (
          <>
            <div style={{fontSize:13,color:L.textSub,marginBottom:12,lineHeight:1.6}}>
              Write to yourself 6 months from now. What do you want to achieve? What worries you today?
            </div>
            <textarea value={letter} onChange={e=>setLetter(e.target.value)}
              placeholder="Dear future me... I hope by the time you read this, you have..."
              rows={5}
              style={{width:'100%',padding:14,borderRadius:14,boxSizing:'border-box',border:`1px solid ${L.border}`,background:L.raised,color:L.textPrimary,fontSize:13,outline:'none',resize:'none',lineHeight:1.7,fontFamily:'inherit',marginBottom:10}}/>
            <button onClick={saveLetter} disabled={!letter.trim()}
              style={{
                width:'100%',padding:'13px',borderRadius:14,border:'none',cursor:'pointer',
                background:!letter.trim()?L.raised:L.gradient,
                color:!letter.trim()?L.textMuted:'white',
                fontSize:14,fontWeight:700,
                boxShadow:letter.trim()?L.shadowGlow:'none',transition:smooth,
              }}>
              💌 Seal & Save Letter
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── GLOBAL PHYSICIAN CENSUS ───────────────────────────
function GlobalCensus() {
  const [pulse, setPulse] = useState(true)

  useEffect(()=>{
    const t = setInterval(()=>setPulse(p=>!p),900)
    return ()=>clearInterval(t)
  },[])

  const COUNTRIES = [
    {flag:'🇸🇦',name:'Saudi Arabia', doctors:8420, specialty:'Cardiology',    active:true},
    {flag:'🇬🇧',name:'United Kingdom',doctors:6280, specialty:'Emergency',    active:true},
    {flag:'🇺🇸',name:'United States', doctors:5910, specialty:'Critical Care',active:false},
    {flag:'🇦🇪',name:'UAE',           doctors:3840, specialty:'Internal Med', active:true},
    {flag:'🇪🇬',name:'Egypt',         doctors:4120, specialty:'Neurology',    active:false},
    {flag:'🇮🇳',name:'India',         doctors:7650, specialty:'Surgery',      active:true},
    {flag:'🇩🇪',name:'Germany',       doctors:2980, specialty:'Radiology',    active:false},
    {flag:'🇯🇵',name:'Japan',         doctors:1840, specialty:'Oncology',     active:true},
  ]

  const total = COUNTRIES.reduce((a,c)=>a+c.doctors,0)
  const activeNow = COUNTRIES.filter(c=>c.active).reduce((a,c)=>a+c.doctors,0)

  return (
    <div style={{marginBottom:16}}>
      <div style={{position:'relative',height:150,borderRadius:'20px 20px 0 0',overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.88))'}}/>
        <div style={{position:'absolute',top:14,left:16,display:'flex',alignItems:'center',gap:6,background:'rgba(15,23,42,0.55)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:99,padding:'5px 12px'}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:pulse?L.sage:'rgba(16,185,129,0.2)',boxShadow:pulse?`0 0 8px ${L.sage}`:'none',transition:smooth}}/>
          <span style={{fontSize:10,fontWeight:700,color:'white',letterSpacing:1}}>{activeNow.toLocaleString()} ACTIVE NOW</span>
        </div>
        <div style={{position:'absolute',bottom:16,left:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:4}}>{COUNTRIES.length} COUNTRIES · LIVE</div>
          <div style={{fontSize:22,fontWeight:900,color:'white'}}>🌍 Global Physician Census</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>{total.toLocaleString()} doctors worldwide</div>
        </div>
      </div>
      <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:'0 0 20px 20px',padding:16,borderTop:'none',boxShadow:L.shadowSm}}>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {COUNTRIES.map(c=>(
            <div key={c.name} style={{
              display:'flex',alignItems:'center',gap:12,
              padding:'10px 12px',borderRadius:12,
              background:c.active?`rgba(16,185,129,0.05)`:L.raised,
              border:`1px solid ${c.active?'rgba(16,185,129,0.2)':L.border}`,
            }}>
              <span style={{fontSize:24}}>{c.flag}</span>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:13,fontWeight:700,color:L.textPrimary}}>{c.name}</span>
                  {c.active && <div style={{width:6,height:6,borderRadius:'50%',background:L.sage,boxShadow:`0 0 4px ${L.sage}`}}/>}
                </div>
                <div style={{fontSize:11,color:L.textMuted}}>{c.specialty} · most active</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:900,color:c.active?L.sage:L.textMuted}}>{c.doctors.toLocaleString()}</div>
                <div style={{fontSize:9,color:L.textMuted}}>doctors</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12,padding:'10px 14px',background:'rgba(13,148,136,0.06)',borderRadius:12,border:'1px solid rgba(13,148,136,0.15)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:12,color:L.teal,fontWeight:700}}>🌍 You are part of a global movement</span>
          <span style={{fontSize:12,fontWeight:900,color:L.teal}}>{COUNTRIES.length} countries</span>
        </div>
      </div>
    </div>
  )
}

// ── MAIN LIFE TAB ──────────────────────────────────────
const SECTIONS = [
  { id:'overview',  label:'Overview',  icon:'🌱' },
  { id:'wellness',  label:'Wellness',  icon:'🧠' },
  { id:'health',    label:'Health',    icon:'💊' },
  { id:'world',     label:'World',     icon:'🌍' },
  { id:'xp',        label:'Progress',  icon:'⭐' },
  { id:'settings',  label:'Settings',  icon:'⚙️' },
]

export default function MePage({
  xp=0, streak=0, casesCompleted=0, mcqCorrect=0,
  onXP, isPro, setTab,
}:any) {
  const [section, setSection] = useState('overview')
  const [pressed, setPressed] = useState<string|null>(null)

  const vitalityScore = Math.min(100, Math.round(
    (Math.min(xp,1000)/1000*30) +
    (Math.min(streak,14)/14*30) +
    (Math.min(casesCompleted,20)/20*40)
  ))

  return (
    <div style={{
      minHeight:'100vh', background:L.canvas, paddingBottom:120,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif',
    }}>

      {/* Hero */}
      <div style={{position:'relative',height:200,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.88))'}}/>

        {/* Profile */}
        <div style={{position:'absolute',bottom:16,left:16,right:16,display:'flex',alignItems:'flex-end',gap:14}}>
          <div style={{
            width:64,height:64,borderRadius:20,
            background:L.gradient,flexShrink:0,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:28,boxShadow:`0 4px 16px rgba(13,148,136,0.4)`,
            border:'3px solid rgba(255,255,255,0.3)',
          }}>👨‍⚕️</div>
          <div style={{flex:1}}>
            <div style={{fontSize:20,fontWeight:900,color:'white',letterSpacing:-0.4}}>Dr. Ahmed</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>Cardiologist · Level {Math.floor(xp/500)+1}</div>
          </div>
          <VitalityRing score={vitalityScore} size={72}/>
        </div>
      </div>

      {/* Section tabs */}
      <div style={{display:'flex',gap:0,margin:'14px 16px 0',background:L.raised,borderRadius:16,padding:4,border:`1px solid ${L.border}`}}>
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)}
            onMouseDown={()=>setPressed(s.id)} onMouseUp={()=>setPressed(null)}
            style={{
              flex:1,padding:'9px 4px',borderRadius:12,border:'none',cursor:'pointer',
              background:section===s.id?L.gradient:'transparent',
              color:section===s.id?'white':L.textMuted,
              fontSize:11,fontWeight:700,
              transform:pressed===s.id?'scale(0.97)':'scale(1)',
              transition:'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow:section===s.id?L.shadowGlow:'none',
              display:'flex',flexDirection:'column',alignItems:'center',gap:2,
            }}>
            <span style={{fontSize:14}}>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={{padding:'14px 16px 0'}}>

        {section==='overview' && (
          <>
            <LifeScore xp={xp} streak={streak} casesCompleted={casesCompleted}/>
            {/* Vitality pillars */}
            <VitalityPillars/>

            {/* Quick stats */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:14}}>LIFE STATS</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  {label:'Cases Done',    value:casesCompleted, icon:'🏥', color:L.red},
                  {label:'MCQ Correct',   value:mcqCorrect,     icon:'🧬', color:L.cobalt},
                  {label:'Day Streak',    value:streak,         icon:'🔥', color:L.amber},
                  {label:'Total XP',      value:xp,             icon:'⚡', color:L.teal},
                ].map(s=>(
                  <div key={s.label} style={{background:L.raised,borderRadius:16,padding:'14px 12px',border:`1px solid ${L.border}`}}>
                    <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
                    <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:11,color:L.textMuted,marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly report */}
            <div style={{background:'rgba(13,148,136,0.06)',border:'1px solid rgba(13,148,136,0.2)',borderRadius:20,padding:18,marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:24}}>📧</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:L.textPrimary}}>Monthly Report</div>
                  <div style={{fontSize:12,color:L.textMuted}}>AI-generated · Sent to your email</div>
                </div>
              </div>
              <div style={{fontSize:12,color:L.textSub,lineHeight:1.6,marginBottom:12}}>
                Your personalized monthly summary includes clinical progress, vitality scores, XP earned, and AI recommendations — delivered every 1st of the month.
              </div>
              <button style={{
                width:'100%',padding:'12px',borderRadius:14,border:'none',cursor:'pointer',
                background:L.gradient,color:'white',fontSize:13,fontWeight:700,
              }}>
                📧 Request Report Now
              </button>
            </div>
          </>
        )}

        {section==='wellness' && (
          <>
            <DailyCheckIn onXP={onXP}/>
            <GrowthDNA/>
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:14}}>MIND SPACE</div>
              {[
                {icon:'🧘',label:'5-min Mindfulness',sub:'Guided breathing · Stress relief',color:L.violet},
                {icon:'💭',label:'Cognitive Exercise',sub:'Brain training · Focus boost',color:L.cobalt},
                {icon:'📖',label:'Daily Wisdom',sub:'Medical + philosophical quote',color:L.amber},
                {icon:'😴',label:'Sleep Tracker',sub:'Log sleep quality + duration',color:L.teal},
              ].map(item=>(
                <div key={item.label} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'12px 0',
                  borderBottom:`1px solid ${L.border}`,
                }}>
                  <div style={{width:44,height:44,borderRadius:14,background:`${item.color}10`,border:`1px solid ${item.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                    {item.icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:L.textPrimary}}>{item.label}</div>
                    <div style={{fontSize:12,color:L.textMuted}}>{item.sub}</div>
                  </div>
                  <span style={{fontSize:18,color:L.textMuted}}>›</span>
                </div>
              ))}
            </div>
          </>
        )}

        {section==='health' && (
          <>
            <MedicationsVault/>
            <LabVault onXP={onXP}/>

            {/* Apple Watch */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:`4px solid ${L.teal}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                <span style={{fontSize:28}}>⌚</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:L.textPrimary}}>Apple Watch</div>
                  <div style={{fontSize:12,color:L.textMuted}}>HealthKit · Real-time vitals</div>
                </div>
                <div style={{marginLeft:'auto',background:'rgba(245,183,49,0.1)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:99,padding:'4px 10px',fontSize:10,fontWeight:700,color:L.amber}}>
                  COMING SOON
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {[
                  {icon:'❤️',label:'HR',value:'--'},
                  {icon:'🩸',label:'SpO2',value:'--'},
                  {icon:'👟',label:'Steps',value:'--'},
                ].map(v=>(
                  <div key={v.label} style={{background:L.raised,borderRadius:12,padding:'10px 8px',textAlign:'center'}}>
                    <div style={{fontSize:20}}>{v.icon}</div>
                    <div style={{fontSize:16,fontWeight:900,color:L.teal}}>{v.value}</div>
                    <div style={{fontSize:10,color:L.textMuted}}>{v.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:16,padding:'12px 16px',marginBottom:16}}>
              <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
                ⚠️ All health data is stored locally on your device only. Never shared. Educational purposes only — always consult your physician.
              </div>
            </div>
          </>
        )}

        {section==='world' && (
          <>
            <GlobalCensus/>
            <FutureLetter/>
          </>
        )}


        {section==='settings' && (
          <div>
            {/* Account */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:14}}>ACCOUNT</div>
              {[
                {icon:'👨‍⚕️', label:'Edit Profile',      sub:'Name, specialty, country'},
                {icon:'🔔', label:'Notifications',     sub:'Push alerts, reminders'},
                {icon:'🔒', label:'Privacy & Security', sub:'Data, biometrics'},
                {icon:'⭐', label:'Upgrade to PRO',    sub:'Unlock all features', color:L.teal},
              ].map((item,i)=>(
                <div key={i} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'13px 0',
                  borderBottom:i<3?`1px solid ${L.border}`:'none',
                  cursor:'pointer',
                }}>
                  <div style={{width:40,height:40,borderRadius:12,background:item.color?`${item.color}10`:L.raised,border:`1px solid ${item.color?item.color+'25':L.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                    {item.icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:item.color||L.textPrimary}}>{item.label}</div>
                    <div style={{fontSize:11,color:L.textMuted}}>{item.sub}</div>
                  </div>
                  <span style={{fontSize:18,color:L.textMuted}}>›</span>
                </div>
              ))}
            </div>

            {/* Preferences */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:14}}>PREFERENCES</div>
              {[
                {icon:'🌐', label:'Language',          sub:'English / العربية'},
                {icon:'📏', label:'Units',             sub:'Metric / Imperial'},
                {icon:'🎨', label:'Appearance',        sub:'Light / Dark / Auto'},
                {icon:'♿', label:'Accessibility',     sub:'Font size, contrast'},
              ].map((item,i)=>(
                <div key={i} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'13px 0',
                  borderBottom:i<3?`1px solid ${L.border}`:'none',
                  cursor:'pointer',
                }}>
                  <div style={{width:40,height:40,borderRadius:12,background:L.raised,border:`1px solid ${L.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                    {item.icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:L.textPrimary}}>{item.label}</div>
                    <div style={{fontSize:11,color:L.textMuted}}>{item.sub}</div>
                  </div>
                  <span style={{fontSize:18,color:L.textMuted}}>›</span>
                </div>
              ))}
            </div>

            {/* About */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,padding:18,marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:14}}>ABOUT</div>
              {[
                {icon:'📋', label:'Terms of Service',  sub:'Legal'},
                {icon:'🔐', label:'Privacy Policy',    sub:'Data protection'},
                {icon:'⭐', label:'Rate the App',      sub:'App Store review'},
                {icon:'💬', label:'Contact Support',   sub:'help@cliniverseai.com'},
              ].map((item,i)=>(
                <div key={i} style={{
                  display:'flex',alignItems:'center',gap:12,
                  padding:'13px 0',
                  borderBottom:i<3?`1px solid ${L.border}`:'none',
                  cursor:'pointer',
                }}>
                  <div style={{width:40,height:40,borderRadius:12,background:L.raised,border:`1px solid ${L.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                    {item.icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:L.textPrimary}}>{item.label}</div>
                    <div style={{fontSize:11,color:L.textMuted}}>{item.sub}</div>
                  </div>
                  <span style={{fontSize:18,color:L.textMuted}}>›</span>
                </div>
              ))}
            </div>

            {/* Version + Reset */}
            <div style={{textAlign:'center',padding:'8px 0 20px'}}>
              <div style={{fontSize:12,color:L.textMuted,marginBottom:8}}>Cliniverse AI v1.1 · Build 2026</div>
              <button onClick={()=>{localStorage.clear();window.location.reload()}}
                style={{background:'none',border:'none',cursor:'pointer',color:L.red,fontSize:13,fontWeight:600}}>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {section==='xp' && (
          <XPDashboard xp={xp} streak={streak} casesCompleted={casesCompleted}/>
        )}

      </div>
    </div>
  )
}
