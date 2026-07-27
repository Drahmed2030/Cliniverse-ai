'use client'
import { useState, useEffect, useCallback } from 'react'

const C = {
  card:'rgba(255,255,255,0.11)', border:'rgba(139,92,246,0.25)',
  text:'white', sub:'rgba(255,255,255,0.45)', muted:'rgba(255,255,255,0.25)',
}

const SPECIALTIES = [
  {id:'Cardiology',icon:'🫀',color:'#ff453a'},
  {id:'Emergency Medicine',icon:'🚨',color:'#ff9f0a'},
  {id:'Internal Medicine',icon:'🩺',color:'#0a84ff'},
  {id:'Neurology',icon:'🧠',color:'#8b5cf6'},
  {id:'Respiratory',icon:'🫁',color:'#64d2ff'},
  {id:'Gastroenterology',icon:'🔬',color:'#30d158'},
  {id:'Nephrology',icon:'🫘',color:'#bf5af2'},
  {id:'Endocrinology',icon:'⚗️',color:'#ffd60a'},
  {id:'Infectious Disease',icon:'🦠',color:'#ff6b35'},
  {id:'Haematology',icon:'🩸',color:'#ff453a'},
  {id:'Rheumatology',icon:'🦴',color:'#c084fc'},
  {id:'Psychiatry',icon:'💭',color:'#a78bfa'},
]

const EXAM_TYPES = [
  {id:'Saudi Board',flag:'🇸🇦'},
  {id:'Arab Board',flag:'🌍'},
  {id:'USMLE Step 2',flag:'🇺🇸'},
  {id:'MRCPI',flag:'🇮🇪'},
  {id:'MRCP UK',flag:'🇬🇧'},
  {id:'PLAB',flag:'🇬🇧'},
]

const DIFFICULTIES = [
  {id:'Easy',color:'#30d158',label:'Foundation'},
  {id:'Medium',color:'#ff9f0a',label:'Intermediate'},
  {id:'Hard',color:'#ff453a',label:'Advanced'},
]

interface Question {
  id: string
  specialty: string
  difficulty: string
  examType: string
  vignette: string
  question: string
  options: {id:string, text:string}[]
  correctOption: string
  explanation: {
    summary: string
    whyOthersAreWrong: string
    keyTakeaway: string
    guideline?: string
  }
  fromCache?: boolean
}

interface SessionStats {
  total: number
  correct: number
  streak: number
  maxStreak: number
  xp: number
  timePerQ: number[]
}

export default function DynamicMCQ({ onXP }: { onXP?: (n:number)=>void }) {
  const [view, setView] = useState<'setup'|'question'|'explanation'|'stats'>('setup')
  const [specialty, setSpecialty] = useState('Cardiology')
  const [examType, setExamType] = useState('Saudi Board')
  const [difficulty, setDifficulty] = useState('Medium')
  const [question, setQuestion] = useState<Question|null>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string|null>(null)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [stats, setStats] = useState<SessionStats>({total:0,correct:0,streak:0,maxStreak:0,xp:0,timePerQ:[]})
  const [error, setError] = useState('')
  const [qCount, setQCount] = useState(0)
  const SESSION_LENGTH = 10

  // Timer
  useEffect(() => {
    if (!timerActive) return
    const t = setInterval(() => setTimer(s => s+1), 1000)
    return () => clearInterval(t)
  }, [timerActive])

  const fetchQuestion = useCallback(async () => {
    setLoading(true)
    setError('')
    setSelected(null)
    setTimer(0)
    setTimerActive(true)
    try {
      const res = await fetch('/api/exam', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ specialty, examType, difficulty })
      })
      if (!res.ok) {
        const err = await res.json()
        if (err.limitReached) {
          setError('Daily limit reached. Upgrade to PRO for unlimited questions!')
        } else {
          setError(err.error || 'Failed to generate question')
        }
        setLoading(false)
        setTimerActive(false)
        return
      }
      const data = await res.json()
      setQuestion(data)
      setQCount(c => c+1)
      setView('question')
    } catch {
      setError('Connection error. Check your internet and try again.')
    }
    setLoading(false)
  }, [specialty, examType, difficulty])

  const handleAnswer = (optId: string) => {
    if (selected) return
    setSelected(optId)
    setTimerActive(false)
    if (!question) return

    const isCorrect = optId === question.correctOption
    const xpEarned = isCorrect
      ? difficulty==='Hard' ? 30 : difficulty==='Medium' ? 20 : 10
      : 0

    setStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0
      return {
        ...prev,
        total: prev.total + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        xp: prev.xp + xpEarned + (newStreak >= 3 ? 10 : 0), // streak bonus
        timePerQ: [...prev.timePerQ, timer],
      }
    })
  }

  const nextQuestion = () => {
    if (qCount >= SESSION_LENGTH) {
      onXP && onXP(stats.xp)
      setView('stats')
    } else {
      setView('question')
      fetchQuestion()
    }
  }

  const accuracy = stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0
  const avgTime = stats.timePerQ.length > 0
    ? Math.round(stats.timePerQ.reduce((a,b)=>a+b,0)/stats.timePerQ.length)
    : 0

  // ── SETUP ──
  if (view==='setup') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:80}}>
      <div style={{background:'linear-gradient(135deg,rgba(255,159,10,0.12),rgba(139,92,246,0.08))',borderRadius:22,padding:'20px',marginBottom:16,border:'1px solid rgba(255,159,10,0.2)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-25,right:-25,width:110,height:110,borderRadius:'50%',background:'radial-gradient(circle,rgba(255,159,10,0.2),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{fontSize:11,color:'rgba(255,159,10,0.8)',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>🧠 AI-POWERED</div>
        <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-0.5,marginBottom:4}}>Dynamic MCQ</div>
        <div style={{fontSize:13,color:C.sub,lineHeight:1.6}}>Claude AI generates unique board-style questions — Saudi Board, USMLE, MRCP, PLAB</div>
        <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
          {['Infinite Questions','No Repeats','AI Explained','Evidence-Based'].map(t=>(
            <span key={t} style={{fontSize:9,padding:'3px 10px',borderRadius:8,background:'rgba(255,159,10,0.12)',color:'rgba(255,159,10,0.8)',border:'1px solid rgba(255,159,10,0.2)',fontWeight:700}}>{t}</span>
          ))}
        </div>
      </div>

      {/* Specialty */}
      <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>SPECIALTY</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
        {SPECIALTIES.map(s=>(
          <div key={s.id} onClick={()=>setSpecialty(s.id)}
            style={{background:specialty===s.id?`${s.color}18`:C.card,borderRadius:14,padding:'12px 8px',border:specialty===s.id?`2px solid ${s.color}`:`1px solid ${C.border}`,cursor:'pointer',textAlign:'center',transition:'all 0.2s'}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:9,fontWeight:700,color:specialty===s.id?s.color:C.sub,lineHeight:1.3}}>{s.id}</div>
          </div>
        ))}
      </div>

      {/* Exam Type */}
      <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>EXAM TYPE</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        {EXAM_TYPES.map(e=>(
          <button key={e.id} onClick={()=>setExamType(e.id)}
            style={{padding:'8px 14px',borderRadius:12,border:examType===e.id?'2px solid #ff9f0a':`1px solid ${C.border}`,background:examType===e.id?'rgba(255,159,10,0.12)':C.card,color:examType===e.id?'#ff9f0a':C.sub,fontSize:11,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
            <span>{e.flag}</span>{e.id}
          </button>
        ))}
      </div>

      {/* Difficulty */}
      <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1,marginBottom:8}}>DIFFICULTY</div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {DIFFICULTIES.map(d=>(
          <button key={d.id} onClick={()=>setDifficulty(d.id)}
            style={{flex:1,padding:'12px',borderRadius:14,border:difficulty===d.id?`2px solid ${d.color}`:`1px solid ${C.border}`,background:difficulty===d.id?`${d.color}15`:C.card,color:difficulty===d.id?d.color:C.sub,fontSize:12,fontWeight:700,cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:16,marginBottom:2}}>{d.id==='Easy'?'🟢':d.id==='Medium'?'🟡':'🔴'}</div>
            <div>{d.id}</div>
            <div style={{fontSize:9,opacity:0.7,marginTop:2}}>{d.label}</div>
          </button>
        ))}
      </div>

      <div style={{background:'rgba(255,255,255,0.11)',borderRadius:16,padding:'12px 14px',marginBottom:20,border:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:18,fontWeight:900,color:'white'}}>{SESSION_LENGTH}</div>
          <div style={{fontSize:10,color:C.muted}}>Questions</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:18,fontWeight:900,color:'#ff9f0a'}}>{difficulty==='Hard'?'30':difficulty==='Medium'?'20':'10'} XP</div>
          <div style={{fontSize:10,color:C.muted}}>Per correct</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:18,fontWeight:900,color:'#30d158'}}>∞</div>
          <div style={{fontSize:10,color:C.muted}}>Unique Qs</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:18,fontWeight:900,color:'#8b5cf6'}}>+10</div>
          <div style={{fontSize:10,color:C.muted}}>Streak bonus</div>
        </div>
      </div>

      <button onClick={fetchQuestion} disabled={loading}
        style={{width:'100%',padding:'17px',borderRadius:20,border:'none',background:loading?'rgba(255,159,10,0.3)':'linear-gradient(135deg,#ff9f0a,#ff6b35)',color:'white',fontSize:16,fontWeight:800,cursor:loading?'not-allowed':'pointer',boxShadow:loading?'none':'0 8px 32px rgba(255,159,10,0.45)',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
        {loading
          ? <><Spinner color="white"/>Generating question...</>
          : <>🧠 Start {SESSION_LENGTH}-Question Session</>
        }
      </button>
      {error&&<div style={{marginTop:12,padding:'12px',borderRadius:12,background:'rgba(255,69,58,0.1)',border:'1px solid rgba(255,69,58,0.2)',color:'#ff453a',fontSize:12,textAlign:'center'}}>{error}</div>}
    </div>
  )

  // ── QUESTION ──
  if (view==='question' && question) return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <button onClick={()=>setView('setup')} style={{background:'rgba(139,92,246,0.25)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:12,color:'#c4b5fd',padding:'8px 14px',fontSize:13,cursor:'pointer',fontWeight:600}}>← Exit</button>
        <div style={{flex:1}}>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <span style={{fontSize:11,fontWeight:700,color:'#ff9f0a'}}>{specialty}</span>
            <span style={{fontSize:9,color:C.muted}}>·</span>
            <span style={{fontSize:11,fontWeight:700,color:
              difficulty==='Hard'?'#ff453a':difficulty==='Medium'?'#ff9f0a':'#30d158'
            }}>{difficulty}</span>
            {question.fromCache&&<span style={{fontSize:8,padding:'1px 6px',borderRadius:6,background:'rgba(48,209,88,0.1)',color:'rgba(48,209,88,0.6)',border:'1px solid rgba(48,209,88,0.15)'}}>cached</span>}
          </div>
          {/* Progress bar */}
          <div style={{height:3,background:'rgba(255,255,255,0.15)',borderRadius:2,overflow:'hidden',marginTop:4}}>
            <div style={{height:'100%',width:`${(qCount/SESSION_LENGTH)*100}%`,background:'linear-gradient(90deg,#ff9f0a,#ff6b35)',borderRadius:2,transition:'width 0.4s'}}/>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:13,fontWeight:800,color:timer>90?'#ff453a':timer>60?'#ff9f0a':'white',fontFamily:'monospace'}}>{Math.floor(timer/60)}:{String(timer%60).padStart(2,'0')}</div>
          <div style={{fontSize:9,color:C.muted}}>Q{qCount}/{SESSION_LENGTH}</div>
        </div>
      </div>

      {/* Streak */}
      {stats.streak >= 2 && (
        <div style={{background:'rgba(255,214,10,0.1)',borderRadius:12,padding:'8px 14px',marginBottom:10,border:'1px solid rgba(255,214,10,0.2)',display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:16}}>🔥</span>
          <span style={{fontSize:12,color:'#ffd60a',fontWeight:700}}>{stats.streak} streak! +10 XP bonus</span>
        </div>
      )}

      {/* Vignette */}
      <div style={{background:'rgba(255,255,255,0.11)',borderRadius:20,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:0,width:'100%',height:3,background:'linear-gradient(90deg,#ff9f0a,#ff6b35)'}}/>
        <div style={{fontSize:10,color:'#ff9f0a',fontWeight:700,marginBottom:8,letterSpacing:0.5}}>📋 CLINICAL VIGNETTE</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.85}}>{question.vignette}</div>
      </div>

      {/* Question */}
      <div style={{background:'rgba(139,92,246,0.08)',borderRadius:16,padding:'14px',marginBottom:12,border:'1px solid rgba(139,92,246,0.3)'}}>
        <div style={{fontSize:14,fontWeight:700,color:'white',lineHeight:1.6}}>{question.question}</div>
      </div>

      {/* Options */}
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
        {question.options.map(opt => {
          const isSelected = selected===opt.id
          const isCorrect = opt.id===question.correctOption
          let bg=C.card, border=`1px solid ${C.border}`, tc=C.text
          if (selected) {
            if (isCorrect) { bg='rgba(48,209,88,0.12)'; border='2px solid rgba(48,209,88,0.45)'; tc='#86efac' }
            else if (isSelected) { bg='rgba(255,69,58,0.12)'; border='1px solid rgba(255,69,58,0.35)'; tc='#fca5a5' }
            else { tc=C.muted }
          }
          return (
            <div key={opt.id} onClick={()=>handleAnswer(opt.id)}
              style={{background:bg,borderRadius:16,padding:'14px 16px',border,cursor:selected?'default':'pointer',display:'flex',alignItems:'flex-start',gap:12,transition:'all 0.25s',opacity:selected&&!isCorrect&&!isSelected?0.4:1}}>
              <div style={{width:32,height:32,borderRadius:10,background:selected&&isCorrect?'rgba(48,209,88,0.2)':selected&&isSelected?'rgba(255,69,58,0.2)':'rgba(255,255,255,0.15)',border:`1px solid ${selected&&isCorrect?'rgba(48,209,88,0.4)':selected&&isSelected?'rgba(255,69,58,0.3)':'rgba(255,255,255,0.1)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:selected&&isCorrect?'#30d158':selected&&isSelected?'#ff453a':'rgba(255,255,255,0.4)',flexShrink:0}}>
                {selected?(isCorrect?'✓':isSelected?'✗':opt.id):opt.id}
              </div>
              <div style={{fontSize:13,color:tc,fontWeight:500,flex:1,lineHeight:1.5,paddingTop:2}}>{opt.text}</div>
            </div>
          )
        })}
      </div>

      {/* After answer */}
      {selected&&(
        <div>
          <div style={{background:selected===question.correctOption?'rgba(48,209,88,0.08)':'rgba(255,69,58,0.08)',borderRadius:16,padding:'14px',marginBottom:10,border:`1px solid ${selected===question.correctOption?'rgba(48,209,88,0.2)':'rgba(255,69,58,0.2)'}`}}>
            <div style={{fontSize:13,fontWeight:800,color:selected===question.correctOption?'#30d158':'#ff453a',marginBottom:6}}>
              {selected===question.correctOption?`✅ Correct! +${difficulty==='Hard'?30:difficulty==='Medium'?20:10} XP`:'❌ Incorrect'}
              {stats.streak>=3&&selected===question.correctOption&&<span style={{color:'#ffd60a'}}> 🔥 +10 bonus!</span>}
            </div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.6}}>{question.explanation.summary}</div>
          </div>
          <div style={{background:'rgba(10,132,255,0.06)',borderRadius:14,padding:'12px 14px',marginBottom:10,border:'1px solid rgba(10,132,255,0.15)'}}>
            <div style={{fontSize:9,color:'#0a84ff',fontWeight:700,marginBottom:4}}>⚡ HIGH-YIELD PEARL</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.8)',lineHeight:1.6,fontWeight:600}}>{question.explanation.keyTakeaway}</div>
          </div>
          {question.explanation.guideline&&(
            <div style={{background:'rgba(255,214,10,0.06)',borderRadius:12,padding:'10px 14px',marginBottom:12,border:'1px solid rgba(255,214,10,0.15)'}}>
              <div style={{fontSize:11,color:'rgba(255,214,10,0.8)'}}>📚 {question.explanation.guideline}</div>
            </div>
          )}
          <button onClick={nextQuestion}
            style={{width:'100%',padding:'16px',borderRadius:18,border:'none',background:qCount>=SESSION_LENGTH?'linear-gradient(135deg,#ffd60a,#ff9f0a)':'linear-gradient(135deg,#ff9f0a,#ff6b35)',color:qCount>=SESSION_LENGTH?'black':'white',fontSize:15,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 24px rgba(255,159,10,0.45)'}}>
            {qCount>=SESSION_LENGTH?'📊 View Results':'Next Question →'}
          </button>
          {loading&&<div style={{textAlign:'center',marginTop:8,fontSize:11,color:C.muted}}>⚡ Generating next question...</div>}
        </div>
      )}

      {/* Live stats bar */}
      <div style={{display:'flex',gap:10,marginTop:12,background:'rgba(255,255,255,0.03)',borderRadius:14,padding:'10px 14px',border:`1px solid ${C.border}`}}>
        <div style={{textAlign:'center',flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:'#30d158'}}>{stats.correct}</div>
          <div style={{fontSize:9,color:C.muted}}>Correct</div>
        </div>
        <div style={{textAlign:'center',flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:'#ff453a'}}>{stats.total-stats.correct}</div>
          <div style={{fontSize:9,color:C.muted}}>Wrong</div>
        </div>
        <div style={{textAlign:'center',flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:'#ffd60a'}}>{stats.streak}🔥</div>
          <div style={{fontSize:9,color:C.muted}}>Streak</div>
        </div>
        <div style={{textAlign:'center',flex:1}}>
          <div style={{fontSize:16,fontWeight:900,color:'#8b5cf6'}}>{stats.xp}</div>
          <div style={{fontSize:9,color:C.muted}}>XP</div>
        </div>
      </div>
    </div>
  )

  // ── STATS / RESULTS ──
  if (view==='stats') return (
    <div style={{fontFamily:'-apple-system,sans-serif',paddingBottom:20}}>
      <div style={{background:`linear-gradient(135deg,${accuracy>=80?'rgba(48,209,88,0.15)':accuracy>=60?'rgba(255,159,10,0.15)':'rgba(255,69,58,0.12)'},rgba(139,92,246,0.08))`,borderRadius:24,padding:'28px 20px',marginBottom:16,border:`1px solid ${accuracy>=80?'rgba(48,209,88,0.25)':accuracy>=60?'rgba(255,159,10,0.25)':'rgba(255,69,58,0.2)'}`,textAlign:'center'}}>
        <div style={{fontSize:64,marginBottom:12}}>{accuracy>=80?'🏆':accuracy>=60?'🥈':'📚'}</div>
        <div style={{fontSize:48,fontWeight:900,color:'white',letterSpacing:-2,marginBottom:4}}>{accuracy}%</div>
        <div style={{fontSize:16,color:accuracy>=80?'#30d158':accuracy>=60?'#ff9f0a':'#ff453a',fontWeight:700,marginBottom:4}}>
          {accuracy>=80?'Excellent!':accuracy>=60?'Good effort':'Keep practising'}
        </div>
        <div style={{fontSize:13,color:C.sub}}>{specialty} · {examType} · {difficulty}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        {[
          {label:'Correct',value:`${stats.correct}/${stats.total}`,color:'#30d158',icon:'✅'},
          {label:'XP Earned',value:`+${stats.xp}`,color:'#ffd60a',icon:'⚡'},
          {label:'Best Streak',value:`${stats.maxStreak}🔥`,color:'#ff9f0a',icon:'🔥'},
          {label:'Avg Time',value:`${avgTime}s/Q`,color:'#0a84ff',icon:'⏱️'},
        ].map(s=>(
          <div key={s.label} style={{background:`${s.color}10`,borderRadius:18,padding:'16px',border:`1px solid ${s.color}20`,textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:22,fontWeight:900,color:s.color,marginBottom:2}}>{s.value}</div>
            <div style={{fontSize:11,color:C.sub}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:10}}>
        <button onClick={()=>{setView('setup');setStats({total:0,correct:0,streak:0,maxStreak:0,xp:0,timePerQ:[]});setQCount(0)}}
          style={{flex:1,padding:'14px',borderRadius:16,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:14,fontWeight:700,cursor:'pointer'}}>
          🔄 New Session
        </button>
        <button onClick={()=>{onXP&&onXP(stats.xp);setView('setup');setStats({total:0,correct:0,streak:0,maxStreak:0,xp:0,timePerQ:[]});setQCount(0)}}
          style={{flex:2,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#ff9f0a,#ff6b35)',color:'white',fontSize:14,fontWeight:800,cursor:'pointer',boxShadow:'0 6px 20px rgba(255,159,10,0.4)'}}>
          +{stats.xp} XP ✓
        </button>
      </div>
    </div>
  )

  // Loading state
  return (
    <div style={{fontFamily:'-apple-system,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:300,gap:16}}>
      <div style={{width:48,height:48,borderRadius:'50%',border:'3px solid rgba(255,159,10,0.2)',borderTop:'3px solid #ff9f0a',animation:'spin 0.8s linear infinite'}}/>
      <div style={{fontSize:14,color:C.sub,fontWeight:600}}>Claude AI is generating your question...</div>
      <div style={{fontSize:11,color:C.muted}}>Specialty: {specialty} · {examType}</div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const Spinner = ({color='#ff9f0a'}:{color?:string}) => (
  <div style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${color}30`,borderTop:`2px solid ${color}`,animation:'spin 0.8s linear infinite',flexShrink:0}}/>
)
