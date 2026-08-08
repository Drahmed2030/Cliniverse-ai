'use client'
import { useState, useEffect } from 'react'

const L = {
  canvas:'#F8FAFC', surface:'#FFFFFF', raised:'#F1F5F9', border:'#E2E8F0',
  teal:'#0D9488', cobalt:'#1E40AF', sage:'#10B981', amber:'#F5B731',
  red:'#EF4444', violet:'#7C3AED', orange:'#EA580C', pink:'#DB2777',
  textPrimary:'#0F172A', textSub:'#475569', textMuted:'#94A3B8',
  gradient:'linear-gradient(135deg,#1E40AF,#7C3AED)',
  shadowSm:'0 1px 3px rgba(15,23,42,0.08)',
  shadowGlow:'0 4px 20px rgba(30,64,175,0.25)',
}
const spring = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)'
const smooth = 'all 0.3s cubic-bezier(0.4,0,0.2,1)'

const BOARDS = [
  {
    id:'mrcp1', name:'MRCP Part 1', flag:'🇬🇧', color:L.cobalt,
    img:'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    desc:'Internal medicine · 200 MCQs · 3 hours · Royal College London',
    topics:['Cardiology','Respiratory','Gastro','Neurology','Endocrine','Haematology','Rheumatology','Nephrology'],
    questions:2400, notes:180, pasRate:'55%',
  },
  {
    id:'mrcp2', name:'MRCP Part 2', flag:'🇬🇧', color:'#7C3AED',
    img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    desc:'Clinical scenarios · PACES · Written · Advanced level',
    topics:['PACES Stations','Clinical Scenarios','Data Interpretation','Ethics & Law'],
    questions:1800, notes:120, pasRate:'61%',
  },
  {
    id:'usmle1', name:'USMLE Step 1', flag:'🇺🇸', color:L.red,
    img:'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80',
    desc:'Basic sciences · 280 MCQs · NBME · High-yield concepts',
    topics:['Anatomy','Physiology','Biochemistry','Pathology','Pharmacology','Microbiology','Immunology','Behavioural Science'],
    questions:3200, notes:240, pasRate:'94%',
  },
  {
    id:'usmle2', name:'USMLE Step 2 CK', flag:'🇺🇸', color:L.sage,
    img:'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80',
    desc:'Clinical knowledge · 318 MCQs · 9 hours · Patient management',
    topics:['Internal Medicine','Surgery','Paediatrics','OB/GYN','Psychiatry','Emergency Medicine','Preventive Medicine'],
    questions:2800, notes:200, pasRate:'91%',
  },
  {
    id:'basic', name:'Basic Sciences', flag:'🧬', color:L.teal,
    img:'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    desc:'Foundation medical knowledge · Anatomy · Physiology · Pharmacology',
    topics:['Anatomy','Physiology','Biochemistry','Pharmacology','Pathology','Histology'],
    questions:1500, notes:300, pasRate:'N/A',
  },
]

const SEMINAR_TOPICS = [
  {id:'stemi',    title:'STEMI Management 2026',     specialty:'Cardiology', duration:'45 min', slides:28, icon:'🫀', color:L.red},
  {id:'sepsis',   title:'Surviving Sepsis Campaign', specialty:'Critical Care', duration:'60 min', slides:35, icon:'🦠', color:L.amber},
  {id:'stroke',   title:'Acute Stroke — Time is Brain', specialty:'Neurology', duration:'40 min', slides:24, icon:'🧠', color:L.violet},
  {id:'hf',       title:'Heart Failure — GDMT 2026',  specialty:'Cardiology', duration:'50 min', slides:30, icon:'💔', color:L.cobalt},
  {id:'dm',       title:'Diabetes Management ADA 2026', specialty:'Endocrine', duration:'35 min', slides:22, icon:'💉', color:L.sage},
  {id:'ards',     title:'ARDS — Lung Protective Ventilation', specialty:'Critical Care', duration:'55 min', slides:32, icon:'🫁', color:L.teal},
]

// ── SLIDE VIEWER ──────────────────────────────────────
function SlideViewer({ topic, onClose, onXP }:{ topic:any, onClose:()=>void, onXP?:(n:number)=>void }) {
  const [slideIdx, setSlideIdx] = useState(0)
  const [slides, setSlides]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [pressed, setPressed]   = useState<string|null>(null)

  useEffect(()=>{
    generateSlides()
  },[topic.id])

  const generateSlides = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          question:`Create a professional medical seminar on "${topic.title}" for ${topic.specialty} physicians. 
Generate exactly 6 slides in JSON array format only, no markdown:
[
  {"title":"slide title","type":"intro","content":"key points as bullet list","pearl":"clinical pearl","emoji":"relevant emoji"},
  ...
]
Types: intro, pathophysiology, diagnosis, management, evidence, summary
Make it Apple Health style — concise, evidence-based, 2026 guidelines.`,
          specialty: topic.specialty
        })
      })
      const data = await res.json()
      const text = data.answer || '[]'
      const clean = text.replace(/```json|```/g,'').trim()
      const parsed = JSON.parse(clean)
      setSlides(parsed)
      onXP?.(20)
    } catch {
      setSlides([
        {title:`${topic.title}`, type:'intro', content:'AI generating content...', pearl:'Loading...', emoji:topic.icon},
      ])
    }
    setLoading(false)
  }

  const slide = slides[slideIdx]
  const progress = slides.length > 0 ? ((slideIdx+1)/slides.length)*100 : 0

  const SLIDE_COLORS = [L.cobalt, L.teal, L.violet, L.red, L.sage, L.amber]
  const slideColor = SLIDE_COLORS[slideIdx % SLIDE_COLORS.length]

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:L.canvas,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif',
      display:'flex',flexDirection:'column'}}>

      {/* Header */}
      <div style={{
        background:L.gradient,padding:'16px 16px 20px',flexShrink:0,
        position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,position:'relative'}}>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.15)',backdropFilter:'blur(12px)',
            border:'1px solid rgba(255,255,255,0.2)',
            borderRadius:10,padding:'6px 14px',color:'white',fontSize:12,fontWeight:700,cursor:'pointer',
          }}>← Exit</button>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.8)',fontWeight:600}}>
            {slideIdx+1} / {slides.length}
          </span>
        </div>
        <div style={{fontSize:14,fontWeight:800,color:'white',marginBottom:4}}>{topic.title}</div>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.7)'}}>
          {topic.specialty} · {topic.duration} · {topic.slides} slides
        </div>
        {/* Progress */}
        <div style={{marginTop:10,background:'rgba(255,255,255,0.2)',borderRadius:99,height:3,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progress}%`,background:'white',borderRadius:99,transition:'width 0.4s ease'}}/>
        </div>
      </div>

      {/* Slide Content */}
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <div style={{fontSize:40,marginBottom:16}}>{topic.icon}</div>
            <div style={{fontSize:16,fontWeight:700,color:L.textPrimary,marginBottom:8}}>AI Generating Slides...</div>
            <div style={{fontSize:13,color:L.textMuted}}>Creating evidence-based content</div>
          </div>
        ) : slide ? (
          <div style={{animation:'fadeIn 0.4s ease'}}>
            {/* Slide hero */}
            <div style={{
              background:`linear-gradient(135deg,${slideColor},${slideColor}88)`,
              borderRadius:20,padding:'24px 20px',marginBottom:14,
              textAlign:'center',minHeight:140,
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            }}>
              <div style={{fontSize:44,marginBottom:10}}>{slide.emoji}</div>
              <div style={{fontSize:20,fontWeight:900,color:'white',letterSpacing:-0.4,lineHeight:1.2}}>
                {slide.title}
              </div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginTop:8,textTransform:'uppercase'}}>
                {slide.type}
              </div>
            </div>

            {/* Content */}
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:`4px solid ${slideColor}`,borderRadius:18,padding:'16px 18px',marginBottom:12,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:10}}>KEY POINTS</div>
              <div style={{fontSize:14,color:L.textSub,lineHeight:1.8,whiteSpace:'pre-line'}}>{slide.content}</div>
            </div>

            {/* Pearl */}
            {slide.pearl && (
              <div style={{background:'rgba(124,58,237,0.06)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:16,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.violet,marginBottom:6}}>💎 CLINICAL PEARL</div>
                <div style={{fontSize:13,color:L.textSub,lineHeight:1.65}}>{slide.pearl}</div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <div style={{padding:'12px 16px 32px',borderTop:`1px solid ${L.border}`,background:L.surface,display:'flex',gap:10,flexShrink:0}}>
        <button onClick={()=>setSlideIdx(Math.max(0,slideIdx-1))} disabled={slideIdx===0}
          onMouseDown={()=>setPressed('prev')} onMouseUp={()=>setPressed(null)}
          style={{
            flex:1,padding:'13px',borderRadius:14,border:`1px solid ${L.border}`,cursor:'pointer',
            background:slideIdx===0?L.raised:L.surface,color:slideIdx===0?L.textMuted:L.textPrimary,
            fontSize:14,fontWeight:700,
            transform:pressed==='prev'?'scale(0.97)':'scale(1)',transition:spring,
          }}>← Prev</button>

        {slideIdx < slides.length-1 ? (
          <button onClick={()=>setSlideIdx(slideIdx+1)}
            onMouseDown={()=>setPressed('next')} onMouseUp={()=>setPressed(null)}
            style={{
              flex:2,padding:'13px',borderRadius:14,border:'none',cursor:'pointer',
              background:L.gradient,color:'white',fontSize:14,fontWeight:800,
              transform:pressed==='next'?'scale(0.97)':'scale(1)',transition:spring,
              boxShadow:L.shadowGlow,
            }}>Next →</button>
        ) : (
          <button onClick={onClose}
            style={{
              flex:2,padding:'13px',borderRadius:14,border:'none',cursor:'pointer',
              background:`linear-gradient(135deg,${L.sage},${L.teal})`,color:'white',
              fontSize:14,fontWeight:800,boxShadow:'0 4px 20px rgba(16,185,129,0.30)',
            }}>✅ Complete — +20 XP</button>
        )}
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

// ── MCQ QUIZ ──────────────────────────────────────────
function MCQQuiz({ board, onClose, onXP }:{ board:any, onClose:()=>void, onXP?:(n:number)=>void }) {
  const [questions, setQuestions]   = useState<any[]>([])
  const [current, setCurrent]       = useState(0)
  const [answered, setAnswered]     = useState<Record<number,string>>({})
  const [loading, setLoading]       = useState(true)
  const [score, setScore]           = useState(0)
  const [showResult, setShowResult] = useState(false)

  useEffect(()=>{ generateQuestions() },[board.id])

  const generateQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/medical-ai',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          question:`Generate 5 high-quality ${board.name} style MCQs about ${board.topics[0]} and ${board.topics[1]}.
Return ONLY valid JSON array:
[{"question":"clinical stem","options":["A. option","B. option","C. option","D. option"],"correct":"A","explanation":"why A is correct with evidence"}]
Make them exam-level difficulty. No markdown.`,
          specialty: board.id.includes('usmle') ? 'Internal Medicine' : 'General Medicine'
        })
      })
      const data = await res.json()
      const text = data.answer || '[]'
      const clean = text.replace(/```json|```/g,'').trim()
      setQuestions(JSON.parse(clean))
      onXP?.(5)
    } catch { setQuestions([]) }
    setLoading(false)
  }

  const handleAnswer = (opt:string) => {
    if(answered[current]!==undefined) return
    const isCorrect = opt === questions[current]?.correct
    setAnswered(prev=>({...prev,[current]:opt}))
    if(isCorrect) { setScore(s=>s+1); onXP?.(10) }
    if(current === questions.length-1) {
      setTimeout(()=>setShowResult(true), 1500)
    }
  }

  const q = questions[current]
  const hasAnswered = answered[current] !== undefined

  if(showResult) return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:L.canvas,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>
      <div style={{fontSize:60,marginBottom:16}}>{score>=4?'🎉':score>=3?'👍':'📚'}</div>
      <div style={{fontSize:28,fontWeight:900,color:L.textPrimary,marginBottom:8,letterSpacing:-0.6}}>
        {score} / {questions.length}
      </div>
      <div style={{fontSize:15,color:L.textMuted,marginBottom:32}}>
        {score>=4?'Excellent!':score>=3?'Good job!':'Keep practicing!'}
      </div>
      <div style={{width:'100%',maxWidth:320}}>
        <button onClick={onClose} style={{
          width:'100%',padding:'14px',borderRadius:16,border:'none',cursor:'pointer',
          background:L.gradient,color:'white',fontSize:15,fontWeight:800,
          boxShadow:L.shadowGlow,marginBottom:10,
        }}>← Back to Academy</button>
        <button onClick={()=>{setQuestions([]);setCurrent(0);setAnswered({});setScore(0);setShowResult(false);generateQuestions()}} style={{
          width:'100%',padding:'13px',borderRadius:14,border:`1px solid ${L.border}`,cursor:'pointer',
          background:L.raised,color:L.textSub,fontSize:14,fontWeight:700,
        }}>🔄 New Questions</button>
      </div>
    </div>
  )

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,background:L.canvas,display:'flex',flexDirection:'column',
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>
      {/* Header */}
      <div style={{background:board.color,padding:'16px 16px 20px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:10,padding:'6px 14px',color:'white',fontSize:12,fontWeight:700,cursor:'pointer'}}>← Exit</button>
          <span style={{fontSize:13,color:'rgba(255,255,255,0.9)',fontWeight:700}}>{current+1}/{questions.length}</span>
          <span style={{fontSize:13,color:'rgba(255,255,255,0.9)',fontWeight:700}}>✓ {score}</span>
        </div>
        <div style={{background:'rgba(255,255,255,0.2)',borderRadius:99,height:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${((current+1)/Math.max(questions.length,1))*100}%`,background:'white',borderRadius:99,transition:'width 0.4s'}}/>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'60px 0'}}>
            <div style={{fontSize:36,marginBottom:12}}>🧪</div>
            <div style={{fontSize:15,fontWeight:600,color:L.textMuted}}>Generating {board.name} questions...</div>
          </div>
        ) : q ? (
          <>
            <div style={{background:L.surface,border:`1px solid ${L.border}`,borderLeft:`4px solid ${board.color}`,borderRadius:18,padding:'16px 18px',marginBottom:14,boxShadow:L.shadowSm}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:board.color,marginBottom:8}}>{board.name} · Q{current+1}</div>
              <div style={{fontSize:14,fontWeight:600,color:L.textPrimary,lineHeight:1.7}}>{q.question}</div>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
              {q.options?.map((opt:string,i:number)=>{
                const letter = opt[0]
                const isCorrect = letter===q.correct
                const isChosen = answered[current]===letter
                let bg = L.raised, border = `1px solid ${L.border}`, color = L.textPrimary

                if(hasAnswered && isCorrect){ bg='rgba(16,185,129,0.08)'; border=`1.5px solid ${L.sage}`; color=L.sage }
                else if(hasAnswered && isChosen && !isCorrect){ bg='rgba(239,68,68,0.08)'; border=`1.5px solid ${L.red}`; color=L.red }
                else if(isChosen && !hasAnswered){ bg=`${board.color}10`; border=`1.5px solid ${board.color}`; color=board.color }

                return (
                  <button key={i} onClick={()=>handleAnswer(letter)}
                    style={{
                      width:'100%',textAlign:'left',padding:'13px 16px',borderRadius:14,
                      cursor:hasAnswered?'default':'pointer',background:bg,border,
                      fontSize:13,fontWeight:600,color,lineHeight:1.5,transition:smooth,
                      display:'flex',alignItems:'center',gap:10,
                    }}>
                    <span style={{width:24,height:24,borderRadius:'50%',background:isChosen||( hasAnswered&&isCorrect)?color:'rgba(0,0,0,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:isChosen||(hasAnswered&&isCorrect)?'white':L.textMuted,flexShrink:0}}>
                      {letter}
                    </span>
                    {opt.substring(3)}
                  </button>
                )
              })}
            </div>

            {hasAnswered && (
              <div style={{background:'rgba(124,58,237,0.06)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:14,padding:'14px 16px',marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.violet,marginBottom:6}}>💎 EXPLANATION</div>
                <div style={{fontSize:13,color:L.textSub,lineHeight:1.65}}>{q.explanation}</div>
              </div>
            )}

            {hasAnswered && current < questions.length-1 && (
              <button onClick={()=>setCurrent(c=>c+1)}
                style={{width:'100%',padding:'13px',borderRadius:14,border:'none',cursor:'pointer',background:L.gradient,color:'white',fontSize:14,fontWeight:800,boxShadow:L.shadowGlow}}>
                Next Question →
              </button>
            )}
          </>
        ) : (
          <div style={{textAlign:'center',padding:'40px',color:L.textMuted}}>No questions generated. Try again.</div>
        )}
      </div>
    </div>
  )
}

// ── MAIN CLINICAL ACADEMY ─────────────────────────────
export default function ClinicalAcademy({ onXP }:{ onXP?:(n:number)=>void }) {
  const [view, setView]           = useState<'home'|'board'|'quiz'|'seminar'>('home')
  const [selectedBoard, setBoard] = useState<any>(null)
  const [selectedSeminar, setSeminar] = useState<any>(null)
  const [pressed, setPressed]     = useState<string|null>(null)
  const [activeTab, setActiveTab] = useState<'boards'|'seminars'>('boards')

  if(view==='quiz' && selectedBoard)
    return <MCQQuiz board={selectedBoard} onClose={()=>setView('home')} onXP={onXP}/>

  if(view==='seminar' && selectedSeminar)
    return <SlideViewer topic={selectedSeminar} onClose={()=>setView('home')} onXP={onXP}/>

  return (
    <div style={{minHeight:'100vh',background:L.canvas,paddingBottom:120,
      fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif'}}>

      {/* Hero */}
      <div style={{position:'relative',height:210,overflow:'hidden'}}>
        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
          alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(15,23,42,0.2),rgba(15,23,42,0.92))'}}/>
        <div style={{position:'absolute',top:16,left:16,background:'rgba(30,64,175,0.2)',backdropFilter:'blur(12px)',border:'1px solid rgba(30,64,175,0.3)',borderRadius:99,padding:'5px 14px'}}>
          <span style={{fontSize:10,fontWeight:700,color:'white',letterSpacing:1}}>MRCP · USMLE · PACES · BASIC SCIENCES</span>
        </div>
        <div style={{position:'absolute',bottom:16,left:16,right:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:'rgba(255,255,255,0.7)',marginBottom:6}}>AI-POWERED · EVIDENCE-BASED · 2026</div>
          <div style={{fontSize:26,fontWeight:900,color:'white',letterSpacing:-0.6,marginBottom:4}}>🎓 Clinical Academy</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.75)'}}>Board prep · AI MCQs · Seminars · Basic Sciences</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,padding:'14px 16px 0'}}>
        {[
          {label:'Questions',value:'9,700+',color:L.cobalt},
          {label:'Seminars', value:'50+',   color:L.violet},
          {label:'AI Powered',value:'100%', color:L.teal},
        ].map(s=>(
          <div key={s.label} style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:14,padding:'12px 8px',textAlign:'center',boxShadow:L.shadowSm}}>
            <div style={{fontSize:18,fontWeight:900,color:s.color}}>{s.value}</div>
            <div style={{fontSize:10,color:L.textMuted,fontWeight:600,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,margin:'14px 16px 0',background:L.raised,borderRadius:16,padding:4,border:`1px solid ${L.border}`}}>
        {(['boards','seminars'] as const).map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{
            flex:1,padding:'10px',borderRadius:12,border:'none',cursor:'pointer',
            background:activeTab===t?L.gradient:'transparent',
            color:activeTab===t?'white':L.textMuted,
            fontSize:12,fontWeight:700,transition:spring,
            boxShadow:activeTab===t?L.shadowGlow:'none',
          }}>
            {t==='boards'?'📋 Board Exams':'🎤 Seminars'}
          </button>
        ))}
      </div>

      <div style={{padding:'14px 16px'}}>

        {activeTab==='boards' && (
          <>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:10}}>SELECT EXAM</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {BOARDS.map(board=>(
                <div key={board.id} style={{background:L.surface,border:`1px solid ${L.border}`,borderRadius:20,overflow:'hidden',boxShadow:L.shadowSm}}>
                  {/* Board header */}
                  <div style={{position:'relative',height:100,overflow:'hidden'}}>
                    <img src={board.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    <div style={{position:'absolute',inset:0,background:`linear-gradient(to bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.85))`}}/>
                    <div style={{position:'absolute',bottom:10,left:14,right:14,display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontSize:16,fontWeight:900,color:'white'}}>{board.flag} {board.name}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.7)'}}>{board.desc.split('·')[0]}</div>
                      </div>
                      <div style={{background:`${board.color}30`,backdropFilter:'blur(8px)',border:`1px solid ${board.color}50`,borderRadius:99,padding:'3px 10px'}}>
                        <span style={{fontSize:10,fontWeight:800,color:board.color === L.red ? '#FCA5A5' : 'white'}}>Pass: {board.pasRate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Topics */}
                  <div style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
                      {board.topics.slice(0,4).map(t=>(
                        <span key={t} style={{fontSize:10,fontWeight:600,color:board.color,background:`${board.color}10`,borderRadius:99,padding:'2px 8px'}}>{t}</span>
                      ))}
                      {board.topics.length>4 && <span style={{fontSize:10,color:L.textMuted}}>+{board.topics.length-4} more</span>}
                    </div>

                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                      <button onClick={()=>{setBoard(board);setView('quiz')}}
                        onMouseDown={()=>setPressed('quiz'+board.id)} onMouseUp={()=>setPressed(null)}
                        style={{
                          padding:'11px',borderRadius:12,border:'none',cursor:'pointer',
                          background:`${board.color}`,color:'white',
                          fontSize:12,fontWeight:700,
                          transform:pressed===('quiz'+board.id)?'scale(0.96)':'scale(1)',
                          transition:spring,
                          boxShadow:`0 4px 12px ${board.color}30`,
                        }}>
                        🧪 Start MCQs
                      </button>
                      <button
                        onMouseDown={()=>setPressed('note'+board.id)} onMouseUp={()=>setPressed(null)}
                        style={{
                          padding:'11px',borderRadius:12,border:`1px solid ${board.color}30`,cursor:'pointer',
                          background:`${board.color}08`,color:board.color,
                          fontSize:12,fontWeight:700,
                          transform:pressed===('note'+board.id)?'scale(0.96)':'scale(1)',
                          transition:spring,
                        }}>
                        📖 {board.notes} Notes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab==='seminars' && (
          <>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:L.textMuted,marginBottom:10}}>AI-GENERATED SEMINARS</div>
            <div style={{background:'rgba(124,58,237,0.06)',border:'1px solid rgba(124,58,237,0.15)',borderRadius:14,padding:'12px 14px',marginBottom:14}}>
              <div style={{fontSize:12,color:L.violet,fontWeight:600,lineHeight:1.6}}>
                🤖 AI generates professional slides for each seminar — Apple Health style, evidence-based, 2026 guidelines. New topics added weekly.
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {SEMINAR_TOPICS.map(seminar=>(
                <div key={seminar.id}
                  onClick={()=>{setSeminar(seminar);setView('seminar')}}
                  onMouseDown={()=>setPressed(seminar.id)} onMouseUp={()=>setPressed(null)}
                  style={{
                    display:'flex',alignItems:'center',gap:14,
                    background:L.surface,border:`1px solid ${L.border}`,
                    borderLeft:`4px solid ${seminar.color}`,
                    borderRadius:18,padding:'14px 16px',cursor:'pointer',
                    transform:pressed===seminar.id?'scale(0.97)':'scale(1)',
                    transition:spring,boxShadow:L.shadowSm,
                  }}>
                  <div style={{width:48,height:48,borderRadius:14,background:`${seminar.color}10`,border:`1px solid ${seminar.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
                    {seminar.icon}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:L.textPrimary,marginBottom:3}}>{seminar.title}</div>
                    <div style={{fontSize:11,color:L.textMuted}}>{seminar.specialty} · {seminar.duration} · {seminar.slides} slides</div>
                  </div>
                  <div style={{fontSize:18,color:L.textMuted}}>›</div>
                </div>
              ))}
              <div style={{textAlign:'center',padding:'12px 0'}}>
                <div style={{fontSize:12,color:L.textMuted}}>More seminars generated on demand by AI 🤖</div>
              </div>
            </div>
          </>
        )}

        <div style={{marginTop:16,padding:'12px 16px',background:'rgba(245,183,49,0.08)',border:'1px solid rgba(245,183,49,0.3)',borderRadius:16}}>
          <div style={{fontSize:11,color:'#92400E',fontWeight:600,lineHeight:1.6}}>
            ⚠️ Educational content only. Always refer to official exam guidelines and syllabi for exam preparation.
          </div>
        </div>
      </div>
    </div>
  )
}
