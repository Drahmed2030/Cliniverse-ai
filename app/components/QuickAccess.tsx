'use client'

interface Props {
  onNavigate: (tab: string, tool?: string) => void
}

export default function QuickAccess({ onNavigate }: Props) {
  const items = [
    {icon:'📋',label:'SBAR',color:'#00C4B4',tab:'workshop'},
    {icon:'⚡',label:'Rapid',color:'#ff453a',tab:'tools',tool:'rapid'},
    {icon:'📈',label:'ECG',color:'#30d158',tab:'tools',tool:'ecg'},
    {icon:'🧮',label:'Calc',color:'#ff9f0a',tab:'tools',tool:'calc'},
  ]

  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:1.5,marginBottom:8,textTransform:'uppercase'}}>Quick Access</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {items.map((q,i)=>(
          <div key={i} onClick={()=>onNavigate(q.tab,q.tool)}
            style={{background:q.color+'12',border:'1px solid '+q.color+'25',borderRadius:14,padding:'11px 6px',textAlign:'center',cursor:'pointer',transition:'transform 0.15s ease'}}
            onTouchStart={e=>(e.currentTarget.style.transform='scale(0.95)')}
            onTouchEnd={e=>(e.currentTarget.style.transform='scale(1)')}>
            <div style={{fontSize:22,marginBottom:4}}>{q.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:'white'}}>{q.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
