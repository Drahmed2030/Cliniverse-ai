'use client'
import { useState, useEffect, useRef } from 'react'
import WorldMap from './WorldMap'
import { supabase } from '../supabase'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731', red:'#EF4444',
  violet:'#7C3AED', textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const FALLBACK_CASE = {
  id:'fallback',
  title:'72M — Acute Chest Pain',
  summary:'72-year-old male, sudden onset chest pain, diaphoresis. ECG: ST elevation V1-V4. BP 90/60 mmHg. HR 110. Troponin rising.',
  tags:['STEMI','Cardiology','Critical'],
  img_query:'cardiac ECG stethoscope',
  options:[
    {key:'pci',     label:'Primary PCI',      emoji:'🫀', color:'#0D9488'},
    {key:'lytics',  label:'Thrombolytics',    emoji:'💉', color:'#1E40AF'},
    {key:'medical', label:'Medical Mx Only',  emoji:'💊', color:'#F5B731'},
  ]
}

const UNSPLASH: Record<string,string> = {
  'cardiac ECG stethoscope':   'https://images.unsplash.com/photo-1628348070889-cb656235b4eb?w=800&q=80',
  'brain neurology hospital':  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
  'ICU hospital critical care':'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
  'doctors collaboration':     'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80',
}

function VoteBar({pct,color}:{pct:number,color:string}) {
  return (
    <div style={{background:L.raised,borderRadius:99,height:7,overflow:'hidden',marginTop:6}}>
      <div style={{height:'100%',width:`${pct}%`,borderRadius:99,background:color,transition:'width 1s cubic-bezier(0.34,1.56,0.64,1)'}}/>
    </div>
  )
}

export default function ClinicalNexus({ onXP }:{ onXP?:(n:number)=>void }) {
  const [activeCase, setActiveCase]   = useState<any>(FALLBACK_CASE)
  const [votes, setVotes]             = useState<Record<string,number>>({})
  const [myVote, setMyVote]           = useState<string|null>(null)
  const [messages, setMessages]       = useState<any[]>([])
  const [input, setInput]             = useState('')
  const [name, setName]               = useState('Dr. Ahmed')
  const [specialty, setSpecialty]     = useState('Cardiology')
  const [sending, setSending]         = useState(false)
  const [loadingAI, setLoadingAI]     = useState(false)
  const [pulse, setPulse]             = useState(true)
  const [liveCount, setLiveCount]     = useState(0)
  const [tab, setTab]                 = useState<'vote'|'discuss'>('vote')
  const [recording, setRecording]     = useState(false)
  const [pressed, setPressed]         = useState<string|null>(null)
  const [timeLeft, setTimeLeft]       = useState('')
  const msgEndRef                     = useRef<HTMLDivElement>(null)
  const mediaRef                      = useRef<MediaRecorder|null>(null)
  const chunksRef                     = useRef<Blob[]>([])

  // Load active case
  useEffect(()=>{
    loadCase()
    const t = setInterval(()=>setPulse(p=>!p), 900)
    return ()=>clearInterval(t)
  },[])

  // Countdown timer
  useEffect(()=>{
    const t = setInterval(()=>{
      if(!activeCase?.expires_at) return
      const diff = new Date(activeCase.expires_at).getTime() - Date.now()
      if(diff<=0){ setTimeLeft('Expired'); return }
      const h = Math.floor(diff/3600000)
      const m = Math.floor((diff%3600000)/60000)
      const s = Math.floor((diff%60000)/1000)
      setTimeLeft(`${h}h ${m}m ${s}s`)
    },1000)
    return ()=>clearInterval(t)
  },[activeCase])

  const loadCase = async () => {
    try {
      const { data } = await supabase
        .from('nexus_cases')
        .select('*')
        .eq('active', true)
        .order('created_at',{ascending:false})
        .limit(1)
        .single()
      if(data){
        setActiveCase({...data, options: typeof data.options==='string' ? JSON.parse(data.options) : data.options})
        loadVotes(data.id)
        loadMessages(data.id)
        subscribeRealtime(data.id)
      }
    } catch { loadVotes('fallback'); loadMessages('fallback') }
  }

  const loadVotes = async (caseId:string) => {
    if(caseId==='fallback') return
    try {
      const { data } = await supabase.from('nexus_votes').select('option_key').eq('case_id',caseId)
      if(data){
        const counts:Record<string,number> = {}
        data.forEach(v=>{ counts[v.option_key]=(counts[v.option_key]||0)+1 })
        setVotes(counts)
        setLiveCount(data.length)
      }
    } catch {}
  }

  const loadMessages = async (caseId:string) => {
    if(caseId==='fallback') return
    try {
      const { data } = await supabase
        .from('nexus_messages')
        .select('*')
        .eq('case_id',caseId)
        .order('created_at',{ascending:true})
        .limit(50)
      if(data) setMessages(data)
    } catch {}
  }

  const subscribeRealtime = (caseId:string) => {
    // Votes realtime
    supabase.channel('nexus-votes')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'nexus_votes',filter:`case_id=eq.${caseId}`},
        payload=>{
          setVotes(prev=>({...prev,[payload.new.option_key]:(prev[payload.new.option_key]||0)+1}))
          setLiveCount(n=>n+1)
        })
      .subscribe()

    // Messages realtime
    supabase.channel('nexus-messages')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'nexus_messages',filter:`case_id=eq.${caseId}`},
        payload=>{ setMessages(prev=>[...prev, payload.new]) })
      .subscribe()
  }

  const handleVote = async (key:string) => {
    if(myVote) return
    setMyVote(key)
    setVotes(prev=>({...prev,[key]:(prev[key]||0)+1}))
    setLiveCount(n=>n+1)
    onXP?.(15)
    if(activeCase.id==='fallback') return
    try {
      await supabase.from('nexus_votes').insert([{
        case_id: activeCase.id,
        option_key: key,
        doctor_country: 'KSA',
      }])
    } catch {}
  }

  const sendMessage = async () => {
    if(!input.trim()) return
    setSending(true)
    const msg = {
      case_id: activeCase.id==='fallback' ? null : activeCase.id,
      doctor_name: name,
      doctor_specialty: specialty,
      content: input.trim(),
      is_ai: false,
      created_at: new Date().toISOString(),
    }
    setMessages(prev=>[...prev,{...msg,id:`local_${Date.now()}`}])
    setInput('')
    try {
      if(activeCase.id!=='fallback')
        await supabase.from('nexus_messages').insert([msg])
    } catch {}
    setSending(false)
    setTimeout(()=>msgEndRef.current?.scrollIntoView({behavior:'smooth'}),100)
    onXP?.(5)
  }

  const getAISummary = async () => {
    setLoadingAI(true)
    try {
      const votesSummary = activeCase.options.map((o:any)=>{
        const total = Object.values(votes).reduce((a:any,b:any)=>a+b,0)||1
        const pct = Math.round(((votes[o.key]||0)/total)*100)
        return `${o.label}: ${pct}%`
      }).join(', ')
      const res = await fetch('/api/medical-ai',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          question:`Clinical case: ${activeCase.title}. ${activeCase.summary}\n\nGlobal physician votes: ${votesSummary}\n\nProvide a brief evidence-based clinical pearl (3-4 sentences) discussing the management options and current guidelines. Be concise and educational.`,
          specialty:'General Medicine'
        })
      })
      const data = await res.json()
      const aiMsg = {
        case_id: activeCase.id==='fallback' ? null : activeCase.id,
        doctor_name:'🤖 AI Clinical Advisor',
        doctor_specialty:'Evidence-Based Medicine',
        content: data.answer || 'AI summary unavailable.',
        is_ai:true,
        created_at:new Date().toISOString(),
      }
      setMessages(prev=>[...prev,{...aiMsg,id:`ai_${Date.now()}`}])
      if(activeCase.id!=='fallback')
        await supabase.from('nexus_messages').insert([aiMsg])
      setTimeout(()=>msgEndRef.current?.scrollIntoView({behavior:'smooth'}),100)
    } catch {}
    setLoadingAI(false)
    onXP?.(10)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e=>chunksRef.current.push(e.data)
      mr.onstop = async ()=>{
        const blob = new Blob(chunksRef.current,{type:'audio/webm'})
        const voiceMsg = {
          case_id: activeCase.id==='fallback' ? null : activeCase.id,
          doctor_name: name,
          doctor_specialty: specialty,
          content:`🎙️ Voice note recorded (${Math.round(blob.size/1024)}KB) — tap to listen`,
          is_ai:false,
          created_at:new Date().toISOString(),
        }
        setMessages(prev=>[...prev,{...voiceMsg,id:`voice_${Date.now()}`}])
        stream.getTracks().forEach(t=>t.stop())
        onXP?.(10)
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
    } catch { alert('Microphone access denied') }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const totalVotes = Object.values(votes).reduce((a,b)=>a+b,0)
  const imgSrc = UNSPLASH[activeCase?.img_query] || UNSPLASH['doctors collaboration']

  return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:120,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif'}}>

      {/* Hero */}
      <div style={{position:'relative',height:220,overflow:'hidden'}}>
        <img src={imgSrc} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.88))'}}/>

        {/* LIVE badge */}
        <div style={{position:'absolute',top:16,left:16,display:'flex',alignItems:'center',gap:6,background:'rgba(15,23,42,0.6)',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:99,padding:'6px 14px'}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:pulse?'#10B981':'rgba(16,185,129,0.2)',boxShadow:pulse?'0 0 10px #10B981':'none',transition:smooth}}/>
          <span style={{fontSize:11,fontWeight:700,color:'white',letterSpacing:1.5}}>LIVE</span>
          <span style={{fontSize:11,color:'rgba(255,255,255,0.7)'}}>{liveCount} votes</span>
        </div>

        {/* Timer */}
        {timeLeft && timeLeft!=='Expired' && (
          <div style={{position:'absolute',top:16,right:16,background:'rgba(15,23,42,0.6)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:99,padding:'6px 14px'}}>
            <span style={{fontSize:11,fontWeight:700,color:L.amber}}>⏱ {timeLeft}</span>
          </div>
        )}

        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
            {activeCase?.tags?.map((t:string)=>(
              <span key={t} style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'white',background:'rgba(239,68,68,0.7)',borderRadius:99,padding:'3px 10px'}}>{t}</span>
            ))}
          </div>
          <div style={{fontSize:22,fontWeight:800,color:'white',letterSpacing:-0.4}}>{activeCase?.title}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:4}}>🌍 Global Case · Updated every 24h</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,margin:'14px 16px 0',background:L.raised,borderRadius:16,padding:4,border:`1px solid ${L.border}`}}>
        {(['vote','discuss'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            onMouseDown={()=>setPressed(t)} onMouseUp={()=>setPressed(null)}
            style={{
              flex:1,padding:'10px',borderRadius:12,border:'none',cursor:'pointer',
              background: tab===t ? L.gradient : 'transparent',
              color: tab===t ? 'white' : L.textMuted,
              fontSize:13,fontWeight:700,
              boxShadow: tab===t ? L.shadowGlow : 'none',
              transform: pressed===t ? 'scale(0.97)' : 'scale(1)',
              transition: spring,
            }}>
            {t==='vote' ? '🗳️ Vote' : `💬 Discuss (${messages.length})`}
          </button>
        ))}
      </div>

      <div style={{padding:'14px 16px 0'}}>

        {tab==='vote' && (
          <>
            {/* Vignette */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:`4px solid ${L.teal}`,borderRadius:20,padding:'16px 18px',marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:8}}>CLINICAL VIGNETTE</div>
              <div style={{fontSize:14,fontWeight:500,color:L.textPrimary,lineHeight:1.65}}>{activeCase?.summary}</div>
            </div>

            {/* Vote options */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:24,padding:20,marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:14}}>WHAT WOULD YOU DO?</div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {activeCase?.options?.map((opt:any)=>{
                  const pct = totalVotes>0 ? Math.round(((votes[opt.key]||0)/totalVotes)*100) : 0
                  const isChosen = myVote===opt.key
                  return (
                    <div key={opt.key}>
                      <button onClick={()=>handleVote(opt.key)}
                        onMouseDown={()=>setPressed(opt.key)} onMouseUp={()=>setPressed(null)}
                        style={{
                          width:'100%',textAlign:'left',cursor:myVote?'default':'pointer',
                          background:isChosen?`${opt.color}12`:L.raised,
                          border:`1.5px solid ${isChosen?opt.color:L.border}`,
                          borderRadius:14,padding:'13px 16px',
                          display:'flex',alignItems:'center',justifyContent:'space-between',
                          transform:pressed===opt.key?'scale(0.98)':'scale(1)',
                          transition:spring,
                          boxShadow:isChosen?`0 4px 12px ${opt.color}25`:'none',
                        }}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <span style={{fontSize:22}}>{opt.emoji}</span>
                          <span style={{fontSize:14,fontWeight:700,color:isChosen?opt.color:L.textPrimary}}>{opt.label}</span>
                        </div>
                        {myVote && (
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            {isChosen && <span style={{fontSize:14}}>✓</span>}
                            <span style={{fontSize:16,fontWeight:900,color:opt.color}}>{pct}%</span>
                            <span style={{fontSize:11,color:L.textMuted}}>({votes[opt.key]||0})</span>
                          </div>
                        )}
                      </button>
                      {myVote && <VoteBar pct={pct} color={opt.color}/>}
                    </div>
                  )
                })}
              </div>
              {!myVote && <div style={{marginTop:14,fontSize:12,color:L.textMuted,textAlign:'center'}}>Tap to vote — live results reveal after</div>}
              {myVote && (
                <div style={{marginTop:14,padding:'11px 16px',background:'rgba(13,148,136,0.08)',borderRadius:14,border:'1px solid rgba(13,148,136,0.2)',display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:18}}>🌐</span>
                  <span style={{fontSize:13,color:L.teal,fontWeight:700}}>+15 XP — Vote counted · {totalVotes} doctors voted</span>
                </div>
              )}
            </div>

            {/* Global stats */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:24,padding:20,marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:12}}>GLOBAL ROOM</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {[
                  {label:'Live Votes', value:totalVotes, color:L.teal},
                  {label:'Online Now', value:Math.max(liveCount,totalVotes), color:L.cobalt},
                  {label:'Countries',  value:'28+', color:L.sage},
                ].map(s=>(
                  <div key={s.label} style={{background:L.raised,borderRadius:16,padding:'12px 8px',textAlign:'center',border:`1px solid ${L.border}`}}>
                    <div style={{fontSize:20,fontWeight:900,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:10,fontWeight:700,color:L.textMuted,marginTop:2}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:16,padding:'12px 16px',marginBottom:16}}>
              <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
                ⚠️ Educational purposes only. Not a substitute for clinical judgment.
              </div>
            </div>
          </>
        )}

        {tab==='discuss' && (
          <>
            {/* Name/Specialty */}
            <div style={{display:'flex',gap:8,marginBottom:12}}>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"
                style={{flex:1,padding:'10px 14px',borderRadius:12,border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:13,outline:'none'}}/>
              <input value={specialty} onChange={e=>setSpecialty(e.target.value)} placeholder="Specialty"
                style={{flex:1,padding:'10px 14px',borderRadius:12,border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:13,outline:'none'}}/>
            </div>

            {/* AI Summary button */}
            <button onClick={getAISummary} disabled={loadingAI}
              onMouseDown={()=>setPressed('ai')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%',padding:'12px',borderRadius:14,marginBottom:12,cursor:'pointer',
                border:'1px solid rgba(124,58,237,0.25)',background:'rgba(124,58,237,0.08)',
                color:L.violet,fontSize:13,fontWeight:700,
                transform:pressed==='ai'?'scale(0.98)':'scale(1)',transition:spring,
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              }}>
              {loadingAI ? '⏳ AI thinking...' : '🤖 Get AI Clinical Pearl'}
            </button>

            {/* Messages */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,marginBottom:12,boxShadow:L.shadowSm,overflow:'hidden'}}>
              <div style={{maxHeight:320,overflowY:'auto',padding:14}}>
                {messages.length===0 ? (
                  <div style={{textAlign:'center',padding:'24px 0',color:L.textMuted}}>
                    <div style={{fontSize:28,marginBottom:8}}>💬</div>
                    <div style={{fontSize:14}}>Be the first to discuss this case</div>
                  </div>
                ) : messages.map((m,i)=>(
                  <div key={m.id||i} style={{display:'flex',gap:10,marginBottom:12}}>
                    <div style={{
                      width:36,height:36,borderRadius:11,flexShrink:0,
                      background:m.is_ai?'rgba(124,58,237,0.10)':'rgba(13,148,136,0.10)',
                      border:`1px solid ${m.is_ai?'rgba(124,58,237,0.2)':'rgba(13,148,136,0.2)'}`,
                      display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,
                    }}>
                      {m.is_ai?'🤖':'👨‍⚕️'}
                    </div>
                    <div style={{flex:1,background:L.raised,borderRadius:14,borderBottomLeftRadius:4,padding:'10px 12px',border:`1px solid ${L.border}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:700,color:m.is_ai?L.violet:L.textPrimary}}>{m.doctor_name}</span>
                        <span style={{fontSize:10,fontWeight:600,color:L.teal}}>{m.doctor_specialty}</span>
                      </div>
                      <div style={{fontSize:13,color:L.textSub,lineHeight:1.6}}>{m.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={msgEndRef}/>
              </div>
            </div>

            {/* Input row */}
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&sendMessage()}
                placeholder="Share your clinical thoughts..."
                style={{flex:1,padding:'12px 16px',borderRadius:14,border:`1px solid ${L.border}`,background:L.surface,color:L.textPrimary,fontSize:13,outline:'none'}}/>
              <button onClick={sendMessage} disabled={sending||!input.trim()}
                onMouseDown={()=>setPressed('send')} onMouseUp={()=>setPressed(null)}
                style={{
                  padding:'12px 18px',borderRadius:14,border:'none',cursor:'pointer',
                  background:!input.trim()?L.raised:L.gradient,
                  color:!input.trim()?L.textMuted:'white',
                  fontSize:13,fontWeight:700,
                  transform:pressed==='send'?'scale(0.95)':'scale(1)',transition:spring,
                }}>→</button>
            </div>

            {/* Voice button */}
            <button
              onClick={recording ? stopRecording : startRecording}
              onMouseDown={()=>setPressed('mic')} onMouseUp={()=>setPressed(null)}
              style={{
                width:'100%',padding:'13px',borderRadius:14,border:'none',cursor:'pointer',
                background:recording?'rgba(239,68,68,0.10)':L.raised,
                border:`1.5px solid ${recording?L.red:L.border}`,
                color:recording?L.red:L.textSub,
                fontSize:13,fontWeight:700,
                transform:pressed==='mic'?'scale(0.98)':'scale(1)',transition:spring,
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              }}>
              {recording ? (
                <>
                  <div style={{width:10,height:10,borderRadius:'50%',background:L.red,animation:'pulse 0.8s ease-in-out infinite'}}/>
                  Recording... Tap to stop
                </>
              ) : '🎙️ Voice Note'}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}
        * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
        input::placeholder { color:#94A3B8; }
      `}</style>
    </div>
  )
}
