'use client'
import { useState } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.12)',
  text:   '#EEF6FA',
  sub:    'rgba(238,246,250,0.60)',
  muted:  'rgba(238,246,250,0.38)',
  teal:   '#00C4B4',
  blue:   '#007AFF',
  green:  '#34C759',
  orange: '#FF9500',
  red:    '#FF3B30',
  purple: '#AF52DE',
  gold:   '#D4A847',
}

const SCENARIOS = [
  {
    id:'concussion', icon:'🏃', title:'Concussion Assessment',
    sport:'Football', minute:67, color:T.blue,
    situation:'A midfielder collides heads with an opponent. He briefly loses balance, appears dazed, and cannot recall the last 5 minutes. He insists he is fine and wants to continue.',
    urgency:'URGENT',
    options:[
      {text:'Allow him to continue — he says he feels fine', correct:false, explanation:'Any suspected concussion = immediate removal from play. Player self-assessment is unreliable post-concussion.'},
      {text:'Remove from play immediately, do NOT return today', correct:true, explanation:'FIFA/World Rugby: "If in doubt, sit them out." No same-day return after concussion. SCAT6 assessment off-field.'},
      {text:'Give him 5 minutes rest then reassess on pitch', correct:false, explanation:'Never assess concussion on the pitch. Remove to quiet environment. On-field assessment is unreliable.'},
      {text:'Allow 10-minute substitution window then return', correct:false, explanation:'Concussion substitutes are available, but the player cannot return to play same day under any protocol.'},
    ],
    pearl:'SCAT6 Concussion: 1) Remove from play 2) Red flags? → Hospital. 3) Assess off-field. 4) No same-day return. 5) Stepwise RTP: 6-day minimum protocol.',
    protocol:'FIFA Concussion Protocol 2023',
    checks:['Loss of consciousness?','Amnesia (retrograde/anterograde)?','Headache or pressure in head?','Nausea/vomiting?','Balance problems?','Visual disturbance?','Feeling slowed down?'],
  },
  {
    id:'heatstroke', icon:'☀️', title:'Exertional Heat Stroke',
    sport:'Marathon', minute:null, color:T.red,
    situation:'A marathon runner collapses at km 38 in 36°C heat. Core temp 40.8°C rectally. Confused, agitated, GCS 13. HR 138, BP 88/54. Skin hot and dry. No sweating.',
    urgency:'CRITICAL',
    options:[
      {text:'Oral rehydration and rest in shade', correct:false, explanation:'EHS with altered consciousness requires immediate aggressive cooling and emergency evacuation — not oral fluids.'},
      {text:'Immediate cold water immersion + emergency evacuation', correct:true, explanation:'Gold standard: cold water immersion (8-15°C) targeting core temp <39°C within 30 min. Then emergency hospital.'},
      {text:'IV fluids and wait for ambulance', correct:false, explanation:'Cooling MUST begin immediately — do not delay for IV access. Cool first, transport second.'},
      {text:'Lay flat, fan with towels, wait for help', correct:false, explanation:'Fanning alone is insufficient for core temp 40.8°C. Ice packs + cold immersion needed immediately.'},
    ],
    pearl:'EHS cooling rate: target <0.2°C/min drop. Cold water immersion fastest method. "Cool first, transport second." CNS dysfunction differentiates EHS from heat exhaustion.',
    protocol:'ACSM Heat Stroke Guidelines 2023',
    checks:['Core temperature >40°C?','CNS dysfunction present?','Hot/dry skin?','Hypotension?','Signs of organ failure?','Contraindications to immersion?'],
  },
  {
    id:'cardiac', icon:'🫀', title:'Sudden Cardiac Arrest',
    sport:'Basketball', minute:34, color:T.red,
    situation:'A 19-year-old basketball player suddenly collapses on court. Unresponsive, no normal breathing. You are the pitch-side doctor. AED is 90 seconds away.',
    urgency:'CRITICAL',
    options:[
      {text:'Wait for AED before starting CPR', correct:false, explanation:'Start CPR immediately — every minute without CPR reduces survival by 10%. AED is priority but CPR first.'},
      {text:'Start CPR immediately, send someone for AED', correct:true, explanation:'CPR + early defibrillation = best outcomes. Start 30:2 CPR now, delegate AED retrieval simultaneously.'},
      {text:'Check for pulse for 30 seconds then decide', correct:false, explanation:'If unresponsive and no normal breathing: assume cardiac arrest. Start CPR. Do not delay for prolonged pulse check.'},
      {text:'Apply recovery position and monitor', correct:false, explanation:'Recovery position is for unconscious patients who ARE breathing. Cardiac arrest requires CPR.'},
    ],
    pearl:'Sports SCA: most common cause in young athletes = hypertrophic cardiomyopathy or commotio cordis. Survival with CPR+AED <3min = 70%. Every second counts.',
    protocol:'ERC Resuscitation Guidelines 2021',
    checks:['Unresponsive?','No normal breathing?','Activate emergency services','Start CPR 30:2','AED as soon as available','Consider reversible causes'],
  },
]

// ── RETURN TO PLAY CALCULATOR ──
function RTPCalculator({ onClose }: { onClose:()=>void }) {
  const [day, setDay] = useState(0)
  const steps = [
    { day:0, activity:'Complete rest', notes:'No screen time, no sport, no school if symptomatic' },
    { day:1, activity:'Light aerobic exercise', notes:'Walking, swimming — no resistance training' },
    { day:2, activity:'Sport-specific exercise', notes:'Running drills — no head impact activities' },
    { day:3, activity:'Non-contact training', notes:'Passing drills, technical skills' },
    { day:4, activity:'Full contact practice', notes:'Medical clearance required before this step' },
    { day:5, activity:'Return to competition', notes:'Full return to sport' },
  ]
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.90)',backdropFilter:'blur(12px)',overflowY:'auto'}}>
      <div style={{padding:'20px',maxWidth:480,margin:'0 auto',paddingBottom:40}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'8px 14px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Back</button>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T.text}}>🏃 Return to Play Protocol</div>
            <div style={{fontSize:11,color:T.sub}}>FIFA/World Rugby Concussion RTP</div>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {steps.map((s,i)=>(
            <div key={i} onClick={()=>setDay(i)} style={{
              background:day===i?`${T.blue}15`:T.glass,
              backdropFilter:'blur(20px)',
              border:`1.5px solid ${day===i?T.blue:'rgba(255,255,255,0.10)'}`,
              borderRadius:16,padding:'14px',cursor:'pointer',
              boxShadow:day===i?`0 0 16px ${T.blue}25`:'none',
            }}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:day===i?T.blue:'rgba(255,255,255,0.10)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:day===i?'#fff':T.muted}}>
                  {s.day===0?'R':s.day}
                </div>
                <div style={{fontSize:13,fontWeight:800,color:day===i?T.text:T.sub}}>{s.activity}</div>
              </div>
              {day===i && <div style={{fontSize:11,color:T.muted,lineHeight:1.6,paddingLeft:38}}>{s.notes}</div>}
            </div>
          ))}
        </div>
        <div style={{background:`${T.gold}08`,border:`1px solid ${T.gold}18`,borderRadius:14,padding:'12px 14px',marginTop:14}}>
          <div style={{fontSize:9,color:T.gold,fontWeight:700,letterSpacing:1,marginBottom:4}}>⚠️ IMPORTANT</div>
          <div style={{fontSize:11,color:T.sub,lineHeight:1.6}}>If ANY symptoms return during a step, go back to the previous step. Minimum 24h at each step. Medical clearance required before Step 5.</div>
        </div>
      </div>
    </div>
  )
}

export default function SportsMedicineModule({ onXP }: { onXP?: (n:number)=>void }) {
  const [selected, setSelected] = useState<typeof SCENARIOS[0]|null>(null)
  const [answered, setAnswered] = useState<number|null>(null)
  const [showRTP, setShowRTP] = useState(false)
  const [checkDone, setCheckDone] = useState<number[]>([])

  if (showRTP) return <RTPCalculator onClose={()=>setShowRTP(false)}/>

  if (selected) {
    const isCorrect = answered !== null && selected.options[answered].correct
    return (
      <div style={{fontFamily:F}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <button onClick={()=>{setSelected(null);setAnswered(null);setCheckDone([])}} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'9px 16px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Pitch</button>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:900,color:T.text}}>{selected.icon} {selected.title}</div>
            <div style={{fontSize:11,color:T.sub}}>{selected.sport}{selected.minute?` · Min ${selected.minute}`:''}</div>
          </div>
          <div style={{background:`${selected.color}18`,border:`1px solid ${selected.color}30`,borderRadius:20,padding:'4px 12px',fontSize:9,color:selected.color,fontWeight:800}}>{selected.urgency}</div>
        </div>

        {/* Situation */}
        <div style={{background:`${selected.color}08`,backdropFilter:'blur(30px)',borderRadius:18,padding:'16px',marginBottom:14,border:`1px solid ${selected.color}22`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${selected.color}15,transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{fontSize:9,color:selected.color,fontWeight:700,letterSpacing:1,marginBottom:6}}>⚡ PITCH-SIDE SITUATION</div>
          <div style={{fontSize:13,color:T.sub,lineHeight:1.75}}>{selected.situation}</div>
        </div>

        {/* Checklist */}
        <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,padding:'14px',marginBottom:14,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:9,color:T.teal,fontWeight:700,letterSpacing:1,marginBottom:10}}>✅ PITCH-SIDE CHECKLIST</div>
          {selected.checks.map((c,i)=>(
            <div key={i} onClick={()=>setCheckDone(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i])} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:i<selected.checks.length-1?`1px solid rgba(255,255,255,0.06)`:'none',cursor:'pointer'}}>
              <div style={{width:20,height:20,borderRadius:6,border:`1.5px solid ${checkDone.includes(i)?T.green:T.border}`,background:checkDone.includes(i)?`${T.green}20`:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:T.green,flexShrink:0}}>
                {checkDone.includes(i)?'✓':''}
              </div>
              <span style={{fontSize:12,color:checkDone.includes(i)?T.text:T.sub}}>{c}</span>
            </div>
          ))}
        </div>

        {/* Question */}
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:12}}>What do you do?</div>

        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {selected.options.map((opt,i)=>{
            const isSel = answered===i
            const isCorrectOpt = opt.correct
            const done = answered !== null
            let bg=T.glass, border=T.border, opacity=1
            if(done){
              if(isCorrectOpt){bg='rgba(52,199,89,0.14)';border='#34C759'}
              else if(isSel){bg='rgba(255,59,48,0.14)';border='#FF3B30'}
              else opacity=0.4
            }
            return(
              <button key={i} onClick={()=>!done&&(setAnswered(i),isCorrectOpt&&onXP?.(25))} style={{
                background:bg,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
                border:`1.5px solid ${border}`,borderRadius:16,padding:'13px 16px',
                cursor:done?'default':'pointer',display:'flex',alignItems:'flex-start',
                gap:12,textAlign:'left',opacity,fontFamily:F,transition:'all 0.25s',
              }}>
                <div style={{width:30,height:30,borderRadius:9,flexShrink:0,
                  background:done&&isCorrectOpt?'rgba(52,199,89,0.20)':done&&isSel?'rgba(255,59,48,0.20)':'rgba(255,255,255,0.07)',
                  border:`1px solid ${done&&isCorrectOpt?'#34C75970':done&&isSel?'#FF3B3070':'rgba(255,255,255,0.12)'}`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,
                  color:done&&isCorrectOpt?'#34C759':done&&isSel?'#FF3B30':'rgba(238,246,250,0.45)',
                }}>
                  {done?(isCorrectOpt?'✓':isSel?'✗':String.fromCharCode(65+i)):String.fromCharCode(65+i)}
                </div>
                <div style={{fontSize:13,color:T.text,fontWeight:600,flex:1,lineHeight:1.5,paddingTop:2}}>{opt.text}</div>
              </button>
            )
          })}
        </div>

        {answered !== null && (
          <div>
            <div style={{background:isCorrect?'rgba(52,199,89,0.08)':'rgba(255,59,48,0.08)',border:`1.5px solid ${isCorrect?'#34C75930':'#FF3B3030'}`,borderRadius:18,padding:'16px',marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:900,color:isCorrect?T.green:T.red,marginBottom:8}}>
                {isCorrect?'✅ Correct! +25 XP':'❌ Incorrect'}
              </div>
              <div style={{fontSize:13,color:T.sub,lineHeight:1.7}}>{selected.options[answered].explanation}</div>
            </div>

            <div style={{background:`${T.gold}08`,border:`1px solid ${T.gold}22`,borderRadius:14,padding:'12px 14px',marginBottom:10}}>
              <div style={{fontSize:9,color:T.gold,fontWeight:700,letterSpacing:1,marginBottom:4}}>⭐ SPORTS MED PEARL</div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>{selected.pearl}</div>
            </div>

            <div style={{background:`${T.blue}08`,border:`1px solid ${T.blue}18`,borderRadius:12,padding:'10px 14px',marginBottom:14}}>
              <div style={{fontSize:10,color:T.blue,fontWeight:700}}>📋 Protocol: {selected.protocol}</div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowRTP(true)} style={{flex:1,padding:'13px',borderRadius:16,border:`1px solid ${T.green}35`,background:`${T.green}15`,color:T.green,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
                🏃 RTP Protocol
              </button>
              <button onClick={()=>{setSelected(null);setAnswered(null);setCheckDone([])}} style={{flex:1,padding:'13px',borderRadius:16,border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
                Next Case →
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{fontFamily:F}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:10,color:`${T.green}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>SPORTS MEDICINE</div>
        <div style={{fontSize:24,fontWeight:900,color:T.text,letterSpacing:-0.5}}>
          Pitch-Side <span style={{color:T.green}}>Doctor</span>
        </div>
        <div style={{fontSize:12,color:T.sub,marginTop:4,lineHeight:1.5}}>
          FIFA 2026 protocols · Real-time decisions · Return to play
        </div>
      </div>

      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
        {['FIFA Protocol','SCAT6','Return-to-Play','Heat Stroke','Cardiac SCA'].map(tag=>(
          <span key={tag} style={{background:`${T.green}15`,border:`1px solid ${T.green}30`,color:T.green,borderRadius:20,padding:'4px 12px',fontSize:10,fontWeight:700}}>{tag}</span>
        ))}
      </div>

      {/* RTP Calculator banner */}
      <div onClick={()=>setShowRTP(true)} style={{
        background:`linear-gradient(135deg,${T.blue}15,${T.teal}08)`,
        border:`1px solid ${T.blue}28`,borderRadius:16,padding:'14px',
        marginBottom:16,cursor:'pointer',display:'flex',alignItems:'center',gap:12,
      }}>
        <div style={{width:44,height:44,borderRadius:14,background:`${T.blue}18`,border:`1px solid ${T.blue}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🏃</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800,color:T.text}}>Return to Play Calculator</div>
          <div style={{fontSize:11,color:T.sub}}>FIFA/World Rugby 6-step RTP protocol</div>
        </div>
        <span style={{fontSize:18,color:T.blue}}>›</span>
      </div>

      <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>PITCH-SIDE SCENARIOS</div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {SCENARIOS.map(s=>(
          <div key={s.id} onClick={()=>setSelected(s)} style={{
            background:T.glass,backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',
            border:`1.5px solid ${s.color}28`,borderRadius:20,padding:'18px',
            cursor:'pointer',position:'relative',overflow:'hidden',
            boxShadow:`0 4px 20px rgba(0,0,0,0.15),0 0 14px ${s.color}10`,
          }}>
            <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${s.color}14,transparent 70%)`,pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
              <div style={{width:52,height:52,borderRadius:16,background:`${s.color}15`,border:`1.5px solid ${s.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:`0 0 16px ${s.color}25`}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:900,color:T.text,marginBottom:2}}>{s.title}</div>
                <div style={{fontSize:11,color:T.sub}}>{s.sport}{s.minute?` · Min ${s.minute}`:''}</div>
              </div>
              <div style={{background:`${s.color}18`,border:`1px solid ${s.color}30`,borderRadius:10,padding:'4px 10px',fontSize:9,color:s.color,fontWeight:800}}>{s.urgency}</div>
            </div>
            <div style={{fontSize:12,color:T.sub,lineHeight:1.6,marginBottom:12}}>{s.situation.substring(0,100)}...</div>
            <div style={{background:`linear-gradient(135deg,${s.color}18,${s.color}08)`,border:`1px solid ${s.color}28`,borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:12,fontWeight:700,color:T.text}}>Start Scenario</span>
              <span style={{fontSize:16,color:s.color}}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
