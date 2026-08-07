'use client'
import { useState, useEffect, useRef } from 'react'
import WorldMap from './WorldMap'
import { supabase } from '../supabase'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731', red:'#EF4444',
  violet:'#7C3AED', textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#0D9488,#1E40AF)',
  gradientRed:'linear-gradient(135deg,#EF4444,#F97316)',
  gradientViolet:'linear-gradient(135deg,#7C3AED,#4F46E5)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(13,148,136,0.25)',
  shadowRed:'0 4px 20px rgba(239,68,68,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const COUNTRIES = ['🇸🇦','🇦🇪','🇬🇧','🇺🇸','🇪🇬','🇯🇴','🇩🇪','🇫🇷','🇮🇳','🇨🇦','🇦🇺','🇧🇷','🇯🇵','🇨🇳','🇰🇼','🇶🇦']
const SPECIALTIES = ['Cardiology','Emergency','Internal Medicine','Neurology','Surgery','Pediatrics','Radiology','Critical Care']

const FALLBACK_Q = {
  id:'fallback',
  question:'A 58M presents with crushing chest pain, ST elevation V1-V4, BP 90/60. First drug to give?',
  options:[
    {key:'aspirin',   label:'Aspirin 300mg',     emoji:'💊'},
    {key:'morphine',  label:'Morphine 10mg',      emoji:'💉'},
    {key:'nitrate',   label:'Sublingual Nitrate', emoji:'🫧'},
    {key:'heparin',   label:'IV Heparin',         emoji:'🩸'},
  ],
  correct_key:'aspirin',
  explanation:'Aspirin 300mg is the cornerstone of STEMI management. Morphine is now controversial. Nitrates contraindicated with hypotension.',
  specialty:'Cardiology',
  pearl:'🫀 Dual antiplatelet therapy reduces MACE by 20% in STEMI vs aspirin alone.',
  expires_at: new Date(Date.now()+86400000).toISOString(),
}

export default function PulseRoom({ onXP, setTab }:{ onXP?:(n:number)=>void, setTab?:(t:string)=>void }) {
  const [question, setQuestion]     = useState<any>(FALLBACK_Q)
  const [answers, setAnswers]       = useState<Record<string,number>>({})
  const [myAnswer, setMyAnswer]     = useState<string|null>(null)
  const [revealed, setRevealed]     = useState(false)
  const [timeLeft, setTimeLeft]     = useState(0)
  const [totalAnswers, setTotal]    = useState(0)
  const [pulse, setPulse]           = useState(true)
  const [streak, setStreak]         = useState(0)
  const [totalCorrect, setCorrect]  = useState(0)
  const [pressed, setPressed]       = useState<string|null>(null)
  const [showPearl, setShowPearl]   = useState(false)
  const [liveFlags, setLiveFlags]   = useState<string[]>([])
  const [shockMode, setShockMode]   = useState(false)
  const [specialty, setSpecialty]   = useState('Cardiology')
  const startTime                   = useRef<number>(Date.now())

  useEffect(()=>{
    loadQuestion()
    const t = setInterval(()=>setPulse(p=>!p),900)
    return ()=>clearInterval(t)
  },[])

  // Countdown
  useEffect(()=>{
    const t = setInterval(()=>{
      if(!question?.expires_at) return
      const diff = Math.max(0, new Date(question.expires_at).getTime() - Date.now())
      setTimeLeft(diff)
    },1000)
    return ()=>clearInterval(t)
  },[question])

  // Live flags animation
  useEffect(()=>{
    const t = setInterval(()=>{
      const flag = COUNTRIES[Math.floor(Math.random()*COUNTRIES.length)]
      setLiveFlags(prev=>[...prev.slice(-5), flag])
    },2000)
    return ()=>clearInterval(t)
  },[])

  const loadQuestion = async () => {
    try {
      const { data } = await supabase
        .from('pulse_questions')
        .select('*')
        .eq('active',true)
        .order('activated_at',{ascending:false})
        .limit(1)
        .single()
      if(data){
        setQuestion({...data, options: typeof data.options==='string'?JSON.parse(data.options):data.options})
        loadAnswers(data.id)
        subscribeRealtime(data.id)
        startTime.current = Date.now()
      }
    } catch { loadAnswers('fallback') }
  }

  const loadAnswers = async (qId:string) => {
    if(qId==='fallback') return
    try {
      const { data } = await supabase.from('pulse_answers').select('option_key').eq('question_id',qId)
      if(data){
        const counts:Record<string,number> = {}
        data.forEach((a:any)=>{ counts[a.option_key]=(counts[a.option_key]||0)+1 })
        setAnswers(counts)
        setTotal(data.length)
      }
    } catch {}
  }

  const subscribeRealtime = (qId:string) => {
    supabase.channel('pulse-room')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'pulse_answers',filter:`question_id=eq.${qId}`},
        payload=>{
          setAnswers(prev=>({...prev,[payload.new.option_key]:(prev[payload.new.option_key]||0)+1}))
          setTotal(n=>n+1)
          const flag = COUNTRIES[Math.floor(Math.random()*COUNTRIES.length)]
          setLiveFlags(prev=>[...prev.slice(-5),flag])
        })
      .subscribe()
  }

  const handleAnswer = async (key:string) => {
    if(myAnswer) return
    const responseMs = Date.now() - startTime.current
    setMyAnswer(key)
    setAnswers(prev=>({...prev,[key]:(prev[key]||0)+1}))
    setTotal(n=>n+1)

    const isCorrect = key === question.correct_key
    if(isCorrect){
      const newStreak = streak+1
      setStreak(newStreak)
      setCorrect(c=>c+1)
      const xp = responseMs < 5000 ? 30 : responseMs < 15000 ? 20 : 15
      onXP?.(xp * (newStreak>=3 ? 2 : 1))
    } else {
      setStreak(0)
    }

    // Shock mode if majority wrong
    setTimeout(()=>{
      setRevealed(true)
      const wrongTotal = Object.entries(answers).filter(([k])=>k!==question.correct_key).reduce((a,b)=>a+b[1],0)
      if(wrongTotal > (answers[question.correct_key]||0)) setShockMode(true)
      setTimeout(()=>setShowPearl(true), 800)
    },400)

    if(question.id!=='fallback'){
      try {
        await supabase.from('pulse_answers').insert([{
          question_id: question.id,
          option_key: key,
          doctor_country: 'KSA',
          doctor_specialty: specialty,
          response_time_ms: responseMs,
          is_correct: isCorrect,
        }])
      } catch {}
    }
  }

  const formatTime = (ms:number) => {
    const h = Math.floor(ms/3600000)
    const m = Math.floor((ms%3600000)/60000)
    const s = Math.floor((ms%60000)/1000)
    return `${h}h ${m}m ${s}s`
  }

  const total = Object.values(answers).reduce((a,b)=>a+b,0)||1
  const opts = typeof question?.options === 'string' ? JSON.parse(question.options) : question?.options || []

  const specialtyColors:Record<string,string> = {
    'Cardiology':L.red, 'Emergency':L.amber, 'Critical Care':L.red,
    'Neurology':L.violet, 'Internal Medicine':L.cobalt,
    'Surgery':L.orange, 'Pediatrics':'#DB2777', 'Radiology':L.teal,
  }
  const specColor = specialtyColors[question?.specialty] || L.teal

  return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:120,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif'}}>

      {/* Hero Unsplash */}
      <div style={{position:'relative',height:220,overflow:'hidden'}}>
        <img
          src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}
        />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.88))'}}/>

        {/* Back + Live */}
        <div style={{position:'absolute',top:16,left:16,right:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:pulse?'#10B981':'rgba(16,185,129,0.3)',boxShadow:pulse?'0 0 12px #10B981':'none',transition:smooth}}/>
            <span style={{fontSize:11,fontWeight:700,color:'white',letterSpacing:1.5}}>PULSE ROOM — LIVE</span>
          </div>
          <div style={{display:'flex',gap:6}}>
            {liveFlags.slice(-3).map((f,i)=>(
              <span key={i} style={{fontSize:18,opacity:0.9}}>{f}</span>
            ))}
          </div>
        </div>

        {/* Title bottom */}
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{fontSize:26,fontWeight:900,color:'white',letterSpacing:-0.6,marginBottom:6}}>
            Clinical Pulse Room
          </div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',marginBottom:10}}>
            {totalAnswers} doctors answered · {formatTime(timeLeft)} left
          </div>
          {/* Stats */}
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[
              {label:'Streak', value:`${streak}🔥`, show:streak>0},
              {label:'Correct', value:`${totalCorrect}✓`, show:totalCorrect>0},
              {label:'Answered', value:`${totalAnswers}`, show:true},
            ].filter(s=>s.show).map(s=>(
              <div key={s.label} style={{background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',borderRadius:12,padding:'5px 12px',border:'1px solid rgba(255,255,255,0.2)'}}>
                <span style={{fontSize:13,fontWeight:800,color:'white'}}>{s.value}</span>
                <span style={{fontSize:10,color:'rgba(255,255,255,0.65)',marginLeft:4}}>{s.label}</span>
              </div>
            ))}
            {streak>=3 && (
              <div style={{background:'rgba(245,183,49,0.25)',backdropFilter:'blur(12px)',borderRadius:12,padding:'5px 12px',border:'1px solid rgba(245,183,49,0.4)'}}>
                <span style={{fontSize:13,fontWeight:800,color:L.amber}}>×2 XP!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{padding:'16px 16px 0'}}>

        {/* Specialty badge + question */}
        <div style={{
          background:L.surface, border:`1px solid ${L.border}`,
          borderLeft:`4px solid ${specColor}`,
          borderRadius:20, padding:'18px', marginBottom:14, boxShadow:L.shadowSm,
        }}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <span style={{
              fontSize:10,fontWeight:700,letterSpacing:1.5,
              color:specColor, background:`${specColor}10`,
              border:`1px solid ${specColor}25`,
              borderRadius:99, padding:'4px 12px',
            }}>{question?.specialty?.toUpperCase()}</span>
            <span style={{fontSize:11,fontWeight:600,color:L.textMuted}}>
              {question?.difficulty || 'Intermediate'}
            </span>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:L.textPrimary,lineHeight:1.6,letterSpacing:-0.1}}>
            {question?.question}
          </div>
        </div>

        {/* Shock Mode Banner */}
        {shockMode && revealed && (
          <div style={{
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:16, padding:'12px 16px', marginBottom:14,
            display:'flex', alignItems:'center', gap:10,
          }}>
            <span style={{fontSize:24}}>😱</span>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:L.red}}>Most doctors got this wrong!</div>
              <div style={{fontSize:11,color:L.textSub}}>This is a classic clinical pitfall</div>
            </div>
          </div>
        )}

        {/* Answer options */}
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:14}}>
          {opts.map((opt:any,i:number)=>{
            const pct   = Math.round(((answers[opt.key]||0)/total)*100)
            const isChosen  = myAnswer===opt.key
            const isCorrect = opt.key===question?.correct_key
            const showResult = revealed

            let bg = L.raised
            let border = `1.5px solid ${L.border}`
            let color = L.textPrimary

            if(showResult && isCorrect){
              bg='rgba(16,185,129,0.08)'; border=`1.5px solid ${L.sage}`; color=L.sage
            } else if(showResult && isChosen && !isCorrect){
              bg='rgba(239,68,68,0.08)'; border=`1.5px solid ${L.red}`; color=L.red
            } else if(isChosen && !showResult){
              bg='rgba(13,148,136,0.08)'; border=`1.5px solid ${L.teal}`; color=L.teal
            }

            return (
              <div key={opt.key}>
                <button onClick={()=>handleAnswer(opt.key)}
                  onMouseDown={()=>setPressed(opt.key)} onMouseUp={()=>setPressed(null)}
                  style={{
                    width:'100%', textAlign:'left', cursor:myAnswer?'default':'pointer',
                    background:bg, border, borderRadius:16, padding:'14px 16px',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    transform:pressed===opt.key?'scale(0.97)':'scale(1)',
                    transition:spring, boxShadow:isChosen?`0 4px 12px rgba(13,148,136,0.15)`:'none',
                  }}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:24}}>{opt.emoji}</span>
                    <span style={{fontSize:14,fontWeight:700,color}}>{opt.label}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {showResult && isCorrect && <span style={{fontSize:18}}>✅</span>}
                    {showResult && isChosen && !isCorrect && <span style={{fontSize:18}}>❌</span>}
                    {revealed && <span style={{fontSize:15,fontWeight:900,color}}>{pct}%</span>}
                  </div>
                </button>
                {revealed && (
                  <div style={{background:L.raised,borderRadius:99,height:6,overflow:'hidden',marginTop:5}}>
                    <div style={{height:'100%',width:`${pct}%`,borderRadius:99,
                      background:isCorrect?L.sage:isChosen?L.red:L.border,
                      transition:'width 0.8s cubic-bezier(0.34,1.56,0.64,1)'}}/>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Result */}
        {revealed && myAnswer && (
          <div style={{
            background: myAnswer===question?.correct_key ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border:`1px solid ${myAnswer===question?.correct_key ? L.sage+'40' : L.red+'40'}`,
            borderRadius:20, padding:'16px 18px', marginBottom:14,
          }}>
            <div style={{fontSize:18,marginBottom:6}}>
              {myAnswer===question?.correct_key ? '🎉 Correct!' : '❌ Not quite'}
            </div>
            <div style={{fontSize:13,fontWeight:500,color:L.textSub,lineHeight:1.65}}>
              {question?.explanation}
            </div>
            {myAnswer===question?.correct_key && (
              <div style={{marginTop:10,fontSize:13,fontWeight:700,color:L.sage}}>
                +{streak>=3?'30 XP (×2 streak!)':'15–30 XP'} earned 🔥
              </div>
            )}
          </div>
        )}

        {/* Pearl */}
        {showPearl && question?.pearl && (
          <div style={{
            background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.2)',
            borderRadius:20, padding:'16px 18px', marginBottom:14,
            animation:'fadeIn 0.5s ease',
          }}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.violet,marginBottom:8}}>
              💎 CLINICAL PEARL
            </div>
            <div style={{fontSize:13,fontWeight:500,color:L.textSub,lineHeight:1.65}}>
              {question?.pearl}
            </div>
          </div>
        )}

        {revealed && (
          <WorldMap votes={answers} accentColor={L.teal} height={200} title='Global Results' liveCount={totalAnswers}/>
        )}

        {/* Disclaimer */}
        <div style={{background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:16,padding:'12px 16px',marginBottom:16}}>
          <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
            ⚠️ Educational purposes only. Not a substitute for clinical judgment.
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
      `}</style>
    </div>
  )
}
