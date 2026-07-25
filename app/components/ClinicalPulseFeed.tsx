'use client'
import { useState, useEffect } from 'react'

const FEED = [
  {id:1,city:'Riyadh',flag:'🇸🇦',color:'#ff453a',level:'CRITICAL',case:'52M — Anterior STEMI',detail:'Door-to-balloon: 67 min · Cath Lab activated',status:'LIVE'},
  {id:2,city:'London',flag:'🇬🇧',color:'#ff9f0a',level:'URGENT',case:'34F — Status Epilepticus',detail:'IV Lorazepam given · Neuro team called',status:'LIVE'},
  {id:3,city:'Dubai',flag:'🇦🇪',color:'#30d158',level:'RESOLVED',case:'61M — Massive PE',detail:'Systemic thrombolysis successful · ICU',status:'SOLVED'},
  {id:4,city:'Toronto',flag:'🇨🇦',color:'#ff453a',level:'CRITICAL',case:'28F — Septic Shock',detail:'Noradrenaline started · Cultures sent',status:'LIVE'},
  {id:5,city:'Cairo',flag:'🇪🇬',color:'#ff9f0a',level:'URGENT',case:'71M — Acute Stroke',detail:'NIHSS 14 · CT clear · tPA candidate',status:'LIVE'},
  {id:6,city:'Paris',flag:'🇫🇷',color:'#30d158',level:'RESOLVED',case:'45M — DKA severe',detail:'pH 7.18 → 7.36 · Insulin protocol completed',status:'SOLVED'},
  {id:7,city:'NYC',flag:'🇺🇸',color:'#ff453a',level:'CRITICAL',case:'67F — Rapid AF',detail:'BP 82/50 · DC cardioversion prepared',status:'LIVE'},
  {id:8,city:'Sydney',flag:'🇦🇺',color:'#0a84ff',level:'ACTIVE',case:'39M — Anaphylaxis',detail:'Adrenaline IM given · Monitoring',status:'ACTIVE'},
]

interface Props { onCase: (id: string) => void }

export default function ClinicalPulseFeed({ onCase }: Props) {
  const [active, setActive] = useState<number|null>(null)
  const [tick, setTick] = useState(0)
  const [sbarCase, setSbarCase] = useState<typeof FEED[0]|null>(null)
  const [sbarText, setSbarText] = useState('')

  useEffect(()=>{
    const t = setInterval(()=>setTick(p=>p+1), 3000)
    return()=>clearInterval(t)
  },[])

  const current = FEED[tick % FEED.length]

  const generateSBAR = (c: typeof FEED[0]) => {
    const s = SBAR — ${c.case}\n\nS (Situation):\nPatient presenting with ${c.case.split('—')[1]?.trim()}. ${c.detail}\n\nB (Background):\nSee clinical notes. Relevant history pending.\n\nA (Assessment):\nLevel: ${c.level}. Immediate intervention required.\n\nR (Recommendation):\n${c.detail}\n\n— Generated via Cliniverse AI
    setSbarText(s)
    setSbarCase(c)
  }

  return (
    <div style={{marginBottom:14}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 8px #ff453a',animation:'pulse 1s infinite'}}/>
          <span style={{fontSize:10,color:'#ff453a',fontWeight:800,letterSpacing:2}}>GLOBAL CLINICAL FEED</span>
        </div>
        <span style={{fontSize:10,color:'rgba(255,255,255,0.3)'}}>{FEED.filter(f=>f.status==='LIVE').length} live now</span>
      </div>

      {/* Scrolling ticker */}
      <div style={{background:'rgba(255,255,255,0.03)',borderRadius:16,padding:12,marginBottom:10,border:'1px solid rgba(255,255,255,0.06)',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,animation:'slideIn 0.4s ease'}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:current.color,boxShadow:'0 0 8px '+current.color,flexShrink:0}}/>
          <span style={{fontSize:12,color:current.color,fontWeight:700,flexShrink:0}}>{current.flag} {current.city}</span>
          <span style={{fontSize:12,color:'white',fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{current.case}</span>
          <span style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:current.color+'18',color:current.color,fontWeight:700,flexShrink:0,border:'1px solid '+current.color+'30'}}>{current.status}</span>
        </div>
      </div>

      {/* Feed list */}
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {FEED.slice(0,4).map((f,i)=>(
          <div key={f.id}
            onClick={()=>setActive(active===f.id?null:f.id)}


style={{background:active===f.id?f.color+'10':'rgba(255,255,255,0.03)',borderRadius:14,padding:'10px 12px',border:'1px solid '+(active===f.id?f.color+'30':'rgba(255,255,255,0.05)'),cursor:'pointer',transition:'all 0.2s'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:f.color,flexShrink:0,boxShadow:f.status==='LIVE'?'0 0 6px '+f.color:'none'}}/>
              <span style={{fontSize:11,color:f.color,fontWeight:700,flexShrink:0}}>{f.flag} {f.city}</span>
              <span style={{fontSize:12,color:'white',fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.case}</span>
              <span style={{fontSize:9,padding:'2px 7px',borderRadius:8,background:f.color+'15',color:f.color,fontWeight:700,flexShrink:0}}>{f.level}</span>
            </div>
            {active===f.id&&(
              <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginBottom:8}}>{f.detail}</div>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={e=>{e.stopPropagation();generateSBAR(f)}}
                    style={{flex:1,padding:'7px',borderRadius:10,border:'1px solid rgba(10,132,255,0.3)',background:'rgba(10,132,255,0.1)',color:'#0a84ff',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                    📋 Generate SBAR
                  </button>
                  <button onClick={e=>{e.stopPropagation();onCase('stemi')}}
                    style={{flex:1,padding:'7px',borderRadius:10,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'#8b5cf6',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                    🏥 Train This Case
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SBAR Modal */}
      {sbarCase&&(
        <div style={{position:'fixed',inset:0,zIndex:400,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end'}} onClick={()=>setSbarCase(null)}>
          <div style={{width:'100%',maxWidth:480,margin:'0 auto',background:'linear-gradient(145deg,#12002a,#0a0015)',borderRadius:'24px 24px 0 0',padding:'20px 20px 40px',border:'1px solid rgba(10,132,255,0.3)'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:'rgba(255,255,255,0.2)',borderRadius:2,margin:'0 auto 16px'}}/>
            <div style={{fontSize:14,fontWeight:800,color:'white',marginBottom:12}}>📋 SBAR — {sbarCase.case}</div>
            <textarea readOnly value={sbarText}
              style={{width:'100%',height:200,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:12,color:'rgba(255,255,255,0.8)',fontSize:12,lineHeight:1.7,resize:'none',outline:'none',fontFamily:'monospace',boxSizing:'border-box'}}/>
            <button onClick={()=>{navigator.clipboard.writeText(sbarText);setSbarCase(null)}}
              style={{width:'100%',marginTop:12,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#0a84ff,#8b5cf6)',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              Copy SBAR
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
