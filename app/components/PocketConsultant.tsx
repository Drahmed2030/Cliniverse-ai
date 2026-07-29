'use client'
import { useState, useRef, useEffect } from 'react'

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

// ── QUICK QUESTIONS ──
const QUICK = [
  { q:'STEMI vs NSTEMI management',        icon:'🫀', color:T.red    },
  { q:'Sepsis 3 criteria and bundle',       icon:'🦠', color:T.orange },
  { q:'DKA insulin protocol 2025',         icon:'💉', color:T.blue   },
  { q:'Hypertensive emergency treatment',  icon:'🩺', color:T.purple },
  { q:'PE risk stratification Wells score',icon:'🫁', color:T.teal   },
  { q:'Warfarin dose adjustment in AF',    icon:'💊', color:T.green  },
  { q:'CHADS2-VASc anticoagulation',       icon:'📊', color:T.gold   },
  { q:'Acute HF management ESC 2025',      icon:'💓', color:T.red    },
]

// ── GUIDELINES 2026 ──
const GUIDELINES = [
  { org:'AHA/ACC', year:2025, topic:'Heart Failure',           color:T.red,    icon:'💓', key:'Dapagliflozin/Empagliflozin for HFrEF, GDMT optimization' },
  { org:'ESC',     year:2025, topic:'Acute Coronary Syndromes',color:T.orange, icon:'🫀', key:'Ticagrelor preferred, early invasive strategy <24h' },
  { org:'WHO',     year:2025, topic:'Sepsis Bundle',           color:T.blue,   icon:'🦠', key:'1-hour bundle: cultures, antibiotics, 30ml/kg IVF, lactate' },
  { org:'NICE',    year:2025, topic:'T2DM Management',         color:T.green,  icon:'💉', key:'SGLT2i first-line with ASCVD, GLP-1 RA for weight loss' },
  { org:'ESC',     year:2024, topic:'AF Management',           color:T.purple, icon:'📊', key:'Rhythm control preferred early, edoxaban/apixaban preferred' },
  { org:'SRCP',    year:2025, topic:'Saudi Board Guidelines',  color:T.gold,   icon:'🇸🇦', key:'Saudi Vision 2030 health protocols, NCD management' },
]

interface Msg { role:'user'|'ai', text:string, time:string }

export default function PocketConsultant({ onXP }: { onXP?: (n:number)=>void }) {
  const [view, setView]       = useState<'chat'|'guidelines'>('chat')
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [selGuideline, setSelGuideline] = useState<typeof GUIDELINES[0]|null>(null)
  const [guideDetail, setGuideDetail]   = useState('')
  const [guideLoading, setGuideLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])

  const now = () => new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})

  const ask = async (question:string) => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setInput('')
    setMessages(m=>[...m,{role:'user',text:q,time:now()}])
    setLoading(true)

    try {
      const res = await fetch('/api/generate-case', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          specialty:'Clinical Consultation',
          prompt:`You are an expert medical consultant. Answer this clinical question with evidence-based, practical guidance. Include: key points, relevant guidelines (AHA/ESC/NICE/WHO 2024-2025), and clinical pearls. Be concise but complete.

Question: ${q}`,
          type:'consultation',
        })
      })
      const data = await res.json()
      const text = data.answer || data.content || data.case?.brief || 'I could not generate a response. Please try again.'
      setMessages(m=>[...m,{role:'ai',text,time:now()}])
      onXP?.(5)
    } catch {
      setMessages(m=>[...m,{role:'ai',text:'Connection error. Please check your internet and try again.',time:now()}])
    }
    setLoading(false)
  }

  const loadGuideline = async (g: typeof GUIDELINES[0]) => {
    setSelGuideline(g)
    setGuideLoading(true)
    setGuideDetail('')
    try {
      const res = await fetch('/api/generate-case', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          specialty:'Guidelines',
          prompt:`Summarize the ${g.org} ${g.year} guidelines for ${g.topic}. Include: key recommendations (Class I and II), major changes from previous guidelines, practical clinical pearls, and dosing where relevant. Format clearly with sections. Be practical for a clinician.`,
          type:'consultation',
        })
      })
      const data = await res.json()
      setGuideDetail(data.answer || data.content || data.case?.brief || 'Could not load guideline details.')
    } catch { setGuideDetail('Connection error.') }
    setGuideLoading(false)
  }

  return (
    <div style={{fontFamily:F,display:'flex',flexDirection:'column'}}>

      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:10,color:`${T.teal}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>AI CLINICAL CONSULTANT</div>
        <div style={{fontSize:22,fontWeight:900,color:T.text,letterSpacing:-0.5}}>
          Pocket <span style={{color:T.teal}}>Consultant</span>
        </div>
        <div style={{fontSize:12,color:T.sub,marginTop:4}}>Evidence-based · Guidelines 2025 · Instant AI answers</div>
      </div>

      {/* View toggle */}
      <div style={{display:'flex',gap:4,background:T.glass2,borderRadius:16,padding:4,marginBottom:16,border:`1px solid ${T.border}`}}>
        <button onClick={()=>setView('chat')} style={{
          flex:1,padding:'10px',border:'none',cursor:'pointer',borderRadius:12,fontFamily:F,fontWeight:700,fontSize:12,
          background:view==='chat'?T.glass:'transparent',
          color:view==='chat'?T.teal:T.muted,
          border:view==='chat'?`1px solid ${T.teal}25`:'1px solid transparent',transition:'all 0.2s',
        }}>💬 AI Consult</button>
        <button onClick={()=>setView('guidelines')} style={{
          flex:1,padding:'10px',border:'none',cursor:'pointer',borderRadius:12,fontFamily:F,fontWeight:700,fontSize:12,
          background:view==='guidelines'?T.glass:'transparent',
          color:view==='guidelines'?T.gold:T.muted,
          border:view==='guidelines'?`1px solid ${T.gold}25`:'1px solid transparent',transition:'all 0.2s',
        }}>📚 Guidelines 2025</button>
      </div>

      {/* ── CHAT VIEW ── */}
      {view==='chat' && (
        <div>
          {/* Quick questions */}
          {messages.length===0 && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>QUICK QUESTIONS</div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {QUICK.map((q,i)=>(
                  <button key={i} onClick={()=>ask(q.q)} style={{
                    background:T.glass,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
                    border:`1px solid ${q.color}22`,borderRadius:14,
                    padding:'11px 14px',cursor:'pointer',
                    display:'flex',alignItems:'center',gap:10,textAlign:'left',fontFamily:F,
                    transition:'all 0.2s',
                  }}>
                    <span style={{fontSize:16,flexShrink:0}}>{q.icon}</span>
                    <span style={{fontSize:12,color:T.sub,fontWeight:600,flex:1}}>{q.q}</span>
                    <span style={{fontSize:14,color:q.color}}>›</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div style={{maxHeight:420,overflowY:'auto',marginBottom:12,display:'flex',flexDirection:'column',gap:12}}>
              {messages.map((m,i)=>(
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start'}}>
                  <div style={{fontSize:8,color:T.muted,marginBottom:3,paddingLeft:4,paddingRight:4}}>
                    {m.role==='user'?'YOU':'🤖 AI CONSULTANT'} · {m.time}
                  </div>
                  <div style={{
                    maxWidth:'90%',padding:'12px 16px',borderRadius:18,
                    background:m.role==='user'?`linear-gradient(135deg,${T.teal},${T.blue})`:T.glass,
                    backdropFilter:m.role==='ai'?'blur(20px)':'none',
                    border:m.role==='ai'?`1px solid ${T.border}`:'none',
                    fontSize:13,color:T.text,lineHeight:1.75,
                    borderBottomRightRadius:m.role==='user'?4:18,
                    borderBottomLeftRadius:m.role==='ai'?4:18,
                    whiteSpace:'pre-wrap',
                  }}>{m.text}</div>
                </div>
              ))}
              {loading && (
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:18,borderBottomLeftRadius:4,padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:4,alignItems:'center'}}>
                      {[0,1,2].map(i=>(
                        <div key={i} style={{width:6,height:6,borderRadius:'50%',background:T.teal,opacity:0.8,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>
          )}

          {/* Input */}
          <div style={{display:'flex',gap:8}}>
            <input
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&ask(input)}
              placeholder="Ask any clinical question..."
              style={{
                flex:1,padding:'13px 16px',borderRadius:18,
                border:`1px solid ${T.border}`,
                background:T.glass,backdropFilter:'blur(20px)',
                color:T.text,fontSize:13,outline:'none',fontFamily:F,
              }}
            />
            <button onClick={()=>ask(input)} disabled={loading||!input.trim()} style={{
              padding:'13px 18px',borderRadius:18,border:'none',
              background:loading||!input.trim()?'rgba(0,196,180,0.2)':`linear-gradient(135deg,${T.teal},${T.blue})`,
              color:'#fff',fontSize:13,fontWeight:700,cursor:loading||!input.trim()?'not-allowed':'pointer',fontFamily:F,
              boxShadow:loading||!input.trim()?'none':`0 4px 16px ${T.teal}35`,
            }}>→</button>
          </div>

          {messages.length>0 && (
            <button onClick={()=>setMessages([])} style={{
              width:'100%',marginTop:8,padding:'10px',borderRadius:14,
              border:`1px solid ${T.border}`,background:T.glass2,
              color:T.muted,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F,
            }}>🔄 New Consultation</button>
          )}
        </div>
      )}

      {/* ── GUIDELINES VIEW ── */}
      {view==='guidelines' && (
        <div>
          {selGuideline ? (
            <div>
              <button onClick={()=>{setSelGuideline(null);setGuideDetail('')}} style={{
                background:T.glass,backdropFilter:'blur(20px)',border:`1px solid ${T.border}`,
                borderRadius:12,padding:'8px 14px',color:T.sub,fontSize:13,fontWeight:700,
                cursor:'pointer',fontFamily:F,marginBottom:14,
              }}>← Guidelines</button>

              <div style={{background:`${selGuideline.color}08`,border:`1px solid ${selGuideline.color}22`,borderRadius:18,padding:'16px',marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <span style={{fontSize:22}}>{selGuideline.icon}</span>
                  <div>
                    <div style={{fontSize:15,fontWeight:900,color:T.text}}>{selGuideline.org} {selGuideline.year}</div>
                    <div style={{fontSize:11,color:selGuideline.color,fontWeight:600}}>{selGuideline.topic}</div>
                  </div>
                </div>
                <div style={{fontSize:11,color:T.sub,marginTop:8,lineHeight:1.6}}>Key: {selGuideline.key}</div>
              </div>

              {guideLoading ? (
                <div style={{textAlign:'center',padding:'30px'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',border:`3px solid rgba(255,255,255,0.08)`,borderTop:`3px solid ${selGuideline.color}`,animation:'spin 0.8s linear infinite',margin:'0 auto 10px'}}/>
                  <div style={{fontSize:12,color:T.sub}}>Loading guidelines...</div>
                  <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : guideDetail ? (
                <div style={{background:T.glass,backdropFilter:'blur(30px)',borderRadius:18,padding:'16px',border:`1px solid ${selGuideline.color}20`}}>
                  <div style={{fontSize:9,color:selGuideline.color,fontWeight:700,letterSpacing:1,marginBottom:10}}>📋 GUIDELINE SUMMARY</div>
                  <div style={{fontSize:12,color:T.sub,lineHeight:1.85,whiteSpace:'pre-wrap'}}>{guideDetail}</div>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>CLINICAL GUIDELINES 2024-2025</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {GUIDELINES.map((g,i)=>(
                  <div key={i} onClick={()=>loadGuideline(g)} style={{
                    background:T.glass,backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',
                    border:`1.5px solid ${g.color}25`,borderRadius:18,padding:'14px',
                    cursor:'pointer',position:'relative',overflow:'hidden',
                    boxShadow:`0 4px 16px rgba(0,0,0,0.12),0 0 10px ${g.color}08`,
                    transition:'all 0.2s',
                  }}>
                    <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle,${g.color}12,transparent 70%)`,pointerEvents:'none'}}/>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:44,height:44,borderRadius:14,background:`${g.color}18`,border:`1px solid ${g.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{g.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:800,color:T.text}}>{g.org} {g.year}</span>
                          <span style={{fontSize:9,color:g.color,background:`${g.color}15`,border:`1px solid ${g.color}25`,borderRadius:6,padding:'1px 6px',fontWeight:700}}>{g.topic}</span>
                        </div>
                        <div style={{fontSize:11,color:T.muted,lineHeight:1.4}}>{g.key}</div>
                      </div>
                      <span style={{fontSize:18,color:g.color}}>›</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{background:`${T.gold}06`,border:`1px solid ${T.gold}15`,borderRadius:14,padding:'12px',marginTop:14,textAlign:'center'}}>
                <div style={{fontSize:10,color:T.gold,fontWeight:700,marginBottom:2}}>📅 LAST UPDATED</div>
                <div style={{fontSize:10,color:T.muted}}>Guidelines updated to 2024-2025 · AHA · ESC · NICE · WHO · SRCP</div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        input::placeholder{color:rgba(238,246,250,0.22)}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      `}</style>
    </div>
  )
}
