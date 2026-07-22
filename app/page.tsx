'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [screen, setScreen] = useState('ob')
  const [obIndex, setObIndex] = useState(0)
  const [tab, setTab] = useState('home')
  const [activeDept, setActiveDept] = useState('')
  const [activeCase, setActiveCase] = useState('')
  const [activeRef, setActiveRef] = useState('')
  const [time, setTime] = useState('')
  const [hr, setHr] = useState(72)
  const [spo2, setSpo2] = useState(98)
  const [caseStep, setCaseStep] = useState(0)
  const [selected, setSelected] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [dailyDone, setDailyDone] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [streakAnim, setStreakAnim] = useState(false)

  useEffect(() => {
    const t = () => {
      const n = new Date()
      setTime(n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0'))
      const midnight = new Date(); midnight.setHours(24,0,0,0)
      const diff = midnight.getTime() - n.getTime()
      const h = Math.floor(diff/3600000); const m = Math.floor((diff%3600000)/60000)
      setCountdown(`${h}h ${m}m`)
    }
    t(); const id = setInterval(t,1000); return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setHr(70 + Math.floor(Math.random()*8))
      setSpo2(97 + Math.floor(Math.random()*2))
    }, 1200)
    return () => clearInterval(id)
  }, [])

  const ranks = ['Medical Student','Junior Resident','Senior Resident','Registrar','Consultant','Chief']
  const rankColors = ['#888','#5AC8FA','#007AFF','#AF52DE','#FF9500','#FFD700']
  const currentRank = 2
  const currentXP = 340

  const departments = [
    { id:'ed', icon:'🚨', name:'Emergency', color:'#FF3B30', sub:'6 cases' },
    { id:'ccu', icon:'❤️', name:'CCU', color:'#FF9500', sub:'4 cases' },
    { id:'icu', icon:'💊', name:'ICU', color:'#007AFF', sub:'3 cases' },
    { id:'peds', icon:'👶', name:'Pediatrics', color:'#34C759', sub:'2 cases' },
    { id:'sports', icon:'⚽', name:'Sports Medicine', color:'#5AC8FA', sub:'4 cases' },
    { id:'opd', icon:'🏥', name:'OPD Clinic', color:'#AF52DE', sub:'2 cases' },
  ]

  const quickRefs = [
    { id:'sepsis', icon:'🦠', title:'Sepsis-3 Criteria', color:'#FF3B30', content:[
      { label:'SIRS replaced by', value:'SOFA score ≥2' },
      { label:'Septic Shock', value:'Vasopressors + Lactate >2' },
      { label:'1st Hour Bundle', value:'Blood Cx, Lactate, Fluids, Abx' },
      { label:'Abx target', value:'Within 1 hour' },
      { label:'Fluid resus', value:'30 mL/kg crystalloid' },
      { label:'MAP target', value:'>65 mmHg' },
    ]},
    { id:'stemi_ref', icon:'❤️', title:'STEMI Management', color:'#FF9500', content:[
      { label:'Door-to-balloon', value:'<90 min (PCI center)' },
      { label:'Door-to-needle', value:'<30 min (thrombolysis)' },
      { label:'Aspirin', value:'300mg stat' },
      { label:'P2Y12', value:'Ticagrelor 180mg or Clopidogrel 600mg' },
      { label:'Anticoag', value:'Heparin UFH or Enoxaparin' },
      { label:'Contraindication', value:'Prior ICH, Active bleeding' },
    ]},
    { id:'afib', icon:'💓', title:'AF Rate Control', color:'#5856D6', content:[
      { label:'Target HR', value:'<110 bpm at rest' },
      { label:'1st line stable', value:'Bisoprolol or Metoprolol' },
      { label:'1st line unstable', value:'DC Cardioversion' },
      { label:'CHA2DS2-VASc', value:'Score ≥2 → Anticoagulate' },
      { label:'DOAC preferred', value:'Over Warfarin (non-valvular)' },
      { label:'Avoid in WPW', value:'AV nodal blockers contraindicated' },
    ]},
    { id:'pe', icon:'🫁', title:'PE Management', color:'#34C759', content:[
      { label:'Wells Score >4', value:'High probability PE' },
      { label:'PERC rule', value:'Exclude if all 8 criteria negative' },
      { label:'Imaging', value:'CTPA = gold standard' },
      { label:'Massive PE', value:'Systemic thrombolysis' },
      { label:'Submassive', value:'Anticoag ± catheter-directed Rx' },
      { label:'Anticoag', value:'LMWH or DOAC (stable)' },
    ]},
    { id:'htn_urgency', icon:'💢', title:'Hypertensive Emergency', color:'#AF52DE', content:[
      { label:'Definition', value:'SBP >180 + end organ damage' },
      { label:'Urgency', value:'SBP >180, no organ damage' },
      { label:'Target', value:'Reduce MAP by 20-25% in 1hr' },
      { label:'IV choice', value:'Labetalol, Nicardipine, Clevidipine' },
      { label:'Avoid', value:'Rapid reduction → stroke' },
      { label:'Exception', value:'Aortic dissection: SBP <120' },
    ]},
    { id:'aki', icon:'🫘', title:'AKI Classification', color:'#5AC8FA', content:[
      { label:'Stage 1', value:'Cr ×1.5 or UO <0.5ml/kg/h ×6h' },
      { label:'Stage 2', value:'Cr ×2 or UO <0.5ml/kg/h ×12h' },
      { label:'Stage 3', value:'Cr ×3 or UO <0.3ml/kg/h ×24h' },
      { label:'Prerenal', value:'FeNa <1%, BUN:Cr >20' },
      { label:'Intrinsic', value:'FeNa >2%, casts on UA' },
      { label:'RRT indications', value:'AEIOU mnemonic' },
    ]},
  ]

  const dailyCase = {
    title: 'Daily Challenge',
    subtitle: '45y Female · Sudden onset headache',
    tag: 'NEUROLOGY',
    question: 'A 45-year-old female presents with sudden onset severe headache — "worst headache of her life." BP 178/102, GCS 15, no focal neurology. What is the FIRST investigation?',
    choices: [
      { id:'a', text:'CT head non-contrast', correct: true },
      { id:'b', text:'MRI brain with contrast', correct: false },
      { id:'c', text:'Lumbar puncture immediately', correct: false },
      { id:'d', text:'IV antihypertensives first', correct: false },
    ],
    explanation: 'Thunderclap headache = subarachnoid hemorrhage until proven otherwise. CT head non-contrast is the FIRST step — sensitivity >95% within 6 hours. LP is done AFTER CT if CT is negative.',
    xp: 75,
  }

  const stemiChoices = [
    { id:'a', text:'Aspirin + Heparin + Cath Lab activation', correct: true },
    { id:'b', text:'Thrombolytics only', correct: false },
    { id:'c', text:'Observation and repeat ECG in 30 min', correct: false },
    { id:'d', text:'Beta blocker IV immediately', correct: false },
  ]

  const ecgSVG = (color: string, type = 'normal') => {
    let d = 'M 0 30'
    for (let i = 0; i < 20; i++) {
      const x = i * 16
      if (type === 'stemi') {
        if (i % 5 === 2) { d += ` L ${x+2} 30 L ${x+3} 2 L ${x+4} 55 L ${x+5} 30` }
        else { d += ` L ${x+16} 30` }
      } else {
        if (i % 5 === 2) { d += ` L ${x+2} 30 L ${x+3} 8 L ${x+4} 45 L ${x+5} 30` }
        else { d += ` L ${x+16} 30` }
      }
    }
    return <svg width="100%" height="50" viewBox="0 0 320 50" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2" style={{filter:`drop-shadow(0 0 4px ${color})`}}/>
    </svg>
  }

  // ONBOARDING
  if (screen === 'ob') {
    const slides = [
      { icon:'🏥', bg:'#007AFF', title:'Welcome to Cliniverse AI', sub:'The clinical companion built by a physician, for physicians worldwide.', img:'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80' },
      { icon:'⚡', bg:'#FF3B30', title:'Daily Case Challenge', sub:'One new case every 24 hours. Compete with doctors globally.', img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
      { icon:'📋', bg:'#34C759', title:'Quick Reference at Your Fingertips', sub:'Sepsis criteria, STEMI protocols, AKI staging — in seconds.', img:'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80' },
      { icon:'🏆', bg:'#FF9500', title:'Climb the Global Ranks', sub:'Earn XP, unlock badges, and reach Chief of Medicine.', img:'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80' },
    ]
    const sl = slides[obIndex]
    return (
      <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#fff',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 32px 40px',textAlign:'center'}}>
          <div style={{width:'100%',height:220,borderRadius:24,overflow:'hidden',marginBottom:28,position:'relative',boxShadow:`0 12px 40px ${sl.bg}40`}}>
            <img src={sl.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}}/>
            <div style={{position:'absolute',inset:0,background:`linear-gradient(to bottom, transparent 40%, ${sl.bg}dd)`}}/>
            <div style={{position:'absolute',bottom:16,left:16,fontSize:44}}>{sl.icon}</div>
          </div>
          <div style={{fontSize:26,fontWeight:700,marginBottom:14,letterSpacing:-0.5,lineHeight:1.2}}>{sl.title}</div>
          <div style={{fontSize:16,color:'#888',lineHeight:1.7,maxWidth:300}}>{sl.sub}</div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'center',padding:'0 0 24px'}}>
          {slides.map((_,i) => <div key={i} style={{height:8,borderRadius:4,background:i===obIndex?'#007AFF':'#E5E5EA',width:i===obIndex?24:8,transition:'all 0.3s'}} />)}
        </div>
        <div style={{padding:'0 24px 52px',display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={() => obIndex < 3 ? setObIndex(i=>i+1) : setScreen('app')} style={{background:obIndex===3?'#34C759':'#007AFF',color:'#fff',border:'none',borderRadius:16,padding:18,fontSize:17,fontWeight:600,cursor:'pointer',boxShadow:obIndex===3?'0 6px 24px #34C75950':'0 6px 24px #007AFF50'}}>
            {obIndex===3?'Start My Journey 🚀':'Continue'}
          </button>
          <button onClick={() => setScreen('app')} style={{background:'none',border:'none',color:'#888',fontSize:15,cursor:'pointer',padding:10}}>Skip for now</button>
        </div>
      </div>
    )
  }

  // QUICK REFERENCE DETAIL
  if (activeRef) {
    const ref = quickRefs.find(r => r.id === activeRef)
    if (!ref) return null
    return (
      <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:40}}>
        <div style={{background:'#fff',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
          <button style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer'}} onClick={() => setActiveRef('')}>← Back</button>
          <span style={{fontWeight:600,fontSize:16}}>{ref.title}</span>
        </div>
        <div style={{padding:20}}>
          <div style={{background:`linear-gradient(135deg,${ref.color},${ref.color}99)`,borderRadius:20,padding:20,marginBottom:20,color:'#fff',textAlign:'center',boxShadow:`0 8px 32px ${ref.color}40`}}>
            <div style={{fontSize:48,marginBottom:8}}>{ref.icon}</div>
            <div style={{fontSize:20,fontWeight:700}}>{ref.title}</div>
            <div style={{fontSize:13,opacity:0.8,marginTop:4}}>Quick Reference Card</div>
          </div>
          <div style={{background:'#fff',borderRadius:16,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {ref.content.map((item,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:i<ref.content.length-1?'0.5px solid #F2F2F7':'none'}}>
                <span style={{fontSize:14,color:'#888',flex:1}}>{item.label}</span>
                <span style={{fontSize:14,fontWeight:600,color:'#1C1C1E',flex:1,textAlign:'right'}}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{background:'#007AFF15',borderRadius:14,padding:14,marginTop:16,display:'flex',gap:10,alignItems:'flex-start'}}>
            <span style={{fontSize:20}}>💡</span>
            <div style={{fontSize:13,color:'#007AFF',lineHeight:1.6,fontWeight:500}}>This is a quick reference guide. Always apply clinical judgment and consult local protocols.</div>
          </div>
        </div>
      </div>
    )
  }

  // STEMI CASE
  if (activeCase === 'stemi') {
    return (
      <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:40}}>
        <div style={{background:'#fff',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
          <button style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer'}} onClick={() => { setActiveCase(''); setCaseStep(0); setSelected(''); setShowResult(false); setConfidence(0) }}>← Back</button>
          <span style={{fontWeight:600,fontSize:16}}>Anterior STEMI</span>
          <div style={{marginLeft:'auto',background:'#FF3B3015',color:'#FF3B30',fontSize:12,fontWeight:700,padding:'4px 10px',borderRadius:20}}>CRITICAL</div>
        </div>
        {caseStep === 0 && (
          <div style={{padding:20}}>
            <div style={{fontSize:24,fontWeight:700,marginBottom:4}}>Anterior STEMI</div>
            <div style={{fontSize:14,color:'#888',marginBottom:16}}>58y Male · Chest pain 45 min</div>
            <div style={{background:'#1C1C1E',borderRadius:20,padding:16,marginBottom:16}}>
              <div style={{fontSize:11,color:'#34C759',fontWeight:700,letterSpacing:1,marginBottom:12}}>LIVE VITALS</div>
              <div style={{display:'flex',gap:10,marginBottom:12}}>
                <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center'}}>
                  <div style={{fontSize:10,color:'#FF3B30',fontWeight:600}}>HR</div>
                  <div style={{fontSize:26,fontWeight:700,color:'#FF3B30',textShadow:'0 0 10px #FF3B30'}}>{hr}</div>
                  <div style={{fontSize:10,color:'#666'}}>bpm</div>
                </div>
                <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center'}}>
                  <div style={{fontSize:10,color:'#007AFF',fontWeight:600}}>BP</div>
                  <div style={{fontSize:20,fontWeight:700,color:'#007AFF',textShadow:'0 0 10px #007AFF'}}>90/60</div>
                  <div style={{fontSize:10,color:'#666'}}>mmHg</div>
                </div>
                <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center'}}>
                  <div style={{fontSize:10,color:'#34C759',fontWeight:600}}>SpO2</div>
                  <div style={{fontSize:26,fontWeight:700,color:'#34C759',textShadow:'0 0 10px #34C759'}}>{spo2}</div>
                  <div style={{fontSize:10,color:'#666'}}>%</div>
                </div>
              </div>
              <div style={{background:'#2C2C2E',borderRadius:12,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:'#FF3B30',fontWeight:600,marginBottom:6}}>ECG — ST Elevation V1-V4</div>
                {ecgSVG('#FF3B30','stemi')}
              </div>
            </div>
            <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:12,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#FF3B30',marginBottom:8}}>PATIENT HISTORY</div>
              <div style={{fontSize:14,color:'#333',lineHeight:1.7}}>58-year-old male with crushing chest pain radiating to left arm for 45 minutes. Diaphoretic and pale. PMH: HTN, T2DM, smoker.</div>
            </div>
            <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#5856D6',marginBottom:12}}>LAB RESULTS</div>
              {[['Troponin I','2.4 ng/mL','HIGH','#FF3B30'],['CK-MB','45 U/L','HIGH','#FF3B30'],['D-Dimer','0.3','Normal','#34C759']].map(([k,v,s,c])=>(
                <div key={String(k)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <span style={{fontSize:14,color:'#666'}}>{k}</span>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:14,fontWeight:700}}>{v}</span>
                    <span style={{fontSize:11,fontWeight:700,color:String(c),background:String(c)+'15',padding:'2px 8px',borderRadius:10}}>{s}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setCaseStep(1)} style={{background:'#FF3B30',color:'#fff',border:'none',borderRadius:16,padding:17,fontSize:16,fontWeight:600,width:'100%',cursor:'pointer',boxShadow:'0 6px 24px #FF3B3050'}}>
              Proceed to Management →
            </button>
          </div>
        )}
        {caseStep === 1 && (
          <div style={{padding:20}}>
            <div style={{fontSize:20,fontWeight:700,marginBottom:4}}>Clinical Decision</div>
            <div style={{fontSize:14,color:'#888',marginBottom:16}}>Select your confidence, then answer</div>
            <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:13,fontWeight:600,color:'#666',marginBottom:10,textTransform:'uppercase',letterSpacing:0.5}}>Confidence Level</div>
              <div style={{display:'flex',gap:8}}>
                {[['1','Not Sure','#888'],['2','Fairly Sure','#FF9500'],['3','Very Sure','#34C759']].map(([v,l,c])=>(
                  <div key={v} onClick={() => setConfidence(Number(v))} style={{flex:1,background:confidence===Number(v)?String(c)+'20':'#F2F2F7',border:`2px solid ${confidence===Number(v)?String(c):'transparent'}`,borderRadius:14,padding:'12px 6px',textAlign:'center',cursor:'pointer',transition:'all 0.2s'}}>
                    <div style={{fontSize:20,fontWeight:700,color:String(c)}}>{v}</div>
                    <div style={{fontSize:10,color:String(c),fontWeight:600,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {!showResult ? (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {stemiChoices.map(c => (
                  <button key={c.id} onClick={() => { if(confidence > 0) { setSelected(c.id); setShowResult(true) }}} style={{background:'#fff',border:`2px solid ${confidence>0?'#E5E5EA':'#F0F0F0'}`,borderRadius:16,padding:'16px',fontSize:14,fontWeight:500,textAlign:'left',cursor:confidence>0?'pointer':'not-allowed',opacity:confidence>0?1:0.5,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                    <span style={{fontWeight:700,color:'#007AFF',marginRight:10,fontSize:16}}>{c.id.toUpperCase()}.</span>{c.text}
                  </button>
                ))}
                {confidence === 0 && <div style={{fontSize:13,color:'#FF9500',textAlign:'center',padding:8}}>⚠️ Select confidence level first</div>}
              </div>
            ) : (
              <div>
                {stemiChoices.map(c => (
                  <div key={c.id} style={{background:c.correct?'#34C75915':c.id===selected?'#FF3B3015':'#fff',border:`2px solid ${c.correct?'#34C759':c.id===selected?'#FF3B30':'#E5E5EA'}`,borderRadius:16,padding:'16px',marginBottom:10,fontSize:14,display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontWeight:700,color:c.correct?'#34C759':c.id===selected?'#FF3B30':'#888',fontSize:16}}>{c.id.toUpperCase()}.</span>
                    <span style={{flex:1}}>{c.text}</span>
                    {c.correct && <span style={{fontSize:18}}>✅</span>}
                    {!c.correct && c.id===selected && <span style={{fontSize:18}}>❌</span>}
                  </div>
                ))}
                <div style={{background:'linear-gradient(135deg,#007AFF,#5856D6)',borderRadius:20,padding:24,textAlign:'center',color:'#fff',marginTop:8,boxShadow:'0 8px 32px #007AFF40'}}>
                  <div style={{fontSize:36,fontWeight:800}}>+{stemiChoices.find(c=>c.id===selected)?.correct ? Math.round(50*(confidence/3)) : 10} XP</div>
                  <div style={{fontSize:15,opacity:0.85,marginTop:6}}>{stemiChoices.find(c=>c.id===selected)?.correct ? '🎯 Excellent clinical decision!' : '📚 Review STEMI guidelines'}</div>
                </div>
                <div style={{background:'#fff',borderRadius:16,padding:16,marginTop:12,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#007AFF',marginBottom:8,textTransform:'uppercase',letterSpacing:0.5}}>Explanation</div>
                  <div style={{fontSize:14,color:'#333',lineHeight:1.8}}>Anterior STEMI requires immediate dual antiplatelet therapy (Aspirin 300mg + P2Y12), anticoagulation with Heparin, and primary PCI within 90 minutes. <strong>Time is muscle</strong> — every minute of delay = loss of cardiomyocytes.</div>
                </div>
                <button onClick={() => { setActiveCase(''); setCaseStep(0); setSelected(''); setShowResult(false); setConfidence(0) }} style={{background:'#F2F2F7',border:'none',borderRadius:16,padding:16,fontSize:15,fontWeight:600,width:'100%',marginTop:12,cursor:'pointer'}}>
                  ← Back to Cases
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // DAILY CHALLENGE
  if (activeCase === 'daily') {
    return (
      <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:40}}>
        <div style={{background:'#fff',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
          <button style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer'}} onClick={() => { setActiveCase(''); setSelected(''); setShowResult(false); setConfidence(0) }}>← Back</button>
          <span style={{fontWeight:600,fontSize:16}}>Daily Challenge</span>
          <div style={{marginLeft:'auto',fontSize:13,color:'#FF9500',fontWeight:600}}>⏰ {countdown}</div>
        </div>
        <div style={{padding:20}}>
          <div style={{background:'linear-gradient(135deg,#1C1C1E,#2C2C2E)',borderRadius:20,padding:20,marginBottom:16,color:'#fff'}}>
            <div style={{fontSize:11,color:'#FF9500',fontWeight:700,letterSpacing:1,marginBottom:8}}>TODAY'S CASE · {dailyCase.tag}</div>
            <div style={{fontSize:18,fontWeight:700,lineHeight:1.5,marginBottom:8}}>{dailyCase.subtitle}</div>
            <div style={{display:'flex',gap:16,fontSize:12,opacity:0.7}}>
              <span>🌍 Global Challenge</span>
              <span>⚡ +{dailyCase.xp} XP</span>
              <span>🔥 Streak Day</span>
            </div>
          </div>
          <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <div style={{fontSize:15,lineHeight:1.8,color:'#1C1C1E'}}>{dailyCase.question}</div>
          </div>
          <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <div style={{fontSize:13,fontWeight:600,color:'#666',marginBottom:10,textTransform:'uppercase',letterSpacing:0.5}}>Your Confidence</div>
            <div style={{display:'flex',gap:8}}>
              {[['1','Guessing','#888'],['2','Fairly Sure','#FF9500'],['3','Confident','#34C759']].map(([v,l,c])=>(
                <div key={v} onClick={() => setConfidence(Number(v))} style={{flex:1,background:confidence===Number(v)?String(c)+'20':'#F2F2F7',border:`2px solid ${confidence===Number(v)?String(c):'transparent'}`,borderRadius:14,padding:'10px 4px',textAlign:'center',cursor:'pointer'}}>
                  <div style={{fontSize:18,fontWeight:700,color:String(c)}}>{v}</div>
                  <div style={{fontSize:9,color:String(c),fontWeight:600,marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {!showResult ? (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {dailyCase.choices.map(c => (
                <button key={c.id} onClick={() => { if(confidence>0) { setSelected(c.id); setShowResult(true); setDailyDone(true); setStreakAnim(true); setTimeout(()=>setStreakAnim(false),2000) }}} style={{background:'#fff',border:`2px solid ${confidence>0?'#E5E5EA':'#F0F0F0'}`,borderRadius:16,padding:'16px',fontSize:14,fontWeight:500,textAlign:'left',cursor:confidence>0?'pointer':'not-allowed',opacity:confidence>0?1:0.5}}>
                  <span style={{fontWeight:700,color:'#007AFF',marginRight:10}}>{c.id.toUpperCase()}.</span>{c.text}
                </button>
              ))}
              {confidence === 0 && <div style={{fontSize:13,color:'#FF9500',textAlign:'center',padding:8}}>⚠️ Select confidence first</div>}
            </div>
          ) : (
            <div>
              {dailyCase.choices.map(c => (
                <div key={c.id} style={{background:c.correct?'#34C75915':c.id===selected?'#FF3B3015':'#fff',border:`2px solid ${c.correct?'#34C759':c.id===selected?'#FF3B30':'#E5E5EA'}`,borderRadius:16,padding:'16px',marginBottom:10,fontSize:14,display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontWeight:700,color:c.correct?'#34C759':c.id===selected?'#FF3B30':'#888'}}>{c.id.toUpperCase()}.</span>
                  <span style={{flex:1}}>{c.text}</span>
                  {c.correct && <span>✅</span>}
                  {!c.correct && c.id===selected && <span>❌</span>}
                </div>
              ))}
              <div style={{background:'linear-gradient(135deg,#FF9500,#FF3B30)',borderRadius:20,padding:24,textAlign:'center',color:'#fff',marginTop:8,boxShadow:'0 8px 32px #FF950050'}}>
                <div style={{fontSize:40,marginBottom:4}}>🔥</div>
                <div style={{fontSize:32,fontWeight:800}}>+{dailyCase.choices.find(c=>c.id===selected)?.correct ? dailyCase.xp : 15} XP</div>
                <div style={{fontSize:15,opacity:0.9,marginTop:4}}>Streak Extended! Come back tomorrow</div>
              </div>
              <div style={{background:'#fff',borderRadius:16,padding:16,marginTop:12,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#007AFF',marginBottom:8,textTransform:'uppercase',letterSpacing:0.5}}>Teaching Point</div>
                <div style={{fontSize:14,color:'#333',lineHeight:1.8}}>{dailyCase.explanation}</div>
              </div>
              <button onClick={() => { setActiveCase(''); setSelected(''); setShowResult(false); setConfidence(0) }} style={{background:'#F2F2F7',border:'none',borderRadius:16,padding:16,fontSize:15,fontWeight:600,width:'100%',marginTop:12,cursor:'pointer'}}>
                ← Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // DEPARTMENT VIEW
  if (activeDept) {
    const dept = departments.find(d => d.id === activeDept)
    if (!dept) return null
    return (
      <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:40}}>
        <div style={{background:'#fff',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
          <button style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer'}} onClick={() => setActiveDept('')}>← Back</button>
          <span style={{fontWeight:600,fontSize:16}}>{dept.name}</span>
        </div>
        <div style={{padding:'16px 20px 8px'}}>
          <div style={{fontSize:24,fontWeight:700}}>{dept.name}</div>
          <div style={{fontSize:14,color:'#888',marginTop:2}}>{dept.sub} available</div>
        </div>
        <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          {activeDept === 'ed' ? (
            <div>
              {[{id:'stemi',title:'Anterior STEMI',meta:'58y Male · Chest pain 45min',diff:4,xp:50},{id:'pe_case',title:'Pulmonary Embolism',meta:'42y Female · Dyspnea',diff:3,xp:40}].map((c,i,arr)=>(
                <div key={c.id} onClick={() => { if(c.id==='stemi') { setActiveDept(''); setActiveCase('stemi') }}} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #F2F2F7':'none',cursor:'pointer'}}>
                  <div style={{width:52,height:52,borderRadius:14,background:dept.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{dept.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:600}}>{c.title}</div>
                    <div style={{fontSize:12,color:'#888',marginTop:2}}>{c.meta}</div>
                    <div style={{display:'flex',gap:3,marginTop:6}}>{[1,2,3,4,5].map(n=><div key={n} style={{width:6,height:6,borderRadius:3,background:n<=c.diff?dept.color:'#E5E5EA'}}/>)}</div>
                  </div>
                  <div style={{background:'#FF950015',color:'#FF9500',fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:20}}>+{c.xp} XP</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{padding:48,textAlign:'center',color:'#888'}}>
              <div style={{fontSize:48,marginBottom:16}}>{dept.icon}</div>
              <div style={{fontSize:18,fontWeight:600,marginBottom:8}}>Coming Soon</div>
              <div style={{fontSize:14}}>We're building amazing cases for {dept.name}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // MAIN APP
  return (
    <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:90}}>
      <div style={{background:'#fff',padding:'0 20px',height:50,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
        <span style={{fontWeight:600,fontSize:15}}>{time}</span>
        <span style={{fontSize:13,color:'#888',fontWeight:500}}>Cliniverse AI</span>
      </div>

      {/* HOME TAB */}
      {tab==='home' && (
        <div>
          {/* Morning Brief */}
          <div style={{padding:'16px 20px 8px'}}>
            <div style={{fontSize:13,color:'#888',fontWeight:500,marginBottom:2}}>WEDNESDAY · MORNING BRIEF</div>
            <div style={{fontSize:26,fontWeight:700,letterSpacing:-0.5}}>Good morning, Dr. Ahmed 👋</div>
          </div>

          {/* Daily Challenge Card */}
          <div onClick={() => !dailyDone && setActiveCase('daily')} style={{background:'linear-gradient(135deg,#FF9500,#FF3B30)',borderRadius:22,margin:'12px 20px',padding:20,color:'#fff',boxShadow:'0 8px 32px #FF950050',cursor:dailyDone?'default':'pointer',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-10,top:-10,fontSize:80,opacity:0.15}}>⚡</div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1,opacity:0.85,marginBottom:6}}>TODAY'S CHALLENGE · NEUROLOGY</div>
            <div style={{fontSize:17,fontWeight:700,marginBottom:12,lineHeight:1.4}}>45y Female · Worst headache of her life</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',gap:12,fontSize:12,opacity:0.85}}>
                <span>🌍 Global</span>
                <span>⚡ 75 XP</span>
                <span>⏰ {countdown}</span>
              </div>
              {dailyDone ? (
                <div style={{background:'rgba(255,255,255,0.3)',borderRadius:20,padding:'6px 14px',fontSize:12,fontWeight:700}}>✅ Done</div>
              ) : (
                <div style={{background:'rgba(255,255,255,0.25)',borderRadius:20,padding:'6px 14px',fontSize:12,fontWeight:700}}>Start →</div>
              )}
            </div>
          </div>

          {/* Rank Card */}
          <div style={{background:`linear-gradient(135deg,${rankColors[currentRank]},#5856D6)`,borderRadius:22,margin:'0 20px 12px',padding:20,color:'#fff',boxShadow:`0 8px 32px ${rankColors[currentRank]}40`}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:1,opacity:0.8,marginBottom:4}}>CLINICAL RANK</div>
            <div style={{fontSize:22,fontWeight:700,marginBottom:12}}>{ranks[currentRank]}</div>
            <div style={{background:'rgba(255,255,255,0.2)',height:6,borderRadius:3,marginBottom:6}}>
              <div style={{height:'100%',width:'34%',background:'#fff',borderRadius:3,boxShadow:'0 0 10px rgba(255,255,255,0.8)'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,opacity:0.8}}>
              <span>{currentXP} XP</span>
              <span>600 XP to Registrar</span>
            </div>
          </div>

          {/* Vitals */}
          <div style={{background:'#1C1C1E',borderRadius:20,margin:'0 20px 12px',padding:16}}>
            <div style={{fontSize:11,color:'#34C759',fontWeight:700,letterSpacing:1,marginBottom:12}}>LIVE VITALS</div>
            <div style={{display:'flex',gap:10,marginBottom:12}}>
              <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center'}}>
                <div style={{fontSize:10,color:'#FF3B30',fontWeight:600}}>HR</div>
                <div style={{fontSize:26,fontWeight:700,color:'#FF3B30',textShadow:'0 0 10px #FF3B30'}}>{hr}</div>
                <div style={{fontSize:10,color:'#666'}}>bpm</div>
              </div>
              <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center'}}>
                <div style={{fontSize:10,color:'#34C759',fontWeight:600}}>SpO2</div>
                <div style={{fontSize:26,fontWeight:700,color:'#34C759',textShadow:'0 0 10px #34C759'}}>{spo2}</div>
                <div style={{fontSize:10,color:'#666'}}>%</div>
              </div>
              <div style={{flex:1,background:'#2C2C2E',borderRadius:12,padding:12,textAlign:'center'}}>
                <div style={{fontSize:10,color:'#007AFF',fontWeight:600}}>BP</div>
                <div style={{fontSize:20,fontWeight:700,color:'#007AFF',textShadow:'0 0 10px #007AFF'}}>120/80</div>
                <div style={{fontSize:10,color:'#666'}}>mmHg</div>
              </div>
            </div>
            <div style={{background:'#2C2C2E',borderRadius:12,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:'#34C759',fontWeight:600,marginBottom:6}}>ECG STRIP</div>
              {ecgSVG('#34C759')}
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'flex',gap:10,margin:'0 20px 16px'}}>
            {[['28','Cases','#007AFF'],['87%','Accuracy','#34C759'],['🔥 5','Streak','#FF9500']].map(([v,l,c])=>(
              <div key={String(l)} style={{flex:1,background:'#fff',borderRadius:16,padding:'14px 12px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:20,fontWeight:700,color:String(c)}}>{v}</div>
                <div style={{fontSize:11,color:'#888',marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>

          {/* Quick Reference */}
          <div style={{padding:'4px 20px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:20,fontWeight:700}}>Quick Reference</span>
            <span style={{color:'#007AFF',fontSize:14,cursor:'pointer'}} onClick={()=>setTab('reference')}>See All</span>
          </div>
          <div style={{display:'flex',gap:12,overflowX:'auto',padding:'0 20px 16px'}}>
            {quickRefs.slice(0,4).map(r=>(
              <div key={r.id} onClick={()=>setActiveRef(r.id)} style={{minWidth:120,background:'#fff',borderRadius:16,padding:16,flexShrink:0,cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{width:44,height:44,borderRadius:12,background:r.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:10}}>{r.icon}</div>
                <div style={{fontSize:12,fontWeight:600,lineHeight:1.3,color:'#1C1C1E'}}>{r.title}</div>
              </div>
            ))}
          </div>

          {/* Departments */}
          <div style={{padding:'4px 20px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:20,fontWeight:700}}>Departments</span>
            <span style={{color:'#007AFF',fontSize:14,cursor:'pointer'}} onClick={()=>setTab('departments')}>See All</span>
          </div>
          <div style={{display:'flex',gap:12,overflowX:'auto',padding:'0 20px 20px'}}>
            {departments.map(d=>(
              <div key={d.id} onClick={()=>setActiveDept(d.id)} style={{minWidth:110,background:'#fff',borderRadius:16,padding:16,flexShrink:0,cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{width:44,height:44,borderRadius:12,background:d.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:8}}>{d.icon}</div>
                <div style={{fontSize:13,fontWeight:600}}>{d.name}</div>
                <div style={{fontSize:11,color:'#888',marginTop:2}}>{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEPARTMENTS TAB */}
      {tab==='departments' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Departments</div></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {departments.map((d,i)=>(
              <div key={d.id} onClick={()=>setActiveDept(d.id)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<departments.length-1?'0.5px solid #F2F2F7':'none',cursor:'pointer'}}>
                <div style={{width:44,height:44,borderRadius:12,background:d.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{d.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600}}>{d.name}</div>
                  <div style={{fontSize:12,color:'#888',marginTop:2}}>{d.sub}</div>
                </div>
                <span style={{color:'#C7C7CC',fontSize:20}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REFERENCE TAB */}
      {tab==='reference' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Quick Reference</div>
          <div style={{fontSize:14,color:'#888',marginTop:4}}>Evidence-based clinical cards</div></div>
          <div style={{display:'flex',flexDirection:'column',gap:0,background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {quickRefs.map((r,i)=>(
              <div key={r.id} onClick={()=>setActiveRef(r.id)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<quickRefs.length-1?'0.5px solid #F2F2F7':'none',cursor:'pointer'}}>
                <div style={{width:44,height:44,borderRadius:12,background:r.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{r.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600}}>{r.title}</div>
                  <div style={{fontSize:12,color:'#888',marginTop:2}}>{r.content.length} key points</div>
                </div>
                <span style={{color:'#C7C7CC',fontSize:20}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {tab==='leaderboard' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Leaderboard</div>
          <div style={{fontSize:14,color:'#888',marginTop:4}}>Global · This week</div></div>
          <div style={{background:'linear-gradient(135deg,#007AFF,#5856D6)',borderRadius:20,margin:'0 20px 12px',padding:'20px',color:'#fff',boxShadow:'0 8px 32px #007AFF40'}}>
            <div style={{fontSize:11,opacity:0.8,fontWeight:600,letterSpacing:1,marginBottom:4}}>YOUR RANK</div>
            <div style={{fontSize:40,fontWeight:800}}>#14</div>
            <div style={{fontSize:14,opacity:0.85}}>Dr. Ahmed Osman · 340 XP · {ranks[currentRank]}</div>
          </div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {[['🥇','Dr. Sarah K.','4,200','Consultant'],['🥈','Dr. Mohammed A.','3,850','Registrar'],['🥉','Dr. Rania H.','3,420','Registrar'],['4','Dr. Khalid M.','2,980','Senior Resident'],['5','Dr. Layla S.','2,750','Senior Resident']].map(([rank,name,xp,rnk],i,arr)=>(
              <div key={String(name)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #F2F2F7':'none'}}>
                <div style={{width:32,textAlign:'center',fontSize:20,fontWeight:700}}>{rank}</div>
                <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#007AFF,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:18}}>{String(name)[4]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600}}>{name}</div>
                  <div style={{fontSize:12,color:'#888',marginTop:2}}>{rnk}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:'#FF9500'}}>{xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {tab==='profile' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Profile</div></div>
          <div style={{background:'#fff',borderRadius:22,margin:'0 20px 12px',padding:24,display:'flex',alignItems:'center',gap:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <div style={{width:76,height:76,borderRadius:'50%',background:`linear-gradient(135deg,${rankColors[currentRank]},#5856D6)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,color:'#fff',fontWeight:700,boxShadow:`0 0 0 3px #fff, 0 0 0 5px ${rankColors[currentRank]}, 0 0 24px ${rankColors[currentRank]}`}}>A</div>
            <div>
              <div style={{fontSize:20,fontWeight:700}}>Dr. Ahmed Osman</div>
              <div style={{fontSize:13,color:rankColors[currentRank],fontWeight:600,marginTop:3}}>{ranks[currentRank]}</div>
              <div style={{fontSize:13,color:'#888',marginTop:3}}>Cardiac Specialist · KSA 🇸🇦</div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,margin:'0 20px 16px'}}>
            {[['28','Cases','#007AFF'],['340','XP','#FF9500'],['5','Badges','#34C759'],['🔥5','Streak','#FF3B30']].map(([v,l,c])=>(
              <div key={String(l)} style={{flex:1,background:'#fff',borderRadius:16,padding:'12px 8px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:18,fontWeight:700,color:String(c)}}>{v}</div>
                <div style={{fontSize:10,color:'#888',marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'4px 20px 10px'}}><span style={{fontSize:20,fontWeight:700}}>Badges</span></div>
          <div style={{display:'flex',gap:10,padding:'0 20px 16px',overflowX:'auto'}}>
            {[['❤️','Cardiologist','#FF3B30'],['🔥','5-Day Streak','#FF9500'],['⚡','Speed Demon','#5856D6'],['🏆','Top 20','#FFD700'],['🎯','Perfect Score','#34C759']].map(([icon,name,c])=>(
              <div key={String(name)} style={{minWidth:90,background:'#fff',borderRadius:16,padding:14,textAlign:'center',flexShrink:0,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:30,marginBottom:8}}>{icon}</div>
                <div style={{fontSize:11,fontWeight:600,color:String(c)}}>{name}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'4px 20px 10px'}}><span style={{fontSize:20,fontWeight:700}}>Clinical Ranks</span></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {ranks.map((r,i)=>(
              <div key={r} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 16px',borderBottom:i<ranks.length-1?'0.5px solid #F2F2F7':'none'}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:rankColors[i],boxShadow:`0 0 8px ${rankColors[i]}`}}/>
                <div style={{flex:1,fontSize:14,fontWeight:i===currentRank?700:400,color:i===currentRank?rankColors[i]:'#333'}}>{r}</div>
                {i===currentRank && <span style={{fontSize:11,fontWeight:700,color:rankColors[i],background:rankColors[i]+'20',padding:'3px 10px',borderRadius:20}}>Current</span>}
                {i<currentRank && <span style={{fontSize:16}}>✅</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderTop:'0.5px solid #E5E5EA',display:'flex',padding:'8px 0 28px',zIndex:200}}>
        {[['home','🏠','Home'],['departments','🏥','Cases'],['reference','📋','Reference'],['leaderboard','🏆','Ranks'],['profile','👤','Profile']].map(([id,icon,label])=>(
          <div key={String(id)} onClick={()=>setTab(String(id))} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',padding:'4px 0'}}>
            <span style={{fontSize:22}}>{icon}</span>
            <span style={{fontSize:10,fontWeight:tab===id?600:400,color:tab===id?'#007AFF':'#888'}}>{label}</span>
            {tab===id && <div style={{width:4,height:4,borderRadius:2,background:'#007AFF',marginTop:1}}/>}
          </div>
        ))}
      </div>
    </div>
  )
}
