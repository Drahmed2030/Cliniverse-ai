import os

code = r"""'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [screen, setScreen] = useState('ob')
  const [obIndex, setObIndex] = useState(0)
  const [tab, setTab] = useState('home')
  const [activeDept, setActiveDept] = useState('')
  const [activeCase, setActiveCase] = useState('')
  const [time, setTime] = useState('')
  const [hr, setHr] = useState(72)
  const [spo2, setSpo2] = useState(98)
  const [caseStep, setCaseStep] = useState(0)
  const [selected, setSelected] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [confidence, setConfidence] = useState(0)

  useEffect(() => {
    const t = () => { const n = new Date(); setTime(n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0')) }
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

  const stemiChoices = [
    { id:'a', text:'Aspirin + Heparin + Cath Lab activation', correct: true },
    { id:'b', text:'Thrombolytics only', correct: false },
    { id:'c', text:'Observation and repeat ECG in 30 min', correct: false },
    { id:'d', text:'Beta blocker IV immediately', correct: false },
  ]

  const ecgSVG = (color: string) => {
    let d = 'M 0 30'
    for (let i = 0; i < 20; i++) {
      const x = i * 16
      if (i % 5 === 2) { d += ` L ${x+2} 30 L ${x+3} 5 L ${x+4} 55 L ${x+5} 30` }
      else { d += ` L ${x+16} 30` }
    }
    return <svg width="100%" height="50" viewBox="0 0 320 50" preserveAspectRatio="none"><path d={d} fill="none" stroke={color} strokeWidth="2" style={{filter:`drop-shadow(0 0 4px ${color})`}}/></svg>
  }

  if (screen === 'ob') {
    const slides = [
      { icon:'🏥', bg:'#007AFF', title:'Welcome to Cliniverse AI', sub:'Built by a physician, for physicians.' },
      { icon:'❤️', bg:'#FF3B30', title:'Real Cases. Real Decisions.', sub:'ED, CCU, ICU, Cardiology and more.' },
      { icon:'🤖', bg:'#34C759', title:'AI Consult On Demand', sub:'Evidence-based answers instantly.' },
      { icon:'🏆', bg:'#FF9500', title:'Compete and Level Up', sub:'Earn XP and climb the leaderboard.' },
    ]
    const sl = slides[obIndex]
    return (
      <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#fff',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 32px 40px',textAlign:'center'}}>
          <div style={{width:120,height:120,borderRadius:30,background:sl.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:52,marginBottom:32,boxShadow:`0 8px 32px ${sl.bg}60`}}>{sl.icon}</div>
          <div style={{fontSize:28,fontWeight:700,marginBottom:14}}>{sl.title}</div>
          <div style={{fontSize:16,color:'#888',lineHeight:1.6,maxWidth:300}}>{sl.sub}</div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'center',padding:'0 0 20px'}}>
          {slides.map((_,i) => <div key={i} style={{height:8,borderRadius:4,background:i===obIndex?'#007AFF':'#E5E5EA',width:i===obIndex?22:8,transition:'all 0.3s'}} />)}
        </div>
        <div style={{padding:'0 24px 48px',display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={() => obIndex < 3 ? setObIndex(i=>i+1) : setScreen('app')} style={{background:obIndex===3?'#34C759':'#007AFF',color:'#fff',border:'none',borderRadius:14,padding:17,fontSize:17,fontWeight:600,cursor:'pointer'}}>
            {obIndex===3?'Get Started':'Continue'}
          </button>
          <button onClick={() => setScreen('app')} style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer',padding:12}}>Skip</button>
        </div>
      </div>
    )
  }

  if (activeCase === 'stemi') {
    return (
      <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:40}}>
        <div style={{background:'#fff',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
          <button style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer'}} onClick={() => { setActiveCase(''); setCaseStep(0); setSelected(''); setShowResult(false); setConfidence(0) }}>Back</button>
          <span style={{fontWeight:600}}>Anterior STEMI</span>
        </div>
        {caseStep === 0 && (
          <div style={{padding:20}}>
            <div style={{fontSize:11,color:'#FF3B30',fontWeight:700,letterSpacing:1,marginBottom:4}}>CRITICAL CASE</div>
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
                <div style={{fontSize:10,color:'#FF3B30',fontWeight:600,marginBottom:6}}>ECG - ST Elevation V1-V4</div>
                {ecgSVG('#FF3B30')}
              </div>
            </div>
            <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:'#FF3B30',marginBottom:8}}>PATIENT HISTORY</div>
              <div style={{fontSize:14,color:'#333',lineHeight:1.7}}>58-year-old male with crushing chest pain radiating to left arm for 45 minutes. Diaphoretic and pale. PMH: HTN, T2DM, smoker.</div>
            </div>
            <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:'#5856D6',marginBottom:8}}>LAB RESULTS</div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:14}}>Troponin I</span>
                <span style={{fontSize:14,fontWeight:700,color:'#FF3B30'}}>2.4 ng/mL HIGH</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:14}}>CK-MB</span>
                <span style={{fontSize:14,fontWeight:700,color:'#FF3B30'}}>45 U/L HIGH</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:14}}>D-Dimer</span>
                <span style={{fontSize:14,fontWeight:700,color:'#34C759'}}>0.3 Normal</span>
              </div>
            </div>
            <button onClick={() => setCaseStep(1)} style={{background:'#FF3B30',color:'#fff',border:'none',borderRadius:14,padding:16,fontSize:16,fontWeight:600,width:'100%',cursor:'pointer',boxShadow:'0 4px 20px #FF3B3060'}}>
              Proceed to Management
            </button>
          </div>
        )}
        {caseStep === 1 && (
          <div style={{padding:20}}>
            <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>What is your management?</div>
            <div style={{fontSize:14,color:'#888',marginBottom:16}}>Select confidence before answering</div>
            <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Confidence Level</div>
              <div style={{display:'flex',gap:8}}>
                {[['1','Not Sure','#888'],['2','Fairly Sure','#FF9500'],['3','Very Sure','#34C759']].map(([v,l,c])=>(
                  <div key={v} onClick={() => setConfidence(Number(v))} style={{flex:1,background:confidence===Number(v)?String(c)+'20':'#F2F2F7',border:`2px solid ${confidence===Number(v)?String(c):'transparent'}`,borderRadius:12,padding:'10px 6px',textAlign:'center',cursor:'pointer'}}>
                    <div style={{fontSize:18,fontWeight:700,color:String(c)}}>{v}</div>
                    <div style={{fontSize:10,color:String(c)}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {!showResult ? (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {stemiChoices.map(c => (
                  <button key={c.id} onClick={() => { if(confidence > 0) { setSelected(c.id); setShowResult(true) }}} style={{background:'#fff',border:'2px solid #E5E5EA',borderRadius:14,padding:'14px 16px',fontSize:14,fontWeight:500,textAlign:'left',cursor:confidence>0?'pointer':'not-allowed',opacity:confidence>0?1:0.6}}>
                    <span style={{fontWeight:700,color:'#007AFF',marginRight:8}}>{c.id.toUpperCase()}.</span>{c.text}
                  </button>
                ))}
                {confidence === 0 && <div style={{fontSize:12,color:'#FF9500',textAlign:'center'}}>Select confidence level first</div>}
              </div>
            ) : (
              <div>
                {stemiChoices.map(c => (
                  <div key={c.id} style={{background:c.correct?'#34C75915':c.id===selected?'#FF3B3015':'#fff',border:`2px solid ${c.correct?'#34C759':c.id===selected?'#FF3B30':'#E5E5EA'}`,borderRadius:14,padding:'14px 16px',marginBottom:10,fontSize:14}}>
                    <span style={{fontWeight:700,marginRight:8,color:c.correct?'#34C759':c.id===selected?'#FF3B30':'#888'}}>{c.id.toUpperCase()}.</span>
                    {c.text}
                    {c.correct && <span style={{marginLeft:8,color:'#34C759',fontWeight:700}}>Correct</span>}
                    {!c.correct && c.id===selected && <span style={{marginLeft:8,color:'#FF3B30',fontWeight:700}}>Incorrect</span>}
                  </div>
                ))}
                <div style={{background:'linear-gradient(135deg,#007AFF,#5856D6)',borderRadius:16,padding:20,textAlign:'center',color:'#fff',marginTop:8}}>
                  <div style={{fontSize:28,fontWeight:800}}>+{stemiChoices.find(c=>c.id===selected)?.correct ? Math.round(50*(confidence/3)) : 10} XP</div>
                  <div style={{fontSize:13,opacity:0.85,marginTop:4}}>{stemiChoices.find(c=>c.id===selected)?.correct ? 'Excellent!' : 'Review STEMI guidelines'}</div>
                </div>
                <div style={{background:'#fff',borderRadius:16,padding:16,marginTop:12}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#007AFF',marginBottom:8}}>EXPLANATION</div>
                  <div style={{fontSize:14,color:'#333',lineHeight:1.7}}>Anterior STEMI requires immediate dual antiplatelet therapy, Heparin, and primary PCI within 90 minutes. Time is muscle.</div>
                </div>
                <button onClick={() => { setActiveCase(''); setCaseStep(0); setSelected(''); setShowResult(false); setConfidence(0) }} style={{background:'#F2F2F7',border:'none',borderRadius:14,padding:16,fontSize:15,fontWeight:600,width:'100%',marginTop:12,cursor:'pointer'}}>
                  Back to Cases
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (activeDept) {
    const dept = departments.find(d => d.id === activeDept)
    if (!dept) return null
    return (
      <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:40}}>
        <div style={{background:'#fff',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
          <button style={{background:'none',border:'none',color:'#007AFF',fontSize:16,cursor:'pointer'}} onClick={() => setActiveDept('')}>Back</button>
          <span style={{fontWeight:600}}>{dept.name}</span>
        </div>
        <div style={{padding:'16px 20px 8px'}}>
          <div style={{fontSize:24,fontWeight:700}}>{dept.name}</div>
          <div style={{fontSize:14,color:'#888',marginTop:2}}>{dept.sub} available</div>
        </div>
        <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          {activeDept === 'ed' ? (
            <div>
              {[{id:'stemi',title:'Anterior STEMI',meta:'58y Male · Chest pain 45min',diff:4,xp:50},{id:'pe',title:'Pulmonary Embolism',meta:'42y Female · Dyspnea',diff:3,xp:40}].map((c,i,arr)=>(
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
            <div style={{padding:40,textAlign:'center',color:'#888'}}>
              <div style={{fontSize:40,marginBottom:12}}>{dept.icon}</div>
              <div style={{fontSize:16,fontWeight:600}}>Coming Soon</div>
              <div style={{fontSize:14,marginTop:4}}>Cases being added</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{fontFamily:'Inter,system-ui,sans-serif',background:'#F2F2F7',minHeight:'100vh',paddingBottom:90}}>
      <div style={{background:'#fff',padding:'0 20px',height:50,display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'0.5px solid #E5E5EA',position:'sticky',top:0,zIndex:100}}>
        <span style={{fontWeight:600,fontSize:15}}>{time}</span>
        <span style={{fontSize:13,color:'#888'}}>Cliniverse AI</span>
      </div>

      {tab==='home' && (
        <div>
          <div style={{padding:'16px 20px 8px'}}>
            <div style={{fontSize:13,color:'#888',fontWeight:500,marginBottom:2}}>WEDNESDAY</div>
            <div style={{fontSize:28,fontWeight:700}}>Good morning, Dr. Ahmed</div>
          </div>
          <div style={{background:`linear-gradient(135deg,${rankColors[currentRank]},#5856D6)`,borderRadius:22,margin:'12px 20px',padding:20,color:'#fff',boxShadow:`0 8px 32px ${rankColors[currentRank]}40`}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:1,opacity:0.8,marginBottom:4}}>CLINICAL RANK</div>
            <div style={{fontSize:24,fontWeight:700,marginBottom:12}}>{ranks[currentRank]}</div>
            <div style={{background:'rgba(255,255,255,0.2)',height:6,borderRadius:3,marginBottom:6}}>
              <div style={{height:'100%',width:'34%',background:'#fff',borderRadius:3,boxShadow:'0 0 8px #fff'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,opacity:0.8}}>
              <span>{currentXP} XP</span>
              <span>600 XP to Registrar</span>
            </div>
          </div>
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
          <div style={{display:'flex',gap:10,margin:'0 20px 12px'}}>
            {[['28','Cases','#007AFF'],['87%','Accuracy','#34C759'],['5','Streak','#FF9500']].map(([v,l,c])=>(
              <div key={String(l)} style={{flex:1,background:'#fff',borderRadius:16,padding:'14px 12px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:22,fontWeight:700,color:String(c)}}>{v}</div>
                <div style={{fontSize:11,color:'#888'}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'4px 20px 10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:20,fontWeight:700}}>Departments</span>
            <span style={{color:'#007AFF',fontSize:14,cursor:'pointer'}} onClick={()=>setTab('departments')}>See All</span>
          </div>
          <div style={{display:'flex',gap:12,overflowX:'auto',padding:'0 20px 16px'}}>
            {departments.map(d=>(
              <div key={d.id} onClick={()=>setActiveDept(d.id)} style={{minWidth:110,background:'#fff',borderRadius:16,padding:16,flexShrink:0,cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{width:44,height:44,borderRadius:12,background:d.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:8}}>{d.icon}</div>
                <div style={{fontSize:13,fontWeight:600}}>{d.name}</div>
                <div style={{fontSize:11,color:'#888'}}>{d.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='departments' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Departments</div></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {departments.map((d,i)=>(
              <div key={d.id} onClick={()=>setActiveDept(d.id)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<departments.length-1?'0.5px solid #F2F2F7':'none',cursor:'pointer'}}>
                <div style={{width:40,height:40,borderRadius:12,background:d.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{d.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600}}>{d.name}</div>
                  <div style={{fontSize:12,color:'#888',marginTop:2}}>{d.sub}</div>
                </div>
                <span style={{color:'#C7C7CC',fontSize:18}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='tools' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Clinical Tools</div></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {[['SBAR Generator AI','Structured handover','#007AFF'],['Renal Dosing Calculator','eGFR-based adjustment','#34C759'],['AI Clinical Consultant','Evidence-based answers','#AF52DE'],['Discharge Summary','Auto-generate','#FF9500'],['Difficult Conversations','Practice scenarios','#FF3B30']].map(([n,sub,c],i,arr)=>(
              <div key={String(n)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #F2F2F7':'none',cursor:'pointer'}}>
                <div style={{width:40,height:40,borderRadius:12,background:String(c)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🔧</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600}}>{n}</div>
                  <div style={{fontSize:12,color:'#888',marginTop:2}}>{sub}</div>
                </div>
                <span style={{color:'#C7C7CC',fontSize:18}}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='leaderboard' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Leaderboard</div></div>
          <div style={{background:'linear-gradient(135deg,#007AFF,#5856D6)',borderRadius:16,margin:'0 20px 12px',padding:'16px 20px',color:'#fff',boxShadow:'0 8px 24px #007AFF40'}}>
            <div style={{fontSize:11,opacity:0.8,fontWeight:600,letterSpacing:1}}>YOUR RANK</div>
            <div style={{fontSize:32,fontWeight:800}}>#14</div>
            <div style={{fontSize:14,opacity:0.85}}>Dr. Ahmed Osman — 340 XP</div>
          </div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {[['🥇','Dr. Sarah K.','4200'],['🥈','Dr. Mohammed A.','3850'],['🥉','Dr. Rania H.','3420'],['4','Dr. Khalid M.','2980'],['5','Dr. Layla S.','2750']].map(([rank,name,xp],i,arr)=>(
              <div key={String(name)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:i<arr.length-1?'0.5px solid #F2F2F7':'none'}}>
                <div style={{width:32,textAlign:'center',fontSize:18,fontWeight:700}}>{rank}</div>
                <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#007AFF,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700}}>{String(name)[4]}</div>
                <div style={{flex:1,fontSize:15,fontWeight:600}}>{name}</div>
                <div style={{fontSize:13,fontWeight:700,color:'#FF9500'}}>{xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='profile' && (
        <div>
          <div style={{padding:'16px 20px'}}><div style={{fontSize:28,fontWeight:700}}>Profile</div></div>
          <div style={{background:'#fff',borderRadius:22,margin:'0 20px 12px',padding:24,display:'flex',alignItems:'center',gap:16,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:`linear-gradient(135deg,${rankColors[currentRank]},#5856D6)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:'#fff',fontWeight:700,boxShadow:`0 0 0 3px #fff, 0 0 0 5px ${rankColors[currentRank]}, 0 0 20px ${rankColors[currentRank]}`}}>A</div>
            <div>
              <div style={{fontSize:20,fontWeight:700}}>Dr. Ahmed Osman</div>
              <div style={{fontSize:13,color:rankColors[currentRank],fontWeight:600,marginTop:2}}>{ranks[currentRank]}</div>
              <div style={{fontSize:13,color:'#888',marginTop:2}}>Cardiac Specialist · KSA</div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,margin:'0 20px 12px'}}>
            {[['28','Cases','#007AFF'],['340','XP','#FF9500'],['5','Badges','#34C759']].map(([v,l,c])=>(
              <div key={String(l)} style={{flex:1,background:'#fff',borderRadius:16,padding:'14px 12px',textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:22,fontWeight:700,color:String(c)}}>{v}</div>
                <div style={{fontSize:11,color:'#888'}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'4px 20px 10px'}}><span style={{fontSize:20,fontWeight:700}}>Badges</span></div>
          <div style={{display:'flex',gap:10,padding:'0 20px 16px',overflowX:'auto'}}>
            {[['❤️','Cardiologist','#FF3B30'],['🔥','5-Day Streak','#FF9500'],['⚡','Speed Demon','#5856D6'],['🏆','Top 20','#FFD700']].map(([icon,name,c])=>(
              <div key={String(name)} style={{minWidth:90,background:'#fff',borderRadius:16,padding:14,textAlign:'center',flexShrink:0,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:28,marginBottom:6}}>{icon}</div>
                <div style={{fontSize:11,fontWeight:600,color:String(c)}}>{name}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'4px 20px 10px'}}><span style={{fontSize:20,fontWeight:700}}>Clinical Ranks</span></div>
          <div style={{background:'#fff',borderRadius:16,margin:'0 20px 20px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            {ranks.map((r,i)=>(
              <div key={r} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<ranks.length-1?'0.5px solid #F2F2F7':'none'}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:rankColors[i],boxShadow:`0 0 6px ${rankColors[i]}`}}/>
                <div style={{flex:1,fontSize:14,fontWeight:i===currentRank?700:400,color:i===currentRank?rankColors[i]:'#333'}}>{r}</div>
                {i===currentRank && <span style={{fontSize:11,fontWeight:600,color:rankColors[i],background:rankColors[i]+'20',padding:'2px 8px',borderRadius:10}}>Current</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',borderTop:'0.5px solid #E5E5EA',display:'flex',padding:'8px 0 24px',zIndex:200}}>
        {[['home','🏠','Home'],['departments','🏥','Depts'],['tools','🛠️','Tools'],['leaderboard','🏆','Ranks'],['profile','👤','Profile']].map(([id,icon,label])=>(
          <div key={String(id)} onClick={()=>setTab(String(id))} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',padding:'4px 0'}}>
            <span style={{fontSize:22}}>{icon}</span>
            <span style={{fontSize:10,fontWeight:500,color:tab===id?'#007AFF':'#888'}}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
"""

target = os.path.expanduser('~/cliniverse-ai/app/page.tsx')
with open(target, 'w', encoding='utf-8') as f:
    f.write(code)
print(f'Written {len(code)} chars to {target}')
