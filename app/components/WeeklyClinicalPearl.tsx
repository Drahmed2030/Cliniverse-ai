'use client'
import { useState, useEffect } from 'react'

const F = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'

const T = {
  glass:  'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.10)',
  t1: '#F2F8FC',
  t2: 'rgba(242,248,252,0.75)',
  t3: 'rgba(242,248,252,0.50)',
  t4: 'rgba(242,248,252,0.30)',
  teal:   '#00C8B8',
  blue:   '#1A8CFF',
  green:  '#30D158',
  orange: '#FF9F0A',
  red:    '#FF453A',
  purple: '#BF5AF2',
  gold:   '#FFD60A',
}

const CSS = `
  @keyframes pearlGlow {
    0%,100%{box-shadow:0 0 16px rgba(255,214,10,0.30),0 0 32px rgba(255,214,10,0.12);}
    50%    {box-shadow:0 0 28px rgba(255,214,10,0.50),0 0 56px rgba(255,214,10,0.20);}
  }
  @keyframes logoFloat {
    0%,100%{opacity:0.06;transform:translate(-50%,-50%) scale(1);}
    50%    {opacity:0.10;transform:translate(-50%,-50%) scale(1.04);}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(14px);}
    to  {opacity:1;transform:translateY(0);}
  }
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
`

// Static pearls — replaced weekly by AI
const PEARLS = [
  {
    id: 1,
    specialty: 'Cardiology',
    color: T.red,
    icon: '🫀',
    week: 'Week 1',
    title: 'STEMI Equivalents You Must Not Miss',
    pearl: 'De Winter T-waves (upsloping ST depression + tall T-waves in V1-V6) represent proximal LAD occlusion and are a STEMI equivalent requiring immediate cath lab activation — even without classic ST elevation.',
    source: 'ESC Guidelines 2023',
    memorytip: 'Think: "De Winter = LAD in disguise"',
    tags: ['STEMI', 'ECG', 'ACS', 'High Yield'],
    saved: false,
  },
  {
    id: 2,
    specialty: 'Emergency',
    color: T.orange,
    icon: '🚨',
    week: 'Week 1',
    title: 'Sepsis-3: The 1-Hour Bundle',
    pearl: 'In septic shock, every hour of delay in antibiotic administration increases mortality by 7%. Blood cultures before antibiotics — but never delay antibiotics >45 minutes waiting for cultures.',
    source: 'Surviving Sepsis Campaign 2024',
    memorytip: '"Cultures before antibiotics, never antibiotics before the patient"',
    tags: ['Sepsis', 'Critical Care', 'Antibiotics'],
    saved: false,
  },
  {
    id: 3,
    specialty: 'Nephrology',
    color: T.blue,
    icon: '🫘',
    week: 'Week 1',
    title: 'AKI: The Creatinine Lag',
    pearl: 'Serum creatinine does not rise until ~50% of nephron mass is lost. A "normal" creatinine of 110 µmol/L in an elderly patient may represent significant renal impairment — always calculate eGFR.',
    source: 'KDIGO AKI Guidelines',
    memorytip: '"Creatinine is a late marker — eGFR tells the truth"',
    tags: ['AKI', 'Renal', 'CKD', 'Dosing'],
    saved: false,
  },
]

// ── LOGO WATERMARK ──
function PearlLogoWatermark({ color }: { color: string }) {
  return (
    <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:0,animation:'logoFloat 4s ease-in-out infinite'}}>
      <svg width="160" height="160" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="plG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5D4"/><stop offset="100%" stopColor="#0096FF"/>
          </linearGradient>
        </defs>
        <path d="M 84 38 A 30 30 0 1 0 84 82" fill="none" stroke="url(#plG)" strokeWidth="7" strokeLinecap="round"/>
        <circle cx="84" cy="38" r="4.5" fill="#00E5D4"><animate attributeName="r" values="3.5;6;3.5" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="84" cy="82" r="4.5" fill="#0096FF"><animate attributeName="r" values="3.5;6;3.5" dur="2s" begin="0.5s" repeatCount="indefinite"/></circle>
        <polyline points="26,60 34,60 38,60 42,47 46,73 50,54 54,66 58,60 78,60"
          fill="none" stroke="#00C8B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="120" strokeDashoffset="120">
          <animate attributeName="strokeDashoffset" values="120;0;120" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
          <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite"/>
        </polyline>
      </svg>
    </div>
  )
}

export default function WeeklyClinicalPearl({ onXP }: { onXP?: (n:number)=>void }) {
  const [index, setIndex]       = useState(0)
  const [saved, setSaved]       = useState<number[]>([])
  const [generating, setGen]    = useState(false)
  const [aiPearl, setAiPearl]   = useState('')
  const [showAI, setShowAI]     = useState(false)
  const [copied, setCopied]     = useState(false)

  const pearl = PEARLS[index]

  // Load saved from localStorage
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('saved_pearls') || '[]')
    setSaved(s)
  }, [])

  const toggleSave = (id: number) => {
    const next = saved.includes(id) ? saved.filter(x=>x!==id) : [...saved, id]
    setSaved(next)
    localStorage.setItem('saved_pearls', JSON.stringify(next))
    if (!saved.includes(id)) { if ('vibrate' in navigator) navigator.vibrate(6); onXP?.(5) }
  }

  const generateAIPearl = async () => {
    setGen(true); setShowAI(true); setAiPearl('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6', max_tokens:300,
          messages:[{role:'user',content:`Generate a high-yield clinical pearl for ${pearl.specialty}. Format:\nTITLE: [catchy title]\nPEARL: [2-3 sentences, evidence-based, memorable]\nMEMORY TIP: [mnemonic or phrase]\nSOURCE: [guideline/study]\n\nBe concise and clinically impactful.`}]
        })
      })
      const data = await res.json()
      setAiPearl(data.content?.[0]?.text || '')
      onXP?.(10)
    } catch { setAiPearl('Connection error. Try again.') }
    setGen(false)
  }

  const share = (platform: string) => {
    const text = `💎 Clinical Pearl: ${pearl.title}\n\n${pearl.pearl}\n\n📚 ${pearl.source}\n\n#CliniverseAI #MedEd #${pearl.specialty.replace(' ','')}`
    if (platform === 'whatsapp') window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank')
    if (platform === 'twitter')  window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text),'_blank')
    if (platform === 'linkedin') window.open('https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent('https://cliniverseai.com'),'_blank')
    if (platform === 'copy')     { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000) }
    if ('vibrate' in navigator) navigator.vibrate(6)
  }

  return (
    <div style={{fontFamily:F}}>

      {/* Header */}
      <div style={{marginBottom:18}}>
        <div style={{fontSize:10,color:`${T.gold}CC`,fontWeight:700,letterSpacing:1.5,marginBottom:4}}>WEEKLY CLINICAL PEARL</div>
        <div style={{fontSize:22,fontWeight:900,color:T.t1,letterSpacing:-0.5}}>
          Clinical <span style={{color:T.gold}}>Pearls</span>
        </div>
        <div style={{fontSize:12,color:T.t2,marginTop:4}}>High-yield · Evidence-based · Weekly updated</div>
      </div>

      {/* Pearl selector */}
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:16}}>
        {PEARLS.map((p,i)=>(
          <button key={p.id} onClick={()=>{setIndex(i);setShowAI(false);if('vibrate' in navigator)navigator.vibrate(5)}} style={{
            flexShrink:0,background:index===i?`${p.color}15`:T.glass2,
            border:`1.5px solid ${index===i?p.color+'40':T.border}`,
            borderRadius:20,padding:'6px 14px',cursor:'pointer',fontFamily:F,
            color:index===i?p.color:T.t4,fontSize:11,fontWeight:700,
            display:'flex',alignItems:'center',gap:5,
          }}>
            <span>{p.icon}</span>{p.specialty}
          </button>
        ))}
      </div>

      {/* Main Pearl Card */}
      <div style={{
        background:`linear-gradient(135deg,rgba(255,214,10,0.06),rgba(255,159,10,0.04))`,
        border:`1.5px solid ${T.gold}30`,
        borderRadius:24,padding:'20px',marginBottom:14,
        position:'relative',overflow:'hidden',
        animation:'pearlGlow 3s ease-in-out infinite',
      }}>
        {/* Logo watermark */}
        <PearlLogoWatermark color={pearl.color}/>

        {/* Corner glow */}
        <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:`radial-gradient(circle,${T.gold}12,transparent 70%)`,pointerEvents:'none'}}/>

        {/* Top row */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14,position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:44,height:44,borderRadius:14,background:`${pearl.color}15`,border:`1.5px solid ${pearl.color}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{pearl.icon}</div>
            <div>
              <div style={{fontSize:9,color:pearl.color,fontWeight:700,letterSpacing:1.5,marginBottom:2}}>{pearl.specialty.toUpperCase()} · {pearl.week.toUpperCase()}</div>
              <div style={{fontSize:8,color:T.t4,fontWeight:600}}>{pearl.source}</div>
            </div>
          </div>
          <button onClick={()=>{toggleSave(pearl.id)}} style={{background:saved.includes(pearl.id)?`${T.gold}20`:T.glass2,border:`1px solid ${saved.includes(pearl.id)?T.gold+'40':T.border}`,borderRadius:12,padding:'6px 10px',cursor:'pointer',fontFamily:F,fontSize:14,color:saved.includes(pearl.id)?T.gold:T.t4}}>
            {saved.includes(pearl.id)?'★':'☆'}
          </button>
        </div>

        {/* Title */}
        <div style={{fontSize:16,fontWeight:900,color:T.t1,marginBottom:12,lineHeight:1.3,position:'relative',zIndex:1}}>
          💎 {pearl.title}
        </div>

        {/* Pearl text */}
        <div style={{background:'rgba(255,255,255,0.04)',border:`1px solid rgba(255,255,255,0.08)`,borderRadius:14,padding:'14px',marginBottom:12,position:'relative',zIndex:1}}>
          <div style={{fontSize:13,color:T.t2,lineHeight:1.75}}>{pearl.pearl}</div>
        </div>

        {/* Memory tip */}
        <div style={{background:`${T.teal}08`,border:`1px solid ${T.teal}20`,borderRadius:12,padding:'10px 14px',marginBottom:12,position:'relative',zIndex:1}}>
          <div style={{fontSize:9,color:T.teal,fontWeight:700,letterSpacing:1,marginBottom:4}}>🧠 MEMORY TIP</div>
          <div style={{fontSize:12,color:T.t2,fontStyle:'italic'}}>{pearl.memorytip}</div>
        </div>

        {/* Tags */}
        <div style={{display:'flex',gap:6,flexWrap:'wrap',position:'relative',zIndex:1}}>
          {pearl.tags.map(tag=>(
            <span key={tag} style={{fontSize:9,color:pearl.color,background:`${pearl.color}12`,border:`1px solid ${pearl.color}22`,borderRadius:20,padding:'3px 9px',fontWeight:700}}>#{tag}</span>
          ))}
        </div>
      </div>

      {/* AI Generate */}
      <button onClick={generateAIPearl} disabled={generating} style={{
        width:'100%',padding:'14px',borderRadius:18,border:'none',
        background:generating?'rgba(191,90,242,0.15)':`linear-gradient(135deg,${T.purple},#7B00CC)`,
        color:'#fff',fontSize:14,fontWeight:800,cursor:generating?'not-allowed':'pointer',fontFamily:F,
        display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:12,
        boxShadow:generating?'none':`0 6px 24px ${T.purple}35`,
      }}>
        {generating
          ?<><div style={{width:16,height:16,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',animation:'spin 0.8s linear infinite'}}/>Generating AI Pearl...</>
          :'🤖 Generate AI Pearl for ' + pearl.specialty}
      </button>

      {/* AI Pearl result */}
      {showAI && aiPearl && (
        <div style={{background:`${T.purple}08`,border:`1.5px solid ${T.purple}25`,borderRadius:20,padding:'16px',marginBottom:12,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:`radial-gradient(circle,${T.purple}12,transparent 70%)`,pointerEvents:'none'}}/>
          <div style={{fontSize:10,color:T.purple,fontWeight:700,letterSpacing:1.5,marginBottom:10}}>🤖 AI PEARL — {pearl.specialty}</div>
          <div style={{fontSize:12,color:T.t2,lineHeight:1.8,whiteSpace:'pre-line'}}>{aiPearl}</div>
        </div>
      )}

      {/* Share */}
      <div style={{fontSize:10,color:T.t4,fontWeight:700,letterSpacing:1.5,marginBottom:8}}>SHARE PEARL</div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[
          {icon:'💬',label:'WhatsApp', color:'#25D366',p:'whatsapp'},
          {icon:'💼',label:'LinkedIn', color:'#0A66C2',p:'linkedin'},
          {icon:'𝕏', label:'X',        color:'#1DA1F2',p:'twitter'},
          {icon:copied?'✓':'📋',label:copied?'Copied':'Copy',color:T.teal,p:'copy'},
        ].map(s=>(
          <button key={s.p} onClick={()=>share(s.p)} style={{flex:1,padding:'10px 4px',borderRadius:14,border:`1px solid ${s.color}28`,background:`${s.color}10`,color:s.color,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:F,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
            <span style={{fontSize:16}}>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Saved count */}
      {saved.length > 0 && (
        <div style={{background:`${T.gold}08`,border:`1px solid ${T.gold}18`,borderRadius:12,padding:'10px 14px',textAlign:'center'}}>
          <div style={{fontSize:11,color:T.gold,fontWeight:700}}>★ {saved.length} pearl{saved.length>1?'s':''} saved to your collection</div>
        </div>
      )}

      <style>{CSS}</style>
    </div>
  )
}
