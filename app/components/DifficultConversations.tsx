'use client'
import { useState, useRef, useEffect } from 'react'

const C = {
  card: 'rgba(36,63,82,0.60)',
  border: 'rgba(0,196,180,0.25)',
  text: 'white',
  sub: 'rgba(255,255,255,0.45)',
  muted: 'rgba(255,255,255,0.25)',
}

interface Scenario {
  id: string
  title: string
  subtitle: string
  color: string
  icon: string
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced'
  protocol: string
  context: string
  patientPersona: string
  systemPrompt: string
  tips: string[]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'bad_news_cancer',
    title: 'Breaking Bad News',
    subtitle: 'New cancer diagnosis — patient alone',
    color: '#ff453a',
    icon: '🎗️',
    difficulty: 'Advanced',
    protocol: 'SPIKES Protocol',
    context: 'You are about to tell a 54-year-old patient that their biopsy confirms lung cancer. They came alone today thinking it was a routine follow-up.',
    patientPersona: 'You are a 54-year-old patient named James. You thought today was a routine appointment. You are initially shocked and in denial. You oscillate between asking detailed questions and becoming emotional. You have a wife and two teenage children. You are worried about work and finances. React naturally — sometimes confused, sometimes tearful, sometimes asking hard questions like "How long do I have?"',
    systemPrompt: `You are roleplaying as James, a 54-year-old patient receiving bad news about a cancer diagnosis. Stay completely in character throughout. React emotionally and realistically — shock, denial, fear, practical concerns about family. Ask difficult questions. Do not be artificially calm. After each doctor response, react as a real patient would. Keep responses to 2-4 sentences. Occasionally ask questions like "Am I going to die?" or "What about my kids?" or "Are you sure? Can we do more tests?" After 6-8 exchanges, if the doctor has communicated well using empathy, honesty and clear information, become slightly more settled. At the end of the conversation, provide brief feedback on the doctor's communication skills.`,
    tips: ['Use SPIKES: Setup, Perception, Invitation, Knowledge, Emotions, Strategy', 'Fire a "warning shot" before delivering news', 'Avoid medical jargon', 'Allow silence — don\'t rush to fill it', 'Acknowledge emotions before information'],
  },
  {
    id: 'angry_patient',
    title: 'The Angry Patient',
    subtitle: 'Long wait, missed diagnosis complaint',
    color: '#ff9f0a',
    icon: '😤',
    difficulty: 'Intermediate',
    protocol: 'HEARD Framework',
    context: 'A patient waited 4 hours in ED and is furious. They feel their chest pain was dismissed last week and they are now back with a confirmed NSTEMI.',
    patientPersona: 'You are Margaret, 62F, furious about being sent home with "muscle pain" last week when you now have a confirmed heart attack. You are loud, confrontational, and feel let down by the medical system. You threaten to make a complaint. You interrupt frequently. However underneath the anger you are scared. If the doctor listens genuinely, acknowledges the error without being defensive, you soften slightly. You want honesty and an apology, not excuses.',
    systemPrompt: `You are roleplaying as Margaret, a 62-year-old patient who is very angry about a missed diagnosis. Start very confrontational and upset. Use phrases like "You people don't listen!", "I'm going to complain about this!" etc. If the doctor becomes defensive, escalate. If they genuinely listen, acknowledge your feelings and apologise sincerely, gradually de-escalate. Ask about what went wrong and what happens now. Keep responses realistic and emotional. 2-4 sentences per response.`,
    tips: ['HEARD: Hear, Empathise, Apologise, Respond, Diagnose', 'Never become defensive', 'Let them vent first — listen fully', 'Acknowledge the error honestly', 'Focus on what happens next, not blame'],
  },
  {
    id: 'end_of_life',
    title: 'Goals of Care',
    subtitle: 'Discussing DNR with family',
    color: '#00C4B4',
    icon: '🕊️',
    difficulty: 'Advanced',
    protocol: 'REMAP Framework',
    context: 'An 82-year-old patient with advanced heart failure is deteriorating. You need to discuss resuscitation wishes with the family who are struggling to accept the prognosis.',
    patientPersona: 'You are the daughter of the patient, Sarah, 50s. You love your father deeply and cannot accept he is dying. You are in partial denial. You oscillate between asking "Do everything possible!" and moments of clarity when you ask what he would want. You feel guilt. You need the doctor to help you understand without feeling judged for wanting to fight. If the doctor shows genuine compassion and explains clearly, you become more open to discussing your father\'s values and wishes.',
    systemPrompt: `You are roleplaying as Sarah, the daughter of an 82-year-old patient with advanced heart failure. You are emotional and struggling to accept your father is dying. Sometimes say "I want everything done!" and "What if he improves?" React to the doctor's communication — if they are cold or use jargon, become more upset. If they show genuine empathy and help you think about your father's values and wishes, gradually open up. Ask what CPR really looks like. Ask if he will suffer. Keep responses 2-4 sentences.`,
    tips: ['REMAP: Reframe, Expect emotion, Map values, Align, Plan', 'Ask what patient would want, not family', 'Describe CPR realistically — not TV version', 'Focus on comfort and dignity, not "giving up"', 'Document carefully after the conversation'],
  },
  {
    id: 'capacity_refusal',
    title: 'Refusing Treatment',
    subtitle: 'Capacitous patient refusing blood transfusion',
    color: '#00C4B4',
    icon: '⚖️',
    difficulty: 'Advanced',
    protocol: 'Mental Capacity Act',
    context: 'A 35-year-old Jehovah\'s Witness with Hb 6.2 is refusing a blood transfusion after postpartum haemorrhage. She has capacity. Her husband is pressuring her to accept.',
    patientPersona: 'You are Rebecca, 35F, a Jehovah\'s Witness who has just had a baby and is bleeding. You are calm but firm about refusing blood. You understand the risks — you have thought about this your whole life. You feel your religious beliefs are your own choice. Your husband is in the room and is conflicted. If the doctor respects your autonomy and explains alternatives well, you are cooperative. If they pressure you or dismiss your beliefs, you become more upset and firm.',
    systemPrompt: `You are roleplaying as Rebecca, a 35-year-old Jehovah's Witness refusing blood transfusion. You are calm, clear, and have capacity. You have thought about this deeply for years. You understand you could die. You want the doctor to respect your autonomy. If they pressure you or question your beliefs dismissively, become more upset. If they acknowledge your right to choose and discuss alternatives (cell salvage, iron, erythropoietin), engage cooperatively. Occasionally mention your baby and husband. Keep responses 2-4 sentences.`,
    tips: ['Assess capacity: understand, retain, weigh, communicate', 'Respect autonomy — you cannot override a capacitous refusal', 'Discuss blood-sparing alternatives', 'Document consent/refusal thoroughly', 'Involve senior/legal team early'],
  },
  {
    id: 'mistake_disclosure',
    title: 'Disclosing a Medical Error',
    subtitle: 'Wrong dose administered — patient harm',
    color: '#ff6b35',
    icon: '⚠️',
    difficulty: 'Intermediate',
    protocol: 'Being Open Framework',
    context: 'A patient received 10x the prescribed insulin dose due to a prescribing error. They had a hypoglycaemic episode but recovered. You need to disclose this.',
    patientPersona: 'You are David, 45M, who just recovered from a frightening hypoglycaemic episode. You are confused about what happened. When told it was a medical error, you feel betrayed, scared, and then angry. You want to know: what happened exactly, why, and how to prevent it. If the doctor is honest, apologises sincerely and explains clearly without excuses, you are upset but reasonable. If they are vague or defensive, you become very angry and threaten legal action.',
    systemPrompt: `You are roleplaying as David, 45M, who experienced a medication error causing hypoglycaemia. Start confused — you don't know what happened. When informed it was an error, react with shock and then anger or hurt. Ask specific questions: "How did this happen?", "Could it happen again?", "Will there be consequences?". If the doctor is transparent, apologises clearly and explains next steps, gradually accept the apology. Keep responses 2-4 sentences. You are reasonable but hurt.`,
    tips: ['Being Open: acknowledge, apologise, explain, learn', 'Say sorry clearly — "I am sorry this happened"', 'Never speculate about blame prematurely', 'Explain the investigation process', 'Never deny or minimise — it destroys trust'],
  },
]

interface Message {
  role: 'doctor' | 'patient' | 'system'
  content: string
  timestamp: string
}

export default function DifficultConversations({ onXP }: { onXP?: (n:number)=>void }) {
  const [view, setView] = useState<'menu'|'briefing'|'simulation'|'debrief'>('menu')
  const [activeScenario, setActiveScenario] = useState<Scenario|null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnCount, setTurnCount] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState<number|null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startSimulation = (scenario: Scenario) => {
    setActiveScenario(scenario)
    setMessages([{
      role: 'system',
      content: `📋 SCENARIO: ${scenario.context}`,
      timestamp: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})
    }])
    setTurnCount(0)
    setInput('')
    setFeedback('')
    setRating(null)
    setView('simulation')

    // Initial patient message
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'patient',
        content: getOpeningLine(scenario.id),
        timestamp: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})
      }])
    }, 800)
  }

  const getOpeningLine = (id: string) => {
    const lines: Record<string,string> = {
      bad_news_cancer: "Doctor, thanks for seeing me. I've been a bit worried about the biopsy results... is everything okay?",
      angry_patient: "I have been waiting for 4 hours! And last week your colleague sent me home saying it was just muscle pain — and now look! I'm having a heart attack!",
      end_of_life: "Doctor, we need to talk about Dad. He's getting worse, isn't he? We want everything done. Everything. Whatever it takes.",
      capacity_refusal: "Doctor, I need you to understand something. I won't be accepting a blood transfusion. I know what my options are and this is my decision.",
      mistake_disclosure: "Hi doctor... I'm still feeling a bit shaky. Can you tell me what actually happened? The nurses weren't very clear.",
    }
    return lines[id] || "Hello, doctor."
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || !activeScenario) return
    const doctorMsg: Message = {
      role: 'doctor',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})
    }
    setMessages(prev => [...prev, doctorMsg])
    setInput('')
    setLoading(true)
    const newTurn = turnCount + 1
    setTurnCount(newTurn)

    // Build conversation history for API
    const history = [...messages, doctorMsg]
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'doctor' ? 'user' : 'assistant',
        content: m.content
      }))

    const isEnding = newTurn >= 8
    const endingInstruction = isEnding
      ? '\n\nThis is the final exchange. After responding as the patient, provide a brief evaluation (3-4 sentences) of the doctor\'s communication skills starting with "--- FEEDBACK ---". Rate key areas: empathy, clarity, protocol adherence.'
      : ''

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: activeScenario.systemPrompt + endingInstruction,
          messages: history
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''

      if (text.includes('--- FEEDBACK ---')) {
        const [patientPart, feedbackPart] = text.split('--- FEEDBACK ---')
        setMessages(prev => [...prev, {
          role: 'patient',
          content: patientPart.trim(),
          timestamp: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})
        }])
        setFeedback(feedbackPart.trim())
        setTimeout(() => {
          setView('debrief')
          onXP && onXP(80)
        }, 2000)
      } else {
        setMessages(prev => [...prev, {
          role: 'patient',
          content: text,
          timestamp: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'patient',
        content: '[Connection error — please try again]',
        timestamp: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})
      }])
    }
    setLoading(false)
  }

  const DIFF_COLOR: Record<string,string> = {
    Foundation:'#30d158', Intermediate:'#ff9f0a', Advanced:'#ff453a'
  }

  // ── MENU ──
  if (view === 'menu') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:'linear-gradient(135deg,rgba(255,69,58,0.12),rgba(0,196,180,0.08))',borderRadius:22,padding:'20px',marginBottom:16,border:'1px solid rgba(255,69,58,0.2)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-25,right:-25,width:110,height:110,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,69,58,0.2),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(255,69,58,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>💬 AI SIMULATOR</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:4}}>Difficult Conversations</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.7,marginBottom:10}}>Practise the hardest clinical conversations with an AI patient. Get real-time feedback on your communication skills.</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {['SPIKES','REMAP','HEARD','MCA','Being Open'].map(p=>(
            <span key={p} style={{fontSize:9,padding:'3px 10px',borderRadius:8,background:'rgba(36,63,82,0.65)',color:C.muted,border:'1px solid rgba(255,255,255,0.18)',fontWeight:700}}>{p}</span>
          ))}
        </div>
      </div>

      <div style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:'uppercase',fontWeight:700,marginBottom:10}}>Choose a Scenario</div>

      {SCENARIOS.map(s=>(
        <div key={s.id} onClick={()=>{setActiveScenario(s);setView('briefing')}}
          style={{background:C.card,borderRadius:20,padding:'16px',marginBottom:10,border:`1px solid ${s.color}20`,cursor:'pointer',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-15,right:-15,width:70,height:70,borderRadius:'50%',background:`${s.color}08`,filter:'blur(12px)',pointerEvents:'none'}}/>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
            <div style={{width:50,height:50,borderRadius:16,background:`${s.color}15`,border:`1px solid ${s.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0,boxShadow:`0 4px 16px ${s.color}20`}}>{s.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:2}}>{s.title}</div>
              <div style={{fontSize:11,color:C.sub}}>{s.subtitle}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:9,padding:'3px 10px',borderRadius:8,background:`${DIFF_COLOR[s.difficulty]}18`,color:DIFF_COLOR[s.difficulty],fontWeight:800,border:`1px solid ${DIFF_COLOR[s.difficulty]}30`,marginBottom:4}}>{s.difficulty}</div>
              <div style={{fontSize:9,color:C.muted,fontWeight:600}}>{s.protocol}</div>
            </div>
          </div>
          <div style={{background:'rgba(36,63,82,0.40)',borderRadius:12,padding:'10px 12px',border:'1px solid rgba(36,63,82,0.65)'}}>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',lineHeight:1.5}}>{s.context.slice(0,120)}...</div>
          </div>
        </div>
      ))}
    </div>
  )

  // ── BRIEFING ──
  if (view === 'briefing' && activeScenario) {
    const s = activeScenario
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Back</button>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>{s.icon} {s.title}</div><div style={{fontSize:11,color:C.sub}}>{s.protocol}</div></div>
        </div>

        <div style={{background:`${s.color}10`,borderRadius:20,padding:'18px',marginBottom:12,border:`1px solid ${s.color}25`}}>
          <div style={{fontSize:10,color:s.color,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>📋 SCENARIO BRIEFING</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.9)',lineHeight:1.8,fontWeight:500}}>{s.context}</div>
        </div>

        <div style={{background:C.card,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:'#ffd60a',fontWeight:700,marginBottom:10,letterSpacing:0.5}}>💡 KEY TIPS — {s.protocol}</div>
          {s.tips.map((tip,i)=>(
            <div key={i} style={{display:'flex',gap:10,marginBottom:8,paddingBottom:8,borderBottom:i<s.tips.length-1?'1px solid rgba(36,63,82,0.50)':'none'}}>
              <div style={{width:22,height:22,borderRadius:7,background:`${s.color}18`,border:`1px solid ${s.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:900,color:s.color,flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.5}}>{tip}</div>
            </div>
          ))}
        </div>

        <div style={{background:'rgba(255,214,10,0.08)',borderRadius:14,padding:'12px 14px',marginBottom:16,border:'1px solid rgba(255,214,10,0.2)'}}>
          <div style={{fontSize:12,color:'rgba(255,214,10,0.9)',lineHeight:1.6}}>⚠️ The AI patient will react realistically — emotionally, unpredictably. You have ~8 exchanges. Type your responses as you would speak to a real patient.</div>
        </div>

        <button onClick={()=>startSimulation(s)}
          style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${s.color},${s.color}bb)`,color:'white',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:`0 8px 32px ${s.color}44`}}>
          💬 Begin Conversation
        </button>
      </div>
    )
  }

  // ── SIMULATION ──
  if (view === 'simulation' && activeScenario) {
    const s = activeScenario
    const progress = Math.min((turnCount / 8) * 100, 100)

    return (
      <div style={{fontFamily:'-apple-system,sans-serif',display:'flex',flexDirection:'column',height:'calc(100vh - 160px)',minHeight:500}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,flexShrink:0}}>
          <button onClick={()=>setView('menu')} style={{background:'rgba(0,196,180,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#6ee7e1',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>⏹ End</button>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:800,color:C.text}}>{s.icon} {s.title}</div>
            <div style={{height:3,background:'rgba(36,63,82,0.65)',borderRadius:2,overflow:'hidden',marginTop:4}}>
              <div style={{height:'100%',width:`${progress}%`,background:`linear-gradient(90deg,${s.color},${s.color}aa)`,borderRadius:2,transition:'width 0.4s',boxShadow:`0 0 8px ${s.color}88`}}/>
            </div>
          </div>
          <div style={{fontSize:11,color:C.muted,fontWeight:600}}>Turn {turnCount}/8</div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:'auto',marginBottom:10,display:'flex',flexDirection:'column',gap:10,paddingRight:4}}>
          {messages.map((msg,i)=>(
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:msg.role==='doctor'?'flex-end':'flex-start'}}>
              {msg.role==='system'&&(
                <div style={{background:'rgba(255,214,10,0.08)',borderRadius:12,padding:'10px 14px',border:'1px solid rgba(255,214,10,0.2)',maxWidth:'90%',alignSelf:'center'}}>
                  <div style={{fontSize:11,color:'rgba(255,214,10,0.8)',lineHeight:1.5}}>{msg.content}</div>
                </div>
              )}
              {msg.role==='patient'&&(
                <div style={{maxWidth:'80%'}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:3,marginLeft:4}}>{s.icon} Patient · {msg.timestamp}</div>
                  <div style={{background:`${s.color}12`,borderRadius:'18px 18px 18px 4px',padding:'12px 14px',border:`1px solid ${s.color}20`}}>
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.9)',lineHeight:1.7}}>{msg.content}</div>
                  </div>
                </div>
              )}
              {msg.role==='doctor'&&(
                <div style={{maxWidth:'80%'}}>
                  <div style={{fontSize:9,color:C.muted,marginBottom:3,marginRight:4,textAlign:'right'}}>You (Doctor) · {msg.timestamp}</div>
                  <div style={{background:'rgba(0,196,180,0.25)',borderRadius:'18px 18px 4px 18px',padding:'12px 14px',border:'1px solid rgba(0,196,180,0.25)'}}>
                    <div style={{fontSize:13,color:'white',lineHeight:1.7}}>{msg.content}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading&&(
            <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
              <div style={{background:`${s.color}12`,borderRadius:'18px 18px 18px 4px',padding:'12px 16px',border:`1px solid ${s.color}20`}}>
                <div style={{display:'flex',gap:4}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:8,height:8,borderRadius:'50%',background:s.color,opacity:0.6,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input */}
        <div style={{flexShrink:0,display:'flex',gap:8,background:'rgba(15,5,35,0.95)',paddingTop:8}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}}}
            placeholder="Type your response to the patient..."
            rows={2}
            style={{flex:1,padding:'12px 14px',borderRadius:16,border:`1px solid ${C.border}`,background:'rgba(36,63,82,0.50)',color:'white',fontSize:13,outline:'none',resize:'none',lineHeight:1.5}}/>
          <button onClick={sendMessage} disabled={loading||!input.trim()}
            style={{width:52,borderRadius:16,border:'none',background:loading||!input.trim()?'rgba(139,92,246,0.3)':'linear-gradient(135deg,#00C4B4,#0a84ff)',color:'white',fontSize:18,cursor:loading||!input.trim()?'not-allowed':'pointer',flexShrink:0,boxShadow:loading||!input.trim()?'none':'0 4px 16px rgba(139,92,246,0.4)'}}>→</button>
        </div>
        <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}} textarea::placeholder{color:rgba(255,255,255,0.2)}`}</style>
      </div>
    )
  }

  // ── DEBRIEF ──
  if (view === 'debrief' && activeScenario) {
    const s = activeScenario
    return (
      <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
        <div style={{background:`linear-gradient(145deg,${s.color}15,rgba(0,196,180,0.08))`,borderRadius:24,padding:'24px 20px',marginBottom:16,border:`1px solid ${s.color}25`,textAlign:'center'}}>
          <div style={{fontSize:52,marginBottom:12,filter:`drop-shadow(0 0 20px ${s.color}80)`}}>🎯</div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:4}}>Simulation Complete</div>
          <div style={{fontSize:14,color:s.color,fontWeight:700,marginBottom:4}}>{s.title}</div>
          <div style={{fontSize:12,color:C.sub}}>{turnCount} exchanges · {s.protocol}</div>
        </div>

        {feedback&&(
          <div style={{background:'linear-gradient(135deg,rgba(0,196,180,0.1),rgba(10,132,255,0.06))',borderRadius:20,padding:'18px',marginBottom:14,border:'1px solid rgba(139,92,246,0.3)'}}>
            <div style={{fontSize:10,color:'#00C4B4',fontWeight:700,marginBottom:10,letterSpacing:0.5}}>🤖 AI FEEDBACK ON YOUR COMMUNICATION</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.85,whiteSpace:'pre-line'}}>{feedback}</div>
          </div>
        )}

        <div style={{background:C.card,borderRadius:18,padding:'16px',marginBottom:14,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:'#ffd60a',fontWeight:700,marginBottom:10,letterSpacing:0.5}}>💡 {s.protocol} — KEY POINTS</div>
          {s.tips.map((tip,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginBottom:6}}>
              <span style={{color:'#30d158',flexShrink:0}}>✓</span>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.75)',lineHeight:1.5}}>{tip}</span>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>startSimulation(s)} style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${s.color}30`,background:`${s.color}10`,color:s.color,fontSize:14,fontWeight:700,cursor:'pointer'}}>🔄 Retry</button>
          <button onClick={()=>setView('menu')} style={{flex:1,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#00C4B4,#ff453a)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 20px rgba(139,92,246,0.4)'}}>💬 Scenarios</button>
        </div>
      </div>
    )
  }

  return null
}
