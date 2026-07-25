'use client'

interface Props {
  onStart: (caseId: string) => void
}

const TRIAGE_CASES = [
  {id:'stemi',color:'#ff453a',level:'RED',title:'67M — Anterior STEMI',vitals:'BP 88/60 · HR 118 · ST↑ V1-V4',action:'Cath Lab Now'},
  {id:'sepsis',color:'#ff9f0a',level:'ORANGE',title:'54F — Septic Shock',vitals:'Temp 39.8 · WBC 18 · Lactate 4.2',action:'Sepsis Bundle'},
  {id:'stroke',color:'#ffd60a',level:'YELLOW',title:'71M — Acute Stroke',vitals:'NIHSS 14 · BP 188/110 · Last seen well 2h',action:'CT + tPA?'},
]

export default function TriageCard({ onStart }: Props) {
  const today = TRIAGE_CASES[Math.floor(Date.now() / 86400000) % TRIAGE_CASES.length]

  return (
    <div style={{background:'linear-gradient(135deg,rgba(255,69,58,0.08),rgba(0,0,0,0.3))',borderRadius:20,padding:16,marginBottom:14,border:'1px solid rgba(255,69,58,0.2)'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:today.color,boxShadow:'0 0 8px '+today.color,animation:'pulse 1s infinite'}}/>
        <span style={{fontSize:10,color:today.color,fontWeight:800,letterSpacing:2}}>TRIAGE · {today.level}</span>
        <span style={{marginLeft:'auto',fontSize:10,color:'rgba(255,255,255,0.3)'}}>Daily Case</span>
      </div>
      <div style={{fontSize:16,fontWeight:800,color:'white',marginBottom:6}}>{today.title}</div>
      <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:14,fontFamily:'monospace'}}>{today.vitals}</div>
      <button onClick={()=>onStart(today.id)}
        style={{width:'100%',padding:'12px',borderRadius:14,border:'none',background:'linear-gradient(135deg,'+today.color+','+today.color+'aa)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
        {today.action} →
      </button>
    </div>
  )
}
