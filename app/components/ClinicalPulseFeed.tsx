'use client'
import { useState, useEffect } from 'react'

const FEED = [
  {id:1,city:'Riyadh',flag:'🇸🇦',color:'#ff453a',level:'CRITICAL',title:'52M — Anterior STEMI',detail:'Door-to-balloon: 67 min · Cath Lab activated',status:'LIVE'},
  {id:2,city:'London',flag:'🇬🇧',color:'#ff9f0a',level:'URGENT',title:'34F — Status Epilepticus',detail:'IV Lorazepam given · Neuro team called',status:'LIVE'},
  {id:3,city:'Dubai',flag:'🇦🇪',color:'#30d158',level:'RESOLVED',title:'61M — Massive PE',detail:'Systemic thrombolysis successful · ICU',status:'SOLVED'},
  {id:4,city:'Toronto',flag:'🇨🇦',color:'#ff453a',level:'CRITICAL',title:'28F — Septic Shock',detail:'Noradrenaline started · Cultures sent',status:'LIVE'},
  {id:5,city:'Cairo',flag:'🇪🇬',color:'#ff9f0a',level:'URGENT',title:'71M — Acute Stroke',detail:'NIHSS 14 · CT clear · tPA candidate',status:'LIVE'},
  {id:6,city:'Paris',flag:'🇫🇷',color:'#30d158',level:'RESOLVED',title:'45M — DKA severe',detail:'pH 7.18 to 7.36 · Insulin protocol done',status:'SOLVED'},
]

interface Props { onCase: (id: string) => void }

export default function ClinicalPulseFeed({ onCase }: Props) {
  const [active, setActive] = useState<number|null>(null)
  const [tick, setTick] = useState(0)
  const [sbar, setSbar] = useState<string|null>(null)

  useEffect(()=>{
    const t = setInterval(()=>setTick(p=>p+1), 3000)
    return()=>clearInterval(t)
  },[])

  const current = FEED[tick % FEED.length]

  const makeSBAR = (f: typeof FEED[0]) => {
    const text = [
      'SBAR — ' + f.title,
      '',
      'S (Situation):',
      'Patient: ' + f.title + '. ' + f.detail,
      '',
      'B (Background):',
      'See clinical notes.',
      '',
      'A (Assessment):',
      'Level: ' + f.level + '. Immediate action required.',
      '',
      'R (Recommendation):',
      f.detail,
      '',
      '— Generated via Cliniverse AI'
    ].join('\n')
    setSbar(text)
  }

  return (
    <div style={{marginBottom:14}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:'#ff453a',boxShadow:'0 0 8px #ff453a',animation:'pulse 1s infinite'}}/>
          <span style={{fontSize:10,color:'#ff453a',fontWeight:800,letterSpacing:2}}>GLOBAL CLINICAL FEED</span>
        </div>
        <span style={{fontSize:10,color:'rgba(10,22,40,0.45)'}}>{FEED.filter(f=>f.status==='LIVE').length} live now</span>
      </div>

      <div style={{background:'var(--bg-card,rgba(255,255,255,0.04))',borderRadius:16,padding:12,marginBottom:10,border:'1px solid rgba(36,63,82,0.65)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:current.color,boxShadow:'0 0 8px '+current.color,flexShrink:0}}/>
          <span style={{fontSize:12,color:current.color,fontWeight:700,flexShrink:0}}>{current.flag} {current.city}</span>
          <span style={{fontSize:12,color:'var(--text-primary, white)',fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{current.title}</span>
          <span style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:current.color+'18',color:current.color,fontWeight:700,flexShrink:0,border:'1px solid '+current.color+'30'}}>{current.status}</span>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {FEED.slice(0,4).map((f)=>(
          <div key={f.id} onClick={()=>setActive(active===f.id?null:f.id)}
            style={{background:active===f.id?f.color+'10':'rgba(255,255,255,0.04)',borderRadius:14,padding:'10px 12px',border:'1px solid '+(active===f.id?f.color+'30':'rgba(255,255,255,0.05)'),cursor:'pointer',transition:'all 0.2s'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:f.color,flexShrink:0,boxShadow:f.status==='LIVE'?'0 0 6px '+f.color:'none'}}/>
              <span style={{fontSize:11,color:f.color,fontWeight:700,flexShrink:0}}>{f.flag} {f.city}</span>
              <span style={{fontSize:12,color:'var(--text-primary, white)',fontWeight:600,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.title}</span>
              <span style={{fontSize:9,padding:'2px 7px',borderRadius:8,background:f.color+'15',color:f.color,fontWeight:700,flexShrink:0}}>{f.level}</span>
            </div>
            {active===f.id&&(
              <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid rgba(36,63,82,0.65)'}}>
                <div style={{fontSize:11,color:'rgba(10,22,40,0.70)',marginBottom:8}}>{f.detail}</div>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={e=>{e.stopPropagation();makeSBAR(f)}}
                    style={{flex:1,padding:'7px',borderRadius:10,border:'1px solid rgba(0,196,180,0.30)',background:'rgba(0,196,180,0.10)',color:'#00C4B4',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                    📋 SBAR
                  </button>
                  <button onClick={e=>{e.stopPropagation();onCase('stemi')}}
                    style={{flex:1,padding:'7px',borderRadius:10,border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.1)',color:'#00C4B4',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
                    🏥 Train
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sbar&&(
        <div style={{position:'fixed',inset:0,zIndex:400,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end'}} onClick={()=>setSbar(null)}>
          <div style={{width:'100%',maxWidth:480,margin:'0 auto',background:'linear-gradient(145deg,#12002a,#0a0015)',borderRadius:'24px 24px 0 0',padding:'20px 20px 40px',border:'1px solid rgba(0,196,180,0.30)'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:'rgba(0,196,180,0.25)',borderRadius:2,margin:'0 auto 16px'}}/>
            <div style={{fontSize:14,fontWeight:800,color:'var(--text-primary, white)',marginBottom:12}}>📋 SBAR Report</div>
            <textarea readOnly value={sbar}
              style={{width:'100%',height:200,background:'var(--bg-card,rgba(255,255,255,0.05))',border:'1px solid rgba(0,196,180,0.20)',borderRadius:14,padding:12,color:'rgba(10,22,40,0.85)',fontSize:12,lineHeight:1.7,resize:'none',outline:'none',fontFamily:'monospace',boxSizing:'border-box'}}/>
            <button onClick={()=>{navigator.clipboard.writeText(sbar);setSbar(null)}}
              style={{width:'100%',marginTop:12,padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#0a84ff,#8b5cf6)',color:'var(--text-primary, white)',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              Copy SBAR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
