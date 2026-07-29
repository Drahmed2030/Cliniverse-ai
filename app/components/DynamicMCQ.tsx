'use client'
import { useState, useEffect, useCallback } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  bg:     'linear-gradient(160deg,#2a5068 0%,#1e3d52 50%,#1a3a50 100%)',
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

// ── SVG SPECIALTY ICONS ──
const SpecialtyIcon = ({ id, color, size=24 }: { id:string, color:string, size?:number }) => {
  const icons: Record<string, JSX.Element> = {
    'Cardiology': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 20C12 20 3 13.5 3 8C3 5.5 5 4 7.5 4C9.5 4 11 5.2 12 6.5C13 5.2 14.5 4 16.5 4C19 4 21 5.5 21 8C21 13.5 12 20 12 20Z" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.15"/><path d="M2 12L5.5 12L7 9L9.5 16L11.5 11L13 13.5L14.5 12L22 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    'Emergency Medicine': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.1"/><path d="M12 6L12 18M6 12L18 12" stroke={color} strokeWidth="2.5" strokeLinecap="round"/></svg>,
    'Internal Medicine': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.1"/><path d="M5 20C5 17 8 15 12 15C16 15 19 17 19 20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="8" r="1.5" fill={color}/></svg>,
    'Neurology': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><ellipse cx="9" cy="12" rx="5" ry="7" stroke={color} strokeWidth="1.6" fill={color} fillOpacity="0.1"/><ellipse cx="15" cy="12" rx="5" ry="7" stroke={color} strokeWidth="1.6" fill={color} fillOpacity="0.1"/><circle cx="9" cy="9" r="1.2" fill={color}/><circle cx="15" cy="15" r="1.2" fill={color}/></svg>,
    'Respiratory': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 4L12 12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M12 12C12 12 6 10 5 15C4 20 8 22 11 20C12 19.5 12 17 12 12Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5"/><path d="M12 12C12 12 18 10 19 15C20 20 16 22 13 20C12 19.5 12 17 12 12Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5"/></svg>,
    'Gastroenterology': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 5C9 5 6.5 8 6.5 12C6.5 16 8.5 17.5 8.5 20C8.5 21.5 10 22.5 12 22.5C14 22.5 15.5 21.5 15.5 20C15.5 17.5 17.5 16 17.5 12C17.5 8 15 5 15 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill={color} fillOpacity="0.1"/><line x1="9" y1="5" x2="15" y2="5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>,
    'Nephrology': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M8.5 5.5C6 7.5 5 11 6 14C7 17 9.5 19 11.5 21C12.5 22 13 23 13 23C13 23 13.5 22 14.5 21C16.5 19 19 17 20 14C21 11 20 7.5 17.5 5.5C15.5 4 14 5 13 6.5C12 5 10.5 4 8.5 5.5Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.6"/><circle cx="13" cy="12" r="2.5" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.3"/></svg>,
    'Endocrinology': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" strokeOpacity="0.4"/><circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="1.3" strokeOpacity="0.7" strokeDasharray="3 2"/><circle cx="12" cy="12" r="2" fill={color}/><line x1="12" y1="4" x2="12" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="4" y1="12" x2="7" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="17" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    'Infectious Disease': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.5" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.3"/>{[0,45,90,135,180,225,270,315].map((a,i)=>{const r=Math.PI*a/180,x=12+7.5*Math.cos(r),y=12+7.5*Math.sin(r);return <circle key={i} cx={x} cy={y} r="1.5" fill={color} fillOpacity="0.7"/>})}<circle cx="12" cy="12" r="1.5" fill={color}/></svg>,
    'Haematology': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 4C12 4 7 9 7 15C7 18.5 9.2 22 12 22C14.8 22 17 18.5 17 15C17 9 12 4 12 4Z" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="1.6"/><circle cx="12" cy="16" r="2.5" fill={color} fillOpacity="0.6"/></svg>,
    'Rheumatology': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="19" rx="5" ry="3" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.1"/><line x1="12" y1="16" x2="12" y2="7" stroke={color} strokeWidth="2.2" strokeLinecap="round"/><line x1="9" y1="11" x2="12" y2="7" stroke={color} strokeWidth="1.6" strokeLinecap="round"/><line x1="15" y1="11" x2="12" y2="7" stroke={color} strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="7" r="2" fill={color} fillOpacity="0.6"/></svg>,
    'Psychiatry': <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 4C9 4 7 7 7 10C7 13 9 15 9 17L9 20L15 20L15 17C15 15 17 13 17 10C17 7 15 4 12 4Z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5"/><line x1="10" y1="20" x2="14" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="11" y1="22" x2="13" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  }
  return icons[id] || <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="16.5" r="0.8" fill={color}/></svg>
}

const SPECIALTIES = [
  { id:'Cardiology',        color:'#FF3B30' },
  { id:'Emergency Medicine',color:'#FF9500' },
  { id:'Internal Medicine', color:'#00C4B4' },
  { id:'Neurology',         color:'#AF52DE' },
  { id:'Respiratory',       color:'#64D2FF' },
  { id:'Gastroenterology',  color:'#34C759' },
  { id:'Nephrology',        color:'#007AFF' },
  { id:'Endocrinology',     color:'#D4A847' },
  { id:'Infectious Disease',color:'#FF6B35' },
  { id:'Haematology',       color:'#FF3B30' },
  { id:'Rheumatology',      color:'#C084FC' },
  { id:'Psychiatry',        color:'#00C4B4' },
]

const EXAM_TYPES = [
  { id:'Saudi Board', label:'Saudi Board',  short:'KSA' },
  { id:'Arab Board',  label:'Arab Board',   short:'Arab' },
  { id:'USMLE Step 2',label:'USMLE',        short:'USMLE' },
  { id:'MRCPI',       label:'MRCPI',        short:'MRCPI' },
  { id:'MRCP UK',     label:'MRCP UK',      short:'MRCP' },
  { id:'PLAB',        label:'PLAB 1-2',     short:'PLAB' },
]

const DIFFICULTIES = [
  { id:'Easy',   label:'Foundation',    color:'#34C759' },
  { id:'Medium', label:'Intermediate',  color:'#FF9500' },
  { id:'Hard',   label:'Advanced',      color:'#FF3B30' },
]

interface Question {
  id: string
  specialty: string
  difficulty: string
  examType: string
  vignette: string
  question: string
  options: { id:string, text:string }[]
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
  bestStreak: number
  xpEarned: number
}

// ── PROGRESS RING ──
const ProgressRing = ({ pct, color }: { pct:number, color:string }) => {
  const r = 18, c = 2*Math.PI*r
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${(pct/100)*c} ${c}`} strokeDashoffset={c*0.25}
        strokeLinecap="round" style={{filter:`drop-shadow(0 0 4px ${color}88)`}}/>
      <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="800" fill={color} fontFamily={F}>
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

// ── SETUP SCREEN ──
function SetupScreen({ onStart }: { onStart:(config:{specialty:string,exam:string,difficulty:string})=>void }) {
  const [specialty, setSpecialty] = useState('Cardiology')
  const [exam, setExam]         = useState('Saudi Board')
  const [diff, setDiff]         = useState('Medium')
  const [visible, setVisible]   = useState(false)

  useEffect(() => { setTimeout(()=>setVisible(true), 80) }, [])

  const selSpec = SPECIALTIES.find(s=>s.id===specialty)!
  const selDiff = DIFFICULTIES.find(d=>d.id===diff)!

  return (
    <div style={{ fontFamily:F, opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(20px)', transition:'all 0.4s ease' }}>

      {/* Header */}
      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:10, color:`${T.teal}CC`, fontWeight:700, letterSpacing:1.5, marginBottom:4 }}>AI-POWERED</div>
        <div style={{ fontSize:24, fontWeight:900, color:T.text, letterSpacing:-0.5, lineHeight:1.1 }}>
          Dynamic MCQ
        </div>
        <div style={{ fontSize:12, color:T.sub, marginTop:4, lineHeight:1.5 }}>
          Claude AI generates unique board-style questions — no repeats, always evidence-based.
        </div>
      </div>

      {/* Tags */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:22 }}>
        {['Infinite Questions','No Repeats','AI Explained','Evidence-Based'].map(tag=>(
          <span key={tag} style={{ background:`${T.teal}18`, border:`1px solid ${T.teal}35`, color:T.teal, borderRadius:20, padding:'4px 12px', fontSize:10, fontWeight:700 }}>{tag}</span>
        ))}
      </div>

      {/* Specialty */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:10, color:T.muted, fontWeight:700, letterSpacing:1.5, marginBottom:10 }}>SPECIALTY</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {SPECIALTIES.map(s => {
            const isSel = specialty === s.id
            return (
              <button key={s.id} onClick={()=>setSpecialty(s.id)} style={{
                background: isSel ? `${s.color}18` : T.glass2,
                backdropFilter:'blur(20px)',
                border:`1.5px solid ${isSel ? s.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius:16, padding:'12px 6px 10px', cursor:'pointer',
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                boxShadow: isSel ? `0 0 16px ${s.color}35` : 'none',
                transition:'all 0.2s',
                fontFamily:F,
              }}>
                <SpecialtyIcon id={s.id} color={isSel ? s.color : 'rgba(238,246,250,0.35)'} size={26}/>
                <span style={{ fontSize:9, fontWeight:isSel?800:500, color:isSel?s.color:'rgba(238,246,250,0.45)', textAlign:'center', lineHeight:1.2 }}>
                  {s.id.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Exam Type */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:10, color:T.muted, fontWeight:700, letterSpacing:1.5, marginBottom:10 }}>EXAM TYPE</div>
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
          {EXAM_TYPES.map(e => {
            const isSel = exam === e.id
            return (
              <button key={e.id} onClick={()=>setExam(e.id)} style={{
                flexShrink:0,
                background: isSel ? `${T.blue}20` : T.glass2,
                backdropFilter:'blur(20px)',
                border:`1.5px solid ${isSel ? T.blue : 'rgba(255,255,255,0.08)'}`,
                borderRadius:14, padding:'9px 14px', cursor:'pointer',
                fontFamily:F, transition:'all 0.2s',
                boxShadow: isSel ? `0 0 14px ${T.blue}30` : 'none',
              }}>
                <div style={{ fontSize:12, fontWeight:800, color:isSel?T.blue:T.sub }}>{e.label}</div>
                <div style={{ fontSize:9, color:isSel?`${T.blue}AA`:T.muted, marginTop:1 }}>{e.short}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, color:T.muted, fontWeight:700, letterSpacing:1.5, marginBottom:10 }}>DIFFICULTY</div>
        <div style={{ display:'flex', gap:8 }}>
          {DIFFICULTIES.map(d => {
            const isSel = diff === d.id
            return (
              <button key={d.id} onClick={()=>setDiff(d.id)} style={{
                flex:1,
                background: isSel ? `${d.color}18` : T.glass2,
                backdropFilter:'blur(20px)',
                border:`1.5px solid ${isSel ? d.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius:14, padding:'12px 8px', cursor:'pointer',
                fontFamily:F, transition:'all 0.2s', textAlign:'center',
                boxShadow: isSel ? `0 0 14px ${d.color}30` : 'none',
              }}>
                <div style={{ fontSize:13, fontWeight:800, color:isSel?d.color:T.sub }}>{d.id}</div>
                <div style={{ fontSize:9, color:isSel?`${d.color}AA`:T.muted, marginTop:2 }}>{d.label}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Start Button */}
      <button onClick={()=>onStart({specialty, exam, difficulty:diff})} style={{
        width:'100%', padding:'16px',
        background:`linear-gradient(135deg,${selSpec.color},${selSpec.color}CC)`,
        border:'none', borderRadius:18, color:'#fff',
        fontSize:16, fontWeight:900, cursor:'pointer', fontFamily:F,
        boxShadow:`0 8px 32px ${selSpec.color}44`,
        letterSpacing:-0.3, marginBottom:8,
      }}>
        Start {specialty} — {diff} Level →
      </button>

      <div style={{ textAlign:'center', fontSize:11, color:T.muted }}>
        Questions generated in real-time by Claude AI
      </div>
    </div>
  )
}

// ── QUESTION CARD ──
function QuestionCard({
  question, onAnswer, selectedAnswer, showExplanation, stats, onNext, isPro, onUpgrade
}: {
  question: Question
  onAnswer: (id:string)=>void
  selectedAnswer: string|null
  showExplanation: boolean
  stats: SessionStats
  onNext: ()=>void
  isPro: boolean
  onUpgrade: ()=>void
}) {
  const [expVisible, setExpVisible] = useState(false)
  const spec = SPECIALTIES.find(s=>s.id===question.specialty)
  const diff = DIFFICULTIES.find(d=>d.id===question.difficulty)
  const isCorrect = selectedAnswer === question.correctOption

  useEffect(() => {
    if (showExplanation) setTimeout(()=>setExpVisible(true), 300)
    else setExpVisible(false)
  }, [showExplanation])

  const accuracy = stats.total > 0 ? Math.round((stats.correct/stats.total)*100) : 0

  return (
    <div style={{ fontFamily:F }}>

      {/* Stats bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <ProgressRing pct={accuracy} color={spec?.color||T.teal}/>
        <div style={{ flex:1, display:'flex', gap:10 }}>
          {[
            { l:'Correct',  v:stats.correct, c:T.green },
            { l:'Total',    v:stats.total,   c:T.blue },
            { l:'Streak',   v:stats.streak,  c:T.orange },
            { l:'XP',       v:`+${stats.xpEarned}`, c:T.gold },
          ].map(s=>(
            <div key={s.l} style={{ flex:1, textAlign:'center' }}>
              <div style={{ fontSize:14, fontWeight:900, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:8, color:T.muted, fontWeight:600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Meta badges */}
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, background:`${spec?.color||T.teal}18`, border:`1px solid ${spec?.color||T.teal}35`, borderRadius:20, padding:'4px 10px' }}>
          <SpecialtyIcon id={question.specialty} color={spec?.color||T.teal} size={14}/>
          <span style={{ fontSize:10, color:spec?.color||T.teal, fontWeight:700 }}>{question.specialty}</span>
        </div>
        <div style={{ background:`${diff?.color||T.orange}18`, border:`1px solid ${diff?.color||T.orange}35`, borderRadius:20, padding:'4px 10px' }}>
          <span style={{ fontSize:10, color:diff?.color||T.orange, fontWeight:700 }}>{question.examType} · {question.difficulty}</span>
        </div>
        {question.fromCache && (
          <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:20, padding:'4px 10px' }}>
            <span style={{ fontSize:10, color:T.muted, fontWeight:600 }}>⚡ Cached</span>
          </div>
        )}
      </div>

      {/* Question card */}
      <div style={{
        background: T.glass,
        backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
        border:`1.5px solid ${spec?.color||T.teal}25`,
        borderRadius:22, padding:'20px',
        marginBottom:14,
        position:'relative', overflow:'hidden',
        boxShadow:`0 8px 32px rgba(0,0,0,0.20), 0 0 16px ${spec?.color||T.teal}12`,
      }}>
        {/* Ambient */}
        <div style={{ position:'absolute', top:-40, right:-40, width:140, height:140, borderRadius:'50%', background:`radial-gradient(circle,${spec?.color||T.teal}14,transparent 70%)`, pointerEvents:'none' }}/>

        {/* Vignette */}
        {question.vignette && (
          <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'12px 14px', marginBottom:14, border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:1, marginBottom:6 }}>CLINICAL VIGNETTE</div>
            <div style={{ fontSize:13, color:T.sub, lineHeight:1.7 }}>{question.vignette}</div>
          </div>
        )}

        {/* Question */}
        <div style={{ fontSize:15, fontWeight:800, color:T.text, lineHeight:1.6 }}>
          {question.question}
        </div>
      </div>

      {/* Answer options */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
        {question.options.map((opt, i) => {
          const isSelected = selectedAnswer === opt.id
          const isCorrectOpt = opt.id === question.correctOption
          const answered = selectedAnswer !== null

          let bg = T.glass
          let border = 'rgba(255,255,255,0.10)'
          let textColor = T.text
          let glow = 'none'

          if (answered) {
            if (isCorrectOpt) {
              bg = 'rgba(52,199,89,0.14)'
              border = '#34C759'
              glow = '0 0 16px rgba(52,199,89,0.25)'
            } else if (isSelected && !isCorrectOpt) {
              bg = 'rgba(255,59,48,0.14)'
              border = '#FF3B30'
              glow = '0 0 16px rgba(255,59,48,0.20)'
            }
          }

          return (
            <button key={opt.id} onClick={()=>!answered && onAnswer(opt.id)} style={{
              background: bg,
              backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
              border:`1.5px solid ${border}`,
              borderRadius:18, padding:'14px 16px',
              cursor: answered ? 'default' : 'pointer',
              display:'flex', alignItems:'center', gap:12, textAlign:'left',
              boxShadow: glow, fontFamily:F,
              transition:'all 0.25s ease',
              transform: isSelected && answered ? 'scale(1.01)' : 'scale(1)',
            }}>
              {/* Option letter */}
              <div style={{
                width:32, height:32, borderRadius:10, flexShrink:0,
                background: answered && isCorrectOpt ? 'rgba(52,199,89,0.20)' :
                            answered && isSelected ? 'rgba(255,59,48,0.20)' : 'rgba(255,255,255,0.07)',
                border:`1px solid ${answered && isCorrectOpt ? '#34C759' : answered && isSelected ? '#FF3B30' : 'rgba(255,255,255,0.12)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:900,
                color: answered && isCorrectOpt ? '#34C759' : answered && isSelected ? '#FF3B30' : T.sub,
              }}>
                {answered && isCorrectOpt ? '✓' : answered && isSelected ? '✗' : opt.id.toUpperCase()}
              </div>
              {/* Option text */}
              <div style={{ flex:1, fontSize:13, fontWeight:600, color:textColor, lineHeight:1.5 }}>
                {opt.text}
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div style={{
          opacity: expVisible ? 1 : 0,
          transform: expVisible ? 'translateY(0)' : 'translateY(16px)',
          transition:'all 0.4s ease',
          background: isCorrect ? 'rgba(52,199,89,0.08)' : 'rgba(255,59,48,0.08)',
          border:`1.5px solid ${isCorrect ? '#34C759' : '#FF3B30'}35`,
          borderRadius:20, padding:'18px',
          marginBottom:14,
          position:'relative', overflow:'hidden',
        }}>
          {/* Result badge */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{
              width:36, height:36, borderRadius:11,
              background: isCorrect ? 'rgba(52,199,89,0.20)' : 'rgba(255,59,48,0.20)',
              border:`1.5px solid ${isCorrect ? '#34C759' : '#FF3B30'}`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            }}>{isCorrect ? '✅' : '❌'}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:900, color:isCorrect?'#34C759':'#FF3B30' }}>
                {isCorrect ? 'Correct! +10 XP' : 'Incorrect'}
              </div>
              <div style={{ fontSize:10, color:T.sub }}>
                Correct answer: <strong style={{color:T.text}}>{question.correctOption.toUpperCase()}</strong>
              </div>
            </div>
          </div>

          {/* Explanation content */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div>
              <div style={{ fontSize:9, color:T.muted, fontWeight:700, letterSpacing:1, marginBottom:4 }}>EXPLANATION</div>
              <div style={{ fontSize:13, color:T.sub, lineHeight:1.7 }}>{question.explanation.summary}</div>
            </div>
            {question.explanation.keyTakeaway && (
              <div style={{ background:'rgba(212,168,71,0.10)', border:'1px solid rgba(212,168,71,0.25)', borderRadius:12, padding:'10px 14px' }}>
                <div style={{ fontSize:9, color:T.gold, fontWeight:700, letterSpacing:1, marginBottom:4 }}>⭐ KEY TAKEAWAY</div>
                <div style={{ fontSize:12, color:T.sub, lineHeight:1.6 }}>{question.explanation.keyTakeaway}</div>
              </div>
            )}
            {question.explanation.guideline && (
              <div style={{ fontSize:10, color:T.muted, fontStyle:'italic' }}>
                📖 Guideline: {question.explanation.guideline}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next button */}
      {showExplanation && (
        <button onClick={onNext} style={{
          width:'100%', padding:'15px',
          background:`linear-gradient(135deg,${spec?.color||T.teal},${spec?.color||T.teal}CC)`,
          border:'none', borderRadius:18, color:'#fff',
          fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:F,
          boxShadow:`0 6px 24px ${spec?.color||T.teal}40`,
          letterSpacing:-0.3,
        }}>
          Next Question →
        </button>
      )}
    </div>
  )
}

// ── MAIN COMPONENT ──
interface Props {
  isPro?: boolean
  onXP?: (n:number)=>void
  mcqCorrect?: number
  setMcqCorrect?: (n:number)=>void
  mcqTotal?: number
  setMcqTotal?: (n:number)=>void
}

export default function DynamicMCQ({ isPro=false, onXP, mcqCorrect=0, setMcqCorrect, mcqTotal=0, setMcqTotal }: Props) {
  const [screen, setScreen] = useState<'setup'|'question'|'result'>('setup')
  const [config, setConfig] = useState<{specialty:string,exam:string,difficulty:string}|null>(null)
  const [question, setQuestion] = useState<Question|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState<string|null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [stats, setStats] = useState<SessionStats>({ total:0, correct:0, streak:0, bestStreak:0, xpEarned:0 })
  const [questionCount, setQuestionCount] = useState(0)
  const cacheRef = useRef<Question[]>([])

  const generateQuestion = useCallback(async (cfg: typeof config) => {
    if (!cfg) return
    setLoading(true)
    setError('')
    setSelectedAnswer(null)
    setShowExplanation(false)

    // Use cache if available
    if (cacheRef.current.length > 0) {
      const cached = cacheRef.current.shift()!
      cached.fromCache = true
      setQuestion(cached)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/exam', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ specialty:cfg.specialty, examType:cfg.exam, difficulty:cfg.difficulty }),
      })
      if (!res.ok) throw new Error('Failed to generate question')
      const q = await res.json()
      setQuestion(q)
    } catch (e) {
      setError('Failed to generate question. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleStart = (cfg: {specialty:string,exam:string,difficulty:string}) => {
    setConfig(cfg)
    setScreen('question')
    setStats({ total:0, correct:0, streak:0, bestStreak:0, xpEarned:0 })
    setQuestionCount(0)
    generateQuestion(cfg)
  }

  const handleAnswer = (id: string) => {
    if (!question) return
    setSelectedAnswer(id)
    setShowExplanation(true)
    const correct = id === question.correctOption
    const xp = correct ? 10 : 2
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (correct?1:0),
      streak: correct ? prev.streak+1 : 0,
      bestStreak: Math.max(prev.bestStreak, correct ? prev.streak+1 : prev.streak),
      xpEarned: prev.xpEarned + xp,
    }))
    if (correct) {
      setMcqCorrect?.(mcqCorrect+1)
      onXP?.(xp)
    }
    setMcqTotal?.(mcqTotal+1)
  }

  const handleNext = () => {
    setQuestionCount(n=>n+1)
    generateQuestion(config)
  }

  // Loading state
  if (screen === 'question' && loading) return (
    <div style={{ fontFamily:F, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:16 }}>
      <div style={{ width:56, height:56, borderRadius:'50%', background:`${T.teal}18`, border:`2px solid ${T.teal}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, animation:'spin 2s linear infinite' }}>🧠</div>
      <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Generating question...</div>
      <div style={{ fontSize:11, color:T.muted }}>Claude AI is thinking</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Error state
  if (error) return (
    <div style={{ fontFamily:F, textAlign:'center', padding:24 }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
      <div style={{ fontSize:14, color:T.red, marginBottom:16 }}>{error}</div>
      <button onClick={()=>generateQuestion(config)} style={{ background:T.glass, border:`1px solid ${T.border}`, borderRadius:14, padding:'10px 20px', color:T.text, fontFamily:F, cursor:'pointer', fontWeight:700 }}>Try Again</button>
    </div>
  )

  return (
    <div style={{ fontFamily:F }}>
      {screen === 'setup' && <SetupScreen onStart={handleStart}/>}
      {screen === 'question' && question && (
        <QuestionCard
          question={question}
          onAnswer={handleAnswer}
          selectedAnswer={selectedAnswer}
          showExplanation={showExplanation}
          stats={stats}
          onNext={handleNext}
          isPro={isPro}
          onUpgrade={()=>{}}
        />
      )}
    </div>
  )
}
