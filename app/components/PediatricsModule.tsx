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

const CASES = [
  {
    id:'febrile', icon:'🌡️', title:'Febrile Seizure',
    age:2, weight:13, temp:'39.4°C',
    color:T.red,
    scenario:'A 2-year-old boy brought in by his mother after a 2-minute generalised tonic-clonic seizure at home. Now post-ictal. Temp 39.4°C. No previous seizures. Vaccinations up to date.',
    options:[
      {text:'Give IV Lorazepam immediately', correct:false, explanation:'Seizure has stopped — no acute benzodiazepine needed now.'},
      {text:'Examine child, check glucose, reassure parents', correct:true, explanation:'Simple febrile seizure — self-limiting. Examine, check BM, explain to parents, treat fever.'},
      {text:'Urgent CT head and LP', correct:false, explanation:'Not indicated for simple febrile seizure without meningism or focal signs.'},
      {text:'Admit for 24hr EEG monitoring', correct:false, explanation:'EEG not routinely indicated for first simple febrile seizure.'},
    ],
    pearl:'Simple febrile seizures: <15 min, generalised, once in 24h. Recurrence risk 30%. Parents need clear safety-netting.',
    dosing:[
      {drug:'Paracetamol', dose:'15 mg/kg', calc: (w:number) => `${Math.round(15*w)}mg`, route:'PO/PR Q4-6H'},
      {drug:'Ibuprofen', dose:'5-10 mg/kg', calc: (w:number) => `${Math.round(7.5*w)}mg`, route:'PO Q6-8H'},
    ]
  },
  {
    id:'croup', icon:'🫁', title:'Croup',
    age:3, weight:15, temp:'38.1°C',
    color:T.blue,
    scenario:'A 3-year-old girl with 2-day history of barking cough, hoarse voice, and stridor at rest. Woke parents at night. Mild intercostal recession. SpO2 97%. Westley score 4.',
    options:[
      {text:'High flow oxygen + urgent ENT referral', correct:false, explanation:'Moderate croup — oxygen only if SpO2 <92%. ENT only if severe or deteriorating.'},
      {text:'Dexamethasone 0.15mg/kg PO + nebulised adrenaline', correct:true, explanation:'Moderate croup: steroid reduces severity/duration. Nebulised adrenaline for rapid symptom relief.'},
      {text:'Oral amoxicillin 125mg TDS', correct:false, explanation:'Croup is viral — antibiotics not indicated.'},
      {text:'Reassure and discharge with safety-netting only', correct:false, explanation:'Stridor at rest = moderate croup requiring treatment before discharge.'},
    ],
    pearl:'Croup severity: Westley score. Mild (<2): oral dex only. Moderate (2-7): dex + neb adrenaline. Severe (>7): ICU.',
    dosing:[
      {drug:'Dexamethasone', dose:'0.15-0.6 mg/kg', calc:(w:number)=>`${Math.round(0.15*w*10)/10}mg`, route:'PO single dose'},
      {drug:'Neb Adrenaline', dose:'0.5ml/kg of 1:1000', calc:(w:number)=>`${Math.min(Math.round(0.5*w*10)/10, 5)}ml`, route:'Nebulised'},
    ]
  },
  {
    id:'dka_peds', icon:'💉', title:'Paediatric DKA',
    age:10, weight:35, temp:'37.2°C',
    color:T.orange,
    scenario:'A 10-year-old boy with known Type 1 diabetes presents with vomiting, abdominal pain, and drowsiness for 12 hours. Glucose 28mmol/L, pH 7.18, bicarbonate 8. Kussmaul breathing.',
    options:[
      {text:'Start insulin infusion immediately at 0.1u/kg/hr', correct:false, explanation:'In paediatric DKA: rehydrate first for at least 1 hour before starting insulin to avoid cerebral oedema.'},
      {text:'Fluid resuscitation first, then insulin after 1 hour', correct:true, explanation:'BSPED guidelines: 10ml/kg 0.9% NaCl bolus if shocked, then maintenance + deficit over 48h. Start insulin after 1h.'},
      {text:'Give sodium bicarbonate to correct acidosis', correct:false, explanation:'Bicarbonate contraindicated in paediatric DKA — increases risk of cerebral oedema.'},
      {text:'Discharge with insulin dose adjustment', correct:false, explanation:'pH 7.18 = severe DKA. Requires PICU-level monitoring.'},
    ],
    pearl:'Paediatric DKA: biggest risk = cerebral oedema. Slow rehydration over 48h. Avoid rapid glucose drop. Monitor neuro hourly.',
    dosing:[
      {drug:'0.9% NaCl bolus', dose:'10 ml/kg if shocked', calc:(w:number)=>`${10*w}ml`, route:'IV over 10-15 min'},
      {drug:'Insulin infusion', dose:'0.05-0.1 u/kg/hr', calc:(w:number)=>`${Math.round(0.05*w*10)/10}-${Math.round(0.1*w*10)/10} u/hr`, route:'IV (start after 1h)'},
    ]
  },
]

// ── PARENT TALK SIMULATOR ──
function ParentTalk({ caseName, onClose }: { caseName:string, onClose:()=>void }) {
  const [messages, setMessages] = useState([
    { role:'parent', text:`Doctor, what is wrong with my child? Is it serious? Should I be worried about ${caseName}? Can it happen again?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return
    const newMsg = { role:'doctor', text:input }
    setMessages(prev=>[...prev, newMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-6', max_tokens:300,
          system:`You are a worried parent of a child with ${caseName}. Respond naturally as a concerned parent. Ask follow-up questions. Be emotional but reasonable. Keep responses short (2-3 sentences max).`,
          messages:[...messages, newMsg].map(m=>({ role: m.role==='doctor'?'user':'assistant', content:m.text }))
        })
      })
      const data = await res.json()
      setMessages(prev=>[...prev, { role:'parent', text:data.content?.[0]?.text||'...' }])
    } catch {}
    setLoading(false)
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.90)',backdropFilter:'blur(12px)',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${T.border}`}}>
        <button onClick={onClose} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'8px 14px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Back</button>
        <div>
          <div style={{fontSize:15,fontWeight:900,color:T.text}}>👨‍👩‍👦 Talk to the Parent</div>
          <div style={{fontSize:11,color:T.sub}}>AI-simulated parent consultation</div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:12}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='doctor'?'flex-end':'flex-start'}}>
            <div style={{
              maxWidth:'80%', padding:'12px 16px', borderRadius:18,
              background: m.role==='doctor' ? `linear-gradient(135deg,${T.teal},${T.blue})` : T.glass,
              backdropFilter:'blur(20px)',
              border: m.role==='parent' ? `1px solid ${T.border}` : 'none',
              fontSize:13, color:T.text, lineHeight:1.6,
              borderBottomRightRadius: m.role==='doctor' ? 4 : 18,
              borderBottomLeftRadius: m.role==='parent' ? 4 : 18,
            }}>
              {m.role==='parent' && <div style={{fontSize:9,color:T.orange,fontWeight:700,marginBottom:4}}>👩 PARENT</div>}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',justifyContent:'flex-start'}}>
            <div style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:18,borderBottomLeftRadius:4,padding:'12px 16px',fontSize:13,color:T.muted}}>
              Typing...
            </div>
          </div>
        )}
      </div>

      <div style={{padding:'12px 20px',borderTop:`1px solid ${T.border}`,display:'flex',gap:10}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Type your response to the parent..."
          style={{flex:1,padding:'12px 16px',borderRadius:14,border:`1px solid ${T.border}`,background:T.glass,backdropFilter:'blur(20px)',color:T.text,fontSize:13,outline:'none',fontFamily:F}}
        />
        <button onClick={send} disabled={loading||!input.trim()} style={{padding:'12px 18px',borderRadius:14,border:'none',background:`linear-gradient(135deg,${T.teal},${T.blue})`,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>Send</button>
      </div>
      <style>{`input::placeholder{color:rgba(238,246,250,0.25)}`}</style>
    </div>
  )
}

// ── MAIN ──
export default function PediatricsModule({ onXP }: { onXP?: (n:number)=>void }) {
  const [selected, setSelected] = useState<typeof CASES[0]|null>(null)
  const [answered, setAnswered] = useState<number|null>(null)
  const [showParentTalk, setShowParentTalk] = useState(false)
  const [showDosing, setShowDosing] = useState(false)

  if (showParentTalk && selected) return <ParentTalk caseName={selected.title} onClose={()=>setShowParentTalk(false)}/>

  if (selected) {
    const isCorrect = answered !== null && selected.options[answered].correct
    return (
      <div style={{fontFamily:F}}>
        {/* Back */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <button onClick={()=>{setSelected(null);setAnswered(null);setShowDosing(false)}} style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:12,padding:'9px 16px',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>← Cases</button>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:T.text}}>{selected.icon} {selected.title}</div>
            <div style={{fontSize:11,color:T.sub}}>Age {selected.age}y · {selected.weight}kg · Temp {selected.temp}</div>
          </div>
        </div>

        {/* Patient card */}
        <div style={{background:`${selected.color}08`,backdropFilter:'blur(30px)',borderRadius:18,padding:'16px',marginBottom:14,border:`1px solid ${selected.color}22`,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${selected.color}18,transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{fontSize:9,color:selected.color,fontWeight:700,letterSpacing:1,marginBottom:6}}>🧸 CLINICAL SCENARIO</div>
          <div style={{fontSize:13,color:T.sub,lineHeight:1.75}}>{selected.scenario}</div>
        </div>

        {/* Age/weight badges */}
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {[
            {l:'Age',    v:`${selected.age} years`,    c:T.purple},
            {l:'Weight', v:`${selected.weight} kg`,    c:T.blue},
            {l:'Temp',   v:selected.temp,               c:T.red},
          ].map(b=>(
            <div key={b.l} style={{flex:1,background:T.glass,backdropFilter:'blur(20px)',borderRadius:12,padding:'8px 6px',textAlign:'center',border:`1px solid ${b.c}22`}}>
              <div style={{fontSize:13,fontWeight:900,color:b.c}}>{b.v}</div>
              <div style={{fontSize:8,color:T.muted,marginTop:2}}>{b.l}</div>
            </div>
          ))}
        </div>

        {/* Question */}
        <div style={{fontSize:14,fontWeight:800,color:T.text,marginBottom:12,lineHeight:1.5}}>
          What is the most appropriate immediate management?
        </div>

        {/* Options */}
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
              <button key={i} onClick={()=>!done&&(setAnswered(i),isCorrectOpt&&onXP?.(20))} style={{
                background:bg,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
                border:`1.5px solid ${border}`,borderRadius:16,padding:'13px 16px',
                cursor:done?'default':'pointer',display:'flex',alignItems:'flex-start',gap:12,
                textAlign:'left',opacity,fontFamily:F,transition:'all 0.25s',
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

        {/* Explanation */}
        {answered !== null && (
          <div>
            <div style={{background:isCorrect?'rgba(52,199,89,0.08)':'rgba(255,59,48,0.08)',border:`1.5px solid ${isCorrect?'#34C75930':'#FF3B3030'}`,borderRadius:18,padding:'16px',marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:900,color:isCorrect?T.green:T.red,marginBottom:8}}>
                {isCorrect?'✅ Correct! +20 XP':'❌ Incorrect'}
              </div>
              <div style={{fontSize:13,color:T.sub,lineHeight:1.7}}>{selected.options[answered].explanation}</div>
            </div>

            <div style={{background:`${T.gold}08`,border:`1px solid ${T.gold}22`,borderRadius:14,padding:'12px 14px',marginBottom:14}}>
              <div style={{fontSize:9,color:T.gold,fontWeight:700,letterSpacing:1,marginBottom:6}}>⭐ PAEDIATRIC PEARL</div>
              <div style={{fontSize:12,color:T.sub,lineHeight:1.6}}>{selected.pearl}</div>
            </div>

            {/* Weight-based dosing */}
            <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:16,padding:'14px',marginBottom:10,border:`1px solid ${T.blue}22`}}>
              <div style={{fontSize:9,color:T.blue,fontWeight:700,letterSpacing:1,marginBottom:10}}>💊 WEIGHT-BASED DOSING ({selected.weight}kg)</div>
              {selected.dosing.map((d,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:i<selected.dosing.length-1?`1px solid ${T.border}`:'none'}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:T.text}}>{d.drug}</div>
                    <div style={{fontSize:10,color:T.muted}}>{d.dose} · {d.route}</div>
                  </div>
                  <div style={{background:`${T.blue}18`,border:`1px solid ${T.blue}30`,borderRadius:10,padding:'4px 12px',fontSize:13,fontWeight:900,color:T.blue}}>
                    {d.calc(selected.weight)}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowParentTalk(true)} style={{
                flex:1,padding:'13px',borderRadius:16,border:`1px solid ${T.purple}35`,
                background:`${T.purple}15`,color:T.purple,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,
              }}>
                👨‍👩‍👦 Talk to Parent
              </button>
              <button onClick={()=>{setSelected(null);setAnswered(null)}} style={{
                flex:1,padding:'13px',borderRadius:16,border:`1px solid ${T.border}`,
                background:T.glass,backdropFilter:'blur(20px)',color:T.sub,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,
              }}>
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
      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:10,color:`${T.purple}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>PAEDIATRICS</div>
        <div style={{fontSize:24,fontWeight:900,color:T.text,letterSpacing:-0.5}}>
          The Little <span style={{color:T.purple}}>Patient</span>
        </div>
        <div style={{fontSize:12,color:T.sub,marginTop:4,lineHeight:1.5}}>
          Paediatric emergency cases · Weight-based dosing · Talk to the parent
        </div>
      </div>

      {/* Feature badges */}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
        {['Weight-Based Dosing','Parent Simulator','PEWS Score','Evidence-Based'].map(tag=>(
          <span key={tag} style={{background:`${T.purple}15`,border:`1px solid ${T.purple}30`,color:T.purple,borderRadius:20,padding:'4px 12px',fontSize:10,fontWeight:700}}>{tag}</span>
        ))}
      </div>

      {/* Cases */}
      <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>CLINICAL CASES</div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {CASES.map(c=>(
          <div key={c.id} onClick={()=>setSelected(c)} style={{
            background:T.glass,backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',
            border:`1.5px solid ${c.color}28`,borderRadius:20,padding:'18px',
            cursor:'pointer',position:'relative',overflow:'hidden',
            boxShadow:`0 4px 20px rgba(0,0,0,0.15),0 0 14px ${c.color}10`,
          }}>
            <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${c.color}14,transparent 70%)`,pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:10}}>
              <div style={{width:52,height:52,borderRadius:16,background:`${c.color}15`,border:`1.5px solid ${c.color}35`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:`0 0 16px ${c.color}25`}}>{c.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:900,color:T.text,marginBottom:2}}>{c.title}</div>
                <div style={{fontSize:11,color:T.sub}}>Age {c.age}y · {c.weight}kg · Temp {c.temp}</div>
              </div>
              <div style={{background:`${c.color}18`,border:`1px solid ${c.color}30`,borderRadius:10,padding:'4px 10px',fontSize:9,color:c.color,fontWeight:700}}>+20 XP</div>
            </div>
            <div style={{fontSize:12,color:T.sub,lineHeight:1.6,marginBottom:12}}>{c.scenario.substring(0,100)}...</div>
            <div style={{background:`linear-gradient(135deg,${c.color}18,${c.color}08)`,border:`1px solid ${c.color}28`,borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:12,fontWeight:700,color:T.text}}>Start Case</span>
              <span style={{fontSize:16,color:c.color}}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
