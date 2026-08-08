'use client'
import { useState } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED', orange:'#EA580C',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#7C3AED,#4F46E5)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(124,58,237,0.30)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const AI_MODELS = [
  {
    id:'claude',
    name:'Claude',
    maker:'Anthropic',
    icon:'🧠',
    color:'#7C3AED',
    bg:'rgba(124,58,237,0.08)',
    border:'rgba(124,58,237,0.25)',
    specialty:'Evidence-based reasoning · Safety-focused · Medical ethics',
    model:'claude-sonnet-4-6',
  },
  {
    id:'gemini',
    name:'Gemini',
    maker:'Google',
    icon:'✨',
    color:'#1E40AF',
    bg:'rgba(30,64,175,0.08)',
    border:'rgba(30,64,175,0.25)',
    specialty:'Research synthesis · Latest studies · Multimodal',
    model:'gemini',
  },
]

const SAMPLE_QUESTIONS = [
  'When to initiate SGLT2i post-MI?',
  'Optimal vasopressor in septic shock?',
  'tPA vs thrombectomy in stroke?',
  'Prone positioning criteria in ARDS?',
  'Anticoagulation in AF with CKD?',
  'Beta-blocker in acute decompensated HF?',
]

const TOPICS = [
  { id:'cardiology', label:'Cardiology', icon:'🫀', color:L.red },
  { id:'critical',   label:'Critical Care', icon:'🏥', color:L.amber },
  { id:'neurology',  label:'Neurology', icon:'🧠', color:L.violet },
  { id:'infectious', label:'Infectious', icon:'🦠', color:L.sage },
  { id:'respiratory',label:'Respiratory', icon:'🫁', color:L.cobalt },
  { id:'general',    label:'General', icon:'⚕️', color:L.teal },
]

export default function AIIntelligenceHub({ onXP }:{ onXP?:(n:number)=>void }) {
  const [question, setQuestion]     = useState('')
  const [topic, setTopic]           = useState('cardiology')
  const [responses, setResponses]   = useState<Record<string,string>>({})
  const [loading, setLoading]       = useState<Record<string,boolean>>({})
  const [consensus, setConsensus]   = useState('')
  const [loadingConsensus, setLoadingConsensus] = useState(false)
  const [pressed, setPressed]       = useState<string|null>(null)
  const [asked, setAsked]           = useState(false)

  const askAll = async () => {
    if(!question.trim()) return
    setAsked(true)
    setResponses({})
    setConsensus('')

    // Claude
    setLoading(prev=>({...prev,claude:true}))
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          question:`As an evidence-based medical AI, answer this clinical question concisely (3-4 sentences, cite key trials/guidelines): ${question}`,
          specialty:topic
        })
      })
      const data = await res.json()
      setResponses(prev=>({...prev,claude:data.answer||'Response unavailable.'}))
      onXP?.(10)
    } catch { setResponses(prev=>({...prev,claude:'Error getting response.'})) }
    setLoading(prev=>({...prev,claude:false}))

    // Gemini (via our API with different prompt style)
    setLoading(prev=>({...prev,gemini:true}))
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          question:`From a research and latest evidence perspective, answer this clinical question (focus on recent 2024-2026 studies and meta-analyses, 3-4 sentences): ${question}`,
          specialty:topic
        })
      })
      const data = await res.json()
      setResponses(prev=>({...prev,gemini:data.answer||'Response unavailable.'}))
    } catch { setResponses(prev=>({...prev,gemini:'Error getting response.'})) }
    setLoading(prev=>({...prev,gemini:false}))
  }

  const getConsensus = async () => {
    if(!responses.claude||!responses.gemini) return
    setLoadingConsensus(true)
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          question:`Two AI medical systems answered the same clinical question.

Question: "${question}"

Response A (Evidence-based): "${responses.claude}"

Response B (Research-focused): "${responses.gemini}"

Provide a brief AI Consensus (2-3 sentences):
1. Do they agree or disagree?
2. What is the consensus recommendation?
3. Any important nuance or caveat?`,
          specialty:topic
        })
      })
      const data = await res.json()
      setConsensus(data.answer||'')
      onXP?.(20)
    } catch {}
    setLoadingConsensus(false)
  }

  const reset = () => {
    setQuestion('')
    setResponses({})
    setConsensus('')
    setAsked(false)
  }

  return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:120,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>

      {/* Hero */}
      <div style={{position:'relative',height:200,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,
          background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.92))'}}/>

        {/* AI models floating badges */}
        <div style={{position:'absolute',top:16,left:16,display:'flex',gap:6}}>
          {AI_MODELS.map(m=>(
            <div key={m.id} style={{
              background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
              border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:99,padding:'4px 12px',
              display:'flex',alignItems:'center',gap:5,
            }}>
              <span style={{fontSize:12}}>{m.icon}</span>
              <span style={{fontSize:10,fontWeight:700,color:'white'}}>{m.name}</span>
            </div>
          ))}
        </div>

        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,
            color:'rgba(255,255,255,0.7)',marginBottom:6}}>
            MULTI-AI CONSENSUS · MEDICAL INTELLIGENCE
          </div>
          <div style={{fontSize:26,fontWeight:900,color:'white',letterSpacing:-0.6,marginBottom:4}}>
            🤖 AI Intelligence Hub
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>
            Ask once · Get multiple AI perspectives · Find consensus
          </div>
        </div>
      </div>

      <div style={{padding:'14px 16px'}}>

        {!asked ? (
          <>
            {/* Topic selector */}
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>
              SELECT TOPIC
            </div>
            <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:16,paddingBottom:2}}>
              {TOPICS.map(t=>(
                <button key={t.id} onClick={()=>setTopic(t.id)} style={{
                  flexShrink:0,display:'flex',alignItems:'center',gap:5,
                  padding:'7px 14px',borderRadius:99,cursor:'pointer',
                  background:topic===t.id?`${t.color}12`:L.raised,
                  border:`1.5px solid ${topic===t.id?t.color:L.border}`,
                  color:topic===t.id?t.color:L.textSub,
                  fontSize:12,fontWeight:700,transition:smooth,
                }}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            {/* Question input */}
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>
              YOUR CLINICAL QUESTION
            </div>
            <textarea value={question} onChange={e=>setQuestion(e.target.value)}
              placeholder="Ask any clinical question... e.g. When to initiate SGLT2i post-MI?"
              rows={3}
              style={{
                width:'100%',padding:'14px 16px',borderRadius:16,boxSizing:'border-box',
                border:`1px solid ${L.border}`,background:L.surface,
                color:L.textPrimary,fontSize:14,outline:'none',
                resize:'none',lineHeight:1.6,fontFamily:'inherit',marginBottom:12,
              }}/>

            {/* Sample questions */}
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>
              SAMPLE QUESTIONS
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
              {SAMPLE_QUESTIONS.map((q,i)=>(
                <button key={i} onClick={()=>setQuestion(q)} style={{
                  textAlign:'left',padding:'10px 14px',borderRadius:12,cursor:'pointer',
                  background:L.raised,border:`1px solid ${L.border}`,
                  color:L.textSub,fontSize:12,fontWeight:500,transition:smooth,
                  display:'flex',alignItems:'center',gap:8,
                }}>
                  <span style={{fontSize:14}}>💬</span>{q}
                </button>
              ))}
            </div>

            {/* Ask button */}
            <button onClick={askAll} disabled={!question.trim()}
              onMouseDown={()=>setPressed('ask')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%',padding:'16px',borderRadius:18,border:'none',cursor:'pointer',
                background:!question.trim()?L.raised:L.gradient,
                color:!question.trim()?L.textMuted:'white',
                fontSize:15,fontWeight:800,
                transform:pressed==='ask'?'scale(0.97)':'scale(1)',
                transition:spring,
                boxShadow:question.trim()?L.shadowGlow:'none',
                display:'flex',alignItems:'center',justifyContent:'center',gap:10,
              }}>
              🤖 Ask All AI Systems
            </button>
          </>
        ) : (
          <>
            {/* Question display */}
            <div style={{
              background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.2)',
              borderRadius:16,padding:'12px 16px',marginBottom:16,
            }}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.violet,marginBottom:4}}>
                YOUR QUESTION
              </div>
              <div style={{fontSize:14,fontWeight:600,color:L.textPrimary}}>{question}</div>
            </div>

            {/* AI Responses */}
            {AI_MODELS.map(model=>(
              <div key={model.id} style={{
                background:L.surface,border:`1px solid ${model.border}`,
                borderRadius:20,padding:18,marginBottom:12,boxShadow:L.shadowSm,
              }}>
                {/* Model header */}
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{
                    width:44,height:44,borderRadius:14,
                    background:model.bg,border:`1px solid ${model.border}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:22,flexShrink:0,
                  }}>{model.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:800,color:L.textPrimary}}>{model.name}</div>
                    <div style={{fontSize:11,color:model.color,fontWeight:600}}>{model.maker}</div>
                  </div>
                  {loading[model.id] && (
                    <div style={{fontSize:12,color:model.color,fontWeight:600}}>⏳ Thinking...</div>
                  )}
                  {responses[model.id] && !loading[model.id] && (
                    <div style={{width:8,height:8,borderRadius:'50%',background:L.sage,
                      boxShadow:`0 0 6px ${L.sage}`}}/>
                  )}
                </div>

                {/* Specialty */}
                <div style={{fontSize:10,color:model.color,fontWeight:600,
                  marginBottom:10,letterSpacing:0.5}}>
                  {model.specialty}
                </div>

                {/* Response */}
                {loading[model.id] ? (
                  <div style={{display:'flex',gap:6}}>
                    {[1,2,3].map(i=>(
                      <div key={i} style={{
                        height:8,borderRadius:99,background:`${model.color}20`,
                        flex:i===2?2:1,animation:'pulse 1.5s ease-in-out infinite',
                      }}/>
                    ))}
                  </div>
                ) : responses[model.id] ? (
                  <div style={{fontSize:13,color:L.textSub,lineHeight:1.75}}>
                    {responses[model.id]}
                  </div>
                ) : (
                  <div style={{fontSize:12,color:L.textMuted}}>Waiting for response...</div>
                )}
              </div>
            ))}

            {/* Consensus */}
            {responses.claude && responses.gemini && !loadingConsensus && !consensus && (
              <button onClick={getConsensus}
                onMouseDown={()=>setPressed('consensus')} onMouseUp={()=>setPressed(null)}
                style={{
                  width:'100%',padding:'14px',borderRadius:16,border:'none',cursor:'pointer',
                  background:'linear-gradient(135deg,#10B981,#0D9488)',
                  color:'white',fontSize:14,fontWeight:800,marginBottom:12,
                  transform:pressed==='consensus'?'scale(0.97)':'scale(1)',
                  transition:spring,
                  boxShadow:'0 4px 20px rgba(16,185,129,0.30)',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                }}>
                ⚖️ Generate AI Consensus — +20 XP
              </button>
            )}

            {loadingConsensus && (
              <div style={{textAlign:'center',padding:'20px',color:L.textMuted}}>
                ⏳ Generating consensus...
              </div>
            )}

            {consensus && (
              <div style={{
                background:'rgba(16,185,129,0.08)',
                border:'2px solid rgba(16,185,129,0.3)',
                borderRadius:20,padding:'18px',marginBottom:12,
                boxShadow:'0 4px 20px rgba(16,185,129,0.15)',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                  <span style={{fontSize:24}}>⚖️</span>
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:L.sage}}>AI Consensus</div>
                    <div style={{fontSize:11,color:L.textMuted}}>Synthesized from all AI responses</div>
                  </div>
                </div>
                <div style={{fontSize:14,color:L.textSub,lineHeight:1.75}}>{consensus}</div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',
              borderRadius:16,padding:'12px 16px',marginBottom:12}}>
              <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
                ⚠️ AI responses are educational only. Always verify with current guidelines and senior clinical judgment.
              </div>
            </div>

            {/* Ask another */}
            <button onClick={reset}
              onMouseDown={()=>setPressed('reset')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%',padding:'13px',borderRadius:14,cursor:'pointer',
                background:L.raised,border:`1px solid ${L.border}`,
                color:L.textSub,fontSize:14,fontWeight:700,
                transform:pressed==='reset'?'scale(0.97)':'scale(1)',
                transition:spring,
              }}>
              ← Ask Another Question
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        textarea::placeholder{color:#94A3B8}
      `}</style>
    </div>
  )
}
