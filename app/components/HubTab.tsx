'use client'
import { useState, useEffect } from 'react'
import ClinicalPulseFeed from './ClinicalPulseFeed'

interface Props {
  xp: number
  streak: number
  casesCompleted: number
  mcqCorrect: number
  isPro: boolean
  criticalCases: any[]
  sportsCases: any[]
  pedsCases: any[]
  setActiveCase: (id: string) => void
  setShowUpgrade: (v: boolean) => void
  setTab: (t: string) => void
  setToolTab: (t: string) => void
}

export default function HubTab({
  xp, streak, casesCompleted, mcqCorrect, isPro,
  criticalCases, sportsCases, pedsCases,
  setActiveCase, setShowUpgrade, setTab, setToolTab
}: Props) {
  const [openAccordion, setOpenAccordion] = useState<string|null>(null)
  const [count, setCount] = useState(1247)

  useEffect(()=>{
    const t = setInterval(()=>{
      setCount(p => {
        const n = p + Math.floor(Math.random()*5) - 2
        return n < 900 ? 900 : n > 1500 ? 1500 : n
      })
    }, 2000)
    return () => clearInterval(t)
  },[])

  const h = new Date().getHours()
  const isMorn = h >= 5 && h < 12
  const isEve = h >= 18 || h < 5
  const timeConfig = isMorn
    ? {icon:'🌅', title:'Morning Brief', sub:'MCQ review to start your day', color:'#ffd60a', tool:'aigen'}
    : isEve
    ? {icon:'🌙', title:'Night Shift Mode', sub:'Complex emergency cases', color:'#0a84ff', tool:'codeblue'}
    : {icon:'☀️', title:'Afternoon Challenge', sub:'Rapid Fire is live now', color:'#30d158', tool:'rapid'}

  const sections = [
    {key:'critical', icon:'🏥', title:'Critical Care', sub:'ED · ICU · CCU · Neuro', color:'#ff453a', badge:null, badgeColor:'', cases:criticalCases},
    {key:'sports', icon:'⚽', title:'Sports Medicine', sub:'FIFA 2026 · 4 cases', color:'#30d158', badge:'NEW', badgeColor:'#30d158', cases:sportsCases},
    {key:'peds', icon:'🧸', title:'Pediatrics', sub:'2 cases · Vaccinations', color:'#8b5cf6', badge:'NEW', badgeColor:'#8b5cf6', cases:pedsCases},
  ]

  return (
    <div style={{paddingBottom:100}}>

      {/* Header Card with Rings */}
      <div style={{background:'linear-gradient(145deg,rgba(15,5,40,0.98),rgba(20,5,50,0.96))',borderRadius:24,padding:20,marginBottom:14,border:'1px solid rgba(139,92,246,0.18)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.18),transparent 70%)',pointerEvents:'none'}}/>

        {/* Brand */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#8b5cf6,#0a84ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19}}>⚕</div>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:'white',letterSpacing:-0.5}}>Cliniverse AI</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',letterSpacing:1.5,textTransform:'uppercase'}}>Clinical Intelligence</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(48,209,88,0.1)',border:'1px solid rgba(48,209,88,0.25)',borderRadius:20,padding:'4px 10px'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:'#30d158',boxShadow:'0 0 6px #30d158'}}/>
            <span style={{fontSize:10,color:'#30d158',fontWeight:700}}>LIVE</span>
          </div>
        </div>

        {/* Rings + Stats */}
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{position:'relative',width:88,height:88,flexShrink:0}}>
            <svg width="88" height="88" viewBox="0 0 88 88" style={{transform:'rotate(-90deg)'}}>
              <circle cx="44" cy="44" r="37" fill="none" stroke="rgba(10,132,255,0.12)" strokeWidth="7"/>
              <circle cx="44" cy="44" r="37" fill="none" stroke="#0a84ff" strokeWidth="7" strokeLinecap="round" strokeDasharray="116 232" style={{filter:'drop-shadow(0 0 4px #0a84ff)'}}/>
              <circle cx="44" cy="44" r="27" fill="none" stroke="rgba(48,209,88,0.12)" strokeWidth="7"/>
              <circle cx="44" cy="44" r="27" fill="none" stroke="#30d158" strokeWidth="7" strokeLinecap="round" strokeDasharray="88 170" style={{filter:'drop-shadow(0 0 4px #30d158)'}}/>
              <circle cx="44" cy="44" r="17" fill="none" stroke="rgba(255,69,58,0.12)" strokeWidth="7"/>
              <circle cx="44" cy="44" r="17" fill="none" stroke="#ff453a" strokeWidth="7" strokeLinecap="round" strokeDasharray="60 107" style={{filter:'drop-shadow(0 0 4px #ff453a)'}}/>
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
              <div style={{fontSize:15,fontWeight:900,color:'white',lineHeight:1}}>{xp}</div>
              <div style={{fontSize:8,color:'rgba(255,255,255,0.35)'}}>XP</div>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,color:'white',fontWeight:700,marginBottom:2}}>
              {isMorn ? 'Good morning' : isEve ? 'Good evening' : 'Good afternoon'}, Doctor 👋
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:12}}>
              Ready to train? <span style={{color:'#ffd60a',fontWeight:700}}>{streak}-day streak 🔥</span>
            </div>
            <div style={{display:'flex',gap:6}}>
              {[{v:xp,l:'XP',c:'#8b5cf6'},{v:casesCompleted,l:'Cases',c:'#30d158'},{v:mcqCorrect,l:'MCQ',c:'#0a84ff'}].map((s,i)=>(
                <div key={i} style={{flex:1,background:'rgba(255,255,255,0.05)',borderRadius:10,padding:'6px 4px',textAlign:'center',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{fontSize:13,fontWeight:900,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:8,color:'rgba(255,255,255,0.3)'}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time-Aware Card */}
      <div style={{background:'rgba(255,255,255,0.04)',borderRadius:18,padding:14,marginBottom:14,border:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:12}}>
        <span style={{fontSize:24,flexShrink:0}}>{timeConfig.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800,color:'white',marginBottom:2}}>{timeConfig.title}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{timeConfig.sub}</div>
        </div>
        <button onClick={()=>{setTab('tools');setToolTab(timeConfig.tool)}}
          style={{background:timeConfig.color+'20',border:'1px solid '+timeConfig.color+'40',borderRadius:12,padding:'7px 14px',fontSize:12,fontWeight:700,color:timeConfig.color,cursor:'pointer',flexShrink:0,fontFamily:'inherit'}}>
          Go →
        </button>
      </div>

      {/* Live Heartbeat */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:14,padding:'9px 20px',background:'rgba(255,69,58,0.06)',borderRadius:18,border:'1px solid rgba(255,69,58,0.12)'}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 10px #ff453a',flexShrink:0}}/>
        <span style={{fontSize:13,color:'rgba(255,255,255,0.7)',fontWeight:600}}>{count.toLocaleString()} doctors training right now</span>
        <div style={{width:7,height:7,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 10px #ff453a',flexShrink:0}}/>
      </div>

      {/* Quick Access */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>Quick Access</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {[
            {icon:'📋',label:'SBAR',color:'#0a84ff',action:()=>setTab('workshop')},
            {icon:'⚡',label:'Rapid',color:'#ff453a',action:()=>{setTab('tools');setToolTab('rapid')}},
            {icon:'📈',label:'ECG',color:'#30d158',action:()=>{setTab('tools');setToolTab('ecg')}},
            {icon:'🧮',label:'Calc',color:'#ff9f0a',action:()=>{setTab('tools');setToolTab('calc')}},
          ].map((q,i)=>(
            <div key={i} onClick={q.action}
              style={{background:q.color+'12',border:'1px solid '+q.color+'20',borderRadius:14,padding:'11px 6px',textAlign:'center',cursor:'pointer'}}>
              <div style={{fontSize:22,marginBottom:3}}>{q.icon}</div>
              <div style={{fontSize:10,fontWeight:700,color:'white'}}>{q.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Pulse Feed */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>🌍 Global Clinical Feed</div>
        <ClinicalPulseFeed onCase={setActiveCase}/>
      </div>

      {/* Featured Case */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>⭐ Featured Case</div>
        <div onClick={()=>setActiveCase('stemi')} style={{background:'linear-gradient(135deg,#0a84ff,#8b5cf6)',borderRadius:20,padding:20,color:'white',cursor:'pointer',boxShadow:'0 8px 32px rgba(10,132,255,0.3)',border:'1px solid rgba(255,255,255,0.1)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,0.05)',pointerEvents:'none'}}/>
          <div style={{fontSize:10,opacity:0.7,marginBottom:5,letterSpacing:2,textTransform:'uppercase'}}>TODAY'S CASE</div>
          <div style={{fontSize:19,fontWeight:900,marginBottom:5,letterSpacing:-0.5}}>🫀 STEMI Protocol</div>
          <div style={{fontSize:13,opacity:0.75,marginBottom:14,lineHeight:1.5}}>Master door-to-balloon · +80 XP</div>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.18)',borderRadius:20,padding:'7px 16px',fontSize:13,fontWeight:700}}>Start Case →</div>
        </div>
      </div>

      {/* Clinical Cases */}
      <div>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:1.5,marginBottom:10,textTransform:'uppercase'}}>Clinical Cases</div>
        {sections.map(section=>(
          <div key={section.key} style={{marginBottom:10}}>
            <div onClick={()=>setOpenAccordion(openAccordion===section.key?null:section.key)}
              style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,cursor:'pointer',padding:'10px 14px',background:'rgba(255,255,255,0.03)',borderRadius:16,border:'1px solid '+section.color+'15'}}>
              <div style={{width:36,height:36,borderRadius:11,background:section.color+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{section.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:'white'}}>{section.title}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{section.sub}</div>
              </div>
              {section.badge&&<span style={{fontSize:9,padding:'2px 8px',borderRadius:8,background:section.badgeColor+'18',color:section.badgeColor,fontWeight:800}}>{section.badge}</span>}
              <span style={{color:'rgba(255,255,255,0.3)',fontSize:16,transition:'transform 0.2s',transform:openAccordion===section.key?'rotate(90deg)':'none'}}>›</span>
            </div>
            {openAccordion===section.key&&(
              <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:6,scrollbarWidth:'none'}}>
                {section.cases.map((cas:any)=>(
                  <div key={cas.id} onClick={()=>{if(!cas.free&&!isPro){setShowUpgrade(true);return}setActiveCase(cas.id)}}
                    style={{flexShrink:0,width:155,background:'rgba(255,255,255,0.04)',borderRadius:18,padding:14,border:'1px solid '+cas.color+'20',cursor:'pointer',opacity:!cas.free&&!isPro?0.7:1}}>
                    <div style={{fontSize:26,marginBottom:8}}>{cas.icon}</div>
                    <div style={{fontSize:13,fontWeight:700,color:'white',marginBottom:3,lineHeight:1.3}}>{cas.title}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:8}}>{cas.dept}</div>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      <span style={{fontSize:10,padding:'2px 7px',borderRadius:8,background:cas.color+'15',color:cas.color,fontWeight:700}}>+{cas.xpReward} XP</span>
                      {!cas.free&&!isPro&&<span style={{fontSize:8,padding:'2px 6px',borderRadius:5,background:'rgba(255,149,0,0.15)',color:'#ff9500',fontWeight:700}}>PRO</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
